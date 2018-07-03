---
title: 为什么不推荐递归以及什么是尾递归
date: 2015-01-02 12:18:54
categories:
- Misc
---

# 为什么不推荐递归



递归的调试难度奇高，就决定了实际项目中很少用递归。

而且递归确实运行效率低，因为函数一层一层调用存在调用栈，

在切换到更深层的函数时要产生断点，为了保证回来时继续运行，

必须保存现在所处函数的各种状态，回来时恢复状态，这样一层层下去性能损失就不断增加。

大量开辟在栈区的内存 ，直到每一层的递归结束或整个递归结束才释放 且这个内存空间可能呈几何级数增加， 空间效率不佳， 有可能会栈溢出

**而要知道什么是尾递归， 首先得指到什么是尾调用**

**. . .**<!-- more -->




# 尾调用

尾调用的概念非常简单，一句话就能说清楚，就是指某个函数的最后一步是调用另一个函数

``` javascript
function f(x){
  return g(x);
}
```

<p>上面代码中，函数f的最后一步是调用函数g，这就叫尾调用。</p>

<p>以下两种情况，都不属于尾调用。</p>

``` javascript
// 情况一
function f(x){
  let y = g(x);
  return y;
}

// 情况二
function f(x){
  return g(x) + 1;
}
```

<p>上面代码中，情况一是调用函数g之后，还有别的操作，所以不属于尾调用，即使语义完全一样。情况二也属于调用后还有操作，即使写在一行内。</p>

<p>尾调用不一定出现在函数尾部，只要是最后一步操作即可。</p>

``` javascript
function f(x) {
  if (x > 0) {
    return m(x)
  }
  return n(x);
}
```

<p>上面代码中，函数m和n都属于尾调用，因为它们都是函数f的最后一步操作。</p>

## 为什么推荐尾调用

Lua 中函数的另一个有趣的特征是可以正确的处理尾调用（proper tail recursion，一
些书使用术语“尾递归”，虽然并未涉及到递归的概念）。
尾调用是一种类似在函数结尾的 goto 调用，当函数最后一个动作是调用另外一个函
数时，我们称这种调用尾调用。例如：
``` lua
function f(x)
  return g(x)
end
```
g 的调用是尾调用。
例子中 f 调用 g 后不会再做任何事情，
这种情况下当被调用函数 g 结束时程序不需 要返回到调用者 f；

所以尾调用之后程序不需要在栈中保留关于调用者的任何信息。
一些编译器比如 Lua 解释器利用这种特性在处理尾调用时不使用额外的栈，我们称这种语言支持正确的尾调用.

由于尾调用不需要使用栈空间，那么尾调用递归的层次可以无限制的。例如下面调
用不论 n 为何值不会导致栈溢出。
``` lua
function foo (n)
  if n > 0 then return foo(n - 1) end
end
```

# 什么是尾递归

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。

## 尾递归具体例子1


``` c++
long Rescuvie(long n) {

    return (n == 1) ? 1 : n  Rescuvie(n - 1);

}
```

尾递归:

``` c++
long TailRescuvie(long n, long a) {

    return (n == 1) ? a : TailRescuvie(n - 1, a  *  n);

}


long TailRescuvie(long n) {//封装用的
    
    return (n == 0) ? 1 : TailRescuvie(n, 1);

}
```

当n = 5时

对于线性递归, 他的递归过程如下:

    Rescuvie(5)

    {5 Rescuvie(4)}

    {5 {4 Rescuvie(3)}}

    {5 {4 {3 Rescuvie(2)}}}

    {5 {4 {3 {2 Rescuvie(1)}}}}

    {5 {4 {3 {2 1}}}}

    {5 {4 {3 2}}}

    {5 {4 6}}

    {5 * 24}

    120

对于尾递归, 他的递归过程如下:

    TailRescuvie(5)

    TailRescuvie(5, 1)

    TailRescuvie(4, 5)

    TailRescuvie(3, 20)

    TailRescuvie(2, 60)

    TailRescuvie(1, 120)

    120

很容易看出, 普通的线性递归比尾递归更加消耗资源, 在实现上说, 每次重复的过程

调用都使得调用链条不断加长. 系统不得不使用栈进行数据保存和恢复.而尾递归就

不存在这样的问题, 因为他的状态完全由n和a保存.


## 尾递归具体例子2

具体事例2 快速排序算法实施尾递归优化
``` c++
void quickSort(SqList * list , int low ,int high)
{
    int pivot;
    while(low<high)
    {
        pivot=Partition(list,low,high);

        quickSort(list, low,pivot - 1);

        //quickSort(list,low,pivot-1); 原递归调用

        //quickSort(list,pivot+1,high);

        low = pivot+1; /*尾递归*/

    }
}
```