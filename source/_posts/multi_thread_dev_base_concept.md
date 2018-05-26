---
title: 多线程开发的一些基本概念
date: 2015-04-27 18:31:26
tags: 
- CPP
- MultiThread
- Linux
categories:
- Linux
---



# 竞态（race condition）

软件层面上，竞态是指多个线程或进程读写一个共享资源 (或共享设备) 时的输出结果依赖于线程或进程的先后执行顺序或者时间；
（ 更权威的介绍可以看 [wiki](https://en.wikipedia.org/wiki/Race_condition) )

至于为什么会发生竞态呢？很简单，因为并发，并发使多线程，多进程环境变成可能。

竞态具体场景：假如我们有 2 个进程会对一个全局变量进行 ++ 操作，理想时，程序会这样执行：

<table><tbody><tr><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 1</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 2</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Integer value</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">2</span></p><br></td></tr></tbody></table>

   然而，由于并发的普遍存在，使得情况有时” 不受控制”（不如工程师预期那样工作），可能会变成这样：

<table><tbody><tr><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 1</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 2</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Integer value</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr></tbody></table>


# 并发（concurrency）

并发 (concurrency) 指的是多个执行单元同时、并行被执行。而并发的执行单元对共享资源 (硬件资源和软件上的全局、静态变量) 的访问则容易导致竞态 (race conditions), 可能导致并发 (即竞态?) 的情况有：

- SMP（Symmetric Multi-Processing），对称多处理结构。SMP 是一种紧耦合、共享存储的系统模型，它的特点是多个 CPU 使用共同的系统总线，因此可访问共同的外设和存储器。

- 中断. 中断可以打断正在执行的进程 (哪怕是在中断上下文)，若中断处理程序对共享资源进程访问，则竞态也会发生.

- 内核抢占.2.6 以后内核提供了内核可抢占特性，虽然是作为一个配置选项，但我们写程序时还是要考虑周全，故内核抢占也是作为伪并发的表现，也可能发生竞态；


# 临界区（critical section）

多个线程进程对共享资源进行访问在软件表现为一个程序片段，如何避免竞态的发生呢？

一个执行路径在对共享资源进行访问时禁止其他执行路径进行访问，当有一个执行路径（A）对共享资源进行访问时，如有其他执行路径想访问共享资源，须睡眠等待 A 执行路径退出。

那么这时这个程序片段就是临界区。那么具体如何来实现临界区呢？linux 内核提供了多种同步互斥机制.（如信号量，互斥量，自旋锁，RCU，原子操作等）.



# 什么是RAII技术

我们在C++中经常使用new申请了内存空间，但是却也经常忘记delete回收申请的空间，容易造成内存溢出，于是RAII技术就诞生了，来解决这样的问题。

RAII（Resource Acquisition Is Initialization）机制是Bjarne Stroustrup首先提出的，是一种利用对象生命周期来控制程序资源（如内存、文件句柄、网络连接、互斥量等等）的简单技术。 我们知道在函数内部的一些成员是放置在栈空间上的，当函数返回时，这些栈上的局部变量就会立即释放空间，于是Bjarne Stroustrup就想到确保能运行资源释放代码的地方就是在这个程序段（栈）中放置的对象的析构函数了，因为stack winding会保证它们的析构函数都会被执行。RAII就利用了栈里面的变量的这一特点。

RAII 的一般做法是这样的：在对象构造时获取资源，接着控制对资源的访问使之在对象的生命周期内始终保持有效，最后在对象析构的时候释放资源。

借此，我们实际上把管理一份资源的责任托管给了一个存放在栈空间上的局部对象。
这种做法有两大好处： 

- (1)不需要显式地释放资源。 
- (2)采用这种方式，对象所需的资源在其生命期内始终保持有效。