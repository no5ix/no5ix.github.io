---
title: 服务器开发自我修养专栏-Linux高低精度定时器实现原理
date: 2021-02-06 13:08:06
tags:
- Self-cultivation
categories:
- Self-cultivation
---



# Linux定时器实现原理

## 时间轮定时器-低分辨率实现

Linux 2.6.16之前，内核只支持低精度时钟，内核定时器的**工作方式**：  
1. 系统启动后，会读取时钟源设备(RTC,HPET，PIT…)，初始化当前系统时间。
2. 内核会根据HZ(系统定时器频率，节拍率)参数值，设置时钟事件设备，启动tick(节拍)中断。HZ表示1秒种产生多少个时钟硬件中断，tick就表示连续两个中断的间隔时间。
3. 设置时钟事件设备后，时钟事件设备会定时产生一个tick中断，触发时钟中断处理函数，更新系统时钟,并检测timer wheel，进行超时事件的处理。

在上面工作方式下，Linux 2.6.16 之前，内核软件定时器采用timer wheel多级时间轮的实现机制，维护操作系统的所有定时事件。timer wheel的触发是基于系统tick周期性中断。所以说这之前，linux只能支持ms级别的时钟，随着时钟源硬件设备的精度提高和软件高精度计时的需求，有了高精度时钟的内核设计。

