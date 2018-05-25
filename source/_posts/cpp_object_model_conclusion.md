---
title: C++对象模型之实例总结讲解
date: 2015-02-21 17:49:01
tags:
- ObjectModel
categories:
- CPP
---

# 介绍

因为c++只规定了 虚继承/ 虚函数/ 多继承/ 的行为, 但将实现方法留给编译器作者. 所以各个平台的实现并不相同, 得出的结果也不尽相同.

[经测试](#测试常用平台的不同), vs和gcc目前比较统一的情况只有2种 :

- 无继承+无虚函数
- 无继承+虚函数

**故本文只讨论这2种, 以及了解虚函数和虚继承的含义.**

**. . .**<!-- more -->

## 关于虚函数

当类中声明了虚函数（不管是1个还是多个），那么在实例化对象时，编译器会自动在对象里安插一个指针vPtr指向虚函数表VTable；

{% asset_img virtual_table_0.png 虚函数讲解(摘自cpp primer plus) %}
{% asset_img virtual_table_1.png 虚函数表图解(摘自cpp primer plus) %}


## 关于虚继承

当涉及到虚继承，会增加vbPtr指针指向虚基表vbTable

## 单继承对象模型

类的继承关系为：
class Derived : public Base

{% asset_img cpp_object_model_conclusion_1.png  %}


## 无继承但有虚函数示例

测试环境为Windows/VS, 32位.

``` c++
class A       
{       
};      
   
class B       
{    
    char ch;       
    virtual void func0()  {  }     
};     
   
class C      
{    
    char ch1;    
    char ch2;    
    virtual void func()  {  }      
    virtual void func1()  {  }     
};    
   
   
int main(void)    
{    
    cout<<"A="<<sizeof(A)<<endl;    //result=1    
    cout<<"B="<<sizeof(B)<<endl;    //result=8        
    cout<<"C="<<sizeof(C)<<endl;    //result=8  
    return 0;    
}  
```


# 总结

首先，平时所声明的类只是一种类型定义，它本身是没有大小可言的。 因此，如果用sizeof运算符对一个类型名操作，那得到的是具有该类型实体的大小。
计算一个类对象的大小时的规律：

空类、单一继承的空类、多重继承的空类所占空间大小为：1（字节，下同）；
一个类中，虚函数本身、成员函数（包括静态与非静态）和静态数据成员都是不占用类对象的存储空间的；因此一个对象的大小≥所有非静态成员大小的总和；

**类对象的大小** = 
各非静态数据成员（包括父类的非静态数据成员但都不包括所有的成员函数）的总和 + 
vfptr指针(多继承下可能不止一个)+vbptr指针(多继承下可能不止一个) + 
编译器因为要内存对齐而额外增加的字节。

# 测试常用平台的不同

测试了 Windows10 / VS2015 和 Ubuntu14.04.3 / gcc4.8.4 , 都是64位

## 测试有多继承的情况

```c++
#include <iostream>

using std::cout;
using std::endl;

class A
{
};

class B
{
	char ch;
	virtual void func0() {  }
};

class C
{
	char ch1;
	char ch2;
	virtual void func() {  }
	virtual void func1() {  }
};

class D : public A, public C
{
	int d;
	virtual void func() {  }
	virtual void func1() {  }
};

class E : public B, public C
{
	int e;
	virtual void func0() {  }
	virtual void func1() {  }
};

int main(void)
{
	cout << "A=" << sizeof(A) << endl;
	cout << "B=" << sizeof(B) << endl;
	cout << "C=" << sizeof(C) << endl;
	cout << "D=" << sizeof(D) << endl;
	cout << "E=" << sizeof(E) << endl;
	return 0;
}
```

打印对比如下 : 

``` [] Windows10/VS2015
A=1
B=16
C=16
D=24
E=40
请按任意键继续. . .
```

``` [] Ubuntu14.04.3/gcc4.8.4
A=1
B=16
C=16
D=16
E=32
```


## 测试有虚拟继承的情况

```c++
#include <iostream>

using std::cout;
using std::endl;

class Base
{
public:
	Base()
	{
		mBase = 11;
	}
	virtual void funcA()
	{
		cout << "Base::funcA()" << endl;
	}
	virtual void funcX()
	{
		cout << "Base::funcX()" << endl;
	}
protected:
	int mBase;
};
class Base1 : virtual public Base
{
public:
	Base1() :
		Base()
	{
		mBase1 = 101;
	}
	virtual void funcA()
	{
		cout << "Base1::funcA()" << endl;
	}
	virtual void funcB()
	{
		cout << "Base1::funcB()" << endl;
	}
private:
	int mBase1;
};
class Base2 : virtual public Base
{
public:
	Base2() :
		Base()
	{
		mBase2 = 102;
	}
	virtual void funcA()
	{
		cout << "Base2::funcA()" << endl;
	}
	virtual void funcC()
	{
		cout << "Base2::funcC()" << endl;
	}
private:
	int mBase2;
};

class Base3 : virtual public Base
{
public:
	Base3() :
		Base()
	{
		mBase3 = 102;
	}
	virtual void funcA()
	{
		cout << "Base3::funcA()" << endl;
	}
	virtual void funcX()
	{
		cout << "Base3::funcC()" << endl;
	}
private:
	int mBase3;
};

class Derived : public Base1, public Base2
{
public:
	Derived() :
		Base1(),
		Base2()
	{
		mDerived = 1001;
	}
	virtual void funcD()
	{
		cout << "Derived::funcD()" << endl;
	}
	virtual void funcA()
	{
		cout << "Derived::funcA()" << endl;
	}
private:
	int mDerived;
};


int main(void)
{
	cout << "Derived's size is " << sizeof(Derived) << endl;
	cout << "Base's size is " << sizeof(Base) << endl;  
	cout << "Base1's size is " << sizeof(Base1) << endl;   
	cout << "Base2's size is " << sizeof(Base2) << endl;   
	cout << "Base3's size is " << sizeof(Base3) << endl;
	return 0;
}
```

打印对比如下 : 

``` [] Windows10/VS2015
Derived's size is 80
Base's size is 16
Base1's size is 48
Base2's size is 48
Base3's size is 40
请按任意键继续. . .
```

``` [] Ubuntu14.04.3/gcc4.8.4
Derived's size is 48
Base's size is 16
Base1's size is 32
Base2's size is 32
Base3's size is 32
```


## 测试总结

这两个都还算是比较常用的平台了, 测试之后发现vs和gcc目前比较统一的情况只有2种 :

- 无继承+无虚函数
- 无继承+虚函数

# 参考

- [C++对象模型之详述C++对象的内存布局](http://blog.csdn.net/ljianhui/article/details/46408645)

- [C++对象模型之简述C++对象的内存布局](http://blog.csdn.net/ljianhui/article/details/45903939)