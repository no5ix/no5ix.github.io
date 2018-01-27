---
title: Linux常用运维命令(netstat和lsof)笔记整理(二)
date: 2015-03-09 23:16:16
tags: 
- 运维
categories:
- Linux
---


# netstat 

>netstat命令用来打印Linux中网络系统的状态信息，可让你得知整个Linux系统的网络情况。

- -**a或--all：显示所有连线中的Socket；**
- -A<网络类型>或--<网络类型>：列出该网络类型连线中的相关地址；
- -c或--continuous：持续列出网络状态；
- -C或--cache：显示路由器配置的快取信息；
- -e或--extend：显示网络其他相关信息；
- -F或--fib：显示FIB；
- -g或--groups：显示多重广播功能群组组员名单；
- -h或--help：在线帮助；
- -i或--interfaces：显示网络界面信息表单；
- -**l或--listening：显示监控中的服务器的Socket；**
- -M或--masquerade：显示伪装的网络连线；
- -**n或--numeric：直接使用ip地址，而不通过域名服务器；**
- -N或--netlink或--symbolic：显示网络硬件外围设备的符号连接名称；
- -o或--timers：显示计时器；
- -**p或--programs：显示正在使用Socket的程序识别码和程序名称；**
- -r或--route：显示Routing Table；
- -s或--statistice：显示网络工作信息统计表；
- -t或--tcp：显示TCP传输协议的连线状况；
- -u或--udp：显示UDP传输协议的连线状况；
- -v或--verbose：显示指令执行过程；
- -V或--version：显示版本信息；
- -w或--raw：显示RAW传输协议的连线状况；
- -x或--unix：此参数的效果和指定"-A unix"参数相同；
- --ip或--inet：此参数的效果和指定"-A inet"参数相同。

... <!-- more -->

## *netstat常用用法：netstat -anlp*


netstat -anlpt的含义是 ： 列出所有处于使用tcp协议的 Sockets
```
b@b-VirtualBox:~$ sudo netstat -anlpt
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.1.1:53            0.0.0.0:*               LISTEN      1075/dnsmasq    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      935/sshd        
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN      2271/cupsd      
tcp6       0      0 :::22                   :::*                    LISTEN      935/sshd        
tcp6       0      0 ::1:631                 :::*                    LISTEN      2271/cupsd      
tcp6       1      0 ::1:50654               ::1:631                 CLOSE_WAIT  1027/cups-browsed
```
查看udp的就是netstat -anlpu；
只查看tcp和udp的就是netstat -anlptu

# lsof （list open files）

> lsof命令用于查看你进程开打的文件，打开文件的进程，进程打开的端口(TCP、UDP)。找回/恢复删除的文件。是十分方便的系统监视工具，因为lsof命令需要访问核心内存和各种文件，所以需要root用户执行。 

在linux环境下，任何事物都以文件的形式存在，通过文件不仅仅可以访问常规数据，还可以访问网络连接和硬件。
所以如传输控制协议 (TCP) 和用户数据报协议 (UDP) 套接字等，系统在后台都为该应用程序分配了一个文件描述符，无论这个文件的本质如何，该文件描述符为应用程序与基础操作系统之间的交互提供了通用接口。
因为应用程序打开文件的描述符列表提供了大量关于这个应用程序本身的信息，因此通过lsof工具能够查看这个列表对系统监测以及排错将是很有帮助的。

- -a：列出打开文件存在的进程；
- -c<进程名>：列出指定进程所打开的文件；
- -g：列出GID号进程详情；
- -d<文件号>：列出占用该文件号的进程；
- +d<目录>：列出目录下被打开的文件；
- +D<目录>：递归列出目录下被打开的文件；
- -n<目录>：列出使用NFS的文件；
- -**i<条件>：列出符合条件的进程。（4、6、协议、:端口、 @ip ）**
- -**p<进程号>：列出指定进程号所打开的文件；**
- -u：列出UID号进程详情；
- -h：显示帮助信息；
- -v：显示版本信息
- -R: 显示PPID（父进程ID）

## *lsof常用用法1：lsof -p*


