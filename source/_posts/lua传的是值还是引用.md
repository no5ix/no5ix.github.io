---
title: lua传的是值还是引用
date: 2015-12-03 10:12:15
tags:
- Lua
categories:
-  Script
---


# 传的是值还是引用?

lua的函数调用传的是值还是引用?

<!-- more -->

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
