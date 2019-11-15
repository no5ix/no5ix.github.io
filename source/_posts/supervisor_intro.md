---
title: supervisor 备忘
date: 2019-09-09 19:07:26
tags:
- Supervisor
categories:
- Misc
---


# Introduction

- 基于python编写，安装方便
- 进程管理工具，可以很方便的对用户定义的进程进行启动，关闭，重启，并且对意外关闭的进程进行重启 ，只需要简单的配置一下即可，且有web端，状态、日志查看清晰明了。
- 组成部分 supervisord[服务端，所以要通过这个来启动它]
            supervisorctl[客户端，可以来执行stop等命令]
- 官方文档地址：http://supervisord.org/
    

**. . .**<!-- more -->


# 安装

python 第三方包的安装方法，此处不详细描述

```
pip install supervisor


```

# 使用说明

使用 supervisor 很简单，只需要修改一些配置文件，就可以使用了。

## 查看默认配置

运行

```
    echo_supervisord_conf


```

即可看到默认配置情况，但是一般情况下，我们都不要去修改默认的配置，而是将默认配置重定向到另外的文件中，不同的进程运用不同的配置文件去对默认文件进行复写即可。

```
    echo_supervisord_conf > /etc/supervisord.conf


```

## 默认配置说明

> 默认的配置文件是下面这样的，但是这里有个坑需要注意，supervisord.pid 以及 supervisor.sock 是放在 /tmp 目录下，但是 /tmp 目录是存放临时文件，里面的文件是会被 Linux 系统删除的，一旦这些文件丢失，就无法再通过 supervisorctl 来执行 restart 和 stop 命令了，将只会得到 unix:///tmp/supervisor.sock 不存在的错误 。

```
[unix_http_server]
;file=/tmp/supervisor.sock   ; (the path to the socket file)
;建议修改为 /var/run 目录，避免被系统删除
file=/var/run/supervisor.sock   ; (the path to the socket file)
;chmod=0700                 ; socket file mode (default 0700)
;chown=nobody:nogroup       ; socket file uid:gid owner
;username=user              ; (default is no username (open server))
;password=123               ; (default is no password (open server))

;[inet_http_server]         ; inet (TCP) server disabled by default
;port=127.0.0.1:9001        ; (ip_address:port specifier, *:port for ;all iface)
;username=user              ; (default is no username (open server))
;password=123               ; (default is no password (open server))
...

[supervisord]
;logfile=/tmp/supervisord.log ; 日志文件(main log file;default $CWD/supervisord.log)
;建议修改为 /var/log 目录，避免被系统删除
logfile=/var/log/supervisor/supervisord.log ; (main log file;default $CWD/supervisord.log)
logfile_maxbytes=50MB        ; 日志文件大小(max main logfile bytes b4 rotation;default 50MB)
logfile_backups=10           ; 日志文件保留备份数量(num of main logfile rotation backups;default 10)
loglevel=info                ; 日志级别(log level;default info; others: debug,warn,trace)
;pidfile=/tmp/supervisord.pid ; (supervisord pidfile;default supervisord.pid)
;建议修改为 /var/run 目录，避免被系统删除
pidfile=/var/run/supervisord.pid ; (supervisord pidfile;default supervisord.pid)
;设置启动supervisord的用户，一般情况下不要轻易用root用户来启动，除非你真的确定要这么做
;user=chrism                 ; (default is current user, required if root)
nodaemon=false               ; (start in foreground if true;default false)
minfds=1024                  ; (min. avail startup file descriptors;default 1024)
minprocs=200                 ; (min. avail process descriptors;default 200)
;umask=022                   ; (process file creation umask;default 022)
;identifier=supervisor       ; (supervisord identifier, default is 'supervisor')
;directory=/tmp              ; (default is not to cd during start)
;nocleanup=true              ; (don't clean up tempfiles at start;default false)
;childlogdir=/tmp            ; ('AUTO' child log dir, default $TEMP)
;environment=KEY="value"     ; (key value pairs to add to environment)
;strip_ansi=false            ; (strip ansi escape codes in logs; def. false)

[unix_http_server]
file=/tmp/supervisor.sock   ; (the path to the socket file)
;chmod=0700                 ; socket file mode (default 0700)
;chown=nobody:nogroup       ; socket file uid:gid owner
;username=user              ; (default is no username (open server))
;password=123               ; (default is no password (open server))

[supervisorctl]
; 必须和'unix_http_server'里面的设定匹配
;serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket
;建议修改为 /var/run 目录，避免被系统删除
serverurl=unix:///var/run/supervisor.sock ; use a unix:// URL  for a unix socket
;serverurl=http://127.0.0.1:9001 ; use an http:// url to specify an inet socket
;username=chris              ; should be same as http_username if set
;password=123                ; should be same as http_password if set

;[program:theprogramname]
;command=/bin/cat              ; the program (relative uses PATH, can take args)
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
;numprocs=1                    ; number of processes copies to start (def 1)
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
;umask=022                     ; umask for process (default None)
;priority=999                  ; the relative start priority (default 999)
;autostart=true                ; start at supervisord start (default: true)
;startsecs=1                   ; # of secs prog must stay up to be running (def. 1)
;startretries=3                ; max # of serial start failures when starting (default 3)
;autorestart=unexpected        ; when to restart if exited after running (def: unexpected)
;exitcodes=0,2                 ; 'expected' exit codes used with autorestart (default 0,2)
;stopsignal=QUIT               ; signal used to kill process (default TERM)
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
;redirect_stderr=true          ; redirect proc stderr to stdout (default false)
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (default 10)
;stdout_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (default 10)
;stderr_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;environment=A="1",B="2"       ; process environment additions (def no adds)
;serverurl=AUTO                ; override serverurl computation (childutils)

;[group:thegroupname]
;programs=progname1,progname2  ; each refers to 'x' in [program:x] definitions
;priority=999                  ; the relative start priority (default 999)

[include]
files = /etc/supervisor/*.conf



```

