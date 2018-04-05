---
title: NAT穿越基础
date: 2016-06-21 12:51:46
tags:
- NAT
categories:
- Misc
---



1. [NAT类型](#NAT类型)
    1. [_锥NAT_](#锥NAT)
    2. [_对称NAT_](#对称NAT)
2. [NAT作用](#NAT作用)
3. [穿透锥NAT](#穿透锥NAT)
    1. [_网络拓扑结构_](#网络拓扑结构)
    2. [_使用UDP穿透NAT_](#使用UDP穿透NAT)
    3. [_使用TCP穿透NAT_](#使用TCP穿透NAT)
4. [穿透对称NAT](#穿透对称NAT)
    1. [_同时开放TCP（ Simultaneous TCP open ）策略_](#同时开放TCP（ Simultaneous TCP open ）策略)
    2. [_UDP端口猜测策略_](#UDP端口猜测策略)
5. [问题总结](#问题总结)
6. [参考](#参考)

# NAT类型

**注** : 我们本文主要讨论穿越**锥NAT**

##  _锥NAT_ 

- 全锥NAT ：全锥NAT 把所有来自相同内部IP 地址和端口的请求映射到相同的外部IP 地址和端口。任何一个外部主机均可通过该映射发送数据包到该内部主机。
- 限制性锥NAT ：限制性锥NAT 把所有来自相同内部IP 地址和端口的请求映射到相同的外部IP 地址和端口。但是, 和全锥NAT 不同的是：只有当内部主机先给外部主机发送数据包, 该外部主机才能向该内部主机发送数据包。
- 端口限制性锥NAT ：端口限制性锥NAT 与限制性锥NAT 类似, 只是多了端口号的限制, 即只有内部主机先向外部地址：端口号对发送数据包, 该外部主机才能使用特定的端口号向内部主机发送数据包。

##  _对称NAT_

对称NAT 与上述3 种类型都不同, 不管是全锥NAT ，限制性锥NAT 还是端口限制性锥NAT ，它们都属于锥NAT （Cone NAT ）。当同一内部主机使用相同的端口与不同地址的外部主机进行通信时, 对称NAT 会重新建立一个Session ，为这个Session 分配不同的端口号，或许还会改变IP 地址。


**. . .**<!-- more -->

# NAT作用

NAT 不仅实现地址转换，同时还起到防火墙的作用，隐藏内部网络的拓扑结构，保护内部主机。

NAT 不仅完美地解决了 lP 地址不足的问题，而且还能够有效地避免来自网络外部的攻击，隐藏并保护网络内部的计算机。

这样对于外部主机来说，内部主机是不可见的。

但是，对于P2P 应用来说，却要求能够建立端到端的连接，所以如何穿透NAT 也是P2P 技术中的一个关键。

# 穿透锥NAT

要让处于NAT 设备之后的拥有私有IP 地址的主机之间建立P2P 连接，就必须想办法穿
透NAT ，现在常用的传输层协议主要有TCP 和UDP ，下面就是用这两种协议来介绍穿透NAT 的策略。

##  _网络拓扑结构_

下面假设有如图1 所示网络拓扑结构图。

{% asset_img nat1.jpg 图1.网络拓扑结构图 %}

Server （129.208.12.38 ）是公网上的服务器，NAT-A 和NAT-B 是两个NAT 设备（可能是集成NAT 功能的路由器，防火墙等），它们具有若干个合法公网IP ，在NAT-A 阻隔的私有网络中有若干台主机【ClientA-1 ，ClientA-N 】，在NAT-B 阻隔的私有网络中也有若干台主机【ClientB-1 ，ClientB-N 】。

为了以后说明问题方便，只讨论主机ClientA-1 和ClientB-1 。

假设主机ClientA-1 和主机ClientB-1 都和服务器Server 建立了“连接”，如图2 所示。

{% asset_img nat2.jpg 图2.ClientA-1 ，ClientB-1 和Server 之间通信 %}

由于NAT 的透明性，所以ClientA-1 和ClientB-1 不用关心和Server 通信的过程，它们只需要知道Server 开放服务的地址和端口号即可。

根据图1 ，假设在ClientA-1 中有进程使用socket （192.168.0.2 ：7000 ）和Server 通信，在ClientB-1 中有进程使用socket （192.168.1.12:8000 ）和Server 通信。

它们通过各自的NAT 转换后分别变成了socket （202.103.142.29 ：5000 ）和socket （221.10.145.84 ：6000 ）。


##  _使用UDP穿透NAT_

通常情况下，当进程使用UDP 和外部主机通信时，NAT 会建立一个Session ，这个Session 能够保留多久并没有标准，或许几秒，几分钟，几个小时。

假设ClientA-1 在应用程序中看到了ClientB-1 在线，并且想和ClientB-1 通信，一种办法是Server 作为中间人，负责转发ClientA-1 和ClientB-1 之间的消息，但是这样服务器太累，会吃不消。

另一种方法就是让ClientA-1 何ClientB-1 建立端到端的连接，然后他们自己通信。

这也就是P2P 连接。

根据不同类型的NAT ，下面分别讲解。


- 全锥NAT ，穿透全锥型NAT 很容易，根本称不上穿透，因为全锥型NAT 将内部主机的映射到确定的地址，不会阻止从外部发送的连接请求，所以可以不用任何辅助手段就可以建立连接。


- 限制性锥NAT 和端口限制性锥NAT （简称限制性NAT ），穿透限制性锥NAT 会丢弃它未知的源地址发向内部主机的数据包。

所以如果现在ClientA-1 直接发送UDP 数据包到ClientB-1 ，那么数据包将会被NAT-B 无情的丢弃。

所以采用下面的方法来建立ClientA-1 和ClientB-1 之间的通信。

1. ClientA-1 （202.103.142.29:5000 ）发送数据包给Server ，请求和ClientB-1 （221.10.145.84:6000 ）通信。
2. Server 将ClientA-1 的地址和端口（202.103.142.29:5000 ）发送给ClientB-1 ，告诉ClientB-1 ，ClientA-1 想和它通信。
3. ClientB-1 向ClientA-1 （202.103.142.29:5000 ）发送UDP 数据包，当然这个包在到达NAT-A 的时候，还是会被丢弃，这并不是关键的，因为发送这个UDP 包只是为了让NAT-B 记住这次通信的目的地址：端口号，当下次以这个地址和端口为源的数据到达的时候就不会被NAT-B 丢弃，这样就在NAT-B 上打了一个从ClientB-1 到ClientA-1 的孔。
4. 为了让ClientA-1 知道什么时候才可以向ClientB-1 发送数据，所以ClientB-1 在向ClientA-1 （202.103.142.29:5000 ）打孔之后还要向Server 发送一个消息，告诉Server 它已经准备好了。
5. Server 发送一个消息给ClientA-1 ，内容为：ClientB-1 已经准备好了，你可以向ClientB-1 发送消息了。
6. ClientA-1 向ClientB-1 发送UDP 数据包。

这个数据包不会被NAT-B 丢弃，以后ClientB-1 向ClientA-1 发送的数据包也不会被ClientA-1 丢弃，因为NAT-A 已经知道是ClientA-1 首先发起的通信。

至此，ClientA-1 和ClientB-1 就可以进行通信了。


##  _使用TCP穿透NAT_

使用TCP 协议穿透NAT 的方式和使用UDP 协议穿透NAT 的方式几乎一样，没有什么本质上的区别，只是将无连接的UDP 变成了面向连接的TCP 。

值得注意是：

1. ClientB-1 在向ClientA-1 打孔时，发送的SYN 数据包，而且同样会被NAT-A 丢弃。同时，ClientB-1 需要在原来的socket 上监听，由于重用socket ，所以需要将socket 属性设置为SO_REUSEADDR 。
2. ClientA-1 向ClientB-1 发送连接请求。同样，由于ClientB-1 到ClientA-1 方向的孔已经打好，所以连接会成功，经过3 次握手后，ClientA-1 到ClientB-1 之间的连接就建立起来了。

# 穿透对称NAT

上面讨论的都是怎样穿透锥（Cone ）NAT ，对称NAT 和锥NAT 很不一样。

对于 对称NAT ，当一个私网内主机和外部多个不同主机通信时，对称NAT 并不会像锥（Cone ，全锥，限制性锥，端口限制性锥）NAT 那样分配同一个端口。

而是会新建立一个Session ，重新分配一个端口。

参考上面穿透限制性锥NAT 的过程，在步骤3 时：ClientB-1 （221.10.145.84: ？）向ClientA-1 打孔的时候，对称NAT 将给ClientB-1 重新分配一个端口号，而这个端口号对于Server 、ClientB-1 、ClientA-1 来说都是未知的。

同样， ClientA-1 根本不会收到这个消息，同时在步骤4 ，ClientB-1 发送给Server 的通知消息中，ClientB-1 的socket 依旧是（221.10.145.84:6000 ）。

而且，在步骤6 时：ClientA-1 向它所知道但错误的ClientB-1 发送数据包时，NAT-1 也会重新给ClientA-1 分配端口号。

所以，穿透对称NAT 的机会很小。

下面是两种有可能穿透对称NAT 的策略。


##  _同时开放TCP（ Simultaneous TCP open ）策略_
如果一个 对称 NAT 接收到一个来自 本地 私有网 络 外面的 TCP SYN 包， 这 个包想 发 起一个 “ 引入” 的 TCP 连 接，一般来 说 ， NAT 会拒 绝这 个 连 接 请 求并扔掉 这 个 SYN 包，或者回送一个TCP RST （connection reset ，重建 连 接）包 给请 求方。

但是，有一 种 情况 却会接受这个“引入”连接。


RFC 规定：对于对称NAT ， 当 这 个接收到的 SYN 包中的源IP 地址 ： 端口、目 标 IP 地址 ： 端口都与NAT 登 记 的一个已 经 激活的 TCP 会 话 中的地址信息相符 时 ， NAT 将会放行 这 个 SYN 包。

需要 特 别 指出 的是：怎样才是一个已经激活的TCP 连接？除了真正已经建立完成的TCP 连接外，RFC 规范指出： 如果 NAT 恰好看到一个 刚刚发 送出去的一个 SYN 包和 随之 接收到的SYN 包中的地址 ：端口 信息相符合的 话 ，那 么 NAT 将会 认为这 个 TCP 连 接已 经 被激活，并将允 许这 个方向的 SYN 包 进 入 NAT 内部。

同时开放TCP 策略就是利用这个时机来建立连接的。


如果 Client A -1 和 Client B -1 能 够 彼此正确的 预 知 对 方的 NAT 将会 给 下一个 TCP 连 接分配的公网 TCP 端口，并且两个客 户 端能 够 同 时 地 发 起一 个面向对方的 “ 外出 ” 的 TCP 连 接 请求 ，并在 对 方的 SYN 包到达之前，自己 刚发 送出去的 SYN 包都能 顺 利的穿 过 自己的 NAT 的 话 ，一条端 对 端的 TCP 连 接就 能 成功地建立了 。


##  _UDP端口猜测策略_
同时开放TCP 策略非常依赖于猜测对方的下一个端口，而且强烈依赖于发送连接请求的时机，而且还有网络的不确定性，所以能够建立的机会很小，即使Server 充当同步时钟的角色。

下面是一种通过UDP 穿透的方法，由于UDP 不需要建立连接，所以也就不需要考虑“同时开放”的问题。


为了介绍ClientB-1 的诡计，先介绍一下STUN 协议。

STUN （Simple Traversal of UDP Through NATs ）协议是一个轻量级协议，用来探测被NAT 映射后的地址：端口。

STUN 采用C/S 结构，需要探测自己被NAT 转换后的地址：端口的Client 向Server 发送请求，Server 返回Client 转换后的地址：端口。


参考4.2 节中穿透NAT 的步骤2 ，当ClientB-1 收到Server 发送给它的消息后，ClientB-1 即打开3 个socket 。

socket-0 向STUN Server 发送请求，收到回复后，假设得知它被转换后的地址：端口（ 221.10.145.84:600 5 ），socket-1 向ClientA-1 发送一个UDP 包，socket-2 再次向另一个STUN Server 发送请求，假设得到它被转换后的地址：端口（ 221.10.145.84:60 20 ）。

通常，对称NAT 分配端口有两种策略，一种是按顺序增加，一种是随机分配。

如果这里对称NAT 使用顺序增加策略，那么，ClientB-1 将两次收到的地址：端口发送给Server 后，Server 就可以通知ClientA-1 在这个端口范围内猜测刚才ClientB-1 发送给它的socket-1 中被NAT 映射后的地址：端口，ClientA-1 很有可能在孔有效期内成功猜测到端口号，从而和ClientB-1 成功通信。


# 问题总结

从上面两种穿透对称NAT 的方法来看，都建立在了严格的假设条件下。

但是现实中多数的NAT 都是锥NAT ，因为资源毕竟很重要，反观对称NAT ，由于太不节约端口号所以相对来说成本较高。

所以，不管是穿透锥NAT ，还是对称NAT ，现实中都是可以办到的。

除非对称NAT 真的使用随机算法来分配可用的端口。



# 参考

[这篇博客](http://blog.csdn.net/leisure512/article/details/4900191 "P2P，UDP和TCP穿透NAT")