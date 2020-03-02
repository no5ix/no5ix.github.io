---
title: 一些常见的笔试题
date: 2014-09-29 02:11:22
tags:
- CPP
- noodle
categories:
- CPP
---


# 求最大公约数

求 a 和 b 的最大公约数
![辗转相除法](/img/some_common_examination/greatest_common_divisor.png)

``` c++
int measure(int a, int b)
{
	int product = a * b;
	if (a == 0 || b == 0)
	{
		return -1;
	}
	if (a < b)
	{
		int temp = a;
		a = b;
		b = temp;
	}
	while (int mod = a % b)
	{
		a = b;
		b = mod;
	}
	//return b; // 最大公约数
	return product / b; // 记住这个公式： a*b=最小公倍数*最大公约数
}
```

# 棋盘/格子问题

在如下7*5的棋盘中，请计算从A移动到B一共有多少走法？要求每次只能向上或向右移动一格，并且不能经过P。(答案为492)

![](/img/some_common_examination/SumWaysOfMoveOnChessBoard.jpg)

给定一个M*N的格子或棋盘，从左下角走到右上角的走法总数（每次只能向右或向上移动一个方格边长的距离）   

运用动态规划来解答 :   
我们可以把棋盘的左下角看做二维坐标的原点(0,0)，把棋盘的右上角看做二维坐标(M,N)(坐标系的单位长度为小方格的变长)   
用f(i,j)表示移动到坐标f(i,j)的走法总数，其中0=<i,j<=n，设f(m,n)代表从坐标（0,0）到坐标（m,n）的移动方法，则   
	`f(m,n)=f(m-1,n)+f(m,n-1).`
于是状态f(i,j)的状态转移方程为：   

	f(i,j)=f(i-1,j)+f(i,j-1)   if i,j>0
	f(i,j)=f(i,j-1)            if i=0
	f(i,j)=f(i-1,j)            if j=0

初始情况就为：f(0,0)=0, f(0,1)=1, f(1,0)=1，这个问题可以在时间O(n^2)，空间O(n^2)内求解，非递归解.   

所以答案为 	492 = 	

``` cpp
SumWaysOfMoveOnChessBoard(7, 5) - SumWaysOfMoveOnChessBoard(3, 3) * SumWaysOfMoveOnChessBoard(7 - 3, 5 - 3)
```


## 递归解

``` c++
int SumWaysOfMoveOnChessBoard_Recursion(int m, int n) 
{
    if (m == 0 && n == 0)
        return 0;
    if (m==0 || n==0)
        return 1;
    return SumWaysOfMoveOnChessBoard_Recursion(m, n - 1) + SumWaysOfMoveOnChessBoard_Recursion(m - 1, n);
}
```

## 非递归解

``` c++
int SumWaysOfMoveOnChessBoard_NonRecursion_RawArray(int m, int n)
{
	if (m == 0 || n == 0)
		return 1;
	if (m == 0 && n == 0)
		return 0;

	int xSize = m + 1;
	int ySize = n + 1;

	int** arr = new int*[xSize];
	for (int i = 0; i < xSize; ++i)
		arr[i] = new int[ySize];

	arr[0][0] = 0;
	for (int i = 0; i < xSize; ++i) arr[i][0] = 1;
	for (int i = 0; i < ySize; ++i) arr[0][i] = 1;
	for (int i = 1; i < xSize; ++i)
		for (int j = 1; j < ySize; ++j)
			arr[i][j] = arr[i - 1][j] + arr[i][j - 1];

	for (int i = 0; i < xSize; ++i)
		delete[] arr[i];
	delete[] arr;

	return arr[m][n];
}

int SumWaysOfMoveOnChessBoard_NonRecursion_STL(int m, int n)
{
	if (m == 0 && n == 0)
		return 0;

	int xSize = m + 1;
	int ySize = n + 1;

	std::vector< vector<int> > ChessBoardArray(xSize, vector<int>(ySize));;
	ChessBoardArray[0][0] = 0;
	for (int i = 0; i < xSize; ++i) ChessBoardArray[i][0] = 1;
	for (int j = 0; j < ySize; ++j) ChessBoardArray[0][j] = 1;
	for (int i = 1; i < xSize; ++i)
		for (int j = 1; j < ySize; ++j)
			ChessBoardArray[i][j] = ChessBoardArray[i][j - 1] + ChessBoardArray[i - 1][j];

	return ChessBoardArray[m][n];
}
```

# 大数加法/乘法

**大数加法思路** : 
模拟小学列竖式

			9  8
	+       2  1
	-------------
		(1)(1)(9)

