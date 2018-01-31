---
title: MongoDB能取代MySQL或者Redis能取代memcached么
date: 2016-06-30 00:22:58
tags:
- MongoDB
- Redis
- MySQL
- Memcached
categories:
- DB
---



> mongodb和memcached不是一个范畴内的东西。
> 
> mongodb是文档型的非关系型数据库，其优势在于查询功能比较强大，能存储海量数据。
> 
> mongodb和memcached不存在谁替换谁的问题。和memcached更为接近的是redis。
> 
> 它们都是内存型数据库，数据保存在内存中，通过tcp直接存取，优势是速度快，并发高，缺点是数据> 类型有限，查询功能不强，一般用作缓存。
> 
> 一般现在的项目中，用redis来替代memcached。

**. . .**<!-- more -->

Redis相比memcached：

- redis具有持久化机制，可以定期将内存中的数据持久化到硬盘上。
- redis具备binlog功能，可以将所有操作写入日志，当redis出现故障，可依照binlog进行数据恢复。
- redis支持virtual memory，可以限定内存使用大小，当数据超过阈值，则通过类似LRU的算法把内存中的最不常用数据保存到硬盘的页面文件中。
- redis原生支持的数据类型更多，使用的想象空间更大。



> mongodb 是文档数据库，用于方便懒人替代mysql等关系数据库的。
> 不过mongodb在内存足够的情况下读写性能不错，大部分应用可以省去cache这一层了。

> 根据业务场景, 懒人可以使用MongoDB来取代MySQL+memcached,.