---
title: new和delete为什么要配对用
date: 2015-01-22 00:05:48
tags:
- new
- delete
categories:
- c++
---


<div id="article_content" class="article_content tracking-ad" data-mod=popu_307  data-dsm = "post" >

<p style="margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; margin-top:0px!important">
</p>
<p style="margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; margin-top:0px!important">
在 C&#43;&#43; 中，你也许经常使用 new 和 delete 来动态申请和释放内存，但你可曾想过以下问题呢？</p>
<ul style="padding:0px 0px 0px 30px; margin:15px 0px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<li style="">new 和 delete 是函数吗？</li><li style="">new [] 和 delete [] 又是什么？什么时候用它们？</li><li style="">你知道 operator new 和 operator delete 吗？</li><li style="">为什么 new [] 出来的数组有时可以用 delete 释放有时又不行？</li><li style="">…</li></ul>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
如果你对这些问题都有疑问的话，不妨看看我这篇文章。</p>

<!-- <h2 style="margin:1em 0px 15px; line-height:1.7; font-size:2em; padding:0px; position:relative; border-bottom-width:1px; border-bottom-style:solid; border-bottom-color:rgb(238,238,238); color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif">
new 和 delete 到底是什么？</h2> -->

## new 和 delete 到底是什么

<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
如果找工作的同学看一些面试的书，我相信都会遇到这样的题：sizeof 不是函数，然后举出一堆的理由来证明 sizeof 不是函数。在这里，和 sizeof 类&#20284;，new 和 delete 也不是函数，它们都是 C&#43;&#43; 定义的关键字，通过特定的语法可以组成表达式。和 sizeof 不同的是，sizeof 在编译时候就可以确定其返回&#20540;，new 和 delete 背后的机制则比较复杂。<br style="">
继续往下之前，请你想想你认为 new 应该要做些什么？也许你第一反应是，new 不就和 C 语言中的 malloc 函数一样嘛，就用来动态申请空间的。你答对了一半，看看下面语句：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="n" style="">string</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">ps</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="n" style="">string</span><span class="p" style="">(</span><span class="s" style="color:rgb(221,17,68)">&quot;hello world&quot;</span><span class="p" style="">);</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
你就可以看出 new 和 malloc 还是有点不同的，malloc 申请完空间之后不会对内存进行必要的初始化，而 new 可以。所以&nbsp;<span style="">new&nbsp;<span style="">expression</span></span>&nbsp;背后要做的事情不是你想象的那么简单。在我用实例来解释 new 背后的机制之前，你需要知道&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">operator
 new</code>&nbsp;和&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">operator
 delete</code>&nbsp;是什么玩意。</p>

<!-- <h2 style="margin:1em 0px 15px; line-height:1.7; font-size:2em; padding:0px; position:relative; border-bottom-width:1px; border-bottom-style:solid; border-bottom-color:rgb(238,238,238); color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif">
operator new 和 operator delete</h2> -->

## operator new 和 operator delete

<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这两个其实是 C&#43;&#43; 语言标准库的库函数，原型分别如下：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="kt" style="color:rgb(68,85,136); font-weight:bold">void</span> <span class="o" style="font-weight:bold">*</span><span class="k" style="font-weight:bold">operator</span> <span class="nf" style="color:rgb(153,0,0); font-weight:bold">new</span><span class="p" style="">(</span><span class="kt" style="color:rgb(68,85,136); font-weight:bold">size_t</span><span class="p" style="">);</span>     <span class="c1" style="color:rgb(153,153,136); font-style:italic">//allocate an object</span>
<span class="kt" style="color:rgb(68,85,136); font-weight:bold">void</span> <span class="o" style="font-weight:bold">*</span><span class="k" style="font-weight:bold">operator</span> <span class="nf" style="color:rgb(153,0,0); font-weight:bold">delete</span><span class="p" style="">(</span><span class="kt" style="color:rgb(68,85,136); font-weight:bold">void</span> <span class="o" style="font-weight:bold">*</span><span class="p" style="">);</span>    <span class="c1" style="color:rgb(153,153,136); font-style:italic">//free an object</span>

