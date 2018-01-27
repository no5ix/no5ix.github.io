---
title: 分布式具体实现重要组件之RPC
date: 2017-01-10 13:18:12
tags:
- 分布式
- RPC
categories:
- server
---

# RPC 是什么？ 
RPC 的全称是 Remote Procedure Call 是一种进程间通信方式。它允许程序调用另一个地址空间（通常是共享网络的另一台机器上）的过程或函数，而不用程序员显式编码这个远程调用的细节。即程序员无论是调用本地的还是远程的，本质上编写的调用代码基本相同。 像腾讯的[phxrpc框架](https://github.com/Tencent/phxrpc)是使用Protobuf作为IDL用于描述RPC接口以及通信数据结构

引用一个图 :

![](http://img.blog.csdn.net/20150108170231000?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbWluZGZsb2F0aW5n/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)


# c++ RPC的实现

- 1、一套完善的序列化框架；在不同的进程间传输数据，序列化是第一步，如何可靠且方便地将对象转化为二进制（或者其他格式），在对端则是如何正确且安全地将其从二进制恢复为对象。

- 2、完善的底层通信协议；其需要提供合适的语义抽象：服务端支持怎样的并发，是单客户单访问，还是多访问；而客户端的并发模型由服务端决定。当然，还需要健壮且足够的接口抽象，毕竟分布式环境，“一切皆有可能”，需要应对各种问题。

- 3、一个可用的反射系统。是的，需要在C++环境下建立一个反射系统。这一步是最为关键的，其由C++11支持。因为，我们需要注册一个类的各种信息，以供RPC调用。

