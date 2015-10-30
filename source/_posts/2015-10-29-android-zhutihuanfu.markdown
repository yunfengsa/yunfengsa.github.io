---
layout: post
title: "android主题切换"
date: 2015-10-29 13:15:38 +0800
comments: true
categories: android
---

###首先当然是要先设置两套主题了

![主题.jpg](http://7xnvyl.com1.z0.glb.clouddn.com/zhuti.jpg)

```xml
<item name="textLight">@android:color/white</item>
 <item name="appbg">@color/colorPrimaryDarkNight</item>
 <item name="textNight">@color/gray</item>
```
<!--more-->
上边三行就是我们自己要设的属性值.
###同时我们需要在attr里设置

![attr.jpg](http://7xnvyl.com1.z0.glb.clouddn.com/attr.jpg)

这样设置完成之后,我们在xml布局里就可以直接引用属性了`android:backgroud="?attr/appbg`
###设置主题
注意setTheme方法只能在setContentview(int id)之前调用
这里介绍一种重启自身的方法

![ziqi.jpg](http://7xnvyl.com1.z0.glb.clouddn.com/ziqi.jpg)
注意intent增加的两个Flags的意思 我们也可以增加Intent.FLAG_NO_ANIMATION

这个时候要注意activity的启动模式哦,[参考这边文章](http://www.cnblogs.com/lwbqqyumidi/p/3771542.html)

**这里多一句嘴,棱镜(Prism)是一个动态主题切换框架_有兴趣可以看一下**[传送门](https://blog.leancloud.cn/3612/)

####简单说一下皮肤切换
如果到了换肤的阶段 就不适合用上面的方法啦！！因为你不可能在 APK 中放入很多套皮肤！这个会让 APK 变的很大很大！得不偿失呀！目前，我公司项目的做法是：从网络端获取皮肤压缩包！！在本地 APK 中异步下载下来之后，解压缩！得到一个文件包！里面的所有文件的名字和本地 APK 是一样的！这时候很简单啦！我们先保存个标志位--表示引用的是哪套皮肤就行啦！此时，我还用到了EventBus这个通信框架！在每个需要改变的皮肤的 Activity 中注册EventBus! 当在设置发出通知后，每个页面能做出更新！！这个思路！！还有一个比较就是有些控件的背景是是selector或者其他的！！这个就需要解析xml文件了！分别读到与之对应的drawable文件之后在组合用的是这个类：StateListDrawable ！注意到这点就行啦 ！！其他的都很简单了！！这块我就不提供代码啦！！！！