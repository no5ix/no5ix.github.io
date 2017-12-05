---
title: 5分钟学会git一
date: 2016-04-12 23:26:16
tags: 
- git
categories:
- 杂
---

之前有一份私人git笔记老长老长了, 今天得空, 把它浓缩成5分钟版本.
感觉纯基础性的东西整理成博客差也差不多了, 还有很多凌乱的工作笔记慢慢在一点一点整理放上来吧, 
估计下面几篇博客就开始游戏服务器的开发心得之类的了.

本篇博客因为要5分钟撸完git, 所以语言尽量精简, 只说新人必须知道的, 如果要git进阶的, 后面再另写博客说明, 不该说的废话就不说了

# 安装
sudo apt-get install git


# 查看状态

- 比如查看当前分支的状态 : git status, 这条命令也会给很多其他的git命令提示的喔
- 查看当前在哪个分支 : git branch
```
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git branch
  master
  new_test_branch
* old_demo
  plugin
```
标记为*的那个就是当前分支, 也就是old_demo分支

<!-- more -->

# 克隆
比如从我的一个远端github项目克隆一份到本地 : git clone git@github.com:no5ix/Flock-AI-Fish-Unreal-VR.git
这个地址是这样得来的, 如图 : 
![克隆地址图](/img/git1.png)

# 分支

- 比如创建一个新的分支test_branch : git branch test_branch
- 比如切换到分支test_branch : git checkout test_branch
- 比如把test_branch合并到主分支master上来 : 先切换到master上来git checkout  master 然后
	- git merge test_branch
	- git rebase test_branch : 
		rebase 跟 merge 的区别你们可以理解成有两个书架，你需要把两个书架的书整理到一起去，第一种做法是 merge ，比较粗鲁暴力，就直接腾出一块地方把另一个书架的书全部放进去，虽然暴力，但是这种做法你可以知道哪些书是来自另一个书架的；第二种做法就是 rebase ，他会把两个书架的书先进行比较，按照购书的时间来给他重新排序，然后重新放置好，这样做的好处就是合并之后的书架看起来很有逻辑，但是你很难清晰的知道哪些书来自哪个书架的。各有好处的，不同的团队根据不同的需要以及不同的习惯来选择就好。 

- 比如删除分支test_branch : 
	- git branch -d test_branch
	- git branch -D test_branch

有些时候可能会删除失败，比如如果a分支的代码还没有合并到master，你执行 git branch -d a 是删除不了的，它会智能的提示你a分支还有未合并的代码，但是如果你非要删除，那就执行 git branch -D a 就可以强制删除a分支。

# 加到暂存区add&提交commit&推送push

- 比如将修改之后的文件test_file加入到**暂存区**里 : git add test_file
- 比如将**暂存区**里的提交并加入提交信息"update test_file" : git commit -m "update test_file"
- 将代码推到远端 : 这之前的所有这些add, commit都是本地仓库的操作,  比如我们把本地的master分支推到github的那个项目的master分支 : git push origin master

# 撤销(抹除)revert&回退reset

- 比如只是撤销某个文件test_file的修改(还未被add的) : `git checkout -- test_file`
- 撤销刚刚的git add(也就是说把test_file从**暂存区**中移出) : git reset HEAD test_file

- 把git commit**回退** : git reset 是回到某次提交A，提交A及之前的commit都会被保留，但是此次之后的修改都会被退回到暂存区
	-  **只是把commit回退并且把文件从*暂存区*中移出, 但保留已有的文件更改** : 通用命令为 git reset commit_id, 这个commit_id用git log命令来查看, 比如要恢复到刚刚提交的上一次提交的版本, 就用git reset HEAD^(这句命令的意思是说: 恢复到commit id 为HEAD^的版本, HEAD是指向最新的提交，上一次提交是HEAD^,上上次是HEAD^^,也可以写成HEAD～2 ,依次类推. )
	- **把commit回退且不保留已有的文件更改** :   `git reset --hard commit_id`
- 把git commit**撤销(抹除)** : git revert 是生成一个新的提交来撤销(或者说是抹除某次提交)，此次提交之前的commit都会被保留

## git revert和git reset的区别

git revert和git reset的区别看一个例子

具体一个例子，假设有三个commit:
commit3: add test3.c
commit2: add test2.c
commit1: add test1.c

- 当执行git revert HEAD~1时， commit2被撤销了
git log可以看到：
revert "commit2":this reverts commit 5fe21s2...
commit3: add test3.c
commit2: add test2.c
commit1: add test1.c
git status 没有任何变化

- 如果换做执行git reset HEAD~1后，运行git log
commit2: add test2.c
commit1: add test1.c
运行git status， 则test3.c处于暂存区，准备提交。

- 如果换做执行git reset --hard HEAD~1后，
显示：HEAD is now at commit2，运行git log
commit2: add test2.c
commit1: add test1.c
运行git status， 没有任何变化

## git reset回退之后不能push的问题

假设一开始你的本地和远程都是：
a -> b -> c
你想把HEAD回退git reset到b，那么在本地就变成了：
a -> b
这个时候，如果没有远程库，你就接着怎么操作都行，比如：
a -> b -> d
但是在有远程库的情况下，你push会失败，因为远程库是 a->b->c，你的是 a->b->d
两种方案：
- push的时候用--force，强制把远程库变成a -> b -> d，大部分公司严禁这么干，会被别人揍一顿
- 做一个反向操作，把自己本地变成a -> b -> c -> d，注意b和d文件快照内容一莫一样，但是commit id肯定不同，再push上去远程也会变成 a -> b -> c -> d

综上所述, 一个是撤销, 一个是回退