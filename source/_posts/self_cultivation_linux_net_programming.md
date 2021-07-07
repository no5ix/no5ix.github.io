---
title: 服务器开发自我修养专栏-Linux网络编程
date: 2020-12-28 15:08:06
tags:
- Self-cultivation
categories:
- Self-cultivation
---


# Linux网络编程

|   I/O模式   | 水平触发 | 边缘触发 |
| :---------: | :------: | :------: |
|    epoll    |    ✓     |    ✓     |
| select/poll |    ✓     |          |
|  信号驱动   |          |    ✓     |


## select

一个常见的select例子如下: 
```c
#include "unp.h"

void
str_cli(FILE *fp, int sockfd)
{
    int maxfdp1, stdineof;
    fd_set rset;
    char buf[MAXLINE];
    int n;

    stdineof = 0;
    FD_ZERO(&rset);
    for ( ; ; ) {
        if (stdineof == 0)
            FD_SET(fileno(fp), &rset);
        FD_SET(sockfd, &rset);
        maxfdp1 = max(fileno(fp), sockfd) + 1;
        Select(maxfdp1, &rset, NULL, NULL, NULL);

        if (FD_ISSET(sockfd, &rset)) { /* socket is readable */
            if ( (n = Read(sockfd, buf, MAXLINE)) == 0) {
                if (stdineof == 1)
                    return; /* normal termination */
                else
                    err_quit("str_cli: server terminated prematurely");
            }

            Write(fileno(stdout), buf, n);
        }

        if (FD_ISSET(fileno(fp), &rset)) {  /* input is readable */
            if ( (n = Read(fileno(fp), buf, MAXLINE)) == 0) {
                stdineof = 1;
                Shutdown(sockfd, SHUT_WR); /* send FIN */
                FD_CLR(fileno(fp), &rset);
                continue;
            }

            Writen(sockfd, buf, n);
        }
    }
}

```

