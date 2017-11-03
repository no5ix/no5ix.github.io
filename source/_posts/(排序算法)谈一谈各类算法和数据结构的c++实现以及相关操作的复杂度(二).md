---
title: (排序算法)谈一谈各类算法和数据结构的c++实现以及相关操作的复杂度（二）
date: 2014-08-20 19:38:55
tags:
- 排序
- c++
categories:
- c++
---

> **注：以下所有代码皆可以直接运行， 都已经测试过。**


## **冒泡排序**

> 想象就是很多泡泡，最大的泡泡每次浮到那个数组最后面

``` c++
void bubble_sort(int a[], int n)
{
    int i, j, temp;
    for (j = 0; j < n - 1; j++)
        for (i = 0; i < n - 1 - j; i++)
        {
            if(a[i] > a[i + 1])
            {
                temp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = temp;
            }
        }
}
```

<!-- more -->

## **插入排序**

> 想象手上有几张牌， 现在你抽了一张牌， 然后需要从手上最右边的牌开始比较，然后插入到相应位置

``` c++
void insertion_sort(int test_array[], size_t length)
{
	int i = 0, key = 0;
	for (size_t index = 1; index < length; ++index)
	{
		i = index - 1, key = test_array[index];
		while (i >= 0 && key < test_array[i])
		{
			test_array[i + 1] = test_array[i];
			i = i - 1;
		}

		test_array[i + 1] = key;
	}

	for (size_t ii = 0; ii < length; ++ii, ++test_array)
	{

		cout << *test_array << endl;
	}
}
```
## **归并排序**

> 归并排序用了分治的思想，有很多算法在结构上是递归的：为了解决一个给定的问题，算法要一次或多次地递归调用其自身来解决相关的子问题。这些算法通常采用分治策略（divide-and-conquier）：将原问题划分成n个规模较小而结构与原问题相似的子问题；递归地解决这些子问题，然后再合并其结果，就得到原问题的解。

**分治模式**在每一层递归上都有三个步骤：

- 分解（divide）：将原问题分解成一系列子问题；

- 解决（conquer）：递归地解各子问题。若子问题足够小，则直接求解；

- 合并：将子问题的结果合并成原问题的解。


![这里写图片描述](http://img.blog.csdn.net/20170804224210669?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


> 下面是一个比较直白明了的归并c++实现（其实可以写成不用动态分配内存的，但是这里为了直白起见）：

``` c++
/*
 * p: 左数组第一个元素下标
 * q: 左数组最后一个元素下标
 * r: 右数组最后一个元素下标
 */
void merge(int *array, int p, int q, int r)
{
    int n1, n2, i, j, k;
    int *left=NULL, *right=NULL;
 
    n1 = q-p+1;
    n2 = r-q;
 
    left = (int *)malloc(sizeof(int)*(n1));
    right = (int *)malloc(sizeof(int)*(n2));
    for(i=0; i<n1; i++)
    {
                  left[i] = array[p+i];
    }
    for(j=0; j<n2; j++)
    {
                  right[j] = array[q+1+j];
    }
 
    i = j = 0;
    k = p;
    while(i<n1 && j<n2)
    {
                  if(left[i] <= right[j])
                  {
                        array[k++] = left[i++];
                  }
                  else
                  {
                        array[k++] = right[j++];
                  }
    }
 
    for(; i<n1; i++)
    {
                  array[k++] = left[i];
    }
    for(; j<n2; j++)
    {
                  array[k++] = right[j];
    }
 
    free(left);
    free(right);
    left = NULL;
    right = NULL;
}
 
void merge_sort(int *array, int p, int r)
{
    int q;
 
    if(p < r)
    {
                  q = (int)((p+r)/2);
                  merge_sort(array, p, q);
                  merge_sort(array, q+1, r);
                  merge(array, p, q, r);
    }
}

```





