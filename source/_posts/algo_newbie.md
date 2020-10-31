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

https://github.com/no5ix/no5ix.github.io/blob/source/source/code/test_algo.py


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
        * 层序遍历
* 非递归反转
* 找普通二叉树的两个结点的最近公共祖先LCA问题
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
        # 因为稀疏图一般用邻接表来保存图的顶点数据,
        # 而稠密图一般用邻接矩阵来表示, 所以他们的保存邻接点容器是不同的,
        # 留给具体子类来指定, 此处用 `self.adjacency_container = None`表示即可
        self.adjacency_container = None
        self.is_directed = is_directed  # 是否为有向图
        self.connected_components_count = 0  # 连通分量个数
    
    def graph_dfs(self):
        """
        图的深度优先遍历（DFS）, 深度优先遍历尽可能优先往深层次进行搜索；
        1. 首先访问出发点v，并将其标记为已访问过；
        2. 然后依次从v出发搜索v的每个邻接点w。若w未曾访问过，则以w为新的出发点继续进行深度优先遍历，直至图中所有和源点v有路径相通的顶点均已被访问为止。
        3. 若此时图中仍有未访问的顶点，则另选一个尚未访问的顶点为新的源点重复上述过程，直至图中所有的顶点均已被访问为止。
        """
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

    def graph_bfs(self):
        """
        图的广度优先遍历, 也可以称为图的层序遍历, 广度优先遍历按层次优先搜索最近的结点，一层一层往外搜索:
        1. 首先访问出发点v，接着依次访问v的所有邻接点w1、w2......wt，
        2. 然后依次访问w1、w2......wt邻接的所有未曾访问过的顶点。
        3. 以此类推，直至图中所有和源点v有路径相通的顶点都已访问到为止。此时从v开始的搜索过程结束。
        4. 若此时图中仍有未访问的顶点，则另选一个尚未访问的顶点为新的源点重复上述过程，直至图中所有的顶点均已被访问为止。
        """
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
        """
        因为稀疏图一般用邻接表来保存图的顶点数据,
        而稠密图一般用邻接矩阵来表示,
        所以他们的遍历邻接点的方式是不同的, 留给具体的子类来实现.
        """
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


## 排序算法

![](/img/algo_newbie/sort_algo_complexity.png "各类排序算法的复杂度")


### 排序算法要点总结

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


### 插入排序

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

#### 插排优化

因为基本的插入排序有太多交换操作了, 我们可以用直接赋值来优化

![](/img/algo_newbie/insert_sort/insert_sort_optimized.gif "insert_sort_optimized")

``` python
def insert_sort_optimized(arr, left_index, right_index):
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
def merge_sort_optimized(arr, left_index, right_index):
    # 当 `merge_sort()` 递归到left_index等于right_index的时候, 
    # 说明left_index, right_index已经相邻了,
    # 说明已经分解到底了, 左右都只剩下一个元素了, 所以此时应该return然后执行 `_merge()` 了
    if not arr or left_index >= right_index:
        return

+    # 优化1:
+    #   数据量较小则使用插入排序
+    if (right_index - left_index) < 15:
+        insert_sort_optimized(arr, left_index, right_index)
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
def merge_sort_bottom_up_optimized(arr, left_index, right_index):
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

def _partition_optimized(arr, left_index, right_index):
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


def quick_sort_optimized(arr, left_index, right_index):
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


## 递归

实际上，递归有两个显著的特征,终止条件和自身调用:

* 自身调用：原问题可以分解为子问题，子问题和原问题的求解方法是一致的，即都是调用自身的同一个函数。
* 终止条件：递归必须有一个终止的条件，即不能无限循环地调用本身。


### 递归解题思路

解决递归问题一般就三步曲，这个递归解题三板斧理解起来有点抽象，我们拿阶乘递归例子来喵喵吧~
三部曲分别是：
1. **定义函数功能**
    定义函数功能，就是说，你这个函数是干嘛的，做什么事情，换句话说，你要知道递归原问题是什么呀？比如你需要解决阶乘问题，定义的函数功能就是n的阶乘，如下：
    ``` cpp
    //n的阶乘（n为大于0的自然数）
    int factorial (int n){

    }
    ```
2. **寻找递归终止条件**
    递归的一个典型特征就是必须有一个终止的条件，即不能无限循环地调用本身。所以，用递归思路去解决问题的时候，就需要寻找递归终止条件是什么。比如阶乘问题，当n=1的时候，不用再往下递归了，可以跳出循环啦，n=1就可以作为递归的终止条件，如下：
    ``` cpp
    //n的阶乘（n为大于0的自然数）
    int factorial (int n){
        if(n==1){
        return 1;
        }
    }
    ```
3. **找出递归结构, 或者递推函数的等价关系式**
    递归的「本义」，就是原问题可以拆为同类且更容易解决的子问题，即「原问题和子问题都可以用同一个函数关系表示。递推函数的等价关系式，这个步骤就等价于寻找原问题与子问题的关系，如何用一个公式把这个函数表达清楚」。阶乘的公式就可以表示为 f(n) = n * f(n-1), 因此，阶乘的递归程序代码就可以写成这样，如下：
    ``` cpp
    int factorial (int n){
        if(n==1){
        return 1;
        }
        return n * factorial(n-1);
    }
    ```

「注意啦」，不是所有递推函数的等价关系都像阶乘这么简单，一下子就能推导出来。需要我们多接触，多积累，多思考，多练习递归题目滴~


### 二叉树与递归

递归，是使用计算机解决问题的一种重要的思考方式。而二叉树由于其天然的递归结构，使得基于二叉树的算法，均拥有着递归性质。使用二叉树，是研究学习递归算法的最佳入门方式。在这一章里，我们就来看一看二叉树中的递归算法。


#### path-sum

[leetcode112题](https://leetcode-cn.com/problems/path-sum/)

![](/img/algo_newbie/bt_recursion/path_sum.png "path_sum问题")

**技巧**: 首先要明确此递归函数的定义: 查看root是否为叶子结点并且root的val是否等于sum_num, 然后才开始写代码

``` python
# 首先要明确此递归函数的定义: 查看root是否为叶子结点并且root的val是否等于sum_num,
# 然后才开始写代码
def has_path_sum(root, sum_num):
	if not root:
		return False
    # 判断是否为叶子
	if not root.left and not root.left and root.val == sum_num:
		return True
    # 通过递归, 继续查看左右孩子节点是否有 sum_num-root.val
	if has_path_sum(root.left, sum_num-root.val):
		return True
	return has_path_sum(root.right, sum_num-root.val)
