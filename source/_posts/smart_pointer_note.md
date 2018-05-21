---
title: 智能指针与多线程笔记
date: 2015-04-11 12:26:26
tags: 
- CPP
categories:
- CPP
---


有些错误是编译器查不到的, 这种错误是最可怕的, 当项目大了之后, 
即使用 Valgrind 也很难定位,
因为裸指针在团队合作中使用很容易导致其他成员忘记释放或多次释放, 所以在团队合作中一般使用智能指针. 

而智能指针用的不好, 结果可能适得其反.

所以我们聊一下智能指针的几点注意事项.

总结自 C++ Primer.



# 一个简单的包含删除器的例子演示

``` c++
#include<iostream>
#include<functional>
#include<memory>

using std::cout;
using std::endl;
using std::bind;
using namespace std::placeholders;

int testBind( int* a, int b, int c )
{
	cout << *a + b + c << endl;
	return *a;
}

int main()
{
	auto check_testBind = std::bind( testBind, std::placeholders::_1, 3, 9 );
	int * p = new int( 7 );
	cout << check_testBind( p ) << endl;

	shared_ptr<int> pi( new int(),
		check_testBind );
	*pi = 88;

	shared_ptr<int> pii( new int( 12 ),
		std::bind( testBind, std::placeholders::_1, 32, 19 ) );

	std::function< int( int* ) > test_function_bind =
		std::bind( testBind, std::placeholders::_1, 331, 9 );

	cout << "test_function_bind( p, 331, 9 ) = " << test_function_bind( p ) << endl;;

	shared_ptr<int> piii( new int( 112 ),
		test_function_bind );

	return 0;
}
```

打印结果 :

	119
	7
	347
	test_function_bind( p, 331, 9 ) = 7
	452
	63
	100
	请按任意键继续. . .





# 智能指针陷阱

智能指针可以提供对动态分配的内存安全而又方便的管理，但这建立在正确使用的
前提下 。 为了正确使用智能指针，我们必须坚持一些基本规范 :

- 不使用相同的内置指针值初始化(或 reset) 多个智能指针 。
- 不 delete get ( ) 返 回的指针 。
- 不使用 get () 初始化或 reset 另 一 个智能指针 。
- 如果你使用 get () 返 回的指针，记住当最后一个对应的智能指针销 毁 后， 你 的
指 针就 变为无 效 了 。
- 如果你使用智能指针管理的资源不是 new 分配的内存 ， 记住传递给它一个删除
器( 参见 12. 1.4 节 ， 第 415 页和 12. 1.5 节 ， 第 419 页)。


# 尽量用make_shared而非new


shared_ptr 可以协调对象的析构 ， 但这仅限于其自身的拷贝 ( 也 是 shared_ptr)
之间。

**这也是为什么我们推荐使用 make_shared 而不是 new 的原因 。**

**这样 ， 我们就能在分配对象的同时就将 shared_ptr 与之绑定，**
**从而避免了无意中将同一块内存绑定到多个独立创建的 shared_ptr 上 。(这是最容易犯的错)**

**总结 : 所以我们要尽量一开始就用make_shared来分配动态内存, 而不是先new一个出来, 再找机会将它转为智能指针.**

考虑下面对 shared_ptr 进行操作的函数 :

```  c++
// 在函数被调用时 ptr 被创建并初始化
void process(shared_ptr<int> ptr)
{
  // 使用 ptr
} // ptr 离 开作用域，被销毁
```

process 的参数是传值方式传递的，因此实参会被拷贝到 ptr 巾 。 拷贝 一 个 shared_ptr 
会递增其引用讨数，因此， 在 process 运行过程中，引用七| 数值至少为 2 。 当 process
结束时， ptr 的引用计数会边喊，但不会变为 0 。 因此，当用音11变 11 ptr 被销毁时， ptr
指向的内存不会被释放 。

使用此函数的正确方法是传递给它一个 shared_ptr :

```  c++
shared_ptr<int> p(new int(42)) ; // 引用计幸生为 1
process(p); // 拷贝 p 会递增它的引用计数 ;在 process 中引用计数位为 2
int i = *p; // 正确:引用计数位为 1
```

虽然不能传递给 process 一 个内置指针，但可以传递 给它 一 个(临时的)
shared_ptr ， 这个 shared_ptr 是用 一个内 置指针显式构造的 。 但是，这样做很可能
会导致错误 :

```  c++
int *x(new int(1024)); // 危险 x 是一个普通指针，不是一个智能指针
process(x) ; // 错误 : 不能将 int* 转换为 一个 shared_ptr<int>
process(shared_ptr<int>(x)); // 合法的，但内存会被释放!
int j = *x ; //未定义的 x 是一个空悬指针!
```

在上面的调用中 ， 我们将一个临时 shared_ptr 传递给 process 。 当这个调用所在的表
达式结束时，这个临时对象就被销毁了 。 销毁这个临时变量会递减引用计数，此时引用计
数就变为 0 了 。 因此，当临时对象被销毁时 ， 它所指向的内存会被释放 。
但 x 继续指 向 (已经释放的)内存，从而变成一个空悬指针。如果试图使用 x 的值，
其行为是未定义的 。

当将一个 shared_ptr 绑定到一个普通指针时 ， 我们就将内存的管理责任交给了这
个 shared_ptr 一旦这样做 了 ， 我们就不应该再使用内置指针来访问 shared_ptr 所
指向的内存了 


