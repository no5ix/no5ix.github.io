---
title: 单例模式的析构问题和线程安全问题
date: 2015-02-02 12:18:54
tags:
- 设计模式
categories:
- Misc
---



在某些应用环境下面，一个类只允许有一个实例，这就是著名的单例模式。
单例模式分为

- 懒汉模式
- 饿汉模式

# 饿汉模式


在实例化 `m_instance` 变量时，直接调用类的构造函数。顾名思义，在还未使用变量时，已经对 `m_instance` 进行赋值，就像很饥饿的感觉。
在main开始前就初始化好了， 所以是线程安全的。

## 没有考虑析构问题饿汉模式的示例代码

首先给出没有考虑析构问题的饿汉模式的实现

``` c++
#include <iostream>

using namespace std;


class singleton
{
protected:
	singleton() {};
private:
	singleton(const singleton&) {};
	singleton& operator=(const singleton&) {};
	static singleton* m_instance;
public:
	static singleton* GetInstance();
	~singleton()
	{
		printf("Singleton destruction\n");
	}
};


singleton* singleton::GetInstance()
{
	return m_instance;
}


singleton* singleton::m_instance = new singleton;

int main()
{
	singleton *ct = singleton::GetInstance();
	return 0;
}
```


## 饿汉模式的优点

- 线程安全 
- 实现简单，容易维护

## 饿汉模式的缺点

- 不适合部分场景。如：因为性能问题，希望懒加载；需要运行时才能知道，是否生成实例 
- 由于在main开始前就必须初始化，几乎不可能给类传入任何参数。

# 懒汉模式

懒汉模式下，在定义m_instance变量时先等于NULL，在调用GetInstance()方法时，在判断是否要赋值。这种模式，并非是线程安全的，因为多个线程同时调用GetInstance()方法，就可能导致有产生多个实例。

## 没有考虑线程安全与析构问题的懒汉模式的示例代码

下面是没有考虑线程安全以及析构问题的懒汉模式的代码实现

``` c++
#include <iostream>

using namespace std;

class singleton
{
protected:
	singleton() {};
private:
	singleton(const singleton&) {};
	singleton& operator=(const singleton&) {};
	static singleton* m_instance;
public:
	static singleton* GetInstance();
	~singleton()
	{
		printf("Singleton destruction\n");
	}
};

singleton* singleton::GetInstance()
{
	if (m_instance == NULL)
	{
		m_instance = new singleton;
	}
	return m_instance;
}

singleton* singleton::m_instance = NULL;

int main()
{
	singleton *ct = singleton::GetInstance();
	return 0;
}
```

## 解决懒汉模式线程安全问题的几种方法

有下面几种方法 :

