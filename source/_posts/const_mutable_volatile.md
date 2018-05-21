---
title: const和volatile和mutable讲解
date: 2015-05-24 17:56:12
tags:
- CPP
categories:
- CPP
---

# const关键字

const 是比较常见的关键字, 也是非常好的预防错误的手段.

## <u>**const** **修饰普通变量和指针**</u>

const 修饰变量，一般有两种写法：

    const TYPE value;

    TYPE const value;

这两种写法在本质上是一样的。它的含义是：const 修饰的类型为 TYPE 的变量 value 是不可变的。对于一个非指针的类型 TYPE，无论怎么写，都是一个含义，即 value 值不可变。 例如：

    const int nValue；    //nValue 是 const

    int const nValue；    //nValue 是 const

. . . <!-- more -->

但是对于指针类型的 TYPE，不同的写法会有不同情况：

- （1） 指针本身是常量不可变

        (char*) const pContent;

- （2）指针所指向的内容是常量不可变

        const (char) *pContent;

        (char) const *pContent;

- （3） 两者都不可变

        const char* const pContent;

识别 const 到底是修饰指针还是指针所指的对象，还有一个较为简便的方法，也就是沿着 * 号划一条线：

- 如果 const 位于 * 的左侧，则 const 就是用来修饰指针所指向的变量，即指针指向为常量；

- 如果 const 位于 * 的右侧，const 就是修饰指针本身，即指针本身是常量。

## <u>**const** **修饰函数参数**</u>

const 修饰函数参数是它最广泛的一种用途，它表示在函数体中不能修改参数的值 (包括参数本身的值或者参数其中包含的值)：

    void function(const int Var);     // 传递过来的参数在函数内不可以改变 (无意义，该函数以传值的方式调用)

    void function(const char* Var);   // 参数指针所指内容为常量不可变

    void function(char* const Var);   // 参数指针本身为常量不可变 (也无意义，var 本身也是通过传值的形式赋值的)

    void function(const Class& Var); // 引用参数在函数内不可以改变

参数 const 通常用于参数为指针或引用的情况，若输入参数采用 “值传递” 方式，由于函数将自动产生临时变量用于复制该参数，该参数本就不需要保护，所以不用 const 修饰。

<u style="color: red;">**const** **修饰类对象** **/** **对象指针** **/** **对象引用**</u>

const 修饰类对象表示该对象为常量对象，其中的任何成员都不能被修改。对于对象指针和对象引用也是一样。

const 修饰的对象，该对象的任何非 const 成员函数都不能被调用，因为任何非 const 成员函数会有修改成员变量的企图。

例如：
``` c++
class AAA

{
   void func1();

void func2() const;

}

const AAA aObj;

aObj.func1(); 错误

aObj.func2(); 正确

const AAA* aObj = new AAA();

aObj->func1(); 错误

aObj->func2(); 正确
```
<u style="color: red; background-color: yellow;">**const**</u> <pangu></pangu> <u style="color: red;">**修饰数据成员**</u>

const 数据成员只在某个对象生存期内是常量，而对于整个类而言却是可变的。因为类可以创建多个对象，不同的对象其 const 数据成员的值可以不同。所以不能在类声明中初始化 const 数据成员，因为类的对象未被创建时，编译器不知道 const 数据成员的值是什么，例如：

    class A
    {
        const int size = 100; // 错误
        int array[size];       // 错误，未知的 size
    }

const 数据成员的初始化只能在类的构造函数的初始化列表中进行。要想建立在整个类中都恒定的常量，可以用类中的枚举常量来实现，例如：

    class A
    {

    …
    　　enum {size1=100, size2 = 200};
    　　int array1[size1];
    　　int array2[size2];

    …
    }

枚举常量不会占用对象的存储空间，他们在编译时被全部求值。但是枚举常量的隐含数据类型是整数，其最大值有限，且不能表示浮点数。

## <u>**const** **修饰成员函数**</u>

const 修饰类的成员函数，用 const 修饰的成员函数不能改变对象的成员变量。一般把 const 写在成员函数的最后：

    class A

    {

       …

    void function()const; // 常成员函数, 它不改变对象的成员变量. 也不能调用类中任何非 const 成员函数。

    }

对于 const 类对象 / 指针 / 引用，只能调用类的 const 成员函数。

## **<u>const 修饰成员函数的返回值</u>**

