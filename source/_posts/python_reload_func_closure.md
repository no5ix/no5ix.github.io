---
title: python的reload对于func_closure的处理踩坑
date: 2021-05-08 17:55:26
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

def log(func):
	def _call_func(*args, **kw):
		print 'call ' + func.__name__
		return func(*args, **kw)
	return _call_func


def print_text(text):
	def _wrap_log(func):
		def _call_func(*args, **kwargs):
			print text
			return func(*args, **kwargs)
		return _call_func
	return _wrap_log


@log
@print_text('test_texttt')
def test_log():
	print "miao !"


for cell in test_log.func_closure:
	cc = cell.cell_contents
test_log()

```

debug断点查看一波, **发现func_closure里还有 function object**
<!-- ![python_func_closure_3](/img/python_func_closure/python_func_closure_3.png) -->

那reload需要对含有闭包的情况进行一些简单处理: 
python如果被更新的函数带 closure，新旧函数的 func_closure 个数不同的话，旧函数会被新函数直接替换。closure 内的函数对象也会跟着热更新，也就是说支持热更新被装饰器装饰的函数，默认值更新 2 层，有需要更多的层的项目可以改变 update_cell_depth 的值

``` python
def update_fun( old_fun, new_fun, update_cell_depth = 2 ):
    old_cell_num = 0
    if old_fun.func_closure:
        old_cell_num = len( old_fun.func_closure )
    new_cell_num = 0
    if new_fun.func_closure:
        new_cell_num = len( new_fun.func_closure )

    if old_cell_num != new_cell_num:
        return False

    setattr(old_fun, 'func_code', new_fun.func_code )
    setattr(old_fun, 'func_defaults', new_fun.func_defaults )
    setattr(old_fun, 'func_doc', new_fun.func_doc )
    setattr(old_fun, 'func_dict', new_fun.func_dict )

    if not (update_cell_depth and old_cell_num ):
        return True

    for index, cell in enumerate(old_fun.func_closure):
        if inspect.isfunction(cell.cell_contents):
            update_fun(cell.cell_contents, new_fun.func_closure[index].cell_contents, update_cell_depth - 1)

    return True
```