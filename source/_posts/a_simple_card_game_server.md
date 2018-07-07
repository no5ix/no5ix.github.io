---
title: 一个简单的卡牌游戏服务器框架
date: 2017-08-27 23:08:56
tags:
- GitHub
- MySQL
- CPP
categories:
- GitHub
---

先上菜 : [<i class="fa fa-fw fa-github fa-2x"></i>GitHub](https://github.com/no5ix/JoyServer)

# 框架简介


一个简单的游戏服务器框架



# 框架概要

采用C++开发，
主要处理游戏客户端和游戏数据库的数据交换。
通信采用socket发送协议包的方式，服务器根据协议包命令码去做相应的逻辑处理，并将处理结果
返回给游戏客户端，即完成了前后端的数据交换。

<!-- 依赖 : 

- boost库
- MySQL数据库
- google-glog日志记录框架
- curl库

> sudo apt-get install g++ make libboost-all-dev libmysqlclient-dev libgoogle-glog-dev libcurl4-gnutls-dev
-->

**. . .**<!-- more -->

# 框架处理流程：


客户端连接→

服务器分配线程池中的线程处理→

线程将协议数据递交给Worker → 

Worker调用统一协议处理逻辑Process开始处理→ 

Process对协议命令码分类，并将协议包内容递交给相应的业务类→

业务类处理完成后调用统一处理逻辑Process处理完成→ 

Worker将返回数据递交给线程并返回给客户端



# 协议处理流程：


客户端初次连接服务器，发送心跳→

服务器返回连接成功状态→

客户端发起本次协议→

业务类处理数据库操作并将数据返回给客户端


<!--

# 他日将改进之处


- 降低模块间耦合度
- 新业务协议的添加略显繁琐, business模块可以遵循开闭原则来适当重构
- 编写维护工具
- 数据传输协议待优化
- 编写测试工具
- 
-->