所谓低分辨率定时器，是指这种定时器的计时单位基于jiffies值的计数，也就是说，它的精度只有1HZ，假如你的内核配置的HZ是1000，那意味着系统中的低分辨率定时器的精度就是1ms。早期的内核版本中，内核并不支持高精度定时器，理所当然只能使用这种低分辨率定时器, 后来随着时钟源硬件设备的精度提高和软件高精度计时的需求，才有了[高精度时钟的内核设计](#红黑树定时器-高精度实现)

**. . .**<!-- more -->

### 时间轮算法思想

多级时间轮, 插入/删除/execute复杂度都O(1)

算法思想: 
* 把定时器分为 5 个桶，每桶的粒度分别表示为：`1 jiffies，256 jiffies，256*64 jiffies，256*64*64 jiffies，256*64*64*64 jiffies`，每桶bucket中的slot的数量分别为：`256，64，64，64，64`，能表示的范围为 `2^32` 
* 这好几个bucket, 其中一个bucket叫near是差不多要触发的定时器范围是`[0, 0x100)`, 和几个定时时长比较久的bucket: `[0x100, 0x4000)以及[0x4000, 0x100000)以及[0x100000, 0x4000000)`
* **tick**:
    * 每次tick都检查`jiffies`是否已经又经过一轮 `TVR_MASK(255)` 了, 经过了一轮index就又等于0, 然后就去后面的`bucket[0][INDEX(0)]`里去拿定时器迁移到near里(这个`INDEX(0)宏其实是拿到jiffies_的第9到14位的值`), 如果`INDEX(0)`也等于0, 则说明`bucket[0]`也轮转迁移了一圈了, 接着就需要去`bucket[1]`里拿定时器迁移到`bucket[0]`里, 后面`INDEX(1)`和`INDEX(2)`对应的bucket调整都以此类推, 这就跟水表一样, 小表转一圈需要调整中表, 中表转一圈则要调整大表差不多
    * 为啥可以直接把这个`bucket[0][INDEX(0)]`里的定时器直接迁移到near里呢? 因为在插入的时候就是这么哈希的, 举个比较简单的不准确但是可以说明原理的例子, 假如 near里是存最近60秒过期的定时器, `bucket[0][0]`存的是60到120过期的, `bucket[0][1]`的是120到180过期的, 则jiffies等于60的时候就要把`bucket[0][0]`迁移到near里, jiffies等于120的时候`bucket[0][1]`迁移到near里...
    * 类似于linux的时间轮实现: 假设curr_time=0x12345678，那么下一个检查的时刻为0x12345679。如果`tv1.bucket[0x79]`上链表非空，则下一个检查时刻`tv1.bucket[0x79]`上的定时器节点超时。如果curr_time到了0x12345700，低8位为空，说明有进位产生，这时移出9～14位对应的定时器链表(即正好对应着tv2轮)，把`tv2.bucket[此时9-14位的值]`所对应的timer链表迁移到tv1来，这就完成了一次进位迁移操作。同样地，当curr_time的第9-14位为0时，这表明tv2轮对tv3轮有进位发生，将curr_time第14-19位的值作为下标，移出tv3中对应的定时器链表，然后将它们迁移到tv2去。tv4,tv5依次类推。之所以能够根据curr_time来检查超时链，是因为tv1~tv5轮的度量范围正好依次覆盖了整型的32位：tv1(1-8位)，tv2(9-14位)，tv3(15-20位)，tv4(21-26位)，tv5(27-32位)；而curr_time计数的递增中，低位向高位的进位正是低级时间轮转圈带动高级时间轮走动的过程。
* **插入**: 
    有好几个bucket, 然后用类似于取模哈希的思想先判断还有多久过期的区间, 然后根据过期时间expire取他相应的位放入相应的桶里的某个slot的定时器链表TimerList里即可, 参考下方代码
* **excute**: 
    `near_` 里面的定时器因为都已经在 `addTimerNode` 根据`expire`哈希安插好了, 所以这里 `jiffies_ & TVR_MASK` 出来的index是几, 那就直接从`near_`里取出来执行就完事了,见下方代码
    * 删除: 因为插入的时候还专门另外有个哈希表来保存定时器id和定时器的映射关系, 所有删除的时候就直接根据传入的定时器id来找到定时器本身然后把他标记为已删除, 然后在excute的时候会找到`near_[index]`这个定时器链表TimerList移除
* **删除**:
    惰性删除, 只是标记相关node为被canceled, 然后excute的时候再freeNode 
* **tickless**:
    不嫌麻烦还可以每次从 timer 集合里面选择最先要超时的事件，计算还有多长时间就会超时，作为 select wait 的值，每次都不一样，每次都基本精确，同时不会占用多余 cpu，这叫 tickless，Linux 的 3.x以上版本也支持 tickless 的模式来驱动各种系统级时钟，号称更省电更精确，不过需要你手动打开，FreeBSD 9 以后也引入了 tickless。

### 时间轮有什么缺点

虽然大部分时间里，时间轮可以实现O(1)时间复杂度，但是当有进位发生时，不可预测的O(N)定时器级联迁移时间，这对于低分辨率定时器来说问题不大，可是它大大地影响了定时器的精度；

### 时间轮核心代码

``` cpp
void WheelTimer::addTimerNode(TimerNode* node)
{
    int64_t expires = node->expire;
    uint64_t idx = (uint64_t)(expires - jiffies_);
    TimerList* list = nullptr;
    if (idx < TVR_SIZE) // [0, 0x100)
    {
        int i = expires & TVR_MASK;  // 因为只关心后8位(即TVR_BITS=8)
        list = &near_[i];
    } else if(idx < (1 << (TVR_BITS + TVN_BITS))) // [0x100, 0x4000)
    {
        // 因为不关心后8位(即TVR_BITS=8)的数, 所以直接 expires >> TVR_BITS 了
        // 又因为 TimerList buckets_[WHEEL_BUCKETS][TVN_SIZE] 的第二维为 TVN_SIZE, 所以要 & TVN_MASK
        int i = (expires >> TVR_BITS) & TVN_MASK;
        list = &buckets_[0][i];
    } else if(idx < (1 << (TVR_BITS + 2 * TVN_BITS))) // [0x4000, 0x100000)
    {
    ...
}

// #define INDEX(N) (   ( jiffies_ >> (8 +  (N) * 6)  )        & 1111 11)
#define INDEX(N) ((jiffies_ >> (TVR_BITS + (N) * TVN_BITS)) & TVN_MASK)

// cascades all vectors and executes all expired timer
int WheelTimer::tick(){
    int fired = 0;
    // 每次tick都检查是否已经又经过一轮 TVR_MASK(255) 了,
    // 经过了一轮index就又等于0, 然后就去后面的bucket里找是否有需要调整到near的定时器
    // 就跟水表一样, 小表转一圈需要调整中表, 中表转一圈则要调整大表
    int index = jiffies_ & TVR_MASK;
    if(index == 0) // cascade timers
    {
    if(cascade(0, INDEX(0)) &&
        cascade(1, INDEX(1)) &&
        cascade(2, INDEX(2))
        )
        cascade(3, INDEX(3));
    }
    jiffies_++;
    fired += execute(index);
    return fired;
}

int WheelTimer::execute()
{
    int fired = 0;
    // near 里面的定时器因为都已经在 addTimerNode 根据expire里哈希安插好了,
    // 所以这里 jiffies_ & TVR_MASK 出来的index是几, 那就直接从near_里取出来执行就完事了
    int index = jiffies_ & TVR_MASK;
    TimerList expired;
    near_[index].swap(expired); // swap list
    for (auto node : expired)
    {
        if (!node->canceled && node->cb)
        {
            //printf("wheel node %d triggered at %lld of jiffies %lld\n", node->id, current_, jiffies_);
            node->cb();
            size_--;
            fired++;
        }

        ref_.erase(node->id);
        freeNode(node);
    }
    return fired;

    // cascade all the timers at bucket of index up one level
    bool WheelTimer::cascade(int bucket, int index){
        // swap list
        TimerList list;
        buckets_[bucket][index].swap(list);

        for(auto& node : list){
            if(node->id > 0){
                addTimerNode(node);  // 把各个定时器往前推, 比如条件达成就挪到this->near_里去
            }
        }
        // 如INDEX(N), 当N=0, 因为进入本函数之前, jiffies_ & TVR_MASK 是为 0 的,
        // 说明 jiffies_ 8位以前的高位绝对有不为0的位,
        // jiffies右移8位然后跟TVN_MASK(即63, 即二进制111111, 六位)做且操作之后的结果 index == 0 ,
        // 则说明jiffies大于N=0的这个bucket区间了, 还需要调整下一个区间(即 N+1 这个bucket区间),
        // 就跟水表一样, 小表转一圈需要调整中表, 中表转一圈则要调整大表
        return index == 0;
    }

    // Do lazy cancellation, so we can effectively use vector as container of timer nodes
    bool WheelTimer::Cancel(int id)
    {
        TimerNode* node = ref_[id];
        if (node != nullptr)
        {
            node->canceled = true;
            size_--;
            return true;
        }
        return false;
    }
```


## 红黑树定时器-高精度实现

而随着内核的不断演进，大牛们已经对这种低分辨率定时器的精度不再满足，而且，硬件也在不断地发展，系统中的定时器硬件的精度也越来越高，这也给高分辨率定时器的出现创造了条件。内核从2.6.16开始加入了高精度定时器架构。它可以为我们提供纳秒级的定时精度，以满足对精确时间有迫切需求的应用程序或内核驱动，例如多媒体应用，音频设备的驱动程序等等。

当前内核同时存在新旧timer wheel 和hrtimer两套timer的实现，内核启动后会进行从低精度模式到高精度时钟模式的切换.

### 与时间轮的区别

Linux 2.6.16 ，内核支持了高精度的时钟，内核采用新的定时器hrtimer，其实现逻辑和Linux 2.6.16 之前定时器逻辑区别：  
* hrtimer采用红黑树进行高精度定时器的管理，而不是时间轮；
* 高精度时钟定时器**不在依赖系统的tick中断，而是基于时钟硬件的事件触发**。
* 旧内核的定时器实现依赖于系统定时器硬件定期的tick，基于该tick，内核会扫描timer wheel处理超时事件，会更新jiffies，wall time(墙上时间，现实时间)，process的使用时间等等工作。
* 新的内核不再会直接支持周期性的tick，新内核定时器框架采用了基于高精度时钟硬件的下次中断触发，而不是以前的周期性触发。新内核实现了hrtimer(high resolution timer)于事件触发。

### hrtimer的工作原理

我们知道，低分辨率定时器使用5个链表数组来组织timer_list结构，形成了著名的时间轮概念，对于高分辨率定时器，我们期望组织它们的数据结构至少具备以下条件：  
* 稳定而且快速的查找能力；
* 快速地插入和删除定时器的能力；
* 排序功能；
* 内核的开发者考察了多种数据结构，例如基数树、哈希表等等，最终他们选择了红黑树（rbtree）来组织hrtimer，红黑树已经以库的形式存在于内核中，并被成功地使用在内存管理子系统和文件系统中，随着系统的运行，hrtimer不停地被创建和销毁，新的hrtimer按顺序被插入到红黑树中，树的最左边的节点就是最快到期的定时器，内核用一个hrtimer结构来表示一个高精度定时器

通过将高精度时钟硬件的下次中断触发时间设置为红黑树中最早到期的Timer 的时间，时钟到期后从红黑树中得到下一个 Timer 的到期时间，并设置硬件，如此循环反复。

### 如何在高精度模式下模拟tick

当系统切换到高精度模式后，tick_device被高精度定时器系统接管，不再定期地产生tick事件，我们知道，到目前的版本为止（V3.4），内核还没有彻底废除jiffies机制，系统还是依赖定期到来的tick事件，供进程调度系统和时间更新等操作，大量存在的低精度定时器也仍然依赖于jiffies的计数，所以，尽管tick_device被接管，高精度定时器系统还是要想办法继续提供定期的tick事件。为了达到这一目的，内核使用了一个取巧的办法：既然高精度模式已经启用，可以定义一个hrtimer，把它的到期时间设定为一个jiffy的时间，当这个hrtimer到期时，在这个hrtimer的到期回调函数中，进行和原来的tick_device同样的操作，然后把该hrtimer的到期时间顺延一个jiffy周期，如此反复循环，完美地模拟了原有tick_device的功能。

