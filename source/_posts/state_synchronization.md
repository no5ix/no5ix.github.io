---
title: 网络物理模拟六之状态同步
date: 2017-01-26 11:13:35
tags:
- gafferongames
categories:
- server
---



# 自我总结

状态同步的要点为 : 

- **input+state** : 既通过网络发送输入信息又会发送状态信息来进行同步
- **发送端**
    - **优先级累加器** : 只发送一些重要的实体状态更新, 而不是所有都发. 如果遇到一个物体的状态更新信息不合适放到这个数据包里面，那么就跳过这个物体并尝试下一个。当你序列化完这个数据包以后，将那些已经在这帧更新过的物体在优先级累加器里面的值重置为0，但是那些没有在这帧更新过的物体在优先级累加器里面的值则保持不变。
- **接收端**
    - **抗网络抖动** : 做一个jitter buffer来缓冲数据, 然后以相同时间的间隔均匀取出
    - **应用状态更新** : 一旦你的数据包从抖动缓冲器里面出来，你该在状态更新直接应用这些信息进行仿真。
- **对两边都量化(这里的量化指的是<<{% post_link snapshot_compression 网络物理模拟五之快照压缩 %}>>说的量化压缩技术)** : 如果只有接收端用了量化的数据, 那接收端模拟的结果很可能与发送端不同, 所以要对两边都量化来避免发送端和接收端模拟的差异
- **长时间丢包的平滑处理** : 对于不同的网络断开时间用不同的平滑因子, 来自适应误差
- **增量压缩** : 
    - **相对编码** : 在数据包的包头里面发送最近确认的数据包的序列号（这个数据是从可靠的确认系统里面得到的）然后对每个物体编码相对这个基准帧的偏移量
    - **绝对编码**


# 原文

