---
title: ProtoBuf的安装与使用
date: 2015-02-23 12:06:56
tags: 
- ProtoBuf
categories:
- Misc
---

# 介绍

与 JSON 相比， Protobuf 的序列化和反序列化的速度更快，而且传输的数据会先压缩，
使得传输的效率更高些 。
Protobuf ， 全称 Protocol Buffer ， 是 Google 公司内部的混合语言数据标准，是一种轻便
高效的结构化数据存储格式，可以用于结构化数据串行化，或者说序列化。 它很适合做数据
存储或 RPC 数据交换格式 。 Protobuf是可用于通信协议、数据存储等领域的语言无关、平台
无关、可扩展的序列化结构数据格式 。

# 安装

谷歌的东西要想在大陆安装起来总是有点那啥, 你懂的.

## 需要的依赖


    sudo apt-get install curl
    
    sudo apt-get install autoconf autogen

    sudo apt-get install libtool

## 安装步骤


下载自github的代码需要首先执行 $ ./autogen.sh 生成configure文件 

注意autogen.sh 需要gtest包，默认是从 googletest.googlecode.com下载，国内需要翻墙才能访问，很多人问autogen.sh运行失败，这里我补充一下 

修改一下autogen.sh , 将这段:
```
    echo "Google Test not present.  Fetching gtest-1.5.0 from the web..."
    curl http://googletest.googlecode.com/files/gtest-1.5.0.tar.bz2 | tar jx
    mv gtest-1.5.0 gtest
```
修改为:
```
    wget https://github.com/google/googletest/archive/release-1.5.0.tar.gz
    tar xzvf release-1.5.0.tar.gz
    mv googletest-release-1.5.0 gtest
```
再执行 autogen.sh，这样就不会报错了

    $ ./configure
    $ make
    $ make check
    $ make install

默认是装在

    usr/local/bin
    usr/local/lib,
    usr/local/include 
 

## 检查是否安装成功

    protoc --version

如果安装成功,会出现版本号 如

    libprotoc 2.6.1

如果有问题，会输出错误内容, 最后我安装完成,用上述命令检查版本号时出现如下问题

    protoc: error while loading shared libraries: libprotocbuf.so.9: cannot open shared

错误原因

protobuf的默认安装路径是/usr/local/lib,而/usr/local/lib不在ubuntu体系默认的LD_LIBRARY_PATH里,所以就找不到lib

解决办法 : 

1 - 在 /etc/ld.so.conf.d/目录下创建文件 bprotobuf.conf文件,文件内容如下

`/usr/local/lib`

2 - 输入命令

    sudo ldconfig

这时,再输入`protoc --version`就可以正常看到版本号了


# 使用

``` c++ Writer.cpp
#include<iostream>
#include<fstream>
#include "Mymessage.pb.h"
using namespace std;
int main(){
	Im::Content msg1;
	msg1.set_id(101);
	msg1.set_str("ggsmd");
	fstream output("./log", ios::out | ios::trunc | ios::binary); 
	if (!msg1.SerializeToOstream(&output)) {
		cerr << "Failed to write msg." << endl; 
		return -1;
	}
	return 0; 
}
```

``` c++ Reader.cpp
#include<iostream>
#include<fstream>
#include "Mymessage.pb.h"
using namespace std;
void ListMsg(const Im::Content & msg){
	cout << msg.id() << endl; 
	cout << msg.str() << endl;
} 
int main(int argc, char* argv[]){
	Im::Content msg1;
	fstream input("./log", ios::in | ios::binary);
	if (!msg1.ParseFromIstream(&input)) {
		cerr << "Failed to parse address book." << endl; 
		return -1;
	} 
	ListMsg(msg1);
	return 0;
}
```

``` shell makefile
INC=/usr/local/include
LIB=/usr/local/lib
lib=protobuf

all:Writer Reader

Writer.o:Writer.cpp
	g++ -g -c Writer.cpp -I$(INC) -L$(LIB) -l$(lib)
Reader.o:Reader.cpp
	g++ -g -c Reader.cpp -I$(INC) -L$(LIB) -l$(lib)	

Writer:Writer.o Mymessage.pb.o 
	g++ -g -o Writer Writer.o Mymessage.pb.o -I$(INC) -L$(LIB) -l$(lib)
Reader:Reader.o Mymessage.pb.o 
	g++ -g -o Reader Reader.o Mymessage.pb.o -I$(INC) -L$(LIB) -l$(lib)
Mymessage.pb.o:Mymessage.pb.cc
	g++ -g -c Mymessage.pb.cc -I$(INC) -L$(LIB) -l$(lib)	

clean:Writer Reader Writer.o Reader.o Mymessage.pb.o
	rm Writer Reader Writer.o Reader.o Mymessage.pb.o
```

