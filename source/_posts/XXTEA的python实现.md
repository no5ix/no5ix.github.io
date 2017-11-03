---
title: XXTEA的python实现
date: 2016-09-13 02:04:00
tags:
- python
- xxtea
categories:
- 脚本
---

在数据的加解密领域，算法分为对称密钥与非对称密钥两种。

对称密钥与非对称密钥由于各自的特点，所应用的领域是不尽相同的。

对称密钥加密算法由于其速度快，一般用于整体数据的加密，而非对称密钥加密算法的安全性能佳，在数字签名领域得到广泛的应用。

微型加密算法（TEA）及其相关变种（XTEA，Block TEA，XXTEA） 都是分组加密算法，它们很容易被描述，实现也很简单（典型的几行代码）。



TEA是Tiny Encryption Algorithm的缩写，以加密解密速度快，实现简单著称。

TEA 算法最初是由剑桥计算机实验室的 David Wheeler 和 Roger Needham 在 1994 年设计的。

该算法使用 128 位的密钥为 64 位的信息块进行加密，它需要进行 64 轮迭代，尽管作者认为 32 轮已经足够了。

该算法使用了一个神秘常数δ作为倍数，它来源于黄金比率，以保证每一轮加密都不相同。

但δ的精确值似乎并不重要，这里 TEA 把它定义为 δ=「(√5 - 1)231」（也就是程序中的 0×9E3779B9）。



之后 TEA 算法被发现存在缺陷，作为回应，设计者提出了一个 TEA 的升级版本——XTEA（有时也被称为“tean”）。

XTEA 跟 TEA 使用了相同的简单运算，但它采用了截然不同的顺序，为了阻止密钥表攻击，四个子密钥（在加密过程中，原 128 位的密钥被拆分为 4 个 32 位的子密钥）采用了一种不太正规的方式进行混合，但速度更慢了。



在跟描述 XTEA 算法的同一份报告中，还介绍了另外一种被称为 Block TEA 算法的变种，它可以对 32 位大小任意倍数的变量块进行操作。

该算法将 XTEA 轮循函数依次应用于块中的每个字，并且将它附加于它的邻字。

该操作重复多少轮依赖于块的大小，但至少需要 6 轮。

该方法的优势在于它无需操作模式（CBC，OFB，CFB 等），密钥可直接用于信息。

对于长的信息它可能比 XTEA 更有效率。



在 1998 年，Markku-Juhani Saarinen 给出了一个可有效攻击 Block TEA 算法的代码，但之后很快 David J. Wheeler 和 Roger M. Needham 就给出了 Block TEA 算法的修订版，这个算法被称为 XXTEA。

XXTEA 使用跟 Block TEA 相似的结构，但在处理块中每个字时利用了相邻字。

它利用一个更复杂的 MX 函数代替了 XTEA 轮循函数，MX 使用 2 个输入量。



XXTEA 算法很安全，而且非常快速，非常适合应用于 Web 开发中。

{% asset_img py_xxtea1.png %}


TEA算法是由剑桥大学计算机实验室的David Wheeler和Roger Needham于1994年发明，

TEA是Tiny Encryption Algorithm的缩写，以加密解密速度快，实现简单著称。

TEA算法每一次可以操作64bit(8byte)，采用128bit(16byte)作为key，算法采用迭代的形式，推荐的迭代轮数是64轮，最少32轮。

为解决TEA算法密钥表攻击的问题，TEA算法先后经历了几次改进，从XTEA到BLOCK TEA，直至最新的XXTEA。

XTEA也称做TEAN，它使用与TEA相同的简单运算，但四个子密钥采取不正规的方式进行混合以阻止密钥表攻击。

Block TEA算法可以对32位的任意整数倍长度的变量块进行加解密的操作，该算法将XTEA轮循函数依次应用于块中的每个字，并且将它附加于被应用字的邻字。

XXTEA使用跟Block TEA相似的结构，但在处理块中每个字时利用了相邻字，且用拥有两个输入量的MX函数代替了XTEA轮循函数。



``` python

import struct  
  
_DELTA = 0x9E3779B9  
  
def _long2str(v, w):  
    n = (len(v) - 1) << 2  
    if w:  
        m = v[-1]  
        if (m < n - 3) or (m > n): return ''  
        n = m  
    s = struct.pack('<%iL' % len(v), *v)  
    return s[0:n] if w else s  
  
def _str2long(s, w):  
    n = len(s)  
    m = (4 - (n & 3) & 3) + n  
    s = s.ljust(m, "\0")  
    v = list(struct.unpack('<%iL' % (m >> 2), s))  
    if w: v.append(n)  
    return v  
  
def encrypt(str, key):  
    if str == '': return str  
    v = _str2long(str, True)  
    k = _str2long(key.ljust(16, "\0"), False)  
    n = len(v) - 1  
    z = v[n]  
    y = v[0]  
    sum = 0  
    q = 6 + 52 // (n + 1)  
    while q > 0:  
        sum = (sum + _DELTA) & 0xffffffff  
        e = sum >> 2 & 3  
        for p in xrange(n):  
            y = v[p + 1]  
            v[p] = (v[p] + ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z))) & 0xffffffff  
            z = v[p]  
        y = v[0]  
        v[n] = (v[n] + ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum ^ y) + (k[n & 3 ^ e] ^ z))) & 0xffffffff  
        z = v[n]  
        q -= 1  
    return _long2str(v, False)  
  
def decrypt(str, key):  
    if str == '': return str  
    v = _str2long(str, False)  
    k = _str2long(key.ljust(16, "\0"), False)  
    n = len(v) - 1  
    z = v[n]  
    y = v[0]  
    q = 6 + 52 // (n + 1)  
    sum = (q * _DELTA) & 0xffffffff  
    while (sum != 0):  
        e = sum >> 2 & 3  
        for p in xrange(n, 0, -1):  
            z = v[p - 1]  
            v[p] = (v[p] - ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z))) & 0xffffffff  
            y = v[p]  
        z = v[n]  
        v[0] = (v[0] - ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum ^ y) + (k[0 & 3 ^ e] ^ z))) & 0xffffffff  
        y = v[0]  
        sum = (sum - _DELTA) & 0xffffffff  
    return _long2str(v, True)  
  
if __name__ == "__main__":  
    print decrypt(encrypt('Hello XXTEA!', '16bytelongstring'), '16bytelongstring') 

```

