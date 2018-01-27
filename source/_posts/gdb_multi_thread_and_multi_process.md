---
title: gdb多进程多线程调试实战
date: 2015-08-31 14:20:23
tags: 
- gdb
categories:
- linux
---

# gdb多进程/多线程调试实战例子

在gcc编译的时候，记得附加 -lpthread参数, 否则会出现 undefined reference to 'pthread_create' 的错误.
(因为在链接的时候，无法找到phread库中哥函数的入口地址，于是链接会失败。)

## 例程

``` c
#include <stdio.h>
#include <pthread.h>
#include <unistd.h>

void processA();
void processB();
void *processAworker(void *arg);

int main(int argc, const char *argv[])
{
		int pid;

		pid = fork();

		if (pid != 0)
				processA();
		else
				processB();

		return 0;
}

void processA()
{
		pid_t pid = getpid();
		char prefix[] = "ProcessA: ";
		char tprefix[] = "thread ";
		int tstatus;
		pthread_t pt;

		printf("%s%lu %s\n", prefix, pid, "step1");

		tstatus = pthread_create(&pt, NULL, processAworker, NULL);
		if (tstatus != 0)
		{
				printf("ProcessA: Can not create new thread.");
		}

		processAworker(NULL);
		sleep(1);
}

void *processAworker(void *arg)
{
		pid_t pid = getpid();
		pthread_t tid = pthread_self();
		char prefix[] = "ProcessA: ";
		char tprefix[] = "thread ";

		printf("%s%lu %s%lu %s\n", prefix, pid, tprefix, tid, "step2");
		printf("%s%lu %s%lu %s\n", prefix, pid, tprefix, tid, "step3");

		return NULL;
}

void processB()
{
		pid_t pid = getpid();
		char prefix[] = "ProcessB: ";
		printf("%s%lu %s\n", prefix, pid, "step1");
		printf("%s%lu %s\n", prefix, pid, "step2");
		printf("%s%lu %s\n", prefix, pid, "step3");
}
```



## 输出


	[cnwuwil@centos c-lab]$ ./test
	ProcessA: 802 step1
	ProcessB: 803 step1
	ProcessB: 803 step2
	ProcessB: 803 step3
	ProcessA: 802 thread 3077555904 step2
	ProcessA: 802 thread 3077555904 step3
	ProcessA: 802 thread 3077553008 step2
	ProcessA: 802 thread 3077553008 step3



# gdb多进程调试命令

- set follow-fork-mode [parent|child]   set detach-on-fork [on|off]

|follow-fork-mode | detach-on-fork  | 说明
| --------------- |:---------------:| -----|
|parent           |       on        |        只调试主进程（GDB默认）
|child            |        on       |        只调试子进程
|parent           |       off       |       同时调试两个进程，gdb跟主进程，子进程block在fork位置
|child            |        off      |        同时调试两个进程，gdb跟子进程，主进程block在fork位置


- 查询正在调试的进程：info inferiors
- 切换调试的进程： inferior +inferior number
- catch fork命令可以捕获进程的创建
- attach + pid ， 可以附到一个正在运行的进程上进行调试

... <!-- more -->

# gdb多线程调试命令

- show scheduler-locking  //显示当前scheduler-locking
- set scheduler-locking [on/off/step]  //设置scheduler-locking
	- on：只有当前调试线程运行，其他线程处于暂停状态。
	- off：当前调试线程外的其他线程一直在正常运行。
	- step：其他线程跟随当前调试线程运行，但具体怎么协同运行，测试中无法体现。
	- 注意：set scheduler-locking要处于线程运行环境下才能生效，也就是程序已经运行并且暂停在某个断点处，否则会出现“Target 'exec' cannot support this command.”这样的错误；而且经过测试，设置后的scheduler-locking值在整个进程内有效，不属于某个线程。
- 查询线程：info threads
- 切换调试线程：thread + thread_number


## 实战调试1

