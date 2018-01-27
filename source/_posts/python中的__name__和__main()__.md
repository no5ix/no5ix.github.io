---
title: python中的__name__和__main()__
date: 2015-02-10 22:19:29
tags:
- Python
categories:
- 脚本
---



``` python
#hello.py
def sayHello():
    str="hello"
    print(str);

if __name__ == "__main__":
    print ('This is main of module "hello.py"')
    sayHello()
```

python作为一种脚本语言，我们用python写的各个module都可以包含以上那么一个累死c中的main函数，只不过python中的这种`__main__`与c中有一些区别，类似于php的魔术那一套, 主要体现在：

1、当单独执行该module时，比如单独执行以上hello.py： python hello.py，则输出

    
```
This is main of module "hello.py"
hello
```


可以理解为`"if __name__=="__main__":" `这一句与c中的main()函数所表述的是一致的，即作为入口；

2、当该module被其它module 引入使用时，其中的`"if __name__=="__main__":"`

所表示的Block不会被执行,

这是因为此时module被其它module引用时，

其`__name__`的值将发生变化，`__name__`的值将会是module的名字。

比如在python shell中import hello后，查看`hello.__name__`：

``` python
import hello
hello.__name__
'hello'
```

3、因此，在python中，当一个module作为整体被执行时,moduel.__name__的值将是`"__main__"；`

而当一个module被其它module引用时，`module.__name__`将是module自己的名字，

当然一个module被其它module引用时，其本身并不需要一个可执行的入口main了。