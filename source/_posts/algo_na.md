---
title: algo na
date: 2024-08-15 00:54:08
tags:
- noodle
- Algo
- LeetCode
categories:
- Algo
password: '0622'
---


# 算法白话总结

推荐参考**本博客总结**的 {% post_link algo_newbie %}


# 概绍

本群的每日刷题打卡活动, 按照 GitHub 49k star的项目 https://github.com/youngyangyang04/leetcode-master 的刷题顺序.
跟着群里有个伴一起刷题或许更容易坚持达成每日一题的目标. 做完题目之后可以在群里的小程序"今日leetcode刷题打卡"里打卡. 


# 数组

## lc704 - 二分查找 - 20240814

- https://leetcode.com/problems/binary-search/
- https://programmercarl.com/0704.二分查找.html#二分法第一种写法

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
