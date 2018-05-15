---
title: 从零开始搭建一台简易Ubuntu服务器二
date: 2013-08-25 15:11:26
tags:
- VBox
categories:
- Linux
---





# 安装nginx

如若有有不明白，还可以前往[参考](wiki.ubuntu.org.cn/Nginx)

执行命令安装nginx：sudo apt-get install nginx
测试是否安装成功：在本机的浏览器里访问 localhost ;如果现实”Welcome to nginx!”，表明你的 Nginx 服务器安装成功！
启动 Nginx：sudo /etc/init.d/nginx start
关闭 Nginx：sudo /etc/init.d/nginx stop
重启 nginx：sudo /etc/init.d/nginx restart 或者 sudo service nginx restart
sudo service apache2 stop  (如果之前装了apache2则需要sudo apt-get remove apache2 卸载掉apache2然后执行这个stop命令)

**. . .**<!-- more -->


# 修改nginx的server配置文件

1. 执行命令：sudo vi /etc/nginx/sites-available/default
2. 然后将default文件里的内容全部删除，把下面的内容粘贴进去：

```
server {
    listen 80 default_server;


    root /data/www; #这里表示nginx根目录
    index index.php index.html index.htm;


    server_name localhost;
    chunked_transfer_encoding  off;


    location / {
        try_files $uri $uri/ =404;
    }


    error_page 404 /index.html;


    location ~ \.php$ {   #加上这个代码块就可以用php访问了，这个代码块还有fastcgi的相关内容
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```



# 安装以及启动fastcgi

1. 执行命令安装：sudo apt-get install spawn-fcgi
2. 启动fastcgi ：spawn-fcgi -a 127.0.0.1 -p 9000 -C 10 -u www-data -f /usr/bin/php-cgi
3. 为了让php-cgi开机自启动： Ubuntu开机之后会执行/etc/rc.local文件中的脚本 所以我们可以直接在/etc/rc.local中添加启动脚本。
将 spawn-fcgi -a 127.0.0.1 -p 9000 -C 10 -u www-data -f /usr/bin/php-cgi 添加到语句：exit 0 前面才行




# 安装PHP

执行命令安装PHP：sudo apt-get install php5-cli php5-cgi php5-fpm php5-mcrypt php5-mysql




# php设置

sudo vi /etc/php5/fpm/php.ini  #设置cgi.fix_pathinfo=0
sudo service php5-fpm restart


sudo vi /etc/php5/fpm/pool.d/www.conf
listen.owner = www-data
listen.group = www-data
listen.mode = 0660 （去掉原www.conf里“listen.mode = 0660”前的分号，那个分号是注释的意思）
sudo service php5-fpm restart




# 测试是否可以访问

1. 在nginx根目录也就是 上面server配置文件里的 /data/www(若没有这个目录就建一个，并改变权限，执行sudo chown dev:dev data/)
文件夹里新建index.html（不建此文件将不能在本机访问localhost）
将下面的内容粘贴到index.html文件里
```
<html>
<head>
<title>Welcome to nginx!</title>
</head>
<body bgcolor="white" text="black">
<center><h1>Welcome to nginx!</h1></center>
</body>
</html>
```

2. 第1步完成后将可以在浏览器访问 http://localhost
3. 再在 /data/www文件夹里新建test.php
将下面的内容粘贴到test.php文件里
`<?php phpinfo(); ?>`
4. 第3步完成后将可以在浏览器访问 http://localhost/test.php


**注**：如果没有启动fastcgi，访问之后将会下载此php文件。若启动了fastcgi，则访问phpinfo的网页;如果出现No input file specified就在
上面的server配置文件里的下述地方加入这条语句：fastcgi_param SCRIPT_FILENAME    $document_root$fastcgi_script_name;
如下：
```
location ~ \.php$ {
    try_files $uri =404;
    fastcgi_split_path_info ^(.+\.php)(/.+)$;
    fastcgi_pass 127.0.0.1:9000;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME    $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```




