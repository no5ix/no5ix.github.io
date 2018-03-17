---
title: 重读UNIX网络编程第三章到第十一章笔记整理(一)
date: 2017-07-02 19:01:21
tags:
- UNP
- TLPI
- APUE
categories:
- NP
---

>因为第二章之后基本都是纯Socket API的内容， 第三章到第十一章的笔记整理合并到一起。

# **第三章**

 - 3.4 ：字节排序函数，涉及到大小端，处理网络字节序和主机字节序的转换

	{% asset_img unix3_11_1.jpg %}

	如何判别是大端(Big-Endian)还是小端(Little-Endian):

	``` c++
	union TestBigOrLittle
	{
		short var_short;
		char array_char[2];
	};

	int main()
	{
		TestBigOrLittle unTestUnion;
		unTestUnion.var_short = 0x1234;
		if (sizeof(short) == 2)
		{

			if (unTestUnion.array_char[0] == 0x12)
				printf("BigEndian\n");
			else if(unTestUnion.array_char[0] == 0x34)
				printf("LittleEndian\n");
			else
				printf("unkonw endian\n");
		}	
		else
		{
			printf("sizeof(short) : %d \n", sizeof(short));
		}
		return 0;		
	}
	```

	网际协议使用**大端字节序**来传送这些多字节整数, 也就是说**网络字节序**就是大端字节序.

	{% asset_img unix3_11_2.jpg %}

	由图中我们可以知道, htons和ntohs是用于端口的字节序转换的, 而htonl和ntohl是用于32位IP地址的, 下图就是一个例子:

	{% asset_img unix3_11_4.jpg %}

 - 3.6 ： 地址转换函数，它们在ASCII字符串(这是人们偏爱使用的格式)与网络字节序的二进制值(这是存放在套接字地址结构中的值)之间转换网际地址
 
	{% asset_img unix3_11_3.jpg %}

# **第四章基本TCP套接字编程**

 -    {% asset_img unix3_11_5.jpg %}

 -  ![这里写图片描述](http://img.blog.csdn.net/20170729013634366?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

 - listen函数

	int listen(int sockfd, int backlog);
	{% asset_img unix3_11_6.jpg %}
	当来自客户的SYN到达时，TCP在未完成连接队列中创建个新项，然后响应以三路握手
	的第—个分节服务器的SYN响应，其中捎带对客户SYN的ACK（2.6节）。这一项．直保留在
	未完成连接队列中，直到三路握手的第二个分节（客户对服务器SYN的ACK）到达或者该项超
	时为止。（源白Berkeley的实现为这些末完成连接的项设置的超时值为75s。）如果3路握手正常
	完成，该项就从未完成连接队列移到已完成连接队列的队尾。当进程调用accept时（该函数在
	下一节讲解），己完成连接队列巾的队头项将返回给给进程，或者如果该队列为空，那么进程将被
	投入睡眠，直到TCP在该队列中放入一项才唤醒它。

 - 4.6节: accept函数
	accept函数用于从已完成连接队列对头返回下一个已完成连接
	`int accept(int sockfd, struct sockaddr *cliaddr, socklent_t *addrlen);`
			 
 - 4.7节: fork函数
	fork函数的内存语义:
	1. 共享代码段, 子指向父 : 父子进程共享同一代码段, 子进程的页表项指向父进程相同的物理内存页(即数据段/堆段/栈段的各页)
	2. 写时复制(copy-on-write) : 内核会捕获所有父进程或子进程针对这些页面(即数据段/堆段/栈段的各页)的修改企图, 并为将要修改的页面创建拷贝, 将新的页面拷贝分配给遭内核捕获的进程, 从此父/子进程可以分别修改各自的页拷贝, 不再相互影响.


 - 4.9节：
	close函数， 涉及到描述符引用计数，所以多进程并发服务器才可以共享已连接套接字，因为父进程调用close函数知识把该套接字标记成已关闭并导致该套接字描述符减1。只要引用计数的值仍大于0，就不会引发tcp的四分组连接终止序列
	 
# **第五章**

 - 5.9节：
	处理SIGCHLD信号， 涉及到僵死进程（子进程终止时给父进程发送了一个SIGCHLD信号，若父进程未加处理，则子进程进入僵死状态），所以要建立该信号处理函数，并在函数中调用waitpid来处理
 - 5.10节 ：
	使用wait或者waitpid来处理已终止的子进程，通常是使用waitpid并指定WNOHANG选项，来告知waitpid在有尚未终止的子进程在运行时不要阻塞。
	 
**. . .**<!-- more -->
	 
# **第六章**

- ![列表内容](http://img.blog.csdn.net/20170729020522848?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
- ![这里写图片描述](http://img.blog.csdn.net/20170729020609873?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- ![这里写图片描述](http://img.blog.csdn.net/20170729020641599?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- ![这里写图片描述](http://img.blog.csdn.net/20170729020801057?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- ![这里写图片描述](http://img.blog.csdn.net/20170729020828685?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- 同步I/O操作：导致请求进程阻塞，知道I/O操作完成
- 异步I/O操作：不导致请求进程阻塞

- ![这里写图片描述](http://img.blog.csdn.net/20170729021237265?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- 6.3节 ： 
	博客中有文章详细论述了{% post_link epoll扼要总结 epoll %}
	select函数，必须得清楚select跟linux特有的epoll的区别， 有三点(校内树)：
	- 效率 ： select每次都要遍历所有文件描述符， 集合越大速度越慢；而epoll维护着一个就绪列表， 每次只需要简单的从列表里取出就行了，只有活跃的socket才会触发相关callback 
	- 内存拷贝 ： select需要把fd_set数据结构从用户态到内核态来回拷贝； 而epoll是基于mmap技术用同一块内存实现的
	- 数量限制 ： select默认只支持1024个；epoll并没有最大数目限制

- 6.6节 ： 
	shutdown函数，shutdown可以不用管引用计数就激发tcp的正常连接终止序列。当关闭连接的写这一半，对于tcp连接， 这称为**半关闭（half-close）**![这里写图片描述](http://img.blog.csdn.net/20170729022856179?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
