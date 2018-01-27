---
title: 5分钟上手boost.asio
date: 2017-01-12 23:26:16
tags: 
- Boost
- c++
categories:
- server
---


# Boost.Asio入门

首先，让我们先来了解一下什么是Boost.Asio？怎么编译它？

linux下直接 : sudo apt-get install libboost-all-dev


# 什么是Boost.Asio

简单来说，Boost.Asio是一个跨平台的、主要用于网络和其他一些底层输入/输出编程的C++库。


# 异步VS同步

> 首先，异步编程和同步编程是非常不同的。


在同步编程中，所有的操作都是顺序执行的，比如从socket中读取（请求），然后写入（回应）到socket中。

每一个操作都是阻塞的。

因为操作是阻塞的，所以为了不影响主程序，当在socket上读写时，通常会创建一个或多个线程来处理socket的输入/输出。

因此，同步的服务端/客户端通常是多线程的。


相反的，异步编程是事件驱动的。

虽然启动了一个操作，但是你不知道它何时会结束；它只是提供一个回调给你，当操作结束时，它会调用这个API，并返回操作结果。

对于有着丰富经验的QT（诺基亚用来创建跨平台图形用户界面应用程序的库）程序员来说，这就是他们的第二天性。

因此，在异步编程中，你只需要一个线程。


因为中途做改变会非常困难而且容易出错，所以你在项目初期（最好是一开始）就得决定用同步还是异步的方式实现网络通信。

不仅API有极大的不同，你程序的语意也会完全改变（异步网络通信通常比同步网络通信更加难以测试和调试）。

你需要考虑是采用阻塞调用和多线程的方式（同步，通常比较简单），或者是更少的线程和事件驱动（异步，通常更复杂）。



# 同步例子 

## 同步客户端

下面是一个基础的同步客户端例子：

``` c++
using boost::asio;
io_service service;
ip::tcp::endpoint ep( ip::address::from_string("127.0.0.1"), 2001);
ip::tcp::socket sock(service);
sock.connect(ep);
```

首先，你的程序至少需要一个io_service实例。

Boost.Asio使用io_service同操作系统的输入/输出服务进行交互。

通常一个io_service的实例就足够了。

然后，创建你想要连接的地址和端口，再建立socket。

把socket连接到你创建的地址和端口。

## 同步服务端

下面是一个简单的同步Boost.Asio的服务端：
``` c++
typedef boost::shared_ptr<ip::tcp::socket> socket_ptr;
io_service service;
ip::tcp::endpoint ep( ip::tcp::v4(), 2001)); // listen on 2001
ip::tcp::acceptor acc(service, ep);
while ( true) {
    socket_ptr sock(new ip::tcp::socket(service));
    acc.accept(*sock);
    boost::thread( boost::bind(client_session, sock));
}
void client_session(socket_ptr sock) {
    while ( true) {
        char data[512];
        size_t len = sock->read_some(buffer(data));
        if ( len > 0)
            write(*sock, buffer("ok", 2));
    }
}
```
首先，同样是至少需要一个io_service实例。

然后你指定你想要监听的端口，再创建一个接收器——一个用来接收客户端连接的对象。

 在接下来的循环中，你创建一个虚拟的socket来等待客户端的连接。

 然后当一个连接被建立时，你创建一个线程来处理这个连接。


在client_session线程中来读取一个客户端的请求，进行解析，然后返回结果。




# 异步例子


## 异步客户端

而创建一个异步的客户端，你需要做如下的事情：

``` c++
using boost::asio;
io_service service;
ip::tcp::endpoint ep( ip::address::from_string("127.0.0.1"), 2001);
ip::tcp::socket sock(service);
sock.async_connect(ep, connect_handler);
service.run();
void connect_handler(const boost::system::error_code & ec) {
    // 如果ec返回成功我们就可以知道连接成功了
}
```

在程序中你需要创建至少一个io_service实例。

你需要指定连接的地址以及创建socket。


当连接完成时（其完成处理程序）你就异步地连接到了指定的地址和端口，也就是说，connect_handler被调用了。


当connect_handler被调用时，检查错误代码（ec），如果成功，你就可以向服务端进行异步的写入。


注意：只要还有待处理的异步操作，servece.run()循环就会一直运行。

在上述例子中，只执行了一个这样的操作，就是socket的async_connect。

在这之后，service.run()就退出了。


每一个异步操作都有一个完成处理程序——一个操作完成之后被调用的函数。


## 异步服务端

 下面的代码是一个基本的异步服务端
 ``` c++
using boost::asio;
typedef boost::shared_ptr<ip::tcp::socket> socket_ptr;
io_service service;
ip::tcp::endpoint ep( ip::tcp::v4(), 2001)); // 监听端口2001
ip::tcp::acceptor acc(service, ep);
socket_ptr sock(new ip::tcp::socket(service));
start_accept(sock);
service.run();
void start_accept(socket_ptr sock) {
    acc.async_accept(*sock, boost::bind( handle_accept, sock, _1) );
}
void handle_accept(socket_ptr sock, const boost::system::error_code &
err) {
    if ( err) return;
    // 从这里开始, 你可以从socket读取或者写入
    socket_ptr sock(new ip::tcp::socket(service));
    start_accept(sock);
}
```

在上述代码片段中，首先，你创建一个io_service实例，指定监听的端口。

然后，你创建接收器acc——一个接受客户端连接，创建虚拟的socket，异步等待客户端连接的对象。


最后，运行异步service.run()循环。

当接收到客户端连接时，handle_accept被调用（调用async_accept的完成处理程序）。

如果没有错误，这个socket就可以用来做读写操作。


在使用这个socket之后，你创建了一个新的socket，然后再次调用start_accept()，用来创建另外一个“等待客户端连接”的异步操作，从而使service.run()循环一直保持忙碌状态。

