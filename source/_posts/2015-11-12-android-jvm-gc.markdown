---
layout: post
title: "Android JVM GC那点事（Dalvik ART）"
date: 2015-11-12 11:46:40 +0800
comments: true
categories: android
keywords: GC Dalvik 虚拟机 ART
---

详述一下深奥的安卓内存回收那点事

##1.JVM内存回收机制
###1.1回收算法

标记回收算法（Mark and Sweep GC）<br>                 
从"GC Roots"集合开始，将内存整个遍历一次，保留所有可以被GC Roots直接或间接引用到的对象，而剩下的对象都当作垃圾对待并回收，这个算法需要中断进程内其它组件的执行并且可能产生内存碎片。

复制算法 (Copying）<br>        
将现有的内存空间分为两快，每次只使用其中一块，在垃圾回收时将正在使用的内存中的存活对象复制到未被使用的内存块中，之后，清除正在使用的内存块中的所有对象，交换两个内存的角色，完成垃圾回收。

标记-压缩算法 (Mark-Compact)<br>         
先需要从根节点开始对所有可达对象做一次标记，但之后，它并不简单地清理未标记的对象，而是将所有的存活对象压缩到内存的一端。之后，清理边界外所有的空间。这种方法既避免了碎片的产生，又不需要两块相同的内存空间，因此，其性价比比较高。

分代<br>                 
将所有的新建对象都放入称为年轻代的内存区域，年轻代的特点是对象会很快回收，因此，在年轻代就选择效率较高的复制算法。当一个对象经过几次回收后依然存活，对象就会被放入称为老生代的内存空间。对于新生代适用于复制算法，而对于老年代则采取标记-压缩算法。
<!--more-->

###1.2复制和标记-压缩算法的区别
乍一看这两个算法似乎并没有多大的区别，都是标记了然后挪到另外的内存地址进行回收，那为什么不同的分代要使用不同的回收算法呢？
 其实2者最大的区别在于前者是用空间换时间后者则是用时间换空间。

前者的在工作的时候是不没有独立的“Mark”与“Copy”阶段的，而是合在一起做一个动作，就叫Scavenge（或Evacuate，或者就叫Copy）。也就是说，每发现一个这次收集中尚未访问过的活对象就直接Copy到新地方，同时设置Forwarding Pointer，这样的工作方式就需要多一份空间。

后者在工作的时候则需要分别的Mark与Compact阶段，Mark阶段用来发现并标记所有活的对象，然后compact阶段才移动对象来达到Compact的目的。如果Compact方式是Sliding Compaction，则在Mark之后就可以按顺序一个个对象“滑动”到空间的某一侧。

因为已经先遍历了整个空间里的对象图，知道所有的活对象了，所以移动的时候就可以在同一个空间内而不需要多一份空间。
所以新生代的回收会更快一点，老年代的回收则会需要更长时间，同时压缩阶段是会暂停应用的，所以给我们应该尽量避免对象出现在老年代。

##2.Dalvik虚拟机
###2.1Java堆

Java堆实际上是由一个Active堆和一个Zygote堆组成的，其中，Zygote堆用来管理Zygote进程在启动过程中预加载和创建的各种对象，而Active堆是在Zygote进程Fork第一个子进程之前创建的。以后启动的所有应用程序进程是被Zygote进程Fork出来的，并都持有一个自己的Dalvik虚拟机。在创建应用程序的过程中，Dalvik虚拟机采用Cow策略复制Zygote进程的地址空间。

Cow策略：一开始的时候（未复制Zygote进程的地址空间的时候），应用程序进程和Zygote进程共享了同一个用来分配对象的堆。当Zygote进程或者应用程序进程对该堆进行写操作时，内核就会执行真正的拷贝操作，使得Zygote进程和应用程序进程分别拥有自己的一份拷贝，这就是所谓的Cow。因为Copy是十分耗时的，所以必须尽量避免Copy或者尽量少的Copy。

为了实现这个目的，当创建第一个应用程序进程时，会将已经使用了的那部分堆内存划分为一部分，还没有使用的堆内存划分为另外一部分。前者就称为Zygote堆，后者就称为Active堆。这样只需把zygote堆中的内容复制给应用程序进程就可以了。以后无论是Zygote进程，还是应用程序进程，当它们需要分配对象的时候，都在Active堆上进行。这样就可以使得Zygote堆尽可能少地被执行写操作，因而就可以减少执行写时拷贝的操作。在Zygote堆里面分配的对象其实主要就是Zygote进程在启动过程中预加载的类、资源和对象了。这意味着这些预加载的类、资源和对象可以在Zygote进程和应用程序进程中做到长期共享。这样既能减少拷贝操作，还能减少对内存的需求。

###2.2和GC有关的一些指标

记得我们之前在优化魅族某手机的gc卡顿问题时，发现他很容易触发GC_FOR_MALLOC，这个GC类别后续会说到，是分配对象内存不足时导致的。可是我们又设置了很大的堆Size为什么还会内存不够呢，这里需要了解以下几个概念：分别是Java堆的起始大小（Starting Size）、最大值（Maximum Size）和增长上限值（Growth Limit）。

在启动Dalvik虚拟机的时候，我们可以分别通过-Xms、-Xmx和-XX:HeapGrowthLimit三个选项来指定上述三个值，以上三个值分别表示表示：

Starting Size: Dalvik虚拟机启动的时候，会先分配一块初始的堆内存给虚拟机使用。

Growth Limit: 是系统给每一个程序的最大堆上限,超过这个上限，程序就会OOM。

Maximum Size: 不受控情况下的最大堆内存大小，起始就是我们在用largeheap属性的时候，可以从系统获取的最大堆大小。

同时除了上面的这个三个指标外，还有几个指标也是值得我们关注的，那就是堆最小空闲值（Min Free）、堆最大空闲值（Max Free）和堆目标利用率（Target Utilization）。假设在某一次GC之后，存活对象占用内存的大小为LiveSize，那么这时候堆的理想大小应该为(LiveSize / U)。但是(LiveSize / U)必须大于等于(LiveSize + MinFree)并且小于等于(LiveSize + MaxFree)，每次GC后垃圾回收器都会尽量让堆的利用率往目标利用率靠拢。**所以当我们尝试手动去生成一些几百K的对象，试图去扩大可用堆大小的时候，反而会导致频繁的GC，因为这些对象的分配会导致GC，而GC后会让堆内存回到合适的比例，而我们使用的局部变量很快会被回收理论上存活对象还是那么多，我们的堆大小也会缩减回来无法达到扩充的目的**。 与此同时这也是产生CONCURRENT GC的一个因素，后文我们会详细讲到。
###2.3.GC的类型

* GC_FOR_MALLOC: 表示是在堆上分配对象时内存不足触发的GC。
* GC_CONCURRENT: 当我们应用程序的堆内存达到一定量，或者可以理解为快要满的时候，系统会自动触发GC操作来释放内存。
* GC_EXPLICIT: 表示是应用程序调用System.gc、VMRuntime.gc接口或者收到SIGUSR1信号时触发的GC。
* GC_BEFORE_OOM: 表示是在准备抛OOM异常之前进行的最后努力而触发的GC。

###2.4 对象的分配和GC的触发时机

1. 调用函数dvmHeapSourceAlloc在Java堆上分配指定大小的内存。如果分配成功，那么就将分配得到的地址直接返回给调用者了。函数dvmHeapSourceAlloc在不改变Java堆当前大小的前提下进行内存分配，这是属于轻量级的内存分配动作。
2. 如果上一步内存分配失败，这时候就需要执行一次GC了。不过如果GC线程已经在运行中，即gDvm.gcHeap->gcRunning的值等于true，那么就直接调用函数dvmWaitForConcurrentGcToComplete等到GC执行完成就是了。否则的话，就需要调用函数gcForMalloc来执行一次GC了，参数false表示不要回收软引用对象引用的对象。
3. GC执行完毕后，再次调用函数dvmHeapSourceAlloc尝试轻量级的内存分配操作。如果分配成功，那么就将分配得到的地址直接返回给调用者了。
4. 如果上一步内存分配失败，这时候就得考虑先将Java堆的当前大小设置为Dalvik虚拟机启动时指定的Java堆最大值，再进行内存分配了。这是通过调用函数dvmHeapSourceAllocAndGrow来实现的。
5. 如果调用函数dvmHeapSourceAllocAndGrow分配内存成功，则直接将分配得到的地址直接返回给调用者了。
6. 如果上一步内存分配还是失败，这时候就得出狠招了。再次调用函数gcForMalloc来执行GC。参数true表示要回收软引用对象引用的对象。
7. GC执行完毕，再次调用函数dvmHeapSourceAllocAndGrow进行内存分配。这是最后一次努力了，成功与事都到此为止。


示例图如下：

![gc](http://7xnvyl.com1.z0.glb.clouddn.com/2015-11-12gc.png)

###2.5 回收算法和内存碎片

主流的大部分Davik采取的都是标注与清理（Mark and Sweep）回收算法，也有实现了拷贝GC的，这一点和HotSpot是不一样的，具体使用什么算法是在编译期决定的，无法在运行的时候动态更换。如果在编译dalvik虚拟机的命令中指明了"WITH_COPYING_GC"选项，则编译"/dalvik/vm/alloc/Copying.cpp"源码 – 此是Android中拷贝GC算法的实现，否则编译"/dalvik/vm/alloc/HeapSource.cpp" – 其实现了标注与清理GC算法。
由于Mark and Sweep算法的缺点，容易导致内存碎片，所以在这个算法下，当我们有大量不连续小内存的时候，再分配一个较大对象时，还是会非常容易导致GC，比如我们在该手机上decode图片，具体情况如下：

![gc2](http://7xnvyl.com1.z0.glb.clouddn.com/2015-11-12gc2.png)

所以对于Dalvik虚拟机的手机来说，我们首先要尽量避免掉频繁生成很多临时小变量（比如说：getView, onDraw等函数中new对象），另一个又要尽量去避免产生很多长生命周期的大对象。


##3. ART内存回收机制

###3.1 Java堆

 ART运行时内部使用的Java堆的主要组成包括Image Space、Zygote Space、Allocation Space和Large Object Space四个Space，Image Space用来存在一些预加载的类， Zygote Space和Allocation Space与Dalvik虚拟机垃圾收集机制中的Zygote堆和Active堆的作用是一样的，Large Object Space就是一些离散地址的集合，用来分配一些大对象从而提高了GC的管理效率和整体性能，类似如下图：
![gc3](http://7xnvyl.com1.z0.glb.clouddn.com/2015-11-12gc3.png)

###3.2 GC的类型

* kGcCauseForAlloc: 当要分配内存的时候发现内存不够的情况下引起的GC，这种情况下的GC会Stop World.
* kGcCauseBackground: 当内存达到一定的阀值的时候会去出发GC，这个时候是一个后台GC，不会引起Stop World.
* kGcCauseExplicit，显示调用的时候进行的gc，如果ART打开了这个选项的情况下，在system.gc的时候会进行GC.
* 其他更多。

###3.3对象的分配和GC触发时机

![gc4](http://7xnvyl.com1.z0.glb.clouddn.com/2015-11-12GC4.png)

###3.4 并发和非并发GC
 ART在GC上不像Dalvik仅有一种回收算法，ART在不同的情况下会选择不同的回收算法，比如Alloc内存不够的时候会采用非并发GC，而在Alloc后发现内存达到一定阀值的时候又会触发并发GC。同时在前后台的情况下GC策略也不尽相同，后面我们会一一给大家说明。

非并发

步骤1. 调用子类实现的成员函数InitializePhase执行GC初始化阶段。

步骤2. 挂起所有的ART运行时线程。

步骤3. 调用子类实现的成员函数MarkingPhase执行GC标记阶段。

步骤4. 调用子类实现的成员函数ReclaimPhase执行GC回收阶段。

步骤5. 恢复第2步挂起的ART运行时线程。

步骤6. 调用子类实现的成员函数FinishPhase执行GC结束阶段。

并发GC

步骤1. 调用子类实现的成员函数InitializePhase执行GC初始化阶段。

步骤2. 获取用于访问Java堆的锁。

步骤3. 调用子类实现的成员函数MarkingPhase执行GC并行标记阶段。

步骤4. 释放用于访问Java堆的锁。

步骤5. 挂起所有的ART运行时线程。

步骤6. 调用子类实现的成员函数HandleDirtyObjectsPhase处理在GC并行标记阶段被修改的对象。

步骤7. 恢复第4步挂起的ART运行时线程。

步骤8. 重复第5到第7步，直到所有在GC并行阶段被修改的对象都处理完成。

步骤9. 获取用于访问Java堆的锁。

步骤10. 调用子类实现的成员函数ReclaimPhase执行GC回收阶段。

步骤11. 释放用于访问Java堆的锁。

步骤12. 调用子类实现的成员函数FinishPhase执行GC结束阶段。

所以不论是并发还是非并发，都会引起Stop World的情况出现，并发的情况下单次Stop World的时间会更短，基本区别和Dalvik类似。

ART并发GC对于Dalvik来说主要有三个优势点:

. 标记自身

ART在对象分配时会将新分配的对象压入到Heap类的成员变量allocation_stack_描述的Allocation Stack中去，从而可以一定程度上缩减对象遍历范围

. 预读取

对于标记Allocation Stack的内存时，会预读取接下来要遍历的对象，同时再取出来该对象后又会将该对象引用的其他对象压入栈中，直至遍历完毕。

. 减少Suspend时间

在Mark阶段是不会Block其他线程的，这个阶段会有脏数据，比如Mark发现不会使用的但是这个时候又被其他线程使用的数据，在Mark阶段也会处理一些脏数据而不是留在最后Block的时候再去处理，这样也会减少后面Block阶段对于脏数据的处理的时间。

##4 GC log

###4.1 Dalvik Log
Dalvik的日志格式基本如下：
<pre> 
 D/dalvikvm:< GC_Reason>< Amount_freed>,< Heap_stats>,< Pause_time>,< Total_time>
 GC_Reason: 就是我们上文提到的，是gc_alloc还是gc_concurrent，了解到不同的原因方便我们做不同的处理。
 Amount_freed: 表示系统通过这次GC操作释放了多少内存。
 Heap_stats: 中会显示当前内存的空闲比例以及使用情况（活动对象所占内存 / 当前程序总内存）。
 Pause_time: 表示这次GC操作导致应用程序暂停的时间。关于这个暂停的时间，在2.3之前GC操作是不能并发进行的，也就是系统正在进行GC，那么应用程序就只能阻塞住等待GC结束。而自2.3之后，GC操作改成了并发的方式进行，就是说GC的过程中不会影响到应用程序的正常运行，但是在GC操作的开始和结束的时候会短暂阻塞一段时间，所以还有后续的一个total_time。
Total_time: 表示本次GC所花费的总时间和上面的Pause_time,也就是stop all是不一样的，卡顿时间主要看上面的pause_time。
</pre>

###4.2 ART LOG

<pre>
  I/art:< GC_Reason>< Amount_freed>,< LOS_Space_Status>,< Heap_stats>,< Pause_time>,< Total_time>
基本情况和Dalvik没有什么差别，GC的Reason更多了，还多了一个OS_Space_Status.
 LOS_Space_Status：Large Object Space，大对象占用的空间，这部分内存并不是分配在堆上的，但仍属于应用程序内存空间，主要用来管理 bitmap 等占内存大的对象，避免因分配大内存导致堆频繁 GC。
</pre>




##输入了解Dalvik

Dalvik虚拟机用来分配对象的堆划分为两部分，一部分叫做Active Heap，另一部分叫做Zygote Heap。从前面Dalvik虚拟机的启动过程分析这篇文章可以知道，Android系统的第一个Dalvik虚拟机是由Zygote进程创建的。再结合Android应用程序进程启动过程的源代码分析这篇文章，我们可以知道，应用程序进程是由Zygote进程fork出来的。也就是说，应用程序进程使用了一种写时拷贝技术（COW）来复制了Zygote进程的地址空间。这意味着一开始的时候，应用程序进程和Zygote进程共享了同一个用来分配对象的堆。然而，当Zygote进程或者应用程序进程对该堆进行写操作时，内核就会执行真正的拷贝操作，使得Zygote进程和应用程序进程分别拥有自己的一份拷贝。

拷贝是一件费时费力的事情。因此，为了尽量地避免拷贝，Dalvik虚拟机将自己的堆划分为两部分。事实上，Dalvik虚拟机的堆最初是只有一个的。也就是Zygote进程在启动过程中创建Dalvik虚拟机的时候，只有一个堆。但是当Zygote进程在fork第一个应用程序进程之前，会将已经使用了的那部分堆内存划分为一部分，还没有使用的堆内存划分为另外一部分。前者就称为Zygote堆，后者就称为Active堆。以后无论是Zygote进程，还是应用程序进程，当它们需要分配对象的时候，都在Active堆上进行。这样就可以使得Zygote堆尽可能少地被执行写操作，因而就可以减少执行写时拷贝的操作。在Zygote堆里面分配的对象其实主要就是Zygote进程在启动过程中预加载的类、资源和对象了。这意味着这些预加载的类、资源和对象可以在Zygote进程和应用程序进程中做到长期共享。这样既能减少拷贝操作，还能减少对内存的需求。

**垃圾收集是大名鼎鼎的Mark-Sweep**

在垃圾收集的Mark阶段，要求除了垃圾收集线程之外，其它的线程都停止，否则的话，就会可能导致不能正确地标记每一个对象。这种现象在垃圾收集算法中称为Stop The World，会导致程序中止执行，造成停顿的现象。为了尽可能地减少停顿，我们必须要允许在Mark阶段有条件地允许程序的其它线程执行。这种垃圾收集算法称为并行垃圾收集算法（Concurrent GC）。为了实现Concurrent GC，Mark阶段又划分两个子阶段。第一个子阶段只负责标记根集对象。所谓的根集对象，就是指在GC开始的瞬间，被全局变量、栈变量和寄存器等引用的对象。有了这些根集变量之后，我们就可以顺着它们找到其余的被引用变量。例如，一个栈变量引了一个对象，而这个对象又通过成员变量引用了另外一个对象，那该被引用的对象也会同时标记为正在使用。这个标记被根集对象引用的对象的过程就是第二个子阶段。在Concurrent GC，第一个子阶段是不允许垃圾收集线程之外的线程运行的，但是第二个子阶段是允许的。不过，在第二个子阶段执行的过程中，如果一个线程修改了一个对象，那么该对象必须要记录起来，因为它很有可能引用了新的对象，或者引用了之前未引用过的对象。如果不这样做的话，那么就会导致被引用对象还在使用然而却被回收。这种情况出现在只进行部分垃圾收集的情况，这时候Card Table的作用就是用来记录非垃圾收集堆对象对垃圾收集堆对象的引用。Dalvik虚拟机进行部分垃圾收集时，实际上就是只收集在Active堆上分配的对象。因此对Dalvik虚拟机来说，Card Table就是用来记录在Zygote堆上分配的对象在部收垃圾收集执行过程中对在Active堆上分配的对象的引用。

##输入了解ART

####ART基本概述：

我们都知道art虚拟机最明显的特征是其运行本地及其指令，实现java虚拟机的接口，内部集成垃圾回收机制，还有java核心类库。利用AOT直接对dex进行翻译得到本地机器指令，就可以直接运行。翻译机器指令的是基于[LLVM]("http://www.aosabook.org/en/llvm.html"),其中，前端（Frontend）对输入的源代码（Source Code）进行语法分析后，生成一棵抽象语法树（Abstract Syntax Tree，AST），并且可以进一步将得到的抽象语法树转化一种称为LLVM IR的中间语言。LLVM IR是一种与编程语言无关的中间语言，也就是说，不管是C语言，还是Fortran、Ada语言编写的源文件，经过语法分析后，最终都可以得到一个对应的LLVM IR文件。这个LLVM IR文件可以作为后面的优化器（Optimizer）和后端（Backend）的输入文件。优化器对LLVM IR文件进行优化，例如消除代码里面的冗余计算，以提到最终生成的代码的执行效率。后端负责生成最终的机器指令。

在Dalvik运行时中，APK在安装的时候，安装服务PackageManagerService会通过守护进程installd调用一个工具dexopt对打包在APK里面包含有Dex字节码的classes.dex进行优化，优化得到的文件保存在/data/dalvik-cache目录中，并且以.odex为后缀名，表示这是一个优化过的Dex文件。在ART运行时中，APK在安装的时候，同样安装服务PackageManagerService会通过守护进程installd调用另外一个工具dex2oat对打包在APK里面包含有Dex字节码进翻译。这个翻译器实际上就是基于LLVM架构实现的一个编译器，它的前端是一个Dex语法分析器。翻译后得到的是一个ELF格式的oat文件，这个oat文件同样是以.odex后缀结束，并且也是保存在/data/dalvik-cache目录中。

<!--more-->


* android启动的时候创建Zygote利用art运行时到处的java虚拟机接口创建art虚拟机。
* 打包的.dex文件被工具dex2oat翻译成本地机器指令，最终得到一个ELF格式的oat文件。
* apk运行时，oat文件被加载到内存中，并且art虚拟机通过oatdata和oatexec段可以找到任意一个类的方法对应的本地机器指令来执行。

####ART垃圾收集

ART也用到了Mark-sweep

ART运行时堆划分为四个空间，分别是Image Space、Zygote Space、Allocation Space和Large Object Space。其中，Image Space、Zygote Space、Allocation Space是在地址上连续的空间，称为Continuous Space，而Large Object Space是一些离散地址的集合，用来分配一些大对象，称为Discontinuous Space。

Image Space空间包含了需要预加载的系统类对象，Zygote Space和Allocation Space与Dalvik虚拟机垃圾收集机制中的Zygote堆和Active堆的作用是一样的。Zygote Space在Zygote进程和应用程序进程之间共享的，而Allocation Space则是每个进程独占的。同样的，Zygote进程一开始只有一个Image Space和一个Zygote Space。在Zygote进程fork第一个子进程之前，就会把Zygote Space一分为二，原来的已经被使用的那部分堆还叫Zygote Space，而未使用的那部分堆就叫Allocation Space。以后的对象都在Allocation Space上分配。通过上述这种方式，就可以使得Image Space和Zygote Space在Zygote进程和应用程序进程之间进行共享，而Allocation Space就每个进程都独立地拥有一份。注意，虽然Image Space和Zygote Space都是在Zygote进程和应用程序进程之间进行共享，但是前者的对象只创建一次，而后者的对象需要在系统每次启动时根据运行情况都重新创建一遍。

Heap类还定义了以下三个垃圾收集接口：

        1. CollectGarbage: 用来执行显式GC，例如用实现System.gc接口。

        2. ConcurrentGC: 用来执行并行GC，只能被ART运行时内部的GC守护线程调用。

        3. CollectGarbageInternal: ART运行时内部调用的GC接口，可以执行各种类型的GC。

ART的三种垃圾收集类型：

StickyMarkSweep继承于PartialMarkSweep，PartialMarkSweep又继承于MarkSweep、而MarkSweep又继承于GarbageCollector。因此，我们可以推断出，GarbageCollector定义了垃圾收集器接口，而MarkSweep、PartialMarkSweep和StickyMarkSweep通过重定某些接口来实现不同类型的垃圾收集器。

*GarbageCollector*通过定义以下五个虚函数描述GC的各个阶段：		

       1. InitializePhase: 用来实现GC的初始化阶段，用来初始化垃圾收集器内部的状态。

       2. MarkingPhase: 用来实现GC的标记阶段，该阶段有可能是并行的，也有可能不是并行。

       3. HandleDirtyObjectsPhase: 用来实现并行GC的Dirty Object标记，也就是递归标记那些在并行标记对象阶段中被修改的对象。

       4. ReclaimPhase: 用来实现GC的回收阶段。

       5. FinishPhase: 用来实现GC的结束阶段。

*MarkSweep*类通过重写上述五个虚函数实现自己的垃圾收集过程，同时，它又通过定义以下三个虚函数来让子类PartialMarkSweep和StickyMarkSweep实现特定的垃圾收集器：

       1. MarkReachableObjects: 用来递归标记从根集对象引用的其它对象。

       2. BindBitmap: 用来指定垃圾收集范围。

       3. Sweep: 用来回收垃圾对象。 