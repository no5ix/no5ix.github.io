---
title: 重读UNP（UNIX网络编程）13章到31章笔记整理（结合TLPI和APUE两书的笔记整理）(一)
date: 2017-07-28 19:01:21
tags:
- UNP
- TLPI
- APUE
categories:
- NP
---

因为UNP第三部分（第三版13-31章）的内容结合APUE（UNIX环境高级编程）和TLPI（The Linux Programming Interface）来看才能比较清晰，所以笔记整理会穿插很多这两本书的内容

# 引申知识，作业控制以及相关命令：

 ![这里写图片描述](http://img.blog.csdn.net/20170730195853561?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

**. . .**<!-- more -->



**注:** 但是如上方到后台执行的进程，其父进程还是当前终端shell的进程，而一旦父进程退出，则会发送hangup信号给所有子进程，子进程收到hangup以后也会退出。



# 13.4节：

本节主要讲守护进程的相关知识

## 创建守护进程的步骤

自定义一个daemon_init函数，涉及到知识点为“如何创建一个daemon（守护进程）”，实现步骤如下(两fork一set, u工文dev)：

<!--
1．执行‘个fork()，之后父进程退出，子进程继续执行。（结果是daemon成为了init进程的
  子进程。）之所以要做这步是因为下面两个原因。
    假设daemon是从命令行启动的，父进程的终止会被shell发现，shell在发现之后会显
    示m另’个she[l提示符并让子进程继续在后台运行。
    子进程被确保不会成为+个进程组首进程，因为它从其父进程那里继承了进程组ID
    并且拥有了白己的唯的进程ID，而这个进程LD与继承而来的进程组ID是不同的，
    这样才能够成功地执行下面。个步骤。
2．子进程调用setsid()（参见34.3节）开启‘个新会话并释放它与控制终端之间的所有关联
  关系。
3．如果daemon从来没有打开过终端设备，那么就无需担心daemon会重新请求一个控制终
  端了。如果daemon后面可能会打开个终端设备，那么必须要采取措施来确保这个设备
  不会成为控制终端。这可以通过下面两种方式实现。
  一在所有可能应用到一个终端设备L的open()调用中指定O NOCTTY标记。
    或者更简单地说，在setsid()调用之后执行第：个fork0，然后再次让父进程退m并让
    孙子进程继续执行。这样就确保了子进程不会成为会话组饫，因此根据SystemV中获
    取终端的规则（Linux也遵循了这个规则），进程永远不会重新请求一个控制终端（参
    见34.4仃）。

    4．清除进程的umask（参见15.4.6节）以确保当daemon创建文件和目录时拥有所需的权限。
S．修改进程的当前工作目录，通常会改为根日录(／)。这样做是有必耍的，因为daemon通
  常会一直运行商垒系统关闭为止。如果daemon的当前】．作目录为可i包含／的文件系统，那
  么就无法卸载该文件系统（参见14.8.2节）。或者daemon可以将工作目录改为完成任务
  时所在的目录或在配置文件中定义的一个目录，只要包含这个口录的文件系统永远小会被
  卸载即可。如cron会将自身放在/var/spool/cron日录下。
6．关闭daemon从其父进程继承而来的所有打开着的文件描述符。（daemon可能需要保
  持继承而柬的文件描述的打开状态，因此这步是町选的或者是可变更的。）之所以
  需要这样做的原因有很多。由J。daemon失去了控制终端并且是在后台运行的，因此
  让daemon保持文件描述符0、1和2的打开状态毫无意义，因为它们指向的就是控
  制终端。此外，无法卸载长时间运行的daemon打开的文件所在的文件系统。因此，
  通常的做法是关闭所有无用的打开着的文件描述符，因为文件描述符是一种有限的
  资源。
  
  7．在关闭了文件描述符0、1和2之后，daemon通常会打开/dev/null并使用dup2()（或类似
  的函数）使所有这些描述符指向这个设备。之所以要这样做是因为下面两个原因。
    它确保了当daemon调用了在这些描述符上执行I/O的库函数时不会出乎意料地
    失败。
    一它防止了daemon后面使用描述符1或2打开…个文件的情况，因为库函数会将这些
    描述符当做标准输出和标准错误来写入数据（进而破坏了原有的数据）。
-->
        
**(1)首先要做的是调用[umask](#umask介绍)将文件模式创建屏蔽字设置为一个已知值(通常是0)。**
由继承得来的文件模式创建屏蔽字可能会被设置为拒绝某些权限。如果守护进程要创建文件，那么它可能要设置特定的权限。例如，若守护进程要创建组可读、组可写的文件，继承的文件模式创建屏蔽字可能会屏蔽上述两种权限中的一种，而使其无法发挥作用。另一方面，如果守护进程调用的库函数创建了文件，那么将文件模式创建屏蔽字设置为一个限制性更强的值（如007）可能会更明智，因为库函数可能不允许调用者通过一个显式的函数参数来设置权限。

**(2)调用fork，然后使父进程exit。**
这样做实现了下面几点。第一，如果该守护进程是作为一条简单的shell命令启动的，那么父进程终止会让shell认为这条命令已经执行完毕。
第二，虽然子进程继承了父进程的进程组ID，但获得了一个新的进程ID，这就保证了子进程不是一个进程组的组长进程。这是下面将要进行的setsid调用的先决条件。

**(3)调用setsid创建一个新会话。**
使调用进程：(a)成为新会话的首进程，(b)成为一个新进程组的组长进程．(c)没有控制终端。

**(4)再次fork并杀掉首进程.**
这样就确保了子进程不是一个会话首进程， 根据linux中获取终端的规则（只有会话首进程才能请求一个控制终端）， 这样进程永远不会重新请求一个控制终端

**(5)将当前工作目录更改为根目录。**
从父进程处继承过来的当前工作目录可能在一个挂载的文件系统中。因为守护进程通常在系统再引导之前是一直存在的，所以如果守护进程的当前工作目录在一个挂载文件系统中，那么该文件系统就不能被卸载。
或者，某些守护进程还可能会把、与前工作目录更改到某个指定位置，并在此位置进行它们的
全部工作。例如，行式打印机假脱机守护进程就可能将其工作目录更改到它们的spool目录上。

**(6)关闭不再需要的文件描述符。**
这使守护进程不再持有从其父进程继承来的任何文件描述符（父进程可能是shell进程，或某个其他进程）。
可以使用open_max函数（见2.17节）或
getrlimit函数（见7.11节）来判定最高文件描述符值，并关闭直到该值的所有描述符。

**(7)某些守护进程打开/dev/null使其具有文件描述符0、l和2．这样，任何一个试图读标准输入、写标准输出或标准错误的库例程都不会产生任何效果。**
因为守护进程并不与终端设备相关联，所以其输出无处显示，也无处从交互式用户那里接收输入。
即使守护进程是从交互式会话启动的，但是守护进程是在后台运行的，所以登录会话的终止并不影响守护进程。如果其他用户在同一终端设备上登录，我们不希望在该终端上见到守护进程的输出，用户也不期望他们在终端上的输入被守护进程读取。


## umask介绍

当我们登录系统之后创建一个文件总是有一个默认权限的，那么这个权限是怎么来的呢？这就是umask干的事情。umask设置了用户创建文件的默认 权限，它与chmod的效果刚好相反，umask设置的是权限“补码”，而chmod设置的是文件权限码。

### 如何计算umask

umask 命令允许你设定文件创建时的缺省模式，对应每一类用户(文件属主、同组用户、其他用户)存在一个相应的umask值中的数字。对于文件来说，这一数字的最 大值分别是6。系统不允许你在创建一个文本文件时就赋予它执行权限，必须在创建后用chmod命令增加这一权限。目录则允许设置执行权限，这样针对目录来 说，umask中各个数字最大可以到7。

例如，对于umask值0 0 2，相应的文件和目录缺省创建权限是什么呢？

第一步，我们首先写下目录具有全部权限的模式，即777 (所有用户都具有读、写和执行权限)。
第二步，在下面一行按照umask值写下相应的位，在本例中是0 0 2。
第三步，在接下来的一行中记下上面两行中没有匹配的位。这就是目录的缺省创建权限。
稍加练习就能够记住这种方法。
第四步，对于文件来说，在创建时不能具有执行权限，只要拿掉相应的执行权限比特即可。
这就是上面的例子， 其中umask值为0 0 2：
1) 文件的最大权限 rwx rwx rwx (777)
2) umask值为0 0 2 --- --- -w-
3) 目录权限 rwx rwx r-x (775) 这就是目录创建缺省权限
4) 文件权限 rw- rw- r-- (664) 这就是文件创建缺省权限

