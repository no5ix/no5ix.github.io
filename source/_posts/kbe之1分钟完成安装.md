---
title: kbe之1分钟完成安装
date: 2017-02-09 12:38:21
tags:
- kbe
categories:
- server
---

> 官方是有自动化的安装py脚本的, 不过还是有很多小坑的.
不过其实脚本主要也就是只做两件事, 其他都是可选的: 

> - 配置环境变量
> - 安装mysql


<!-- more -->

## **安装步骤**
> 安装kbe之前请提前在mysql里
> 
> - 建一个数据库(比如建一个数据库kbe_database)
> - 一个至少拥有select,insert,update,delete,create,drop权限的用户(比如这个用户是kbe_user)
> 
> (*具体详情请谷歌, 本篇文章是讲kbe的安装的, 不讨论mysql, 弄完mysql之后就可以开始下面的1分钟kbe安装教程啦*)

- 找到你的kbe根目录, 然后进入根目录, 比如你的kbe根目录是kbengine, 则 : 
	 1. cd kbengine
	 2. sudo python kbengine/kbe/tools/server/install/installer.py install
- 然后它就会问你 : 
 ` Install KBEngine to Linux-account(No input is kbe): `
	 为了简单起见, 建议直接填写你当前的linux用户名称, 比如我的是"b"
- 然后就是开始配置环境变量了, 它就会显示

```
Check the dependences:
- kbe_environment: checking...
ERROR: KBE_ROOT: is error! The directory or file not found:
KBE_ROOT//kbe
KBE_ROOT=

KBE_ROOT current: 
reset KBE_ROOT(No input is [/home/b/kbengine-0.9.18/]):
```
直接敲回车

- 他之后显示的都直接敲回车, 用默认的就可以, 直到他开始问你mysql的东西, 到mysql他会问

```
- mysql: checking...
- MySQL is installed on the remote machine?[yes/no]
```
这里我们直接填yes, 然后就直接填我们之前建立好的数据库kbe_database和用户kbe_user即可, 它会显示 : 

```
- Enter mysql ip-address:127.0.0.1
- Enter mysql ip-port:3306
- Enter mysql-account:kbe_user
- Enter mysql-password:123456
- Enter mysql-databaseName:kbe_database
- mysql: yes
Modified: /home/b/kbengine-0.9.18//kbe/res/server/kbengine_defs.xml
KBEngine has been successfully installed!

```

## **是否安装成功**

- 找到你的kbe根目录, 然后进入根目录, 比如你的kbe根目录是kbengine, 则
	  1. 进入kbe根目录下的assets目录 : cd kbengine/assets
	  2. 运行启动脚本 : sh ./start_server.sh 
- 用ps检查一下是否有以下进程再跑 : 
 
```
b@b-VirtualBox:~/kbengine-0.9.18/assets$ ps -ef | grep -v grep | grep -i kbe
b        15504  1372  0 04:28 pts/1    00:00:01 /home/b/kbengine-0.9.18/kbe/bin/server//machine --cid=2129652375332859700 --gus=1
b        15505  1372  0 04:28 pts/1    00:00:05 /home/b/kbengine-0.9.18/kbe/bin/server//logger --cid=1129653375331859700 --gus=2
b        15506  1372  0 04:28 pts/1    00:00:02 /home/b/kbengine-0.9.18/kbe/bin/server//interfaces --cid=1129652375332859700 --gus=3
b        15507  1372  0 04:28 pts/1    00:00:06 /home/b/kbengine-0.9.18/kbe/bin/server//dbmgr --cid=3129652375332859700 --gus=4
b        15508  1372  0 04:28 pts/1    00:00:07 /home/b/kbengine-0.9.18/kbe/bin/server//baseappmgr --cid=4129652375332859700 --gus=5
b        15509  1372  0 04:28 pts/1    00:00:07 /home/b/kbengine-0.9.18/kbe/bin/server//cellappmgr --cid=5129652375332859700 --gus=6
b        15510  1372  0 04:28 pts/1    00:00:03 /home/b/kbengine-0.9.18/kbe/bin/server//baseapp --cid=6129652375332859700 --gus=7
b        15511  1372  0 04:28 pts/1    00:00:03 /home/b/kbengine-0.9.18/kbe/bin/server//cellapp --cid=7129652375332859700 --gus=8
b        15512  1372  0 04:28 pts/1    00:00:06 /home/b/kbengine-0.9.18/kbe/bin/server//loginapp --cid=8129652375332859700 --gus=9

```

- 检查我们mysql中的kbe_database数据库里是否多了几个表 : 
 

```
mysql> show tables;
+---------------------------+
| Tables_in_b_test_database |
+---------------------------+
| kbe_accountinfos          |
| kbe_email_verification    |
| kbe_entitylog             |
| kbe_serverlog             |
| tbl_Account               |
+---------------------------+
5 rows in set (0.00 sec)

```
好, 如果都有基本安装完成!
