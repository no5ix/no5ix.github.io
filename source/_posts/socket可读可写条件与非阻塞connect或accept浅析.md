---
title: socket可读可写条件与非阻塞connect或accept浅析
date: 2015-06-22 21:56:12
tags:
- NP
categories:
- NP
---


# socket可读的条件:

- socket的接收缓冲区中的数据字节大于等于该socket的接收缓冲区低水位标记的当前大小。对这样的socket的读操作将不阻塞并返回一个大于0的值(也就是返回准备好读入的数据)。我们可以用SO_RCVLOWAT这个socket选项来设置该socket的低水位标记。对于TCP和UDP的socket而言，其缺省值为1.
- 该连接的读这一半关闭(也就是接收了FIN的TCP连接)。对这样的socket的读操作将不阻塞并返回0
- **给监听套接字准备好新连接**
- 有一个socket有异常错误条件待处理.对于这样的socket的读操作将不会阻塞,并且返回一个错误(-1),errno则设置成明确的错误条件.这些待处理的错误也可通过指定socket选项SO_ERROR调用getsockopt来取得并清除;

**. . .**<!-- more -->

# socket可写的条件:

- socket的发送缓冲区中的**可用空间**字节数大于等于该socket的发送缓冲区低水位标记的当前大小。对这样的socket的写操作将不阻塞并返回一个大于0的值(也就是返回准备好写入的数据)。我们可以用SO_SNDLOWAT这个socket选项来设置该socket的低水位标记。对于TCP和UDP的socket而言，其缺省值为2048
- 该连接的写这一半关闭。对这样的socket的写操作将产生SIGPIPE信号，该信号的缺省行为是终止进程。
- **使用非阻塞connect的套接字已建立连接, 或者connect已经以失败告终**
- 有一个socket异常错误条件待处理.对于这样的socket的写操作将不会阻塞并且返回一个错误(-1),errno则设置成明确的错误条件.这些待处理的错误也可以通过指定socket选项SO_ERROR调用getsockopt函数来取得并清除;

# 非阻塞connect/accept相关

上述的各种条件可以大体总结为下图
![这里写图片描述](http://img.blog.csdn.net/20170822193729519?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

注意 : 当socket异常错误的时候socket是可读并可写的, 所以在非阻塞connect(判断是否可写)/accept(判断是否可读)的时候要特别注意这种情况, 要用getsockopt函数, 使用SO_ERROR选项来检查处理.