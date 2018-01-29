---
title: 两个例子对比理解Actor模型
date: 2017-11-25 15:45:58
tags:
- Actor
categories:
- Server
---

# Actor模型介绍

Actor模式是一种并发模型，与另一种模型共享内存完全相反，Actor模型share nothing。所有的线程(或进程)通过消息传递的方式进行合作，这些线程(或进程)称为Actor。共享内存更适合单机多核的并发编程，而且共享带来的问题很多，编程也困难。

随着多核时代和分布式系统的到来，共享模型已经不太适合并发编程，因此几十年前就已经出现的Actor模型又重新受到了人们的重视。MapReduce就是一种典型的Actor模式，而在语言级对Actor支持的编程语言Erlang又重新火了起来，Scala也提供了Actor，但是并不是在语言层面支持，Java也有第三方的Actor包，Go语言channel机制也是一种类Actor模型。

Actor的基础就是消息传递, Actor由状态(state)、行为(Behavior)和邮箱(mailBox)三部分组成 : 

- 状态(state)：Actor中的状态指的是Actor对象的变量信息，状态由Actor自己管理，避免了并发环境下的锁和内存原子性等问题
- 行为(Behavior)：行为指定的是Actor中计算逻辑，通过Actor接收到消息来改变Actor的状态
- 邮箱(mailBox)：邮箱是Actor和Actor之间的通信桥梁，邮箱内部通过FIFO消息队列来存储发送方Actor消息，接受方Actor从邮箱队列中获取消息

<!-- more -->

# 使用Actor模型的好处

- 事件模型驱动--Actor之间的通信是异步的，即使Actor在发送消息后也无需阻塞或者等待就能够处理其他事情
- 强隔离性--Actor中的方法不能由外部直接调用，所有的一切都通过消息传递进行的，从而避免了Actor之间的数据共享，想要
- 观察到另一个Actor的状态变化只能通过消息传递进行询问
- 位置透明--无论Actor地址是在本地还是在远程机上对于代码来说都是一样的
- 轻量性--Actor是非常轻量的计算单机，单个Actor仅占400多字节，只需少量内存就能达到高并发


<h1 id="单线程编程">单线程编程</h1>

<hr /><p>单核单机时代一般都是单线程编程，如果把程序比作一个工厂，那么只有一个工人，这个工人负责所有的事情，所有的原料，工具产品等都放到一个地方，因为只有一个人，因此使用一套工具就行，取原料也不用排队等。<a href="http://s3.51cto.com/wyfs02/M00/6E/FA/wKioL1WOK1TARuclAADkQl8bN5U550.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M00/6E/FA/wKioL1WOK1TARuclAADkQl8bN5U550.jpg" style="width:555px;height:566px;" title="123.jpg" alt="wKioL1WOK1TARuclAADkQl8bN5U550.jpg" border="0" height="566" hspace="0" vspace="0" width="555" /></a><br /><span style="font-size:24px;"></span></p><p><br /></p><p>


<h1 id="多线程编程-共享内存">多线程编程-共享内存</h1>

</p><hr /><p>到了多核时代，有多个工人，这些工人共同使用一个仓库和车间，干什么都要排队。比如我要从一块钢料切出一块来用，我得等别人先用完。有个扳手，另一个人在用，我得等他用完。两个人都要用一个切割机从一块钢材切一块钢铁下来用，但是一个人拿到了钢材，一个人拿到了切割机，他们互相都不退让，结果谁都干不了活。<br /></p><p><a href="http://s3.51cto.com/wyfs02/M00/6E/FD/wKiom1WOKpHgGDoXAAFY8MuvOgA842.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M00/6E/FD/wKiom1WOKpHgGDoXAAFY8MuvOgA842.jpg" title="1234.jpg" alt="wKiom1WOKpHgGDoXAAFY8MuvOgA842.jpg" style="width:555px;height:555px;" border="0" height="555" hspace="0" vspace="0" width="555" /></a></p><p>假如现在有一个任务，找100000以内的素数的个数，最多使用是个线程，如果用共享内存的方法，可以用下面的代码实现。可以看到，这些线程共享了currentNum和totalPrimeCount，对它们做操作时必须上锁。</p>

``` java
public class PrimeCount implements Runnable {
    
    private int currentNum = 2;  //从2开始找
    private int totalPrimeCount = 0; //当前已经找到的
     
    //取一个数，不能重复，最大到100000
    private int incrCurrentNum() { 
        synchronized (this) {     //如果不用锁，必然会出错。
            if(currentNum > 100000) {
                return -1;
            } else {
                int result = currentNum;
                currentNum++;
                return result;
            }  
        }
    }
     
   //把某个线程找到的素数个数加上
    private void accPrimeCount(int count) { 
        synchronized (this) {
            totalPrimeCount += count;
        }
    }
     
    @Override
     //一直取数并判断是否为素数，取不到了就把找到的个数累加
    public void run() { 
        int primeCount = 0;
        int num;
        while((num=incrCurrentNum()) != -1) {
            if(isPrime(num)) {
                primeCount++;
            }
        }
        accPrimeCount(primeCount);
    }
    private boolean isPrime(int num) {
        for(int i = 2; i < num; i++) {
            if(num % i == 0) {
                return false;
            }
        }
        return true;
    } 
     
    @SuppressWarnings("static-access")
    public static void main(String[] args){
        PrimeCount pc = new PrimeCount();
        for(int i = 0; i < 10; i++) {
            new Thread(pc).start();
        }
        try {
            Thread.currentThread().sleep(5000);
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        System.out.println(pc.getTotalPrimeCount());
    }
     
    public int getTotalPrimeCount() {
        return totalPrimeCount;
    }
  
}
```

