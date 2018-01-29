---
title: 网络物理模拟四之快照插值
date: 2017-01-23 11:13:35
tags:
- GafferOnGames
categories:
- Server
---


# 自我总结

快照插值这种游戏同步技术的要点为 : 

- **视觉模拟** : 每帧从网络的发送侧捕获所有相关状态的快照，并将其传输到网络的接收侧，在那里我们将试图重建一个视觉上近似合理的模拟
    - 缓冲区 : 内插值之前会缓冲一段合适的时间来处理网络抖动
    - 内插值Interpolation : 处理快照之间的拉扯
        - 线性插值
        - Hermite插值
    - 外插值Extrapolation (文中翻译为"预测"或"推测") : 不可行, 因为外插值无法精准预测刚体运动以及各种物理
- **降低延迟** : 因为我们发送的快照的频率比较低，这样会带来的一个问题就是对快照进行插值的话会在网络延迟的基础上还要增加插值带来的延迟. 所以我们需要增加发送速率, 为了提高发送速度我们需要压缩快照数据技术的配合, 不然占用太多带宽了
- **减少宽带占用** : 因为所有需要在快照中包含所有实体信息, 所以数据量相当大, 得用各种方法压缩快照数据({% post_link snapshot_compression 网络物理模拟五之快照压缩 %})

<!-- more -->

# 原文

