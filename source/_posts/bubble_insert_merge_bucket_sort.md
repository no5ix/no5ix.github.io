---
title: 排序算法二之谈一谈冒泡插入归并桶排序
date: 2014-08-20 19:38:55
tags:
- Sort
- Algo
categories:
- Algo
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

![](/img/bubble_insert_merge_bucket_sort/sort_algo_1.png)
![](/img/bubble_insert_merge_bucket_sort/sort_algo_2.png "insert sort")

``` c++
void InsertSort( int arr[], int startIndex, int endIndex, int arrLen )
{
	if ( !arr || arrLen <= 0 || endIndex - startIndex > arrLen
		|| startIndex < 0 || startIndex >= endIndex )
	{
		return;
	}

	for ( int outerIndex = startIndex; outerIndex <= endIndex; ++outerIndex )
	{
		for ( int innerIndex = outerIndex;
			innerIndex - 1 >= startIndex && arr[innerIndex] < arr[innerIndex - 1];
			--innerIndex )
		{
			auto temp = arr[innerIndex];
			arr[innerIndex] = arr[innerIndex - 1];
			arr[innerIndex - 1] = temp;
		}
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

![](/img/bubble_insert_merge_bucket_sort/merge_sort_1..png "merge sort")


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


# 桶排序

桶排序 (Bucket sort) 是一种基于计数的排序算法，工作的原理是将数据分到有限数量的桶子里，然后每个桶再分别排序（有可能再使用别的排序算法或是以递回方式继续使用桶排序进行排序）。当要被排序的数据内的数值是均匀分配的时候，桶排序时间复杂度为Θ(n)。桶排序不同于快速排序，并不是比较排序，不受到时间复杂度 O(nlogn) 下限的影响。

桶排序按下面 4 步进行：

1. 设置固定数量的空桶。
2. 把数据放到对应的桶中。
3. 对每个不为空的桶中数据进行排序。
4. 拼接从不为空的桶中数据，得到结果。

桶排序，主要适用于小范围整数数据，且独立均匀分布，可以计算的数据量很大，而且符合线性期望时间。


## 桶排序算法图解演示

举例来说，现在有一组数据 [7, 36, 65, 56, 33, 60, 110, 42, 42, 94, 59, 22, 83, 84, 63, 77, 67, 101]，怎么对其按从小到大顺序排序呢？

{% asset_img bucket_sort.png bucket_sort %}

操作步骤说明：

1. 设置桶的数量为 5 个空桶，找到最大值 110，最小值 7，每个桶的范围 20.8=(110-7+1)/5 。
2. 遍历原始数据，以链表结构，放到对应的桶中。数字 7，桶索引值为 0，计算公式为 floor((7 – 7) / 20.8)， 数字 36，桶索引值为 1，计算公式 floor((36 – 7) / 20.8)。
3. 当向同一个索引的桶，第二次插入数据时，判断桶中已存在的数字与新插入数字的大小，按照左到右，从小到大的顺序插入。如：索引为 2 的桶，在插入 63 时，桶中已存在 4 个数字 56，59，60，65，则数字 63，插入到 65 的左边。
4. 合并非空的桶，按从左到右的顺序合并 0，1，2，3，4 桶。
5. 得到桶排序的结构

## 桶排序代码实现例子

**假设数据分布在[0，100)之间，每个桶内部用链表表示，在数据入桶的同时插入排序。然后把各个桶中的数据合并。**

``` cpp
#include<iterator>
#include<iostream>
#include<vector>
using namespace std;
const int BUCKET_NUM = 10;

struct ListNode{
	explicit ListNode(int i=0):mData(i),mNext(NULL){}
	ListNode* mNext;
	int mData;
};

ListNode* insert(ListNode* head,int val){
	ListNode dummyNode;
	ListNode *newNode = new ListNode(val);
	ListNode *pre,*curr;
	dummyNode.mNext = head;
	pre = &dummyNode;
	curr = head;
	while(NULL!=curr && curr->mData<=val){
		pre = curr;
		curr = curr->mNext;
	}
	newNode->mNext = curr;
	pre->mNext = newNode;
	return dummyNode.mNext;
}


ListNode* Merge(ListNode *head1,ListNode *head2){
	ListNode dummyNode;
	ListNode *dummy = &dummyNode;
	while(NULL!=head1 && NULL!=head2){
		if(head1->mData <= head2->mData){
			dummy->mNext = head1;
			head1 = head1->mNext;
		}else{
			dummy->mNext = head2;
			head2 = head2->mNext;
		}
		dummy = dummy->mNext;
	}
	if(NULL!=head1) dummy->mNext = head1;
	if(NULL!=head2) dummy->mNext = head2;
	
	return dummyNode.mNext;
}

void BucketSort(int n,int arr[]){
	vector<ListNode*> buckets(BUCKET_NUM,(ListNode*)(0));
	for(int i=0;i<n;++i){
		int index = arr[i]/BUCKET_NUM;
		ListNode *head = buckets.at(index);
		buckets.at(index) = insert(head,arr[i]);
	}
	ListNode *head = buckets.at(0);
	for(int i=1;i<BUCKET_NUM;++i){
		head = Merge(head,buckets.at(i));
	}
	for(int i=0;i<n;++i){
		arr[i] = head->mData;
		head = head->mNext;
	}
}
```