<p><br /></p><p>


<h1 id="多线程/分布式编程-Actor模型">多线程/分布式编程-Actor模型</h1>

</p><hr /><p>到了分布式系统时代，工厂已经用流水线了，每个人都有明确分工，这就是Actor模式。每个线程都是一个Actor，这些Actor不共享任何内存，所有的数据都是通过消息传递的方式进行的。<br /></p><p><a href="http://s3.51cto.com/wyfs02/M00/6E/FD/wKiom1WOKyPBDRjpAAGSeStUphQ651.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M00/6E/FD/wKiom1WOKyPBDRjpAAGSeStUphQ651.jpg" title="12345.jpg" alt="wKiom1WOKyPBDRjpAAGSeStUphQ651.jpg" style="width:600px;height:317px;" border="0" height="317" hspace="0" vspace="0" width="600" /></a></p><p><br /></p><p>如果用Actor模型实现统计素数个数，那么我们需要1个actor做原料的分发，就是提供要处理的整数，然后10个actor加工，每次从分发actor那里拿一个整数进行加工，最终把加工出来的半成品发给组装actor，组装actor把10个加工actor的结果汇总输出。</p><p>用scala实现，下面是工程的结构：</p><p><a href="http://s3.51cto.com/wyfs02/M01/6F/74/wKioL1WdJcqjpAFzAAD5VFWMxWE737.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M01/6F/74/wKioL1WdJcqjpAFzAAD5VFWMxWE737.jpg" style="float:none;" title="选区_014.png" alt="wKioL1WdJcqjpAFzAAD5VFWMxWE737.jpg" /></a></p><p>这是它们传递的消息，有一些指令，剩下的都是Int数据:</p><p><a href="http://s3.51cto.com/wyfs02/M02/6F/78/wKiom1WdJGejogeEAADFcGfvlHM213.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M02/6F/78/wKiom1WdJGejogeEAADFcGfvlHM213.jpg" title="选区_016.png" alt="wKiom1WdJGejogeEAADFcGfvlHM213.jpg" /></a></p><p>一个Actor的代码结构一般是下面这种结构，不停的接受消息并处理，没有消息就等待：</p><p><a href="http://s3.51cto.com/wyfs02/M01/6F/74/wKioL1WdJniAb7CiAACCrB88e3w417.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M01/6F/74/wKioL1WdJniAb7CiAACCrB88e3w417.jpg" title="选区_015.png" alt="wKioL1WdJniAb7CiAACCrB88e3w417.jpg" /></a></p><p>组装者代码：</p><p><a href="http://s3.51cto.com/wyfs02/M01/6F/78/wKiom1WdJQuC2KISAAD_TzvsHmU128.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M01/6F/78/wKiom1WdJQuC2KISAAD_TzvsHmU128.jpg" title="选区_017.png" alt="wKiom1WdJQuC2KISAAD_TzvsHmU128.jpg" /></a></p><p>分发者代码：</p><p><a href="http://s3.51cto.com/wyfs02/M02/6F/78/wKiom1WdJT6ToafUAAHzO5b-wbg835.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M02/6F/78/wKiom1WdJT6ToafUAAHzO5b-wbg835.jpg" title="选区_018.png" alt="wKiom1WdJT6ToafUAAHzO5b-wbg835.jpg" /></a></p><p>加工者代码：</p><p><a href="http://s3.51cto.com/wyfs02/M00/6F/75/wKioL1WdJ8aQb3cnAAH3zqiR_OY263.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M00/6F/75/wKioL1WdJ8aQb3cnAAH3zqiR_OY263.jpg" title="选区_019.png" alt="wKioL1WdJ8aQb3cnAAH3zqiR_OY263.jpg" /></a></p><p>主线程代码：</p><p><a href="http://s3.51cto.com/wyfs02/M00/6F/78/wKiom1WdJkDCESVPAAHn1a3-nqU963.jpg" target="_blank"><img src="http://s3.51cto.com/wyfs02/M00/6F/78/wKiom1WdJkDCESVPAAHn1a3-nqU963.jpg" title="选区_020.png" alt="wKiom1WdJkDCESVPAAHn1a3-nqU963.jpg" /></a></p><p>工程代码可以在附件中下载。这个代码实现的效果与前面用Java实现的是一样的，但是各个线程没有共享内存，也没有锁，这样开发起来容易，而且更适合分布式编程，因为分布式编程本身就不适合共享内存。Scala的Actor不能原生的支持分布式，但是Erlang可以，使用Erlang的Actor，分布式编程就和本地编程基本一样。但是Erlang的语法难懂，而且没有变量，几乎所有需要使用循环的地方都得用递归。<br /></p></div>


参考 : 

- [十分钟理解Actor模式](http://blog.51cto.com/nxlhero/1666250)
- [Actor模型原理](http://www.cnblogs.com/MOBIN/p/7236893.html)

