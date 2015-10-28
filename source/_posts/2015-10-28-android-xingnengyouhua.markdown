---
layout: post
title: "Android_性能优化第一篇"
date: 2015-10-28 21:01:21 +0800
comments: true
categories: android
---

1. 基本调试工具
----
调试工具有Traceview;使用方法:在需要调优的activity.oncreate函数添加`android.os.debug.startMethodTracing("test");`
在ondestroy的函数添加
`andorid.os.debug.stopMethodTracing();`
在内存卡根目录中会生成相应的test.trace的文件,这时候在sdk tools中运行traceview.bat运行相应的trace文件就可以看到分析界面

2. 基本的优化点(主要在于思路的整理)
---
**1.同步改异步**
主要的是注意线程的有效管理,以及注意service和线程的选择.

**2.缓存**
缓存是一个比较负载的过程,过多的资源的分配会导致频繁的gc会影响系统响应.减少对象创建的主要方法有*单例模式,缓存*
<br>(1)单例模式<br>
```java
public class Singleton {
    private static  Singleton instance = null;
    private Singleton(){
    }
    public static synchronized Singleton getInstance() {
        if (instance == null) {
            synchronized (obj) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```
(2)缓存<br>
主要是图片缓存,线程池缓存,连接池缓存,view缓存(典型的convertview的复用),io缓存(iobuffer的使用),消息缓存(obtainmessage的复用)
**Layout优化**
减少view的挂载点,典型的是使用布局标签(include,viewstub,merge)等等
**数据库优化**
**算法优化**
比如linkeslist arraylist比较  以及hashmap和arraylist 的差距等(hashmap的时间复杂度要低的多)
