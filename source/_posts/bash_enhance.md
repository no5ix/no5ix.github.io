---
title:  Bash定制以及Bash中快速移动光标
date: 2014-02-01 19:38:55
tags:
- Bash
categories:
- Linux
---


# Bash定制

首先找到 ` .inputrc `  文件, 通过

    sudo find / -name inputrc

来找到它, 然后在` .inputrc `文件末尾加上常用的Bash定制 :

    set completion-ignore-case on  
    
    #For single press Tab results for when a partial or no completion is possible  
    set show-all-if-ambiguous on  
    
    #For results when no completion is possible  
    set show-all-if-unmodified on  
    
    #History completion bound to arrow keys (down, up)  
    "\e[A": history-search-backward  
    "\e[B": history-search-forward  

解释 :

- show-all-if-ambiguous : 默认情况下，按下两次 <tab> 才会出现提示，现在只需要一次了。
- completion-ignore-case : 在自动补全时忽略大小写
- history-search-* : 输入某个命令的一部分时，按上下箭头，会匹配关于这个这命令最近的使用历史。比如：输入 vim ，然后按”上“键，此时，可以显示上一次运行vim时的那条命令，非常的方便！


# Bash中快速移动光标

bash有两种输入模式vi模式和emacs模式，其中emacs是默认模式，而且操作起来也比vi模式要快捷。可以通过 set -o vi和set -o emacs来转换。 

## 命令行中移动 

`Alt+f`和`Alt+b` 是前后移动一个单词的距离这个很快比如你输入了 

## 删除 

- Alt+d 往右边删除一个单词 
- Alt+Backspace 往左删除一个单词 
- Ctrl+u 往左删除到行首 
- Ctrl+k 往右删除到行末 

其中这些删除都放入了删除环里面，可以使用Ctrl+y找回，Alt+y在删除环里面移动也就是说命令行里面可以使用剪切和粘贴了。 
上面的几条如果用熟练了效率能提高很多。 

而如果还想了解更多的快捷键绑定，敲如下命令 

　　bind -P 

发现有些你需要的功能而没有快捷键绑定的话可以如下绑定，比如我绑定了两个函数 

- bind -m emacs '"/M-w": kill-region' 
- bind -m emacs '"/M-W": copy-region-as-kill'



## 在命令历史中查找 

PS : 其实如果使用了上述的[Bash定制](#Bash定制)中的 ` history-search-* ` 就不需要这个 ` ctrl + r ` 了

使用 Ctrl+r， 这个键组合是反向增量查找消息历史。很好用。 比如你很久以前输入过某个命令如。 gcc -c -DKKT - Dnnn 等等，一长串， 用上下方向键来找比较困难，这时候可以Ctrl+r，然后输入gcc很快找到该命令，重复按Ctrl+r将查找更早的历史。
