---
title: Linux Go安装备忘
date: 2019-06-27 16:58:26
tags:
- Go
categories:
- Misc
---


# 装go

因为 ubuntu 默认装 go 是1.6 的, 不想装 1.6, 准备装 1.8, 

**. . .**<!-- more -->

## step1
wget https://storage.googleapis.com/golang/go1.8.3.linux-amd64.tar.gz

## step2
sudo tar -xvf go1.8.3.linux-amd64.tar.gz
sudo mv go /usr/local

## step3
vi ~/.bashrc
export GOROOT=/usr/local/go
export GOPATH=/home/zhangxiao/goworkspace/mygo
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
source ~/.bashrc

## step4
go version 
`go version go1.8.3 linux/amd64`

## 参考： 
https://tecadmin.net/install-go-on-ubuntu/