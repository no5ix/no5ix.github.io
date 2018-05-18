---
title: epoll扼要总结
date: 2015-06-22 21:56:12
tags:
- epoll
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


# epoll与select的区别


select函数，必须得清楚select跟linux特有的epoll的区别， 有三点(遍内树)：
- 遍历 ： select每次都要遍历所有文件描述符， 集合越大速度越慢；而epoll维护着一个就绪列表， 每次只需要简单的从列表里取出就行了，只有活跃的socket才会触发相关callback 
- 内存拷贝 ： select需要把fd_set数据结构从用户态到内核态来回拷贝； 而epoll是基于mmap技术用同一块内存实现的
- 数量限制 ： select默认只支持1024个；epoll并没有最大数目限制


# 常见的epoll编程模型
    
我们知道，服务器并发模型通常可分为单线程和多线程模型，这里的线程通常是指“I/O线程”，即负责I/O操作，协调分配任务的“管理线程”，而实际的请求和任务通常交由所谓“工作者线程”处理。

通常多线程模型下，每个线程既是I/O线程又是工作者线程。

所以这里讨论的是，单I/O线程+多工作者线程的模型，这也是最常用的一种服务器并发模型。

我所在的项目中的server代码中，这种模型随处可见。

它还有个名字，叫“半同步/半异步“模型，同时，这种模型也是生产者/消费者（尤其是多消费者）模型的一种表现。


这种架构主要是基于I/O多路复用的思想（主要是epoll，select/poll已过时），通过单线程I/O多路复用，可以达到高效并发，同时避免了多线程I/O来回切换的各种开销，思路清晰，易于管理，而基于线程池的多工作者线程，又可以充分发挥和利用多线程的优势，利用线程池，进一步提高资源复用性和避免产生过多线程。

{% asset_img epoll2.jpg epoll编程模型架构 %}



## 单I/O线程epoll

实现单I/O线程的epoll模型是本架构的第一个技术要点，主要思想如下： 

单线程创建epoll并等待，有I/O请求（socket）到达时，将其加入epoll并从线程池中取一个空闲工作者线程，将实际的任务交由工作者线程处理。

伪码：
```
创建一个epoll实例;
while(server running)
{
    epoll等待事件;
    if(新连接到达且是有效连接)
    {
        accept此连接;
        将此连接设置为non-blocking;
        为此连接设置event(EPOLLIN | EPOLLET ...);
        将此连接加入epoll监听队列;
        从线程池取一个空闲工作者线程并处理此连接;
    }
    else if(读请求)
    {
        从线程池取一个空闲工作者线程并处理读请求;
    }
    else if(写请求)
    {
        从线程池取一个空闲工作者线程并处理写请求;
    }
    else
        其他事件;     
}
```

伪码可能写的不太好，其实就是基本的epoll使用, 大概如下 : 
```
for( ; ; )  
{  
	nfds = epoll_wait(epfd,events,20,500);  
	for(i=0;i<nfds;++i)  
	{  
		if(events[i].data.fd==listenfd) //有新的连接  
		{  
			connfd = accept(listenfd,(sockaddr *)&clientaddr, &clilen); //accept这个连接  
			ev.data.fd=connfd;  
			ev.events=EPOLLIN|EPOLLET;  
			epoll_ctl(epfd,EPOLL_CTL_ADD,connfd,&ev); //将新的fd添加到epoll的监听队列中  
		}  

		else if( events[i].events&EPOLLIN ) //接收到数据，读socket  
		{  
			n = read(sockfd, line, MAXLINE)) < 0    //读  
			ev.data.ptr = md;     //md为自定义类型，添加数据  
			ev.events=EPOLLOUT|EPOLLET;  
			epoll_ctl(epfd,EPOLL_CTL_MOD,sockfd,&ev);//修改标识符，等待下一个循环时发送数据，异步处理的精髓  
		}  
		else if(events[i].events&EPOLLOUT) //有数据待发送，写socket  
		{  
			struct myepoll_data* md = (myepoll_data*)events[i].data.ptr;    //取数据  
			sockfd = md->fd;  
			send( sockfd, md->ptr, strlen((char*)md->ptr), 0 );        //发送数据  
			ev.data.fd=sockfd;  
			ev.events=EPOLLIN|EPOLLET;  
			epoll_ctl(epfd,EPOLL_CTL_MOD,sockfd,&ev); //修改标识符，等待下一个循环时接收数据  
		}  
		else  
		{  
			//其他的处理  
		}  
	}  
}  
```