1.调试主进程，block子进程。


	
	(gdb) set detach-on-fork off
	
	(gdb) show detach-on-fork
	Whether gdb will detach the child of a fork is off.
	
	(gdb) catch fork
	Catchpoint 1 (fork)
	
	(gdb) r
	[Thread debugging using libthread_db enabled]

	Catchpoint 1 (forked process 3475), 0x00110424 in __kernel_vsyscall ()
	Missing separate debuginfos, use: debuginfo-install glibc-2.12-1.47.el6.i686
	
	(gdb) break test.c:14
	Breakpoint 2 at 0x8048546: file test.c, line 14.
	
	(gdb) cont
	[New process 3475]
	[Thread debugging using libthread_db enabled]

	Breakpoint 2, main (argc=1, argv=0xbffff364) at test.c:14
	Missing separate debuginfos, use: debuginfo-install glibc-2.12-1.47.el6.i686
	
	(gdb) info inferiors
		Num  Description       Executable       
		2    process 3475      /home/cnwuwil/labs/c-lab/test
	* 1    process 3472      /home/cnwuwil/labs/c-lab/test


2.切换到子进程：


	
	(gdb) inferior 2
	[Switching to inferior 2 [process 3475] (/home/cnwuwil/labs/c-lab/test)]
	[Switching to thread 2 (Thread 0xb7fe86c0 (LWP 3475))]
	#0  0x00110424 in ?? ()
	
	(gdb) info inferiors
		Num  Description       Executable       
	* 2    process 3475      /home/cnwuwil/labs/c-lab/test
		1    process 3472      /home/cnwuwil/labs/c-lab/test
	
	(gdb) inferior 1
	[Switching to inferior 1 [process 3472] (/home/cnwuwil/labs/c-lab/test)]
	[Switching to thread 1 (Thread 0xb7fe86c0 (LWP 3472))]
	#0  main (argc=1, argv=0xbffff364) at test.c:14
	
	(gdb) info inferiors
		Num  Description       Executable       
		2    process 3475      /home/cnwuwil/labs/c-lab/test
	* 1    process 3472      /home/cnwuwil/labs/c-lab/test


3.设断点继续调试主进程，主进程产生两个子线程：


	
	(gdb) break test.c:50
	Breakpoint 3 at 0x804867d: file test.c, line 50. (2 locations)
	
	(gdb) cont
	ProcessA: 3472 step1
	[New Thread 0xb7fe7b70 (LWP 3562)]
	ProcessA: 3472 thread 3086911168 step2

	Breakpoint 3, processAworker (arg=0x0) at test.c:50
	
	(gdb) info inferiors
		Num  Description       Executable       
		2    process 3475      /home/cnwuwil/labs/c-lab/test
	* 1    process 3472      /home/cnwuwil/labs/c-lab/test
	
	(gdb) info threads
		3 Thread 0xb7fe7b70 (LWP 3562)  0x00110424 in __kernel_vsyscall ()
		2 Thread 0xb7fe86c0 (LWP 3475)  0x00110424 in ?? ()
	* 1 Thread 0xb7fe86c0 (LWP 3472)  processAworker (arg=0x0) at test.c:50


4.切换到主进程中的子线程，注意：线程2为前面产生的子进程


	
	(gdb) thread 3
	[Switching to thread 3 (Thread 0xb7fe7b70 (LWP 3562))]#0  0x00110424 in __kernel_vsyscall ()
	
	(gdb) cont
	ProcessA: 3472 thread 3086911168 step3
	ProcessA: 3472 thread 3086908272 step2
	[Switching to Thread 0xb7fe7b70 (LWP 3562)]

	Breakpoint 3, processAworker (arg=0x0) at test.c:50
	
	(gdb) info threads
	* 3 Thread 0xb7fe7b70 (LWP 3562)  processAworker (arg=0x0) at test.c:50
		2 Thread 0xb7fe86c0 (LWP 3475)  0x00110424 in ?? ()
		1 Thread 0xb7fe86c0 (LWP 3472)  0x00110424 in __kernel_vsyscall ()
	
	(gdb) thread 1


