---
title: Git设置代理
date: 2018-03-11 12:16:56
tags: 
- Git
categories:
- Misc
---

# 介绍

目前，网络上可选择的Git远程仓库比较多，其中用的较多的可能就是github和bitbucket（当然，你也可以使用自己搭建的远程仓库）。github和bitbucket的主要区别在于：bitbucket创建私人库是免费的。如果你不介意自己的代码公开，那你就可以使用github。如果，你有些私人的代码的话，又需要版本控制，这时候bitbucket就满足需要了。

但是，在国内的主要问题是：**网络不稳定**。这样，就会经常发生git不能push的情况。所以，这时候如果你有个代理服务器，就可以通过设置使git通过代理访问远程仓库，达到家和公司代码同步的目的。

Git允许使用三种协议来连接远程仓库：ssh、http、git。所以，如果你要设置代理，必须首先明确本地git使用何种协议连接远程仓库，然后根据不同协议设置代理。

# 本文前提

socks5代理服务器，默认端口1080


# 设置SSH协议的代理

如果你的远程仓库拥有如下的格式：

`git@github.com:archerie/learngit.git`

那么，你使用的是SSH协议连接的远程仓库。因为git依赖ssh去连接，所以，

**. . .**<!-- more -->

我们需要配置ssh的socks5代理实现git的代理。在ssh的配置文件~/.ssh/config（没有则新建）使用ProxyCommand配置：
```
# Linux 环境
Host bitbucket.org
Hostname bitbucket.org
User git
Port 22
ProxyCommand nc -x 127.0.0.1:1080 %h %portability

# Linux 环境
Host github github.com
Hostname github.com
User git
Port 22
ProxyCommand nc -x 127.0.0.1:1080 %h %portability

# windows 环境
Host bitbucket.org
User git
Port 22
Hostname bitbucket.org
ProxyCommand connect -S 127.0.0.1:1080 %h %portability

# windows 环境
Host github github.com
Hostname github.com
Port 22
User git
ProxyCommand connect -S 127.0.0.1:1080 %h %p

```

# 设置http/https协议代理

如果你的远程仓库链接拥有如下格式：
```
http://github.com/archerie/learngit.git
https://github.com/archerie/learngit.git
```

说明你使用的是http/https协议，所以可以使用git配套的CMSSW支持的代理协议：SOCKS4、SOCKS5和HTTPS/HTTPS。可通过配置http.proxy配置, 有两种方式分别为：


## 直接编辑.gitconfig文件的方式

可以直接编辑 git 的设置文件，该文件通常位于用户目录下，名为 .gitconfig，如果看不到，需要显示隐藏文件。
在 .gitconfig 文件的末尾加上
```
[https]
	proxy = https://127.0.0.1:1080
[http]
	proxy = http://127.0.0.1:1080
```


## 敲命令的方式

当然，你也可以敲命令, 命令如下：
```
git config --global http.proxy http://127.0.0.1:1080
git config --global https.proxy https://127.0.0.1:1080
```
经过测试，不需要设置sock5。
取消的命令如下：
```
git config --global --unset http.proxy
git config --global --unset https.proxy
```

还可以设置只本次用一下代理 : 
```
# 本次设置
git clone https://github.com/example/example.git --config "http.proxy=127.0.0.1:1080"
```

# 设置Git协议的代理

Git协议是Git提供的一个守护进程，它监听专门的端口（9418），然后提供类似于ssh协议一样的服务，只是它不需要验证。所以，然后用户通过网络都可以使用git协议连接提供git连接的仓库。如果远程仓库的链接是如下形式：

`git://github.com/archerie/learngit.git`

那么，该仓库使用git协议连接。所以，需要使用CMSSW提供的简单脚本去通过socks5代理访问：git-proxy。配置如下：

```
git config --global core.gitproxy "git-proxy"
git config --global socks.proxy "localhost:1080"
```

还想了解更多，使用git-proxy --help。
