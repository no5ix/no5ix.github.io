---
title: 一个轻量级的游戏服务器引擎
date: 2018-05-02 17:56:12
tags:
- GitHub
- UE4
categories:
- GitHub
top: 5
---


一个轻量级的游戏服务器引擎


# GitHub

[<i class="fa fa-fw fa-github fa-2x"></i>realtime-server](https://github.com/no5ix/realtime-server) 

<!-- 

<i class="fa fa-fw fa-2x fa-play-circle"></i>**Video Preview 视频演示**
<video loop="loop" width="100%" controls="controls">
<source src="/img/a_real_time_game_server_and_a_ue4_demo_for_it/ue4_demo_for_rs_720p.mp4" type="video/mp4" />
</video>

-->


# 要点

- 业务层基于ECS框架来做开发, 继承实体基类与组件基类即可
- 基于`etcd`的 服务注册 / TTL / 服务发现 / 负载均衡 / 上报负载 / Watch机制 一体化
- 基于`msgpack`的RPC框架, 支持 ip地址直接call以及配合ECS的remote虚拟实体/组件直接call
- 基于asyncio异步IO的协程业务层支持, 可实现类似 `result = await rpc_call()` 的直接调RPC拿返回的效果
    - 实现了协程池, 封装成了简洁的装饰器便于业务层调用
- 支持TCP与RUDP
- 基于sanic开发的异步HTTP微服务框架供方便开发各类公共服务
    - 基于jwt的auth模块
    - 基于redis的数据落地模块
    - 基于umongo的ODM模块
- 热更新reload模块
    - 全量式, 安全保障
    - 增量式, 速度更快, 方便平时开发
- 支持异步的TimedRotating日志模块
    - 根据日期时间自动滚动切换日志文件
    - 支持协程对象的callback
    - 根据日志level改变颜色, 方便查询
    - 报trace可打印堆栈与`locals`
    - 对于 warning 以上的日志级别直接对Pycharm提供文件跳转支持
- 支持1:N模型的定时器模块, 避免覆盖同一个key的易错点 
    - 可以重复使用一个key, 并不会冲掉之前key的timer, 但是当调用`cancel_timer`的时候, 会一次性全部cancel掉所有
- 制作了增强型json解析器, 支持注释/自动去除逗号/变量宏
- 基于MongoDB的数据落地模块
- client端的模拟与自动化测试配套
- 大厅服务器的前置网关gate服务器, 负责压缩/解压, 加密/解密数据以及鉴权


# 架构图

本架构图根据 PlantUML 自动生成

![](https://raw.githubusercontent.com/no5ix/realtime-server/dev/img/img_1.png)

