---
title: 从零开始搭建一台简易Ubuntu服务器一
date: 2013-08-23 15:11:26
tags:
- VBox
categories:
- Linux
---



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



