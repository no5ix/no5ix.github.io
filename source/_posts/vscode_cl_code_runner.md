---
title: vscode用cl来编译c++
date: 2019-12-08 16:04:48
tags:
- VSCode
categories:
- Misc
---



在 Windows 下，想要编译 C++ 程序有很多种实现方式，Clang+LLVM，GCC，MSVC 等。一般而言，要想使用微软的 MSVC 编译 C++ 程序，需要用到庞大的 IDE：Visual Studio。然而如果平常随便写个代码都要调用 Visual Studio，无疑造成很大的不便。安装 Visual Studio 后，其实可以用命令行编译 C++ 程序，这需要一些小小的配置：


**. . .**<!-- more -->

# 参考文档

微软的官方文档是最可靠的来源：  
[C++ 生成参考](https://docs.microsoft.com/zh-cn/cpp/build/reference/c-cpp-building-reference?view=vs-2017)  
[按类别列出的编译器选项](https://docs.microsoft.com/zh-cn/cpp/build/reference/compiler-options-listed-by-category?view=vs-2017)


# 装git的注意事项

装git的时候选的terminal客户端选cmd那个， 否则编译的时候会出错


# 配置环境变量

为了方便之后的配置，可以设置两个辅助变量（当然，这不是必须的）

| 变量名 | 路径 |
| --- | --- |
| MSVC | `C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\VC\Tools\MSVC\14.16.27023` |
| WK10 | `C:\Program Files (x86)\Windows Kits\10` |

此处路径仅作为参考。接下来配置 Path：在 Path 中添加

```
%WK10%\bin\10.0.17763.0\x64;%MSVC%\bin\Hostx64\x64;C:\Program Files (x86)\Microsoft Visual Studio\2017\Community\Common7\IDE
```

新建两个变量：

| 变量名 | 路径 |
| --- | --- |
| LIB | `%WK10%\Lib\10.0.17763.0\ucrt\x64;%WK10%\Lib\10.0.17763.0\um\x64;%MSVC%\lib\x64` |
| INCLUDE | `%WK10%\Include\10.0.17763.0\ucrt;%WK10%\Include\10.0.17763.0\um;` |


# 在 VS code 内置命令行实现快捷编译

当然可以使用 Task.json 配置自定义生成任务，或者使用 Makefile 和 nmake.exe 来生成可执行文件。这里介绍通过扩展实现快捷编译的一种方法：

到 Extension 下载扩展 Code Runner，在 User\settings.json 中用如下代码替换原代码的对应部分：

```
"code-runner.executorMap": {
  "c": "cd $dir && cl $fileName /Fe$fileNameWithoutExt 
&& $dir$fileNameWithoutExt",
  "cpp": "cd $dir && cl /EHsc /nologo $fileName /Fe$fileNameWithoutExt 
&& $dir$fileNameWithoutExt",
},


```

右键然后点击“Run Code” 即可编译当前文件。


# （备注）测试单文件编译

建立一个 C++ 文件 Hello.cpp

```
#include <iostream>
int main()
{
  std::cout << "Hello World" << std::endl;
  return 0;
}


```

进入到文件所在的目录，打开命令行，输入编译命令：

cl.exe 是 MSVC 编译器的编译命令。等编译完成（中间可能会报错，暂时不管它），目录生成 Hello.obj 和 Hello.exe，即可运行程序观察效果：

编译过程中我们可以为编译器指定参数。详细的参数列表可以查询微软的官方文档。这里列出常用的几个：

| 参数 | 说明 |
| --- | --- |
| /nologo | 不显示 “Microcoft 优化 C++ 编译器” 的字样。 |
| /std | 控制兼容的 C++ 版本。目前仅支持 / std:c++14、/std:c++17(/std:c++latest) |
| /EH | 指定异常处理模型。一般使用 / EHsc；尽量不要使用 / EHa |
| /Fe | 指定生成可执行文件的名称。 |
| /Fo | 指定生成中间输出文件的名称。 |

与 GCC 不同，MSVC 编译选项后直接跟内容，不加空格。例如，上面的 Hello.cpp 我们可以这样编译：

```
cl /nologo /EHsc /FeHelloWorld /std:c++latest Hello.cpp


```

这样就会生成 HelloWorld.exe 文件而不是 Hello.exe。


# （备注）测试多文件编译

新建一个类 Class1，在目录下创建 Class1.h 和 Class1.cpp，调整 main() 函数调用 Class1 的成员函数输出 "Hello World"。尝试编译这个文件：

MSVC 支持使用如下命令分离编译和链接的步骤：(大小写区分！)

```
cl /EHsc /c Hello.cpp Class1.cpp
link Hello.obj Class1.obj /OUT:Hello.exe


```

link.exe 是 MSVC 的链接命令。/c 指令说明编译而不链接，/OUT:filename.exe 指示输出可执行文件的名称。这里. exe 后缀可以省略。

然而，更简便的做法是让 cl.exe 自动调用 link.exe：

```
cl /nologo /EHsc /FeHello Hello.cpp Class1.cpp


```

这样也可以实现与先编译后链接相同的效果。