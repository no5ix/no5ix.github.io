---
title: 算法企业真题实战练习
date: 2018-11-01 18:48:08
tags:
- noodle
- Algo
- LeetCode
categories:
- Algo
---


# 实战练习 pending_fini

* [bigo线程排列题](#比狗-线程全排列)
* [lc4题-两个排序数组找中位数, 困难](https://leetcode-cn.com/problems/median-of-two-sorted-arrays/)
* 给出一棵二叉树的根节点，现在有这个二叉树的部分节点，要求这些节点最近的公共祖先
* 缺失的第一个正数（leetcode第41题）
* 有 64 匹马，赛场只有 8 条赛道，请问最少需要比赛多少场才能确定跑得最快的那 4 匹马，不可以借助计时器给每一匹马一一计时；

* 一个桶里面有白球. 黑球各 100 个，现在按下述的规则取球：
	i . 每次从桶里面拿出来两个球；
	ii. 如果取出的是两个同色的球，就再放入一个黑球；
	iii. 如果取出的是两个异色的球，就再放入一个白球。
	问：最后桶里面只剩下一个黑球的概率是多少？
* 给定字符串 str1 和 str2，将 str2 插入 str1 中，问有多少种插入方法使得新串是回文。例如：
	Str1=lol
	Str2=o
	总共有四种插入方法，分别得到olol，lool，lool，lolo，其中能到回文的方法有两种。
	输入：
	lol
	o
	输出：
	2
* 两个有序（从小到大）单链表，合并为一个有序的单链表。
	``` cpp
	struct LinkNode{
	int value;
	struct LinkNode *next;
	};
	struct LinkNode *merge(struct LinkNode *firstLink, struct LinkNode *secondLink)
	```
* 公司有内部 bbs，员工都会在上面发帖交流。据统计，有三个员工 ID 发帖很多，他们各自的发帖量都超过帖子总数 N 的 1/4。如果给到你所有帖子的发帖人 ID 列表，请写代码找出这三个 ID，要求时间复杂度 O（n），空间复杂度 O（1）。
* 寻找第K大
	限定语言：Python. C++. C#. Java
	有一个整数数组，请你根据快速排序的思路，找出数组中第K大的数。
	给定一个整数数组a,同时给定它的大小n和要找的K(K在1到n之间)，请返回第K大的数，保证答案存在。
	测试样例：
	[1,3,5,2,2],5,3
	返回：2
* 4 个数组，目标值 target，每个数组各找一个数，使得 4 个数和为 target，数组没有顺序，找到所有不重复的组合，要求时间复杂度 O(n^2)
* m 个有序数组，每个数组长度为 n，将 m 个数组生成 1 个有序数组，如何做？
	使用堆排序，m 个排一次，然后补充数据，最后得到结果
* 1 个有序的数组，里面包含了 N 个数字，分割成 M 段（M<=N），然后进行乱序排列，如何快速恢复其顺序
	``` cpp
	// 45 123 79
	// 45 67 123 89
	void resort(int[] arr, int N, int M) {
	}
	```
	主要思路是这样的，先遍历一遍，然后得到最基本的分割情况，根据分割大小，与 M 进行判断和比较，如果比 M 小，再进行判断是否存在大块需要分割，再进行两两比较，分割完成，标记好分割点，最后进行重组
	

# finished

* [leetcode64题](https://leetcode-cn.com/problems/minimum-path-sum/)
* 判断是否有一个数num在有序数组中出现次数多于数组长度的一半
    * 判断num是否等于中间的数即可
* 数组中有一个数字出现的次数超过数组长度的一半，请找出这个数字。
    * 根据数组特点得到时间复杂度为O(n)的算法。根据数组特点，数组中有一个数字出现的次数超过数组长度的一半，也就是说它出现的次数比其他所有数字出现的次数之和还要多。因此，我们可以在遍历数组的时候设置两个值：一个是数组中的数result，另一个是出现次数times。当遍历到下一个数字的时候，如果与result相同，则次数加1,不同则次数减一，当次数变为0的时候说明该数字不可能为多数元素，将result设置为下一个数字，次数设为1。这样，当遍历结束后，最后一次设置的result的值可能就是符合要求的值（如果有数字出现次数超过一半，则必为该元素，否则不存在），因此，判断该元素出现次数是否超过一半即可验证应该返回该元素还是返回0。这种思路是对数组进行了两次遍历，复杂度为O(n)。
* 给定一个含有n个元素的整型数组a，其中只有一个元素出现奇数次，找出这个元素。
    * 解决问题的关键是要想明白，按位异或运算满足结合律，偶数个异或结果是0，奇数个异或结果是本身，如`1 ^ 2 ^ 3 ^ 1 ^ 2 ^ 3 ^ 3 = (3 ^ 3 ^ 3) ^ (1 ^ 1) ^ (2 ^ 2) = 3^ 0 ^ 0 = 3`。
* 一个无序数组找其子序列构成的和最大，要求子序列中的元素在原数组中两两都不相邻, 和是多少?具体是哪个子序列?
	* <a href="{% post_path 'algo_newbie' %}#状态转移方程讲解-打家劫舍">状态转移方程讲解-打家劫舍</a>
* [lc445](https://leetcode-cn.com/problems/add-two-numbers-ii/), 两个单向链表，返回求和后的链表结构, 例如2->3->1->5，和3->6，结果返回2->3->5->1
    * 用栈
    * 反转链表再相加
* 现有一个随机数生成器可以生成0到4的数，现在要让你用这个随机数生成器生成0到6的随机数，要保证生成的数概率均匀。
    * 别被这个题目唬住了, 其实很简单
    * 大多数利用一个等概率随机数构造另外一个等概率随机数的题目，只需两次使用概率函数即可
    * 代码如下:
    ``` python
	def rand4():
		# 这是题目给的
		pass

	def rand6():
		res = rand4()
		# 只要0和1和2, 注意这个0不可少, 不然`res + rand4()`生成的数至少为1
		while res > 2:
			res = rand4()
		# 这样就能保证是等概率0到4 , 等概率的加(0, 1, 2), 得到等概率的0-6
		return res + rand4()
	```
* 有 N 枚棋子，每个人一次可以拿1到 M 个，谁拿完后棋子的数量为0谁就获胜。现在有1000颗棋子，每次最多拿8个，A 先拿，那么 A 有必胜的拿法吗？
	* 这个是个智力题不是算法题, 是倍数的思想
	* 这类题得先求得 `N % (M+1)` 的余数, 此处为 `1000 % (8+1) = 1`, 求得此余数Y后, 先拿的人第一次就拿Y个, 然后假如B同学第二次拿X个比如是4个, 不管B拿多少个, A之后都拿 `(M+1)-X`个即 `(8+1)-4=5`个和B同学拿的4个凑成`(8+1)=9`个, 这样就保证了A是最后一个拿完棋子的人
	。
* 连续整数求和([leetcode第829题, hard实际有思路就easy](https://leetcode-cn.com/problems/consecutive-numbers-sum/))，要求时间复杂度小于O(N)
	``` python
	class Solution:
    def consecutiveNumbersSum(self, N: int) -> int:
        # 1个数时，必然有一个数可构成N
        # 2个数若要构成N，第2个数与第1个数差为1，N减掉这个1能整除2则能由商与商+1构成N
        # 3个数若要构成N，第2个数与第1个数差为1，第3个数与第1个数的差为2，N减掉1再减掉2能整除3则能由商、商+1与商+2构成N
        # 依次内推，当商即第1个数小于等于0时结束
        res, i = 0, 1
        while N > 0:
            res += N % i == 0
            N -= i
            i += 1
        return res
	```


## 比狗-线程全排列

![](/img/algo_practice/bigo_1.jpg)
不用管第一题, 我们做第二题:
``` python

```


## leetcode

### 106题后序中序求原二叉树

* [leetcode106题后序中序求原二叉树](https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)
* 参考: https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/solution/
	
![](/img/algo_practice/lc_106.png)

首先来看题目给出的两个已知条件 中序遍历序列 和 后序遍历序列 根据这两种遍历的特性我们可以得出三个结论
* 在后序遍历序列中,最后一个元素为树的根节点
* 在中序遍历序列中,根节点的左边为左子树(设其长度为len_left), 根节点的右边为右子树
* 当前后序遍历序列中`[postorder_left_index...len_left-1]`为左子树的结点, 其他的除最后一个结点外都是右子树的结点

则代码如下:
``` python
class Solution_build_bt(object):
	def buildTree(self, inorder, postorder):
		"""
		:type inorder: List[int]
		:type postorder: List[int]
		:rtype: TreeNode
		"""
		if not inorder or not postorder:
			return None

		def _proc_order_arr(
				inorder_left_index, inorder_right_index, 
				postorder_left_index, postorder_right_index):       
			if inorder_left_index > inorder_right_index or \
					postorder_left_index > postorder_right_index:
				return None
			# 在后序遍历序列中,最后一个元素为树的根节点
			root_val = postorder[postorder_right_index] 
			root_inorder_index = inorder.index(root_val)
			_len_left_child = root_inorder_index-inorder_left_index
			root_node = TreeNode(root_val)
			
			# 在中序遍历序列中,根节点的左边为左子树(设其长度为len_left), 根节点的右边为右子树
			# 当前后序遍历序列中`[postorder_left_index...len_left-1]`为左子树的结点, 
			# 其他的除最后一个结点外都是右子树的结点
			root_node.left = _proc_order_arr(
				inorder_left_index,
				root_inorder_index-1,
				postorder_left_index,
				postorder_left_index + (_len_left_child-1)
			)
			root_node.right = _proc_order_arr(
				root_inorder_index+1,
				inorder_right_index,
				postorder_left_index+(_len_left_child),
				postorder_right_index-1
			)
			return root_node
			
		return _proc_order_arr(0, len(inorder)-1, 0, len(postorder)-1)
```