---
title: 基于ucontext实现协程
date: 2021-03-17 02:47:54
tags:
- Coroutine
categories:
- Misc
---


# 干货写在前面
---------

协程的概念就不详细介绍了,不清楚的同学可以自己google,windows和unix like系统
本身就提供了协程的支持,windows下叫fiber,unix like系统下叫ucontext.


协程是一种用户态的轻量级线程。本篇主要研究协程的 C/C++ 的实现。  
首先我们可以看看有哪些语言已经具备协程语义：

*   比较重量级的有 C#、erlang、golang*
*   轻量级有 python、lua、javascript、ruby
*   还有函数式的 scala、scheme 等。

c/c++ 不直接支持协程语义，但有不少开源的协程库，如：  
Protothreads：[一个 “蝇量级” C 语言协程库](http://coolshell.cn/articles/10975.html)  
libco: [来自腾讯的开源协程库 libco 介绍](http://www.cnblogs.com/bangerlee/p/4003160.html)，[官网](http://code.tencent.com/libco.html)  
coroutine: [云风的一个 C 语言同步协程库](https://github.com/cloudwu/coroutine/), [详细信息](http://blog.codingnow.com/2012/07/c_coroutine.html)

目前看到大概有四种实现协程的方式：

*   第一种：利用 glibc 的 ucontext 组件 (云风的库)
*   第二种：使用汇编代码来切换上下文 ([实现 c 协程](http://www.cnblogs.com/sniperHW/archive/2012/06/19/2554574.html))
*   第三种：利用 C 语言语法 switch-case 的奇淫技巧来实现（Protothreads)
*   第四种：利用了 C 语言的 setjmp 和 longjmp（ [一种协程的 C/C++ 实现](http://www.cnblogs.com/Pony279/p/3903048.html), 要求函数里面使用 static local 的变量来保存协程内部的数据）

本篇主要使用 ucontext 来实现简单的协程库。


**. . .**<!-- more -->


# ucontext 初接触
--------------

利用 ucontext 提供的四个函数`getcontext(),setcontext(),makecontext(),swapcontext()`可以在一个进程中实现用户级的线程切换。

本节我们先来看 ucontext 实现的一个简单的例子：

``` cpp
#include <stdio.h>
#include <ucontext.h>
#include <unistd.h>
 
int main(int argc, const char *argv[]){
    ucontext_t context;
 
    getcontext(&context);
    puts("Hello world");
    sleep(1);
    setcontext(&context);
    return 0;
}
```

注：示例代码来自[维基百科](http://en.wikipedia.org/wiki/Setcontext).

保存上述代码到`example.c`, 执行编译命令：

```
gcc example.c -o example
```

想想程序运行的结果会是什么样？

```
cxy@ubuntu:~$ ./example 
Hello world
Hello world
Hello world
Hello world
Hello world
Hello world
Hello world
^C
cxy@ubuntu:~$
```

  
上面是程序执行的部分输出，不知道是否和你想得一样呢？我们可以看到，程序在输出第一个 “Hello world"后并没有退出程序，而是持续不断的输出”Hello world“。其实是程序通过 getcontext 先保存了一个上下文, 然后输出"Hello world", 在通过 setcontext 恢复到 getcontext 的地方，重新执行代码，所以导致程序不断的输出”Hello world“，在我这个菜鸟的眼里，这简直就是一个神奇的跳转。

**那么问题来了，ucontext 到底是什么？**

# ucontext 组件到底是什么
------------------

在类 System V 环境中, 在头文件 <ucontext.h> 中定义了两个结构类型，`mcontext_t`和`ucontext_t`和四个函数`getcontext(),setcontext(),makecontext(),swapcontext()`. 利用它们可以在一个进程中实现用户级的线程切换。

`mcontext_t`类型与机器相关，并且不透明.`ucontext_t`结构体则至少拥有以下几个域:

``` cpp
typedef struct ucontext {
               struct ucontext *uc_link;
               sigset_t         uc_sigmask;
               stack_t          uc_stack;
               mcontext_t       uc_mcontext;
               ...
           } ucontext_t;
```

当当前上下文 (如使用 makecontext 创建的上下文）运行终止时系统会恢复`uc_link`指向的上下文；`uc_sigmask`为该上下文中的阻塞信号集合；`uc_stack`为该上下文中使用的栈；`uc_mcontext`保存的上下文的特定机器表示，包括调用线程的特定寄存器等。

下面详细介绍四个函数：

```
int getcontext(ucontext_t *ucp);
```

初始化 ucp 结构体，将当前的上下文保存到 ucp 中

```
int setcontext(const ucontext_t *ucp);
```

设置当前的上下文为 ucp，setcontext 的上下文 ucp 应该通过 getcontext 或者 makecontext 取得，如果调用成功则不返回。如果上下文是通过调用 getcontext() 取得, 程序会继续执行这个调用。如果上下文是通过调用 makecontext 取得, 程序会调用 makecontext 函数的第二个参数指向的函数，如果 func 函数返回, 则恢复 makecontext 第一个参数指向的上下文第一个参数指向的上下文 context_t 中指向的 uc_link. 如果 uc_link 为 NULL, 则线程退出。

```
void makecontext(ucontext_t *ucp, void (*func)(), int argc, ...);
```

makecontext 修改通过 getcontext 取得的上下文 ucp(这意味着**调用 makecontext 前必须先调用 getcontext**)。然后给该上下文指定一个栈空间 ucp->stack，设置后继的上下文 ucp->uc_link.

当上下文通过 setcontext 或者 swapcontext 激活后，执行 func 函数，argc 为 func 的参数个数，后面是 func 的参数序列。当 func 执行返回后，继承的上下文被激活，如果继承上下文为 NULL 时，线程退出。

```
int swapcontext(ucontext_t *oucp, ucontext_t *ucp);
```

保存当前上下文到 oucp 结构体中，然后激活 upc 上下文。

如果执行成功，getcontext 返回 0，setcontext 和 swapcontext 不返回；如果执行失败，getcontext,setcontext,swapcontext 返回 - 1，并设置对于的 errno.

简单说来， `getcontext`获取当前上下文，`setcontext`设置当前上下文，`swapcontext`切换上下文，`makecontext`创建一个新的上下文。

# 小试牛刀 - 使用 ucontext 组件实现线程切换
------------------------------

虽然我们称协程是一个用户态的轻量级线程，但实际上多个协程同属一个线程。任意一个时刻，同一个线程不可能同时运行两个协程。如果我们将协程的调度简化为：主函数调用协程 1，运行协程 1 直到协程 1 返回主函数，主函数在调用协程 2，运行协程 2 直到协程 2 返回主函数。示意步骤如下：

```
执行主函数
    切换：主函数 --> 协程1
    执行协程1
    切换：协程1  --> 主函数
    执行主函数
    切换：主函数 --> 协程2
    执行协程2
    切换协程2  --> 主函数
    执行主函数
    ...
```

这种设计的关键在于实现主函数到一个协程的切换，然后从协程返回主函数。这样无论是一个协程还是多个协程都能够完成与主函数的切换，从而实现协程的调度。

实现用户线程的过程是：

1.  我们首先调用 getcontext 获得当前上下文
2.  修改当前上下文 ucontext_t 来指定新的上下文，如指定栈空间及其大小，设置用户线程执行完后返回的后继上下文（即主函数的上下文）等
3.  调用 makecontext 创建上下文，并指定用户线程中要执行的函数
4.  切换到用户线程上下文去执行用户线程（如果设置的后继上下文为主函数，则用户线程执行完后会自动返回主函数）。

下面代码`context_test`函数完成了上面的要求。

``` cpp
#include <ucontext.h>
#include <stdio.h>
 
void func1(void * arg)
{
    puts("1");
    puts("11");
    puts("111");
    puts("1111");
 
}
void context_test()
{
    char stack[1024*128];
    ucontext_t child,main;
 
    getcontext(&child); //获取当前上下文
    child.uc_stack.ss_sp = stack;//指定栈空间
    child.uc_stack.ss_size = sizeof(stack);//指定栈空间大小
    child.uc_stack.ss_flags = 0;
    child.uc_link = &main;//设置后继上下文
 
    makecontext(&child,(void (*)(void))func1,0);//修改上下文指向func1函数
 
    swapcontext(&main,&child);//切换到child上下文，保存当前上下文到main
    puts("main");//如果设置了后继上下文，func1函数指向完后会返回此处
}
 
int main()
{
    context_test();
 
    return 0;
}
```

在 context_test 中，创建了一个用户线程 child, 其运行的函数为 func1. 指定后继上下文为 main  
func1 返回后激活后继上下文，继续执行主函数。

保存上面代码到 example-switch.cpp. 运行编译命令:

```
g++ example-switch.cpp -o example-switch
```

执行程序结果如下

```
cxy@ubuntu:~$ ./example-switch
1
11
111
1111
main
cxy@ubuntu:~$
```

  
你也可以通过修改后继上下文的设置，来观察程序的行为。如修改代码

```
child.uc_link = &main;
```

为

```
child.uc_link = NULL;
```

再重新编译执行，其执行结果为：

```
cxy@ubuntu:~$ ./example-switch
1
11
111
1111
cxy@ubuntu:~$
```

可以发现程序没有打印 "main"，执行为 func1 后直接退出，而没有返回主函数。可见，如果要实现主函数到线程的切换并返回，指定后继上下文是非常重要的。

# 使用 ucontext 实现自己的线程库
-----------------------

掌握了上一节从主函数到协程的切换的关键，我们就可以开始考虑实现自己的协程了。  
定义一个协程的结构体如下：

``` cpp
typedef void (*Fun)(void *arg);
 
typedef struct uthread_t
{
    ucontext_t ctx;
    Fun func;
    void *arg;
    enum ThreadState state;
    char stack[DEFAULT_STACK_SZIE];
}uthread_t;
```

ctx 保存协程的上下文，stack 为协程的栈，栈大小默认为 DEFAULT_STACK_SZIE=128Kb. 你可以根据自己的需求更改栈的大小。func 为协程执行的用户函数，arg 为 func 的参数，state 表示协程的运行状态，包括 FREE,RUNNABLE,RUNING,SUSPEND, 分别表示空闲，就绪，正在执行和挂起四种状态。

在定义一个调度器的结构体

``` cpp
typedef std::vector<uthread_t> Thread_vector;
 
typedef struct schedule_t
{
    ucontext_t main;
    int running_thread;
    Thread_vector threads;
 
    schedule_t():running_thread(-1){}
}schedule_t;
```

调度器包括主函数的上下文 main, 包含当前调度器拥有的所有协程的 vector 类型的 threads，以及指向当前正在执行的协程的编号 running_thread. 如果当前没有正在执行的协程时，running_thread=-1.

接下来，在定义几个使用函数 uthread_create,uthread_yield,uthread_resume 函数已经辅助函数 schedule_finished. 就可以了。

```
int  uthread_create(schedule_t &schedule,Fun func,void *arg);
```

创建一个协程，该协程的会加入到 schedule 的协程序列中，func 为其执行的函数，arg 为 func 的执行函数。返回创建的线程在 schedule 中的编号。

```
void uthread_yield(schedule_t &schedule);
```

挂起调度器 schedule 中当前正在执行的协程，切换到主函数。

```
void uthread_resume(schedule_t &schedule,int id);
```

恢复运行调度器 schedule 中编号为 id 的协程

```
int  schedule_finished(const schedule_t &schedule);
```

判断 schedule 中所有的协程是否都执行完毕，是返回 1，否则返回 0. 注意：如果有协程处于挂起状态时算作未全部执行完毕，返回 0.

代码就不全贴出来了，我们来看看两个关键的函数的具体实现。首先是 uthread_resume 函数：

``` cpp
void uthread_resume(schedule_t &schedule , int id)
{
    if(id < 0 || id >= schedule.threads.size()){
        return;
    }
 
    uthread_t *t = &(schedule.threads[id]);
 
    switch(t->state){
        case RUNNABLE:
            getcontext(&(t->ctx));
 
            t->ctx.uc_stack.ss_sp = t->stack;
            t->ctx.uc_stack.ss_size = DEFAULT_STACK_SZIE;
            t->ctx.uc_stack.ss_flags = 0;
            t->ctx.uc_link = &(schedule.main);
            t->state = RUNNING;
 
            schedule.running_thread = id;
 
            makecontext(&(t->ctx),(void (*)(void))(uthread_body),1,&schedule);
 
            /* !! note : Here does not need to break */
 
        case SUSPEND:
 
            swapcontext(&(schedule.main),&(t->ctx));
 
            break;
        default: ;
    }
}
```

如果指定的协程是首次运行，处于 RUNNABLE 状态，则创建一个上下文，然后切换到该上下文。如果指定的协程已经运行过，处于 SUSPEND 状态，则直接切换到该上下文即可。代码中需要注意 RUNNBALE 状态的地方不需要 break.

``` cpp
void uthread_yield(schedule_t &schedule)
{
    if(schedule.running_thread != -1 ){
        uthread_t *t = &(schedule.threads[schedule.running_thread]);
        t->state = SUSPEND;
        schedule.running_thread = -1;
 
        swapcontext(&(t->ctx),&(schedule.main));
    }
}
```

uthread_yield 挂起当前正在运行的协程。首先是将 running_thread 置为 - 1，将正在运行的协程的状态置为 SUSPEND，最后切换到主函数上下文。

更具体的代码我已经放到 github 上, [点击这里](https://github.com/Winnerhust/uthread)。

# 最后一步 - 使用我们自己的协程库
--------------------

保存下面代码到 example-uthread.cpp.

``` cpp
#include "uthread.h"
#include <stdio.h>
 
void func2(void * arg)
{
    puts("22");
    puts("22");
    uthread_yield(*(schedule_t *)arg);
    puts("22");
    puts("22");
}
 
void func3(void *arg)
{
    puts("3333");
    puts("3333");
    uthread_yield(*(schedule_t *)arg);
    puts("3333");
    puts("3333");
 
}
 
void schedule_test()
{
    schedule_t s;
 
    int id1 = uthread_create(s,func3,&s);
    int id2 = uthread_create(s,func2,&s);
 
    while(!schedule_finished(s)){
        uthread_resume(s,id2);
        uthread_resume(s,id1);
    }
    puts("main over");
 
}
int main()
{
    schedule_test();
 
    return 0;
}
```

执行编译命令并运行：

```
g++ example-uthread.cpp -o example-uthread
./example-uthread
```

运行结果如下：

```
cxy@ubuntu:~/mythread$./example-uthread
22
22
3333
3333
22
22
3333
3333
main over
cxy@ubuntu:~/mythread$
```

可以看到，程序协程 func2，然后切换到主函数, 在执行协程 func3，再切换到主函数，又切换到 func2, 在切换到主函数，再切换到 func3, 最后切换到主函数结束。

# 总结

我们利用 getcontext 和 makecontext 创建上下文，设置后继的上下文到主函数，设置每个协程的栈空间。在利用 swapcontext 在主函数和协程之间进行切换。

到此，使用 ucontext 做一个自己的协程库就到此结束了。相信你也可以自己完成自己的协程库了。

最后，代码我已经放到 github 上, [点击这里](https://github.com/Winnerhust/uthread)。


转自: https://blog.csdn.net/qq910894904/article/details/41911175