[原文出处](https://gafferongames.com/post/state_synchronization/)

原文标题 : **State Synchronization** (*Keeping simulations in sync by sending state*)

-------------------


<h2 id="introduction">Introduction</h2>
<p>Hi, I&rsquo;m <a href="https://gafferongames.com/about">Glenn Fiedler</a> and welcome to <strong><a href="https://gafferongames.com/categories/networked-physics/">Networked Physics</a></strong>.</p>
<p>In the <a href="https://gafferongames.com/post/snapshot_compression/">previous article</a> we discussed techniques for compressing snapshots.</p>
<p>In this article we round out our discussion of networked physics strategies with <strong>state synchronization</strong>, the third and final strategy in this article series.</p>
<h2 id="state-synchronization">State Synchronization</h2>
<p>What is state synchronization? The basic idea is that, somewhat like deterministic lockstep, we run the simulation on both sides but, <em>unlike</em> deterministic lockstep, we don&rsquo;t just send input, we send both input <u>and</u> state.</p>
<p>This gives state synchronization interesting properties. Because we send state, we don&rsquo;t need perfect determinism to stay in sync, and because the simulation runs on both sides, objects continue moving forward between updates.</p>
<p>This lets us approach state synchronization differently to snapshot interpolation. Instead of sending state updates for every object in each packet, we can now send updates for only a few, and if we&rsquo;re smart about how we select the objects for each packet, we can save bandwidth by concentrating updates on the most important objects.</p>
<p>So what&rsquo;s the catch? State synchronization is an approximate and lossy synchronization strategy. In practice, this means you&rsquo;ll spend a lot of time tracking down sources of extrapolation divergence and pops. But other than that, it&rsquo;s a quick and easy strategy to get started with.</p>
<h2 id="implementation">Implementation</h2>
<p>Here&rsquo;s the state sent over the network per-object:</p>
<pre>struct StateUpdate
{
    int index;
    vec3f position;
    quat4f orientation;
    vec3f linear_velocity;
    vec3f angular_velocity;
};
</pre>
<p>Unlike snapshot interpolation, we&rsquo;re not just sending visual quantities like position and orientation, we&rsquo;re also sending <em>non-visual</em> state such as linear and angular velocity. Why is this?</p>
<p>The reason is that state synchronization runs the simulation on both sides, so it&rsquo;s <em>always extrapolating</em> from the last state update applied to each object. If linear and angular velocity aren&rsquo;t synchronized, this extrapolation is done with incorrect velocities, leading to pops when objects are updated.</p>
<p>While we must send the velocities, there&rsquo;s no point wasting bandwidth sending (0,0,0) over and over while an object is at rest. We can fix this with a trivial optimization, like so:</p>
<pre>void serialize_state_update( Stream &amp; stream, 
                             int &amp; index, 
                             StateUpdate &amp; state_update )
{
    serialize_int( stream, index, 0, NumCubes - 1 );
    serialize_vector( stream, state_update.position );
    serialize_quaternion( stream, state_update.orientation );
    bool at_rest = stream.IsWriting() ? state_update.AtRest() : false;    
    serialize_bool( stream, at_rest );
    if ( !at_rest )
    {
        serialize_vector( stream, state_update.linear_velocity );
        serialize_vector( stream, state_update.angular_velocity );
    }
    else if ( stream.IsReading() )
    {
        state_update.linear_velocity = vec3f(0,0,0);
        state_update.angular_velocity = vec3f(0,0,0);
    }
}
</pre>
<p>What you see above is a <em>serialize function</em>. It&rsquo;s a trick I like to use to unify packet read and write. I like it because it&rsquo;s expressive while at the same time it&rsquo;s difficult to desync read and write. You can read more about them <a href="https://gafferongames.com/post/serialization_strategies/">here</a>.</p>
<h2 id="packet-structure">Packet Structure</h2>
<p>Now let&rsquo;s look at the overall structure of packets being sent:</p>
<pre>const int MaxInputsPerPacket = 32;
const int MaxStateUpdatesPerPacket = 64;

struct Packet
{
    uint32_t sequence;
    Input inputs[MaxInputsPerPacket];
    int num_object_updates;
    StateUpdate state_updates[MaxStateUpdatesPerPacket];
};
</pre>
<p>First we include a sequence number in each packet so we can determine out of order, lost or duplicate packets. I recommend you run the simulation at the same framerate on both sides (for example 60HZ) and in this case the sequence number can work double duty as the frame number.</p>
<p>Input is included in each packet because it&rsquo;s needed for extrapolation. Like deterministic lockstep we send multiple redundant inputs so in the case of packet loss it&rsquo;s very unlikely that an input gets dropped. Unlike deterministic lockstep, if don&rsquo;t have the next input we don&rsquo;t stop the simulation and wait for it, we continue extrapolating forward with the last input received.</p>
<p>Next you can see that we only send a maximum of 64 state updates per-packet. Since we have a total of 901 cubes in the simulation so we need some way to select the n most important state updates to include in each packet. We need some sort of prioritization scheme.</p>
<p>To get started each frame walk over all objects in your simulation and calculate their current priority. For example, in the cube simulation I calculate priority for the player cube as 1000000 because I always want it to be included in every packet, and for interacting (red cubes) I give them a higher priority of 100 while at rest objects have priority of 1.</p>
<p>Unfortunately if you just picked objects according to their current priority each frame you&rsquo;d only ever send red objects while in a katamari ball and white objects on the ground would never get updated. We need to take a slightly different approach, one that prioritizes sending important objects while also <em>distributing</em> updates across all objects in the simulation.</p>
<h2 id="priority-accumulator">Priority Accumulator</h2>
<p>You can do this with a priority accumulator. This is an array of float values, one value per-object, that is remembered from frame to frame. Instead of taking the immediate priority value for the object and sorting on that, each frame we add the current priority for each object to its priority accumulator value then sort objects in order from largest to smallest priority accumulator value. The first n objects in this sorted list are the objects you should send that frame.</p>
<p>You could just send state updates for all n objects but typically you have some maximum bandwidth you want to support like 256kbit/sec. Respecting this bandwidth limit is easy. Just calculate how large your packet header is and how many bytes of preamble in the packet (sequence, # of objects in packet and so on) and work out conservatively the number of bytes remaining in your packet while staying under your bandwidth target.</p>
<p>Then take the n most important objects according to their priority accumulator values and as you construct the packet, walk these objects in order and measure if their state updates will fit in the packet. If you encounter a state update that doesn&rsquo;t fit, skip over it and try the next one. After you serialize the packet, reset the priority accumulator to zero for objects that fit but leave the priority accumulator value alone for objects that didn&rsquo;t. This way objects that don&rsquo;t fit are first in line to be included in the next packet.</p>
<p>The desired bandwidth can even be adjusted on the fly. This makes it really easy to adapt state synchronization to changing network conditions, for example if you detect the connection is having difficulty you can reduce the amount of bandwidth sent (congestion avoidance) and the quality of state synchronization scales back automatically. If the network connection seems like it should be able to handle more bandwidth later on then you can raise the bandwidth limit.</p>
<h2 id="jitter-buffer">Jitter Buffer</h2>
<p>The priority accumulator covers the sending side, but on the receiver side there is much you need to do when applying these state updates to ensure that you don&rsquo;t see divergence and pops in the extrapolation between object updates.</p>
<p>The very first thing you need to consider is that network jitter exists. You don&rsquo;t have any guarantee that packets you sent nicely spaced out 60 times per-second arrive that way on the other side. What happens in the real world is you&rsquo;ll typically receive two packets one frame, 0 packets the next, 1, 2, 0 and so on because packets tend to clump up across frames. To handle this situation you need to implement a jitter buffer for your state update packets. If you fail to do this you&rsquo;ll have a poor quality extrapolation and pops in stacks of objects because objects in different state update packets are slightly out of phase with each other with respect to time.</p>
<p>All you do in a jitter buffer is hold packets before delivering them to the application at the correct time as indicated by the sequence number (frame number) in the packet. The delay you need to hold packets for in this buffer is a much smaller amount of time relative to interpolation delay for snapshot interpolation but it&rsquo;s the same basic idea. You just need to delay packets just enough (say 4-5 frames @ 60HZ) so that they come out of the buffer properly spaced apart.</p>
<h2 id="applying-state-updates">Applying State Updates</h2>
<p>Once the packet comes out of the jitter how do you apply state updates? My recommendation is that you should snap the physics state hard. This means you apply the values in the state update directly to the simulation.</p>
<p>I recommend against trying to apply some smoothing between the state update and the current state at the simulation level. This may sound counterintuitive but the reason for this is that the simulation extrapolates from the state update so you want to make sure it extrapolates from a valid physics state for that object rather than some smoothed, total bullshit made-up one. This is especially important when you are networking large stacks of objects.</p>
<p>Surprisingly, without any smoothing the result is already pretty good:</p>
<video preload="auto" controls="controls" width="100%">
<source src="/img/state_synchronization_uncompressed_1.mp4" type="video/mp4" />
Your browser does not support the video tag.
</video>
<p>As you can see it&rsquo;s already looking quite good and barely any bandwidth optimization has been performed. Contrast this with the first video for snapshot interpolation which was at 18mbit/sec and you can see that using the simulation to extrapolate between state updates is a great way to use less bandwidth.</p>
<p>Of course we can do a lot better than this and each optimization we do lets us squeeze more state updates in the same amount of bandwidth. The next obvious thing we can do is to apply all the standard quantization compression techniques such as bounding and quantizing position, linear and angular velocity value and using the smallest three compression as described in <a href="https://gafferongames.com/post/snapshot_compression/">snapshot compression</a>.</p>
<p>But here it gets a bit more complex. We are extrapolating from those state updates so if we quantize these values over the network then the state that arrives on the right side is slightly different from the left side, leading to a slightly different extrapolation and a pop when the next state update arrives for that object.</p>
<video preload="auto" controls="controls" width="100%">
<source src="/img/state_synchronization_uncompressed_2.mp4" type="video/mp4" />
Your browser does not support the video tag.
</video>
<h2 id="quantize-both-sides">Quantize Both Sides</h2>
<p>The solution is to quantize the state on both sides. This means that on both sides before each simulation step you quantize the entire simulation state as if it had been transmitted over the network. Once this is done the left and right side are both extrapolating from quantized state and their extrapolations are very similar.</p>
<p>Because these quantized values are being fed back into the simulation, you&rsquo;ll find that much more precision is required than snapshot interpolation where they were just visual quantities used for interpolation. In the cube simulation I found it necessary to have 4096 position values per-meter, up from 512 with snapshot interpolation, and a whopping 15 bits per-quaternion component in smallest three (up from 9). Without this extra precision significant popping occurs because the quantization forces physics objects into penetration with each other, fighting against the simulation which tries to keep the objects out of penetration. I also found that softening the constraints and reducing the maximum velocity which the simulation used to push apart penetrating objects also helped reduce the amount of popping.</p>
<video preload="auto" controls="controls" width="100%">
<source src="/img/state_synchronization_uncompressed_3.mp4" type="video/mp4" />
Your browser does not support the video tag.
</video>
<p>With quantization applied to both sides you can see the result is perfect once again. It may look visually about the same as the uncompressed version but in fact we&rsquo;re able to fit many more state updates per-packet into the 256kbit/sec bandwidth limit. This means we are better able to handle packet loss because state updates for each object are sent more rapidly. If a packet is lost, it&rsquo;s less of a problem because state updates for those objects are being continually included in future packets.</p>
<p>Be aware that when a burst of packet loss occurs like <sup>1</sup>&frasl;<sub>4</sub> a second with no packets getting through, and this is inevitable that eventually something like this will happen, you will probably get a different result on the left and the right sides. We have to plan for this. In spite of all effort that we have made to ensure that the extrapolation is as close as possible (quantizing both sides and so on) pops can and will occur if the network stops delivering packets.</p>
<h2 id="visual-smoothing">Visual Smoothing</h2>
<p>We can cover up these pops with smoothing.</p>
<p>Remember how I said earlier that you should not apply smoothing at the simulation level because it ruins the extrapolation? What we&rsquo;re going to do for smoothing instead is calculating and maintaining position and orientation error offsets that we reduce over time. Then when we render the cubes in the right side we don&rsquo;t render them at the simulation position and orientation, we render them at the simulation position + error offset, and orientation * orientation error.</p>
<p>Over time we work to reduce these error offsets back to zero for position error and identity for orientation error. For error reduction I use an exponentially smoothed moving average tending towards zero. So in effect, I multiply the position error offset by some factor each frame (eg. 0.9) until it gets close enough to zero for it to be cleared (thus avoiding denormals). For orientation, I slerp a certain amount (0.1) towards identity each frame, which has the same effect for the orientation error.</p>
<p>The trick to making this all work is that when a state update comes in you take the current simulation position and add the position error to that, and subtract that from the new position, giving the new position error offset which gives an identical result to the current (smoothed) visual position.</p>
<p>The same process is then applied to the error quaternion (using multiplication by the conjugate instead of subtraction) and this way you effectively calculate on each state update the new position error and orientation error relative to the new state such that the object appears to have not moved at all. Thus state updates are smooth and have no immediate visual effect, and the error reduction smoothes out any error in the extrapolation over time without the player noticing in the common case.</p>
<p>I find that using a single smoothing factor gives unacceptable results. A factor of 0.95 is perfect for small jitters because it smooths out high frequency jitter really well, but at the same time it is too slow for large position errors, like those that happen after multiple seconds of packet loss:</p>
<video preload="auto" controls="controls" width="100%">
<source src="/img/state_synchronization_uncompressed_4.mp4" type="video/mp4" />
Your browser does not support the video tag.
</video>
<p>The solution I use is two different scale factors at different error distances, and to make sure the transition is smooth I blend between those two factors linearly according to the amount of positional error that needs to be reduced. In this simulation, having 0.95 for small position errors (25cms or less) while having a tighter blend factor of 0.85 for larger distances (1m error or above) gives a good result. The same strategy works well for orientation using the dot product between the orientation error and the identity matrix. I found that in this case a blend of the same factors between dot 0.1 and 0.5 works well.</p>
<p>The end result is smooth error reduction for small position and orientation errors combined with a tight error reduction for large pops. As you can see above you don&rsquo;t want to drag out correction of these large pops, they need to be fast and so they&rsquo;re over quickly otherwise they&rsquo;re really disorienting for players, but at the same time you want to have really smooth error reduction when the error is small hence the adaptive error reduction approach works really well.</p>
<video preload="auto" controls="controls" width="100%">
<source src="/img/state_synchronization_uncompressed_5.mp4" type="video/mp4" />
Your browser does not support the video tag.
</video>
<h2 id="delta-compression">Delta Compression</h2>
<p>Even though I would argue the result above is probably good enough already it is possible to improve the synchronization considerably from this point. For example to support a world with larger objects or more objects being interacted with. So lets work through some of those techniques and push this technique as far as it can go.</p>
<p>There is an easy compression that can be performed. Instead of encoding absolute position, if it is within a range of the player cube center, encode position as a relative offset to the player center position. In the common cases where bandwidth is high and state updates need to be more frequent (katamari ball) this provides a large win.</p>
<p>Next, what if we do want to perform some sort of delta encoding for state synchronization? We can but it&rsquo;s quite different in this case than it is with snapshots because we&rsquo;re not including every cube in every packet, so we can&rsquo;t just track the most recent packet received and say, OK all these state updates in this packet are relative to packet X.</p>
<p>What you actually have to do is per-object update keep track of the packet that includes the base for that update. You also need to keep track of exactly the set of packets received so that the sender knows which packets are valid bases to encode relative to. This is reasonably complicated and requires a bidirectional ack system over UDP. Such a system is designed for exactly this sort of situation where you need to know exactly which packets definitely got through. You can find a tutorial on how to implement this in <a href="https://gafferongames.com/post/reliability_and_flow_control/">this article</a>.</p>
<p>So assuming that you have an ack system you know with packet sequence numbers get through. What you do then is per-state update write one bit if the update is relative or absolute, if absolute then encode with no base as before, otherwise if relative send the 16 bit sequence number per-state update of the base and then encode relative to the state update data sent in that packet. This adds 1 bit overhead per-update as well as 16 bits to identify the sequence number of the base per-object update. Can we do better?</p>
<p>Yes. In turns out that of course you&rsquo;re going to have to buffer on the send and receive side to implement this relative encoding and you can&rsquo;t buffer forever. In fact, if you think about it you can only buffer up a couple of seconds before it becomes impractical and in the common case of moving objects you&rsquo;re going to be sending the updates for same object frequently (katamari ball) so practically speaking the base sequence will only be from a short time ago.</p>
<p>So instead of sending the 16 bit sequence base per-object, send in the header of the packet the most recent acked packet (from the reliability ack system) and per-object encode the offset of the base sequence relative to that value using 5 bits. This way at 60 packets per-second you can identify an state update with a base half a second ago. Any base older than this is unlikely to provide a good delta encoding anyway because it&rsquo;s old, so in that case just drop back to absolute encoding for that update.</p>
<p>Now lets look at the type of objects that are going to have these absolute encodings rather than relative. They&rsquo;re the objects at rest. What can we do to make them as efficient as possible? In the case of the cube simulation one bad result that can occur is that a cube comes to rest (turns grey) and then has its priority lowered significantly. If that very last update with the position of that object is missed due to packet loss, it can take a long time for that object to have its at rest position updated.</p>
<p>We can fix this by tracking objects which have recently come to rest and bumping their priority until an ack comes back for a packet they were sent in. Thus they are sent at an elevated priority compared with normal grey cubes (which are at rest and have not moved) and keep resending at that elevated rate until we know that update has been received, thus &ldquo;committing&rdquo; that grey cube to be at rest at the correct position.</p>
<h2 id="conclusion">Conclusion</h2>
<p>And that&rsquo;s really about it for this technique. Without anything fancy it&rsquo;s already pretty good, and on top of that another order of magnitude improvement is available with delta compression, at the cost of significant complexity!</p>




<h1 id="译文">译文</h1>


[译文出处](http://gad.qq.com/program/translateview/7164500)


<div class="WordSection1"><b style="margin: 0cm 0cm 0.0001pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style='font-size:12.0pt;line-height:240%;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222;font-weight:normal'>译者：陈敬凤（<span>nunu</span>）<span>    </span>审校：崔国军（飞扬<span>971</span>）</span> </b><p class="MsoNormal"><span> </span> </p><p class="MsoNormal" align="left">
<h2 id="介绍">介绍</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>大家好，我是格伦·菲德勒。欢迎阅读《网络物理模拟》的系列文章，这个系列文章的主题是关于如何将一个物理模拟通过网络通信进行同步。</span> </p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>在这篇文章，我们将讨论第三种也是最后一种同步的策略：状态同步。</span> </p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left">
<h2 id="状态同步概念">状态同步概念</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>在我看来，这是最简单的同步策略也是最容易理解的同步策略。事实上，这是我开始实现《雇佣兵<span>2</span>：战火纷飞》的网络物理部分的时候我首先尝试的同步策略。这个同步策略的基本想法是我们在网络的两侧同时运行仿真，但是与具有确定性的帧同步不同的是帧同步会通过网络发送输入信息并且依赖完美的确定性来保持同步，这种同步策略是既通过网络发送输入信息又会发送状态信息来进行同步。</span> </p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>这就赋予了状态同步与之前的同步策略完全不同的属性。与具有确定性的帧同步不同，这种同步策略不需要要求确定性来保持同步，因为我们可以迅速的通过网络发送状态来纠正任何的偏差。这种同步策略也跟快照信息的插值不同，如果一个对象不在数据包里面的话，这个物体还是会继续移动，因为网络两侧的仿真都在持续的运行。</span> </p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>正是由于这一特性，状态同步的实现方法才会与快照信息的插值有差别。不再是在每个数据包里面发送每个物体的状态更新信息，我们可以只对几个对象进行更新。如果我们在每个数据包选择要同步的物体的时候方案比较聪明的话，我们可以更有效地利用带宽，把注意力主要集中在最重要的物体的更新上，而那些不那么重要的物体，他们的更新信息可以以一个较低的速率进行发送。这样的话，相比较快照信息插值这种要在一个快照里面包括所有物体的方法，状态同步这种方法使用的带宽可以减少一个数量级。此外，状态同步这种方法不会在网络延迟之上还要附加插值带来的延迟，因为它相比较于快照信息插值这种方法，延迟也更低。</span> </p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>这样做的代价是状态同步是一个近似和有损的同步策略。如果推送信息的时候出现了一些问题导致大量的数据包丢失的话，远程的模拟仿真使用的是过期的数据进行预测。根据我的经验，如果使用这个同步策略的话，你会花很多时间追踪由于进行预测所带来的差异。如果使用这个同步策略的话，在大量物体堆叠的时候，会看到很多物体的移动不正常，并且很难精确地追查。在这篇文章中，我会告诉你如何追踪并通过网络发送量化和压缩的物理状态来减少分歧的根源。</span> </p><p class="MsoNormal" align="left">
<h2 id="实现">实现</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>让我们从实际的实现来看下这个同步策略。这里是每个发送的对象的网络状态：

``` c++
struct StateUpdate 
{
    int index;
    vec3f position;
    quat4f orientation;
    vec3f linear_velocity;
    vec3f angular_velocity;
};
```

需要注意的是，我们发送的不仅仅是一些像位置、方向这样的视觉信息，这个地方与快照信息插值那种方法相同，我们还发送了很多非视觉的物体状态信息，比如线性速度和角速度，这是与快照信息插值那种方法不同的地方。这么做是必要的是因为物理仿真需要对每个物体最近的状态进行外推。因此，状态更新需要提供所有进行外推所需的信息，以便能够正确的进行推测。如果一个物体的速度信息没有发送的话，在预测物体前进的时候，就会使用一个不正确的速度信息，这将导致下一次物体信息进行更新的时候有一个拉扯。</span> </p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>当我们在网络上对状态更新进行序列化的时候，没有必要对不动的物体浪费网络带宽，为这些不动的物体发送什么<span>(0,0,0)</span>来表示线性速度和角速度。我们可以做一个简单的优化，通过把物体的静止状态包含在内来给每个静止的物体节省<span>24</span>字节的带宽：

``` c++
void serialize_state_update( Stream & stream,
                             int & index,
                             StateUpdate & state_update )
{
    serialize_int( stream, index, 0, NumCubes - 1 );
    serialize_vector( stream, state_update.position );
    serialize_quaternion( stream, state_update.orientation );
    bool at_rest = stream.IsWriting() ? state_update.AtRest() : false;   
    serialize_bool( stream, at_rest );
 
    if ( !at_rest )
    {
        serialize_vector( stream, state_update.linear_velocity );
        serialize_vector( stream, state_update.angular_velocity );
    }
    else if ( stream.IsReading() )
    {
        state_update.linear_velocity = vec3f(0,0,0);
        state_update.angular_velocity = vec3f(0,0,0);
    }
}
```

上面的代码就是我所谓的序列化功能。这里面有一个我喜欢的小技巧来统一位打包器的读取和写入函数，它们通常是分开实现的。这个函数会在两种不同的上下文中进行调用：写入的时候和读取的时候。你可以通过<span>IsReading/IsWriting</span>函数来知道自己目前处在哪个上下文。我喜欢这个技巧的原因是如何读取和写入功能统一在一个函数的时候，读取和写入的不同步就会很少发生。如果你希望读取和写入功能统一在一起并且像我这样进行数据包的数据，请参考</span><span><a rel='nofollow' href="https://gafferongames.com/post/serialization_strategies/"><span><span>这里</span></span></a></span><span style="color: rgb(40, 40, 40);"></span><span style='font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>。</span> </p><span style="color: rgb(34, 34, 34);">
<h2 id="数据包结构体">数据包结构体</h2>
<span style="font-family:微软雅黑;font-size:medium;">当把状态更新写入的时候，如果这个物体是静止不动的话，这个函数其实只序列化了一比特的信息而不会更新线性速度和角速度的信息。如果这个物体不是静止不动的话，会把线性速度和角速度的信息写入之前先写入一比特的信息。在从数据包进行读取的时候，代码会读取这个比特位，如果这个比特位是<span>0</span>的话，会从这个比特流里面读取线性速度和角速度的信息，否则的话，会把物体的线性速度和角速度全部清为（<span>0,0,0</span>）。这是一个非常简单而有效的无损带宽压缩策略能够针对静止不动的物体进行数据的压缩，能够节省将近一半的带宽。</span></span><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>接下来让我们看一下被发送的数据包的结构：

``` c++
const int MaxInputsPerPacket = 32;
const int MaxStateUpdatesPerPacket = 64;
 
 
struct Packet
{
    uint32_t sequence;
    Input inputs[MaxInputsPerPacket];
    int num_object_updates;
    StateUpdate state_updates[MaxStateUpdatesPerPacket];
};
```

从上面的数据包结构中，你可以看到，首先登场的是我们在每个数据包包含的序列号，通过这个数据信息我们可以判断数据包是否出故障、丢失或者重复。我强烈建议你在网络两侧的运行都按照相同的帧速率（比如说<span>60fps</span>）进行仿真。在这种情况下，你还可以给序列号赋予另外一重任务：作为状态更新的帧号。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">输入信息被包含在每个数据包里面，这是因为仿真需要输入信息才能进行外推。当仿真在网络的另外一侧运行的时候，我们希望通过状态更新的信息以及运行玩家相同的输入信息来往前预测后续状态的信息，并且希望预测出来的状态能够和真实的状态尽可能的接近。就跟具有确定性的帧同步一样，我们发送了多个冗余输入信息，这样即使在有包丢失的情况下，输入信息也不太可能完全被丢弃而不能到达网络的另外一端，但是跟具有确定性的帧同步不一样的是，就算是最坏的情况下（也就是我们没有收到后续的输入信息的情况），我们本地的仿真也不会停止并且等待后续的输入信息的到来，我们还是会根据最后收到的输入信息继续往前模拟。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">接下来，你可以看到，在一个数据包里面我们最多发送<span>64</span>个状态更新。我们在仿真的场景中一共有<span>901</span>个立方体，所以我们需要一些方法来从这<span>901</span>个立方体里面选出一些最重要的立方体，在每一个数据包进行数据更新。我们需要某种优先级方案，这样我们才能找到最重要的物体，允许我们只会很频繁的发送最重要的物体的状态信息，而那些不怎么重要的物体的更新就会不那么的频繁，零零散散的更新，这样保证所有对象都有机会进行更新和发送，但是又能让最重要的那些物体始终得到更新。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">这样就要求在仿真的每一帧开始的时候遍历所有的物体并且计算它们当前的优先级。让我们举个简单的例子来说，在立方体模拟这个场景中，我把玩家立方体的优先级设为<span>100000</span>，因为我希望玩家立方体的更新信息能够包含在每个数据包里面，而对于发生交互的立方体（那些红色的立方体），我赋予它们的优先级为<span>100</span>，而所有静止不动的立方体，优先级为<span>1</span>。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">非常遗憾的是如果只有这一个机制的话，是不足以公平分配对象的更新的，这是因为如果你刚刚仅仅是在每一帧对物体的当前优先级进行了排序，这样的话，如果人物立方体和红色立方体有交互的话，那么就永远只有红色立方体的信息会被发送，而地面上的白色立方体则永远不会更新。我们需要一个稍微不同的方法，优先发送重要的对象，同时也会在仿真的过程让那些不重要的物体也有更新的机会。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);">
<h2 id="优先级累加器">优先级累加器</h2>
<span style="font-family:微软雅黑;font-size:medium;">你可以通过优先级累加器做到这一点。这是一组浮点数值，每个对象都会有一个对应的浮点数值，在帧与帧之间会一直保留。有了这个值以后，不再是根据当前帧中这个物体的重要性进行排序，而是在每一帧中将每个物体的重要性加到这个优先级累加器中，然后对优先级累加器的值进行从大到小进行排序。这个排序的顺序中前面的物体就是这一帧中你应该发送的物体。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">你可以为所有的<span>N</span>个物体发送状态更新信息，但是通常情况下你的带宽会有一些限制，比如说你需要控制在<span>256k</span>比特每秒。尊重这个带宽限制是很容易的。只要计算出你的数据包Header有多大，并且计算下数据包的preamble部分有多大（这主要是指序号、标记哪些物体在这个数据包等信息），这样就能计算出来你的数据包还剩下多少字节，可以通过计划传递多少个物体的更新信息来确保带宽小于约定的最大带宽。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">然后根据它们的优先级累加器里面的值选取数目和上面计算相符合的<span>n</span>个最重要的物体，然后用这<span>n</span>个最重要的物体的更新信息来构建你的数据包。对这<span>n</span>个最重要的物体进行依次遍历并测试它们的数据更新信息是否应该放在这个数据包里面。如果遇到一个物体的状态更新信息不合适放到这个数据包里面，那么就跳过这个物体并尝试下一个。当你序列化完这个数据包以后，将那些已经在这帧更新过的物体在优先级累加器里面的值重置为<span>0</span>，但是那些没有在这帧更新过的物体在优先级累加器里面的值则保持不变。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">通过使用这个办法，刚才检测不合适放到数据包的物体的更新信息会被首先包含在下一帧的数据包里面。</span></span><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">使用这种同步策略，所需的带宽甚至可以动态调整。这使得这种同步策略可以很容易的根据不断变化的网络条件来调整状态同步的信息量，让我们举个简单的例子来说，如果你发现连接有困难，就可以减少发送所占的带宽（拥塞避免），这样状态同步的规模会逐步的自动回复回来。如果网络连接似乎可以处理更多的带宽，那么就可以把带宽限制提高。</span></span><span style="font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);">我们这里所做的处理主要是在网络发送这一端。</span></span></div><div class="WordSection1"><span style="font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);"><br  /></span></span></div><div class="WordSection1"><span style="font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);"><br  /></span></span></div><div class="WordSection1"><span style="font-family:微软雅黑;font-size:medium;">
<h2 id="抖动缓冲区">抖动缓冲区</h2>
<span style="color: rgb(34, 34, 34);">对物体做了优先级的排序，并且在每帧里面更新物体在优先级累加器里面的值，并在每次发送数据包的时候只发送<span>n</span>个最重要的物体。但是在网络接收这一端，还有很多需要做的事情，比如当应用接收过来的状态更新信息的时候，如何避免与之前预测的物体状态信息之间的差异会被玩家感觉到。</span></span></div><div class="WordSection1"><span style="font-family:微软雅黑;font-size:medium;"><span><span style="color:#222222;"><br  /></span></span><span style="color: rgb(34, 34, 34);">你需要考虑的第一件事情是，网络抖动的存在。你没有任何办法来确保你发送的数据包就是完美的是每秒<span>60</span>次的频率抵达网络的另外一侧。在现实世界中会发生的事情是你可能在一帧中收到两个数据包，然后在下一帧一个数据包也收不到，然后下面几帧可能是<span>1</span>个，<span>2</span>个或者<span>0</span>个。为了处理这种情况，你需要实现一个抖动缓冲器来保存你的状态更新数据包。</span></span></div><div class="WordSection1"><span style="font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);"><br  /></span></span></div><div class="WordSection1"><span style="font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);">如果你不这样做，所做的推测质量就很难保证而且会出现对象堆叠的情况，这是因为在不同的状态更新数据包里面，每一个物体的信息都会有些轻微的变化。</span></span><span style="color: rgb(33, 33, 33);"><span style="font-family:微软雅黑;font-size:medium;"> </span></span><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">在抖动缓冲器你所要做的事情就是保存这些数据包，然后根据数据包里面的序号（其实也就是帧号了）来在正确的时间将数据包发给应用程序处理。你需要在这个缓冲区来保存数据包所导致的延迟相比较快照信息插值所带来的延迟是一段非常微小的时间，但是这两种同步策略的基本思想是一致的。你只要稍微延迟一下数据包让时间刚刚好就好（比如说每秒<span>60</span>次更新的情况延迟个<span>4-5</span>帧），这样数据包就能够以合适的间隔从缓冲区里面出来到达应用程序。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);">
<h2 id="应用状态更新">应用状态更新</h2>
<span style="font-family:微软雅黑;font-size:medium;">一旦你的数据包从抖动缓冲器里面出来，你该如何使用数据包的信息进行状态更新呢？我的建议是，你要努力对齐这种状态。在状态更新直接应用这些信息进行仿真。我反对在状态更新和当前仿真的目前状态之间做一些平滑的更替。这听起来可能有悖常理，但这样做的原因是，当前有些物体的状态可能是根据之前状态推测出来的，所以你要保证这个物体的预测信息是从物体有效的物理状态出发，而不是一些平滑出来的完全是虚假的数据出发。这在你有大量的物体对象的时候会格外的重要。</span></span><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">到目前为止，我们已迅速建立了一个实用的同步策略而没做有太多的工作。事实上，这种同步策略已经足够好了，已经完全可以在互联网上进行游戏对战了，并且它对丢包、抖动和带宽限制都处理的相当不错。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">【视频1：</span></span><span style="color:#222222;font-family:微软雅黑;font-size:medium;">cube_state_sync_uncompressed</span>】</div><div class="WordSection1">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/state_synchronization_uncompressed_1.mp4" type="video/mp4" />
</video>

<br  /></div><div class="WordSection1"><br  /><span style="font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);">正如你可以看到的那样，这种同步策略已经看上去相当不错了，并且几乎没有做任何的带宽优化。与快照信息插值那种策略的第一次<span>18m</span>每秒的信息量相比，你可以看到在状态更新之间进行状态的推测是使用更少的带宽的好方法。</span><span><br  /></span><span style="color: rgb(34, 34, 34);">当然，我们可以做得比现在的状态好的多，每次我们做优化的时候我们都可以使用相同的带宽来传递更多的物体状态更新信息。我们可以做的下一个明显有效果的事情是应用所有的标准量化压缩技术，比如压缩边界和量化位置、线性速度和角速度的值以及如同《网络物理模拟五之快照压缩》里面的描述的<span>“</span>最小的三个变量<span>”</span>方法。</span></span><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">但在这里它变得更复杂一点。我们从这些状态更新向前进行推测，所以如果我们量化这些通过网络传递的值的话，那么到达右侧的状态将与左侧的状态稍有不同，这会让推测变得更加不准，并且当下一个状态更新到达的时候会出现一些拉扯现象。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">【视频2： </span></span><span style="color:#222222;font-family:微软雅黑;font-size:medium;">cube_state_sync_compressed</span>】</div><div class="WordSection1">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/state_synchronization_uncompressed_2.mp4" type="video/mp4" />
</video>

<br  /></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;"><br  /></span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);">
<h2 id="对两边都量化">对两边都量化</h2>
<span style="font-family:微软雅黑;font-size:medium;">解决的办法是量化两侧的状态。这意味着，在每一个仿真进行一次更新之前，你要对网络的两侧同时量化整个模拟状态，就好像它们都已经在网络上传输了一样。一旦这样做了的话，左侧和右侧都是从量化的状态进行推测，这样它们的推测结果就会非常的接近。</span></span><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">由于这些量化以后的值会被反馈到仿真中去，你会发现这种方法对精确度的要求比快照信息插值的方法所要求的精确度要高的多，因为在快照信息插值的方法里面，使用的数据只是用来插值的视觉信息。在立方体模拟这个情况下，我发现有必要对于每米要有<span>4096</span>个位置的精度，而在快照信息插值的方法里每米只要有<span>512</span>个位置的精度就可以了，所以四元数最小的三个分量每个要<span>15</span>比特位（在快照信息插值的方法里四元数最小的三个分量每个只要<span>9</span>个比特位的信息就行）。如果没有这种额外的精度出现，就非常容易出现物体的拉扯的情况，这是因为量化以后的数据会迫使物理对象相互渗透，这与模拟要所求的尽量保持物理对象不相互渗透的努力是背道而驰的。我还发现，软化约束以及减少模拟用于推开相互渗透的物理对象的最大速度也有助于减少出现物体拉扯的情况。</span></span></div><div class="WordSection1"><span style="color: rgb(34, 34, 34);"><span style="font-family:微软雅黑;font-size:medium;">【视频3： </span></span><span style="color:#222222;font-family:微软雅黑;font-size:medium;">cube_state_sync_quantize_both_sides</span>】</div><div class="WordSection1">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/state_synchronization_uncompressed_3.mp4" type="video/mp4" />
</video>

<br  /></div><div class="WordSection1"><br  /><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;">
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>在量化应用于网络两侧的模拟以后，就可以再次看到结果是比较完美的。这种处理以后，看起来视觉效果与未压缩版本差不多，但事实上通过这种方案我们能够适应每个包进行更多的状态更新，同时还能满足每秒<span>256</span>比特的带宽限制。这意味着我们能够更好地处理数据包的丢失，因为每一个对象的状态更新可以更迅速的发送。如果出现数据包丢失的情况，对整个模拟来说也会引发更少的问题，这是因为通过未来到来的书包正在持续不断地对这些物体进行状态更新。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>请注意如果出现数据包的集中丢弃的情况，比如说在四分之一秒的时间没有数据包通过，这种情况是不可避免的，总是会发生一些这样的事情，你可能会在网络的两侧得到完全不同的结果。我们必须为这种情况进行规划。我们会尽一切努力来确保外推是尽可能与实际结果相接近的（采用在网络的两侧进行量化以及其他一些方案），但是由于网络停止传输数据包，还是会发生各种拉扯和不准确的情况。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;">
<h2 id="视觉平滑">视觉平滑</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>还记得我之前说过的那个事情么？你不应该对模拟这一侧使用平滑算法，因为它会对外推有不好的影响吗<span>? </span>我们要做的不是平滑而是计算和维护位置和方向的误差补偿，这个量会随着时间而减少。然后当我们在网络的右侧渲染立方体的时候，我们并不是用模拟的位置和方向对这些立方体进行渲染，我们是用模拟的位置和方向再加上误差补偿来对这些立方体进行渲染。位置信息是模拟位置信息加上误差补偿，方向信息是模拟的方向信息再乘以方向的误差补偿。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>随着时间的推移，我们努力减少这些误差补偿，让位置的误差补偿尽量趋近于<span>0</span>，而方向的误差补偿尽量趋近于<span>一致</span>。为了减少误差，我使用了一个指数平滑的移动，平均线趋近零。所以实际上，我用每一帧的位置误差乘以某个系数（比如说是<span>0.9</span>），直到它接近于零而被清除<span>(</span>这样就避免了突变<span>)</span>。对于方向而言，我用某一个固定的量（比如说是<span>0.1</span>）来对每一帧的标准向量进行球面插值，这个可以达到方向误差相同的效果。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>让所有事情都能够正常运行的诀窍在于当一个状态更新数据包到达的时候，你获取当前的模拟位置信息，并把位置误差添加上去，然后再从新的位置里面减去这个值，这样就可以让新位置的位置误差和当前的视觉位置比较一致（平滑）。然后把相同的过程应用于四元数误差（使用乘法的共轭而不是减法来与基准方向信息进行叠加），通过这种方法你就可以有效的计算在每个状态更新数据包到达的时候，相对于新的状态下新的位置误差和方向误差，这样处理的话物体看上去就根本没有进行任何的移动。因此状态更新的非常平滑，没有任何突然移动的视觉效果，而且可以随着时间慢慢减少由于推断带来的误差而通常情况下这么处理不会让玩家注意到。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>我发现只使用一个单独的平滑因子会产生不可接受的结果。平滑因子<span>0.95</span>对于那些小的抖动来说是非常完美的，因为它对那些高频抖动的平滑是非常完美的，但是它对于大的位置误差来说平滑的太慢了，比如说发生了好几秒数据包丢失以后，物体的位置和实际位置差的比较大，这时候用这个因子来平滑就太慢了：</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>【视频4：</span><span style="color:#222222;font-family:&#39;微软雅黑, sans-serif&#39;;"><span style="font-size: 16px;">cube_state_sync_basic_smoothing</span></span><span style="color: rgb(34, 34, 34); font-family: 微软雅黑, sans-serif; font-size: 12pt;">】</span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/state_synchronization_uncompressed_4.mp4" type="video/mp4" />
</video>

<span style="color: rgb(34, 34, 34); font-family: 微软雅黑, sans-serif; font-size: 12pt;"><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style="color: rgb(34, 34, 34); font-family: 微软雅黑, sans-serif; font-size: 12pt;"><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>我使用的解决方案是针对不同的误差距离使用两个不同的平滑因子，并且我会根据需要减少的位置误差的大小来对这两个平滑因子进行线性的混合来让过渡非常的平滑。在这个模拟中，我使用的是<span>0.95</span>来平滑小的位置误差<span>(</span>针对<span>25</span>厘米或者误差更小的情况<span>)</span>，而对于大一点的距离而言会使用一个更严格的混合系数<span>0.85(</span>针对<span>1</span>米或者误差更大的情况<span>)</span>，这给出了一个非常好的结果。对于方向而言，相同的策略适用于对方向误差和单位矩阵使用点积的情况。我发现在这种情况下，混合系数分别采用<span>0.1</span>和<span>0.5</span>的效果就非常的好。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>最终的结果是对小的位置误差和方向误差的平滑操作与对大的位置误差和方向误差的快速收敛很好的结合在了一起。正如你在上面看到的那样，你不想拖着一直不处理这些大的位置误差和方向误差，这些大的位置误差和方向误差需要被快速的解决否则它们会给玩家造成非常大的困扰，但是同时当位置误差和方向误差很小的时候你希望这个误差减少的过程能够非常的平滑，因此自适应误差减少方法效果很好。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>【视频5：</span><span style="color:#222222;font-family:&#39;微软雅黑, sans-serif&#39;;"><span style="font-size: 16px;">cube_state_sync_adaptive_smoothing.mp4</span></span><span style="color: rgb(34, 34, 34); font-family: 微软雅黑, sans-serif; font-size: 12pt;">】</span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/state_synchronization_uncompressed_5.mp4" type="video/mp4" />
</video>

<span style="color: rgb(34, 34, 34); font-family: 微软雅黑, sans-serif; font-size: 12pt;"><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style="color: rgb(34, 34, 34); font-family: 微软雅黑, sans-serif; font-size: 12pt;"><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;">
<h2 id="增量压缩">增量压缩</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>尽管我认为上述结果可能已经足够好了，从这一点上来看可以大大提高同步的质量。让我们举些简单的例子来说明，比如支持一个有大量对象的世界或者有更多的对象与之交互。所以让我们通过一些技术上的改进，来推动这项技术尽可能的完美。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>有一种简单的压缩，可以立刻执行。不再是编码绝对位置，如果位置是在玩家立方体中心的某个范围之内的话，就会以玩家的中心位置的偏移量来进行编码。如果是常见情况下，带宽很高而且状态更新需要非常的频繁（<span>katamari</span>球），通过这种方法就能节省下很多带宽。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>接下来，如果我们想对状态同步执行某种增量编码怎么办<span>? </span>我们可以做到但是具体的方法会和快照里面的增量编码方法差别很大，这是因为在这种情况下我们的每个数据包不会包含每一个立方体的信息，所以我们不能跟踪最新收到的数据包，并且自以为地觉得这个数据包的所有这些状态更新都是相对于<span>X</span>这个数据包的。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>你实际要做的就是逐对象的进行更新，对数据包进行跟踪包括更新的基础值。你还需要跟踪收到的数据包的准备的数量，这样发送方才能知道哪些数据包可以作为增量编码有效的基础值。这是相当复杂的，并且是需要通过<span>UDP</span>协议进行双向确认的系统。这样一个系统是专为这种情况设计的，因为你肯定需要知道哪些数据包确定是到达了另外一侧。你可以在这个<a href="http://gad.qq.com/college/articledetail/7161834">教程</a>里面找到具体如何实现这个功能的指南。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>所以假设你有一个确认系统，这样你就知道已经发送到网络另外一侧的数据包的序列号。你所要做的就是在每个状态更新的时候，用一位数据来记录下这个更新到底是相对更新还是绝对更新，如果是绝对更新就没有针对基础编码这回事，否则就是一个相对更新，所以要发送<span>16</span>位序列号来标记每个状态相对应的基础状态，然后相对于基础状态对更新数据进行编码并通过数据包进行发送。这为每次更新增加了<span>1</span>比特开销，以及需要增加<span>16</span>位序列号的开销来标记每个物体更新的基准帧。我们可以做得更好吗<span>?</span></span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-family:&quot;Arial&quot;,&quot;sans-serif&quot;;color:#2B2B2B;background:#F8F8F8'> </span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>是的。确实可以做的更好。你要在发送和接收端进行缓冲来实现这个相对编码机制，但是你不可能永远缓冲。事实上，如果你仔细想想，你只能缓冲几秒钟然后整个缓冲就变得不切实际，对于物体在移动这个常见的情况，你会经常发送相同对象的更新信息（比如说<span>katamari</span>球），所以实际上基准帧只能是很短时间之前的一帧状态。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>所以对每个物体发送<span>16</span>位的序列号来表明基准帧，在数据包的包头里面发送最近确认的数据包的序列号（这个数据是从可靠的确认系统里面得到的）然后对每个物体编码相对这个基准帧的偏移量，这个偏移量使用<span>5</span>位信息。通过这种方式在每秒<span>60</span>个数据包的情况下，你可以识别相对于基准帧半秒前的状态更新。任何比这个值更老的基准帧不太可能提供一个良好的增量编码的基准，主要是因为它们太老了，所以在这种情况下就要切回到绝对编码进行状态更新。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>现在让我们看看会使用这些绝对编码而不是相对编码的对象的类型。他们是静止的对象。我们能做什么来让他们的更新尽可能的高效<span>?</span>在这种立方体模拟的情况，一个可能发生的很糟糕的结果是一个立方体进行停止状态（变成灰色）然后它的优先级显著降低。如果由于数据包的丢失，导致最后对象的位置更新信息被错过的话，可能需要很长时间才会轮到这个物体来更新它的停止位置信息。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>我们可以通过跟踪哪些最近变成停止状态的对象来解决这个问题，并且会提高这些对象的优先级直到一个确认包返回来标记这些对象的位置更新信息已经被成功的发送了。因此他们的发送优先级会相对于正常的灰色立方体（那些处于静止状态没有移动的立方体）的发送优先级有一定的提高，并且会在这个提高后的优先级上一直发送，直到我们知道对这些立方体的更新信息已经收到，也就是网络的另外一侧会“承诺”把这些灰色的立方体放在正确的位置上停止。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;">
<h2 id="最后">最后</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>这就是有关于这种技术的全部内容。它非常的有趣，不需要任何花哨的内容就已经足够好了，然后在此基础上可以做一个数量级的带宽节省（通过增量编码），但是这个方案的复杂性非常的高。</span> </p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><br  /></p><p class="MsoNormal" align="left" style="line-height: 16.8pt; vertical-align: baseline;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'><br  /></span></p><p class="MsoNormal" align="left" style="line-height: 18pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>【版权声明】</span> </p><p class="MsoNormal"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>原文作者未做权利声明，视为共享知识产权进入公共领域，自动获得授权。</span> </p><p class="MsoNormal"><span style='font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;'> </span> </p></div>                    </div>
                </div>
