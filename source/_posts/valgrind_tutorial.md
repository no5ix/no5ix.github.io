---
title: 关于Valgrind所报的4种内存丢失
date: 2015-05-02 17:56:12
tags:
- Valgrind
categories:
- Misc
---

# 官方解释及分析

摘自http://valgrind.org/docs/manual/faq.html#faq.deflost

**5.2.With Memcheck's memory leak detector, what's the difference between "definitely lost", "indirectly lost", "possibly lost", "still reachable", and "suppressed"?
**

The details are in the Memcheck section of the user manual.
In short:

- "definitely lost" means your program is leaking memory -- fix those leaks!

- "indirectly lost" means your program is leaking memory in a pointer-based structure. (E.g. if the root node of a binary tree is "definitely lost", all the children will be "indirectly lost".) If you fix the "definitely lost" leaks, the "indirectly lost" leaks should go away.

- "possibly lost" means your program is leaking memory, unless you're doing unusual things with pointers that could cause them to point into the middle of an allocated block; see the user manual for some possible causes. Use --show-possibly-lost=no if you don't want to see these reports.

- "still reachable" means your program is probably ok -- it didn't free some memory it could have. This is quite common and often reasonable. Don't use --show-reachable=yes if you don't want to see these reports.

- "suppressed" means that a leak error has been suppressed. There are some suppressions in the default suppression files. You can ignore suppressed errors.

## 分析

- "definitely lost"：确认丢失。程序中存在内存泄露，应尽快修复。当程序结束时如果一块动态分配的内存没有被释放且通过程序内的指针变量均无法访问这块内存则会报这个错误。

- "indirectly lost"：间接丢失。当使用了含有指针成员的类或结构时可能会报这个错误。这类错误无需直接修复，他们总是与"definitely lost"一起出现，只要修复"definitely lost"即可。例子可参考我的例程。

- "possibly lost"：可能丢失。大多数情况下应视为与"definitely lost"一样需要尽快修复，除非你的程序让一个指针指向一块动态分配的内存（但不是这块内存起始地址），然后通过运算得到这块内存起始地址，再释放它。例子可参考我的例程。当程序结束时如果一块动态分配的内存没有被释放且通过程序内的指针变量均无法访问这块内存的起始地址，但可以访问其中的某一部分数据，则会报这个错误。

- "still reachable"：可以访问，未丢失但也未释放。如果程序是正常结束的，那么它可能不会造成程序崩溃，但长时间运行有可能耗尽系统资源，因此笔者建议修复它。如果程序是崩溃（如访问非法的地址而崩溃）而非正常结束的，则应当暂时忽略它，先修复导致程序崩溃的错误，然后重新检测。

- "suppressed"：已被解决。出现了内存泄露但系统自动处理了。可以无视这类错误。这类错误我没能用例程触发，看官方的解释也不太清楚是操作系统处理的还是valgrind，也没有遇到过。所以无视他吧~

# 代码示例

``` c++
#include <stdio.h>
#include <stdlib.h>

void *g_p1;
int *g_p2;
int ** fun1(void)
{
    //付给了局部变量, 函数结束而不释放,为肯定丢失.
    //把函数尾部语句return p; 改为return 0;更能说明这个问题.
    int **p=(int **)malloc(16); 
    g_p1=malloc(20);  //付给了全局变量, 内存可以访问
    g_p2=(int*)malloc(30);
    g_p2++;            //付给了全局变量, 内存可以访问,但是指针被移动过,为可能丢失
    p[1]=(int *)malloc(40); //如果p丢失了,则p[1]为间接丢失.
    return p;
}
int main(int argc, char *argv[])
{

    int **p=fun1();
//  free(g_p1);  //如果不free, 将会有 still reachable 内存泄露
//  free(--g_p2);//如果不free, 将会有 possibly lost 内存泄露
//  free(p[1]);  //如果不free, 将会有 indirectly lost 内存泄露
//  free(p);     //如果不free, 将会有 definitely lost内存泄露
    return 0;
}
```

执行编译命令`g++ val_test.cpp -o v`, 然后

