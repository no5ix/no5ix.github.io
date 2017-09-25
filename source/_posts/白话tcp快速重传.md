---
title: 白话TCP快速重传
date: 2017-09-23 18:11:22
tags:
- tcp
- rudp
categories:
- linux
---

> 需明确一点前提：

> 接收到失序报文段时, TCP需要立即生成确
认信息(重复ACK),并且失序情况表明在后续数据到达前出现了丢段,即接收端缓存出现
了空缺。发送端的工作即为尽快地、高效地填补该空缺。

> 当失序数据到达时,重复Ack应立即返回,不能延时发送。原因在于使发送端尽早得
知有失序报文段,并告诉其空缺在哪。

<b>两次duplicated ACK肯定是乱序造成的！</b><br><b>丢包肯定会造成三次duplicated ACK!</b><br><br>假定通信双方如下，A发送4个TCP Segment 给B，编号如下，N-1成功到达，因为A收到B的ACK(N)，其它按照到达顺序，分别收到ACK(N)的数目：<br><br>                  A ---------&gt; B<br><br><br><b>A方发送顺序</b>N-1，N，N+1，N+2<br><br><b>B方到达顺序</b><br><br>N-1，N，N+1，N+2 <br>A收到1个ACK (N)<br><br>N-1，N，N+2，N+1 <br>A收到1个ACK (N)<br><br>N-1，N+1，N，N+2 <br>A收到2个ACK (N)<br><br><b>N-1，N+1，N+2，N </b><br><b>A收到</b><b>3个ACK (N)<br></b><br>N-1，N+2，N，N+1  <br>A收到2个ACK (N)<br><br><b>N-1，N+2，N+1，N </b><br><b>A收到</b><b>3个ACK (N)</b><br><br><br><b>如果N丢了，没有到达B</b><br><br><b>N-1，N+1，N+2 </b><br><b>A收到3个ACK (N)<br><br>N-1，N+2，N+1 </b><br><b>A收到</b><b>3个ACK (N)</b><br><br><br>TCP segment 乱序 有2/5 = <b>40% 的概率</b>会造成A收到三次 duplicated ACK(N);<br><br>而如果N丢了，则会<b>100%概率</b>A会收到三次duplicated ACK(N);<br><br>基于以上的统计，当A接收到三次 duplicated ACK(N)启动 Fast Retransmit 算法是合理的，即立马retransmit N，可以起到Fast Recovery的功效，快速修复一个丢包对TCP管道的恶劣影响。<br><br>而如果A接收到二次 duplicated ACK(N)，则一定说明是乱序造成的，即然是乱序，说明 数据都到达了B，B的TCP负责重新排序而已，没有必要A再来启动Fast Retransmit算法。<br><br><br>补充阅读<br>--------------------------------------------<br><b>TCP segment 乱序的由来</b><br><br>TCP segment 封装在IP包里，如果IP包乱序，则相应TCP也会乱序，乱序的原因一般如下：<br><br><b>1）ECMP 负载均衡</b><br><br>多路径的负载均衡，基于per-packet load balance，比如 packet 1，3，5…走路径1，packet 2，4，6…走路径2，很难保证packet 1 在 packet 2 之前到达目的地。<br><br>Per-session load balance 会基于TCP五元组来负载均衡，同一个TCP会话会走同一条路径，克服多路径造成的乱序。<br><br><b>2）路由器内部流量调度</b><br><br>有些路由器采用多个流量处理单元，比如packet 1，3，5…由处理单元1来处理，packet 2，4，6…由处理单元2来处理，也很难保证packet 1 在 packet 2 之前到达目的地。<br><br>TCP接收到乱序的segment，会放在自己的接收缓冲区，等所有乱序的segment 都顺利到达，TCP重新排序，并将数据提交给 application。<br><br>乱序的segment 会占用接收缓冲区，直接造成B advertised window size 变小，造成对方A发送window 一直在变小，影响A发送效率。<br><br>即使A不快速重传，最后也会由retransmit timer timeout 超时重传，但这个时候A的发送window 非常小，发送速率也从天上掉到了地下。<br><br>----------///--------<br>在没有fast retransmit / recovery 算法之前，重传依靠发送方的retransmit timeout，就是在timeout内如果没有接收到对方的ACK，默认包丢了，发送方就重传，包的丢失原因 1）包checksum 出错 2）网络拥塞 3）网络断，包括路由重收敛，但是发送方无法判断是哪一种情况，于是采用最笨的办法，就是将自己的发送速率减半，即CWND 减为1/2，这样的方法对2是有效的，可以缓解网络拥塞，3则无所谓，反正网络断了，无论发快发慢都会被丢；但对于1来说，丢包是因为偶尔的出错引起，一丢包就对半减速不合理。于是有了fast retransmit 算法，基于在反向还可以接收到ACK，可以认为网络并没有断，否则也接收不到ACK，如果在timeout 时间内没有接收到&gt; 2 的duplicated ACK，则概率大事件为乱序，乱序无需重传，接收方会进行排序工作；而如果接收到三个或三个以上的duplicated ACK，则大概率是丢包，可以逻辑推理，发送方可以接收ACK，则网络是通的，可能是1、2造成的，先不降速，重传一次，如果接收到正确的ACK，则一切OK，流速依然（包出错被丢）。而如果依然接收到duplicated ACK，则认为是网络拥塞造成的，此时降速则比较合理。</span></div>