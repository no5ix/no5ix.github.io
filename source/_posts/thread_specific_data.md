---
title: 线程特有数据
date: 2016-04-17 18:51:26
tags: 
- CPP
- Linux
- MultiThread
categories:
- Linux
---




在 Linux 系统中使用 C/C++ 进行多线程编程时，我们遇到最多的就是对同一变量的多线程读写问题，大多情况下遇到这类问题都是通过锁机制来处理，但这对程序的性能带来了很大的影响，

当然对于那些系统原生支持原子操作的数据类型来说，我们可以使用原子操作来处理，这能对程序的性能会得到一定的提高。那么对于那些系统不支持原子操作的自定义数据类型，

在不使用锁的情况下如何做到线程安全呢？本文将从线程特有数据方面，简单讲解处理这一类线程安全问题的方法。


如果有些数据只能有一个线程可以访问，那么这一类数据就可以使用线程特有数据机制来处理，虽然使用这种机制会给程序执行效率上带来一定的影响，但对于使用锁机制来说，这些性能影响将可以忽略。


还有一种大致相当的编程技术就是使用 `__thread` (比 线程特有数据 易用) ，这将在 {% post_link thread_local_storage 线程局部存储 %} 中讨论。


# 数据类型   

在 C/C++ 程序中常存在全局变量、函数内定义的静态变量以及局部变量，对于局部变量来说，其不存在线程安全问题，因此不在本文讨论的范围之内。

全局变量和函数内定义的静态变量，是同一进程中各个线程都可以访问的共享变量，因此它们存在多线程读写问题。

在一个线程中修改了变量中的内容，其他线程都能感知并且能读取已更改过的内容，这对数据交换来说是非常快捷的，但是由于多线程的存在，对于同一个变量可能存在两个或两个以上的线程同时修改变量所在的内存内容，同时又存在多个线程在变量在修改的时去读取该内存值，如果没有使用相应的同步机制来保护该内存的话，那么所读取到的数据将是不可预知的，甚至可能导致程序崩溃。

如果需要在一个线程内部的各个函数调用都能访问、但其它线程不能访问的变量，这就需要新的机制来实现，我们称之为 Static memory local to a thread (线程局部静态变量)，同时也可称之为线程特有数据（TSD: Thread-Specific Data）

这一类型的数据，在程序中每个线程都会分别维护一份变量的副本 (copy)，并且长期存在于该线程中，对此类变量的操作不影响其他线程。
如下图：                                    
![](/img/thread_specific_data/20140521140749687.png)


# 一次性初始化 

在讲解线程特有数据之前，先让我们来了解一下一次性初始化。

多线程程序有时有这样的需求：不管创建多少个线程，有些数据的初始化只能发生一次。

列如：在 C++ 程序中某个类在整个进程的生命周期内只能存在一个实例对象，在多线程的情况下，为了能让该对象能够安全的初始化，一次性初始化机制就显得尤为重要了。

——在设计模式中这种实现常常被称之为单例模式（Singleton）。
Linux 中提供了如下函数来实现一次性初始化：

``` c++
#include <pthread.h>

// Returns 0 on success, or a positive error number on error
int pthread_once (pthread_once_t *once_control, void (*init) (void));
// 利用参数once_control的状态，函数pthread_once()可以确保无论有多少个线程调用多少次该函数，
// 也只会执行一次由init所指向的由调用者定义的函数。

// init所指向的函数没有任何参数，形式如下：
void init (void)
{
   // some variables initializtion in here
}
```

另外，参数 once_control 必须是 pthread_once_t 类型变量的指针，指向初始化为 PTHRAD_ONCE_INIT 的静态变量。
在 C++0x 以后提供了类似功能的函数 std::call_once ()，用法与该函数类似。
使用实例请参考 : 
https://github.com/ApusApp/Swift/blob/master/swift/base/singleton.hpp 
实现。



# 线程特有数据API介绍

在 Linux 中提供了如下函数来对线程特有数据进行操作

