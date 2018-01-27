---
title: python的struct模块
date: 2015-03-02 21:49:19
tags:
- Python
categories:
- 脚本
---


> struct, 这玩意c/c++也有, 顾名思义, 能联想到这玩意是啥了

模块的主要作用就是对python基本类型值与

用python字符串格式表示的C struct类型间

的转化（This module performs conversions between Python values and C structs represented as Python strings.）

## 基本用法

``` python
import struct
import binascii
values = (1, 'abc', 2.7)
s = struct.Struct('I3sf')
packed_data = s.pack(*values)
unpacked_data = s.unpack(packed_data)
 
print 'Original values:', values
print 'Format string :', s.format
print 'Uses :', s.size, 'bytes'
print 'Packed Value :', binascii.hexlify(packed_data)
print 'Unpacked Type :', type(unpacked_data), ' Value:', unpacked_data
```

输出为: 
```
Original values: (1, 'abc', 2.7) 
Format string : I3sf 
Uses : 12 bytes 
Packed Value : 0100000061626300cdcc2c40 
Unpacked Type : <type 'tuple'>  Value: (1, 'abc', 2.700000047683716)
```

代码中，

首先定义了一个元组数据，

包含int、string、float三种数据类型，

然后定义了struct对象，并制定了format‘I3sf’，

- I 表示int，

- 3s表示三个字符长度的字符串，

- f 表示 float。最后通过struct的pack和unpack进行打包和解包。通过输出结果可以发现，

value被pack之后，

转化为了一段二进制字节串，

而unpack可以把该字节串再转换回一个元组，

但是值得注意的是对于float的精度发生了改变，

这是由一些比如操作系统等客观因素所决定的。打包之后的数据所占用的字节数与C语言中的struct十分相似。定义format可以参照官方api提供的对照表：

{% asset_img py_struct1.png %}


## 字节序设置

另一方面，打包的后的字节顺序默认上是由操作系统的决定的，

当然struct模块也提供了自定义字节顺序的功能，

可以指定大端存储、小端存储等特定的字节顺序，

对于底层通信的字节顺序是十分重要的，

不同的字节顺序和存储方式也会导致字节大小的不同。在format字符串前面加上特定的符号即可以表示不同的字节顺序存储方式，

例如采用小端存储 s = struct.Struct(‘<I3sf’)就可以了。官方api library 也提供了相应的对照列表：

{% asset_img py_struct2.png %}