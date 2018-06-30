---
title: Lua的win和linux环境搭建
date: 2015-11-08 19:29:22
tags:
- Lua
categories:
-  Script
---

# ubuntu环境

因为tolua++只支持5.1所以我们优先装5.1版本, 当然, 5.3版本也会介绍.

**. . .**<!--more -->


## 测试文件

``` c++ a.cpp
extern "C" {
    #include "lua.h"
    #include "lualib.h"
    #include "lauxlib.h"
};  // 注意 : 这个extern "C" {} 非常重要, 不然会找不到相关库函数

//#include "lua.h"
//#include "lauxlib.h"
int main(int argc, char **argv)
{
    lua_State *L = luaL_newstate();
    luaL_openlibs(L);
    luaL_dostring(L, "print('hello, '.._VERSION)");
    return 0;
}
```


## lua5.1 

    sudo apt-get install lua5.1
    sudo apt-get install liblua5.1-0-dev

编译命令 : ` gcc a.cpp -I/usr/include/lua5.1 -llua5.1 -lm `

生成 a.out 之后, 运行 a.out, 若打印 ` hello, Lua 5.1 ` 即为安装成功.


## lua5.3

    apt-get install libreadline-dev
    curl -R -O http://www.lua.org/ftp/lua-5.3.0.tar.gz
    tar zxf lua-5.3.0.tar.gz
    cd lua-5.3.0
    make linux test
    make install

编译命令 : ` g++ a.cpp -llua -ldl `

生成 a.out 之后, 运行 a.out, 若打印 ` hello, Lua 5.3 ` 即为安装成功.





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


首先要安装一个微软依赖 : https://www.microsoft.com/en-us/download/details.aspx?id=3387&fa43d42b-25b5-4a42-fe9b-1634f450f5ee=True

然后安装lua for windows : 
- http://www.runoob.com/lua/lua-environment.html 
- 或 http://luaforge.net/projects/luaforwindows/


