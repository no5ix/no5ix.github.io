---
title: vector和string的内存分配与使用注意点
date: 2016-05-17 00:52:53
tags:
- c++
- stl
categories:
- c++
---


# 增长方式

为了支持快速随机访问 ， vector 将元素连续存储一一每个元素紧挨着前一个元素存
储 。

## 问题

假定容器中元素是连续存储 的， 且容器的大小是可变的 ， 考虑 向 vector 或 string中添加元素会发生什么 : 
如果没有空间容纳新元素，容器不可能简单地将它添加到内存中其他位置一一因为元素必须连续存储。

容器必须分配新的内存空间来保存己有元素和新元素 ， 将已有元素从 旧位置移动到新空 间中， 然后添加新元素，释放旧存储空间 。

如果我们每添加一个新元素， vector 就执行一次这样的内存分配和释放操作 ，性能会慢到不可接受 。

... <!-- more -->

## 解决方案

为了避免这种代价，标准库实现者采用了可以减少容器空间重新分配次数的策略。当不得不在取新的内 存空间 时， vector 和 string 的实现通常会分配比新的空间需求更大的内存空间 。

容器预留这些空间作为备用 ， 可用来保存更多的新元素 。这样，就不需要每次添加新元素都重新分配容器的内存空间了 。这种分配策略比每次添加新元素时都重新分配容器内存空间的策略要高效得多 。

其实际性能也表现得足够好一一虽然 vector 在每次重新分配内存空间时都要移动所有元素，但使用 此策略后，其扩张操作通常比 list 和 deque 还要快 。

## 增长方式的具体实现

STL提供了很多泛型容器，如vector，list和map。程序员在使用这些容器时只需关心何时往容器内塞对象，而不用关心如何管理内存，需要用多少内存，这些STL容器极大地方便了C++程序的编写。

例如可以通过以下语句创建一个vector，它实际上是一个按需增长的动态数组，其每个元素的类型为int整型：

`stl::vector<int> testVector;`

拥有这样一个动态数组后，用户只需要调用push_back方法往里面添加对象，而不需要考虑需要多少内存：

``` c++
testVector.push_back(10); 
testVector.push_back(2);
```

vector会根据需要自动增长内存，在testVector退出其作用域时也会自动销毁占有的内存，这些对于用户来说是透明的，stl容器巧妙的避开了繁琐且易出错的内存管理工作。

隐藏在这些容器后的内存管理工作是通过STL提供的一个默认的allocator实现的。当然，用户也可以定制自己的allocator，只要实现allocator模板所定义的接口方法即可，然后通过将自定义的allocator作为模板参数传递给STL容器，创建一个使用自定义allocator的STL容器对象，如：

`stl::vector<int, UserDefinedAllocator> testVector;`

大多数情况下，STL默认的allocator就已经足够了。这个allocator是一个由两级分配器构成的内存管理器，

- 当申请的内存大小大于128byte时，就启动第一级分配器通过malloc直接向系统的堆空间分配，
- 如果申请的内存大小小于128byte时，就启动第二级分配器，从一个预先分配好的内存池中取一块内存交付给用户，这个内存池由16个不同大小（8的倍数，8~128byte）的空闲列表组成，allocator会根据申请内存的大小（将这个大小round up成8的倍数）从对应的空闲块列表取表头块给用户。

**这种做法有两个优点：**

- 小对象的快速分配。小对象是从内存池分配的，这个内存池是系统调用一次malloc分配一块足够大的区域给程序备用，当内存池耗尽时再向系统申请一块新的区域，整个过程类似于批发和零售，起先是由allocator向总经商批发一定量的货物，然后零售给用户，与每次都总经商要一个货物再零售给用户的过程相比，显然是快捷了。当然，这里的一个问题时，内存池会带来一些内存的浪费，比如当只需分配一个小对象时，为了这个小对象可能要申请一大块的内存池，但这个浪费还是值得的，况且这种情况在实际应用中也并不多见。