<span class="kt" style="color:rgb(68,85,136); font-weight:bold">void</span> <span class="o" style="font-weight:bold">*</span><span class="k" style="font-weight:bold">operator</span> <span class="k" style="font-weight:bold">new</span><span class="p" style="">[](</span><span class="kt" style="color:rgb(68,85,136); font-weight:bold">size_t</span><span class="p" style="">);</span>     <span class="c1" style="color:rgb(153,153,136); font-style:italic">//allocate an array</span>
<span class="kt" style="color:rgb(68,85,136); font-weight:bold">void</span> <span class="o" style="font-weight:bold">*</span><span class="k" style="font-weight:bold">operator</span> <span class="k" style="font-weight:bold">delete</span><span class="p" style="">[](</span><span class="kt" style="color:rgb(68,85,136); font-weight:bold">void</span> <span class="o" style="font-weight:bold">*</span><span class="p" style="">);</span>    <span class="c1" style="color:rgb(153,153,136); font-style:italic">//free an array</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
后面两个你可以先不看，后面再介绍。前面两个均是 C&#43;&#43; 标准库函数，你可能会觉得这是函数吗？请不要怀疑，这就是函数！<span style=""><span style="">C&#43;&#43; Primer</span></span>&nbsp;一书上说这不是重载 new 和 delete 表达式（如&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">operator=</code>&nbsp;就是重载&nbsp;<span style="">=</span>&nbsp;操作符），因为
 new 和 delete 是不允许重载的。但我还没搞清楚为什么要用 operator new 和 operator delete 来命名，比较费解。我们只要知道它们的意思就可以了，这两个函数和 C 语言中的 malloc 和 free 函数有点像了，都是用来申请和释放内存的，并且 operator new 申请内存之后不对内存进行初始化，直接返回申请内存的指针。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
我们可以直接在我们的程序中使用这几个函数。</p>

## new 和 delete 背后机制

<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
知道上面两个函数之后，我们用一个实例来解释 new 和 delete 背后的机制：</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
我们不用简单的 C&#43;&#43; 内置类型来举例，使用复杂一点的类类型，定义一个类 A：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">class</span> <span class="nc" style="color:rgb(68,85,136); font-weight:bold">A</span>
<span class="p" style="">{</span>
<span class="nl" style="">public:</span>
    <span class="n" style="">A</span><span class="p" style="">(</span><span class="kt" style="color:rgb(68,85,136); font-weight:bold">int</span> <span class="n" style="">v</span><span class="p" style="">)</span> <span class="o" style="font-weight:bold">:</span> <span class="n" style="">var</span><span class="p" style="">(</span><span class="n" style="">v</span><span class="p" style="">)</span>
    <span class="p" style="">{</span>
        <span class="n" style="">fopen_s</span><span class="p" style="">(</span><span class="o" style="font-weight:bold">&amp;</span><span class="n" style="">file</span><span class="p" style="">,</span> <span class="s" style="color:rgb(221,17,68)">&quot;test&quot;</span><span class="p" style="">,</span> <span class="s" style="color:rgb(221,17,68)">&quot;r&quot;</span><span class="p" style="">);</span>
    <span class="p" style="">}</span>
    <span class="o" style="font-weight:bold">~</span><span class="n" style="">A</span><span class="p" style="">()</span>
    <span class="p" style="">{</span>
        <span class="n" style="">fclose</span><span class="p" style="">(</span><span class="n" style="">file</span><span class="p" style="">);</span>
    <span class="p" style="">}</span>

<span class="nl" style="">private:</span>
    <span class="kt" style="color:rgb(68,85,136); font-weight:bold">int</span> <span class="n" style="">var</span><span class="p" style="">;</span>
    <span class="kt" style="color:rgb(68,85,136); font-weight:bold">FILE</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">file</span><span class="p" style="">;</span>
<span class="p" style="">};</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
很简单，类 A 中有两个私有成员，有一个构造函数和一个析构函数，构造函数中初始化私有变量 var 以及打开一个文件，析构函数关闭打开的文件。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
我们使用</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">class</span> <span class="err" style="color:rgb(166,23,23); background-color:rgb(227,210,210)">*</span><span class="nc" style="color:rgb(68,85,136); font-weight:bold">pA</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="n" style="">A</span><span class="p" style="">(</span><span class="mi" style="color:rgb(0,153,153)">10</span><span class="p" style="">);</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
来创建一个类的对象，返回其指针 pA。如下图所示 new 背后完成的工作：</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<a target="_blank" target="_blank" href="https://github-camo.global.ssl.fastly.net/48182649501319d27121ede912b19be491b1b0a2/687474703a2f2f692e696d6775722e636f6d2f454a736e6b4a342e6a7067" style="color:rgb(65,131,196); text-decoration:none"><img src="https://github-camo.global.ssl.fastly.net/48182649501319d27121ede912b19be491b1b0a2/687474703a2f2f692e696d6775722e636f6d2f454a736e6b4a342e6a7067" alt="" style="border:0px; max-width:100%"></a></p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
简单总结一下：</p>
<ol style="padding:0px 0px 0px 30px; margin:15px 0px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<li style="">首先需要调用上面提到的 operator new 标准库函数，传入的参数为 class A 的大小，这里为 8 个字节，至于为什么是 8 个字节，你可以看看《深入 C&#43;&#43; 对象模型》一书，这里不做多解释。这样函数返回的是分配内存的起始地址，这里假设是 0x007da290。</li><li style="">上面分配的内存是未初始化的，也是未类型化的，第二步就在这一块原始的内存上对类对象进行初始化，调用的是相应的构造函数，这里是调用&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">A:A(10);</code>&nbsp;这个函数，从图中也可以看到对这块申请的内存进行了初始化，<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">var=10,
 file 指向打开的文件</code>。</li><li style="">最后一步就是返回新分配并构造好的对象的指针，这里 pA 就指向 0x007da290 这块内存，pA 的类型为类 A 对象的指针。</li></ol>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
