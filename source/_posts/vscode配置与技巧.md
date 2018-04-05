---
title: vscode配置与技巧
date: 2017-10-16 18:45:48
tags:
- VSCode
- Vim
categories:
- Misc
---


# 序

> 听说网易云音乐可以一玩就是一个下午, 但有些编辑器怕是一玩就是一辈子...

# 转vscode原因

因为工作关系, sublime对于gb2312编码的问题无法良好解决.
即使装了convert2utf还是无法解决搜索中文字符串的问题, 因为搜索的时候sublime是没有转码的所以无法搜到想要的中文.
所以转战vscode, 谨以这篇笔记来记录vscode心得.

**. . .**<!-- more -->

# 编码问题


[摘自](https://www.zhihu.com/question/30033418/answer/51510228)

比如解决我上述的gb2312乱码的问题的步骤如下 : 

1. 在你项目的根目录新建一个名为 .vscode的文件夹(其实这个文件夹就是专门针对这个项目的配置文件了)
2. 在文件夹里新建一个名为 settings.json 的文件
3. 上述文件中加入一对花括号
4. 花括号中添加下面内容

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

# 设置搜索文件排除文件夹

例如在此工作区设置内设置不搜索Map文件里的文件和扩展名为xml的文件, 

```
"search.exclude": {
    "**/Map": true,
    "*.xml": true,
},
```

# vscode常用快捷键以及改键

- ctrl+p 搜文件
- ctrl+shift+o 搜当前文件的符号
- f12 转到定义
- f12+ctrl 转到声明
- alt+-> 导航前进
- alt+<- 导航后退
- ctrl+shift+\ 跳到对应的括号
- ctrl+shift+p 打开命令输入框
- ctrl+shift+a 切换块注释
- ctrl+/ 切换行注释
- 多行编辑 : alt+shift+拖动鼠标左键或者alt+左键多处选择



# 不同机器间同步vscode设置的插件(必装)

> Shan khan的Settings Sync插件, 可以同步你的快键键/用户设置/icon/snippet/主题等等, 这样你
> 另一台电脑上就可以同步你在公司所用的设置了.

## 另一个机器也获得上传settings权限的方法

> 这个是插件官方说明页面没有写的, 官方页面只教了你如何在另一台机器上下载之前机器的settings

到另外一个机器也装上这个插件, 

然后ctrl+shift+p调出控制命令板然后输出sync选中Sync : Advanced Options, 

然后选中Edit Extension local settings, 就会打开一个配置文件, 然后填入你的token即可


# Vim插件1:amVim

作者为auiWorks的名为amVim的插件, 装上即可使用, 无须配置, 跟vscode默认的多行编辑也不冲突

切记在键盘快捷方式中把amVim的ctrl+c快捷键改成其他键或者直接删除, 否则vscode内的东西无法复制到vscode外

## MetaGo(一个类似EasyMotion的插件)

目前类似EasyMotion的插件只有这个兼容amVim, 改键改成ctrl+shift之后非常好用.


# Vim插件2:vim(不推荐)

作者为vscodevim的名为vim的插件, 不推荐使用这个插件, 下面说一下他的不足之处

> vscode的欢迎页就有推荐vim的插件, 几乎所有键盘映射都移植过来了,
> 还加了一些特性,比如多行编辑.


## 如果要用此插件建议改键

- alt+shift+f 从在文件夹中查找改为当前文件中查找, 因为ctrl+f跟vim的冲突
- alt+shift+q 改为格式化选中代码快捷键
- ctrl+d改为ctrl+q, 因为ctrl+d跟vim的冲突

## 难用之处

不过这个插件自带的多行编辑极为难用.
而且他的多行编辑还处于beta阶段, 所以我们还是使用vscode自带的多行编辑,

## 解决方案

首先因为vscode多行编辑的ctrl+d快捷键被插件占用了, 所以我们要把vscode原来的ctrl+d改为ctrl+q

- 对于多个不止一个单字符多处编辑的情况 :
```
 当处于normal mode的时候, 
 按下v键, 选中想要多处编辑的字符串, 然后按ctrl+q,
 此时vscode编辑器左下角会提示你目前处于visual mode multi cursor状态,
 我们得按下esc退到normal mode multi cursor状态,
 然后按下i进入insert mode multi mode状态, 此时就可以多处编辑了,
 按两次esc就可以退回到normal mode了
```
- 对于多个单字符多处编辑的情况 : 因为vim的v模式选中一个字符, vscode的ctrl+q选中了多个单字符还是无法同时编辑, 所以我们用vim的宏, 例子如下 :
```
比如：
aaa,bbb,ccc,ddd
eee,fff,ggg,hhh
iii,jjj,kkk,lll

怎样把b, f, j后面的逗号改成引号？ 

最快速方便的方法是使用宏命令模式下按qa进入录制状态，
按照以下顺序操作就可以了，“#”字符之后为注释，宏将保存在寄存器a中
0    #定位到行首
2f,    #定位到第二个,字符
r'    #将光标下的字符替换为'
j    #进入下一行
q    #退出宏录制状态

针对剩余的行调用宏就可以了，比如在命令行模式下键入“100@a”，就是重复执行100次
或者键入"@@"一个一个的执行, "@@"的意思是执行最近录入的一个宏

```

- 对于某一纵列多行编辑的情况 : 
```
vim进了多行编辑模式：<ESC>之后按CTRL+V进入visual block模式（列编辑）。
光标移到某行行首，上下键选择行，按I（i的大写字母），输入##，
然后按<ESC>键，这样就在多行行首添加##了。也可以在多行的固定位置添加固定字符。
切记一定要按了I之后再按键盘上的home或者end键光标才能百分之百到行首或者行尾
如果要删除这些##，进入visual block模式，选中这些##，按d即可。
```
- 还可以使用vscode自带的多行编辑快捷键, alt+shift+拖动鼠标左键或者alt+左键多处选择

# Lua插件

## lua插件三件套(推荐)

- keyring 的 Lua插件来完成提示
- xxxg0001的lua-for-vscode来完成跳转
- trixnz的vscode-lua来完成代码linting和列出属性以及方法

## luaide国人的插件(不推荐)
参考[LuaIde文档导航页](http://www.jianshu.com/p/47fbe1de123d)

到这个页面下载他的免费版本安装即可.

### luaide免费版本的已知问题

- 对于包含lua文件很多的文件夹来说:
`他要扫描非常久, 而且每次都要扫描, 解决方案就是把要用的小文件夹单独开一个vscode窗口来工作`
- 有时候不解析, 无法跳转或者无法列出当前文件的方法和属性: 
` 随便编辑一下这个lua文件, 再ctrl+z, 这个文件就被解析了`



# Python插件

直接安装vscode商城中推荐的作者为Don Jayamanne的python插件


