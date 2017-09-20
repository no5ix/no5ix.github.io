---
title: (二叉树)谈一谈各类算法和数据结构的c++实现以及相关操作的复杂度（六）
date: 2014-09-24 19:17:32
tags:
- 二叉树
- c++
categories:
- c++
---


## **二叉搜索树(又称二叉查找树或二叉排序树)**
>有了上面二叉树的基础, 我们继续学习二叉搜索树.
>我们这里也不给他那种晦涩难懂的定义, 感性的认识二叉搜索树.
直接看图, 很容易看得出来, 二叉搜索树每个结点的左孩子都小于右孩子.
![这里写图片描述](http://img.blog.csdn.net/20170806185002946?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
**因为具有n个结点的完全二叉树的最大高度为log2n+1**
**而二叉搜索树的查询/增加的时间复杂度都是O(h), h为树的高度,所以复杂度可以看作O(logn), 所以很明显上图中的a树比b树要高效.**


<!-- more -->


### **查询**
```
BTN_Ptr search(BTN_Ptr btp, int key)
{
    while (btp != NULL )
    {
        if ( btp->data != key)
        {
            if ( btp->data < key )
                btp = btp->RightChild;
            else
                btp = btp->LeftChild;
        }
        else
        {
            printf("found\n");
            return btp;
        }
    }
   printf("error : not found!\n");
   return NULL;
}

```

### **插入**

```
BTN_Ptr insert(BTN_Ptr &btp, int key)
{
    if (btp == NULL)
    {
        btp = new BTN;
        btp->data = key;
        btp->LeftChild = NULL;
        btp->RightChild = NULL;
        return btp;
    }
    else
    {
        BTN_Ptr saved_btp = btp;
        BTN_Ptr temp_btp = NULL;
        while ( btp != NULL)
        {
            temp_btp = btp;
            if ( key < btp->data )
                btp = btp->LeftChild;
            else
                btp = btp->RightChild;
        }
        btp = new BTN;
        btp->data = key;
        btp->LeftChild = NULL;
        btp->RightChild = NULL;
        if ( key < temp_btp->data )
            temp_btp->LeftChild = btp;
        else
            temp_btp->RightChild = btp;
        return saved_btp;
    }
}


```

### **测试程序**
附上一个测试程序吧
```
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <stack>

using std::stack;
using std::cout;
using std::cin;
using std::endl;

int main(int argc, char **argv)
{
    BTN_Ptr my_btp = NULL;
    if (create_BT(&my_btp) == -1)
	    return -1;
    cout << "==============pre_order:==============" << endl;
    pre_order_traverse(&my_btp);
    cout << "==============in_order:==============" << endl;
    in_order_traverse(&my_btp);
    cout << "==============post_order:==============" << endl;
    post_order_traverse(&my_btp);
    cout << "==============search : 24==============" << endl;
    search(my_btp, 24);
    cout << "==============search : 14==============" << endl;
    search(my_btp, 14);
    cout << "==============insert : 25==============" << endl;
    my_btp = insert(my_btp, 25);
    cout << "==============pre_order2:==============" << endl;
    pre_order_traverse(&my_btp);
    return 0;
}
```