所有这三步，你都可以通过反汇编找到相应的汇编代码，在这里我就不列出了。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
好了，那么 delete 都干了什么呢？还是接着上面的例子，如果这时想释放掉申请的类的对象怎么办？当然我们可以使用下面的语句来完成：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">delete</span> <span class="n" style="">pA</span><span class="p" style="">;</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
delete 所做的事情如下图所示：</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<a target="_blank" target="_blank" href="https://github-camo.global.ssl.fastly.net/8bfb4701b5c270dc3b27c86bce57f2d31562d82f/687474703a2f2f692e696d6775722e636f6d2f3156767239467a2e6a7067" style="color:rgb(65,131,196); text-decoration:none"><img src="https://github-camo.global.ssl.fastly.net/8bfb4701b5c270dc3b27c86bce57f2d31562d82f/687474703a2f2f692e696d6775722e636f6d2f3156767239467a2e6a7067" alt="" style="border:0px; max-width:100%"></a></p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
delete 就做了两件事情：</p>
<ol style="padding:0px 0px 0px 30px; margin:15px 0px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<li style="">调用 pA 指向对象的析构函数，对打开的文件进行关闭。</li><li style="">通过上面提到的标准库函数 operator delete 来释放该对象的内存，传入函数的参数为 pA 的&#20540;，也就是 0x007d290。</li></ol>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
好了，解释完了 new 和 delete 背后所做的事情了，是不是觉得也很简单？不就多了一个构造函数和析构函数的调用嘛。</p>

<!-- <h2 style="margin:1em 0px 15px; line-height:1.7; font-size:2em; padding:0px; position:relative; border-bottom-width:1px; border-bottom-style:solid; border-bottom-color:rgb(238,238,238); color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif">
如何申请和释放一个数组？</h2> -->

## 如何申请和释放一个数组？

<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
我们经常要用到动态分配一个数组，也许是这样的：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="n" style="">string</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">psa</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="n" style="">string</span><span class="p" style="">[</span><span class="mi" style="color:rgb(0,153,153)">10</span><span class="p" style="">];</span>      <span class="c1" style="color:rgb(153,153,136); font-style:italic">//array of 10 empty strings</span>
<span class="kt" style="color:rgb(68,85,136); font-weight:bold">int</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">pia</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="kt" style="color:rgb(68,85,136); font-weight:bold">int</span><span class="p" style="">[</span><span class="mi" style="color:rgb(0,153,153)">10</span><span class="p" style="">];</span>           <span class="c1" style="color:rgb(153,153,136); font-style:italic">//array of 10 uninitialized ints</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
上面在申请一个数组时都用到了&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">new
 []</code>&nbsp;这个表达式来完成，按照我们上面讲到的 new 和 delete 知识，第一个数组是 string 类型，分配了保存对象的内存空间之后，将调用 string 类型的默认构造函数依次初始化数组中每个元素；第二个是申请具有内置类型的数组，分配了存储 10 个 int 对象的内存空间，但并没有初始化。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