## 实战调试2


	b@b-VirtualBox:~/Documents/temp_test$ sudo gdb ./o_multi_thread_process 
	[sudo] password for b: 
	GNU gdb (Ubuntu 7.7.1-0ubuntu5~14.04.2) 7.7.1
	Copyright (C) 2014 Free Software Foundation, Inc.
	License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
	This is free software: you are free to change and redistribute it.
	There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
	and "show warranty" for details.
	This GDB was configured as "x86_64-linux-gnu".
	Type "show configuration" for configuration details.
	For bug reporting instructions, please see:
	<http://www.gnu.org/software/gdb/bugs/>.
	Find the GDB manual and other documentation resources online at:
	<http://www.gnu.org/software/gdb/documentation/>.
	For help, type "help".
	Type "apropos word" to search for commands related to "word"...
	Reading symbols from ./o_multi_thread_process...done.
	
	(gdb) attach 3027
	Attaching to program: /home/b/Documents/temp_test/o_multi_thread_process, process 3027
	Reading symbols from /lib/x86_64-linux-gnu/libpthread.so.0...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libpthread-2.19.so...done.
	done.
	[New LWP 3029]
	[Thread debugging using libthread_db enabled]
	Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
	Loaded symbols for /lib/x86_64-linux-gnu/libpthread.so.0
	Reading symbols from /lib/x86_64-linux-gnu/libc.so.6...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/libc-2.19.so...done.
	done.
	Loaded symbols for /lib/x86_64-linux-gnu/libc.so.6
	Reading symbols from /lib64/ld-linux-x86-64.so.2...Reading symbols from /usr/lib/debug//lib/x86_64-linux-gnu/ld-2.19.so...done.
	done.
	Loaded symbols for /lib64/ld-linux-x86-64.so.2
	0x00007f5c9acb8dfd in nanosleep () at ../sysdeps/unix/syscall-template.S:81
	81	../sysdeps/unix/syscall-template.S: No such file or directory.
	
	(gdb) set follow-fork-mode parent 
	
	(gdb) set detach-on-fork off
	
	(gdb) catch fork
	Catchpoint 1 (fork)
	
	(gdb) r
	Starting program: /home/b/Documents/temp_test/o_multi_thread_process 
	[Thread debugging using libthread_db enabled]
	Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".

	Catchpoint 1 (forked process 3002), 0x00007ffff78b7ee4 in __libc_fork ()
			at ../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c:130
	130	../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c: No such file or directory.
	
	(gdb) info inferiors 
		Num  Description       Executable        
	* 1    process 2998      /home/b/Documents/temp_test/o_multi_thread_process 
	
	(gdb) b 14
	Breakpoint 2 at 0x7ffff78b7f5b: file ../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c, line 14.
	
	(gdb) info breakpoints 
	Num     Type           Disp Enb Address            What
	1       catchpoint     keep y                      fork, process 3002 
		catchpoint already hit 1 time
	2       breakpoint     keep y   0x00007ffff78b7f5b in __libc_fork 
																										at ../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c:14
	
	(gdb) d 2
	
	(gdb) info breakpoints 
	Num     Type           Disp Enb Address            What
	1       catchpoint     keep y                      fork, process 3002 
		catchpoint already hit 1 time
	
	(gdb) b multi_thread_process.cpp : 14
	Breakpoint 3 at 0x4007f4: file ./multi_thread_process.cpp, line 14.
	
	(gdb) c
	Continuing.
	[New process 3002]
	[Thread debugging using libthread_db enabled]
	Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
	Reading symbols from /usr/lib/debug/lib/x86_64-linux-gnu/libpthread-2.19.so...done.
	Reading symbols from /usr/lib/debug/lib/x86_64-linux-gnu/libc-2.19.so...done.
	Reading symbols from /usr/lib/debug/lib/x86_64-linux-gnu/ld-2.19.so...done.

	Breakpoint 3, main (argc=1, argv=0x7fffffffe598) at ./multi_thread_process.cpp:15
	15	  if(pid != 0)
	
	(gdb) info inferiors 
		Num  Description       Executable        
		2    process 3002      /home/b/Documents/temp_test/o_multi_thread_process 
	* 1    process 2998      /home/b/Documents/temp_test/o_multi_thread_process 
	
	(gdb) inferior 2
	[Switching to inferior 2 [process 3002] (/home/b/Documents/temp_test/o_multi_thread_process)]
	[Switching to thread 2 (Thread 0x7ffff7fdf740 (LWP 3002))] 
	0  0x00007ffff78b7ee4 in __libc_fork () at ../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c:130
	130	../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c: No such file or directory.
	
	(gdb) set scheduler-locking on
	
	(gdb) b multi_thread_process.cpp : 50
	Breakpoint 4 at 0x400916: multi_thread_process.cpp:50. (2 locations)
	
	(gdb) info threads 
		Id   Target Id         Frame 
	* 2    Thread 0x7ffff7fdf740 (LWP 3002) "o_multi_thread_" 0x00007ffff78b7ee4 in __libc_fork ()
			at ../nptl/sysdeps/unix/sysv/linux/x86_64/../fork.c:130
		1    Thread 0x7ffff7fdf740 (LWP 2998) "o_multi_thread_" main (argc=1, argv=0x7fffffffe598)
			at ./multi_thread_process.cpp:15
	
	(gdb) c
	Continuing.

	Breakpoint 3, main (argc=1, argv=0x7fffffffe598) at ./multi_thread_process.cpp:15
	15	  if(pid != 0)
	
	(gdb) info threads 
		Id   Target Id         Frame 
	* 2    Thread 0x7ffff7fdf740 (LWP 3002) "o_multi_thread_" main (argc=1, argv=0x7fffffffe598)
			at ./multi_thread_process.cpp:15
		1    Thread 0x7ffff7fdf740 (LWP 2998) "o_multi_thread_" main (argc=1, argv=0x7fffffffe598)
			at ./multi_thread_process.cpp:15
	
	(gdb) c
	Continuing.
	ProcessB: 3002 step1
	ProcessB: 3002 step2
	ProcessB: 3002 step3
	^C
	Program received signal SIGINT, Interrupt.
	0x00007ffff78b7de0 in __nanosleep_nocancel () at ../sysdeps/unix/syscall-template.S:81
	81	../sysdeps/unix/syscall-template.S: No such file or directory.
	
	(gdb) info threads 
		Id   Target Id         Frame 
	* 2    Thread 0x7ffff7fdf740 (LWP 3002) "o_multi_thread_" 0x00007ffff78b7de0 in __nanosleep_nocancel ()
			at ../sysdeps/unix/syscall-template.S:81
		1    Thread 0x7ffff7fdf740 (LWP 2998) "o_multi_thread_" main (argc=1, argv=0x7fffffffe598)
			at ./multi_thread_process.cpp:15
	
	(gdb) info inferiors 
		Num  Description       Executable        
	* 2    process 3002      /home/b/Documents/temp_test/o_multi_thread_process 
		1    process 2998      /home/b/Documents/temp_test/o_multi_thread_process 
	
	(gdb) inferior 1
	[Switching to inferior 1 [process 2998] (/home/b/Documents/temp_test/o_multi_thread_process)]
	[Switching to thread 1 (Thread 0x7ffff7fdf740 (LWP 2998))] 
	0  main (argc=1, argv=0x7fffffffe598) at ./multi_thread_process.cpp:15
	15	  if(pid != 0)
	
	(gdb) list
	10	  {
	11	  int pid;
	12	
	13	  pid = fork();
	14	
	15	  if(pid != 0)
	16	    processA();
	17	  else
	18	    processB();
	19	
	
	(gdb) r
	The program being debugged has been started already.
	Start it from the beginning? (y or n) n
	Program not restarted.
	
	(gdb) c
	Continuing.
	ProcessA: 2998 step1
	[New Thread 0x7ffff77f6700 (LWP 3017)]
	^C
	Program received signal SIGINT, Interrupt.
	0x00007ffff78b7dfd in nanosleep () at ../sysdeps/unix/syscall-template.S:81
	81	../sysdeps/unix/syscall-template.S: No such file or directory.
	
	(gdb) info threads 
		Id   Target Id         Frame 
		3    Thread 0x7ffff77f6700 (LWP 3017) "o_multi_thread_" clone () at ../sysdeps/unix/sysv/linux/x86_64/clone.S:81
		2    Thread 0x7ffff7fdf740 (LWP 3002) "o_multi_thread_" 0x00007ffff78b7de0 in __nanosleep_nocancel ()
			at ../sysdeps/unix/syscall-template.S:81
	* 1    Thread 0x7ffff7fdf740 (LWP 2998) "o_multi_thread_" 0x00007ffff78b7dfd in nanosleep ()
			at ../sysdeps/unix/syscall-template.S:81
	
	(gdb) 



# 参考

[参考](http://blog.csdn.net/pbymw8iwm/article/details/7876797)