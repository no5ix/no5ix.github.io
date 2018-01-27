---
title: 构建游戏网络协议六之客户端与服务器的连接
date: 2017-04-09 23:13:35
tags:
- GafferOnGames
categories:
- Server
---



# 本篇自我总结

这篇文章网上找不到翻译, 我也没时间详细翻译, 大概总结一下吧.
本篇主要讲了把本系列之前五篇文章的技术应用到实战中处理客户端与服务器的的连接.
请看总结, 不明之处再看文中具体讲解.

## 简单的连接协议

First up we have the client state machine.
The client is in one of three states:

- Disconnected
- Connecting
- Connected

The goal is to create an abstraction on top of a UDP socket where our server presents a number of virtual slots for clients to connect to.

When a client requests a connection, it gets assigned to one of these slots.

If a client requests connection, but no slots are available, the server is full and the connection request is denied.

On the server, we have the following data structure:

``` c++
const int MaxClients = 64;

class Server
{
    int m_maxClients;
    int m_numConnectedClients;
    bool m_clientConnected[MaxClients];
    Address m_clientAddress[MaxClients];
};
```

## 这个简单协议存在的问题

- 易被攻击者利用我们的服务器当做DDos放大攻击的工具
- 攻击者可以很轻松的占满我们的client slots
- Traffic between the client and server can be read and modified in transit by a third party. 
- 一旦被攻击者知道了客户端或者服务器的地址, 他就可以伪装服务器或客户端来欺骗对方获取利益
- 没有一个明确的断开连接的方式, 只能等time out

这些问题需要用授权系统和加密系统来解决.


## 如何改进这个连接协议

- we no longer accept client connections immediately on connection request, instead we send back a challenge packet, and only complete connection when a client replies with information that can only be obtained by receiving the challenge packet.

- 为了防止攻击者利用我们的服务器当做DDos放大攻击的工具, 我们让客户端发的包比服务器发的包要大些.

- We’ll add some unique random identifiers, or ‘salts’, to make each client connection unique from previous ones coming from the same IP address and port.

- 一旦彼此连接上之后, 就用 client salt 和 server salt 的异或值来标识彼此.

- 以上的防御措施让我们的服务器做到了 no longer able to be used as port of DDoS amplification attacks, and with a trivial xor based authentication, 但对于一个经验丰富的会抓包分析的攻击者来说, 还存在以下问题 : 

    - This attacker can read and modify packets in flight.
    - This breaks the trivial identification based around salt values…
    - giving an attacker the power to disconnect any client at will.

To solve this, we need to get serious with cryptography to encrypt and sign packets so they can’t be read or modified by a third party.




# 原文

[原文出处](https://gafferongames.com/post/client_server_connection/)

原文标题 : **Client Server Connection** (*How to create a client/server connection over UDP*)




-------------------


<h2 id="introduction">Introduction</h2>
<p>Hi, I’m <a href="https://gafferongames.com/about">Glenn Fiedler</a> and welcome to <strong><a href="https://gafferongames.com/categories/building-a-game-network-protocol/">Building a Game Network Protocol</a></strong>.</p>
<p>So far in this article series we&rsquo;ve discussed how games read and write packets, how to unify packet read and write into a single function, how to fragment and re-assemble packets, and how to send large blocks of data over UDP.</p>
<p>Now in this article we&rsquo;re going to bring everything together and build a client/server connection on top of UDP.</p>
<h2 id="background">Background</h2>
<p>Developers from a web background often wonder why games go to such effort to build a client/server connection on top of UDP, when for many applications, TCP is good enough. </p>

> These days even web servers are transitioning to UDP via <a href="https://ma.ttias.be/googles-quic-protocol-moving-web-tcp-udp/">Google&rsquo;s QUIC</a>. If you still think TCP is good enough for time critical data in 2016, I encourage you to put that in your pipe and smoke it :)

