---
title: python单例实现之详解元类和type和__call__和__new__和__init__
date: 2020-06-17 15:16:26
tags:
- Python
categories:
- Script
---


python的单例实现方式茫茫多, 讲道理, 其实是违背python之禅的:

> There should be one-- and preferably only one --obvious way to do it. 用一种方法，最好是只有一种方法来做一件事

```
>>> import this
The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!
```

**. . .**<!-- more -->


任何事物都有一个从创建，被使用，再到消亡的过程，在程序语言面向对象编程模型中，对象也有相似的命运：创建、初始化、使用、垃圾回收，不同的阶段由不同的方法（角色）负责执行。

定义一个类时，大家用得最多的就是 `__init__` 方法，而 `__new__` 和 `__call__` 使用得比较少，这篇文章试图帮助大家把这 3 个方法的正确使用方式和应用场景分别解释一下。

关于 Python 新式类和老式类在这篇文章不做过多讨论，因为老式类是 Python2 中的概念，现在基本没人再会去用老式类，新式类必须显示地继承 object，而 Python3 中，只有新式类，默认继承了 object，无需显示指定，本文代码都是基于 Python3 来讨论。


# `__init__`方法
----------

`__init__` 方法负责对象的初始化，系统执行该方法前，其实该对象已经存在了，要不然初始化什么东西呢？先看例子：

``` python
# class A(object): python2 必须显示地继承object
class A:
    def __init__(self):
        print("__init__ ")
        super(A, self).__init__()

    def __new__(cls):
        print("__new__ ")
        return super(A, cls).__new__(cls)

    def __call__(self):  # 可以定义任意参数
        print('__call__ ')

A()

```

输出

```
__new__
__init__

```

从输出结果来看， `__new__`先被调用，返回一个实例对象，接着 `__init__` 被调用。 `__call__` 方法并没有被调用，这个我们放到最后说，先来说说前面两个方法，稍微改写成：

``` python
def __init__(self):
    print("__init__ ")
    print(self)
    super(A, self).__init__()

def __new__(cls):
    print("__new__ ")
    self = super(A, cls).__new__(cls)
    print(self)
    return self

```

输出：

```
__new__ 
<__main__.A object at 0x1007a95f8>
__init__ 
<__main__.A object at 0x1007a95f8>

```

从输出结果来看， `__new__` 方法的返回值就是类的实例对象，这个实例对象会传递给 `__init__` 方法中定义的 self 参数，以便实例对象可以被正确地初始化。

如果 `__new__` 方法不返回值（或者说返回 None）那么 `__init__` 将不会得到调用，这个也说得通，因为实例对象都没创建出来，调用  `__init__` 也没什么意义，此外，Python 还规定， `__init__` 只能返回 None 值，否则报错，这个留给大家去试。

`__init__`方法可以用来做一些初始化工作，比如给实例对象的状态进行初始化：

``` python
def __init__(self, a, b):
    self.a = a
    self.b = b
    super(A, self).__init__()

```


# `__new__ `方法
----------

一般我们不会去重写该方法，除非你确切知道怎么做，什么时候你会去关心它呢，它作为构造函数用于创建对象，是一个工厂函数，专用于生产实例对象。著名的设计模式之一，单例模式，就可以通过此方法来实现。在自己写框架级的代码时，可能你会用到它，我们也可以从开源代码中找到它的应用场景，例如微型 Web 框架 Bootle 就用到了。

``` python
class BaseController(object):
    _singleton = None
    def __new__(cls, *a, **k):
        if not cls._singleton:
            cls._singleton = object.__new__(cls, *a, **k)
        return cls._singleton

```

