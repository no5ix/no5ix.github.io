---
title: 数据结构一之二叉树的创建和销毁
date: 2014-09-22 19:11:22
tags:
- 数据结构
- c++
categories:
- c++
---


接着上一篇， 上一篇主要说了各种排序算法， 但对几个常用的数据结构还未提及，所以这一篇主要讲二叉树, 二叉树已经包括很多链表的知识了。所有代码都是测试过的, 可以直接撸.

# **二叉树**
这里不举太多数字方面的东西， 我们直接看图， 直观感性的认识满二叉树和完全二叉树：

{% asset_img binary_tree_create_and_destroy_1.png %}

**有一点性质需要牢记：具有n个结点的完全二叉树的最大高度为log2n+1**

## 二叉树的二叉链式存储

二叉树的二叉链式存储方案的代码表示：

``` c++
typedef struct BinaryTreeNode
{
	void *data;
	BinaryTreeNode *LeftNode;
	BinaryTreeNode *RightNode;
}BTN, *BTNP;
```

{% asset_img binary_tree_create_and_destroy_2.png %}

<!-- more -->

## 二叉树的创建

下面代码写法是基于二叉树的先序遍历来创建二叉树的.
基于中序或者后序的写法都类似.

``` c++

void CreateBT(BTNP &btnp)
{
	char input_data = 0;
	cin >> input_data;

	// 检查是否为叶子结点, 我们把输入为'.'的字符认为是叶子结点
	if (input_data == '.')
	{
		btnp = nullptr;
		return;
	}

	char * temp_char = new char;
	if (!temp_char)
	{
		return;
	}
	*temp_char = input_data;

	btnp = new BTN;
	if (!btnp)
	{
		return;
	}
	
	// 注意这里不能写成 btnp->data = &inputData; 因为inputData是分配在栈上的
	btnp->data = temp_char;
	
	CreateBT(btnp->LeftNode);
	CreateBT(btnp->RightNode);
}

void DestroyBT(BTNP btnp)
{
	if (!btnp)
	{
		return;
	}

	DestroyBT(btnp->LeftNode);
	DestroyBT(btnp->RightNode);

	// 安全释放void指针 : 将void *转换为原来类型的指针，然后再调用delete释放指针
	delete (char *)btnp->data;
	btnp->data = nullptr;

	delete btnp;
	btnp = nullptr;
}
```

