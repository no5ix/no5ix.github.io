# encoding=utf-8

import random
import copy


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
    

def merge_sort_optimized(arr, left_index, right_index):
    # 当 `merge_sort()` 递归到left_index等于right_index的时候, 
    # 说明left_index, right_index已经相邻了,
    # 说明已经分解到底了, 左右都只剩下一个元素了, 所以此时应该return然后执行 `_merge()` 了
    if not arr or left_index >= right_index:
        return

    # 优化1:
    #   数据量较小则使用插入排序
    if (right_index - left_index) < 15:
        insert_sort_optimized(arr, left_index, right_index)
        return

    # 注意这里不能直接 `mid_index=(left_index+right_index)/2`,
    # 防止当left_index和right_index很大的时候他们之和溢出
    mid_index = left_index + (right_index - left_index) / 2
    merge_sort(arr, left_index, mid_index)
    merge_sort(arr, mid_index+1, right_index)

    # 优化2: 
    #   因为此时arr[mid_index]左边的数组里最大的, 而arr[mid_index+1]是右边最小的,
    #   如果arr[mid_index] <= arr[mid_index+1]则说明这一轮递归的arr的left到right已经是从小到大有序的了
    #   所以只在对于arr[mid_index] > arr[mid_index+1]的情况,进行merge, 
    #   对于近乎有序的数组非常有效,但是对于一般情况,有一定的性能损失(因为多了这行代码判断大小)
    if arr[mid_index] > arr[mid_index+1]:
        _merge(arr, left_index, mid_index, right_index)


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
        

def merge_sort_bottom_up_optimized(arr, left_index, right_index):
    if not arr or left_index >= right_index:
        return

    # 优化1:
    #   先以size为16为一组数据来逐个对每组插入排序一遍
    size = 16
    cur_left_index = left_index
    while cur_left_index < right_index:
        possible_right_index = cur_left_index + 2*size -1
         # possible_right_index有可能已经大于right_index了, 所以要min一下
        cur_right_index = min(possible_right_index, right_index)
        insert_sort(arr, cur_left_index, cur_right_index)
        cur_left_index += size  # 右移到下一个size大小开头位置
    
    arr_len = right_index - left_index + 1
    # size = 1
    
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
            # 优化2: 
            #   因为此时arr[mid_index]左边的数组里最大的, 而arr[mid_index+1]是右边最小的,
            #   如果arr[mid_index] <= arr[mid_index+1]则说明这一轮递归的arr的left到right已经是从小到大有序的了
            #   所以只在对于arr[mid_index] > arr[mid_index+1]的情况,进行merge, 
            #   对于近乎有序的数组非常有效,但是对于一般情况,有一定的性能损失(因为多了这行代码判断大小)
            if arr[cur_mid_index] > arr[cur_mid_index+1]:
                _merge(arr, cur_left_index, cur_mid_index, cur_right_index)
            cur_left_index += size * 2  # 每次归并完一组数据就i移动size的两倍
        # print "size: %d" % size
        # print arr
        size *= 2  # size从1开始每次增加两倍
        

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


def _partition_optimized(arr, left_index, right_index):
    # 选一个元素作为枢轴量,
    # 为了模拟上面这个动画演示, 这里我们选取最左边的元素
    pivot_index = left_index

    # 优化1:
    #   随机选一个元素和最左边的交换,
    #   配合下方的`pivot = arr[left_index]`就达到了随机选一个元素当pivot的效果
    rand_index = random.randint(left_index, right_index)
    arr[pivot_index], arr[rand_index] = arr[rand_index], arr[pivot_index]

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
    # 优化2:
    #   小数组用插排
    if (right_index - left_index) <= 15:
        insert_sort(arr, left_index, right_index)
        return
    partition_index = _partition(arr, left_index, right_index)
    # 把partition_index左边的数据再递归快排一遍
    quick_sort(arr, left_index, partition_index-1)
    quick_sort(arr, partition_index+1, right_index)
    

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


