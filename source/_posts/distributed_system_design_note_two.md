---
title: 分布式系统设计概要笔记-二
date: 2015-01-05 23:28:22
tags:
- 分布式
categories:
- Server
---


# 分布式系统特性

CAP是分布式系统里最著名的理论，wiki百科如下

- Consistency(all nodes see the same data at the same time)
- Availability (a guarantee that every request receives a response about whether it was successful or failed)
- Partition tolerance (the system continues to operate despite arbitrary message loss or failure of part of the system)
                (摘自 ：http://en.wikipedia.org/wiki/CAP_theorem)

**. . .**<!-- more -->

早些时候，国外的大牛已经证明了CAP三者是不能兼得，很多实践也证明了。


本人就不挑战权威了，感兴趣的同学可以自己Google。

本人以自己的观点总结了一下：

## 一致性

可以参考[陈皓的博文<<分布式事务处理>>](https://coolshell.cn/articles/10910.html)

描述当前所有节点存储数据的统一模型，分为强一致性和弱一致性：
强一致性描述了所有节点的数据高度一致，无论从哪个节点读取，都是一样的。

无需担心同一时刻会获得不同的数据。

是级别最高的，实现的代价比较高
如图：

{% asset_img distribution21.png %}

弱一致性又分为单调一致性和最终一致性：

- 1、单调一致性强调数据是按照时间的新旧，单调向最新的数据靠近，不会回退，如：
   数据存在三个版本v1->v2->v3，获取只能向v3靠近(如取到的是v2，就不可能再次获得v1)
- 2、最终一致性强调数据经过一个时间窗口之后，只要多尝试几次，最终的状态是一致的，是最新的数据
    如图：

{% asset_img distribution22.png %}

**强一致性**的场景，就好像交易系统，存取钱的+/-操作必须是马上一致的，否则会令很多人误解。


**弱一致性**的场景，大部分就像web互联网的模式，比如发了一条微博，改了某些配置，可能不会马上生效，但刷新几次后就可以看到了，其实弱一致性就是在系统上通过业务可接受的方式换取了一些系统的低复杂度和可用性。




## 可用性

保证系统的正常可运行性，在请求方看来，只要发送了一个请求，就可以得到恢复无论成功还是失败（不会超时）!


## 分区容忍性

在系统某些节点或网络有异常的情况下，系统依旧可以继续服务。


这通常是有负载均衡和副本来支撑的。

例如计算模块异常可通过负载均衡引流到其他平行节点，存储模块通过其他几点上的副本来对外提供服务。



## 扩展性

扩展性是融合在CAP里面的特性，我觉得此处可以单独讲一下。

扩展性直接影响了分布式系统的好坏，系统开发初期不可能把系统的容量、峰值都考虑到，后期肯定牵扯到扩容，而如何做到快而不太影响业务的扩容策略，也是需要考虑的。

(后面在介绍数据分布时会着重讨论这个问题)