---
title: 排序算法四之谈一谈堆排序
date: 2014-08-24 13:48:14
tags:
- Sort
- CPP
categories:
- CPP
---

此文用的是最大堆, 最大堆的堆排序之后的数组是升序, 最小堆反之.
堆排序 HeapSort 由 以下两部分组成 :

- 堆化 MaxHeapify 
- 建堆 BuildMaxHeap.

**. . .**<!-- more -->

# 堆化MaxHeapify

具体过程如下图 : 

{% asset_img MaxHeapify.png MaxHeapify %}

**注意** : 
在调用MaxHeapify的时候, 我们假定索引为index的元素的左子树和右子树都是最大堆, 不然你如果注意看的话, 你会发现上图中index为10的那个元素其实是没有计算到的, 因为我们假定以index=5为根节点的二叉树都是最大堆了, 所以无需计算他. 
那为何要作如此假设呢?
因为要跟建堆 BuildMaxHeap 配合来完成堆排序, 而建堆 BuildMaxHeap是从下至上的.

```  c++
void MaxHeapify(int arr[], int index, int length)
{
	if (!arr || index < 0 || length <= 0)
	{
		cout << "error" << endl;
		return;
	}

	int tempData = 0;
	int leftChildIndex = 0;
	int rightChildIndex = 0;
	int largestIndex = 0;
	while (1)
	{
		leftChildIndex = index * 2 + 1;
		rightChildIndex = index * 2 + 2;

		largestIndex = index;

		if (leftChildIndex < length && arr[largestIndex] < arr[leftChildIndex])
		{
			largestIndex = leftChildIndex;
		}

		if (rightChildIndex < length && arr[largestIndex] < arr[rightChildIndex])
		{
			largestIndex = rightChildIndex;
		}
		if (largestIndex != index)
		{
			tempData = arr[index];
			arr[index] = arr[largestIndex];
			arr[largestIndex] = tempData;

			index = largestIndex;
		}
		else
		{
			break;
		}
	}
}
```

# 建堆BuildMaxHeap

伪代码如下图 : 

{% asset_img build_max_heap_1.png %}

具体过程如下图 : 

{% asset_img build_max_heap_2.png BuildMaxHeap %}


**注意** : 因为 c++ 数组的 index 是从0开始的(跟上图中有所不同, 图中的 index 是从1开始的),
所以根据算法导论中的结论我们可以知道 c++数组中 index 大于等于 length/2 的元素都是树的叶结点,
所以我们对每一个不是叶结点的元素(即为 index 小于等于 length/2 - 1 的元素 )自底向上调用一次 MaxHeapify 就可以把一个大小为 length 的数组转换为最大堆.


```  c++
void BuildMaxHeap(int arr[], int length)
{
	if (!arr || length <= 0)
	{
		cout << "error" << endl;
		return;
	}
	for (int index = length / 2 - 1; index >= 0; --index)
	{
		MaxHeapify(arr, index, length);
	}
}
```

# 堆排序HeapSort

伪代码如下图 : 

{% asset_img HeapSort3.png %}

具体过程如下图 : 

{% asset_img HeapSort1.png %}
{% asset_img HeapSort2.png HeapSort %}

```  c++
void HeapSort(int arr[], int length)
{
	if (!arr || length <= 0)
	{
		cout << "error" << endl;
		return;
	}
	BuildMaxHeap(arr, length);

	int tempData = 0;
	for (int index = length - 1; index >= 1; --index)
	{
		tempData = arr[index];
		arr[index] = arr[0];
		arr[0] = tempData;

		MaxHeapify(arr, 0, --length);
	}
}
```

# 堆排序的复杂度

**时间复杂度** : 

- **MaxHeapify** : **O(logN)**.
- **BuildMaxHeap** : **O(N)**. 
看起来像是O(NlogN), 其实是O(N), 因为不同结点运行 MaxHeapify 的 时间和该结点的树高相关, 而大部分结点的高度都很小, <<算法导论>>中有相关证明
- **HeapSort** : **O(NlogN)**. 
初始化堆 BuildMaxHeap 的时间复杂度为O(N); 之后因为每次交换结点然后从堆中去掉最后一个结点后都要重建堆 BuildMaxHeap 
*(上述 HeapSort 函数代码中的倒数第三行 `MaxHeapify(arr, 0, --length)` 其实就是个重建堆的过程)* , 
重建堆 BuildMaxHeap 的时间复杂度为O(N), 而 length - 1 次调用了 MaxHeapify, MaxHeapify 的时间复杂度为O(lgN). 所以为 O(N + NlogN), 即为O(Nlogn)

**空间复杂度** : 

- **O(1)**, 因为没有用辅助内存.
