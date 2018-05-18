---
title: 进程间的通信与同步
date: 2017-01-27 21:01:59
tags:
- IPC
categories:
- Linux
---


# 概绍

IPC 即 **Inter Process Communication**, 大概有以下几种方式(排序已打乱) :  


- 6.**共享内存**( shared memory, 非常实用, 后文将说一下比较常用的两种方式, 分别是 [mmap](#mmap) 和 [System V共享内存](#System-V共享内存)  ) ：
共享内存就是映射一段能被其他进程所访问的内存，这段共享内存由一个进程创建，但多个进程都可以访问。共享内存是最快的 IPC 方式，它是针对其他进程间通信方式运行效率低而专门设计的。它往往与其他通信机制，如信号量，配合使用，来实现进程间的同步和通信。

- 3.**信号量**( semophore, 主要用来进程/线程间同步, 后文将会说 [System V信号量](#System-V信号量)) ： 
信号量是一个计数器，可以用来控制多个进程对共享资源的访问。它常作为一种锁机制，防止某进程正在访问共享资源时，其他进程也访问该资源。因此，主要作为进程间以及同一进程内不同线程之间的同步手段。

- 7.套接字( socket ) ：
套接字也是一种进程间通信机制，与其他通信机制不同的是，它可用于不同机器间的进程通信。

- 1.匿名管道( 英文为pipe, 这种IPC很原始 )：
匿名管道是一种半双工的通信方式，通常是在父子进程间使用。

- 2.命名管道 ( named pipe或FIFO, 这种IPC很原始 ) ：
命名管道也是半双工的通信方式，但是它允许无亲缘关系进程间的通信。

- 4.消息队列( message queue, 正在被淘汰 ) ： 
消息队列是消息的链表，存放在内核中并由消息队列标识符标识。消息队列克服了信号传递信息少、管道只能承载无格式字节流以及缓冲区大小受限等缺点。

- 5.信号 ( sinal ) ：
信号是一种比较复杂的通信方式，用于通知接收进程某个事件已经发生。

# 共享内存概绍

采用共享内存通信的一个显而易见的好处是效率高，因为进程可以直接读写内存，而不需要任何数据的拷贝。对于像管道和消息队列等通信方式，则需要在内核和用户空间进行四次的数据拷贝，而共享内存则只拷贝两次数据 [1]：一次从输入文件到共享内存区，另一次从共享内存区到输出文件。实际上，进程之间在共享内存时，并不总是读写少量数据后就解除映射，有新的通信时，再重新建立共享内存区域。而是保持共享区域，直到通信完毕为止，这样，数据内容一直保存在共享内存中，并没有写回文件。共享内存中的内容往往是在解除映射时才写回文件的。因此，采用共享内存的通信方式效率是非常高的。

Linux 的 2.2.x 内核支持多种共享内存方式，如 mmap() 系统调用，Posix 共享内存，以及系统 V 共享内存。linux 发行版本如 Redhat 8.0 支持 mmap() 系统调用及系统 V 共享内存，但还没实现 Posix 共享内存，本文将主要介绍 mmap() 系统调用及系统 V 共享内存 API 的原理及应用。

## 内核怎样保证各个进程寻址到同一个共享内存区域的内存页面

- 1、page cache 及 swap cache 中页面的区分：一个被访问文件的物理页面都驻留在 page cache 或 swap cache 中，一个页面的所有信息由 struct page 来描述。struct page 中有一个域为指针 mapping ，它指向一个 struct address_space 类型结构。page cache 或 swap cache 中的所有页面就是根据 address_space 结构以及一个偏移量来区分的。

- 2、文件与 address_space 结构的对应：一个具体的文件在打开后，内核会在内存中为之建立一个 struct inode 结构，其中的 i_mapping 域指向一个 address_space 结构。这样，一个文件就对应一个 address_space 结构，一个 address_space 与一个偏移量能够确定一个 page cache 或 swap cache 中的一个页面。因此，当要寻址某个数据时，很容易根据给定的文件及数据在文件内的偏移量而找到相应的页面。

- 3、进程调用 mmap() 时，只是在进程空间内新增了一块相应大小的缓冲区，并设置了相应的访问标识，但并没有建立进程空间到物理页面的映射。因此，第一次访问该空间时，会引发一个缺页异常。

- 4、对于共享内存映射情况，缺页异常处理程序首先在 swap cache 中寻找目标页（符合 address_space 以及偏移量的物理页），如果找到，则直接返回地址；如果没有找到，则判断该页是否在交换区 (swap area)，如果在，则执行一个换入操作；如果上述两种情况都不满足，处理程序将分配新的物理页面，并把它插入到 page cache 中。进程最终将更新进程页表。
注：对于映射普通文件情况（非共享映射），缺页异常处理程序首先会在 page cache 中根据 address_space 以及数据偏移量寻找相应的页面。如果没有找到，则说明文件数据还没有读入内存，处理程序会从磁盘读入相应的页面，并返回相应地址，同时，进程页表也会更新。

- 5、所有进程在映射同一个共享内存区域时，情况都一样，在建立线性地址与物理地址之间的映射之后，不论进程各自的返回地址如何，实际访问的必然是同一个共享内存区域对应的物理页面。
注：一个共享内存区域可以看作是特殊文件系统 shm 中的一个文件，shm 的安装点在交换区上。

上面涉及到了一些数据结构，围绕数据结构理解问题会容易一些。

# mmap

mmap() 系统调用使得进程之间通过映射同一个普通文件实现共享内存。普通文件被映射到进程地址空间后，进程可以向访问普通内存一样对文件进行访问，不必再调用 read()，write（）等操作。

注：实际上，mmap() 系统调用并不是完全为了用于共享内存而设计的。它本身提供了不同于一般对普通文件的访问方式，进程可以像读写内存一样对普通文件的操作。而 Posix 或系统 V 的共享内存 IPC 则纯粹用于共享目的，当然 mmap() 实现共享内存也是其主要应用之一。

## mmap() 系统调用形式如下

void* mmap (void * addr , size_t len , int prot , int flags , int fd , off_t offset)
参数 fd 为即将映射到进程空间的文件描述字，一般由 open() 返回，同时，fd 可以指定为 - 1，此时须指定 flags 参数中的 MAP_ANON，表明进行的是匿名映射（不涉及具体的文件名，避免了文件的创建及打开，很显然只能用于具有亲缘关系的进程间通信）。len 是映射到调用进程地址空间的字节数，它从被映射文件开头 offset 个字节开始算起。prot 参数指定共享内存的访问权限。可取如下几个值的或：PROT_READ（可读） , PROT_WRITE （可写）, PROT_EXEC （可执行）, PROT_NONE（不可访问）。flags 由以下几个常值指定：MAP_SHARED , MAP_PRIVATE , MAP_FIXED，其中，MAP_SHARED , MAP_PRIVATE 必选其一，而 MAP_FIXED 则不推荐使用。offset 参数一般设为 0，表示从文件头开始映射。参数 addr 指定文件应被映射到进程空间的起始地址，一般被指定一个空指针，此时选择起始地址的任务留给内核来完成。函数的返回值为最后文件映射到进程空间的地址，进程可直接操作起始地址为该值的有效地址。这里不再详细介绍 mmap() 的参数，读者可参考 mmap() 手册页获得进一步的信息。

## 系统调用 mmap() 用于共享内存的两种方式

- （1）使用普通文件提供的内存映射：适用于任何进程之间； 此时，需要打开或创建一个文件，然后再调用 mmap()；典型调用代码如下：

`fd=open(name, flag, mode);`

ptr=mmap(NULL, len , PROT_READ|PROT_WRITE, MAP_SHARED , fd , 0); 通过 mmap() 实现共享内存的通信方式有许多特点和要注意的地方，我们将在范例中进行具体说明。

- （2）使用特殊文件提供匿名内存映射：适用于具有亲缘关系的进程之间； 由于父子进程特殊的亲缘关系，在父进程中先调用 mmap()，然后调用 fork()。那么在调用 fork() 之后，子进程继承父进程匿名映射后的地址空间，同样也继承 mmap() 返回的地址，这样，父子进程就可以通过映射区域进行通信了。注意，这里不是一般的继承关系。一般来说，子进程单独维护从父进程继承下来的一些变量。而 mmap() 返回的地址，却由父子进程共同维护。
对于具有亲缘关系的进程实现共享内存最好的方式应该是采用匿名内存映射的方式。此时，不必指定具体的文件，只要设置相应的标志即可，参见范例 2。

## 系统调用 munmap()

`int munmap(void * addr, size_t len)`
该调用在进程地址空间中解除一个映射关系，addr 是调用 mmap() 时返回的地址，len 是映射区的大小。当映射关系解除后，对原来映射地址的访问将导致段错误发生。

## 系统调用 msync()

`int msync (void * addr , size_t len, int flags)`
一般说来，进程在映射空间的对共享内容的改变并不直接写回到磁盘文件中，往往在调用 munmap（）后才执行该操作。可以通过调用 msync() 实现磁盘上文件内容与共享内存区的内容一致。

## mmap() 范例

下面将给出使用 mmap() 的两个范例：范例 1 给出两个进程通过映射普通文件实现共享内存通信；范例 2 给出父子进程通过匿名映射实现共享内存。系统调用 mmap() 有许多有趣的地方，下面是通过 mmap（）映射普通文件实现进程间的通信的范例，我们通过该范例来说明 mmap() 实现共享内存的特点及注意事项。

### 两个进程通过映射普通文件实现共享内存通信

范例 1 包含两个子程序：map_normalfile1.c 及 map_normalfile2.c。编译两个程序，可执行文件分别为 map_normalfile1 及 map_normalfile2。两个程序通过命令行参数指定同一个文件来实现共享内存方式的进程间通信。map_normalfile2 试图打开命令行参数指定的一个普通文件，把该文件映射到进程的地址空间，并对映射后的地址空间进行写操作。map_normalfile1 把命令行参数指定的文件映射到进程地址空间，然后对映射后的地址空间执行读操作。这样，两个进程通过命令行参数指定同一个文件来实现共享内存方式的进程间通信。

下面是两个程序代码：

``` c map_normalfile1.c
/*-------------map_normalfile1.c-----------*/
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
typedef struct{
  char name[4];
  int  age;
}people;
main(int argc, char** argv) // map a normal file as shared mem:
{
  int fd,i;
  people *p_map;
  char temp;
   
  fd=open(argv[1],O_CREAT|O_RDWR|O_TRUNC,00777);
  lseek(fd,sizeof(people)*5-1,SEEK_SET);
  write(fd,"",1);
   
  p_map = (people*) mmap( NULL,sizeof(people)*10,PROT_READ|PROT_WRITE,
        MAP_SHARED,fd,0 );
  close( fd );
  temp = 'a';
  for(i=0; i<10; i++)
  {
    temp += 1;
    memcpy( ( *(p_map+i) ).name, &temp,2 );
    ( *(p_map+i) ).age = 20+i;
  }
  printf(" initialize over \n ")；
  sleep(10);
  munmap( p_map, sizeof(people)*10 );
  printf( "umap ok \n" );
}
```

``` c map_normalfile2.c
/*-------------map_normalfile2.c-----------*/
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
typedef struct{
  char name[4];
  int  age;
}people;
main(int argc, char** argv)  // map a normal file as shared mem:
{
  int fd,i;
  people *p_map;
  fd=open( argv[1],O_CREAT|O_RDWR,00777 );
  p_map = (people*)mmap(NULL,sizeof(people)*10,PROT_READ|PROT_WRITE,
       MAP_SHARED,fd,0);
  for(i = 0;i<10;i++)
  {
  printf( "name: %s age %d;\n",(*(p_map+i)).name, (*(p_map+i)).age );
  }
  munmap( p_map,sizeof(people)*10 );
}
```

map_normalfile1.c 首先定义了一个 people 数据结构，（在这里采用数据结构的方式是因为，共享内存区的数据往往是有固定格式的，这由通信的各个进程决定，采用结构的方式有普遍代表性）。map_normfile1 首先打开或创建一个文件，并把文件的长度设置为 5 个 people 结构大小。然后从 mmap() 的返回地址开始，设置了 10 个 people 结构。然后，进程睡眠 10 秒钟，等待其他进程映射同一个文件，最后解除映射。

map_normfile2.c 只是简单的映射一个文件，并以 people 数据结构的格式从 mmap() 返回的地址处读取 10 个 people 结构，并输出读取的值，然后解除映射。

分别把两个程序编译成可执行文件 map_normalfile1 和 map_normalfile2 后，在一个终端上先运行./map_normalfile2 /tmp/test_shm，程序输出结果如下：

    initialize over
    umap ok

在 map_normalfile1 输出 initialize over 之后，输出 umap ok 之前，在另一个终端上运行 map_normalfile2 /tmp/test_shm，将会产生如下输出 (为了节省空间，输出结果为稍作整理后的结果)：

    name: b age 20;
    name: c age 21;
    name: d age 22;
    name: e age 23;
    name: f age 24;
    name: g age 25;
    name: h age 26;
    name: I age 27;
    name: j age 28;
    name: k age 29;


在 map_normalfile1 输出 umap ok 后，运行 map_normalfile2 则输出如下结果：

    name: b age 20;
    name: c age 21;
    name: d age 22;
    name: e age 23;
    name: f age 24;
    name:   age 0;
    name:   age 0;
    name:   age 0;
    name:   age 0;
    name:   age 0;


**从程序的运行结果中可以得出的结论**

- 1、 最终被映射文件的内容的长度不会超过文件本身的初始大小，即映射不能改变文件的大小；

- 2、 可以用于进程通信的有效地址空间大小大体上受限于被映射文件的大小，但不完全受限于文件大小。打开文件被截短为 5 个 people 结构大小，而在 map_normalfile1 中初始化了 10 个 people 数据结构，在恰当时候（map_normalfile1 输出 initialize over 之后，输出 umap ok 之前）调用 map_normalfile2 会发现 map_normalfile2 将输出全部 10 个 people 结构的值，后面将给出详细讨论。
注：在 linux 中，内存的保护是以页为基本单位的，即使被映射文件只有一个字节大小，内核也会为映射分配一个页面大小的内存。当被映射文件小于一个页面大小时，进程可以对从 mmap() 返回地址开始的一个页面大小进行访问，而不会出错；但是，如果对一个页面以外的地址空间进行访问，则导致错误发生，后面将进一步描述。因此，可用于进程间通信的有效地址空间大小不会超过文件大小及一个页面大小的和。

- 3、 文件一旦被映射后，调用 mmap() 的进程对返回地址的访问是对某一内存区域的访问，暂时脱离了磁盘上文件的影响。所有对 mmap() 返回地址空间的操作只在内存中有意义，只有在调用了 munmap() 后或者 msync() 时，才把内存中的相应内容写回磁盘文件，所写内容仍然不能超过文件的大小。

### 父子进程通过匿名映射实现共享内存

``` c
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
typedef struct{
  char name[4];
  int  age;
}people;
main(int argc, char** argv)
{
  int i;
  people *p_map;
  char temp;
  p_map=(people*)mmap(NULL,sizeof(people)*10,PROT_READ|PROT_WRITE,
       MAP_SHARED|MAP_ANONYMOUS,-1,0);
  if(fork() == 0)
  {
    sleep(2);
    for(i = 0;i<5;i++)
      printf("child read: the %d people's age is %d\n",i+1,(*(p_map+i)).age);
    (*p_map).age = 100;
    munmap(p_map,sizeof(people)*10); //实际上，进程终止时，会自动解除映射。
    exit();
  }
  temp = 'a';
  for(i = 0;i<5;i++)
  {
    temp += 1;
    memcpy((*(p_map+i)).name, &temp,2);
    (*(p_map+i)).age=20+i;
  }
  sleep(5);
  printf( "parent read: the first people,s age is %d\n",(*p_map).age );
  printf("umap\n");
  munmap( p_map,sizeof(people)*10 );
  printf( "umap ok\n" );
}
```

考察程序的输出结果，体会父子进程匿名共享内存：

    child read: the 1 people's age is 20
    child read: the 2 people's age is 21
    child read: the 3 people's age is 22
    child read: the 4 people's age is 23
    child read: the 5 people's age is 24
    parent read: the first people,s age is 100
    umap
    umap ok

## 对 mmap() 返回地址的访问

前面对范例运行结构的讨论中已经提到，linux 采用的是页式管理机制。对于用 mmap() 映射普通文件来说，进程会在自己的地址空间新增一块空间，空间大小由 mmap() 的 len 参数指定，注意，进程并不一定能够对全部新增空间都能进行有效访问。进程能够访问的有效地址大小取决于文件被映射部分的大小。简单的说，能够容纳文件被映射部分大小的最少页面个数决定了进程从 mmap() 返回的地址开始，能够有效访问的地址空间大小。超过这个空间大小，内核会根据超过的严重程度返回发送不同的信号给进程。可用如下图示说明：

![](/img/ipc/mmap.jpg)

注意：文件被映射部分而不是整个文件决定了进程能够访问的空间大小，另外，如果指定文件的偏移部分，一定要注意为页面大小的整数倍。下面是对进程映射地址空间的访问范例：

``` c
#include <sys/mman.h>
#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
typedef struct{
    char name[4];
    int  age;
}people;
main(int argc, char** argv)
{
    int fd,i;
    int pagesize,offset;
    people *p_map;
     
    pagesize = sysconf(_SC_PAGESIZE);
    printf("pagesize is %d\n",pagesize);
    fd = open(argv[1],O_CREAT|O_RDWR|O_TRUNC,00777);
    lseek(fd,pagesize*2-100,SEEK_SET);
    write(fd,"",1);
    offset = 0; //此处offset = 0编译成版本1；offset = pagesize编译成版本2
    p_map = (people*)mmap(NULL,pagesize*3,PROT_READ|PROT_WRITE,MAP_SHARED,fd,offset);
    close(fd);
     
    for(i = 1; i<10; i++)
    {
        (*(p_map+pagesize/sizeof(people)*i-2)).age = 100;
        printf("access page %d over\n",i);
        (*(p_map+pagesize/sizeof(people)*i-1)).age = 100;
        printf("access page %d edge over, now begin to access page %d\n",i, i+1);
        (*(p_map+pagesize/sizeof(people)*i)).age = 100;
        printf("access page %d over\n",i+1);
    }
    munmap(p_map,sizeof(people)*10);
}
```

如程序中所注释的那样，把程序编译成两个版本，两个版本主要体现在文件被映射部分的大小不同。文件的大小介于一个页面与两个页面之间（大小为：pagesize*2-99），版本 1 的被映射部分是整个文件，版本 2 的文件被映射部分是文件大小减去一个页面后的剩余部分，不到一个页面大小 (大小为：pagesize-99)。程序中试图访问每一个页面边界，两个版本都试图在进程空间中映射 pagesize*3 的字节数。

版本 1 的输出结果如下：

    pagesize is 4096
    access page 1 over
    access page 1 edge over, now begin to access page 2
    access page 2 over
    access page 2 over
    access page 2 edge over, now begin to access page 3
    Bus error       //被映射文件在进程空间中覆盖了两个页面，此时，进程试图访问第三个页面

版本 2 的输出结果如下：

    pagesize is 4096
    access page 1 over
    access page 1 edge over, now begin to access page 2
    Bus error       //被映射文件在进程空间中覆盖了一个页面，此时，进程试图访问第二个页面

结论：采用系统调用 mmap() 实现进程间通信是很方便的，在应用层上接口非常简洁。内部实现机制区涉及到了 linux 存储管理以及文件系统等方面的内容，可以参考一下相关重要数据结构来加深理解。在本专题的后面部分，将介绍系统 v 共享内存的实现。


# System V共享内存

说一下System V共享内存.

顾名思义，共享内存就是允许两个不相关的进程访问同一个逻辑内存。 共享内存是在两
个正在运行的进程之间共享和传递数据的一种非常有效的方式 。 不同进程之间共享的内存通
常安排在同－段物理内存中 。 进程可以将同一段共享内存连接到它们 自己 的地址空间中，所
有进程都可以访问共享内存中的地址，就好像它们是由用 C 语言 函数 malloc 分配的内存一
样。 而如果某个进程向共享内存写入数据，所做的改动将立即影响到可以访问同一段共享内
存的任何其他进程 。

不过，共享内存并未提供同步机制，也就是说，在第一个进程对共享内存的写操作结束
之前，并无自动机制可以阻止第二个进程对它进行读取。 所以通常需要用其他的机制来同步
对共享内存的访问 。

## shmget

在 Linux 中也提供了一组函数接口用于使用共享 内存， 首先常用的函数是 shmget ， 该函
数用来创建共享内存，它用到的头文件是 ：

`#include <sys/shm .h>`

函数原型是：
`int shmget(key_ t key, int size , int flag) ;`

- 第一个参数，程序需要提供一个参数 key （非 0 整数），它有效地为共享内存段命名，
shmget 函数运行成功时会返回一个与 key 相关的共享内存标识符（非负整数），用于后续的共
享内存函数；调用失败返回－ 1 。
不相关的进程可以通过该函数的返回值访问同一共享内存，它代表程序可能要使用的某
个资源，程序对所有共享内存的访问都是间接的 。 程序先通过调用 shmget 函数并提供一个
键，再由系统生成一个相应的共享内存标识符（ shmget 函数的返回值） 。

- 第二个参数， size 以字节为单位指定需要共享的内存容量。
 
- 第三个参数， shmfl.g 是权限标志，它的作用与 open 函数的 mode 参数一样，如果要想在
key 标识的共享 内存不存在的条件下创建它的话，可以与 IPC_CREAT 做或操作 。 共享内存
的权限标志与文件的读写权限一样，举例来说， 0644 表示允许一个进程创建的共享内存被内
存创建者所拥有的进程向共享内存读取和写人数据，同时其他用户创建的进程只能读取共享
内存 。

## shmat

当共享 内存创建后，其余进程可以调用 shmat 将其连接到自身的地址空间中，它的函数
原型是 ：
`void *shmat(int shmid , void *addr , int flag) ;`

shmid 为 shmget 函数返回的共享存储标识符， addr 和 flag 参数决定了以什么方式来确定
连接的地址，函数的返回值即是该进程数据段所连接的实际地址， 其他进程可以对此进程进
行读写操作 。

## shmdt

shmdt 函数用于将共享 内存从当前进程中分离 。 注意，将共享内存分离并不是删除它，
只是使该共享内存对当前进程不再可用 。 它的原型如下：
`int shmdt(const void *shmaddr) ;`

参数 shmaddr 是 shmat 函数返回的地址指针，调用成功时返回 0 ，失败时返回－ 1 。

## 例子程序

共享 内存是进程间通信的最快的方式，但是共享 内存的同步问题自身无法解决（即进
程该何时去共享内存取得数据，而何时不能取），但用信号量即可轻易解决这个问题 。 下
面使用例来说明如何使用信号量解决共享内存的同步问题 。 这个例子的主要功能是
writer 向 reader 传递数据，并且只有在 writer 发送完毕后， reader 才取数据，否则阻塞
等待 。

``` c++ reader.cpp
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/sem.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <sys/shm.h>
#include <errno.h>
#define SEM_KEY 4001
#define SHM_KEY 5678
union semun {
	int val;
};
int main(void){
	/*create a shm*/
	int semid,shmid;
	shmid = shmget(SHM_KEY,sizeof(int),IPC_CREAT|0666);
	if(shmid<0){
		printf("create shm error\n");
		return -1;
	}
	void * shmptr;
	shmptr =shmat(shmid,NULL,0);
	if(shmptr == (void *)-1){
		printf("shmat error:%s\n",strerror(errno));
		return -1;
	}
	int * data = (int *)shmptr;	
	semid = semget(SEM_KEY,2,IPC_CREAT|0666);/*这里是创建一个semid，并且有两个信号量*/
	union semun semun1;/*下面这四行就是初始化那两个信号量，一个val=0,另一个val=1*/
	semun1.val=0;
	semctl(semid,0,SETVAL,semun1);
	semun1.val=1;
	semctl(semid,1,SETVAL,semun1);
	struct sembuf sembuf1;
	while(1){
	  sembuf1.sem_num=0;/*sem_num=0指的是下面操作指向第一个信号量，上面设置可知其 val=0*/
	  sembuf1.sem_op=-1; /*初始化值为0，再-1的话就会等待*/
	  sembuf1.sem_flg=SEM_UNDO;
	  semop(semid,&sembuf1,1);/*reader在这里会阻塞,直到收到信号*/
	  printf("the NUM:%d\n",*data);/*输出结果*/
	  sembuf1.sem_num=1;/*这里让writer再次就绪，就这样循环*/
	  sembuf1.sem_op=1;
	  sembuf1.sem_flg=SEM_UNDO;
	  semop(semid,&sembuf1,1);
	}
	return 0;
}

```

``` c++ writer.cpp
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/sem.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <sys/shm.h>
#include <errno.h>
#define SEM_KEY 4001
#define SHM_KEY 5678
union semun {
	int val;
};
int main(void){
	/*create a shm*/
	int semid,shmid;
	shmid = shmget(SHM_KEY,sizeof(int),IPC_CREAT|0666);
	if(shmid<0){
	  printf("create shm error\n");
	  return -1;
	}
	void * shmptr;
	shmptr =shmat(shmid,NULL,0);
	if(shmptr == (void *)-1){
	  printf("shmat error:%s\n",strerror(errno));
	  return -1;
	}
	int * data = (int *)shmptr;	
	semid = semget(SEM_KEY,2,0666);
	struct sembuf sembuf1;
	union semun semun1;
	while(1){
	  sembuf1.sem_num=1;/*这里指向第2个信号量（sem_num=1）*/
	  sembuf1.sem_op=-1;/*操作是-1，因为第2个信号量初始值为1，所以下面不会阻塞*/
    sembuf1.sem_flg=SEM_UNDO;
	  semop(semid,&sembuf1,1);/*继续*/
	  scanf("%d",data);  /*用户在终端输入数据*/
	  sembuf1.sem_num=0;/*这里指向第一个信号量*/
	  sembuf1.sem_op=1;/*操作加1*/	
	  sembuf1.sem_flg=SEM_UNDO;
	  semop(semid,&sembuf1,1);/*执行+1后，我们发现，reader阻塞正是由于第一个信号量为0，无法减一，而现在writer先为其加1，那reader就绪！writer继续循环，发现第二个信号量已经减为0，则阻塞了，我们回到reader*/
    }
	 return 0;
}

```

## 输出

多打开几个终端，同时执行 writer 程序，看是否 reader 能够正确地读到数据

writer :

    [b@host 1105]$ ./writer
    51
    09
    977

writer :

    [b@host 1105]$ ./writer
    22
    11
    55
    55
    5

reader :

    [b@host 1105]$ ./reader
    the NUM:22
    the NUM:11
    the NUM:55
    the NUM:55
    the NUM:5
    the NUM:51
    the NUM:9
    the NUM:977




要想让程序安全地执行，就要有一种进程同步的进制，保证在进入临界区的操作是原子
操作 。 
例如，**使用[信号量](#System-V信号量)来进行进程的同步 。 因为对信号量的操作都是原子性的 。**

## 共享内存的优缺点

使用共享内存的优缺点如下所述 。

- 优点：使用共享内存进行进程间的通信非常方便，而且函数的接口也简单，数据的
共享还使进程间的数据不用传送，而是直接访问内存，也加快了程序的效率。 同时，它也不
像无名管道那样要求通信的进程有一定的父子关系 。

- 缺点：共享 内存没有提供同步的机制，这使得在使用共享 内存进行进程间通信时，
往往要借助其他的手段来进行进程间的同步工作 。


# System V信号量

在 Linux 中提供了一组函数接口用于使用System V信号量 ，首先常用的函数是 semget，该函数用
来创建和打开信号量 ，它用到的头文件是：

``` c
#include <sys / types . h>
#include < sys / ipc . h >
#include <sys/sem. h >
```

## semget

函数原型是：
`int semget( key_ t key , int nsems , int semflg) ;`

该函数执行成功返回信号量标示符，失败则返回－ 1 。 参数 key 是函数通过调用负ok 函
数得到的键值， nsems 代表创建信号量的个数，如果只是访问而不创建则可以指定该参数为
0 ；但一旦创建了该信号量 ，就不能更改其信号量个数。 只要不删除该信号量 ，就可以重新
调用该函数创建该键值的信号量 ，该函数只是返回以前创建的值，而不会重新创建。

semflg指定该信号茸的读写权限， 当创建信号量时不许加 IPC_C阻AT ，若指定 IPC CREAT IIPC_
EXCL 后创建时发现存在该信号量 ，创建失败 。

## semop

semop 函数，用于改变信号量的值，原型是：
`int semop(int semid, struct sembuf *sops , unsigned nsops) ;`

sem_id 是 由 semget 返回的信号量标识符， sembuf 结构的定义如下：
``` c
struct sembuf {
    short sem_num;  // 除非使用一组信号量，否则它为 O
    short sem_op ;  // 信号量在一次操作中需要改变的数据，通常是两个数，
                    // 一个是－ 1 ，即 p （等待）操作，一个是＋ 1 ，即 v （发送信号）操作 。
    short sem_flg;  // 通常为 SEM_UNDO ， 使操作系统跟踪信号，
                    // 并在进程没有释放该信号量而终止时 ， 操作系统释放信号量
}
```

## semctl

semctl 函数，该函数用来直接控制信号量信息，它的原型是：
`int semctl (int semid, int semnum, int cmd , ... ) ;`

如果有第 4 个参数，它通常是一个 union semum 结构，定义如下：
``` c
union semun{
    int val ;
    struct semid_ds *buf;
    unsigned short *arry ;
}
```

前两个参数与前面一个函数中的一样， cmd 通常是 SETVAL 或 IPC RMID 。 SETVAL
用来把信号量初始化为一个己知的值 。 p 值通过 union semun 中的 val 成员设置，其作用是
在信号量第一次使用前对它进行设置 。 IPC_RMID 用于删除一个已经无须继续使用的信号量
标识符 

# ipcs命令


ipcs 是一个 UINX/Linux 的命令 ，用于报告系统的消息队列、信号量、共享内存等 。 下
面列举一些常用命令。

- ipcs -a 用于列出本用户所有相关的 ipcs 参数，结果如下所示 :

        [b@host ~]$ ipcs -a

        ------ Shared Memory Segments --------
        key        shmid      owner      perms      bytes      nattch     status
        0x000004d1 32768      b          666        2052       0
        0x000004d2 65537      b          666        2052       0

        ------ Semaphore Arrays --------
        key        semid      owner      perms      nsems

        ------ Message Queues --------
        key        msqid      owner      perms      used-bytes   messages

- ipcs -l 用于列出系统的限额

        [b@host ~]$ ipcs -l

        ------ Shared Memory Limits --------
        max number of segments = 4096
        max seg size (kbytes) = 4194303
        max total shared memory (kbytes) = 1073741824
        min seg size (bytes) = 1

        ------ Semaphore Limits --------
        max number of arrays = 32000
        max semaphores per array = 32000
        max semaphores system wide = 1024000000
        max ops per semop call = 500
        semaphore max value = 32767

        ------ Messages: Limits --------
        max queues system wide = 32000
        max size of message (bytes) = 65536
        default max size of queue (bytes) = 65536

- ipcs -u 用于列出当前的使用情况

        [b@host ~]$ ipcs -u

        ------ Shared Memory Status --------
        segments allocated 2
        pages allocated 2
        pages resident  2
        pages swapped   0
        Swap performance: 0 attempts     0 successes

        ------ Semaphore Status --------
        used arrays = 3
        allocated semaphores = 3

        ------ Messages: Status --------
        allocated queues = 0
        used headers = 0
        used space = 0 bytes

- ipcs -t 用于列出最后的访问时间

        [b@host ~]$ ipcs -t

        ------ Shared Memory Attach/Detach/Change Times --------
        shmid      owner      attached             detached             changed
        32768      b          May 18 06:46:54      May 18 06:47:43      May 18 06:45:48
        65537      b          May 18 06:45:57      May 18 06:46:08      May 18 06:45:57

        ------ Semaphore Operation/Change Times --------
        semid    owner      last-op                    last-changed

        ------ Message Queues Send/Recv/Change Times --------
        msqid    owner      send                 recv                 change

    

