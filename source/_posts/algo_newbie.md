---
title: 白话算法
date: 2018-09-21 08:08:06
tags:
- noodle
- algo
- leetcode
categories:
- Algo
---


**. . .**<!-- more -->


``` python
#coding=utf-8

import copy


class treenode(object):

    def __init__(self, v):
        self.val = v
        self.left = None
        self.right = None


def preorder_traversal(root):
    """
    url: https://coding.imooc.com/class/chapter/82.html#Anchor
    玩转算法面试 从真题到思维全面提升算法思维
    章节6-3
    利用循环实现树的统一形式的前序遍历, 因为更好更形象地模拟了系统栈的递归前序遍历(每个结点先入栈, 然后才访问打印),
    所以可以很轻易的调节一下代码顺序就能模拟中序/后序遍历.
    """
    if not root:
        return
    stack = []
    stack.append((root,'should_push'))
    while stack:
        node, should_print = stack.pop()
        if should_print == 'should_print':
            print (node.val)
        else:
            if node.right:
                stack.append((node.right, 'should_push'))
            if node.left:
                stack.append((node.left, 'should_push'))
            stack.append((node, 'should_print'))

    """
    url: https://github.com/MisterBooo/LeetCodeAnimation/blob/master/notes/LeetCode%E7%AC%AC144%E5%8F%B7%E9%97%AE%E9%A2%98%EF%BC%9A%E4%BA%8C%E5%8F%89%E6%A0%91%E7%9A%84%E5%89%8D%E5%BA%8F%E9%81%8D%E5%8E%86.md
    用**栈(Stack)**的思路来处理问题。
    前序遍历的顺序为根-左-右，具体算法为：

    1. 把根节点 push 到栈中
    2. 循环检测栈是否为空，若不空，则取出栈顶元素，保存其值
    3. 看其右子节点是否存在，若存在则 push 到栈中
    4. 看其左子节点，若存在，则 push 到栈中。
    """
    # _stack = []
    # if root is None:
    #     return
    # _stack.append(root)

    # while _stack:
    #     root = _stack.pop()
    #     print(root.val)
    #     if root.right is not None:
    #         _stack.append(root.right)
    #     if root.left is not None:
    #         _stack.append(root.left)


def inorder_traversal(root):
    """
    url: https://coding.imooc.com/class/chapter/82.html#Anchor
    玩转算法面试 从真题到思维全面提升算法思维
    章节6-3
    利用循环实现树的统一形式的中序遍历, 因为更好更形象地模拟了系统栈的递归中序遍历(每个结点先入栈, 然后才访问打印), 
    所以可以很轻易的调节一下代码顺序就能模拟前序/后序遍历.
    """
    if not root:
        return
    stack = []
    stack.append((root,'should_push'))
    while stack:
        node, should_print = stack.pop()
        if should_print == 'should_print':
            print (node.val)
        else:
            if node.right:
                stack.append((node.right, 'should_push'))
            stack.append((node, 'should_print'))
            if node.left:
                stack.append((node.left, 'should_push'))

    """
    url: https://github.com/MisterBooo/LeetCodeAnimation/blob/master/notes/LeetCode%E7%AC%AC94%E5%8F%B7%E9%97%AE%E9%A2%98%EF%BC%9A%E4%BA%8C%E5%8F%89%E6%A0%91%E7%9A%84%E4%B8%AD%E5%BA%8F%E9%81%8D%E5%8E%86.md
    用**栈(Stack)**的思路来处理问题。

    中序遍历的顺序为左-根-右，具体算法为：

    1. 从根节点开始，先将根节点压入栈
    2. 然后再将其所有左子结点压入栈，取出栈顶节点，保存节点值
    3. 再将当前指针移到其右子节点上，若存在右子节点，则在下次循环时又可将其所有左子结点压入栈中
    """
    # _stack = []
    # if root is None:
    #     return
    # # _stack.append(root)
    # while (root is not None or _stack):
    #     if root is not None:
    #         _stack.append(root)
    #         root = root.left
    #     else:
    #         root = _stack.pop()
    #         print root.val
    #         root = root.right


def postorder_traversal(root):
    """
    url: https://coding.imooc.com/class/chapter/82.html#Anchor
    玩转算法面试 从真题到思维全面提升算法思维
    章节6-3
    利用循环实现树的统一形式的前序遍历, 因为更好更形象地模拟了系统栈的递归后序遍历(每个结点先入栈, 然后才访问打印), 
    所以可以很轻易的调节一下代码顺序就能模拟中序/前序遍历.
    """
    if not root:
        return
    stack = []
    stack.append((root,'should_push'))
    while stack:
        node, should_print = stack.pop()
        if should_print == 'should_print':
            print (node.val)
        else:
            stack.append((node, 'should_print'))
            if node.right:
                stack.append((node.right, 'should_push'))
            if node.left:
                stack.append((node.left, 'should_push'))

    # _stack = []
    # if root is None:
    #     return
    # _result = []
    # _stack.append(root)
    # while _stack:
    #     root = _stack.pop()
    #     _result.insert(0, root.val)  # 逆序添加结点值
    #     if root.left:
    #         _stack.append(root.left) # 和传统先序遍历不一样，先将左结点入栈
    #     if root.right:
    #         _stack.append(root.right)
    # print _result


def levelorder_traversal(root):
    _queue = []
    if root is None:
        return
    _queue.append(root)
    while _queue:
        root = _queue.pop(0)
        print root.val
        if root.left:
            _queue.append(root.left)
        if root.right:
            _queue.append(root.right)


def merge(a, b):
    c = []
    h = j = 0
    while j < len(a) and h < len(b):
        if a[j] < b[h]:
            c.append(a[j])
            j += 1
        else:
            c.append(b[h])
            h += 1

    c.extend(a[j:])
    c.extend(b[h:])

    # if j == len(a):
    #     for i in b[h:]:
    #         c.append(i)
    # else:
    #     for i in a[j:]:
    #         c.append(i)
    # print c
    return c


def merge_sort(lists):
    """
    归并排序
    url: https://www.cnblogs.com/shierlou-123/p/11310040.html
    """
    if len(lists) <= 1:
        return lists
    middle = len(lists)/2
    left = merge_sort(lists[:middle])
    right = merge_sort(lists[middle:])
    return merge(left, right)


def partition(arr, start_index, end_index):
    pivot_index = end_index
    last_small_elem_index = start_index -1

    for travase_index in range(start_index, end_index):
        if arr[travase_index] <= arr[pivot_index]:
            last_small_elem_index += 1
            arr[travase_index], arr[last_small_elem_index] = arr[last_small_elem_index], arr[travase_index]
    partition_index = last_small_elem_index + 1
    arr[partition_index], arr[end_index] = arr[end_index], arr[partition_index]
    return partition_index

def quick_sort_normal(arr, start_index, end_index):
    """快排标准版, 原址的"""
    if not arr:
        return
    if start_index < end_index:
        partition_index = partition(arr, start_index, end_index)
        quick_sort_normal(arr, start_index, partition_index-1)
        quick_sort_normal(arr, partition_index+1, end_index)


def quick_sort_simple(arr):
    """快速排序好理解的版本, 但需要额外的数组空间"""
    if len(arr) < 2:
        return arr
    # 选取基准，随便选哪个都可以，选中间的便于理解
    mid = arr[len(arr) // 2]
    # 定义基准值左右两个数列
    left, right = [], []
    # 从原始数组中移除基准值
    arr.remove(mid)
    for item in arr:
        # 大于基准值放右边
        if item >= mid:
            right.append(item)
        else:
            # 小于基准值放左边
            left.append(item)
    # 使用迭代进行比较
    
    # print "mid: " + str(mid)
    # print "left: " + str(left)
    # print "right: " + str(right)
    # print "---"

    # ret_left = quick_sort(left)
    # ret_right = quick_sort(right)
    # ret_middile = [mid]
    # # ret = quick_sort(left) + [mid] + quick_sort(right)
    # ret = ret_left + ret_middile + ret_right

    # # print "ret_left: " + str(ret_left)
    # # print "ret_right: " + str(ret_right)
    # # print "ret: " + str(ret)
    # # print "---"

    # return ret
    return quick_sort_simple(left) + [mid] + quick_sort_simple(right)


def insertion_sort(arr):
    """插入排序"""
    # 第一层for表示循环插入的遍数
    for i in range(1, len(arr)):
        # 设置当前需要插入的元素
        current = arr[i]
        # 与当前元素比较的比较元素
        pre_index = i - 1
        while pre_index >= 0 and arr[pre_index] > current:
            # 当比较元素大于当前元素则把比较元素后移
            arr[pre_index + 1] = arr[pre_index]
            # 往前选择下一个比较元素
            pre_index -= 1
        # 当比较元素小于当前元素，则将当前元素插入在 其后面
        arr[pre_index + 1] = current
    return arr


def heapify(arr, cur_start_index, cur_end_index):
    # 左右子节点的下标
    left = cur_start_index * 2 + 1
    right = cur_start_index * 2 + 2
    largest_index = cur_start_index
    if left <= cur_end_index and arr[left] > arr[cur_start_index]:
        largest_index = left
    if right <= cur_end_index and arr[right] > arr[largest_index]:
        largest_index = right
    # 通过上面跟左右节点比较后，得出三个元素之间较大的下标，
    # 如果较大下表不是父节点的下标，说明交换后需要重新调整大顶堆
    if largest_index != cur_start_index:
        arr[cur_start_index], arr[largest_index] = arr[largest_index], arr[cur_start_index]
        heapify(arr, largest_index, cur_end_index)

def heap_sort(arr):
    """
    堆排序
    url: https://www.bilibili.com/video/av18980178/
    """
    # build heap
    arr_len = len(arr)
    # 构造大顶堆，从非叶子节点开始倒序遍历，因此是arr_len//2 -1 就是最后一个非叶子节点
    for _index in range(arr_len//2-1, -1, -1):  # 第一个-1代表遍历到头, 后一个步长为-1也就是倒序
        heapify(arr, _index, arr_len-1)

    # iter & heapify
    # 上面的循环完成了大顶堆的构造，那么就开始把根节点跟末尾节点交换，然后重新调整大顶堆  
    for _i in range(arr_len-1, -1, -1):
        arr[0], arr[_i] = arr[_i], arr[0]
        heapify(arr, 0, _i-1)


class ListNode(object):

    def __init__(self, v):
        self.val = v
        self.next = None


# url: https://blog.csdn.net/songyunli1111/article/details/79416684
def reverse_list(pHead):
    if not pHead or not pHead.next:
        return pHead
    last = None   #指向上一个节点
    while pHead:
        #先用tmp保存pHead的下一个节点的信息，
        #保证单链表不会因为失去pHead节点的next而就此断裂
        tmp = pHead.next   
        #保存完next，就可以让pHead的next指向last了
        pHead.next = last
        #让last，pHead依次向后移动一个节点，继续下一次的指针反转
        last = pHead
        pHead = tmp
    return last


def minPathSum(grid):
	"""
    url: https://blog.csdn.net/u010420283/article/details/84729567
    思路分析: 当处于第一列时候(j=0)，dp[i][j]=grid[i-1][j]+grid[i][j]； 第一行时候（i=0），dp[i][j]=grid[i][j-1]+grid[i][j]。而在其它位置时候，dp[i][j]就等于它的上方或者左方格子数值最小的值加上grid当前格子的值，即：dp[i][j]=min(dp[i-1][j],dp[i][j-1])+grid[i][j]。
    
	:type grid: List[List[int]]
	:rtype: int
	"""
	n = len(grid)
	m = len(grid[0])
	for i in range(1,n):
		grid[i][0] = grid[i-1][0] + grid[i][0]   #首先需要寻找左边界各点的路径总和

	for j in range(1,m):
		grid[0][j] = grid[0][j-1] + grid[0][j]  #寻找上边界各点的路径总和

	for i in range(1,n):
		for j in range(1,m):
			grid[i][j] = min(grid[i-1][j] , grid[i][j-1]) + grid[i][j]  #以边界处为依据一步步推出内部个点的路径总和

	return grid[n-1][m-1]


if __name__ == "__main__":
    _t_a = treenode('a')
    _t_b = treenode('b')
    _t_c = treenode('c')
    _t_d = treenode('d')
    _t_e = treenode('e')
    _t_f = treenode('f')
    _t_g = treenode('g')

    _t_a.left = _t_b
    _t_b.left = _t_c
    _t_b.right = _t_d
    _t_d.left = _t_e
    _t_d.right = _t_f
    _t_e.right = _t_g

    print "===preorder_traversal======="
    preorder_traversal(_t_a)
    print "====inorder_traversal======"
    inorder_traversal(_t_a)
    print "======postorder_traversal===="
    postorder_traversal(_t_a)
    print "====levelorder_traversal======"
    levelorder_traversal(_t_a)

    num_list_for_sort = [8, 4, 5, 7, 1, 3, 6, 2]
    # print a[2:]
    print "=======merge_sort---==="
    print (merge_sort(num_list_for_sort))
    print "=======quick_sort_normal---==="
    temp_arr = copy.deepcopy(num_list_for_sort)
    quick_sort_normal(temp_arr, 0, len(num_list_for_sort)-1)
    print temp_arr
    print "=======quick_sort_simple---==="
    print (quick_sort_simple(copy.deepcopy(num_list_for_sort)))
    print "=======insertion_sort---==="
    print (insertion_sort(num_list_for_sort))

            
    head=ListNode(1);    #测试代码
    p1=ListNode(2);      #建立链表1->2->3->4->None;
    p2=ListNode(3);
    p3=ListNode(4);
    head.next=p1;
    p1.next=p2;
    p2.next=p3;
    p=reverse_list(head);   #输出链表 4->3->2->1->None
    print "=======reverse_list---==="
    while p:
        print p.val;
        p = p.next

    print "_____minPathSum-----"    
    grid_list = [
        [1,3,1],
        [1,5,1],
        [4,2,1]
    ]
    print(minPathSum(grid_list))

    print "------------heap_sort-------"
    num_list_for_heap_sort = [8, 4, 5, 7, 1, 3, 6, 2]
    heap_sort(num_list_for_heap_sort)
    print num_list_for_heap_sort
```