**大数乘法思路** :

模拟乘法累加 - 改进
简单来说，方法二就是先不算任何的进位，也就是说，将每一位相乘，相加的结果保存到同一个位置，到最后才计算进位。

例如：计算98×21,步骤如下

			9  8
	×       2  1
	-------------
		   (9)(8)   <---- 第1趟: 98×1的每一位结果 
	   (18)(16)     <---- 第2趟: 98×2的每一位结果 
	-------------
	   (18)(25)(8)  <---- 这里就是相对位的和，还没有累加进位

这里唯一要注意的便是进位问题，我们可以先不考虑进位，当所有位对应相加，产生结果之后，再考虑。   
从右向左依次累加，如果该位的数字大于10，那么我们用取余运算，在该位上只保留取余后的个位数，而将十位数进位（通过模运算得到）累加到高位便可，循环直到累加完毕。

``` c++
void BigIntAddition(char* bigIntA, char* bigIntB)
{
	if (!bigIntA || !bigIntB)
		return;

	size_t strlenA = strlen(bigIntA);
	size_t strlenB = strlen(bigIntB);
	size_t biggerStrlen = strlenA > strlenB ? strlenA : strlenB;

	int* reversedA = new int[biggerStrlen];
	int* reversedB = new int[biggerStrlen];
	// 先将例子中的 1234 和 98765 逆序存储, 不够的补零, 方便计算
	for (size_t i = 0; i < biggerStrlen; ++i)
	{
		//cout << int(strlenA - 1 - i) << endl;
		reversedA[i] = (int(strlenA - 1 - i) >= 0) ? (bigIntA[strlenA - 1 - i] - '0') : 0;
		reversedB[i] = (int(strlenB - 1 - i) >= 0) ? (bigIntB[strlenB - 1 - i] - '0') : 0;
	}

	for (size_t i = 0; i < biggerStrlen; ++i)
		cout << reversedA[i];
	cout << endl; // --> 43210

	for (size_t i = 0; i < biggerStrlen; ++i)
		cout << reversedB[i];
	cout << endl; // --> 98765

	int* bigIntSum = new int[biggerStrlen + 1];
	int x = 0; // 进位
						 // 模拟小学的列竖式加法, 满10进1
	for (size_t i = 0; i < biggerStrlen; ++i)
	{
		bigIntSum[i] = reversedA[i] + reversedB[i] + x;
		x = bigIntSum[i] / 10;
		bigIntSum[i] %= 10;
	}
	size_t printLen = biggerStrlen;
	// 查看最后一个进位是否 > 0, 大于零则最高位为1
	if (x > 0)
	{
		bigIntSum[biggerStrlen] = x;
		printLen = biggerStrlen + 1;
	}
	for (size_t i = 0; i < printLen; ++i)
		cout << bigIntSum[printLen - 1 - i]; // --> 58023
	cout << endl;

	delete[] bigIntSum;
}

void BigIntMultiplication(char* bigIntA, char* bigIntB)
{
	if (!bigIntA || !bigIntB)
		return;

	int strlenA = static_cast<int>(strlen(bigIntA));
	int strlenB = static_cast<int>(strlen(bigIntB));
	cout << strlenA << ", " << strlenB << endl;
	int biggerStrlen = strlenA > strlenB ? strlenA : strlenB;

	int* reversedA = new int[biggerStrlen];
	int* reversedB = new int[biggerStrlen];
	// 先将例子中的 1234 和 98765 逆序存储, 不够的补零, 方便计算
	for (int i = 0; i < biggerStrlen; ++i)
	{
		reversedA[i] = (int(strlenA - 1 - i) >= 0) ? (bigIntA[strlenA - 1 - i] - '0') : 0;
		reversedB[i] = (int(strlenB - 1 - i) >= 0) ? (bigIntB[strlenB - 1 - i] - '0') : 0;
	}

	for (int i = 0; i < biggerStrlen; ++i)
		cout << reversedA[i];
	cout << endl; // --> 43210

	for (int i = 0; i < biggerStrlen; ++i)
		cout << reversedB[i];
	cout << endl; // --> 98765

	// 分配一个空间，用来存储运算的结果，num1长的数 * num2长的数，
	// 结果不会超过num1+num2长
	int* bigIntProduct = new int[strlenA + strlenB];
	// 比如防止下面执行 bigIntSum[i + j] += reversedA[i] * reversedB[j]; 这句的时候
	// i+j = 0 时 出错, 因为 bigIntSum[0] 为一个未初始化的值
	for (int i = 0; i < strlenA + strlenB; ++i)
		bigIntProduct[i] = 0;
	int carry = 0; // 进位

	// 先不考虑进位问题，根据竖式的乘法运算，
	// num1的第i位与num2的第j位相乘，结果应该存放在结果的第i+j位上
	for (int i = 0; i < strlenA; ++i)
		for (int j = 0; j < strlenB; ++j)
			bigIntProduct[i + j] += reversedA[i] * reversedB[j];

	for (int i = 0; i < strlenA + strlenB; ++i)
		cout << bigIntProduct[i] << ", "; // --> 3659707060341650
	cout << endl;

	//单独处理进位
	for (int i = 0; i < strlenA + strlenB - 1; ++i)
	{
		bigIntProduct[i] += carry;
		carry = bigIntProduct[i] / 10;
		bigIntProduct[i] %= 10;
	}

	for (int i = 0; i < strlenA + strlenB; ++i)
		cout << bigIntProduct[i] << ", "; // --> 626770070
	cout << endl;

	int printLen = strlenA + strlenB - 1;
	// 查看最后一个进位是否 > 0, 大于零则最高位为1
	if (carry > 0)
	{
		bigIntProduct[strlenA + strlenB - 1] = carry;
		printLen = strlenA + strlenB;
	}
	for (int i = 0; i < printLen; ++i)
		cout << bigIntProduct[printLen - 1 - i]; // --> 70077626
	cout << endl;
	delete[] bigIntProduct;
}

int main()
{
	char *bigIntA = "1234";
	char *bigIntB = "56789";
	BigIntAddition(bigIntA, bigIntB);
	BigIntMultiplication(bigIntA, bigIntB);
	return 0;
}
```


