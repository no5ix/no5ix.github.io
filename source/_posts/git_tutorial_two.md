---
title: 5分钟学会Git二
date: 2016-04-13 22:36:56
tags: 
- Git
categories:
- Misc
---

# 贮藏stash

设想一个场景，假设我们正在一个新的分支做新的功能，这个时候突然有一个紧急的bug需要修复，而且修复完之后需要立即发布。当然你说我先把刚写的一点代码进行提交不就行了么？这样理论上当然是ok的，但是这会产品垃圾commit，原则上我们每次的commit都要有实际的意义，你的代码只是刚写了一半，还没有什么实际的意义是不建议就这样commit的，那么有没有一种比较好的办法，可以让我暂时切到别的分支，修复完bug再切回来，而且代码也能保留的呢？

试试`git stash`吧

- `git stash` : 把当前的文件改动贮藏起来
- `git stash list`: 查看当前有哪些贮藏记录
- `git stash pop stash_list_id`: 会帮你把代码还原，还自动帮你把这条 stash 记录删除

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

# 标签tag


主要介绍附注标签( annotated tag)

## 创建附注标签

`git tag -a v0.1.2 -m “0.1.2版本”`

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

用法 : `git push origin :refs/tags/标签名`  
  
比如 : `git push origin :refs/tags/protobuf-2.5.0rc1`  

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

