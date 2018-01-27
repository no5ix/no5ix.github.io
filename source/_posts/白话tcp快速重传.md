---
title: 白话TCP快速重传
date: 2017-09-23 18:11:22
tags: [tcp, udp]
categories: 
- linux
---

# 快速重传算法概绍

在收到一个失序的报文段时，  TCP立即需要产生一个ACK(一个重复的ACK)。这个重复的ACK不应该被迟延。该重复的ACK的曰的在于让对方知道收到一个失序的报文段，并告诉对方自己希望收到的序号。

由于我们不知道一个重复的ACK足由一个丢失的报文段引起的，还是由于仅仅出现了几个报文段的重新排序，因此我们等待少量重复的ACK到来。假如这只是一些报文段的重新排序，则在重新排序的报文段被处理并产生一个新的ACK之前，只可能产生1～2个重复的ACK。
如果一连串收到3个或3个以上的重复ACK，就非常可能足一个报文段丢失了。于足我们就重传丢失的数据报文段，而无需等待超时定时器溢出。这就是**快速重传算法**。接下来执行的不是慢启动算法而是{% post_link tcp拥塞控制之慢启动和拥塞避免 拥塞避免算法 %}。这就是**快速恢复算法。**
    
在这种情况下没有执行慢启动的原因是由于收到重复的ACK不仅仅告诉我们一个分组丢失了。由于接收方只有在收到另一个报文段耐才会产生重复的ACK，而该报文段已经离开了网络并进入了接收方的缓存。
也就是说，在收发两端之问仍然有流动的数据，而我们不想执行慢启动来突然减少数据流。

... <!-- more --> 

# 为什么是3个重复ACK之后就要重传?

<b>两次duplicated ACK肯定是乱序造成的！</b><br><b>丢包肯定会造成三次duplicated ACK!</b><br><br>假定通信双方如下，A发送4个TCP Segment 给B，编号如下，N-1成功到达，因为A收到B的ACK(N)，其它按照到达顺序，分别收到ACK(N)的数目：<br><br>                  A ---------&gt; B<br><br><br><b>A方发送顺序</b>N-1，N，N+1，N+2<br><br><b>B方到达顺序</b><br><br>N-1，N，N+1，N+2 <br>A收到1个ACK (N)<br><br>N-1，N，N+2，N+1 <br>A收到1个ACK (N)<br><br>N-1，N+1，N，N+2 <br>A收到2个ACK (N)<br><br><b>N-1，N+1，N+2，N </b><br><b>A收到</b><b>3个ACK (N)<br></b><br>N-1，N+2，N，N+1  <br>A收到2个ACK (N)<br><br><b>N-1，N+2，N+1，N </b><br><b>A收到</b><b>3个ACK (N)</b><br><br><br><b>如果N丢了，没有到达B</b><br><br><b>N-1，N+1，N+2 </b><br><b>A收到3个ACK (N)<br><br>N-1，N+2，N+1 </b><br><b>A收到</b><b>3个ACK (N)</b><br><br><br>TCP segment 乱序 有2/5 = <b>40% 的概率</b>会造成A收到三次 duplicated ACK(N);<br><br>而如果N丢了，则会<b>100%概率</b>A会收到三次duplicated ACK(N);<br><br>基于以上的统计，当A接收到三次 duplicated ACK(N)启动 Fast Retransmit 算法是合理的，即立马retransmit N，可以起到Fast Recovery的功效，快速修复一个丢包对TCP管道的恶劣影响。<br><br>而如果A接收到二次 duplicated ACK(N)，则一定说明是乱序造成的，即然是乱序，说明 数据都到达了B，B的TCP负责重新排序而已，没有必要A再来启动Fast Retransmit算法。<br><br><br>补充阅读<br>--------------------------------------------<br><b>TCP segment 乱序的由来</b><br><br>TCP segment 封装在IP包里，如果IP包乱序，则相应TCP也会乱序，乱序的原因一般如下：<br><br><b>1）ECMP 负载均衡</b><br><br>多路径的负载均衡，基于per-packet load balance，比如 packet 1，3，5…走路径1，packet 2，4，6…走路径2，很难保证packet 1 在 packet 2 之前到达目的地。<br><br>Per-session load balance 会基于TCP五元组来负载均衡，同一个TCP会话会走同一条路径，克服多路径造成的乱序。<br><br><b>2）路由器内部流量调度</b><br><br>有些路由器采用多个流量处理单元，比如packet 1，3，5…由处理单元1来处理，packet 2，4，6…由处理单元2来处理，也很难保证packet 1 在 packet 2 之前到达目的地。<br><br>TCP接收到乱序的segment，会放在自己的接收缓冲区，等所有乱序的segment 都顺利到达，TCP重新排序，并将数据提交给 application。<br><br>乱序的segment 会占用接收缓冲区，直接造成B advertised window size 变小，造成对方A发送window 一直在变小，影响A发送效率。<br><br>即使A不快速重传，最后也会由retransmit timer timeout 超时重传，但这个时候A的发送window 非常小，发送速率也从天上掉到了地下。<br><br>----------///--------<br>在没有fast retransmit / recovery 算法之前，重传依靠发送方的retransmit timeout，就是在timeout内如果没有接收到对方的ACK，默认包丢了，发送方就重传，包的丢失原因 1）包checksum 出错 2）网络拥塞 3）网络断，包括路由重收敛，但是发送方无法判断是哪一种情况，于是采用最笨的办法，就是将自己的发送速率减半，即CWND 减为1/2，这样的方法对2是有效的，可以缓解网络拥塞，3则无所谓，反正网络断了，无论发快发慢都会被丢；但对于1来说，丢包是因为偶尔的出错引起，一丢包就对半减速不合理。于是有了fast retransmit 算法，基于在反向还可以接收到ACK，可以认为网络并没有断，否则也接收不到ACK，如果在timeout 时间内没有接收到&gt; 2 的duplicated ACK，则概率大事件为乱序，乱序无需重传，接收方会进行排序工作；而如果接收到三个或三个以上的duplicated ACK，则大概率是丢包，可以逻辑推理，发送方可以接收ACK，则网络是通的，可能是1、2造成的，先不降速，重传一次，如果接收到正确的ACK，则一切OK，流速依然（包出错被丢）。而如果依然接收到duplicated ACK，则认为是网络拥塞造成的，此时降速则比较合理。</span></div>