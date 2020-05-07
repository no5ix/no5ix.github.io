---
title: VS必装插件
date: 2019-12-08 19:18:26
tags:
- VS
categories:
- Misc
password: '0622'
---



**. . .**<!-- more -->

# VS2017

必装插件：

![](/img/vs_install_exts_vax/vs2017_exts.png)
备注: Match Margin这个插件是控制高亮颜色的, 颜色是在 `Tools-Options-Environment-Fonts And Colors-Match Color` 调节的

vs2017的vax破解方法：

链接: https://pan.baidu.com/s/12NA4Tm-M9HjvIZhGP-NOdw 提取码: nxmm 


## google cpp代码风格linter配置

由于谷歌风格的检查文件[cpplint.py](https://github.com/google/styleguide/blob/gh-pages/cpplint/cpplint.py)（上去复制下来保存为.py就好啦 ）是Python来运行的，所以首先我们需要一个python~
安装的时候记得把路径改好并记下，不能有中文 ，不然就有可能出错。

接下来就是主要步骤了。

打开vs，选择工具->外部工具->添加, 然后

- 标题: 取个名字, 如 `Google Cpp Style Standard`
- 命令: `C:\Python27\python.exe`
- 参数: `C:\Users\hulinhong\Documents\github\cpplint\cpplint.py --output=vs7 --filter=-build/header_guard,-build/include,-readability/streams $(ItemPath)`
- 初始目录: `$(ItemDir)`
- 打勾 `使用输出窗口`
- 记住此时`Google Cpp Style Standard`这个命令从上到下的顺序, 记为 n, 等下会用到

设置完之后保存，就会看到`工具`菜单下面多了个`Google Cpp Style Standard`的菜单项。但是这时候 …… 没快捷键你逗我？
快捷键就要这样设置：首先 ，还是我们的工具菜单->选项，弹出的选项对话框中选择环境 ->键盘,  
敲一下“外部”两个字 然后找到`工具.外部命令n`, 这个n就是上述的 n


## vax报错解决

如果开启vs的时候报`the security key for this program currently stored on your system does not appear to be valid`, 则va出问题了, 

查閱資料整理解決方案如下：

1. 卸載visual assist

2. 開始-運行-regedit-刪除HKEY_CURRENT_USER/SOFTWARE/WHOLE TOMATO項

3. 該文件夾下面的文件： C:\Users\XXX\AppData\Local\Temp\1489AFE4.TMP，刪除掉

4. 註冊表, 刪除HKEY_CURRENT_USER\Software\Licenses及其下面所有的子項：
HKEY_CURRENT_USER\Software\Licenses\{K7C0DB872A3F777C0}
HKEY_CURRENT_USER\Software\Licenses\{I7538681BD5988129}
HKEY_CURRENT_USER\Software\Licenses\{07538681BD5988129}


如果按照上述步骤还是报错则尝试这篇文章 https://www.jianshu.com/p/aed1fd997eb4


# VS2015

必装插件：

- visual Assist (各种跳转,各种..无敌插件
- Word Highlight with margin 2015(双击单词高亮所有相同的词
- mixEdit (多行编辑 以及类似sublime的ctrl+D
- Indent Guides (大括号的对齐线
- Hot Commands (Ctrl+/来开关注释, 格式化代码
- vstools (定位文档在solution的位置, 不用去solution慢慢打开文件翻了
- hlsl tools for visual studio (写hlsl语言的时候才需要

vs2015的vax破解方法：

链接: https://pan.baidu.com/s/1isp9dYV963F-zFsfYIG2iQ 提取码: hksf 

