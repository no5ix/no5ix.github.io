---
title: STL之队列和双端队列和栈的比较
date: 2014-09-25 19:11:22
tags:
- c++
- STL
categories:
- c++
---

# 队列和双端队列的比较

**队列**(queue)是一种是相对于栈的一种数据结构，它是先进先出(First In First Out)。
它只可以在尾部添加元素。

{% asset_img deque_queue_stack_comparison_1.png 队列 %}

**双端队列**(deque double ended queue（双端队列）)是一种相对于队列的一种数据结构。它可以在尾部和头部插入、移除和获取。

{% asset_img deque_queue_stack_comparison_2.png 双端队列 %}

# 三者成员函数的比较

通过他们各自的成员函数我们能一目了然的看出区别


## 栈的成员函数

-  `stack<Type> s` : 定义一个stack的变量 
-  s.push(x) : 入栈，如例  
-  s.pop() : 出栈，如例 . 注意，出栈操作只是删除栈顶元素，并不返回该元素。 
-  s.top() : 访问栈顶，如例  
-  s.empty() : 判断栈空，如例，当栈空时，返回true。  
-  s.size() : 访问栈中的元素个数，如例  


## 队列的成员函数

-    `queue<Type> M` : 定义一个queue的变量    
-     M.empty()  : 查看是否为空范例     是的话返回1，不是返回0;   
-  M.push() : 从已有元素后面增加元素 
-       M.size() : 输出现有元素的个数    
-          M.front() : 显示第一个元素       
-        M.back() : 显示最后一个元素      
-           M.pop() : 清除第一个元素      


## 双端队列的成员函数

- `deque<Type> c` : 	定义一个deque的变量
- c.pop_back()    :    删除最后一个数据。
- c.pop_front()     :   删除头部数据。
- c.push_back(elem) :  在尾部加入一个数据。
- c.push_front(elem)  : 在头部插入一个数据。
- c.clear()       :     移除容器中所有数据。
- c.front()       :     传回地一个数据。
- c.back()       :     传回最后一个数据，不检查这个数据是否存在。
- c.size()       :      返回容器中实际数据的个数。
- c.empty()      :     判断容器是否为空。