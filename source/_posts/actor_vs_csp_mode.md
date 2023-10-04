---
title: Actor模型 vs. CSP模型
date: 2021-07-21 02:53:55
tags:
- Misc
categories:
- Misc
---


Akka/Erlang 的 actor 模型与 Go 语言的协程 Goroutine 与通道 Channel 代表的 CSP(Communicating Sequential Processes) 模型有什么区别呢？

首先这两者都是并发模型的解决方案，我们看看 Actor 和 Channel 这两个方案的不同：


# Actor 模型

在 Actor 模型中，主角是 Actor，类似一种 worker，Actor 彼此之间直接发送消息，不需要经过什么中介，消息是异步发送和处理的：

![](/img/actor_vs_csp_mode/actors_mode.png)

Actor 模型描述了一组为了避免并发编程的常见问题的公理:

1. 所有 Actor 状态是 Actor 本地的，外部无法访问。  
2. Actor 必须只有通过消息传递进行通信。　　  
3. 一个 Actor 可以响应消息: 推出新 Actor, 改变其内部状态, 或将消息发送到一个或多个其他参与者。  
4. Actor 可能会堵塞自己, 但 Actor 不应该堵塞它运行的线程。

更多可见 [Actor 模型专题](http://www.jdon.com/actors.html)


**. . .**<!-- more -->


# Channel 模型

　　Channel 模型中，worker 之间不直接彼此联系，而是通过不同 channel 进行消息发布和侦听。消息的发送者和接收者之间通过 Channel 松耦合，发送者不知道自己消息被哪个接收者消费了，接收者也不知道是哪个发送者发送的消息。

![](/img/actor_vs_csp_mode/channel.png)

Go 语言的 CSP 模型是由协程 Goroutine 与通道 Channel 实现：

* Go 协程 goroutine: 是一种轻量线程，它不是操作系统的线程，而是将一个操作系统线程分段使用，通过调度器实现协作式调度。是一种绿色线程，微线程，它与 Coroutine 协程也有区别，能够在发现堵塞后启动新的微线程。
* 通道 channel: 类似 Unix 的 Pipe，用于协程之间通讯和同步。协程之间虽然解耦，但是它们和 Channel 有着耦合。


# Actor 模型和 CSP 区别

Actor 模型和 CSP 区别图如下：

![](/img/actor_vs_csp_mode/csp.png)

Actor 之间直接通讯，而 CSP 是通过 Channel 通讯，在耦合度上两者是有区别的，后者更加松耦合。

　　同时，它们都是描述独立的流程通过消息传递进行通信。主要的区别在于：在 CSP 消息交换是同步的 (即两个流程的执行 "接触点" 的，在此他们交换消息)，而 Actor 模型是完全解耦的，可以在任意的时间将消息发送给任何未经证实的接受者。由于 Actor 享有更大的相互独立, 因为他可以根据自己的状态选择处理哪个传入消息。自主性更大些。

　　在 Go 语言中为了不堵塞流程，程序员必须检查不同的传入消息，以便预见确保正确的顺序。CSP 好处是 Channel 不需要缓冲消息，而 Actor 理论上需要一个无限大小的邮箱作为消息缓冲。

