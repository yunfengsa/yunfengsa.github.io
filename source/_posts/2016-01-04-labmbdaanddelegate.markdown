---
layout: post
title: "匿名委托的Lambda"
date: 2016-01-04 12:24:21 +0800
comments: true
categories: android
---

##Java的委托事件模型

###事件驱动模型：可视化编程中有重要应用

事件驱动模型的三要素：

* 事件源：能够接收外部事件的源体。
* 侦听器：能够接收事件源通知的对象。
* 事件处理程序：用于处理事件的对象。

那么在java中使用侦听器处理事件的方式，就称为委托事件模型。

##委派（委托）和回调

委派，也就是委托，就是委托其他的类做事情而自己不做或者只做一小部分工作；而回调，就是调用自己的方法。

在java中，这两种机制基本类似。都是通过接口来实现的。
<!--more-->

**例子：**

ProfessionalWorker 、SparetimeWorker 负责发射 Rocket，Rocket 类通过接口 IRocketDelegate 委派（或者说是回调） ProfessionalWorker 、SparetimeWorker自己发射。
总之，Rocket不做具体的事情。看实例代码：

IRocketDelegate.java源码：

```java

public interface IRocketDelegate {
	
	public abstract long startAtTime();
	
	public abstract long endAtTime();
	
	public abstract void sendDidFail();
}

//共有三个方法，分别是用于计算 Rocket 发射时间、计算 Rocket 发射完毕的时间以及发送是否失败的。

```

Rocket.java源码：

```java

public class Rocket {

	IRocketDelegate delegate = null;

	public Rocket(IRocketDelegate delegate) {
		this.delegate = delegate;
	}

	private long getRocketStartTime() {
		long startTime = delegate.startAtTime();
		return startTime;
	}

	private long getRocketEndTime() {
		long endTime = delegate.endAtTime();
		return endTime;
	}

	public boolean isOk() {
		// 超时0.1秒为失败
		if (getRocketEndTime() - getRocketStartTime() >= 100) {
			delegate.sendDidFail();
			return false;
		}
		return true;
	}

}


```

在这个类中，声明一个 IRocketDelegate 接口对象，使用该对象调用接口的方法。我们知道，接口不可以直接实例化，换句话说，实例化接口必须实现接口的所有方法。

那么，我们就把这些实现工作交给具体的发射者来完成。实现回调。

ProfessionalWorker.java源码

```java

public class ProfessionalWorker implements IRocketDelegate {

	@Override
	public long startAtTime() {
		System.out.println("startAtTime is call-back inProfessionalWorker!");
		return System.currentTimeMillis();
	}

	@Override
	public long endAtTime() {
		System.out.println("endAtTime is call-back in ProfessionalWorker!");
		return System.currentTimeMillis();
	}

	@Override
	public void sendDidFail() {
		System.out.println("ProfessionalWorker send Rocket fail !");
	}

	public void send() {
		if (new Rocket(this).isOk()) {
			System.out.println("ProfessionalWorker send Rocket ok !");
		}
	}
}


```

SparetimeWorker.java源码

```java

public class SparetimeWorker {
	public void send() {
		boolean isOk = new Rocket(new IRocketDelegate() {
			
			@Override
			public long startAtTime() {
				System.out.println("startAtTime is call-back in SparetimeWorker !");
				return System.currentTimeMillis();
			}

			@Override
			public long endAtTime() {
				System.out.println("endAtTime is call-back in SparetimeWorker!");
				return System.currentTimeMillis() + 100L;
			}

			@Override
			public void sendDidFail() {
				System.out.println("SparetimeWorker send Rocket fail !");
			}
		}).isOk();
		
		if(isOk) {
			System.out.println("SparetimeWorker send Rocket ok !");
		}
	}
}
//这个类采用内部类完成

```

Test.java

```java

public class Test {

	public static void main(String[] args) {
		new ProfessionalWorker().send();
		
		System.out.println("*********************************************");
		
		new SparetimeWorker().send();
	}
}

```

显示结果

<pre>
endAtTime is call-back in ProfessionalWorker!
startAtTime is call-back inProfessionalWorker!
ProfessionalWorker send Rocket ok !
*********************************************
endAtTime is call-back in SparetimeWorker!
startAtTime is call-back in SparetimeWorker !
SparetimeWorker send Rocket fail !
</pre>

以上内容很简单，在android中这样的用法非常多，面向对象面向接口编程。

