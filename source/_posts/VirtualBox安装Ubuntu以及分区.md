---
title: VirtualBox安装Ubuntu以及分区
date: 2018-01-01 23:00:31
tags:
- vbox
categories:
- 杂
---


# 需准备的工具和材料

- 虚拟机软件 : VirtualBox-4.3.10-93012-Win.exe, 不推荐高版本5.0以上的, 我用5.2版本的出现了"不能为虚拟电脑打开一个新任务"的错误
- Ubuntu : 我用的是14.04版本 

<!--more -->

<h1 id="创建虚拟机">创建虚拟机</h1>

<ul>
<li>点击 <code>新建(N)</code></li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v1.png" alt="这里写图片描述" title=""></p>

<ul>
<li>设置虚拟机的名称，类型与版本，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v2.png" alt="这里写图片描述" title=""></p>

<ul>
<li>分配虚拟机的内存大小，受PC实际内存影响，暂时设置为2G，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v3.png" alt="这里写图片描述" title=""></p>

<ul>
<li>分配虚拟机的硬盘大小，默认即可，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v4.png" alt="这里写图片描述" title=""></p>

<ul>
<li>分配虚拟机的硬盘文件类型，默认即可，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v5.png" alt="这里写图片描述" title=""></p>

<ul>
<li>分配虚拟机的存储方式，默认即可，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v6.png" alt="这里写图片描述" title=""></p>

<ul>
<li>设置虚拟机的保存路径，根据个人实际情况而定，虚拟硬盘大小一般要大于20G，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v7.png" alt="这里写图片描述" title=""></p>

<ul>
<li>创建完成后，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v8.png" alt="这里写图片描述" title=""></p>

<ul>
<li>点击 <code>设置(s)</code> 对虚拟机进行一些必要的设置，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v9.png" alt="这里写图片描述" title=""></p>

<ul>
<li>此时， 有<code>发现有无效设置</code>提示，原因是：内存分配已经超出实际内存一半，会影响其他软件的运行。如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v10.png" alt="这里写图片描述" title=""></p>

<ul>
<li>将虚拟机的内存大小修改成建议的 1G，并修改系统启动顺序，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v11.png" alt="这里写图片描述" title=""></p>

<ul>
<li>修改 <code>存储设置</code>，也是设置系统启动运行的ISO文件，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v12.png" alt="这里写图片描述" title=""></p>

<ul>
<li>选择 <code>没有盘片</code>，<code>分配光驱</code> 选择 <code>第二IDE控制器主通道</code> ，并点击右边光盘小图标，选择要安装的ISO文件，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v13.png" alt="这里写图片描述" title=""></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v14.png" alt="这里写图片描述" title=""></p>

<ul>
<li>修改网络设置，网络连接方式设置为 <code>桥接方式</code>，如下图所示：</li>
</ul>

<p><img src="http://www.eaibot.com/git_images/chapter4/VBox/v15.png" alt="这里写图片描述" title=""></p>

<p>到时，虚拟机设置完毕。</p>



<h1 id="安装ubuntu1404">安装Ubuntu14.04</h1>

<p>点击<code>启动(T)</code>，开始运行虚拟机，等待进入 Ubuntu 安装界面</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi1.jpg" alt="这里写图片描述" title=""></p>

<p>选择语言<code>简体(中文)</code></p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi2.jpg" alt="这里写图片描述" title=""></p>

<p>点击 <code>继续</code>，即可</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi3.jpg" alt="这里写图片描述" title=""></p>

<p><code>安装类型</code>，选择<code>其他选项</code>，手动分区</p>

<p><img src="http://www.eaibot.com/git_images/chapter4/vi/vi4.jpg" alt="这里写图片描述" title=""></p>

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