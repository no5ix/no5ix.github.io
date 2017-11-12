---
title: epoll扼要总结
date: 2015-06-22 21:56:12
tags:
- epoll
categories:
- linux
---

1. [水平触发与边缘触发](#%E6%B0%B4%E5%B9%B3%E8%A7%A6%E5%8F%91%E4%B8%8E%E8%BE%B9%E7%BC%98%E8%A7%A6%E5%8F%91)
2. [epoll 编程接口](#epoll-%E7%BC%96%E7%A8%8B%E6%8E%A5%E5%8F%A3)
3. [epoll与select的区别 (口诀 : 校内树)](#epoll%E4%B8%8Eselect%E7%9A%84%E5%8C%BA%E5%88%AB-%E5%8F%A3%E8%AF%80-%E6%A0%A1%E5%86%85%E6%A0%91)
4. [常见的epoll编程模型](#%E5%B8%B8%E8%A7%81%E7%9A%84epoll%E7%BC%96%E7%A8%8B%E6%A8%A1%E5%9E%8B)
    1. [*单I/O 线程epoll*](#%E5%8D%95io-%E7%BA%BF%E7%A8%8Bepoll)
    2. [_线程池实现要点_](#%E7%BA%BF%E7%A8%8B%E6%B1%A0%E5%AE%9E%E7%8E%B0%E8%A6%81%E7%82%B9)
5. [epoll代码实例](#epoll%E4%BB%A3%E7%A0%81%E5%AE%9E%E4%BE%8B)

# 水平触发与边缘触发

在深入讨论多种可选的m机制之前，我们需要先区分两种文件描述符准备就绪的通知模式。

- **水平触发**通知：如果文件描述符上可以非阻塞地执行I/O系统调用，此时认为它已经
就绪。
- **边缘触发**通知：如果文件描述符自上次状态检查以来有了新的I/O活动（比如新的输
入），此时需要触发通知。

表63-1总结了I/O多路复用、信号驱动I/O以及epoll所采用的通知模型。epoll API同其
他两种I/O模型的区别在于它对水平触发（默认）和边缘触发都支持。

{% asset_img epoll1.png epoll %}

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

epoll API由以下3个系统调用组成。

- 系统调用**epoll_create()**创建一个epoll实例，返回代表该实例的文件描述符。
- 系统调用**epoll_ctl()**操作同epoll实例相关联的兴趣列表。通过epoll_ctl()，我们可以增
加新的描述符到列表中，将已有的文件描述符从该列表中移除，以及修改代表文件描述
符七事件类型的位掩码。
- 系统调用**epoll_wait()**返回与epoll实例相关联的就绪列表申的成员。

# epoll与select的区别 (口诀 : 校内树)

- **效率: ** 每次调用select0和poll0时，内核必须检查所有在调用中指定的文件描述符。与之相
反，当通过epoll_ctl0指定了需要监视的文件描述符时，内核会在与打开的文件描述
上下文相关联的列表中记录该描述符。之后每当执行I／O操作使得文件描述符成为就
绪态时，内核就在epoll描述符的就绪列表中添加一个元素。（单个打开的文件描述上
下文中的一次I]O事件可能导致与之相关的多个文件描述符成为就绪态。）之后的
epoll_wait0调用从就绪列表中简单地取出这些元素。

- **内存: ** 每次调用select0或poll()时，我们传递一个标记了所有待监视的文件描述符的
数据结构给内核，调用返回时，内核将所有标记为就绪态的文件描述符的数据
结构再传回给我们。与之相反，在epoll中我们使用epoll_ctl()在内核空间中建
立一个数据结构，该数据结构会将待监视的文件描述符都记录下来。一旦这个
数据结构建立完成，稍后每次调用epoll_wait0时就不需要再传递任何与文件描
述符有关的信息给内核了，而调用返回的信息中只包含那些已经处于就绪态的
描述符。

- **数量: ** select默认只支持1024个；epoll并没有最大数目限制

# 常见的epoll编程模型
    
我们知道，服务器并发模型通常可分为单线程和多线程模型，这里的线程通常是指“I/O线程”，即负责I/O操作，协调分配任务的“管理线程”，而实际的请求和任务通常交由所谓“工作者线程”处理。

通常多线程模型下，每个线程既是I/O线程又是工作者线程。

所以这里讨论的是，单I/O线程+多工作者线程的模型，这也是最常用的一种服务器并发模型。

我所在的项目中的server代码中，这种模型随处可见。

它还有个名字，叫“半同步/半异步“模型，同时，这种模型也是生产者/消费者（尤其是多消费者）模型的一种表现。


这种架构主要是基于I/O多路复用的思想（主要是epoll，select/poll已过时），通过单线程I/O多路复用，可以达到高效并发，同时避免了多线程I/O来回切换的各种开销，思路清晰，易于管理，而基于线程池的多工作者线程，又可以充分发挥和利用多线程的优势，利用线程池，进一步提高资源复用性和避免产生过多线程。

{% asset_img epoll2.jpg epoll编程模型架构 %}



## *单I/O 线程epoll*

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

伪码可能写的不太好，其实就是基本的epoll使用。

但要注意和线程池的配合使用，如果线程池取不到空闲的工作者线程，还需要做一些处理。

 

## _线程池实现要点_

server启动时，创建一定数量的工作者线程加入线程池，如（20个），供I/O线程来取用；

每当I/O线程请求空闲工作者线程时，从池中取出一个空闲工作者线程，处理相应请求；

当请求处理完毕，关闭相应I/O连接时，回收相应线程并放回线程池中供下次使用；

若请求空闲工作者线程池时，没有空闲工作者线程，可作如下处理：

- 若池中"管理"的线程总数不超过最大允许值，可创建一批新的工作者线程加入池中，并返回其中一个供I/O线程使用；

- 若池中"管理"的线程总数已经达到最大值，不应再继续创建新线程， 则等待一小段时间并重试。注意因为I/O线程是单线程且不应被阻塞等待在此处，所以其实对线程池的管理应由一个专门的管理线程完成，包括创建新工作者线程等工作。此时管理线程阻塞等待（如使用条件变量并等待唤醒），一小段时间之后，线程池中应有空闲工作者线程可使用。否则server负荷估计是出了问题。 

# epoll代码实例

> 代码来自互联网, 有疏漏, 也有命名不规范之处, 大概看看就好

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
				//设置用于注测的读操作事件

				ev.events = EPOLLIN | EPOLLET;
				//注册ev

				epoll_ctl(epfd, EPOLL_CTL_ADD, connfd, &ev);
			}
			else if (events[i].events & EPOLLIN)
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
			else if (events[i].events & EPOLLOUT)
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