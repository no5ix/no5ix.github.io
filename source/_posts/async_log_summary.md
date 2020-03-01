---
title: 异步日志小结
date: 2019-11-15 16:31:26
categories:
- NP
---


最近工作涉及到生产环境的日志系统, 小结一波, 其实践为: 

1. cpp高性能的异步日志系统模块导出给py使用
2. 此cpp模块另起线程
3. logger通过unix socket连接上address 为 “/dev/log”，与 rsyslogd 程序通信
4. log先缓存在一个buffer中, 通过一个任务来把log存入syslog这一事件封装起来
5. 把这个任务加入一个线程间可保序输出的任务队列(常用asio的strand来实现), 即可返回了
6. 之后会异步顺序输出到syslog,  然后/ etc/init.d/rsyslog 这个后台程序根据 / etc/rsyslog.conf 这个配置文件 将日志输出到不同的文件，包括网络文件，即其他服务器(分发到数据部门, 然后他们就可从中筛选提取数据, 并制作网站供各方查询日志了)


**. . .**<!-- more --> 


关于syslog可参考以下记录, 以下文字转自 https://www.cnblogs.com/xybaby/p/6596431.html


**正文**

　　本文记录了因为一个简单的日志需求，继而对 linux 环境下 syslog、rsyslog、unix domain socket 的学习。本文关注使用层面，并不涉及 rsyslog 的实现原理，感兴趣的读者可以参考 [rsyslog 官网](http://www.rsyslog.com/%20)。另外，本文实验的环境实在 debian8，如果是其他 linux 发行版本或者 debian 的其他版本，可能会稍微有些差异。

需求：
===



　　工作中有一个在 Linux（debian8）环境下运行的服务器程序，用 python 语言实现，代码中有不同优先级的日志需要记录，开发的时候都是使用 python 的 logging 模块输出到文件，示例代码如下：



``` python
import logging, os

logger = None
def get_logger():
    global logger
    if not logger:
        logger = logging.getLogger('ServerLog')
        logger.setLevel(logging.INFO)
        filehandler = logging.FileHandler(os.environ['HOME'] + '/Server.log', encoding='utf8')
        filehandler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
        logger.addHandler(filehandler)
    return logger

def some_func():
    get_logger().info("call some_func")

if __name__ == '__main__':
    some_func()
```



　　运行上面这段代码，就会在 home 目录下面产生一个 server.log 文件。

　　后来数据分析的部门说他们希望能够实时拿到一部分日志，他们有一台专门处理日志的服务器，那么怎么把日志发给他们呢？笔者之前并没有相关经验，数据分析部门的同事说，这种需求他们都是找运维人员帮忙。运维同事给出的方案很简单：产品把日志写到 syslog，然后他们负责把带有某些关键字的日志转发给数据分析部门，在运维同事的指导下，把代码改成了这样:



``` python
import logging
import logging.handlers

logger = None
def get_logger():
    global logger
    if not logger:
        logger = logging.getLogger('ServerLog')
        logger.setLevel(logging.INFO)

        sys_handler = logging.handlers.SysLogHandler('/dev/log', facility=logging.handlers.SysLogHandler.LOG_LOCAL0)
        syslog_tag = 'ServerLog'
        sys_handler.setFormatter(logging.Formatter(syslog_tag + ":%(asctime)s - %(name)s - %(levelname)s - %(message)s"))

        logger.addHandler(sys_handler)
    return logger

def some_func():
    get_logger().info("call some_func")

if __name__ == '__main__':
    some_func()

```



　　上面的代码修改了日志的输出形式，直观的感受就是从文件 server.log 到了 /dev/log，但 / dev/log 对应的是 SysLogHandler，并不是 FileHandler，所以肯定不是一个普通的文件。此时，我有两个疑问：第一，这里我并没有将日志输出到 home 目录下的 Server.log 文件，但是程序运行的时候生成了这么一个文件；第二，怎么讲日志发送到数据分析部门的服务器。

　　不懂就问：

　　Q：新的代码下怎么生成 Server.log 文件，日志内容又是怎么转发到数据分析部门的服务器？

　　A:  这个是 / etc/init.d/rsyslog 这个后台程序根据 / etc/rsyslog.conf 这个配置文件 将日志输出到不同的文件，包括网络文件，即其他服务器。看 / etc/rsyslog.conf 这个配置就明白了。

　　Q：OK，那 python 代码将文件输出到 / dev/log 跟 rsyslog 又是什么关系呢？

　　A：python 的 sysloghandler 会将日志发送到 rsyslog，他们之间使用 unix domain socket 通信，具体看 logging 模块的源码就知道了

unix domain socket：
===================



　　按照上面的对话的意思，python 程序先将日志发送给 rsyslog 这个程序，然后 rsyslog 再处理收到的日志数据，所以先看 logging 代码：

　　SysLogHandler 这个类在 logging.handlers.py, 核心代码如下：



``` python
def __init__(self, address=('localhost', SYSLOG_UDP_PORT),
             facility=LOG_USER, socktype=socket.SOCK_DGRAM):
    """
    Initialize a handler.

    If address is specified as a string, a UNIX socket is used. To log to a
    local syslogd, "SysLogHandler(address="/dev/log")" can be used.
    If facility is not specified, LOG_USER is used.
    """
    logging.Handler.__init__(self)

    self.address = address
    self.facility = facility
    self.socktype = socktype

    if isinstance(address, basestring):
        self.unixsocket = 1
        self._connect_unixsocket(address)
    else:
        self.unixsocket = 0
        self.socket = socket.socket(socket.AF_INET, socktype)
        if socktype == socket.SOCK_STREAM:
            self.socket.connect(address)
    self.formatter = None

def _connect_unixsocket(self, address):
    self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    # syslog may require either DGRAM or STREAM sockets
    try:
        self.socket.connect(address)
    except socket.error:
        self.socket.close()
        self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.socket.connect(address)
```



　　在__init__.doc 里面写得很清楚，如果 address 是一个字符串（默认值是一个 tuple），那么会建立一个 unix socket（[unix domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket)）。如果 address 为 “/dev/log”（正如我们之前的 python 代码），那么输出到本机的 syslogd 程序。另外，在第 27 行 self.socket = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM) socket.socket 的第一个参数 family 的值为 **AF_UNIX**，而不是我们经常使用的 AF_INET(IPV4）或者 AF_INET6(IPV6)。那么什么是 unix domain socket 呢？

　　unix domain socket 是进程间通信（IPC：[inter-process communication](https://en.wikipedia.org/wiki/Inter-process_communication)）的一种方式，其他还有管道、命名管道、消息队列、共享内存、socket 之类的。unix domain socket 与平常使用的 socket（狭义的 internet socket）有什么区别呢，那就是 unix domain socket 只能在同一台主机上的进程之间通信，普通的 socket 也可以通过'localhost'来在同一台主机通信，那么 unix domain socket 有哪些优势呢？

　　第一：不需要经过网络协议栈

　　第二：不需要打包拆包、计算校验和、维护序号和应答等

　　所以，优势就是性能好，一个字，快。

　　下面用一个简单的服务器客户端例子来看看 unix domain socket 的使用方法与过程：

　　服务器：uds_server.py



``` python
ADDR = '/tmp/uds_tmp'

import socket, os

def main():
try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        if os.path.exists(ADDR):
                os.unlink(ADDR)
        sock.bind(ADDR)
        sock.listen(5)
        while True:
                connection, address = sock.accept()
                print "Data : %s" % connection.recv(1024);
                connection.send("hello uds client")
                connection.close()
finally:
        sock.close()

if __name__ == '__main__':
        main()
```



　　客户端：uds_client.py



``` python
ADDR = '/tmp/uds_tmp'

import socket

def main():
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.connect(ADDR)
        sock.send('hello unix domain socket server')
        print 'client recieve', sock.recv(1024)
        sock.close()

if __name__ == '__main__':
        main()
```



　　首先：运行服务器 python uds_server.py，这个时候在 / tmp 目录下产生了文件，用 ls 查看详细信息如下：

　　![](/img/syslog_intro/1089769-20170323140416611-1663002555.png)

　　可以看到，文件类型（第一个字段）为 s，代表 socket 文件。（PS： 如果进程间用命令管道通信，也是利用中间文件，ls 显示的文件类型为 p）

　　运行客户端 python uds_client.py，在客户端和服务器端都有相应的输出，使用方法与普通 socket 没有什么大的差异。

日志转发流程：
=======



　　在了解了 unix domain socket 这个概念之后，下面就比较简单了，首先是 / dev/log 这个文件，我们用 ls 来查看这个文件的信息

　　![](/img/syslog_intro/1089769-20170321200554424-555977189.png)

　　可以看到这个文件是一个符号链接文件，真实的文件是 / run/systemd/journal/dev-log, 那么再来查看这个文件

　　![](/img/syslog_intro/1089769-20170321200742736-1156458900.png)

　　ok，是一个 socket 文件，复合预期，按照之前的 unix domain socket 的例子，rsyslog 也应该咋这个文件上监听，我们来看看

　　![](/img/syslog_intro/1089769-20170324101520533-1212316745.png)

　　lsof fd 可以列出所有使用了这个文件（linux 下文件的概念比较宽泛）的进程，事实上我们看到只有 systemd 和 systemd-j 两个不明所以的进程。那么直接看看 rsyslog 使用的 unix domain socket 吧

　　![](/img/syslog_intro/1089769-20170322091124143-462804263.png)

      ![](/img/syslog_intro/1089769-20170324101545783-1464834217.png)

　　额，可以看到 rsyslogd 使用的 socket domain socket 是 / run/systemd/journal/syslog，并不是 / run/systemd/journal/dev-log，这两个文件在同一个目录下，那么再来看看还有哪些进程使用了 / run/systemd/journal/syslog。

 　　![](/img/syslog_intro/1089769-20170322194059533-186007552.png)

　　so，systemd 和 rsyslogd 都使用了这个文件，感觉像是应用进程 (e.g. 上面的 python 程序）将日志通过 / run/systemd/journal/dev-log（/dev/log 背后真正的文件）发送到 systemd， 然后 systemd 再将日志通过 / run/systemd/journal/syslog 发送到 rsyslogd，是不是这样呢，google 了一下，发现了这篇文章 [understand-logging-in-linux](http://unix.stackexchange.com/questions/205883/understand-logging-in-linux)，确实是这么一个过程：

> systemd has a single monolithic log management program, `systemd-journald`. This runs as a service managed by systemd.
> 
> *   It reads `/dev/kmsg` for kernel log data.
> *   It reads `/dev/log` (a symbolic link to `/run/systemd/journal/dev-log`) for application log data from the GNU C library's `syslog()` function.
> *   It listens on the `AF_LOCAL` stream socket at `/run/systemd/journal/stdout` for log data coming from systemd-managed services.
> *   It listens on the `AF_LOCAL` datagram socket at `/run/systemd/journal/socket` for log data coming from programs that speak the systemd-specific journal protocol (i.e. `sd_journal_sendv()` et al.).
> *   It mixes these all together.
> *   It writes to a set of system-wide and per-user journal files, in `/run/log/journal/` or `/var/log/journal/`.
> *   If it can connect (as a client) to an `AF_LOCAL` datagram socket at `/run/systemd/journal/syslog`it writes journal data there, if forwarding to syslog is configured.

　　ok，到现在为止，我们知道了应用程序的日志是怎么转发到 rsyslog，那么 rsyslog 怎么处理接收到的日志，秘密就在 / etc/rsyslog.conf, 在打开这个配置文件之前，我们先看看 [rsyslog](http://www.rsyslog.com/) 官网的简单描述：

>  　　RSYSLOG is the **r**ocket-fast **sys**tem for **log** processing.

 　　原来 R 是 rocket-fast 的意思！火箭一般快！官网声称每秒可以处理百万级别的日志。rsyslogd 在部分 linux 环境是默认的 syslogd 程序（至少在笔者的机器上），d 是 daemon 的意思，后台进程。系统启动的时候就会启动该进程来处理日志（包括操作系统自身和用户进程的日志）。打开修改过的 / etc/rsyslog.conf, 接下来就是见证奇迹的时刻

 　　![](/img/syslog_intro/1089769-20170323142740033-1321897632.png)

　　原来一举一动都在监控之中。这个文件是系统提供的，直接在这个文件上做修改显然不是明智之举。如上图红色部分，可以再 rysyslog.d 文件夹下增加自己的配置文件，定制日志过滤规则。那么看看的 rsyslog.d 文件夹下新增的 tmp.conf



``` python
$FileOwner USERNAME
$FileGroup USERNAME
$FileCreateMode 0644
$DirCreateMode 0755
$Umask 0022
$template serverLog,"/home/USERNAME/Server.log"
$template LogFormat,"%msg%\n"
if $syslogfacility-text == 'local0' and $syslogtag contains 'ServerLog' then -?serverLog;LogFormat

#if $syslogfacility-text == 'local0' and $syslogtag contains 'ServerLog' then @someip:port
& stop

```



　　再来回顾一下对应的应用代码：



``` python
import logging
import logging.handlers

logger = None
def get_logger():
    global logger
    if not logger:
        logger = logging.getLogger('ServerLog')
        logger.setLevel(logging.INFO)

        sys_handler = logging.handlers.SysLogHandler('/dev/log', facility=logging.handlers.SysLogHandler.LOG_LOCAL0)
        syslog_tag = 'ServerLog'
        sys_handler.setFormatter(logging.Formatter(syslog_tag + ":%(asctime)s - %(name)s - %(levelname)s - %(message)s"))

        logger.addHandler(sys_handler)
    return logger

def some_func():
    get_logger().info("call some_func")

if __name__ == '__main__':
    some_func()
```



　　注意：配置文件需要与应用代码配合，比如代码中第 11 行 facility=logging.handlers.SysLogHandler.LOG_LOCAL0 与 配置中 $syslogfacility-text == 'local0' 相对应；代码第 12 行 syslog_tag = 'ServerLog' 与 配置文件 $syslogtag contains 'ServerLog' 对应。关于 python 代码中 syslogtag 的设置，参考了 stackoverflow 上的[这个问答](http://stackoverflow.com/questions/9542465/how-to-change-the-tag-when-logging-to-syslog-from-unknown)。

　　当我们修改了配置时候需要通过命令 /etc/init.d/rsyslog restart 来重启 rsyslogd，重启之后再运行之前的 python 文件，就可以了。

 　　![](/img/syslog_intro/1089769-20170323165530158-761295228.png)

 发送到远端服务器：
----------

　　上面的 tmp.conf 文件注释掉了第 10 行，这一行的作用是将满足条件的日志发送到指定的其他机器上，IP：Port 用来指定接受日志的远端 rsyslogd 程序。默认情况下 rsyslogd 在 514 端口监听。假设我需要给局域网内 10.240.10.10 发送 syslog，第 10 行改成这样就行了：

> ```
> if $syslogfacility-text == 'local0' and $syslogtag contains 'ServerLog' then @10.240.10.10
> 
> ```

　　那么 10.240.10.10 主要开启 rsyslogd 的远程监听，并指定远端日志的输出规则，for example：

　　![](/img/syslog_intro/1089769-20170410132458782-973391177.png)

　　这个配置，让 rsyslogd 使用 UDP 和 TCP 协议同时在 514 端口上监听，并将非本机的日志输出到对应远端主机名的文件。注意，以上修改 都需要重启 rsyslogd 才能生效。

总结：
===



　　日志从应用程序到最终的日志文件（或者远程服务器）的流程如下：

　　![](/img/syslog_intro/1089769-20170323163540080-1733313578.png)

references：
===========



[inter-process communication](https://en.wikipedia.org/wiki/Inter-process_communication)

[unix domain socket](https://en.wikipedia.org/wiki/Unix_domain_socket)

[understand-logging-in-linux](http://unix.stackexchange.com/questions/205883/understand-logging-in-linux)

[在 Linux 上配置一个 syslog 服务器](https://linux.cn/article-5023-1.html)


