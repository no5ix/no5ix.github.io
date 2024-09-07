
import java.util.HashSet;
import java.util.HashMap;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.ArrayList;
import java.util.Stack;
import java.util.Collections;
import java.util.Queue;

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


// class Solution {
//     public String reverseStr(String s, int k) {
//         char[] ch = s.toCharArray();
//         for (int i = 0; i < ch.length; i += 2 * k) {
//             int start = i;
//             int end = Math.min(ch.length - 1, start + k - 1)
//             while (start < end) {
//                 char temp = ch[start];
//                 ch[start] = ch[end];
//                 ch[end] = temp;
//                 ++start;
//                 --end;
//             }
//         }
//         return new String(ch);
//     }
// }

//解法一
//自定义数组
class MyQueue {  // lc239
    Deque<Integer> deque = new LinkedList<>();
    //弹出元素时，比较当前要弹出的数值是否等于队列出口的数值，如果相等则弹出
    //同时判断队列当前是否为空
    void poll(int val) {
        if (!deque.isEmpty() && val == deque.peek()) {
            deque.poll();
        }
    }
    //添加元素时，如果要添加的元素大于入口处的元素，就将入口元素弹出
    //保证队列元素单调递减
    //比如此时队列元素3,1，2将要入队，比1大，所以1弹出，此时队列：3,2
    void add(int val) {
        while (!deque.isEmpty() && val > deque.getLast()) {
            deque.removeLast();
        }
        deque.add(val);
    }
    //队列队顶元素始终为最大值
    int peek() {
        return deque.peek();
    }
}

// class Solution {
//     public int[] maxSlidingWindow(int[] nums, int k) {
//         if (nums.length == 1) {
//             return nums;
//         }
//         int len = nums.length - k + 1;
//         //存放结果元素的数组
//         int[] res = new int[len];
//         int num = 0;
//         //自定义队列
//         MyQueue myQueue = new MyQueue();
//         //先将前k的元素放入队列
//         for (int i = 0; i < k; i++) {
//             myQueue.add(nums[i]);
//         }
//         res[num++] = myQueue.peek();
//         for (int i = k; i < nums.length; i++) {
//             //滑动窗口移除最前面的元素，移除是判断该元素是否放入队列
//             myQueue.poll(nums[i - k]);
//             //滑动窗口加入最后面的元素
//             myQueue.add(nums[i]);
//             //记录对应的最大值
//             res[num++] = myQueue.peek();
//         }
//         return res;
//     }
// }

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// class Solution {
//     public List<Integer> preorderTraversal(TreeNode root) {
//         List<Integer> result = new ArrayList<>();
//         if (root == null) {
//             return result;
//         }
//         Stack<TreeNode> stack = new Stack<>();
//         stack.push(root);
//         while (!stack.isEmpty()) {
//             TreeNode node = stack.pop();
//             result.add(node.val);
//             if (node.right != null) {
//                 stack.push(node.right);
//             }
//             if (node.left != null) {
//                 stack.push(node.left);
//             }
//         }
//         return result;
//     }
// }

// class Solution {
//     public List<Integer> postorderTraversal(TreeNode root) {
//         List<Integer> result = new ArrayList<>();
//         if (root == null) {
//             return result;
//         }
//         Stack<TreeNode> stack = new Stack<>();
//         stack.push(root);
//         while (!stack.isEmpty()) {
//             TreeNode node = stack.pop();
//             result.add(node.val);
//             if (node.left != null) {
//                 stack.push(node.left);
//             }
//             if (node.right != null) {
//                 stack.push(node.right);
//             }
//         }
//         Collections.reverse(result);
//         return result;
//     }
// }

// class Solution {
//     public List<Integer> inorderTraversal(TreeNode root) {
//         List<Integer> result = new ArrayList<>();
//         if (root == null) {
//             return result;
//         }
//         Stack<TreeNode> stack = new Stack<>();
//         TreeNode cur = root;
//         while (cur != null || !stack.isEmpty()) {
//             if (cur != null) {
//                 stack.push(cur);
//                 cur = cur.left;  // 左
//             } else {
//                 cur = stack.pop();
//                 result.add(cur.val);  // 中
//                 cur = cur.right;  // 右
//             }
//         }
//         return result;
//     }
// }

// class Solution {
//     public List<List<Integer>> levelOrder(TreeNode root) {
//         List<List<Integer>> resultList = new ArrayList<List<Integer>>();
//         if (root == null ) {
//             return resultList;
//         }
//         Queue<TreeNode> que = new LinkedList<TreeNode>();
//         que.offer(root);

//         while (!que.isEmpty()) {
//             List<Integer> itemList = new ArrayList<Integer>();
//             int len = que.size();

//             while (len > 0) {
//                 TreeNode tmpNode = que.poll();
//                 itemList.add(tmpNode.val);

//                 if (tmpNode.left != null) { que.offer(tmpNode.left); }
//                 if (tmpNode.right != null) { que.offer(tmpNode.right); }
//                 len--;
//             }
//             resultList.add(itemList);
//         }

//         return resultList;
//     }
// }

// class Solution {
//     public int maxDepth(TreeNode root) {
//         if (root == null) {
//             return 0;
//         }
//         int depth = 0;
//         Queue<TreeNode> que = new LinkedList<>();
//         que.offer(root);
//         while (!que.isEmpty()) {
//             int len = que.size();
//             depth++;
//             while (len > 0) {
//                 TreeNode tmpNode = que.poll();
//                 if (tmpNode.left != null) { que.offer(tmpNode.left); }
//                 if (tmpNode.right != null) { que.offer(tmpNode.right); }
//                 len--;
//             }
//         }
//         return depth;
//     }
// }

class Solution {
    // ArrayList<ArrayList<Integer>> resultArr = new ArrayList<>();和    ArrayList<ArrayList<Integer>> resultArr = new ArrayList<ArrayList<Integer>>();有啥区别? 
    // 完全等价的, `ArrayList<ArrayList<Integer>> resultArr = new ArrayList<>();`
    // - 这是Java 7引入的“钻石操作符”的用法。
    // - 使用钻石操作符可以简化泛型类型的实例化，特别是当构造函数右侧的类型已经由变量声明时。
    // - 它允许编译器自动推断出泛型类型参数，从而使代码更简洁、易读。
    ArrayList<ArrayList<Integer>> resultArr = new ArrayList<>();
    LinkedList<Integer> path = new LinkedList<>();
    public ArrayList<ArrayList<Integer>> combine(int n, int k) {
        backTracking(n, k, 1);
        return resultArr;
    }

    void backTracking(int n, int k, int startIndex) {
        if (path.size() == k) {
            resultArr.add(new ArrayList<>(path));
            return;
        }
        for (int i = startIndex; i <= n; ++i) {
            path.add(i);
            backTracking(n, k, i+1);
            path.removeLast();
        }
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
        
        // int[] myList = {1, 2, 3, 5, 6};
        // int[] myList2 = {1, 2, 3, 4, 8, 6};
        // int[] ret = solution.intersection(myList, myList2);
        
    
        // int[] myList = {1,3,-1,-3,5,3,6,7};
        // int[] ret = solution.maxSlidingWindow(myList, 3);
        // for (int j = 0; j < ret.length; ++j) {
        //     System.out.println(ret[j]);
        // }
    }
}