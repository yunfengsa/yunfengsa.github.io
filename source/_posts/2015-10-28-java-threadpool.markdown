---
layout: post
title: "浅谈java线程池"
date: 2015-10-28 21:39:46 +0800
comments: true
categories: android
---

我们知道多次使用new Thread会增加系统开销,占用过多会导致oom,进程的时间也是很难把握.引用java的四种线程池可以有效控制线程的复用以及线程的执行

###第一种:newCachedThreadPool
故名思议,是一种可以缓存的线程池,可灵活回收空闲的线程
```java
ExecutorService cachedThreadPool = Executors.newCachedThreadPool();
for (int i = 0; i < 10; i++) {
	final int index = i;
	try {
		Thread.sleep(index * 1000);
	} catch (InterruptedException e) {
		e.printStackTrace();
	}

	cachedThreadPool.execute(new Runnable() {

		@Override
		public void run() {
			System.out.println(index);
		}
	});
}
```
线程池本身为无限大,但是可以灵活复用.
<!--more-->
###第二种 newFixedThreadPool
可以控制线程的并发数,当大于限制的数量的时候,后来的线程会在当前队列中等待
```java
ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3);
for (int i = 0; i < 10; i++) {
	final int index = i;
	fixedThreadPool.execute(new Runnable() {

		@Override
		public void run() {
			try {
				System.out.println(index);
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	});
}
```

所以程序的结果为每两秒会答应三个数字
###第三种 newScheduledThreadPool
创建一个定长的线程池,同时可以定时和周期性执行任务

**延时执行**
```java
ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
scheduledThreadPool.schedule(new Runnable() {

	@Override
	public void run() {
		System.out.println("delay 3 seconds");
	}
}, 3, TimeUnit.SECONDS);
```

**周期执行**
```java
scheduledThreadPool.scheduleAtFixedRate(new Runnable() {

	@Override
	public void run() {
		System.out.println("delay 1 seconds, and excute every 3 seconds");
	}
}, 1, 3, TimeUnit.SECONDS);
```

这个程序的执行过程是延迟一秒后每三秒执行一次,scheduleThreadPool比timer要更加安全,功能更加强大
###第四种 newSingThreadExecutor
创建一个单线程的线程池,保证所有的任务会按照FIFO\LIFO\优先级执行
```java
ExecutorService singleThreadExecutor = Executors.newSingleThreadExecutor();
for (int i = 0; i < 10; i++) {
	final int index = i;
	singleThreadExecutor.execute(new Runnable() {

		@Override
		public void run() {
			try {
				System.out.println(index);
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	});
}
```
适合执行一些有时间要求的操作,比如数据库的操作
