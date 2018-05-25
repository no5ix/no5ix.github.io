---
title: GCC的原子操作函数
date: 2015-04-11 12:26:26
tags: 
- CPP
- MultiThread
categories:
- CPP
---


linux支持的哪些操作是具有原子特性的？知道这些东西是理解和设计无锁化编程算法的基础。

下面的东西整理自网络。先感谢大家的分享！

 

`__sync_fetch_and_add` 系列的命令，发现这个系列命令讲的最好的一篇文章，英文好的同学可以直接去看原文。Multithreaded simple data type access and atomic variables

`__sync_fetch_and_add`系列一共有十二个函数，有加/减/与/或/异或/等函数的原子性操作函数,`__sync_fetch_and_add`,顾名思义，先fetch，然后自加，返回的是自加以前的值。以count = 4为例，调用`__sync_fetch_and_add`(&count,1),之后，返回值是4，然后，count变成了5.
有`__sync_fetch_and_add`,自然也就有__sync_add_and_fetch，呵呵这个的意思就很清楚了，先自加，在返回。他们哥俩的关系与i++和++i的关系是一样的。被谭浩强他老人家收过保护费的都会清楚了。
有了这个宝贝函数，我们就有新的解决办法了。对于多线程对全局变量进行自加，我们就再也不用理线程锁了。下面这行代码，和上面被pthread_mutex保护的那行代码作用是一样的，而且也是线程安全的。

`__sync_fetch_and_add`( &global_int, 1 );
下面是这群函数的全家福，大家看名字就知道是这些函数是干啥的了。

在用gcc编译的时候要加上选项 -march=i686

// sam:在我的服务器上，发现不加都可以。


	type __sync_fetch_and_add (type *ptr, type value);
	type __sync_fetch_and_sub (type *ptr, type value);
	type __sync_fetch_and_or (type *ptr, type value);
	type __sync_fetch_and_and (type *ptr, type value);
	type __sync_fetch_and_xor (type *ptr, type value);
	type __sync_fetch_and_nand (type *ptr, type value);
	type __sync_add_and_fetch (type *ptr, type value);
	type __sync_sub_and_fetch (type *ptr, type value);
	type __sync_or_and_fetch (type *ptr, type value);
	type __sync_and_and_fetch (type *ptr, type value);
	type __sync_xor_and_fetch (type *ptr, type value);
	type __sync_nand_and_fetch (type *ptr, type value);

 

// sam:很纳闷为什么后边要写省略号，是不是还有不需要我们关心的参数？用的时候不需要传参数？下面这两个函数正是哥想要的啦，可以轻松实现互斥锁的功能。

	bool __sync_bool_compare_and_swap (type*ptr, type oldval, type newval, ...)
	type __sync_val_compare_and_swap (type *ptr, type oldval,  type newval, ...)

这两个函数提供原子的比较和交换，如果*ptr == oldval,就将newval写入*ptr,
第一个函数在相等并写入的情况下返回true.
第二个函数在返回操作之前的值。


	__sync_synchronize (...)



还有两个函数：

	type __sync_lock_test_and_set (type *ptr, type value, ...)
	
将*ptr设为value并返回*ptr操作之前的值。

	void __sync_lock_release (type *ptr, ...)

将*ptr置0