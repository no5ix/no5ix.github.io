---
title: 安装AndroidSDK的一些坑与注意点
date: 2015-09-13 19:18:55
tags:
- Unity
categories:
- Misc
---


近来要用Unity打包到安卓上玩, 需要安装AndroidSDK.

安装教程基本上按照[这篇文章A](https://blog.csdn.net/love4399/article/details/77164500)就可以, 遇到不明白的可以拿[这篇B](https://blog.csdn.net/Fhujinwu/article/details/79072526)对照着看, 以A为准, 但是有几个点要注意 : 

- jdk别装太高版本, 装个jdk-8u161的32位的即可, 别装64位, 也别装高版本的jdk10的64位, 不然 android sdk set up tool 不认识, sdk manager 也会闪退

- jdk的环境变量很容易设置错, 比如环境变量`JAVA_HOME`应该填jdk的安装路径即 : `JAVA_HOME=C:/Program Files/Java/jdk1.8.0_11`而不是`JAVA_HOME=C:/Program Files/Java`, 填后者的话, sdk manager 会闪退

- 为了确保不必要的麻烦最好这样环境变量设置成类似如下 :
```
JAVA_HOME=C:/Program Files/Java/jdk1.8.0_11
JRE_HOME=C:/Program Files/Java/jre8
Path=%JAVA_HOME%;C:...
```

- 打安卓包的时候, 如果报`file not found debug.keystore` 或 `Unable to get debug signature key`的错, 用管理员权限重新打开Unity即可.
