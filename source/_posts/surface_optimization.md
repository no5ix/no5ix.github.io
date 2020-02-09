---
title: Surface使用优化
date: 2019-08-13 00:53:26
tags:
- Surface
categories:
- Misc
---


# windows更新之后windows hello出问题

比如报出以下问题:
- 识别反应慢
- 解锁之后摄像头的指示灯还在亮

尝试回退或者重装以下驱动:
- Biometric devices(Windows Hello Face Software Device或者类似的名字)
- Cameras(Surface Camera Front / Surfa IR Camera Front 或者其他的名字)
- Display adapters(你没看错, 显卡驱动也会影响windows hello...)


# 触摸板某些三指或四指手势在某些app中无法使用

原因是触摸板的手势无法在以管理员启动的app中使用, 因为没找到触摸板是哪个程序启动的, 所以解决办法是以管理员运行所有程序(这样就包括触摸板也以管理员启动了), 参考{% post_link windows_run_everything_as_admin %}


# 亮度忽明忽暗的修复方法(都不完美):

- (*这种方法会有个开机启动项, 而且好像会造成instant-on功能失效*) 去 MicroSoft Store 下载安装 英特尔显卡控制中心, 然后 打开之后, 系统-功率-显示器节能
- (*这种方法每次更新系统都有可能又失效了, 而且有时候会无法调节亮度, 重启又好了*) 注册表修改键值：
	1\. `win+R`，输入`regedit`，回车
	2\. 导航到 `计算机\HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0001` 或者 `0001` 的右边找到`FeatureTestControl`
	3\. 双击键值，将`9240`更改为`9250`，重启即可。

**. . .**<!-- more -->


# 打开高级电源计划调整选项

不建议改, 用默认预装的电源计划即可, 自己配的有各种问题, 比如instant-on失效, 比如盒盖不能听歌, 等等等等...

The limited power configuration in Advanced Settings because of Connected Standby feature that enabled by default on every Surface devices. In order to create a new power plan with optimized advanced settings, we need to disable connected standby via Registry Editor.

To turn off connected standby:

1. press `Win + R`
2. Type `regedit` to open Register Editor. 
3. Now you need to go to 
   ```
   HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Power
   ```
4. Double click on CsEnabled and change Value data from 1 to 0, and click OK.
5. Restart your computer to apply these changes to your system.
6. After restarting your computer, now you can access the full list of power plans and individual advanced settings.

	
# 网速慢修复方法:

1. Press Windows button. Search for Regedit. Open it
2. Navigate to the following path: HKEY_LOCAL_MACHINE\SYSTEM\ControlSet001\Services\mrvlpcie8897
3. Find the item labeled "TXAMSDU." Double tap and modify the value from 1 to 0
4. Restart the machine

link: https://www.windowscentral.com/surface-pro-4-slow-wi-fi-fix


# 解决surface pro掉TF卡问题

在解决之前搜了很多方法.包括什么高性能 更新驱动 改注册表 都不行

或许有的人因为兼容问题通过以上的方法可以解决.但是我依然还存在这个情况. 后来经过研究发现是插口断电导致的 现在已经解决 此贴分享给与我一样情况的小伙伴们 :

1. 设备管理器-通用串行总线控制器-Realtek USB 3.0 Card Reader-更新驱动程序-浏览我的计算机查找驱动-让我从计算机上可用驱动列表查找-USB大容量设备(这个步骤把SD卡接口驱动改为USB驱动, 然后你会发现原来的 `Realtek USB 3.0 Card Reader` 变成了 `USB大容量存储设备`

2. 设备管理器-通用串行总线控制器-USB大容量存储设备-属性-电源管理-允许计算机关闭此设备以节省电源(不勾选)