当执行`valgrind ./v` 命令之后的**简易**内存错误报告 :

    ==4765== Memcheck, a memory error detector
    ==4765== Copyright (C) 2002-2013, and GNU GPL'd, by Julian Seward et al.
    ==4765== Using Valgrind-3.10.1 and LibVEX; rerun with -h for copyright info
    ==4765== Command: ./v
    ==4765== 
    ==4765== 
    ==4765== HEAP SUMMARY:
    ==4765==     in use at exit: 106 bytes in 4 blocks
    ==4765==   total heap usage: 4 allocs, 0 frees, 106 bytes allocated
    ==4765== 
    ==4765== LEAK SUMMARY:
    ==4765==    definitely lost: 16 bytes in 1 blocks
    ==4765==    indirectly lost: 40 bytes in 1 blocks
    ==4765==      possibly lost: 30 bytes in 1 blocks
    ==4765==    still reachable: 20 bytes in 1 blocks
    ==4765==         suppressed: 0 bytes in 0 blocks
    ==4765== Rerun with --leak-check=full to see details of leaked memory
    ==4765== 
    ==4765== For counts of detected and suppressed errors, rerun with: -v
    ==4765== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
    b@b-VirtualBox:~/tc/valgrind_test$ valgrind --leak-check=full
    valgrind: no program specified
    valgrind: Use --help for more information.


当执行`valgrind --leak-check=full ./v` 命令之后的**详细**内存错误报告 :

    ==4767== Memcheck, a memory error detector
    ==4767== Copyright (C) 2002-2013, and GNU GPL'd, by Julian Seward et al.
    ==4767== Using Valgrind-3.10.1 and LibVEX; rerun with -h for copyright info
    ==4767== Command: ./v
    ==4767== 
    ==4767== 
    ==4767== HEAP SUMMARY:
    ==4767==     in use at exit: 106 bytes in 4 blocks
    ==4767==   total heap usage: 4 allocs, 0 frees, 106 bytes allocated
    ==4767== 
    ==4767== 30 bytes in 1 blocks are possibly lost in loss record 2 of 4
    ==4767==    at 0x4C2AB80: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
    ==4767==    by 0x40055E: fun1() (val_test.cpp:12)
    ==4767==    by 0x4005AB: main (val_test.cpp:20)
    ==4767== 
    ==4767== 56 (16 direct, 40 indirect) bytes in 1 blocks are definitely lost in loss record 4 of 4
    ==4767==    at 0x4C2AB80: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
    ==4767==    by 0x40053F: fun1() (val_test.cpp:10)
    ==4767==    by 0x4005AB: main (val_test.cpp:20)
    ==4767== 
    ==4767== LEAK SUMMARY:
    ==4767==    definitely lost: 16 bytes in 1 blocks
    ==4767==    indirectly lost: 40 bytes in 1 blocks
    ==4767==      possibly lost: 30 bytes in 1 blocks
    ==4767==    still reachable: 20 bytes in 1 blocks
    ==4767==         suppressed: 0 bytes in 0 blocks
    ==4767== Reachable blocks (those to which a pointer was found) are not shown.
    ==4767== To see them, rerun with: --leak-check=full --show-leak-kinds=all
    ==4767== 
    ==4767== For counts of detected and suppressed errors, rerun with: -v
    ==4767== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0 from 0)

    
## 总结

- 由局部变量指向的内存,如果不释放为肯定丢失, 
- 由此指针而引起的后续内存泄露,为间接丢失.
- 由全局变量指向的内存如果不被释放,为still reachable, 
- 如果该变量改动过, 为可能丢失.

是啊,局部变量是栈变量,如果你不能把这个栈变量处理好,出了这个函数,指针地址就丢失了,这时那是肯定丢失了.

如果你付给的地址是全局变量,倒是可以访问,叫still reachable

但是如果你这个全局变量的值改动过, 那只有你知道怎样正确访问这块内存,别人可能就访问不到了,这叫可能丢失.

由肯定丢失而引起的进一步的内存丢失为间接丢失.


# 解决内存泄漏的顺序

**所以碰到问题你首先要解决什么问题?**

肯定丢失, 
然后是可能丢失,
然后间接丢失,
然后still reachable!!!