```


#### binary-tree-paths

![](/img/algo_newbie/bt_recursion/bt_paths.png "打印所有路径问题")
![](/img/algo_newbie/bt_recursion/bt_paths_answer.png "递归过程")

``` python
def binary_tree_paths(root):
    result_arr = []
    if not root:
        return result_arr
    if not root.left and not root.right:
        result_arr.append(str(root.val))
        return result_arr
    # 获取左孩子的路径
    left_bt_path_arr = binary_tree_paths(root.left)
    for _path in left_bt_path_arr:
        result_arr.append(str(root.val) + "->" + _path)
    # 获取右孩子的路径
    right_bt_path_arr = binary_tree_paths(root.right)
    for _path in right_bt_path_arr:
        result_arr.append(str(root.val) + "->" + _path)
    return result_arr
```


#### path-sum-3

[leetcode437题](https://leetcode-cn.com/problems/path-sum-iii/)  
给出一颗二叉树以及一个数字sum, 判断在这棵二叉树上存在多少条路径, 其路径上的所有节点和为sum.
* 其中路径不一定要起始于根节点, 终止于叶子节点
* 路径可以从任意节点开始, 但是只能是向下走的

![](/img/algo_newbie/bt_recursion/path_sum_3_1.png "当包括node时的递归情况")
![](/img/algo_newbie/bt_recursion/path_sum_3_2.png "当不包括node时的递归情况")

``` python
def path_sum_3(root, sum_num):
    if not root:
        return 0
    path_cnt = 0
    # 先求包括node本身的情况, 此时这轮递归所说的node是代码中的root
    # 这种情况可以用类似于 path_sum问题 的 `has_path_sum`来实现
    path_cnt += _get_path_sum_include_node(root, sum_num)
    # 再求不包括node本身的情况, 
    # 直接计算左右孩子往下的路径中和为sum_num(注意不是sum_num-root.val)的路径数量
    path_cnt += path_sum_3(root.left, sum_num)
    path_cnt += path_sum_3(root.right, sum_num)
    return path_cnt


def _get_path_sum_include_node(node, sum_num):
    if not node:
        return 0
    _path_cnt = 0
    if node.val == sum_num:  # node本身值等于sum_num也算一条路径
        _path_cnt += 1
    _path_cnt += _get_path_sum_include_node(node.left, sum_num-node.val)
    _path_cnt += _get_path_sum_include_node(node.right, sum_num-node.val)
    return _path_cnt
```


### 回溯与递归

参考: leetcode-cn.com/problems/permutations/solution/hui-su-suan-fa-python-dai-ma-java-dai-ma-by-liweiw/

回溯法 采用试错的思想，它尝试分步的去解决一个问题。在分步解决问题的过程中，当它通过尝试发现现有的分步答案不能得到有效的正确的解答的时候，它将取消上一步甚至是上几步的计算，再通过其它的可能的分步解答再次尝试寻找问题的答案。回溯法通常用最简单的递归方法来实现，在反复重复上述的步骤后可能出现两种情况：
* 找到一个可能存在的正确的答案；
* 在尝试了所有可能的分步方法后宣告该问题没有答案。

回溯法是解决很多算法问题的常见思想，甚至可以说是传统人工智能的基础方法。其本质依然是使用递归的方法在树形空间中寻找解。在这一章，我们来具体看一下将递归这种技术使用在非二叉树的结构中，从而认识回溯这一基础算法思想, 

**其实上一节的[二叉树与递归](#二叉树与递归)也是回溯的思想, 不过我们通常把回溯这个名词用在表示递归查找解的问题上**

**比如下面这个[树形问题电话号码字母组合](#树形问题电话号码字母组合), 如果n是一个固定的数比如为8, 其实我们可以使用8重循环来解决, 但是n是不固定了, 所以我们只能使用回溯法来解决, 回溯法是暴力解法的一个主要手段.**

动态规划其实可以算是回溯法的基础上一种改进, 同时要发现一个递归结构, 以及其他的特点就可以用回溯法, 其实回溯法也可以剪枝来优化, 不用到达所有的叶子结点从而提升我们回溯法的运行效率.


#### 回溯算法框架

参考: leetcode-cn.com/problems/permutations/solution/hui-su-suan-fa-xiang-jie-by-labuladong-2/

废话不多说，直接上回溯算法框架。解决一个回溯问题，实际上就是一个决策树的遍历过程。你只需要思考 3 个问题：
1. 路径: 也就是已经做出的选择。
2. 选择列表: 供选择的列表
3. 结束条件: 也就是到达决策树底层，无法再做选择的条件。

如果你不理解这三个词语的解释，没关系，我们后面会用「全排列」和「N 皇后问题」这两个经典的回溯算法问题来帮你理解这些词语是什么意思，现在你先留着印象。

代码方面，回溯算法的框架：
```
result = []
def backtrack(供选择的列表, 选择的路径中间状态, 递归到第几层index):
    if 满足结束条件:
        result.add(选择的路径中间状态)
        return
    
    for 选择 in 供选择的列表:
        做选择
        backtrack(选择的路径中间状态, 供选择的列表, index+1)
        撤销选择
