---
title: 快速完成一个简易slg游戏思路二
date: 2016-07-30 22:57:29
tags:
- php
- yii
- redis
- mysql
- nginx
- tcp
- http
- udp
- workerman
- capistrano
- ruby
categories:
- server
top: 2
---



## ChatServer



从登录成功就开始连接, 

注册一个Chat_ID, 

player_ID 和 Chat_ID相互对应, 

会注册相应的房间频道, 

并为每位Player存了一份黑名单, 

在客户端做了本地黑名单, 

聊天服务器也做了黑名单二次验证处理.

- 世界频道 : 则用MsgServer的非实时推送思路

- 私密聊天 : 则选择 workerman 的tcp, 




## MsgServer

- 实时推送 : workerman 的tcp
- 非实时推送 : 客户端定时15秒轮询一下服务器，如果有消息就取下来，如果没消息可以逐步放长轮询时间，比如30秒；如果有消息，就缩短轮询时间到10秒，5秒，

<!-- more -->

## deployTool

Capistrano是一个开源的部署工具, 用ruby来写, 语法超简洁的

## 优点

- 实时则走 workerman 
- 非实时则跑 yii

访问一下，请求一下关卡数据，玩完了又提交一下，

验算一下是否合法，获得什么奖励，

数据库用单台 MySQL或者 MongoDB即可，后端的 Redis做缓存

此类服务器用来实现一款三国类策略或者卡牌及酷跑的游戏已经绰绰有余，

这类游戏因为逻辑简单，玩家之间交互不强，

使用HTTP来开发的话，开发速度快，调试只需要一个浏览器就可以把逻辑调试清楚了