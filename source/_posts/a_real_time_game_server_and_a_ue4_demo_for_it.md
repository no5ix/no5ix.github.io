---
title: 一个实时的专用游戏服务器
date: 2018-05-02 17:56:12
tags:
- GitHub
- UE4
categories:
- GitHub
top: 6
---


A realtime dedicated game server.

一个实时的专用游戏服务器.


<!-- ![UE4DemoScreenshot.jpg](/img/a_real_time_game_server_and_a_ue4_demo_for_it/UE4DemoScreenshot_small.jpg) -->


# GitHub

[<i class="fa fa-fw fa-github fa-2x"></i>realtime-server](https://github.com/no5ix/realtime-server) 


<i class="fa fa-fw fa-2x fa-play-circle"></i>**Video Preview 视频演示**

<video preload="auto" autoplay="autoplay" loop="loop" width="100%" controls="controls">
<source src="/img/a_real_time_game_server_and_a_ue4_demo_for_it/ue4_demo_for_rs_1080p.mp4" type="video/mp4" />
</video>

<!-- 
# Download & Play

 
- **Client Side** : 
[<i class="fa fa-download fa-2x fa-fw"></i>UE4ClientDemo.exe (Win32)](https://pan.baidu.com/s/1B0pMYls7JVYqEWyKH4gkXg), just check it out !

- 客户端 : 下载 [UE4ClientDemo.exe (Win32)](https://pan.baidu.com/s/1B0pMYls7JVYqEWyKH4gkXg) 玩一下 !

- **Server** : A server instance is running on my VPS, so just double click the UE4ClientDemo.exe that will connect to my server automatically, enjoy !

- 服务器 : 我VPS上运行着一个服务器实例, 你只需要双击 UE4ClientDemo.exe , 它就会自动连到服务器啦 !
 -->


# About This 

- A [UE4 State Synchronization demo](https://github.com/no5ix/realtime-server-ue4-demo) for it
- 附一个[虚幻4状态同步Demo](https://github.com/no5ix/realtime-server-ue4-demo)

    - No Replication component from UE4, just socket
    - 没有用UE4的网络同步组件, 唯socket而已

    - Unreal Engine Version : 4.16 - 4.19
    - 虚幻引擎版本 : 兼容 4.16 - 4.19

    - A realtime-server example for this ue4 demo.(see [this](https://github.com/no5ix/realtime-server/tree/master/example/for_ue4_demo))
    - 为这个ue4的demo写了一个realtime-server的例子.(看 [这个](https://github.com/no5ix/realtime-server/tree/master/example/for_ue4_demo))
- Win/Linux
- RUDP
- Multi-Thread
- C++11
- Bit Stream
- Add UDP support for muduo


<!-- - 可靠UDP

    - 抗抖动
    - 冗余应答
    - CrossPlatform
        - Linux/Epoll/多线程
        - Win/NIO/单线程
- C++11 
- 增量更新

- 二进制流

    - 大数据块的分包与重组

- 延迟渲染 -->

<!-- 
- (Old) Checkout branch 4.15 for UE4.15 version of the client and the corresponding server

- (老版本的) 切到 4.15 的 Git 分支上查看虚幻引擎4.15版本的客户端以及对应的服务器 
- -->