参考[select poll epoll的区别](https://zhuanlan.zhihu.com/p/39970630)

可以看出**select的缺点**如下: 

* (遍)select返回的是含有整个句柄的数组，应用程序需要遍历整个数组才能发现哪些句柄发生了事件；
* fd_set 使用数组实现，数组大小使用 FD_SETSIZE 定义，所以只能监听少于 FD_SETSIZE 数量的描述符。FD_SETSIZE 大小默认为 1024，因此默认只能监听少于 1024 个描述符。如果要监听更多描述符的话，需要修改 FD_SETSIZE 之后重新编译
* (内)内核/用户空间内存拷贝问题，每次调用select都需要将全部描述符从应用进程缓冲区复制到内核缓冲区
* (数)单个进程能够监视的文件描述符的数量存在最大限制，通常是1024，当然可以更改数量，但由于select采用轮询的方式扫描文件描述符，文件描述符数量越多，性能越差；
* select的触发方式是水平触发，应用程序如果没有完成对一个已经就绪的文件描述符进行IO，那么之后再次select调用还是会将这些文件描述符通知进程。
* 相比于select模型，poll使用链表保存文件描述符，因此没有了监视文件数量的限制，但其他三个缺点依然存在。

## epoll

一个常见的epoll使用例子:
```c 
while (numOpenFds > 0) {
    /* Fetch up to MAX_EVENTS items from the ready list of the
        epoll instance */

    printf("About to epoll_wait()\n");
    ready = epoll_wait(epfd, evlist, MAX_EVENTS, -1);
    if (ready == -1) {
        if (errno == EINTR)
            continue;               /* Restart if interrupted by signal */
        else
            errExit("epoll_wait");
    }

    printf("Ready: %d\n", ready);

    /* Deal with returned list of events */

    for (j = 0; j < ready; j++) {
        printf("  fd=%d; events: %s%s%s\n", evlist[j].data.fd,
                (evlist[j].events & EPOLLIN)  ? "EPOLLIN "  : "",
                (evlist[j].events & EPOLLHUP) ? "EPOLLHUP " : "",
                (evlist[j].events & EPOLLERR) ? "EPOLLERR " : "");

        if (evlist[j].events & EPOLLIN) {
            s = read(evlist[j].data.fd, buf, MAX_BUF);
            if (s == -1)
                errExit("read");
            printf("    read %d bytes: %.*s\n", s, s, buf);

        } else if (evlist[j].events & (EPOLLHUP | EPOLLERR)) {

            /* After the epoll_wait(), EPOLLIN and EPOLLHUP may both have
                been set. But we'll only get here, and thus close the file
                descriptor, if EPOLLIN was not set. This ensures that all
                outstanding input (possibly more than MAX_BUF bytes) is
                consumed (by further loop iterations) before the file
                descriptor is closed. */

            printf("    closing fd %d\n", evlist[j].data.fd);
            // 关闭一个文件描述符会自动的将其从所有的 epoll 实例的兴趣列表中移除
            if (close(evlist[j].data.fd) == -1)
                errExit("close");
            numOpenFds--;
        }
    }
}
```

**epoll的设计和实现select完全不同**。epoll把原先的select/poll调用分成了3个部分：  
1. 调用`epoll_create()`建立一个epoll对象（在epoll文件系统中为这个句柄对象分配资源）
2. 调用`epoll_ctl`向epoll对象中添加这100万个连接的套接字
3. 调用`epoll_wait`收集发生的事件的连接

总结:  
* `epoll_ctl` 用于向内核注册新的描述符或者是改变某个文件描述符的状态。已注册的描述符在内核中会被维护在一棵红黑树上，通过回调函数内核会将 I/O 准备好的描述符加入到一个链表中管理，进程调用 `epoll_wait` 便可以得到事件完成的描述符。
* 从上面的描述可以看出，epoll 只需要将描述符从进程缓冲区向内核缓冲区拷贝一次，并且进程不需要通过轮询来获得事件完成的描述符。
* epoll 仅适用于 Linux OS。
* epoll 比 select 和 poll 更加灵活而且没有描述符数量限制。

### 水平触发与边缘触发的区别

**默认情况下 epoll 提供的是水平触发通知**.要使用边缘触发通知，我们在调用`epoll_ctl()`时在ev．events字段中指定EPOLLET标志.

例如 : 

``` c
struct epoll_event ev;
ev.data.fd = fd;
ev.events = EPOLLIN | EPOLLET;
if (epoll_ctl(epfd, EPOLL_CTL_ADD, fd, ev) == -1)
    errExit("epoll_ctl");
```

我们通过一个例子来说明epoll的水平触发和边缘触发通知之间的区别。
假设我们使用epoll来监视一个套接字上的输入（EPOLLIN），接下来会发生如下的事件。

1. 套接字上有输入到来。
2. 我们调用一次`epoll_wait()`。无论我们采用的是水平触发还是边缘触发通知，该调用
都会告诉我们套接字已经处于就绪态了。
3. 再次调用`epoll_wait()`。
    * 如果我们采用的是水平触发通知，那么第二个`epoll_wait()`调用将告诉我们套接字处于就绪态。
    * 而如果我们采用边缘触发通知，那么第二个`epoll_wait()`调用将阻塞，因为自从上一次调用`epoll_wait()`以来并没有新的输入到来。边缘触发通知通常和非阻塞的文件描述符结合使用。因而，采用epoll的边缘触发通知机制的程序基本框架如下:  
        1\. 让所有待监视的文件描述符都成为非阻塞的。
        2\. 通过epoll_ctl()构建epoll的兴趣列表。
        3\. 通过`epoll_wait()`取得处于就绪态的描述符列表。
        4\. 针对每一个处于就绪态的文件描述符，不断进行I/O处理直到相关的系统调用( 例如read()、write()，recv()、send()或accept() )返回EAGAIN或EWOULDBLOCK错误。

### 水平触发需要处理的问题

使用linux epoll模型，水平触发模式（Level-Triggered）；当socket可写时，会不停的触发socket可写的事件，如何处理？

- 第一种最普通的方式：  
    当需要向socket写数据时，将该socket加入到epoll模型（epoll_ctl）；等待可写事件。
    接收到socket可写事件后，调用write()或send()发送数据。。。
    当数据全部写完后， 将socket描述符移出epoll模型。
   
    这种方式的缺点是：  即使发送很少的数据，也要将socket加入、移出epoll模型。有一定的操作代价。
- 第二种方式，（是本人的改进方案， 叫做directly-write）
    向socket写数据时，不将socket加入到epoll模型；而是直接调用send()发送；
    只有当或send()返回错误码EAGAIN（系统缓存满），才将socket加入到epoll模型，等待可写事件后(表明系统缓冲区有空间可以写了)，再发送数据。
    全部数据发送完毕，再移出epoll模型。

    这种方案的优点：   当用户数据比较少时，不需要epool的事件处理。
    在高压力的情况下，性能怎么样呢？   
    对一次性直接写成功、失败的次数进行统计。如果成功次数远大于失败的次数， 说明性能良好。（如果失败次数远大于成功的次数，则关闭这种直接写的操作，改用第一种方案。同时在日志里记录警告）
    在我自己的应用系统中，实验结果数据证明该方案的性能良好。

    事实上，网络数据可分为两种到达/发送情况：
    一是分散的数据包， 例如每间隔40ms左右，发送/接收3-5个 MTU（或更小，这样就没超过默认的8K系统缓存）。
    二是连续的数据包， 例如每间隔1s左右，连续发送/接收 20个 MTU（或更多）。
- 第三种方式：  使用Edge-Triggered（边沿触发），这样socket有可写事件，只会触发一次。
    可以在应用层做好标记。以避免频繁的调用 `epoll_ctl( EPOLL_CTL_ADD, EPOLL_CTL_MOD)`。  这种方式是epoll 的 man 手册里推荐的方式， 性能最高。但如果处理不当容易出错，事件驱动停止。

### epoll实现细节

epoll的高效就在于，当我们调用`epoll_ctl`往里塞入百万个句柄时，`epoll_wait`仍然可以飞快的返回，并有效的将发生事件的句柄给我们用户。这是由于我们在调用`epoll_create`时，内核除了帮我们在epoll文件系统里建了个file结点，在内核cache里建了个红黑树用于存储以后`epoll_ctl`传来的socket外，还会再建立一个list链表，用于存储准备就绪的事件，当`epoll_wait`调用时，仅仅观察这个list链表里有没有数据即可。有数据就返回，没有数据就sleep，等到timeout时间到后即使链表没数据也返回。所以，`epoll_wait`非常高效。

而且，通常情况下即使我们要监控百万计的句柄，大多一次也只返回很少量的准备就绪句柄而已，所以，`epoll_wait`仅需要从内核态copy少量的句柄到用户态而已，如何能不高效？！

那么，这个准备就绪list链表是怎么维护的呢？当我们执行`epoll_ctl`时，除了把socket放到epoll文件系统里file对象对应的红黑树上之外，还会给内核中断处理程序注册一个回调函数，告诉内核，如果这个句柄的中断到了，就把它放到准备就绪list链表里。所以，当一个socket上有数据到了，内核在把网卡上的数据copy到内核中后就来把socket插入到准备就绪链表里了。

如此，一颗红黑树，一张准备就绪句柄链表，少量的内核cache，就帮我们解决了大并发下的socket处理问题。执行`epoll_create`时，创建了红黑树和就绪链表，执行`epoll_ctl`时，如果增加socket句柄，则检查在红黑树中是否存在，存在立即返回，不存在则添加到树干上，然后向内核注册回调函数，用于当中断事件来临时向准备就绪链表中插入数据。执行`epoll_wait`时立刻返回准备就绪链表里的数据即可。

最后看看epoll独有的两种模式LT和ET。无论是LT和ET模式，都适用于以上所说的流程。区别是，LT模式下，只要一个句柄上的事件一次没有处理完，会在以后调用`epoll_wait`时次次返回这个句柄，而ET模式仅在第一次返回。

这件事怎么做到的呢？当一个socket句柄上有事件时，内核会把该句柄插入上面所说的准备就绪list链表，这时我们调用`epoll_wait`，会把准备就绪的socket拷贝到用户态内存，然后清空准备就绪list链表，最后，`epoll_wait`干了件事，就是检查这些socket，如果不是ET模式（就是LT模式的句柄了），并且这些socket上确实有未处理的事件时，又把该句柄放回到刚刚清空的准备就绪链表了。所以，非ET的句柄，只要它上面还有事件，`epoll_wait`每次都会返回。而ET模式的句柄，除非有新中断到，即使socket上的事件没有处理完，也是不会次次从`epoll_wait`返回的。

## select 和 epoll的区别

select函数，必须得清楚select跟linux特有的epoll的区别， 有三点(遍内数)：

* **遍**历 ： 每次调用select都需要在内核遍历传递进来的所有fd，这个开销在fd很多时也很大；当我们执行`epoll_ctl`时，除了把socket放到epoll文件系统里file对象对应的红黑树上之外，还会给内核中断处理程序注册一个回调函数，告诉内核，如果这个句柄的中断到了，就把它放到准备就绪list链表里。所以，当一个socket上有数据到了，内核在把网卡上的数据copy到内核中后就来把socket插入到准备就绪链表里了。`epoll_wait`的工作实际上就是在这个就绪链表中查看有没有就绪的fd, 每次只需要简单的从列表里取出就行了
* **内**存拷贝 ： select，poll每次调用都要把fd集合从用户态往内核态拷贝一次; epoll的解决方案在`epoll_ctl`函数中。每次注册新的事件到epoll句柄中时（在`epoll_ctl`中指定EPOLL_CTL_ADD），会把所有的fd拷贝进内核，而不是在`epoll_wait`的时候重复拷贝。epoll保证了每个fd在整个过程中只会拷贝一次
* **数**量限制 ： select默认只支持1024个；epoll并没有最大数目限制


## 非阻塞的connect和accept

* 非阻塞connect为啥要用?怎么用?
    * 为啥要用: 因为connect是比较耗时的, 所以我们希望可以在connecting的时候并行的做点其他的事
    * 怎么用: 调用非阻塞connect之后会立马返回EINPROCESS错误, 然后我们去epoll注册一个可写事件, 等待此套接字可写我们判断一下如果不是socket发生异常错误则即为connect连上了
* 非阻塞accept有啥用, 怎么用?为啥要用?
    * 为啥要用: 如果调用阻塞accept，这样如果在select检测到有连接请求，但在调用accept之前，这个请求断开了，然后调用accept的时候就会阻塞在哪里，除非这时有另外一个连接请求，如果没有，则一直被阻塞在accept调用上, 无法处理任何其他已就绪的描述符。
    * 怎么用: 我们去epoll注册一个监听套接字的fd可读事件, 等待此套接字的fd可写我们判断一下如果不是socket发生异常错误则即为准备好了一个新连接
* 注意 : 当socket异常错误的时候socket是可读并可写的, 所以在非阻塞connect(判断是否可写)/accept(判断是否可读)的时候要特别注意这种情况, 要用getsockopt函数, 使用SO_ERROR选项来检查处理.


## 阻塞和非阻塞的send和recv和sendto和recvfrom

**注意:** 首先需要说明的是，不管阻塞还是非阻塞，在发送时都会将数据从应用进程缓冲区拷贝到内核套接字发送缓冲区（**UDP并没有实际存在这个内核套接字发送缓冲区**, UDP的套接字缓冲区大小仅仅是可写到该套接字UDP数据包的大小上限, TCP/UDP都可以用SO_SNDBUF选项来更改该内核缓冲区大小）。

* **发送**, 我们发送选用send（这里特指TCP）以及sendto（这里特指UDP）来描述
    * 阻塞
        * 在阻塞模式下**send**操作将会等待所有数据均被拷贝到发送缓冲区后才会返回。阻塞的send操作返回的发送大小，必然是你参数中的发送长度的大小。
        * 在阻塞模式下的**sendto**操作不会阻塞。
            关于这一点的原因在于：UDP并没有真正的发送缓冲区，它所做的只是将应用缓冲区拷贝给下层协议栈，在此过程中加上UDP头，IP头，所以实际不存在阻塞。
    * 非阻塞
        * 在非阻塞模式下**send**操作调用会立即返回。  
        关于立即返回大家都不会有异议。还是拿阻塞send的那个例子来看，当缓冲区只有192字节，但是却需要发送2000字节时，此时调用立即返回，并得到返回值为192。从中可以看到，非阻塞send仅仅是尽自己的能力向缓冲区拷贝尽可能多的数据，因此在非阻塞下send才有可能返回比你参数中的发送长度小的值。  
        如果缓冲区没有任何空间时呢？这时肯定也是立即返回，但是你会得到`WSAEWOULDBLOCK`/`EWOULDBLOCK` 的错误，此时表示你无法拷贝任何数据到缓冲区，你最好休息一下再尝试发送。  
        * 在非阻塞模式下**sendto**操作 不会阻塞（与阻塞一致，不作说明）。 
* **接收**, 接收选用recv（这里特指TCP）以及recvfrom（这里特指UDP）来描述
    * 阻塞
        * 在阻塞模式下recv，recvfrom操作将会阻塞 到缓冲区里有至少一个字节（TCP）或者一个完整UDP数据报才返回。
        * 在没有数据到来时，对它们的调用都将处于睡眠状态，不会返回。
    * 非阻塞
        * 在非阻塞模式下recv，recvfrom操作将会立即返回。
        * 如果缓冲区有任何一个字节数据（TCP）或者一个完整UDP数据报，它们将会返回接收到的数据大小。而如果没有任何数据则返回错误 `WSAEWOULDBLOCK`/`EWOULDBLOCK`。


## reuseaddr和reuseport

* reuseaddr的作用?
    * 参考 https://zhuanlan.zhihu.com/p/35367402
    * **主要是用于绑定TIME_WAIT状态的地址**: 一个非常现实的问题是，假如一个systemd托管的service异常退出了，留下了TIME_WAIT状态的socket，那么systemd将会尝试重启这个service。但是因为端口被占用，会导致启动失败，造成两分钟的服务空档期，systemd也可能在这期间放弃重启服务。但是在设置了SO_REUSEADDR以后，处于TIME_WAIT状态的地址也可以被绑定，就杜绝了这个问题。因为TIME_WAIT其实本身就是半死状态，虽然这样重用TIME_WAIT可能会造成不可预料的副作用，但是在现实中问题很少发生，所以也忽略了它的副作用
    <!-- * 还可以搞定0.0.0.0的哈: 只要地址不是正好(exactly)相同，那么多个Socket就能绑定到同一ip上。比如0.0.0.0和192.168.0.100，虽然逻辑意义上前者包含了后者，但是0.0.0.0泛指所有本地ip，而192.168.0.100特指某一ip，两者并不是完全相同，所以Socket B尝试绑定的时候，不会再报EADDRINUSE，而是绑定成功 -->
* reuseport有啥用?
    * SO_REUSEPORT使用场景：linux kernel 3.9 引入了最新的SO_REUSEPORT选项，使得多进程或者多线程创建多个绑定同一个ip:port的监听socket，提高服务器的接收链接的并发能力,程序的扩展性更好；此时需要设置SO_REUSEPORT（注意所有进程都要设置才生效）。
    ``` c
    setsockopt(listenfd, SOL_SOCKET, SO_REUSEPORT,(const void *)&reuse , sizeof(int));
    ```
    目的：每一个进程有一个独立的监听socket，并且bind相同的ip:port，独立的listen()和accept()；提高接收连接的能力。（例如nginx多进程同时监听同一个ip:port）
    解决的问题：
        * 避免了应用层多线程或者进程监听同一ip:port的“惊群效应”。
        * 内核层面实现负载均衡，保证每个进程或者线程接收均衡的连接数。
        * 只有effective-user-id相同的服务器进程才能监听同一ip:port （安全性考虑）

