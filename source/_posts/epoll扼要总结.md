---
title: epoll扼要总结
date: 2015-06-22 21:56:12
tags:
- Linux
- noodle
categories:
- Linux
---



# epoll 编程接口

epoll API是Linux系统专有的，在2.6版中新增。

epoll API的核心数据结构称作epoll实例，它和一个打开的文件描述符相关联。这个文件
描述符不是用来做I/O操作的，相反，它是内核数据结构的句柄，这些内核数据结构实现了两
个目的。

- 记录了在进程中声明过的感兴趣的文件描述符列表-**interest list（兴趣列表）**。
- 维护了处于I/O就绪态的文件描述符列表-**ready list（就绪列表）**。

ready list中的成员是interest list的子集。

对于由epoll检查的每一个文件描述符，我们可以指定一个位掩码来表示我们感兴趣的事
件。这些位掩码同poll()所使用的位掩码有着紧密的关联。

**. . .**<!-- more -->

## epoll概要

需要包含epoll.h头文件, 即 : `#include <sys/epoll.h>`
epoll只有epoll_create, epoll_ctl, epoll_wait 3个系统调用 : 

- 系统调用**epoll_create()**创建一个epoll实例，返回代表该实例的文件描述符。
- 系统调用**epoll_ctl()**操作同epoll实例相关联的兴趣列表。通过epoll_ctl()，我们可以增
加新的描述符到列表中，或者将已有的文件描述符从该列表中移除，也可以修改代表文件描述
符七事件类型的位掩码。
- 系统调用**epoll_wait()**返回与epoll实例相关联的就绪列表中的成员。


## epoll_create

`int epoll_create(int size);`
Returns file descriptor on success, or -1 on error.

创建一个epoll的句柄。自从linux2.6.8之后，size参数是被忽略的。
函数返回代表新创建的 epoll 实例的文件描述符(一般用 epfd表示),
 这个文件描述符在其他几个 epoll 系统调用中用来表示 epoll 实例.
需要注意的是，当创建好epoll句柄后，它就是会占用一个fd值，在linux下如果查看/proc/进程id/fd/，是能够看到这个fd的，
所以在使用完epoll后，必须调用close()关闭，否则可能导致fd被耗尽。

## epoll_ctl

`int epoll_ctl(int epfd, int op, int fd, struct epoll_event *ev);`
Returns 0 on success, or -1 on error.

epoll的事件注册函数，它不同于select()是在监听事件时告诉内核要监听什么类型的事件，而是在这里先注册要监听的事件类型。

- 第一个参数是epoll_create()的返回值, 也就是新创建的 epoll 实例的文件描述符。
- 第二个参数表示动作，用三个宏来表示：
    - EPOLL_CTL_ADD：注册新的fd到epfd中的兴趣列表；
    - EPOLL_CTL_MOD：修改已经注册的fd的设定事件；
    - EPOLL_CTL_DEL：从epfd的兴趣列表中删除一个fd；
- 第三个参数指要修改兴趣列表中的哪一个文件描述符的设定。
- 第四个参数是告诉内核需要监听什么事，参数ev是指向结构体epoll_event的指针, 
    struct epoll_event结构如下：
    ``` c
    struct epoll_event {  
        __uint32_t events; /* Epoll events */  
        epoll_data_t data; /* User data variable */  
    }; 
    ```
    结构体epoll_event中的data字段的类型为:
    ``` c
    typedef union epoll_data {  
        void *ptr;   /* Pointer to user-defined data */
        int fd;  
        __uint32_t u32;  
        __uint64_t u64;  
    } epoll_data_t;
    ```
    - 结构体epoll_event中的events字段是一个位掩码, 他指定了我们为待检查的描述符fd上所感兴趣的事件集合.
    可以是以下几个宏的集合：

        - EPOLLIN ：表示对应的文件描述符可以读（包括对端SOCKET正常关闭）；
        - EPOLLOUT：表示对应的文件描述符可以写；
        - EPOLLPRI：表示对应的文件描述符有紧急的数据可读（这里应该表示有带外数据到来）；
        - EPOLLERR：表示对应的文件描述符发生错误；
        - EPOLLHUP：表示对应的文件描述符被挂断；
        - EPOLLET： 将EPOLL设为边缘触发(Edge Triggered)模式，这是相对于水平触发(Level Triggered)来说的。(后文会说水平触发和边缘触发的区别)
        - EPOLLONESHOT：只监听一次事件，当监听完这次事件之后，如果还需要继续监听这个socket的话，需要再次把这个socket加入到EPOLL队列里

    - data 字段是一个联合体, 当描述符 fd 稍后成为就绪态时, 联合体的成员可用来指定传回给调用进程的信息


