---
title: algo na
date: 2024-08-15 00:54:08
tags:
- noodle
- Algo
- LeetCode
categories:
- Algo
---


# 算法白话总结

推荐参考**本博客总结**的 {% post_link algo_newbie %}


# 概绍

本群的每日刷题打卡活动, 按照 GitHub 49k star的项目 https://github.com/youngyangyang04/leetcode-master 的刷题顺序.
跟着群里有个伴一起刷题或许更容易坚持达成每日一题的目标. 做完题目之后可以在群里的小程序"今日leetcode刷题打卡"里打卡. 

- 网页版: 代码随想录 https://programmercarl.com/
- 本博客只记录那些有明显自我疑问而<<代码随想录>>没有说明清楚的题目, 会标识出来并注释


# 本文完整参考代码

<https://github.com/no5ix/no5ix.github.io/blob/source/source/code/test_algo_na.java>


**. . .**<!-- more -->

# 数组

## lc704 - 二分查找 - 20240814

- https://programmercarl.com/0704.二分查找.html#二分法第一种写法
- https://leetcode.com/problems/binary-search/

``` java
class Solution {
    public int search(int[] numbers, int targetNumber) {
        if (targetNumber < numbers[0] || targetNumber > numbers[numbers.length - 1]) {
            return -1;
        }
        int leftIndex = 0;
        int rightIndex = numbers.length - 1;
        while (leftIndex <= rightIndex) {
            /*
            url: https://stackoverflow.com/questions/27167943/why-leftright-left-2-will-not-overflow
            Q: why left+(right-left)/2 can avoid overflow?
            A: 
                You have left < right by definition.
                As a consequence, right - left > 0, and furthermore left + (right - left) = right (follows from basic algebra).
                And consequently left + (right - left) / 2 <= right. So no overflow can happen since every step of the operation is bounded by the value of right.
                By contrast, consider the buggy expression, (left + right) / 2. left + right >= right, and since we don’t know the values of left and right, it’s entirely possible that that value overflows.
            */
            int midIndex = leftIndex + ((rightIndex - leftIndex) >> 2);  // >> 2 等同于 除以 2
            if (numbers[midIndex] == targetNumber) {
                return midIndex;
            } else if (numbers[midIndex] < targetNumber) {
                leftIndex = midIndex + 1;
            } else {
                rightIndex = midIndex - 1;
            }
        }
        return -1;
    }
}

public class test{
    public static void main(String[] args){
        Solution solution = new Solution();
        int[] myList = {1, 2, 3, 5, 6, 7, 8, 9, 11};
        int ret = solution.search(myList, 7);
        System.out.println(ret);
    }
}
```

## lc977 - 有序数组的平房 - 20240916

- https://programmercarl.com/0977.有序数组的平方.html#算法公开课
- https://leetcode.com/problems/squares-of-a-sorted-array/description/

``` java
class Solution {  // lc977
    public int[] sortedSquares(int[] nums) {
        int[] resultArray = new int[nums.length];
        int startIndex = 0;
        int endIndex = nums.length - 1;
        int resultIndex = nums.length - 1;
        while (startIndex <= endIndex) {  // 这里是 <= , 因为最后相等时候的那个元素也要处理
            if (nums[startIndex] * nums[startIndex] > nums[endIndex] * nums[endIndex]) {
                resultArray[resultIndex--] = nums[startIndex] * nums[startIndex];
                startIndex++;
            } else {
                resultArray[resultIndex--] = nums[endIndex] * nums[endIndex];
                endIndex--;
            }
        }
        return resultArray;
    }
}

public class test{
    public static void main(String[] args){
        Solution solution = new Solution();
        int[] myList = {-7, 2, 3, 5, 6};
        int[] ret = solution.sortedSquares(myList);
        System.out.println(ret);
        for (int i = 0; i < ret.length; ++i) {
            System.out.println(ret[i]);
        }
    }
}
```

# 字符串

## lc28 - 实现strStr() - 20240923 - KMP

https://programmercarl.com/0028.实现strStr.html#算法公开课

