---
title: Pycharm远程调试的非attach方法备忘
date: 2021-01-07 19:21:26
tags:
- Pycharm
categories:
- Misc
password: '0622'
---



**. . .**<!-- more -->



我们以aop项目为例子讲解, 其他A+项目类似:


# 搭建项目运行环境

1. **先将windows上的项目切到dvp分支**
2. 在linux自己的home目录下建立以下目录
   1.  `~/aop/aop`
   2.  `~/aop/files`
   3.  `~/aop/logs`
3.  配置pycharm与主机远程代码同步
    1.  ![](/img/pycharm_remote_debug_img/pycharm_deployment1.png) 
    2.  ![](/img/pycharm_remote_debug_img/pycharm_deployment2.png) 
    3.  ![](/img/pycharm_remote_debug_img/pycharm_deployment3.png) 
    4.  ![](/img/pycharm_remote_debug_img/pycharm_deployment4.png) 
    5.  ![](/img/pycharm_remote_debug_img/pycharm_deployment5.png) 
4. 去项目中拷贝一份 requirement.txt放到`~/aop`
5. 去`/home/edt/aop/aop/backend`下面拷贝一份settings_variables.py到`~/aop/aop`下面, 然后
   1. 把此文件中的`PROJECT_ROOT = '/home/edt/aop'`改为你自己的aop路径, 比如我的是`PROJECT_ROOT = '/home/hulinhong/aop'`
   2. 把 `SITE_ROOT = os.path.join(PROJECT_ROOT, 'www')` 改成 `SITE_ROOT = os.path.join(PROJECT_ROOT, 'aop')`
6. 去`/home/edt`下面找到aop的venv的python版本, 然后去/home/edt下面找对应的版本建立venv, 如:  
    1. `cd ~/aop`
    2. `/home/edt/.pyenv/versions/3.6.8/bin/python3.6 -m venv venv`
    3. `source ./venv/bin/activate`
    4. `python --version`
7. 安装各种依赖: `pip3 install -i https://pypi.python.org/simple/ --extra-index-url http://42.186.20.241:6900/simple/ --trusted-host 42.186.20.241 -r requirement.txt`
<!-- 7. 打开浏览器, 打开网址看看是否对了 http://dev-edt.netease.com:9507/login_manager/, 正常情况下, 此时页面会报 `{"error": {"code": 5000, "message": "index.html", "type": "TemplateNotFound"}}` -->
7.  从edt的aop下面拷贝前端生成好的文件到自己aop项目
   1.  `cp -r /home/edt/aop/aop/backend/templates/ ~/aop/aop/`
   2.  `cp -r /home/edt/aop/aop/backend/static/ ~/aop/aop/`
8. 启动服务器
   1. `cd ~/aop/aop`
   2. `flask run -h 0.0.0.0 -p 9507`
9. 打开浏览器, 打开网址看看是否对了 http://dev-edt.netease.com:9507/login_manager/
10. 使用OpenID登陆, 登录之后会报`此站点的连接不安全dev-edt.netease.com 发送了无效的响应。`, 此时需要在浏览器网址去掉https即可


# 搭建远程调试环境


<!-- 5. 这里建议填成跟deployment一样, ![]/img(pycharm_remote_debug_img/pycharm_remote_debug3.png) -->

1. ![](/img/pycharm_remote_debug_img/pycharm_add_interpreter1.png)
2. ![](/img/pycharm_remote_debug_img/pycharm_add_interpreter2.png)
3. ![](/img/pycharm_remote_debug_img/pycharm_add_interpreter3.png)
4. ![]/img(pycharm_remote_debug_img/pycharm_remote_debug2.png)
5. 修改backend目录下的`manage.py`, 在最底部加入以下代码
   ``` python
   if __name__ == '__main__':
    import os
    from dotenv import find_dotenv, load_dotenv
    load_dotenv(find_dotenv())
    params = {
        'host': os.environ.get('FLASK_RUN_HOST'),
        'port': os.environ.get('FLASK_RUN_PORT'),
        'ssl_context': (os.environ.get('FLASK_RUN_CERT'), os.environ.get('FLASK_RUN_KEY'))
    }
    app.run(**params)
   ```
6. 拷贝一份证书文件到你的home目录(其他地方也行, 下面`.env`文件里的证书路径跟这个对应上即可), `cp -r /home/gzliurongzhi/projects/cert ~`
7. 在backend目录下加一个`.env`文件, 写入以下内容
   ```
   FLASK_RUN_HOST=dev-edt.netease.com
   FLASK_RUN_PORT=9507
   FLASK_RUN_CERT=../../cert/cert.pem
   FLASK_RUN_KEY=../../cert/key.pem
   FLASK_ENV=development
   FLASK_APP=manage
   ```
8.  按照下图开启远程调试![](/img/pycharm_remote_debug_img/pycharm_remote_debug4.png)