# 对 迭代版, pending_heapify_index 元素执行堆化
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


def _build_max_heap(arr, left_index, right_index):
    # 建堆, 从最后一个非叶结点开始, 自底向上堆化就建好了一个最大堆
    root_index = left_index
    arr_len = right_index - left_index + 1
    last_none_leaf_index = root_index + (arr_len/2 - 1)

    i = last_none_leaf_index
    while i >= root_index:
        _max_heapify_recursive(arr, i, left_index, right_index)
        i -= 1


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


class BinaryTreeNode(object):
    
    def __init__(self, val):
        self.left = None
        self.right = None
        self.val = val


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


def binary_tree_swap_recursive(root):
    if not root:
        return
    root.left, root.right = root.right, root.left
    binary_tree_swap_recursive(root.left)
    binary_tree_swap_recursive(root.right)


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


class LinkList(object):

    def __init__(self, val):
        self.next = None
        self.val = val


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


def jump_step(step_sum):
    if step_sum == 0:
        return 0
    if step_sum == 1:
        return 1
    if step_sum == 2:
        return 2
    return jump_step(step_sum-1) + jump_step(step_sum-2)


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


def jump_step_dynamic_programming(step_sum):
    dp = {}
    dp[0] = 0
    dp[1] = 1
    dp[2] = 2
    for i in xrange(3, step_sum+1):
        # 根据递推公式直接写出
        dp[i] = dp[i-1] + dp[i-2]
    return dp[step_sum]


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


def combinations_optimized(n, k):
    result_arr = []
    if k <= 0 or k > n or n <= 0:
        return result_arr
    middle_state_container = []
    _generate_combinations(result_arr, n, k, 1, middle_state_container)
    return result_arr

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
    # # 每次递归从start_index开始直到 pending_proc_n
    # for _index in xrange(start_index, pending_proc_n+1):
    # 剪枝的思想, 
    # 还有k - middle_state_container.size()个空位,
    # 所以, [i...n] 中至少要有 k - middle_state_container.size() 个元素
    # i最多为 n - (k - middle_state_container.size()) + 1
    _cur_stop_index = pending_proc_n - (
        pending_prco_k - middle_state_container.size()) + 1
    # 每次递归从start_index开始直到 _cur_stop_index
    for _index in xrange(start_index, _cur_stop_index+1):
        middle_state_container.append(_index)
        _generate_combinations(
            result_arr, pending_proc_n, pending_prco_k,
            _index+1, middle_state_container)
        middle_state_container.pop(-1)


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
        #  `res = max(res, i * (n - i), max(i * self.integerBreak(n - i)))``
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
            return self._memo[index][capacity-1]
        _res = self._best_value(capacity, weight_arr, value_arr, index + 1)
        if capacity >= weight_arr[index]:
            _res = max(
                _res,
                value_arr[index] + self._best_value(
                    capacity-weight_arr[index], weight_arr, value_arr, index+1)
            )
        self._memo[index][capacity-1] = _res
        return _res

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
        if nums[0] <= _bag_capcity:
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
        return dp[m-1][n-1]

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
        # 上一个公共字符所在的横纵index肯定在当前横纵index的左上.
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
                # 由dp数组图中可知, 
                # 上一个公共字符所在的横纵index肯定在当前横纵index的左上.
                if(dp[p-1][q] > dp[p][q-1]):
                    # dp[p-1][q] 大, 则往左移动, p减一
                    # 这样才能才能找到最大公共子串的上一个公共字符嘛
                    p -= 1;
                else:
                    # dp[p][q-1] 大, 则往上移动, q减一
                    # 这样才能才能找到最大公共子串的上一个公共字符嘛
                    q -= 1;
        return _lcs_detail_seq;



