---
title: 重读UNIX网络编程第三章到第十一章笔记整理(二)
date: 2017-07-03 21:01:21
tags:
- UNP
- TLPI
- APUE
categories:
- NP
---


# **第七章**

- 7.5节 ： 通用套接字选项， 常用的有
	- SO_KEEPALIVE
	- SO_REVBUF
	- SO_SNDBUF
	- SO_REUSEADDR

- 7.9节 ：  tcp套接字选项， 常用的有
	- TCP_NODELAY
	- TCP_MAXSEG 
- 7.11节 ：fcntl函数，常用的用法是使用F_SETFL命令设置O_NOBLOCK文件状态标志， 我们可以把一个套接字设置为非阻塞型。

**. . .**<!-- more -->

# **第八章基本UDP套接字编程**

- ![列表内容](http://img.blog.csdn.net/20170729024826032?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- 8.11节 ： UDP的connect函数，可以获得性能提升，因为未连接的udp每次sendto发送数据报的时候都要连接然后发送然后断开， 之后第二个数据报又要重复上述步骤，而连接后的udp套接字只需要连接然后发送第一个数据报然后发送第二个、第三个就行了
![这里写图片描述](http://img.blog.csdn.net/20170729025132709?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
