---
title: Git教程
date: 2016-04-12 23:26:16
tags: 
- Git
categories:
- Misc
---


之前有一份私人git笔记老长老长了, 今天得空, 把它浓缩成5分钟版本.
感觉纯基础性的东西整理成博客差也差不多了, 还有很多凌乱的工作笔记慢慢在一点一点整理放上来吧, 
估计下面几篇博客就开始游戏服务器的开发心得之类的了.


**. . .**<!-- more -->


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

![](/img/git_tutorial/git_svn_diff.jpg)

* 集中式版本控制只有中心服务器拥有一份代码，而分布式版本控制每个人的电脑上就有一份完整的代码。
* 集中式版本控制有安全性问题，当中心服务器挂了所有人都没办法工作了。
* 集中式版本控制需要连网才能工作，如果网速过慢，那么提交一个文件会慢的无法让人忍受。而分布式版本控制不需要连网就能工作。
* 分布式版本控制新建分支、合并分支操作速度非常快，而集中式版本控制新建一个分支相当于复制一份完整代码。

![](/img/git_tutorial/git_2.png)

- Workspace：工作区
- Index / Stage：暂存区
- Repository：仓库区（或本地仓库）
- Remote：远程仓库

新建一个仓库之后，当前目录就成为了工作区，工作区下有一个隐藏目录 .git，它属于 Git 的版本库。  
Git 的版本库有一个称为 Stage 的暂存区以及最后的 History 版本库，History 存储所有分支信息，使用一个 HEAD 指针指向当前分支。
![](/img/git_tutorial/git_3.jpg)


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


# 克隆

比如从我的一个远端github项目克隆一份到本地 : `git clone git@github.com:no5ix/Flock-AI-Fish-Unreal-VR.git`
这个地址是这样得来的, 如图 : 

![](/img/git_tutorial/git_1.png)


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

![](/img/git_tutorial/git_4.jpg)

* `git add files` 把文件的修改添加到暂存区
* `git commit` 比如将**暂存区**里的提交到当前分支并加入提交信息"update test_file" ，提交之后暂存区就被清空了
* `git reset -- files` 使用当前分支上的修改覆盖暂存区，用来撤销最后一次 git add files
* `git checkout -- files` 使用暂存区的修改覆盖工作目录，用来撤销本地修改

![](/img/git_tutorial/git_5.jpg)

可以跳过暂存区域直接从分支中取出修改，或者直接提交修改到分支中。  
* `git commit -a` 直接把所有文件的修改添加到暂存区然后执行提交
* `git checkout HEAD -- files` 取出最后一次修改，可以用来进行回滚操作


提交以后，发现提交信息写错了，这时可以使用`git commit`命令的`--amend`参数，可以修改上一次的提交信息。

`$ git commit --amend -m "Fixes bug #42"`

它的原理是产生一个新的提交对象，替换掉上一次提交产生的提交对象.这时如果暂存区有发生变化的文件，会一起提交到仓库。所以，`--amend`不仅可以修改提交信息，还可以整个把上一次提交替换掉。


# 远程同步

- 下载远程仓库的所有变动
`git fetch [remote]`


- 取回远程仓库的变化，并与本地分支合并
`git pull [remote] [branch]`

- 上传本地指定分支到远程仓库
`git push [remote] [branch]`
将代码推到远端仓库 : 这之前的所有这些add, commit都是本地的操作,  比如我们把本地的master分支推到github的那个项目的master分支 : 
`git push origin master`


# 撤销与回退

- 比如只是撤销某个文件test_file的修改或者某个目录一下的所有文件的修改(都是指还未被add的) : 
	* `git checkout -- test_file`
	* `git checkout -- .`
	* `git checkout -- temp_folder/`
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
- **把git commit撤销(抹除并覆盖, 此命令还算常用)** `git revert` : 
`git revert` 是生成一个新的提交来撤销(或者说是抹除并覆盖某次提交)，此次提交之前的commit都会被保留, git revert命令有两个参数:
	* `--no-edit`(默认参数)：执行时不打开默认编辑器，直接使用 Git 自动生成的提交信息。
	* `--no-commit`(一般使用这个)：只抵消暂存区和工作区的文件变化，不产生新的提交。

## git revert和git reset的区别

