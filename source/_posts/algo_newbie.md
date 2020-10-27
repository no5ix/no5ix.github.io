---
title: 白话算法与数据结构大总结
date: 2018-10-23 08:08:06
tags:
- noodle
- Algo
- LeetCode
categories:
- Algo
---


# 本文完整参考代码

https://github.com/no5ix/nox/blob/master/algo/test_algo.py


# 数据结构


## 哈希表

发生碰撞的时候有两种解决方案:  
* 拉链表法
* 开放寻址法
    * 线性探查法（Linear Probing）：di = 1,2,3,…,m-1
      简单地说，就是以当前冲突位置为起点，步长为1循环查找，直到找到一个空的位置，如果循环完了都占不到位置，就说明容器已经满了。举个栗子，就像你在饭点去街上吃饭，挨家去看是否有位置一样。
    * 平方探测法（Quadratic Probing）：di = ±12, ±22，±32，…，±k2（k≤m/2）
      相对于线性探查法，这就相当于的步长为di = i2来循环查找，直到找到空的位置。以上面那个例子来看，现在你不是挨家去看有没有位置了，而是拿手机算去第i2家店，然后去问这家店有没有位置。
    * 伪随机探测法：di = 伪随机数序列, 这个就是取随机数来作为步长
* 再哈希法
    `Hi = RHi(key)`, 其中i=1,2,…,k  
    RHi()函数是不同于H()的哈希函数，用于同义词发生地址冲突时，计算出另一个哈希函数地址，直到不发生冲突位置。这种方法不容易产生堆集，但是会增加计算时间。  
    所以再哈希法的缺点是：增加了计算时间。  


### 开放寻址法

开放寻址法的核心思想是，如果出现了散列冲突，我们就重新探测一一个空闲位置，将其插入。比如，我们可以使用线性探测法。当我们往散列表中插入数据时，如果某个数据经过散列函数散列之后，存储位置已经被占用了，我们就从当前位置开始，依次往后查找，看是否有空闲位置，如果遍历到尾部都没有找到空闲的位置，那么我们就再从表头开始找，直到找到为止。

![](/img/noodle_plan/algo/hash_table1.jpg)

散列表中查找元素的时候，我们通过散列函数求出要查找元素的键值对应的散列值，然后比较数组中下标为散列值的元素和要查找的元素。如果相等，则说明就是我们要找的元素；否则就顺序往后依次查找。如果遍历到数组中的空闲位置还没有找到，就说明要查找的元素并没有在散列表中。

对于删除操作稍微有些特别，不能单纯地把要删除的元素设置为空。因为在查找的时候，一旦我们通过线性探测方法，找到一个空闲位置，我们就可以认定散列表中不存在这个数据。但是，如果这个空闲位置是我们后来删除的，就会导致原来的查找算法失效。这里我们可以将删除的元素，特殊标记为 deleted。当线性探测查找的时候，遇到标记为 deleted 的空间，并不是停下来，而是继续往下探测。

线性探测法存在很大问题。当散列表中插入的数据越来越多时，其散列冲突的可能性就越大，极端情况下甚至要探测整个散列表,因此最坏时间复杂度为O(N)。在开放寻址法中，除了线性探测法，我们还可以二次探测和双重散列等方式。


### 负载因子与rehash

在维基百科来描述加载因子：

> **对于开放定址法，加载因子是特别重要因素**，应严格限制在0.7-0.8以下。超过0.8，查表时的CPU缓存不命中（cache missing）按照指数曲线上升。因此，一些采用开放定址法的hash库，如Java的系统库限制了加载因子为0.75，超过此值将resize散列表。

我们可以使用装载因子来衡量散列表的“健康状况”。

`散列表的负载因子 = 填入表中的元素个数/散列表的长度`

**为什么java的HashMap(使用开放寻址法解决碰撞)加载因子一定是0.75？而不是0.8，0.6？**

HashMap的底层其实也是哈希表（散列表），为了减少冲突发生的概率，当HashMap的数组长度到达一个临界值的时候，就会触发扩容，把所有元素rehash之后再放在扩容后的容器中，这是一个相当耗时的操作。

而这个临界值就是由加载因子和当前容器的容量大小来确定的：  
`临界值（threshold） = 负载因子（loadFactor） * 容量（capacity）`  
其中负载因子表示一个数组可以达到的最大的满的程度。这个值不宜太大，也不宜太小。

* loadFactor太大，比如等于1，那么就会有很高的哈希冲突的概率，会大大降低查询速度。
* loadFactor太小，比如等于0.5，那么频繁扩容没，就会大大浪费空间。

所以，这个值需要介于0.5和1之间。根据数学公式推算。这个值在log(2)的时候比较合理。

另外，为了提升扩容效率，HashMap的容量（capacity）有一个固定的要求，**那就是一定是2的幂**。
**所以，如果loadFactor是3/4也就是0.75的话，那么和capacity的乘积结果就可以是一个整数。**


### 开放寻址法与链表法比较

对于开放寻址法解决冲突的散列表，由于数据都存储在数组中，因此可以有效地利用 CPU 缓存加快查询速度(数组占用一块连续的空间)。但是删除数据的时候比较麻烦，需要特殊标记已经删除掉的数据。而且，在开放寻址法中，所有的数据都存储在一个数组中，比起链表法来说，冲突的代价更高。所以，使用开放寻址法解决冲突的散列表，负载因子的上限不能太大。这也导致这种方法比链表法更浪费内存空间。

对于链表法解决冲突的散列表,对内存的利用率比开放寻址法要高。因为链表结点可以在需要的时候再创建，并不需要像开放寻址法那样事先申请好。链表法比起开放寻址法，对大装载因子的容忍度更高。开放寻址法只能适用装载因子小于1的情况。接近1时，就可能会有大量的散列冲突，性能会下降很多。但是对于链表法来说，只要散列函数的值随机均匀，即便装载因子变成10，也就是链表的长度变长了而已，虽然查找效率有所下降，但是比起顺序查找还是快很多。但是，链表因为要存储指针，所以对于比较小的对象的存储，是比较消耗内存的，而且链表中的结点是零散分布在内存中的，不是连续的，所以对CPU缓存是不友好的，这对于执行效率有一定的影响。


## 跳表

![跳表查找与插入](/img/noodle_plan/algo/skiplist1.jpg "跳表查找与插入")

### 跳表增加数据时索引怎么变化

![跳表插入具体过程](/img/noodle_plan/algo/skiplist_insert.jpg "跳表插入具体过程")

从上面skiplist的创建和插入过程可以看出，每一个节点的层数（level）是随机出来的，而且新插入一个节点不会影响其它节点的层数。因此，插入操作只需要修改插入节点前后的指针，而不需要对很多节点都进行调整。这就降低了插入操作的复杂度。实际上，这是skiplist的一个很重要的特性，这让它在插入性能上明显优于平衡树的方案。这在后面我们还会提到。

执行插入操作时计算随机数的过程，是一个很关键的过程，它对 skiplist 的统计特性有着很重要的影响。这并不是一个普通的服从均匀分布的随机数，它的计算过程如下：

* 首先，每个节点肯定都有第 1 层指针（每个节点都在第 1 层链表里）。
* 如果一个节点有第 i 层 (i>=1) 指针（即节点已经在第 1 层到第 i 层链表中），那么它有第 (i+1) 层指针的概率为 p。
* 节点最大的层数不允许超过一个最大值，记为 MaxLevel。

