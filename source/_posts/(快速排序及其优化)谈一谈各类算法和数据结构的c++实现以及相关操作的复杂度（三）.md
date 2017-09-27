---
title: (快速排序及其优化)谈一谈各类算法和数据结构的c++实现以及相关操作的复杂度（三）
date: 2014-08-22 12:18:54
tags:
- 排序
- c++
categories:
- c++
---






# **快速排序**

与归并排序一样， 快排也是用了分治的思想。


你可以想象一个两副牌然后随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较， 

大的放右边那一摞A，小的放左边B。
接着再从左边这一摞B再随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较， 

大的放右边那一摞，小的放左边，递归下去。
A也重复上述步骤递归。


递归结束之后， 左边的都比右边的小， 而且是有序的。


![这里写图片描述](http://img.blog.csdn.net/20170804224023832?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

<!-- more -->

```
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

## 快速排序的优化

优化方式有一部分已经在上面的代码里体现比如： 尾递归优化、随机选取基准（pivot），

主要的优化方案有 ：

- 随机选取基准（pivot）
- 尾递归化
- 三数取中
- 当待排序序列的长度分割到一定大小后，使用插入排序
- 多线程

具体方案查看[这篇博客](http://blog.csdn.net/insistgogo/article/details/7785038)



# **二分查找**

**快速排序思想的应用**

> **问题** : 查找数组中第k大的数字
> **算法思想** : 因为快排每次将数组划分为两组加一个枢纽元素，每一趟划分你只需要将k与枢纽元素的下标进行比较，如果比枢纽元素下标大就从右边的子数组中找，如果比枢纽元素下标小从左边的子数组中找，如果一样则就是枢纽元素，找到，如果需要从左边或者右边的子数组中再查找的话，只需要递归一边查找即可，无需像快排一样两边都需要递归，所以复杂度必然降低。

**二分查找的复杂度计算方法：**

时间复杂度可以视为while循环的次数。
总共有n个元素，
渐渐跟下去就是n,n/2,n/4,....n/2^k（接下来操作元素的剩余个数），其中k就是循环的次数
由于你n/2^k取整后>=1（接下来操作元素的剩余个数至少为一个）
即令n/2^k=1
可得k=log2n,（是以2为底，n的对数）
所以时间复杂度可以表示O(h)=O(log2n)

## 递归版本：
```
int binary_search(int arr[], int low, int high, int key)
{
    if ( low <= high)
    {
        int mid = (low + high) / 2;
        if ( key == arr[mid] )
            return mid;
        else if ( key < arr[mid])
            binary_search(arr, low, mid - 1, key);
        else 
            binary_search(arr, mid + 1, high, key);
    }
    else
        return -1;
}

```
## 非递归版本：
```
int non_recursion_bs(int arr[], int low, int high, int key)
{
    int mid = 0;
    while (low <= high)
    {
        mid = ( low + high ) / 2;
        if ( key == arr[mid] )
            return mid;
        else if ( key < arr[mid] )
            high = mid - 1;
        else
            low = mid + 1;
    }
    return -1;
}

```


