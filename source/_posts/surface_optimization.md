---
title: Surface使用优化
date: 2019-08-13 00:53:26
tags:
- Surface
categories:
- Misc
---




# 亮度修复方法:

一劳永逸的办法注册表修改键值：

1. win+R，输入regedit，回车
2. 导航到HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000 或者 0001 的右边找到FeatureTestControl
3. 双击键值，将9240更改为9250，重启即可。看不懂的，原文详细如下：

**. . .**<!-- more -->

	
# 网速慢修复方法:

1. Press Windows button. Search for Regedit. Open it
2. Navigate to the following path: HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Services\mrvlpcie8897
3. Find the item labeled "TXAMSDU." Double tap and modify the value from 1 to 0
4. Restart the machine

link: https://www.windowscentral.com/surface-pro-4-slow-wi-fi-fix


# 解决掉TF卡问题

在解决之前搜了很多方法.包括什么高性能 更新驱动 改注册表 都不行

或许有的人因为兼容问题通过以上的方法可以解决.但是我依然还存在这个情况. 后来经过研究发现是插口断电导致的 现在已经解决 此贴分享给与我一样情况的小伙伴们 :

1. 设备管理器-通用串行总线控制器-Realtek USB 3.0 Card Reader-更新驱动程序-浏览我的计算机查找驱动-让我从计算机上可用驱动列表查找-USB大容量设备(这个步骤把SD卡接口驱动改为USB驱动, 然后你会发现原来的 `Realtek USB 3.0 Card Reader` 变成了 `USB大容量存储设备`

2. 设备管理器-通用串行总线控制器-USB大容量存储设备-属性-电源管理-允许计算机关闭此设备以节省电源(不勾选)