<p>The reason is that games send <strong>time critical data</strong>.</p>
<p>Why don&rsquo;t games use TCP for time critical data? The answer is that TCP delivers data reliably and in-order, and to do this on top of IP (which is unreliable, unordered) it holds more recent packets hostage in a queue while older packets are resent over the network.</p>
<p>This is known as <strong>head of line blocking</strong> and it&rsquo;s a <em>huuuuuge</em> problem for games. To understand why, consider a game server broadcasting the state of the world to clients 10 times per-second. Each client advances time forward and wants to display the most recent state it receives from the server.</p>
<p><img src="/img/client_server_connection/client-time.png" width="100%" /></p>
<p>But if the packet containing state for time t = 10.0 is lost, under TCP we must wait for it to be resent before we can access t = 10.1 and 10.2, even though those packets have already arrived and contain the state the client wants to display.</p>
<p>Worse still, by the time the resent packet arrives, it&rsquo;s far too late for the client to actually do anything useful with it. The client has already advanced past 10.0 and wants to display something around 10.3 or 10.4!</p>
<p>So why resend dropped packets at all? <strong>BINGO!</strong> What we&rsquo;d really like is an option to tell TCP: &ldquo;Hey, I don&rsquo;t care about old packets being resent, by they time they arrive I can&rsquo;t use them anyway, so just let me skip over them and access the most recent data&rdquo;.</p>
<p>Unfortunately, TCP simply does not give us this option :(</p>
<p><strong>All data must be delivered reliably and in-order</strong>.</p>
<p>This creates terrible problems for time critical data where packet loss <em>and</em> latency exist. Situations like, you know, The Internet, where people play FPS games.</p>
<p>Large hitches corresponding to multiples of round trip time are added to the stream of data as TCP waits for dropped packets to be resent, which means additional buffering to smooth out these hitches, or long pauses where the game freezes and is non-responsive.</p>
<p>Neither option is acceptable for first person shooters, which is why virtually all first person shooters are networked using UDP. UDP doesn&rsquo;t provide any reliability or ordering, so protocols built on top it can access the most recent data without waiting for lost packets to be resent, implementing whatever reliability they need in <em>radically</em> different ways to TCP.</p>
<p>But, using UDP comes at a cost:</p>
<p><strong>UDP doesn&rsquo;t provide any concept of connection.</strong></p>
<p>We have to build that ourselves. This is a lot of work! So strap in, get ready, because we&rsquo;re going to build it all up from scratch using the same basic techniques first person shooters use when creating their protocols over UDP. You can use this client/server protocol for games or non-gaming applications and, provided the data you send is time critical, I promise you, it&rsquo;s well worth the effort.</p>

<h2 id="client-server-abstraction">Client/Server Abstraction</h2>
<p>The goal is to create an abstraction on top of a UDP socket where our server presents a number of <em>virtual slots</em> for clients to connect to:</p>
<p><img src="/img/client_server_connection/connection-request.png" width="100%" /></p>
<p>When a client requests a connection, it gets assigned to one of these slots:</p>
<p><img src="/img/client_server_connection/connection-accepted.png" width="100%" /></p>
<p>If a client requests connection, but no slots are available, the server is full and the connection request is denied:</p>
<p><img src="/img/client_server_connection/server-is-full.png" width="100%" /></p>
<p>Once a client is connected, packets are exchanged in both directions. These packets form the basis for the custom protocol between the client and server which is game specific.</p>
<p><img src="/img/client_server_connection/client-server-packets.png" width="100%" /></p>
<p>In a first person shooter, packets are sent continuously in both directions. Clients send input to the server as quickly as possible, often 30 or 60 times per-second, and the server broadcasts the state of the world to clients 10, 20 or even 60 times per-second.</p>
<p>Because of this steady flow of packets in both directions there is no need for keep-alive packets. If at any point packets stop being received from the other side, the connection simply times out. No packets for 5 seconds is a good timeout value in my opinion, but you can be more aggressive if you want.</p>
<p>When a client slot times out on the server, it becomes available for other clients to connect. When the client times out, it transitions to an error state.</p>
<h2 id="simple-connection-protocol">Simple Connection Protocol</h2>
<p>Let&rsquo;s get started with the implementation of a simple protocol. It&rsquo;s a bit basic and more than a bit naive, but it&rsquo;s a good starting point and we&rsquo;ll build on it during the rest of this article, and the next few articles in this series.</p>
<p>First up we have the client state machine.</p>
<p>The client is in one of three states:</p>
<ul>
<li>Disconnected</li>
<li>Connecting</li>
<li>Connected</li>
</ul>
<p>Initially the client starts in <em>disconnected</em>.</p>
<p>When a client connects to a server, it transitions to the <em>connecting</em> state and sends <strong>connection request</strong> packets to the server:</p>
<p><img src="/img/client_server_connection/connection-request-packet.png" width="100%" /></p>
<p>The CRC32 and implicit protocol id in the packet header allow the server to trivially reject UDP packets not belonging to this protocol or from a different version of it.</p>
<p>Since connection request packets are sent over UDP, they may be lost, received out of order or in duplicate.</p>
<p>Because of this we do two things: 1) we keep sending packets for the client state until we get a response from the server or the client times out, and 2) on both client and server we ignore any packets that don&rsquo;t correspond to what we are expecting, since a lot of redundant packets are flying over the network.</p>
<p>On the server, we have the following data structure:</p>
<pre><code>const int MaxClients = 64;