下面是另外一个例子，假设这次u m a s k值为0 2 2：
1) 文件的最大权限 rwx rwx rwx (777)
2 ) u m a s k值为0 2 2 --- -w- -w-
3) 目录权限 rwx r-x r-x (755) 这就是目录创建缺省权限
4) 文件权限 rw- r-- r-- (644) 这就是文件创建缺省权限

## 创建守护进程的例子程序


下面是becomeDaemon()函数的实现，becomeDaeomon()函数接收一个位掩码参数flags，它允许调用者有选择地执行其中的步
骤，具体可参考注释。

become_daemon.h

``` c
#ifndef BECOME_DAEMON_H             /* Prevent double inclusion */
#define BECOME_DAEMON_H

/* Bit-mask values for 'flags' argument of becomeDaemon() */

#define BD_NO_CHDIR           01    /* Don't chdir("/") */
#define BD_NO_CLOSE_FILES     02    /* Don't close all open files */
#define BD_NO_REOPEN_STD_FDS  04    /* Don't reopen stdin, stdout, and
                                       stderr to /dev/null */
#define BD_NO_UMASK0         010    /* Don't do a umask(0) */

#define BD_MAX_CLOSE  8192          /* Maximum file descriptors to close if
                                       sysconf(_SC_OPEN_MAX) is indeterminate */

int becomeDaemon(int flags);

#endif
```