```
其核心就是 for 循环里面的递归，在递归调用之前「做选择」，在递归调用之后「撤销选择」，特别简单。


#### 设计状态变量-经典排列问题

leetcode46题:  
给定一个整型数组, 其中的元素各不相同, 求返回这些元素的所有排列.  
如对于 `[1, 2, 3]`, 则返回 `[ [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1] ]`

![](/img/algo_newbie/backtrack_recursion/permutations.png "排列树形图示")

**设计状态变量**:  
* 参考: //leetcode-cn.com/problems/permutations/solution/hui-su-suan-fa-python-dai-ma-java-dai-ma-by-liweiw/
* 首先这棵树除了根结点和叶子结点以外，每一个结点做的事情其实是一样的，即：在已经选择了一些数的前提下，在剩下的还没有选择的数中，依次选择一个数，这显然是一个 递归 结构；
* 递归的终止条件是： 一个排列中的数字已经选够了 ，因此我们需要一个变量来表示当前程序递归到第几层，我们把这个变量叫做 index ，表示当前要确定的是某个全排列中下标为 index 的那个数是多少；
* 布尔数组 used，初始化的时候都为 false 表示这些数还没有被选择，当我们选定一个数的时候，就将这个数组的相应位置设置为 true ，这样在考虑下一个位置的时候，就能够以 O(1)O(1) 的时间复杂度判断这个数是否被选择过，这是一种「以空间换时间」的思想。
这些变量称为「状态变量」，它们表示了在求解一个问题的时候所处的阶段。需要根据问题的场景设计合适的状态变量。

注意查看下方代码中的 `_generate_permutation`, 排列问题基本都是这种代码写法模板.

``` python
class Solution_permutations(object):

    def __init__(self):
        self._used_num_set = set()

    def permute(self, nums):
        """
        :type nums: List[int]
        :rtype: List[List[int]]
        """
        result_permutation_arr = []
        if not nums:
            return result_permutation_arr
        middle_state_container = []
        self._generate_permutation(result_permutation_arr,
            nums, index=0, middle_state_container=middle_state_container)
        return result_permutation_arr

    def _generate_permutation(
            self, result_arr,
            pending_proc_num_arr, index, middle_state_container):
        """
        middle_state_container 中保存了一个有index-1个元素的排列。
        向这个排列的末尾添加第index个元素, 获得一个有index个元素的排列
        """
        if index == len(pending_proc_num_arr):
            # 当index等于数字字符串长度的时候说明一轮已经递归到底了,
            # 则当前的 中间状态保存器 middle_state_container 则为一个解
            # 此处需要深拷贝一下, 因为下方代码有个 `middle_state_container.pop(-1)`
            result_arr.append(copy.deepcopy(middle_state_container))
            return
        for _single_num in pending_proc_num_arr:
            # 如果本轮递归 used_num_set 已经有_single_num 了, 
            # 说明当前排列 middle_state_container 中已经有 _single_num 了
            # 那不应该再加入到这个排列中了
            if _single_num not in self._used_num_set:
                self._used_num_set.add(_single_num)
                middle_state_container.append(_single_num)
                self._generate_permutation(
                    result_arr, pending_proc_num_arr,
                    index+1, middle_state_container)
                # 本轮递归完毕后要清空相应记录的状态, 这就是回溯, 
                # 递归本身会记录一些状态当退出的时候他会自动清除状态, 
                # 那我们自己额外记录的状态, 比如 self._used_num_set 和
                # middle_state_container 的状态应该自己手动清除
                self._used_num_set.remove(_single_num)
                middle_state_container.pop(-1)

```


##### 树形问题电话号码字母组合

![](/img/algo_newbie/backtrack_recursion/letter_combinations_of_a_phone_number.png "问题描述")
![](/img/algo_newbie/backtrack_recursion/letter_combinations_of_a_phone_number1.png "解题思路之树形结构")

递归关系式:
* `digits` 是数字字符串
* `s(digits)` 是 `digits` 所能代表的字母字符串
* 则关系式如下:
    ``` python
    s(digits[0...n-1])
        = letter(digits[0]) + s(digits[1...n-1])
        = letter(digits[0]) + letter(digits[1]) + s(digits[2...n-1])
        = ...
    ```
**这道题虽然叫字母组合问题, 但实际上是个排列问题.**  
注意查看下方代码中的 `_get_letter_combination`, 排列问题基本都是这种代码写法模板.

实现代码如下:
``` python
digits_map = {
    "0": " ",
    "1": "",
    "2": "abc",
    "3": "def",
    "4": "ghi",
    "5": "jkl",
    "6": "mno",
    "7": "pqrs",
    "8": "tuv",
    "9": "wxyz",
}

def letter_combinations_of_a_phone_number(digits_str):
    result_str_arr = []
    if not digits_str:
        return result_str_arr
    assert "1" not in digits_str, "we dont proc 1"
    
    middle_state_container = []
    _get_letter_combination(result_str_arr, digits_str, index=0,
        middle_state_container=middle_state_container)
    return result_str_arr    

def _get_letter_combination(
        result_str_arr, pending_proc_digits_str, index, middle_state_container):
    """
    middle_state_container 中保存了
    此时从 pending_proc_digits_str[0...index-1] 翻译得到的一个字母字符串
    寻找和pending_proc_digits_str[index]匹配的字母,
    获得pending_proc_digits_str[0...index]翻译得到的解
    """
    if index == len(pending_proc_digits_str):
        # 当index等于数字字符串长度的时候说明一轮已经递归到底了,
        # 则当前的 中间状态保存器 middle_state_container 则为一个解
        # 此处需要深拷贝一下, 因为下方代码有个 `middle_state_container.pop(-1)`
        result_str_arr.append(copy.deepcopy(middle_state_container))
        return 
    # # 不处理1因为1对应的没字母
    # while pending_proc_digits_str[index] == "1":
    #     index += 1
    #     if index >= len(pending_proc_digits_str):
    #         return
    _cur_letters_str = digits_map[pending_proc_digits_str[index]]
    for _single_letter_str in _cur_letters_str:
        middle_state_container.append(_single_letter_str)
        _get_letter_combination(
            result_str_arr, pending_proc_digits_str, index+1,
            middle_state_container)
        middle_state_container.pop(-1)
```


#### 经典组合问题

leetcode77题  
给出两个整数n和k, 求出1...n中k个数字的所有组合  
如n=4, k=2, 则结果为`[ [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4] ]`

![](/img/algo_newbie/backtrack_recursion/combinations.png "组合问题解题思路图")

``` python
def combinations(n, k):
    result_arr = []
    if k <= 0 or k > n or n <= 0:
        return result_arr
    middle_state_container = []
    _generate_combinations(result_arr, n, k, 1, middle_state_container)
    return result_arr
    
def _generate_combinations(
        result_arr,
        pending_proc_n, pending_prco_k, start_index, middle_state_container):
    """
    求解C(n,k), 当前已经找到的组合存储在 middle_state_container 中,
    需要从start_index开始搜索新的元素
    可以看出跟排列问题的代码模板很像, 
    只有终止递归条件和for循环的start_index不太一样
    """
    if len(middle_state_container) == pending_prco_k:
        result_arr.append(copy.deepcopy(middle_state_container))
        return
    # 每次递归从start_index开始直到 pending_proc_n
    for _index in xrange(start_index, pending_proc_n+1):
        middle_state_container.append(_index)
        _generate_combinations(
            result_arr, pending_proc_n, pending_prco_k,
            _index+1, middle_state_container)
        middle_state_container.pop(-1)
