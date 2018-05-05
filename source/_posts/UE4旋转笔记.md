---
title: UE4旋转笔记
date: 2016-05-31 18:28:21
tags:
- UE4
categories:
- UE4
---

> 最近想将一个vector转化为rotator，转而需要考虑UE4到底是怎么旋转的。
下面我们做个实验：

![](http://img.blog.csdn.net/20160913104257997?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

> 我们先将两个staticMesh放入场景，并将它们的rotation调成一样，如上图。
上面那个为renti_a_gear，下面那个为renti_a_gear2.

**. . .**<!-- more -->

## 第一种情况： 绕自身坐标系来旋转

![](http://img.blog.csdn.net/20160913105150452?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

> 如上图，
两个staticMesh旋转之后rotation是一样的，
可以证明，绕自身坐标系旋转的顺序是Z->Y->X



## 第二种情况： 绕世界坐标系来旋转

![](http://img.blog.csdn.net/20160913110908943?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

> 如上图，两个staticMesh旋转之后rotation是一样的，可以证明，绕世界坐标系旋转的顺序跟第一种情况刚好反过来， 是X->Y->Z