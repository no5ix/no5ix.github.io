---
title: 5分钟学会git(一)
date: 2016-04-12 23:26:16
tags: 
- git
categories:
- linux
---

>我之前有一份私人git笔记老长老长了, 今天得空, 把它浓缩成5分钟版本.
感觉纯基础性的东西整理成博客差也差不多了, 还有很多凌乱的工作笔记慢慢在一点一点整理放上来吧, 
估计下面几篇博客就开始游戏服务器的开发心得之类的了.

> 本篇博客因为要5分钟撸完git, 所以语言尽量精简, 只说新人必须知道的, 如果要git进阶的, 后面再另写博客说明, 不该说的废话就不说了

## **安装**
> sudo apt-get install git


## **查看状态**

> - 比如查看当前分支的状态 : git status, 这条命令也会给很多其他的git命令提示的喔
> - 查看当前在哪个分支 : git branch
```
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git branch
  master
  new_test_branch
* old_demo
  plugin
```
标记为*的那个就是当前分支, 也就是old_demo分支

<!-- more -->

## **克隆**
> 比如从我的一个远端github项目克隆一份到本地 : git clone git@github.com:nosix1992/Flock-AI-Fish-Unreal-VR.git
> 这个地址是这样得来的, 如图 : 
> ![克隆地址图](/img/git1.png)

## **分支**

- 比如创建一个新的分支test_branch : git branch test_branch
- 比如切换到分支test_branch : git checkout test_branch
- 比如把test_branch合并到主分支master上来 : 先切换到master上来git checkout  master 然后
	- git merge test_branch
	- git rebase test_branch
> rebase 跟 merge 的区别你们可以理解成有两个书架，你需要把两个书架的书整理到一起去，第一种做法是 merge ，比较粗鲁暴力，就直接腾出一块地方把另一个书架的书全部放进去，虽然暴力，但是这种做法你可以知道哪些书是来自另一个书架的；第二种做法就是 rebase ，他会把两个书架的书先进行比较，按照购书的时间来给他重新排序，然后重新放置好，这样做的好处就是合并之后的书架看起来很有逻辑，但是你很难清晰的知道哪些书来自哪个书架的。各有好处的，不同的团队根据不同的需要以及不同的习惯来选择就好。 

- 比如删除分支test_branch : 
	- git branch -d test_branch
	- git branch -D test_branch
> 有些时候可能会删除失败，比如如果a分支的代码还没有合并到master，你执行 git branch -d a 是删除不了的，它会智能的提示你a分支还有未合并的代码，但是如果你非要删除，那就执行 git branch -D a 就可以强制删除a分支。

## **提交**

- 比如将修改之后的文件test_file加入到暂存区里 : git add test_file
	- 撤销刚刚的git add(也就是说把test_file从暂存区中移出) : git reset HEAD test_file
- 比如将暂存区里的提交并加入提交信息"update test_file" : git commit -m "update test_file"
	- 把git commit撤销 : 
		-  **只是把commit撤销并且把文件从暂存区中移出, 但保留已有的文件更改** : 通用命令为 git reset commit_id, 这个commit_id用git log命令来查看, 比如要恢复到刚刚提交的上一次提交的版本, 就用git reset HEAD^(这句命令的意思是说: 恢复到commit id 为HEAD^的版本, HEAD是指向最新的提交，上一次提交是HEAD^,上上次是HEAD^^,也可以写成HEAD～2 ,依次类推. )
		- **把commit撤销且不保留已有的文件更改** :   git reset --hard commit_id
- 比如只是撤销某个文件test_file的修改 : git checkout --test_file

- 将代码推到远端 : 这之前的所有这些add, commit都是本地仓库的操作,  比如我们把本地的master分支推到github的那个项目的master分支 : git push origin master