```

##### 组合问题解决优化

从上面的 组合问题解题思路 中可以看出其实是没有必要计算 "取4" 的操作的, 
所以我们利用剪枝的思想, 把这部分优化掉, 代码如下:
``` diff
def _generate_combinations_optimized(
        result_arr,
        pending_proc_n, pending_prco_k, start_index, middle_state_container):
    """
    求解C(n,k), 当前已经找到的组合存储在 middle_state_container 中,
    需要从start_index开始搜索新的元素
    可以看出跟排列问题的代码模板很像, 
    只有终止递归条件和for循环的start_index不太一样
    """
    if len(middle_state_container) == pending_prco_k:
        result_arr.append(copy.deepcopy(middle_state_container))
        return
-   # 每次递归从start_index开始直到 pending_proc_n
-   for _index in xrange(start_index, pending_proc_n+1):
+   # 剪枝的思想, 
+   # 还有k - middle_state_container.size()个空位,
+   # 所以, [i...n] 中至少要有 k - middle_state_container.size() 个元素
+   # i最多为 n - (k - middle_state_container.size()) + 1
+   _cur_stop_index = pending_proc_n - (
+       pending_prco_k - middle_state_container.size()) + 1
+   # 每次递归从start_index开始直到 _cur_stop_index
+   for _index in xrange(start_index, _cur_stop_index+1):
        middle_state_container.append(_index)
        _generate_combinations(
            result_arr, pending_proc_n, pending_prco_k,
            _index+1, middle_state_container)
        middle_state_container.pop(-1)
```


#### 经典floodfill问题

[leetcode200题](https://leetcode-cn.com/problems/number-of-islands/)  
给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。
岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。
此外，你可以假设该网格的四条边均被水包围。

示例 1：
输入：grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
输出：1
如下图则有1个岛屿:
![](/img/algo_newbie/backtrack_recursion/number_of_islands1.png "只有1个岛屿")

示例 2：
输入：grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
输出：3
如下图则有3个岛屿:
![](/img/algo_newbie/backtrack_recursion/number_of_islands2.png "有3个岛屿")

这一次我们代码用类似于leetcode的solution类的形式来实现, 如下:
``` python
class Solution_number_of_islands(object):

    def __init__(self):
        self._visited_pos_set = set()
        # 方便搜索点的时候往上下左右搜
        self._move_dir_arr = [(0, -1), (0, 1), (1, 0), [-1, 0]]

    def numIslands(self, grid):
        """
        :type grid: List[List[str]]
        :rtype: int
        """
        if not grid:
            return 0
        islands_cnt = 0
        for x in xrange(0, len(grid)):
            assert (type(grid[x]) is list), ("x = %d" % x)
            for y in xrange(0, len(grid[x])):
                if tuple([x, y]) in self._visited_pos_set:
                    continue
                if grid[x][y] != "1":
                    continue
                self._dfs_islands(grid, x, y)
                islands_cnt += 1  # 一次搜索完成就算有一个岛屿了
        return islands_cnt


    def _dfs_islands(self, grid, x, y):  # x是纵坐标, y是横坐标
        # print "x = %d" % x
        # print "y = %d" % y
        self._visited_pos_set.add(tuple([x, y]))
        # 上下左右四个方向搜索
        for _move_dir in self._move_dir_arr:
            _new_x = x + _move_dir[0]
            _new_y = y + _move_dir[1]
            # 如果超出地图边界了, 注意 x是纵坐标, y是横坐标
            if _new_x >= len(grid) or _new_x < 0 or \
                    _new_y >= len(grid[0]) or _new_y < 0:
                continue
            # 如果已经访问过了
            if tuple([_new_x, _new_y]) in self._visited_pos_set:
                continue
            if grid[_new_x][_new_y] != "1":
                continue
            self._dfs_islands(grid, _new_x, _new_y)
```


#### 经典N皇后问题

... pending_fin



## 动态规划

动态规划算法通常用于求解具有某种最优性质的问题。在这类问题中，可能会有许多可行解。每一个解都对应于一个值，我们希望找到具有最优值的解。动态规划算法与分治法类似，其基本思想也是将待求解问题分解成若干个子问题，先求解子问题，然后从这些子问题的解得到原问题的解。与分治法不同的是，适合于用动态规划求解的问题，经分解得到子问题往往不是互相独立的。若用分治法来解这类问题，则分解得到的子问题数目太多，有些子问题被重复计算了很多次。如果我们能够保存已解决的子问题的答案，而在需要时再找出已求得的答案，这样就可以避免大量的重复计算，节省时间。我们可以用一个表来记录所有已解的子问题的答案。不管该子问题以后是否被用到，只要它被计算过，就将其结果填入表中。这就是动态规划法的基本思路。

![](/img/algo_newbie/dynamic_programming/dp_1.png)

设计动态规划的三个步骤
1. 将问题分解成最优子问题；
2. 用递归的方式将问题表述成最优子问题的解；
3. 自底向上的将递归转化成迭代；（递归是自顶向下）;


### 递推公式讲解-经典题青蛙跳台阶

我们以一个经典的跳台阶题目来讲解从**普通递归(自上向下)**->**记忆化搜索(自上向下)**->**动态规划(自下向上)**的演进

题目:  
一只青蛙一次可以跳上1级台阶，也可以跳上2级。求该青蛙跳上一个n级的台阶总共有多少种跳法。

思路:  
首先如果只有1个台阶，那青蛙只有一种跳法；如果有两个台阶，青蛙有两种跳法：一个台阶一个台阶跳；一次跳两个台阶；如果有n（n > 2）个台阶，假设用函数f（n）表示总共跳的方法数，这时青蛙在第一次有两种选择：选择跳一个台阶，则剩下n-1个台阶故剩下的台阶有f（n-1）种跳法；选择跳两个台阶，则剩下n-2个台阶故剩下的台阶有f（n-2）种跳法。

故`f（n）= f（n-1） + f（n-2）`；n=1时`f（n） = 1`；n = 2时`f（n）= 2`；于是可以看到这个题目是明显的递归。

``` python
def jump_step(step_sum):
    if step_sum == 0:
        return 0
    if step_sum == 1:
        return 1
    if step_sum == 2:
        return 2
    return jump_step(step_sum-1) + jump_step(step_sum-2)
