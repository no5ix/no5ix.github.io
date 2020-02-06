---
title: Win10家庭版开启组策略
date: 2020-02-06 18:55:33
tags:
- Windows
categories:
- Misc
---




请将以下4行命令复制并粘贴到记事本中，另存为bat文件，之后右击以管理员身份运行即可

**. . .**<!-- more -->

```
pushd "%~dp0"
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~3*.mum >List.txt
dir /b C:\Windows\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~3*.mum >>List.txt
for /f %%i in ('findstr /i . List.txt 2^>nul') do dism /online /norestart /add-package:"C:\Windows\servicing\Packages\%%i"
```