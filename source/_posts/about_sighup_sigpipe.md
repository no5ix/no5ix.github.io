---
title: 关于SIGPIPE和SIGHUP
date: 2019-08-12 01:53:26
tags:
- NP
categories:
- NP
---


# SIGHUP 信号

　　在介绍 SIGHUP 信号之前，先来了解两个概念：进程组和会话。

## 进程组

　　进程组就是一系列相互关联的进程集合，系统中的每一个进程也必须从属于某一个进程组；每个进程组中都会有一个唯一的 ID(process group id)，简称 PGID；PGID 一般等同于进程组的创建进程的 Process ID，而这个进进程一般也会被称为进程组先导 (process group leader)，同一进程组中除了进程组先导外的其他进程都是其子进程；  
　　进程组的存在，方便了系统对多个相关进程执行某些统一的操作，例如，我们可以一次性发送一个信号量给同一进程组中的所有进程。

## 会话

　　会话（session）是一个若干进程组的集合，同样的，系统中每一个进程组也都必须从属于某一个会话；一个会话只拥有最多一个控制终端（也可以没有），该终端为会话中所有进程组中的进程所共用。一个会话中前台进程组只会有一个，只有其中的进程才可以和控制终端进行交互；除了前台进程组外的进程组，都是后台进程组；和进程组先导类似，会话中也有会话先导 (session leader) 的概念，用来表示建立起到控制终端连接的进程。在拥有控制终端的会话中，session leader 也被称为控制进程(controlling process)，一般来说控制进程也就是登入系统的 shell 进程(login shell)；  

![](/img/about_sighup_sigpipe/1.png)  
执行睡眠后台进程 sleep 50 & 之后，通过　ps 命令查看该进程及 shell 信息如上图：

- PPID 指父进程 id；
- PID 指进程 id；
- PGID 指进程组 id
- SID 指会话 id；
- TTY 指会话的控制终端设备；
- COMMAND 指进程所执行的命令
- TPGID 指前台进程组的 PGID。


## SIGHUP 信号的触发及默认处理

　　在对会话的概念有所了解之后，我们现在开始正式介绍一下 SIGHUP 信号，SIGHUP 信号在 **用户终端连接 (正常或非正常) 结束** 时发出, 通常是在终端的控制进程结束时, 通知同一 session 内的各个作业, 这时它们与控制终端不再关联. 系统对 SIGHUP 信号的**默认处理是终止收到该信号的进程**。所以若程序中没有捕捉该信号，当收到该信号时，进程就会退出。  
　　  
**SIGHUP 会在以下 3 种情况下被发送给相应的进程：**  

1. 终端关闭时，该信号被发送到 session 首进程以及作为 job 提交的进程（即用 & 符号提交的进程）；  
2. session 首进程退出时，该信号被发送到该 session 中的前台进程组中的每一个进程；  
3. 若父进程退出导致进程组成为孤儿进程组，且该进程组中有进程处于停止状态（收到 SIGSTOP 或 SIGTSTP 信号），该信号会被发送到该进程组中的每一个进程。  
　　  
　　例如：在我们登录 Linux 时，系统会分配给登录用户一个终端 (Session)。在这个终端运行的所有程序，包括前台进程组和后台进程组，一般都属于这个 Session。当用户退出 Linux 登录时，前台进程组和后台有对终端输出的进程将会收到 SIGHUP 信号。这个信号的默认操作为终止进程，因此前台进 程组和后台有终端输出的进程就会中止。

**此外，对于与终端脱离关系的守护进程，正常情况下是永远都收不到这个信号的, 所以可以人为的发SIGHUP信号给她用于通知它做一些想要的自定义的操作, 比较常见的如重新读取配置文件操作。** 比如 xinetd 超级服务程序。  
　　当 xinetd 程序在接收到 SIGHUP 信号之后调用 hard_reconfig 函数，它将循环读取 / etc/xinetd.d / 目录下的每个子配置文件，并检测其变化。如果某个正在运行的子服务的配置文件被修改以停止服务，则 xinetd 主进程讲给该子服务进程发送 SIGTERM 信号来结束它。如果某个子服务的配置文件被修改以开启服务，则 xinetd 将创建新的 socket 并将其绑定到该服务对应的端口上。


# SIGPIPE