class Server
{
    int m_maxClients;
    int m_numConnectedClients;
    bool m_clientConnected[MaxClients];
    Address m_clientAddress[MaxClients];
};
</code></pre>
<p>Which lets the server lookup a free slot for a client to join (if any are free):</p>
<pre><code>int Server::FindFreeClientIndex() const
{
    for ( int i = 0; i &lt; m_maxClients; ++i )
    {
        if ( !m_clientConnected[i] )
            return i;
    }
    return -1;
}
</code></pre>
<p>Find the client index corresponding to an IP address and port:</p>
<pre><code>int Server::FindExistingClientIndex( const Address &amp; address ) const
{
    for ( int i = 0; i &lt; m_maxClients; ++i )
    {
        if ( m_clientConnected[i] &amp;&amp; m_clientAddress[i] == address )
            return i;
    }
    return -1;
}
</code></pre>
<p>Check if a client is connected to a given slot:</p>
<pre><code>bool Server::IsClientConnected( int clientIndex ) const
{
    return m_clientConnected[clientIndex];
}
</code></pre>
<p>&hellip; and retrieve a client’s IP address and port by client index:</p>
<pre><code>const Address &amp; Server::GetClientAddress( int clientIndex ) const
{
    return m_clientAddress[clientIndex];
}
</code></pre>
<p>Using these queries we implement the following logic when the server processes a <strong>connection request</strong> packet:</p>
<ul>
<li><p>If the server is full, reply with <strong>connection denied</strong>.</p></li>
<li><p>If the connection request is from a new client and we have a slot free, assign the client to a free slot and respond with <strong>connection accepted</strong>.</p></li>
<li><p>If the sender corresponds to the address of a client that is already connected, <em>also</em> reply with <strong>connection accepted</strong>. This is necessary because the first response packet may not have gotten through due to packet loss. If we don&rsquo;t resend this response, the client gets stuck in the <em>connecting</em> state until it times out.</p></li>
</ul>
<p>The connection accepted packet tells the client which client index it was assigned, which the client needs to know which player it is in the game:</p>
<p><img src="/img/client_server_connection/connection-accepted-packet.png" width="100%" /></p>
<p>Once the server sends a connection accepted packet, from its point of view it considers that client connected. As the server ticks forward, it watches connected client slots, and if no packets have been received from a client for 5 seconds, the slot times out and is reset, ready for another client to connect.</p>
<p>Back to the client. While the client is in the <em>connecting</em> state the client listens for <strong>connection denied</strong> and <strong>connection accepted</strong> packets from the server. Any other packets are ignored.</p>
<p>If the client receives <strong>connection accepted</strong>, it transitions to connected. If it receives <strong>connection denied</strong>, or after 5 seconds hasn&rsquo;t received any response from the server, it transitions to disconnected.</p>
<p>Once the client hits <em>connected</em> it starts sending connection payload packets to the server. If no packets are received from the server in 5 seconds, the client times out and transitions to <em>disconnected</em>.</p>
<h2 id="naive-protocol-is-naive">Naive Protocol is Naive</h2>
<p>While this protocol is easy to implement, we can&rsquo;t use a protocol like this in production. It&rsquo;s way too naive. It simply has too many weaknesses to be taken seriously:</p>
<ul>
<li><p>Spoofed packet source addresses can be used to redirect connection accepted responses to a target (victim) address. If the connection accepted packet is larger than the connection request packet, attackers can use this protocol as part of a <a href="https://www.us-cert.gov/ncas/alerts/TA14-017A">DDoS amplification attack</a>.</p></li>
<li><p>Spoofed packet source addresses can be used to trivially fill all client slots on a server by sending connection request packets from n different IP addresses, where n is the number of clients allowed per-server. This is a real problem for dedicated servers. Obviously you want to make sure that only real clients are filling slots on servers you are paying for.</p></li>
<li><p>An attacker can trivially fill all slots on a server by varying the client UDP port number on each client connection. This is because clients are considered unique on an address + port basis. This isn&rsquo;t easy to fix because due to NAT (network address translation), different players behind the same router collapse to the same IP address with only the port being different, so we can&rsquo;t just consider clients to be unique at the IP address level sans port.</p></li>
<li><p>Traffic between the client and server can be read and modified in transit by a third party. While the CRC32 protects against packet corruption, an attacker would simply recalculate the CRC32 to match the modified packet.</p></li>
<li><p>If an attacker knows the client and server IP addresses and ports, they can impersonate the client or server. This gives an attacker the power to completely a hijack a client’s connection and perform actions on their behalf.</p></li>
<li><p>Once a client is connected to a server there is no way for them to disconnect cleanly, they can only time out. This creates a delay before the server realizes a client has disconnected, or before a client realizes the server has shut down. It would be nice if both the client and server could indicate a clean disconnect, so the other side doesn’t need to wait for timeout in the common case.</p></li>
<li><p>Clean disconnection is usually implemented with a disconnect packet, however because an attacker can impersonate the client and server with spoofed packets, doing so would give the attacker the ability to disconnect a client from the server whenever they like, provided they know the client and server IP addresses and the structure of the disconnect packet.</p></li>
<li><p>If a client disconnects dirty and attempts to reconnect before their slot times out on the server, the server still thinks that client is connected and replies with <strong>connection accepted</strong> to handle packet loss. The client processes this response and thinks it&rsquo;s connected to the server, but it&rsquo;s actually in an undefined state.</p></li>
</ul>
<p>While some of these problems require authentication and encryption before they can be fully solved, we can make some small steps forward to improve the protocol before we get to that. These changes are instructive.</p>
<h2 id="improving-the-connection-protocol">Improving The Connection Protocol</h2>
<p>The first thing we want to do is only allow clients to connect if they can prove they are actually at the IP address and port they say they are.</p>
<p>To do this, we no longer accept client connections immediately on connection request, instead we send back a challenge packet, and only complete connection when a client replies with information that can only be obtained by receiving the challenge packet.</p>
<p>The sequence of operations in a typical connect now looks like this:</p>
<p><img src="/img/client_server_connection/challenge-response.png" width="100%" /></p>
<p>To implement this we need an additional data structure on the server. Somewhere to store the challenge data for pending connections, so when a challenge response comes in from a client we can check against the corresponding entry in the data structure and make sure it&rsquo;s a valid response to the challenge sent to that address.</p>
<p>While the pending connect data structure can be made larger than the maximum number of connected clients, it&rsquo;s still ultimately finite and is therefore subject to attack. We&rsquo;ll cover some defenses against this in the next article. But for the moment, be happy at least that attackers can&rsquo;t progress to the <strong>connected</strong> state with spoofed packet source addresses.</p>
<p>Next, to guard against our protocol being used in a DDoS amplification attack, we&rsquo;ll inflate client to server packets so they&rsquo;re large relative to the response packet sent from the server. This means we add padding to both <strong>connection request</strong> and <strong>challenge response</strong> packets and enforce this padding on the server, ignoring any packets without it. Now our protocol effectively has DDoS <em>minification</em> for requests -&gt; responses, making it highly unattractive for anyone thinking of launching this kind of attack.</p>
<p>Finally, we&rsquo;ll do one last small thing to improve the robustness and security of the protocol. It&rsquo;s not perfect, we need authentication and encryption for that, but it at least it ups the ante, requiring attackers to actually sniff traffic in order to impersonate the client or server. We&rsquo;ll add some unique random identifiers, or &lsquo;salts&rsquo;, to make each client connection unique from previous ones coming from the same IP address and port.</p>
<p>The connection request packet now looks like this:</p>
<p><img src="/img/client_server_connection/connection-request-packet-2.0.png" width="100%" /></p>
<p>The client salt in the packet is a random 64 bit integer rolled each time the client starts a new connect. Connection requests are now uniquely identified by the IP address and port combined with this client salt value. This distinguishes packets from the current connection from any packets belonging to a previous connection, which makes connection and reconnection to the server much more robust.</p>
<p>Now when a connection request arrives and a pending connection entry can&rsquo;t be found in the data structure (according to IP, port and client salt) the server rolls a server salt and stores it with the rest of the data for the pending connection before sending a challange packet back to the client. If a pending connection is found, the salt value stored in the data structure is used for the challenge. This way there is always a consistent pair of client and server salt values corresponding to each client session.</p>
<p><img src="/img/client_server_connection/challenge-packet.png" width="100%" /></p>
<p>The client state machine has been expanded so <em>connecting</em> is replaced with two new states: <em>sending connection request</em> and <em>sending challenge response</em>, but it&rsquo;s the same idea as before. Client states repeatedly send the packet corresponding to that state to the server while listening for the response that moves it forward to the next state, or back to an error state. If no response is received, the client times out and transitions to <em>disconnected</em>.</p>
<p>The challenge response sent from the client to the server looks like this:</p>
<p><img src="/img/client_server_connection/challenge-response-packet.png" width="100%" /></p>
<p>The utility of this being that once the client and server have established connection, we prefix all payload packets with the xor of the client and server salt values and discard any packets with the incorrect salt values. This neatly filters out packets from previous sessions and requires an attacker to sniff packets in order to impersonate a client or server.</p>
<p><img src="/img/client_server_connection/connection-payload-packet.png" width="100%" /></p>
<p>Now that we have at least a <em>basic</em> level of security, it&rsquo;s not much, but at least it&rsquo;s <em>something</em>, we can implement a disconnect packet:</p>
<p><img src="/img/client_server_connection/disconnect-packet.png" width="100%" /></p>
<p>And when the client or server want to disconnect clean, they simply fire 10 of these over the network to the other side, in the hope that some of them get through, and the other side disconnects cleanly instead of waiting for timeout.</p>
<h2 id="conclusion">Conclusion</h2>
<p>We now have a much more robust protocol. It&rsquo;s secure against spoofed IP packet headers. It&rsquo;s no longer able to be used as port of DDoS amplification attacks, and with a trivial xor based authentication, we are protected against <em>casual</em> attackers while client reconnects are much more robust.</p>
<p>But it&rsquo;s still vulnerable to a sophisticated actors who can sniff packets:</p>
<ul>
<li><p>This attacker can read and modify packets in flight.</p></li>
<li><p>This breaks the trivial identification based around salt values&hellip;</p></li>
<li><p>&hellip; giving an attacker the power to disconnect any client at will.</p></li>
</ul>
<p>To solve this, we need to get serious with cryptography to encrypt and sign packets so they can&rsquo;t be read or modified by a third party.</p>