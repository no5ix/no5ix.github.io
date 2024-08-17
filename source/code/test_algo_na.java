// class Solution {  // lc704
//     public int search(int[] numbers, int targetNumber) {
//         if (targetNumber < numbers[0] || targetNumber > numbers[numbers.length -1]) {
//             return -1;
//         }
//         int leftIndex = 0;
//         int rightIndex = numbers.length -1;
//         while (leftIndex <= rightIndex) {
//             int midIndex = leftIndex + ((rightIndex - leftIndex) >> 2);
//             if (numbers[midIndex] == targetNumber) {
//                 return midIndex;
//             } else if (numbers[midIndex] < targetNumber) {
//                 leftIndex = midIndex + 1;
//             } else {
//                 rightIndex = midIndex - 1;
//             }
//         }
//         return -1;
//     }
// }

// class Solution {  // lc27
//     public int removeElement(int[] nums, int val) {
//         int newArrayIndex = 0;
//         for (int searchingIndex = 0; searchingIndex < nums.length; ++searchingIndex) {
//             if (nums[searchingIndex] != val) {
//                 nums[newArrayIndex++] = nums[searchingIndex];
//             }
//         }
//         return newArrayIndex;
//     }
// }

// class Solution {  // lc977
//     public int[] sortedSquares(int[] nums) {
//         int[] resultArray = new int[nums.length];
//         int startIndex = 0;
//         int endIndex = nums.length - 1;
//         int resultIndex = nums.length - 1;
//         while (startIndex <= endIndex) {  // 这里是 <= , 因为最后要处理两个元素
//             if (nums[startIndex] * nums[startIndex] > nums[endIndex] * nums[endIndex]) {
//                 resultArray[resultIndex--] = nums[startIndex] * nums[startIndex];
//                 startIndex++;
//             } else {
//                 resultArray[resultIndex--] = nums[endIndex] * nums[endIndex];
//                 endIndex--;
//             }
//         }
//         return resultArray;
//     }
// }


// class Solution {  // lc209
//     public int minSubArrayLen(int target, int[] nums) {
//         int left = 0;
//         int sum = 0;
//         int subLength = 0;
//         int result = Integer.MAX_VALUE;
//         for (int right = 0; right < nums.length; ++right) {
//             sum += nums[right];
//             while (sum >= target) {
//                 subLength = right - left + 1;
//                 result = subLength > result ? result : subLength;
//                 sum -= nums[left++];
//             }
//         }
//         return result == Integer.MAX_VALUE ? 0 : result;
//     }
// }

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

public class test_algo_na{
    public static void main(String[] args){
        Solution solution = new Solution();
        // int[] myList = {1, 2, 3, 5, 6};
        int[][] ret = solution.generateMatrix(3);
        System.out.println(ret);
        for (int i = 0; i < ret.length; ++i) {
            for (int j = 0; j < ret.length; ++j) {
                System.out.println(ret[i][j]);
            }
        }
    }
}