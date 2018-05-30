---
title: Putty使用密钥自动登陆SSH
date: 2015-08-23 15:11:26
tags:
- VBox
categories:
- Misc
---


<div class="con editor-preview-side"><p>平时工作学习必须要使用Windows，在SSH远程连接软件里Putty算是用得比较顺手的，而且很小巧。</p><p><a href="/img/putty_auto_login_ssh/113555117.png" target="_blank"><img src="/img/putty_auto_login_ssh/113555117.png" style="float:none;" title="2013-12-05_111750.png" alt="113555117.png" /></a></p><p><br /></p><p>但是每次输入密码很麻烦，还容易输错，OpenSSH可以利用密钥来自动登陆，如此一来方便了不少。配置过程分为三步：</p><p><strong>1、生成公钥和私钥</strong></p><p>先要下载一个叫puttygen的软件（下载见附件），在Windows端生成公钥和私钥。</p><p>点击Generate开始生成</p><p><a href="/img/putty_auto_login_ssh/113555442.png" target="_blank"><img src="/img/putty_auto_login_ssh/113555442.png" style="float:none;" title="2013-12-05_111133.png" alt="113555442.png" /></a></p><p>在生成过程中用鼠标在进度条下面的<span style="color:#ff0000;">空白处乱晃</span>几下，产生随机性：</p><p><a href="/img/putty_auto_login_ssh/113555424.png" target="_blank"><img src="/img/putty_auto_login_ssh/113555424.png" title="2013-12-05_111207.png" style="float:none;" alt="113555424.png" /></a></p><p>生成完毕，将私钥保存起来：</p><p><a href="/img/putty_auto_login_ssh/131658317.png" target="_blank"><img src="/img/putty_auto_login_ssh/131658317.png" title="67.png" alt="131658317.png" /></a></p><p>然后将公钥全选复制。<br /></p><p><a href="/img/putty_auto_login_ssh/131248930.png" target="_blank"><img src="/img/putty_auto_login_ssh/131248930.png" title="78.png" alt="131248930.png" /></a></p><p><br /></p><p><strong>2、远程主机配置</strong></p><p>我这里使用的是CentOS6.4，已经安装了OpenSSH，如果远程主机没有安装的，先要安装。</p><p>先连接上远程主机，然后输入命令</p><pre class="brush:bash;toolbar:false;">mkdir .ssh</pre><pre class="brush:bash;toolbar:false;">chmod 700 .ssh</pre><pre class="brush:bash;toolbar:false;">vim ~/.ssh/authorized_keys</pre><p>按“i”键进入编辑模式（用过vi/vim的都应该知道吧），然后点鼠标右键将刚才复制的公钥粘贴进去，然后按“Esc”，输入wq&lt;Enter&gt;保存。</p><p><a href="/img/putty_auto_login_ssh/131401631.png" target="_blank"><img src="/img/putty_auto_login_ssh/131401631.png" title="89.png" alt="131401631.png" /></a></p><p>安全起见，设置验证文件为只读：</p><p><br /></p><pre class="brush:bash;toolbar:false;">chmod 400 ~/.ssh/authorized_keys</pre><p><span style="font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;"><span style="line-height:17.59375px;"><br /></span></span></p><p><strong><span style="font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;"><span style="line-height:17.59375px;">3、Putty端配置</span></span></strong></p><p><strong><span style="font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;"><span style="line-height:17.59375px;"><br /></span></span></strong></p><p><span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;">先到Connection-Data项设置自己的登陆用户名，如图（我的是root）：</span></p><p><span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;"></span></p><p><a href="/img/putty_auto_login_ssh/131535572.png" style="font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;line-height:17.59375px;" target="_blank"><img src="/img/putty_auto_login_ssh/131535572.png" title="99.png" alt="131535572.png" style="float:none;" /></a></p><p><br /></p><p><span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;">再点SSH项下面的Auth，添加第一步保存的私钥</span></p><p><span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;"><a href="/img/putty_auto_login_ssh/131534643.png" target="_blank"><img src="/img/putty_auto_login_ssh/131534643.png" title="100.png" alt="131534643.png" style="float:none;" /></a></span></p><p><br /></p><p><span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;">然后很重要的是要回去Session项里<span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;color:#ff0000;">保存！！！</span>不然下次又得重新添加一遍</span></p><p><span style="line-height:17.59375px;font-family:consolas, 'bitstream vera sans mono', 'courier new', courier, monospace;"><a href="/img/putty_auto_login_ssh/132022649.png" target="_blank"><img src="/img/putty_auto_login_ssh/132022649.png" title="110.png" alt="132022649.png" /></a></span></p><p><br /></p><p>然后再双击Default Settings里保存的任务，就直接登陆进去了：</p><p><a href="http://s3.51cto.com/wyfs02/M01/12/E8/wKiom1MP7Wfh2XdgAABhqqyu7f4525.png" target="_blank"><img src="http://s3.51cto.com/wyfs02/M01/12/E8/wKiom1MP7Wfh2XdgAABhqqyu7f4525.png" title="捕获.PNG" alt="wKiom1MP7Wfh2XdgAABhqqyu7f4525.png" /></a></p><p>是不是很棒~</p><p><br /></p><p>最后再优化一下显示设置（转过来的）：</p><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">字体大小设置</span></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">Window-&gt;Appearance-&gt;Font settings—&gt;Change按钮设置（我的设置为12）</span></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">字体颜色设置</span></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">Window-&gt;Colours-&gt;Default Foreground-&gt;Modify设置（我喜欢绿色设置：R:0 G:255 B:64）</span></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">此外在默认的黑色背景下 蓝色看不太清楚，可以把Window-&gt;Colours-&gt;ANSI Blue 更改一下设置（我设置为R：255 G：0 B：128）</span></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">全屏/退出全屏的快捷键设置</span></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"></div><div style="font-family:'microsoft yahei ui', 'microsoft yahei', simsun, 'segoe ui', tahoma, helvetica, sans-serif, 'microsoft yahei', georgia, helvetica, arial, sans-serif, '宋体', pmingliu, serif;font-size:14px;line-height:21px;"><span style="font-size:14px;">Window-&gt;Behaviour最下面有个Full screen on Alt-Enter 勾上就可以了。</span></div>



