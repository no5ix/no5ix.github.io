---
title: Linux常用运维命令(df和free和top)笔记整理(三)
date: 2015-03-11 12:16:56
tags: 
- Command
categories:
- Linux
---

# **df**

>df命令用于显示磁盘分区上的可使用的磁盘空间。默认显示单位为KB。可以利用该命令来获取硬盘被占用了多少空间，目前还剩下多少空间等信息。

- -a或--all：包含全部的文件系统；
- --block-size=<区块大小>：以指定的区块大小来显示区块数目；
- -h或--human-readable：以可读性较高的方式来显示信息；
- -H或--si：与-h参数相同，但在计算时是以1000 Bytes为换算单位而非1024 Bytes；
- -i或--inodes：显示inode的信息；
- -k或--kilobytes：指定区块大小为1024字节；
- -l或--local：仅显示本地端的文件系统；
- -m或--megabytes：指定区块大小为1048576字节；
- --no-sync：在取得磁盘使用信息前，不要执行sync指令，此为预设值；
- -P或--portability：使用POSIX的输出格式；
- --sync：在取得磁盘使用信息前，先执行sync指令；
- -t<文件系统类型>或--type=<文件系统类型>：仅显示指定文件系统类型的磁盘信息；
- -T或--print-type：显示文件系统的类型；
- -x<文件系统类型>或--exclude-type=<文件系统类型>：不要显示指定文件系统类型的磁盘信息；
- --help：显示帮助；
- --version：显示版本信息

**. . .**<!-- more -->

## *df常用用法：df -h*
```
b@b-VirtualBox:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            990M  4.0K  990M   1% /dev
tmpfs           201M  968K  200M   1% /run
/dev/sda1       8.8G  4.1G  4.3G  49% /
none            4.0K     0  4.0K   0% /sys/fs/cgroup
none            5.0M     0  5.0M   0% /run/lock
none           1001M   76K 1001M   1% /run/shm
none            100M   36K  100M   1% /run/user
/dev/sr0         57M   57M     0 100% /media/b/VBOXADDITIONS_5.1.22_115126
```

# **free**

>free命令可以显示当前系统未使用的和已使用的内存数目，还可以显示被内核使用的内存缓冲区。

## *free常用用法：free -m或者free -g*
```
b@b-VirtualBox:~$ free -m
             total       used       free     shared    buffers     cached
Mem:          2000       1231        768          9         72        456
-/+ buffers/cache:        702       1297
Swap:         1021          0       1021
```

# top

- PID：进程的ID
- USER：进程所有者
- PR：进程的优先级别，越小越优先被执行
- NInice：值
- VIRT：进程占用的虚拟内存
- RES：进程占用的物理内存
- SHR：进程使用的共享内存
- S：进程的状态。S表示休眠，R表示正在运行，Z表示僵死状态，N表示该进程优先值为负数
- %CPU：进程占用CPU的使用率
- %MEM：进程使用的物理内存和总内存的百分比
- TIME+：该进程启动后占用的总的CPU时间，即占用CPU使用时间的累加值。
- COMMAND：进程启动命令名称

另 :

- 1：使用 ps -ef|grep xxx 命令查找需要查看的进程，xxx是进程名字
- 2：top -p pid 查看程序的情况 
- 3：ps -aux | grep process_name
- 4：cat /proc/pid/status 
这里会打印出当前进程详细的情况，其中，内存是 VmRSS。 
( 注：pid是要替换成一个id数字的。)