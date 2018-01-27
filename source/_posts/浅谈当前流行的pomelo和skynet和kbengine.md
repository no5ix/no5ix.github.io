---
title: 浅谈当前流行的pomelo和skynet和kbengine
date: 2016-08-01 15:54:47
tags:
- skynet
- pomelo
- kbengine
categories:
- server
---

根据之前的博文 {% post_link 服务端常用架构一 服务端常用架构 %}


## 网易pomelo 

属于第二代游戏服务端五型的架构，即图7的架构。
 
## skynet

因为是一个服务端框架，官方只是提供了login server 和 gate 

... <!-- more -->

server的参考实现，其他的需要自己来实现，编程的自由度变大了，架构完全取决于程序员自己的选择，程序员可以自己尝试去实现第二代的架构，也可以实现第三代的架构。注意: skynet仅仅是框架，其他属于完整解决方案。
 
## Kbengine

属于第三代服务端框架，可能类似于图10。（这个理解不确定）
Kbengine引擎应该是对图10中的Gate服务器和NODE和OBJ进行了细分。在功能上大体划分为与位置有关（在Kbengine中称为Cellapp）和与位置无关（在Kbengine中称为Baseapp）。类似于下面的示图架构。

{% asset_img image001.png %}