```

#### 跳台阶记忆化搜索优化解法

当step_sum很大的时候, 你会发现要执行很久, 是因为上述函数`jump_step`存在「大量重复计算」，比如f（8）被计算了两次，f（7）被重复计算了3次...所以这个递归算法低效的原因，就是存在大量的重复计算！

既然存在大量重复计算，那么我们可以先把计算好的答案存下来，即造一个备忘录，等到下次需要的话，先去「备忘录」查一下，如果有，就直接取就好了，备忘录没有才再计算，那就可以省去重新重复计算的耗时啦！这就是带备忘录的解法「记忆化搜索」!

``` python
def jump_step_optimized(step_sum, memo=None):
    if step_sum == 0:
        return 0
    if step_sum == 1:
        return 1
    if step_sum == 2:
        return 2
    if memo is None:
        memo = {}
    if step_sum in memo:  # 先判断有没计算过，即看看备忘录有没有
        # 备忘录有，即计算过，直接返回
        return memo[step_sum]
    # 备忘录没有，即没有计算过，执行递归计算,并且把结果保存到备忘录map中
    memo[step_sum] = \
        jump_step_optimized(step_sum-1, memo) + \
        jump_step_optimized(step_sum-2, memo)
    return memo[step_sum]
```


#### 跳台阶动规解法

既然我们也基本找出递推公式了, 其实我们也可以不走递归而直接走动规.
``` python
def jump_step_dynamic_programming(step_sum):
    dp = {}
    dp[0] = 0
    dp[1] = 1
    dp[2] = 2
    for i in xrange(3, step_sum+1):
        # 根据递推公式直接写出
        dp[i] = dp[i-1] + dp[i-2]
    return dp[step_sum]
```


#### 进阶跳台阶题目

一只青蛙一次可以跳1级台阶，一次也可以跳2级台阶.......它也可以一次跳上n级台阶，此时青蛙跳上一个n级台阶总共有多少种跳法。

思路：  
首先还是假设：如果只有1个台阶，青蛙只有一种跳法。如果有2个台阶，青蛙有两种跳法：一个台阶一个台阶跳；一次跳两个台阶。如果有n个台阶：青蛙第一次选择跳一个台阶，剩下n-1个台阶有f(n-1)种跳法；青蛙第一次选择跳两个台阶，剩下n-2个台阶有f(n-2)种跳法；青蛙第一次选择3个台阶，剩下n-3个台阶有f(n-3）种跳法.......，青蛙第一次选择跳n-1个台阶，剩下1个台阶剩下一种跳法；青蛙第一次选择跳n个台阶，没有剩下台阶结束。在面对n-1个台阶时，青蛙还是像n个台阶那样跳的话。

故：  
f(0) = 0；
f(1) = 1；
f(2) = 2；
f(n) = f(n-1) + f(n-2) +f(n-3) + .....+f(2) + f(1) + f(0)；（一式）
f(n-1) = f(n-2) + f(n-3) + .... +f(2) + f(1) + f(0)；（二式）
一式减去二式：f(n) = f(n-1) * 2；故又是明显的递归。代码略.


### 最优子结构讲解-整数拆分

这一小节, 我们开始讨论最优子结构: 通过求子问题的最优解, 可以获得原问题的最优解.

[leetcode343题](https://leetcode-cn.com/problems/integer-break/)  
给定一个正整数 n，将其拆分为至少两个正整数的和，并使这些整数的乘积最大化。 返回你可以获得的最大乘积。
说明: 你可以假设 n 不小于 2 且不大于 58。

示例 1:  
输入: 2
输出: 1
解释: 2 = 1 + 1, 1 × 1 = 1。

示例 2:
输入: 10
输出: 36
解释: 10 = 3 + 3 + 4, 3 × 3 × 4 = 36。

![](/img/algo_newbie/dynamic_programming/integer_break_1.png)

通过上图，我们很容易得到一个递归表达式：  
`F(n) = max {i * F(n - i)}，i = 1，2，... ，n - 1`
上述表达式是表明n - i需要继续分解的情况，但如果n - i比F(n - i)要大，显然就不用再继续分解了。故我们还需要比较i * (n - i)与i * F(n - i)的大小关系。所以完整的表达式应该为：  
`F(n) = max { i * F(n - i), i * (n - i)} , i = 1, 2, ... , n - 1`
基于此，就不难得到如下代码,  
**而通过以下代码中的 `integer_break_dp` 方法中的注释, 可以很清晰的看出怎么从普通递归一点一点演进到动态规划的思路的!**
思路分析参考:
* https://leetcode-cn.com/problems/integer-break/solution/bao-li-sou-suo-ji-yi-hua-sou-suo-dong-tai-gui-hua-/
* https://leetcode-cn.com/problems/integer-break/solution/ba-yi-ba-zhe-chong-ti-de-wai-tao-343-zheng-shu-cha/

``` python
class Solution_integer_break(object):

    def __init__(self):
        self._memo = {}

    # 将n进行分割(至少分割两部分), 可以获得的最大乘积
    def integerBreak(self, n):
        """
        :type n: int
        :rtype: int
        """
        if n == 1:
            return 1
        _res = -1
        if n in self._memo:
            return self._memo[n]
        for i in xrange(1, n):
            # 计算`i + (n-i)`
            _res = max(
                _res,
                i * (n-i),  # 有可能自己本身`i*(n-i)`就是最大的
                i * self.integerBreak(n-i))
        self._memo[n] = _res
        return _res
        
    def integer_break_dp(self, n):
        # dp[i] 表示将数字i分割(至少分割成两部分)后得到的最大乘积
        dp = [-1] * (n + 1)
        dp[1] = 1
        # 下面这种A思路是不行的:
        # dp[i]等价于 f(i)，
        # 那么上面针对 f(i) 写的递归公式对 dp[i] 也是适用的，我们拿来试试。
        # 关键语句:
        #  `res = max(res, i * (n - i), max(i * self.integerBreak(n - i)))`
        # 翻译过来就是：`dp[i] = max(_res, i * (n-i), i * dp[n-i])`
        # 则不难得出以下代码, 但因为 dp[n-i] 当前没求出来, 子问题没求出来,
        # 所以原问题也就求不出来了, 所以下面这三行代码是不行的
        # _res = -1
        # for i in xrange(1, n):
            # dp[i] = max(_res, i * (n-i), i * dp[n-i])
        
        # 此时我们得下面这种B思路才行:
        # 我们用一层循环来生成上面这段A思路代码一系列的 n 值。
        # 接着我们还要生成上面A思路代码中一系列的 i 值，
        # 注意到 n - i 是要大于 0 的，
        # 因此 i 只需要循环到 n - 1 即可。
        # 由此不难翻译A思路得出以下代码(j代表n, k代表i):
        for j in xrange(2, n+1):  # 循环到n
            # 求解dp[j]
            for k in xrange(1, j):  # 循环到j-1即可
                dp[j] = max(dp[j], k * (j-k), k * dp[j-k])
        return dp[n]
