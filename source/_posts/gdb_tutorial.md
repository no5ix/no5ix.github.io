---
title: GDB基础教程
date: 2015-02-02 12:18:54
tags:
- gdb
categories:
- 杂
---

# GDB 操作提示

在编译可执行文件时需要给 gcc 加上 "-g" 选项，这样它才会为生成的可执行文件加入额外的调试信息。
不要使用编译器的优化选项，比如： "-O"，"-O2"。因为编译器会为了优化而改变程序流程，那样不利于调试。
在 GDB 中执行 shell 命令可以使用：shell command
GDB 命令可以使用 TAB 键来补全。按两次 TAB 键可以看到所有可能的匹配。
GDB 命令缩写：例如 info bre 中的 bre 相当于 breakpoints。

# 启动GDB

- gdb executable
- gdb -e executable -c core-file
- gdb executable -pid process-id （使用ps相关命令可以查看进程的 pid）

# GDB常用命令

- help	列出 gdb 帮助信息。
- info+subcommand , 比如 :
	- info breakpoints	列出断点。
	- info watchpoints	列出观察点。
	- info threads	列出当前的线程。
	- info locals	列出Local variables of current stack frame
- step(简写一个s也可)		进入下一行代码的执行，会进入函数内部。
- next(简写一个n也可)		执行下一行代码。但不会进入函数内部。
- continue(c)	继续执行直到下一个断点或观察点。
- kill	停止程序执行。
- quit(q)	退出 GDB调试器
- run(r)	从头开始执行程序，也允许进行重定向。
- print(p) variable	打印指定变量的值。
	- p variable
	- p file::variable
	- p 'file'::variable	
	- 

# GDB帮助

GDB的命令很多, 有些用得少的命令记不住的话, 可以在进入GDB之后敲 "help", 然后再敲 "help + command_class", 
比如 :


**(gdb) help**
List of classes of commands:

aliases -- Aliases of other commands
breakpoints -- Making program stop at certain points
data -- Examining data
files -- Specifying and examining files
internals -- Maintenance commands
obscure -- Obscure features
running -- Running the program
stack -- Examining the stack
status -- Status inquiries
support -- Support facilities
tracepoints -- Tracing of program execution without stopping the program
user-defined -- User-defined commands

Type "help" followed by a class name for a list of commands in that class.
Type "help all" for the list of all commands.
Type "help" followed by command name for full documentation.
Type "apropos word" to search for commands related to "word".
Command name abbreviations are allowed if unambiguous.

**(gdb) help running **
Running the program.

List of commands:

advance -- Continue the program up to the given location (same form as args for break command)
attach -- Attach to a process or file outside of GDB
continue -- Continue program being debugged
detach -- Detach a process or file previously attached
detach checkpoint -- Detach from a checkpoint (experimental)
detach inferiors -- Detach from inferior ID (or list of IDS)
disconnect -- Disconnect from a target
finish -- Execute until selected stack frame returns
handle -- Specify how to handle signals
inferior -- Use this command to switch between inferiors
interrupt -- Interrupt the execution of the debugged program
jump -- Continue program being debugged at specified line or address
kill -- Kill execution of program being debugged
kill inferiors -- Kill inferior ID (or list of IDs)
next -- Step program
nexti -- Step one instruction
reverse-continue -- Continue program being debugged but run it in reverse
reverse-finish -- Execute backward until just before selected stack frame is called
reverse-next -- Step program backward
reverse-nexti -- Step backward one instruction
reverse-step -- Step program backward until it reaches the beginning of another source line
reverse-stepi -- Step backward exactly one instruction
run -- Start debugged program
...