become_daemon.c

``` c
#include <sys/stat.h>
#include <fcntl.h>
#include "become_daemon.h"
#include "tlpi_hdr.h"

int                                     /* Returns 0 on success, -1 on error */
becomeDaemon(int flags)
{
    int maxfd, fd;

    switch (fork()) {                   /* Become background process */
    case -1: return -1;
    case 0:  break;                     /* Child falls through... */
    default: _exit(EXIT_SUCCESS);       /* while parent terminates */
    }

    if (setsid() == -1)                 /* Become leader of new session */
        return -1;

    switch (fork()) {                   /* Ensure we are not session leader */
    case -1: return -1;
    case 0:  break;
    default: _exit(EXIT_SUCCESS);
    }

    if (!(flags & BD_NO_UMASK0))
        umask(0);                       /* Clear file mode creation mask */

    if (!(flags & BD_NO_CHDIR))
        chdir("/");                     /* Change to root directory */

    if (!(flags & BD_NO_CLOSE_FILES)) { /* Close all open files */
        maxfd = sysconf(_SC_OPEN_MAX);
        if (maxfd == -1)                /* Limit is indeterminate... */
            maxfd = BD_MAX_CLOSE;       /* so take a guess */

        for (fd = 0; fd < maxfd; fd++)
            close(fd);
    }

    if (!(flags & BD_NO_REOPEN_STD_FDS)) {
        close(STDIN_FILENO);            /* Reopen standard fd's to /dev/null */

        fd = open("/dev/null", O_RDWR);

        if (fd != STDIN_FILENO)         /* 'fd' should be 0 */
            return -1;
        if (dup2(STDIN_FILENO, STDOUT_FILENO) != STDOUT_FILENO)
            return -1;
        if (dup2(STDIN_FILENO, STDERR_FILENO) != STDERR_FILENO)
            return -1;
    }

    return 0;
}


```