## 使用 epoll_create() 和 epoll_ctl()的例子

使用 epoll_create() 和 epoll_ctl()

``` c++
int epdf;
struct epoll_event ev;

epfd = epoll_create( 5 );
if ( epfd == -1 )
    errExit( "epoll_create" );

ev.data.fd = fd;
ev.events = EPOLLIN;
if ( epoll_ctl( epofd, EPOLL_CTL_ADD, fd, ev ) == -1 )
    errExit( "epoll_ctl" );
```

## epoll_wait

`int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout);`
Returns number of ready file descriptors, 0 on timeout, or -1 on error.

epoll_wait收集在epoll监控的事件中已经发送的事件。

- 参数events是分配好的epoll_event结构体数组，epoll将会把发生的事件赋值到events数组中（events不可以是空指针，内核只负责把数据复制到这个events数组中，不会去帮助我们在用户态中分配内存）。
- maxevents告之内核这个events有多大，这个 maxevents的值不能大于创建epoll_create()时的size，
- 参数timeout是超时时间, 用来确定 epoll_wait() 的阻塞行为, 有如下几种 : 
    - 如果 timeout 等于 -1, 调用将一直阻塞, 直到兴趣列表中的文件描述符有事件产生, 或者直到捕获到一个信号为止
    - 如果 timeout 等于 0, 执行一次非阻塞的检查, 立即返回, 看兴趣列表中的文件描述符上产生了哪个事件
    - 如果 timeout 大于 0, 调用将阻塞至多 timeout 毫秒, 知道文件描述符上有事件产生, 或者直到捕获到一个信号为止


## TLPI书上的例子

``` c
/*************************************************************************\
*                  Copyright (C) Michael Kerrisk, 2017.                   *
*                                                                         *
* This program is free software. You may use, modify, and redistribute it *
* under the terms of the GNU General Public License as published by the   *
* Free Software Foundation, either version 3 or (at your option) any      *
* later version. This program is distributed without any warranty.  See   *
* the file COPYING.gpl-v3 for details.                                    *
\*************************************************************************/

/* Listing 63-5 */

/* epoll_input.c

   Example of the use of the Linux epoll API.

   Usage: epoll_input file...

   This program opens all of the files named in its command-line arguments
   and monitors the resulting file descriptors for input events.

   This program is Linux (2.6 and later) specific.
*/
#include <sys/epoll.h>
#include <fcntl.h>
#include "tlpi_hdr.h"

#define MAX_BUF     1000        /* Maximum bytes fetched by a single read() */
#define MAX_EVENTS     5        /* Maximum number of events to be returned from
                                   a single epoll_wait() call */

int
main(int argc, char *argv[])
{
    int epfd, ready, fd, s, j, numOpenFds;
    struct epoll_event ev;
    struct epoll_event evlist[MAX_EVENTS];
    char buf[MAX_BUF];

    if (argc < 2 || strcmp(argv[1], "--help") == 0)
        usageErr("%s file...\n", argv[0]);

    epfd = epoll_create(argc - 1);
    if (epfd == -1)
        errExit("epoll_create");

    /* Open each file on command line, and add it to the "interest
       list" for the epoll instance */

    for (j = 1; j < argc; j++) {
        fd = open(argv[j], O_RDONLY);
        if (fd == -1)
            errExit("open");
        printf("Opened \"%s\" on fd %d\n", argv[j], fd);

        ev.events = EPOLLIN;            /* Only interested in input events */
        ev.data.fd = fd;
        if (epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev) == -1)
            errExit("epoll_ctl");
    }

    numOpenFds = argc - 1;

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

    printf("All file descriptors closed; bye\n");
    exit(EXIT_SUCCESS);
}

```

# 水平触发与边缘触发

在深入讨论多种可选的机制之前，我们需要先区分两种文件描述符准备就绪的通知模式。

- **水平触发**通知(epoll默认的通知方式)：如果文件描述符上可以非阻塞地执行I/O系统调用，此时认为它已经
就绪。
- **边缘触发**通知：如果文件描述符自上次状态检查以来有了新的I/O活动（比如新的输
入），此时需要触发通知。

