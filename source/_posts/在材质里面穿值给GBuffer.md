---
title: 在材质传值给GBuffer
date: 2018-08-05 22:22:34
tags:
- UE4
- Zen
categories:
- UE4
---

**. . .**<!-- more -->


# 在材质里面传值给GBuffer

## 在材质里面设置一个值
如果需要在材质里面设置一个值，然后把这个值传给GBuffer，然后可以通过设置这个值来动态修改效果，就像材质实例一般。</br>
首先在材质里面传值，首先可以自定义一个 shadermodel，然后把这个 shadermodel 的customdata1 的pin 打开。当然也可以不通过 customdata1 来传值。也可以通过在材质细节里面，找到Num Customized UVs 改成1，然后通过这里 pin 来传值。当然也可以通过 Base Color, Metallic 这些，这一部其实只是为了传值进去而已。并无所谓是在哪里传值。而选择customdata1 的意义只是因为这个节点一般不会被使用到，传值到这里去并不会影响到其它。只要确定传进去的值不会被其它地方用到。怎么传其实都无所谓的。

## 把值设置给GBuffer

打开引擎文件中的 Shaders/Private/ShadingModelsMaterial.ush，这个文件就是引擎由ShderModel 设置GBuffer 的地方。</br>
进到这个文件后，找到自定义的shader model，或者直接修改引擎自带的shader model。然后写下如下代码：
``` c++
    float TmpValue = saturate( GetMaterialCustomData1(MaterialParameters) );
    GBuffer.CustomData.y = TmpValue;
```
这样之后，GBuffer 中的 CustomData.y 就和材质里面你设置的值绑定了。然后你就可以在需要传值的地方传 GBuffer.CustomData.y 就可以了。

## 注意点

这个做法首先要确保绑定的GBuffer 的值没有和其它效果关联。不然的话，修改值的同时也会影响到其它效果。