# nohup和setsid用法

如果我们要在退出shell的时候继续运行进程，则需要使用nohup忽略hangup信号，或者setsid将父进程设为init进程；
![这里写图片描述](http://img.blog.csdn.net/20170731003942100?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

``` sh
b@b-VirtualBox:~/my_temp_test$ nohup ./o_multi_thread_process &
[1] 3487
b@b-VirtualBox:~/my_temp_test$ nohup: ignoring input and appending output to ‘nohup.out’
^C
b@b-VirtualBox:~/my_temp_test$ jobs
[1]+  Running                 nohup ./o_multi_thread_process &
b@b-VirtualBox:~/my_temp_test$ ps -ef | grep multi
b         3487  3004  0 20:05 pts/3    00:00:00 ./o_multi_thread_process
b         3488  3487  0 20:05 pts/3    00:00:00 ./o_multi_thread_process
b         3491  3004  0 20:05 pts/3    00:00:00 grep --color=auto multi
b@b-VirtualBox:~/my_temp_test$ bg %1
bash: bg: job 1 already in background
b@b-VirtualBox:~/my_temp_test$ fg %1
nohup ./o_multi_thread_process
^Z
[1]+  Stopped                 nohup ./o_multi_thread_process
b@b-VirtualBox:~/my_temp_test$ bg %1
[1]+ nohup ./o_multi_thread_process &
b@b-VirtualBox:~/my_temp_test$ jobs -l
[1]+  3487 Running                 nohup ./o_multi_thread_process &
b@b-VirtualBox:~/my_temp_test$ fg %1
nohup ./o_multi_thread_process
^C
b@b-VirtualBox:~/my_temp_test$ jobs
b@b-VirtualBox:~/my_temp_test$ ps -ef | grep multi
b         3499  3004  0 20:11 pts/3    00:00:00 grep --color=auto multi
b@b-VirtualBox:~/my_temp_test$ setsid ./o_multi_thread_process &
[1] 3502
b@b-VirtualBox:~/my_temp_test$ ProcessA: 3503 step1
ProcessA: 3503 thread 139947724490496 step2
ProcessA: 3503 thread 139947724490496 step3
ProcessB: 3504 step1
ProcessB: 3504 step2
ProcessB: 3504 step3
^C
[1]+  Done                    setsid ./o_multi_thread_process
b@b-VirtualBox:~/my_temp_test$ ps -ef | grep multi
b         3503  1256  0 20:12 ?        00:00:00 ./o_multi_thread_process
b         3504  3503  0 20:12 ?        00:00:00 ./o_multi_thread_process
b         3507  3004  0 20:12 pts/3    00:00:00 grep --color=auto multi
b@b-VirtualBox:~/my_temp_test$ jobs

```

# disown用法

那么对于已经在后台运行的进程，如果我们要在退出shell的时候继续运行进程, 该怎么办呢？可以使用disown命令

``` sh
b@b-VirtualBox:~/my_temp_test$ ./o_multi_thread_process &
[1] 3523
b@b-VirtualBox:~/my_temp_test$ ProcessA: 3523 step1
ProcessA: 3523 thread 140501901821696 step2
ProcessA: 3523 thread 140501901821696 step3
ProcessB: 3524 step1
ProcessB: 3524 step2
ProcessB: 3524 step3
^C
b@b-VirtualBox:~/my_temp_test$ jobs -l
[1]+  3523 Running                 ./o_multi_thread_process &
b@b-VirtualBox:~/my_temp_test$ disown -h %1
b@b-VirtualBox:~/my_temp_test$ jobs
[1]+  Running                 ./o_multi_thread_process &

```
