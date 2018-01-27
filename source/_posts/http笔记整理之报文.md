---
title: http报文笔记整理
date: 2016-05-24 21:12:46
categories:
- 脚本
---

> 看了书和各种网上资料, 学东西嘛, 要做总结, 这些老笔记整理一下, 供以后方便查阅也加强印象和理解.

![这里写图片描述](http://img.blog.csdn.net/20170830060728031?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
# **报文的组成**


- 起始行(start line)
- 首部(header)
- 主体(body)

可细分为 : 

## **方法** : 
如GET, HEAD, POST
![这里写图片描述](http://img.blog.csdn.net/20170830061634966?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


... <!-- more -->

### **关于HTTP请求GET和POST的区别 : **

**1.提交方式的区别: **


- GET提交，请求的数据会附在URL之后（就是把数据放置在http起始行中），以?分割URL和传输数据，多个参数用&连接;例如：login.action?name=hyddd&password=idontknow&verify=%E4%BD%A0 %E5%A5%BD。如果数据是英文字母/数字，原样发送，如果是空格，转换为+，如果是中文/其他字符，则直接把字符串用BASE64加密，得出如： %E4%BD%A0%E5%A5%BD，其中％XX中的XX为该符号以16进制表示的ASCII。

- POST提交：把提交的数据放置在是HTTP主体中。

因此，GET提交的数据会在地址栏中显示出来，而POST提交，地址栏不会改变


**2.传输数据的大小：**

首先声明,HTTP协议没有对传输的数据大小进行限制，HTTP协议规范也没有对URL长度进行限制。 而在实际开发中存在的限制主要有：

- GET:特定浏览器和服务器对URL长度有限制，例如IE对URL长度的限制是2083字节(2K+35)。对于其他浏览器，如Netscape、FireFox等，理论上没有长度限制，其限制取决于操作系统的支持。

因此对于GET提交时，传输数据就会受到URL长度的限制。

- POST:由于不是通过URL传值，理论上数据不受限。但实际各个WEB服务器会规定对post提交数据大小进行限制，Apache、IIS6都有各自的配置。

 

**3.安全性：**

POST的安全性要比GET的安全性高。注意：这里所说的安全性和上面GET提到的“安全”不是
同个概念。上面“安全”的含义仅仅是不作数据修改，而这里安全的含义是真正的Security
的含义，比如：通过GET提交数据，用户名和密码将明文出现在URL上，因为

- (1)登录页面有可能被浏览器缓存， 
- (2)其他人查看浏览器的历史纪录，那么别人就可以拿到你的账号和密码了，



## **请求URL **
URL是浏览器寻找信息时所需的资源位置 .
URL分为三个部分 : 

- URL文案
- 服务器位置
- 资源路径
![5](http://img.blog.csdn.net/20170830063116038?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 
## **版本号**
上图中的HTTP/1.0 200 OK, HTTP/1.0就是版本号

## **状态码 : **
如最著名的404, 302, 如上图中的HTTP/1.0 200 OK中, 状态码就是200
  ![](http://img.blog.csdn.net/20170830061832111?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
  
## **原因短语**
 如上图中的HTTP/1.0 200 OK中, OK就是原因短语
 
## **首部**
![这里写图片描述](http://img.blog.csdn.net/20170830062551108?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbm9zaXg=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

## **主体**
主体部分是可选的, 主体是http报文要传输的内容, 可以承载很多类型的数字数据 : 图片, 视频, 软件应用程序, 电子邮件等