##本文重点：Lambda

Lambda简化了匿名委托的使用，java8已经实现了对Lambda的支持，注意android中由于默认支持java7需要增加对Lambda的支持库[gradle-retrolambda]("https://github.com/evant/gradle-retrolambda")

####基本用法

**功能接口**

只包含一个方法的接口叫做功能接口，Lambda表达式用于任何功能接口适用的地方。

例如

```java

button.addActionListener(new ActionListener() {   
    public void actionPerformed(ActionEvent e) {   
        ui.dazzle(e.getModifiers());  
    }  
}); 

```

在java8中支持Lambda可以简化为：

```java

button.addActionListener(e -> { ui.dazzle(e.getModifiers()); }); 

```

编译器知道Lambda 表达式必须符合 void actionPerformed(ActionEvent) 方法的定义。看起来 Lambda 实体返回 void，实际上它可以推断出参数 e 的类型是 java.awt.event.ActionEvent.

**函数集合**

Java 8 的类库包含一个新的包 java.util.functions ，这个包中有很多新的功能接口，这些接口可与集合 API 一起使用。

1.*java.util.functions.Predicate*

使用谓词 (Predicate) 来筛选集合：

```java

List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Dave");  
List<String> filteredNames = names  
        .filter(e -> e.length() >= 4)  
        .into(new ArrayList<String>());  
for (String name : filteredNames) {  
    System.out.println(name);  
} 

```

这里我们有两个新方法：

Iterable < T > filter(Predicate<? super T>) 用于获取元素满足某个谓词返回 true 的结果

 < A extends Fillable < ? super T > > A into(A) 将用返回的结果填充 ArrayList

2.*java.util.functions.Block*

我们可使用一个新的迭代器方法来替换 for 循环 void forEach(Block<? super T>):

```java

List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Dave");  
names  
   .filter(e -> e.length() >= 4)  
   .forEach(e -> { System.out.println(e); }); 

```

forEach() 方法是 internal iteration 的一个实例：迭代过程在 Iterable 和 Block 内部进行，每次可访问一个元素。

最后的结果就是用更少的代码来处理集合：

```java

List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Dave");  
names  
   .mapped(e -> { return e.length(); })  
   .asIterable() // returns an Iterable of BiValue elements  
                 // an element's key is the person's name, its value is the string length  
   .filter(e -> e.getValue() >= 4)  
   .sorted((a, b) -> a.getValue() - b.getValue())  
   .forEach(e -> { System.out.println(e.getKey() + '\t' + e.getValue()); }); 

```

**方法应用**

我们可通过 :: 语法来引用某个方法。方法引用被认为是跟 Lambda 表达式一样的，可用于功能接口所适用的地方。

我们可以引用一个静态方法：

```java

executorService.submit(MethodReference::sayHello);  
 
private static void sayHello() {  
        System.out.println("hello");  
} 

```

或者一个实例的方法：

```java

Arrays.asList("Alice", "Bob", "Charlie", "Dave").forEach(System.out::println); 

```

**默认方法**

直到今天的 Java ，都不可能为一个接口添加方法而不会影响到已有的实现类。而 Java 8 允许你为接口自身指定一个默认的实现：

```java

interface Queue {  
        Message read();  
        void delete(Message message);  
        void deleteAll() default {  
                Message message;  
                while ((message = read()) != null) {  
                        delete(message);  
                }  
        }  
} 

```

子接口可以覆盖默认的方法：

```java

interface BatchQueue extends Queue {  
        void setBatchSize(int batchSize);  
        void deleteAll() default {  
                setBatchSize(100);  
                Queue.super.deleteAll();  
        }  
} 

```

或者子接口也可以通过重新声明一个没有方法体的方法来删除默认的方法：

```java

interface FastQueue extends Queue {  
        void deleteAll();  
}
 
```

这个将强制所有实现了 FastQueue 的类必须实现 deleteAll() 方法。

##HotSpot实现

Lambda 不只是可以减少很多代码的编写，其字节码和运行时的实现也比 Java 7 中的匿名类的效率更高。针对每一个 Lambda 表达式，编译器都会创建一个对应的形如 Lambda$1() 这样的方法。这个过程被称之为 Lambda body desugaring. 当遇见一个 Lambda 表达式，编译器将会发起一个 invokedynamic 调用，并从目标功能接口中获取返回值。

至此Lambda告一段落，后续文章则会进入Rx喽！


	



