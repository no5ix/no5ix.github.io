---
title: 一个例子窥探python的func_closure
date: 2019-07-06 17:55:26
tags:
- Python
categories:
- Script
---


带着问题学习动力是较强的, 直接上例子

**. . .**<!-- more -->

代码如下：

``` python
# coding:utf-8

def make_actions():
	acts = []
	xxd = {1: '1', 2: '2', 3: '3'}
	for k, v in xxd.iteritems():
		acts.append(lambda x: (k + int(v)) ** x)
	return acts


foo = make_actions()
print(foo[0](2))
print(foo[1](2))
print(foo[2](2))
```

众所周知, 结果肯定为:

```
36
36
36
```

因为这个闭包引用了外部的k, v嘛, 那是存在哪里呢?

debug一波, 此时发现func_closure是这样存的
![python_func_closure_1](/img/python_func_closure/python_func_closure_1.png)


把 `make_actions` 改成
``` python
def make_actions():
	acts = []
	xxd = {1: '1', 2: '2', 3: '3'}
	for k, v in xxd.iteritems():
		acts.append(lambda x, key=k, val=v, : (key + int(val)) ** x)
	return acts
```
再debug断点查看一波就完事了
实现python热更逻辑的时候要记得处理func_closure