# 最长公共子串

问题：有两个字符串str和str2，求出两个字符串中最长公共子串长度。

比如：str=acbcbcef，str2=abcbced，则str和str2的最长公共子串为bcbce，最长公共子串长度为5。

算法思路：

1、把两个字符串分别以行和列组成一个二维矩阵。
2、比较二维矩阵中每个点对应行列字符中否相等，相等的话值设置为1，否则设置为0。
3、通过查找出值为1的最长对角线就能找到最长公共子串。

针对于上面的两个字符串我们可以得到的二维矩阵如下：
![](/img/some_common_examination/LongestCommonSubstring1.jpg)

从上图可以看到，str和str2共有5个公共子串，但最长的公共子串长度为5。

为了进一步优化算法的效率，我们可以再计算某个二维矩阵的值的时候顺便计算出来当前最长的公共子串的长度，   
即某个二维矩阵元素的值由 `item[i][j]=1` 演变为 `item[i][j]=1 +item[i-1][j-1]` ，这样就避免了后续查找对角线长度的操作了。修改后的二维矩阵如下：
![](/img/some_common_examination/LongestCommonSubstring2.jpg)

故状态转移方程

	X[i] == Y[j]，dp[i][j] = dp[i-1][j-1] + 1
	X[i] != Y[j]，dp[i][j] = 0

``` c++
int LongestCommonSubstring(char* strA, char* strB)
{
	if (!strA || !strB)
		return -1;

	int maxLen = 0;

	int strlenA = static_cast<int>(strlen(strA));
	int strlenB = static_cast<int>(strlen(strB));

	int biggerStrlen = strlenA > strlenB ? (strlenA + 1) : (strlenB + 1);
	char * lcs = new char[biggerStrlen];
	int lcsMaxIndex = 0;

	int** temp = new int*[strlenA];
	for (int i = 0; i < strlenA; ++i)
		temp[i] = new int[strlenB];

	for (int i = 0; i < strlenA; ++i)
	{
		for (int j = 0; j < strlenB; ++j)
		{
			if (strA[i] == strB[j])
			{
				if (i > 0 && j > 0)
					temp[i][j] = temp[i - 1][j - 1] + 1;
				else
					temp[i][j] = 1;
			}
			else
			{
				temp[i][j] = 0;
			}
			if (temp[i][j] > maxLen)
			{
				maxLen = temp[i][j];
				lcsMaxIndex = i;
			}
		}
	}

	for (int i = 0;i < maxLen; ++i)
		*(lcs + maxLen - i - 1) = strA[lcsMaxIndex--];
	*(lcs+maxLen) = '\0';
	cout << lcs << endl;

	for (int i = 0; i < strlenA; ++i)
		delete[] temp[i];
	delete[] temp;

	delete[] lcs;

	return maxLen;
}

int main()
{
	cout << "maxLen = " <<
		LongestCommonSubstring("wwwadfabcdeasdf", "wwweoruqpeorqabcdezcvnz") << endl;
	return 0;
}
```



