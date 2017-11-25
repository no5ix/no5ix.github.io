---
title: 快速完成一个简易slg游戏思路一
date: 2016-07-30 22:19:29
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
top: 3
---




## LoginServer(Gate)

当完成渠道sdk回调验证之后, 

验证完玩家信息, 

用了nginx的负载均衡给每位玩家分配一台不繁忙的游戏服务器, 

> 在redis中存了一份玩家在线有效时间key, 
> 超时则掉线, 
> 
> 这个key也可以用来完成封号操作



## MainServer

> 因为弱交互/短连接的关系, 
> 
> 大多数情况玩家和玩家之间不需要实时面对面PK，
> 
> 打一下对方的离线数据，
> 
> 计算下排行榜，排行榜是实时计算的, 
> 
> 存在redis里, 做了分页处理
> 
> 买卖下道具即可
> 
> 所以 MainServer 选择了:

- yii
- redis
- mysql
- nginx

<!-- more -->

## pvpServeer

而 pvpServer 则选择 workerman 的tcp模式,

实时交互数据, 

MainServer 和 pvpServer之间通信并接同一个数据库.

> 其实这里可以不选择用tcp, 而自撸一个可靠udp来提高效率

{% asset_img slg1.png %}
