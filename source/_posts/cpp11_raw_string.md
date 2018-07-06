---
title: C++11的Raw String Literals 
date: 2018-06-17 12:29:01
tags:
- CPP
categories:
- CPP
---





[如何绕过 g++ 4.8.1 那个不能在宏里面使用 R"(...)" 的 bug？](http://www.zhihu.com/question/23321406)

看到形如：R"" 这样的写法，相信学过 Python 的童鞋会感到似曾相识。Python 支持所谓的 “raw string”。Python 文档这样介绍 raw string：

Both string and bytes literals may optionally be prefixed with a letter 'r' or 'R'; such strings are called raw strings and treat backslashes as literal characters. As a result, in string literals, '\U' and '\u' escapes in raw strings are not treated specially. Given that Python 2.x’s raw unicode literals behave differently than Python 3.x’s the 'ur' syntax is not supported.
从这段文字中我们可以看出，raw string 最大的特点就是：它不会对反斜杠'\'进行特殊的转义处理。
那么，它的这一特性有什么好处呢？
不用正则，不知 raw string 大法好！我们知道，正则表达式里，有很多[元字符](http://deerchao.net/tutorials/regex/regex.htm#metacode)，当没有 raw string 时，我们需要在书写正则表达式的时候使用'\\'来表示元字符里的'\'，这样将导致正则表达式变得冗长，而且可读性也会降低。

**. . .**<!--more -->

C++ 11 中的 raw string，简化了我们在使用 regex 库时正则表达式的书写。下面是我找到的一些资料：

[C++11 raw strings literals tutorial](http://solarianprogrammer.com/2011/10/16/cpp-11-raw-strings-literals-tutorial/)
[Wikipedia: C++ 11 # New String Literals](http://en.wikipedia.org/wiki/C%2B%2B11#New_string_literals)

# 示例代码


``` c++
#include <iostream>
#include <string>

int main()
{
    // 一个普通的字符串，'\n'被当作是转义字符，表示一个换行符。
    std::string normal_str = "First line.\nSecond line.\nEnd of message.\n";
    // 一个raw string，'\'不会被转义处理。因此，"\n"表示两个字符：字符反斜杠 和 字母n。
    // 注意其语法格式，稍后会介绍C++ 11中为什么会采用这种语法格式来表达一个raw string。
    std::string raw_str = R"(First line.\nSecond line.\nEnd of message.\n)";

    std::cout << normal_str << std::endl;
    std::cout << raw_str << std::endl;
    std::cout << R"foo(Hello, world!)foo" << std::endl;
    
    // raw string可以跨越多行，其中的空白和换行符都属于字符串的一部分。
    std::cout <<R"(
                   Hello,
                   world!
                   )" << std::endl;

				   
    // 下面两行代码意图说明C++ 11采用一对圆括号以及自定义分割字符串来表示raw string的原因。
    // 1.
    // 如果没有一对圆括号及空的分割字符串做定界处理，R"""将会出现语法错误。Python中，r"""也不会是一个合法的
    // raw string literal。
    std::cout << R"(")" << std::endl; // 输出一个双引号："
    // 2.
    // 自定义分割字符串为：delimiter。分割字符串的长度以及其中包含的字符集，都有明文规定。维基百科：
    // The string delimiter can be any string up to 16 characters in length, including the empty string. 
    // This string cannot contain spaces, control characters, '(', ')', or the '\' character. 
    // 
    // 如果不使用自定义分割字符串，这里：R"()")"编译器无法识别raw string在何处结束。自定义分割字符串的用途
    // 维基百科中也有介绍：
    // The use of this delimiter string allows the user to have ")" characters within raw string literals.
    std::cout << R"delimiter()")delimiter" << std::endl; // 输出：)"

    return 0;
}
```


# 打印结果

	First line.
	Second line.
	End of message.

	First line.\nSecond line.\nEnd of message.\n
	Hello, world!

					Hello,
					world!

	"
	)"


# 分析

上面这段代码及其中注释大致讲解了 C++ 11 中的 raw string 的特点。但是为什么我们要在字符串中使用一对小括号呢？
我找到了如下资料：

[What is the rationale for parenthesis in C++11's raw string literals R“(…)”?](http://stackoverflow.com/questions/19075999/what-is-the-rationale-for-parenthesis-in-c11s-raw-string-literals-r)

[C++11 FAQ 中文版：原生字符串标识](http://www.chenlq.net/books/cpp11-faq/c-0-x-faq-chinese-version-of-native-string-that-identifies-the.html)


所以，小伙伴们以后在 C++ 11 中书写正则表达式的时候，记得用 raw string literals 啊。
