---
title: stl关联容器的特性
date: 2016-04-26 01:32:47
tags:
- stl
- map
- set
- pair
categories:
- c++
---

## 概绍

> 关联容器和 顺序容器有着根本的不问 :

> 关联容器中的元素是按关键字来保在和访问的 。

> 与之相对，顺序容器中的元素是按它们在容器中的位置来顺序保存和访问的 。

关联容器支持高效的关键字查找和访问 。 两个主要的关联容器类型是 

- map 
- set

map 中 的元素是一些关键字一值 ( key-value )对 : 

 > 关键字起到索 引 的
作用，值则表示与索引相关联的数据 。 

set 中每个元素只包含一个关键字 :

> set 支持高效的关键字检查一个给定关键字是否在 set 中 。 例如，在某些文本处理过程中，
可以用一个 set 来保存想要忽略的单词。字典则是一个很好的使用 map 的例子 : 可 以将
单词作为关键字 ， 将单词释义作为值 。

<!-- more -->

## **map & set 的实现**

因为需要快速定位到键值的关系, 以红黑树的结构实现，其自平衡特性可以让插入删除等操作都可以在O(log n)时间内完成



## map的基本操作函数

| 函数 | 含义
| --- | ---- |
|begin() | 返回指向map头部的迭代器
|clear(） 删除所有元素
|count() | 返回指定元素出现的次数
|empty() | 如果map为空则返回true
|end() | 返回指向map末尾的迭代器
|equal_range() | 返回特殊条目的迭代器对
|erase() | 删除一个元素
|find() | 查找一个元素
|get_allocator() | 返回map的配置器
|**insert()** | 插入元素
|key_comp() | 返回比较元素key的函数
|lower_bound() | 返回键值>=给定元素的第一个位置
|max_size() | 返回可以容纳的最大元素个数
|rbegin() | 返回一个指向map尾部的逆向迭代器
|rend() | 返回一个指向map头部的逆向迭代器
|size() | 返回map中元素的个数
|swap() | 交换两个map
|upper_bound() | 返回键值>给定元素的第一个位置
|value_comp() | 返回比较元素value的函数

## 迭代器失效

```
#include <map>
#include <string>
#include <iostream>

using namespace std;

int main()
{
	map<int, string> map_student;
	map_student.insert(pair<int, string>(1, "stu1"));
	map_student.insert(pair<int, string>(2, "stu2"));
	map_student.insert(pair<int, string>(3, "stu3"));
	map_student.insert(pair<int, string>(4, "stu4"));
	map<int, string>::iterator iter;


	if (map_student.find(2) != map_student.end())
	{
		cout << "found" << endl;
	}

	for (iter = map_student.begin(); iter != map_student.end(); iter++)
	{
		if (iter->first == 2)
		{
			map_student.erase(iter); 
			// 移除元素会让迭代器失效, 所以上面这行应改为:iter = map_student.erase(iter);


			// map_student.insert(pair<int, string>(5, "stu5")); 
			// map增加元素并不会使迭代器失效, 因为map增加元素跟vector不一样, 

			// vector要重新找一块内存把当前所有元素复制过去并释放原有元素所以会导致vector的迭代器失效, 

			// 但是map只是直接在红黑树上增加一个结点而已, 并不会移动原有元素, 内存没动, 

			// 自然map的迭代器不会失效了
		}
		cout << iter->first << " : " << iter->second << endl;
	}
	return 0;
}
```