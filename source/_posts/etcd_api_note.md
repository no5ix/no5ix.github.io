---
title: etcd的restful接口
date: 2019-07-10 23:11:26
tags:
- Etcd
categories:
- Misc
---



**. . .**<!-- more -->


<div id="cnblogs_post_body" class="blogpost-body"><h1>etcd api接口</h1>
<p>　　基本操作api: https://github.com/coreos/etcd/blob/6acb3d67fbe131b3b2d5d010e00ec80182be4628/Documentation/v2/api.md</p>
<p>　　集群配置api:&nbsp;https://github.com/coreos/etcd/blob/6acb3d67fbe131b3b2d5d010e00ec80182be4628/Documentation/v2/members_api.md</p>
<p>　　鉴权认证api:&nbsp;https://github.com/coreos/etcd/blob/6acb3d67fbe131b3b2d5d010e00ec80182be4628/Documentation/v2/auth_api.md</p>
<p>　　配置项：https://github.com/coreos/etcd/blob/master/Documentation/op-guide/configuration.md</p>
<p>　　</p>
<p>　　https://coreos.com/etcd/docs/latest/runtime-configuration.html</p>
<p>　　https://coreos.com/etcd/docs/latest/clustering.html</p>
<p>　　https://coreos.com/etcd/docs/latest/runtime-configuration.html</p>
<p>　　https://coreos.com/etcd/docs/latest/</p>
<p>　　https://coreos.com/etcd/docs/latest/admin_guide.html#disaster-recovery</p>
<p>　　采用标准的restful 接口，支持http 和 https 两种协议。</p>
<h1>运行单机etcd服务</h1>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> ./bin/etcd</pre>
</div>
<p>&nbsp;</p>
<p>　监听localhost和从IANA分配的端口，2379用于同client通讯，2389用于server与server直接的通讯。</p>
<p>&nbsp;</p>
<p><strong style="line-height: 1.5;">获取版本 &nbsp;/</strong>version</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/version | python -m json.tool</span>
<span style="color: #008080;">2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;">3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;">4</span> <span style="color: #800080;">100</span>    <span style="color: #800080;">44</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">44</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">14093</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">22000</span>
<span style="color: #008080;">5</span> <span style="color: #000000;">{
</span><span style="color: #008080;">6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">etcdcluster</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2.3.0</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">etcdserver</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2.3.7</span><span style="color: #800000;">"</span>
<span style="color: #008080;">8</span> }</pre>
</div>
<p>&nbsp;&nbsp;</p>
<p><span style="line-height: 1.5;"><strong>etcd 的基本API是一个分层的key空间。key空间由通常被称为"nodes"（节点）的keys和目录组成。</strong></span></p>
<p><span style="line-height: 1.5;">对datastore的访问，即通过<strong> /version/keys</strong>&nbsp;端点(endpoint) 访问key空间。</span></p>
<p><span style="line-height: 1.5;"><strong>1. PUT 为etcd存储的键赋值， 即创建 message 键值，赋值为"Hello world"</strong></span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/message -X PUT -d value="Hello world" | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">119</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">102</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">17</span>  <span style="color: #800080;">38230</span>   <span style="color: #800080;">6371</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">51000</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">30</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">30</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Hello world</span><span style="color: #800000;">"</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> }</pre>
</div>
<p>　　<strong>Response body返回值中的：</strong></p>
<p>　　<strong>action：</strong> &nbsp; 请求接口进行的动作名称。 通过 http &nbsp;PUT方法修改node.key的值，对应的action值为："set&ldquo;。 &nbsp;PUT方法中，请求body中存在 prevExist=true时， action为<strong>update；</strong>&nbsp;prevExist=false时，action为<strong>create；</strong>&nbsp;其他为<strong>set</strong>。</p>
<p>　　<strong>node.createIndex:</strong> &nbsp;etcd每次变化时创建的，唯一的，单调递增的、整数值作为索引。这个特定的索引值反映了在etcd状态成员里创建了一个给定key。除了用户请求外，etcd内部运行（如启动服务，重启服务、集群信息变化：添加、删除、同步服务等）也可能会因为对节点有变动而引起该值的变化。所以即使我们首次请求，此值也不是从1开始。<strong>update、get</strong>&nbsp;action不引起 node.createIndex值的变化。</p>
<p>&nbsp;<span style="line-height: 1.5;">&nbsp; &nbsp; &nbsp;&nbsp;<strong>node.key:</strong> &nbsp;在</span><span style="line-height: 1.5;">请求的HTTP路径中，作为操作对象key。etcd使用一个类似文件系统的方式来反映键值存储的内容， 因此所有的key都是以&lsquo;/&rsquo;开始 。</span></p>
<p>&nbsp; &nbsp; &nbsp;<strong> node.modifiedIndex: &nbsp;</strong>像&nbsp;<strong>node.createIndex, </strong>这个属性也是etcd的索引。 引起这个值变化的Actions包括：<strong>set</strong>，<strong>delete</strong>，<strong>update</strong>，<strong>create</strong>，<strong>compareAndSwap</strong> 和 <strong>compareAndDelete</strong>。因为 <strong>get </strong>和 <strong>watchcommands </strong>在存储中不修改状态，所以这两个action不会修改mode.modifiedIndex值， 也不会修改 node.createIndex的值。 重启服务等也会修改此属性值。</p>
<p><span style="line-height: 1.5;">&nbsp; &nbsp; &nbsp;&nbsp;</span><strong style="line-height: 1.5;">node.value: &nbsp;</strong>处理完请求后的key值。 在上面的实例中，成功请求后，修改节点的值为 Hello world。</p>
<p>&nbsp;</p>
<p>&nbsp; &nbsp; &nbsp; <strong>Response header返回值中：</strong></p>
<p>　　在responses中包括一些的HTTP 的headers部，在header中提供了一些关于etcd集群的全部信息，集群提供服务请求。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> X-Etcd-Cluster-<span style="color: #000000;">Id: 7e27652122e8b2ae
</span><span style="color: #008080;">2</span> X-Etcd-Index: <span style="color: #800080;">93</span>
<span style="color: #008080;">3</span> X-Raft-Index: <span style="color: #800080;">223696</span>
<span style="color: #008080;">4</span> X-Raft-Term: <span style="color: #800080;">8</span></pre>
</div>
<p>&nbsp; &nbsp;<strong>　</strong><strong>X-Etcd-Cluster-Id: &nbsp;</strong>etcd 集群id。</p>
<p><strong>　　X-Etcd-Index：　　&nbsp;</strong>当前etcd的索引，像前面的解释。当在key空间进行watch时，watch开始时，X-Etcd-Index是当前etcd的索引值，这意味着watched事件可能发生在X-Etcd-Index之后。</p>
<p><strong>　　X-Raft-Index：　　 </strong>与X-Etcd-Index索引类似，是raft协议的索引。</p>
<p><strong>　　X-Raft-Term：　　 &nbsp;</strong>是一个在集群中发生master election时，将增长的整数。如果这个值增长的非常快，需要调优这个election超时。详见&nbsp;<a href="https://github.com/coreos/etcd/blob/6acb3d67fbe131b3b2d5d010e00ec80182be4628/Documentation/v2/tuning.md">tuning</a>&nbsp;部分。</p>
<p>&nbsp;</p>
<p><strong style="line-height: 1.5;">2. GET 查询etcd某个键存储的值</strong></p>
<div class="cnblogs_code">
<pre>[root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/message | python -m json.tool</span>
  % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #800080;">100</span>   <span style="color: #800080;">102</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">102</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">64110</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">   99k
{
    </span><span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">get</span><span style="color: #800000;">"</span><span style="color: #000000;">,
    </span><span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
        </span><span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">19</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">19</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Hello world</span><span style="color: #800000;">"</span><span style="color: #000000;">
    }
}</span></pre>
</div>
<p>&nbsp;</p>
<p><strong>3. PUT 修改键值</strong>：与创建新值几乎相同，但是反馈时会有一个<code>prevNode</code>值反应了修改前存储的内容。</p>
<p>　　<strong>-d value=xxxx</strong></p>
<div class="cnblogs_code">
<pre>[root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/message -X PUT -d value="RECREATE" | python -m json.tool</span>
  % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #800080;">100</span>   <span style="color: #800080;">202</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">188</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">14</span>  <span style="color: #800080;">57108</span>   <span style="color: #800080;">4252</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">62666</span><span style="color: #000000;">
{
    </span><span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
    </span><span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
        </span><span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">33</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">33</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">RECREATE</span><span style="color: #800000;">"</span><span style="color: #000000;">
    },
    </span><span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
        </span><span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">32</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">32</span><span style="color: #000000;">,
        </span><span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Hello world</span><span style="color: #800000;">"</span><span style="color: #000000;">
    }
}</span></pre>
</div>
<p>　　Respone中新的字段 "prevNode", 这个字段表示当前请求完成前的请求节点的状态。 prevNode的格式与node相同， 在访问的节点没有前面状态时将被忽略。</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>4. DELETE 删除一个值&nbsp;</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/message -X DELETE | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">177</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">177</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">73261</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  172k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">delete</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">19</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">29</span>
<span style="color: #008080;">11</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">12</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">19</span><span style="color: #000000;">,
</span><span style="color: #008080;">14</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">15</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">28</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">test createIndex</span><span style="color: #800000;">"</span>
<span style="color: #008080;">17</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">18</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>5. PUT 对一个键进行定时删除</strong>：etcd中对键进行定时删除，设定一个ttl值，当这个值到期时键就会被删除。反馈的内容会给出expiration项告知超时时间，ttl项告知设定的时长。</p>
<p>&nbsp; &nbsp; 在设定一个key时，设定其ttl（time to live), ttl时间后，自动删除。</p>
<p><strong>　　-d&nbsp;ttl=xxx</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/foo  -XPUT -d value=bar -d ttl=5 | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">159</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">144</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">15</span>  <span style="color: #800080;">60453</span>   <span style="color: #800080;">6297</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">72000</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">34</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-04-23T12:01:57.992249507Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/foo</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">34</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">5</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">bar</span><span style="color: #800000;">"</span>
<span style="color: #008080;">14</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">15</span> }</pre>
</div>
<p>&nbsp;　　在repsonse中有两个新的字段：</p>
<p>　　expiration：key的有效截至日期。　　</p>
<p>　　ttl:　　 &nbsp; &nbsp; &nbsp; key的ttl值，单位秒。</p>
<p>&nbsp; &nbsp; &nbsp;注意|：</p>
<p>　　　　key只有被cluster header设定过期，如果一个memeber 脱离的集群，它里面的key将没有过期，直到重新加入后才有过期功能。</p>
<p>&nbsp;</p>
<p><strong>6. PUT 取消定时删除任务</strong></p>
<p><strong>　　-d ttl=</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/foo -XPUT -d value=bar -d ttl= -d prevExist=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">254</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">225</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">29</span>  <span style="color: #800080;">98944</span>  <span style="color: #800080;">12752</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  219k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">update</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">38</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/foo</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">39</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">bar</span><span style="color: #800000;">"</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">13</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">14</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">38</span><span style="color: #000000;">,
</span><span style="color: #008080;">15</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-04-23T12:07:05.415596297Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/foo</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">38</span><span style="color: #000000;">,
</span><span style="color: #008080;">18</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">78</span><span style="color: #000000;">,
</span><span style="color: #008080;">19</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">bar</span><span style="color: #800000;">"</span>
<span style="color: #008080;">20</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">21</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>7. PUT 刷新key的 ttl&nbsp;</strong></p>
<p>　　ttl 到删除key和重新设置ttl，都会触发watcher。通过在请求的body中增加<strong> refresh=true</strong>，更新ttl(必须存在)，不引起触发watcher事件。</p>
<p><strong>　　-d refresh=true</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/message -XPUT -d ttl=100 -d refresh=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">304</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">284</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">20</span>  <span style="color: #800080;">46973</span>   <span style="color: #800080;">3307</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">56800</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">145</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-12-28T06:58:20.426383304Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">145</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">100</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">""</span>
<span style="color: #008080;">14</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">15</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">144</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-12-28T06:57:55.628682326Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">18</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">19</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">144</span><span style="color: #000000;">,
</span><span style="color: #008080;">20</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">76</span><span style="color: #000000;">,
</span><span style="color: #008080;">21</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">""</span>
<span style="color: #008080;">22</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">23</span> }</pre>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>8. GET 对键值修改进行监控</strong>：etcd提供的这个API通过long polling(轮询)让用户可以监控一个值或者递归式(<strong>recursive=true</strong> 在url path中作为参数)地监控一个目录及其子目录的值，当目录或值发生变化时，etcd会主动通知。</p>
<p>　　<strong>？wait=true &nbsp; &nbsp;　　　　</strong>监听当前节点</p>
<p><strong>&nbsp; &nbsp; &nbsp; ？recursive=true</strong>&nbsp;　　 递归监听当前节点和子目录</p>
<p>&nbsp; &nbsp; &nbsp; <strong>？waitIndex=xxx　　</strong> 监听过去已经发生的。过去值的查询或监听， 必选与<strong>wait</strong>一起使用。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl <span style="color: #800000;">'</span><span style="color: #800000;">http://127.0.0.1:2379/v2/keys/message?wait=true&amp;waitIndex=2230</span><span style="color: #800000;">'</span>  | python -<span style="color: #000000;">m json.tool
</span><span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">183</span>    <span style="color: #800080;">0</span>   <span style="color: #800080;">183</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>   131k      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  178k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2230</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2230</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">123</span><span style="color: #800000;">"</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">13</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">14</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2229</span><span style="color: #000000;">,
</span><span style="color: #008080;">15</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2229</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">123</span><span style="color: #800000;">"</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">19</span> }</pre>
</div>
<p>&nbsp;</p>
<p><span style="line-height: 1.5;">　　watch 一个ttl自删除的key时，收到如下 &ldquo;expire&rdquo; action。</span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/message?wait=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">215</span>    <span style="color: #800080;">0</span>   <span style="color: #800080;">215</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>     <span style="color: #800080;">19</span>      <span style="color: #800080;">0</span> --:--:--  <span style="color: #800080;">0</span>:<span style="color: #800080;">00</span>:<span style="color: #800080;">10</span> --:--:--    <span style="color: #800080;">45</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">expire</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2223</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2224</span>
<span style="color: #008080;">11</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">12</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2223</span><span style="color: #000000;">,
</span><span style="color: #008080;">14</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-12-28T09:25:00.028597482Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">15</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2223</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">""</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">19</span> }</pre>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>9. GET 对过去的键值操作进行查询</strong>：类似上面提到的监控，在其基础上指定过去某次修改的索引编号，就可以查询历史操作。默认可查询的历史记录为1000条。</p>
<p><strong>　　？ waitIndex=xxx &nbsp;&nbsp;</strong>监听过去已经发生的。 这个在确保在watch命令中，没有丢失事件非常有用。例如：我们反复watch 我们得到节点的 modifiedIndex+1。</p>
<p>　　因为 node 的<strong>modifiedIndex</strong>的值是不连续，如果<strong>waitIndex</strong>的值没有相应<strong>modifiedIndex，返回最大的modifedIndex</strong>的节点信息<strong>。</strong>&nbsp;如果大于节点中所有的<strong>modifiedIndex</strong>，等待，直到节点的modifiedIndex值大于等于waitIndex的值。</p>
<p>　　即使删除key后，也可以查询历史数据。</p>
<p>　　store中有一个全局的currentIndex，每次变更，index会加1.然后每个event都会关联到currentIndex.</p>
<p>　　当客户端调用watch接口（参数中增加 wait参数）时，如果请求参数中有waitIndex，并且waitIndex 小于 currentIndex，则从 EventHistroy 表中查询index小于等于waitIndex，并且和watch key 匹配的 event，如果有数据，则直接返回。如果历史表中没有或者请求没有带 　　waitIndex，则放入WatchHub中，每个key会关联一个watcher列表。 当有变更操作时，变更生成的event会放入EventHistroy表中，同时通知和该key相关的watcher。</p>
<p><strong style="line-height: 1.5;">　　</strong><span style="line-height: 1.5;">注意：</span></p>
<p>　　　　1. 必须与 wait 一起使用；</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;2. curl 中url需要使用引号。</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;3. etcd 仅仅保留系统中所有key最近的1000条event，建议将获取到的response发送到另一个线程处理，而不是处理response而阻塞watch。</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;4. 如果watch超出了etcd保存的最近1000条，建议get后使用response header中的&nbsp;<code>X-Etcd-Index</code>&nbsp;+ 1进行重新watch，而不是使用node中的modifiedIndex+1. 因为 &nbsp;<code>X-Etcd-Index</code>&nbsp; 永远大于等于modifiedIndex， 使用modifiedIndex可能会返回401错误码，同样超出。</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;5. long polling可能会被服务器关闭，如超时或服务器关闭。导致仅仅收到header 200OK，body为空，此时应重新watch。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl <span style="color: #800000;">'</span><span style="color: #800000;">http://127.0.0.1:2379/v2/keys/foo?wait=true&amp;waitIndex=2</span><span style="color: #800000;">'</span> | python -<span style="color: #000000;">m json.tool
</span><span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">144</span>    <span style="color: #800080;">0</span>   <span style="color: #800080;">144</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>   102k      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  140k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">34</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-04-23T12:01:57.992249507Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/foo</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">34</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">5</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">bar</span><span style="color: #800000;">"</span>
<span style="color: #008080;">14</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">15</span> }</pre>
</div>
<p>&nbsp;如果超出了etcd保留的最近1000条，返回 401错误码</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl <span style="color: #800000;">'</span><span style="color: #800000;">http://127.0.0.1:2379/v2/keys/message?wait=true&amp;waitIndex=8</span><span style="color: #800000;">'</span> | python -<span style="color: #000000;">m json.tool
</span><span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">154</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">154</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">56163</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  150k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">cause</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">the requested history has been cleared [1186/8]</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">errorCode</span><span style="color: #800000;">"</span>: <span style="color: #800080;">401</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 8</span>     <span style="color: #800000;">"</span><span style="color: #800000;">index</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2185</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>     <span style="color: #800000;">"</span><span style="color: #800000;">message</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">The event in requested index is outdated and cleared</span><span style="color: #800000;">"</span>
<span style="color: #008080;">10</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong style="line-height: 1.5;">　　</strong></p>
<p><strong>10. PUT&nbsp;<strong>创建目录</strong></strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/dir -XPUT -d dir=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>    <span style="color: #800080;">95</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">87</span>  <span style="color: #800080;">100</span>     <span style="color: #800080;">8</span>  <span style="color: #800080;">21260</span>   <span style="color: #800080;">1955</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">29000</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">63</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">63</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>11. GET 列出目录下所有的节点信息</strong>，最后以<code>/</code>结尾(不是必须的)。还可以通过recursive参数递归列出所有子目录信息。 没有recursive，返回第二级。后面不在返回。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/dir1/ | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">167</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">167</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">65234</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">83500</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">get</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir1</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>         <span style="color: #800000;">"</span><span style="color: #800000;">nodes</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;">13</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">14</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span><span style="color: #000000;">,
</span><span style="color: #008080;">15</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir1/dir2</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">19</span> <span style="color: #000000;">        ]
</span><span style="color: #008080;">20</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">21</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>12. POST 自动在目录下创建有序键</strong>。在对创建的目录使用<code>POST</code>参数，会自动在该目录下创建一个以global etcd index值为键的值，这样就相当于根据创建时间的先后进行了严格排序。<span style="background-color: #ffff00;"><strong>该API对分布式队列这类场景非常有用</strong></span>。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/queue  -XPOST -d value=Job1 | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">127</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">117</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">10</span>  <span style="color: #800080;">31655</span>   <span style="color: #800080;">2705</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">39000</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">create</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">47</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000047</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">47</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Job1</span><span style="color: #800000;">"</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>13. GET&nbsp;按顺序列出所有创建的有序键</strong></p>
<p><strong>　　？ sorted=true</strong></p>
<p><strong>　　<span class="pl-s">? recursive=true</span></strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl -s <span style="color: #800000;">'</span><span style="color: #800000;">http://127.0.0.1:2379/v2/keys/queue?sorted=true</span><span style="color: #800000;">'</span> | python -<span style="color: #000000;">m json.tool
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 3</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">get</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 4</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 5</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">46</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 6</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">46</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">nodes</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;">10</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">11</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">46</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000046</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">46</span><span style="color: #000000;">,
</span><span style="color: #008080;">14</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">""</span>
<span style="color: #008080;">15</span> <span style="color: #000000;">            },
</span><span style="color: #008080;">16</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">17</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">47</span><span style="color: #000000;">,
</span><span style="color: #008080;">18</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000047</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">19</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">47</span><span style="color: #000000;">,
</span><span style="color: #008080;">20</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Job1</span><span style="color: #800000;">"</span>
<span style="color: #008080;">21</span> <span style="color: #000000;">            },
</span><span style="color: #008080;">22</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">23</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">48</span><span style="color: #000000;">,
</span><span style="color: #008080;">24</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000048</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">25</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">48</span><span style="color: #000000;">,
</span><span style="color: #008080;">26</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">aaaa</span><span style="color: #800000;">"</span>
<span style="color: #008080;">27</span> <span style="color: #000000;">            },
</span><span style="color: #008080;">28</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">29</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">49</span><span style="color: #000000;">,
</span><span style="color: #008080;">30</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000049</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">31</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">49</span><span style="color: #000000;">,
</span><span style="color: #008080;">32</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">aaaa</span><span style="color: #800000;">"</span>
<span style="color: #008080;">33</span> <span style="color: #000000;">            },
</span><span style="color: #008080;">34</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">35</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">50</span><span style="color: #000000;">,
</span><span style="color: #008080;">36</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000050</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">37</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">50</span><span style="color: #000000;">,
</span><span style="color: #008080;">38</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">aaaa</span><span style="color: #800000;">"</span>
<span style="color: #008080;">39</span> <span style="color: #000000;">            },
</span><span style="color: #008080;">40</span> <span style="color: #000000;">            {
</span><span style="color: #008080;">41</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">51</span><span style="color: #000000;">,
</span><span style="color: #008080;">42</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/queue/00000000000000000051</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">43</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">51</span><span style="color: #000000;">,
</span><span style="color: #008080;">44</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">aaaa</span><span style="color: #800000;">"</span>
<span style="color: #008080;">45</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">46</span> <span style="color: #000000;">        ]
</span><span style="color: #008080;">47</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">48</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>14. DELETE&nbsp;</strong><strong>删除目录：</strong>默认情况下只允许删除空目录，如果要删除有内容的目录需要加上<code>recursive=true</code>参数。</p>
<p><strong>　　？dir=true　　　　　　　　删除目录&nbsp;</strong></p>
<p><strong>　　？recursive=true　　　　 &nbsp;删除非空目录</strong></p>
<p>&nbsp; &nbsp; &nbsp; 删除非空目录必须使用<strong> recursive=true</strong> 参数，删除空目录，<strong>dir=true</strong>或<strong>recursive=true至少有一个。</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl <span style="color: #800000;">'</span><span style="color: #800000;">http://127.0.0.1:2379/v2/keys/dir1?dir=true</span><span style="color: #800000;">'</span> -XDELETE | python -<span style="color: #000000;">m json.tool
</span><span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>    <span style="color: #800080;">77</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">77</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">38557</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">77000</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">cause</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir1</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">errorCode</span><span style="color: #800000;">"</span>: <span style="color: #800080;">108</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 8</span>     <span style="color: #800000;">"</span><span style="color: #800000;">index</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>     <span style="color: #800000;">"</span><span style="color: #800000;">message</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Directory not empty</span><span style="color: #800000;">"</span>
<span style="color: #008080;">10</span> <span style="color: #000000;">}
</span><span style="color: #008080;">11</span> [root@vStack ~]# curl <span style="color: #800000;">'</span><span style="color: #800000;">http://127.0.0.1:2379/v2/keys/dir1?dir=true&amp;recursive=true</span><span style="color: #800000;">'</span> -XDELETE | python -<span style="color: #000000;">m json.tool
</span><span style="color: #008080;">12</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;">13</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;">14</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">166</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">166</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">62032</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">83000</span>
<span style="color: #008080;">15</span> <span style="color: #000000;">{
</span><span style="color: #008080;">16</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">delete</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">18</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span><span style="color: #000000;">,
</span><span style="color: #008080;">19</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">20</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir1</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">21</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">68</span>
<span style="color: #008080;">22</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">23</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">24</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span><span style="color: #000000;">,
</span><span style="color: #008080;">25</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">26</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir1</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">27</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">67</span>
<span style="color: #008080;">28</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">29</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>15. PUT 创建定时删除的目录</strong>：就跟定时删除某个键类似。如果目录因为超时被删除了，其下的所有内容也自动超时删除。</p>
<p>&nbsp; &nbsp; &nbsp; 如果目录存在，创建时，返回 102 错误码</p>
<p><strong>&nbsp; &nbsp; &nbsp; -d ttl=xx</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/dir  -XPUT -d ttl=30 -d dir=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">157</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">142</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">15</span>  <span style="color: #800080;">22873</span>   <span style="color: #800080;">2416</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">28400</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">52</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-04-23T13:37:51.502289114Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">52</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">30</span>
<span style="color: #008080;">14</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">15</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>16. PUT 设置刷新目录超时时间 &nbsp;&nbsp;</strong>开始创建时，没有设置ttl， 或刷新已设置ttl的目录的ttl的值。</p>
<p><strong>　　-d ttl=xxx　　　　　 设置或刷新的ttl值。 ttl为空是，取消ttl。<br /></strong></p>
<p><strong>　　-d prevExist=true &nbsp; &nbsp;必选参数，否者报错102错误码</strong></p>
<p>　　会触发watcher事件。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/dir -XPUT -d ttl=30 -d dir=true -d prevExist=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">304</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">274</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">30</span>  <span style="color: #800080;">60392</span>   <span style="color: #800080;">6612</span> --:--:-- --:--:-- --:--:-- <span style="color: #800080;">91333</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">update</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">56</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-04-23T13:42:56.395923381Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">61</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">30</span>
<span style="color: #008080;">14</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">15</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">56</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">18</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-04-23T13:42:46.225222674Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">19</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">20</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">56</span><span style="color: #000000;">,
</span><span style="color: #008080;">21</span>         <span style="color: #800000;">"</span><span style="color: #800000;">ttl</span><span style="color: #800000;">"</span>: <span style="color: #800080;">20</span>
<span style="color: #008080;">22</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">23</span> }</pre>
</div>
<p>　　当ttl时间到后，watcher将收到一个"expire" action.　　&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl  http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/dir?wait=true | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">207</span>    <span style="color: #800080;">0</span>   <span style="color: #800080;">207</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>     <span style="color: #800080;">16</span>      <span style="color: #800080;">0</span> --:--:--  <span style="color: #800080;">0</span>:<span style="color: #800080;">00</span>:<span style="color: #800080;">12</span> --:--:--    <span style="color: #800080;">43</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">expire</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2219</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2220</span>
<span style="color: #008080;">11</span> <span style="color: #000000;">    },
</span><span style="color: #008080;">12</span>     <span style="color: #800000;">"</span><span style="color: #800000;">prevNode</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">13</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2219</span><span style="color: #000000;">,
</span><span style="color: #008080;">14</span>         <span style="color: #800000;">"</span><span style="color: #800000;">dir</span><span style="color: #800000;">"</span>: <span style="color: #0000ff;">true</span><span style="color: #000000;">,
</span><span style="color: #008080;">15</span>         <span style="color: #800000;">"</span><span style="color: #800000;">expiration</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-12-28T09:22:35.853484071Z</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">16</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/dir</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">17</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">2219</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">19</span> }</pre>
</div>
<p>&nbsp;&nbsp;</p>
<p><strong>17. 创建一个隐藏节点</strong>：命名时名字以下划线<code>_</code>开头的key或目录，默认就是隐藏键。</p>
<p><span style="line-height: 1.5;">&nbsp; &nbsp; &nbsp; list目录下时，将不显示。可以显示使用。</span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]#  curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/keys/_message  -XPUT -d value="Hello hidden world" | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">134</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">110</span>  <span style="color: #800080;">100</span>    <span style="color: #800080;">24</span>  <span style="color: #800080;">46948</span>  <span style="color: #800080;">10243</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  107k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">action</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">set</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">node</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">createdIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">69</span><span style="color: #000000;">,
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">key</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">/_message</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">modifiedIndex</span><span style="color: #800000;">"</span>: <span style="color: #800080;">69</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>         <span style="color: #800000;">"</span><span style="color: #800000;">value</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">Hello hidden world</span><span style="color: #800000;">"</span>
<span style="color: #008080;">12</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">13</span> }</pre>
</div>
<p>&nbsp;&nbsp;</p>
<p>注意：</p>
<p>&nbsp; &nbsp; &nbsp; 1. api url 区分大小写，包括其中的参数。&nbsp;</p>
<p>　　2. 如果key存在，通过 curl http://IP:PORT/v2/keys/message001&nbsp;-XPUT -d dir=true , 将会把key调整为dir属性，value值为None； 增加 -d prevExist=false，将报105错误码。 修改为dir后，无法在恢复为key。</p>
<p>&nbsp; &nbsp; &nbsp;3. 不能对一个dir进行赋值，即&nbsp;curl http://127.0.0.1:2379/v2/keys/message001 -XPUT -d value=123 &nbsp; &nbsp;， 返回错误码 102， &ldquo;Not a file&rdquo;</p>
<p>&nbsp; &nbsp; &nbsp;4. key相当于文件系统中的文件，可以赋值即向文件写内容。dir相当于文件系统的目录或路径，内容包括dir和key， 即文件系统中的目录和文件。</p>
<p>&nbsp; &nbsp; &nbsp;5. 在api url中的path，体现了存储结构。如果目录不存在，直接创建。如：curl http://127.0.0.1:2379/v2/keys/fst/sec/thr -XPUT -d value=123 &nbsp;中的fst、sec会自动创建为dir。&nbsp;</p>
<p>&nbsp; &nbsp; &nbsp;6. 创建dir与key的区别，即在 curl的body中是否有 dir=true，有即为dir,　否认则key； dir存在时，value无效。 创建key时，value可以不存在。</p>
<p>&nbsp; &nbsp; &nbsp;7. 不能在key下创建dir或可以，否者报错误码：104，&ldquo;Not a directory&rdquo;</p>
<p>&nbsp; &nbsp; &nbsp;8. 目录不能重复创建，即&nbsp;curl -v http://127.0.0.1:2379/v2/keys/message -XPUT -d dir=true &nbsp;如果 message 目录已经已经存在，返回错误码：102，&nbsp;&ldquo;Not a file&rdquo;</p>
<p>&nbsp; &nbsp; &nbsp;9. 删除一个非空目录，返回错误码：102. 通过在url中增加 recursive=true 参数，可以参数非空目录。</p>
<h2>&nbsp;</h2>
<h2>Statistics &nbsp;统计接口</h2>
<p>　　etcd 集群记录大量的统计数据，包括：延时(latency)，带宽和正常运行时间。统计功能通过统计端点(/stats)去理解一个集群的内部健康状态。</p>
<p>　　An etcd cluster keeps track of a number of statistics including latency, bandwidth and uptime. These are exposed via the statistics endpoint to understand the internal health of a cluster.</p>
<h3>Leader Statistics 领导点统计</h3>
<p>&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@localhost testectd]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/stats/self | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">119</span>   <span style="color: #800080;">357</span>  <span style="color: #800080;">119</span>   <span style="color: #800080;">357</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>   274k      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  348k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">id</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">45b967575ff25cb2</span><span style="color: #800000;">"</span><span style="color: #000000;">, 
</span><span style="color: #008080;"> 7</span>     <span style="color: #800000;">"</span><span style="color: #800000;">leaderInfo</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>         <span style="color: #800000;">"</span><span style="color: #800000;">leader</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">45b967575ff25cb2</span><span style="color: #800000;">"</span><span style="color: #000000;">, 
</span><span style="color: #008080;"> 9</span>         <span style="color: #800000;">"</span><span style="color: #800000;">startTime</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-12-29T20:15:13.811259537+08:00</span><span style="color: #800000;">"</span><span style="color: #000000;">, 
</span><span style="color: #008080;">10</span>         <span style="color: #800000;">"</span><span style="color: #800000;">uptime</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">8m19.603722077s</span><span style="color: #800000;">"</span>
<span style="color: #008080;">11</span> <span style="color: #000000;">    }, 
</span><span style="color: #008080;">12</span>     <span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">infra0</span><span style="color: #800000;">"</span><span style="color: #000000;">, 
</span><span style="color: #008080;">13</span>     <span style="color: #800000;">"</span><span style="color: #800000;">recvAppendRequestCnt</span><span style="color: #800000;">"</span>: <span style="color: #800080;">18</span><span style="color: #000000;">, 
</span><span style="color: #008080;">14</span>     <span style="color: #800000;">"</span><span style="color: #800000;">sendAppendRequestCnt</span><span style="color: #800000;">"</span>: <span style="color: #800080;">3670</span><span style="color: #000000;">, 
</span><span style="color: #008080;">15</span>     <span style="color: #800000;">"</span><span style="color: #800000;">sendBandwidthRate</span><span style="color: #800000;">"</span>: <span style="color: #800080;">123950.52498801574</span><span style="color: #000000;">, 
</span><span style="color: #008080;">16</span>     <span style="color: #800000;">"</span><span style="color: #800000;">sendPkgRate</span><span style="color: #800000;">"</span>: <span style="color: #800080;">7.5456304767920797</span><span style="color: #000000;">, 
</span><span style="color: #008080;">17</span>     <span style="color: #800000;">"</span><span style="color: #800000;">startTime</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">2016-12-29T20:14:29.300999352+08:00</span><span style="color: #800000;">"</span><span style="color: #000000;">, 
</span><span style="color: #008080;">18</span>     <span style="color: #800000;">"</span><span style="color: #800000;">state</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">StateLeader</span><span style="color: #800000;">"</span>
<span style="color: #008080;">19</span> }</pre>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@localhost testectd]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/stats/leader | python -m json.tool </span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">132</span>   <span style="color: #800080;">398</span>  <span style="color: #800080;">132</span>   <span style="color: #800080;">398</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>   133k      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  388k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">followers</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 7</span>         <span style="color: #800000;">"</span><span style="color: #800000;">3c828782a67e0043</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 8</span>             <span style="color: #800000;">"</span><span style="color: #800000;">counts</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;"> 9</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">fail</span><span style="color: #800000;">"</span>: <span style="color: #800080;">1211</span><span style="color: #000000;">, 
</span><span style="color: #008080;">10</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">success</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0</span>
<span style="color: #008080;">11</span> <span style="color: #000000;">            }, 
</span><span style="color: #008080;">12</span>             <span style="color: #800000;">"</span><span style="color: #800000;">latency</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">13</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">average</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0</span><span style="color: #000000;">, 
</span><span style="color: #008080;">14</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">current</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0</span><span style="color: #000000;">, 
</span><span style="color: #008080;">15</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">maximum</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0</span><span style="color: #000000;">, 
</span><span style="color: #008080;">16</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">minimum</span><span style="color: #800000;">"</span>: <span style="color: #800080;">9.2233720368547758e+18</span><span style="color: #000000;">, 
</span><span style="color: #008080;">17</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">standardDeviation</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">19</span> <span style="color: #000000;">        }, 
</span><span style="color: #008080;">20</span>         <span style="color: #800000;">"</span><span style="color: #800000;">b26f1b9a6c735437</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">21</span>             <span style="color: #800000;">"</span><span style="color: #800000;">counts</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">22</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">fail</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0</span><span style="color: #000000;">, 
</span><span style="color: #008080;">23</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">success</span><span style="color: #800000;">"</span>: <span style="color: #800080;">3231</span>
<span style="color: #008080;">24</span> <span style="color: #000000;">            }, 
</span><span style="color: #008080;">25</span>             <span style="color: #800000;">"</span><span style="color: #800000;">latency</span><span style="color: #800000;">"</span><span style="color: #000000;">: {
</span><span style="color: #008080;">26</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">average</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0.0073246419065304607</span><span style="color: #000000;">, 
</span><span style="color: #008080;">27</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">current</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0.0032520000000000001</span><span style="color: #000000;">, 
</span><span style="color: #008080;">28</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">maximum</span><span style="color: #800000;">"</span>: <span style="color: #800080;">1.713633</span><span style="color: #000000;">, 
</span><span style="color: #008080;">29</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">minimum</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0.0012520000000000001</span><span style="color: #000000;">, 
</span><span style="color: #008080;">30</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">standardDeviation</span><span style="color: #800000;">"</span>: <span style="color: #800080;">0.035654606550540036</span>
<span style="color: #008080;">31</span> <span style="color: #000000;">            }
</span><span style="color: #008080;">32</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">33</span> <span style="color: #000000;">    }, 
</span><span style="color: #008080;">34</span>     <span style="color: #800000;">"</span><span style="color: #800000;">leader</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">45b967575ff25cb2</span><span style="color: #800000;">"</span>
<span style="color: #008080;">35</span> }</pre>
</div>
<p>&nbsp;</p>
<h2>Memeber API</h2>
<p><strong>1.&nbsp;List members</strong></p>
<p>　　返回http 200 OK response，显示在 etcd 集群中的所有成员。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2379/v2/members | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">138</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">138</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>  <span style="color: #800080;">73287</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  134k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">members</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        {
</span><span style="color: #008080;"> 8</span>             <span style="color: #800000;">"</span><span style="color: #800000;">clientURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;"> 9</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">http://192.168.10.150:2379</span><span style="color: #800000;">"</span>
<span style="color: #008080;">10</span> <span style="color: #000000;">            ],
</span><span style="color: #008080;">11</span>             <span style="color: #800000;">"</span><span style="color: #800000;">id</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">8e9e05c52164694d</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">12</span>             <span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">default</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">13</span>             <span style="color: #800000;">"</span><span style="color: #800000;">peerURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;">14</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:2380</span><span style="color: #800000;">"</span>
<span style="color: #008080;">15</span> <span style="color: #000000;">            ]
</span><span style="color: #008080;">16</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">17</span> <span style="color: #000000;">    ]
</span><span style="color: #008080;">18</span> }</pre>
</div>
<p>&nbsp;</p>
<div class="cnblogs_code">
<pre>[root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2379/v2/members | python -m json.tool</span>
  % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #800080;">100</span>   <span style="color: #800080;">181</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">181</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>   138k      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  176k
{
    </span><span style="color: #800000;">"</span><span style="color: #800000;">members</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
        {
            </span><span style="color: #800000;">"</span><span style="color: #800000;">clientURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
                </span><span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:2379</span><span style="color: #800000;">"</span><span style="color: #000000;">,
                </span><span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:4001</span><span style="color: #800000;">"</span><span style="color: #000000;">
            ],
            </span><span style="color: #800000;">"</span><span style="color: #800000;">id</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">ce2a822cea30bfca</span><span style="color: #800000;">"</span><span style="color: #000000;">,
            </span><span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">default</span><span style="color: #800000;">"</span><span style="color: #000000;">,
            </span><span style="color: #800000;">"</span><span style="color: #800000;">peerURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
                </span><span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:2380</span><span style="color: #800000;">"</span><span style="color: #000000;">,
                </span><span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:7001</span><span style="color: #800000;">"</span><span style="color: #000000;">
            ]
        }
    ]
}</span></pre>
</div>
<p>&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@vStack ~]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2379/v2/members | python -m json.tool</span>
<span style="color: #008080;"> 2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;"> 4</span> <span style="color: #800080;">100</span>   <span style="color: #800080;">227</span>  <span style="color: #800080;">100</span>   <span style="color: #800080;">227</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>   116k      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--<span style="color: #000000;">  221k
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 6</span>     <span style="color: #800000;">"</span><span style="color: #800000;">members</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">        {
</span><span style="color: #008080;"> 8</span>             <span style="color: #800000;">"</span><span style="color: #800000;">clientURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [],
</span><span style="color: #008080;"> 9</span>             <span style="color: #800000;">"</span><span style="color: #800000;">id</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">755ef544f1926e2e</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">10</span>             <span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span>: <span style="color: #800000;">""</span><span style="color: #000000;">,
</span><span style="color: #008080;">11</span>             <span style="color: #800000;">"</span><span style="color: #800000;">peerURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;">12</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">http://127.0.0.1:2380</span><span style="color: #800000;">"</span>
<span style="color: #008080;">13</span> <span style="color: #000000;">            ]
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        },
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        {
</span><span style="color: #008080;">16</span>             <span style="color: #800000;">"</span><span style="color: #800000;">clientURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;">17</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">http://192.168.10.150:2379</span><span style="color: #800000;">"</span>
<span style="color: #008080;">18</span> <span style="color: #000000;">            ],
</span><span style="color: #008080;">19</span>             <span style="color: #800000;">"</span><span style="color: #800000;">id</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">8e9e05c52164694d</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">20</span>             <span style="color: #800000;">"</span><span style="color: #800000;">name</span><span style="color: #800000;">"</span>: <span style="color: #800000;">"</span><span style="color: #800000;">default</span><span style="color: #800000;">"</span><span style="color: #000000;">,
</span><span style="color: #008080;">21</span>             <span style="color: #800000;">"</span><span style="color: #800000;">peerURLs</span><span style="color: #800000;">"</span><span style="color: #000000;">: [
</span><span style="color: #008080;">22</span>                 <span style="color: #800000;">"</span><span style="color: #800000;">http://localhost:2380</span><span style="color: #800000;">"</span>
<span style="color: #008080;">23</span> <span style="color: #000000;">            ]
</span><span style="color: #008080;">24</span> <span style="color: #000000;">        }
</span><span style="color: #008080;">25</span> <span style="color: #000000;">    ]
</span><span style="color: #008080;">26</span> }</pre>
</div>
<p>&nbsp;</p>
<p><strong>2. Add a member</strong></p>
<p>　　成功时返回 HTTP 201 response 状态码，及新建入成员的信息，对新加入的成员生成一个成员id。 失败时，返回失败状态的字符描述。</p>
<p>　　</p>
<p>&nbsp;Returns an HTTP 201 response code and the representation of added member with a newly generated a memberID when successful. Returns a string describing the failure condition when unsuccessful.</p>
<p>If the POST body is malformed an HTTP 400 will be returned. If the member exists in the cluster or existed in the cluster at some point in the past an HTTP 409 will be returned. If any of the given peerURLs exists in the cluster an HTTP 409 will be returned. If the cluster fails to process the request within timeout an HTTP 500 will be returned, though the request may be processed later.</p>
<p>&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> curl http:<span style="color: #008000;">//</span><span style="color: #008000;">10.0.0.10:2379/v2/members -XPOST \</span>
<span style="color: #008080;">2</span> -H <span style="color: #800000;">"</span><span style="color: #800000;">Content-Type: application/json</span><span style="color: #800000;">"</span> -d <span style="color: #800000;">'</span><span style="color: #800000;">{"peerURLs":["http://10.0.0.10:2380"]}</span><span style="color: #800000;">'</span></pre>
</div>
<p>&nbsp;</p>
<p>　　1.&nbsp;&nbsp;需要在header中设置&nbsp;Content-Type: application/json， 否则会报 405 错误&nbsp;Unsupported Media Type</p>
<p>　　2. &nbsp;如果已经存在相同的peerURLs，直接返回当前存在相同peerURLs的member。</p>
<p>&nbsp; &nbsp; &nbsp; 3.<span style="background-color: #ffff00;"> 如果添加一个无法使用的peerURLs，导致服务挂掉，无法操作。重启也无法使用。解决方法删除物理文件，但这个会删除记录的数据，导致持久数据的就丢失。需要进一步寻求解决方法。</span></p>
<p><span style="background-color: #ffff00;">　　　 集群信息会记录到持久化信息文件中，重启问题依旧。除非使用不同的name或改变数据目录。</span></p>
<p><span style="background-color: #ffff00;">　　</span></p>
<p>&nbsp;</p>
<p><strong>3. Delete a member</strong></p>
<p>　　从集群中删除一个memeber。 member ID 必须是一个64位整数的16位编码的字符串。成功时，返回 204 状态码和没有内容。失败时，返回404状态码和字符描述的失败情况。<strong><br /></strong></p>
<p>　　从集群中删除一个不存在的member，返回500错误。集群处理失败请求，包括超时，返回一个500错误码。即使请求可能后面会处理。</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> [root@localhost testectd]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2379/v2/members/2ae1ee131894262b -XDELETE | python -m json.tool</span>
<span style="color: #008080;">2</span>   % Total    % Received %<span style="color: #000000;"> Xferd  Average Speed   Time    Time     Time  Current
</span><span style="color: #008080;">3</span> <span style="color: #000000;">                                 Dload  Upload   Total   Spent    Left  Speed
</span><span style="color: #008080;">4</span>   <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>    <span style="color: #800080;">0</span>     <span style="color: #800080;">0</span>      <span style="color: #800080;">0</span>      <span style="color: #800080;">0</span> --:--:-- --:--:-- --:--:--     <span style="color: #800080;">0</span>
<span style="color: #008080;">5</span> No JSON <span style="color: #0000ff;">object</span> could be decoded</pre>
</div>
<p>&nbsp;</p>
<p><span style="line-height: 1.5;">　　1. 删除成员后，etcd使用的</span><span style="line-height: 1.5;">data-dir必须被删除。如下是删除最后一个member，etcd给出的输出，服务退出。</span></p>
<p>　　　　2016-12-29 16:10:59.544409 E | etcdserver: the member has been permanently removed from the cluster</p>
<p>　　　　2016-12-29 16:10:59.544480 I | etcdserver: the data-dir used by this member must be removed.</p>
<p>　　2. 通过etcdctl 删除一个成员后，服务会退出。通过 etcdctl重新加入，显示为unstart。　</p>
<p>　　　如果需要重新加入集群，先用命令加入，再启动，否则启动时报&nbsp;<strong>the member has been permanently removed from the cluster</strong></p>
<p>　　　加入后，启动前，需要删除其存储的数据(<strong><span style="background-color: #ffcc00;">member id发生了改变，会将使用磁盘记录的id，与新加入的ID不一致</span></strong>)。并设置&nbsp;--initial-cluster-state <strong>existing 不能设置为 new</strong></p>
<p><strong style="line-height: 1.5;">　　　</strong><span style="line-height: 1.5;">注意 cluster版本要一致。cluster</span><span style="line-height: 1.5;">{"etcdserver":"3.0.15","etcdcluster":"3.0.0"} 可以。</span></p>
<p>&nbsp;　　　　　　　　　　　　　　　　　　{"etcdserver":"2.3.7","etcdcluster":"2.3.0"}</p>
<p>　　　　　　　　　　　　　　　出现：&nbsp;{"etcdserver":"3.0.15","etcdcluster":"2.3.0"} &nbsp;在集群系统中出现不同版本的member</p>
<p>　　　以上删除重新加入的操作，高版本的可以，单低版本的不支持，报&nbsp; <span style="background-color: #ffcc00;"><strong>failed to find member 3c828782a67e0043 in cluster 34b660d543ad1445 无法发现其他member</strong></span></p>
<p>&nbsp;</p>
<p><span style="background-color: #ffcc00;"><strong><span style="background-color: #ffffff;">&nbsp;　　</span><br /></strong></span></p>
<p>　 &nbsp;</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; 即 在集群中，成员的版本不同。<strong>低版本</strong>的成员失败退出，重启启动可以重新加入集群。<span style="color: #ff0000; background-color: #ffff00;"><strong>通过接口，被动从集群中移除，再次加入，只能停止所有的成员，删除其中磁盘数据，重新构建。导致数据的丢失，如何恢复？&nbsp;</strong></span><strong>高版本的成员没有此问题。</strong></p>
<p><strong>&nbsp; 　　即 在集群中，成员的版本不同。集群版本降低为 低版本 如：{"etcdserver":"3.0.15","etcdcluster":"2.3.0"}， 低版本的成员退出后，集群版本升级为高版本：{"etcdserver":"3.0.15","etcdcluster":"3.0.0"}&nbsp;&nbsp;　　　　　　　　　　　　　　<br /></strong></p>
<p>&nbsp;</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; 其版本的首先启动时，使用--initial-cluster-state new； &nbsp;高版本的在启动时&nbsp;--initial-cluster-state&nbsp;<strong>existing 会报 集群版本不兼容。需要使用&nbsp;--initial-cluster-state new。 再次启动高版本的可以使用&nbsp;<strong>existing 。</strong></strong></p>
<p><strong><strong>　　 &nbsp;构建集群时，采用就低版本，在高版本加入时，需要使用&nbsp;--initial-cluster-state new 或 不设置， 使用existing ，报集群不兼容。<br /></strong></strong></p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@centos7mini etcd]# ./<span style="color: #000000;">etcdctl member remove 45b967575ff25cb2
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;">Removed member 45b967575ff25cb2 from cluster
</span><span style="color: #008080;"> 3</span> 
<span style="color: #008080;"> 4</span> [root@centos7mini etcd]# ./etcdctl member add infra0 http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2380</span>
<span style="color: #008080;"> 5</span> <span style="color: #000000;">Added member named infra0 with ID 700fb7bf97791e71 to cluster
</span><span style="color: #008080;"> 6</span> 
<span style="color: #008080;"> 7</span> ETCD_NAME=<span style="color: #800000;">"</span><span style="color: #800000;">infra0</span><span style="color: #800000;">"</span>
<span style="color: #008080;"> 8</span> ETCD_INITIAL_CLUSTER=<span style="color: #800000;">"</span><span style="color: #800000;">infra3=http://192.168.10.184:2380,infra0=http://192.168.10.150:2380,infra1=http://192.168.10.231:2380</span><span style="color: #800000;">"</span>
<span style="color: #008080;"> 9</span> ETCD_INITIAL_CLUSTER_STATE=<span style="color: #800000;">"</span><span style="color: #800000;">existing</span><span style="color: #800000;">"</span>
<span style="color: #008080;">10</span> 
<span style="color: #008080;">11</span> [root@centos7mini etcd]# ./<span style="color: #000000;">etcdctl member list
</span><span style="color: #008080;">12</span> 3c828782a67e0043: name=infra3 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.184:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.184</span><span style="color: #008000;">:2379 isLeader=true</span>
<span style="color: #008080;">13</span> 700fb7bf97791e71[unstarted]: peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2380</span>
<span style="color: #008080;">14</span> b26f1b9a6c735437: name=infra1 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.231:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.231</span><span style="color: #008000;">:2379 isLeader=false</span>
<span style="color: #008080;">15</span> [root@centos7mini etcd]# </pre>
</div>
<p>&nbsp;</p>
<p><strong>4. Change the peer urls of a member</strong></p>
<p>　　修改已存在成员的peer urls。成员ID必须是一个64位整数的16进制显示的字符串。成功时，返回204状态码，空内容。失败时，返回失败状态字符描述。</p>
<p>　　修改的成员不存在，返回400 错误码。 如果提供的peerlURL存在，将返回409错误码。500错误： 集群处理超时。</p>
<p>　　</p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> [root@localhost etcd-v3.<span style="color: #800080;">0.15</span>-linux-amd64]# ./<span style="color: #000000;">etcdctl member list
</span><span style="color: #008080;"> 2</span> 3c828782a67e0043: name=infra3 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.184:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.184</span><span style="color: #008000;">:2379 isLeader=false</span>
<span style="color: #008080;"> 3</span> 45b967575ff25cb2: name=infra0 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.150</span><span style="color: #008000;">:2379 isLeader=true</span>
<span style="color: #008080;"> 4</span> b26f1b9a6c735437: name=infra1 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.231:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.231</span><span style="color: #008000;">:2379 isLeader=false</span>
<span style="color: #008080;"> 5</span> [root@localhost etcd-v3.<span style="color: #800080;">0.15</span>-linux-<span style="color: #000000;">amd64]# 
</span><span style="color: #008080;"> 6</span> [root@localhost etcd-v3.<span style="color: #800080;">0.15</span>-linux-amd64]# curl http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2379/v2/members/b26f1b9a6c735437 -XPUT -H "Content-Type: application/json" -d '{"peerURLs":["</span><span style="color: #008000; text-decoration: underline;">http://127.0.0.1</span><span style="color: #008000;">:2380"]}'</span>
<span style="color: #008080;"> 7</span> [root@localhost etcd-v3.<span style="color: #800080;">0.15</span>-linux-<span style="color: #000000;">amd64]# 
</span><span style="color: #008080;"> 8</span> [root@localhost etcd-v3.<span style="color: #800080;">0.15</span>-linux-amd64]# ./<span style="color: #000000;">etcdctl member list
</span><span style="color: #008080;"> 9</span> 3c828782a67e0043: name=infra3 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.184:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.184</span><span style="color: #008000;">:2379 isLeader=false</span>
<span style="color: #008080;">10</span> 45b967575ff25cb2: name=infra0 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.150</span><span style="color: #008000;">:2379 isLeader=true</span>
<span style="color: #008080;">11</span> b26f1b9a6c735437: name=infra1 peerURLs=http:<span style="color: #008000;">//</span><span style="color: #008000;">127.0.0.1:2380 clientURLs=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.231</span><span style="color: #008000;">:2379 isLeader=false</span>
<span style="color: #008080;">12</span> [root@localhost etcd-v3.<span style="color: #800080;">0.15</span>-linux-amd64]# </pre>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><span style="line-height: 1.5;">&nbsp; <strong>在启动etcd设置&nbsp;--listen-client-urls 值时，请将localhost:2379或127.0.0.1:2379 设置，否者 本地etcdctl会报错如下</strong></span></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;">1</span> [root@centos7mini etcd]# ./<span style="color: #000000;">etcdctl member list
</span><span style="color: #008080;">2</span> <span style="color: #000000;">Error: client: etcd cluster is unavailable or misconfigured
</span><span style="color: #008080;">3</span> error #<span style="color: #800080;">0</span>: dial tcp <span style="color: #800080;">127.0</span>.<span style="color: #800080;">0.1</span>:<span style="color: #800080;">4001</span><span style="color: #000000;">: getsockopt: connection refused
</span><span style="color: #008080;">4</span> error #<span style="color: #800080;">1</span>: dial tcp <span style="color: #800080;">127.0</span>.<span style="color: #800080;">0.1</span>:<span style="color: #800080;">2379</span>: getsockopt: connection refused</pre>
</div>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><strong><em>一个节点断开后，成为candicate，向其他member发起vote，重新选准 master/leader。</em></strong></p>
<p>2016-12-29 19:43:15.767905 I | raft: b26f1b9a6c735437 became candidate at term 146<br />2016-12-29 19:43:15.767932 I | raft: b26f1b9a6c735437 received vote from b26f1b9a6c735437 at term 146<br />2016-12-29 19:43:15.767961 I | raft: b26f1b9a6c735437 [logterm: 101, index: 688] sent vote request to 45b967575ff25cb2 at term 146<br />2016-12-29 19:43:17.266905 I | raft: b26f1b9a6c735437 is starting a new election at term 146</p>
<p>&nbsp;</p>
<p><strong>将一个memeber加入两个集群时，出现 cluster id 匹配问题。以下是静态创建cluster。</strong></p>
<div class="cnblogs_code">
<pre><span style="color: #008080;"> 1</span> # etcd --name infra1 --initial-advertise-peer-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.231:2380 \</span>
<span style="color: #008080;"> 2</span>   --listen-peer-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.231:2380 \</span>
<span style="color: #008080;"> 3</span>   --listen-client-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.231:2379,</span><span style="color: #008000; text-decoration: underline;">http://127.0.0.1</span><span style="color: #008000;">:2379 \</span>
<span style="color: #008080;"> 4</span>   --advertise-client-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.231:2379 \</span>
<span style="color: #008080;"> 5</span>   --initial-cluster-token etcd-cluster-<span style="color: #800080;">1</span><span style="color: #000000;"> \
</span><span style="color: #008080;"> 6</span>   --initial-cluster infra0=http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.150:2380,infra1=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.231</span><span style="color: #008000;">:2380,infra3=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.184</span><span style="color: #008000;">:2380 \</span>
<span style="color: #008080;"> 7</span>   --initial-cluster-<span style="color: #000000;">state new
</span><span style="color: #008080;"> 8</span> 
<span style="color: #008080;"> 9</span> # ./etcd --debug --name infra3 --initial-advertise-peer-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.184:2380  \</span>
<span style="color: #008080;">10</span>   --listen-peer-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.184:2380 --initial-cluster infra3=</span><span style="color: #008000; text-decoration: underline;">http://192.168.10.184</span><span style="color: #008000;">:2380 \</span>
<span style="color: #008080;">11</span>   --listen-client-urls http:<span style="color: #008000;">//</span><span style="color: #008000;">192.168.10.184:2379 --advertise-client-urls </span><span style="color: #008000; text-decoration: underline;">http://192.168.10.184</span><span style="color: #008000;">:2379 \</span>
<span style="color: #008080;">12</span>   --initial-cluster-state new --initial-cluster-token etcd-cluster-<span style="color: #800080;">1</span></pre>
</div>
<p>&nbsp;</p>
<p>&nbsp;<em id="__mceDel" style="line-height: 1.5;">2016-12-30 11:47:30.939730 E | rafthttp: request sent was ignored (cluster ID mismatch: remote[3c828782a67e0043]=625ac7f9082c643, local=34b660d543ad1445)</em></p>
<p><em id="__mceDel">2016-12-30 11:47:30.977766 E | rafthttp: request sent was ignored (cluster ID mismatch: remote[3c828782a67e0043]=625ac7f9082c643, local=34b660d543ad1445)</em></p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><strong>如下建立集群后，--debug 提示：150上的iptables防火墙导致。</strong></p>
<p>2016-12-30 12:07:19.479241 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 12:07:19.914614 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:20.781345 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:21.216792 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:21.885187 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 12:07:22.518689 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:22.620358 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 12:07:23.187832 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:23.925031 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:24.490547 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:24.592188 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 12:07:25.226673 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:25.696521 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 12:07:26.528616 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:26.630548 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 12:07:27.000087 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:27.932728 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:28.302774 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 12:07:28.404591 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: getsockopt: no r</p>
<p><strong>如下调试信息是在leader 上的。 由于iptables防火墙的原因导致。</strong></p>
<p>2016-12-30 14:03:10.838829 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:11.353601 W | etcdserver: failed to reach the peerURL(http://192.168.10.150:2380) of member 45b967575ff25cb2 (Get http://192.168.10.150:2380/version: dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 14:03:11.353640 W | etcdserver: cannot get the version of member 45b967575ff25cb2 (Get http://192.168.10.150:2380/version: dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 14:03:11.672262 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:12.140697 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:12.974912 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:13.445167 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:13.547340 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 14:03:14.278497 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:14.380259 D | rafthttp: failed to dial 45b967575ff25cb2 on stream MsgApp v2 (dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 14:03:14.850132 D | rafthttp: failed to dial 45b967575ff25cb2 on stream Message (dial tcp 192.168.10.150:2380: i/o timeout)<br />2016-12-30 14:03:15.358565 W | etcdserver: failed to reach the peerURL(http://192.168.10.150:2380) of member 45b967575ff25cb2 (Get http://192.168.10.150:2380/version: dial tcp 192.168.10.150:2380: getsockopt: no route to host)<br />2016-12-30 14:03:15.358613 W | etcdserver: cannot get the version of member 45b967575ff25cb2 (Get http://192.168.10.150:2380/version: dial tcp 192.168.10.150:2380: getsockopt: no route to host)</p>
<p><strong style="line-height: 1.5;">如下调试信息，是由于 192.168.10.231:2380 无法访问，&nbsp;b26f1b9a6c735437 为member id。</strong></p>
<p>2016-12-30 21:38:43.130791 D | rafthttp: failed to dial b26f1b9a6c735437 on stream Message (dial tcp 192.168.10.231:2380: getsockopt: connection refused)<br />2016-12-30 21:38:43.191227 D | rafthttp: failed to dial b26f1b9a6c735437 on stream MsgApp v2 (dial tcp 192.168.10.231:2380: getsockopt: connection refused)<br />2016-12-30 21:38:43.232280 D | rafthttp: failed to dial b26f1b9a6c735437 on stream Message (dial tcp 192.168.10.231:2380: getsockopt: connection refused)<br />2016-12-30 21:38:43.292289 D | rafthttp: failed to dial b26f1b9a6c735437 on stream MsgApp v2 (dial tcp 192.168.10.231:2380: getsockopt: connection refused)<br />2016-12-30 21:38:43.334129 D | rafthttp: failed to dial b26f1b9a6c735437 on stream Message (dial tcp 192.168.10.231:2380: getsockopt: connection refused)<br />2016-12-30 21:38:43.393576 D | rafthttp: failed to dial b26f1b9a6c735437 on stream MsgApp v2 (dial tcp 192.168.10.231:2380: getsockopt: connection refused)</p>
<p>&nbsp;</p>
<p>2016-12-30 14:18:36.328628 W | rafthttp: the clock difference against peer 3c828782a67e0043 is too high [2.00405135s &gt; 1s]<br />2016-12-30 14:19:06.329559 W | rafthttp: the clock difference against peer 3c828782a67e0043 is too high [2.003973758s &gt; 1s]<br />2016-12-30 14:19:36.331189 W | rafthttp: the clock difference against peer 3c828782a67e0043 is too high [2.004098356s &gt; 1s]</p>
<p>&nbsp;</p>
<p><span style="line-height: 1.5;">2016-12-30 21:38:22.857546 W | rafthttp: the clock difference against peer 3c828782a67e0043 is too high [7h59m58.924003117s &gt; 1s]</span></p>
<p>2016-12-30 21:38:22.892541 W | rafthttp: health check for peer b26f1b9a6c735437 failed<br />2016-12-30 21:38:22.892848 W | rafthttp: the clock difference against peer b26f1b9a6c735437 is too high [7h59m56.920465483s &gt; 1s]</p>
<p>&nbsp;</p></div><div id="MySignature"></div>
<div class="clear"></div>
<div id="blog_post_info_block">
<div id="BlogPostCategory"></div>
<div id="EntryTag"></div>
<div id="blog_post_info">
</div>
<div class="clear"></div>
<div id="post_next_prev"></div>
</div>


转自: https://www.cnblogs.com/doscho/p/6227351.html