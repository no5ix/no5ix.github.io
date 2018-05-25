---
title: 数据结构二之二叉树的遍历和交换左右孩子
date: 2014-09-23 12:11:22
tags:
- DataStructure
- CPP
categories:
- CPP
---

二叉树的二叉链式存储方案的代码表示：

``` c++
typedef struct BinaryTreeNode
{
	void *data;
	BinaryTreeNode *LeftNode;
	BinaryTreeNode *RightNode;
}BTN, *BTNP;
```



# 二叉树的遍历

{% asset_img binary_tree_traverse_and_swap_1.png %}

如上图得到的相应的三种**深度优先遍历**的序列分别为 ： 

 - **先(根)序遍历** ： ABCDEGF
 - **中(根)序遍历** ： CBEGDFA
 - **后(根)序遍历** ： CGEFDBA

而得到的**广度优先遍历**的序列为 : ABCDEFG

**. . .**<!-- more --> 

## 二叉树的广度优先遍历

{% asset_img BreadthFirstTraverse1.png BreadthFirstTraverse %}

``` c++
void BreadthFirstTraverse(BTNP btnp)
{
	if (!btnp)
	{
		return;
	}

	deque<BTNP> deque_BTNP;

	deque_BTNP.push_back(btnp);

	while (!deque_BTNP.empty())
	{
		cout << *(char *)(deque_BTNP.front()->data) << endl;

		if (deque_BTNP.front()->LeftNode)
		{
			deque_BTNP.push_back(deque_BTNP.front()->LeftNode);
		}

		if (deque_BTNP.front()->RightNode)
		{
			deque_BTNP.push_back(deque_BTNP.front()->RightNode);
		}

		deque_BTNP.pop_front();
	}
}
```

## 深度优先的递归式遍历

递归式遍历的代码实现非常简洁, 但效率却不尽人意.

``` c++

void PreOrderTraverse_Recursion(BTNP btnp)
{
	if (btnp)
	{
		cout << *(char *)btnp->data << endl;
		PreOrderTraverse_Recursion(btnp->LeftNode);
		PreOrderTraverse_Recursion(btnp->RightNode);
	}
}

void InOrderTraverse_Recursion(BTNP btnp)
{
	if (btnp)
	{
		PreOrderTraverse_Recursion(btnp->LeftNode);
		cout << *(char *)btnp->data << endl;
		PreOrderTraverse_Recursion(btnp->RightNode);
	}
}

void PostOrderTraverse_Recursion(BTNP btnp)
{
	if (btnp)
	{
		PreOrderTraverse_Recursion(btnp->LeftNode);
		PreOrderTraverse_Recursion(btnp->RightNode);
		cout << *(char *)btnp->data << endl;
	}
}


```

## 深度优先的迭代式遍历

迭代的二叉树三种遍历方式其实思想是**统一**的 : 

都是从左子树的各个结点依次入栈, 当左边已经走到头了, 就开始走右边, 在适当的条件就出栈, 只是每个遍历方式的出栈条件不一样而已, 或者是打印结点的时机不同而已.

### 迭代式先序遍历代码实现

``` c++
void PreOrderTraverse_Iteration(BTNP btnp)
{
	if (!btnp)
	{
		return;
	}

	stack<BTNP> stack_BTNP;

	while (btnp || !stack_BTNP.empty())
	{
		while (btnp)
		{
			cout << *(char *)btnp->data << endl;
			stack_BTNP.push(btnp);
			btnp = btnp->LeftNode;
		}

		if (!stack_BTNP.empty())
		{
			btnp = stack_BTNP.top()->RightNode;
			stack_BTNP.pop();
		}
	}
}
```

### 迭代式中序遍历代码实现