# KeepAlive

很多远程主机当你一段时间没有输入, 他就会把你踢下线, 所以需要 KeepAlive 功能, 

![KeepAlive](/img/putty_auto_login_ssh/keep_alive.jpg)

如果填写 0 , 就表示不需要 KeepAlive 功能, 
填写大于 0 的数, 比如 4, 就意味着每 4 秒就会发送一个空包到远程主机来 KeepAlive .
所以建议填写8秒左右的数.



# SSH 证书登陆配置

`sudo vi /etc/ssh/sshd_config`

取消注释 : #AuthorizedKeysFile .ssh/authorized_keys
禁止密码登录 : 修改yes->no : `PasswordAuthentication no`

然后重启ssh : `sudo service sshd restart`


# Putty server refused our key的三种原因和解决方法

server refused our key 是非常容易遇到的错误

## 1、.ssh文件夹权限错或authorized_keys权限错

.ssh 以及其父文件夹（root为/root，普通用户为Home目录）都应该设置为只有该用户可写（比如700）。
且 设置 authorized_keys 的权限为 400

    chmod 700 .ssh
    chmod 400 ~/.ssh/authorized_keys

以下为原因：
ssh服务器的key方式登录对权限要求严格。

- 对于客户端: 私钥必须为600权限或者更严格权限(400), 一旦其他用户可读, 私钥就不起作用(如640), 表现为系统认为不存在私钥
- 对于服务器端: 要求必须公钥其他用户不可写, 一旦其他用户可写(如660), 就无法用key登录, 表现为:Permission denied (publickey).

同时要求.ssh目录其他用户不可写,一旦其他用户可写(如770), 就无法使用key登录, 表现为:Permission denied (publickey).

## 2、SElinux导致

密钥文件不能通过SElinux认证，解决方法如下：

`# restorecon -R -v /home #root用户为/root`

我遇到的就是这种情况，找了好久还找到是这个原因，因为是新装的虚拟机，SElinux还没关闭。
这篇博文详细得说明了原因：http://www.toxingwang.com/linux-unix/linux-basic/846.html

## 3、sshd配置不正确

正确配置方法如下：
/etc/ssh/sshd_config 

1、找到 #StrictModes yes 改成 StrictModes no （去掉注释后改成 no） 

2、找到 #PubkeyAuthentication yes 改成 PubkeyAuthentication yes （去掉注释） 

3、找到 #AuthorizedKeysFile .ssh/authorized_keys 改成 AuthorizedKeysFile .ssh/authorized_keys （去掉注释） 

4、保存 5、/etc/rc.d/init.d/sshd reload 重新加载