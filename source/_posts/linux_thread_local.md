---
title: Linux中的线程局部存储
date: 2016-04-17 18:51:26
tags: 
- CPP
- MultiThread
categories:
- CPP
---




在 Linux 系统中使用 C/C++ 进行多线程编程时，我们遇到最多的就是对同一变量的多线程读写问题，大多情况下遇到这类问题都是通过锁机制来处理，但这对程序的性能带来了很大的影响，

当然对于那些系统原生支持原子操作的数据类型来说，我们可以使用原子操作来处理，这能对程序的性能会得到一定的提高。那么对于那些系统不支持原子操作的自定义数据类型，

在不使用锁的情况下如何做到线程安全呢？本文将从线程局部存储方面，简单讲解处理这一类线程安全问题的方法。

# 数据类型   

在 C/C++ 程序中常存在全局变量、函数内定义的静态变量以及局部变量，对于局部变量来说，其不存在线程安全问题，因此不在本文讨论的范围之内。

全局变量和函数内定义的静态变量，是同一进程中各个线程都可以访问的共享变量，因此它们存在多线程读写问题。

在一个线程中修改了变量中的内容，其他线程都能感知并且能读取已更改过的内容，这对数据交换来说是非常快捷的，但是由于多线程的存在，对于同一个变量可能存在两个或两个以上的线程同时修改变量所在的内存内容，同时又存在多个线程在变量在修改的时去读取该内存值，如果没有使用相应的同步机制来保护该内存的话，那么所读取到的数据将是不可预知的，甚至可能导致程序崩溃。

如果需要在一个线程内部的各个函数调用都能访问、但其它线程不能访问的变量，这就需要新的机制来实现，我们称之为 Static memory local to a thread (线程局部静态变量)，同时也可称之为线程特有数据（TSD: Thread-Specific Data）或者线程局部存储（TLS: Thread-Local Storage）。

这一类型的数据，在程序中每个线程都会分别维护一份变量的副本 (copy)，并且长期存在于该线程中，对此类变量的操作不影响其他线程。
如下图：                                    
![](https://img-blog.csdn.net/20140521140749687?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvY3l3b3Nw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


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
使用实例请参考 https://github.com/ApusApp/Swift/blob/master/swift/base/singleton.hpp 实现。



# 线程局部数据 API    

在 Linux 中提供了如下函数来对线程局部数据进行操作

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

函数 pthread_key_create() 为线程局部数据创建一个新键，并通过 key 指向新创建的键缓冲区。

因为所有线程都可以使用返回的新键，所以参数 key 可以是一个全局变量（在 C++ 多线程编程中一般不使用全局变量，而是使用单独的类对线程局部数据进行封装，每个变量使用一个独立的 pthread_key_t）。

destructor 所指向的是一个自定义的函数，其格式如下：

``` c++
void Dest (void *value)
{
    // Release storage pointed to by 'value'
}
```

只要线程终止时与 key 关联的值不为 NULL，则 destructor 所指的函数将会自动被调用。

如果一个线程中有多个线程局部存储变量，那么对各个变量所对应的 destructor 函数的调用顺序是不确定的，因此，每个变量的 destructor 函数的设计应该相互独立。


函数 pthread_key_delete() 并不检查当前是否有线程正在使用该线程局部数据变量，也不会调用清理函数 destructor，而只是将其释放以供下一次调用 pthread_key_create() 使用。

在 Linux 线程中，它还会将与之相关的线程数据项设置为 NULL。



> 由于系统对每个进程中 pthread_key_t 类型的个数是有限制的，所以进程中并不能创建无限个的 pthread_key_t 变量。Linux 中可以通过 PTHREAD_KEY_MAX（定义于 limits.h 文件中）或者系统调用 sysconf(_SC_THREAD_KEYS_MAX) 来确定当前系统最多支持多少个键。Linux 中默认是 1024 个键，这对于大多数程序来说已经足够了。如果一个线程中有多个线程局部存储变量，通常可以将这些变量封装到一个数据结构中，然后使封装后的数据结构与一个线程局部变量相关联，这样就能减少对键值的使用。

函数 pthread_setspecific() 用于将 value 的副本存储于一数据结构中，并将其与调用线程以及 key 相关联。

参数 value 通常指向由调用者分配的一块内存，当线程终止时，会将该指针作为参数传递给与 key 相关联的 destructor 函数。

当线程被创建时，会将所有的线程局部存储变量初始化为 NULL，因此第一次使用此类变量前必须先调用 pthread_getspecific() 函数来确认是否已经于对应的 key 相关联，如果没有，那么 pthread_getspecific() 会分配一块内存并通过 pthread_setspecific() 函数保存指向该内存块的指针。


> 参数 value 的值也可以不是一个指向调用者分配的内存区域，而是任何可以强制转换为 void * 的变量值，在这种情况下，先前的 pthread_key_create() 函数应将参数_ _destructor 设置为 NULL

函数 pthread_getspecific() 正好与 pthread_setspecific() 相反，其是将 pthread_setspecific() 设置的 value 取出。在使用取出的值前最好是将 void * 转换成原始数据类型的指针。


# 深入理解线程局部存储机制    

## 1

**深入理解线程局部存储的实现有助于对其 API 的使用。**

在典型的实现中包含以下数组：

*   一个全局（进程级别）的数组，用于存放线程局部存储的键值信息
	pthread_key_create() 返回的 pthread_key_t 类型值只是对全局数组的索引，该全局数组标记为 pthread_keys，其格式大概如下：                           
	![](https://img-blog.csdn.net/20140521141540062?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvY3l3b3Nw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

	数组的每个元素都是一个包含两个字段的结构，第一个字段标记该数组元素是否在用，第二个字段用于存放针对此键、线程局部存储变的解构函数的一个副本，即 destructor 函数。

*   每个线程还包含一个数组，存有为每个线程分配的线程特有数据块的指针（通过调用 pthread_setspecific() 函数来存储的指针，即参数中的 value）

## 2

**在常见的存储 pthread_setspecific()函数参数 value 的实现中，大多数都类似于下图的实现。**

图中假设 pthread_keys[1]分配给 func1()函数，pthread API 为每个函数维护指向线程局部存储数据块的一个指针数组，
其中每个数组元素都与图线程局部数据键的实现 (上图) 中的全局 pthread_keys 中元素一一对应。
                 
![](https://img-blog.csdn.net/20140521141742921?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvY3l3b3Nw/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


# 总结   

 使用全局变量或者静态变量是导致多线程编程中非线程安全的常见原因。在多线程程序中，保障非线程安全的常用手段之一是使用互斥锁来做保护，这种方法带来了并发性能下降，同时也只能有一个线程对数据进行读写。
 
 如果程序中能避免使用全局变量或静态变量，那么这些程序就是线程安全的，性能也可以得到很大的提升。
 
 如果有些数据只能有一个线程可以访问，那么这一类数据就可以使用线程局部存储机制来处理，虽然使用这种机制会给程序执行效率上带来一定的影响，但对于使用锁机制来说，这些性能影响将可以忽略。
 
 Linux C++ 的线程局部存储简单实现可参考 https://github.com/ApusApp/Swift/blob/master/swift/base/threadlocal.h，更详细且高效的实现可参考 Facebook 的 folly 库中的 ThreadLocal 实现。
 
 更高性能的线程局部存储机制就是使用__thread，这将在下一节中讨论。




# 参考

- [1] Linux/UNIX 系统编程手册（上） 
- [2] http://www.groad.net/bbs/thread-2182-1-1.html 
- [3] http://baike.baidu.com/view/598128.htm