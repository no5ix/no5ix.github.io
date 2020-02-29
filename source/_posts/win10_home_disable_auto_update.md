---
title: Win10禁止自动更新踩坑
date: 2020-01-09 22:09:39
tags:
- Windows
categories:
- Misc
---


# 写个定时命令(推荐此方法且已集成到nox)

已经集成到[nox](https://github.com/no5ix/nox)中

You can also create a stop and start script for Windows Update.

Create a Notepad file with each of the following and save them with the .bat extension.


``` bat stop-upadtes.bat
sc config wuauserv start= disabled
net stop wuauserv

sc config bits start= disabled
net stop bits

sc config dosvc start= disabled
net stop dosvc

pause
```

``` bat start-updates.bat 
sc config wuauserv start= auto
net start wuauserv

sc config bits start= auto
net start bits

sc config dosvc start= auto
net start dosvc

pause
```
Just right click on stop-upadtes.bat and select “Run as Administrator”

Source: http://sdbr.net/windows-10-update-failure/

My sincere thanks to MVP, Greg Carmack for the help with finding this.


**. . .**<!-- more -->


# 直接暴力删除(亲测有效但不建议)

**不建议原因: 貌似会引起蓝屏以及删除了这个服务之后就不可能从Microsoft Store安装uwp了**

Click your Start Button, type services and hit Enter

Scroll down to find Windows Update Service

If it is Started, double click it and stop that service

CLose the services App

Click your Start Button, type cmd, right click Command Prompt and choose 'Run as Administrator'

Run this command and hit Enter

`sc delete wuauserv`

Close Command Prompt

Restart your PC


If you also have the Update Assistant installed on your system:

The Update Assistant in Windows 10 cannot be uninstalled, but you can get rid of it

Click your Start Button, type Task Scheduler and hit enter
In the left Pane, navigate to: Windows - Update Orchestrater
Right Pane double click 'Update Assistant'
Click on Triggers Tab
On each of the triggers ( At login . . . etc.) double click and uncheck 'Enabled'

Under 'Update Assistant, there is another event 'Update Assistant CalendarRun'
Do the same for all triggers on that event

Restart your system, that's It!

When finished and after a system restart, open the services app and make sure the Windows Update Service is now gone .


# Other options to consider(亲测过都不够彻底)

Please note, Microsoft's approach to updates is very different that earlier releases. They are basically mandatory because of Microsoft's past history with customers sometimes failing to install important updates.

See options for managing how and when Windows Updates are installed.

Option 1:

Set your Internet connection as metered:
https://www.groovypost.com/howto/manage-windows...

Option 2:

Use Active Hours and Restart options:
https://www.groovypost.com/howto/managing-windo...

Option 3:

Use Show/Hide Updates tool to block the update:

Is there an option or work around to block updates or hardware drivers that might cause problems?
Yes, Microsoft has released a KB update (KB3073930) that will let users block or hide Windows or driver updates.

You can download it at the following link:
https://support.microsoft.com/en-us/kb/3073930


最近被win10的更新给坑了, 好好一个电脑硬是瘫痪了, 不得已重置了, 所有东西重装一遍, 吃一堑长一智这回得禁止他更新了...

我的电脑右键-管理-服务和应用程序-服务-windows Update：

windows Update上右键-属性：启动类型改为禁用，然后点击选项卡里的恢复，将第一次失败、第二次失败等改为无操作，修改好后点击：应用-确定。

这样我原本以为万事大吉了，然而第二天打开电脑，又提示windows请求重启电脑以完成更新，我打开上面修改的内容一看，昨天修改好的禁用今天又变成手动触发了~而且状态是正在运行!流氓啊，最后在win10吧找到了这个帖子win10家庭版，禁用windows update后还是会自动启动服务(因为有一些任务计划在重新开启update服务) ,下面是解决办法：

1.打开你的小娜；

2.搜索任务计划程序；

3.找到windows Update，在任务计划程序库-Microsoft-Windows下；

4.全部禁用：

如果禁用不了就切换到超级管理员然后来禁用(禁用不了就直接删除)

**开启超级管理员账户方法**为: 
1、通过Cortana搜索cmd，匹配出“命令提示符”，右键以管理员身份运行；
2、在打开的命令提示符窗口输入`net user administrator /active:yes` ，按回车执行命令，提示命令成功完成，进行下一步；
3、右键开始按钮—关机或注销—注销，注销系统；
4、在这个界面，选择Administrator帐户登录，初次登录这个帐号，会执行系统配置，需要等待一段时间。
5. 若要关闭则`net user administrator /active:no`


ps：还有一种通过禁用组策略来禁用更新的方法：通过组策略禁用Windows 10系统的自动更新功能

因为 不适用于家庭版 ，所以我没操作，你也可以在网上找win10家庭版启用组策略的方法来启用组策略(我没成功)，再做尝试。

组策略禁用自动更新步骤如下：

1、鼠标右键点击开始菜单或者是快捷键Win+R打开运行，然后在运行的对话框中填写gpedit.msc并确定；

2、打开组策略后点击左侧菜单依次展开计算机配置—–>管理模板—–>Windows组件—–>Windows更新；

3、双击配置自动更新即可打开如下图的新窗口，在新窗口左侧的选项里将默认的未配置更改为已禁用即可；