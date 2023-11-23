---
title: SVP
date: 2023-11-23 20:08:21
tags:
- SVP
categories:
- Misc
password: '0622'
---



# 相关下载

在 `阿里云盘`-`software`-`win`-`svp_bilibili教程版本.7z`


# 实时补帧看视频


> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [www.bilibili.com](https://www.bilibili.com/read/cv11033039/)

SVP4 相比于 SVP3.1 来说界面更加友好，且简洁易用。但对于视频制作来说个人感觉 3.1 版本更简单。本文将介绍 SVP4 的安装使用和制作 60 帧视频教程。如果你愿意使用这个方法，那就请细心得看下去，并注意图片和文字内容的结合，一步步照着做应该是不会有太大问题的。

软件下载链接在文章最后

视频版：

[15:37 使用 SVP4 进行视频补帧 - 安装使用教程 (视频版) 1.5 万 124 视频 EspZhan](//www.bilibili.com/video/BV1G5411w7Ux)

成品展示：

[07:38 【1080P+/60 帧】小林家的龙女仆 (两季全) OP+ED 无字幕无 STAFF 表 NC 版 3.7 万 52 视频 EspZhan](//www.bilibili.com/video/BV1vv411772t)

SVP3.1 教程：

[

使用 SVP3.1 进行视频补帧 - 安装使用教程 (图文版)

很多人向 UP 询问如何补帧，我把我用的比较熟悉的方法向大家分享。这个方法是挺老的方法了，优点是比 SVP4 简单很多，缺点是有很多新的格式和编码以及不兼容了。如果你愿意使用这个方法，那就请细心得看下去，一步步照着做应该是不会有太大问题的。软件下载链接在文章最后视频版准备好就开始吧！1. 把下载好的文件 SVP3.1.7z 解压，双击打开里面的 SVP_3.1.7.exe 文件 2. 选择语言为英语（因为还能看得懂一点），点击 OK3. 点击 next，同意后继续点击 next4.

文章 EspZha... 1810 9 2

](//www.bilibili.com/read/cv10033716?from=articleDetail)[21:21 使用 SVP3.1 进行视频补帧 - 安装使用教程 (视频版) 1480 5 视频 EspZhan](//www.bilibili.com/video/BV1xV411v7YT)

准备好就开始吧！  

![](http://i0.hdslb.com/bfs/article/4aa545dccf7de8d4a93c2b2b8e3265ac0a26d216.png)

1. 解压 SVP4Pro.7z，再解压 SVP.7z 压缩包得到 SVP 文件夹，将 SVP 文件夹移至 D 盘，得到 D:\SVP。

2. 打开 svp4-cracked .exe，点 setting

![](http://i0.hdslb.com/bfs/article/watermark/4a81fda6c1c0376cdd50a8b1f4092dacdb5e3e4e.png)

3. 参照如图，点击 Temporary respoitories，再点击 Add，把下列内容添加进去（两条！）

file:///D:/SVP/free

file:///D:/SVP/common

然后勾选 Use temporary repositories only，确认安装

![Alt text](/img/svp_megui/image.png)

4. 定义安装目录，这个装哪都行，但是要尽量在纯英文的路径，避免不必要的麻烦

![](http://i0.hdslb.com/bfs/article/watermark/8e49c57af34ed858a42e44a3df72afc639e5e41a.png)

5. 下一步，如果只是单纯插帧观看视频，根据系统勾选第一或第二项就可以了。请跳到第 8 步。

如果有补帧视频输出需求的，点击 switch to components selection

![Alt text](/img/svp_megui/image-1.png)

6. 对着下图勾选，SVP Manager(pro) 只勾选前两项，3rd-party software (mandatory) 里全选，其他都不需要。
![Alt text](/img/svp_megui/image-2.png)

7. 一直点，最后先不运行，将 SVPManager.exe 替换安装目录的原文件,。

8. 打开你的播放器，点击左上角，选择选项。

(这里使用 potplayer 进行演示，其他播放器添加滤镜方法请灵活运用搜索引擎。)

![](http://i0.hdslb.com/bfs/article/watermark/8ef54a7f3ad1bc5ad1e4434956582650cba67ebf.png)

9. 点击滤镜 - 全局滤镜优先权 - 添加系统滤镜

![Alt text](/img/svp_megui/image-3.png)

10. 选择 ffdshow raw video filter，并将强制使用

![Alt text](/img/svp_megui/image-4.png)
![Alt text](/img/svp_megui/image-5.png)

11. 这时候打开或右下角找到之前已经打开的 SVP4，使用可以跳过性能测试。

SVP 啥都不用调就可以直接在播放器用了。（也不建议小白随便调）

一般成功后会左下角会有显示

![](http://i0.hdslb.com/bfs/article/watermark/e9be45769453ee76e27260c1a71076d21ac7754d.png) 
![Alt text](/img/svp_megui/image-6.png)

如果只是单纯插帧观看，那教程到此结束，成功后别忘了给 UP 主三连！！！！！！！！这对我真的很重要啊啊啊啊



# 导出补了帧的视频

![](http://i0.hdslb.com/bfs/article/4aa545dccf7de8d4a93c2b2b8e3265ac0a26d216.png)


接下来是进阶篇，使用 SVP 和 MeGUI 导出 60 高帧率视频，UP 也是第一次使用 SVP4，可能会有错误，望大神指正！

12. 将 LSMASHSource-AviSynth-plugin-r929-msvc-32bit.7zLSM.7z 解压缩，的下图文件，将这些文件复制到 C:\Program Files (x86)\AviSynth+\plugins

（若后面出现如函数无法被识别等奇奇怪怪的情况，可以把这些文件都复制进 C:\Program Files (x86)\AviSynth+ 里所有的 plugins 前缀文件夹）
![Alt text](/img/svp_megui/image-7.png)

13. 解压 AvsPmod.7z，点击里面的 AvsPmod.exe 即可直接使用 Avspmod（当然也是建议在全英文路径下打开）

点击选项 - 程序设置

![](http://i0.hdslb.com/bfs/article/watermark/45cca63e7422f66b5c12907262ad1c5949d1cc88.png)

15. 点击 avisynth 的帮助文件 / URL，选择刚刚复制的 C:\Program Files (x86)\AviSynth+\plugins 文件夹的 Microsoft Visual C++ 2015 Redistributable x86 文件

![Alt text](/img/svp_megui/image-8.png) 

![Alt text](/img/svp_megui/image-9.png)

16. 新建文件中输入 “version()” 后，按 F5 得到下图信息即可配置正确：

![Alt text](/img/svp_megui/image-10.png)

17. 再次打开 SVP 和 potplayer 播放视频，右下角托盘应该会有如图图标，点击 ffdshow raw video filter ，打开后的界面在 Avisynth 里复制路径去打开
![Alt text](/img/svp_megui/image-11.png)
![Alt text](/img/svp_megui/image-12.png)
18. 打开 scripts 文件夹

把里面的 avs 后缀文件复制出来（因为 SVP 一退出文件夹会被清空）

用 avspmod 软件打开复制出来的 avs 后缀文件。

19. 将
```
LoadPlugin("D:\Program Files\SVP\SVP4\plugins64\svpflow1.dll")

LoadPlugin("D:\Program Files\SVP\SVP4\plugins64\svpflow2.dll")
```
改为
```
LoadPlugin("D:\Program Files\SVP\SVP4\plugins\svpflow1.dll")

LoadPlugin("D:\Program Files\SVP\SVP4\plugins\svpflow2.dll")
```
将

`ffdshow_source()`

改为

`LWLibavVideoSource("E:\ 需要插帧的视频路径 \ 需要插帧的视频名字. 后缀")`

之后保存

“注意是英文字符的双引号，如果视频和 avs 文件在同一个文件夹可以省略路径。图中的路径已省略。按 F5 可检查错误。
![Alt text](/img/svp_megui/image-13.png)

20. 解压 MeGUI_2814.7z

> 以下由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [www.cnswiz.com](https://www.cnswiz.com/391.html)


　　1. 打开 MeGUI，上下为两个功能区

　　上面视频部分，点击右边的 […] 选择刚编辑好的 avs 文件，会弹出预览框（可以在 MeGUI 的设置里关掉，不然每次都要卡一下）不用管直接关掉，左边可以选择文件格式，右边也有配置按钮可以细调，确认没问题后点击加入队列

　　下面音频部分，选择原视频文件，设置好格式（格式根据自己需求，因为上面转出来的视频是没有声音的所以需要这里单独把音频文件转出来）

![Alt text](/img/svp_megui/image-14.png)

　　2. 点击上方队列按钮，点左下角开始，然后得到两个文件，一个视频文件（没有声音）一个音频文件（转码过程中只是调用 SVP4 的文件，与 SVP4 本身是否开启没有影响）

![Alt text](/img/svp_megui/image-15.png)

　　3. 当导出完毕之后, 可以把视频+音频合并, 步骤: 点击上方功能栏的 [工具]-[混流器]，选择对应格式的混流器，设置好需要合成的视频和音频文件，检查帧率是否正确，如果不一样就点右边按钮调整，然后点右下角的队列，开始混流
![Alt text](/img/svp_megui/image-16.png)

　　之后等待混流完成就可以了

　　最后编辑修改于 2018 年 8 月 4 日，补上了视频，修改了部分细节