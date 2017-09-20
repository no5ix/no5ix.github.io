---
title: PHP的超级全局变量小结
date: 2015-07-13 19:29:22
tags:
- php
categories:
- 脚本
---


# PHP 超级全局变量概绍

> PHP中预定义了几个超级全局变量（superglobals） ，

这意味着它们在一个脚本的全部作用域中都可用。

 你不需要特别说明，就可以在函数及类中使用。

PHP 超级全局变量列表:

- $GLOBALS
- $_SERVER
- $_REQUEST
- $_POST
- $_GET
- $_FILES
- $_ENV
- $_COOKIE
- $_SESSION


# $GLOBALS

$GLOBALS 是PHP的一个超级全局变量组，

在一个PHP脚本的全部作用域中都可以访问。

$GLOBALS 是一个包含了全部变量的全局组合数组。变量的名字就是数组的键。

以下实例介绍了如何使用超级全局变量 $GLOBALS:

```
<?php 
$x = 75; 
$y = 25;
 
function addition() 
{ 
$GLOBALS['z'] = $GLOBALS['x'] + $GLOBALS['y']; 
}
 
addition(); 
echo $z; 
?>
```

> 以上实例中 z 是一个$GLOBALS数组中的超级全局变量，
该变量同样可以在函数外访问。


# $_SERVER

$_SERVER 是一个包含了诸如头信息(header)、路径(path)、以及脚本位置(script locations)等等信息的数组。

这个数组中的项目由 Web 服务器创建。

不能保证每个服务器都提供全部项目；服务器可能会忽略一些，或

者提供一些没有在这里列举出来的项目。

以下实例中展示了如何使用$_SERVER中的元素:

```
<?php 
echo $_SERVER['PHP_SELF'];
echo "<br>";
echo $_SERVER['SERVER_NAME'];
echo "<br>";
echo $_SERVER['HTTP_HOST'];
echo "<br>";
echo $_SERVER['HTTP_REFERER'];
echo "<br>";
echo $_SERVER['HTTP_USER_AGENT'];
echo "<br>";
echo $_SERVER['SCRIPT_NAME'];
?>
```

# $_REQUEST

PHP $_REQUEST 用于收集HTML表单提交的数据。

以下实例显示了一个输入字段（input）及提交按钮(submit)的表单(form)。

 当用户通过点击 "Submit" 按钮提交表单数据时, 

 表单数据将发送至<form>标签中 action 属性中指定的脚本文件。

 在这个实例中，我们指定文件来处理表单数据。

 如果你希望其他的PHP文件来处理该数据，你可以修改该指定的脚本文件名。

 然后，我们可以使用超级全局变量 $_REQUEST 来收集表单中的 input 字段数据:

 ```
 <html>
<body>

<form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
Name: <input type="text" name="fname">
<input type="submit">
</form>

<?php 
$name = $_REQUEST['fname']; 
echo $name; 
?>

</body>
</html>
 ```

 # $_POST
PHP $_POST 被广泛应用于收集表单数据，

在HTML form标签的指定该属性："method="post"。

以下实例显示了一个输入字段（input）及提交按钮(submit)的表单(form)。

当用户通过点击 "Submit" 按钮提交表单数据时, 

表单数据将发送至<form>标签中 action 属性中指定的脚本文件。 

在这个实例中，我们指定文件来处理表单数据。

如果你希望其他的PHP文件来处理该数据，你可以修改该指定的脚本文件名。

然后，我们可以使用超级全局变量 $_POST 来收集表单中的 input 字段数据:

```
<html>
<body>

<form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
Name: <input type="text" name="fname">
<input type="submit">
</form>

<?php 
$name = $_POST['fname']; 
echo $name; 
?>

</body>
</html>
```

# $_GET
PHP $_GET 同样被广泛应用于收集表单数据，

在HTML form标签的指定该属性："method="get"。

$_GET 也可以收集URL中发送的数据。

假定我们有一个包含参数的超链接HTML页面：
```
<html>
<body>

<a href="test_get.php?subject=PHP&web=runoob.com">Test $GET</a>

</body>
</html>
```

当用户点击链接 "Test $GET", 参数 "subject" 和 "web" 将发送至"test_get.php",

你可以在 "test_get.php" 文件中使用 $_GET 变量来获取这些数据。

以下实例显示了 "test_get.php" 文件的代码:
```
<html>
<body>

<?php 
echo "Study " . $_GET['subject'] . " at " . $_GET['web'];
?>

</body>
</html>
```


# $_REQUEST、$_POST、$_GET的区别和联系小结

## 1. $_REQUEST 

php中$_REQUEST可以获取以POST方法和GET方法提交的数据，但是速度比较慢 

## 2. $_GET 

用来获取由浏览器通过GET方法提交的数据。GET方法他是通过把参数数据加在提交表单的action属性所指的URL中，值和表单内每个字段一一对应，然后在URL中可以看到，但是有如下缺点： 

- 1. 安全性不好，在URL中可以看得到 

- 2. 传送数据量较小，不能大于2KB。 

## 3. $_POST 

用来获取由浏览器通过POST方法提交的数据。POST方法他是通过HTTP POST机制，将表单的各个字段放置在HTTP HEADER内一起传送到action属性所指的URL地址中，用户看不到这个过程。他提交的大小一般来说不受限制，但是具体根据服务器的不同，还是略有不同。相对于_GET方式安全性略高 

## 4. $_REQUEST、$_POST、$_GET 的区别和联系 

$_REQUEST["参数"]具用$_POST["参数"] $_GET["参数"]的功能,但是$_REQUEST["参数"]比较慢。通过post和get方法提交的所有数据都可以通过$_REQUEST数组["参数"]获得