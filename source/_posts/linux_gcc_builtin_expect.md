---
title: GCC的分支预测优化__builtin_expect
date: 2015-04-11 12:26:26
tags: 
- CPP
- Linux
categories:
- Linux
---

# 1. 为什么需要分支预测优化

 将流水线引入cpu，可以提高cpu的效率。更简单的说，让cpu可以预先取出下一条指令，可以提供cpu的效率。如下图所示：


|取指令|执行指令|输出结果
| -----| -----|-----|
|      |取指令 |执行 |

可见，cpu流水钱可以减少cpu等待取指令的耗时，从而提高cpu的效率。
如果存在跳转指令，那么预先取出的指令就无用了。cpu在执行当前指令时，从内存中取出了当前指令的下一条指令。执行完当前指令后，cpu发现不是要执行下一条指令,而是执行offset偏移处的指令。cpu只能重新从内存中取出offset偏移处的指令。因此，跳转指令会降低流水线的效率，也就是降低cpu的效率。

综上，在写程序时应该尽量避免跳转语句。那么如何避免跳转语句呢？答案就是使用__builtin_expect。

这个指令是gcc引入的，作用是"允许程序员将最有可能执行的分支告诉编译器"。

这个指令的写法为：__builtin_expect(EXP, N)。意思是：EXP==N的概率很大。一般的使用方法是将__builtin_expect指令封装为LIKELY和UNLIKELY宏。这两个宏的写法如下。

``` c
#define LIKELY(x) __builtin_expect(!!(x), 1) //x很可能为真
#define UNLIKELY(x) __builtin_expect(!!(x), 0) //x很可能为假
```

在很多源码如Linux内核、Glib等,我们都能看到likely()和unlikely()这两个宏,通常这两个宏定义是下面这样的形式。
可以看出这2个宏都是使用函数 __builtin_expect()实现的, __builtin_expect()函数是GCC的一个内建函数(build-in function).

 


# 2. 函数声明

函数__builtin_expect()是GCC v2.96版本引入的, 其声明如下:

`long __builtin_expect(long exp, long c);`

## 2.1. 功能描述

由于大部分程序员在分支预测方面做得很糟糕，所以GCC 提供了这个内建函数来帮助程序员处理分支预测.

你期望 exp 表达式的值等于常量 c, 看 c 的值, 如果 c 的值为0(即期望的函数返回值), 那么 执行 if 分支的的可能性小, 否则执行 else 分支的可能性小(函数的返回值等于第一个参数 exp).

GCC在编译过程中，会将可能性更大的代码紧跟着前面的代码，从而减少指令跳转带来的性能上的下降, 达到优化程序的目的.

通常，你也许会更喜欢使用 gcc 的一个参数 '-fprofile-arcs' 来收集程序运行的关于执行流程和分支走向的实际反馈信息,但是对于很多程序来说,数据是很难收集的。


## 2.2. 参数详解

- exp
    exp 为一个整型表达式, 例如: (ptr != NULL)

- c
    c 必须是一个编译期常量, 不能使用变量


## 2.3. 返回值

　　返回值等于 第一个参数 exp


## 2.4. 使用方法

与关键字if一起使用.首先要明确一点就是 if (value) 等价于 if (__builtin_expert(value, x)), 与x的值无关.

例子如下:

例子1 : 期望 x == 0, 所以执行func()的可能性小

``` c
if (__builtin_expect(x, 0))
{
    func();
}
else
{
　　//do someting
}
```

例子2 : 期望 ptr !=NULL这个条件成立(1), 所以执行func()的可能性小

``` c
if (__builtin_expect(ptr != NULL, 1))
{　　
　　//do something
}
else
{
　　func();
} 
```

例子3 : 引言中的likely()和unlikely()宏

首先,看第一个参数!!(x), 他的作用是把(x)转变成"布尔值", 无论(x)的值是多少 !(x)得到的是true或false, !!(x)就得到了原值的"布尔值"

使用 likely() ，执行 if 后面的语句 的机会更大，使用 unlikely()，执行 else 后面的语句的机会更大。

``` c
#define likely(x)    __builtin_expect(!!(x), 1)
#define unlikely(x)  __builtin_expect(!!(x), 0)

int main(char *argv[], int argc)
{
   int a;

   /* Get the value from somewhere GCC can't optimize */
   a = atoi (argv[1]);

   if (unlikely (a == 2))
　 {
      a++;
   }
   else
　 {
　　  a--;
　 }
   printf ("%d\n", a);

   return 0;
}
```
  


# 3. RATIONALE(原理)

if else 句型编译后, 一个分支的汇编代码紧随前面的代码,而另一个分支的汇编代码需要使用JMP指令才能访问到.

很明显通过JMP访问需要更多的时间, 在复杂的程序中,有很多的if else句型,又或者是一个有if else句型的库函数,每秒钟被调用几万次,

通常程序员在分支预测方面做得很糟糕, 编译器又不能精准的预测每一个分支,这时JMP产生的时间浪费就会很大,

函数 `__builtin_expert()` 就是用来解决这个问题的.