总结:   
* git reset 是把HEAD向后移动了一下，而git revert是HEAD继续前进，只是新的commit的内容和要revert的内容正好相反，能够抵消要被revert的内容。
* `git reset`适用场景: 如果想恢复到之前某个提交的版本，且那个版本之后提交的版本我们都不要了，就可以用这种方法
* `git revert`适用场景: 如果我们想撤销之前的某一版本，但是又想保留该目标版本后面的版本，记录下这整个版本变动流程，就可以用这种方法。

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
此时, push的时候用`--force`，强制把远程库变成a -> b -> d，不过大部分公司严禁这么干，会被别人揍一顿

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
3. 然后，把 feature1 分支更新到最新的 master 分支, 这也是为什么叫做rebase(变基)的原因;
4. 最后，把上面保存的 patch 文件应用到 feature1 分支上；

以上就是rebase的原理

## rebase的使用

git rebase相对来说是比较复杂的一个命令了,但只要掌握了使用方式,你会深深地喜欢上他,如果有时间我也许会细细地讲一下,现将git rebase的正确使用步骤总结如下, 假设Git目前只有一个分支master。那么开发人员的工作流程是:  

1. `git clone master branch`
2. 在自己本地`checkout -b local`创建一个本地开发分支
3. 在本地的开发分支上开发和测试
4. 阶段性开发完成后（包含功能代码和单元测试），可以在local分支上commit代码, 然后
    1. 首先切换到master分支，git pull拉取最新的分支状态
    2. 然后切回local分支
    3. 通过`git rebase -i` 将本地的多次提交合并为一个，以简化提交历史。本地有多个提交时,如果不进行这一步,在`git rebase master`时会多次解决冲突(最坏情况下,每一个提交都会相应解决一个冲突)
    4. `git rebase master` 将master最新的分支同步到本地，这个过程可能需要手动解决冲突(如果进行了上一步的话,只用解决一次冲突)
    5. .在 rebase 的过程中，也许会出现冲突 conflict 。在这种情况， git 会停止 rebase 并会让你去解决冲突。在解决完冲突后，用 git add 命令去更新这些内容。
    6. 注意，你无需执行 `git commit`，只要执行 `git rebase --continue`, 这样 git 会继续应用余下的 patch 补丁文件。
    7. 然后切换到master分支，git merge将本地的local分支内容合并到master分支
    8. git push将master分支的提交上传


## 如何合并多次提交纪录

每一次功能开发， 对多个 commit 进行合并处理。
这时候就需要用到 `git rebase -i` 了。这个命令没有太难，不常用可能源于不熟悉，所以我们来通过示例学习一下:

执行`git rebase -i`, 
![](/img/git_tutorial/rebase_i1.png)

我们设置第二个”pick 657a291 add 2.txt” 为” s 657a291 add 2.txt”这里的s就是squash命令的简写。squash的意思是说, 让`657a291 add 2.txt`这个提交压缩入前一个提交里面去(即`a7b18c4 add 1.txt`这个提交), 所以`git rebase -i`之后就把`add 2.txt`和`add 1.txt`这两个提交变成一个提交了.  
跳出来了一个临时文件，最上面是两行commit message。我们修改下这个总体的commit message。
![](/img/git_tutorial/rebase_i2.png)

删除之前的两条message(ESC dd)，设置一总的message 然后保存退出。(ESC wq)
我们查看下log, `git log`
是不是没有了之前的两个commit。
![](/img/git_tutorial/rebase_i3.png)


# 贮藏stash

设想一个场景，假设我们正在一个新的分支做新的功能，这个时候突然有一个紧急的bug需要修复，而且修复完之后需要立即发布。当然你说我先把刚写的一点代码进行提交不就行了么？这样理论上当然是ok的，但是这会产品垃圾commit，原则上我们每次的commit都要有实际的意义，你的代码只是刚写了一半，还没有什么实际的意义是不建议就这样commit的，那么有没有一种比较好的办法，可以让我暂时切到别的分支，修复完bug再切回来，而且代码也能保留的呢？

试试`git stash`吧

常用git stash命令：

* `git stash save "save message"`  : 执行存储时，添加备注，方便查找，只有git stash 也要可以的，但查找时不方便识别。
* `git stash list`  ：查看stash了哪些存储
* `git stash show` ：显示做了哪些改动，默认show第一个存储,如果要显示其他存贮，后面加stash@{$num}，比如第二个 git stash show stash@{1}
* `git stash show -p` : 显示第一个存储的改动，如果想显示其他存存储，命令：git stash show  stash@{$num}  -p ，比如第二个：git stash show  stash@{1}  -p
* `git stash apply` :应用某个存储,但不会把存储从存储列表中删除，默认使用第一个存储,即stash@{0}，如果要使用其他个，git stash apply stash@{$num} ， 比如第二个：git stash apply stash@{1} 
* `git stash pop` ：命令恢复之前缓存的工作目录，将缓存堆栈中的对应stash删除，并将对应修改应用到当前的工作目录下,默认为第一个stash,即stash@{0}，如果要应用并删除其他stash，命令：git stash pop stash@{$num} ，比如应用并删除第二个：git stash pop stash@{1}
* `git stash drop stash@{$num}` ：丢弃stash@{$num}存储，从列表中删除这个存储
* `git stash clear` ：删除所有缓存的stash

