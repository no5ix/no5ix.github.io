---
title: redis和hiredis安装教程
date: 2015-07-11 09:29:22
tags:
- Redis
- NoSQL
categories:
- DB
---

在ubuntu上

redis安装 :  ` sudo apt-get install redis-server `

hiredis安装 : 先到 https://github.com/redis/hiredis 下载 hiredis , 然后 

    sudo make
    sudo make install
    sudo ldconfig