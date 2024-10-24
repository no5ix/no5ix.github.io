---
title: cpp的各个编译选项备忘整理
date: 2021-06-11 22:53:55
tags:
- CPP
categories:
- CPP
---


# 编译器优化级别

用 C/C++ 的肯定都知道编译器编译有各种优化级别，编译器优化级别大体如下：

*   O0（默认选项）：不开启优化，方便功能调试
*   Og：方便调试的优化选项（比 O1 更保守）
*   O1：保守的优化选项，打开了四十多个优化选项
*   O2：常用的发布优化选项，在 O1 的基础上额外打开了四十多个优化选项，包括自动内联等规则
*   Os：产生较小代码体积的优化选项（比 O2 更保守）
*   O3：较为激进的优化选项（对错误编码容忍度最低），在 O2 的基础上额外打开了十多个优化选项
*   Ofast：打开可导致不符合 IEEE 浮点数等标准的性能优化选项。

具体介绍如下：

**. . .**<!-- more -->

O0：编译器默认就是 O0，该选项下不会开启优化，方便开发者调试。

O1：致力于在不需要过多的编译时间情况下，尽量减少代码大小和尽量提高程序运行速度，它开启了下面的优化标志：

```
-fauto-inc-dec 
-fbranch-count-reg 
-fcombine-stack-adjustments 
-fcompare-elim 
-fcprop-registers 
-fdce 
-fdefer-pop 
-fdelayed-branch 
-fdse 
-fforward-propagate 
-fguess-branch-probability 
-fif-conversion 
-fif-conversion2 
-finline-functions-called-once 
-fipa-modref 
-fipa-profile 
-fipa-pure-const 
-fipa-reference 
-fipa-reference-addressable 
-fmerge-constants 
-fmove-loop-invariants 
-fomit-frame-pointer 
-freorder-blocks 
-fshrink-wrap 
-fshrink-wrap-separate 
-fsplit-wide-types 
-fssa-backprop 
-fssa-phiopt 
-ftree-bit-ccp 
-ftree-ccp 
-ftree-ch 
-ftree-coalesce-vars 
-ftree-copy-prop 
-ftree-dce 
-ftree-dominator-opts 
-ftree-dse 
-ftree-forwprop 
-ftree-fre 
-ftree-phiprop 
-ftree-pta 
-ftree-scev-cprop 
-ftree-sink 
-ftree-slsr 
-ftree-sra 
-ftree-ter 
-funit-at-a-time

```

Og：如果是为了调试，该选项是比 O0 更好的选择，它会打开 O1 大部分优化标志，但是不会启用那些影响调试的标志：

```
-fbranch-count-reg  -fdelayed-branch 
-fdse  -fif-conversion  -fif-conversion2  
-finline-functions-called-once 
-fmove-loop-invariants  -fssa-phiopt 
-ftree-bit-ccp  -ftree-dse  -ftree-pta  -ftree-sra

```

O2：常见的 Release 级别，该选项下几乎执行了所有支持的优化选项，它增加了编译时间，提高了程序的运行速度，又额外打开了以下优化标志：

```
-falign-functions  -falign-jumps 
-falign-labels  -falign-loops 
-fcaller-saves 
-fcode-hoisting 
-fcrossjumping 
-fcse-follow-jumps  -fcse-skip-blocks 
-fdelete-null-pointer-checks 
-fdevirtualize  -fdevirtualize-speculatively 
-fexpensive-optimizations 
-ffinite-loops 
-fgcse  -fgcse-lm  
-fhoist-adjacent-loads 
-finline-functions 
-finline-small-functions 
-findirect-inlining 
-fipa-bit-cp  -fipa-cp  -fipa-icf 
-fipa-ra  -fipa-sra  -fipa-vrp 
-fisolate-erroneous-paths-dereference 
-flra-remat 
-foptimize-sibling-calls 
-foptimize-strlen 
-fpartial-inlining 
-fpeephole2 
-freorder-blocks-algorithm=stc 
-freorder-blocks-and-partition  -freorder-functions 
-frerun-cse-after-loop  
-fschedule-insns  -fschedule-insns2 
-fsched-interblock  -fsched-spec 
-fstore-merging 
-fstrict-aliasing 
-fthread-jumps 
-ftree-builtin-call-dce 
-ftree-pre 
-ftree-switch-conversion  -ftree-tail-merge 
-ftree-vrp

```

Os：打开了几乎所有的 O2 优化标志，除了那些经常会增加代码大小的优化标志：

```
-falign-functions  -falign-jumps 
-falign-labels  -falign-loops 
-fprefetch-loop-arrays  -freorder-blocks-algorithm=stc

```