- 避免了内存碎片的生成。程序中的小对象的分配极易造成内存碎片，给操作系统的内存管理带来了很大压力，系统中碎片的增多不但会影响内存分配的速度，而且会极大地降低内存的利用率。以内存池组织小对象的内存，从系统的角度看，只是一大块内存池，看不到小对象内存的分配和释放。


## vector的内存释放

由于vector的内存占用空间只增不减，比如你首先分配了10,000个字节，

然后erase掉后面9,999个，留下一个有效元素，但是内存占用仍为10,000个。

所有内存空间是在vector析构时候才能被系统回收。empty()用来检测容器是否为空的，

clear()可以清空所有元素。但是即使clear()，

vector所占用的内存空间依然如故，无法保证内存的回收。

如果需要空间动态缩小，可以考虑使用 deque 。如果vector，可以用swap()来帮助你释放内存。具体方法如下：

`vector<int>().swap(tempVector); //或者 tempVector.swap(vector<int>())`

### vector的内存释放代码实例1

``` c++

#include <iostream>
#include <vector>

int main()
{
    std::vector<int> foo;
    foo.push_back(1);
    foo.push_back(2);
    foo.push_back(3);
    foo.push_back(4);
    foo.push_back(5);

    std::vector<int> bar;  
    bar.push_back(1);
    bar.push_back(2);


    std::cout << "foo size:" << foo.size() << std::endl;
    std::cout << "foo capacity:" << foo.capacity() << std::endl;

    std::cout << "bar size:" << bar.size() << std::endl;
    std::cout << "bar capacity:" << bar.capacity() << std::endl;
    foo.swap(bar);

    std::cout << "after swap foo size:" << foo.size() << std::endl;
    std::cout << "after swap foo capacity:" << foo.capacity() << std::endl;

    std::cout << "after swap bar size:" << bar.size() << std::endl;
    std::cout << "after swap bar capacity:" << bar.capacity() << std::endl;

    return 0;
}
```

**输出：**
```
foo size:5
foo capacity:6
bar size:2
bar capacity:2
after swap foo size:2
after swap foo capacity:2
after swap bar size:5
after swap bar capacity:6
```

看到了吗，swap之后，不仅仅是size变化了，capacity也是变化了。那么于是就把swap替代clear了：

### vector的内存释放代码实例2

``` c++
#include<iostream>
#include<vector>
using namespace std;
int main()
{
    vector<int> v;
    v.push_back(1);
    v.push_back(2);
    v.push_back(3);
    v.push_back(4);
    v.push_back(5);

    cout << "size:" << v.size() << endl;
    cout << "capacity:" << v.capacity() << endl;

    vector<int>().swap(v);
    cout << "after swap size:" << v.size() << endl;
    cout << "after swap capacity:" << v.capacity() << endl;
    return 0;
}
```

**输出：**
```
size:5
capacity:6
after swap size:0
after swap capacity:0
```

# 迭代器失效的问题

看了上方的实现方式, 相信很容易能理解迭代器失效问题了啊

向容器中添加元素和从容器中删除元素 的操作**可能**(下面将会讨论为什么是可能)会使指向容器元素的指针、引用或法代器失效。 

一个失效的指针、引用或法代器将不再表示任何元素 。 使用失效的指针、引用或迭代器是一种严重的程序设计错误，很可能引起与使用未初始化指针一样的问题


**所以, 向容器中添加元素和从容器中删除元素的操作都需要用以下方法重置一下迭代器 : **

- `i = q.insert(i,22);`

- `i = q.erase(i);`


(以下三种情况都是在ubuntu g++环境测试的, 不同平台不同编译器会有不同表现, 比如同样的代码有可能会在vs下崩溃)

## 删除元素

