---
title: GCC的原子操作函数
date: 2015-04-11 12:26:26
tags: 
- CPP
- MultiThread
- Linux
categories:
- Linux
---


linux支持的哪些操作是具有原子特性的？知道这些东西是理解和设计无锁化编程算法的基础。

下面的东西整理自网络。先感谢大家的分享！


# 原子操作的api函数

gcc从4.1.2以后提供了 `__sync_* ` 系列的下面几类的内嵌函数，提供用于针对数字或布尔型变量的原子操作。


## n++类

这组返回更新前的值

	type __sync_fetch_and_add (type *ptr, type value, ...)
	type __sync_fetch_and_sub (type *ptr, type value, ...)
	type __sync_fetch_and_or (type *ptr, type value, ...)
	type __sync_fetch_and_and (type *ptr, type value, ...)
	type __sync_fetch_and_xor (type *ptr, type value, ...)
	type __sync_fetch_and_nand (type *ptr, type value, ...)

## ++n类

这组返回更新后的值

	type __sync_add_and_fetch (type *ptr, type value, ...)
	type __sync_sub_and_fetch (type *ptr, type value, ...)
	type __sync_or_and_fetch (type *ptr, type value, ...)
	type __sync_and_and_fetch (type *ptr, type value, ...)
	type __sync_xor_and_fetch (type *ptr, type value, ...)
	type __sync_nand_and_fetch (type *ptr, type value, ...)


type可以是1,2,4或8字节长度的int类型，即：

	int8_t / uint8_t
	int16_t / uint16_t
	int32_t / uint32_t
	int64_t / uint64_t


后面的可扩展参数(...)用来指出哪些变量需要memory barrier,因为目前gcc实现的是full barrier（类似于linux kernel 中的mb(),表示这个操作之前的所有内存操作不会被重排序到这个操作之后）,所以可以略掉这个参数。


## CAS类

CAS 即 compare-and-swap , 

下面这两个函数提供原子的比较和交换，如果 ` *ptr == oldval `,就将 `newval` 写入 ` *ptr ` 


- 此函数在相等并写入的情况下返回 true

        bool __sync_bool_compare_and_swap (type *ptr, type oldval, type newval, ...)
        /* 对应的伪代码 */
        { if (*ptr == oldval) { *ptr = newval; return true; } else { return false; } }


- 此函数在返回 ` oldval `

        type __sync_val_compare_and_swap (type *ptr, type oldval, type newval, ...)
        /* 对应的伪代码 */
        { if (*ptr == oldval) { *ptr = newval; } return oldval; }





## 其他原子操作

    type __sync_lock_test_and_set (type *ptr, type value, ...)

将  `*ptr` 设为value并返回 `*ptr` 操作之前的值。


    void __sync_lock_release (type *ptr, ...)

将 `*ptr` 置 0



# 内存栅障

内存栅障主要是处理不同cpu运作时（主要是执行不同线程代码时），一个cpu对内存的操作的原子性，也就保证其他cpu见到的内存单元数据的正确性。

## 内存栅障介绍

如果有对某一变量上写锁， 就不能在不获得相应的锁时对其进行读取操作。
内存栅的作用在于保证内存操作的相对顺序， 但并不保证内存操作的严格时序。 

内存栅并不保证 CPU 将本地快取缓存或存储缓冲的内容刷写回内存， 而是在锁释放时确保其所保护的数据， 对于能看到刚释放的那个锁的 CPU 或设备可见。
持有内存栅的 CPU 可以在其快取缓存或存储缓冲中将数据保持其所希望的、 任意长的时间， 但如果其它 CPU 在同一数据元上执行原子操作，
则第一个 CPU 必须保证， 其所更新的数据值， 以及内存栅所要求的任何其它操作， 对第二个 CPU 可见。

	__sync_synchronize (...)

发出一个full barrier.


## 内存栅障应用

对于执行一条指令，操作到4个寄存器时，如：

    write1(dev.register_size,size);
    write1(dev.register_addr,addr);
    write1(dev.register_cmd,READ);
    write1(dev.register_control,GO);

最后一个寄存器是控制寄存器，在所有的参数都设置好之后向其发出指令，设备开始读取参数.

