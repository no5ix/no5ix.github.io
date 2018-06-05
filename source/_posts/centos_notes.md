---
title: CentOS备忘
date: 2018-02-01 09:38:55
tags:
- CentOS
categories:
- Linux
---

# 查询系统相关信息

    $ cat /etc/centos-release
    CentOS release 6.7 (Final)

    [root@host ~]# uname -i
    i386

# 安装gcc4.8

centos 6 的gcc版本太低才4.4.7, 要安装高版本的4.8才完全支持c++11

**. . .**<!-- more -->

## 卸载gcc

先卸载当前gcc

    sudo yum remove --skip-broken gcc

## 安装步骤

安装 devtoolset-2 工具链

    wget http://people.centos.org/tru/devtools-2/devtools-2.repo -O /etc/yum.repos.d/devtools-2.repo
    yum install devtoolset-2-gcc devtoolset-2-binutils devtoolset-2-gcc-c++
    sudo yum install devtoolset-2

启用 devtoolset-2 bash 环境

    scl enable devtoolset-2 bash

检查gcc版本看是否安装成功

    gcc --version

为了配合cmake, 需要创建相关的软链, cmake才找得到相关编译器

    ln -s $(which gcc) /usr/bin/cc
    ln -s $(which g++) /usr/bin/c++


以后每次想启用 devtoolset-2 bash 环境来使用gcc都需要命令 :

    scl enable devtoolset-2 bash

当然你也可以把下面这条语句加入到你的 ` .bashrc ` 里来让 devtoolset-2 bash 环境一直保持开启 : 

    source /opt/rh/devtoolset-2/enable


    