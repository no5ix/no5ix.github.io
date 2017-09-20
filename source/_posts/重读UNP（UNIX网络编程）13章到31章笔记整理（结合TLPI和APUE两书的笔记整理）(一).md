---
title: 重读UNP（UNIX网络编程）13章到31章笔记整理（结合TLPI和APUE两书的笔记整理）(一)
date: 2017-07-28 19:01:21
tags:
- UNP
- TLPI
- APUE
categories:
- linux
---

>因为UNP第三部分（第三版13-31章）的内容结合APUE（UNIX环境高级编程）和TLPI（The Linux Programming Interface）来看才能比较清晰，所以笔记整理会穿插很多这两本书的内容

# **13章**

# **引申知识，作业控制以及相关命令：**
 ![这里写图片描述](http://img.blog.csdn.net/20170730195853561?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

<!-- more -->

 - 另注：

>注：但是如上方到后台执行的进程，其父进程还是当前终端shell的进程，而一旦父进程退出，则会发送hangup信号给所有子进程，子进程收到hangup以后也会退出。



 - 13.4节：自定义一个daemon_init函数，涉及到知识点为“如何创建一个daemon（守护进程）”，实现步骤如下：
     1. fork之后杀掉父进程（此时子进程被init收养）这是为了为下一步setsid做准备，因为只有不是进程组首进程的进程才能调用setsid，
     2. setsid，创建一个新的会话并断开与之前的控制终端的关系，
     3. 再次fork并杀掉首进程， 这样就确保了子进程不是一个会话首进程， 根据linux中获取终端的规则（只有会话首进程才能请求一个控制终端）， 这样进程永远不会重新请求一个控制终端
     4. 清楚进程的umask，确保daemon创建文件和目录时拥有相应的权限
     5. 修改进程的当前工作目录， 通常修改到/目录
     6. 关闭进程所有不再需要的文件描述符
     7. 打开/dev/null使文件描述符0、1、2指向这个设备， 以防止daemon调用在这些描述符上做I/O操作的库函数而不会意外的失败




```
#include    "unp.h"
#include    <syslog.h>

#define MAXFD   64

extern int  daemon_proc;    /* defined in error.c */

int
daemon_init(const char *pname, int facility)
{
    int     i;  
    pid_t   pid;

    if ( (pid = Fork()) < 0)
        return (-1);
    else if (pid)
        _exit(0);           /* parent terminates */

    /* child 1 continues... */

    if (setsid() < 0)           /* become session leader */
        return (-1);

    Signal(SIGHUP, SIG_IGN);
    if ( (pid = Fork()) < 0)
        return (-1);
    else if (pid)
        _exit(0);           /* child 1 terminates */

    /* child 2 continues... */

    daemon_proc = 1;            /* for err_XXX() functions */

    chdir("/");             /* change working directory */

    /* close off file descriptors */
    for (i = 0; i < MAXFD; i++)
        close(i);

    /* redirect stdin, stdout, and stderr to /dev/null */
    open("/dev/null", O_RDONLY);
    open("/dev/null", O_RDWR);
    open("/dev/null", O_RDWR);

    openlog(pname, LOG_PID, facility);

    return (0);             /* success */
}

```


### **nohup和setsid用法**
>如果我们要在退出shell的时候继续运行进程，则需要使用nohup忽略hangup信号，或者setsid将父进程设为init进程；
>![这里写图片描述](http://img.blog.csdn.net/20170731003942100?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
```
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

### **disown用法**
>那么对于已经在后台运行的进程，该怎么办呢？可以使用disown命令
```
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
