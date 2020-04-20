---
title:  Bash定制
date: 2014-02-01 19:38:55
tags:
- Bash
categories:
- Linux
---


# profile和bashrc和bash_profile的区别


- `/etc/profile`:此文件为系统的每个用户设置环境信息,当用户第一次登录时,该文件被执行.并从 `/etc/profile.d` 目录的配置文件中搜集shell的设置.
所以如果你有对`/etc/profile`有修改的话必须得重启你的修改才会生效，此修改对每个用户都生效。


- `/etc/bashrc`:为每一个运行bash shell的用户执行此文件.当bash shell被打开时,该文件被读取.
如果你想对所有的使用bash的用户修改某个配置并在以后打开的bash都生效的话可以修改这个文件，修改这个文件不用重启，重新打开一个bash即可生效。

- `~/.bash_profile`:每个用户都可使用该文件输入专用于自己使用的shell信息,当用户登录时,该文件仅仅执行一次!默认情况下,他设置一些环境变量,执行用户的.bashrc文件.
此文件类似于`/etc/profile`，也是需要需要重启才会生效，`/etc/profile`对所有用户生效，`~/.bash_profile`只对当前用户生效。

- `~/.bashrc`:该文件包含专用于你的bash shell的bash信息,当登录时以及每次打开新的shell时,该文件被读取.（每个用户都有一个.bashrc文件，在用户目录下）
此文件类似于`/etc/bashrc`，不需要重启生效，重新打开一个bash即可生效，  `/etc/bashrc`对所有用户新打开的bash都生效，但`~/.bashrc`只对当前用户新打开的bash生效。

- ~/.bash_logout:当每次退出系统(退出bash shell)时,执行该文件. 


另外,`/etc/profile`中设定的变量(全局)的可以作用于任何用户,而`~/.bashrc`等中设定的变量(局部)只能继承`/etc/profile`中的变量,他们是"父子"关系.

`~/.bash_profile` 是交互式、login 方式进入bash 运行的；
`~/.bashrc` 是交互式 non-login 方式进入bash 运行的；

通常二者设置大致相同，所以通常 `~/.bash_profile` 会在其文件中加入以下代码来调用 `~/.bashrc` :
``` shell
# Get the aliases and functions
if [ -f ~/.bashrc ]; then
        . ~/.bashrc
fi
```

**. . .**<!-- more -->

# 设置core文件格式

` /proc/sys/kernel/core_pattern `可以设置格式化的core文件保存位置或文件名，
比如原来文件内容是core-%e , 可以这样修改:

` echo "/corefile/core-%e-%p-%t" > /proc/sys/kernel/core_pattern `

将会控制所产生的core文件会存放到/corefile目录下，产生的文件名为core-命令名-pid-时间戳 , 
以下是参数列表:

    %p - insert pid into filename 添加pid
    %u - insert current uid into filename 添加当前uid
    %g - insert current gid into filename 添加当前gid
    %s - insert signal that caused the coredump into the filename 添加导致产生core的信号
    %t - insert UNIX time that the coredump occurred into filename 添加core文件生成时的unix时间
    %h - insert hostname where the coredump happened into filename 添加主机名
    %e - insert coredumping executable name into filename 添加命令名


# 安全的rm

`rm -rf` 慎用
命令敲得多了，常在河边走，难免会湿鞋
昨天，一个手误，敲错了命令，把原本想要留的文件夹给rm -rf掉了
几天心血全木有了，靠，死的心都有了

几点教训：

- rm 特别是rm -rf之前，小心，三思，或者直接将命令改写掉
- 做好备份，有便捷的备份脚本
- 做好定时备份，有个前辈搞定时脚本，每天定时自个执行，即使删错了也不会那么悲催

在~下 .bashrc或者.bash_profile加入

``` shell

# the following lines if you want `ls' to be colorized:
export LS_OPTIONS='--color=auto'
eval "`dircolors`"
alias ls='ls $LS_OPTIONS'
alias ll='ls $LS_OPTIONS -alF'
alias l='ls $LS_OPTIONS -lA'

# Some more alias to avoid making mistakes:
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
alias ll='ls -alF'

# mkdir and enter it
alias mc=mkdircd
mkdircd()
{
    mkdir -p "$1" && cd "$1"
}

# cd and ls -alF dir
alias cd=cdll
cdll()
{
        builtin cd "$@" && ll;
}

ulimit -c unlimited

```

## 建立一个简易回收站

搞个回收站得在~下 .bashrc或者.bash_profile加入

```  shell
mkdir -p ~/.trash

# original rm
alias or='/bin/rm'

alias rm=trash
alias r=trash
alias lr='ls -alF ~/.trash'
alias cr='cd ~/.trash'
alias ur=undelfile
alias er=emptytrash