```
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git checkout old_demo 
error: Your local changes to the following files would be overwritten by checkout:
	README.md
Please, commit your changes or stash them before you can switch branches.
Aborting
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git stash 
Saved working directory and index state WIP on new_test_branch: b3ad5d2 modify md
HEAD is now at b3ad5d2 modify md
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git checkout old_demo 
Switched to branch 'old_demo'
Your branch is up-to-date with 'origin/old_demo'.
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git checkout new_test_branch 
Switched to branch 'new_test_branch'
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git stash list
stash@{0}: WIP on new_test_branch: b3ad5d2 modify md
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git stash pop stash@{0}
On branch new_test_branch
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   README.md

no changes added to commit (use "git add" and/or "git commit -a")
Dropped stash@{0} (88cd440c10c80bb6eaef9f4d86ab4a0be3d6dc00)

```

**. . .**<!-- more -->

# 处理冲突

假设这样一个场景，A和B两位同学各自开了两个分支来开发不同的功能，大部分情况下都会尽量互不干扰的，但是有一个需求A需要改动一个基础库中的一个类的方法，不巧B这个时候由于业务需要也改动了基础库的这个方法，因为这种情况比较特殊，A和B都认为不会对地方造成影响，等两人各自把功能做完了，需要合并的到主分支 master 的时候，我们假设先合并A的分支，这个时候没问题的，之后再继续合并B的分支，这个时候想想也知道就有冲突了，因为A和B两个人同时更改了同一个地方，Git 本身他没法判断你们两个谁更改的对，但是这个时候他会智能的提示有 conflicts

就像下面这种情况 : 
```
b@b-VirtualBox:~/git_test_link/Flock-AI-Fish-Unreal-VR$ git merge plugin 
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

打开READ.md文件一看发现冲突的地方如下: 
```
<<<<<<< HEAD
mmmp
=======
nani
>>>>>>plugin
```

冲突的地方由 ==== 分出了上下两个部分，上部分一个叫 HEAD 的字样代表是我当前所在分支的代码，下半部分是一个叫 plugin 分支的代码，可以看到 HEAD 是那里加了一行mmmp，而plugin分支则加了一句nani, 所以我们得跟团队的其他人商量一下看看要改成什么样，而且同时也要把那些 «< HEAD、==== 以及 »»»plugin 这些标记符号也一并删除，最后进行一次 commit 就ok了。

处理完之后, `git add`那个文件即可

# 标签tag


主要介绍附注标签( annotated tag)

## 创建附注标签

`git tag -a v0.1.2 -m "0.1.2版本"`

创建轻量标签不需要传递参数，直接指定标签名称即可。
创建附注标签时，参数a即annotated的缩写，指定标签类型，后附标签名。参数m指定标签说明，说明信息会保存在标签对象中。

## 切换到标签

与切换分支命令相同，用`git checkout [tagname]`

## 查看标签信息

用git show命令可以查看标签的版本信息：
`git show v0.1.2`

## 删除标签

误打或需要修改标签时，需要先将标签删除，再打新标签。

### 删除本地标签

`git tag -d v0.1.2`
参数d即delete的缩写，意为删除其后指定的标签。

### 删除远程标签

用法 : `git push origin :refs/tags/标签名`  或 `git push origin --delete tag 标签名`

  
比如 : `git push origin :refs/tags/protobuf-2.5.0rc1` 或 `git push origin --delete tag protobuf-2.5.0rc1`

## 给指定的commit打标签

打标签不必要在head之上，也可在之前的版本上打，这需要你知道某个提交对象的校验和（通过git log获取）。
`git tag -a v0.1.1 9fbc3d0`

## 标签发布

通常的git push不会将标签对象提交到git服务器，我们需要进行显式的操作：

- `git push origin v0.1.2`  将v0.1.2标签提交到git服务器
- `git push origin -–tags` 将本地所有标签一次性提交到git服务器


# 对比diff


- 比如查看当前还未git add的文件的不同 : `git diff`
- 比如查看当前已经add 没有commit 的改动 :  `git diff --cached`
- 比如查看当前所有改动和HEAD的区别(当前还未git add的文件的改动和当前当前已经add 但没有commit 的改动), 也就是上面两条命令的合并 : `git diff HEAD`
- 比如查看 commit_id为a和commit_id为b的temp文件夹的差异 : `git diff a b temp`

