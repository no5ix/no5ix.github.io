---
title: C++对象模型之简述C++对象的内存布局
date: 2015-05-03 10:05:48
tags:
- c++
- 对象模型
categories:
- c++
---


转自CDSN[阅读原文](http://blog.csdn.net/ljianhui/article/details/45903939)

<div id="article_content" class="article_content tracking-ad" data-mod=popu_307  data-dsm = "post" >
<div><span style="font-size:18px;">在C++中，有两种类的成员变量：static和非static，有三种成员函数：static、非static和virtual。那么，它们如何影响C++的对象在内存中的分布呢？ 当存在继承的情况下，其内存分布又是如何呢？
</span> <div><span style="font-size:18px;">
</span> <div><span style="font-size:18px;">下面就一个非常简单的类，通过逐渐向其中加入各种成员，来逐一分析上述两种成员变量及三种成员函数对类的对象的内存分布的影响。 
</span> <div><span style="font-size:18px;">
 注：以下的代码的测试结果均是基于Ubuntu 14.04 64位系统下的G++ 4.8.2，若在其他的系统上或使用其他的编译器，可能会运行出不同的结果。 
</span> </div></div></div></div><div><span style="font-size:18px;">
</span> </div>

<!-- 
<span style="font-size:18px;color:red;">1、含有非static成员变量及成员函数的类的对象的内存分布</span> -->

# 1、含有非static成员变量及成员函数的类的对象的内存分布

<div>
<span style="font-size:18px;"> 
 </span><div><span style="font-size:18px;">类Persion的定义如下： </span>
 <pre code_snippet_id="672528" snippet_file_name="blog_20150522_1_9940117"  code_snippet_id="672528" snippet_file_name="blog_20150522_1_9940117" name="code" class="cpp">class Person
{
    public:
        Person():mId(0), mAge(20){}
        void print()
        {
            cout &lt;&lt; &quot;id: &quot; &lt;&lt; mId
                 &lt;&lt; &quot;, age: &quot; &lt;&lt; mAge &lt;&lt; endl;
        }
    private:
        int mId;
        int mAge;
}; </pre>
<span style="font-size:18px;">Person类包含两个非static的int型的成员变量，一个构造函数和一个非static成员函数。为弄清楚该类的对象的内存分布，对该类的对象进行一些操作如下： </span>
 <div><div><pre code_snippet_id="672528" snippet_file_name="blog_20150522_2_3401017"  code_snippet_id="672528" snippet_file_name="blog_20150522_2_3401017" name="code" class="cpp">int main()
{
    Person p1;
    cout &lt;&lt; &quot;sizeof(p1) == &quot; &lt;&lt; sizeof(p1) &lt;&lt; endl;
    int *p = (int*)&amp;p1;
    cout &lt;&lt; &quot;p.id == &quot; &lt;&lt; *p &lt;&lt; &quot;, address: &quot;  &lt;&lt; p &lt;&lt; endl;
    ++p;
    cout &lt;&lt; &quot;p.age == &quot; &lt;&lt; *p &lt;&lt; &quot;, address: &quot; &lt;&lt; p &lt;&lt; endl;
    cout &lt;&lt; endl;

    Person p2;
    cout &lt;&lt; &quot;sizeof(p2) == &quot; &lt;&lt; sizeof(p1) &lt;&lt; endl;
    p = (int*)&amp;p2;
    cout &lt;&lt; &quot;p.id == &quot; &lt;&lt; *p &lt;&lt; &quot;, address: &quot; &lt;&lt; p &lt;&lt; endl;
    ++p;
    cout &lt;&lt; &quot;p.age == &quot; &lt;&lt; *p &lt;&lt; &quot;, address: &quot; &lt;&lt; p &lt;&lt; endl;
    return 0;
} </pre>
<span style="font-size:18px;">其运行结果如下： </span>
 <div><div><div><div>&nbsp;![](http://img.blog.csdn.net/20150522023309556?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)
 <div>
 <div><div><div><div><span style="font-size:18px;">从上图可以看到类的对象的占用的内存均为8字节，使用普通的int＊指针可以遍历输出对象内的非static成员变量的值，且两个对象中的相同的非static成员变量的地址各不相同。 
</span> <span style="font-size:18px;">
</span> </div><div><span style="font-size:18px;">据此，可以得出结论，在C++中，非static成员变量被放置于每一个类对象中，非static成员函数放在类的对象之外，且非static成员变量在内存中的存放顺序与其在类内的声明顺序一致。即person对象的内存分布如下图所示： </span>
 <div>![](http://img.blog.csdn.net/20150522023352769?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 </div></div></div>
 </div>
 </div></div></div></div></div></div></div></div></div></div>

<!-- <span style="font-size:18px;color:red;">2、含有static和非static成员变量和成员函数的类的对象的内存分布
 </span> -->

 # 2、含有static和非static成员变量和成员函数的类的对象的内存分布

 <div><span style="font-size:18px;"> </span><div><span style="color:red;"><span style="color:black;"><span style="font-size:18px;">
 向Person类中加入一个static成员变量和一个static成员函数，如下：</span>
</span></span><pre code_snippet_id="672528" snippet_file_name="blog_20150522_3_7177560"  code_snippet_id="672528" snippet_file_name="blog_20150522_3_7177560" name="code" class="cpp">class Person
{
     public:
         Person():mId(0), mAge(20){ ++sCount; }
         ~Person(){ --sCount; }
         void print()
         {
             cout &lt;&lt; &quot;id: &quot; &lt;&lt; mId
                  &lt;&lt; &quot;, age: &quot; &lt;&lt; mAge &lt;&lt; endl;
         }
         static int personCount()
         {
             return sCount;
         }
     private:
         static int sCount;
         int mId;
         int mAge;
}; </pre>
<span style="font-size:18px;">测试代码不变，与第1节中的代码相同。其运行结果不变，与第1节中的运行结果相同。 
 </span><div><span style="font-size:18px;">
</span><div><span style="font-size:18px;"> 据此，可以得出：static成员变量存放在类的对象之外，static成员函数也放在类的对象之外。
</span><div><span style="font-size:18px;">
其内存分布如下图所示：</span>
</div></div><div>![](http://img.blog.csdn.net/20150522023400565?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

</div></div></div></div>

<!-- <span style="font-size:18px;color:red;">3、</span><span style="font-family:微软雅黑;font-size:18px;color:#000000;background-color:#FFFFFF;font-style:normal;font-weight:normal;text-align:left;"><span style="color:black;"><span style="color:red;">加入virtual成员函数的类的对象的内存分布</span> -->

# 3、加入virtual成员函数的类的对象的内存分布

 </span></span><span style="font-size:18px;">  </span><div><span style="font-size:18px;">
在Person类中加入一个virtual函数，并把前面的print函数修改为函数，如下： </span>
 <pre code_snippet_id="672528" snippet_file_name="blog_20150522_4_3212754"  code_snippet_id="672528" snippet_file_name="blog_20150522_4_3212754" name="code" class="cpp">class Person
{
    public:
        Person():mId(0), mAge(20){ ++sCount; }
        static int personCount()
        {
            return sCount;
        }

        virtual void print()
        {
            cout &lt;&lt; &quot;id: &quot; &lt;&lt; mId
                 &lt;&lt; &quot;, age: &quot; &lt;&lt; mAge &lt;&lt; endl;
        }
        virtual void job()
        {
            cout &lt;&lt; &quot;Person&quot; &lt;&lt; endl;
        }
        virtual ~Person()
        {
            --sCount;
            cout &lt;&lt; &quot;~Person&quot; &lt;&lt; endl;
        }

    protected:
        static int sCount;
        int mId;
        int mAge;
};</pre>
</div><div><span style="font-size:18px;">为了查看类的对象的内存分布，对类的对象执行如下的操作代码，如下： </span>
<div> <pre code_snippet_id="672528" snippet_file_name="blog_20150522_5_1903251"  code_snippet_id="672528" snippet_file_name="blog_20150522_5_1903251" name="code" class="cpp">int main()
{
    Person person;
    cout &lt;&lt; sizeof(person) &lt;&lt; endl;
    int *p = (int*)&amp;person;
    for (int i = 0; i &lt; sizeof(person) / sizeof(int); ++i, ++p)
    {
        cout &lt;&lt; *p &lt;&lt; endl;
    }
    return 0;
} </pre>
<div><div><span style="font-size:18px;">其运行结果如下： </span>
<div> ![](http://img.blog.csdn.net/20150522023520285?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
 </div><div>
<div><span style="font-size:18px;">从上图可以看出，加virtual成员函数后，类的对象的大小为16字节，增加了8。通过int＊指针遍历该对象的内存，可以看到，最后两行显示的是成员数据的值。
</span><div><span style="font-size:18px;">
</span><div><span style="font-size:18px;">C++中的虚函数是通过虚函数表（vtbl）来实现，每一个类为每一个virtual函数产生一个指针，放在表格中，这个表格就是虚函数表。每一个类对象会被安插一个指针（vptr），指向该类的虚函数表。vptr的设定和重置都由每一个类的构造函数、析构函数和复制赋值运算符自动完成。
</span><div><span style="font-size:18px;">
</span><div><div><span style="font-size:18px;">由于本人的系统是64位的系统，一个指针的大小为8字节，所以可以推出，在本人的环境中，类的对象的安插的vptr放在该对象所占内存的最前面。其内存分布图如下：
</span><div><span style="font-size:18px;">注：虚函数的顺序是按虚函数定义顺序定义的，但是它还包含其他的一些字段，本人还未明白它是什么，在下一节会详细说明虚函数表的内容。</span>
</div></div><div>![](http://img.blog.csdn.net/20150522023548880?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


<div>
<!-- 
<div>
# 虚函数表（vtbl）的内容及函数指针存放顺序
</div> -->

<span style="font-size:18px;color:red;">4、虚函数表（vtbl）的内容及</span><span style="font-size:18px;color:red;">函数指针存放顺序</span>

<span style="font-size:18px;">
</span><div><span style="font-size:18px;">在第3节中，我们可以知道了指向虚函数表的指针（vptr）在类中的位置了，而函数表中的数据都是函数指针，于是便可利用这点来遍历虚函数表，并测试出虚函数表中的内容。
</span><div><span style="font-size:18px;">
</span><div><span style="font-size:18px;">测试代码如下：</span>
<pre code_snippet_id="672528" snippet_file_name="blog_20150522_6_7971463"  code_snippet_id="672528" snippet_file_name="blog_20150522_6_7971463" name="code" class="cpp">typedef void (*FuncPtr)();
int main()
{
    Person person;
    int **vtbl = (int**)*(int**)&amp;person;
    for (int i = 0; i &lt; 3 &amp;&amp; *vtbl != NULL; ++i)
    {
        FuncPtr func = (FuncPtr)*vtbl;
        func();
        ++vtbl;
    }

    while (*vtbl)
    {
        cout &lt;&lt; &quot;*vtbl == &quot; &lt;&lt; *vtbl &lt;&lt; endl;
        ++vtbl;
    }
    return 0;
}</pre>
<div><div><span style="font-size:18px;">代码解释：
由于虚函数表位于对象的首位置上，且虚函数表保存的是函数的指针，若把虚函数表当作一个数组，则要指向该数组需要一个双指针。我们可以通过如下方式获取Person类的对象的地址，并转化成int**指针：</span></div><div><div><div><div><pre code_snippet_id="672528" snippet_file_name="blog_20150522_7_6241129"  code_snippet_id="672528" snippet_file_name="blog_20150522_7_6241129" name="code" class="cpp">Person person;
int **p = (int**)&amp;person;</pre>
<div><span style="font-size:18px;">再通过如下的表达式，获取虚函数表的地址：</span>
<div><div><div>&nbsp;<pre code_snippet_id="672528" snippet_file_name="blog_20150522_8_8589213"  code_snippet_id="672528" snippet_file_name="blog_20150522_8_8589213" name="code" class="cpp">int **vtbl = (int**)*p;</pre>
<span style="font-size:18px;">然后，通过如下语句获得虚函数表中函数的地址，并调用函数。</span>
</div></div></div></div></div></div><pre code_snippet_id="672528" snippet_file_name="blog_20150522_9_6543235"  code_snippet_id="672528" snippet_file_name="blog_20150522_9_6543235" name="code" class="cpp">FuncPtr func = (FuncPtr)*vtbl;
func();</pre>
<div><div><span style="font-size:18px;">最后，通过++vtbl可以得到函数表中下一项地址，从而遍历整个虚函数表。
</span></div><span style="font-size:18px;">
</span></div></div><div><span style="font-size:18px;">其运行结果如下图所示：</span>
<div>![](http://img.blog.csdn.net/20150522023651170?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
<div>
<div><div><span style="font-size:18px;">从上图可以看出，遍历虚函数表，并根据虚函数表中的函数地址调用函数，它先调用print函数，再调用job函数，最后调用析构函数。函数的调用顺序与Person类中的虚函数的定义顺序一致，其内存分布与第3节中的对象内存分布图相一致。从代码和运行结果，可以看出，虚函数表以NULL标志表的结束。但是虚函数表中还含有其他的数据，本人还没有清楚其作用。
</span><div><span style="font-size:18px;">
</span>



<!-- # 继承对于类的对象的内存分布的影响 -->

<div><span style="font-size:18px;color:red;">5、继承对于类的对象的内存分布的影响</span><span style="font-size:18px;">
</span><div><span style="font-size:18px;">本文并不打算详细地介绍继承对对象的内存分布的影响，也不介绍虚函数的实现机制。这里主要给出一个经过本人测试的大概的对象内存模型，由于代码较多，不一一贴出。假设所有的类都有非static的成员变量和成员函数、static的成员变量及成员函数和virtual函数。
</span><div><div><div><span style="font-size:18px;">1）单继承（只有一个父类）
类的继承关系为：class Derived : public Base</span>
</div><div>![](http://img.blog.csdn.net/20150522023659996?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
<div><span style="font-size:18px;">Derived类的对象的内存布局为：虚函数表指针、Base类的非static成员变量、Derived类的非static成员变量。

</span></div></div></div><div><div><div><span style="font-size:18px;">2）多重继承（多个父类）
类的继承关系如下：class Derived : public Base1, public Base2</span>
</div><div>![](http://img.blog.csdn.net/20150522023810465?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
<div><span style="font-size:18px;">Derived类的对象的内存布局为：基类Base1子对象和基类Base2子对象及Derived类的非static成员变量组成。基类子对象包括其虚函数表指针和其非static的成员变量。

</span></div></div></div><div><div><div><span style="font-size:18px;">3）重复继承（<span style="color:#000000;font-size: 16px;">继承的多个父类中其父类有相同的超类</span>）
</span><div><span style="font-size:18px;">类的继承关系如下：
</span><div><span style="font-size:18px;">class Base1 : public Base
</span><div><span style="font-size:18px;">class Base2:&nbsp; public Base
</span><div><span style="font-size:18px;">class Derived : public Base1, public Base2</span>
<div>![](http://img.blog.csdn.net/20150522023800275?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
<span style="font-size:18px;">Derived类的对象的内存布局与多继承相似，但是可以看到基类Base的子对象在Derived类的对象的内存中存在一份拷贝。这样直接使用Derived中基类Base的相关成员时，就会引发歧义，可使用多重虚拟继承消除之。
</span></div></div></div></div></div></div><span style="font-size:18px;">
</span></div><span style="font-size:18px;">4）<span style="color:#000000;font-size: 16px;">多重虚拟继承（使用virtual方式继承，为了保证继承后父类的内存布局只会存在一份</span>）
</span></div></div></div></div></div></div></div><div><div><span style="font-size:18px;">类的继承关系如下：
class Base1 : virtual public Base
class Base2:&nbsp; virtual public Base
class Derived : public Base1, public Base2</span>
</div><div>![](http://img.blog.csdn.net/20150530005022692?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGppYW5odWk=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
<span style="font-size:18px;">Derived类的对象的内存布局与重复继承的类的对象的内存分布类似，但是基类Base的子对象没有拷贝一份，在对象的内存中仅存在在一个Base类的子对象。但是它的非static成员变量放置在对象的末尾处。
</span></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div><div><span style="font-size:18px;">
</span></div><span style="font-size: 18px;">关于继承对对象的内存布局的影响以及虚函数的实现机制的详细介绍，请参阅——[<span style="color:#ff0000;">C++对象模型之详述C++对象的内存布局</span>](http://blog.csdn.net/ljianhui/article/details/46408645)</span>

</div>

