---
title: 地图加载完毕后的回调
date: 2018-07-20 22:24:34
tags:
- UE4
- Zen
categories:
- UE4
password: 233
---

# 在地图加载完后的回调

首先自定义一个 UObject，UObject 可以跨地图存在。

**. . .**<!-- more -->

Object 如果切换地图的时候如果没有对它有引用的话，会自动释放掉，如果不让他释放的话，可以在GameInstance 里面用一个指针指向这个Obj。
或者是Obj 生成的时候，在构造函数加上

``` c++
this->AddToRoot()
```
地图加载完成后的回调：

``` c++
// ExcuteFun 函数是回调会执行的函数
FCoreUObjectDelegates::PostLoadMap.AddUObject(this, &UMyObject::ExcuteFun);
FCoreUObjectDelegates::PostLoadMapWithWorld.AddUObject(this, &UMyObject::ExcuteFun);
```

上面的是老版本的用法，如 ` void UMyObject::ExcuteFun()){} `
下面的是新版本的用法，需要在绑定函数的参数添加上 UWorld* 的参数，
如
``` c++
void UMyObject::ExcuteFun(UWorld* world)){}
```

添加了AddToRoot函数，再使用完成后就必须要记得

``` c++
this->RemoveFromRoot()
```

`-- encrypted`
