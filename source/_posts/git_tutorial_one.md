---
title: 5分钟学会Git一
date: 2016-04-12 23:26:16
tags: 
- Git
categories:
- Misc
---

之前有一份私人git笔记老长老长了, 今天得空, 把它浓缩成5分钟版本.
感觉纯基础性的东西整理成博客差也差不多了, 还有很多凌乱的工作笔记慢慢在一点一点整理放上来吧, 
估计下面几篇博客就开始游戏服务器的开发心得之类的了.

本篇博客因为要5分钟撸完git, 所以语言尽量精简, 只说新人必须知道的, 如果要git进阶的, 后面再另写博客说明, 不该说的废话就不说了

# 安装

sudo apt-get install git

# 通过SSH的key来push到Github

Create a repo. Make sure there is at least one file in it (even just the README) Generate ssh key:

` ssh-keygen -t rsa -C "your_email@example.com" `

Copy the contents of the file ~/.ssh/id_rsa.pub to your SSH keys in your GitHub account settings. Test SSH key:

` ssh -T git@github.com `

clone the repo:

`git clone git://github.com/username/your-repository`

Now cd to your git clone folder and do:

`git remote set-url origin git@github.com:username/your-repository.git`

Now try editing a file (try the README) and then do:

- `git add -A`
- `git commit -am "my update msg"`
- `git push`

# Git概念图

一般来说，日常使用只要记住下图6个命令，就可以了。

{% asset_img git_2.png %}

- Workspace：工作区
- Index / Stage：暂存区
- Repository：仓库区（或本地仓库）
- Remote：远程仓库


# 查看状态

- 比如查看当前分支的状态 : `git status`, 这条命令也会给很多其他的git命令提示的喔
- 查看当前在哪个分支 : `git branch`
```
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git branch
  master
  new_test_branch
* old_demo
  plugin
```
标记为*的那个就是当前分支, 也就是old_demo分支

**. . .**<!-- more -->

# 克隆

比如从我的一个远端github项目克隆一份到本地 : `git clone git@github.com:no5ix/Flock-AI-Fish-Unreal-VR.git`
这个地址是这样得来的, 如图 : 

{% asset_img git_1.png %}



# 分支

- 比如创建一个新的分支test_branch : 
`git branch test_branch`
- 比如切换到分支test_branch : 
`git checkout test_branch`
- 比如把test_branch合并到主分支master上来 : 先执行`git checkout  master`切换到master上来, 然后
	- `git merge test_branch`
	- `git rebase test_branch`(一般不这么用) : 
	- rebase 跟 merge 的区别你们可以理解成有两个书架，你需要把两个书架的书整理到一起去，第一种做法是 merge ，比较粗鲁暴力，就直接腾出一块地方把另一个书架的书全部放进去，虽然暴力，但是这种做法你可以知道哪些书是来自另一个书架的；第二种做法就是 rebase ，他会把两个书架的书先进行比较，按照购书的时间来给他重新排序，然后重新放置好，这样做的好处就是合并之后的书架看起来很有逻辑，但是你很难清晰的知道哪些书来自哪个书架的。各有好处的，不同的团队根据不同的需要以及不同的习惯来选择就好。 
- 比如删除本地分支test_branch :
有些时候可能会删除失败，比如如果a分支的代码还没有合并到master，你执行 git branch -d a 是删除不了的，它会智能的提示你a分支还有未合并的代码，但是如果你非要删除，那就执行 git branch -D a 就可以强制删除a分支。 
	- `git branch -d test_branch`
	- `git branch -D test_branch`

- 删除远程分支 : `git push origin --delete 分支名`


# 加到暂存区和提交

- 比如将修改之后的文件test_file加入到**暂存区**里 : 
`git add test_file`
- 比如将**暂存区**里的提交到本地仓库并加入提交信息"update test_file" : 
`git commit -m "update test_file"`

# 远程同步

- 下载远程仓库的所有变动
`git fetch [remote]`


