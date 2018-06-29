---
title: redis概要之数据类型
date: 2015-07-11 09:29:22
tags:
- Redis
- NoSQL
categories:
- DB
---

# Redis简介要义

- Redis运行在内存中但是可以持久化到磁盘, 重启的时候可以再次加载进行使用

- Redis的所有操作都是原子性的，同时Redis还支持对几个操作全并后的原子性执行

-  Redis支持二进制案例的 Strings, Lists, Hashes, Sets 及 Ordered Sets 数据类型操作

- Redis支持数据的备份，即master-slave模式的数据备份


# Redis数据类型

Redis的数据类型很重要, 这是他做很多事情的基础, 不理解的话很难用好

**. . .**<!-- more -->

## String(字符串)

string是redis最基本的类型，你可以理解成与Memcached一模一样的类型，

一个key对应一个value。

string类型是二进制安全的。

二进制安全的意思是redis的string可以包含任何数据。

比如jpg图片或者序列化的对象 。

string类型是Redis最基本的数据类型，一个键最大能存储512MB。

实例 : 

```
redis 127.0.0.1:6379> SET name "runoob"
OK
redis 127.0.0.1:6379> GET name
"runoob"
```

## Hash（哈希表）

Redis hash 是一个键名对集合。
Redis hash是一个string类型的field和value的映射表，hash特别适合用于存储对象。

实例 : 
```
redis> HSET people jack "Jack Sparrow"
(integer) 1

redis> HSET people gump "Forrest Gump"
(integer) 1

redis> HGETALL people
1) "jack"          # 域
2) "Jack Sparrow"  # 值
3) "gump"
4) "Forrest Gump"
```

```
redis> HMSET pet dog "doudou" cat "nounou"    # 一次设置多个域
OK

redis> HMGET pet dog cat fake_pet             # 返回值的顺序和传入参数的顺序一样
1) "doudou"
2) "nounou"
3) (nil)                                      # 不存在的域返回nil值
```

```
redis> HMSET website google www.google.com yahoo www.yahoo.com
OK

redis> HGET website google
"www.google.com"

redis> HGET website yahoo
"www.yahoo.com"
```

```
redis> HSET website google "www.g.cn"       # 设置一个新域
(integer) 1

redis> HSET website google "www.google.com" # 覆盖一个旧域
(integer) 0
```

```
# 域存在

redis> HSET site redis redis.com
(integer) 1

redis> HGET site redis
"redis.com"


# 域不存在

redis> HGET site mysql
(nil)
```
以上实例中 hash 数据类型存储了包含用户脚本信息的用户对象。
每个 hash 可以存储 232 -1 键值对（40多亿）。

## List（列表）

Redis 列表是简单的字符串列表，按照插入顺序排序。

你可以添加一个元素到列表的头部（左边lpush）或者尾部（右边rpush）。

实例 :
```
redis 127.0.0.1:6379> lpush runoob redis
(integer) 1
redis 127.0.0.1:6379> rpush runoob mongodb
(integer) 2
redis 127.0.0.1:6379> lpush runoob rabitmq
(integer) 3
redis 127.0.0.1:6379> lrange runoob 0 10
1) "rabitmq"
2) "redis"
3) "mongodb"
redis 127.0.0.1:6379>
```

列表最多可存储 232 - 1 元素 (4294967295, 每个列表可存储40多亿)。

## Set（集合）

Redis的Set是string类型的无序集合。

集合是通过哈希表实现的，所以添加，删除，查找的复杂度都是O(1)。

### sadd 命令

添加一个string元素到,key对应的set集合中，成功返回1,

如果元素已经在集合中返回0,key对应的set不存在返回错误。

`sadd key member`

实例 : 
```
redis 127.0.0.1:6379> sadd runoob redis
(integer) 1
redis 127.0.0.1:6379> sadd runoob mongodb
(integer) 1
redis 127.0.0.1:6379> sadd runoob rabitmq
(integer) 1
redis 127.0.0.1:6379> sadd runoob rabitmq
(integer) 0
redis 127.0.0.1:6379> smembers runoob

1) "rabitmq"
2) "mongodb"
3) "redis"
```

注意：以上实例中 rabitmq 添加了两次，

但根据集合内元素的唯一性，第二次插入的元素将被忽略。

集合中最大的成员数为 232 - 1(4294967295, 每个集合可存储40多亿个成员)。

## zset(sorted set：有序集合)
Redis zset 和 set 一样也是string类型元素的集合,且不允许重复的成员。

不同的是每个元素都会关联一个double类型的分数。
redis正是通过分数来为集合中的成员进行从小到大的排序。

zset的成员是唯一的,但分数(score)却可以重复。

### zadd 命令

添加元素到集合，元素在集合中存在则更新对应score
`zadd key score member` 
实例 : 
```
redis 127.0.0.1:6379> zadd runoob 1 redis
(integer) 1
redis 127.0.0.1:6379> zadd runoob 3 mongodb
(integer) 1
redis 127.0.0.1:6379> zadd runoob 4 rabitmq
(integer) 1
redis 127.0.0.1:6379> zadd runoob 7 rabitmq
(integer) 0
redis 127.0.0.1:6379> ZRANGEBYSCORE runoob 0 1000

1) "redis"
2) "mongodb"
3) "rabitmq"
```