``` c++ Mymessage.proto
package Im; 
message Content 
{ 
    required int32   id = 1;  // ID 
    required string  str = 2;  // str 
    optional int32   opt = 3;  //optional field 
}
```

## 打印结果

执行
`protoc -I=./ --cpp_out=./ Mymessage.proto`
 命令后，会生成 Mymessage.pb.h 和 Mymessage.pb.cc 文件。 再执行 `make` 命令，生成
Writer 和 Reader 文件 。 执行 `./Writer` 命令后，再执行`./Reader` 命令，终端上输出：

    b@b-VirtualBox:~/tc$ protoc -I=./ --cpp_out=./ Mymessage.proto
    b@b-VirtualBox:~/tc$ ll
    total 44
    drwxrwxr-x 2 b b  4096  5月 19 22:43 ./
    drwxr-xr-x 4 b b  4096  5月 19 22:35 ../
    -rw-rw-r-- 1 b b   647  5月 19 22:36 makefile
    -rw-rw-r-- 1 b b 12214  5月 19 22:43 Mymessage.pb.cc
    -rw-rw-r-- 1 b b  7762  5月 19 22:43 Mymessage.pb.h
    -rw-rw-r-- 1 b b   161  5月 19 22:36 Mymessage.proto
    -rw-rw-r-- 1 b b   421  5月 19 22:36 Reader.cpp
    -rw-rw-r-- 1 b b   340  5月 19 22:35 Writer.cpp

    b@b-VirtualBox:~/tc$ make
    g++ -g -c Writer.cpp -I/home/sharexu/charpter13/1302/include -L/home/sharexu/charpter13/1302/lib -lprotobuf
    g++ -g -c Mymessage.pb.cc -I/home/sharexu/charpter13/1302/include -L/home/sharexu/charpter13/1302/lib -lprotobuf	
    g++ -g -o Writer Writer.o Mymessage.pb.o -I/home/sharexu/charpter13/1302/include -L/home/sharexu/charpter13/1302/lib -lprotobuf
    g++ -g -c Reader.cpp -I/home/sharexu/charpter13/1302/include -L/home/sharexu/charpter13/1302/lib -lprotobuf	
    g++ -g -o Reader Reader.o Mymessage.pb.o -I/home/sharexu/charpter13/1302/include -L/home/sharexu/charpter13/1302/lib -lprotobuf
    
    b@b-VirtualBox:~/tc$ ll
    total 772
    drwxrwxr-x 2 b b   4096  5月 19 22:43 ./
    drwxr-xr-x 4 b b   4096  5月 19 22:35 ../
    -rw-rw-r-- 1 b b    647  5月 19 22:36 makefile
    -rw-rw-r-- 1 b b  12214  5月 19 22:43 Mymessage.pb.cc
    -rw-rw-r-- 1 b b   7762  5月 19 22:43 Mymessage.pb.h
    -rw-rw-r-- 1 b b 244112  5月 19 22:43 Mymessage.pb.o
    -rw-rw-r-- 1 b b    161  5月 19 22:36 Mymessage.proto
    -rwxrwxr-x 1 b b 188430  5月 19 22:43 Reader*
    -rw-rw-r-- 1 b b    421  5月 19 22:36 Reader.cpp
    -rw-rw-r-- 1 b b  57656  5月 19 22:43 Reader.o
    -rwxrwxr-x 1 b b 184244  5月 19 22:43 Writer*
    -rw-rw-r-- 1 b b    340  5月 19 22:35 Writer.cpp
    -rw-rw-r-- 1 b b  59232  5月 19 22:43 Writer.o

    b@b-VirtualBox:~/tc$ ./Writer    

    b@b-VirtualBox:~/tc$ ./Reader 
    101
    ggsmd


