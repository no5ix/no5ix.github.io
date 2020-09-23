---
title: 数据结构二之二叉树的遍历和交换左右孩子
date: 2014-09-23 12:11:22
tags:
- DataStructure
- Algo
categories:
- Algo
---

二叉树的二叉链式存储方案的代码表示：

``` c++
typedef struct BinTreeNode
{
	BinTreeNode( char Data ) : data_( Data ), left_( nullptr ), right_( nullptr ) {}
	char data_;
	struct BinTreeNode *left_, *right_;
}btn, *btnp;
```



# 二叉树的遍历

**. . .**<!-- more --> 

## 二叉树的广度优先遍历

{% asset_img BreadthFirstTraverse1.png BreadthFirstTraverse %}

``` c++
void BreadthFirstTraverse( btnp bTreeNode )
{
	if ( !bTreeNode )
	{
		return;
	}
	std::queue<btnp> tempQueue;
	tempQueue.push( bTreeNode );
	while ( !tempQueue.empty() )
	{
		cout << tempQueue.front()->data_ << endl;
		if ( tempQueue.front()->left_ )
		{
			tempQueue.push( tempQueue.front()->left_ );
		}
		if ( tempQueue.front()->right_ )
		{
			tempQueue.push( tempQueue.front()->right_ );
		}
		tempQueue.pop();
	}
}
```

## 深度优先的递归式遍历

递归式遍历的代码实现非常简洁, 但生产环境一般不允许递归, 因为怕栈溢出.

``` c++

typedef struct BinaryTreeNode
{
	void *data;
	BinaryTreeNode *LeftNode;
	BinaryTreeNode *RightNode;
}BTN, *BTNP;

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

递归的本质就是出栈入栈, 所以我们用栈来模拟递归, 写出以下三种迭代式遍历

迭代的二叉树三种遍历方式其实思想是**统一**的 : 

都是从左子树的各个结点依次入栈, 当左边已经走到头了, 就开始走右边, 在适当的条件就出栈, 只是每个遍历方式的出栈条件不一样而已, 或者是打印结点的时机不同而已.

### 迭代式先序遍历代码实现

用**栈(Stack)**的思路来处理问题。

前序遍历的顺序为根-左-右，具体算法为：

* 把根节点 push 到栈中
* 循环检测栈是否为空，若不空，则取出栈顶元素，保存其值
* 看其右子节点是否存在，若存在则 push 到栈中(因为前序遍历的顺序为根-左-右, 而stack是先进后出的, 所以要先push右子节点)
* 看其左子节点，若存在，则 push 到栈中。


这个cpp版本没有本文下面的[go版](#遍历测试代码go版)写得好, 那个更容易理解
``` c++
void PreOrderTraverseNonRecursion( btnp bTreeNode )
{
	if ( !bTreeNode )
	{
		return;
	}
	std::stack<btnp> tempStack;

	while ( !tempStack.empty() || bTreeNode )
	{
		while ( bTreeNode )
		{
			cout << bTreeNode->data_ << endl;
			tempStack.push( bTreeNode );
			bTreeNode = bTreeNode->left_;
		}

		if ( !tempStack.empty() )
		{
			bTreeNode = tempStack.top()->right_;
			tempStack.pop();
		}
	}
}
```

### 迭代式中序遍历代码实现

``` c++
void InOrderTraverseNonRecursion( btnp bTreeNode )
{
	if ( !bTreeNode )
	{
		return;
	}
	std::stack<btnp> tempStack;

	while ( !tempStack.empty() || bTreeNode )
	{
		while ( bTreeNode )
		{
			tempStack.push( bTreeNode );
			bTreeNode = bTreeNode->left_;
		}

		if ( !tempStack.empty() )
		{
			cout << tempStack.top()->data_ << endl;
			bTreeNode = tempStack.top()->right_;
			tempStack.pop();
		}
	}
}
```

### 迭代式后序遍历代码实现

后序遍历的出栈条件有点不一样, 因为后序是先左后右再中的, 比如某个结点p要出栈, 需要遍历完了p的所有右子树之后才能出栈, 而不能第一次就出栈, 所以专门构造了一个结构体`PostOrderBT`来记录他是否是第一次出栈 (`PostOrderBT`结构体里有个 `isFirstTime_` 的数据来记录)

**所以我们代码中的思路就是 : **
把每个将要入栈的结点的 `isFirstTime_` 标志都置为 true , 当第一次遍历到结点p的时候, 不使p出栈, 但使p的 `isFirstTime_` 标志变为 false, 然后 "`bTreeNode` = 栈顶->右孩子" 开始遍历他的右子树. 当p的右子树都遍历完了之后(也就是p的右子树都依次出栈了之后)又会遍历到p自己, 不过这一次他的 `isFirstTime_` 标志已经为 false 了, 我们通过这个标志知道不是第一次遍历到p了, 所以这时我们使p出栈( 此时p的右子树都已经遍历完了, 所以不用像之前一样再 "`bTreeNode` = 栈顶->右孩子" 了 )

``` c++
void PostOrderTraverseNonRecursion( btnp bTreeNode )
{
	if ( !bTreeNode )
	{
		return;
	}

	typedef struct PostOrderBTreeNode
	{
		PostOrderBTreeNode( btnp OriginBT, bool IsFirstTime )
			: bt_( OriginBT ), isFirstTime_( IsFirstTime ) {}
		btnp bt_;
		bool isFirstTime_;
	}pobtn, *pobtnp;

	std::stack<pobtn> tempStack;
	while ( !tempStack.empty() || bTreeNode )
	{
		while ( bTreeNode )
		{
			pobtn np( bTreeNode, true );
			tempStack.push( np );
			bTreeNode = bTreeNode->left_;
		}

		if ( !tempStack.empty() )
		{
			if ( tempStack.top().isFirstTime_ )
			{
				tempStack.top().isFirstTime_ = false;
				bTreeNode = tempStack.top().bt_->right_;
			}
			else
			{
				cout << tempStack.top().bt_->data_ << endl;
				tempStack.pop();
			}
		}
	}
}
```

### 遍历测试代码


{% asset_img binary_tree_traverse_and_swap_1.png %}

如上图得到的相应的三种**深度优先遍历**的序列分别为 ： 

 - **先(根)序遍历** ： ABCDEGF
 - **中(根)序遍历** ： CBEGDFA
 - **后(根)序遍历** ： CGEFDBA

而得到的**广度优先遍历**的序列为 : ABCDEFG


#### 遍历测试代码CPP版

参照上图构建如下二叉树 : 

``` c++
#include <iostream>
#include <queue>
#include <stack>