- １、一般情况下，函数的返回值为某个对象时，如果将其声明为 const 时，多用于操作符的重载。通常，不建议用 const 修饰函数的返回值类型为某个对象或对某个对象引用的情况。原因如下：如果返回 const 对象，或返回 const 对象的引用，则返回值具有 const 属性，返回实例只能访问类 A 中的公有（保护）数据成员和 const 成员函数，并且不允许对其进行赋值操作，这在一般情况下很少用到。

- 2、如果给采用 “指针传递” 方式的函数返回值加 const 修饰，那么函数返回值（即指针所指的内容）不能被修改，该返回值只能被赋给加 const 修饰的同类型指针：

        const char * GetString(void);

    如下语句将出现编译错误：

        char *str=GetString();

    正确的用法是：

        const char *str=GetString();

- 3、函数返回值采用 “引用传递” 的场合不多，这种方式一般只出现在类的赙值函数中，目的是为了实现链式表达。如：

        class A
        {…
            A &operate= (const A &other); // 赋值函数
        }
        A a,b,c; //a,b,c 为 A 的对象
        …
        a=b=c;   // 正常
        (a=B)=c; // 不正常，但是合法

    若赋值函数的返回值加 const 修饰，那么该返回值的内容不允许修改，上例中 a=b=c 依然正确。(a=b)=c 就不正确了。

## <u>**const** **常量与** **define** **宏定义的区别**</u>

- （1） 编译器处理方式不同

    define 宏是在预处理阶段展开。

    const 常量是编译运行阶段使用。

- （2）类型和安全检查不同

    define 宏没有类型，不做任何类型检查，仅仅是展开。

    const 常量有具体的类型，在编译阶段会执行类型检查。

- （3） 存储方式不同

    define 宏仅仅是展开，有多少地方使用，就展开多少次，不会分配内存。

    const 常量会在内存中分配 (可以是堆中也可以是栈中)。



# volatile关键字

volatile 的本意是 “易变的”,volatile 关键字是一种类型修饰符，用它声明的类型变量表示可以被某些编译器未知的因素更改，比如操作系统、硬件或者其它线程等。遇到这个关键字声明的变量，编译器对访问该变量的代码就不再进行优化，从而可以提供对特殊地址的稳定访问。

当要求使用 volatile 声明的变量的值的时候，系统总是重新从它所在的内存读取数据，即使它前面的指令刚刚从该处读取过数据。而且读取的数据立刻被寄存。例如：

    volatile int i=10;

    int a = i;

    。。。// 其他代码，并未明确告诉编译器，对 i 进行过操作

    int b = i;

volatile 指出 i 是随时可能发生变化的，每次使用它的时候必须从 i 的地址中读取，因而编译器生成的汇编代码会重新从 i 的地址读取数据放在 b 中。而优化做法是，由于编译器发现两次从 i 读数据的代码之间的代码没有对 i 进行过操作，它会自动把上次读的数据放在 b 中。而不是重新从 i 里面读。这样以来，如果 i 是一个寄存器变量或者表示一个端口数据就容易出错，所以说 volatile 可以保证对特殊地址的稳定访问。

注意，在 vc6 中，一般调试模式没有进行代码优化，所以这个关键字的作用看不出来。下面通过插入汇编代码，测试有无 volatile 关键字，对程序最终代码的影响。首先用 classwizard 建一个 win32 console 工程，插入一个 voltest.cpp 文件，输入下面的代码：
``` c++
#include <stdio.h>

void main()

{

int i=10;

int a = i;

printf("i= %d/n",a);

// 下面汇编语句的作用就是改变内存中 i 的值，但是又不让编译器知道

__asm {

 mov dword ptr [ebp-4], 20h

}

int b = i;

printf("i= %d/n",b);

}
```
然后，在调试版本模式运行程序，输出结果如下：

    i = 10

    i = 32

然后，在 release 版本模式运行程序，输出结果如下：

    i = 10

    i = 10

输出的结果明显表明，release 模式下，编译器对代码进行了优化，第二次没有输出正确的 i 值。下面，我们把 i 的声明加上 volatile 关键字，看看有什么变化：
``` c++
#include <stdio.h>

void main()

{

volatile int i=10;

int a = i;

printf("i= %d/n",a);

__asm {

 mov dword ptr [ebp-4], 20h

}

int b = i;

printf("i= %d/n",b);

}
```
分别在调试版本和 release 版本运行程序，输出都是：

    i = 10

    i = 32

这说明这个关键字发挥了它的作用！

## **关于** **volatile** **的补充信息**