undelfile()
{
  mv -i ~/.trash/$@ ./
}
trash()
{
    for TARGET_NAME in $@
    do
        TARGET_WITH_NO_LAST_SLASH=~/.trash/${TARGET_NAME%*/}
        if [ -d ${TARGET_WITH_NO_LAST_SLASH} ]; then
        # or -rf ${TARGET_WITH_NO_LAST_SLASH}
            mv ${TARGET_WITH_NO_LAST_SLASH} ${TARGET_WITH_NO_LAST_SLASH}_`date '+%x%X'`
            echo "rename the old one with the sameName_currentTime successfully."
        fi
        if [ -f ${TARGET_WITH_NO_LAST_SLASH} ]; then
        # or -rf ${TARGET_WITH_NO_LAST_SLASH}
            mv ${TARGET_WITH_NO_LAST_SLASH} ${TARGET_WITH_NO_LAST_SLASH}_`date '+%x%X'`
            echo "rename the old one with the sameName_currentTime successfully."
        fi
        if [ -L ${TARGET_WITH_NO_LAST_SLASH} ]; then
        # or -rf ${TARGET_WITH_NO_LAST_SLASH}
            mv ${TARGET_WITH_NO_LAST_SLASH} ${TARGET_WITH_NO_LAST_SLASH}_`date '+%x%X'`
            echo "rename the old one with the sameName_currentTime successfully."
        fi
    done
    ORIGIN_TARGET=$@
    mv ${ORIGIN_TARGET%*/} ~/.trash/    #${ORIGIN_TARGET%*/} for removing the last slash
}
emptytrash()
{
    read -p "clear sure?[n]" confirm
    [ $confirm == 'y' ] || [ $confirm == 'Y' ]  && or -rf ~/.trash/*
}
```

如果想清空回收站彻底删除所有, 用`er`就可以了.

上文中的 ` alias or='/bin/rm' `中的 `/bin/rm` 因系统而异, 
你可以敲 `whereis rm` 命令来查看你的系统的rm在哪儿,
比如我的就是

    [b@host ~]$ whereis rm
    rm: /bin/rm /usr/share/man/man1/rm.1.gz

而有些人的却是 `/usr/bin/rm` , 那就要改成 ` alias or='/usr/bin/rm' ` 了


# 命令补全增强

首先找到 ` .inputrc `  文件, 通过

    sudo find / -name inputrc

来找到它, 如果没找到就在自己的home目录下新建一个 ` .inputrc ` 文件, 然后在` .inputrc `文件末尾加上常用的Bash定制 :

``` shell
set completion-ignore-case on  

#For single press Tab results for when a partial or no completion is possible  
set show-all-if-ambiguous on  

#For results when no completion is possible  
set show-all-if-unmodified on  

#History completion bound to arrow keys (down, up)  
"\e[A": history-search-backward  
"\e[B": history-search-forward  
```

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

**PS : 其实如果使用了上述的[Bash定制](#Bash定制)中的 ` history-search-* ` 就不需要这个 ` ctrl + r ` 了**

使用 Ctrl+r， 这个键组合是反向增量查找消息历史。很好用。 比如你很久以前输入过某个命令如。 gcc -c -DKKT - Dnnn 等等，一长串， 用上下方向键来找比较困难，这时候可以Ctrl+r，然后输入gcc很快找到该命令，重复按Ctrl+r将查找更早的历史。


# bash脚本基础

- -e filename  如果 filename存在，则为真  [ -e /var/log/syslog ]
- -d filename  如果 filename为目录，则为真  [ -d /tmp/mydir ]
- -f filename  如果 filename为常规文件，则为真  [ -f /usr/bin/grep ]
- -L filename  如果 filename为符号链接，则为真  [ -L /usr/bin/grep ]
- -r filename  如果 filename可读，则为真  [ -r /var/log/syslog ]
- -w filename  如果 filename可写，则为真  [ -w /var/mytmp.txt ]
- -x filename  如果 filename可执行，则为真  [ -L /usr/bin/grep ]
- filename1-nt filename2  如果 filename1比 filename2新，则为真  [ /tmp/install/etc/services -nt /etc/services ]
- filename1-ot filename2  如果 filename1比 filename2旧，则为真  [ /boot/bzImage -ot arch/i386/boot/bzImage ]

一个例子 :

``` shell
#!/bin/sh


BUILD_DIR=../build

if [ ! -d ${BUILD_DIR} ]; then
    mkdir ${BUILD_DIR}
else
    echo "BUILD_DIR is already exist."
fi


RTS_PATH=`cd .. && pwd`
RTS_SYMBOLIC_LINK=~/rts

if [ ! -L "$RTS_SYMBOLIC_LINK" ]; then
    ln -s $RTS_PATH $RTS_SYMBOLIC_LINK;
else
    echo "RTS_SYMBOLIC_LINK is already exist."
fi


exit 0
```