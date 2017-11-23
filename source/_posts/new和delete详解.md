---
title: new和delete详解
date: 2015-01-22 00:05:48
tags:
- new
- delete
categories:
- c++
---



c++中对new申请的内存的释放方式有delete和delete[]两种方式，到底这两者有什么区别呢？

# 疑问

我们通常从教科书上看到这样的说明：
delete 释放new分配的单个对象指针指向的内存
delete[] 释放new分配的对象数组指针指向的内存
那么，按照教科书的理解，我们看下下面的代码：

``` c++
int *a = new int[10];
delete a;        //方式1
delete [] a;     //方式2
```

肯定会有很多人说方式1肯定存在内存泄漏，是这样吗？

## 针对基本数据类型

针对简单类型 使用new分配后的不管是数组还是非数组形式内存空间用两种方式均可 如：
``` c++
int *a = new int[10];
delete a;
delete [] a;
```

此种情况中的释放效果相同，原因在于：分配简单类型内存时，内存大小已经确定，系统可以记忆并且进行管理，在析构时，系统并不会调用析构函数，
它直接通过指针可以获取实际分配的内存空间，哪怕是一个数组内存空间(在分配过程中 系统会记录分配内存的大小等信息，此信息保存在结构体_CrtMemBlockHeader中，
具体情况可参看VC安装目录下CRT\SRC\DBGDEL.cpp)

## 针对复杂数据类型

针对类Class，两种方式体现出具体差异 
当你通过下列方式分配一个类对象数组：

``` c++
class A
{
private:
    char *m_cBuffer;
    int m_nLen;
public:
    A(){ m_cBuffer = new char[m_nLen]; }
    ~A() { delete [] m_cBuffer; }
};
A *a = new A[10];
delete a;         //仅释放了a指针指向的全部内存空间 但是只调用了a[0]对象的析构函数 剩下的从a[1]到a[9]这9个用户自行分配的m_cBuffer对应内存空间将不能释放 从而造成内存泄漏
delete [] a;      //调用使用类对象的析构函数释放用户自己分配内存空间并且   释放了a指针指向的全部内存空间
```

##  总结

所以总结下就是，关于 new[] 和 delete[]，其中又分为两种情况：
- **基本数据类型**
对于像int/char/long/int*/struct等等简单数据类型，由于对象没有destructor，所以用delete 和delete [] 是一样的！
- **复杂数据类型类型**
	- delete ptr   代表用来释放内存，且只用来释放ptr指向的内存。
	- delete[] rg   用来释放rg指向的内存！！还逐一调用数组中每个对象的destructor！！


# 例子

我们来看下面的例子，通过例子的学习了解C++中的delete和delete[]的使用方法

``` c++

#include <iostream>

using namespace std;

/////////class Babe
class Babe
{
public:
	Babe()
	{
		cout << "Create a Babe to talk with me" << endl;
	}
	~Babe()
	{
		cout << "Babe don't go away,listen to me" << endl;
	}
};

//////////main function
int main()
{
	Babe *pbabe2 = new Babe[3];
	delete [] pbabe2;

	cout << endl;

	Babe * pbabe3 = new Babe;
	delete [] pbabe3;

/*
	cout << endl;

	Babe* pbabe1 = new Babe[3];
	delete pbabe1; // 这个在vs2015环境下, 会崩溃; vs2005则不会崩溃
*/
	return 0;
}
```

vs2005环境下, 打印结果是:

Create a Babe to talk with me
Create a Babe to talk with me
Create a Babe to talk with me
Babe don't go away,listen to me
Babe don't go away,listen to me
Babe don't go away,listen to me
Create a Babe to talk with me
Create a Babe to talk with me
Create a Babe to talk with me
Babe don't go away,listen to me

然后就卡在这里了


# 习题

``` c++
Class A{
//...
};
A *pa = new A();
A *pas = new A[NUM]();
```

1.delete []pas; //详细流程
2.delete []pa; //会发生什么
3.delete pas; //哪些指针会变成野指针