这段代码出自 [https://github.com/bottlepy/bottle/blob/release-0.6/bottle.py](https://link.zhihu.com/?target=https%3A//link.juejin.im/%3Ftarget%3Dhttps%253A%252F%252Fgithub.com%252Fbottlepy%252Fbottle%252Fblob%252Frelease-0.6%252Fbottle.py)

这就是通过 `__new__` 方法是实现单例模式的的一种方式，如果实例对象存在了就直接返回该实例即可，如果还没有，那么就先创建一个实例，再返回。当然，实现单例模式的方法不只一种，Python 之禅有说：

> There should be one-- and preferably only one --obvious way to do it. 用一种方法，最好是只有一种方法来做一件事


# `__call__` 方法
-----------

关于 `__call__` 方法，不得不先提到一个概念，就是_可调用对象（callable）_，我们平时自定义的函数、内置函数和类都属于可调用对象，但凡是可以把一对括号 () 应用到某个对象身上都可称之为可调用对象，判断对象是否为可调用对象可以用函数 callable

如果在类中实现了 `__call__` 方法，那么实例对象也将成为一个可调用对象，我们回到最开始的那个例子：

``` python
a = A()
print(callable(a))  # True

```

a 是实例对象，同时还是可调用对象，那么我就可以像函数一样调用它。试试：

``` python
a()  # __call__

```

很神奇不是，实例对象也可以像函数一样作为可调用对象来用，那么，这个特点在什么场景用得上呢？这个要结合类的特性来说，类可以记录数据（属性），而函数不行（闭包某种意义上也可行），利用这种特性可以实现基于类的装饰器，在类里面记录状态，比如，下面这个例子用于记录函数被调用的次数：

``` python
class Counter:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        return self.func(*args, **kwargs)

@Counter
def foo():
    pass

for i in range(10):
    foo()

print(foo.count)  # 10

```

在 Bottle 中也有 `__call__` 方法 的使用案例，另外，[stackoverflow](https://link.zhihu.com/?target=https%3A//link.juejin.im/%3Ftarget%3Dhttps%253A%252F%252Fstackoverflow.com%252Fquestions%252F5824881%252Fpython-call-special-method-practical-example) 也有一些关于 `__call__` 的实践例子，推荐看看，如果你的项目中，需要更加抽象化、框架代码，那么这些高级特性往往能发挥出它作用。


# type

type有一种完全不同的能力，它也能动态的创建类。type可以接受一个类的描述作为参数，然后返回一个类。（我知道，根据传入参数的不同，同一个函数拥有两种完全不同的用法是一件很傻的事情，但这在Python中是为了保持向后兼容性）

type可以像这样工作：
``` python
type(类名, 父类的元组（针对继承的情况，可以为空），包含属性的字典（名称和值）)
```

比如下面的代码：
```
>>> class MyShinyClass(object):
…       pass
 可以手动像这样创建：

>>> MyShinyClass = type('MyShinyClass', (), {})  # 返回一个类对象
>>> print MyShinyClass
<class '__main__.MyShinyClass'>
>>> print MyShinyClass()  #  创建一个该类的实例
<__main__.MyShinyClass object at 0x8997cec>
```


# 元类


除了使用type()动态创建类以外，要控制类的创建行为，还可以使用metaclass。

metaclass，直译为元类，简单的解释就是：

当我们定义了类以后，就可以根据这个类创建出实例，所以：先定义类，然后创建实例。

但是如果我们想创建出类呢？那就必须根据metaclass创建出类，所以：先定义metaclass，然后创建类。

连接起来就是：先定义metaclass，就可以创建类，最后创建实例。

所以，metaclass允许你创建类或者修改类。换句话说，你可以把类看成是metaclass创建出来的“实例”。


## 基础知识

1. 类由type创建，创建类时，type的 `__init__` 方法自动执行，类() 执行type的 `__call__` 方法(类的 `__new__` 方法,类的 ``__init__`` 方法)
2. 对象由类创建，创建对象时，类的 `__init__` 方法自动执行，对象()执行类的 `__call__` 方法


## 例子1

``` python
class Foo:
    def __init__(self):
        pass

    def __call__(self, *args, **kwargs):
        pass

# 执行type的 __call__ 方法，调用 Foo类（是type的对象）的 `__new__`，用于创建对象，然后调用 Foo类（是type的对象）的 `__init__`方法，用于对对象初始化。
obj = Foo()

# 执行Foo的 __call__ 方法   
obj() 
```


## 例子2

我们再看一个简单的例子，这个metaclass可以给我们自定义的MyList增加一个add方法：

定义ListMetaclass，按照默认习惯，metaclass的类名总是以Metaclass结尾，以便清楚地表示这是一个metaclass：

``` python
# metaclass是类的模板，所以必须从`type`类型派生：
class ListMetaclass(type):
    def __new__(cls, name, bases, attrs):
        attrs['add'] = lambda self, value: self.append(value)
        return type.__new__(cls, name, bases, attrs)
```

有了ListMetaclass，我们在定义类的时候还要指示使用ListMetaclass来定制类，传入关键字参数metaclass：
``` python
class MyList(list, metaclass=ListMetaclass):
    pass
```
当我们传入关键字参数metaclass时，魔术就生效了，它指示Python解释器在创建MyList时，要通过`ListMetaclass.__new__()`来创建，在此，我们可以修改类的定义，比如，加上新的方法，然后，返回修改后的定义。

`__new__()`方法接收到的参数依次是：

1. 当前准备创建的类的对象；
2. 类的名字；
3. 类继承的父类集合；
4. 类的方法集合。

测试一下MyList是否可以调用add()方法：
```
>>> L = MyList()
>>> L.add(1)
>> L
[1]
```

而普通的list没有add()方法：
```
>>> L2 = list()
>>> L2.add(1)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'list' object has no attribute 'add'
```


## 元类的使用-单例

Python做了如下的操作：

Foo中有`__metaclass__`这个属性吗？如果是，Python会在内存中通过__metaclass__创建一个名字为Foo的类对象（我说的是类对象，请紧跟我的思路）。如果Python没有找到`__metaclass__`，它会继续在Bar（父类）中寻找`__metaclass__`属性，并尝试做和前面同样的操作。如果Python在任何父类中都找不到`__metaclass__`，它就会在模块层次中去寻找`__metaclass__`，并尝试做同样的操作。如果还是找不到`__metaclass__`,Python就会用内置的type来创建这个类对象。

现在的问题就是，你可以在`__metaclass__`中放置些什么代码呢？答案就是：可以创建一个类的东西。那么什么可以用来创建一个类呢？type，或者任何使用到type或者子类化type的东东都可以。

``` python
class SingletonType(type):
    _instance = None

    def __call__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = type.__call__(cls, *args, **kwargs)
            # 或者也可以写成下面这样:
            # cls._instance = super(SingletonType, cls).__call__(*args, **kwargs)
        return cls._instance


class Foo(object): # 指定创建Foo的type为SingletonType

    __metaclass__ = SingletonType

    def __init__(self,name):
        self.name = name


objxx = Foo('xx')
print objxx.name
objtt = Foo('tt')
print objtt.name
print(id(objxx) == id(objtt))
print objxx.name
```

元类就是用来创建类的“东西”。你创建类就是为了创建类的实例对象，不是吗？但是我们已经学习到了Python中的类也是对象。好吧，元类就是用来创建这些类（对象）的，元类就是类的类，你可以这样理解 为：
``` python
MyClass = MetaClass()
MyObject = MyClass()
```

经过上述[基础知识](#基础知识)我们知道:
因为我们没有重新定义SingletonType的`__new__`, 所以Foo类本身还是type直接生成, 然后

那这里Foo('xx') 和 Foo('tt')其实执行SingletonType的`__call__`方法里的type的 `__call__` 方法，调用 Foo类（是type的对象）的 `__new__`方法，用于创建obj对象，然后调用 Foo类（是type的对象）的 `__init__`方法，用于对obj对象初始化。