这个计算随机层数的伪码如下所示：

``` golang
randomLevel()
    level := 1
    // random()返回一个\[0...1)的随机数
    while random() < p and level < MaxLevel do
        level := level + 1
    return level
```

randomLevel() 的伪码中包含两个参数，一个是 p，一个是 MaxLevel。在 Redis 的 skiplist 实现中，这两个参数的取值为：

``` golang
p = 1/4
MaxLevel = 32
```


## 树

* **二叉搜索树**: 记住一点, 其中序遍历是一个有序数组, 所以涉及到各种二叉搜索树(如AVL树/红黑树/B树/B+树)总是说要中序遍历扫描结点啥的
    * 类似于 [给你一棵所有节点为非负值的二叉搜索树，请你计算树中任意两节点的差的绝对值的最小值](https://leetcode-cn.com/problems/minimum-absolute-difference-in-bst/) 这种题目就可以中序遍历之后得到一个有序数组然后遍历此数组求相邻元素的最小差值即可
* **AVL树**: AVL树是带有平衡条件的二叉严格平衡查找树，一般是用平衡因子差值判断是否平衡并通过旋转来实现平衡，左右子树树高不超过1，和红黑树相比，它是严格的平衡二叉树，平衡条件必须满足（所有节点的左右子树高度差不超过1）。不管我们是执行插入还是删除操作，只要不满足上面的条件，就要通过旋转来保持平衡，而旋转是非常耗时的，由此我们可以知道AVL树适合用于插入删除次数比较少，但查找多的情况。
* **红黑树**: 一种二叉弱平衡查找树，但在每个节点增加一个存储位表示节点的颜色，可以是red或black。通过对任何一条从根到叶子的路径上各个节点着色的方式的限制，红黑树确保没有一条路径会比其它路径长出两倍。它是一种弱平衡二叉树(由于是若平衡，可以推出，相同的节点情况下，AVL树的高度低于红黑树)，相对于要求严格的AVL树来说，它的旋转次数变少，所以对于搜索、插入、删除操作多的情况下，我们就用红黑树。实际应用如下:
    * 广泛用于C++的STL中，Map和Set都是用红黑树实现的；
    * 著名的Linux进程调度Completely Fair Scheduler，用红黑树管理进程控制块，进程的虚拟内存区域都存储在一颗红黑树上，每个虚拟地址区域都对应红黑树的一个节点，左指针指向相邻的地址虚拟存储区域，右指针指向相邻的高地址虚拟地址空间；
    * IO多路复用epoll的实现采用红黑树组织管理sockfd，以支持快速的增删改查；
    * Nginx中用红黑树管理timer，因为红黑树是有序的，可以很快的得到距离当前最小的定时器；
* **B树/B+树**: B/B+树是为了磁盘或其它存储设备而设计的一种平衡多路查找树(相对于二叉，B树每个内节点有多个分支)，与红黑树相比，在相同的的节点的情况下，一颗B/B+树的高度远远小于红黑树的高度, B/B+树上操作的时间通常由存取磁盘的时间和CPU计算时间这两部分构成，而CPU的速度非常快，所以B树的操作效率取决于访问磁盘的次数，关键字总数相同的情况下B树的高度越小，磁盘I/O所花的时间越少。(相关细节以及图片可以参考本文的[为什么说B+树比B树更适合数据库索引](#为什么说B类树更适合数据库索引))
    * **B树**(也叫B-树, 这个`-`只是个符号...不是B减树哈)
    * **B+树**: B+树是应文件系统所需而产生的一种B树的变形树（文件的目录一级一级索引，只有最底层的叶子节点（文件）保存数据）非叶子节点只保存索引，不保存实际的数据，数据都保存在叶子节点中，所有叶子节点都有一个链表指针把实际的数据用链表连在一起使得遍历整棵树只需要遍历叶子节点就行.


### 二叉树

* 遍历
    * 深度优先遍历dfs
        * 前序非递归
        * 中序非递归
        * 后序非递归
    * 广度优先遍历bfs
        * 层序遍历pending_fin
* 非递归反转
* 找两个结点的最近公共祖先, pending_fin
* 二叉搜索树: 
    * 它的左、右子树也分别为二叉排序树
    * 其中序遍历是个从小到大的有序序列
    * 找二叉搜索树的任意两个结点的最近公共祖先
        * 在遍历过程中，遇到的第一个值介于n1和n2之间的节点n，也即n1 =< n <= n2, 就是n1和n2的LCA。
        * 在遍历过程中，如果节点的值比n1和n2都大，那么LCA在节点的左子树。
        * 在遍历过程中，如果节点的值比n1和n2都小，那么LCA在节点的右子树。

二叉树的代码表示:
``` python
class BinaryTreeNode(object):
    def __init__(self, val):
        self.left = None
        self.right = None
        self.val = val
```

![](/img/algo_newbie/binary_tree/binary_tree_traverse_and_swap_1.png)

如上图得到的相应的三种**深度优先遍历**的序列分别为 ： 

 - **先(根)序遍历** ： ABCDEGF
 - **中(根)序遍历** ： CBEGDFA
 - **后(根)序遍历** ： CGEFDBA

而得到的**广度优先遍历**的序列为 : ABCDEFG


#### 统一形式的二叉树前中后序迭代遍历

![](/img/algo_newbie/binary_tree/binary_tree_preorder_traversal.gif)

``` python
def binary_tree_preorder_traversal(root):
    _result_arr = []
    if not root:
        return _result_arr
    _temp_stack = []
    _temp_stack.append(("go", root))
    while _temp_stack:
        _cmd, _cur_node = _temp_stack.pop(-1)
        if _cmd == "print":
            _result_arr.append(_cur_node.val)
            continue
        if _cur_node.right:
            _temp_stack.append(("go", _cur_node.right))
        if _cur_node.left:
            _temp_stack.append(("go", _cur_node.left))
        _temp_stack.append(("print", _cur_node))
    return _result_arr


def binary_tree_inorder_traversal(root):
    _result_arr = []
    if not root:
        return _result_arr
    _temp_stack = []
    _temp_stack.append(("go", root))
    while _temp_stack:
        _cmd, _cur_node = _temp_stack.pop(-1)
        if _cmd == "print":
            _result_arr.append(_cur_node.val)
            continue
        if _cur_node.right:
            _temp_stack.append(("go", _cur_node.right))
        _temp_stack.append(("print", _cur_node))
        if _cur_node.left:
            _temp_stack.append(("go", _cur_node.left))
    return _result_arr


def binary_tree_postorder_traversal(root):
    _result_arr = []
    if not root:
        return _result_arr
    _temp_stack = []
    _temp_stack.append(("go", root))
    while _temp_stack:
        _cmd, _cur_node = _temp_stack.pop(-1)
        if _cmd == "print":
            _result_arr.append(_cur_node.val)
            continue
        _temp_stack.append(("print", _cur_node))
        if _cur_node.right:
            _temp_stack.append(("go", _cur_node.right))
        if _cur_node.left:
            _temp_stack.append(("go", _cur_node.left))
    return _result_arr
```


#### 二叉树层序遍历

![](/img/algo_newbie/binary_tree/BreadthFirstTraverse1.png)

注意看上图中的文字思路
``` python
def binary_tree_levelorder_traversal(root):
    _result_arr = []
    if not root:
        return _result_arr
    _temp_queue = []
    _temp_queue.append(root)
    while _temp_queue:
        _cur_node = _temp_queue.pop(0)
        _result_arr.append(_cur_node.val)
        if _cur_node.left:
            _temp_queue.append(_cur_node.left)
        if _cur_node.right:
            _temp_queue.append(_cur_node.right)
    return _result_arr
```


#### 二叉树反转

递归写法:
``` python
def binary_tree_swap_recursive(root):
    if not root:
        return
    root.left, root.right = root.right, root.left
    binary_tree_swap(root.left)
    binary_tree_swap(root.right)
```

可以看到二叉树反转的递归写法跟前序遍历的递归写法很像,
所以反转的迭代写法也可以对着前序遍历的迭代写法如法炮制:
``` python
def binary_tree_swap_iterative(root):
    if not root:
        return
    _temp_stack = []
    _temp_stack.append(("go", root))
    while _temp_stack:
        _cmd, _cur_node = _temp_stack.pop(-1)
        if _cmd == "print":
            # 参考前序遍历的迭代写法, 就只有这里改成了swap操作
            _cur_node.left, _cur_node.right = _cur_node.right, _cur_node.left
            continue
        if _cur_node.right:
            _temp_stack.append(("go", _cur_node.right))
        _temp_stack.append(("print", _cur_node))
        if _cur_node.left:
            _temp_stack.append(("go", _cur_node.left))
```


## 链表

* 可以使用虚头结点来处理问题
* 链表反转
* 虚头节点方便处理问题的思想
* 双指针思想:
    * 删除倒数第n个结点
* 快慢指针的思想: 
    * 判断链表中是否有环
    * 找一个单链表的中间结点
* 判断两个链表是否相交, 假设两个链表均不带环
    * 最后一个元素必相同
* 给定一个结点指针但不给头结点指针, 怎么删除该结点

链表的代码表示:
``` python
class LinkList(object):
    def __init__(self, val):
        self.next = None
        self.val = val
```

虚头结点的优点:
* 虚头结点是为了操作的统一与方便而设立的，放在第一个元素结点之前，其数据域一般无意义（当然有些情况下也可存放链表的长度、用做监视哨等等）。
* 有了虚头结点后，对在第一个元素结点前插入结点和删除第一个结点，其操作与对其它结点的操作统一了。


### 链表反转

![](/img/algo_newbie/link_list_reverse.gif)

``` python
def linklist_reverse(head):
    if not head:
        return
    _pre = None
    _cur = head
    _temp_next = head.next
    while _cur:
        #先用_temp_next保存_cur的下一个节点的信息，
        #保证单链表不会因为失去_cur节点的next而就此断裂
        _temp_next = _cur.next
        #保存完_temp_next，就可以让_cur的next指向_pre了
        _cur.next = _pre
        #让_pre，_cur依次向后移动一个节点，继续下一次的指针反转
        _pre = _cur
        _cur = _temp_next
    return _pre
```


## 图论

* 广度优先遍历dfs可以得到最短路径
* 深度优先遍历bfs有啥用? [图的深度优先遍历dfs](#图的深度优先遍历dfs)


### 图的表示

下面这个图结构就有三个连通分量:
![](/img/algo_newbie/graph/graph_connected_component.png)

邻接表适合表示稀疏图(Sparse Graph):
![](/img/algo_newbie/graph/graph3.png "邻接表表示无向图")
![](/img/algo_newbie/graph/graph4.png "邻接表表示有向图")

邻接矩阵适合表示稠密图(Dense Graph):
![](/img/algo_newbie/graph/graph1.png "邻接矩阵表示无向图")
![](/img/algo_newbie/graph/graph2.png "邻接矩阵表示有向图")

代码如下: 
``` python
class GraphBase(object):
    # 图的基类

    def __init__(self, point_count, is_directed):
        self.adjacency_container = None
        self.is_directed = is_directed  # 是否为有向图
        self.connected_components_count = 0  # 连通分量个数
    
    # 深度优先遍历
    def graph_dfs(self):
        visited_arr = []
        for _cur_point_index in xrange(0, len(self.adjacency_container)):
            if _cur_point_index not in visited_arr:
                self._dfs_by_point(_cur_point_index, visited_arr)
                # 运行到此处, 说明已经把所有和_cur_point_index 相连接的点都遍历完了,
                # A-B-C 也算作 A和C相连接的,
                # 其他的点肯定在另一个连接分量中
                self.connected_components_count += 1
        return visited_arr

    def _dfs_by_point(self, cur_point_index, visited_arr):
        visited_arr.append(cur_point_index)
        for _next_point_index in self._iter_adjacent_points(cur_point_index):
            if _next_point_index not in visited_arr:
                self._dfs_by_point(_next_point_index, visited_arr)

    # 广度优先遍历
    def graph_bfs(self):
        result_arr = []
        visited_set = set()  # 用来记录某个顶点是否已经访问过
        _temp_queue = []
        for _cur_point_index in xrange(0, len(self.adjacency_container)):
            if _cur_point_index not in visited_set:
                _temp_queue.append(_cur_point_index)
                visited_set.add(_cur_point_index)
            while _temp_queue:
                _pt = _temp_queue.pop(0)
                result_arr.append(_pt)
                for _next_pt_index in self._iter_adjacent_points(_pt):
                    if _next_pt_index not in visited_set:
                        _temp_queue.append(_next_pt_index)
                        visited_set.add(_next_pt_index)
        return result_arr


    def _iter_adjacent_points(self, cur_point_index):
        raise NotImplementedError 


class SparseGraph(GraphBase):
    # 稀疏图

    def __init__(self, point_count, is_directed):
        super(SparseGraph, self).__init__(point_count, is_directed)
        self.adjacency_container = [ [] for _ in xrange(point_count) ]  # 邻接表

    def set_adjacency_list(self, adjacency_list):
        self.adjacency_container = adjacency_list

    def _iter_adjacent_points(self, cur_point_index):
        for _adjacent_point_index in self.adjacency_container[cur_point_index]:
            yield _adjacent_point_index


class DenseGraph(GraphBase):
    # 稠密图

    def __init__(self, point_count, is_directed):
        super(DenseGraph, self).__init__(point_count, is_directed)
        self.adjacency_container = [
            [ 0 for _ in xrange(point_count)] for _ in xrange(point_count) 
        ]  # 邻接矩阵

    def set_adjacency_matrix(self, adjacency_matrix):
        self.adjacency_container = adjacency_matrix

    def _iter_adjacent_points(self, cur_point_index):
        for _adjacent_point_index, _is_point_adjacent in enumerate(self.adjacency_container[cur_point_index]):
            if not _is_point_adjacent:
                continue
            yield _adjacent_point_index


if __name__ == "__main__":
    temp_adjacency_list = [
        [1, 2, 5, 6],
        [0],
        [0],
        [4, 5],
        [3, 5, 6],
        [0, 3, 4],
        [0, 4],
    ]
    test_sparse_graph = SparseGraph(point_count=len(temp_adjacency_list), is_directed=False)
    test_sparse_graph.set_adjacency_list(temp_adjacency_list)
    print "test_sparse_graph graph dfs:"
    print test_sparse_graph.graph_dfs()
    print "test_sparse_graph graph bfs:"
    print test_sparse_graph.graph_bfs()

    # 这个邻接矩阵表示的和上面那个邻接表 temp_adjacency_list 是同一个图
    temp_adjacency_matrix = [
        [0, 1, 1, 0, 0, 1, 1],
        [1, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 0, 1, 1],
        [1, 0, 0, 1, 1, 0, 0],
        [1, 0, 0, 0, 1, 0, 0],
    ]
    test_dense_graph = DenseGraph(point_count=len(temp_adjacency_matrix), is_directed=False)
    test_dense_graph.set_adjacency_matrix(temp_adjacency_matrix)
    print "test_dense_graph graph dfs:"
    print test_dense_graph.graph_dfs()
    print "test_dense_graph graph bfs:"
    print test_dense_graph.graph_bfs()
```

打印结果:
```
test_sparse_graph graph dfs:
[0, 1, 2, 5, 3, 4, 6]
test_sparse_graph graph bfs:
[0, 1, 2, 5, 6, 3, 4]
test_dense_graph graph dfs:
[0, 1, 2, 5, 3, 4, 6]
test_dense_graph graph bfs:
[0, 1, 2, 5, 6, 3, 4]
```


### 图的深度优先遍历dfs

![](/img/algo_newbie/graph/graph_dfs.gif)

图的深度优先遍历（DFS）, 深度优先遍历尽可能优先往深层次进行搜索；
1. 首先访问出发点v，并将其标记为已访问过；
2. 然后依次从v出发搜索v的每个邻接点w。若w未曾访问过，则以w为新的出发点继续进行深度优先遍历，直至图中所有和源点v有路径相通的顶点均已被访问为止。
3. 若此时图中仍有未访问的顶点，则另选一个尚未访问的顶点为新的源点重复上述过程，直至图中所有的顶点均已被访问为止。

[代码](#图的表示)在上方已经有了, 其代码中的 `graph_dfs` 就是.

**图dfs用途**: 
* 可以获得两点之间的一条路径
* 判断图是否有环: 
    * [leetcode原题201与题解](https://leetcode-cn.com/problems/course-schedule/solution/course-schedule-tuo-bu-pai-xu-bfsdfsliang-chong-fa/)
    * 大致算法思想: 一条深度遍历路线中如果有结点被第二次访问到，那么有环。我们用一个变量来标记某结点的访问状态（未访问，访问过，其后结点都被访问过），然后判断每一个结点的深度遍历路线即可。


### 图的广度优先遍历bfs

![](/img/algo_newbie/graph/graph_bfs.gif)

也可以称为层序遍历, 广度优先遍历按层次优先搜索最近的结点，一层一层往外搜索:
1. 首先访问出发点v，接着依次访问v的所有邻接点w1、w2......wt，
2. 然后依次访问w1、w2......wt邻接的所有未曾访问过的顶点。
3. 以此类推，直至图中所有和源点v有路径相通的顶点都已访问到为止。此时从v开始的搜索过程结束。
4. 若此时图中仍有未访问的顶点，则另选一个尚未访问的顶点为新的源点重复上述过程，直至图中所有的顶点均已被访问为止。

图的bfs一般要用一个队列来实现, [代码](#图的表示)在上方已经有了, 其代码中的 `graph_bfs` 就是.

**图bfs用途**: 
* 可以获得两点之间的最短路径


# 算法

基础:
* 排序
* 队列的使用
* 栈的使用
* 散列表的使用
* 堆的使用

高阶:
* 递归
* 回溯
* 动态规划
* 贪心算法


### 排序算法

![](/img/algo_newbie/sort_algo_complexity.png "各类排序算法的复杂度")


#### 排序算法要点总结

- 实用的基础排序算法有四种:
    - [**插入排序**](#插入排序) : 在小数据量或者数据都较为有序的时候比起归并和快速排序有更佳的时间效率, 插入排序在这种情况下，只需要从头到尾扫描一遍，交换、移动少数元素即可；时间复杂度近乎 o(N)))。 所以插入排序经常可以当作是其他排序算法的子过程, 下面代码会有体现
    - [**快速排序**](#快速排序) : 时间复杂度依赖数据打乱的程度
        - 快排最差情形的时间复杂度是O(n2), 平均是O(nlogn)
        - 就地快速排序使用的空间是O(1)的，也就是个常数级；而真正消耗空间的就是递归调用了，因为每次递归就要保持一些数据；
            - 最优的情况下空间复杂度为：O(logn) ；每一次都平分数组的情况
            - 最差的情况下空间复杂度为：O( n ) ；退化为冒泡排序的情况
        - 选择基准的方式决定了两个分割后两个子序列的长度，进而对整个算法的效率产生决定性影响, 比如当如果一个有序递增序列, 每次选基准都选最后一个, 那肯定效率 很差了啊, 此时最差情形的时间复杂度是O(n2)
        - 不稳定是因为交换嘛, 如果一个数num刚好跟pivot相等, 那partition完的时候, pivot要和partition index位置的数做交换, 如果这个数num刚好在partition index这个位置, 那这两个数就会发生交换, 然后肯定就不稳定了啊
            - 举个例子：
            待排序数组: `int a[] ={1, 2, 2, 3, 4, 5, 6};`
            在快速排序的随机选择比较子(即pivot)阶段：
            若随机选择到了a[2]（即数组中的第二个2）为比较子，，而把大于等于比较子的数均放置在大数数组中，则a[1]（即数组中的第一个2）会到pivot的右边， 那么数组中的两个2非原序（这就是“不稳定”）。
            若随机选择到了a[1]为比较子，而把 小于等于 比较子的数均放置在小数数组中，则数组中的两个2顺序也非原序
            这就说明，quick sort是不稳定的。
    - [**归并排序**](#归并排序) : 时间复杂度稳定但是占用2N的内存
        - 归并的空间复杂度就是那个临时的数组和递归时压入栈的数据占用的空间：n + logn；所以空间复杂度为: O(n)
        - 还有一种空间复杂度为O(1)的归并排序的自底向上的实现, [下文会讲](#归并自底向上的实现)
    - [**堆排序**](#堆排序): 为什么在平均情况下快速排序比堆排序要优秀? 
        堆排序是渐进最优的比较排序算法，达到了O(nlgn)这一下界，而快排有一定的可能性会产生最坏划分，时间复杂度可能为O(n^2)，那为什么快排在实际使用中通常优于堆排序？
        - 虽然quick_sort会n^2（其实有稳定的nlgn的版本, 比如优化版的三路快排），但这毕竟很少出现。heap_sort大多数情况下比较次数都多于quick_sort，尽管大家都是nlgn。那就让倒霉蛋倒霉好了，大多数情况下快才是硬道理。
        - 堆排比较的几乎都不是相邻元素，对cache极不友好，这才是很少被采用的原因。数学上的时间复杂度不代表实际运行时的情况.快排是分而治之，每次都在同一小段进行比较，最后越来约接近局部性。反观堆排，堆化过程中需要一直拿index的当前元素A和处于`index*2 + 1` 的左子元素B以及处于`index*2 + 2` 的右子元素C比较, 两个元素距离较远。(局部性原理是指CPU访问存储器时，无论是存取指令还是存取数据，所访问的存储单元都趋于聚集在一个较小的连续区域中。)
- **代码书写技巧**:
    - 归并和快排都是当`left_index >= right_index`时, 停止递归
    - 快排的partition过程分割index和遍历的初始index的选择:
        - 普通快排:
        ``` python
        # partition_index 在还没开始遍历之前时应该指向待遍历元素的最左边的那个元素的前一个位置
        # 在这里这种写法就是 `left_index`
        # 这才符合partition_index的定义:
        #       partition_indexy指向小于pivot的那些元素的最后一个元素,
        #       即 less_than_pivots_last_elem_index
        # 因为还没找到比pivot小的元素之前, 
        # partition_index是不应该指向任何待遍历的元素的
        partition_index = less_than_pivots_last_elem_index = left_index

        i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
        ```
        - 三路快排:
        ``` python
        # lt_index 指向小于pivot的那些元素的最右边的一个元素,
        # lt_index 即 less_than_pivots_last_elem_index
        # 因为还没找到比pivot小的元素之前, 
        # lt_index 是不应该指向任何待遍历的元素的, 
        # gt_index 同理, gt_index指向大于pivot的那些元素的最左边的一个元素,
        lt_index = less_than_pivots_last_elem_index = left_index
        gt_index = right_index + 1

        i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
        ```
    - 堆排序, 如果其二叉堆数组index从0开始的话, 而且left_index也为0的话:
        * 最后一个非叶子节点的index为`(length/2 - 1)`
        * `left_child = 2*i + 1`
        * `right_child = 2*i + 2`
- 是否原址: 
    - 原址: 插入排序、堆排序、快速排序
    - 非原址: 归并排序
- 稳定性: 
    - 稳定: 插入排序、归并排序
    - 不稳定: 堆排序、快速排序
- **{% post_link introsort 内省排序: %}** std的sort就是用的内省排序. 此算法首先从快速排序开始，当递归深度超过一定深度（深度为排序元素数量的对数值即logN, 快速排序在理想状态下，应当递归约 log n 次。因此，我们可以说，如果递归深度明显大于 log n，快速排序就掉进陷阱了。于是，我们可以将该阈值设置为 log n 的某一倍数，比如 2log n；一旦递归深度超过 2log n，就从快速排序切换到堆排序。）后转为堆排序。采用这个方法，内省排序既能在常规数据集上实现快速排序的高性能，又能在最坏情况下仍保持O(NlogN)的时间复杂度。
    - 不难归纳，这样的内省式排序，策略应该如下：
        1\. 在数据量足够大的情况使用快速排序；
        2\. 在快速排序掉入陷阱时，主动切换到堆排序；
        3\. 在快速排序和堆排序已经做到基本有序的情况下，或者数据量较小的情况下，主动切换到插入排序。


**. . .**<!-- more -->


#### 插入排序

想象手上有几张牌， 现在你抽了一张牌， 然后需要从手上最右边的牌开始比较，然后插入到相应位置

![](/img/algo_newbie/insert_sort/insert_sort_1.png)

通过不断的与前面已经排好序的元素比较并交换, 
![](/img/algo_newbie/insert_sort/insert_sort_2.png "insert sort")

动画演示如下:
![](/img/algo_newbie/insert_sort/insert_sort_anim.gif)

```python
def insert_sort(arr, left_index, right_index):
    if not arr:
        return
    for i in xrange(left_index+1, right_index+1):  # 从left_index+1开始, 也就是从第二个开始
        for j in xrange(i, left_index, -1):
            if arr[j] < arr[j-1]:  # 注意保证j-1大于0
                # 通过不断的与前面已经排好序的元素比较并交换, 
                arr[j-1], arr[j] = arr[j], arr[j-1]
            else:
                break
```

##### 插排优化

因为基本的插入排序有太多交换操作了, 我们可以用直接赋值来优化

![](/img/algo_newbie/insert_sort/insert_sort_optimize1.gif "insert_sort_optimize")

``` python
def insert_sort_optimize(arr, left_index, right_index):
    if not arr:
        return
    for i in xrange(left_index+1, right_index+1):  # 从left_index+1开始, 也就是从第二个开始
        temp_i_val = arr[i]
        j = i
        while j >= left_index+1:
            if temp_i_val < arr[j-1]:  # 注意保证j-1大于0
                arr[j] = arr[j-1]  # 通过不断的与前面已经排好序的元素比较并直接赋值
                j -= 1
            else:
                break        
        arr[j] = temp_i_val  # 已经找到该插入的地方了, 直接赋值
```


### 归并排序

归并排序用了分治的思想，有很多算法在结构上是递归的：为了解决一个给定的问题，算法要一次或多次地递归调用其自身来解决相关的子问题。这些算法通常采用分治策略（divide-and-conquier）：将原问题划分成n个规模较小而结构与原问题相似的子问题；递归地解决这些子问题，然后再合并其结果，就得到原问题的解。

**分治模式**在每一层递归上都有三个步骤：  
1. 分解（divide）：将原问题分解成一系列子问题；
2. 解决（conquer）：递归地解各子问题。若子问题足够小，则直接求解；
3. 合并：将子问题的结果合并成原问题的解。

归并的具体思路:  

回到我们玩扑克牌的例子，假设桌上有两堆牌面朝上的牌，每堆都已**排序**，最小的牌在顶上。
我们希望把这两堆牌合并成单一的排好序的输出堆，牌面朝下地放在桌上。
我们的基本步骤包括在牌面朝上的两堆牌的顶上两张牌中选取较小的一张，将该牌从其堆中移开（该堆的顶上将
显露一张新牌）并牌面朝下地将该牌放置到输出堆。
重复这个步骤，直到一个输入堆为空，这时，我们只是拿起剩余的输入堆并牌面朝下地将该堆放置到输出堆。

![](/img/algo_newbie/merge_sort/merge_sort_2.png "归并排序分解图")

动画演示:
![](/img/algo_newbie/merge_sort/merge_sort_anim1.gif "归并排序动画总览")


#### 归并排序的merge过程

![](/img/algo_newbie/merge_sort/merge_sort_anim2.gif "归并排序的merge过程")

``` python
def _merge(arr, left_index, mid_index, right_index):
    """
    归并的具体思路:  
        回到我们玩扑克牌的例子，假设桌上有两堆牌面朝上的牌，每堆都已**排序**，最小的牌在顶上。
        我们希望把这两堆牌合并成单一的排好序的输出堆，牌面朝下地放在桌上。
        我们的基本步骤包括在牌面朝上的两堆牌的顶上两张牌中选取较小的一张，将该牌从其堆中移开（该堆的顶上将
        显露一张新牌）并牌面朝下地将该牌放置到输出堆。
        重复这个步骤，直到一个输入堆为空，这时，我们只是拿起剩余的输入堆并牌面朝下地将该堆放置到输出堆。
    """
    # 注释掉下面这句是因为mid不一定等于(l+r)/2, 比如在`merge_sort_bottom_up()`就有可能
    # mid_index = left_index + (right_index - left_index) / 2
    temp_arr = []
    i = left_index
    j = mid_index + 1
    while i <= mid_index and j <= right_index:
        if arr[i] <= arr[j]:
            temp_arr.append(arr[i])
            i += 1
        else:
            temp_arr.append(arr[j])
            j += 1
    # 这一步是模拟: 直到一个输入堆为空，这时，我们只是拿起剩余的输入堆并牌面朝下地将该堆放置到输出堆。
    temp_arr.extend(arr[i:mid_index+1]) 
    temp_arr.extend(arr[j:right_index+1])  # 注意右边界是小于等于right_index的
    # 把归并好的数组数据放到原数组left_index到right_index的位置上去
    for m in xrange(0, right_index-left_index+1):
        arr[left_index+m] = temp_arr[m]
```


#### 归并自顶向下的实现

``` python
def merge_sort(arr, left_index, right_index):
    # 当 `merge_sort()` 递归到left_index等于right_index的时候, 
    # 说明left_index, right_index已经相邻了,
    # 说明已经分解到底了, 左右都只剩下一个元素了, 所以此时应该return然后执行 `_merge()` 了
    if not arr or left_index >= right_index:
        return
    # 注意这里不能直接 `mid_index=(left_index+right_index)/2`,
    # 防止当left_index和right_index很大的时候他们之和溢出
    mid_index = left_index + (right_index - left_index) / 2
    merge_sort(arr, left_index, mid_index)
    merge_sort(arr, mid_index+1, right_index)
    _merge(arr, left_index, mid_index, right_index)
```

##### 归并自顶向下的优化实现

``` diff
def merge_sort_optimize(arr, left_index, right_index):
    # 当 `merge_sort()` 递归到left_index等于right_index的时候, 
    # 说明left_index, right_index已经相邻了,
    # 说明已经分解到底了, 左右都只剩下一个元素了, 所以此时应该return然后执行 `_merge()` 了
    if not arr or left_index >= right_index:
        return

+    # 优化1:
+    #   数据量较小则使用插入排序
+    if (right_index - left_index) < 15:
+        insert_sort_optimize(arr, left_index, right_index)
+        return

    # 注意这里不能直接 `mid_index=(left_index+right_index)/2`,
    # 防止当left_index和right_index很大的时候他们之和溢出
    mid_index = left_index + (right_index - left_index) / 2
    merge_sort(arr, left_index, mid_index)
    merge_sort(arr, mid_index+1, right_index)

+    # 优化2: 
+    #   因为此时arr[mid_index]左边的数组里最大的, 而arr[mid_index+1]是右边最小的,
+    #   如果arr[mid_index] <= arr[mid_index+1]则说明这一轮递归的arr的left到right已经是从小到大有序的了
+    #   所以只在对于arr[mid_index] > arr[mid_index+1]的情况,进行merge, 
+    #   对于近乎有序的数组非常有效,但是对于一般情况,有一定的性能损失(因为多了这行代码判断大小)
+    if arr[mid_index] > arr[mid_index+1]:
        _merge(arr, left_index, mid_index, right_index)
```


#### 归并自底向上的实现

![](/img/algo_newbie/merge_sort/merge_sort_bottom_up.gif)

``` python
def merge_sort_bottom_up(arr, left_index, right_index):
    if not arr or left_index >= right_index:
        return
    arr_len = right_index - left_index + 1
    size = 1
    # 注意这里不是 `while size <= arr_len/2`,
    # 比如arr_len=12, size为4的话, 只能把[0, 7]和[8, 11]的两个子数组归并成有序
    # 那只有size为8, 这样2倍size才能把arr全部归并
    # 但size=8的话, 大于arr_len/2了, 所以应该`while size < arr_len`
    while size < arr_len:
        cur_left_index = left_index
        while cur_left_index <= right_index-size:
            cur_mid_index = cur_left_index + size -1
            possible_right_index = cur_left_index + 2*size -1
            # possible_right_index有可能已经大于right_index了, 所以要min一下
            cur_right_index = min(possible_right_index, right_index)
            # 归并从i位置开始的两倍size的一组数据
            _merge(arr, cur_left_index, cur_mid_index, cur_right_index)
            cur_left_index += size * 2  # 每次归并完一组数据就i移动size的两倍
        # print "size: %d" % size
        # print arr
        size *= 2  # size从1开始每次增加两倍
```

##### 归并自底向上的优化实现

``` diff
def merge_sort_bottom_up_optimize(arr, left_index, right_index):
    if not arr or left_index >= right_index:
        return

+    # 优化1:
+    #   先以size为16为一组数据来逐个对每组插入排序一遍
+    size = 16
+    cur_left_index = left_index
+    while cur_left_index < right_index:
+        possible_right_index = cur_left_index + 2*size -1
+         # possible_right_index有可能已经大于right_index了, 所以要min一下
+        cur_right_index = min(possible_right_index, right_index)
+        insert_sort(arr, cur_left_index, cur_right_index)
+        cur_left_index += size  # 右移到下一个size大小开头位置
    
    arr_len = right_index - left_index + 1
-   size = 1
    # 注意这里不是 `while size <= arr_len/2`,
    # 比如arr_len=12, size为4的话, 只能把[0, 7]和[8, 11]的两个子数组归并成有序
    # 那只有size为8, 这样2倍size才能把arr全部归并
    # 但size=8的话, 大于arr_len/2了, 所以应该`while size < arr_len`
    while size < arr_len:
        cur_left_index = left_index
        while cur_left_index <= right_index-size:
            cur_mid_index = cur_left_index + size -1
            possible_right_index = cur_left_index + 2*size -1
            # possible_right_index有可能已经大于right_index了, 所以要min一下
            cur_right_index = min(possible_right_index, right_index)
            # 归并从i位置开始的两倍size的一组数据
+           # 优化2: 
+           #   因为此时arr[mid_index]左边的数组里最大的, 而arr[mid_index+1]是右边最小的,
+           #   如果arr[mid_index] <= arr[mid_index+1]则说明这一轮递归的arr的left到right已经是从小到大有序的了
+           #   所以只在对于arr[mid_index] > arr[mid_index+1]的情况,进行merge, 
+           #   对于近乎有序的数组非常有效,但是对于一般情况,有一定的性能损失(因为多了这行代码判断大小)
+           if arr[cur_mid_index] > arr[cur_mid_index+1]:
                _merge(arr, cur_left_index, cur_mid_index, cur_right_index)
            cur_left_index += size * 2  # 每次归并完一组数据就i移动size的两倍
        # print "size: %d" % size
        # print arr
        size *= 2  # size从1开始每次增加两倍
```


### 快速排序

与归并排序一样， 快排也是用了分治的思想。

**特别注意** : 快排的核心模块是Partition, 而Partition的复杂度为O(N).

**你可以想象一个两副牌然后随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较，** 

大的放右边那一摞A，小的放左边B。
接着再从左边这一摞B再随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较， 

大的放右边那一摞，小的放左边，递归下去。
A也重复上述步骤递归。

递归结束之后， 左边的都比右边的小， 而且是有序的。

![](/img/algo_newbie/quick_sort/quick_sort_2.png)

动画演示:
![](/img/algo_newbie/quick_sort/quick_sort_partition_anim.gif "partition过程动画演示")


#### 快排效率很差的情况

![](/img/algo_newbie/quick_sort/quick_sort_3.png)

对于分治算法，当每次划分时，算法若都能分成两个等长的子序列时，那么分治算法效率会达到最大。也就是说，基准的选择是很重要的。选择基准的方式决定了两个分割后两个子序列的长度，进而对整个算法的效率产生决定性影响
所以当如果一个有序递增序列, 每次选基准都选最后一个, 那肯定效率很差了啊


#### 普通快排

**注意初始index的位置:** 
``` python
# partition_index 在还没开始遍历之前时应该指向待遍历元素的最左边的那个元素的前一个位置
# 在这里这种写法就是 `left_index`
# 这才符合partition_index的定义:
#       partition_indexy指向小于pivot的那些元素的最后一个元素,
#       即 less_than_pivots_last_elem_index
# 因为还没找到比pivot小的元素之前, 
# partition_index是不应该指向任何待遍历的元素的
partition_index = less_than_pivots_last_elem_index = left_index

i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
```

下面是原代码:
``` python
def _partition(arr, left_index, right_index):
    # 选一个元素作为枢轴量,
    # 为了模拟上面这个动画演示, 这里我们选取最左边的元素
    pivot_index = left_index
    pivot = arr[pivot_index]
    # partition_index 在还没开始遍历之前时应该指向待遍历元素的最左边的那个元素的前一个位置
    # 在这里这种写法就是 `left_index`
    # 这才符合partition_index的定义:
    #       partition_indexy指向小于pivot的那些元素的最后一个元素,
    #       即 less_than_pivots_last_elem_index
    # 因为还没找到比pivot小的元素之前, 
    # partition_index是不应该指向任何待遍历的元素的
    partition_index = less_than_pivots_last_elem_index = left_index

    i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
    while i <= right_index:
        if arr[i] < pivot:
            arr[i], arr[partition_index+1] = arr[partition_index+1], arr[i]
            partition_index += 1
        i += 1
    arr[pivot_index], arr[partition_index] = arr[partition_index], arr[pivot_index]
    return partition_index


def quick_sort(arr, left_index, right_index):
    # 如果left等于right则说明已经partition到只有一个元素了, 可以直接return了
    if not arr or left_index >= right_index:
        return
    partition_index = _partition(arr, left_index, right_index)
    # 把partition_index左边的数据再递归快排一遍
    quick_sort(arr, left_index, partition_index-1)
    quick_sort(arr, partition_index+1, right_index)
```

#### 普通快排的优化

通过[快排效率很差的情况](#快排效率很差的情况), 我们知道快排在面对已经比较有序数组的时候效率如果固定选择某个位置的pivot则性能较差, 所以我们加上两种优化方式:
* 随机选pivot
* 小数组用插排

``` diff
+ import random

def _partition_optimize(arr, left_index, right_index):
    # 选一个元素作为枢轴量,
    # 为了模拟上面这个动画演示, 这里我们选取最左边的元素
    pivot_index = left_index

+   # 优化1:
+   #   随机选一个元素和最左边的交换,
+   #   配合下方的`pivot = arr[left_index]`就达到了随机选一个元素当pivot的效果
+   rand_index = random.randint(left_index, right_index)
+   arr[pivot_index], arr[rand_index] = arr[rand_index], arr[pivot_index]

    pivot = arr[pivot_index]
    # partition_index 在还没开始遍历之前时应该指向待遍历元素的最左边的那个元素的前一个位置
    # 在这里这种写法就是 `left_index`
    # 这才符合partition_index的定义:
    #       partition_indexy指向小于pivot的那些元素的最后一个元素,
    #       即 less_than_pivots_last_elem_index
    # 因为还没找到比pivot小的元素之前, 
    # partition_index是不应该指向任何待遍历的元素的
    partition_index = less_than_pivots_last_elem_index = left_index

    i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
    while i <= right_index:
        if arr[i] < pivot:
            arr[i], arr[partition_index+1] = arr[partition_index+1], arr[i]
            partition_index += 1
        i += 1
    arr[pivot_index], arr[partition_index] = arr[partition_index], arr[pivot_index]
    return partition_index


def quick_sort_optimize(arr, left_index, right_index):
    # 如果left等于right则说明已经partition到只有一个元素了, 可以直接return了
    if not arr or left_index >= right_index:
        return
+   # 优化2:
+   #   小数组用插排
+   if (right_index - left_index) <= 15:
+       insert_sort(arr, left_index, right_index)
+       return
    partition_index = _partition(arr, left_index, right_index)
    # 把partition_index左边的数据再递归快排一遍
    quick_sort(arr, left_index, partition_index-1)
    quick_sort(arr, partition_index+1, right_index)
```


#### 解决普通快排有大量相同元素时的性能问题

**对于分治算法，当每次划分时，算法若都能分成两个等长的子序列时，那么分治算法效率会达到最大。**
当数组中有大量相同元素的时候, 不管怎么选pivot都很容易变成下面这种情况导致分成子序列的不平衡, 这将极大的影响时间复杂度, 最差的情况会退化成O(N2)

![](/img/algo_newbie/quick_sort/quick_sort_4.png)


##### 双路快排-初步解决有大量相同元素的性能问题

所以产生了双路快排的方式, 双路快速排序算法则不同，他使用两个索引值（i、j）用来遍历我们的序列，将小于等于v的元素放在索引i所指向位置的左边，而将大于等于v的元素放在索引j所指向位置的右边, 通过下图我们可以看到当等于v的情况也会发生交换, 这就基本可以保证等于v的元素也可以较为均匀的放到左右两边

![](/img/algo_newbie/quick_sort/quick_sort_5.gif)

**待改进的地方**: 还是把等于v的元素加入到了待处理的数据中, 之后又去重复计算这些等于v的元素了, 为了排除这些已经等于v的元素, 所以产生了[**三路快排**](#三路快排-完全解决有大量相同元素的性能问题)


##### 三路快排-完全解决有大量相同元素的性能问题

这是最经典的解决有大量重复元素的问题的快排方案, 被大多数系统所使用.

![](/img/algo_newbie/quick_sort/quick_sort_6.gif)

**注意初始index的位置:** 
``` python
pivot = arr[pivot_index]
# lt_index 指向小于pivot的那些元素的最右边的一个元素,
# lt_index 即 less_than_pivots_last_elem_index
# 因为还没找到比pivot小的元素之前, 
# lt_index 是不应该指向任何待遍历的元素的, 
# gt_index 同理, gt_index指向大于pivot的那些元素的最左边的一个元素,
lt_index = less_than_pivots_last_elem_index = left_index
gt_index = right_index + 1

i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
```

接下来是完整代码:
``` python
def quick_sort_3_ways(arr, left_index, right_index):
    # 如果left等于right则说明已经partition到只有一个元素了, 可以直接return了
    if not arr or left_index >= right_index:
        return
    if (right_index - left_index) <= 15:
        insert_sort(arr, left_index, right_index)
        return

    # 选一个元素作为枢轴量,
    # 为了模拟上面这个动画演示, 这里我们选取最左边的元素
    pivot_index = left_index
    # 随机选一个元素和最左边的交换,
    # 配合下方的`pivot = arr[left_index]`就达到了随机选一个元素当pivot的效果
    rand_index = random.randint(left_index, right_index)
    arr[pivot_index], arr[rand_index] = arr[rand_index], arr[pivot_index]
    
    pivot = arr[pivot_index]
    # lt_index 指向小于pivot的那些元素的最右边的一个元素,
    # lt_index 即 less_than_pivots_last_elem_index
    # 因为还没找到比pivot小的元素之前, 
    # lt_index 是不应该指向任何待遍历的元素的, 
    # gt_index 同理, gt_index指向大于pivot的那些元素的最左边的一个元素,
    lt_index = less_than_pivots_last_elem_index = left_index
    gt_index = right_index + 1

    i = left_index + 1  # 因为pivot_index取left_index了, 则我们从left_index+1开始遍历
    while i < gt_index:
        if arr[i] < pivot:
            arr[i], arr[lt_index+1] = arr[lt_index+1], arr[i]
            lt_index += 1
            i += 1
        elif arr[i] > pivot:
            arr[i], arr[gt_index-1] = arr[gt_index-1], arr[i]
            gt_index -= 1
        else:
            i += 1
    arr[pivot_index], arr[lt_index] = arr[lt_index], arr[pivot_index]

    quick_sort_3_ways(arr, left_index, lt_index)
    quick_sort_3_ways(arr, gt_index, right_index)
```


### 堆排序

最大堆的堆排序之后的数组是升序, 最小堆反之.
堆排序 HeapSort 由 以下两部分组成 :

- [堆化 MaxHeapify](#堆化)
- [建堆 BuildMaxHeap](#建堆)

#### 堆排序的复杂度

* **时间复杂度** : 
    * **MaxHeapify** : **O(logN)**.
    * **BuildMaxHeap** : **O(N)**. 
    看起来像是O(NlogN), 其实是O(N), 因为不同结点运行 MaxHeapify 的 时间和该结点的树高相关, 而大部分结点的高度都很小, <<算法导论>>中有相关证明
    * **HeapSort** : **O(NlogN)**.
        初始化堆 BuildMaxHeap 的时间复杂度为O(N); 之后因为每次交换结点然后从堆中去掉最后一个结点后都要重建堆 BuildMaxHeap 
        *(上述 HeapSort 函数代码中的倒数第三行 `MaxHeapify(arr, 0, --length)` 其实就是个重建堆的过程)* , 
        重建堆 BuildMaxHeap 的时间复杂度为O(N), 而 length - 1 次调用了 MaxHeapify, MaxHeapify 的时间复杂度为O(lgN). 所以为 O(N + NlogN), 即为O(Nlogn)
* **空间复杂度** : 
  * **O(1)**, 因为没有用辅助内存.


#### 堆化

**注意**: 以下演示图中的index是从1开始的, 方便我们看动图理解堆化过程, 我们下方代码的数组的index是从0开始的

![](/img/algo_newbie/heap_sort/MaxHeapify.png "对某个元素执行堆化操作")

**注意** : 
在调用MaxHeapify的时候, 我们假定索引为index的元素的左子树和右子树都是最大堆, 不然你如果注意看的话, 你会发现上图中index为10的那个元素其实是没有计算到的, 因为我们假定以index=5为根节点的二叉树都是最大堆了, 所以无需计算他. 
那为何要作如此假设呢?
因为要跟建堆 BuildMaxHeap 配合来完成堆排序, 而建堆 BuildMaxHeap是从下至上的.

动画演示如下, 比如要对17这个元素为父元素的所有子元素进行堆化:

![](/img/algo_newbie/heap_sort/heap_sort_heapify.gif "对17这个元素执行堆化")

用数组存储二叉堆, 首先得明确以下两个index的取得方法, **如果index从0开始的话**:
* `left_child = 2*i + 1`, 
* `right_child = 2*i + 2`
如果是对数组的`[left_index, right_index]`来排序, 且数组的首index为0的话, 则:
* `left_child_index = 2 * (pending_heapify_index-left_index) + 1`
* `right_child_index = left_child_index + 1`
这两个index的取得方式在下方代码有体现.

![](/img/algo_newbie/heap_sort/heap_sort_binary_heap_index.png)


##### 堆化递归写法

递归写法更容易理解一些:
``` python
# 递归版, 对 pending_heapify_index 元素执行堆化
def _max_heapify_recursive(arr, pending_heapify_index, left_index, right_index):
    if pending_heapify_index >= right_index:  # 当满足此条件, 应该结束`_max_heapify_recursive`递归了
        return
    left_child_index = 2 * (pending_heapify_index-left_index) + 1
    right_child_index = left_child_index + 1

    # 选出 pending_heapify_index 的左右孩子中最大的元素,
    # 并与 pending_heapify_index 元素交换
    cur_max_index = pending_heapify_index
    if left_child_index <= right_index and arr[cur_max_index] < arr[left_child_index]:
        cur_max_index = left_child_index
    if right_child_index <= right_index and arr[cur_max_index] < arr[right_child_index]:
        cur_max_index = right_child_index

    # 若当前已经是最大元素了, 则停止递归, 如果不是则执行交换与继续递归
    if cur_max_index != pending_heapify_index:
        arr[pending_heapify_index], arr[cur_max_index] = arr[cur_max_index], arr[pending_heapify_index]
        _max_heapify_recursive(arr, cur_max_index, left_index, right_index)  # 继续 堆化 cur_max_index 的子元素
```


##### 堆化迭代写法


``` python
# 迭代版, 对 pending_heapify_index 元素执行堆化
def _max_heapify_iterative(arr, pending_heapify_index, left_index, right_index):
    left_child_index = 2 * (pending_heapify_index-left_index) + 1
    while left_child_index <= right_index:
        right_child_index = left_child_index + 1
        # 选出 pending_heapify_index 的左右孩子中最大的元素,
        # 并与 pending_heapify_index 元素交换
        cur_max_index = pending_heapify_index
        if left_child_index <= right_index and arr[cur_max_index] < arr[left_child_index]:
            cur_max_index = left_child_index
        if right_child_index <= right_index and arr[cur_max_index] < arr[right_child_index]:
            cur_max_index = right_child_index

        # 若当前已经是最大元素了, 则直接break, 如果不是则执行交换与继续新一轮的堆化循环
        if cur_max_index != pending_heapify_index:
            arr[pending_heapify_index], arr[cur_max_index] = arr[cur_max_index], arr[pending_heapify_index]
            pending_heapify_index = cur_max_index
            left_child_index = 2 * (pending_heapify_index-left_index) + 1
        else:
            break
```

迭代写法的话也可以使用赋值的方式取代不断的swap,
该优化思想和我们之前对[插入排序进行优化](#插排优化)的思路是一致的, 此处这个优化代码就略了


#### 建堆

我们对每一个不是叶结点的元素(当index从root_index=0开始, 即为 index 小于等于 `root_index + (length/2 - 1)` )自底向上调用一次 Max_Heapify 就可以把一个大小为 length 的数组转换为最大堆.

**注意**: 以下动画演示图中的index是从1开始的, 方便我们看动图理解堆化过程, 我们下方代码的数组的index是从0开始的

![](/img/algo_newbie/heap_sort/heap_sort_build_heap.gif "建堆过程")

``` python
def _build_max_heap(arr, left_index, right_index):
    # 建堆, 从最后一个非叶结点开始, 自底向上堆化就建好了一个最大堆
    root_index = left_index
    arr_len = right_index - left_index + 1
    last_none_leaf_index = root_index + (arr_len/2 - 1)

    i = last_none_leaf_index
    while i >= root_index:
        _max_heapify_recursive(arr, i, left_index, right_index)
        i -= 1
```


#### 堆排序原址排序的具体实现

![](/img/algo_newbie/heap_sort/heap_sort.gif "堆排序过程")

堆排序分两步:
1. 建堆
2. 重复以下两个操作:
   1. 把数组中的第一个元素(即根节点)也就是当前堆的最大元素逐个和数组后面的元素交换
   2. 对根节点做一次堆化操作

``` python
def heap_sort(arr, left_index , right_index):
    if not arr or left_index >= right_index or right_index <= 0:
        return
    _build_max_heap(arr, left_index, right_index)
    # 把数组中的第一个元素(即根节点)也就是当前堆的最大元素逐个和数组后面的元素交换
    # 交换后根节点已经违背最大堆性质了, 但其他的元素还是符合最大堆性质的
    # 所以然后要对根节点做一次堆化操作
    cur_right_index = right_index
    root_index = left_index
    while cur_right_index >= root_index:
        arr[root_index], arr[cur_right_index] = arr[cur_right_index], arr[root_index]
        cur_right_index -= 1
        _max_heapify_recursive(arr, root_index, left_index, cur_right_index)
```
