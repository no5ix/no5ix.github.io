---
title: 跨平台开发之CMake笔记
date: 2015-09-21 09:38:55
tags:
- CMake
- 跨平台
categories:
- Misc
---

因为近来需要把一些 Linux 项目转到 Windows 上来开发, 所以有了一些跨平台开发的笔记, 此篇讲CMake, 供以后查阅.

# CMake介绍

你或许听过好几种 Make 工具，例如 GNU Make ，QT 的 qmake ，微软的 MS nmake，BSD Make（pmake），Makepp，等等。这些 Make 工具遵循着不同的规范和标准，所执行的 Makefile 格式也千差万别。这样就带来了一个严峻的问题：如果软件想跨平台，必须要保证能够在不同平台编译。而如果使用上面的 Make 工具，就得为每一种标准写一次 Makefile ，这将是一件让人抓狂的工作。

就是针对上面问题所设计的工具：它首先允许开发者编写一种平台无关的 CMakeList.txt 文件来定制整个编译流程，然后再根据目标用户的平台进一步生成所需的本地化 Makefile 和工程文件，如 Unix 的 Makefile 或 Windows 的 Visual Studio 工程。从而做到“Write once, run everywhere”。显然，CMake 是一个比上述几种 make 更高级的编译配置工具。一些使用 CMake 作为项目架构系统的知名开源项目有 VTK、ITK、KDE、OpenCV、OSG 等。

# CMake一些有用的网站

- [CMake官网](cmake.org)
- 基础入门教程 : [CMake入门实战](http://www.hahack.com/codes/cmake/#入门案例：单个源文件)

# 将build和项目源文件分离的方法

假设项目A的根目录下有一个 CMakeLists, 在项目的根目录新建一个叫 build 的文件夹, 然后进入 build 文件夹内, 执行命令 `cmake ..` 即可.


# CMakeLists实例讲解

比如有一个目录结构如下的项目 : 
```
├─ActionServer
    ├─ActionServer
    │  ├─a.h
    │  ├─a.cpp
    │  ├─b.h
    │  ├─b.cpp
    │  └─...
    ├─CMakeFiles.txt
```

这是一个比较通用的CMakeLists.txt : 

```sh
# support C++11
add_definitions(-std=c++11)

# CMake 最低版本号要求
cmake_minimum_required (VERSION 2.8)

# 项目信息
set (PROJ_NAME MyProj)
project (${PROJ_NAME})


#设置执行文件输出目录
SET(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)
#设置库输出路径
SET(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)

# 查找当前目录下的所有源文件
# 并将名称保存到 DIR_SRCS 变量
aux_source_directory(./${PROJ_NAME} DIR_SRCS)

# 查找当前目录下的所有头文件
# 并将名称保存到 CURRENT_HEADERS 变量
file(GLOB_RECURSE CURRENT_HEADERS  *.h *.hpp)
source_group("Include" FILES ${CURRENT_HEADERS}) 

# 指定生成目标
add_executable(${PROJ_NAME} ${DIR_SRCS} ${CURRENT_HEADERS})

IF(WIN32) # Check if we are on Windows
	if(MSVC) # Check if we are using the Visual Studio compiler
		set_target_properties(${PROJ_NAME} PROPERTIES LINK_FLAGS "/SUBSYSTEM:WINDOWS") # works for all build modes
		target_link_libraries(${PROJ_NAME} wsock32 ws2_32)
  	elseif(CMAKE_COMPILER_IS_GNUCXX)
	  	# SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -mwindows") # Not tested
  	else()
	  	message(SEND_ERROR "You are using an unsupported Windows compiler! (Not MSVC or GCC)")
  	endif()
elseif(UNIX)
  	# Nothing special required
else()
  	message(SEND_ERROR "You are on an unsupported platform! (Not Win32 or Unix)")
ENDIF()
```

对于像上面这样一个CMake的CMakeLists来说, 需要着重解释的有以下几点 :

- `add_definitions(-std=c++11)` 这句是为了解决 linux 默认不支持 c++11 的问题

- `set_target_properties(${PROJ_NAME} PROPERTIES LINK_FLAGS "/SUBSYSTEM:WINDOWS") # works for all build modes` 这句是为了解决WinMain的问题, 否则在vs平台会报main非法引用的问题. 这句会影响到vs的 "项目属性-链接器-系统-子系统"

- `target_link_libraries(${PROJ_NAME} wsock32 ws2_32)` 这句是为了在vs下链接ws2_32库, windows需要链接这个库才能用socket. 这句会影响到vs的 "项目属性-链接器-输入-附加依赖项"

- `file(GLOB_RECURSE CURRENT_HEADERS  *.h *.hpp)
source_group("Include" FILES ${CURRENT_HEADERS})` 这句是为了解决在vs下不显示头文件的问题 