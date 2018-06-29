---
title: UE4中如何解决Failed To Launch Editor
date: 2017-05-02 17:56:12
tags:
- UE4
categories:
- UE4
---



当你点击 .uproject 文件却打不开项目, 弹出一个窗口写着 "Failed TO Launch Editor"的时候,
大概率是因为你对 UE4Editor.exe 设置为了以管理员身份打开, 
所以解决方法就是 : 

只要对 UE4Editor.exe 右键-属性-兼容性, 去掉"以管理员身份运行此程序"的勾

以及去掉"更改所有用户的设置"中的以管理员身份运行此程序的√