它还启用了 - finline-functions 优化标志，使编译器根据代码大小而不是程序运行速度进行优化，为了减少代码大小。

O3：在 O2 的基础上又打开了以下优化标志：

```
-fgcse-after-reload 
-fipa-cp-clone
-floop-interchange 
-floop-unroll-and-jam 
-fpeel-loops 
-fpredictive-commoning 
-fsplit-loops 
-fsplit-paths 
-ftree-loop-distribution 
-ftree-loop-vectorize 
-ftree-partial-pre 
-ftree-slp-vectorize 
-funswitch-loops 
-fvect-cost-model 
-fvect-cost-model=dynamic 
-fversion-loops-for-strides

```

Ofast：更加激进的编译选项，它不会严格遵循标准，在 O3 的优化基础上，它又开启了一些可能导致不符合 IEEE 浮点数等标准的性能优化选项，如 - fast-math， -fallow-store-data-races 等。

tips：上述优化选项如果想要了解具体含义可以看 [https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html) 官方文档。


# debug和release区别

编译器有这么多优化级别，Debug 版本和 Release 版本其实就是优化级别的区别，Debug 称为调试版本，编译的结果通常包含有调试信息，没有做任何优化，方便开发人员进行调试，Release 称为发布版本，不会携带调试信息，同时编译器对代码进行了很多优化，使代码更小，速度更快，发布给用户使用，给用户使用以更好的体验。但 Release 模式编译比 Debug 模式花的时间也会更多。

Debug 模式下在内存分配上有所区别，在我们申请内存时，Debug 模式会多申请一部分空间，分布在[内存块](https://www.zhihu.com/search?q=%E5%86%85%E5%AD%98%E5%9D%97&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A1720297063%7D)的前后，用于存放调试信息。

对于未初始化的变量，Debug 模式下会默认对其进行初始化，而 Release 模式则不会，所以就有个常见的问题，局部变量未初始化时，Debug 模式和 Release 模式表现有所不同。

```
bool func() {
    bool found;
    for (int i = 0; i < vec.size(); ++i) {
        if (vec[i] == 3) {
            found = true;
        }
    }
    return found; 
}


```

Debug 模式下可能运行正常，但 Release 模式下可能会返回错误结果，因为 found 局部变量在 Release 模式下没有初始化。

Debug 模式以 32 字节为单位分配内存，例如当申请 24 字节内存时，Release 模式下是正常的分配 24 字节，Debug 模式会分配 32 字节，多了 8 字节，所以有些数组越界问题在 Debug 模式下可以安全运行，Release 模式下就会出问题。


## assert与NDEBUG宏

Debug 模式下可以使用 [assert](https://www.zhihu.com/search?q=assert&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A1720297063%7D)，运行过程中有异常现象会及时 crash，Release 模式下模式下不会编译 assert，遇到不期望的情况不会及时 crash，稀里糊涂继续运行，到后期可能会产生奇奇怪怪的错误，不易调试，殊不知其实在很早之前就出现了问题。编译器在 Debug 模式下定义 `_DEBUG` 宏，Release 模式下定义 `NDEBUG` 宏，[预处理器](https://www.zhihu.com/search?q=%E9%A2%84%E5%A4%84%E7%90%86%E5%99%A8&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A1720297063%7D)就是根据对应宏来判断是否开启 assert 的。

数据溢出问题，在一个函数中，存在某些从未被使用的变量，且函数内存在数据溢出问题，在 Debug 模式下可能不会产生问题，因为不会对该变量进行优化，它在栈空间中还是占有几个字节，但是 Release 模式下可能会出问题，Release 模式下可能会优化掉此变量，栈空间相应变小，数据溢出就会导致栈内存损坏，有可能会产生奇奇怪怪的错误。例如：

```
void func() {
    char buffer[10];
    int counter;
    lstrcpy(buffer, "abcdefghik"); // 需要拷贝11字节
}


```

tips：不要将 Debug 库和 Release 库混合在一起，可能会出问题，至于为啥会出问题，我也不知道，一般都是有两个目录，Debug 目录和 Release 目录。

回到那两个问题：

有时候程序在 Debug 模式下运行的好好的，Release 模式下就 crash 了，怎么办？

看一下代码中是否有未初始化的变量，是否有数组越界问题，从这个思路入手。

有些时候程序在 Debug 模式下会崩溃，Release 模式下却正常运行，怎么办？

可以尝试着找一找代码中的 assert，看一下是否是 assert 导致的两种模式下的差异，从这个思路入手。

