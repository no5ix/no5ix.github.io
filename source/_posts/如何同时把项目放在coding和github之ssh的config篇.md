---
title: 如何同时把项目放在coding和github之ssh的config篇
date: 2017-10-20 11:01:41
tags:
- coding
- ssh
- github
categories:
- 杂
---

# 无法使用 22 端口的 SSH 服务怎么办？

遇到了以下这两种错误怎么办?

- connect to host git.coding.net port 22: Connection timed out
- connect to host github.com port 22: Connection timed out

SSH 的默认端口是 22，有时您或您的公司的防火墙会完全屏蔽掉这个端口。如果此时您不方便通过 HTTPS 方式进行 Git 操作，您可以使用 Coding.net和GitHub 提供的 443 端口的 SSH 服务.

# ssh的config配置

在home目录下的.ssh文件夹里新建一个config文件, 添加如下代码即可

```
Host github.com
User "xxxxx@email.com"
Hostname ssh.github.com
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa
Port 443

Host git.coding.net
User "xxxxx@email.com"
Hostname git-ssh.coding.net
PreferredAuthentications publickey
IdentityFile ~/.ssh/id_rsa
Port 443
```

# 测试命令

您需要确保 SSH 已配置成功，然后执行以下命令测试：

- ssh -T git@git.coding.net
- ssh -T git@github.com

 
