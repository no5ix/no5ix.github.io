---
title: pybind11 intro
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


``` c++
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

add_subdirectory(pybind11)
pybind11_add_module(hello_pybind11 hello_pybind11.cpp)
```

然后 CMake，便会生成一个 vs 2015 的工程文件，用 vs 打开工程文件进行 build，就可以生成`hello_pybind11.pyd`了。

# 加入py测试脚本

``` python
import sys
sys.path.append("C:/Users/b/Documents/practice/hello_pybind11/vs2017/proj/Debug") # hello_pybind11 在这个路径
import hello_pybind11


print hello_pybind11.add(1, 2)
print hello_pybind11.subtract(12, 22)

print hello_pybind11.the_answer
print hello_pybind11.what
```


# 参考文献

1.  [pybind11 github](https://github.com/pybind/pybind11)
2.  [pybind11 Tutorial](http://pybind11.readthedocs.io/en/stable/index.html)
3.  [python 调用 C++ 之 pybind11 入门](https://blog.csdn.net/fitzzhang/article/details/78988682)