``` c++
#include <pthread.h>

// Returns 0 on success, or a positive error number on error
int pthread_key_create (pthread_key_t *key, void (*destructor)(void *));

// Returns 0 on success, or a positive error number on error
int pthread_key_delete (pthread_key_t key);

// Returns 0 on success, or a positive error number on error
int pthread_setspecific (pthread_key_t key, const void *value);

// Returns pointer, or NULL if no thread-specific data is associated with key
void *pthread_getspecific (pthread_key_t key);
```

## pthread_key_create

	// Returns 0 on success, or a positive error number on error
	int pthread_key_create (pthread_key_t *key, void (*destructor)(void *));

函数 pthread_key_create() 为线程特有数据创建一个新键，并通过 key 指向新创建的键缓冲区。

因为所有线程都可以使用返回的新键，所以参数 key 可以是一个全局变量（在 C++ 多线程编程中一般不使用全局变量，而是使用单独的类对线程特有数据进行封装，每个变量使用一个独立的 pthread_key_t）。

destructor 所指向的是一个自定义的函数，其格式如下：

	void Dest (void *value)
	{
		// Release storage pointed to by 'value'
	}

只要线程终止时与 key 关联的值不为 NULL，则 destructor 所指的函数将会自动被调用。

如果一个线程中有多个线程特有数据变量，那么对各个变量所对应的 destructor 函数的调用顺序是不确定的，因此，每个变量的 destructor 函数的设计应该相互独立。

## pthread_key_delete

	// Returns 0 on success, or a positive error number on error
	int pthread_key_delete (pthread_key_t key);

函数 pthread_key_delete() 并不检查当前是否有线程正在使用该线程特有数据变量，也不会调用清理函数 destructor，而只是将其释放以供下一次调用 pthread_key_create() 使用。

在 Linux 线程中，它还会将与之相关的线程数据项设置为 NULL。



> 由于系统对每个进程中 pthread_key_t 类型的个数是有限制的，所以进程中并不能创建无限个的 pthread_key_t 变量。Linux 中可以通过 PTHREAD_KEY_MAX（定义于 limits.h 文件中）或者系统调用 sysconf(_SC_THREAD_KEYS_MAX) 来确定当前系统最多支持多少个键。Linux 中默认是 1024 个键，这对于大多数程序来说已经足够了。如果一个线程中有多个线程特有数据变量，通常可以将这些变量封装到一个数据结构中，然后使封装后的数据结构与一个线程局部变量相关联，这样就能减少对键值的使用。

## pthread_setspecific

	// Returns 0 on success, or a positive error number on error
	int pthread_setspecific (pthread_key_t key, const void *value);

函数 pthread_setspecific() 用于将 value 的副本存储于一数据结构中，并将其与调用线程以及 key 相关联。

参数 value 通常指向由调用者分配的一块内存，当线程终止时，会将该指针作为参数传递给与 key 相关联的 destructor 函数。

## pthread_getspecific

	// Returns pointer, or NULL if no thread-specific data is associated with key
	void *pthread_getspecific (pthread_key_t key);

当线程被创建时，会将所有的线程特有数据变量初始化为 NULL，因此第一次使用此类变量前必须先调用 pthread_getspecific() 函数来确认是否已经于对应的 key 相关联，如果没有，那么 pthread_getspecific() 会分配一块内存并通过 pthread_setspecific() 函数保存指向该内存块的指针。


> 参数 value 的值也可以不是一个指向调用者分配的内存区域，而是任何可以强制转换为 void * 的变量值，在这种情况下，先前的 pthread_key_create() 函数应将参数_ _destructor 设置为 NULL

函数 pthread_getspecific() 正好与 pthread_setspecific() 相反，其是将 pthread_setspecific() 设置的 value 取出。在使用取出的值前最好是将 void * 转换成原始数据类型的指针。


# 使用线程特有数据API

我们先讨论一下非线程安全的 `stderror()` 的实现, 接着说明如何使用线程特有数据来实现该函数的线程安全.

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


