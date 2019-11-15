---
title: asio none boost 浅踩坑
date: 2019-04-01 01:26:16
tags: 
- Boost
- CPP
categories:
- NP
---


一晃2年过去了, 记得曾经看过 boost.asio, 现在 asio 已经可以完全脱离 boost 了,  
不过它项目里的一些例子还是依赖 boost 的, 比如他 src 文件夹里的 tests 里的 除了 unit , 其他的大多数还是老的例子,   
都是直接包含boost的一些头文件, 也就是依赖boost的

# 编译注意事项

官网说支持c++11的编译器会自动检测, 然后走asio的standalone模式, 测试了一下, 显然不会.  
所以 ASIO_STANDALONE 这个宏是必须得自己加上的,  
define ASIO_STANDALONE on your Preprocessor Settings (如: `g++ -DASIO_STANDALONE`) or as part of the project options. 

**. . .**<!-- more -->

- 包含 asio 的目录 (如: `g++ -I`)
- In C/C++ Preprocessor Settings, defined:
```
ASIO_STANDALONE
ASIO_HAS_STD_ADDRESSOF
ASIO_HAS_STD_ARRAY
ASIO_HAS_CSTDINT
ASIO_HAS_STD_SHARED_PTR
ASIO_HAS_STD_TYPE_TRAITS

ASIO_HAS_VARIADIC_TEMPLATES
ASIO_HAS_STD_FUNCTION
ASIO_HAS_STD_CHRONO

BOOST_ALL_NO_LIB
_WIN32_WINNT=0x0501
_WINSOCK_DEPRECATED_NO_WARNINGS
```

还可以参考: 
- https://nnarain.github.io/2015/11/03/Building-ASIO-Standalone-with-Visual-Studio-2015.html
- https://segmentfault.com/a/1190000013031005


# 如何fix例子里的boost依赖或已过时的代码

```
asio::placeholders::error,
          asio::placeholders::bytes_transferred
```
上面代码里的可替换为 `std::placeholders::_1` 和 `std::placeholders::_2`

```
#include <boost/array.hpp>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
```
这种就可以替换为
```
#include <array>
#include <memory>
```

