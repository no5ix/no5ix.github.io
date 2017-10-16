---
title: vscode配置与技巧
date: 2017-10-16 18:45:48
tags:
- vscode
categories:
- 脚本
---

# 序

> 听说网易云音乐可以一玩就是一个下午, 但有些编辑器怕是一玩就是一辈子...

# 转vscode原因

因为工作关系, sublime对于gb2312编码的问题无法良好解决.
即使装了convert2utf还是无法解决搜索中文字符串的问题, 因为搜索的时候sublime是没有转码的所以无法搜到想要的中文.
所以转战vscode, 谨以这篇笔记来记录vscode心得.

<!-- more -->

# 编码问题


[摘自](https://www.zhihu.com/question/30033418/answer/51510228)

比如解决我上述的gb2312乱码的问题的步骤如下 : 

- 在你项目的根目录新建一个名为 .vscode的文件夹(其实这个文件夹就是专门针对这个项目的配置文件了)
- 在文件夹里新建一个名为 settings.json 的文件
- 上述文件中加入一对花括号
- 花括号中添加下面内容

```
 "files.encoding": "shiftjis",
 "files.encoding": "eucjp",
 "files.encoding": "big5hkscs",
 "files.encoding": "Big5",
 "files.encoding": "GB18030",
 "files.encoding": "GBK",
 "files.encoding": "utf8",
 "files.encoding": "GB2312",
 ```
 这样支持这样几种编码方式，最下面的就是默认的， 这个默认支持GB2312,还需要其他编码可以自己按需要添加


