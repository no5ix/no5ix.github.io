---
title: python的reload对于func_closure的处理
date: 2019-07-08 17:55:26
tags:
- Python
categories:
- Script
---


带着问题学习动力是较强的, 直接上例子

**. . .**<!-- more -->

# 引子

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
再debug断点查看一波就完事了, 会发现现在 `func_defaults` 里现在有东西了
![python_func_closure_2](/img/python_func_closure/python_func_closure_2.png)


# 基于函数替换型reload中的应用

实现python热更逻辑的时候要记得处理func_closure

如类似下方的这段代码要怎么reload呢?

``` python
def gg_make_actions():
	acts = []
	xxd_dict = {1: '1', 2: '2', 3: '3'}
	for k, v in xxd_dict.iteritems():
		lb = lambda l, val=int(v): val + l
		acts.append(lambda x: lb(x))
	return acts


bar = gg_make_actions()
print(bar[0](2))
print(bar[1](2))
print(bar[2](2))
```

debug断点查看一波, 发现func_closure里还有 function object
![python_func_closure_3](/img/python_func_closure/python_func_closure_3.png)

那reload需要对含有闭包的情况进行一些简单处理: 

``` python
def replace_func(new_func, old_func, is_closure = False):
    # 简单的closure的处理
    re_attrs = ('func_doc', 'func_code', 'func_dict', 'func_defaults')
    for attr_name in re_attrs:
        setattr(old_func, attr_name, getattr(new_func, attr_name, None))
    if not is_closure:
        old_cell_nums = len(old_func.func_closure) if old_func.func_closure else 0
        new_cell_nums = len(new_func.func_closure) if new_func.func_closure else 0
        if new_cell_nums and new_cell_nums == old_cell_nums:
            for idx, cell in enumerate(old_func.func_closure):
                if inspect.isfunction(cell.cell_contents):
                    do_replace_func(new_func.func_closure[idx].cell_contents, cell.cell_contents, True)
```