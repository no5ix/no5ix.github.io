---
title: 重读UNP（UNIX网络编程）13章到31章笔记整理（结合TLPI和APUE两书的笔记整理）(二)
date: 2017-07-29 19:42:21
tags:
- UNP
- TLPI
- APUE
categories:
- NP
---


# 16章

- 16.3节 ： 非阻塞connect
	- 有三个用途：
		-  我们想在connect的时候处理其他事情
		- 可以同时建立多个连接
		- 可以通过select设置一个更短一点的超时时间
	- 实现步骤：
		a. 用fcntl把套接字设置为非阻塞
		b. 处理客户端和服务器都在同一主机上的情况
		c. 使用select设置超时，并处理超时情况
		d. 处理当连接建立的时候，描述符变为可写；以及当连接建立遇到错误的时候， 描述符变为可写并可读的情况

**. . .**<!-- more -->

- 16.6节 ： 非阻塞accept，
	- 用于解决下面问题：
	用select检测socket状态，如果有连接就调用accept，这样如果在select检测到有连接请求，但在调用accept之前，这个请求断开了，
	然后调用accept的时候就会阻塞在哪里，除非这时有另外一个连接请求，如果没有，则一直被阻塞在accept调用上, 无法处理任何其他已就绪的描述符。

	- 解决方案：
	使用select在一个监听套接字准备好要被accept时总是把套接字设置为非阻塞
		 

# 26章和30章

这两章介绍了线程和并发/并行的服务器设计范式.

- 关于线程可参考 : {% post_link 阅读开源服务器源码基础 %}
- 关于服务器设计范式可参考 : 目前Linux比较通用的基于epoll的服务器设计范式大体如{% post_link epoll扼要总结 %}