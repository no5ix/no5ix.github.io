---
title: VS Code开发Go的配置
date: 2019-09-08 21:31:26
tags:
- Go
- VSCode
categories:
- Misc
---


Go 语言支持以下系统：

- Linux
- FreeBSD
- Mac OS X（也称为 Darwin）
- Windows

安装包下载地址为：https://golang.org/dl/。

如果打不开可以使用这个地址：https://golang.google.cn/dl/。

**. . .**<!-- more -->


# Windows 系统下安装Go

Windows 下可以使用 .msi 后缀(在下载列表中可以找到该文件，如go1.4.2.windows-amd64.msi)的安装包来安装。

默认情况下 .msi 文件会安装在 c:\Go 目录下。你可以将 c:\Go\bin 目录添加到 Path 环境变量中。添加后你需要重启命令窗口才能生效。



# 安装 vscode 扩展

在 vscode 扩展里面搜索 go(MicroSoft出品的那个)，然后下载安装扩展。



# 安装 go 插件

1.  在`$GOPATH`目录下创建`bin`,`pkg`,`src`
2.  切换到`$GOPATH/bin`目录下，打开终端输入以下命令，不需要翻墙：
    *   go get -u -v github.com/josharian/impl
    *   go get -u -v github.com/mdempsky/gocode
    *   go get -u -v github.com/rogpeppe/godef
    *   go get -u -v github.com/golang/lint/golint
    *   go get -u -v github.com/lukehoban/go-find-references
    *   go get -u -v github.com/lukehoban/go-outline
    *   go get -u -v github.com/sqs/goreturns
    *   go get -u -v golang.org/x/tools/cmd/gorename
    *   go get -u -v github.com/tpng/gopkgs
    *   go get -u -v github.com/newhook/go-symbols
    *   go get -v -u github.com/peterh/liner 
    *   github.com/derekparker/delve/cmd/dlv
    *   go get -u -v golang.org/x/tools/cmd/guru
    一共 11 个插件，由于被墙和依赖的缘故，很多插件是没办法正常安装的，但是 go 官方在 github 是有镜像仓库的，所以我们可以借助 github 来安装。
    
3.  在`src`下创建`golang.org/x/`两个文件夹，然后切换到此目录下，打开终端输入：
    ```
    git clone https://github.com/golang/tools.git
    ```
    此时`x`目录下会出现`tools`文件夹。
    
4.  切换到`$GOPATH`目录下，打开终端输入以下命令安装，安装那些你上一步没有成功的插件：
    *   go install github.com/mdempsky/gocode
    *   go install github.com/rogpeppe/godef
    *   go install github.com/lukehoban/go-find-references
    *   go install github.com/lukehoban/go-outline
    *   go install github.com/sqs/goreturns
    *   go install golang.org/x/tools/cmd/gorename
    *   go install github.com/tpng/gopkgs
    *   go install github.com/josharian/impl
    *   go install github.com/newhook/go-symbols
    *   go install golang.org/x/tools/cmd/guru  
    *   `golint`比较特殊,通过上面的方式还是无法安装，所以我们在`x`目录下打开终端执行：  
        
        ```
        git clone https://github.com/golang/lint.git
        go install golang.org/x/lint/golint
        ```
        
此时所有插件安装成功。
    


# 第三方库依赖(可选项)

1.  安装`net`库解决警告，切换到`x`目录，然后打开终端执行：
    
    ```
    git clone git@github.com:golang/net.git --depth 1
    ```
	然后重启 vscode 即可。
    
2.  安装`text`库解决警告，切换到`x`目录，然后打开终端执行：
    
    ```
    git clone git@github.com:golang/text.git --depth 1
    ```
	然后重启 vscode 即可
    

# 调试配置

> 备注：go 的调试器是`dlv`

1.  进入调试界面，按`F5`或者点击调试按钮，进入后添加配置(**项目需要以文件夹的形式打开**)。
2.  回到`hello.go`文件, 按`F5`, 出现以下界面代表成功：


# 用户设置

如果设置了系统级别的`$GOPATH`可以在用户设置里面覆盖。
```
"go.buildTags": "",
"go.buildFlags": [],
"go.lintFlags": [],
"go.vetFlags": [],
"go.liveErrors": {
	"enabled": true,
	"delay": 500
},
"go.coverOnSave": false,
"go.useCodeSnippetsOnFunctionSuggest": true,
"go.useCodeSnippetsOnFunctionSuggestWithoutType": true,
"go.formatTool": "goreturns",
"go.goroot": "C:\\Go",
"go.gopath": "C:\\Users\\b\\go",
"go.gocodeAutoBuild": false,
"go.autocompleteUnimportedPackages": true
```