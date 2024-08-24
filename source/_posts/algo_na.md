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