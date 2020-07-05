---
title: 逻辑CPU与核心备忘
date: 2020-07-06 00:27:26
tags:
- CPU
categories:
- NP
---


**. . .**<!-- more -->


cpu、core、processor、thread 等概念，有的是物理的有的是逻辑的，在不同语境中含义不尽相同。

*   “电脑有几个 cpu ?”
*   “多线程程序设置多少个线程数效果好？”
*   “linux cpuinfo / top 里展示的 cpu 的信息如何理解？”

# 物理 cpu 数（physical cpu）

指主板上实际插入的 cpu 硬件个数（socket）。（但是这一概念经常被泛泛的说成是 cpu 数，这很容易导致与 core 数，processor 数等概念混淆，所以此处强调是物理 cpu 数）。

由于在主板上引入多个 cpu 插槽需要更复杂的硬件支持（连接不同插槽的 cpu 到内存和其他资源），通常只会在服务器上才这样做。在家用电脑中，一般主板上只会有一个 cpu 插槽。

# 核心（core）

一开始，每个物理 cpu 上只有一个核心（a single core），对操作系统而言，也就是同一时刻只能运行一个进程 / 线程。 为了提高性能，cpu 厂商开始在单个物理 cpu 上增加核心（实实在在的硬件存在），也就出现了双核心 cpu（dual-core cpu）以及多核心 cpu（multiple cores），这样一个双核心 cpu 就是同一时刻能够运行两个进程 / 线程的。

# 同时多线程与超线程

> 同时多线程技术（simultaneous multithreading）和 超线程技术（hyper–threading/HT）

本质一样，是为了提高单个 core 同一时刻能够执行的多线程数的技术（充分利用单个 core 的计算能力，尽量让其 “一刻也不得闲”）。

simultaneous multithreading 缩写是 SMT，AMD 和其他 cpu 厂商的称呼。 hyper–threading 是 Intel 的称呼，可以认为 hyper–threading 是 SMT 的一种具体技术实现。

在类似技术下，产生了如下等价术语：

*   虚拟 core： virtual core
*   逻辑 processer： logical processor
*   线程：thread

所以可以这样说：某款采用 SMT 技术的 4 核心 AMD cpu 提供了 8 线程同时执行的能力；某款采用 HT 技术的 2 核心 Intel cpu 提供了 4 线程同时执行的能力。

# 查看 cpu 信息的方法与命令

## linux 系统

`lscpu` 命令可以同时看到各种信息。比如：

```
...
CPU(s):                24
On-line CPU(s) list:   0-23
Thread(s) per core:    2
Core(s) per socket:    6
Socket(s):             2
...
```


查看物理 cpu 数：

> `cat /proc/cpuinfo| grep "physical id"| sort| uniq| wc -l`  

查看每个物理 cpu 中 核心数 (core 数)：

> `cat /proc/cpuinfo | grep "cpu cores" | uniq`  

查看总的逻辑 cpu 数（processor 数）：

> `cat /proc/cpuinfo| grep "processor"| wc -l`  

查看 cpu 型号：

> `cat /proc/cpuinfo | grep name | cut -f2 -d: | uniq -c`  

判断 cpu 是否 64 位：

> 检查 cpuinfo 中的 flags 区段，看是否有 lm （long mode） 标识  


## window 系统

任务管理器-性能-CPU:
- Sockets
- Cores
- Logical processors


## x86 与 x86_64 (摘自 维基百科)

## x86

泛指一系列基于 Intel 8086 且向后兼容的中央处理器指令集架构。

x86 的 32 位架构一般又被称作 IA-32，全名为 “Intel Architecture, 32-bit”。

值得注意的是，Intel 也推出过 IA-64 架构，虽然名字上与 “IA-32” 相似，但两者完全不兼容，并不属于 x86 指令集架构家族。

## x86-64

又称 x64，即英文词 64-bit extended，64 位拓展 的简写，是 x86 架构的 64 位拓展，向后兼容于 16 位及 32 位的 x86 架构。

不同厂商有不同的称呼：

*   x64 于 1999 年由 AMD 设计，AMD 首次公开 64 位集以扩展给 x86，称为 “AMD64”
*   其后也为 Intel 所采用，Intel 称为 “Intel 64”
*   苹果公司和 RPM 包管理员称为 “x86-64” 或 “x86_64”
*   甲骨文公司及 Microsoft 称为 “x64”
*   BSD 家族及其他 Linux 发行版则使用 “amd64”，32 位版本则称为 “i386”（或 i486/586/686）
*   Arch Linux 成为 x86_64

## 多线程程序线程数

为了让我们的多线程程序更好的利用 cpu 资源，我们通常会先了解机器拥有的 processor 数，有若干手段可以获取这一信息：

*   cpuinfo 中查看：比如上文中的 `cat /proc/cpuinfo | grep "processor" | wc -l`
*   top 命令查看：cpu0,cpu1,...
*   编程：比如在 Java 中用 `Runtime.getRuntime().availableProcessors()`

具体在多线程程序中设置线程数多大，对计算密集型的程序有的建议是 processor count + 1，有的建议是 processor count 的 1.5 倍，都是经验值，实测为准。

# 小结

*   一台完整的计算机可能包含一到多个物理 cpu
*   从单个物理 cpu （physical cpu）的角度看，其可能是单核心、双核心甚至多核心的
*   从单个核心（core）的角度看，还有 SMT / HT 等技术让每个 core 对计算机操作系统而言用起来像多个物理 core 差不多

总的逻辑 cpu 数 = 物理 cpu 数 * 每颗物理 cpu 的核心数 * 每个核心的超线程数


# 线程

*   [cpu-basics-multiple-cpus-cores-and-hyper-threading-explained](https://link.zhihu.com/?target=https%3A//www.howtogeek.com/194756/cpu-basics-multiple-cpus-cores-and-hyper-threading-explained/)
*   [Simultaneous multithreading](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Simultaneous_multithreading)
*   [Hyper-threading](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Hyper-threading)
*   [Linux 查看物理 CPU 个数、核数、逻辑 CPU 个数](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/bugutian/p/6138880.html)
*   [x86](https://link.zhihu.com/?target=https%3A//zh.wikipedia.org/wiki/X86)
*   [x86-64](https://link.zhihu.com/?target=https%3A//zh.wikipedia.org/wiki/X86-64)
