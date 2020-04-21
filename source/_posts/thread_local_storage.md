---
title: 线程局部存储
date: 2016-04-22 23:19:21
tags:
- CPP
- Linux
- MultiThread
categories:
- Linux
---



使用全局变量或者静态变量是导致多线程编程中非线程安全的常见原因。在多线程程序中，保障非线程安全的常用手段之一是使用互斥锁来做保护，这种方法带来了并发性能下降，同时也只能有一个线程对数据进行读写。

如果程序中能避免使用全局变量或静态变量，那么这些程序就是线程安全的，性能也可以得到很大的提升。

如果有些数据只能有一个线程可以访问，那么这一类数据就可以使用线程局部存储机制来处理，虽然使用这种机制会给程序执行效率上带来一定的影响，但对于使用锁机制来说，这些性能影响将可以忽略。


还有一种大致相当的编程技术就是使用 线程特有数据(没 线程局部存储 易用, 也没 线程局部存储 高效) ，这将在 {% post_link thread_specific_data 线程特有数据 %} 中讨论。

**. . .**<!-- more -->


# 线程局部存储介绍

`__thread` 是GCC内置的线程局部存储设施，存取效率可以和全局变量相比。

`__thread` 变量每一个线程有一份独立实体，各个线程的值互不干扰。
可以用来修饰那些带有全局性且值可能变，但是又不值得用全局变量保护的变量。

`__thread` 使用规则：只能修饰POD类型(类似整型指针的标量，不带自定义的构造、拷贝、赋值、析构的类型，

二进制内容可以任意复制memset, memcpy, 且内容可以复原，

不能修饰class类型，因为无法自动调用构造函数和析构函数，
可以用于修饰全局变量，函数内的静态变量，不能修饰函数的局部变量或者class的普通成员变量，
且 `__thread` 变量值只能初始化为编译器常量
( 例如 : 值在编译器就可以确定const int i=5,运行期常量是运行初始化后不再改变const int i=rand() ).

# 一个简单例子

``` c++
#include<iostream>
#include<pthread.h>
#include<unistd.h>
using namespace std;
const int i=5;
__thread int var=i;//两种方式效果一样
//__thread int var=5;//
void* worker1(void* arg);
void* worker2(void* arg);
int main(){
    pthread_t pid1,pid2;
    //__thread int temp=5;
    static __thread  int temp=10;//修饰函数内的static变量
    pthread_create(&pid1,NULL,worker1,NULL);
    pthread_create(&pid2,NULL,worker2,NULL);
    pthread_join(pid1,NULL);
    pthread_join(pid2,NULL);
    cout<<temp<<endl;//输出10
    return 0;
}
void* worker1(void* arg){
    cout<<++var<<endl;//输出 6
}
void* worker2(void* arg){
    sleep(1);//等待线程1改变var值，验证是否影响线程2
    cout<<++var<<endl;//输出6
}
```

程序输出 :

	6

	6         //可见__thread值线程间互不干扰

	10


# 如何使用线程局部存储技术来实现函数的线程安全

我们先讨论一下非线程安全的 `stderror()` 的实现, 接着说明如何使用线程局部存储技术来实现该函数的线程安全.

## 非线程安全的stderror()

An implementation of strerror() that is not thread-safe.

``` c++
/*************************************************************************\
*                  Copyright (C) Michael Kerrisk, 2017.                   *
*                                                                         *
* This program is free software. You may use, modify, and redistribute it *
* under the terms of the GNU General Public License as published by the   *
* Free Software Foundation, either version 3 or (at your option) any      *
* later version. This program is distributed without any warranty.  See   *
* the file COPYING.gpl-v3 for details.                                    *
\*************************************************************************/

/* Listing 31-1 */

/* strerror.c

   An implementation of strerror() that is not thread-safe.
*/
#define _GNU_SOURCE                 /* Get '_sys_nerr' and '_sys_errlist'
                                       declarations from <stdio.h> */
#include <stdio.h>
#include <string.h>                 /* Get declaration of strerror() */

#define MAX_ERROR_LEN 256           /* Maximum length of string
                                       returned by strerror() */

static char buf[MAX_ERROR_LEN];     /* Statically allocated return buffer */

char *
strerror(int err)
{
    if (err < 0 || err >= _sys_nerr || _sys_errlist[err] == NULL) {
        snprintf(buf, MAX_ERROR_LEN, "Unknown error %d", err);
    } else {
        strncpy(buf, _sys_errlist[err], MAX_ERROR_LEN - 1);
        buf[MAX_ERROR_LEN - 1] = '\0';          /* Ensure null termination */
    }

    return buf;
}
```

## 线程安全的stderror()

这是使用线程局部存储技术实现的线程安全的stderror().

如果对使用线程特有数据技术实现的线程安全的stderror()感兴趣, 
请转 {% post_link thread_specific_data 线程特有数据 %}

``` c++
/*************************************************************************\
*                  Copyright (C) Michael Kerrisk, 2017.                   *
*                                                                         *
* This program is free software. You may use, modify, and redistribute it *
* under the terms of the GNU General Public License as published by the   *
* Free Software Foundation, either version 3 or (at your option) any      *
* later version. This program is distributed without any warranty.  See   *
* the file COPYING.gpl-v3 for details.                                    *
\*************************************************************************/

/* Listing 31-4 */

/* strerror_tls.c

   An implementation of strerror() that is made thread-safe through
   the use of thread-local storage.

   See also strerror_tsd.c.

   Thread-local storage requires: Linux 2.6 or later, NPTL, and
   gcc 3.3 or later.
*/
#define _GNU_SOURCE                 /* Get '_sys_nerr' and '_sys_errlist'
                                       declarations from <stdio.h> */
#include <stdio.h>
#include <string.h>                 /* Get declaration of strerror() */
#include <pthread.h>

#define MAX_ERROR_LEN 256           /* Maximum length of string in per-thread
                                       buffer returned by strerror() */

static __thread char buf[MAX_ERROR_LEN];
                                    /* Thread-local return buffer */

char *
strerror(int err)
{
    if (err < 0 || err >= _sys_nerr || _sys_errlist[err] == NULL) {
        snprintf(buf, MAX_ERROR_LEN, "Unknown error %d", err);
    } else {
        strncpy(buf, _sys_errlist[err], MAX_ERROR_LEN - 1);
        buf[MAX_ERROR_LEN - 1] = '\0';          /* Ensure null termination */
    }

    return buf;
}
```