ps -ef |grep sshd|grep -v grep| awk '{print $2}'|xargs sudo lsof -p的含义是：
列出sshd进程打开的所有文件描述符
```
b@b-VirtualBox:~$ ps -ef |grep sshd|grep -v grep| awk '{print $2}'|xargs sudo lsof -p
lsof: WARNING: can't stat() fuse.gvfsd-fuse file system /run/user/1000/gvfs
      Output information may be incomplete.
COMMAND PID USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME
sshd    935 root  cwd    DIR    8,1     4096      2 /
sshd    935 root  rtd    DIR    8,1     4096      2 /
sshd    935 root  txt    REG    8,1   770944 301274 /usr/sbin/sshd
sshd    935 root  mem    REG    8,1    43616 136982 /lib/x86_64-linux-gnu/libnss_files-2.19.so
sshd    935 root  mem    REG    8,1    47760 136992 /lib/x86_64-linux-gnu/libnss_nis-2.19.so
sshd    935 root  mem    REG    8,1    39824 136978 /lib/x86_64-linux-gnu/libnss_compat-2.19.so
sshd    935 root  mem    REG    8,1   101240 137033 /lib/x86_64-linux-gnu/libresolv-2.19.so
sshd    935 root  mem    REG    8,1    14256 136950 /lib/x86_64-linux-gnu/libkeyutils.so.1.4
sshd    935 root  mem    REG    8,1    43672 403209 /usr/lib/x86_64-linux-gnu/libkrb5support.so.0.1
sshd    935 root  mem    REG    8,1   186824 403203 /usr/lib/x86_64-linux-gnu/libk5crypto.so.3.1
sshd    935 root  mem    REG    8,1    31792 137035 /lib/x86_64-linux-gnu/librt-2.19.so
sshd    935 root  mem    REG    8,1   141574 137027 /lib/x86_64-linux-gnu/libpthread-2.19.so
sshd    935 root  mem    REG    8,1   252032 137010 /lib/x86_64-linux-gnu/libpcre.so.3.13.1
sshd    935 root  mem    REG    8,1    14664 136924 /lib/x86_64-linux-gnu/libdl-2.19.so
sshd    935 root  mem    REG    8,1    97296 136976 /lib/x86_64-linux-gnu/libnsl-2.19.so
sshd    935 root  mem    REG    8,1  1840928 136907 /lib/x86_64-linux-gnu/libc-2.19.so
sshd    935 root  mem    REG    8,1    14592 136916 /lib/x86_64-linux-gnu/libcom_err.so.2.1
sshd    935 root  mem    REG    8,1   831616 403207 /usr/lib/x86_64-linux-gnu/libkrb5.so.3.3
sshd    935 root  mem    REG    8,1   290520 403037 /usr/lib/x86_64-linux-gnu/libgssapi_krb5.so.2.2
sshd    935 root  mem    REG    8,1    43368 136917 /lib/x86_64-linux-gnu/libcrypt-2.19.so
sshd    935 root  mem    REG    8,1   100728 137070 /lib/x86_64-linux-gnu/libz.so.1.2.8
sshd    935 root  mem    REG    8,1    10680 137062 /lib/x86_64-linux-gnu/libutil-2.19.so
sshd    935 root  mem    REG    8,1  1934624 136919 /lib/x86_64-linux-gnu/libcrypto.so.1.0.0
sshd    935 root  mem    REG    8,1   281552 136921 /lib/x86_64-linux-gnu/libdbus-1.so.3.7.6
sshd    935 root  mem    REG    8,1    14536 440884 /usr/lib/x86_64-linux-gnu/libck-connector.so.0.0.0
sshd    935 root  mem    REG    8,1   134296 137037 /lib/x86_64-linux-gnu/libselinux.so.1
sshd    935 root  mem    REG    8,1    55856 136999 /lib/x86_64-linux-gnu/libpam.so.0.83.1
sshd    935 root  mem    REG    8,1   104936 136897 /lib/x86_64-linux-gnu/libaudit.so.1.0.0
sshd    935 root  mem    REG    8,1    36632 137067 /lib/x86_64-linux-gnu/libwrap.so.0.7.6
sshd    935 root  mem    REG    8,1   149120 136883 /lib/x86_64-linux-gnu/ld-2.19.so
sshd    935 root    0u   CHR    1,3      0t0      6 /dev/null
sshd    935 root    1u   CHR    1,3      0t0      6 /dev/null
sshd    935 root    2u   CHR    1,3      0t0      6 /dev/null
sshd    935 root    3u  IPv4  10479      0t0    TCP *:ssh (LISTEN)
sshd    935 root    4u  IPv6  10481      0t0    TCP *:ssh (LISTEN)
```


- ps -ef | grep sshd | grep -v grep : 获取ps打印出来的列表中的sshd进程所在的那一行（grep -v grep的含义是清除掉包含“grep”字符串的那一行）, 即为：
```
b@b-VirtualBox:~$ ps -ef | grep sshd | grep -v grep
root       935     1  0 17:37 ?        00:00:00 /usr/sbin/sshd -D
```

- awk '{print $2}' : 获取上述命令打印出来结果的第2列（上述结果的第二列为sshd的pid， 是935）
- xargs sudo lsof -p ： 列出上述结果pid为935的进程打开的所有文件描述符， 等价于sudo lsof -p 935的结果

## *lsof常用用法：lsof -i:*
sudo lsof -i:22含义为列出占用22的进程
```
b@b-VirtualBox:~$ sudo lsof -i:22
COMMAND PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
sshd    935 root    3u  IPv4  10479      0t0  TCP *:ssh (LISTEN)
sshd    935 root    4u  IPv6  10481      0t0  TCP *:ssh (LISTEN)
```
