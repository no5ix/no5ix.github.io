---
title: VirtualBox安装Ubuntu以及分区
date: 2018-01-01 23:00:31
tags:
- VBox
categories:
- Linux
---

最近因某些原因重装了Win10, 虚拟机也需要重装, 记录一下过程, 供以后查阅, 以免走更多弯路

# 需准备的工具和材料

- 虚拟机软件
- Ubuntu : 我用的是14.04版本 
- 建议给虚拟机分配20G硬盘空间
- 建议给虚拟机分配4G内存


**. . .**<!-- more -->



# virtualBox网络设置

在virtualBox的你的那个虚拟机里的网络设置里添加两张网卡, 注意 : 这两张网卡的顺序不能颠倒

**网卡1**必须是 : “仅主机（Host-Olny）网络”， 这张网卡是用来让宿主机是访问你的这个虚拟机的， 这样当虚拟机装了openssh-server之后就能用ssh工具从宿主机连到你的这个虚拟机了
**网卡2**必须是 : “网络地址转换（NAT）”， 不是那个“NAT网络”噢， 这张网卡是用来访问宿主机和外网的






<h1 id="安装增强功能">安装增强功能</h1>

<p><strong>注 : 如果在侧边找到如下图加载的虚拟光驱，就需要先右击，点击弹出，然后才可正常安装增强功能</strong></p>
<p><img src="/img/vbox_install_ubuntu_tutorial/20150116222056924.jpg" alt="" /><br /></p>
<p>点击安装增强功能</p>
<p><img src="/img/vbox_install_ubuntu_tutorial/20150116222128125.jpg" alt="" /><br /></p>
<p>点击“运行”</p>
<p><img src="/img/vbox_install_ubuntu_tutorial/20150116222246498.jpg" alt="" /><br /></p>
<p>输入登录系统的密码，点击授权，就开始自动安装了</p>
<p><img src="/img/vbox_install_ubuntu_tutorial/20150116222308759.jpg" alt="" /><br /></p>
<p>如图，为安装界面，安装完成后按下回车键，就按照成功了。</p>
<p><img src="/img/vbox_install_ubuntu_tutorial/20150116222336153.jpg" alt="" /><br /></p>
<p>安装好后关闭ubuntu再次启动ubuntu的时候，虚拟机就可以在无缝模式和自动显示尺寸下运行了。</p>

