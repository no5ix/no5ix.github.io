---
title: tolua++安装
date: 2015-11-11 19:29:22
tags:
- CPP
- Lua
categories:
-  Script
---


我们用一个例子来说明.

本文环境为 : 

- ubuntu1404
- g++ 4.8.4
- python
- git
- lua5.1( 因为tolua++只支持到5.1, 安装5.1教程看 {% post_link lua_install_tutorial Lua的win和linux环境简单安装 %} )

**. . .**<!--more -->


# 安装tolua++


1\. git clone git@github.com:LuaDist/toluapp.git
2\. sudo apt-get install scons
3\. cd toluapp/

4\. vi custom.py  然后添加内容 : 
``` python custom.py
# 自己通过命令 sudo find / -name "*lua.h*" 来查头文件.h在哪, 然后把路径填到下面
CCFLAGS = ['-I/usr/include/lua5.1', '-O2', '-ansi']
# 自己通过命令 sudo find / -name "*liblua*" 来查静态库.a文件在哪, 然后把路径填到下面
LIBPATH = ['/usr/lib/x86_64-linux-gnu']
LIBS = ['lua5.1', 'dl', 'm']
#prefix = '/mingw'
#build_dev=1
tolua_bin = 'tolua++5.1'
tolua_lib = 'tolua++5.1'
TOLUAPP = 'tolua++5.1'
```

5\. scons all
6\. scons install


# 测试

用以下五个文件测试, 输入命令 : 

1\. tolua++5.1 -o lua_Student.cpp Student.pkg
2\. g++ *.cpp -I/usr/include/lua5.1 -llua5.1 -lm -ltolua++5.1
3\. 如果执行 ` ./a.out ` 之后, 打印结果如下则为环境全部安装成功 : 

    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    Student Run
    Student Run10
    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    Student Run
    Student Run10
    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    Student Run
    Student Run10
    ...

## 五个测试文件

``` c++ Student.h
#pragma once
 
#include<iostream>
using namespace std;
 
class Student
{
public:
	Student();
	~Student();
 
	void Run();
 
	void Run(int a);
};

```


``` c++ Student.cpp

#include "Student.h"
 
 
Student::Student()
{
}
 
void Student::Run()
{
	cout << "Student Run" << endl;
}
 
void Student::Run(int a)
{
	cout << "Student Run" <<a<< endl;
}
 
Student::~Student()
{
}
```

``` Student.pkg
$#include"Student.h"
 
class Student
{
public:
	Student();
	~Student();
 
	void Run();
	void Run @ Run2(int a);
};
```

``` lua test.lua

studentB=Student:new() --实例化Student全局对象
 
function Run()
	studentB:Run();
end
 
function Run2(a)
	studentB:Run2(a);
end
 
function show()  
	local b = {}  
	local index  
	  
	for index = 1,10,1 do  
		print(index)  
	end  
end  
  
show()  
 
Run()
 
Run2(10)
```

``` c++ main.cpp
#include <stdio.h>
#include <unistd.h>

extern "C"
{
        #include "lua.h"
        #include "lualib.h"
        #include "lauxlib.h"
        #include "luaconf.h"
}
#include "tolua++.h"
#include"Student.h"

extern int tolua_Student_open(lua_State* tolua_S);

int main(int argc, char* argv[])
{

        while(1)
        {
            sleep(2);

            lua_State* L = luaL_newstate();
            luaL_openlibs(L);

            tolua_Student_open(L);

            luaL_dofile(L, "./test.lua");
            lua_close(L);
        }
        return 0;
}

```

**在运行的时候**把test.lua文件的`Run2(10)` 改为 `Run2(99)` 之后, 
打印也会跟着变为 : 

    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    Student Run
    Student Run10
    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    Student Run
    Student Run99
    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    Student Run
    Student Run99
    ...
