---
title: 久违pybind11
date: 2019-05-19 23:18:16
tags: 
- Python
- CPP
categories:
- Script
---


boost.python 迟暮, 久违 pybind11 , 来玩玩

# 官方介绍

pybind11 is a lightweight header-only library that exposes C++ types in Python and vice versa, mainly to create Python bindings of existing C++ code. Its goals and syntax are similar to the excellent Boost.Python library by David Abrahams: to minimize boilerplate code in traditional extension modules by inferring type information using compile-time introspection.

The main issue with Boost.Python—and the reason for creating such a similar project—is Boost. Boost is an enormously large and complex suite of utility libraries that works with almost every C++ compiler in existence. This compatibility has its cost: arcane template tricks and workarounds are necessary to support the oldest and buggiest of compiler specimens. Now that C++11-compatible compilers are widely available, this heavy machinery has become an excessively large and unnecessary dependency.


# 编写供 python 调用的 C++ 模块

下载好 pybind11 之后，我们就可以开始对着官方的 [pybind11 Tutorial](http://pybind11.readthedocs.io/en/stable/index.html) 进行学习了，详细的入门教程及语法请参考官方文档，这里，我们简单演示下如何编写供 python 调用的 C++ 模块.

**. . .**<!-- more -->

首先，我们编写一个 C++ 源文件，命名为`hello_pybind11.cpp`


``` c++ hello_pybind11.cpp
#include <pybind11/pybind11.h>

int add(int i, int j) {
    return i + j;
}

namespace py = pybind11;

PYBIND11_MODULE(hello_pybind11, m) {
    m.doc() = R"pbdoc(
        Pybind11 hello_pybind11 plugin
        -----------------------

        .. currentmodule:: hello_pybind11

        .. autosummary::
           :toctree: _generate

           add
           subtract
    )pbdoc";

    m.def("add", &add, R"pbdoc(
        Add two numbers

        Some other explanation about the add function.
    )pbdoc");

    m.def("subtract", [](int i, int j) { return i - j; }, R"pbdoc(
        Subtract two numbers

        Some other explanation about the subtract function.
    )pbdoc");


    // exporting variables
    m.attr("the_answer") = 42;
    py::object world = py::cast("World");
    m.attr("what") = world;

#ifdef VERSION_INFO
    m.attr("__version__") = VERSION_INFO;
#else
    m.attr("__version__") = "dev";
#endif
}
```

# CMake 的编译方法


我们使用 CMake 进行编译。如果 hello_pybind11.cpp 放在和 pybind11 同一级的目录下,   
首先像这样写一个 CMakeLists.txt

```
cmake_minimum_required(VERSION 2.8.12)
project(hello_pybind11)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++1y")

find_package(PythonLibs REQUIRED)    
include_directories(${PYTHON_INCLUDE_DIRS})   

include_directories(${PROJECT_SOURCE_DIR})
include_directories(${PROJECT_SOURCE_DIR}/pybind11/include)

if (WIN32)
    add_definitions(
        -DNOMINMAX
        -DWIN32_LEAN_AND_MEAN
        -D_WIN32_WINNT=0x0600
        -D_CRT_SECURE_NO_WARNINGS
        -D_SCL_SECURE_NO_WARNINGS
        -D_WINSOCK_DEPRECATED_NO_WARNINGS
    )
else()
    set(CMAKE_BUILD_TYPE "Debug")
    set(CMAKE_CXX_FLAGS_DEBUG "$ENV{CXXFLAGS} -O0 -Wall -g -ggdb")
    set(CMAKE_CXX_FLAGS_RELEASE "$ENV{CXXFLAGS} -O3 -Wall")
endif()

add_subdirectory(pybind11)
pybind11_add_module(hello_pybind11 hello_pybind11.cpp)
```

然后 CMake，便会生成一个 vs 2015 的工程文件，用 vs 打开工程文件进行 build，就可以生成`hello_pybind11.pyd`了。
若是在 Linux 下记得安装python-dev, ` sudo apt-get install python-dev `即可


# 加入py测试脚本

``` python
# -*- coding:utf-8 -*-

import sys
sys.path.append(r"C:\Users\hulinhong\Documents\github\wheel_timer_py\build\Debug")  # hello_pybind11.pyd 在这个路径
import hello_pybind11


print hello_pybind11.add(1, 2)
print hello_pybind11.subtract(12, 22)

print hello_pybind11.the_answer
print hello_pybind11.what

```

# 踩坑点汇总

- 运行py时报错: `ImportError: dynamic module does not define init function (initfizzbuzz)`
    解决方案: The error also occurs, when using boost::python, if the module name is different to the compiled .so file name.

- 要调试python的c++扩展记得 cmakelist.txt 里记得加上相应的标记
    
    $gdb python
    (gdb)run main.py      // 记得要先run 相关的py, 不然后面断点不到
    (gdb)b CallbackMgr::callback // 此处可能提示没有符号, 在找到符号之后阻塞进程, 具体的方法名后面不要加括号, 就写成callback即可, 不要写成callback()
    (gdb)b WheelTimer.cpp:251

- 用gdb调试python的话, `sudo apt-get install python2.7-dbg`, 只能看看调用栈, 但其实没法设置断点的

- 如果遇到py脚本无法结束或无法继续, 基本就是c++扩展的某个地方死循环了

- 重载的时候编译不过有可能是因为const的原因

# 参考文献

1.  [pybind11 github](https://github.com/pybind/pybind11)
2.  [pybind11 official Tutorial](http://pybind11.readthedocs.io/en/stable/index.html)
3.  [python 调用 C++ 之 pybind11 入门](https://blog.csdn.net/fitzzhang/article/details/78988682)