---
title: Lua的win和linux环境简单安装
date: 2015-11-08 19:29:22
tags:
- Lua
categories:
-  Script
---

# Linux环境

## Install lua

sudo apt-get install lua5.1

<!--more -->

## luarocks

到luarocks的官网下载luarocks, 直接apt-get的已经太老旧, 默认的配置文件有错

luarocks 命令：

- luarocks  build     XXX     建立/编译一个包

- luarocks  download XXX   从rocks服务器下载一个指定文件或者包

- luarocks  help                luarocks帮助

- luarocks  install     XXX    安装包

- luarocks  make      XXX    下载并编译包

- luarocks  pack                打包

- luarocks  list                   显示已安装的列表

- luarocks  path                返回包地址

- luarocks  remove  XXX     删除

- luarocks  search               Query the LuaRocks repositories

- luarocks    show                    Shows information about an installed rock.

- luarocks    unpack                 Unpack the contents of a rock.


## Install lua-socket

如果有安装 Lua 模块的安装和部署工具 -- luarocks，

那么一条指令就能安装部署好 LuaSocket： 

luarocks install luasocket

## 关于json

如果想安装一个解析 JSON(JavaScript Object Notation) 的模块，
可以用 search 参数先搜索一下有什么可安装的解析 JSON 的模块：

luarocks search json

假设想安装一个名为 json4lua 模块，可以用 install 参数来安装：

luarocks install json4lua

# Windows环境

## lua安装

首先要安装一个微软依赖 : https://www.microsoft.com/en-us/download/details.aspx?id=3387&fa43d42b-25b5-4a42-fe9b-1634f450f5ee=True

然后安装lua for windows : http://luaforge.net/projects/luaforwindows/