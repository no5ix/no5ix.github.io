---
title: Unity中C#调用C++写的DLL之Swig篇
date: 2015-09-13 19:18:55
tags:
- Unity
categories:
- Misc
---


近来要用Unity打包到安卓上玩, Unity那边需要用到服务器中用C++写的库, 
对比了 [P/Invoke](https://zhuanlan.zhihu.com/p/30746354) 和 [C++/CLI](https://blog.csdn.net/springberlin/article/details/9260735) 两种方式, 都不够省心省力, 决定使用 Swig来撸.

教程基本上按照[这篇文章](https://zhuanlan.zhihu.com/p/31162922)就可以, 文章写得非常详尽, 

但文中关于设置 swiglib.i 自定义生成工具的命令行的时候, 

他文中的下面一段要注意 : 

> 在常规中选择命令行并且写入：

    echo on
    $(SolutionDir)/../../thirdpart/swigwin-3.0.12/swig.exe -c++ -csharp -outdir “$(SolutionDir)/../../../UnityProj/UnityCppLearn/Assets/SwigTools/Interface” “%(FullPath)”
    echo off

应改成 : 

我们在自己填的时候要记得改成自己项目中的路径, 以及把上面这段命令中的中文引号改成英文引号.
