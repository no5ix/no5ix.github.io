---
title: 重读UNIX网络编程第二章笔记修正（结合TLPI和APUE两书的笔记整理）
date: 2017-06-05 19:01:21
tags:
- UNP
- TLPI
- APUE
categories:
- linux
---

为加深理解, 故本章老笔记内容大幅删减重写.
第二章重点如下 : 

 - TCP (Transmission Control Protocol)传输控制协议. 特性如下 : 
	 - 面向连接
	 - 全双工
	 - 可靠, 关心确认/超时/重传等, 保证顺序
	 - 流量控制
	 - 字节流, 没有任何记录边界
 - UDP (User Datagram Protocol)用户数据报协议. 特性如下 : 
	 - 无连接
	 -  不可靠, 不保证顺序/是否到达/是否重复
	 - 每个数据报都有一个长度
 - TCP三路握手(three-way handshake)
 ![TCP三路握手图](http://img.blog.csdn.net/20170604224047107?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
 - TCP选项 : 
	 - MSS选项 发送SYN的TCP一端使用本选项通告对端他的最大分节大小(maximum segment size)
	 - 窗口规模选项
	 - 时间戳选项, 对于高速网络连接是必要的.
	
<!-- more -->
	
 - TCP连接终止 : 
 ![TCP连接终止图](http://img.blog.csdn.net/20170604230427728?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
 - TCP状态转换图
 ![TCP状态转换图](http://img.blog.csdn.net/20170604234518885?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
 - TCP连接的分组交换
 ![TCP连接的分组交换图](http://img.blog.csdn.net/20170604234715314?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
 - TIME_WAIT状态存在的理由 :
	 - 可靠地实现TCP全双工连接的终止
	 - 允许老的重复分节在网络中消逝 
 - 分节是TCP传递给IP的数据单元
 - Linux下面一共有65535个端口
	 - 其中1–1023是系统保留的，
	 - 1024–65535是供用户使用的。
	 - 0到1024是众所周知的端口（知名端口，常用于系统服务等，例如http服务的端口号是80)。个人写的应用程序，尽量不要使用0到1024之间的端口号。
 - 套接字对是一个定义该连接的两个端点的四元组:
	 - 本地IP地址
	 - 本地TCP端口号
	 - 外地IP地址
	 - 外地TCP端口号
 - 缓冲区大小及限制
	 - IPv4数据报的最大大小为65535字节, 因为其总长度字段占据16位
	 - 以太网的MTU是1500字节, 
	 - IPv4要求的最小链路MTU是68字节, 这允许最大的IPv4首部(包括20字节的固定长度部分和最多40字节的选项部分)拼接最小的片段
	 - 在两个主机之间的路径中最小的MTU成为路径MTU
	 - 当一个IP数据报将从某个接口送出时, 如果他的大小超过相应链路的MTU, IPv4和IPv6都将执行分片
	 - IPv4首部的"不分片(don't fragment)"位(即DF位)若被设置, 那么不管是发送这些数据报的主机还是转发他们的路由器, 都不允许对他们分片
	 - IPv4和IPv6都定义了最小重组缓冲区大小(minimum reassembly buffersize), IPv4的主机要求不能超过576字节的数据， 所以很多使用UDP的IPv4应用（如DNS）都避免产生大于这个大小的数据报
	 - MSS : TCP最大分节大小， 在以太网中使用IPv4的MSS值为1460（以太网的MTU - IPv4首部 - TCP首部 = 1500 - 20 - 20）
 - TCP输出示意图 : 
 ![TCP输出示意图](http://img.blog.csdn.net/20170607102732371?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 - UDP输出示意图 (因为UDP是不可靠的, 他不必保存应用进程数据的一个副本, 因此无需一个真正的发送缓冲区, 所以为虚线框): 
 ![UDP输出示意图](http://img.blog.csdn.net/20170607102827548?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 - 常见因特网应用所使用的协议
	 - ping ： ICMP
	 - DNS ： UDP、TCP 
	 - DHCP : UDP
	 - SSH : TCP
	 - FTP : TCP
	 - HTTP : TCP
 