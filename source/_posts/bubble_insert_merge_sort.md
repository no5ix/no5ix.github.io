---
title: 排序算法二之谈一谈冒泡插入归并
date: 2014-08-20 19:38:55
tags:
- 排序
- CPP
categories:
- CPP
---

**注：以下所有代码皆可以直接运行， 都已经测试过。**


# **冒泡排序(可略过, 不实用)**

想象这里有很多泡泡，最大的泡泡每次循环之后浮到数组的最后面

{% asset_img sort_algo_3.png bubble_sort %}

``` c++

void BubbleSort(int arr[], int startIndex, int endIndex)
{
	if (!arr || startIndex < 0 || endIndex < 0 || endIndex - startIndex <= 1)
	{
		return;
	}
	int temp = 0;
	for (int outerIndex = startIndex; outerIndex <= endIndex; ++outerIndex)
	{
		for (int innerIndex = startIndex; innerIndex <= endIndex - outerIndex - 1; ++innerIndex)
		{
			if (arr[innerIndex] > arr[innerIndex + 1] )
			{
				temp = arr[innerIndex];
				arr[innerIndex] = arr[innerIndex + 1];
				arr[innerIndex + 1] = temp;
			}
		}
	}
}

```

**. . .**<!-- more -->

# **插入排序**

想象手上有几张牌， 现在你抽了一张牌， 然后需要从手上最右边的牌开始比较，然后插入到相应位置

{% asset_img sort_algo_1.png  %}
{% asset_img sort_algo_2.png insert_sort %}


``` c++

void InsertSort(int arr[], int startIndex, int endIndex, int arr_len)
{
	if (!arr || endIndex < 0 || startIndex < 0 || endIndex - startIndex <= 1 || end_index >= arr_len)
	{
		return;
	}
	int innerIndex = 0;
	int key = 0;
	for (int outerIndex = startIndex; outerIndex <= endIndex; ++outerIndex)
	{
		key = arr[outerIndex];
		for (innerIndex = outerIndex - 1; innerIndex >= startIndex && key < arr[innerIndex]; --innerIndex)
		{
			arr[innerIndex + 1] = arr[innerIndex];
		}
		arr[innerIndex + 1] = key;
	}
}
```

# **归并排序**

归并排序用了分治的思想，有很多算法在结构上是递归的：为了解决一个给定的问题，算法要一次或多次地递归调用其自身来解决相关的子问题。这些算法通常采用分治策略（divide-and-conquier）：将原问题划分成n个规模较小而结构与原问题相似的子问题；递归地解决这些子问题，然后再合并其结果，就得到原问题的解。

## 介绍分治思想

**分治模式**在每一层递归上都有三个步骤：

- 分解（divide）：将原问题分解成一系列子问题；

- 解决（conquer）：递归地解各子问题。若子问题足够小，则直接求解；

- 合并：将子问题的结果合并成原问题的解。

## 归并的具体思路

归并排序算法的关键操作是“合并”步骤中两个**已排序**序列的合并。我们通过调用一个辅助过
程MERGE(A，p，q，r)来完成合并，其中A是一个数组，p、q和r是数组下标，满足p<=q<r。
该过程假设子数组A[p．．q]和A[q+l．．r]都已排好序。它合并这两个子数组形成单一的已排好
序的子数组并代替当前的子数组A[p.．r]。

回到我们玩扑克牌的例子，假设桌上有两堆牌面朝上的牌，每堆都已**排序**，最小的牌在顶上。
我们希望把这两堆牌合并成单一的排好序的输出堆，牌面朝下地放在桌上。
我们的基本步骤包括在牌面朝上的两堆牌的顶上两张牌中选取较小的一张，将该牌从其堆中移开（该堆的顶上将
显露一张新牌）并牌面朝下地将该牌放置到输出堆。
重复这个步骤，直到一个输入堆为空，这时，我们只是拿起剩余的输入堆并牌面朝下地将该堆放置到输出堆。

{% asset_img merge_sort_1.png merge_sort %}

## 归并的算法实现

下面是手写的一个比较直白明了的归并排序的 c++ 实现：

MergeSort.h

``` c++
#pragma once

template <unsigned N>
void MergeSort(int (&arr)[N], int start_index, int end_index)
{
	// check
	if (!arr
		|| start_index < 0
		|| end_index < 0
		|| end_index <= start_index
		|| end_index >= sizeof(arr) / sizeof(int))
	{
		return;
	}

	DoMergeSort(arr, start_index, end_index);
}

void DoMergeSort(int arr[], int start_index, int end_index);
void Merge(int arr[], int start_index, int mid_index, int end_index);
```

MergeSort.cpp

``` c++
#include "MergeSort.h"

void DoMergeSort(int arr[], int start_index, int end_index)
{
	if (start_index >= end_index)
	{
		return;
	}

	int mid_index = (start_index + end_index) / 2;
	DoMergeSort(arr, start_index, mid_index);
	DoMergeSort(arr, mid_index + 1, end_index);
	Merge(arr, start_index, mid_index, end_index);

}

void Merge(int arr[], int start_index, int mid_index, int end_index)
{
	int arr_left_len = mid_index - start_index + 1;
	int arr_right_len = end_index - mid_index;

	int *arr_left = new int[arr_left_len];
	int *arr_right = new int[arr_right_len];

	if (!arr_left || !arr_right)
	{
		return;
	}

	for (int i = start_index; i <= end_index; ++i)
	{
		if ( i > mid_index )
		{
			arr_right[i - mid_index - 1] = arr[i];
		}
		else
		{
			arr_left[i - start_index] = arr[i];
		}
	}

	int arr_left_index = 0;
	int arr_right_index = 0;

	int arr_index = start_index;
	while (arr_left_index < arr_left_len && arr_right_index < arr_right_len)
	{
		if (arr_left[arr_left_index] < arr_right[arr_right_index])
		{
			arr[arr_index++] = arr_left[arr_left_index++];
		}
		else
		{
			arr[arr_index++] = arr_right[arr_right_index++];
		}
	}

	while(arr_left_index < arr_left_len)
	{
		arr[arr_index++] = arr_left[arr_left_index++];
	}

	while(arr_right_index < arr_right_len)
	{
		arr[arr_index++] = arr_right[arr_right_index++];
	}

	delete[] arr_left;
	arr_left = nullptr;
	delete[] arr_right;
	arr_right = nullptr;
}
```

main.cpp

``` c++

#include <iostream>
#include "MergeSort.h"

int main()
{
	int test_arr[] = { 4, 2, 3, 5, 6, 1 };
	MergeSort(test_arr, 2, 5);
	for (auto i : test_arr)
	{
		std::cout << i << std::endl;
	}
	return 0;
}
```

