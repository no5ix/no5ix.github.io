---
title: mac笔记
date: 2022-25-07 03:02:22
tags:
- Mac
categories:
-  Misc
---



# 改键

改键软件 Karabiner-Elements 的配置得直接覆盖他的配置文件 `karabiner.json`

参考: 
- https://github.com/pqrs-org/Karabiner-Elements/issues/2711
- https://github.com/pqrs-org/Karabiner-Elements/issues/2949
- https://github.com/pqrs-org/KE-complex_modifications/issues/697#issuecomment-678677912
- https://github.com/realliyifei/mac-karabiner-chinese-punctuations-to-halfwidth-forms


# 科学上网

科学上网软件： ClashX    
去 just my socks 拷贝那些服务节点的配置然后去google搜“ss配置转clash配置”的网站，
比如 https://subconverter.speedupvpn.com
， 然后在线转换为clash的配置然后点击 ClashX 的菜单栏的图标， 然后 config-remote-remote config-manage


# 触摸板增强

软件： betterTouchTool
破解版的得把下面这几句加到clashx当前所用的config文件的rules里来屏蔽下面这些地址
```yaml
- DOMAIN-KEYWORD,folivora.ai,REJECT
- DOMAIN-KEYWORD,www.folivora.ai,REJECT
- DOMAIN-KEYWORD,updates.boastr.net,REJECT
- DOMAIN-KEYWORD,updates.folivora.ai,REJECT
```
加完之后去浏览器测试一下是否能打开这几个网址， 打不开则为屏蔽成功，
然后再打开betterTouchTool。


# jb-crack

use ja-netfilter

- https://learnku.com/articles/67432
- https://cloud.tencent.com/developer/article/1951998
- https://segmentfault.com/a/1190000041769901


# 搜狗输入法皮肤

自己做了仨, 黑白灰

另外的好东西高仿 mac风格: Rime 鼠须管输入法皮肤效果 https://ssnhd.com/2022/01/11/rime-skin/


# Alfred皮肤

自己做了俩, 对应黑夜白天

