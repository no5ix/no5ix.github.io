---
title: boost之program_options
date: 2016-08-15 15:11:26
tags:
- Boost
- c++
categories:
- c++
---


# 介绍
命令行接口是普遍,基础的人机交互接口，从命令行提取程序的运行时选项的方法有很多。

你可以自己编写相对应的完整的解析函数，或许你有丰富的C语言编程经验，熟知getopt()函数的用法，又或许使用Python的你已经在使用optparse库来简化这一工作。

大家在平时不断地谈及到“不要重复造轮子”，那就需要掌握一些顺手的库，这里介绍一种C++方式来解析命令行选项的方法，就是使用Boost.Program_options库。



program_options提供程序员一种方便的命令行和配置文件进行程序选项设置的方法。

使用program_options库而不是你自己动手写相关的解析代码，因为它更简单，声明程序选项的语法简洁，并且库自身也非常小。

将选项值转换为适合的类型值的工作也都能自动完成。

库有着完备的错误检查机制，如果自己手写解析代码时，就可能会错过对一些出错情况的检查了。

最后，选项值不仅能从命令行获取，也能从配置文件，甚至于环境变量中提取，而这些选择不会增加明显的工作量。



# 示例说明
以下面简单的hello程序进行说明，默认打印hello world,如果传入-p选项，就会打印出人的姓名，另外通过传入-h选项，可以打印出帮助选项。

略微看一眼代码文件和相应的屏幕输入输出，然后我们再一起来看看这些是如何发生的。


```
//hello.cpp 
#include <iostream>
#include <string>
#include <boost/program_options.hpp>

using namespace std;
int main(int argc, char* argv[])
{
    using namespace boost::program_options;
    //声明需要的选项
    options_description desc("Allowed options");
    desc.add_options()
        ("help,h", "produce help message")
        ("person,p", value<string>()->default_value("world"), "who")
        ;

    variables_map vm;        
    store(parse_command_line(argc, argv, desc), vm);
    notify(vm);    

    if (vm.count("help")) {
        cout << desc;
        return 0;
    }
    cout << "Hello " << vm["person"].as<string>() << endl;
    return 0;
}
```

下面是在Windows命令提示符窗口上的输入输出结果，其中">"表示提示符。

```

>hello 
Hello world

>hello -h
Allowed options:
  -h [ --help ]                produce help message
  -p [ --person ] arg (=world) who

>hello --person len
Hello len
```

首先通过options_description类声明了需要的选项，add_options返回了定义了operator()的特殊的代理对象。

这个调用看起来有点奇怪，其参数依次为选项名，选项值，以及选项的描述。

注意到示例中的选项名为"help,h"，是因为声明了具有短选项名和长选项名的选项，这跟gnu程序的命令行具有一致性。

当然你可以省略短选项名，但是这样就不能用命令选项简写了。

第二个选项的声明，定义了选项值为string类型，其默认值为world.

接下来,声明了variables_map类的对象，它主要用来存储选项值，并且能储存任意类型的值。

然后，store,parse_command_line和notify函数使vm能存储在命令行中发现的选项。



最后我们就自由地使用这些选项了，variables_map类的使用就像使用std::map一样，除了它必须用as方法去获取值。

如果as方法调用的指定类型与实际存储的类型不同，就会有异常抛出。



具有编程的你可能有这样的经验，使用cl或gcc对源文件进行编译时，可直接将源文件名放置在命令行中，而无需什么选项字母，如gcc a.c之类的。

prgram_options也能处理这种情况，在库中被称为"positional options"(位置选项),但这需要程序员的一点儿帮助才能完成。

看下面的经过对应修改的代码，我们无需传入"-p"选项，就能可指定"person"选项值

```
    positional_options_description p;
    p.add("person", -1);
    store(command_line_parser(argc, argv).options(desc).positional(p).run(), vm);
```

```
>hello len
Hello len
```

前面新增的两行是为了说明所有的位置选项都应被解释成"person"选项，这里还采用了command_line_parser类来解析命令行，而不是用parse_command_line函数。

后者只是对前者类的简单封装，但是现在我们需要传入一些额外的信息，所以要使用类本身。



选项复合来源
一般来说，在命令行上指定所有选项，对用户来说是非常烦人的。

如果有些选项要应用于每次运行，那该怎么办呢。

我们当然希望能创建出带有些常用设置的选项文件，跟命令行一起应用于程序中。

当然这一切需要将命令行与配置文件中的值结合起来。

比如，在命令行中指定的某些选项值应该能覆盖配置文件中的对应值，或者将这些值组合起来。



下面的代码段将选项通过文件读取，这文件是文本格式，可用"#"表示注释，格式如命令行中的参数一样，选项=值

```
    ifstream ifs("config.cfg");
    store(parse_config_file(ifs,config),vm);
    notify(vm);

```

# 参考

[Boost.prgram_options库文档](http://www.boost.org/doc/libs/1_35_0/doc/html/program_options.html)