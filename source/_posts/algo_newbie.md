---
title: 白话算法大总结
date: 2018-10-23 08:08:06
tags:
- noodle
- Algo
- LeetCode
categories:
- Algo
---


# 排序算法

![](/img/introduction_of_sort_algorithm_complexity_and_data_structure/各类算法的复杂度.png "各类算法的复杂度")

- **实用的基础排序算法**有四种:
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
        - 虽然quick_sort会n^2（其实有稳定的nlgn的版本），但这毕竟很少出现。heap_sort大多数情况下比较次数都多于quick_sort，尽管大家都是nlgn。那就让倒霉蛋倒霉好了，大多数情况下快才是硬道理。
        - 堆排比较的几乎都不是相邻元素，对cache极不友好，这才是很少被采用的原因。数学上的时间复杂度不代表实际运行时的情况.快排是分而治之，每次都在同一小段进行比较，最后越来约接近局部性。反观堆排，堆化过程中需要一直拿index的当前元素A和处于index*2 + 1 的子元素B比较, 两个元素距离较远。(局部性原理是指CPU访问存储器时，无论是存取指令还是存取数据，所访问的存储单元都趋于聚集在一个较小的连续区域中。)
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


## 插入排序

想象手上有几张牌， 现在你抽了一张牌， 然后需要从手上最右边的牌开始比较，然后插入到相应位置

![](/img/algo_newbie/sort_algo_1.png)

通过不断的与前面已经排好序的元素比较并交换, 
![](/img/algo_newbie/sort_algo_2.png "insert sort")

动画演示如下:
![](/img/algo_newbie/insert_sort_anim.gif)

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

test_arr = [4, 3, 5, 1, 2]
insert_sort(test_arr, 0, 4)
print test_arr
```

### 插排优化

因为基本的插入排序有太多交换操作了, 我们可以用直接赋值来优化

![](/img/algo_newbie/insert_sort_optimize1.gif "insert_sort_optimize")

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


## 归并排序

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

![](/img/algo_newbie/merge_sort_2.png "归并排序分解图")

动画演示:
![](/img/algo_newbie/merge_sort_anim1.gif "归并排序动画总览")


### 归并排序的merge过程

![](/img/algo_newbie/merge_sort_anim2.gif "归并排序的merge过程")

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


### 归并自顶向下的实现

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

test_arr = [4, 3, 5, 1, 2, 23, 409, -1, 77]
merge_sort(test_arr, 0, len(test_arr)-1)
print test_arr
```

#### 归并自顶向下的优化实现

``` diff
def merge_sort_optimize(arr, left_index, right_index):
    # 当 `merge_sort()` 递归到left_index等于right_index的时候, 
    # 说明left_index, right_index已经相邻了,
    # 说明已经分解到底了, 左右都只剩下一个元素了, 所以此时应该return然后执行 `_merge()` 了
    if not arr or left_index >= right_index:
        return

+    # 优化1:
+    # 数据量较小则使用插入排序
+    if (right_index - left_index) < 15:
+        insert_sort_optimize(arr, left_index, right_index)
+        return

    # 注意这里不能直接 `mid_index=(left_index+right_index)/2`,
    # 防止当left_index和right_index很大的时候他们之和溢出
    mid_index = left_index + (right_index - left_index) / 2
    merge_sort(arr, left_index, mid_index)
    merge_sort(arr, mid_index+1, right_index)

+    # 优化2: 
+    # 因为此时arr[mid_index]左边的数组里最大的, 而arr[mid_index+1]是右边最小的,
+    # 如果arr[mid_index] <= arr[mid_index+1]则说明这一轮递归的arr的left到right已经是从小到大有序的了
+    # 所以只在对于arr[mid_index] > arr[mid_index+1]的情况,进行merge, 
+    # 对于近乎有序的数组非常有效,但是对于一般情况,有一定的性能损失(因为多了这行代码判断大小)
+    if arr[mid_index] > arr[mid_index+1]:
        _merge(arr, left_index, mid_index, right_index)
```


### 归并自底向上的实现

![](/img/algo_newbie/merge_sort_bottom_up.gif)

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

#### 归并自底向上的优化实现