using std::cout;
using std::endl;
using std::stack;
using std::queue;

int main()
{
	btn testbt = btn( 'A' );
	auto testB = btn( 'B' );
	auto testC = btn( 'C' );
	auto testD = btn( 'D' );
	auto testE = btn( 'E' );
	auto testG = btn( 'G' );
	auto testF = btn( 'F' );

	testbt.left_ = &testB;
	testbt.left_->left_ = &testC;
	testbt.left_->right_ = &testD;
	testbt.left_->right_->left_ = &testE;
	testbt.left_->right_->left_->right_ = &testG;
	testbt.left_->right_->right_ = &testF;

	cout << "BreadthFirstTraverse : \n";
	BreadthFirstTraverse( &testbt );
	cout << "PreOrderTraverseNonRecursion : \n";
	PreOrderTraverseNonRecursion( &testbt );
	cout << "InOrderTraverseNonRecursion : \n";
	InOrderTraverseNonRecursion( &testbt );
	cout << "PostOrderTraverseNonRecursion : \n";
	PostOrderTraverseNonRecursion( &testbt );

	return 0;
}
```


#### 遍历测试代码GO版

``` go
package main

import (
	"fmt"
)

func main() {
	testPreorderTraversal()
}

type TreeNode struct {
	Left  *TreeNode
	Right *TreeNode
	Val   string
}

func preorderTraversal(root *TreeNode) []string {
	if root == nil {
		//当树为空树时，直接返回一个空list
		return nil
	}
	result := make([]string, 0)
	//非递归前序遍历，需要借助栈
	stack := make([]*TreeNode, 0)

	//第一步是将根节点压入栈中
	stack = append(stack, root)
	// 当栈不为空时，出栈的元素插入list尾部。
	// 当它的孩子不为空时，将孩子压入栈，一定是先压右孩子再压左孩子
	// 因为前序遍历的顺序为根-左-右, 而stack是先进后出的, 所以要先push右子节点
	for len(stack) != 0 {
		//此处的root只是一个变量的复用
		root = stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		result = append(result, root.Val)

		if root.Right != nil {
			stack = append(stack, root.Right)
		}
		if root.Left != nil {
			stack = append(stack, root.Left)
		}
	}
	return result
}

func testBinaryTreeTraversal() {
	testbtA := new(TreeNode)
	testbtA.Val = "A"
	testbtB := new(TreeNode)
	testbtB.Val = "B"
	testbtC := new(TreeNode)
	testbtC.Val = "C"
	testbtD := new(TreeNode)
	testbtD.Val = "D"
	testbtE := new(TreeNode)
	testbtE.Val = "E"
	testbtF := new(TreeNode)
	testbtF.Val = "F"
	testbtG := new(TreeNode)
	testbtG.Val = "G"

	testbtA.Left = testbtB
	testbtA.Left.Left = testbtC

	testbtA.Left.Right = testbtD
	testbtA.Left.Right.Left = testbtE
	testbtA.Left.Right.Left.Right = testbtG
	testbtA.Left.Right.Right = testbtF

	// 标准答案:
	// 	先(根)序遍历 ： ABCDEGF
	// 中(根)序遍历 ： CBEGDFA
	// 后(根)序遍历 ： CGEFDBA

	fmt.Println(preorderTraversal(testbtA))
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

## 非递归方式Swap

``` c++
void SwapBT( btnp bTreeNode )
{
	if (!bTreeNode)
		return;
		
	std::stack<btnp> tempStack;
	tempStack.push( bTreeNode );

	btnp tempForTop = nullptr;
	btnp tempForSwap = nullptr;

	while ( !tempStack.empty() )
	{
		tempForTop = tempStack.top();
		
		// swap
		tempForSwap = tempForTop->left_;
		tempForTop->left_ = tempForTop->right_;
		tempForTop->right_ = tempForSwap;

		tempStack.pop();

		if ( tempForTop->left_ )
		{
			tempStack.push( tempForTop->left_ );
		}
		if ( tempForTop->right_ )
		{
			tempStack.push( tempForTop->right_ );
		}
	}
}
```

## 递归方式Swap

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
