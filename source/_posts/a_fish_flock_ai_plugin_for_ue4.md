---
title: 一个基于虚幻4群聚鱼群AI插件
date: 2016-10-18 19:29:22
tags:
- GitHub
- AI
- UE4
- CPP
categories:
- GitHub
top: 4
---


A fish flock AI Plugin for Unreal Engine 4
一个基于虚幻4的鱼群 AI 插件

this Plugin version can Run **2000+** fishes at the same time
这个插件版本可以同时运行 **2000+** 条鱼儿

源码已放到[<i class="fa fa-fw fa-github fa-2x"></i>**GitHub**](https://github.com/no5ix/fish)

<!--使用 fa-lg (33%递增)、fa-2x、 fa-3x、fa-4x，或者 fa-5x 类 来放大图标。 -->


<i class="fa fa-fw fa-2x fa-play-circle"></i>**Video Preview 视频演示**

<video preload="auto" autoplay="autoplay" loop="loop" width="100%" controls="controls">
<source src="/img/a_fish_flock_ai_plugin_for_ue4/Flock_AI_Fish_Unreal_VR_Video_Preview_640P.mp4" type="video/mp4" />
</video>


# Download

[<i class="fa fa-download fa-2x fa-fw"></i>MyFish.exe (Win64)](https://pan.baidu.com/s/1ghnKNjt)

**. . .**<!-- more -->

This is packaged by an unoptimized version( check out  branch old_demo)
下载一个打包好的试玩看看, 这个包是没有经过优化过的版本打包出来的( 是用old_demo分支的版本打包的 )



<!-- (http://v.youku.com/v_show/id_XMTc2NTM4MjkyMA==.html) -->



# How to play

- *VR* : 

	*(My Device is HTC Vive)*

	* Motion Controller FaceButton1 => Move forward
	 手柄圆盘上键                  => 往前移动

	* PC's KeyBoard Arrow UP and Down    => Move faster or slower
	 电脑键盘的上下箭头键          =>  调整移动速度

	* Hold Motion Controller Trigger Down     => Attract fishes
	 按住手柄扳机键                    => 吸引鱼群

- *PC* :

	* EQ        =>  Up & Down
	 EQ  键     =>  上下 

	* WASD         =>  Basic movement 
	 WASD 键     =>  基本的移动指令(前后左右) 

	* Hold Left Mouse Button Down  =>  Attract fishes
	 按住鼠标左键           =>  吸引鱼群

	* Arrow UP and Down  =>  Move faster or slower
	 上下箭头键         =>  调整移动速度



![OldDemoScreenshot](/img/a_fish_flock_ai_plugin_for_ue4/OldDemoScreenshot.png)

# How to use

place Plugins folder in your project root directory, then just like
把Plugins文件夹放在你项目的根目录, 接下来如图

![HowToUse1](/img/a_fish_flock_ai_plugin_for_ue4/HowToUse1.png)

![HowToUse2](/img/a_fish_flock_ai_plugin_for_ue4/HowToUse2.png)

![HowToUse3](/img/a_fish_flock_ai_plugin_for_ue4/HowToUse3.png)

![HowToUse4](/img/a_fish_flock_ai_plugin_for_ue4/HowToUse4.png)

# About This 


* Unreal Engine Version

	4.15

* Read [Craig Reynolds's thesis](http://www.red3d.com/cwr/boids/)  
查看 **Craig Reynolds的论文**

* This project implements a new flocking Ai algorithm, with 3 components : 

	> 算法简要

	* Separation : every fish will try to steer away from their neighbors 
	分离性 ：每条鱼都会与周围的鱼保持距离 

	* Following the leader : every fish will try to follow its leader
	跟随一个领头者 ： 每条鱼都会跟随一个领头者

	* Avoiding enemies.
	躲避敌人