下图总结了I/O多路复用、信号驱动I/O以及epoll所采用的通知模型。epoll API同其
他两种I/O模型的区别在于它对水平触发（默认）和边缘触发都支持。

{% asset_img epoll1.png epoll %}

## 水平触发与边缘触发的区别

**默认情况下 epoll 提供的是水平触发通知**.要使用边缘触发通知，我们在调用epoll_ctl()时在ev．events字段中指定EPOLLET标志.

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

1．套接字上有输入到来。
2．我们调用一次epoll_wait()。无论我们采用的是水平触发还是边缘触发通知，该调用
都会告诉我们套接字已经处于就绪态了。
3．再次调用epoll_wait()。

如果我们采用的是水平触发通知，那么第二个epoll_wait()调用将告诉我们套接字处于就
绪态。而如果我们采用边缘触发通知，那么第二个epoll_wait()调用将阻塞，因为自从上一次
调用epoll_wait()以来并没有新的输入到来。

边缘触发通知通常和非阻塞的文件描述符结合使用。因而，采用epoll的边缘触发通知机制的程序基本框架如下:

1．让所有待监视的文件描述符都成为非阻塞的。
2．通过epoll_ctl()构建epoll的兴趣列表。
3．通过如下的循环处理I/O事件 : 
(a)通过epoll_wait()取得处于就绪态的描述符列表。
(b)针对每一个处于就绪态的文件描述符，不断进行I/O处理直到相关的系统调用( 例如read()、write()，recv()、send()或accept() )返回EAGAIN或EWOULDBLOCK错误。

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

    可以在应用层做好标记。以避免频繁的调用 epoll_ctl( EPOLL_CTL_ADD, EPOLL_CTL_MOD)。  这种方式是epoll 的 man 手册里推荐的方式， 性能最高。但如果处理不当容易出错，事件驱动停止。

# epoll与select/poll的区别

select函数，必须得清楚select跟linux特有的epoll的区别， 有三点(遍内树)：

- 遍历 ： 每次调用select都需要在内核遍历传递进来的所有fd，这个开销在fd很多时也很大；当我们执行epoll_ctl时，除了把socket放到epoll文件系统里file对象对应的红黑树上之外，还会给内核中断处理程序注册一个回调函数，告诉内核，如果这个句柄的中断到了，就把它放到准备就绪list链表里。所以，当一个socket上有数据到了，内核在把网卡上的数据copy到内核中后就来把socket插入到准备就绪链表里了。epoll_wait的工作实际上就是在这个就绪链表中查看有没有就绪的fd, 每次只需要简单的从列表里取出就行了
- 内存拷贝 ： select，poll每次调用都要把fd集合从用户态往内核态拷贝一次; epoll的解决方案在epoll_ctl函数中。每次注册新的事件到epoll句柄中时（在epoll_ctl中指定EPOLL_CTL_ADD），会把所有的fd拷贝进内核，而不是在epoll_wait的时候重复拷贝。epoll保证了每个fd在整个过程中只会拷贝一次
- 数量限制 ： select默认只支持1024个；epoll并没有最大数目限制

总结：

（1）select，poll实现需要自己不断轮询所有fd集合，直到设备就绪，期间可能要睡眠和唤醒多次交替。而epoll其实也需要调用epoll_wait不断轮询就绪链表，期间也可能多次睡眠和唤醒交替，但是它是设备就绪时，调用回调函数，把就绪fd放入就绪链表中，并唤醒在epoll_wait中进入睡眠的进程。虽然都要睡眠和交替，但是select和poll在“醒着”的时候要遍历整个fd集合，而epoll在“醒着”的时候只要判断一下就绪链表是否为空就行了，这节省了大量的CPU时间。这就是回调机制带来的性能提升。

（2）select，poll每次调用都要把fd集合从用户态往内核态拷贝一次，并且要把current往设备等待队列中挂一次，而epoll只要一次拷贝，而且把current往等待队列上挂也只挂一次（在epoll_wait的开始，注意这里的等待队列并不是设备等待队列，只是一个epoll内部定义的等待队列）。这也能节省不少的开销。


# 常见的epoll编程模型

见本博客的:
* 关于服务器模型总结请转 {% post_link server_model_summary 此文 %}
* 关于reactor模型总结请转 {% post_link reactor_intro 此文 %}