``` c++
//erase操作
#include<vector>
#include<iostream>
using namespace std;
int main(){
    vector<int>q{1,2,3,4,5,6,7,8,9,10};
    int cnt = 0;
    int flag = 0;
    for(vector<int>::iterator i = q.begin(); i != q.end(); ++i){
        ++cnt;
        if(cnt > 15){
            cout<<"gg"<<endl;
            break;
        }
        if(*i == 3)              //删除第三个
           i = q.erase(i);
        cout << *i << endl;
        cout << &(*i) << endl;
    }
    return 0;
}
```

output:
```
  1
  0xc72158
  2
  0xc7215c
  4
  0xc72160
  5
  0xc72164
  6
  0xc72168
  7
  0xc7216c
  8
  0xc72170
  9
  0xc72174
  10
  0xc72178 
```

输出结果分析:

当删除第3个元素以后我们发现第四个元素是紧邻第二个元素的（刚好差一个int的内存）,

也就是说vector执行erase（i）后会将迭代器i之后的元素逐个向前移动一个type单位,所以其实这种c++实现迭代器没失效,

但是其他的c++实现, 有可能所有元素全部移到另外一块内存, 比如这段代码放到vs是会崩溃的

## 添加元素时若预分配的内存足够迭代器就不会失效

``` c++
//insert操作
//内存充足情况
#include<vector>
#include<iostream>
using namespace std;
int main(){

    vector<int>q{1,2,3,4,5,6,7,8,9,10};                             
    q.push_back(11);
    cout<<"初始vector分配的容量:"<<q.capacity()<<endl;                  
    int cnt = 0;
    int flag = 0;  //flag保证只插入一次


    for(vector<int>::iterator i = q.begin(); i != q.end(); ++i){
        ++cnt;
        if(cnt > 15){
            cout<< "gg" <<endl;
            break;
        }
        if(*i == 3&&!flag){
            flag = 1;
            i = q.insert(i,22);
            cout<<"插入元素后vector分配的容量:" <<q.capacity() <<endl;
        }
        cout << *i << endl;
        cout << &(*i) << endl;
    }
    return 0;
}
```

输出为:
```
初始vector分配的容量:20
  1
  0x1f2188
  2
  0x1f218c
  插入元素后vector分配的容量:20
  22
  0x1f2190
  3
  0x1f2194
  4
  0x1f2198
  5
  0x1f219c
  6
  0x1f21a0
  7
  0x1f21a4
  8
  0x1f21a8
  9
  0x1f21ac
  10
  0x1f21b0
  11
  0x1f21b4
```

输出结果分析:

很显然当内存充足的情况下, 执行insert操作只会将迭代器i及i之后的的所有元素向后移动一个type单位.所以这种情况下即使没有使用返回值也不会发生迭代器失效



## 添加元素时若预分配的内存不足迭代器就会失效

``` c++
//insert操作
//内存不够情况
#include<vector>
#include<iostream>
using namespace std;
int main(){

    vector<int>q{1,2,3,4,5,6,7,8,9,10};                                 //  c++11列表初始化
    vector<int>::iterator j = q.begin();
    j++;
    cout<<"第二个元素:"<<*j<<endl;
    cout<<"第二个元素地址:"<<&(*j)<<endl;
    cout<<"初始vector分配的容量:"<<q.capacity()<<endl;                  //  有多少元素即分配多少内存
    int cnt = 0;
    int flag = 0;  //flag保证只插入一次


    for(vector<int>::iterator i = q.begin(); i != q.end(); ++i){
        ++cnt;
        if(cnt > 15){
            cout<< "gg" <<endl;
            break;
        }
        if(*i == 3&&!flag){
            flag = 1;
            i = q.insert(i,22);
            cout<<"\n插入后原第二个元素:"<<*j<<endl;
            cout<<"插入后原第二个元素地址:"<<&(*j)<<endl;
            cout<<"插入元素后vector分配的容量:" <<q.capacity() <<endl;
        }
        cout << *i << endl;
        cout << &(*i) << endl;
    }
    return 0;
}
```

