---
title: C++对象模型之实例总结讲解
date: 2015-02-21 17:49:01
tags:
- 对象模型
categories:
- c++
---

# 总结

首先，平时所声明的类只是一种类型定义，它本身是没有大小可言的。 因此，如果用sizeof运算符对一个类型名操作，那得到的是具有该类型实体的大小。
计算一个类对象的大小时的规律：

- 空类、单一继承的空类、多重继承的空类所占空间大小为：1（字节，下同）；
- 一个类中，虚函数本身、成员函数（包括静态与非静态）和静态数据成员都是不占用类对象的存储空间的；
- 因此一个对象的大小≥所有非静态成员大小的总和；
- 当类中声明了虚函数（不管是1个还是多个），那么在实例化对象时，编译器会自动在对象里安插一个指针vPtr指向虚函数表VTable；
- 虚承继的情况：由于涉及到虚函数表和虚基表，会同时增加一个（多重虚继承下对应多个）vfPtr指针指向虚函数表vfTable和一个vbPtr指针指向虚基表vbTable，这两者所占的空间大小为：8（或8乘以多继承时父类的个数）；
- 在考虑以上内容所占空间的大小时，还要注意编译器下的“补齐”padding的影响，即编译器会插入多余的字节补齐；
- 类对象的大小=各非静态数据成员（包括父类的非静态数据成员但都不包括所有的成员函数）的总和+ vfptr指针(多继承下可能不止一个)+vbptr指针(多继承下可能不止一个)+编译器额外增加的字节。

<!-- more -->

# 示例一：含有普通继承

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
   
class D: public A, public C    
{       
    int d;       
    virtual void func()  {  }     
    virtual void func1()  {  }    
};       
   
class E: public B, public C    
{       
    int e;       
    virtual void func0()  {  }     
    virtual void func1()  {  }    
};    
   
int main(void)    
{    
    cout<<"A="<<sizeof(A)<<endl;    //result=1    
    cout<<"B="<<sizeof(B)<<endl;    //result=8        
    cout<<"C="<<sizeof(C)<<endl;    //result=8    
    cout<<"D="<<sizeof(D)<<endl;    //result=12    
    cout<<"E="<<sizeof(E)<<endl;    //result=20    
    return 0;    
}  
```
前面三个A、B、C类的内存占用空间大小就不需要解释了，注意一下内存对齐就可以理解了。
求sizeof(D)的时候，需要明白，首先VPTR指向的虚函数表中保存的是类D中的两个虚函数的地址，然后存放基类C中的两个数据成员ch1、ch2，注意内存对齐，然后存放数据成员d，这样4+4+4=12。
求sizeof(E)的时候，首先是类B的虚函数地址，然后类B中的数据成员，再然后是类C的虚函数地址，然后类C中的数据成员，最后是类E中的数据成员e，同样注意内存对齐，这样4+4+4+4+4=20。


# 示例二：含有虚继承

``` c++
class CommonBase    
{    
    int co;    
};    
   
class Base1: virtual public CommonBase    
{    
public:    
    virtual void print1() {  }    
    virtual void print2() {  }    
private:    
    int b1;    
};    
   
class Base2: virtual public CommonBase    
{    
public:    
    virtual void dump1() {  }    
    virtual void dump2() {  }    
private:    
    int b2;    
};    
   
class Derived: public Base1, public Base2    
{    
public:    
    void print2() {  }    
    void dump2() {  }    
private:    
    int d;    
};  
```

sizeof(Derived)=32，其在内存中分布的情况如下：

``` c++
class Derived size(32):    
     +---    
     | +--- (base class Base1)    
 | | {vfptr}    
 | | {vbptr}    
 | | b1    
     | +---    
     | +--- (base class Base2)    
 | | {vfptr}    
 | | {vbptr}    
 | | b2    
    | +---    
 | d    
    +---    
    +--- (virtual base CommonBase)    
 | co    
    +---  
```

# 示例3：子类有自己的虚函数

``` c++
class A    
{    
public:    
    virtual void aa() {  }    
    virtual void aa2() {  }    
private:    
    char ch[3];    
};    
   
class B: virtual public A    
{    
public:    
    virtual void bb() {  }    
    virtual void bb2() {  }    
};    
   
int main(void)    
{    
    cout<<"A's size is "<<sizeof(A)<<endl;    
    cout<<"B's size is "<<sizeof(B)<<endl;    
    return 0;    
}  
```

执行结果：
A’s size is 8
B’s size is 16

说明：对于虚继承，类B因为有自己的虚函数，所以它本身有一个虚指针，指向自己的虚表。另外，类B虚继承类A时，首先要通过加入一个虚指针来指向父类A，然后还要包含父类A的所有内容。因此是4+4+8=16。