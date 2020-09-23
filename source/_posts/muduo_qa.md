---
title: muduo详解之网络编程难点解读
date: 2020-09-24 00:22:06
tags:
- noodle
- muduo
categories:
- NP
---


# 网络编程难点

TCP 网络编程这其中有很多难点，也有很多细节需要注意，比方说：

1. 如果要主动关闭连接，如何保证对方已经收到全部数据？如果应用层有缓冲（这在非阻塞网络编程中是必须的，见下文），那么如何保证先发送完缓冲区中的数据，然后再断开连接。直接调用 close(2) 恐怕是不行的。
2. 如果主动发起连接，但是对方主动拒绝，如何定期 (带 back-off) 重试？
3. 非阻塞网络编程该用边沿触发(edge trigger)还是电平触发(level trigger)？（这两个中文术语有其他译法，我选择了一个电子工程师熟悉的说法。）如果是电平触发，那么什么时候关注 EPOLLOUT 事件？会不会造成 busy-loop？如果是边沿触发，如何防止漏读造成的饥饿？epoll 一定比 poll 快吗？
4. 在非阻塞网络编程中，为什么要使用应用层缓冲区？假如一次读到的数据不够一个完整的数据包，那么这些已经读到的数据是不是应该先暂存在某个地方，等剩余的数据收到之后再一并处理？见 lighttpd 关于 \r\n\r\n 分包的 bug。假如数据是一个字节一个字节地到达，间隔 10ms，每个字节触发一次文件描述符可读 (readable) 事件，程序是否还能正常工作？lighttpd 在这个问题上出过安全漏洞。
5. 在非阻塞网络编程中，如何设计并使用缓冲区？一方面我们希望减少系统调用，一次读的数据越多越划算，那么似乎应该准备一个大的缓冲区。另一方面，我们系统减少内存占用。如果有 10k 个连接，每个连接一建立就分配 64k 的读缓冲的话，将占用 640M 内存，而大多数时候这些缓冲区的使用率很低。muduo 用 readv 结合栈上空间巧妙地解决了这个问题。
6. 如果使用发送缓冲区，万一接收方处理缓慢，数据会不会一直堆积在发送方，造成内存暴涨？如何做应用层的流量控制？
7. 如何设计并实现定时器？并使之与网络 IO 共用一个线程，以避免锁。

这些问题在 muduo 的代码中可以找到答案。


# 5解答

``` cpp
ssize_t Buffer::readFd(int fd, int* savedErrno)
{
  // saved an ioctl()/FIONREAD call to tell how much to read
  char extrabuf[65536];
  struct iovec vec[2];
  const size_t writable = writableBytes();
  vec[0].iov_base = begin()+writerIndex_;
  vec[0].iov_len = writable;
  vec[1].iov_base = extrabuf;
  vec[1].iov_len = sizeof extrabuf;
  // when there is enough space in this buffer, don't read into extrabuf.
  // when extrabuf is used, we read 128k-1 bytes at most.
  const int iovcnt = (writable < sizeof extrabuf) ? 2 : 1;
  const ssize_t n = sockets::readv(fd, vec, iovcnt);
  if (n < 0)
  {
    *savedErrno = errno;
  }
  else if (implicit_cast<size_t>(n) <= writable)
  {
    writerIndex_ += n;
  }
  else
  {
    writerIndex_ = buffer_.size();
    append(extrabuf, n - writable);
  }
  // if (n == writable + sizeof extrabuf)
  // {
  //   goto line_30;
  // }
  return n;
}
```

备注: 

readv则将从fd读入的数据按同样的顺序散布到各缓冲区中，readv总是先填满一个缓冲区，然后再填下一个
``` cpp
#include <sys/uio.h>
ssize_t readv(int fd, const struct iovec *iov, int iovcnt);
ssize_t writev(int fd, const struct iovec *iov, int iovcnt);
struct iovec {
    void  *iov_base;    /* Starting address */
    size_t iov_len;     /* Number of bytes to transfer */
};
```

buffer数据结构如下:  
``` cpp
/// A buffer class modeled after org.jboss.netty.buffer.ChannelBuffer
///
/// @code
/// +-------------------+------------------+------------------+
/// | prependable bytes |  readable bytes  |  writable bytes  |
/// |                   |     (CONTENT)    |                  |
/// +-------------------+------------------+------------------+
/// |                   |                  |                  |
/// 0      <=      readerIndex   <=   writerIndex    <=     size
/// @endcode
```

* 在非阻塞网络编程中，如何设计并使用缓冲区？  
    一方面希望减少系统调用，一次读取的数据越多越划算；另一方面希望减少内存的占用。这两方面似乎是矛盾的，假设C10K ，每个连接一建立就分配50KB 的内存的话，那么将占用1GB 内存，但是大多数的连接并不需要这么多内存。muduo 巧妙的使用了readv() 结合栈上空间巧妙的解决了这个问题。    
    在栈上准备一个65535 字节(**64k**)的extrabuf , 然后利用readv() 来读取数据，iovec有两块，第一块是指向muduo Buffer （为每个连接准备1024字节的buf）中的writeable 字节，另一块是指向extrabuf。这样如果读入的数据不多，直接读到内置的buf；如果长度超过内置buf 的大小，就会读到栈上的extrabuf 中，然后程序再把extrabuf 里的数据append() 到 buf 中。

*为啥**64k**就够了?
    因为平时一般都阻塞在poll上, 来了数据马上就处理的话也就几k而已, 即使是千兆网卡100MB/s, 500微秒也就是500/1000000秒也就是0.5毫秒  
    `100MB/s * (500/1000000) = 50000B/s`, 那一秒也就是50000字节的数据, 64k已经足够容纳千兆网在0.5毫秒全速收到的数据了


# 异步日志双缓冲技术

muduo日志库采用的是双缓冲技术，基本思路是准备两块缓冲：A与B，前端负责往buffer A中填数据（日志消息），后端负责将buffer B中的数据写入文件。当buffer A写满之后，交换A与B，让后端将buffer A中的数据写入文件，而前端负责往buffer B中填入新的日志文件。如此往复。用两个buffer的好处是在新建日志消息的时候不必等待磁盘文件操作，也避免每条消息都触发（唤醒）了后端日志线程。换言之，前端不是将一条条消息分别传送给后端，而是将多个日志消息拼成一个大的buffer传送给后端，相当于批处理，减少了线程唤醒的频率，降低了开销。另外，为了及时将消息写入文件，即使前端的buffer A未写满，日志库也会每三秒执行一次上述交换写入操作。