output:
```
第二个元素:2
  第二个元素地址:0xe5215c
  初始vector分配的容量:10
  1
  0xe52158
  2
  0xe5215c

  插入后第二个元素:15007936
  插入后第二个元素地址:0xe5215c
  插入元素后vector分配的容量:20
  22
  0xe52190
  3
  0xe52194
  4
  0xe52198
  5
  0xe5219c
  6
  0xe521a0
  7
  0xe521a4
  8
  0xe521a8
  9
  0xe521ac
  10
  0xe521b0
```

输出结果分析:

vector内存分配策略为 二倍扩容 , 每次当内存不够的情况下vector会将容量扩展为当前的两倍.

那这些新分配的会在原内存的后面吗？ 根据输出结果显然不是的。

上例代码在插入元素22 后, 新的3号元素内存位置距离上一个元素不是4byte(1个int单位), 也就是说,

当vector扩容时, 会在另一个内存分配一段新的内存(原内存的二倍). 并把原内存中的元素全部拷贝到新内存中…

指向二号元素的迭代器在插入操作之后指向的值由2变成了15007936,也验证了上述结论.


# capacity & size

> 理解 capacity 和 size 的区别非常重要。

容器的 size 是指它已经保存的元素的数目 ; 

而 capacity 则是在不分配新的内存空间的前提下它最多可以保存多少元素。


# 函数

|函数|表述
| -----| -----|
| **c.begin()** | 传回指向第一个元素的迭代器。
| **c.capacity()** | 返不分配新的内存空间的前提下它最多可以保存多少元素。
| **c.clear()** | 移除容器中所有数据。
| **c.empty()** | 判断容器是否为空。
| **c.end()** | 指向迭代器中的最后一个数据地址。
| **c.insert(iter,elem)** | 在pos位置插入一个elem拷贝，传回新数据位置。
| **c.pop_back()** | 删除最后一个数据。
| **c.push_back(elem)** | 在尾部加入一个数据。
| **c.size()** | 返回容器中实际数据的个数。
| **c1.swap(c2)** | 将c1和c2这两个容器中的元素互换。
| **swap(c1,c2)** | 同上操作。
| **c.empty()** | 判断容器是否为空。
|**c.erase(iter)** | 删除pos位置的数据，传回下一个数据的位置。
|c.assign(beg,end) | 将[beg; end)区间中的数据赋值给c。
|c.assign(n,elem) | 将n个elem的拷贝赋值给c。
|c.at(idx) | 传回索引idx所指的数据，如果idx越界，抛出out_of_range。
|c.back() | 传回指向最后一个元素的迭代器
| c.erase(beg,end) | 删除[beg,end)区间的数据，传回下一个数据的位置。 
| c.front() | 传回第一个数据。
|get_allocator| 使用构造函数返回一个拷贝。
|c.insert(pos,n,elem) | 在pos位置插入n个elem数据。无返回值。
|c.insert(pos,beg,end) | 在pos位置插入在[beg,end)区间的数据。无返回值。
|c.max_size() | 返回容器中最大数据的数量。
|c.rbegin() | 传回一个逆向队列的第一个数据。
|c.rend() | 传回一个逆向队列的最后一个数据的下一个位置。
|c.resize(num) | 重新指定队列的长度。
|c.reserve() | 保留适当的容量。

# 构造 & 销毁

|写法|表述
| -----| -----|
| vector<Elem> c | 创建一个空的vector。
| vector <Elem> c1(c2) | 复制一个vector。
| vector <Elem> c(n) | 创建一个vector，含有n个数据，数据均已缺省构造产生。
| vector <Elem> c(n, elem) | 创建一个含有n个elem拷贝的vector。
| vector <Elem> c(beg,end) | 创建一个以[beg;end)区间的vector。
| c.~ vector <Elem>() | 销毁所有数据，释放内存。


