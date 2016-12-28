---
layout: post
title: "深入理解系列：Binder"
date: 2016-04-14 13:24:54 +0800
comments: true
categories: android
tags: [binder]
keywords: binder
---

科比退役，无所谓喜欢不喜欢，姑且一首歌，静静听：

<iframe width="560" height="315" src="https://www.youtube.com/embed/BZsXcc_tC-o" frameborder="0" allowfullscreen>
墙外视频</iframe>

<!--more-->

[<h3>1.深入理解JNI</h3>](www.google.com)

[<h3>2.深入理解Zygote</h3>](http://yunfengsa.github.io/blog/2016/04/13/shenruandroid/)

[<h3>3.深入理解常见类（未完成）</h3>](www.google.com)

[<h3>4.深入理解Binder</h3>](http://yunfengsa.github.io/blog/2016/04/14/shenruandroid-binder/)

[<h3>5.深入理解Autdio（未完成）</h3>](www.google.com)

[<h3>6.深入理解Surface</h3>](http://yunfengsa.github.io/blog/2016/04/22/shenruandroid-surface/)

现在进入正题。。。

##概述

我们在分析zygote的时候，zygote进程间通信用的是socket，除此之外还有管道、信号、消息队列、共享内存、内存映射、信号量。而Binder是android更加灵活的通信方式。android可以说是一个基于Binder通信的C/S架构体系。

##依然距离说明一切：MediaServer and MediaPlayerService：

MediaServer包括的服务有：AudioFlinger（音频核心服务），AudioPolicyService（音频策略服务），MediaPlayerService（多媒体系统服务），CameraService（摄像/照相服务）。

MS（MediaServer）是一个由c++实现的可执行程序，在网上找了一个源码解析:

<p><img src="/images/binder/maidmediaserver.jpg"></p> 

**获得一个ProcessState实例**

1. Process：：self主要完成以下工作：1.打开dev/binder设备，这就相当于与内核的binder驱动有了一个交互通道
2. Binder驱动分配一块内存来接收数据
3. 打开设备的过程每个进程只进行一次

**defaultServiceManager：实际返回的是BpServiceManager**

建立两个继承与IBinder的BpBinder和BBinder，其中就是客户端对应的是Bpbinder，用来与Server进行交互，而与Bpbinder（proxy）对应的就是BBinder，这两个是一一对应的。

在defaultServiceManager（）中创建的的是Bpbinder，因为我们是ServiceManager的客户端。同时是通过handler来表示BBinder。

那么系统是如何操作这俩binder的呢？答案是：IServiceManager，在其中会创建一个BpServiceManager，他的mRemote的值就是BpBinder，从而与其挂钩，这也就连接了Bpbinder和BBinder，而BnServiceManager从IServiceManager BBinder派生，则它可以直接参与binder通信,而其BnServiceManager是一个虚类，其业务需要子类实现，其强大的家族关系如下：
,
<p><img src="/images/binder/iservicefamily.jpg"></p> 

**注册MediaPlayerService**

MediaPlayerService.cpp

```c++

void MediaPlayerService::instantiate(){
defaultServiceManager->addService{
		String("media.player"),new MediaPlayerService());
}
}

```

显然调用addService是一个业务层额度函数。

通过defaultServiceManager获取BpServiceManager，通过remote获取BpBinder调用其transact，把通信给了Bpbinder。那么问题到底他们是怎么通信的呢？接下来进入通信层了，transact必然是大有所为了，详细代码就不展开，基本流程就是函数会有一个IPCThreadState函数，这个函数会在线程的线程本地存储空间（TLS）操作数据内容，这个空间是线程私有的，而每个IPCThreadState有一个*mIn（用来接收来自BInder设备的数据）、一个mOut（存储发往Binder设备数据）*


**通过mIn、mOut通信，然后开始startThreadPool()，然后joinThread**

无非是新启动线程通过joinThreadPool读取binder设备，其实主线程也是调用了joinThreadPool读取binder设备，binder支持多线程操作。

##前文中说过需要一个类来完成BnServiceManager功能：**ServiceManager**

<pre>我们可以直接跳过以上封装通过此直接和binder打交道</pre>

<p><img src="/images/binder/servicemanager.jpg"></p>

那ServiceManager存在有什么意义呢：

* 管理服务，权限控制
* 通过字符串查找service
* 统一管理server，统一给client提供server的动向

一个client如果想获得service信息，必须先和ServiceManager打交道，查询对应服务的信息，返回BpBinder，查询不到，则会等到，直到服务注册到ServiceManager中为止。通过interface_cast，将这个binder转换成BpXXXXService,然后进行相关操作。

调用函数的基本流程就是将数据打包发送给BInder驱动，并由BpBinder中的handle值找到对应端的处理者来处理。在MediaPlayerService便会驻留在MediaServer进程中，这个进程有两个线程在talkwitheDriver，MediaPlayerService的继承关系：

<p><img src="/images/binder/mediaplayer.JPG"></p>

##到此，我们试着捋一下纯native的service实现

* 假设我们的服务的名字叫Test，创建一个Test.cpp：1、defaultServiceManager。2、addService。3、startThreadPool。4、joinThreadPool。
* 跨进程的C/S，本地需要一个BnTest，对端需要一个BpTest代理。
* 然后需要实现BnTest和一个Bptest的实现

##接下来就是我们关注的重点AIDL：

**步骤1：** 首先需要创建一个ITest.aidl

ITest.aidl

```java

package com.test.service
import com.test.complicateDataStrcture

interface ITest{

	int getTest(out compicateDataStructure);  //注意没有修饰符，in表示输入参数，out表示输出参数
	int setTest(in String name,in boolean reStartServer);

}

```
这个时候编译器会生成一个com.test.ITest.java

**步骤2：**实现服务端，从ITest.Stub派生

上文生成的ITest.java只是实现了类似BnTest的一个东西，业务的实现需要从ITest.Stub派生

```java

class ITestImpl extends ITest.Stub{
	public void getTest(complicateDAtaStructure csd) throws RmoteException{
		//实现具体内容
}
	public void setTest(in String name,in boolean reStartServer) throws RemoteExcetion{
		//实现具体内容
}
}

```

这个时候aidl工具会自动生成： src下生成com.test.service包结构目录；gen下也有一个com.test.service包结构

**步骤3：**实现代理端，另起一个应用程序

把步骤2生成的gen下的com.test.service复制到com.test.client中。服务端一般驻留在Service进程，所以可以在Client端的onServiceConnected函数中获得代理对象。

Client端

```java

private ServiceConnection serviceConnection = new ServiceConnection(){
	public void onServiceConncted(ComponentName name,IBinder service){
		ITestProxy=ITest.Stub.asInterface(service);//得到BpTest
}
}

```

这样便支持简单的数据结构与java中的String类型的数据进行跨进程传递，实现复杂的数据结构的传递，还需要

* 比如文中的complicatedDataStructure，它必须实现implements Parcelable接口。
* 内部必须有一个静态的CREATOR类。
* 定义一个complicatedDataStructure.aidl

继承Pacelable接口的写法省略；

complicatedDataStructure.aidl

```java

package com.test.sercie;
parcelable complicatedDataStructure

```

在使用它的aidl文件中导入即可。

这篇文章由于个人能力有限，主要是一个捋清思路而已，详细的android6.0源码分析，[入口](http://gityuan.com/columns/)