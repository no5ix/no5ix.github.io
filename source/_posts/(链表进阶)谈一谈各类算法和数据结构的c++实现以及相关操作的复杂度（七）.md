---
title: (链表进阶)谈一谈各类算法和数据结构的c++实现以及相关操作的复杂度（七）
date: 2014-12-22 23:19:21
tags:
- 链表
- c++
categories:
- c++
---

只谈一下单链表, 链表实在是太重要, 是前面两篇说算法博客的基础, 了解了其应用和衍生, 再去了解其本身就有动力了

这是一篇偏向单链表进阶的博客, 并不会讲单链表的建立/增加/删除等等, 而且这篇博客大多数只说思想不写代码(因为其实蛮简单的..)

# **存储结构**
```
typedef struct Node
{
	DataType data;
	struct Node *next;
}Node, *Node_Ptr;
```

![这里写图片描述](http://img.blog.csdn.net/20170823224405993?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

<!-- more -->


# **1.找一个单链表的中间结点**


算法思想 : 

> (**快慢指针的使用**)设置两个指针，一个每次移动两个位置，一个每次移动一个位置，当第一个指针到达尾节点时，第二个指针就达到了中间节点的位置

# **2.判断链表中是否有环**


算法思想 : 

> (**快慢指针的使用**)链表中有环，其实也就是自相交. 用两个指针pslow和pfast从头开始遍历链表，pslow每次前进一个节点，pfast每次前进两个结点，若存在环，则pslow和pfast肯定会在环中相遇，若不存在，则pslow和pfast能正常到达最后一个节点

# **3.判断两个链表是否相交, 假设两个链表均不带环**


算法思想 : 

> 如果两个链表相交于某一节点，那么在这个相交节点之后的所有节点都是两个链表所共有的。也就是说，如果两个链表相交，那么最后一个节点肯定是共有的。先遍历第一个链表，记住最后一个节点，然后遍历第二个链表，到最后一个节点时和第一个链表的最后一个节点做比较，如果相同，则相交，否则不相交。

# **4.链表反转**

比如一个链表:
头指针->A->B->C->D->E
反转成为:
头指针->E->D->C->B->A

## 算法思想 : 

> 1. 取一个指针一直指向A
> 2. 取一个指针指向A的后面那个元素element, 每次把element放到链表的第一个位置, 遍历完毕之后就反转完毕了,过程如下:

第一轮 : 头指针->A->B->C->D->E, 把A后面的B设置为element
第二轮 : 头指针->B->A->C->D->E, 把当前的element(即为B)放到链表的第一个位置, 并把A后面的C设置为element
第三轮 : 头指针->C->B->A->D->E, 把当前的element(即为C)放到链表的第一个位置, 并把A后面的D设置为element
第四轮 : 头指针->D->C->B->A->E, 把当前的element(即为D)放到链表的第一个位置, 并把A后面的E设置为element
第五轮 : 头指针->E->D->C->B->A, 把当前的element(即为E)放到链表的第一个位置, 遍历完毕

## 算法cpp实现：

> 手写的代码， 已经跑过了，可直接用
> 下面代码中反转函数为 ReverseList ， 且有详细注释以及总结

```
#include <stdio.h>

struct TList
{
	struct TList *pNext;
	void *pData;
};
typedef struct TList *LPTLIST;

LPTLIST print_tlist(LPTLIST *ppstHead)
{
	LPTLIST origin_tlist = *ppstHead;
	if (*ppstHead)
	{

		while ((*ppstHead)->pNext)
		{
			*ppstHead = (*ppstHead)->pNext;
			printf("%d ->", *(int*)( (*ppstHead)->pData ) );
		}
		printf("\n");
	}
	return origin_tlist;
}

LPTLIST append_elem(LPTLIST *ppstHead, void *data)
{

	LPTLIST origin_tlist = *ppstHead;
	if (*ppstHead)
	{
		while ((*ppstHead)->pNext)
		{
			*ppstHead = (*ppstHead)->pNext;
		}
		LPTLIST new_node = new TList;
		new_node->pNext = NULL;
		new_node->pData = data;

		(*ppstHead)->pNext = new_node;
	}
	return origin_tlist;

}

void ReverseList(LPTLIST *ppstHead)
{
	
	if (*ppstHead)
	{	
		LPTLIST origin_first_elem_ptr = (*ppstHead)->pNext; // 这个指针一直指向着原来链表头指针后面的那个元素（即原第一个元素， 这个元素一直都不会变， 一直都是原来的那个）
		LPTLIST current_behind_origin_first_elem_ptr = NULL; // 这个指针是指向着origin_first_elem_ptr后面的那个元素（即原第一个元素后面的目前的那个元素, 指向的这个元素会一直变）
		
		// 总结， 链表反转需要两个指针， 见上面两个指针

		while ( origin_first_elem_ptr->pNext )
		{
			current_behind_origin_first_elem_ptr = origin_first_elem_ptr->pNext;
			origin_first_elem_ptr->pNext = current_behind_origin_first_elem_ptr->pNext; // 原第一个元素的pnext指到它后面的后面那个元素

			current_behind_origin_first_elem_ptr->pNext = (*ppstHead)->pNext; // 原第一个元素后面的那个元素的pnext指到目前链表头指针后面的那个元素（即目前第一个元素）
			(*ppstHead)->pNext = current_behind_origin_first_elem_ptr; 
		}
	}
}



int main()
{
	LPTLIST temp = NULL;
	print_tlist(&temp);

	LPTLIST test_tlist = new TList;
	test_tlist->pNext = NULL;
	test_tlist->pData = NULL;

	LPTLIST origin_tlist = test_tlist;

	int elem1 = 1;
	int elem2 = 2;
	int elem3 = 7;

	append_elem(&test_tlist, &elem1);
	append_elem(&test_tlist, &elem2);
	append_elem(&test_tlist, &elem3);

	origin_tlist = print_tlist(&origin_tlist);

	ReverseList(&origin_tlist);

	print_tlist(&origin_tlist);

	return 0;
}
```