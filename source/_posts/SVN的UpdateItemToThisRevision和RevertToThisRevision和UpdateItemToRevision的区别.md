---
title: SVN的UpdateItemToThisRevision和RevertToThisRevision和UpdateItemToRevision的区别
date: 2014-12-13 10:12:15
tags:
- svn
categories:
- 杂
---


# 前言

使用SVN在管理代码的时候免不了进行代码的合并和还原，特别是当前版本的修改发现有重大问题的时候，还原是避免不了的，那么究竟应该怎样操作呢？

# 内容

使用SVN查看文件或目录的日志的时候，右键单击日志记录会弹出下面这个界面，今天我们来着重了解一下被红圈标记的三个选项——“Update item to this version”，“Revert to this version”，“Revert changes from this version”，这三个选项对于刚接触SVN的人确实不太好区分，一开始我也搞不懂，直到亲自试验一下才搞清楚这三个选项的用法。

{% asset_img svn_1.jpg svn %}

在讲解这三个选项的作用之前，我们还是先来假定一个使用情景，假设我们的项目文件一共有8个版本，它版本号分别是1，2，3，4，5，6，7，8。

# Update item to this version

这个选项的作用是将文件版本更新到对应所选的版本（当然内容也修改到了相应的版本）。如果我们是在版本4这里点击“Update item to this version”，表示5~8版本所作的修改全部作废，这个文件的历史回退到了版本4那个时代，但是需要注意的是，此时文件的版本是4，并不是最新的。我们知道SVN工具中如果文件不是最新版本就无法上传，所以说这个功能只是用来暂时还原一下版本，来查询某个问题的，不能将还原后的文件上传。

# Revert to this version

这个选项的作用是将文件的内容更新到对应的版本，版本号没有发生变化。如果我们是在版本4这里点击“Revert to this version”，表示5~8版本所作的修改全部被还原，文件和版本4的文件一模一样，但需要注意的是这项操作相当于我们把版本4这个文件拷贝了一份赋值给了当前目录下的文件，此时的文件版本还是8，并且是可以提交的，提交以后文件的版本变成了9，增加了一个新的版本，虽然这个版本和版本4的内容是一样的。

# Revert changes from this version

这个选项的作用是将对应版本的修改还原，文件的版本号不发生变化，相当于在当前本版本上剔除某些版本所作的改变。如果我们是在版本4这里点击“Revert changes from this version”，表示版本4所作的修改被抹杀了，只剩下除版本4以外的7个修改了，但是此时文件是可以上传的，并且会生成新的版本9，只是版本9只包括除版本4以外的7次修改。这个选项是可以选择多个版本的，如果我们选择4,5,6,7这四个版本点击“Revert changes from this revision”，那么这几次修改都会被抹杀。如果我们选择5,6,7,8这四个版本点击“Revert changes from this revision”，表示取消这几个版本的修改，实际上和在版本4这里点击“Revert to this version”的作用是一样的。

# 总结

- Update item to this version：
回退文件的内容和版本到指定的版本A，文件内容与版本A一致，此时文件的版本也为A，但是无法上传文件。

- Revert to this version：
只是回退文件的内容到指定版本A，文件版本还是最新版本，此时文件会提示有所更改，可以上传，并且会在最新的版本号上加1，形成新的版本。

- Revert changes from this version：
还原对应版本所作的改变，会将所指定的版本所作的修改直接抹杀，可以对多个版本操作，注意很可能会出现冲突，需要手动解决。