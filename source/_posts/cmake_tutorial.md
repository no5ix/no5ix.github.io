---
title: 跨平台开发之CMake笔记
date: 2018-04-21 09:38:55
tags:
- CrossPlatform
- Compile
- Make
categories:
- Misc
---

因为近来需要把一些 Linux 项目转到 Windows 上来开发, 所以有了一些跨平台开发的笔记, 此篇讲CMake, 供以后查阅.

# CMake介绍

你或许听过好几种 Make 工具，例如 GNU Make ，QT 的 qmake ，微软的 MS nmake，BSD Make（pmake），Makepp，等等。这些 Make 工具遵循着不同的规范和标准，所执行的 Makefile 格式也千差万别。这样就带来了一个严峻的问题：如果软件想跨平台，必须要保证能够在不同平台编译。而如果使用上面的 Make 工具，就得为每一种标准写一次 Makefile ，这将是一件让人抓狂的工作。

就是针对上面问题所设计的工具：它首先允许开发者编写一种平台无关的 CMakeList.txt 文件来定制整个编译流程，然后再根据目标用户的平台进一步生成所需的本地化 Makefile 和工程文件，如 Unix 的 Makefile 或 Windows 的 Visual Studio 工程。从而做到“Write once, run everywhere”。

显然，

**. . .**<!-- more -->


CMake 是一个比上述几种 make 更高级的编译配置工具。一些使用 CMake 作为项目架构系统的知名开源项目有 VTK、ITK、KDE、OpenCV、OSG 等。

# CMake一些有用的网站

- [CMake官网](cmake.org)
- [CMake入门实战](http://www.hahack.com/codes/cmake/#入门案例：单个源文件)
- [进阶](http://blog.icodeten.com/cmake/2015/01/22/cmake-experience/)

# 将build和项目源文件分离的方法

假设项目A的根目录下有一个 CMakeLists, 在项目的根目录新建一个叫 build 的文件夹, 然后进入 build 文件夹内, 执行命令 `cmake ..` 即可.


# CMakeLists实例讲解

比如有一个目录结构如下的项目 : 

    ├─RealTimeServer
        ├─RealTimeServer
        │  ├─CMakeFiles.txt
        │  ├─a.h
        │  ├─a.cpp
        │  ├─b.h
        │  ├─b.cpp
        │  ├─TestFolder
        │  │  ├─a.h
        │  │  ├─a.cpp
        │  │  ├─b.h
        │  │  ├─b.cpp
        │  └─...
        ├─Tool


这是一个比较通用的CMakeLists.txt : 

```sh

# CMake 最低版本号要求
cmake_minimum_required (VERSION 2.8)

# support C++11
add_definitions(-std=c++11)



# 项目信息
set (PROJ_NAME RealTimeServer)
set (BIN_NAME rts)
project (${PROJ_NAME})


# 设置执行文件输出目录
# SET(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)
# 设置库输出路径
# SET(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)


# 查找当前目录下的所有源文件
# 并将名称保存到 DIR_SRCS 变量
# aux_source_directory(./${PROJ_NAME} DIR_SRCS)


# 查找当前目录以及子目录下的所有头文件
# 并将名称保存到 CURRENT_HEADERS 变量
# file(GLOB_RECURSE CURRENT_HEADERS  *.h *.hpp)


# 此命令可以用来收集源文件 CURRENT_HEADERS 作为变量保存收集的结果。 
# 后面为文件过滤器，其中 PROJ_NAME 为起始搜索的文件夹，即在 RealTimeServer 目录下，
# 开始收集，而且会遍历子目录
# file(
#     GLOB_RECURSE CURRENT_HEADERS 
#     LIST_DIRECTORIES false
#     "${PROJ_NAME}/*.h*"
# )

# 生成一个名为Include的VS筛选器
# source_group("Include" FILES ${CURRENT_HEADERS}) 


IF(WIN32) # Check if we are on Windows

    file(GLOB_RECURSE project_headers *.h)
    file(GLOB_RECURSE project_cpps *.c*)
    set(all_files ${project_headers} ${project_cpps})

    macro(create_filters source_files)
        if(MSVC)
            # 获取当前目录
            set(current_dir ${CMAKE_CURRENT_SOURCE_DIR})
            foreach(src_file ${${source_files}})
                # 求出相对路径
                string(REPLACE ${current_dir}/ "" rel_path_name ${src_file})
                # 删除相对路径中的文件名部分
                string(REGEX REPLACE "(.*)/.*" \\1 rel_path ${rel_path_name})
                # 比较是否是当前路径下的文件
                string(COMPARE EQUAL ${rel_path_name} ${rel_path} is_same_path)
                # 替换成Windows平台的路径分隔符
                string(REPLACE "/" "\\" rel_path ${rel_path})
                if(is_same_path)
                    set(rel_path "\\")
                endif(is_same_path)

                # CMake 命令
                source_group(${rel_path} FILES ${src_file})
            endforeach(src_file)
        endif(MSVC)
    endmacro(create_filters)

    create_filters(all_files)
    # add_executable(app ${all_files})

    # 指定生成目标
    add_executable(${PROJ_NAME} ${all_files})
    
  	if(MSVC) # Check if we are using the Visual Studio compiler
    		# set_target_properties(${PROJ_NAME} PROPERTIES LINK_FLAGS "/SUBSYSTEM:WINDOWS") # works for all build modes
    		set_target_properties(${PROJ_NAME} PROPERTIES LINK_FLAGS "/SUBSYSTEM:CONSOLE") # works for all build modes
    		target_link_libraries(${PROJ_NAME} wsock32 ws2_32)
        set_target_properties(${PROJ_NAME}
            PROPERTIES
            COMPILE_FLAGS /wd"4819"
        )
  	elseif(CMAKE_COMPILER_IS_GNUCXX)
	  	# SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -mwindows") # Not tested
  	else()
	  	message(SEND_ERROR "You are using an unsupported Windows compiler! (Not MSVC or GCC)")
  	endif()

elseif(UNIX)

    file(GLOB_RECURSE all_files "*.*")

    include_directories(${PROJECT_SOURCE_DIR})
    # add_subdirectory(muduo/base)
    # add_subdirectory(muduo/net)

    # 指定生成目标
    add_executable(${BIN_NAME} ${all_files})
    # 添加链接库
    target_link_libraries(${BIN_NAME} pthread rt)

    # Inhibit all warning messages.
    if(CMAKE_COMPILER_IS_GNUCC OR CMAKE_COMPILER_IS_GNUCXX)
        # set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wno-long-long -pedantic")
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -w")
    endif()

  	# For gdb
    set(CMAKE_BUILD_TYPE "Debug")
    set(CMAKE_CXX_FLAGS_DEBUG "$ENV{CXXFLAGS} -O0 -Wall -g -ggdb")
    set(CMAKE_CXX_FLAGS_RELEASE "$ENV{CXXFLAGS} -O3 -Wall")

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

- `set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -w")`
`-w`的意思是关闭编译时的警告，也就是编译后不显示任何warning，因为有时在编译之后编译器会显示一些例如数据转换之类的警告，这些警告是我们平时可以忽略的。
`-Wall`选项意思是编译后显示所有警告。
`-W`选项类似-Wall，会显示警告，但是只显示编译器认为会出现错误的警告。
在编译一些项目的时候可以-W和-Wall选项一起使用。[这里](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html)可以查看gcc的各种警告级别.