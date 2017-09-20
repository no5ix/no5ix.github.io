---
title: 重读UNIX网络编程第三章到第十一章笔记整理(一)
date: 2017-07-02 19:01:21
tags:
- UNP
- TLPI
- APUE
categories:
- linux
---

>因为第二章之后基本都是纯Socket API的内容， 第三章到第十一章的笔记整理合并到一起。

# **第三章**
 - 3.4 ：字节排序函数，涉及到大小端，处理网络字节序和主机字节序的转换
 - 3.6 ： 地址转换函数，吹在ASCII字符串与网络字节序的二进制值之间转换网际地址
# **第四章**
 -    ![这里写图片描述](http://img.blog.csdn.net/20170729013008696?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

 -  ![这里写图片描述](http://img.blog.csdn.net/20170729013634366?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 - ![这里写图片描述](http://img.blog.csdn.net/20170729013930226?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
	 
 - 4.9节：close函数， 涉及到描述符引用计数，所以多进程并发服务器才可以共享已连接套接字，因为父进程调用close函数知识把该套接字标记成已关闭并导致该套接字描述符减1。只要引用计数的值仍大于0，就不会引发tcp的四分组连接终止序列
	 
# **第五章**
 - 5.9节：处理SIGCHLD信号， 涉及到僵死进程（子进程终止时给父进程发送了一个SIGCHLD信号，若父进程未加处理，则子进程进入僵死状态），所以要建立该信号处理函数，并在函数中调用waitpid来处理
 - 5.10节 ：使用wait或者waitpid来处理已终止的子进程，通常是使用waitpid并指定WNOHANG选项，来告知waitpid在有尚未终止的子进程在运行时不要阻塞。
	 
<!-- more -->
	 
# **第六章**

- ![列表内容](http://img.blog.csdn.net/20170729020522848?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
- ![这里写图片描述](http://img.blog.csdn.net/20170729020609873?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- ![这里写图片描述](http://img.blog.csdn.net/20170729020641599?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- ![这里写图片描述](http://img.blog.csdn.net/20170729020801057?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- ![这里写图片描述](http://img.blog.csdn.net/20170729020828685?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- 同步I/O操作：导致请求进程阻塞，知道I/O操作完成
- 异步I/O操作：不导致请求进程阻塞

- ![这里写图片描述](http://img.blog.csdn.net/20170729021237265?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

- 6.3节 ： select函数，必须得清楚select跟linux特有的epoll的区别， 有三点：
	- 数量限制 ： select默认只支持1024个；epoll并没有最大数目限制
	- 内存拷贝 ： select需要把fd_set数据结构从用户态到内核态来回拷贝； 而epoll是基于mmap技术用同一块内存实现的
	- 效率 ： select每次都要遍历所有文件描述符， 集合越大速度越慢；而epoll维护着一个就绪列表， 每次只需要简单的从列表里取出就行了，只有活跃的socket才会触发相关callback 

- 6.6节 ： shutdown函数，shutdown可以不用管引用计数就激发tcp的正常连接终止序列。当关闭连接的写这一半，对于tcp连接， 这称为**半关闭（half-close）**![这里写图片描述](http://img.blog.csdn.net/20170729022856179?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
