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
![](/img/some_common_examination/greatest_common_divisor.png)

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

## 递归解

``` c++
int SumWaysOfMoveOnChessBoard_Recursion(int m, int n) 
{
    if (m == 0 && n == 0)
        return 0;
    if (m==0 || n==0)
        return 1;
    return process(m, n - 1) + process(m - 1, n);
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

``` c++
void BigIntAddition(char* bigIntA, char* bigIntB)
{
	size_t strlenA = strlen(bigIntA);
	size_t strlenB = strlen(bigIntB);
	size_t biggerStrlen = strlenA > strlenB ? strlenA : strlenB;

	int* reversedA = new int[biggerStrlen];
	int* reversedB = new int[biggerStrlen];
	// 先将例子中的 1234 和 98765 逆序存储, 不够的补零, 方便计算
	for (size_t i = 0; i < biggerStrlen; ++i)
	{
		// 这里要注意有符号数和非符号数相减之后要强制转换才能与 0 做正确的比较, 
		// 不强制转换的话strlenA - 1 - i为负数, 也就是一个非常大的正整数
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
		bigIntSum[biggerStrlen] = 1;
		printLen = biggerStrlen + 1;
	}
	for (size_t i = 0; i < printLen; ++i)
		cout << bigIntSum[printLen - 1 - i]; // --> 58023
}

int main()
{
	{
		char *bigIntA = "1234";
		char *bigIntB = "56789";
		BigIntAddition(bigIntA, bigIntB);
		return 0;
	}
}
```