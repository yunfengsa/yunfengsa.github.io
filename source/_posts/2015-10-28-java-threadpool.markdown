---
layout: post
title: "浅谈java线程池"
date: 2015-10-28 21:39:46 +0800
comments: true
categories: android
keywords: threadpool 线性安全 共享资源
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

##关于停止线程的一些操作(android)

* 在Handler很简单,如果直接调用handler.removecallbacks(runnable)即可,例如在postdelay时间之内想停止post,则可以removecallbacks操作.
* Timer的终止操作. <br>(a)在如何想要终止的地方调用timer.cancel<br>(b)让timer线程成为daemon线程,只需要在创建额度时候(new Timer(true)),这样当程序中只有daemon线程的时候,它会自动终止.<br>(c)删除引用,也就是timer置为null<br>(d)放大招,System.exit方法,秒杀掉所有线程
* 普通线程的停止<br>线程有一个弃用的方法stop,属于线程不安全的.所以很不建议使用,使用会出现各种各样的问题,后果自负哟.<br>*方法一*那就是在run方法里自己添加一个成员变量呗,去检查,如果不符合退出循环呗(我们知道线程run结束后便会自行销毁的)<br>*方法二*那就是对于一些阻塞的线程我们该怎么处理呢,比如socket.connect.read,这个时候我们就要用到**Thread.interrupt**,这个方法是安全的,这个只能将阻塞的线程唤醒,而非阻塞的是没有效果的,中断的时候会抛出一个异常(interrupetion),我们前边所说的socket.connection.read的阻塞就会接收这个异常,这个我们在run方法轮询的时候只需要`while(!this.isInterrupted())`,判断是interrupt状态之后直接退出就可以了


Android在自己的API中加入了process类,killProcess(int pid),这其中的pid可以通过Process.mypid()获取,但是要注意这样终结的是整个程序!

##关于线程中的局部变量

局部变量存储在线程自己的栈中。也就是说，局部变量永远也不会被多个线程共享。所以，基础类型的局部变量是线程安全的。下面是基础类型的局部变量的一个例子：

```java

public void someMethod(){

  long threadSafeInt = 0;

  threadSafeInt++;
}

```

**对象的局部引用和基础类型的局部变量不太一样**。尽管引用本身没有被共享，但引用所指的对象并没有存储在线程的栈内。所有的对象都存在共享堆中。如果在某个方法中创建的对象不会逃逸出（译者注：即该对象不会被其它方法获得，也不会被非局部变量引用到）该方法，那么它就是线程安全的。实际上，哪怕将这个对象作为参数传给其它方法，只要别的线程获取不到这个对象，那它仍是线程安全的。下面是一个线程安全的局部引用样例：

```java

public void someMethod(){

  LocalObject localObject = new LocalObject();

  localObject.callMethod();
  method2(localObject);
}

public void method2(LocalObject localObject){
  localObject.setValue("value");
}


```

样例中 LocalObject 对象没有被方法返回，也没有被传递给 someMethod()方法外的对象。每个执行 someMethod()的线程都会创建自己的 LocalObject 对象，并赋值给 localObject 引用。因此，这里的 LocalObject 是线程安全的。事实上，整个 someMethod()都是线程安全的。即使将 LocalObject 作为参数传给同一个类的其它方法或其它类的方法时，它仍然是线程安全的。当然，如果 LocalObject 通过某些方法被传给了别的线程，那它就不再是线程安全的了。

**对象成员**存储在堆上。如果两个线程同时更新同一个对象的同一个成员，那这个代码就不是线程安全的。下面是一个样例：

```java

public class NotThreadSafe{
    StringBuilder builder = new StringBuilder();

    public add(String text){
        this.builder.append(text);
    }    
}

```

如果两个线程同时调用同一个 NotThreadSafe 实例上的 add()方法，就会有竞态条件问题。例如：

```java

NotThreadSafe sharedInstance = new NotThreadSafe();

new Thread(new MyRunnable(sharedInstance)).start();
new Thread(new MyRunnable(sharedInstance)).start();

public class MyRunnable implements Runnable{
  NotThreadSafe instance = null;

  public MyRunnable(NotThreadSafe instance){
    this.instance = instance;
  }

  public void run(){
    this.instance.add("some text");
  }
}

```

注意两个 MyRunnable 共享了同一个 NotThreadSafe 对象。因此，当它们调用 add()方法时会造成竞态条件。

当然，如果这两个线程在不同的 NotThreadSafe 实例上调用 call()方法，就不会导致竞态条件。下面是稍微修改后的例子：

```java

new Thread(new MyRunnable(new NotThreadSafe())).start();
new Thread(new MyRunnable(new NotThreadSafe())).start();

```

现在两个线程都有自己单独的 NotThreadSafe 对象，调用 add()方法时就会互不干扰，再也不会有竞态条件问题了。所以非线程安全的对象仍可以通过某种方式来消除竞态条件。