---
title: vscode用markdown画uml
date: 2019-12-10 19:14:48
tags:
- VSCode
categories:
- Misc
---



# 需要安装的vsc插件
-------------

*   Markdown All in One
*   Markdown Preview Enhanced
*   PlantUML

备注： 
1.  Markdown All in One,VSCode 中支持 Markdown(键盘快捷键、目录、自动预览等)
2.  Markdown Preview Enhanced 可以对 Markdown 做增强预览, 比如支持各种绘图等
3.  PlantUML, 一款很强大的，并且可以绘制各种图形的脚本语言。需要安装 java


**. . .**<!-- more -->

# 需要下载的软件


1. java : 因为oracle下载jdk-8需要登陆了, 很麻烦, 所以建议在百度直接搜索jdk-8然后去类似于中关村下载站这种网站去下一个, 然后按照下图配置环境变量
2. graphviz : 在 [http://graphviz.org/](http://graphviz.org/)下载之后安装， 然后配置环境变量
3. plantuml.jar : 在 [http://plantuml.com/](http://plantuml.com/) 下载 **plantuml.jar**， 然后配置环境变量
4. 重启电脑

配完之后类似如下图, **注意去除环境变量路径首尾多余的空格, 特别是path的最前方, 否则无法正确识别.**
![](/img/vscode_uml/vsc_uml_path.png)

备注：Graphviz 是开源图形可视化软件。图形可视化是将结构信息表示为抽象图形和网络的图表的一种方式。它在网络，生物信息学，软件工程，数据库和网页设计，机器学习以及其他技术领域的可视化界面中有重要的应用。


# 测试一波

打开vscode， 新建一个markdown文件， 用下面的代码填入（记得把 ^ 换成 ` )， 然后右键用Markdown Preview Enhanced查看一波
```
    ^^^ puml
    class xxd {
      - mm4
      - mm3
      - mm2
      + mm1()
    }

    class dfa {
      + con()
      + con2()
      + con33()
    }

    object halo_ui {
      + get()
    }

    halo_ui <.. xxd: calc aoi tag && monitor info
    ^^^
```

就可以得到下图的效果:  
``` puml
class xxd {
  - mm4
  - mm3
  - mm2
  + mm1()
}

class dfa {
  + con()
  + con2()
  + con33()
}

object halo_ui {
  + get()
}

halo_ui <.. xxd: calc aoi tag && monitor info
```


# 扩展学习画图语法

https://plantuml.com/zh/class-diagram