---
layout: post
title: "android_性能优化第四篇_java代码及网络"
date: 2015-10-29 16:22:14 +0800
comments: true
categories: android
---
##一 java代码
###方式1 降低执行时间
这部分主要包括缓存\数据库存储优化\算法优化\JNI\逻辑优化\需求优化
#####缓存
缓存主要包括对象缓存、IO缓存、网络缓存、DB缓存，对象缓存能减少内存的分配，IO缓存减少磁盘的读写次数，网络缓存减少网络传输，DB缓存较少Database的访问次数。
在内存、文件、数据库、网络的读写速度中，内存都是最优的，且速度数量级差别，所以尽量将需要频繁访问或访问一次消耗较大的数据存储在缓存中。
<!--more-->
#####数据存储优化
* 数据类型选择<br>例如,字符串的拼接用StringBuilder\Stringbuffer代替String<br>在可以的情况下尽量使用32位运算符<br>使用SoftRefrence\WeakReference更有利于系统回收<brfinal类型存储在常量区,读取速度更快<br>LocalBroadcastManager相比BroadcastManager,效率和安全性更高
* 数据结构选择<br>1.Arraylist相比Linkedlist,前者取值速度更快,后者内存占用大,但是数据操作(插入\拓展等)速度更快,大多情况选择Arraylist<br>2.Arraylist、HashMap、LinkedHashmap、HashSet，hash系列查询速度更快， arraylist存储的为有序元素， HashMap为键值对数据结构， linkedhashmap可以记住加入次序的hashMap,HashSet不允许重复元素<br>3.HashMap WeakHashMap  WeakHashMap可在适当的时候被系统垃圾回收器自动回收,适合在内存紧张的时候用<br>4.Collection.synchronized和ConcurrentHashMap的选择,这两个都是用来进行并发操作的HashMap,ConcurrentHashMap为细分锁,锁粒度更小,并发性能更优. Collections.synchronizedMap为对象锁, 自己添加函数进行锁控制更方便<br>不要忘记Spare系列哦,性能更优,在key为int的时候,要多使用SparseArray,SparseBooleanArray,SpareIntArray,Pair等
#####算法优化
推荐[结构执法,算法之道](http://blog.csdn.net/v_july_v/)和[微软、Google等面试题](http://zhedahht.blog.163.com/)
###方式2 异步,利用多线程提高TPS
###方式3 提前或延迟操作,错开时间段提高TPS
* 延时操作,java中可使用ScheduledExecutorService代替Timer.schedule
* 提前操作<br>较耗时的操作可统一放到初始化中
##二 网络优化
以下是网络优化中一些客户端和服务器端需要尽量遵守的准则：<br>
a. 图片必须缓存，最好根据机型做图片做图片适配<br>
b. 所有http请求必须添加httptimeout<br>
c. 开启gzip压缩<br>
d. api接口数据以json格式返回，而不是xml或html<br>
e. 根据http头信息中的Cache-Control及expires域确定是否缓存请求结果。<br>
f. 确定网络请求的connection是否keep-alive<br>
g. 减少网络请求次数，服务器端适当做请求合并。<br>
h. 减少重定向次数<br>
i. api接口服务器端响应时间不超过100ms
###优化策略
1. **连接复用**<br>节省建立时间,包括尽量用ip, 开启keep-alive(连接池).android2.2之前的httpURLConnection存在影响连接池bug,但是在最近的一个实时更新的app中,开启连接,在两个小时左右之后,getinputstream会出现阻塞*----暂不清楚原因*.
2. **减少请求次数--请求合并**<br>
3. **减少返回数据的大小**<br>开启gzip,利用JSON这种精简的格式,增量更新, 如常见的服务器进行bsdiff,客户端进行bspatch,支持断点续传,并缓存Http Response的ETag标识,下次请求带上,从而确定是否数据改变过,未改变的直接返回304