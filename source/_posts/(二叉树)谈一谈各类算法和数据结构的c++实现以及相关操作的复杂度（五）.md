---
title: (二叉树)谈一谈各类算法和数据结构的c++实现以及相关操作的复杂度（五）
date: 2014-09-23 12:11:22
tags:
- 二叉树
- c++
categories:
- c++
---


![这里写图片描述](http://img.blog.csdn.net/20170805023144001?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)



### **遍历**
如上图得到的相应的遍历的序列分别为：

 - 先序遍历 ： ABCDEGF
 - 中序遍历 ： CBEGDFA
 - 后序遍历 ： CGEFDBA

<!-- more --> 

#### **递归遍历**
```

void pre_order_traverse(const BTN_Ptr *btp)
{
    if ( *btp != NULL)
    {
        cout << (*btp)->data << endl;
        pre_order_traverse( &(*btp)->LeftChild );
        pre_order_traverse( &(*btp)->RightChild );
    }
}

void in_order_traverse(const BTN_Ptr *btp)
{
    if ( *btp != NULL)
    {
        in_order_traverse( &(*btp)->LeftChild );
        cout << (*btp)->data << endl;
        in_order_traverse( &(*btp)->RightChild );
    }
}

void post_order_traverse(const BTN_Ptr *btp)
{
    if ( *btp != NULL)
    {
        post_order_traverse( &(*btp)->LeftChild );
        post_order_traverse( &(*btp)->RightChild );
        cout << (*btp)->data << endl;
    }
}


```

#### **非递归遍历**
> 非递归的二叉树三种遍历方式其实思想是**统一**的 : 都是从左到右的将各个结点依次入栈, 当左边已经走到头了, 就开始走右边, 在适当的条件就出栈, 只是每个遍历方式的出栈条件不一样而已.
>
>**先序和中序遍历都很好理解, 着重讲一下后序遍历 :**
> 后序遍历的出栈条件有点不一样, 因为后序是先左后右再中的, 比如某个结点p要出栈, 需要遍历完了p的所有右子树之后才能出栈, 而不能第一次就出栈, 所以专门构造了一个结构体F_bt来记录他是否是第一次出栈 (F_bt结构体里有个is_first的数据来记录)

```

void pre_order_traverse_non_recursion(const BTN_Ptr *btp)
{
    stack<BTN_Ptr> stack_bt;
    BTN_Ptr temp_btp = *btp;
    while ( !stack_bt.empty() || temp_btp != NULL )
    {
        while ( temp_btp != NULL )
        {
            cout << temp_btp->data << endl;
            stack_bt.push(temp_btp);
            temp_btp = temp_btp->LeftChild;
        }
        
        if ( !stack_bt.empty() )
        {
            temp_btp = stack_bt.top()->RightChild;
            stack_bt.pop();
        }
    }
}

void in_order_traverse_non_recursion(const BTN_Ptr *btp)
{
    stack<BTN_Ptr> stack_bt;
    BTN_Ptr temp_btp = *btp;
    
    while ( !stack_bt.empty() || temp_btp != NULL )
    {
        while ( temp_btp != NULL )
        {
            stack_bt.push(temp_btp);
            temp_btp = temp_btp->LeftChild;
        }

        if ( !stack_bt.empty() )
        {
            cout << stack_bt.top()->data << endl;
            temp_btp = stack_bt.top()->RightChild;
            stack_bt.pop();
        }
    }
}


typedef struct
{
    BTN_Ptr btnp;
    int is_first;
}F_bt, *F_btp;

void post_order_traverse_non_recursion( const BTN_Ptr *btp)
{
    stack<F_btp> stack_F_btp;
    BTN_Ptr temp_btp = *btp;

    while ( !stack_F_btp.empty() || temp_btp != NULL )
    {
        while ( temp_btp != NULL )
        {
            F_btp temp_F_btp = new F_bt;
            temp_F_btp->btnp = temp_btp;
            temp_F_btp->is_first = 1;
            stack_F_btp.push(temp_F_btp);
            temp_btp = temp_btp->LeftChild;
        }

        if ( !stack_F_btp.empty() )
        {
            if ( stack_F_btp.top()->is_first == 1 )
            {
                stack_F_btp.top()->is_first = 0;
                temp_btp = stack_F_btp.top()->btnp->RightChild;
            }
            else
            {
                cout << stack_F_btp.top()->btnp->data << endl;
                delete stack_F_btp.top();
                stack_F_btp.top() = NULL;
                stack_F_btp.pop();
                temp_btp = NULL;
            }
        }

    }
}

```


### 交换所有左右孩子

```
/*交换二叉树所有左右孩子结点
*@param pstRoot 指向二叉树根结点指针
*/
void SwapBinaryTree(LPBINARYNODE pstRoot)
{
    if (pstRoot != NULL)
    {
        LPBINARYNODE temp = NULL;
        temp = pstRoot->pLChild;
        pstRoot->pLChild = pstRoot->pRChild;
        pstRoot->pRChild = temp;

        SwapBinaryTree(pstRoot->pLChild);
        SwapBinaryTree(pstRoot->pRChild);
    }

}
```