这是使用线程特有数据技术实现的线程安全的stderror().

如果对使用线程局部存储技术实现的线程安全的stderror()感兴趣, 
请转 {% post_link thread_local_storage 线程局部存储 %}

An implementation of strerror() that is made thread-safe through the use of thread-specific data.

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

/* Listing 31-3 */

/* strerror_tsd.c

   An implementation of strerror() that is made thread-safe through
   the use of thread-specific data.

   See also strerror_tls.c.
*/
#define _GNU_SOURCE                 /* Get '_sys_nerr' and '_sys_errlist'
                                       declarations from <stdio.h> */
#include <stdio.h>
#include <string.h>                 /* Get declaration of strerror() */
#include <pthread.h>
#include "tlpi_hdr.h"

static pthread_once_t once = PTHREAD_ONCE_INIT;
static pthread_key_t strerrorKey;

#define MAX_ERROR_LEN 256           /* Maximum length of string in per-thread
                                       buffer returned by strerror() */

static void                         /* Free thread-specific data buffer */
destructor(void *buf)
{
    free(buf);
}

static void                         /* One-time key creation function */
createKey(void)
{
    int s;

    /* Allocate a unique thread-specific data key and save the address
       of the destructor for thread-specific data buffers */

    s = pthread_key_create(&strerrorKey, destructor);
    if (s != 0)
        errExitEN(s, "pthread_key_create");
}

char *
strerror(int err)
{
    int s;
    char *buf;

    /* Make first caller allocate key for thread-specific data */

    s = pthread_once(&once, createKey);
    if (s != 0)
        errExitEN(s, "pthread_once");

    buf = pthread_getspecific(strerrorKey);
    if (buf == NULL) {          /* If first call from this thread, allocate
                                   buffer for thread, and save its location */
        buf = malloc(MAX_ERROR_LEN);
        if (buf == NULL)
            errExit("malloc");

        s = pthread_setspecific(strerrorKey, buf);
        if (s != 0)
            errExitEN(s, "pthread_setspecific");
    }

    if (err < 0 || err >= _sys_nerr || _sys_errlist[err] == NULL) {
        snprintf(buf, MAX_ERROR_LEN, "Unknown error %d", err);
    } else {
        strncpy(buf, _sys_errlist[err], MAX_ERROR_LEN - 1);
        buf[MAX_ERROR_LEN - 1] = '\0';          /* Ensure null termination */
    }

    return buf;
}
```


# 深入理解线程特有数据机制    


**深入理解线程特有数据的实现有助于对其 API 的使用。**

在典型的实现中包含以下数组：

*   一个全局（进程级别）的数组，用于存放线程特有数据的键值信息
	pthread_key_create() 返回的 pthread_key_t 类型值只是对全局数组的索引，该全局数组标记为 pthread_keys，其格式大概如下：                           
	![](/img/thread_specific_data/20140521141540062.png)

	数组的每个元素都是一个包含两个字段的结构，第一个字段标记该数组元素是否在用，第二个字段用于存放针对此键、线程特有数据变的解构函数的一个副本，即 destructor 函数。

*   每个线程还包含一个数组，存有为每个线程分配的线程特有数据块的指针（通过调用 pthread_setspecific() 函数来存储的指针，即参数中的 value）


**在常见的存储 pthread_setspecific()函数参数 value 的实现中，大多数都类似于下图的实现。**

图中假设 pthread_keys[1]分配给 func1()函数，pthread API 为每个函数维护指向线程特有数据数据块的一个指针数组，
其中每个数组元素都与图线程特有数据键的实现 (上图) 中的全局 pthread_keys 中元素一一对应。
                 
![](/img/thread_specific_data/20140521141742921.png)


# 参考

- [1] Linux/UNIX 系统编程手册（上） 
- [2] http://www.groad.net/bbs/thread-2182-1-1.html 
- [3] http://baike.baidu.com/view/598128.htm