---
layout: post
title: "从webview看下一代Chromium OS"
date: 2015-10-30 13:12:56 +0800
comments: true
categories: Chromium
---
Google估计要在明年把Chromium OS嵌入到android系统,并在之后发布独立的系统版本,那作为对谷歌文化的钟爱粉,今天就从4.4之后的webiew看一下Chromium吧

###为什么Chromium这么受关注呢
不陌生的Chrome浏览器的强大,人人皆知,他的多进程架构和快速打开网页的能力令人惊艳,没错,这玩意就是基于Chromiun实现的, 本身Chromiun是Google主导的一个浏览器开源工程,但是因为它的架构是OS级别的,所以基于Chromiun的Chromiun OS也就应运而生喽.

在android4.4的webview也是基于Chromium的,在之前其是基于webkit的.到此,应该清楚webview\chroimum\Chrome\Chromium OS的关系了吧!
<!--more-->
###Chromium的基本概述

* Chromium是使用C++开发的,这就牵扯到对象的释放问题,其采用智能指针的方式来实现对象的实现和自动释放(SP和WP就是android系统上提供额度两种强弱指针)
* Chromium是一个多线程架构,那就牵扯到进程间通讯的问题,Chromium会给自己每一个线程创建一个消息队列,如果其他的线程想在本线程执行某一操作的时候,会向本线程发送一个Closure,最终这个Closure会在本线程上得到执行-----这就是Closure机制(像不像Handler)
* Chromium不仅仅是一个多线程架构,也是一个多进程的架构,多线程解决网页卡顿的问题,多进程解决网页的稳定性问题<br>其多线程模型是异步的,就是我抛出Closure,不需要等待它的完成,我就可以哦去做其他事情.
* Chromium的多进程主要包括四类:Browser进程  Render进程  GPU进程  Plugin进程

	* Browser进程:每一个Chromium实例都会有一个Browser进程,而且只有一个,这个进程负责合成浏览器的UI,包括标题栏,地址and so on;
	* Render金策划那个:每一个Tab会有一个Render进程,它的作用是渲染解析网页的内容,其渲染的内容要通过Browser进程合成之后,才能在屏幕上看到;
	* GPU进程:当开启硬件加速之后,Browser进程和Render进程都是通过GPU来渲染UI;
	* Plugin进程:用来运行第三方插件,比如Flash,同一个plugin的不同实例都是运行在同一个进程下边的,用此来避免创建过多的Plugin进程.<br><br>
	* 多进程架构图:

![chromiun进程.png](http://7xnvyl.com1.z0.glb.clouddn.com/2015-10-30chromiun进程.png)