``` java
class Solution {
    //前缀表（不减一）Java实现
    public int strStr(String haystack, String needle) {
        if (needle.length() == 0) return 0;
        int[] next = new int[needle.length()];  // 前缀表
        getNext(next, needle);

        int j = 0;  // 此处 j 指向 基于模式串 needle 的 内部的起始位置
        for (int i = 0; i < haystack.length(); i++) {  // i 指向 基于文本串 haystack 内部的起始位置。
            while (j > 0 && needle.charAt(j) != haystack.charAt(i)) 
                j = next[j - 1];  // strStr 里匹配过程里的寻找前一位来继续匹配; 不懂的话看视频 https://www.bilibili.com/video/BV1PD4y1o7nd/?vd_source=8a83b38420b65ac33aa101b7754630f6 里的 "使用前缀表的匹配过程" 环节
            if (needle.charAt(j) == haystack.charAt(i)) 
                j++;
            if (j == needle.length())  // 当 j 等于needle 长度的时候, 说明 j 指向了模式串t的末尾的后面，那么就说明模式串t完全匹配文本串s里的某个子串了。
                return i - needle.length() + 1;
        }
        return -1;

    }
    
    private void getNext(int[] next, String s) {
        int j = 0;  // 此处 j 是 前缀 的末尾位置, 也是前缀的长度
        next[0] = 0;
        for (int i = 1; i < s.length(); i++) {  // i 是后缀的末尾位置
            while (j > 0 && s.charAt(j) != s.charAt(i))  // 此时前后缀不相等; (j要保证大于0，因为下面有取j-1作为数组下标的操作
                j = next[j - 1];  // 注意这里，是要找前一位的对应的回退位置了; 为什么这里要找前一位的对应的回退位置呢? 因为和 上面 strStr 里匹配过程里的寻找前一位来继续匹配是一样一样的
            if (s.charAt(j) == s.charAt(i))   // 此时前后缀相等
                j++;
            next[i] = j;  // 因为 j 即是前缀 的末尾位置, 又是前缀的长度, 所以此处直接在 next 表里存下 j
        }
    }
}
```


# 二叉树

## 前序


## 中序

``` java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) {
            return result;
        }
        Stack<TreeNode> stack = new Stack<>();
        TreeNode cur = root;
        while (cur != null || !stack.isEmpty()) {
            if (cur != null) {
                stack.push(cur);
                cur = cur.left;  // 左
            } else {
                cur = stack.pop();
                result.add(cur.val);  // 中
                cur = cur.right;  // 右
            }
        }
        return result;
    }
}
```

## 后序

## 层序

``` java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> resultList = new ArrayList<List<Integer>>();
        if (root == null ) {
            return resultList;
        }
        Queue<TreeNode> que = new LinkedList<TreeNode>();
        que.offer(root);

        while (!que.isEmpty()) {
            List<Integer> itemList = new ArrayList<Integer>();
            int len = que.size();

            while (len > 0) {
                TreeNode tmpNode = que.poll();
                itemList.add(tmpNode.val);

                if (tmpNode.left != null) { que.offer(tmpNode.left); }
                if (tmpNode.right != null) { que.offer(tmpNode.right); }
                len--;
            }
            resultList.add(itemList);
        }

        return resultList;
    }
}
```

## 高度

- 二叉树节点的高度：指从`该节点`到叶子节点的最长简单路径边的条数或者节点数（取决于高度从0开始还是从1开始）
- 二叉树节点的深度：指从`根节点`到该节点的最长简单路径边的条数或者节点数（取决于深度从0开始还是从1开始）
- 而根节点的高度就是二叉树的最大深度

## 深度

- 二叉树的深度: 根节点到最远叶子节点的最长路径上的节点数。
- 叶子节点: 是指没有子节点的节点。

### 最大深度

使用迭代法的话，使用层序遍历是最为合适的，因为最大的深度就是二叉树的层数，和层序遍历的方式极其吻合。
在二叉树中，一层一层的来遍历二叉树，记录一下遍历的层数就是二叉树的深度，

``` java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int depth = 0;
        Queue<TreeNode> que = new LinkedList<>();
        que.offer(root);
        while (!que.isEmpty()) {
            int len = que.size();
            depth++;
            while (len > 0) {
                TreeNode tmpNode = que.poll();
                if (tmpNode.left != null) { que.offer(tmpNode.left); }
                if (tmpNode.right != null) { que.offer(tmpNode.right); }
                len--;
            }
        }
        return depth;
    }
}
```

### 最小深度

最小深度: 是从根节点到最近叶子节点的最短路径上的节点数量。

``` java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int depth = 0;
        Queue<TreeNode> que = new LinkedList<>();
        que.offer(root);
        while (!que.isEmpty()) {
            int len = que.size();
            depth++;
            while (len > 0) {
                TreeNode tmpNode = que.poll();
                if (tmpNode.left == null && tmpNode.right == null) {
                    // 当左右孩子都为空的时候，说明是最低点的一层了，退出
                    return depth;
                }
                if (tmpNode.left != null) { que.offer(tmpNode.left); }
                if (tmpNode.right != null) { que.offer(tmpNode.right); }
                len--;
            }
        }
        return depth;
    }
}
```