如果我们想释放空间了，可以用下面两条语句：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">delete</span> <span class="p" style="">[]</span> <span class="n" style="">psa</span><span class="p" style="">;</span>
<span class="k" style="font-weight:bold">delete</span> <span class="p" style="">[]</span> <span class="n" style="">pia</span><span class="p" style="">;</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
都用到&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">delete
 []</code>&nbsp;表达式，注意这地方的 [] 一般情况下不能漏掉！我们也可以想象这两个语句分别干了什么：第一个对 10 个 string 对象分别调用析构函数，然后再释放掉为对象分配的所有内存空间；第二个因为是内置类型不存在析构函数，直接释放为 10 个 int 型分配的所有内存空间。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这里对于第一种情况就有一个问题了：<span style=""><strong>我们如何知道 psa 指向对象的数组的大小？怎么知道调用几次析构函数？</strong></span></p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这个问题直接导致我们需要在 new [] 一个对象数组时，需要保存数组的维度，C&#43;&#43; 的做法是在分配数组空间时多分配了 4 个字节的大小，专门保存数组的大小，在 delete [] 时就可以取出这个保存的数，就知道了需要调用析构函数多少次了。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
还是用图来说明比较清楚，我们定义了一个类 A，但不具体描述类的内容，这个类中有显示的构造函数、析构函数等。那么 当我们调用</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">class</span> <span class="nc" style="color:rgb(68,85,136); font-weight:bold">A</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">pAa</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="n" style="">A</span><span class="p" style="">[</span><span class="mi" style="color:rgb(0,153,153)">3</span><span class="p" style="">];</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
时需要做的事情如下：</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<a target="_blank" target="_blank" href="https://github-camo.global.ssl.fastly.net/1a2da83d54ac0110f8cdb13a6645dd5f9240e760/687474703a2f2f692e696d6775722e636f6d2f366857304431702e6a7067" style="color:rgb(65,131,196); text-decoration:none"><img src="https://github-camo.global.ssl.fastly.net/1a2da83d54ac0110f8cdb13a6645dd5f9240e760/687474703a2f2f692e696d6775722e636f6d2f366857304431702e6a7067" alt="" style="border:0px; max-width:100%"></a></p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
从这个图中我们可以看到申请时在数组对象的上面还多分配了 4 个字节用来保存数组的大小，但是最终返回的是对象数组的指针，而不是所有分配空间的起始地址。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这样的话，释放就很简单了：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">delete</span> [] <span class="n" style="">pAa</span><span class="p" style="">;</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<a target="_blank" target="_blank" href="https://github-camo.global.ssl.fastly.net/db76cce60aaa6f0ad3ab65cd00b0ca26a5271547/687474703a2f2f692e696d6775722e636f6d2f3155425444316c2e6a7067" style="color:rgb(65,131,196); text-decoration:none"><img src="https://github-camo.global.ssl.fastly.net/db76cce60aaa6f0ad3ab65cd00b0ca26a5271547/687474703a2f2f692e696d6775722e636f6d2f3155425444316c2e6a7067" alt="" style="border:0px; max-width:100%"></a></p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这里要注意的两点是：</p>
<ul style="padding:0px 0px 0px 30px; margin:15px 0px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<li style="">调用析构函数的次数是从数组对象指针前面的 4 个字节中取出；</li><li style="">传入&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">operator
 delete[]</code>&nbsp;函数的参数不是数组对象的指针 pAa，而是 pAa 的&#20540;减 4。</li></ul>

<p> </p>

## 为什么 new/delete 、new []/delete[] 要配对使用？

