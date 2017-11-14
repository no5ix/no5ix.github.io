---
title: next的文章使用自定义的css
date: 2017-11-14 23:42:44
tags:
- next
categories:
- 杂
---



<p>  今天，创建自己的about页面的时候，像使用自定义的css样式，就像这是不是NexT可以使用自定义的CSS样式，片尝试了一下，还是可以的，因为markdown支持html标签，使用自定义的CSS样式还是不错的。下面总结一下具体的使用过程：</p>
<h2 id="添加样式支持"><a href="#添加样式支持" class="headerlink" title="添加样式支持"></a>添加样式支持</h2><p>  为了不吧原先的像是文件搞得太乱，这里，添加子集的样式文件。<br>  首先，在样式文件的<code>source</code>文件夹下找到<code>css</code>文件夹，打开<code>main.styl</code>文件，在最后添加：</p>
<figure class="highlight plain"><table><tr><td class="gutter"><pre><div class="line">1</div><div class="line">2</div><div class="line">3</div></pre></td><td class="code"><pre><div class="line">//My Layer</div><div class="line">//--------------------------------------------------</div><div class="line">@import &quot;_my/mycss&quot;;</div></pre></td></tr></table></figure>
<h2 id="新建自定义样式"><a href="#新建自定义样式" class="headerlink" title="新建自定义样式"></a>新建自定义样式</h2><p>找到样式文件夹<code>css</code> 新建<code>_my</code>文件夹，在其中新建<code>mycss.styl</code>文件，之后就可以按照stylus的格式自定义样式了。</p>
<h2 id="例子"><a href="#例子" class="headerlink" title="例子"></a>例子</h2><p>例如：我想在文章中添加个自定义样式的按钮，怎么做呢？？？</p>
<p>打开新建的<code>mycss.styl</code>文件，在其中添加样式：</p>
<figure class="highlight plain"><table><tr><td class="gutter"><pre><div class="line">1</div><div class="line">2</div><div class="line">3</div><div class="line">4</div><div class="line">5</div><div class="line">6</div><div class="line">7</div><div class="line">8</div><div class="line">9</div><div class="line">10</div><div class="line">11</div><div class="line">12</div><div class="line">13</div><div class="line">14</div><div class="line">15</div><div class="line">16</div><div class="line">17</div><div class="line">18</div><div class="line">19</div><div class="line">20</div><div class="line">21</div></pre></td><td class="code"><pre><div class="line">.myButton &#123;</div><div class="line">    background-color:#0f94bd;</div><div class="line">    -moz-border-radius:15px;</div><div class="line">    -webkit-border-radius:15px;</div><div class="line">    border-radius:15px;</div><div class="line">    display:inline-block;</div><div class="line">    cursor:pointer;</div><div class="line">    color:#ffffff;</div><div class="line">    font-family:Arial;</div><div class="line">    font-size:17px;</div><div class="line">    padding:11px 27px;</div><div class="line">    text-decoration:none;</div><div class="line">    text-shadow:0px 1px 0px #2f6627;</div><div class="line">&#125;</div><div class="line">.myButton:hover &#123;</div><div class="line">    background-color:#5cbf2a;</div><div class="line">&#125;</div><div class="line">.myButton:active &#123;</div><div class="line">    position:relative;</div><div class="line">    top:1px;</div><div class="line">&#125;</div></pre></td></tr></table></figure>
<p>(ps:这里直接使用的css的格式写的，因为css的代码在网上很好找到，而stylus预处理器的就不那么容易找到了，stylus一样支持css格式，所以在这里直接使用了css文件，没有写成stylus语法。其实让我写我也不会，哈哈！)<br>  引用：在想要引用的时候添加<br><figure class="highlight plain"><table><tr><td class="gutter"><pre><div class="line">1</div></pre></td><td class="code"><pre><div class="line">&lt;a href=&quot;#&quot; class=&quot;myButton&quot;&gt;MyButton&lt;/a&gt;</div></pre></td></tr></table></figure></p>

具体示例可参考本博客内的{% post_link 游戏网络开发二之数据的发送与接收 此篇文章 %}, 
此文中的代码段样式都是用Gad的两个css控制的,
所以跟我其他文章的代码段样式都不同.