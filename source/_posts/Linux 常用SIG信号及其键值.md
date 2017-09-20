---
title: Linux 常用SIG信号及其键值
date: 2015-08-04 13:08:56
tags:
- linux
- sig
categories:
- linux
---



- 01 SIGHUP 挂起（hangup）
- 02 SIGINT 中断，当用户从键盘按^c键或^break键时
- 03 SIGQUIT 退出，当用户从键盘按quit键时
- 04 SIGILL 非法指令
- 05 SIGTRAP 跟踪陷阱（trace trap），启动进程，跟踪代码的执行
- 06 SIGIOT IOT指令
- 07 SIGEMT EMT指令
- 08 SIGFPE 浮点运算溢出
- 09 SIGKILL 杀死、终止进程 
- 10 SIGBUS 总线错误
- 11 SIGSEGV 段违例（segmentation  violation），进程试图去访问其虚地址空间以外的位置
- 12 SIGSYS 系统调用中参数错，如系统调用号非法
- 13 SIGPIPE 向某个非读管道中写入数据
- 14 SIGALRM 闹钟。当某进程希望在某时间后接收信号时发此信号
- 15 SIGTERM 软件终止（software  termination）
- 16 SIGUSR1 用户自定义信号1
- 17 SIGUSR2 用户自定义信号2
- 18 SIGCLD 某个子进程死
- 19 SIGPWR 电源故障