- 取回远程仓库的变化，并与本地分支合并
`git pull [remote] [branch]`

- 上传本地指定分支到远程仓库
`git push [remote] [branch]`
将代码推到远端仓库 : 这之前的所有这些add, commit都是本地的操作,  比如我们把本地的master分支推到github的那个项目的master分支 : 
`git push origin master`


# 撤销和回退

- 比如只是撤销某个文件test_file的修改(还未被add的) : 
`git checkout -- test_file`
- 撤销刚刚的git add : 
	- `git reset HEAD` : 把add了的都从**暂存区**中移出
	- `git reset HEAD test_file` : 只把test_file从**暂存区**中移出

- **回退到某个版本(在公司很少用, 因为把之前的commit都弄没了)** `git reset` : 
`git reset` 是回到某次提交A，提交A及之前的commit都会被保留，A之后的commit都没有了, A之后的修改都会被退回到暂存区
	- git reset的作用是修改HEAD的位置，即将HEAD指向的位置改变为之前存在的某个版本
	-  只是把commit回退并且把文件从*暂存区*中移出, 但保留已有的文件更改 : 
	通用命令为 `git reset commit_id`, 这个commit_id用git log命令来查看, 比如要恢复到刚刚提交的上一次提交的版本, 就用`git reset HEAD^`(这句命令的意思是说: 恢复到commit id 为`HEAD^`的版本, HEAD是指向最新的提交，上一次提交是`HEAD^`,上上次是`HEAD^^`,也可以写成`HEAD～2` ,依次类推. )
	- 把commit回退且不保留已有的文件更改(慎用) :   
	`git reset --hard commit_id`
- **把git commit撤销(抹除并覆盖)** `git revert` : 
`git revert` 是生成一个新的提交来撤销(或者说是抹除并覆盖某次提交)，此次提交之前的commit都会被保留


## git revert和git reset的区别

`git revert` 和 `git reset` 的区别看一个例子

具体一个例子，假设有三个commit:  
* commit3: add test3.c
* commit2: add test2.c
* commit1: add test1.c

我们看看以下三种情况:  
- 当执行`git revert HEAD~1`时， commit2被撤销了
`git log`可以看到：
	revert "commit2":this reverts commit 5fe21s2...
	commit3: add test3.c
	commit2: add test2.c
	commit1: add test1.c
而`git status` 没有任何变化

- 如果换做执行`git reset HEAD~1`后，运行`git log`
	commit2: add test2.c
	commit1: add test1.c
运行`git status`， 则test3.c处于暂存区，准备提交。

- 如果换做执行`git reset --hard HEAD~1`后，
显示：HEAD is now at commit2，运行`git log`
	commit2: add test2.c
	commit1: add test1.c
运行`git status`， 没有任何变化


## git reset回退之后不能push的问题

假设一开始你的本地和远程都是：
a -> b -> c
你想把HEAD回退`git reset`到b，那么在本地就变成了：
a -> b
这个时候，如果没有远程库，你就接着怎么操作都行，比如：
a -> b -> d
但是在有远程库的情况下，你push会失败，因为远程库是 a->b->c，你的是 a->b->d
<!-- 两种方案： -->
此时, push的时候用`--force`，强制把远程库变成a -> b -> d，不过大部分公司严禁这么干，会被别人揍一顿
<!-- - 做一个反向操作，把自己本地变成a -> b -> c -> d，注意b和d文件快照内容一莫一样，但是commit id肯定不同，再push上去远程也会变成 a -> b -> c -> d -->
综上所述, 一个是撤销某个版本(抹除并覆盖), 一个是回退到某个版本

# GitIgnore

