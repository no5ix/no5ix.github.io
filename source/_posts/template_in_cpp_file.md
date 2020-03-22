---
title: 模板能放cpp文件里吗
date: 2020-03-21 02:27:48
tags:
- CPP
- noodle
categories:
- CPP
---


对于普通对象或者函数而言，声明和实现可以分离到 *.h 和 *.cpp（比如说这里写做 CommonClass.h 和 CommomClass.cpp）中去，其中 CommonClass.cpp 会 includeCommonClass.h，因为编译器会根据 CommonClass.cpp 生成对应 CommonClass.obj，由于编译器可以预期类的行为，因此 obj 文件中会包含实现体对应的二进制代码。如果现有 main.cpp 使用了该类生成的对象，那么链接器可以在 CommonClass.obj 找到实现体对应的二进制代码。可是对于模板来说，并不是这样，先看下面这段话。

    《C++ 编程思想》第 15 章 (第 300 页) 说明了原因：  
    模板定义很特殊。由 template<…> 处理的任何东西都意味着编译器在当时不为它分配存储空间，它一直处于等待状态直到被一个模板实例告知。在编译器和连接器的某一处，有一机制能去掉指定模板的多重定义。所以为了容易使用，几乎总是在头文件中放置全部的模板声明和定义。

上面这段话的意思就是说，只有模板实例化时，编译器才会得知 T 实参是什么。编译器在处理模板实例化时，不仅仅要看到模板的定义式，还需要模版的实现体。

比如说存在模板 CTest, 其类定义式写在 CTest.h，类的实现体写在 CTest.cpp 中。对于模板来说，编译器在处理 CTest.cpp 文件时，编译器无法预知 T 的实参是什么，所以编译器对其实现是不作处理的（即 CTest.obj 中没有为编译器为实现体生成的对应的二进制代码）。

现在有 main.cpp 真正使用了该模板（比方说，生成模板类的一个对象，并调用其函数），如果定义和实现分离，则编译器可以根据定义式生成模板类的对象（因为此处仅仅需要定义式就知道该对象在内存中需要多少空间并进一步分配了），但是调用对象的函数（即**真正使用**）需要该函数的定义，由于 main.cpp 仅仅 include 了模板的声明（所以只能找到该函数的声明），所以无法找到该函数的定义，此时编译器会寄希望于链接器在其他 obj 文件（这里就是指 CTest.obj 文件）中寻找该模板的实现体，但是就像之前说过的，CTest.obj 中也没有实现体生成的二进制代码。如果定义和实现是在同一个文件（比如说 CTest.h）中，那么编译器在编译时就可以寻找到模板的实现体。这里看下面的三个例子。


# 例 1（定义与实现分离，错误示范）
-------------------------

``` cpp
// CTest.h
template <class T>
class CTest
{
public:
    T& get_value();
    void set_value(const T& _value);
protected:
    T m_value;

};
```

``` cpp
// CTest.cpp
#include "CTest.h"
template <class T>
T& CTest<T>::get_value(){
    return m_value;
} 

template <class T>
void CTest<T>::set_value(const T& _value){
    m_value = _value;
}
```

``` cpp
// main.cpp
#include "CTest.h"
int main () {
    CTest<int> t;
    t.set_value(2);
    return 0;
}
```

运行`g++ -o main main.cpp CTest.h CTest.cpp` , 结果如下:

```
ruiy@ruiy-All-Series:~/store/test/test_tpl$ g++ -o main main.cpp CTest.h CTest.cpp 
/tmp/ccb7QKY6.o：在函数‘main’中：
main.cpp:(.text+0x2d)：对‘CTest<int>::set_value(int const&)’未定义的引用
collect2: error: ld returned 1 exit status
ruiy@ruiy-All-Series:~/store/test/test_tpl$
```

这里报错为 set_value 未定义的引用，编译器这里并不知道 CTest<int>::set_value 的定义是什么，因为 test.h 中只有该函数的声明而没有其定义，编译器此时希望链接器能够在其他 obj 文件中找到该函数的定义，但是由 CTest.cpp 中并没有使用该函数，所有 CTest.obj 中也无法找到该函数的定义，因此就会报该链接错误。


# 例 2（定义与实现不分离，正确的示范）
-------------------

``` cpp
// CTest.h
template <class T>                                                                                                                                 
class CTest
{
public:
    T& get_value();
    void set_value(const T& _value);
protected:
    T m_value;
};

template <class T>
T& CTest<T>::get_value(){
    return m_value;
}

template <class T>
void CTest<T>::set_value(const T& _value){
    m_value = _value;
}
```

``` cpp
// main.cpp
#include "CTest.h"
int main () {
    CTest<int> t;
    t.set_value(2);
    return 0;
}
```

此时执行 `g++ -o main main.cpp CTest.h`便不会再报错。


# 例 3（定义与实现分离，但是在实现所在文件中添加实例化声明）

----------------------------------

``` cpp
// CTest.h
template <class T>
class CTest
{
public:
    T& get_value();
    void set_value(const T& _value);
protected:
    T m_value;

};
```

``` cpp
// CTest.cpp
#include "CTest.h"
template <class T>
T& CTest<T>::get_value(){
    return m_value;
} 

template <class T>
void CTest<T>::set_value(const T& _value){
    m_value = _value;
}
template class CTest<int>; // 实例化声明
```

``` cpp
// main.cpp
#include "CTest.h"
int main () {
    CTest<int> t;
    t.set_value(2);
    return 0;
}
```

此时执行 `g++ -o main main.cpp CTest.h` 便不会再报错。  
与例 1 的差别仅仅是在 test.cpp 后面添加了一行实例化声明，执行`g++ -o main main.cpp CTest.h CTest.cpp` 不报错。由于 CTest.cpp 中添加了实例化声明，因此编译器在编译 CTest.cpp 时，会在 CTest.obj 加入对应实现体的二进制代码（因为此时 T 已知）。所以在链接时，链接器可以找到该模板类的具体实现。