- [使用局部静态变量](#使用局部静态变量)
- [加锁](#加锁)
- [pthread_once](#pthread_once)
- [DCL](#DCL)

### 使用局部静态变量

使用局部静态变量。
局部静态变量的初始化是线程安全的，这一点由编译器保证.（[http://gcc.gnu.org/ml/gcc-patches/2004-09/msg00265.html](http://gcc.gnu.org/ml/gcc-patches/2004-09/msg00265.html)，这是一个 GCC 的 patch，专门解决这个问题）。会在程序退出的时候自动销毁。
[见此处](http://stackoverflow.com/questions/270947/can-any-one-provide-me-a-sample-of-singleton-in-c/271104#271104)

这个方法适合 C++11，C++11保证静态局部变量的初始化是线程安全的。
如果是 C++98 就不能用这个方法。

```c++
class S
{
    public:
        static S& getInstance()
        {
            static S    instance;
            return instance;
        }
    private:
        S() {}
        S(S const&);              // Don't Implement.
        void operator=(S const&); // Don't implement
 };
```

### 加锁

线程安全，但每次都有开销。

```c++
// singleton.h
class Singleton {
    public:
        static Singleton *GetInstance() {
            lock();
            if (p == NULL) {
                p = new Singleton;
            }
			unlock();
            return p;
        }
    private:
    static Singleon *p;
    Singleton() {}
    Singleton(const Singleton &);
    Singleton& operator= (const Singleton &);
};

// singleton.cc
Singleton *Singleton::p = NULL;
```

### pthread_once

陈硕推荐的做法

```c++
class Singleton {
    public:
        static Singleton *GetInstance() {
            pthread_once(&ponce_, &Singleton::init);
            return value_;
        }
        private:
        Singleton() {}
        Singleton(const Singleton &);
        Singleton& operator= (const Singleton &);
        static void init() {
            value_ = new T();
        }
        static pthread_once_t ponce_;
        static Singleton *value_;
};
pthread_once_t SIngleton::ponce_ = PTHREAD_ONCE_INIT;
Singleton* Singleton::value_ = NULL;
```

### DCL

double check locking. 只能用内存屏障，其他做法都是有问题的。
参见论文： [http://www.aristeia.com/Papers/DDJ_Jul_Aug_2004_revised.pdf](http://www.aristeia.com/Papers/DDJ_Jul_Aug_2004_revised.pdf)
普通的 double check 之所以错，是因为乱序执行和多处理器下，不同 CPU 中间 cache 刷往内存并对其他 CPU 可见的顺序无法保障（cache coherency problem）。
`Singleton<T> *p = new Singleton<T>;`, 那么实际有 3 步：
1. 分配内存
2. 构造
3. 赋值给 p


2 和 3 的顺序是未定的（乱序执行！）。因此，如果直接赋值给 p 那么很可能构造还没完成。此时另一个线程调用 GetInstance，在 lock 外面 check 了一下，发现 p!=NULL，于是直接返回 p，使用了未初始化完成的实例，跪了。

那么，如果用中间变量转一下呢？用 tmp_p 转了下以后，tmp_p 赋值给 p 的时候，显然 p 指向的实例是构造完成了的。然而，这个 tmp_p 在编译器看来明显没什么用，会被优化掉。

# 关于不能自动调用析构的问题

上面的两个示例代码
( [没有考虑析构问题饿汉模式的示例代码](#没有考虑析构问题饿汉模式的示例代码) 和 [没有考虑线程安全与析构问题的懒汉模式的示例代码](#没有考虑线程安全与析构问题的懒汉模式的示例代码) ) 都有不能自动调用析构的问题.

当你运行这两个示例代码之后, 你都会发现并没有打印 "Singleton destruction", 也就是说程序结束时并没有调用 singleton 类的析构函数的, 为什么呢?

因为 `m_instance = new singleton;`, new出来的东西需要delete掉, 如果加上一句 `delete ct; ct = NULL;`, 就会调用析构函数了.
但这种手动调用很容易忘啊, 怎么才能自动调用它的析构呢?

我们想要的是 : 自动化的正常删除该实例。

有两种方法, 我给他划分为: 

- [不需要加GC(垃圾回收)内嵌类的单例模式(推荐)](#需要加GC内嵌类的单例模式)
- [需要加GC(垃圾回收)内嵌类的单例模式](#不需要加GC内嵌类的单例模式)


## 需要加GC内嵌类的单例模式

我们先看第二种,

我们知道，程序在结束的时候，系统会自动析构所有的全局变量。事实上，系统也会析构所有的类的静态成员变量，就像这些静态成员也是全局变量一样。利用这个特征，我们可以在单例类中定义一个这样的静态成员变量，而它的唯一工作就是在析构函数中删除单例类的实例。
那就是定义一个内部垃圾回收GC类，并且在 singleton 中定义一个此类的静态成员。程序结束时，系统会自动析构此静态成员，此时，在此类的析构函数中析构 singleton 实例，就可以实现 m_instance 的自动释放。

``` c++
#include <iostream>

using namespace std;

class singleton
{
protected:
	singleton() {};
private:
	singleton(const singleton&) {};
	singleton& operator=(const singleton&) {};
	static singleton* m_instance;
public:
	static singleton* GetInstance();
	~singleton()
	{
		printf("Singleton destruction\n");
	}
	
	class GC
	{
	public:
		~GC()
		{
			printf("GC destruction\n");
			if (m_instance)
			{
				delete m_instance;
				m_instance = NULL;
			}
		}
	};
	static GC gc_singleton;
};

singleton::GC singleton::gc_singleton;

singleton* singleton::GetInstance()
{
	if (m_instance == NULL)
	{
		m_instance = new singleton();
	}
	return m_instance;
}

singleton* singleton::m_instance = NULL;

int main()
{
	singleton *ct = singleton::GetInstance();
	return 0;
}
```

当然还有更好的方法.那就是下面这个不需要加GC内嵌类的单例模式.

## 不需要加GC内嵌类的单例模式

在 GetInstance 方法里放一个 m_instance 的局部静态变量, 然后返回他的地址, 他就可以在程序结束自动调用析构函数.
而且这种方法在C++11也能保证线程安全.

``` c++
#include <iostream>

using namespace std;

class singleton
{
protected:
	singleton() {};
private:
	singleton(const singleton&) {};
	singleton& operator=(const singleton&) {};
public:
	static singleton* GetInstance();
	~singleton()
	{
		printf("Singleton destruction\n");
	}
};

singleton* singleton::GetInstance()
{
	static singleton m_instance;
	return &m_instance;
}

int main()
{
	singleton *ct = singleton::GetInstance();
	return 0;
}
```


# 总结

既要考虑线程安全又要考虑析构问题的话, 有下面几种方法 :

- 饿汉模式+GC内嵌类
- 懒汉模式+GC内嵌类, 然后加锁，但每个线程缓存了返回的指针，调用一次有用缓存的指针即可。
- 懒汉模式+GC内嵌类, 然后 pthread_once

如果是C++11的话, 则可以使用局部静态变量, 因为C++11保证静态局部变量的初始化是线程安全的(C++98不保证), 而且也没有析构问题.