[原文出处](https://gafferongames.com/post/snapshot_interpolation/)

原文标题 : **Snapshot Interpolation** (*Interpolating between snapshots of visual state*)

-------------------


<h2 id="introduction">Introduction</h2>
<p>Hi, I&rsquo;m <a href="https://gafferongames.com/about">Glenn Fiedler</a> and welcome to <strong><a href="https://gafferongames.com/categories/networked-physics/">Networked Physics</a></strong>.</p>
<p>In the <a href="https://gafferongames.com/post/deterministic_lockstep/">previous article</a> we networked a physics simulation using deterministic lockstep. Now, in this article we&rsquo;re going to network the same simulation with a completely different technique: <strong>snapshot interpolation</strong>.</p>
<h2 id="background">Background</h2>
<p>While deterministic lockstep is very efficient in terms of bandwidth, it&rsquo;s not always possible to make your simulation deterministic. Floating point determinism across platforms is <a href="https://gafferongames.com/post/floating_point_determinism/">hard</a>.</p>
<p>Also, as the player counts increase, deterministic lockstep becomes problematic: you can&rsquo;t simulate frame n until you receive input from <em>all</em> players for that frame, so players end up waiting for the most lagged player. Because of this, I recommend deterministic lockstep for 2-4 players at most.</p>
<p>So if your simulation is not deterministic or you want higher player counts then you need a different technique. Snapshot interpolation fits the bill nicely. It is in many ways the polar opposite of deterministic lockstep: instead of running two simulations, one on the left and one on the right, and using perfect determinism and synchronized inputs keep them in sync, snapshot interpolation doesn&rsquo;t run any simulation on the right side at all!</p>
<h2 id="snapshots">Snapshots</h2>
<p>Instead, we capture a <strong>snapshot</strong> of all relevant state from the simulation on the left and transmit it to the right, then on the right side we use those snapshots to reconstruct a visual approximation of the simulation, all without running the simulation itself.</p>
<p>As a first pass, let&rsquo;s send across the state required to render each cube:</p>
<pre><code>    struct CubeState
    {
        bool interacting;
        vec3f position;
        quat4f orientation;
    };
</code></pre>
<p>I&rsquo;m sure you&rsquo;ve worked out by now that the cost of this technique is increased bandwidth usage. Greatly increased bandwidth usage. Hold on to your neckbeards, because a snapshot contains the visual state for the entire simulation. With a bit of math we can see that each cube serializes down to 225 bits or 28.1 bytes. Since there are 900 cubes in our simulation that means each snapshot is roughly 25 kilobytes. That&rsquo;s pretty big!</p>
<p>At this point I would like everybody to relax, take a deep breath, and imagine we live in a world where I can actually send a packet this large 60 times per-second over the internet and not have everything explode. Imagine I have FIOS <em>(I do)</em>, or I&rsquo;m sitting over a backbone link to another computer that is also on the backbone. Imagine I live in South Korea. Do whatever you need to do to suspend disbelief, but most of all, don&rsquo;t worry, because I&rsquo;m going to spend the entire next article showing you how to optimize snapshot bandwidth.</p>
<p>When we send snapshot data in packets, we include at the top a 16 bit sequence number. This sequence number starts at zero and increases with each packet sent. We use this sequence number on receive to determine if the snapshot in a packet is newer or older than the most recent snapshot received. If it&rsquo;s older then it&rsquo;s thrown away.</p>
<p>Each frame we just render the most recent snapshot received on the right:</p>
<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_1.mp4" type="video/mp4" />
</video>
<p>Look closely though, and even though we&rsquo;re sending the data as rapidly as possible (one packet per-frame) you can still see hitches on the right side. This is because the internet makes no guarantee that packets sent 60 times per-second arrive nicely spaced <sup>1</sup>&frasl;<sub>60</sub> of a second apart. Packets are jittered. Some frames you receive two snapshot packets. Other frames you receive none.</p>
<h2 id="jitter-and-hitches">Jitter and Hitches</h2>
<p>This is actually a really common thing when you first start networking. You start out playing your game over LAN and notice you can just slam out packets really fast (60pps) and most of the time your game looks great because over the LAN those packets actually do tend to arrive at the same rate they were sent&hellip; and then you start trying to play your game over wireless or the internet and you start seeing hitches. Don&rsquo;t worry. There are ways to handle this!</p>
<p>First, let&rsquo;s look at how much bandwidth we&rsquo;re sending with this naive approach. Each packet is 25312.5 bytes plus 28 bytes for IP + UDP header and 2 bytes for sequence number. That&rsquo;s 25342.5 bytes per-packet and at 60 packets per-second this gives a total of 1520550 bytes per-second or 11.6 megabit/sec. Now there are certainly internet connections out there that can support that amount of traffic&hellip; but since, let&rsquo;s be honest, we&rsquo;re not really getting a lot of benefit blasting packets out 60 times per-second with all the jitter, let&rsquo;s pull it back a bit and send only 10 snapshots per-second:</p>
<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_2.mp4" type="video/mp4" />
</video>
<p>You can see how this looks above. Not so great on the right side but at least we&rsquo;ve reduced bandwidth by a factor of six to around 2 megabit/sec. We&rsquo;re definitely headed in the right direction.</p>
<h3 id="linear-interpolation">Linear Interpolation</h3>
<p>Now for the trick with snapshots. What we do is instead of immediately rendering snapshot data received is that we buffer snapshots for a short amount of time in an interpolation buffer. This interpolation buffer holds on to snapshots for a period of time such that you have not only the snapshot you want to render but also, statistically speaking, you are very likely to have the next snapshot as well. Then as the right side moves forward in time we interpolate between the position and orientation for the two slightly delayed snapshots providing the illusion of smooth movement. In effect, we&rsquo;ve traded a small amount of added latency for smoothness.</p>
<p>You may be surprised at just how good it looks with linear interpolation @ 10pps:</p>
<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_3.mp4" type="video/mp4" />
</video>
<p>Look closely though and you can see some artifacts on the right side. The first is a subtle position jitter when the player cube is hovering in the air. This is your brain detecting 1st order discontinuity at the sample points of position interpolation. The other artifact occurs when a bunch of cubes are in a katamari ball, you can see a sort of &ldquo;pulsing&rdquo; as the speed of rotation increases and decreases. This occurs because attached cubes interpolate linearly between two sample points rotating around the player cube, effectively interpolating <em>through</em> the player cube as they take the shortest linear path between two points on a circle.</p>
<h3 id="hermite-interpolation">Hermite Interpolation</h3>
<p>I find these artifacts unacceptable but I don&rsquo;t want to increase the packet send rate to fix them. Let&rsquo;s see what we can do to make it look better at the same send rate instead. One thing we can try is upgrading to a more accurate interpolation scheme for position, one that interpolates between position samples while considering the linear velocity at each sample point.</p>
<p>This can be done with an <a href="https://en.wikipedia.org/wiki/Hermite_interpolation">hermite spline</a> (pronounced &ldquo;air-mitt&rdquo;)</p>
<p>Unlike other splines with control points that affect the curve indirectly, the hermite spline is guaranteed to pass through the start and end points while matching the start and end velocities. This means that velocity is smooth across sample points and cubes in the katamari ball tend to rotate around the cube rather than interpolate through it at speed.</p>
<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_4.mp4" type="video/mp4" />
</video>
<p>Above you can see hermite interpolation for position @ 10pps. Bandwidth has increased slightly because we need to include linear velocity with each cube in the snapshot, but we&rsquo;re able to significantly increase the quality at the same send rate. I can no longer see any artifacts. Go back and compare this with the raw, non-interpolated 10pps version. It really is amazing that we&rsquo;re able to reconstruct the simulation with this level of quality at such a low send rate.</p>
<p>As an aside, I found it was not necessary to perform higher order interpolation for orientation quaternions to get smooth interpolation. This is great because I did a lot of research into exactly interpolating between orientation quaternions with a specified angular velocity at sample points and it seemed difficult. All that was needed to achieve an acceptable result was to switch from linear interpolation + normalize (nlerp) to spherical linear interpolation (slerp) to ensure constant angular speed for orientation interpolation.</p>
<p>I believe this is because cubes in the simulation tend to have mostly constant angular velocity while in the air and large angular velocity changes occur only discontinuously when collisions occur. It could also be because orientation tends to change slowly while in the air vs. position which changes rapidly relative to the number of pixels affected on screen. Either way, it seems that slerp is good enough and that&rsquo;s great because it means we don&rsquo;t need to send angular velocity in the snapshot.</p>
<h3 id="handling-real-world-conditions">Handling Real World Conditions</h3>
<p>Now we have to deal with packet loss. After the discussion of UDP vs. TCP in the previous article I&rsquo;m sure you can see why we would never consider sending snapshots over TCP.</p>
<p>Snapshots are time critical but unlike inputs in deterministic lockstep snapshots don&rsquo;t need to be reliable. If a snapshot is lost we can just skip past it and interpolate towards a more recent snapshot in the interpolation buffer. We don&rsquo;t ever want to stop and wait for a lost snapshot packet to be resent. This is why you should always use UDP for sending snapshots.</p>
<p>I&rsquo;ll let you in on a secret. Not only were the linear and hermite interpolation videos above recorded at a send rate of 10 packets per-second, they were also recorded at 5% packet loss with +/- 2 frames of jitter @ 60fps. How I handled packet loss and jitter for those videos is by simply ensuring that snapshots are held in the interpolation buffer for an appropriate amount of time before interpolation.</p>
<p>My rule of thumb is that the interpolation buffer should have enough delay so that I can lose two packets in a row and still have something to interpolate towards. Experimentally I&rsquo;ve found that the amount of delay that works best at 2-5% packet loss is 3X the packet send rate. At 10 packets per-second this is 300ms. I also need some extra delay to handle jitter, which in my experience is typically only one or two frames @ 60fps, so the interpolation videos above were recorded with a delay of 350ms.</p>
<p>Adding 350 milliseconds delay seems like a lot. And it is. But, if you try to skimp you end up hitching for 1/10th of a second each time a packet is lost. One technique that people often use to hide the delay added by the interpolation buffer in other areas (such as FPS, flight simulator, racing games and so on) is to use extrapolation. But in my experience, extrapolation doesn&rsquo;t work very well for rigid bodies because their motion is non-linear and unpredictable. Here you can see an extrapolation of 200ms, reducing overall delay from 350 ms to just 150ms:</p>
<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_5.mp4" type="video/mp4" />
</video>
<p>Problem is it&rsquo;s just not very good. The reason is that the extrapolation doesn&rsquo;t know anything about the physics simulation. Extrapolation doesn&rsquo;t know about collision with the floor so cubes extrapolate down through the floor and then spring back up to correct. Prediction doesn&rsquo;t know about the spring force holding the player cube up in the air so it the cube moves slower initially upwards than it should and has to snap to catch up. It also doesn&rsquo;t know anything about collision and how collision response works, so the cube rolling across the floor and other cubes are also mispredicted. Finally, if you watch the katamari ball you&rsquo;ll see that the extrapolation predicts the attached cubes as continuing to move along their tangent velocity when they should rotate with the player cube.</p>
<h3 id="conclusion">Conclusion</h3>
<p>You could conceivably spend a great deal of time to improve the quality of this extrapolation and make it aware of various movement modes for the cubes. You could take each cube and make sure that at minimum the cube doesn&rsquo;t go through the floor. You could add some approximate collision detection or response using bounding spheres between cubes. You could even take the cubes in the katamari ball and make them predict motion to rotate around with the player cube.</p>
<p>But even if you do all this there will still be misprediction because you simply can&rsquo;t accurately match a physics simulation with an approximation. If your simulation is mostly linear motion, eg. fast moving planes, boats, space ships &ndash; you may find that a simple extrapolation works well for short time periods (50-250ms or so), but in my experience as soon as objects start colliding with other non-stationary objects, extrapolation starts to break down.</p>
<p>How can we reduce the amount of delay added for interpolation? 350ms still seems unacceptable and we can&rsquo;t use extrapolation to reduce this delay without adding a lot of inaccuracy. The solution is simple: <em>increase the send rate!</em> If we send 30 snapshots per-second we can get the same amount of packet loss protection with a delay of 150ms. 60 packets per-second needs only 85ms.</p>
<p>In order to increase the send rate we&rsquo;re going to need some pretty good bandwidth optimizations. But don&rsquo;t worry, there&rsquo;s a <em>lot</em> we can do to optimize bandwidth. So much so that there was too much stuff to fit in this article and I had to insert an extra unplanned article just to cover all of it!</p>


<h1 id="译文">译文</h1>

[译文出处](http://gad.qq.com/program/translateview/7164498)

<div class="WordSection1"><b><span style="font-weight: normal;font-family:微软雅黑;font-size:medium;">翻译：崔国军（飞扬<span style="color: rgb(34, 34, 34);">971</span><span style="color: rgb(34, 34, 34);">）    审校：张乾光</span><span style="color: rgb(34, 34, 34);">(</span><span style="color: rgb(34, 34, 34);">星际迷航</span><span style="color: rgb(34, 34, 34);">)</span></span></b><div><span style="font-weight: normal;font-family:微软雅黑;font-size:medium;"><span style="color: rgb(34, 34, 34);"><br  /></span></span></div><p class="MsoNormal" align="left">
<h2 id="介绍">介绍</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>大家好，我是格伦·菲德勒。欢迎阅读《网络物理模拟》的系列文章，这个系列文章的主题是关于如何将一个物理模拟通过网络通信进行同步。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>在之前的文章中，我们通过具有确定性的帧同步将</span><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>物理模拟通过网络通信进行同步。在这一篇文章中我们将使用一种完全不同的技术来</span><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>将</span><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>物理模拟通过网络通信进行同步，这个技术就是：快照信息插值方法。</span></p><p class="MsoNormal" align="left">
<h2 id="背景">背景</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>为什么需要一种不同的技术？这是因为虽然具有确定性的帧同步这种同步策略在节省带宽方面非常有效，但是要保证你的仿真具有完美的确定性这个事情并不总是可行的，有些时候是不实际的。此外，具有确定性的帧同步这种同步策略在玩家数目增多的情况下会遇到一些问题，因为你要收到所有玩家对应帧的输入才能对这一帧进行模拟。在实践中，这意味着每个人必须等待最滞后的那个玩家。以我的经验来说，我建议在联网环境下只在<span>2</span>到<span>4</span>个玩家的时候使用具有确定性的帧同步这种同步策略。（译者注：其实国内现在已经有<span>20</span>个玩家在互联网环境下使用具有确定性的帧同步这种同步策略的游戏了，就算<span>dota</span>也是支持<span>5v5</span>对战的，原作者太过于谨慎了）。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>如果你想要支持更多数目的玩家或者你的模拟并不具有完美的确定性，那么你就需要一种不同的技术了。快照信息插值技术在许多方面都站在具有确定性的帧同步技术的对立面。它不再需要在网络的两侧同时运行仿真，使用程序的确定性以及同步输入信息来保证网络的两侧的仿真始终保持同步。。。快照信息插值技术根本不需要在接收侧运行任何的模拟！</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><br  /></span></p><p class="MsoNormal" align="left">
<h2 id="快照">快照</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>我们所要做的就是每帧从网络的发送侧捕获所有相关状态的快照，并将其传输到网络的接收侧，在那里我们将试图重建一个视觉上近似合理的模拟。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>作为第一步，让我们把所需的状态直接发送给网络的接收侧，让它可以渲染每一个立方体：

``` c++
struct CubeState
{
    bool interacting;
    vec3f position;
    quat4f orientation;
};
```

需要注意的是，我们发送了一个布尔值用来标记这个立方体是否与玩家存在交互。为什么需要这个布尔值？这是因为在网络的接收侧并没有运行一个模拟，因此并不会有碰撞检测来告诉我们什么时候一个立方体应该被标红而什么时候不需要对一个立方体进行标红。如果我们想要一个立方体在它与玩家存在互动的情况下变红的话，我们需要在快照中包含此信息。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>我敢肯定这时候你已经明白这项技术的消耗在于增大了带宽的使用。其实是大大增大了对带宽的占用。这是因为快照包含了整个仿真的状态。通过一点数学计算我们可以看到每个立方体序列化下来的话大概占据<span>225</span>比特或者<span>28.1</span>字节。因为在我们的仿真中有大概<span>900</span>个立方体，这意味着每个快照大约需要<span>25k</span>的字节。这个数据量相当大了！</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>在这一点上，我想每个人都放松、深呼吸，想象我们生活在一个世界里，在这个世界里面我可以在互联网上以<span>60</span>次每秒的速度来实际发送数据包，而不会有什么意外。想象一下我有光纤服务光纤服务或者我坐在骨干网的后面，与另外一台位于骨干网的电脑相连。。想象一下，我使用<span>IPv6</span>，而最大传输单元的大小是<span>100k</span>。可以想象一下，我住在韩国。做你任意想做的，不要有任何的怀疑，而且最重要的是，不用担心网络有任何的问题，这是因为我将在下一篇文章中向你展示如何快速优化快照信息插值这种方法带来的带宽负担。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>当我们用数据包的方式发送快照的时候，我们会在数据包的头部包括<span>16</span>位的序列号。这个序列号会从零开始并且随着每个快照的发送而增大。我们在接收的时候使用这个序列号来决定数据包中的快照到底比我们最近收到的快照更新还是更旧。如果比我们最近收到的快照更旧的话，我们就会丢弃这个快照。然后，在网络的接收侧我们只会渲染我们接收到的最新的快照上的信息。</span></p><p class="MsoNormal" align="left">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_1.mp4" type="video/mp4" />
</video>

<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>请注意，即使我们尽一切可能的快速发送数据（一帧一个数据包），我们仍然会在网络的接收侧看到物体发生抖动现象。这是因为在互联网上根本就不会保证数据包会按照六十分之一秒的间隔到达网络的另外一侧。数据包的到达时间会发生抖动。在某些帧你会收到两个帧的快照，而在另外一些帧则会根本收不到。</span></p><p class="MsoNormal" align="left">
<h2 id="抖动与拉扯">抖动与拉扯</h2>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>这实际上是当你第一次启动网络一个非常常见的事情。你开始通过局域网来玩你的游戏并注意到你可以以一个非常高的速度来发送数据包并且你的游戏会看上表现的非常非常不错，这是因为你的数据包几乎在发送的同时就会到达网络的接收侧。。。然后你开始尝试通过无线网络或者互联网来玩你的游戏，然后你就看到各种各样的抖动。不用担心，有办法来处理这个问题！</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>首先，让我们看看使用这种幼稚的方法进行发送数据包，我们会占据多少的带宽。每个数据包是<span>25312.5</span>字节加上<span>IP </span>和<span>UDP</span>包头所占的<span>28</span>个字节并且还要有<span>2</span>个字节用来表示网络包的序号。这就是一个数据包的大小：<span>25342.5</span>字节，每秒<span>60</span>个数据包的话就一共要<span>1520550</span>字节，或者换算下就是<span>11.6M</span>每秒。现在当然也有互联网连接可以支持这种规模的流量。。。但是既然我们每秒发送<span>60</span>个数据包也没有什么太大的益处，还是充满了这种抖动，让我们稍微稳妥一点，只要每秒发送<span>10</span>次快照就可以了。</span></p><p class="MsoNormal" align="left">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_2.mp4" type="video/mp4" />
</video>

<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>你可以通过上面的效果看到修改以后的表现效果如何。这对网络的接收侧并没有什么太大的影响，起码我们将带宽减少到了六分之一，大概是<span>2M</span>每秒。我们正在朝着正确的方向继续前进。</span></p><p class="MsoNormal" align="left">
<h3 id="线性插值">线性插值</h3>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>现在是关于处理快照的一些技巧。我们所做的不是在我们接收到快照数据立刻开始进行渲染，而是利用插值缓冲区缓冲了快照数据一小段时间。这个插值缓冲区会持有快照数据一段时间，这样你不仅会持有你准备渲染的这一帧的快照数据，而且从统计数字上看，你很有可能会持有下一帧你需要的快照数据。然后随着网络的接收侧在时间上向前移动，我们会对这两帧轻微延迟的快照数据进行物体位置和方向的插值，提供平滑运动的错觉。实际上，我们通过增加了一小段延迟来交换物体的平滑运动。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>你可以会很吃惊，通过每秒<span>10</span>帧的快照数据以及一个简单的线性插值，就可以得到表现如此只好的一个表现：</span></p><p class="MsoNormal" align="left">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_3.mp4" type="video/mp4" />
</video>

<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>但是如果你仔细观察的话，你还是可以看到在网络的接收侧里面存在大量的瑕疵。首先是当玩家立方体在空中盘旋的时候，玩家立方体的位置有一个轻微的抖动。这是因为你的大脑在位置插值的采样点那里检测到了<span>1</span>秒左右的中断。另外一个瑕疵出现在一大推立方体出于<span>katamari</span>球之中的时候，你可以看到某种“脉冲<span>“</span>的存在，立方体旋转的速度会出现升高或者降低的情况。这种情况的出现是是因为附加的这些立方体会在围绕玩家立方体的周围旋转的时候在两个采样点之间进行线性的插值，通过玩家立方体进行插值是有效的，这是因为这样两点之间就是最短线性距离。</span></p><p class="MsoNormal" align="left">
<h3 id="Hermite插值">Hermite插值</h3>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>我发现这些瑕疵是不能接受的，但是不希望增加数据包的发送速率来解决这些问题。让我们看看我们能做些什么，让数据包的发送速率不变的情况让整个效果能够看起来更棒。我们可以尝试升级的一个事情是对于位置的一种更加精确的插值方案：这种方案在位置采样点之间进行插值的同时还要考虑每个采样点的线性速度。</span></p><p style="margin: 6pt 0cm; line-height: 16.8pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style='font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><span style="font-size:medium;">可以用于执行这种插值的一种曲线是厄米特曲线。这种曲线和其他需要控制点间接的影响曲线不同，厄米特曲线保证一定会通过起点和终点的同时还能匹配起点和终点的速度。这意味着立方体在通过采样点的速度是平滑的，而且<span>katamari</span>球中的立方体会倾向于围绕立方体旋转，而不是通过它的速度进行插值。</span></span></p><p style="margin: 6pt 0cm; line-height: 16.8pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_4.mp4" type="video/mp4" />
</video>

<span style='font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><span style="font-size:medium;"><br  /></span></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>上面你所看到的效果是通过每秒<span>10</span>次的快照数据进行的厄米特曲线插值。我们的带宽略有增加，但我们能够在显著提高质量的同时保证数据包的发送速率不变。我再也看不到任何的瑕疵。让我们重新回到厄米特曲线插值之前的效果进行下对比。我们能够在如此低的数据包发送速率下重建出来如此质量水平的模拟，这真的是令人惊讶的改变。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>顺便说一句，我发现没有必要对方向四元数进行更高阶的插值来得到平滑的插值。因为我做了很多的研究关于对方向四元数使用一个特定的线性速度进行准确的插值，然后我发现这其实非常的困难。为了达到一个可以接收的效果我们所有要做的事情就是从线性插值加归一化（<span>nlerp</span>函数）到球面线性插值插值（<span>slerp</span>函数）来确保方向四元数的插值得到一个固定的角速度。我相信这是因为在仿真中空中的立方体试图保持大体固定的角速度，而在发生碰撞的时候，比较高的角速度会突然变得不连续。它也可能是因为在空中的时候方向趋于变化缓慢而位置会会相对与屏幕上受影响的像素的数目而快速的变化。无论哪种方式，似乎球面插值都表现的不错，这就是很棒的方法因为这意味着我们并不需要在快照数据中发送角速度。</span></p><p class="MsoNormal" align="left">
<h3 id="处理真实世界的情况">处理真实世界的情况</h3>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>现在，我们必须处理的数据包丢失的问题了。在上一篇文章讨论完了<span>UDP</span>和<span>TCP</span>的优劣之后，我敢肯定你可以知道了为什么我们从来不考虑通过<span>TCP</span>来发送我们的快照数据。快照数据是时间敏感的，但是和有确定性的帧同步中的输入信息不一样，这个数据没有必要是可靠的。如果一个快照数据丢失了，我们可以跳过这一帧，并使用一个缓冲区中更新的快照数据进行插值。们再也不想停下来，等待丢失的快照数据包的重发。这就是为什么你总是应该使用<span>UDP</span>发送快照数据的原因。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>我要告诉你一个秘密。上面这两个视频不仅仅是在每秒<span>10</span>个数据包的发送频率下用线性插值或厄米特插值的效果，它们也记录了在有<span>2</span>帧抖动、<span>5%</span>丢包率下的效果。我该如何处理丢包和抖动？我的做法是确保快照数据会被保存在插值缓冲区，这样在插值之前会缓冲一段合适的时间。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>我的经验法则是，插值缓冲区应该有足够的延迟，这样就算我连续丢失了两个数据包，我仍然有快照数据可以进行插值。在实验中我发现在有<span>2-5%</span>的数据包丢包率的情况下，延迟量大概是数据包发送速度的<span>3</span>倍左右比较合适。如果是每秒发送<span>10</span>个数据包的情况，这个延迟量就是大概<span>300</span>毫秒。我还需要一些额外的延迟来处理抖动的情况，以我的经验来说，如果是在<span>60fps</span>的条件下，大概预留一到两帧就可以了，所以上面的插值效果的视频使用了一个大概<span>350</span>毫秒的延迟。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>添加<span>350</span>毫秒的延迟，似乎带来了很大的延迟。但是如果因为觉得不舍得而不在这里使用<span>350</span>毫秒的延迟的话，要么就得到一个充满拉扯的效果，要么就会遇到每秒有十分之一的数据包丢失。人们在其他领域（比如说第一人称设计游戏、飞行模拟游戏、赛车游戏以及其他的游戏）经常使用的用于隐藏由于插值缓冲区带来的延迟的方法是使用预测方法。以我的经验来看，预测方法对于缸体来说效果似乎不太好，这是因为它们的运动不是线性的并且无法预测。在这里，你可以看到使用了<span>200</span>毫秒的预测方法理论上可以将延迟从<span>350</span>毫秒减少到<span>150</span>毫秒：</span></p><p class="MsoNormal" align="left">

<video preload="auto" loop="loop" width="100%" controls="controls">
<source src="/img/snapshot_interpolation_5.mp4" type="video/mp4" />
</video>

<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'><br  /></span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>问题是，它工作起来效果似乎不是太好。当然这个原因在于预测方法根本不知道任何有关物理模拟方面的内容。预测方法不知道立方体需要与地面发生碰撞，立方体在向下遇到地板的时候会反弹回来，当然这是正确的表现。预测方法不知道有关施加在空中的玩家立方体上的反弹力，因此立方体起初会比实际的情况下移动的慢一些，然后开始加速追上自己应该在的位置。预测方法也不知道任何有关碰撞方面的内容以及如果发生碰撞了该发生何种反应，所以如果立方体在地板上或者其他立方体上滚过的时候就会发生预测上的错误。最后，如果你仔细观察<span>katamari</span>球的话，你会看到预测方法会让附着于其上的立方体继续沿着它们的切线速度运动，而这个时候它们应该跟玩家立方体一起转动。</span></p><p class="MsoNormal" align="left">
<h3 id="结论">结论</h3>
<span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>现在，你可以持续的花费大量的时间来改善推测的质量，并通过认识立方体的各种运动模式来持续提高。你可以对每个立方体进行推断，并确保最低程度是立方体不会穿越地面。你还可以添加碰撞检测的一些推断并且利用立方体的球型包围盒做出响应。你甚至可以选取<span>katamari</span>球体里面的立方体并预测当它们在玩家立方体周围的时候会如何运动。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>但是，即使你做了所有的这一切，仍然会有预测失误，因为你根本无法精确匹配物理模拟与近似估计之间的差距。如果你的仿真中大多数是直线运动，比如说，快速移动的飞机、轮船、太空飞船等等<span>-</span>你会发现一个简单的外推法非常适用于短时间内（<span>50-250ms</span>左右）的这种运动。以我的经验来看，只要物体开始与非静止的物体开始发生碰撞，这种预测就将完全的不成立。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>我们怎样才能减少由于插值带来的延迟？<span>350</span>毫秒似乎仍然是不能接受的延迟，我们不能使用预测和外推来减少这种延迟，因为这样增加了大量的不确定性。解决的办法其实很简单：增加发送速率。如果我们每秒发送<span>30</span>次快照的话，我们可以在相同的数据包丢失率情况将延迟降低到<span>150ms</span>。如果我们把发送速率增大到每秒<span>60</span>个数据包的程度，延迟将只有<span>85ms</span>。</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#333333'>为了提高发送速度，我们会需要进行一些不错的带宽优化。不过不用担心，我们可以做很多很多的事情来优化带宽。但是我们如果把这些东西都放到这篇文章的话，这篇文章就会有太多太多的东西，我不得不插入一个计划之外的文章来涵盖带宽优化方面的东西！</span></p><p class="MsoNormal" align="left"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'></span></p><p class="MsoNormal" align="left"><br  /></p><p class="MsoNormal" align="left" style="line-height: 18pt; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial;"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>【版权声明】</span></p><p class="MsoNormal"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;;color:#222222'>原文作者未做权利声明，视为共享知识产权进入公共领域，自动获得授权。</span></p><p class="MsoNormal"><span style='font-size:12.0pt;font-family:&quot;微软雅黑&quot;,&quot;sans-serif&quot;'> </span></p></div>                    </div>
                </div>
