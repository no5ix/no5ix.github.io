
import java.util.HashSet;
import java.util.HashMap;

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

// class Solution {  // lc59
//     public int[][] generateMatrix(int n) {
//         int[][] result = new int[n][n];
//         int loop = n / 2;
//         int startX = 0;
//         int startY = 0;
//         int num = 1;
//         int offset = 1;
//         int i, j;
//         while (loop-- > 0) {
//             i = startX;
//             j = startY;
//             for (; j < n - offset; ++j) {
//                 result[i][j] = num++;
//             }
//             for (; i < n - offset; ++i) {
//                 result[i][j] = num++;
//             }
//             for (; j > startX; --j) {
//                 result[i][j] = num++;
//             }
//             for (; i > startY; --i) {
//                 result[i][j] = num++;
//             }
//             ++startX;
//             ++startY;
//             ++offset;
//         }
//         if (n % 2 != 0) {
//             result[n/2][n/2] = n * n;
//         }
//         return result;
//     }
// }

// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

// class Solution {
//     public ListNode removeElements(ListNode head, int val) {
//         ListNode dummyHead = new ListNode();
//         dummyHead.next = head;
//         ListNode currNode = dummyHead;
//         while (currNode.next != null) {
//             if (currNode.next.val == val) {
//                 currNode.next = currNode.next.next;
//             } else {
//                 currNode = currNode.next;
//             }
//         }
//         return dummyHead.next;
//     }
// }

// class MyLinkedList {
    
//     int size;
//     ListNode dummyHead;

//     public MyLinkedList() {
//         size = 0;
//         dummyHead = new ListNode();
//     }

//     public int get(int index) {
//         if (index < 0 || index >= size) {
//             return -1;
//         }
//         ListNode currNode = dummyHead.next;
//         for (int i = 0; i <= index; ++i) {
//             currNode = currNode.next;
//         }
//         return currNode.val;
//     }

//     public void addAtHead(int val) {
//         ListNode newNode = new ListNode(val);
//         newNode.next = dummyHead.next;
//         dummyHead.next = newNode;
//         ++size;
//     }

//     public void addAtTail(int val) {
        
//     }

//     public void addAtIndex(int index, int val) {
        
//     }

//     public void deleteAtIndex(int index) {
        
//     }
// }

// // 双指针
// class Solution {
//     public ListNode reverseList(ListNode head) {
//         ListNode pre = null;
//         ListNode curr = head;
//         ListNode temp = null;
//         while (curr != null) {
//             temp = curr.next;
//             curr.next = pre;
//             pre = curr;
//             curr = temp;
//         }
//         return pre;
//     }
// }

// class Solution {
//     public ListNode swapPairs(ListNode head) {
//         if (head == null || head.next == null)  {
//             return head; 
//         }
//         ListNode dummyHead = new ListNode();
//         dummyHead.next = head;

//         ListNode currNode = dummyHead;
//         ListNode secondNode;
//         ListNode firstNode;
//         ListNode tempListNode = null;
//         while (currNode.next != null && currNode.next.next != null) {
//             firstNode = currNode.next;
//             secondNode = currNode.next.next;
//             tempListNode = secondNode.next;

//             currNode.next = secondNode;
//             secondNode.next = firstNode;
//             firstNode.next = tempListNode;

//             currNode = firstNode;
//         }
//         return dummyHead.next;
//     }
// }

// class Solution {  // lc242
//     public boolean isAnagram(String s, String t) {
//         int[] record = new int[26];
//         for (int i = 0; i < s.length(); ++i) {
//             record[s.charAt(i) - 'a']++;
//         }
//         for (int i = 0; i < t.length(); ++i) {
//             record[t.charAt(i) - 'a']--;
//         }
//         for (int count: record) {
//             if (count != 0) {
//                 return false;
//             }
//         }
//         return true;
//     }
// }

// import java.util.Set;

// class Solution {
//     public int[] intersection(int[] nums1, int[] nums2) {
//         HashSet<Integer> testSet = new HashSet<Integer>();
//         for (int num1: nums1) {
//             testSet.add(num1);
//         }
//         HashSet<Integer> resultSet = new HashSet<Integer>();
//         for (int num2: nums2) {
//             if (testSet.contains(num2) == true) {
//                 resultSet.add(num2);
//             }
//         }
//         int[] resultArr = new int[resultSet.size()];
//         int j = 0;
//         for (int i: resultSet) {
//             resultArr[j++] = i;
//         }
//         return resultArr;
//     }
// }

// class Solution {
//     public boolean isHappy(int n) {
//         Set<Integer> record = new HashSet<>();
//         while (n != 1 && !record.contains(n)) {
//             record.add(n);
//             n = getNextNumber(n);
//         }
//         return n == 1;
//     }

//     private int getNextNumber(int n) {
//         int res = 0;
//         while (n > 0) {
//             int temp = n % 10;
//             res += temp * temp;
//             n = n / 10;
//         }
//         return res;
//     }
// }


class Solution {
    public String reverseStr(String s, int k) {
        char[] ch = s.toCharArray();
        for (int i = 0; i < ch.length; i += 2 * k) {
            int start = i;
            int end = Math.min(ch.length - 1, start + k - 1)
            while (start < end) {
                char temp = ch[start];
                ch[start] = ch[end];
                ch[end] = temp;
                ++start;
                --end;
            }
        }
        return new String(ch);
    }
}


public class test_algo_na{
    public static void main(String[] args){
        Solution solution = new Solution();
        // int[] myList = {1, 2, 3, 5, 6};
        // int[][] ret = solution.generateMatrix(3);
        // System.out.println(ret);
        // for (int i = 0; i < ret.length; ++i) {
        //     for (int j = 0; j < ret.length; ++j) {
        //         System.out.println(ret[i][j]);
        //     }
        // }
        // ListNode testList = new ListNode(1);
        // testList.next = new ListNode(2);
        // testList.next.next = new ListNode(3);
        // testList.next.next.next = new ListNode(4);

        // // ListNode newListNode = solution.reverseList(testList);
        // ListNode newListNode = solution.swapPairs(testList);
        // while (newListNode != null) {
        //     System.out.println(newListNode.val);
        //     newListNode = newListNode.next;
        // }
        
        int[] myList = {1, 2, 3, 5, 6};
        int[] myList2 = {1, 2, 3, 4, 8, 6};
        int[] ret = solution.intersection(myList, myList2);
        for (int j = 0; j < ret.length; ++j) {
            System.out.println(ret[j]);
        }
    }
}