``` diff
def merge_sort_bottom_up_optimize(arr, left_index, right_index):
    if not arr or left_index >= right_index:
        return

+    # 优化1:
+    # 先以size为16为一组数据来逐个对每组插入排序一遍
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
    while size < arr_len:
        cur_left_index = left_index
        while cur_left_index <= right_index-size:
            cur_mid_index = cur_left_index + size -1
            possible_right_index = cur_left_index + 2*size -1
            # possible_right_index有可能已经大于right_index了, 所以要min一下
            cur_right_index = min(possible_right_index, right_index)
            # 归并从i位置开始的两倍size的一组数据
+           # 优化2: 
+           # 因为此时arr[mid_index]左边的数组里最大的, 而arr[mid_index+1]是右边最小的,
+           # 如果arr[mid_index] <= arr[mid_index+1]则说明这一轮递归的arr的left到right已经是从小到大有序的了
+           # 所以只在对于arr[mid_index] > arr[mid_index+1]的情况,进行merge, 
+           # 对于近乎有序的数组非常有效,但是对于一般情况,有一定的性能损失(因为多了这行代码判断大小)
+           if arr[cur_mid_index] > arr[cur_mid_index+1]:
                _merge(arr, cur_left_index, cur_mid_index, cur_right_index)
            cur_left_index += size * 2  # 每次归并完一组数据就i移动size的两倍
        # print "size: %d" % size
        # print arr
        size *= 2  # size从1开始每次增加两倍
```


## 快速排序

与归并排序一样， 快排也是用了分治的思想。

**特别注意** : 快排的核心模块是Partition, 而Partition的复杂度为O(N).

**你可以想象一个两副牌然后随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较，** 

大的放右边那一摞A，小的放左边B。
接着再从左边这一摞B再随意取出一张牌pivot，其他的所有牌都跟这张pivot牌比较， 

大的放右边那一摞，小的放左边，递归下去。
A也重复上述步骤递归。

递归结束之后， 左边的都比右边的小， 而且是有序的。

![](/img/algo_newbie/quick_sort_2.png)

动画演示:
![](/img/algo_newbie/quick_sort_partition_anim.gif "partition过程动画演示")


### 快排效率很差的情况

![](/img/algo_newbie/quick_sort_3.png)

对于分治算法，当每次划分时，算法若都能分成两个等长的子序列时，那么分治算法效率会达到最大。也就是说，基准的选择是很重要的。选择基准的方式决定了两个分割后两个子序列的长度，进而对整个算法的效率产生决定性影响
所以当如果一个有序递增序列, 每次选基准都选最后一个, 那肯定效率很差了啊


### 普通快排

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

### 普通快排的优化

