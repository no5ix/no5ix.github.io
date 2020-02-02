---
title:  SSR server
date: 2019-02-14 13:22:55
tags:
- VPS
categories:
- Misc
---

更多好用的一键脚本请转 https://github.com/ToyoDAdoubi/doubi

# ssr.sh

- 脚本说明: ShadowsocksR 一键安装管理脚本，支持单端口/多端口切换和管理
- 系统支持: CentOS6+ / Debian6+ / Ubuntu14+
- 使用方法: https://doub.io/ss-jc42/
- 项目地址: https://github.com/ToyoDAdoubiBackup/shadowsocksr

**. . .**<!-- more -->

## 脚本特点:
目前网上的各个ShadowsocksR脚本基本都是只有 安装/启动/重启 等基础功能，对于小白来说还是不够简单方便。既然是一键脚本，那么就要尽可能地简单，小白更容易接受使用！

- 支持 限制 用户速度
- 支持 限制 端口设备数
- 支持 显示 当前连接IP
- 支持 显示 SS/SSR连接+二维码
- 支持 切换管理 单/多端口
- 支持 一键安装 锐速
- 支持 一键安装 BBR
- 支持 一键封禁 垃圾邮件(SMAP)/BT/PT

## 下载安装:

```
wget -N --no-check-certificate https://raw.githubusercontent.com/ToyoDAdoubi/doubi/master/ssr.sh && chmod +x ssr.sh && bash ssr.sh
```

<p>
	<span style="font-size:14px;">　　安装ssr软件</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssh3" src="/img/ssr/1-1PPQ92329146.png" style="width: 800px; height: 336px;" /></span></center>
<p>
	&nbsp;</p>

<p>
	<span style="font-size:14px;">　　复制上面的代码到VPS服务器里，安装脚本后，以后只需要运行bash ssr.sh这个快捷命令就可以出现下图的界面进行设置管理了</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr1" src="/img/ssr/1-1PPQ92355210.png" style="width: 318px; height: 372px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　如上图出现管理界面后，<strong>输入数字1来安装SSR服务端</strong>。如果输入1后不能进入下一步，那么请重新连接VPS服务器，然后输入快捷管理命令 bash ssr.sh 再尝试</span></p>
<p>
	<span style="font-size:14px;">　　选择端口直接回车选择默认的就好了。当然了，你也可以设置其他的端口，这个根据个人需求</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr2" src="/img/ssr/1-1PPQ926464O.png" style="width: 292px; height: 170px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　然后设置密码，选择加密方式</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr3" src="/img/ssr/1-1PPQ92G02b.png" style="width: 712px; height: 496px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　接下来选择协议插件</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr4" src="/img/ssr/1-1PPQ92I4640.png" style="width: 598px; height: 161px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　再然后根据自己需求选择是否兼容原版ss客户端</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr5" src="/img/ssr/1-1PPQ92KS19.png" style="width: 597px; height: 246px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　之后选择混淆插件</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr6" src="/img/ssr/1-1PPQ92R4Q1.png" style="width: 811px; height: 145px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　进行混淆插件的设置后，会依次提示你对设备数、单线程限速和端口总限速进行设置，默认值是不进行限制，个人使用的话，选择默认即可，一路敲回车键。</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr7" src="/img/ssr/1-1PPQ92TO10.png" style="width: 761px; height: 355px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　耐心等待一会，出现下面的界面即部署完成：</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr8" src="/img/ssr/1-1PPQ92926326.png" style="width: 800px; height: 275px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　输入快捷管理命令：bash ssr.sh 进入管理界面</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr9" src="/img/ssr/1-1PPQ92953W1.png" style="width: 566px; height: 388px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　根据上图就可以看到自己设置的ssr账号信息，包括IP、端口、密码、加密方式、协议插件、混淆插件等等，如果之后想修改账号信息，选择相应的数字来进行一键修改</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<h3>
	加速VPS服务器 (谷歌BBR加速)</h3>
<p>
	　　</p>
<p>
	<span style="font-size:14px;">　　wget --no-check-certificate <a href="https://github.com/teddysun/across/raw/master/bbr.sh">https://github.com/teddysun/across/raw/master/bbr.sh</a></span></p>
<p>
	<span style="font-size:14px;">&nbsp; &nbsp; &nbsp; chmod +x bbr.sh</span></p>
<p>
	<span style="font-size:14px;">&nbsp; &nbsp; &nbsp;./bbr.sh</span></p>
<p>
	<span style="font-size:14px;">　　执行上面的代码，然后耐心等待，安装成功后重启VPS服务器即可</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr10" src="/img/ssr/1-1PPQ93022553.png" style="width: 800px; height: 160px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr11" src="/img/ssr/1-1PPQ93052W4.png" style="width: 420px; height: 68px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr12" src="/img/ssr/1-1PPQ9311O46.png" style="width: 625px; height: 259px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　最后重启服务器</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<h3>
	ssr客户端下载</h3>
