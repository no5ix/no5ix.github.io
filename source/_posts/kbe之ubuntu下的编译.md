---
title: kbe之ubuntu下的编译
date: 2017-02-10 12:31:29
tags:
- KBE
categories:
- 杂
---

> 感觉之前的博客已经整理了大多数之前的关于基础的私人笔记, 现在应该可以讨论一下实操的东西了.
先来一发之前的kbe在ubuntu下的编译笔记吧, 因为官方对于ubuntu下的kbe编译文档是有问题的.


... <!-- more -->

## **编译步骤**

 1. 安装openssl : 
	1. sudo apt-get install libssl-dev

 2. 安装mysql : 
	1. sudo apt-get install libmysqld-dev
	2. sudo apt-get install mysql-server

 3. 编译kbe : 
   1. cd kbengine/kbe/src
   2. chmod -R 755 .
   3. make

