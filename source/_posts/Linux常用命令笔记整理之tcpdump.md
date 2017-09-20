---
title: Linux常用命令笔记整理之tcpdump
date: 2015-11-03 19:25:59
tags: 
- tcpdump
categories:
- linux
---

> 强大的抓包工具, 博大精深内容太多, 所以这篇博客整理得只说常用, 具体的参考tcpdump用户手册, 
> tcpdump需要root权限, 所以记得加上sudo

## **常用参数**
- -nn选项：
意思是说当tcpdump遇到协议号或端口号时，不要将这些号码转换成对应的协议名称或端口名称。比如，大家都知道80是http端口，tcpdump就不会将它显示成http了

- -c选项：
是Count的含义，这设置了我们希望tcpdump帮我们抓几个包。

- -i : 指定哪一张网卡

- -l : 使得输出变为行缓冲

- -t :  输出时不打印时间戳

- -v :  输出更详细的信息

- -F : 指定过滤表达式所在的文件, 可以建立了一个filter.txt文本文件来存储过滤表达式，然后通过-F来指定filter.txt

- -w : 将流量保存到文件中

- -r :  读取raw packets文件

<!-- more -->

## **常用过滤规则**

- 只看到目的机器dst(比如是qq.com)之间的网络包
sudo tcpdump -i eth0 'dst qq.com' 也可以写成 sudo tcpdump -i eth0 'dst host qq.com'

> 注 : 上述的那个host可以省略
> tcpdump支持如下的类型：
1. host：指定主机名或IP地址，例如’host roclinux.cn’或’host 202.112.18.34′
2. net ：指定网络段，例如’arp net 128.3’或’dst net 128.3′
3. portrange：指定端口区域，例如’src or dst portrange 6000-6008′
4. port : 端口
如果我们没有设置过滤类型，那么默认是host。

- 只抓udp的包
sudo tcpdump -i eth0 'udp'

> tcpdump具有根据网络包的协议来进行过滤的能力，我们还可以把udp改为ether、ip、ip6、arp、tcp、rarp等

- 只抓目的机器的某个端口的包(比如只抓baidu.com的53或者80端口的包)
sudo tcpdump -i eth0 'dst baidu.com and (dst port 53 or dst port 80)'

- 通过eth0网卡的，且来源是qq.com服务器或者目标是qq.com服务器的网络包
sudo tcpdump -i eth0 'host qq.com'

- 通过eth0网卡的，且qq.com和baidu.com之间通讯的网络包，或者qq.com和sina.cn之间通讯的网络包
tcpdump -i eth0 'host qq.com and (baidu.com or sina.cn)'

- 获取和baidu.com之间建立TCP三次握手中第一个网络包，即带有SYN标记位的网络包
sudo tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0 and dst host baidu.com'

> 注 : 
> 因为用proto [ expr : size]语法在写过滤表达式时，你需要把协议格式完全背在脑子里，才能把表达式写对。可这对大多数人来说，可能有些困难。为了让tcpdump工具更人性化一些，有一些常用的偏移量，可以通过一些名称来代替，比如icmptype表示ICMP协议的类型域、icmpcode表示ICMP的code域，tcpflags则表示TCP协议的标志字段域。

> 更进一步的，对于ICMP的类型域，可以用这些名称具体指代：icmp-echoreply, icmp-unreach, icmp-sourcequench, icmp-redirect, icmp-echo, icmp-routeradvert, icmp-routersolicit, icmp-timxceed, icmp-paramprob, icmp-tstamp, icmp-tstampreply, icmp-ireq, icmp-ireqreply, icmp-maskreq, icmp-maskreply。

> 而对于TCP协议的标志字段域，则可以细分为tcp-fin, tcp-syn, tcp-rst, tcp-push, tcp-ack, tcp-urg。

## **输出内容解释**

```
b@b-VirtualBox:~$ sudo tcpdump -i eth0 'host baidu.com'
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 65535 bytes
06:46:17.487920 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [S], seq 546310089, win 29200, options [mss 1460,sackOK,TS val 1221546 ecr 0,nop,wscale 7], length 0
06:46:17.530422 IP 111.13.101.208.http > 192.168.1.57.60110: Flags [S.], seq 3245676077, ack 546310090, win 8192, options [mss 1440,sackOK,nop,nop,nop,nop,nop,nop,nop,nop,nop,nop,nop,wscale 5], length 0
06:46:17.530458 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [.], ack 1, win 229, length 0
06:46:17.530982 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [P.], seq 1:504, ack 1, win 229, length 503
06:46:17.576476 IP 111.13.101.208.http > 192.168.1.57.60110: Flags [.], ack 504, win 216, length 0
06:46:17.577447 IP 111.13.101.208.http > 192.168.1.57.60110: Flags [P.], seq 1:291, ack 504, win 216, length 290
06:46:17.577459 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [.], ack 291, win 237, length 0
06:46:17.577482 IP 111.13.101.208.http > 192.168.1.57.60110: Flags [P.], seq 291:452, ack 504, win 216, length 161
06:46:17.577485 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [.], ack 452, win 245, length 0
06:46:17.866950 IP 111.13.101.208.http > 192.168.1.57.60110: Flags [P.], seq 291:452, ack 504, win 216, length 161
06:46:17.866966 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [.], ack 452, win 245, options [nop,nop,sack 1 {291:452}], length 0
06:46:27.865805 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [.], ack 452, win 245, length 0
06:46:27.909962 IP 111.13.101.208.http > 192.168.1.57.60110: Flags [.], ack 504, win 216, length 0
06:46:37.925624 IP 192.168.1.57.60110 > 111.13.101.208.http: Flags [.], ack 452, win 245, length 0

```

{% asset_img tcpdump1.png tcpdump %}