```


### 状态转移方程讲解-打家劫舍

[leetcode198题](https://leetcode-cn.com/problems/path-sum-iii/)  
你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

示例 1：
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。

示例 2：
输入：[2,7,9,3,1]
输出：12
解释：偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。
     偷窃到的最高金额 = 2 + 9 + 1 = 12 。

#### rob思路1

![](/img/algo_newbie/dynamic_programming/house_robber_1.png)

状态转移方程为: 
![](/img/algo_newbie/dynamic_programming/house_robber_2.png)

上图中v(0)即为第0个房子的价值, 
根据上图同理: `f(1) = max{ v(1)+f(3), v(2)+f(4), ... }`,
则得到下面代码:
``` python
class Solution_house_robber(object):

    def __init__(self):
        # memo[i] 表示考虑抢劫 nums[i...n-1] 所能获得的最大收益
        self._memo = {}

    def rob(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        if not nums:
            return 0
        return self._try_rob(nums, 0)

    def _try_rob(self, nums_arr, index):
        """
        先套用写一波自顶而下的递归形式的解答,
        然后用记忆化搜索的加个memo的方式优化一波.
        写完此方法之后, 有了大概的思路就能
        根据状态转移方程找出规律改写成自底向上的dp形式(见下方`_try_rob_dp`方法)
        此`_try_rob`方法表示: 考虑抢劫nums[index...nums.size()-1]这个范围的所有房子所能得到的最大收益
        """
        if index in self._memo:
            return self._memo[index]
        if index >= len(nums_arr):
            return 0
        res = 0
        for _i, _num in enumerate(nums_arr):
            if _i < index:
                continue
            res = max(
                res,
                _num + self._try_rob(nums_arr, _i+2),
            )
        self._memo[index] = res
        return res

    def rob_dp_1(self, nums_arr):
        if not nums_arr:
            return 0
        if len(nums_arr) == 1:
            return nums_arr[0]
        n = len(nums_arr)
        # dp[index] 表示 抢劫nums[index...nums.size()-1]这个范围的所有房子所能得到的最大收益
        dp = [0] * n
        # 因为我们想求出dp[0], 所以我们从后面开始, 即从n-1开始
        dp[n-1] = nums_arr[n-1]
        dp[n-2] = max(nums_arr[n-1], nums_arr[n-2])
        for i in xrange(n-3, -1, -1):
            for j in xrange(i, n):
                dp[i] = max(
                    dp[i],
                    (nums_arr[j] + (dp[j+2] if j + 2 < n else 0))
                )
        return dp[0]
```


#### rob思路2

参考: leetcode-cn.com/problems/house-robber/solution/da-jia-jie-she-by-leetcode-solution/

如果房屋数量大于两间，应该如何计算能够偷窃到的最高总金额呢？对于第 k~(k>2)k (k>2) 间房屋，有两个选项：
* 偷窃第 k 间房屋，那么就不能偷窃第 k-1 间房屋，偷窃总金额为前 k-2 间房屋的最高总金额与第 k 间房屋的金额之和。
* 不偷窃第 k 间房屋，偷窃总金额为前 k-1 间房屋的最高总金额。

在两个选项中选择偷窃总金额较大的选项，该选项对应的偷窃总金额即为前 k 间房屋能偷窃到的最高总金额。
用 dp[i] 表示前 i 间房屋能偷窃到的最高总金额，那么就有如下的状态转移方程：  
`dp[i] = max( dp[i−2] + nums[i], dp[i−1] )`
边界条件为：
* `dp[0] = nums[0]` , 只有一间房屋，则偷窃该房屋 
* `dp[1] = max( nums[0], nums[1] )` ,  只有两间房屋，选择其中金额较高的房屋进行偷窃

最终的答案即为 `dp[n−1]`，其中 n 是数组的长度

``` python
def rob_dp_2(self, nums_arr):
    if not nums_arr:
        return 0
    n = len(nums_arr)
    dp = [0] * n
    dp[0] = nums_arr[0]
    dp[1] = max(nums_arr[0], nums_arr[1])
    for i in xrange(2, n):
        dp[i] = max(dp[i-1], nums_arr[i]+dp[i-2])
    return dp[n-1]
```


#### rob总结

可以看到不同思路的可以得出不同的状态的定义, 则得到不同的状态转移方程, 则得到不同的代码的解法.  
动态规划的的四个解题步骤是：
1. 定义子问题
2. 写出子问题的递推关系
3. 确定 DP 数组的计算顺序
4. 空间优化（可选）

那第一步定义的不同, 则代码不同, 但都可以是正确的解法.
**所以动态规划的关键就是, 找到一个合适的子问题的状态的表示!**


### 0-1背包问题

**「0-1 背包」问题是一类非常重要的动态规划问题**

问题:  
有一个背包, 它的容量为C, 现在有n种不同的物品, 编号为0...n-1, 其中每一件物品的重量为w(i), 价值为v(i). 问可以向这个背包中盛放哪些物品, 使得再不超过背包容量的基础上, 物品的总价值最大.

因为约束变量为n和c, 我们可以定义`f(i, c)`为盛放第i个物品时能得到的最大价值. 有两个选项:
* 往背包里放第i个物品: `v(i) + f( i-1, c-w(i) )`
* 不往背包里放第i个物品: `f(i-1, c)`

则我们可以得出, 状态转移方程为: `f(i, c) = max( v(i)+f(i-1, c-w(i)) , f(i-1, c) )`

我们先写一版普通递归的代码:
``` python
class Solution_knapsack(object):
    
    def __init__(self):
        self._memo = None

    def knapsack(self, capacity, weight_arr, value_arr):
        if capacity == 0:
            return 0
        self._memo = [ [ -1 for j in xrange(capacity)] for i in xrange(len(weight_arr)) ]
        return self._best_value(capacity, weight_arr, value_arr, 0)

    # 用 [0...index]的物品,填充容积为c的背包的最大价值
    def _best_value(self, capacity, weight_arr, value_arr, index):
        if index >= len(weight_arr) or capacity <= 0:
            return 0
        if self._memo[index][capacity-1] != -1:
            return self._memo[capacity][index]
        _res = self._best_value(capacity, weight_arr, value_arr, index + 1)
        if capacity >= weight_arr[index]:
            _res = max(
                _res,
                value_arr[index] + self._best_value(
                    capacity-weight_arr[index], weight_arr, value_arr, index+1)
            )
        self._memo[index][capacity-1] = _res
        return _res
```

![](/img/algo_newbie/dynamic_programming/knapsack_1.png "dp数组如图")

根据状态转移方程得出以下动规代码, 而dp数组中的内容如上图.
``` python
    def knapsack_dp(self, capacity, weight_arr, value_arr):
        if capacity == 0:
            return 0
        assert(len(weight_arr) == len(value_arr))
        n = len(weight_arr)
        dp = [ [ 0 for _ in xrange(capacity+1)] for _ in xrange(n)]
        # 动规是从底向上嘛, 先构建dp[0]的东西
        for k in xrange(capacity+1):
            dp[0][k] = value_arr[0] if k >= weight_arr[0] else 0

        for i in xrange(1, n):
            for c in xrange(capacity+1):
                # 根据状态转移方程得出
                dp[i][c] = max(
                    dp[i-1][c],
                    value_arr[i] + dp[i-1][c-weight_arr[i]] if c >= weight_arr[i] else 0
                )
        return dp[n-1][capacity]
```


#### 分割等和子集

[leetcode416题](https://leetcode-cn.com/problems/partition-equal-subset-sum)  
给定一个只包含正整数的非空数组。是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。

示例 1:
输入: [1, 5, 11, 5]
输出: true
解释: 数组可以分割成 [1, 5, 5] 和 [11].
 
示例 2:
输入: [1, 2, 3, 5]
输出: false
解释: 数组不能分割成两个元素和相等的子集.

参考: https://leetcode-cn.com/problems/partition-equal-subset-sum/solution/0-1-bei-bao-wen-ti-xiang-jie-zhen-dui-ben-ti-de-yo/

这其实是一个背包问题, 我们只要拿一定的数字填满所有数字和sum的一半, 剩余的数字一定等于sum/2, 则这个问题其实还是个背包问题, 只不过我们需要用一定的数字把这个背包填满, 对于第i个物品, 有两种情况:
* 我们用i-1就填满了背包, 则第i个就不需要用了
* 我们用了第i个才填满

状态与状态转移方程:
* 状态定义：dp[i][j]表示从数组的 [0, i] 这个子区间内挑选一些正整数，每个数只能用一次，使得这些数的和恰好等于 j。
* 状态转移方程：很多时候，状态转移方程思考的角度是「分类讨论」，对于「0-1 背包问题」而言就是「当前考虑到的数字选与不选」。
    * 不选择 nums[i]，如果在 [0, i - 1] 这个子区间内已经有一部分元素，使得它们的和为 j ，那么 dp[i][j] = true；
    * 选择 nums[i]，如果在 [0, i - 1] 这个子区间内就得找到一部分元素，使得它们的和为 j - nums[i]。

则状态转移方程：  
`dp[i][j] = dp[i - 1][j] or dp[i - 1][j - nums[i]]`
一般写出状态转移方程以后，就需要考虑初始化条件。
* j - nums[i] 作为数组的下标，一定得保证大于等于 0 ，因此 nums[i] <= j；
* 注意到一种非常特殊的情况：j 恰好等于 nums[i]，即单独 nums[j] 这个数恰好等于此时「背包的容积」 j，这也是符合题意的
* 初始化：dp[0][0] = false，因为候选数 nums[0] 是正整数，凑不出和为 0；
* 输出：dp[len - 1][target]，这里 len 表示数组的长度，target 是数组的元素之和（必须是偶数）的一半。


则代码如下:
``` python
class Solution_partition_equal_subset_sum(object):

    def __init__(self):
        self._memo = None

    def canPartition(self, nums):
        """
        :type nums: List[int]
        :rtype: bool
        动规解法
        """
        if not nums or len(nums) < 2 or sum(nums) % 2 != 0:
            return False
        _bag_capcity = sum(nums) / 2
        n = len(nums)
        # 创建二维状态数组，行：物品索引，列：容量（包括 0）
        dp = [ [False for _ in xrange(_bag_capcity+1)] for _ in xrange(n) ]
        # 先填表格第 0 行，第 1 个数只能让容积为它自己的背包恰好装满
        dp[0][nums[0]] = True
        for i in xrange(1, n):
            for c in xrange(_bag_capcity+1):
                dp[i][c] = dp[i-1][c] or (dp[i-1][c-nums[i]] if c >= nums[i] else False)
        return dp[n-1][_bag_capcity]

    def canPartition_recursion(self, nums):
        if not nums or len(nums) < 2 or sum(nums) % 2 != 0:
            return False
        _sum_num = sum(nums) / 2
        self._memo = [ [ None for _ in xrange(_sum_num+1) ] for _ in xrange(len(nums)) ]
        return self._try_partition(nums, 0, _sum_num)

    def _try_partition(self, nums, index, sum_num):
        if index >= len(nums) or sum_num < 0:
            return False
        if self._memo[index][sum_num] is not None:
            return self._memo[index][sum_num]
        if sum_num == 0:
            return True
        _res = self._try_partition(nums, index+1, sum_num) or \
            self._try_partition(nums, index+1, sum_num-nums[index])
        self._memo[index][sum_num] = _res
        return _res
```


### LIS问题-最长上升子序列

[leetcode300题](https://leetcode-cn.com/problems/longest-increasing-subsequence/)

LIS即longest-increasing-subsequence  
给定一个无序的整数数组，找到其中最长上升子序列的长度。

示例:
输入: [10,9,2,5,3,7,101,18]
输出: 4 
解释: 最长的上升子序列是 [2,3,7,101]，它的长度是 4。

说明:  
可能会有多种最长上升子序列的组合，你只需要输出对应的长度即可。
你算法的时间复杂度应该为 O(n2) 。

进阶: 你能将算法的时间复杂度降低到 O(n log n) 吗?

参考: https://leetcode-cn.com/problems/longest-increasing-subsequence/solution/zui-chang-shang-sheng-zi-xu-lie-by-leetcode-soluti/

我们定义 `dp[i]` 为选取到第i个数字的时候的最长上升子序列的长度, **注意这里的定义, 第i个数字是一定要选取的**
则我们的状态转移方程为: `dp[i] = max(dp[j]) + 1 , 其中 0 <= j < i 且 nums[j] < nums[i]`

即考虑往 dp[0…i−1] 中最长的上升子序列后面再加一个 nums[i]。由于 dp[j]dp[j] 代表 nums[0…j] 中以 nums[j] 结尾的最长上升子序列，所以如果能从 dp[j]dp[j] 这个状态转移过来，那么 nums[i] 必然要大于 nums[j]，才能将 nums[i] 放在 nums[j] 后面以形成更长的上升子序列。

最后，整个数组的最长上升子序列即所有 dp[i]dp[i] 中的最大值。

LIS =max(dp[i]), 其中 0 ≤ i < n

下图显示了该方法：
![](/img/algo_newbie/dynamic_programming/lis_1.png "一个例子")
![](/img/algo_newbie/dynamic_programming/lis_2.png "另一个例子")

翻译成代码就是:
``` python
class Solution_LIS(object):
    def lengthOfLIS(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        if not nums:
            return 0
        n = len(nums)
        # 我们定义 `dp[i]` 为选取到第i个数字的时候的最长上升子序列的长度,
        # 注意这里的定义, 第i个数字是一定要选取的.
        dp = [1] * n  # 因为自己本身就是一个长度为1的上升子序列
        dp[0] = 1
        for i in xrange(1, n):
            for j in xrange(0, i):
                # 则我们的状态转移方程为: 
                # `dp[i] = max(dp[j]) + 1 , 其中 9 <= j < i 且 nums[j] < nums[i]`
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)
```


### LCS问题-最长公共子序列问题

LCS即Longest-Common-Sequence  

给出两个字符串S1和S2, 求这两个字符串最长公共子序列的长度.  
比如: 
* S1 = ABCD
* S2 = AEBD

则最长公共子序列为ABD, 其长度为3

![](/img/algo_newbie/dynamic_programming/lcs_1.png "LCS状态转移方程")
![](/img/algo_newbie/dynamic_programming/lcs_2.png "LCS递归树")

则代码如下:
``` python
class Solution_LCS(object):
    def lengthOfLCS(self, str_arr):
        if not str_arr:
            return 0
        assert len(str_arr) == 2
        str_a = str_arr[0]
        str_b = str_arr[1]
        m = len(str_a)
        n = len(str_b)
        if m < 1 or n < 1:
            return 0
        # 我们定义dp[i][j] 为 str_a[0...i] 和str_b[0...j]的最长子序列的长度
        dp = [ [ 0 for _ in xrange(n) ] for _ in xrange(m) ]
        # 初始化最底层的基础数据
        for k in xrange(n):
            dp[0][k] = 1 if str_a[0] == str_b[k] else 0
        for h in xrange(m):
            dp[h][0] = 1 if str_a[h] == str_b[0] else 0

        for i in xrange(1, m):
            for j in xrange(n):
                # 根据图中的状态转移方程得出, 有两种情况, 所以if一下
                if str_a[i] == str_b[j]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1] if j-1 >= 0 else 0)
        return dp[m-1][n-1]