if __name__ == "__main__":
        
    sort_algo_func_list = [
        insert_sort,
        merge_sort, merge_sort_bottom_up, merge_sort_bottom_up_optimized, 
        quick_sort, quick_sort_optimized, quick_sort_3_ways,
        heap_sort,
    ]
    test_sort_arr_list = [
        [4, 3, 5, 1, 88, 0, -7, 2, 66, -58],
        [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 3, 5, 1, 88, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, -7, 2, 66, -58],
        [4, 3, 5, 1, 88, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, -7, 2, 66, -58],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, -7, 2, 66, -58, 4, 3, 5, 1, 88],
        [0, -7, 2, 66, -58, 4, 3, 5, 1, 884, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [-3, -7, 1, 2, 3, 4, 5, 6, 7, 8, 21, 42, 87, 99, 66, 32, 91, 19, 28],
        [8, 7, 6, 5, 4, 3, 2, 1, 0, -1, 21, 42, 87, 99, 66, 32, 91, 19, 28],
    ]
    for _sort_algo in sort_algo_func_list:
        print _sort_algo.__name__
        is_test_pass = True
        for _test_arr in test_sort_arr_list:
            _copy_test_arr = copy.deepcopy(_test_arr)
            _sort_algo(_copy_test_arr, 0, len(_copy_test_arr)-1)
            # print _copy_test_arr
            pre_elem = _copy_test_arr[0]
            for _elem in _copy_test_arr:
                if _elem < pre_elem:
                    print  "is not ordered: " + str(_test_arr)
                    is_test_pass = False
                    break
        print "-------------test " + \
            ("pass" if is_test_pass else "not pass") + \
            "---------------"

    print "\n"

    _bt_a = BinaryTreeNode('a')
    _bt_b = BinaryTreeNode('b')
    _bt_c = BinaryTreeNode('c')
    _bt_d = BinaryTreeNode('d')
    _bt_e = BinaryTreeNode('e')
    _bt_f = BinaryTreeNode('f')
    _bt_g = BinaryTreeNode('g')
    _bt_a.left = _bt_b
    _bt_b.left = _bt_c
    _bt_b.right = _bt_d
    _bt_d.left = _bt_e
    _bt_d.right = _bt_f
    _bt_e.right = _bt_g

    bt_traversal_func_list = {
        binary_tree_preorder_traversal: ['a', 'b', 'c', 'd', 'e', 'g', 'f'],
        binary_tree_inorder_traversal: ['c', 'b', 'e', 'g', 'd', 'f', 'a'],
        binary_tree_postorder_traversal: ['c', 'g', 'e', 'f', 'd', 'b', 'a'],
        binary_tree_levelorder_traversal: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    }
    for _bt_traversal_func, _pass_result_arr in bt_traversal_func_list.iteritems():
        print _bt_traversal_func.__name__
        print "------------test " + \
            ("pass" if _bt_traversal_func(_bt_a) == _pass_result_arr else "not pass") + \
            "---------------"

    print ""

    _copy_bt_a = copy.deepcopy(_bt_a)
    binary_tree_swap_recursive(_copy_bt_a)
    print "after binary_tree_swap_recursive, levelorder traversal:"
    print binary_tree_levelorder_traversal(_copy_bt_a)

    _copy_bt_a = copy.deepcopy(_bt_a)
    binary_tree_swap_iterative(_copy_bt_a)
    print "after binary_tree_swap_iterative, levelorder traversal:"
    print binary_tree_levelorder_traversal(_copy_bt_a)

    print "\n"
    
    _ll_a = LinkList('a')
    _ll_b = LinkList('b')
    _ll_c = LinkList('c')
    _ll_d = LinkList('d')
    _ll_e = LinkList('e')
    _ll_a.next = _ll_b
    _ll_a.next.next = _ll_c
    _ll_a.next.next.next = _ll_d
    _ll_a.next.next.next.next = _ll_e

    print "after linklist_reverse: --------------"
    new_head = linklist_reverse(_ll_a)
    i = new_head
    while i:
        print i.val, "->",
        i = i.next

    print "\n"

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
    print "test_sparse_graph graph dfs: --------------"
    print test_sparse_graph.graph_dfs()
    print "test_sparse_graph graph bfs: --------------"
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
    print "test_dense_graph graph dfs: --------------"
    print test_dense_graph.graph_dfs()
    print "test_dense_graph graph bfs: --------------"
    print test_dense_graph.graph_bfs()

    print "\n"

    bt_5 = BinaryTreeNode(5)
    bt_4a = BinaryTreeNode(4)
    bt_8 = BinaryTreeNode(8)
    bt_11 = BinaryTreeNode(11)
    bt_13 = BinaryTreeNode(13)
    bt_4b = BinaryTreeNode(4)
    bt_7 = BinaryTreeNode(7)
    bt_2 = BinaryTreeNode(2)
    bt_1 = BinaryTreeNode(1)

    bt_5.left = bt_4a
    bt_5.right = bt_8
    bt_4a.left = bt_11
    bt_11.left = bt_7
    bt_11.right = bt_2
    bt_8.left = bt_13
    bt_8.right = bt_4b
    bt_13.right = bt_1

    print "path_sum: --------------"
    print "5: " + str(has_path_sum(bt_5, sum_num=5))
    print "0: " + str(has_path_sum(bt_5, sum_num=0))
    print "22: " + str(has_path_sum(bt_5, sum_num=22))
    print "13: " + str(has_path_sum(bt_5, sum_num=13))
    print "17: " + str(has_path_sum(bt_5, sum_num=17))
    print "27: " + str(has_path_sum(bt_5, sum_num=27))
    print "20: " + str(has_path_sum(bt_5, sum_num=20))

    print ""

    print "binary_tree_paths: --------------"
    print binary_tree_paths(bt_5)

    print ""

    print "path_sum_3: --------------"
    print "5: " + str(path_sum_3(bt_5, sum_num=5))
    print "0: " + str(path_sum_3(bt_5, sum_num=0))
    print "22: " + str(path_sum_3(bt_5, sum_num=22))
    print "13: " + str(path_sum_3(bt_5, sum_num=13))
    print "17: " + str(path_sum_3(bt_5, sum_num=17))
    print "27: " + str(path_sum_3(bt_5, sum_num=27))
    print "20: " + str(path_sum_3(bt_5, sum_num=20))

    print ""

    print "jump_step: --------------"
    print "jump_step_optimized(4): " + str(jump_step_optimized(4))
    print "jump_step_optimized(55): " + str(jump_step_optimized(55))
    print "jump_step_optimized(9): " + str(jump_step_optimized(9))
    print "jump_step(4): " + str(jump_step(4))
    print "jump_step(9): " + str(jump_step(9))
    print "jump_step_dynamic_programming(4): " + str(jump_step_dynamic_programming(4))
    print "jump_step_dynamic_programming(9): " + str(jump_step_dynamic_programming(9))
    print "jump_step_dynamic_programming(55): " + str(jump_step_dynamic_programming(55))

    print ""

    print "letter_combinations_of_a_phone_number: --------------"
    print "letter_combinations_of_a_phone_number('23'):"
    print str(letter_combinations_of_a_phone_number("23"))
    print "letter_combinations_of_a_phone_number('46'):"
    print str(letter_combinations_of_a_phone_number("46"))
    # print "letter_combinations_of_a_phone_number('146'):"
    # print str(letter_combinations_of_a_phone_number("146"))
    # print "letter_combinations_of_a_phone_number('416'):"
    # print str(letter_combinations_of_a_phone_number("416"))
    print "letter_combinations_of_a_phone_number('234'):"
    print str(letter_combinations_of_a_phone_number("234"))

    print ""

    print "permutations: --------------"
    print "permutations([1]):"
    print str(Solution_permutations().permute([1]))
    print "permutations([2, 3]):"
    print str(Solution_permutations().permute([2, 3]))
    print "permutations([1, 4, 6]):"
    print str(Solution_permutations().permute([1, 4, 6]))

    print ""

    print "combinations: --------------"
    print "combinations(2, 1):"
    print str(combinations(2, 1))
    print "combinations(4, 2):"
    print str(combinations(4, 2))
    print "combinations_optimized(2, 1):"
    print str(combinations_optimized(2, 1))
    print "combinations_optimized(4, 2):"
    print str(combinations_optimized(4, 2))

    print ""

    print "Solution_number_of_islands: --------------"
    print """
        grid = [
            ["1","1","1","1","0"],
            ["1","1","0","1","0"],
            ["1","1","0","0","0"],
            ["0","0","0","0","0"]
        ] 
    """
    test_grid = [
            ["1","1","1","1","0"],
            ["1","1","0","1","0"],
            ["1","1","0","0","0"],
            ["0","0","0","0","0"]
        ]
    snoi1 = Solution_number_of_islands()
    print " Solution_number_of_islands.numIslands(grid):" + str(snoi1.numIslands(test_grid))
    print """ 
        grid =  [
            ["1","1","0","0","0"],
            ["1","1","0","0","0"],
            ["0","0","1","0","0"],
            ["0","0","0","1","1"]
        ]
    """
    test_grid = [
            ["1","1","0","0","0"],
            ["1","1","0","0","0"],
            ["0","0","1","0","0"],
            ["0","0","0","1","1"]
        ]
    snoi2 = Solution_number_of_islands()
    print " Solution_number_of_islands.numIslands(grid):" + str(snoi2.numIslands(test_grid))

    print ""

    print "integer_break: --------------"
    print "integer_break(2):"
    print str(Solution_integer_break().integerBreak(2))
    print "integer_break(10):"
    print str(Solution_integer_break().integerBreak(10))
    print "integer_break_dp(10):"
    print str(Solution_integer_break().integer_break_dp(10))

    print ""

    print "house_robber: --------------"
    print "house_robber([6,6,4,8,4,3,3,10]):"
    print str(Solution_house_robber().rob([6,6,4,8,4,3,3,10]))
    print "house_robber([183,2219,57,193,94,233,202,154,65,240,97]):"
    print str(Solution_house_robber().rob([183,2219,57,193,94,233,202,154,65,240,97]))
    print "house_robber([1, 2, 3, 1]):"
    print str(Solution_house_robber().rob([1, 2, 3, 1]))
    print "house_robber([2, 7, 9, 3, 1]):"
    print str(Solution_house_robber().rob([2, 7, 9, 3, 1]))
    print "house_robber_dp_1([6,6,4,8,4,3,3,10]):"
    print str(Solution_house_robber().rob_dp_1([6,6,4,8,4,3,3,10]))
    print "house_robber_dp_1([1, 2, 3, 1]):"
    print str(Solution_house_robber().rob_dp_1([1, 2, 3, 1]))
    print "house_robber_dp_1([2, 7, 9, 3, 1]):"
    print str(Solution_house_robber().rob_dp_1([2, 7, 9, 3, 1]))
    print "house_robber_dp_1([183,2219,57,193,94,233,202,154,65,240,97]):"
    print str(Solution_house_robber().rob_dp_1([183,2219,57,193,94,233,202,154,65,240,97]))
    print "house_robber_dp_2([6,6,4,8,4,3,3,10]):"
    print str(Solution_house_robber().rob_dp_2([6,6,4,8,4,3,3,10]))
    print "house_robber_dp_2([1, 2, 3, 1]):"
    print str(Solution_house_robber().rob_dp_2([1, 2, 3, 1]))
    print "house_robber_dp_2([2, 7, 9, 3, 1]):"
    print str(Solution_house_robber().rob_dp_2([2, 7, 9, 3, 1]))
    print "house_robber_dp_2([183,2219,57,193,94,233,202,154,65,240,97]):"
    print str(Solution_house_robber().rob_dp_2([183,2219,57,193,94,233,202,154,65,240,97]))

    print ""

    print "knapsack: --------------"
    print "knapsack(8, [7, 2, 4, 3], [9, 3, 2, 1]):"
    print Solution_knapsack().knapsack(8, [7, 2, 4, 3], [9, 3, 2, 1])
    print "knapsack(5, [1, 2, 3], [6, 10, 12]):"
    print Solution_knapsack().knapsack(5, [1, 2, 3], [6, 10, 12])
    print "knapsack_dp(8, [7, 2, 4, 3], [9, 3, 2, 1]):"
    print Solution_knapsack().knapsack_dp(8, [7, 2, 4, 3], [9, 3, 2, 1])
    print "knapsack_dp(5, [1, 2, 3], [6, 10, 12]):"
    print Solution_knapsack().knapsack_dp(5, [1, 2, 3], [6, 10, 12])

    print ""

    print "partition_equal_subset_sum: --------------"
    print "canPartition([9, 5]):"
    print Solution_partition_equal_subset_sum().canPartition([9, 5])
    print "canPartition([1, 2, 3, 6]):"
    print Solution_partition_equal_subset_sum().canPartition([1, 2, 3, 6])
    print "canPartition([1, 27, 35, 61]):"
    print Solution_partition_equal_subset_sum().canPartition([1, 27, 35, 61])
    print "canPartition([1, 8, 3, 6]):"
    print Solution_partition_equal_subset_sum().canPartition([1, 8, 3, 6])
    print "canPartition([1, 21, 3, 4, 7, 161]):"
    print Solution_partition_equal_subset_sum().canPartition([1, 21, 3, 4, 7, 161])
    print "canPartition_recursion([9, 5]):"
    print Solution_partition_equal_subset_sum().canPartition_recursion([9, 5])
    print "canPartition_recursion([1, 2, 3, 6]):"
    print Solution_partition_equal_subset_sum().canPartition_recursion([1, 2, 3, 6])
    print "canPartition_recursion([1, 27, 35, 61]):"
    print Solution_partition_equal_subset_sum().canPartition_recursion([1, 27, 35, 61])
    print "canPartition_recursion([1, 8, 3, 6]):"
    print Solution_partition_equal_subset_sum().canPartition_recursion([1, 8, 3, 6])
    print "canPartition_recursion([1, 21, 3, 4, 7, 161]):"
    print Solution_partition_equal_subset_sum().canPartition_recursion([1, 21, 3, 4, 7, 161])

    print ""

    print "partition_equal_subset_sum: --------------"
    print "LIS([0,8,4,12,2, 16]):"
    print Solution_LIS().lengthOfLIS([0,8,4,12,2, 16])

    print ""

    print "partition_equal_subset_sum: --------------"
    print "LCS(['ABCD', 'AEBD']):"
    print Solution_LCS().lengthOfLCS(['ABCD', 'AEBD'])
    print "LCS(['ABCDefscgiqh', 'ABEDeabgiyy4q.h']):"
    print Solution_LCS().lengthOfLCS(['ABCDefscgiqh', 'ABEDeabgiyy4q.h'])
    print "get_lcs_detail_seq_1(['ABCD', 'AEBD']):"
    print Solution_LCS().get_lcs_detail_seq_1(['ABCD', 'AEBD'])
    print "get_lcs_detail_seq_1(['ABCDefscgiqh', 'ABEDeabgiyy4q.h']):"
    print Solution_LCS().get_lcs_detail_seq_1(['ABCDefscgiqh', 'ABEDeabgiyy4q.h'])
    print "get_lcs_detail_seq_2(['ABCD', 'AEBD']):"
    print Solution_LCS().get_lcs_detail_seq_2(['ABCD', 'AEBD'])
    print "get_lcs_detail_seq_2(['ABCDefscgiqh', 'ABEDeabgiyy4q.h']):"
    print Solution_LCS().get_lcs_detail_seq_2(['ABCDefscgiqh', 'ABEDeabgiyy4q.h'])