配置文件都有说明，且很简单，就不做多的描述了，在上面有一些建议修改的目录，若做了修改，则应先创建这些文件，需要注意权限问题，很多错误都是没有权限造成的。

## 启动服务端

现在，让我们来启动 supervisor 服务。

> supervisord -c /etc/supervisord.conf

查看 supervisord 是否运行：

> ps aux|grep superviosrd

```
output:xxxx   82039      1  0 11:22 ?        00:00:00 /usr/local/bin/python /usr/local/bin/supervisord -c /etc/supervisord.conf


```

## 项目配置及运行

上面我们已经把 supervisrod 运行起来了，现在可以添加我们要管理的进程的配置文件。可以把所有配置项都写到 supervisord.conf 文件里，但并不推荐这样做，而是通过 include 的方式把不同的程序（组）写到不同的配置文件里，对，就是默认配置中的最后的那个 include。下面来对项目进行简单的配置。  
假设我们把项目配置文件放在这个目录中:/etc/supervisor/  
则我们需要修改 / etc/supervisord.conf 中的 include 为：  
[include]  
files = /etc/supervisor/*.conf

以下为本人的配置文件目录：

> /etc/supervisor/update_ip.conf

```
[program:update_ip] ;项目名称
directory = /home/xxxx/works/ip_update/ip_update_on_server_no_1/ ; 程序的启动目录
command = python /home/xxxx/works/ip_update/ip_update_on_server_no_1/update_ip_internal.py  ; 启动命令，可以看出与手动在命令行启动的命令是一样
autostart = true     ; 在 supervisord 启动的时候也自动启动
startsecs = 5        ; 启动 5 秒后没有异常退出，就当作已经正常启动了
autorestart = true   ; 程序异常退出后自动重启
startretries = 3     ; 启动失败自动重试次数，默认是 3
user = shimeng          ; 用哪个用户启动
redirect_stderr = true  ; 把 stderr 重定向到 stdout，默认 false
stdout_logfile_maxbytes = 50MB  ; stdout 日志文件大小，默认 50MB
stdout_logfile_backups = 20     ; stdout 日志文件备份数
; stdout 日志文件，需要注意当指定目录不存在时无法正常启动，所以需要手动创建目录（supervisord 会自动创建日志文件）
stdout_logfile = /home/xxxx/works/ip_update/ip_update_on_server_no_1/supervisor.log
loglevel=info

[supervisorctl]
serverurl=unix:/

[unix_http_server]
file=/tmp/supervisor.sock   ; (the path to the socket file)
chmod=0777                 ; socket file mode (default 0700)
;chown=nobody:nogroup       ; socket file uid:gid owner
;username=shimeng              ; (default is no username (open server))
;password=123               ; (default is no password (open server))

[inet_http_server]         ; inet (TCP) server disabled by default
port=127.0.0.1:9001        ; (ip_address:port specifier, *:port for all iface)
username=shimeng              ; (default is no username (open server))
password=123


```

```
配置详解：
a)  在supervisord.conf文件中，分号“；”后面的内容表示注释
b)  [group:组名]，设置一个服务分组，programs后面跟组内所有服务的名字，以分号分格。
c)  [program：服务名]，下面是这个服务的具体设置：
Command:启用Tornado服务文件的命令，也就是我们手动启动的命令。
Directory:服务文件所在的目录
User:启用服务的用户
Autorestart:是否自动重启服务
stdout_logfile：服务的产生的日起文件
loglevel:日志级别


```

配置完成以后，即可运行：

> supervisord -c /etc/supervisord.conf

查看运行状态

> $ supervisorctl status

```
out:
update_ip         RUNNING   pid 62040, uptime 0:10:09


```

打开浏览器，输入 127.0.0.9001, 输入用户名与密码（如果配置文件中 inet_http_server 中作了设置），可以看到下面这个界面：

![](https://i.screenshot.net/y60zgio)

image

## 使用 supervisorctl

在启动服务之后，运行：

> supervisorctl -c /etc/supervisord.conf

```
out:
update_ip         RUNNING   pid 62040, uptime 0:10:09


```

若成功，则会进入 supervisorctl 的 shell 界面，有以下方法：

```
status    # 查看程序状态
stop update_ip   # 关闭 update_ip 程序
start update_ip  # 启动 update_ip 程序
restart update_ip    # 重启 update_ip 程序
reread    ＃ 读取有更新（增加）的配置文件，不会启动新添加的程序
update    ＃ 重启配置文件修改过的程序


```

执行相关操作后，可以在 web 端看到具体的变化情况，如 stop 程序

> stop update_ip

其实，也可以不使用 supervisorctl shell 界面，而在 bash 终端运行：

```
$ supervisorctl status
$ supervisorctl stop usercenter
$ supervisorctl start usercenter
$ supervisorctl restart usercenter
$ supervisorctl reread
$ supervisorctl update 


```

## 多个进程管理

按照官方文档的定义，一个 [program:x] 实际上是表示一组相同特征或同类的进程组，也就是说一个 [program:x] 可以启动多个进程。这组进程的成员是通过 numprocs 和 process_name 这两个参数来确定的，这句话什么意思呢，我们来看这个例子。

```
; 设置进程的名称，使用 supervisorctl 来管理进程时需要使用该进程名
[program:foo] 

; 可以在 command 这里用 python 表达式传递不同的参数给每个进程
command=python server.py --port=90%(process_num)02d

directory=/home/python/tornado_server ; 执行 command 之前，先切换到工作目录

; 若 numprocs 不为1，process_name 的表达式中一定要包含 process_num 来区分不同的进程
numprocs=2                   
process_name=%(program_name)s_%(process_num)02d; 

user=oxygen                 ; 使用 oxygen 用户来启动该进程

autorestart=true  ; 程序崩溃时自动重启

redirect_stderr=true      ; 重定向输出的日志

stdout_logfile = /var/log/supervisord/
tornado_server.log
loglevel=info


```

上面这个例子会启动两个进程，process_name 分别为 foo:foo_01 和 foo:foo_02。通过这样一种方式，就可以用一个 [program:x] 配置项，来启动一组非常类似的进程。  
更详细配置，点击[这里](https://link.jianshu.com/?t=http://supervisord.org/configuration.html#program-x-section-settings)

Supervisor 同时还提供了另外一种进程组的管理方式，通过这种方式，可以使用 supervisorctl 命令来管理一组进程。跟 [program:x] 的进程组不同的是，这里的进程是一个个的 [program:x] 。

```
[group:thegroupname]
programs=progname1,progname2  ; each refers to 'x' in [program:x] definitions
priority=999                  ; the relative start priority (default 999)


```

当添加了上述配置后，progname1 和 progname2 的进程名就会变成 thegroupname:progname1 和 thegroupname:progname2 以后就要用这个名字来管理进程了，而不是之前的 progname1。

以后执行 supervisorctl stop thegroupname: 就能同时结束 progname1 和 progname2，执行 supervisorctl stop thegroupname:progname1 就能结束 progname1。

# 结尾
-----

实际上，默认情况下，supervisored 也是一个进程，最理想的的情况应该是将其安装为系统服务，安装方法可以参考[这里](https://link.jianshu.com/?t=http://serverfault.com/questions/96499/how-to-automatically-start-supervisord-on-linux-ubuntu), 安装脚本参考[这里](https://link.jianshu.com/?t=https://github.com/Supervisor/initscripts), 由于没有做具体的实验，此处不展开说明。

其实还有一个简单的方法，因为 Linux 在启动的时候会执行 /etc/rc.local 里面的脚本，所以只要在这里添加执行命令就可以

```
# 如果是 Ubuntu 添加以下内容
/usr/local/bin/supervisord -c /etc/supervisord.conf

# 如果是 Centos 添加以下内容
/usr/bin/supervisord -c /etc/supervisord.conf



```

以上内容需要添加在 exit 命令前，而且由于在执行 rc.local 脚本时，PATH 环境变量未全部初始化，因此命令需要使用绝对路径。

在添加前，先在终端测试一下命令是否能正常执行，如果找不到 supervisord，可以用如下命令找到

```
sudo find / -name supervisord

output:
/usr/local/bin/supervisord



```