如果最后一条write1被换到了前几条语句之前，那么肯定不是我们所期望的，这时候我们可以在最后一条语句之前加入一个memory barrier,强制cpu执行完前面的写入以后再执行最后一条：

    write1(dev.register_size,size);
    write1(dev.register_addr,addr);
    write1(dev.register_cmd,READ);
    __sync_synchronize();
    write1(dev.register_control,GO);

memory barrier有几种类型：

- acquire barrier : 不允许将barrier之后的内存读取指令移到barrier之前（linux kernel中的wmb()）。
- release barrier : 不允许将barrier之前的内存读取指令移到barrier之后 (linux kernel中的rmb())。
- full barrier    : 以上两种barrier的合集(linux kernel中的mb())。

# 原子操作应用范围

原子操作只允许一次更新或读一个内存单元。 需要原子地更新多个单元时， 就必须使用锁来代替它了。 

例如， 如果需要更新两个相互关联的计数器时， 就必须使用锁， 而不是两次单独的原子操作了。

# 原子操作例子

例子代码：

``` c++
#include <stdio.h>  
#include <pthread.h>  
#include <stdlib.h>  
  
static int count = 0;  
  
void *test_func(void *arg)  
{  
        int i=0;  
        for(i=0;i<20000;++i){  
                __sync_fetch_and_add(&count,1);  
        }  
        return NULL;  
}  
  
int main(int argc, const char *argv[])  
{  
        pthread_t id[20];  
        int i = 0;  
  
        for(i=0;i<20;++i){  
                pthread_create(&id[i],NULL,test_func,NULL);  
        }  
  
        for(i=0;i<20;++i){  
                pthread_join(id[i],NULL);  
        }  
        printf("%d\n",count);  
        return 0;  
}  
```
   
# 原子操作封装使用

根据常用的原子操作，封装一些实用的接口 :

``` c++
//原子操作  
//设置值  
int lock_set(volatile int &a, int value)  
{  
    __sync_val_compare_and_swap(&a, a, value);  
    return a;  
}  
//加1  
int lock_inc(volatile int &n)  
{  
    return __sync_fetch_and_add(&n, 1);  
}  
//减1  
int lock_dec(volatile int &n)  
{  
    return __sync_fetch_and_sub(&n, 1);  
}  
  
//加值value  
int lock_add(volatile int &n, int value)  
{  
    return __sync_fetch_and_add(&n, value);  
}  
  
//减值value  
int lock_sub(volatile int &n, int value)  
{  
    return __sync_fetch_and_sub(&n, value);  
}  
  
//位或value  
int lock_or(volatile int &n, int value)  
{  
    return __sync_fetch_and_or(&n, value);  
}  
  
//位与value  
int lock_and(volatile int &n, int value)  
{  
    return __sync_fetch_and_and(&n, value);  
}  
  
//异或value  
int lock_xor(volatile int &n, int value)  
{  
    return __sync_fetch_and_xor(&n, value);  
}  
  
//无符号类型（函数重载）  
//设置值  
unsigned int lock_set(volatile unsigned int &a, unsigned int value)  
{  
    __sync_val_compare_and_swap(&a, a, value);  
    return a;  
}  
  
//加1  
unsigned int lock_inc(volatile unsigned int &n)  
{  
    return __sync_fetch_and_add(&n, 1);  
}  
  
//减1  
unsigned int lock_dec(volatile unsigned int &n)  
{  
    return __sync_fetch_and_sub(&n, 1);  
}  
  
//加值value  
unsigned int lock_add(volatile unsigned int &n, unsigned int value)  
{  
    return __sync_fetch_and_add((int*)&n, value);  
}  
  
//减值value  
unsigned int lock_sub(volatile unsigned int &n, unsigned int value)  
{  
    return __sync_fetch_and_sub((int*)&n, value);  
}  
  
//位或value  
unsigned int lock_or(volatile unsigned int &n, unsigned int value)  
{  
    return __sync_fetch_and_or((int*)&n, value);  
}  
  
//位与value  
unsigned int lock_and(volatile unsigned int &n, unsigned int value)  
{  
    return __sync_fetch_and_and((int*)&n, value);  
}  
  
//异或value  
unsigned int lock_xor(volatile unsigned int &n, unsigned int value)  
{  
    return __sync_fetch_and_xor((int*)&n, value);  
}  
```