<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
其实说了这么多，还没到我写这篇文章的最原始意图。从上面解释的你应该懂了 new/delete、new[]/delete[] 的工作原理了，因为它们之间有差别，所以需要配对使用。但偏偏问题不是这么简单，这也是我遇到的问题，如下这段代码：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="kt" style="color:rgb(68,85,136); font-weight:bold">int</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">pia</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="kt" style="color:rgb(68,85,136); font-weight:bold">int</span><span class="p" style="">[</span><span class="mi" style="color:rgb(0,153,153)">10</span><span class="p" style="">];</span>
<span class="k" style="font-weight:bold">delete</span> <span class="p" style="">[]</span><span class="n" style="">pia</span><span class="p" style="">;</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这肯定是没问题的，但如果把&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">delete
 []pia;</code>&nbsp;换成&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">delete
 pia;</code>&nbsp;的话，会出问题吗？</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这就涉及到上面一节没提到的问题了。上面我提到了在&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">new
 []</code>&nbsp;时多分配 4 个字节的缘由，因为析构时需要知道数组的大小，但如果不调用析构函数呢（如内置类型，这里的 int 数组）？我们在&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">new
 []</code>&nbsp;时就没必要多分配那 4 个字节， delete [] 时直接到第二步释放为 int 数组分配的空间。如果这里使用&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">delete
 pia;</code>那么将会调用&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">operator
 delete</code>&nbsp;函数，传入的参数是分配给数组的起始地址，所做的事情就是释放掉这块内存空间。不存在问题的。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
这里说的使用&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">new
 []</code>&nbsp;用 delete 来释放对象的提前是：对象的类型是内置类型或者是无自定义的析构函数的类类型！</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
我们看看如果是带有自定义析构函数的类类型，用&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">new
 []</code>&nbsp;来创建类对象数组，而用 delete 来释放会发生什么？用上面的例子来说明：</p>
<div class="highlight highlight-cpp" style="color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px; overflow:visible!important">
<pre style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:13px; margin-top:15px; margin-bottom:15px; background-color:rgb(248,248,248); border:1px solid rgb(221,221,221); line-height:19px; overflow:auto; padding:6px 10px; word-wrap:normal"><span class="k" style="font-weight:bold">class</span> <span class="nc" style="color:rgb(68,85,136); font-weight:bold">A</span> <span class="o" style="font-weight:bold">*</span><span class="n" style="">pAa</span> <span class="o" style="font-weight:bold">=</span> <span class="k" style="font-weight:bold">new</span> <span class="k" style="font-weight:bold">class</span> <span class="nc" style="color:rgb(68,85,136); font-weight:bold">A</span><span class="p" style="">[</span><span class="mi" style="color:rgb(0,153,153)">3</span><span class="p" style="">];</span>
<span class="k" style="font-weight:bold">delete</span> <span class="n" style="">pAa</span><span class="p" style="">;</span>
</pre>
</div>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
那么&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">delete
 pAa;</code>&nbsp;做了两件事：</p>
<ul style="padding:0px 0px 0px 30px; margin:15px 0px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
<li style="">调用一次 pAa 指向的对象的析构函数；</li><li style="">调用&nbsp;<span style=""><code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">operator
 delete(pAa);</code></span>&nbsp;释放内存。</li></ul>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
显然，这里只对数组的第一个类对象调用了析构函数，后面的两个对象均没调用析构函数，如果类对象中申请了大量的内存需要在析构函数中释放，而你却在销毁数组对象时少调用了析构函数，这会造成内存泄漏。</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
上面的问题你如果说没关系的话，那么第二点就是致命的了！直接释放 pAa 指向的内存空间，这个总是会造成严重的段错误，程序必然会奔溃！因为分配的空间的起始地址是 pAa 指向的地方减去 4 个字节的地方。你应该传入参数设为那个地址！</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
同理，你可以分析如果使用 new 来分配，用&nbsp;<code style="font-family:Consolas,'Liberation Mono',Courier,monospace; font-size:12px; margin:0px; border:1px solid rgb(221,221,221); background-color:rgb(248,248,248); max-width:100%; display:inline-block; overflow:auto; vertical-align:middle; line-height:1.3; padding:0px; white-space:nowrap">delete
 []</code>&nbsp;来释放会出现什么问题？是不是总会导致程序错误？</p>
<p style="margin-top:15px; margin-bottom:15px; color:rgb(51,51,51); font-family:Helvetica,arial,freesans,clean,sans-serif; font-size:14px; line-height:23.799999237060547px">
总的来说，记住一点即可：<span style=""><strong>new/delete、new[]/delete[] 要配套使用总是没错的！</strong></span></p>