在git中如果想忽略掉某个文件，不让这个文件提交到版本库中，可以使用修改根目录中 .gitignore 文件的方法（如无，则需自己手工建立此文件）。这个文件每一行保存了一个匹配的规则例如：


	# 符号为注释 – #开头的那行的内容将被 Git 忽略

	*.a       # 忽略所有 .a 结尾的文件
	!lib.a    # 但 lib.a 除外
	/TODO     # 仅仅忽略项目根目录下的 TODO 文件，不包括 subdir/TODO
	build/    # 忽略 build/ 目录下的所有文件
	doc/*.txt # 会忽略 doc/notes.txt 但不包括 doc/server/arch.txt

## 忽略本地改动且删除已经存在于远端的文件的方式

规则很简单，不做过多解释，但是有时候在项目开发过程中，突然心血来潮想把某些目录或文件加入忽略规则，按照上述方法定义后发现并未生效，原因是.gitignore只能忽略那些原来没有被track的文件，如果某些文件已经被纳入了版本管理中，则修改.gitignore是无效的。那么解决方法就是先把本地缓存删除（改变成未track状态），然后再提交

	git rm -r --cached . && git add . && git commit -m 'update .gitignore'

## 忽略本地改动但不删除已经存在于远端的文件的方式

这种情况 gitignore 搞不定, 需要执行指令 :

	git update-index --assume-unchanged <file>

In this case a file is being tracked in the remote origin repo.
You can revert it with :

	git update-index --no-assume-unchanged <file>
	
If you want to list them :

	git ls-files -v | grep '^h'. 


# rebase

参考： https://www.codercto.com/a/45325.html

rebase的原理?
假设我们先从 master 分支切出一个 feature1 分支，进行开发, 当在 feature1 分支上执行 `git rebase master`时:  
1. 首先， git 会把 feature1 分支里面的每个 commit 取消掉；
2. 其次，把上面的操作临时保存成 patch 文件，存在 .git/rebase 目录下；
3. 然后，把 feature1 分支更新到最新的 master 分支；
4. 最后，把上面保存的 patch 文件应用到 feature1 分支上；

## rebase的使用

git rebase相对来说是比较复杂的一个命令了,但只要掌握了使用方式,你会深深地喜欢上他,如果有时间我也许会细细地讲一下,现将git rebase的正确使用步骤总结如下, 假设Git目前只有一个分支master。开发人员的工作流程是:  

* git clone master branch
* 在自己本地checkout -b local创建一个本地开发分支
* 在本地的开发分支上开发和测试
* 阶段性开发完成后（包含功能代码和单元测试），可以准备提交代码
    * 首先切换到master分支，git pull拉取最新的分支状态
    * 然后切回local分支
    * 通过git rebase -i 将本地的多次提交合并为一个，以简化提交历史。本地有多个提交时,如果不进行这一步,在git rebase master时会多次解决冲突(最坏情况下,每一个提交都会相应解决一个冲突)
    * git rebase master 将master最新的分支同步到本地，这个过程可能需要手动解决冲突(如果进行了上一步的话,只用解决一次冲突)
    * .在 rebase 的过程中，也许会出现冲突 conflict 。在这种情况， git 会停止 rebase 并会让你去解决冲突。在解决完冲突后，用 git add 命令去更新这些内容。
    * 注意，你无需执行 git-commit，只要执行 continue，`git rebase --continue`, 这样 git 会继续应用余下的 patch 补丁文件。
    * 然后切换到master分支，git merge将本地的local分支内容合并到master分支
    * git push将master分支的提交上传


## 如何合并多次提交纪录

每一次功能开发， 对多个 commit 进行合并处理。
这时候就需要用到 `git rebase -i` 了。这个命令没有太难，不常用可能源于不熟悉，所以我们来通过示例学习一下:

执行`git rebase -i`, 
![](/img/git_tutorial/rebase_i1.png)

我们设置第二个”pick 657a291 add 2.txt” 为” s 657a291 add 2.txt”这里的s就是squash命令的简写。
跳出来了一个临时文件，最上面是两行commit message。我们修改下这个总体的commit message。
![](/img/git_tutorial/rebase_i2.png)

删除之前的两条message(ESC dd)，设置一总的message 然后保存退出。(ESC wq)
我们查看下log。git log
是不是没有了之前的两个commit。
![](/img/git_tutorial/rebase_i3.png)