一个定义为 volatile 的变量是说这变量可能会被意想不到地改变，这样，编译器就不会去假设这个变量的值了。精确地说就是，优化器在用到这个变量时必须每次都小心地重新读取这个变量的值，而不是使用保存在寄存器里的备份。下面是 volatile 变量的几个例子：

- 1). 并行设备的硬件寄存器（如：状态寄存器）

- 2). 一个中断服务子程序中会访问到的非自动变量 (Non-automatic variables)

- 3). 多线程应用中被几个任务共享的变量

我认为这是区分 C 程序员和嵌入式系统程序员的最基本的问题。嵌入式系统程序员经常同硬件、中断、RTOS 等等打交道，所用这些都要求 volatile 变量。不懂得 volatile 内容将会带来灾难。假设被面试者正确地回答了这是问题（嗯，怀疑这否会是这样），我将稍微深究一下，看一下这家伙是不是直正懂得 volatile 的重要性：

- 1). 一个参数既可以是 const 还可以是 volatile 吗？解释为什么。

- 2). 一个指针可以是 volatile 吗？解释为什么。

- 3). 下面的函数有什么错误：

         int square(volatile int *ptr)

         {

              return *ptr * *ptr;

         }

下面是答案：

- 1). 是的。一个例子是只读的状态寄存器。它是 volatile 因为它可能被意想不到地改变。它是 const 因为程序不应该试图去修改它。

- 2). 是的。尽管这并不很常见。一个例子是当一个中服务子程序修该一个指向一个 buffer 的指针时。

- 3). 这段代码的有个恶作剧。这段代码的目的是用来返指针 *ptr 指向值的平方，但是，由于 *ptr 指向一个 volatile 型参数，编译器将产生类似下面的代码：

        int square(volatile int *ptr)

        {

             int a,b;

             a = *ptr;

                b = *ptr;

             return a * b;

         }

    由于 *ptr 的值可能被意想不到地该变，因此 a 和 b 可能是不同的。结果，这段代码可能返不是你所期望的平方值！正确的代码如下：

         long square(volatile int *ptr)

         {

                int a;

                a = *ptr;

                return a * a;

         }



# mutable关键字

mutalbe 的中文意思是 “可变的，易变的”，跟 constant（既 C++ 中的 const）是反义词。在 C++ 中，mutable 也是为了突破 const 的限制而设置的。被 mutable 修饰的变量 (mutable 只能由于修饰类的非静态数据成员)，将永远处于可变的状态，即使在一个 const 函数中。

我们知道，假如类的成员函数不会改变对象的状态，那么这个成员函数一般会声明为 const。但是，有些时候，我们需要在 const 的函数里面修改一些跟类状态无关的数据成员，那么这个数据成员就应该被 mutalbe 来修饰。下面是一个小例子：
```c++
class ClxTest

{

　public:

　　void Output() const;

};

void ClxTest::Output() const

{

　cout << "Output for test!" << endl;

}

void OutputTest(const ClxTest& lx)

{

　lx.Output();

}
```
类 ClxTest 的成员函数 Output 是用来输出的，不会修改类的状态，所以被声明为 const。

函数 OutputTest 也是用来输出的，里面调用了对象 lx 的 Output 输出方法，为了防止在函数中调用成员函数修改任何成员变量，所以参数也被 const 修饰。

假如现在，我们要增添一个功能：计算每个对象的输出次数。假如用来计数的变量是普通的变量的话，那么在 const 成员函数 Output 里面是不能修改该变量的值的；而该变量跟对象的状态无关，所以应该为了修改该变量而去掉 Output 的 const 属性。这个时候，就该我们的 mutable 出场了，只要用 mutalbe 来修饰这个变量，所有问题就迎刃而解了。下面是修改过的代码：
``` c++
class ClxTest

{

　public:

　　ClxTest();

　　~ClxTest();

　　void Output() const;

　　int GetOutputTimes() const;

　private:

　　**mutable** int m_iTimes;

};

ClxTest::ClxTest()

{

　m_iTimes = 0;

}

ClxTest::~ClxTest()

{}

void ClxTest::Output() const

{

　cout << "Output for test!" << endl;

　m_iTimes++;

}

int ClxTest::GetOutputTimes() const

{

　return m_iTimes;

}

void OutputTest(const ClxTest& lx)

{

　cout <<lx.GetOutputTimes() << endl;

　lx.Output();

　cout <<lx.GetOutputTimes() << endl;

}
```
计数器 m_iTimes 被 mutable 修饰，那么它就可以突破 const 的限制，在被 const 修饰的函数里面也能被修改。
