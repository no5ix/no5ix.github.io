---
title: linux常用文本处理命令笔记整理之sed
date: 2015-10-23 12:51:19
tags: 
- 文本处理
categories:
- linux
---


sed是一种流编辑器，它是文本处理中非常中的工具，能够完美的配合正则表达式使用，功能不同凡响。处理时，把当前处理的行存储在临时缓冲区中，称为“模式空间”（pattern space），接着用sed命令处理缓冲区中的内容，处理完成后，把缓冲区的内容送往屏幕。接着处理下一行，这样不断重复，直到文件末尾。文件内容并没有 改变，除非你使用重定向存储输出。Sed主要用来自动编辑一个或多个文件；简化对文件的反复操作；编写转换程序等。

<!-- more -->

## sed命令

- **a\ 在当前行下面插入文本。**
- i\ 在当前行上面插入文本。
- c\ 把选定的行改为新的文本。
- **d 删除，删除选择的行。**
- D 删除模板块的第一行。
- **s 替换指定字符 h 拷贝模板块的内容到内存中的缓冲区。**
- H 追加模板块的内容到内存中的缓冲区。
- g 获得内存缓冲区的内容，并替代当前模板块中的文本。
- G 获得内存缓冲区的内容，并追加到当前模板块文本的后面。
- l 列表不能打印字符的清单。
- n 读取下一个输入行，用下一个命令处理新的行而不是用第一个命令。
- N 追加下一个输入行到模板块后面并在二者间嵌入一个新行，改变当前行号码。
- p 打印模板块的行。
- P(大写) 打印模板块的第一行。
- q 退出Sed。
- b lable 分支到脚本中带有标记的地方，如果分支不存在则分支到脚本的末尾。
- r file 从file中读行。
- t label if分支，从最后一行开始，条件一旦满足或者T，t命令，将导致分支到带有标号的命令处，或者到脚本的末尾。
- T label 错误分支，从最后一行开始，一旦发生错误或者T，t命令，将导致分支到带有标号的命令处，或者到脚本的末尾。
- w file 写并追加模板块到file末尾。
- W file 写并追加模板块的第一行到file末尾。
- ! 表示后面的命令对所有没有被选定的行发生作用。
- = 打印当前行号码。
- `#` 把注释扩展到下一个换行符以前。

## sed替换标记

- **g 表示行内全面替换。**
- p 表示打印行。
- w 表示把行写入一个文件。
- x 表示互换模板块中的文本和缓冲区中的文本。
- y 表示把一个字符翻译为另外的字符（但是不用于正则表达式） \1 子串匹配标记 & 已匹配字符串标记

## sed元字符集

- **^ 匹配行开始，如：/^sed/匹配所有以sed开头的行。**
- **$ 匹配行结束，如：/sed$/匹配所有以sed结尾的行。**
- . 匹配一个非换行符的任意字符，如：/s.d/匹配s后接一个任意字符，最后是d。
- \* 匹配0个或多个字符，如：/*sed/匹配所有模板是一个或多个空格后紧跟sed的行。
- [] 匹配一个指定范围内的字符，如/[ss]ed/匹配sed和Sed。
- [^] 匹配一个不在指定范围内的字符，如：/[^A-RT-Z]ed/匹配不包含A-R和T-Z的一个字母开头，紧跟ed的行。
- \(..\) 匹配子串，保存匹配的字符，如s/\(love\)able/\1rs，loveable被替换成lovers。
- & 保存搜索字符用来替换其他字符，如`s/love/**&**/，love`改成`**love**`。
- \< 匹配单词的开始，如:/\ 匹配单词的结束，如/love\>/匹配包含以love结尾的单词的行。
- x\{m\} 重复字符x，m次，如：/0\{5\}/匹配包含5个0的行。
- x\{m,\} 重复字符x，至少m次，如：/0\{5,\}/匹配至少有5个0的行。
- x\{m,n\} 重复字符x，至少m次，不多于n次，如：/0\{5,10\}/匹配5~10个0的行。

`直接编辑文件选项-i，否则并不会修改源文件`

## *sed常用用法1：增*

记忆技巧 : **增为a\, \这个符号是用来分隔a和具体要增加的字符串的, a代表的意思是在下一行插入, 
而i\是在上一行插入, 如果你用过vim的话, 应该很好记忆.
**
```
b@b-VirtualBox:~/my_temp_test/abc$ cat abc3
&& gg&
b@b-VirtualBox:~/my_temp_test/abc$ sed -i '/gg/a\hello, my friend' abc3
b@b-VirtualBox:~/my_temp_test/abc$ cat abc3
&& gg&
hello, my friend
```
sed -i '/gg/a\hello, my friend' abc3的含义是：
在abc3文件中的“gg”字符串的下一行插入“hello， my friend”


## *sed常用用法2：删*

```
b@b-VirtualBox:~/my_temp_test/abc$ cat abc3
&& gg&
hello, my friend
b@b-VirtualBox:~/my_temp_test/abc$ sed -i '/gg/d' abc3
b@b-VirtualBox:~/my_temp_test/abc$ cat abc3
hello, my friend
```
sed -i '/gg/d' abc3的含义是：
将abc3文件中所有包含的“gg”字符串的行删除

## *sed常用用法3：改*

```
b@b-VirtualBox:~/my_temp_test/abc$ cat abc3
hello, my friend
b@b-VirtualBox:~/my_temp_test/abc$ sed -i 's/hello/welcome/g' abc3
b@b-VirtualBox:~/my_temp_test/abc$ cat abc3
welcome, my friend
```
sed -i 's/hello/welcome/g' abc3的含义是：
将abc3文件中所有包含的“hello”字符串都修改为“welcome”