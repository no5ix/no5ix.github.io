---
title: C++与Lua本质原始交互API
date: 2015-11-11 19:29:22
tags:
- CPP
- Lua
categories:
-  Script
---


我们用一个例子来说明.

**. . .**<!--more -->


# 创建c++主程序

首先, 我们需要创建一个 C++ 的主程序，以便同 Lua 进行通信. 如下 : 

``` c++ lua_test.cpp
extern "C" { 
    #include "lua.h"
    #include "lualib.h"
    #include "lauxlib.h"
};  // 注意 : 这个extern "C" {} 非常重要, 不然会找不到相关库函数

#include <iostream>
#include <lua.hpp>

extern "C" {
    static int l_cppfunction(lua_State *L) {
        double arg = luaL_checknumber(L,1);
        lua_pushnumber(L, arg * 0.5);
        return 1;
    }
}

using namespace std;

int main(int argc, const char * argv[])
{
    lua_State *L;
    L = luaL_newstate();
    
    cout << ">> 载入（可选）标准库，以便使用打印功能" << endl;
    luaL_openlibs(L);

    cout << ">> 载入文件，暂不执行" << endl;
    if (luaL_loadfile(L, "luascript.lua")) {
        cerr << "载入文件出现错误" << endl;
        cerr << lua_tostring(L, -1) << endl;
        lua_pop(L,1);
    }

    cout << ">> 从 C++ 写入数据 cppvar" << endl;
    lua_pushnumber(L, 1.1);
    lua_setglobal(L, "cppvar");

    cout << ">> 执行 lua 文件" << endl << endl;
    if (lua_pcall(L,0, LUA_MULTRET, 0)) {
        cerr << "执行过程中出现错误" << endl;
        cerr << lua_tostring(L, -1) << endl;
        lua_pop(L,1);
    }

    cout << ">> 从 Lua 读取全局变量 luavar 到 C++" << endl;
    lua_getglobal(L, "luavar");
    double luavar = lua_tonumber(L,-1);
    lua_pop(L,1);
    cout << "C++ 从 Lua 读取到的 luavar = " << luavar << endl << endl;

    cout << ">> 从 C++ 执行 Lua 的方法 myfunction" << endl;
    lua_getglobal(L, "myluafunction");
    lua_pushnumber(L, 5);
    lua_pcall(L, 1, 1, 0);
    cout << "函数返回值是：" << lua_tostring(L, -1) << endl << endl;
    lua_pop(L,1);

    cout << ">> 从 Lua 执行 C++ 的方法" << endl;
    cout << ">>>> 首先在 Lua 中注册 C++ 方法" << endl;
    lua_pushcfunction(L,l_cppfunction);
    lua_setglobal(L, "cppfunction");

    cout << ">>>> 调用 Lua 函数以执行 C++ 函数" << endl;
    lua_getglobal(L, "myfunction");
    lua_pushnumber(L, 5);
    lua_pcall(L, 1, 1, 0);
    cout << "函数返回值是：" << lua_tonumber(L, -1) << endl << endl;
    lua_pop(L,1);

    cout << ">> 释放 Lua 资源" << endl;
    lua_close(L);

    return 0;
}
```


编译命令 : ` g++ lua_test.cpp -o ltest -llua -ldl `


# 创建Lua文件


其次，是 lua 文件，我们将它命名为 luascript.lua

``` lua luascript.lua
print("Hello from Lua")
print("Lua code is capable of reading the value set from C++", cppvar)
luavar = cppvar * 3

function myluafunction(times)
  return string.rep("(-)", times)
end

function myfunction(arg)
  return cppfunction(arg)
end
```

# 打印结果

运行 cpp 文件，结果如下：

    >> 载入（可选）标准库，以便使用打印功能
    >> 载入文件，暂不执行
    >> 从 C++ 写入数据 cppvar
    >> 执行 lua 文件

    Hello from Lua
    Lua code is capable of reading the value set from C++   1.1
    >> 从 Lua 读取全局变量 luavar 到 C++
    C++ 从 Lua 读取到的 luavar = 3.3

    >> 从 C++ 执行 Lua 的方法 myfunction
    函数返回值是：(-)(-)(-)(-)(-)

    >> 从 Lua 执行 C++ 的方法
    >>>> 首先在 Lua 中注册 C++ 方法
    >>>> 调用 Lua 函数以执行 C++ 函数
    函数返回值是：2.5

    >> 释放 Lua 资源




# 参考

[参考](https://indienova.com/indie-game-development/lua-as-script-with-cpp-development/)