---
title: Windows共享教程
date: 2020-05-06 00:08:55
tags:
- Windows
categories:
- Misc
---


曾在使用Win0系统进行数据交换过程中发现，网上邻居上怎么找都找不着其他电脑，为何呢？也是用了很多办法，一次次失败后最后终于解决了，原来在很多优化/安全软件“整理”过的电脑中，有他们认为危险但实际非常重要的设置被强行关闭了。接下来我们看看怎么处理。

先参考下面几张图设置一波

**. . .**<!-- more -->


![](/img/win_share_not_found_issue/win_share_not_found_issue_1.png)
![](/img/win_share_not_found_issue/win_share_not_found_issue_2.png)
![](/img/win_share_not_found_issue/win_share_not_found_issue_3.png)


然后, 

- 右键点击“此电脑”，选择“属性”，并依次进入：高级电脑设置 - 计算机名，确保局域网内所有计算机的工作组名称一致。如不同，需要点击“网络ID”来进行修改。

- 右键点击“此电脑”，选择“管理”，并依次进入：服务和应用程序 - 服务，确保 TCP/IP NetBIOS Helper 以及 Computer Browser 服务处于正在运行状态。如显示为已停止，点击启动即可。若发现服务项中竟然没有 Computer Browser ，此时需要向系统中添加 SMB 功能。

- 进入：控制面板 - 程序 - 启用或关闭系统功能，选中 SMB 1.0/CIFS 文件共享支持，并点击确定。不出意外的话会提示需要重启生效，在重启后局域网共享即可恢复正常。

- 这样设置后，其他电脑应该就能看到这台共享电脑了。要是还不行的话，就需要进一步打开共享服务了。按Win+R后输入services.msc。在右侧找到“Function Discovery Resource Publication”并双击，点击“启动”