# 不要使用 get 初始化另一个智能指针或为智能指针赋值

智能指针类型定义了 一个名为 get 的函数(参见表 1 2. J )，它返回一个内置指针，
指向智能指针管理的对象 。 此函数是为了这样一种情况而设计的 : 我们需要向不能使用智
能指针的代码传递一个内置指针。使用 get 返回的指告| 的代码不能 delete 此指针 。
虽然编译器不会给出错误信息 ， 但将另一个智能指针也绑定到 get 返回的指针上是
错误的 :

``` c++
shared_ptr<int> p(new int(42)) ; // 引 用计数为 1
int *q = p . get() ; // 正确 · 但使用 q 时妥注意，不要让它管理的指针被释放
{ // 新程序块
// 未定义:两个独立的 shared_ptr 指 向 相同的内存
    shared ptr<int> (q) ;
} // 程序块结束， q 被销毁 ， 它指向的内存被待放
int foo = *p ; // 未定义 p 指向的内存 已 经被释放了
```

在本例中， p 和 q 指 向相同的内存。由于它们是相互独立创建的，因此各自的引用计数都
是 1。 当 q 所在的程序块结束时 ， q 被销毁 ， 这会导致 q 指向的内存被释放 。 从而 p 变成
一个空悬指针，意味着当我们试图使用 p 时，将发生未定义的行为 。 而且 ， 当 p 被销毁时 ，
这块内存会被第二次 delete 。

get 用来将指针的访问权限传递给代码，你只有在确定代码不会 get. 
特别是，永远不要用 get 初始化另一个智能指针 del ete 指针或者为另一个智能指针赋值.



# 竞态（race condition）

软件层面上，竞态是指多个线程或进程读写一个共享资源 (或共享设备) 时的输出结果依赖于线程或进程的先后执行顺序或者时间；
（ 更权威的介绍可以看 [wiki](https://en.wikipedia.org/wiki/Race_condition) )

至于为什么会发生竞态呢？很简单，因为并发，并发使多线程，多进程环境变成可能。

竞态具体场景：假如我们有 2 个进程会对一个全局变量进行 ++ 操作，理想时，程序会这样执行：

<table><tbody><tr><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 1</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 2</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Integer value</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">2</span></p><br></td></tr></tbody></table>

   然而，由于并发的普遍存在，使得情况有时” 不受控制”（不如工程师预期那样工作），可能会变成这样：

<table><tbody><tr><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 1</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Thread 2</span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(242,242,242);"><br><p><span style="font-size:24px;">Integer value</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">read value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">←</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(245,222,179);"><br><p><span style="font-size:24px;">increase value</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">0</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr><tr><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;"> </span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">write back</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">→</span></p><br></td><td style="background:rgb(249,249,249);"><br><p><span style="font-size:24px;">1</span></p><br></td></tr></tbody></table>


# 并发（concurrency）

并发 (concurrency) 指的是多个执行单元同时、并行被执行。而并发的执行单元对共享资源 (硬件资源和软件上的全局、静态变量) 的访问则容易导致竞态 (race conditions), 可能导致并发 (即竞态?) 的情况有：

- SMP（Symmetric Multi-Processing），对称多处理结构。SMP 是一种紧耦合、共享存储的系统模型，它的特点是多个 CPU 使用共同的系统总线，因此可访问共同的外设和存储器。

- 中断. 中断可以打断正在执行的进程 (哪怕是在中断上下文)，若中断处理程序对共享资源进程访问，则竞态也会发生.

- 内核抢占.2.6 以后内核提供了内核可抢占特性，虽然是作为一个配置选项，但我们写程序时还是要考虑周全，故内核抢占也是作为伪并发的表现，也可能发生竞态；


# 临界区（critical section）

多个线程进程对共享资源进行访问在软件表现为一个程序片段，如何避免竞态的发生呢？

一个执行路径在对共享资源进行访问时禁止其他执行路径进行访问，当有一个执行路径（A）对共享资源进行访问时，如有其他执行路径想访问共享资源，须睡眠等待 A 执行路径退出。

那么这时这个程序片段就是临界区。那么具体如何来实现临界区呢？linux 内核提供了多种同步互斥机制.（如信号量，互斥量，自旋锁，RCU，原子操作等）.



# 什么是RAII技术

我们在C++中经常使用new申请了内存空间，但是却也经常忘记delete回收申请的空间，容易造成内存溢出，于是RAII技术就诞生了，来解决这样的问题。

RAII（Resource Acquisition Is Initialization）机制是Bjarne Stroustrup首先提出的，是一种利用对象生命周期来控制程序资源（如内存、文件句柄、网络连接、互斥量等等）的简单技术。 我们知道在函数内部的一些成员是放置在栈空间上的，当函数返回时，这些栈上的局部变量就会立即释放空间，于是Bjarne Stroustrup就想到确保能运行资源释放代码的地方就是在这个程序段（栈）中放置的对象的析构函数了，因为stack winding会保证它们的析构函数都会被执行。RAII就利用了栈里面的变量的这一特点。

RAII 的一般做法是这样的：在对象构造时获取资源，接着控制对资源的访问使之在对象的生命周期内始终保持有效，最后在对象析构的时候释放资源。

借此，我们实际上把管理一份资源的责任托管给了一个存放在栈空间上的局部对象。
这种做法有两大好处： 

- (1)不需要显式地释放资源。 
- (2)采用这种方式，对象所需的资源在其生命期内始终保持有效。