---
title: 从零开始搭建一台简易Ubuntu服务器一
date: 2013-08-23 15:11:26
tags:
- VBox
categories:
- Miscellaneous
---

# virtualBox网络设置

在virtualBox的你的那个虚拟机里的网络设置里添加两张网卡：
1.“网络地址转换（NAT）”， 不是那个“NAT网络”噢， 这张网卡是用来访问宿主机和外网的， 但是仅仅有这张网卡宿主机是不能访问你的这个虚拟机的， 所以还需要下面这第2张
2.“仅主机（Host-Olny）网络”， 这张网卡是用来让宿主机是访问你的这个虚拟机的， 这样就能用ssh工具从宿主机连到你的这个虚拟机了




# 创建dev用户

sudo adduser dev




# 增加dev权限

sudo visudo 添加：dev ALL=(ALL:ALL) ALL

**. . .**<!-- more -->


关于Ubuntu的root密码
------
Ubuntu的默认root密码是随机的，
即每次开机都有一个新的root密码。我们可以在终端输入命令 sudo passwd，
然后输入当前用户的密码，enter，终端会提示我们输入新的密码并确认，
此时的密码就是root新密码。修改成功后，输入命令 su root，再输入新的密码就ok了。




# 安装ssh服务端

先更换源， 然后执行sudo apt-get update
执行命令：sudo apt-get install openssh-server
测试是否安装成功：ssh localhost



