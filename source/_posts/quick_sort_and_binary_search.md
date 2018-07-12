---
title: 排序算法三之谈一谈快排优化和二分查找
date: 2014-08-22 12:18:54
tags:
- Sort
- CPP
- noodle
categories:
- CPP
---






# 快速排序

与归并排序一样， 快排也是用了分治的思想。

**特别注意** : 快排的核心模块是Partition, 而Partition的复杂度为O(N).


**你可以想象一个两副牌然后随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较，** 

大的放右边那一摞A，小的放左边B。
接着再从左边这一摞B再随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较， 

大的放右边那一摞，小的放左边，递归下去。
A也重复上述步骤递归。


递归结束之后， 左边的都比右边的小， 而且是有序的。

## 算法导论的快排C++实现版本

{% asset_img quick_sort_1.png quick_sort %}

**. . .**<!-- more -->

这个c++实现版本主要用于说明算法思想, 而对于代码鲁棒性有太多关注, 
下面有个我自己手写的[命名清晰版本](#命名清晰版本)会比较多的关注鲁棒性以及易读性

``` c++
void swap(int *a, int *b)
{
    int temp = 0;
    temp = *a;
    *a = *b;
    *b = temp;
}

int partition(int *array, int p, int r)
{
    int i = 0, j = 0, pivot = 0;
    pivot = array[r];
    i = p-1;
    for(j=p; j<=r-1; j++)
    {
        if(array[j] <= pivot)
        {
	        i++;
            swap(&array[i], &array[j]);
        }
    }
    swap(&array[i+1], &array[r]);
    return i+1;
}

/*
通常，我们可以向一个算法中加入随机化成分，以便对于所有输入，
它均能获得较好的平均情况性能。将这种方法用于快速排序时，
不是始终采用A[r]作为主元，而是从子数组A[p..r]中随机选择一个元素，
即将A[r]与从A[p..r]中随机选出的一个元素交换。
*/
 int rand_patition(int  test_arr[], int p, int r)
 {
	srand(static_cast<unsigned>(time(nullptr)));
	int rand_index = (rand() % (r - p) ) + p + 1;
	swap(&test_arr[rand_index], &test_arr[r]);
	return partition(test_arr, p, r);
 }

void quick_sort(int *array, int p, int r)
{
    int q = 0;
    /*if(p < r)
    {
        q = rand_patition(array, p, r);
        quick_sort(array, p, q-1);
        quick_sort(array, q+1, r);
    }*/

    // 以上的注释部分可以写成尾递归的方式来优化
    while (p < r)
    {
        q = rand_patition(array, p, r);
        quick_sort(array, p, q-1);
        p = q + 1;
    }
}

```

## 命名清晰的递归版本

自己手写的, 已测试. 写得略啰嗦, 但只是希望能一目了然吧.



``` c++ QuickSort.h
#pragma once

void DoQuickSort(int arr[], int start_index, int end_index);

int partition(int arr[], int start_index, int end_index);

void swap(int &a, int &b);

template <unsigned N>
void QuickSort(int(&arr)[N], int start_index, int end_index)
{
	if (!arr
		|| start_index < 0
		|| end_index < 0
		|| end_index <= start_index
		|| end_index >= sizeof(arr) / sizeof(int))
	{
		return;
	}

	DoQuickSort(arr, start_index, end_index);
}
```



``` c++ QuickSort.cpp
#include "QuickSort.h"

void DoQuickSort(int arr[], int start_index, int end_index)
{
	int partition_index = 0;
	if (start_index < end_index)
	{
		partition_index = partition(arr, start_index, end_index);
		DoQuickSort(arr, start_index, partition_index - 1);
		DoQuickSort(arr, partition_index + 1, end_index);
	}
}

int partition(int arr[], int start_index, int end_index)
{
	int partition_index = start_index - 1;

	for (int i = start_index; i < end_index; ++i)
	{
		if (arr[i] < arr[end_index])
		{
			swap(arr[++partition_index], arr[i]);
		}
	}

	swap(arr[++partition_index], arr[end_index]);
	return partition_index;
}

void swap(int &a, int &b)
{
	int temp = a;
	a = b;
	b = temp;
}
```



```c++ main.cpp
#include <iostream>
#include "QuickSort.h"

int main()
{
	int test_arr[] = { 4, 2, 3, 5, 6, 1 };
	QuickSort(test_arr, 2, 5);
	for (auto i : test_arr)
	{
		std::cout << i << std::endl;
	}
	return 0;
}
```

## 快排的非递归版本

我们知道快递排序大部分的版本都是递归的方式来实现的：通过Pritation来实现划分，并递归实现前后的划分。

因为我们大部分看到的都是递归方式来实现快速排序。并没有关注非递归的方式。

但是仔细想想也是可以做的，因为递归的本质是栈，因此我们非递归实现的过程中，借助栈来保存中间变量就可以实现非递归了。

在这里中间变量也就是通过Pritation函数划分之后分成左右两部分的首尾指针，只需要保存这两部分的首尾指针即可。

``` c++
void QuickSortNonRecursion( int *a, int left, int right )
{
	if ( a == NULL || left < 0 || right <= 0 || left>right )
		return;
	stack<int>temp;
	int i, j;
	//（注意保存顺序）先将初始状态的左右指针压栈
	temp.push( right );//先存右指针
	temp.push( left );//再存左指针
	while ( !temp.empty() )
	{
		i = temp.top();//先弹出左指针
		temp.pop();
		j = temp.top();//再弹出右指针
		temp.pop();
		if ( i < j )
		{
			int k = partition( a, i, j );
			//if ( k > i )
			{
				temp.push( k - 1 );//保存中间变量
				temp.push( i );  //保存中间变量 
			}
			//if ( j > k )
			{
				temp.push( j );
				temp.push( k + 1 );
			}
		}

	}
}
```
从上面的代码可以看出，保存中间变量的时候需要注意保存的顺序，因为栈是后进先出的方式。


## 快速排序的优化

优化方式有一部分已经在上面的代码里体现比如： 尾递归优化、随机选取基准（pivot），

主要的优化方案有 ：

- 随机选取基准（pivot）
- 尾递归化
- 三数取中
- 当待排序序列的长度分割到一定大小后，使用插入排序
- 多线程

具体方案查看[这篇博客](http://blog.csdn.net/insistgogo/article/details/7785038)




**快速排序思想的应用**

**问题** : 查找数组中第k大的数字
**算法思想** :
有两种思路思路： 
- 直接从大到小排序，排好序后，第k大的数就是arr[k-1]。 
- 只需找到第k大的数，不必把所有的数排好序。我们借助快速排序中partition过程，一般情况下，在把所有数都排好序前，就可以找到第k大的数。我们依据的逻辑是，经过一次partition后，数组被pivot分成左右两部分：S左、S右。当S左的元素个数|S左|等于k-1时，pivot即是所找的数；当|S左|小于k-1，所找的数位于S右中；当|S左|>k-1，所找的数位于S左中。显然，后两种情况都会使搜索空间缩小。

# **二分查找**

二分查找也叫"折半查找"

**二分查找的复杂度计算方法：**

时间复杂度可以视为while循环的次数。
总共有n个元素，
渐渐跟下去就是n,n/2,n/4,....n/2^k（接下来操作元素的剩余个数），其中k就是循环的次数
由于你n/2^k取整后>=1（接下来操作元素的剩余个数至少为一个）
即令n/2^k=1
可得k=log2n,（是以2为底，n的对数）
所以时间复杂度可以表示O(h)=O(log2n)

## 递归版本：
``` c++
int BinarySearch_Recursion(int arr[], int key, int startIndex, int endIndex)
{
	if (!arr || startIndex < 0 || endIndex < 0 )
	{
		return -1;
	}
	if (startIndex <= endIndex)
	{
		int mid = (startIndex + endIndex) / 2;
	
		if (key < arr[mid])
		{
			BinarySearch(arr, key, startIndex, mid - 1);
		}
		else if (key > arr[mid])
		{
			BinarySearch(arr, key, mid + 1, endIndex);
		}
		else
		{
			return mid;
		}
	}
	else
	{
		return -1;
	}
}


```
## 迭代版本：
``` c++

int BinarySearch_Iteration(int arr[], int key, int startIndex, int endIndex)
{
	if (!arr || startIndex < 0 || endIndex < 0)
	{
		return -1;
	}

	while (startIndex <= endIndex )
	{
		int mid = (startIndex + endIndex) / 2;
		if (key == arr[mid])
		{
			return mid;
		}
		else if (key < arr[mid])
		{
			endIndex = mid -1;
		}
		else
		{
			startIndex = mid + 1;
		}
	}
	return -1;
}

```