``` c++
void InOrderTraverse_Iteration(BTNP btnp)
{
	if (!btnp)
	{
		return;
	}

	stack<BTNP> stack_BTNP;

	while (btnp || !stack_BTNP.empty())
	{
		while (btnp)
		{
			//cout << *(char *)btnp->data << endl;
			stack_BTNP.push(btnp);
			btnp = btnp->LeftNode;
		}

		if (!stack_BTNP.empty())
		{
			cout << *(char *)(stack_BTNP.top()->data) << endl;
			btnp = stack_BTNP.top()->RightNode;
			stack_BTNP.pop();
		}
	}
}
```

### 迭代式后序遍历代码实现

后序遍历的出栈条件有点不一样, 因为后序是先左后右再中的, 比如某个结点p要出栈, 需要遍历完了p的所有右子树之后才能出栈, 而不能第一次就出栈, 所以专门构造了一个结构体`POST_BTN`来记录他是否是第一次出栈 (`POST_BTN`结构体里有个 `is_first` 的数据来记录)

**所以我们代码中的思路就是 : **
把每个将要入栈的结点的 `is_first` 标志都置为 true , 当第一次遍历到结点p的时候, 不使p出栈, 但使p的 `is_first` 标志变为 false, 然后 "`btnp` = 栈顶->右孩子" 开始遍历他的右子树. 当p的右子树都遍历完了之后(也就是p的右子树都依次出栈了之后)又会遍历到p自己, 不过这一次他的 `is_first` 标志已经为 false 了, 我们通过这个标志知道不是第一次遍历到p了, 所以这时我们使p出栈, 并且将 `btnp` 置为 NULL ( 因为此时p的右子树都已经遍历完了, 所以不用像之前一样再 "`btnp` = 栈顶->右孩子" 了 )

``` c++
typedef struct
{
	BTNP post_btnp;
	bool is_first;
}POST_BTN, *POST_BTNP;

void PostOrderTraverse_Iteration(BTNP btnp)
{
	if (!btnp)
	{
		return;
	}

	stack<POST_BTNP> stack_POST_BTNP;

	while (!stack_POST_BTNP.empty() || btnp)
	{
		while (btnp)
		{
			POST_BTNP temp_post_btnp = new POST_BTN;
			temp_post_btnp->is_first = true;
			temp_post_btnp->post_btnp = btnp;

			stack_POST_BTNP.push(temp_post_btnp);

			btnp = btnp->LeftNode;
		}

		if (!stack_POST_BTNP.empty())
		{

			if (stack_POST_BTNP.top()->is_first)
			{
				btnp = stack_POST_BTNP.top()->post_btnp->RightNode;
				stack_POST_BTNP.top()->is_first = false;
			}
			else
			{
				cout << *(char *)(stack_POST_BTNP.top()->post_btnp->data) << endl;

				delete stack_POST_BTNP.top();
				stack_POST_BTNP.top() = nullptr;

				stack_POST_BTNP.pop();

				btnp = nullptr;
			}
		}
	}
}
```

### 深度优先的迭代式遍历之总结

请仔细看完上述代码再看总结, 才更有体会.

- **出栈条件的不同:**
	- 前序遍历的出栈条件都是左边走到头了就让栈顶元素出栈
	- 中序遍历同上
	- 后序遍历的出栈条件是遍历到同一个栈顶元素第二次要出栈的时候才让他出栈
- **打印结点时机的不同:**
	- 前序遍历的打印结点时机是入栈时就打印
	- 中序遍历的打印结点时机是第一次出栈时就打印
	- 中序遍历的打印结点时机是第二次出栈时就打印

# 交换所有左右孩子

交换左右孩子用递归很容易做到

``` c++
void SwapBinaryTree(BTNP btnp)
{
	if (btnp)
	{
		BTNP tempBTNP = btnp->LeftNode;
		btnp->LeftNode = btnp->RightNode;
		btnp->RightNode = tempBTNP;

		SwapBinaryTree(btnp->LeftNode);
		SwapBinaryTree(btnp->RightNode);
	}
}
```