　　在网络编程中，SIGPIPE 这个信号是很常见的。当往一个写端关闭的管道或 socket 连接中连续写入数据时会引发 SIGPIPE 信号, 引发 SIGPIPE 信号的写操作将设置 errno 为 EPIPE。在 TCP 通信中，当通信的双方中的一方 close 一个连接时，若另一方接着发数据，根据 TCP 协议的规定，会收到一个 RST 响应报文，若再往这个服务器发送数据时，系统会发出一个 SIGPIPE 信号给进程，告诉进程这个连接已经断开了，不能再写入数据。  
　　测试程序如下：简单的测试程序，函数未加错误判断  
```cpp server.c 

#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <errno.h>
#include <signal.h>

#define port 8888

void handle(int sig)
{
    printf("SIGPIPE : %d\n",sig);
}

void mysendmsg(int fd)
{

    // 写入第一条消息
    char* msg1 = "first msg"; 
    int n = write(fd, msg1, strlen(msg1));

    if(n > 0)  //成功写入第一条消息,server 接收到 client 发送的 RST
    {
        printf("success write %d bytes\n", n);
    }

    // 写入第二条消息,触发SIGPIPE
    char* msg2 = "second msg";
    n = write(fd, msg2, strlen(msg2));
    if(n < 0)
    {
        printf("write error: %s\n", strerror(errno));
    }
}
int main()
{
    signal(SIGPIPE , handle); //注册信号捕捉函数

    struct sockaddr_in server_addr;

    bzero(&server_addr, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    server_addr.sin_port = htons(port);

    int listenfd = socket(AF_INET , SOCK_STREAM , 0);

    bind(listenfd, (struct sockaddr *)&server_addr, sizeof(server_addr));

    listen(listenfd, 128);

    int fd = accept(listenfd, NULL, NULL);
    if(fd < 0)
    {
        perror("accept");
        exit(1);
    }

    mysendmsg(fd);

    return 0;
}
```

　　  

``` cpp client.c
#include<stdio.h>
#include<stdlib.h>
#include<errno.h>
#include<string.h>
#include<sys/types.h>
#include<netinet/in.h>
#include<sys/socket.h>
#include<sys/wait.h>
#include<arpa/inet.h>
#include<unistd.h>

#define PORT 8888
#define MAX 1024

int main()
{

    char buf[MAX] = {'0'};
    int sockfd;
    int n;
    socklen_t slen;
    slen = sizeof(struct sockaddr);
    struct sockaddr_in seraddr;

    bzero(&seraddr,sizeof(seraddr));
    seraddr.sin_family = AF_INET;
    seraddr.sin_port = htons(PORT);
    seraddr.sin_addr.s_addr = htonl(INADDR_ANY);


    //socket()
    if((sockfd = socket(AF_INET,SOCK_STREAM,0)) == -1)
    {
        perror("socket");
        exit(-1);
    }
    //connect()
    if(connect(sockfd,(struct sockaddr *)&seraddr,slen) == -1)
    {
        perror("connect");
        exit(-1);
    }

    int ret = shutdown(sockfd , SHUT_RDWR);
    if(ret < 0)
    {
        perror("shutdown perror");
    }

    return 0;
}
```

运行结果  
![](/img/about_sighup_sigpipe/2.png)

　　此外，因为 **SIGPIPE 信号的默认行为是结束进程**，而我们绝对不希望因为写操作的错误而导致程序退出，尤其是作为服务器程序来说就更恶劣了。所以我们应该对这种信号加以处理，在这里，介绍两种处理 SIGPIPE 信号的方式： 

1. 给 SIGPIPE 设置 SIG_IGN 信号处理函数，忽略该信号:
`signal(SIGPIPE, SIG_IGN); `
前文说过，引发 SIGPIPE 信号的写操作将设置 errno 为 EPIPE,。所以，第二次往关闭的 socket 中写入数据时, 会返回 - 1, 同时 errno 置为 EPIPE. 这样，便能知道对端已经关闭，然后进行相应处理，而不会导致整个进程退出.  

2. 使用 send 函数的 MSG_NOSIGNAL 标志来禁止写操作触发 SIGPIPE 信号。
`send(sockfd , buf , size , MSG_NOSIGNAL); `
同样，我们可以根据 send 函数反馈的 errno 来判断 socket 的读端是否已经关闭。  
此外，我们也可以通过 IO 复用函数来检测管道和 socket 连接的读端是否已经关闭。以 POLL 为例，当 socket 连接被对方关闭时，socket 上的 POLLRDHUP 事件将被触发。