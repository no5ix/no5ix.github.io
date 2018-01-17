---
title: 单例模式与其析构问题
date: 2015-02-02 12:18:54
tags:
- 设计模式
categories:
- 杂
---



在某些应用环境下面，一个类只允许有一个实例，这就是著名的单例模式。
单例模式分为

- 懒汉模式
- 饿汉模式

# 饿汉模式

首先给出饿汉模式的实现

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

在实例化 `m_instance` 变量时，直接调用类的构造函数。顾名思义，在还未使用变量时，已经对 `m_instance` 进行赋值，就像很饥饿的感觉。

# 懒汉模式

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

# 关于不能自动调用析构的问题

以上代码当你运行之后你都会发现并没有打印 "Singleton destruction", 也就是说程序结束时并没有调用 singleton 类的析构函数的, 为什么呢?
因为 `m_instance = new singleton<T>();`, new出来的东西需要delete掉, 如果加上一句 `delete ct; ct = NULL;`, 就会调用了.
但这种手动调用很容易忘啊, 怎么才能自动调用它的析构呢?

我们想要的是 : 自动化的正常删除该实例。

有两种方法, 我给他划分为: 

- 不需要加GC(垃圾回收)内嵌类的单例模式(推荐)
- 需要加GC(垃圾回收)内嵌类的单例模式


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