<p>
	<span style="font-size:14px;">　　Windows SSR客户端 <a href="https://github.com/shadowsocksr-backup/shadowsocksr-csharp/releases" target="_blank">点击下载地址</a></span></p>
<p>
	<span style="font-size:14px;">　　MacOS SSR客户端 <a href="https://github.com/shadowsocksr-backup/ShadowsocksX-NG/releases" target="_blank">点击下载地址</a></span></p>
<p>
	<span style="font-size:14px;">　　Linux SSR客户端 <a href="https://github.com/erguotou520/electron-ssr/releases" target="_blank">点击下载地址</a></span></p>
<p>
	<span style="font-size:14px;">　　安卓 SSR客户端 <a href="https://github.com/shadowsocksr-backup/shadowsocksr-android/releases/download/3.4.0.8/shadowsocksr-release.apk" target="_blank">点击下载地址</a></span></p>
<p>
	<span style="font-size:14px;">　　苹果手机SSR客户端：Potatso Lite、Potatso、shadowrocket都可以作为SSR客户端，但这些软件目前已经在国内的app商店下架，可以用美区的appid账号来下载。但是，如果你配置的SSR账号兼容SS客户端，或者协议选择origin且混淆选择plain，那么你可以选择苹果SS客户端软件(即协议和混淆可以不填)，APP商店里面有很多，比如：openwingy、superwingy、bestwingy、wingy+、greatwingy等。</span></p>
<p>
	<span style="font-size:14px;">　　有了账号后，打开SSR客户端，填上信息，这里以Windows版的SSR客户端为例子：</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<center>
	<span style="font-size:14px;"><img alt="ssr13" src="/img/ssr/1-1PPQ93145c5.png" style="width: 800px; height: 395px;" /></span></center>
<p>
	&nbsp;</p>
<p>
	<span style="font-size:14px;">　　在对应的位置，填上服务器IP、服务器端口、密码、加密方式、协议和混淆，最后点击确认</span></p>
<p>
	<span style="font-size:14px;">　　</span></p>
<p>
	　　</p>
<h3>
	常见问题解决方法</h3>
<p>
	<span style="font-size:14px;">　　1、用了一段时间发现SSR账号用不了了?</span></p>
<p>
	<span style="font-size:14px;">　　多半是被墙了，即ip失效。首先ping一下自己的ip，看看能不能<a href="https://idc.wanyunshuju.com/cym/390.html" target="_blank">ping</a>的通，ping不通那么就是ip被墙了，遇到这种情况重新部署一个新的服务器，新的服务器就是新的ip。关于怎么ping ip的方法，可以自行网上搜索，很简单。vultr服务商是折算成小时计费，且开通和删除服务器非常方便(新服务器即新ip。大多数vps服务商都没有这样的服务，一般的vps服务商可能会提供更换1次ip的服务，如果你买的是别家的vps，一定要了解是否能够更换ip，假如不能，那么万一你的ip不幸被墙，钱就打水漂了)</span></p>
<p>
	<span style="font-size:14px;">　　2、刚搭建好的ssr账号，ip能ping通，但是还是用不了?</span></p>
<p>
	<span style="font-size:14px;">　　首选排除杀毒软件的干扰，尤其是国产杀毒软件，比如360安全卫生、360杀毒软件、腾讯管家、金山卫士等。这些东西很容易干扰翻墙上网，如果你的电脑安装了这样的东西，建议至少翻墙时别用。其次，检查下SSR信息是否填写正确。浏览器的代理方式是否是ssr代理，即127.0.0.1 1080端口。如果以上条件都排除，还是用不了，那么可以更换端口、加密方式、协议、混淆，或者更换服务器位置</span></p>
<p>
	<span style="font-size:14px;">　　3、vultr服务商提供的 VPS 服务器是单向流量计算，有的vps服务商是双向流量计算，单向流量计算对于用户来说更实惠。因为我们是在 VPS 服务器上部署SSR服务端后，再用SSR客户端翻墙，所以SSR服务端就相当于中转，比如我们看一个视频，必然会产生流量，假如消耗流量80M，那么VPS服务器会产生上传80M和下载80M流量，vultr服务商只计算单向的80M流量。如果是双向计算流量，那么会计算为160M流量</span></p>
<p>
	<span style="font-size:14px;">　　4、如果你想把搭建的账号给多人使用，不用额外设置端口，因为一个账号就可以多人使用</span><br />
	<br />
	&nbsp;</p>
 </div>
