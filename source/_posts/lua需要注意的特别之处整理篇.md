---
title: lua需要注意的特别之处整理篇
date: 2017-11-03 10:12:15
tags:
---

<!-- TOC -->
1. [传的是值还是引用?](#%E4%BC%A0%E7%9A%84%E6%98%AF%E5%80%BC%E8%BF%98%E6%98%AF%E5%BC%95%E7%94%A8)
    1. [测试代码](#%E6%B5%8B%E8%AF%95%E4%BB%A3%E7%A0%81)
    2. [打印结果](#%E6%89%93%E5%8D%B0%E7%BB%93%E6%9E%9C)
    3. [结论](#%E7%BB%93%E8%AE%BA)
<!-- TOC -->

# 传的是值还是引用?

lua的函数调用传的是值还是引用?

## 测试代码

``` lua
tTableForTest = {}

tTableForTest[1] = 9

function testTable(tTable)
    tTable[1] = 11
end

print("tTableForTest[1]".." : "..tTableForTest[1])
testTable(tTableForTest)
print("tTableForTest[1]".." : "..tTableForTest[1])

print("\n==================\n")

nNumberForTest = 1
function TestNumber( nNumber )
    nNumber = 99
end

print("nNumberForTest".." : "..nNumberForTest)
TestNumber(nNumberForTest)
print("nNumberForTest".." : "..nNumberForTest)

print("\n==================\n")

nStringForTest = "hi"
function TestNumber( nString )
    nString = "hello"
end

print("nStringForTest".." : "..nStringForTest)
TestNumber(nStringForTest)
print("nStringForTest".." : "..nStringForTest)
```

## 打印结果

```
tTableForTest[1] : 9
tTableForTest[1] : 11

==================

nNumberForTest : 1
nNumberForTest : 1

==================

nStringForTest : hi
nStringForTest : hi
```

## 结论

- table传引用
- number传值
- string传值
