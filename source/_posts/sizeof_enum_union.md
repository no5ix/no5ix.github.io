---
title: 共用体和枚举占多少内存
date: 2015-04-12 23:30:01
tags:
- 对象模型
categories:
- CPP
---

本文不讨论结构体, 结构体跟类(class)类似, 请参考 {% post_link cpp_object_model_conclusion C++对象模型之实例总结讲解 %}

# 问题

**32位**机器上, 下列代码的sizeof(a)的值是多少?

``` c++
#pragma pack(2)

class A
{
    int i;

    union U
    {

        char buff[13];

        int i;

    }u;

    void foo() {    }

    typedef char* (*f)(void*);

    enum{ red, green, blue } color;
}a;
#pragma pack()
```

## 答案

答案是sizeof(a)的值为22.

- void foo() { } ，typedef char* (f)(void);不占字节，
- 枚举占4个字节，
- union按最大的变量所占字节算，占14个字节，
- int占4个字节，

4+14+4=22。

如果把#pragma pack(2)改为 #pragma pack(4)， sizeof(a)的值就为 24。

## 解析

分为三部分来解析:

- [枚举所占内存计算方法](#枚举所占内存计算方法)
- [#pragma pack用法](#pragma-pack用法)
- [共用体(union)所占内存计算方法](#共用体-union-所占内存计算方法)

### 枚举所占内存计算方法

枚举变量，由枚举类型定义的变量。枚举变量的大小，即枚举类型所占内存的大小。

由于枚举变量的赋值，一次只能存放枚举结构中的某个常数。

所以枚举变量的大小，实质是常数所占内存空间的大小（常数为int类型，当前主流的编译器中一般是32位机器和64位机器中int型都是4个字节），枚举类型所占内存大小也是这样。

### #pragma pack用法

`#pragma pack(a)`规定的对齐长度（a可选值为1，2，4，8，16），实际使用的规则是： 
结构，联合，或者类的数据成员，第一个放在偏移为0的地方，以后每个数据成员的对齐，按照#pragma pack指定的数值和这个数据成员自身长度中，比较小的那个进行。 
也就是说，当#pragma pack的值等于或超过所有数据成员长度的时候，这个值的大小将不产生任何效果。 
而结构整体的对齐，则按照结构体中最大的数据成员 和 #pragma pack指定值 之间，较小的那个进行。
而 `#pragma pack()` 表示恢复默认的内存对齐（与`#pragma pack(a)`指令配对使用）


``` c++
#pragma pack(4)

class TestB
{
public:

    int aa; //第一个成员，放在[0,3]偏移的位置，

    char a; //第二个成员，自身长为1，#pragma pack(4),取小值，也就是1，所以这个成员按一字节对齐，放在偏移[4]的位置。

    short b; //第三个成员，自身长2，#pragma pack(4)，取2，按2字节对齐，所以放在偏移[6,7]的位置。

    char c; //第四个，自身长为1，放在[8]的位置。

};
#pragma pack()
```

这个类实际占据的内存空间是9字节 
类之间的对齐，是按照类内部最大的成员的长度，和#pragma pack规定的值之中较小的一个对齐的。 
所以这个例子中，类之间对齐的长度是min(sizeof(int),4)，也就是4。 
9按照4字节圆整的结果是12，所以sizeof(TestB)是12。

如果
``` c++
#pragma pack(2)
class TestB
{
public:
    int aa; //第一个成员，放在[0,3]偏移的位置，
    char a; //第二个成员，自身长为1，#pragma pack(2),取小值，也就是1，所以这个成员按一字节对齐，放在偏移[4]的位置。
    short b; //第三个成员，自身长2，#pragma pack(2)，取2，按2字节对齐，所以放在偏移[6,7]的位置。
    char c; //第四个，自身长为1，放在[8]的位置。
};
#pragma pack()
```
可以看出，上面的位置完全没有变化，只是类之间改为按2字节对齐，9按2圆整的结果是10。
所以 sizeof(TestB)是10。


现在去掉第一个成员变量为如下代码：
``` c++
#pragma pack(4)
class TestC
{
public:
　　char a;//第一个成员，放在[0]偏移的位置，
　　short b;//第二个成员，自身长2，#pragma pack(4)，取2，按2字节对齐，所以放在偏移[2,3]的位置。
　　char c;//第三个，自身长为1，放在[4]的位置。
};
#pragma pack()
```
整个类的大小是5字节，按照min(sizeof(short),4)字节对齐，也就是2字节对齐，结果是6
所以sizeof(TestC)是6。

整个类的大小是5字节，按照min(sizeof(short),4)字节对齐，也就是2字节对齐，结果是6，所以sizeof(TestC)是6。


### 共用体(union)所占内存计算方法

共用体又名"联合体", 英文名为union.

当多个数据需要共享内存或者多个数据每次只取其一时，可以利用联合体(union)。在C Programming Language 一书中对于联合体是这么描述的：

- 联合体是一个结构；
- 它的所有成员相对于基地址的偏移量都为0；
- 此结构空间要大到足够容纳最"宽"的成员；
- 其对齐方式要适合其中所有的成员；

下面解释这四条描述：

由于联合体中的所有成员是共享一段内存的，因此每个成员的存放首地址相对于于联合体变量的基地址的偏移量为0，即所有成员的首地址都是一样的。为了使得所有成员能够共享一段内存，因此该空间必须足够容纳这些成员中最宽的成员。对于这句“对齐方式要适合其中所有的成员”是指其必须符合所有成员的自身对齐方式。

下面举例说明：

```
1 union U
2 {
3     char s[9];
4     int n;
5     double d;
6 };
```
 
s占9字节，n占4字节，d占8字节，因此其至少需9字节的空间。然而其实际大小并不是9，用运算符sizeof测试其大小为16.这是因为这里存在字节对齐的问题，9既不能被4整除，也不能被8整除。

因此补充字节到16，这样就符合所有成员的自身对齐了。从这里可以看出联合体所占的空间不仅取决于最宽成员，还跟所有成员有关系，即其大小必须满足两个条件：

- 大小足够容纳最宽的成员；
- 大小能被其包含的所有基本数据类型的大小所整除。

### 若问题为#pragma pack(4)的情况

- void foo() { } ，typedef char* (f)(void);不占字节，
- 枚举占4个字节，
- union按最大的变量buff[13]所占字节算为13, 在#pragma pack(2)的情况, 得补齐1个字节变为14才能被2整除, 而#pragma pack(4)的情况得补齐3个字节, 总占16个字节，才可以被4整除,
- int占4个字节

所以#pragma pack(4)的情况, sizeof(A)为4+16+4=24。


# 练习

注意有陷阱, 32位环境下

``` c++
# pragma pack(2)
class test_class
{
public:
	static float i;

	union test_union
	{
		int bb;
		char aa[13];
		short cc;
	};
	
	enum test_enum
	{
		monday,
		tuesday,
		sunday
	};

	virtual void testFunc() {}
	
	char xmly;
};

# pragma pack()

int main()
{
	cout << "sizeof(test_class) : " << sizeof(test_class) << endl; 
	return 0;
}
```

请问打印结果?

`sizeof(test_class) : 6`

为什么呢?
注意看共用体 test_union 和枚举 test_enum其实并没有声明变量, 如果写成
``` c++
#include <iostream>

using namespace std;

# pragma pack(2)
class test_class
{
public:
	static float i;

	union test_union
	{
		int bb;
		char aa[13];
		short cc;
	}uVar;

	enum test_enum
	{
		monday,
		tuesday,
		sunday
	}eVar;

	virtual void testFunc() {}

	char xmly;
};
# pragma pack()

enum enum_x 
{ 
	x1=5, 
	x2, 
	x3, 
	x4, 
}; 
enum enum_x x=x3; 

int main()
{
	cout << "sizeof(test_class) : " << sizeof(test_class) << endl; 

	cout << "x : " << x << endl;

	test_class::test_enum i;
	i = test_class::monday;
	cout << "i : " << i << endl;

	test_class test_obj;
	test_obj.eVar = test_class::sunday;
	cout << test_obj.monday << endl;

	cout << test_class::sunday << endl;
	return 0;
}
```
打印结果就为 

```
sizeof(test_class) : 24
x : 7
i : 0
0
2
```