```


### 求LCS具体的是哪个子序列

* **思路1**: 还是用动规来解
    ``` python
    def get_lcs_detail_seq_1(self, str_arr):
        if not str_arr:
            return ""
        assert len(str_arr) == 2
        str_a = str_arr[0]
        str_b = str_arr[1]
        m = len(str_a)
        n = len(str_b)
        if m < 1 or n < 1:
            return ""
        # 我们定义dp[i][j] 为 str_a[0...i] 和str_b[0...j]的最长子序列
        dp = [ [ "" for _ in xrange(n) ] for _ in xrange(m) ]
        # 初始化最底层的基础数据
        for k in xrange(n):
            if str_a[0] == str_b[k]:
                for h in xrange(k, n):  # k后面的也都要置为1
                    dp[0][h] = str_a[0]
        for k in xrange(m):
            if str_a[k] == str_b[0]:
                for h in xrange(k, m):  # k后面的也都要置为1
                    dp[h][0] = str_b[0]

        for i in xrange(1, m):
            for j in xrange(1, n):
                # 根据图中的状态转移方程得出, 有两种情况, 所以if一下
                if str_a[i] == str_b[j]:
                    dp[i][j] = dp[i-1][j-1] + str_a[i]
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        return dp[m-1][n-1]
    ```

* **思路2**:  
    不管是LCS/LIS/0-1背包问题如果要求最优解的具体情况是哪种, 我们的思路就是要用dp解法求出整个dp数组之后, 然后根据dp的状态定义, 以及dp数组里具体存储了的信息反推回去.  

    ![](/img/algo_newbie/dynamic_programming/lcs_3.png "LCS问题的dp数组图")
    从之前求lcs的代码以及上图中都可以看出, 从dp数组的末尾后面反推回去, 上一个公共字符所在的i和j肯定在当前i和j的左上.
    则对于LCS的具体解, 代码如下:
    ``` python
    def get_lcs_detail_seq_2(self, str_arr):
        if not str_arr:
            return ""
        assert len(str_arr) == 2
        str_a = str_arr[0]
        str_b = str_arr[1]
        m = len(str_a)
        n = len(str_b)
        if m < 1 or n < 1:
            return ""
        # 我们定义dp[i][j] 为 str_a[0...i] 和str_b[0...j]的最长子序列的长度
        dp = [ [ 0 for _ in xrange(n) ] for _ in xrange(m) ]
        # 初始化最底层的基础数据
        for k in xrange(n):
            if str_a[0] == str_b[k]:
                for h in xrange(k, n):  # k后面的也都要置为1
                    dp[0][h] = 1
        for k in xrange(m):
            if str_a[k] == str_b[0]:
                for h in xrange(k, m):  # k后面的也都要置为1
                    dp[h][0] = 1

        for i in xrange(1, m):
            for j in xrange(1, n):
                # 根据图中的状态转移方程得出, 有两种情况, 所以if一下
                if str_a[i] == str_b[j]:
                    dp[i][j] = dp[i-1][j-1] + 1
                else:
                    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
        # 不管是LCS/LIS/0-1背包问题如果要求最优解的具体情况是哪种, 
        # 我们的思路就是要用dp解法求出整个dp数组之后,
        # 然后根据dp的状态定义, 以及dp数组里具体存储了的信息反推回去.  
        #
        # 从之前求lcs的代码以及上图中都可以看出,
        # 从dp数组的末尾后面反推回去,
        # 上一个公共字符所在的i和j肯定在当前i和j的左上.
        p = len(str_a) - 1;
        q = len(str_b) - 1;
        _lcs_detail_seq = "";
        while(p >= 0 and q >= 0):
            if( str_a[p] == str_b[q] ):
                _lcs_detail_seq = str_a[p] + _lcs_detail_seq;
                p -= 1;
                q -= 1;
            elif(p == 0):
                q -= 1;
            elif(q == 0):
                p -= 1;
            else:
                if(dp[p-1][q] > dp[p][q-1]):
                    # 由dp数组图中可知, 
                    # 谁大, 那index就往谁那边的左边移动,
                    # 这样才能才能找到最大公共子串的上一个公共字符嘛
                    p -= 1;
                else:
                    q -= 1;

        return _lcs_detail_seq;
    ```