---
title: linux一些不要想当然的事(一)之目录权限
date: 2015-03-18 17:11:52
tags:
- directory
categories:
- linux
---

## **目录的可读/可写/可执行权限**

> 不要把目录的这几个权限和档案的这几个权限混淆了, 不要想当然的以为是差不多的, 差很多!
> 记忆技巧 : 档案的rwx是针对于档案的内容来设计的, 而目录的rwx是针对于目录的文件名列表来设计的

<!-- more -->

### **目录可读r**

> - **目录可读权限r** : 只能获得文件列表
> - 特别注意:如果一个目录为非空, 却没有r权限, 即使你有wx的权限, 你用rm -r也是删不掉的, 因为没有r权限拿不到这个目录的文件列表, rm -r 自然也就不晓得要删除什么东西了.只有求助root了
```
b@b-VirtualBox:~/my_temp_test/abc$ mkdir temp
b@b-VirtualBox:~/my_temp_test/abc$ touch temp/dd
b@b-VirtualBox:~/my_temp_test/abc$ ls temp
dd
b@b-VirtualBox:~/my_temp_test/abc$ chmod 444 temp
b@b-VirtualBox:~/my_temp_test/abc$ ls temp
ls: cannot access temp/dd: Permission denied
dd
b@b-VirtualBox:~/my_temp_test/abc$ cd temp/
bash: cd: temp/: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ cat temp/dd 
cat: temp/dd: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ touch temp/yy
touch: cannot touch ‘temp/yy’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ rm temp/dd 
rm: cannot remove ‘temp/dd’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ rm -r temp
rm: descend into write-protected directory ‘temp’? y
rm: cannot remove ‘temp/dd’: Permission denied
rm: remove write-protected directory ‘temp’? y
rm: cannot remove ‘temp’: Directory not empty
```

### **目录可写w**
> - **目录可写权限w** : 代表可以在目录下增加或删除档案和目录和改名(但是必须得有目录可执行权限x的支持才可以, 所以一般有w就会有x)
> - 不要和档案的可写权限混淆了, 即使没有目录可写权限, 有目录可执行x也是可以修改目录下的档案的, 只要拥有要修改的那个档案的可写权限既可.
> - 但也要注意的是: 档案的w是针对于档案的内容来说的, 你可以编辑修改他的内容, 但是如果想删除这个档案, 你需要这个档案所在的目录的w权限.
```
b@b-VirtualBox:~/my_temp_test/abc$ chmod 222 temp
b@b-VirtualBox:~/my_temp_test/abc$ mkdir temp/uu
mkdir: cannot create directory ‘temp/uu’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ touch temp/oo
touch: cannot touch ‘temp/oo’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ chmod 333 temp 
b@b-VirtualBox:~/my_temp_test/abc$ mkdir temp/uu
b@b-VirtualBox:~/my_temp_test/abc$ touch temp/oo
b@b-VirtualBox:~/my_temp_test/abc$ rm -r temp
rm: cannot remove ‘temp’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ rm -r temp/uu
b@b-VirtualBox:~/my_temp_test/abc$ rm temp/oo
b@b-VirtualBox:~/my_temp_test/abc$ ls temp
ls: cannot open directory temp: Permission denied

```

### **目录可执行x**
> - **目录可执行权限x** : 有进入目录的权限,  有在这个目录下执行命令的权限. 但不可以删除或者增加档案和目录(因为不具备目录的可写权限w)
```
b@b-VirtualBox:~/my_temp_test/abc$ chmod 111 temp/
b@b-VirtualBox:~/my_temp_test/abc$ ls temp
ls: cannot open directory temp: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ echo "xxd" > temp/dd
b@b-VirtualBox:~/my_temp_test/abc$ cat temp/dd
xxd
b@b-VirtualBox:~/my_temp_test/abc$ touch temp/yy
touch: cannot touch ‘temp/yy’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ rm temp/dd
rm: cannot remove ‘temp/dd’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ rm -r temp
rm: descend into write-protected directory ‘temp’? y
rm: remove write-protected directory ‘temp’? y
rm: cannot remove ‘temp’: Permission denied
b@b-VirtualBox:~/my_temp_test/abc$ cd temp
b@b-VirtualBox:~/my_temp_test/abc/temp$ ls
ls: cannot open directory .: Permission denied
```