通过[快排效率很差的情况](#快排效率很差的情况), 我们知道快排在面对已经比较有序数组的时候效率如果固定选择某个位置的pivot则性能较差, 所以我们加上两种优化方式:
* 随机选pivot
* 小数组用插排

``` diff
+ import random

def _partition_optimize(arr, left_index, right_index):
    # 选一个元素作为枢轴量,
    # 为了模拟上面这个动画演示, 这里我们选取最左边的元素
    pivot_index = left_index

+   # 随机选一个元素和最左边的交换,
+   # 配合下方的`pivot = arr[left_index]`就达到了随机选一个元素当pivot的效果
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
+   if (right_index - left_index) <= 15:
+       insert_sort(arr, left_index, right_index)
+       return
    partition_index = _partition(arr, left_index, right_index)
    # 把partition_index左边的数据再递归快排一遍
    quick_sort(arr, left_index, partition_index-1)
    quick_sort(arr, partition_index+1, right_index)
```


### 解决普通快排有大量相同元素时的性能问题

**对于分治算法，当每次划分时，算法若都能分成两个等长的子序列时，那么分治算法效率会达到最大。**
当数组中有大量相同元素的时候, 不管怎么选pivot都很容易变成下面这种情况导致分成子序列的不平衡, 这将极大的影响时间复杂度, 最差的情况会退化成O(N2)

![](/img/algo_newbie/quick_sort_4.png)


#### 双路快排-初步解决有大量相同元素的性能问题

所以产生了双路快排的方式, 双路快速排序算法则不同，他使用两个索引值（i、j）用来遍历我们的序列，将小于等于v的元素放在索引i所指向位置的左边，而将大于等于v的元素放在索引j所指向位置的右边, 通过下图我们可以看到当等于v的情况也会发生交换, 这就基本可以保证等于v的元素也可以较为均匀的放到左右两边

![](/img/algo_newbie/quick_sort_5.gif)

**待改进的地方**: 还是把等于v的元素加入到了待处理的数据中, 之后又去重复计算这些等于v的元素了, 为了排除这些已经等于v的元素, 所以产生了[**三路快排**](#三路快排-完全解决有大量相同元素的性能问题)


#### 三路快排-完全解决有大量相同元素的性能问题

这是最经典的解决有大量重复元素的问题的快排方案, 被大多数系统所使用.

![](/img/algo_newbie/quick_sort_6.gif)

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
    arr[pivot_index], arr[lt_index] = arr[lt_index], arr[pivot_index]

    quick_sort_3_ways(arr, left_index, lt_index)
    quick_sort_3_ways(arr, gt_index, right_index)
```


## 堆排序

最大堆的堆排序之后的数组是升序, 最小堆反之.
堆排序 HeapSort 由 以下两部分组成 :

- [堆化 MaxHeapify](#堆化)
- [建堆 BuildMaxHeap](#建堆)

### 堆排序的复杂度

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


### 堆化

**注意**: 以下演示图中的index是从1开始的, 方便我们看动图理解堆化过程, 我们下方代码的数组的index是从0开始的

![](/img/algo_newbie/MaxHeapify.png "对某个元素执行堆化操作")

**注意** : 
在调用MaxHeapify的时候, 我们假定索引为index的元素的左子树和右子树都是最大堆, 不然你如果注意看的话, 你会发现上图中index为10的那个元素其实是没有计算到的, 因为我们假定以index=5为根节点的二叉树都是最大堆了, 所以无需计算他. 
那为何要作如此假设呢?
因为要跟建堆 BuildMaxHeap 配合来完成堆排序, 而建堆 BuildMaxHeap是从下至上的.

动画演示如下, 比如要对17这个元素为父元素的所有子元素进行堆化:

![](/img/algo_newbie/heap_sort_heapify.gif "对17这个元素执行堆化")

用数组存储二叉堆, 首先得明确以下两个index的取得方法, **如果index从0开始的话**:
* `left_child = 2*i + 1`, 
* `right_child = 2*i + 2`
如果是对数组的`[left_index, right_index]`来排序, 且数组的首index为0的话, 则:
* `left_child_index = 2 * (pending_heapify_index-left_index) + 1`
* `right_child_index = left_child_index + 1`
这两个index的取得方式在下方代码有体现.

![](/img/algo_newbie/heap_sort_binary_heap_index.png)

``` python
# 对 pending_heapify_index 元素执行堆化
def _max_heapify(arr, pending_heapify_index, left_index, right_index):
    if pending_heapify_index >= right_index:  # 当满足此条件, 应该结束`_max_heapify`递归了
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
    arr[pending_heapify_index], arr[cur_max_index] = arr[cur_max_index], arr[pending_heapify_index]

    if cur_max_index != pending_heapify_index:  # 若当前已经是最大元素了, 则停止递归
        _max_heapify(arr, cur_max_index, left_index, right_index)  # 继续 堆化 cur_max_index 的子元素
```


### 建堆

我们对每一个不是叶结点的元素(当index从root_index=0开始, 即为 index 小于等于 `root_index + (length/2 - 1)` 即`len/2 - 1`的元素 )自底向上调用一次 Max_Heapify 就可以把一个大小为 length 的数组转换为最大堆.

**注意**: 以下动画演示图中的index是从1开始的, 方便我们看动图理解堆化过程, 我们下方代码的数组的index是从0开始的

![](/img/algo_newbie/heap_sort_build_heap.gif "建堆过程")

``` python
def _build_max_heap(arr, left_index, right_index):
    # 建堆, 从最后一个非叶结点开始, 自底向上堆化就建好了一个最大堆
    root_index = left_index
    arr_len = right_index - left_index + 1
    last_none_leaf_index = root_index + (2 * arr_len - 1)

    i = last_none_leaf_index
    while i >= root_index:
        _max_heapify(arr, i, left_index, right_index)
        i -= 1
```


### 堆排序原址排序的具体实现

![](/img/algo_newbie/heap_sort.gif "堆排序过程")

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
        _max_heapify(arr, root_index, left_index, cur_right_index)
```


# 数据结构

* 二叉树
    * 二叉搜索树
* 链表
* 图


## 二叉树

* 遍历
    * 深度优先遍历dfs
        * 前序非递归
        * 中序非递归
        * 后序非递归
    * 广度优先遍历bfs
        * 层序遍历
* 反转


## 链表

* 链表反转
* 虚头节点方便处理问题的思想


## 图论

* 广度优先遍历dfs得到最短路径
* 深度优先遍历bfs得到啥?


# 算法思想

基础:
* 队列的使用
* 栈的使用
* 散列表的使用
* 堆的使用

高阶:
* 递归
* 回溯
* 动态规划
* 贪心算法


# 算法与数据结构-综合提-C++版

* [课程网址](https://coding.imooc.com/class/chapter/71.html#Anchor)
* [GitHub代码仓库网址](https://github.com/liuyubobobo/Play-with-Algorithms)


* 第一章：当我们在讨论算法的时候，我们在讨论什么？
	1-1 我们究竟为什么要学习算法
	1-2 课程介绍
* 第二章：排序基础
	2-1 选择排序法
	2-2 使用模板（泛型）编写算法
	2-3 随机生成算法测试用例
	2-4 测试算法的性能
	2-5 插入排序法
	2-6 插入排序法的改进
	2-7 更多关于O（n*2）排序算法的思考
* 第三章：高级排序问题
	3-1 归并排序法
	3-2 归并排序法的实现
	3-3 归并排序法的优化
	3-4 自底向上的归并排序算法
	3-5 快速排序法
	3-6 随机化快速排序法
	3-7 双路快速排序法
	3-8 三路快速排序法
	3-9 归并排序和快速排序的衍生问题
* 第四章：堆和堆排序
	4-1 为什么使用堆
	4-2 堆的基本存储
	4-3 Shift Up
	4-4 Shift Down
	4-5 基础堆排序和Heapify
	4-6 优化的堆排序
	4-7 排序算法总结
	4-8 索引堆
	4-9 索引堆的优化
	4-10 和堆相关的其他问题
* 第五章：二分搜索树
	5-1 二分查找法
	5-2 二分搜索树基础
	5-3 二分搜索树的节点插入
	5-4 二分搜索书的查找
	5-5 二分搜索树的遍历（深度优先遍历）
	5-6 层序遍历（广度优先遍历）
	5-7 删除最大值，最小值
	5-8 二分搜索树的删除
	5-9 二分搜索树的顺序性
	5-10 二分搜索树的局限性
	5-11 树形问题和更多树。
* 第六章：并查集
	6-1 并查集基础
	6-2 Qucik Find
	6-3 Quick Union
	6-4 基于size的优化
	6-5 基于rank的优化
	6-6 路径压缩
* 第七章：图论
	7-1 图论基础
	7-2 图的表示
	7-3 相邻点迭代器
	7-4 图的算法框架
	7-5 深度优先遍历和连通分量
	7-6 寻路
	7-7 广度优先遍历和最短路径
	7-8 迷宫生成，ps抠图--更多无权图的应用
* 第八章：最小生成树
	8-1 有权图
	8-2 最小生成树问题和切分定理
	8-3 Prim算法的第一个实现
	8-4 Prim算法的优化
	8-5 优化后的Prim算法的实现
	8-6 Krusk算法
	8-7 最小生成树算法的思考
* 第九章：最短路径
	9-1 最短路径问题和松弛操作
	9-2 Dijkstra算法的思想
	9-3 实现Dijkstra算法
	9-4 负权边和Bellman-Ford算法
	9-5 实现Bellman-Ford算法
	9-6 更多和最短路径相关的思考
* 第十章：结束语
	10-1 总结，算法思想，大家加油！


# 玩转算法面试_从真题到思维全面提升算法思维

* [课程网址](https://coding.imooc.com/class/chapter/82.html#Anchor)
* [GitHub代码仓库网址](https://github.com/liuyubobobo/Play-with-Algorithm-Interview)


* 第1章 算法面试到底是什么鬼?
一提起算法面试，很多同学就会心有余悸。可其实，大多数企业的算法面试，并没有那么可怕。并不是一定要啃完整本《算法导论》，才能玩儿转算法面试；也并不是只有ACM参赛选手，才能笑傲算法面试。恰恰相反，大多数算法面试关注的算法思维，其实很基础。在这一章，和大家聊一聊，算法面试，到底是什么鬼？...

 1-1 算法面试不仅仅是正确的回答问题试看
 1-2 算法面试只是面试的一部分试看
 1-3 如何准备算法面试试看
 1-4 如何回答算法面试问题

* 第2章 面试中的复杂度分析
很多同学一提起复杂度分析就头疼，马上想起了《算法导论》中复杂的数学推导。但其实在一般的企业面试中，对复杂度的分析要求并没有那么高，但也是绕不过去的坎儿。在这一章，和大家介绍一下，面试中需要掌握的复杂度分析。...

 2-1 究竟什么是大O（Big O）
 2-2 对数据规模有一个概念
 2-3 简单的复杂度分析
 2-4 亲自试验自己算法的时间复杂度
 2-5 递归算法的复杂度分析
 2-6 均摊时间复杂度分析（Amortized Time Analysis）
 2-7 避免复杂度的震荡

* 第3章 数组中的问题其实最常见
面试中的算法问题，有很多并不需要复杂的数据结构支撑。就是用数组，就能考察出很多东西了。其实，经典的排序问题，二分搜索等等问题，就是在数组这种最基础的结构中处理问题的。在这一章中，我们学习常见的数组中处理问题的方法。...

 3-1 从二分查找法看如何写出正确的程序
 3-2 改变变量定义，依然可以写出正确的算法

 3-3 在LeetCode上解决第一个问题 Move Zeros
 3-4 即使简单的问题，也有很多优化的思路
 3-5 三路快排partition思路的应用 Sort Color
 3-6 对撞指针 Two Sum II - Input Array is Sorted
 3-7 滑动窗口 Minimum Size Subarray Sum
 3-8 在滑动窗口中做记录 Longest Substring Without Repeating Characters

* 第4章 查找表相关问题
查找，是使用计算机处理问题时的一个最基本的任务，因此也是面试中非常常见的一类问题。很多算法问题的本质，就是要能够高效查找。学会使用系统库中的map和set，就已经成功了一半。

 4-1 set的使用 Intersection of Two Arrays
 4-2 map的使用 Intersection of Two Arrays II
 4-3 set和map不同底层实现的区别
 4-4 使用查找表的经典问题 Two Sum
 4-5 灵活选择键值 4Sum II
 4-6 灵活选择键值 Number of Boomerangs
 4-7 查找表和滑动窗口 Contain Duplicate II
 4-8 二分搜索树底层实现的顺序性 Contain Duplicate III

* 第5章 在链表中穿针引线
链表是一种特殊的线性结构，由于不能像数组一样进行随机的访问，所以和链表相关的问题有他自身的特点。我将之称为穿针引线。我们在这一章，就来看一看，如何在链表中穿针引线。

 5-1 链表，在节点间穿针引线 Reverse Linked List
 5-2 测试你的链表程序
 5-3 设立链表的虚拟头结点 Remove Linked List Elements
 5-4 复杂的穿针引线 Swap Nodes in Pairs
 5-5 不仅仅是穿针引线 Delete Node in a Linked List
 5-6 链表与双指针 Remove Nth Node Form End of List

* 第6章 栈，队列，优先队列
栈和队列虽然是简单的数据结构，但是使用这些简单的数据结构所解决的算法问题不一定简单。在这一章里，我们将来探索，和栈与队列相关的算法问题。

 6-1 栈的基础应用 Valid Parentheses
 6-2 栈和递归的紧密关系 Binary Tree Preorder, Inorder and Postorder Traversal
 6-3 运用栈模拟递归
 6-4 队列的典型应用 Binary Tree Level Order Traversal
 6-5 BFS和图的最短路径 Perfect Squares
 6-6 优先队列
 6-7 优先队列相关的算法问题 Top K Frequent Elements

* 第7章 二叉树和递归
递归，是使用计算机解决问题的一种重要的思考方式。而二叉树由于其天然的递归结构，使得基于二叉树的算法，均拥有着递归性质。使用二叉树，是研究学习递归算法的最佳入门方式。在这一章里，我们就来看一看二叉树中的递归算法。...

 7-1 二叉树天然的递归结构, 104, 111, 100, 101, 222, 110
 7-2 一个简单的二叉树问题引发的血案 Invert Binary Tree
 7-3 注意递归的终止条件 Path Sum, 112, 111, 404
 7-4 定义递归问题 Binary Tree Path, 257, 113, 129
 7-5 稍复杂的递归逻辑 Path Sum III, 437
 7-6 二分搜索树中的问题 Lowest Common Ancestor of a Binary Search Tree, 235, 98, 450, 108, 230, 236

* 第8章 递归和回溯法
回溯法是解决很多算法问题的常见思想，甚至可以说是传统人工智能的基础方法。其本质依然是使用递归的方法在树形空间中寻找解。在这一章，我们来具体看一下将递归这种技术使用在非二叉树的结构中，从而认识回溯这一基础算法思想。...

 8-1 树形问题 Letter Combinations of a Phone Number
 8-2 什么是回溯, 93, 131
 8-3 排列问题 Permutations, 47
 8-4 组合问题 Combinations, 77, 39, 40, 216, 78, 90, 401
 8-5 回溯法解决组合问题的优化
 8-6 二维平面上的回溯法 Word Search, 79
 8-7 floodfill算法，一类经典问题 Number of Islands-
 8-8 回溯法是经典人工智能的基础 N Queens

* 第9章 动态规划基础
很多同学听到“动态规划”的名称可能会望而生畏，觉得动态规划的问题都很复杂。但其实，动态规划本质依然是递归算法，只不过是满足特定条件的递归算法。在这一章里，我们就来逐步解开动态规划的神秘面纱

 9-1 什么是动态规划

 9-2 第一个动态规划问题 Climbing Stairs, 70, 120, 64
 9-3 发现重叠子问题 Integer Break, 343, 279, 91, 62, 63
 9-4 状态的定义和状态转移 House Robber, 198, 213, 337, 309, 
 9-5 0-1背包问题
 9-6 0-1背包问题的优化和变种
 9-7 面试中的0-1背包问题 Partition Equal Subset Sum, 416, 322, 377, 474, 139, 494
 9-8 LIS问题 Longest Increasing Subsequence
 9-9 LCS，最短路，求动态规划的具体解以及更多

* 第10章 贪心算法
通常同学们可能会认为贪心算法比较简单。确实，通常贪心算法的实现非常容易，但是，一个问题是否能够使用贪心算法，是一定要小心的。我们在这一章来看一看，贪心算法可能会有哪些坑。

 10-1 贪心基础 Assign Cookies, 455, 392
 10-2 贪心算法与动态规划的关系 Non-overlapping Intervals, 435
 10-3 贪心选择性质的证明

* 第11章 课程结语
看完整个课程，我不能保证所有的同学都能百分百地对每一个算法面试问题应答自如，但认真学习的同学对大部分问题都应该已经有了一个合理的思维路径。在最后一章，我们再来简单地总结一下，并祝每一位同学都能找到自己喜欢的工作，大展宏图：）...

 11-1 结语


# 代码

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
        
    pre = None   #指向上一个节点
    curr = pHead
    tmp_next = curr.next   
    while curr:
        #先用tmp_next保存curr的下一个节点的信息，
        #保证单链表不会因为失去curr节点的next而就此断裂
        tmp_next = curr.next   
        #保存完next，就可以让curr的next指向pre了
        curr.next = pre
        #让pre，curr依次向后移动一个节点，继续下一次的指针反转
        pre = curr
        curr = tmp_next
    return pre


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