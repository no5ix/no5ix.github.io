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

- 虚拟机软件 : VirtualBox-4.3.10-93012-Win.exe, 不推荐高版本5.0以上的, 我用5.2版本的出现了"不能为虚拟电脑打开一个新任务"的错误
- Ubuntu : 我用的是14.04版本 
- 建议给虚拟机分配20G硬盘空间
- 建议给虚拟机分配4G内存


<!--more -->


# virtualBox网络设置

在virtualBox的你的那个虚拟机里的网络设置里添加两张网卡, 注意 : 这两张网卡的顺序不能颠倒

**网卡1**必须是 : “仅主机（Host-Olny）网络”， 这张网卡是用来让宿主机是访问你的这个虚拟机的， 这样当虚拟机装了openssh-server之后就能用ssh工具从宿主机连到你的这个虚拟机了
**网卡2**必须是 : “网络地址转换（NAT）”， 不是那个“NAT网络”噢， 这张网卡是用来访问宿主机和外网的



<h1 id="安装ubuntu1404">安装Ubuntu14.04</h1>

<p>点击<code>启动(T)</code>，开始运行虚拟机，等待进入 Ubuntu 安装界面</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi1.jpg" alt="这里写图片描述" title=""></p>

<p>选择语言<code>简体(中文)</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi2.jpg" alt="这里写图片描述" title=""></p>

<p>点击 <code>继续</code>，即可</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi3.jpg" alt="这里写图片描述" title=""></p>

<p><code>安装类型</code>，默认选择"清除整个磁盘并安装Ubuntu"即可, 不推荐"手动分区"</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi4.jpg" alt="这里写图片描述" title=""></p>


<p>地点时区选择为<code>Shanghai</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi15.jpg" alt="这里写图片描述" title=""></p>

<p><code>键盘布局</code>默认即可</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi16.jpg" alt="这里写图片描述" title=""></p>

<p>设置用户名，设备名与密码</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi18.jpg" alt="这里写图片描述" title=""></p>

<p>点击<code>继续</code>，开始系统安装</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi19.jpg" alt="这里写图片描述" title=""></p>

<p>安装完毕，点击<code>现在重启</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi20.jpg" alt="这里写图片描述" title=""></p>

<p>重启之后会有个地方要你按一下Enter键, 按完之后等一会儿.之后重启完成之后的显示如下图，说明VirtualBox安装Ubuntu成功。</p>


<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi21.jpg" alt="这里写图片描述" title=""></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi22.jpg" alt="这里写图片描述" title=""></p></div>




<h2 id="手动分区步骤(不推荐)">手动分区步骤(不推荐)</h2>

<p><code>安装类型</code>，选择<code>其他选项</code>，手动分区</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi5.jpg" alt="这里写图片描述" title=""></p>

<p>选择<code>/dev/sda</code>，点击<code>新建分区表</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi6.jpg" alt="这里写图片描述" title=""></p>

<p>弹出提示，点击<code>继续</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi7.jpg" alt="这里写图片描述" title=""></p>

<p>显示可用空间</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi8.jpg" alt="这里写图片描述" title=""></p>

<p>选择<code>空闲</code>空间，<code>+</code>变可用状态，点击<code>+</code>开始分区</p>

<p>先建/boot分区，分区大小512M，类型为主分区，文件格式为Ext4，挂载点为/boot</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi9.jpg" alt="这里写图片描述" title=""></p>

<p>/boot分区分好后，再选择空闲空间进行分区</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi10.jpg" alt="这里写图片描述" title=""> <br>
swap交换区分区，分区大小1G，交换区大小与内存大小相等或是内存大小的两倍，类型为逻辑分区，文件格式为交换空间</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi11.jpg" alt="这里写图片描述" title=""></p>

<p>/分区，分区大小为剩余的空间，类型为逻辑分区，文件格式为Ext4，挂载点为/</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi12.jpg" alt="这里写图片描述" title=""></p>

<p>分好后的分区如下图所示</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi13.jpg" alt="这里写图片描述" title=""></p>

<p>点击<code>现在安装</code>，弹出提示，选择<code>继续</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi14.jpg" alt="这里写图片描述" title=""></p>



<h1 id="安装增强功能">安装增强功能</h1>

<p><strong>注 : 如果在侧边找到如下图加载的虚拟光驱，就需要先右击，点击弹出，然后才可正常安装增强功能</strong></p>
<p><img src="http://img.blog.csdn.net/20150116222056924" alt="" /><br /></p>
<p>点击安装增强功能</p>
<p><img src="http://img.blog.csdn.net/20150116222128125" alt="" /><br /></p>
<p>点击“运行”</p>
<p><img src="http://img.blog.csdn.net/20150116222246498" alt="" /><br /></p>
<p>输入登录系统的密码，点击授权，就开始自动安装了</p>
<p><img src="http://img.blog.csdn.net/20150116222308759" alt="" /><br /></p>
<p>如图，为安装界面，安装完成后按下回车键，就按照成功了。</p>
<p><img src="http://img.blog.csdn.net/20150116222336153" alt="" /><br /></p>
<p>安装好后关闭ubuntu再次启动ubuntu的时候，虚拟机就可以在无缝模式和自动显示尺寸下运行了。</p>

