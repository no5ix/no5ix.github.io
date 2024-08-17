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

## lc27 - 移除元素 - 20240815

- https://programmercarl.com/0027.移除元素.html
- https://leetcode.com/problems/remove-element/

``` java
class Solution {  // lc27
    public int removeElement(int[] nums, int val) {
        int newArrayIndex = 0;
        for (int searchingIndex = 0; searchingIndex < nums.length; ++searchingIndex) {
            if (nums[searchingIndex] != val) {
                nums[newArrayIndex++] = nums[searchingIndex];
            }
        }
        return newArrayIndex;
    }
}

public class test{
    public static void main(String[] args){
        Solution solution = new Solution();
        int[] myList = {1, 2, 3, 5, 6, 7, 8, 9, 11};
        int ret = solution.removeElement(myList, 7);
        System.out.println(ret);
        for (int i = 0; i < myList.length; ++i) {
            System.out.println(myList[i]);
        }
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

## lc977 - 有序数组的平房 - 20240917

- https://programmercarl.com/0209.长度最小的子数组.html#思路

``` java
class Solution {  // lc209
    public int minSubArrayLen(int target, int[] nums) {
        int left = 0;
        int sum = 0;
        int subLength = 0;
        int result = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; ++right) {
            sum += nums[right];
            while (sum >= target) {
                subLength = right - left + 1;
                result = subLength > result ? result : subLength;
                sum -= nums[left++];
            }
        }
        return result == Integer.MAX_VALUE ? 0 : result;
    }
}

public class test{
    public static void main(String[] args){
        Solution solution = new Solution();
        int[] myList = {1, 2, 3, 5, 6};
        int ret = solution.minSubArrayLen(11, myList);
        System.out.println(ret);
    }
}
```

# lc59 - Spiral Matrix 2 - 20240917

- https://programmercarl.com/0059.螺旋矩阵II.html#算法公开课
- https://leetcode.com/problems/spiral-matrix-ii/description/

``` java
class Solution {  // lc59
    public int[][] generateMatrix(int n) {
        int[][] result = new int[n][n];
        int loop = n / 2;
        int startX = 0;
        int startY = 0;
        int num = 1;
        int offset = 1;
        int i, j;
        while (loop-- > 0) {
            i = startX;
            j = startY;
            for (; j < n - offset; ++j) {
                result[i][j] = num++;
            }
            for (; i < n - offset; ++i) {
                result[i][j] = num++;
            }
            for (; j > startX; --j) {
                result[i][j] = num++;
            }
            for (; i > startY; --i) {
                result[i][j] = num++;
            }
            ++startX;
            ++startY;
            ++offset;
        }
        if (n % 2 != 0) {
            result[n/2][n/2] = n * n;
        }
        return result;
    }
}

public class test{
    public static void main(String[] args){
        Solution solution = new Solution();
        int[][] ret = solution.generateMatrix(3);
        System.out.println(ret);
        for (int i = 0; i < ret.length; ++i) {
            for (int j = 0; j < ret.length; ++j) {
                System.out.println(ret[i][j]);
            }
        }
    }
}
```