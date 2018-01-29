---
title: 从零开始搭建一台简易Ubuntu服务器三
date: 2013-08-27 15:11:26
tags:
- VBox
categories:
- Miscellaneous
---



# 安装MySQL

执行命令安装MySQL：sudo apt-get install mysql-server
安装的时候会提示填入一个root的初始密码，先输入个8做初始密码吧




# 导入客户数据库base_account

mysql -uroot -p < *****.sql(某个sql文件)




# 安装svn并checkout一个svn服务器上的目录

1. 进入 /data/www目录下 ：cd /data/www
1. 执行命令安装：sudo apt-get install subversion
2. checkout一个目录（比如svn://112.124.26.188/myapp/td/01CServer_PHP/errorMsg），
执行命令：svn checkout svn://112.124.26.188/myapp/td/01CServer_PHP/errorMsg （或者 svn co svn://112.124.26.188/myapp/td/01CServer_PHP/errorMsg）

<!-- more -->


# 测试是否可以访问并将相应数据传入数据库中

访问 localhost/errorMsg/ErrorMsg.php?data=3_2&error_msg=zhangnimashuai
然后查看数据库相应表里是否增加了数据




# 证书登陆 (可选)

#对dev 将id_rsa私钥和id_rsa.pub公钥以及authorized_keys授权文件拷贝至~dev/.ssh/目录
chmod 600 id_rsa; chmod 644 id_rsa.pub; chmod 644 authorized_keys




# SSH 证书登陆配置

sudo vi /etc/ssh/sshd_config
取消注释    : #AuthorizedKeysFile     .ssh/authorized_keys
修改yes->no : PasswordAuthentication no
sudo service ssh restart




# 重启服务 测试登陆

sudo service nginx restart
sudo service php5-fpm restart


# 测试成功后去除dev用户的sudo权限 （可选）

sudo visudo 删除：dev ALL=(ALL:ALL) ALL
