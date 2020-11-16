---
title: 一些脚本小工具
date: 2018-11-17 02:56:06
tags:
- Tool
categories:
- Misc
---


# 可以把当前脚本目录下的gif转为mp4

脚本会递归目录的子目录
``` python
import moviepy.editor as mp
# vfc = mp.VideoFileClip("binary_tree_preorder_traversal.gif")
# vfc.write_videofile("binary_tree_preorder_traversal.mp4")

# vfc = mp.VideoFileClip(".\\mp/binary_tree_preorder_traversal.gif")
# vfc.write_videofile(".\\mp/binary_tree_preorder_traversal1231.mp4")

import os

def getfilelist(rlist,path, ex_filter):
    for dir,folder,file in os.walk(path):
        for i in file:
            if ex_filter not in i:
                continue
            t = "%s/%s"%(dir,i)
            rlist.append(t)

all_gif_path = []
getfilelist(all_gif_path, ".", ".gif")
print all_gif_path

for _gif_path in all_gif_path:
    vfc = mp.VideoFileClip(_gif_path)
    vfc.write_videofile(_gif_path.replace(".gif", ".mp4"))
```