但要注意和线程池的配合使用，如果线程池取不到空闲的工作者线程，还需要做一些处理。

 

## 线程池实现要点

server启动时，创建一定数量的工作者线程加入线程池，如（20个），供I/O线程来取用；

每当I/O线程请求空闲工作者线程时，从池中取出一个空闲工作者线程，处理相应请求；

当请求处理完毕，关闭相应I/O连接时，回收相应线程并放回线程池中供下次使用；

若请求空闲工作者线程池时，没有空闲工作者线程，可作如下处理：

- 若池中"管理"的线程总数不超过最大允许值，可创建一批新的工作者线程加入池中，并返回其中一个供I/O线程使用；

- 若池中"管理"的线程总数已经达到最大值，不应再继续创建新线程， 则等待一小段时间并重试。注意因为I/O线程是单线程且不应被阻塞等待在此处，所以其实对线程池的管理应由一个专门的管理线程完成，包括创建新工作者线程等工作。此时管理线程阻塞等待（如使用条件变量并等待唤醒），一小段时间之后，线程池中应有空闲工作者线程可使用。否则server负荷估计是出了问题。 

# epoll代码实例

代码来自互联网, 有疏漏, 也有命名不规范之处, 用于理解一下范式, 大概看看即可

``` c
#include <iostream>
#include <sys/socket.h>
#include <sys/epoll.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <pthread.h>

#include <errno.h>

#define MAXLINE 10
#define OPEN_MAX 100
#define LISTENQ 20
#define SERV_PORT 8006
#define INFTIM 1000

//线程池任务队列结构体

struct task
{
	int fd; //需要读写的文件描述符

	struct task *next; //下一个任务
};

//用于读写两个的两个方面传递参数

struct user_data
{
	int fd;
	unsigned int n_size;
	char line[MAXLINE];
};

//线程的任务函数

void *readtask(void *args);
void *writetask(void *args);

//声明epoll_event结构体的变量,ev用于注册事件,数组用于回传要处理的事件

struct epoll_event ev, events[20];
int epfd;
pthread_mutex_t mutex;
pthread_cond_t cond1;
struct task *readhead = NULL, *readtail = NULL, *writehead = NULL;

void setnonblocking(int sock)
{
	int opts;
	opts = fcntl(sock, F_GETFL);
	if (opts < 0)
	{
		perror("fcntl(sock,GETFL)");
		exit(1);
	}
	opts = opts | O_NONBLOCK;
	if (fcntl(sock, F_SETFL, opts) < 0)
	{
		perror("fcntl(sock,SETFL,opts)");
		exit(1);
	}
}

int main()
{
	int i, maxi, listenfd, connfd, sockfd, nfds;
	pthread_t tid1, tid2;

	struct task *new_task = NULL;
	struct user_data *rdata = NULL;
	socklen_t clilen;

	pthread_mutex_init(&mutex, NULL);
	pthread_cond_init(&cond1, NULL);

	//初始化用于读线程池的线程
	pthread_create(&tid1, NULL, readtask, NULL);
	pthread_create(&tid2, NULL, readtask, NULL);

	//生成用于处理accept的epoll专用的文件描述符
	epfd = epoll_create(256);

	struct sockaddr_in clientaddr;
	struct sockaddr_in serveraddr;
	listenfd = socket(AF_INET, SOCK_STREAM, 0);

	//把socket设置为非阻塞方式
	setnonblocking(listenfd);

	//设置与要处理的事件相关的文件描述符
	ev.data.fd = listenfd;

	//设置要处理的事件类型
	ev.events = EPOLLIN | EPOLLET;

	//注册epoll事件
	epoll_ctl(epfd, EPOLL_CTL_ADD, listenfd, &ev);

	bzero(&serveraddr, sizeof(serveraddr));
	serveraddr.sin_family = AF_INET;
	serveraddr.sin_port = htons(SERV_PORT);
	serveraddr.sin_addr.s_addr = INADDR_ANY;
	bind(listenfd, (sockaddr *)&serveraddr, sizeof(serveraddr));
	listen(listenfd, LISTENQ);

	maxi = 0;
	for (;;)
	{
		//等待epoll事件的发生
		nfds = epoll_wait(epfd, events, 20, 500);

		//处理所发生的所有事件
		for (i = 0; i < nfds; ++i)
		{
			if (events[i].data.fd == listenfd)
			{

				connfd = accept(listenfd, (sockaddr *)&clientaddr, &clilen);
				if (connfd < 0)
				{
					perror("connfd<0");
					exit(1);
				}
				setnonblocking(connfd);

				char *str = inet_ntoa(clientaddr.sin_addr);
				//std::cout<<"connec_ from >>"<<str<<std::endl;

				//设置用于读操作的文件描述符
				ev.data.fd = connfd;

				//设置用于注册的读操作事件
				ev.events = EPOLLIN | EPOLLET;

				//注册ev
				epoll_ctl(epfd, EPOLL_CTL_ADD, connfd, &ev);
			}
			else if (events[i].events & EPOLLIN) // 读请求
			{
				//printf("reading!/n");

				if ((sockfd = events[i].data.fd) < 0)
					continue;
				new_task = new task();
				new_task->fd = sockfd;
				new_task->next = NULL;

				//添加新的读任务
				pthread_mutex_lock(&mutex);
				if (readhead == NULL)
				{
					readhead = new_task;
					readtail = new_task;
				}
				else
				{
					readtail->next = new_task;
					readtail = new_task;
				}

				//唤醒所有等待cond1条件的线程
				pthread_cond_broadcast(&cond1);
				pthread_mutex_unlock(&mutex);
			}
			else if (events[i].events & EPOLLOUT) // 写请求
			{
				
				// rdata=(struct user_data *)events[i].data.ptr;
				// sockfd = rdata->fd;
				// write(sockfd, rdata->line, rdata->n_size);
				// delete rdata;
				// //设置用于读操作的文件描述符
				// ev.data.fd=sockfd;
				// //设置用于注测的读操作事件
				// ev.events=EPOLLIN|EPOLLET;
				// //修改sockfd上要处理的事件为EPOLIN
				// epoll_ctl(epfd,EPOLL_CTL_MOD,sockfd,&ev);
			}
		}
	}
}

static int count111 = 0;
static time_t oldtime = 0, nowtime = 0;
void *readtask(void *args)
{

	int fd = -1;
	unsigned int n;
	//用于把读出来的数据传递出去

	struct user_data *data = NULL;
	while (1)
	{

		pthread_mutex_lock(&mutex);
		//等待到任务队列不为空

		while (readhead == NULL)
			pthread_cond_wait(&cond1, &mutex);

		fd = readhead->fd;
		//从任务队列取出一个读任务

		struct task *tmp = readhead;
		readhead = readhead->next;
		delete tmp;
		pthread_mutex_unlock(&mutex);
		data = new user_data();
		data->fd = fd;

		char recvBuf[1024] = {0};
		int ret = 999;
		int rs = 1;

		while (rs)
		{
			ret = recv(fd, recvBuf, 1024, 0); // 接受客户端消息

			if (ret < 0)
			{
				//由于是非阻塞的模式,所以当errno为EAGAIN时,表示当前缓冲区已无数据可
				//读在这里就当作是该次事件已处理过。
				if (errno == EAGAIN)
				{
					printf("EAGAIN\n");
					break;
				}
				else
				{
					printf("recv error!\n");

					close(fd);
					break;
				}
			}
			else if (ret == 0)
			{
				// 这里表示对端的socket已正常关闭.

				rs = 0;
			}
			if (ret == sizeof(recvBuf))
				rs = 1; // 需要再次读取

			else
				rs = 0;
		}
		if (ret > 0)
		{

			//-------------------------------------------------------------------------------
			// 业务代码
			data->n_size = n;

			count111++;

			struct tm *today;
			time_t ltime;
			time(&nowtime);

			if (nowtime != oldtime)
			{
				printf("%d\n", count111);
				oldtime = nowtime;
				count111 = 0;
			}

			char buf[1000] = {0};
			sprintf(buf, "HTTP/1.0 200 OK\r\nContent-type: text/plain\r\n\r\n%s", "Hello world!\n");
			send(fd, buf, strlen(buf), 0);
			close(fd);
		}
	}
}
```