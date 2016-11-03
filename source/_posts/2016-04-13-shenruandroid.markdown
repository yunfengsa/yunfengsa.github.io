---
layout: post
title: "深入理解系列：zygote"
date: 2016-04-13 14:06:40 +0800
comments: true
categories: android
---

其实文章的开始应该从jni开始才对，脑残的我写完却意外删除了。。。。等缓过来再补上吧（说不定一直不会补上....），几行文字来通天。。。


[<h3>1.深入理解JNI</h3>](www.google.com)

[<h3>2.深入理解Zygote</h3>](http://yunfengsa.github.io/blog/2016/04/13/shenruandroid/)

[<h3>3.深入理解常见类（未完成）</h3>](www.google.com)

[<h3>4.深入理解Binder</h3>](http://yunfengsa.github.io/blog/2016/04/14/shenruandroid-binder/)

[<h3>5.深入理解Autdio（未完成）</h3>](www.google.com)

[<h3>6.深入理解Surface</h3>](http://yunfengsa.github.io/blog/2016/04/22/shenruandroid-surface/)

<!--more-->

##概述

android是基于linux内核构建的，那必然起于Native，而java又是怎么从Native发起的呢？而这一切则是哼哈二将Zygote（Native程序）和System_server（系统中重要的service）。不清楚native先去看jni吧！

zygote本身是一个Native应用程序，不会涉及到驱动和内核，它是有init进程（Linux）根据init.rc文件创建的。zygote在起始的时候是app_process，然后有linux下的pctrl系统调用换成了zygote。我们在分析zygote的时候发现，其主要的功能实现是AppRuntime的start来完成。

而其主要分三步：

* 创建虚拟机startVm
* 注册JNI函数startReg
* 通过JNI调用java函数，调用main函数，总算和java牵涉上点关系了

下边展开：

**创建虚拟机-startVm：**

基本流程是先进行jni-check，然后设置虚拟机headsize，条用JNI_ceateJavaVM创建虚拟机，pEnv返回当前线程的JNIEnv（这货功能可就强大了，对变量的操作全指望它了）

**注册JNI函数-startTeg**

要使用native函数，注册是必须的，而注册又分为静态注册和动态注册两种，动态注册的过程在系统load动态链接库的时候调用JNi_Onload函数进行注册。通过jniRegisterNativeMethod（env，“xx”，gMethods，NELEM(gMethods)）进行注册，而gMethods返回的就是包含JNINativeMethodStuct的结构体数组（不清楚的可以去看jni喽）。

接下来上桥，我们的java世界的main函数ZygoteInit.java

```java

 public static void main(String argv[]) {
        try {
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "ZygoteInit");
            RuntimeInit.enableDdms();
            // Start profiling the zygote initialization.
            SamplingProfilerIntegration.start();                  

            boolean startSystemServer = false;
            String socketName = "zygote";  //定义socketname
            String abiList = null;
            for (int i = 1; i < argv.length; i++) {
                if ("start-system-server".equals(argv[i])) {
                    startSystemServer = true;
                } else if (argv[i].startsWith(ABI_LIST_ARG)) {
                    abiList = argv[i].substring(ABI_LIST_ARG.length());
                } else if (argv[i].startsWith(SOCKET_NAME_ARG)) {
                    socketName = argv[i].substring(SOCKET_NAME_ARG.length());
                } else {
                    throw new RuntimeException("Unknown command line argument: " + argv[i]);
                }
            }

            if (abiList == null) {
                throw new RuntimeException("No ABI list supplied.");
            }

            registerZygoteSocket(socketName);                 //1.注册zygote用的socket
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "ZygotePreload");
            EventLog.writeEvent(LOG_BOOT_PROGRESS_PRELOAD_START,
                SystemClock.uptimeMillis());
            preload();                                  //2.预加载类和资源
            EventLog.writeEvent(LOG_BOOT_PROGRESS_PRELOAD_END,
                SystemClock.uptimeMillis());
            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            // Finish profiling the zygote initialization.
            SamplingProfilerIntegration.writeZygoteSnapshot();

            // Do an initial gc to clean up after startup
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PostZygoteInitGC");
            gcAndFinalize();
            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            // Disable tracing so that forked processes do not inherit stale tracing tags from
            // Zygote.
            Trace.setTracingEnabled(false);

            // Zygote process unmounts root storage spaces.
            Zygote.nativeUnmountStorageOnInit();

            if (startSystemServer) {
                startSystemServer(abiList, socketName);       //3.启动system_server进程，java的另一片天。
            }

            Log.i(TAG, "Accepting command socket connections");
            runSelectLoop(abiList);                        //4.zygote调用这个函数

            closeServerSocket();      
        } catch (MethodAndArgsCaller caller) {
            caller.run();                        //5.很强大的样子，前方高能
        } catch (RuntimeException ex) {
            Log.e(TAG, "Zygote died with exception", ex);
            closeServerSocket();
            throw ex;
        }
    }

```

对代码中列出的五点进行简单分析：

* 1.建立IPC通信服务-regisZygoteSocket:zygote和系统中其他程序的通信没有使用Binder，而是使用Socket，而这里创建的是服务端socket，静等客户端。。客户端是啥呢？
* 2.预加载类和资源

```java

static void preload() {
        Log.d(TAG, "begin preload");
        Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PreloadClasses");
        preloadClasses();                     //预加载类
        Trace.traceEnd(Trace.TRACE_TAG_DALVIK);
        Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PreloadResources");
        preloadResources();   //预加载资源
        Trace.traceEnd(Trace.TRACE_TAG_DALVIK);
        Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PreloadOpenGL");
        preloadOpenGL();    //预加载openGL
        Trace.traceEnd(Trace.TRACE_TAG_DALVIK);
        preloadSharedLibraries();    //预加载分享库
        preloadTextResources();       //预加载TextResourrces
        // Ask the WebViewFactory to do any initialization that must run in the zygote process,
        // for memory sharing purposes.
        WebViewFactory.prepareWebViewInZygote();   //webview初始化
        Log.d(TAG, "end preload");
    }

//以preload为例
private static void preloadClasses() {
        final VMRuntime runtime = VMRuntime.getRuntime();

        InputStream is;
        try {
            is = new FileInputStream(PRELOADED_CLASSES);  //private static final String PRELOADED_CLASSES = "/system/etc/preloaded-classes";
        } catch (FileNotFoundException e) {
            Log.e(TAG, "Couldn't find " + PRELOADED_CLASSES + ".");
            return;
        }

        Log.i(TAG, "Preloading classes...");
        long startTime = SystemClock.uptimeMillis();

        // Drop root perms while running static initializers.
        final int reuid = Os.getuid();
        final int regid = Os.getgid();

        // We need to drop root perms only if we're already root. In the case of "wrapped"
        // processes (see WrapperInit), this function is called from an unprivileged uid
        // and gid.
        boolean droppedPriviliges = false;
        if (reuid == ROOT_UID && regid == ROOT_GID) {
            try {
                Os.setregid(ROOT_GID, UNPRIVILEGED_GID);
                Os.setreuid(ROOT_UID, UNPRIVILEGED_UID);
            } catch (ErrnoException ex) {
                throw new RuntimeException("Failed to drop root", ex);
            }

            droppedPriviliges = true;
        }

        // Alter the target heap utilization.  With explicit GCs this
        // is not likely to have any effect.
        float defaultUtilization = runtime.getTargetHeapUtilization();
        runtime.setTargetHeapUtilization(0.8f);

        try {
            BufferedReader br
                = new BufferedReader(new InputStreamReader(is), 256);

            int count = 0;
            String line;
            while ((line = br.readLine()) != null) {
                // Skip comments and blank lines.
                line = line.trim();
                if (line.startsWith("#") || line.equals("")) {
                    continue;
                }

                Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PreloadClass " + line);
                try {
                    if (false) {
                        Log.v(TAG, "Preloading " + line + "...");
                    }
                    // Load and explicitly initialize the given class. Use
                    // Class.forName(String, boolean, ClassLoader) to avoid repeated stack lookups
                    // (to derive the caller's class-loader). Use true to force initialization, and
                    // null for the boot classpath class-loader (could as well cache the
                    // class-loader of this class in a variable).
                    Class.forName(line, true, null);
                    count++;
                } catch (ClassNotFoundException e) {
                    Log.w(TAG, "Class not found for preloading: " + line);
                } catch (UnsatisfiedLinkError e) {
                    Log.w(TAG, "Problem preloading " + line + ": " + e);
                } catch (Throwable t) {
                    Log.e(TAG, "Error preloading " + line + ".", t);
                    if (t instanceof Error) {
                        throw (Error) t;
                    }
                    if (t instanceof RuntimeException) {
                        throw (RuntimeException) t;
                    }
                    throw new RuntimeException(t);
                }
                Trace.traceEnd(Trace.TRACE_TAG_DALVIK);
            }

            Log.i(TAG, "...preloaded " + count + " classes in "
                    + (SystemClock.uptimeMillis()-startTime) + "ms.");
        } catch (IOException e) {
            Log.e(TAG, "Error reading " + PRELOADED_CLASSES + ".", e);
        } finally {
            IoUtils.closeQuietly(is);
            // Restore default.
            runtime.setTargetHeapUtilization(defaultUtilization);

            // Fill in dex caches with classes, fields, and methods brought in by preloading.
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PreloadDexCaches");
            runtime.preloadDexCaches();
            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            // Bring back root. We'll need it later if we're in the zygote.
            if (droppedPriviliges) {
                try {
                    Os.setreuid(ROOT_UID, ROOT_UID);
                    Os.setregid(ROOT_GID, ROOT_GID);
                } catch (ErrnoException ex) {
                    throw new RuntimeException("Failed to restore root", ex);
                }
            }
        }
    }

```

代码那么多无非是从 "/system/etc/preloaded-classes"文件中获取流，然后`Class.forName(line, true, null);`获取到类，我们在编写UI的时候用到的com.android.R.xxx资源也都是系统默认的资源，他们就是在zygote加载的

* 3.启动system_server:创建java世界中系统Service所驻留的进程system_server，它死了zygote也完蛋。

函数也在ZygoteInit中：

```java

 private static boolean startSystemServer(String abiList, String socketName)
            throws MethodAndArgsCaller, RuntimeException {
        long capabilities = posixCapabilitiesAsBits(
            OsConstants.CAP_BLOCK_SUSPEND,
            OsConstants.CAP_KILL,
            OsConstants.CAP_NET_ADMIN,
            OsConstants.CAP_NET_BIND_SERVICE,
            OsConstants.CAP_NET_BROADCAST,
            OsConstants.CAP_NET_RAW,
            OsConstants.CAP_SYS_MODULE,
            OsConstants.CAP_SYS_NICE,
            OsConstants.CAP_SYS_RESOURCE,
            OsConstants.CAP_SYS_TIME,
            OsConstants.CAP_SYS_TTY_CONFIG
        );
        /* Hardcoded command line to start the system server */
        String args[] = {
            "--setuid=1000",
            "--setgid=1000",
            "--setgroups=1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1018,1021,1032,3001,3002,3003,3006,3007,3009,3010",
            "--capabilities=" + capabilities + "," + capabilities,
            "--nice-name=system_server",
            "--runtime-args",
            "com.android.server.SystemServer",
        };
        ZygoteConnection.Arguments parsedArgs = null;

        int pid;

        try {
            parsedArgs = new ZygoteConnection.Arguments(args);
            ZygoteConnection.applyDebuggerSystemProperty(parsedArgs);
            ZygoteConnection.applyInvokeWithSystemProperty(parsedArgs);

            /* Request to fork the system server process */
            pid = Zygote.forkSystemServer(                    //原来就是由Zygote分裂出来的啊
                    parsedArgs.uid, parsedArgs.gid,
                    parsedArgs.gids,
                    parsedArgs.debugFlags,
                    null,
                    parsedArgs.permittedCapabilities,
                    parsedArgs.effectiveCapabilities);
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException(ex);
        }

        /* For child process */
        if (pid == 0) {
            if (hasSecondZygote(abiList)) {
                waitForSecondaryZygote(socketName);
            }

            handleSystemServerProcess(parsedArgs);
        }

        return true;
    }

```

关键的依据`Zygote.forkSystemServer`

* 4.有求必应之等待请求-runSelectLoop(abiList);

```java

private static void runSelectLoop(String abiList) throws MethodAndArgsCaller {
        ArrayList<FileDescriptor> fds = new ArrayList<FileDescriptor>();
        ArrayList<ZygoteConnection> peers = new ArrayList<ZygoteConnection>();

        fds.add(sServerSocket.getFileDescriptor());
        peers.add(null);

        while (true) {
            StructPollfd[] pollFds = new StructPollfd[fds.size()];
            for (int i = 0; i < pollFds.length; ++i) {
                pollFds[i] = new StructPollfd();
                pollFds[i].fd = fds.get(i);
                pollFds[i].events = (short) POLLIN;
            }
            try {
                Os.poll(pollFds, -1);
            } catch (ErrnoException ex) {
                throw new RuntimeException("poll failed", ex);
            }
            for (int i = pollFds.length - 1; i >= 0; --i) {
                if ((pollFds[i].revents & POLLIN) == 0) {
                    continue;
                }
                if (i == 0) {
                    ZygoteConnection newPeer = acceptCommandPeer(abiList);
                    peers.add(newPeer);
                    fds.add(newPeer.getFileDesciptor());
                } else {
                    boolean done = peers.get(i).runOnce();
                    if (done) {
                        peers.remove(i);
                        fds.remove(i);
                    }
                }
            }
        }

```

在这里就需要我们第一步创建的socket，当时我们创建的是一个服务端socket，这里进行处理客户端连接和请求，其中客户在zygote中用ZygoteConnection对象来表示，客户的请求有ZygoteConnection的runOnce来处理.

zygote：

1. 它第一天创建了AppRuntime，并start，把权力交给了他。
2. 第二天，启动虚拟机，并注册jni
3. 第三天，通过jni调用ZygoteInit的main函数，正式开启java
4. 第四天，条用了registerZygoteSocket,通过这个函数，它可以相响应子孙的请求。同时进行preload
5. 第五天，通过startSystemServer分裂一个子进程system_server来为java世界服务
6. 第六天，哥累了，调用runSelectLoop来处理客户端的连接，让哥睡会。

##SystemServer（作为zygote的嫡长子，使命那是大大滴，不做昏君，打理朝政）

他是由zygote通过fork（）而来，并且与zygote同生死，创建完成后通过handleSystemServerProcess来处理朝政

```java

private static void handleSystemServerProcess(
            ZygoteConnection.Arguments parsedArgs)
            throws ZygoteInit.MethodAndArgsCaller {

        closeServerSocket();   //关闭继承来的socket

        // set umask to 0077 so new files and directories will default to owner-only permissions.
        Os.umask(S_IRWXG | S_IRWXO);

        if (parsedArgs.niceName != null) {
            Process.setArgV0(parsedArgs.niceName);
        }

        final String systemServerClasspath = Os.getenv("SYSTEMSERVERCLASSPATH");
        if (systemServerClasspath != null) {
            performSystemServerDexOpt(systemServerClasspath);
        }

        if (parsedArgs.invokeWith != null) {
            String[] args = parsedArgs.remainingArgs;
            // If we have a non-null system server class path, we'll have to duplicate the
            // existing arguments and append the classpath to it. ART will handle the classpath
            // correctly when we exec a new process.
            if (systemServerClasspath != null) {
                String[] amendedArgs = new String[args.length + 2];
                amendedArgs[0] = "-cp";
                amendedArgs[1] = systemServerClasspath;
                System.arraycopy(parsedArgs.remainingArgs, 0, amendedArgs, 2, parsedArgs.remainingArgs.length);
            }

            WrapperInit.execApplication(parsedArgs.invokeWith,
                    parsedArgs.niceName, parsedArgs.targetSdkVersion,
                    VMRuntime.getCurrentInstructionSet(), null, args);
        } else {
            ClassLoader cl = null;
            if (systemServerClasspath != null) {
                cl = new PathClassLoader(systemServerClasspath, ClassLoader.getSystemClassLoader());
                Thread.currentThread().setContextClassLoader(cl);
            }

            /*
             * Pass the remaining arguments to SystemServer.
             */
            RuntimeInit.zygoteInit(parsedArgs.targetSdkVersion, parsedArgs.remainingArgs, cl);    //进行初始化
        }


```

接下来看zygoteInit

```java

 public static final void zygoteInit(int targetSdkVersion, String[] argv, ClassLoader classLoader)
            throws ZygoteInit.MethodAndArgsCaller {
        if (DEBUG) Slog.d(TAG, "RuntimeInit: Starting application from zygote");

        Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "RuntimeInit");
        redirectLogStreams();

        commonInit();  //基本初始化
        nativeZygoteInit(); //native层的初始化
        applicationInit(targetSdkVersion, argv, classLoader);  //application 初始化
    }

```

就是在native层的初始化之后在onZygoteInit中与Binder通信系统建立联系。在applicationInit中会抛出一个异常，而捕获这个异常的时候就开始执行systemserver的main函数调用。干嘛这么搞，好像有点别扭啊，比较合理的解释是：**这个调用在ZygoteInit.main中，相当于Native的入口函数位于堆栈的顶层，如果不这样的话，在初始化里边掉用，则会浪费之前的函数调用所占用的一些调用堆栈**

以上完成了调用，现在该梳理SystemServer.java了,这里要说明的是选用的21以上的版本的代码，之前的会有出入，但基本流程不会发生变化

```java

public static void main(String[] args) {
        new SystemServer().run();
    }

    public SystemServer() {
        // Check for factory test mode.
        mFactoryTestMode = FactoryTest.getMode();
    }

    private void run() {											//设置系统相关属性
        try {
            Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "InitBeforeStartServices");
            // If a device's clock is before 1970 (before 0), a lot of
            // APIs crash dealing with negative numbers, notably
            // java.io.File#setLastModified, so instead we fake it and
            // hope that time from cell towers or NTP fixes it shortly.
            if (System.currentTimeMillis() < EARLIEST_SUPPORTED_TIME) {
                Slog.w(TAG, "System clock is before 1970; setting to 1970.");
                SystemClock.setCurrentTimeMillis(EARLIEST_SUPPORTED_TIME);
            }

            // If the system has "persist.sys.language" and friends set, replace them with
            // "persist.sys.locale". Note that the default locale at this point is calculated
            // using the "-Duser.locale" command line flag. That flag is usually populated by
            // AndroidRuntime using the same set of system properties, but only the system_server
            // and system apps are allowed to set them.
            //																							
            // NOTE: Most changes made here will need an equivalent change to
            // core/jni/AndroidRuntime.cpp
            if (!SystemProperties.get("persist.sys.language").isEmpty()) {
                final String languageTag = Locale.getDefault().toLanguageTag();

                SystemProperties.set("persist.sys.locale", languageTag);
                SystemProperties.set("persist.sys.language", "");
                SystemProperties.set("persist.sys.country", "");
                SystemProperties.set("persist.sys.localevar", "");
            }

            // Here we go!
            Slog.i(TAG, "Entered the Android system server!");
            EventLog.writeEvent(EventLogTags.BOOT_PROGRESS_SYSTEM_RUN, SystemClock.uptimeMillis());

            // In case the runtime switched since last boot (such as when
            // the old runtime was removed in an OTA), set the system
            // property so that it is in sync. We can't do this in
            // libnativehelper's JniInvocation::Init code where we already
            // had to fallback to a different runtime because it is
            // running as root and we need to be the system user to set
            // the property. http://b/11463182
            SystemProperties.set("persist.sys.dalvik.vm.lib.2", VMRuntime.getRuntime().vmLibrary());

            // Enable the sampling profiler.
            if (SamplingProfilerIntegration.isEnabled()) {
                SamplingProfilerIntegration.start();
                mProfilerSnapshotTimer = new Timer();
                mProfilerSnapshotTimer.schedule(new TimerTask() {
                        @Override
                        public void run() {
                            SamplingProfilerIntegration.writeSnapshot("system_server", null);
                        }
                    }, SNAPSHOT_INTERVAL, SNAPSHOT_INTERVAL);
            }

            // Mmmmmm... more memory!                  
            VMRuntime.getRuntime().clearGrowthLimit();   //获取更大的内存

            // The system server has to run all of the time, so it needs to be
            // as efficient as possible with its memory usage.
            VMRuntime.getRuntime().setTargetHeapUtilization(0.8f);

            // Some devices rely on runtime fingerprint generation, so make sure
            // we've defined it before booting further.
            Build.ensureFingerprintProperty();

            // Within the system server, it is an error to access Environment paths without
            // explicitly specifying a user.
            Environment.setUserRequired(true);   //系统变量

            // Ensure binder calls into the system always run at foreground priority.
            BinderInternal.disableBackgroundScheduling(true);    //提高binder的优先级

            // Prepare the main looper thread (this thread).
            android.os.Process.setThreadPriority(           //注意这里提高线程的优先级，准备主线程
                android.os.Process.THREAD_PRIORITY_FOREGROUND);
            android.os.Process.setCanSelfBackground(false);
            Looper.prepareMainLooper();

            // Initialize native services.            
            System.loadLibrary("android_servers");  //加载libandroid_servers.so

            // Check whether we failed to shut down last time we tried.
            // This call may not return.
            performPendingShutdown();

            // Initialize the system context. //初始化上下文
            createSystemContext();

            // Create the system service manager.
            mSystemServiceManager = new SystemServiceManager(mSystemContext);   //这里开始创建SystemServiceManager
            LocalServices.addService(SystemServiceManager.class, mSystemServiceManager);
        } finally {
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
        }

        // Start services.   //启动各大服务
        try {
            Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartServices");
            startBootstrapServices();
            startCoreServices();
            startOtherServices();
        } catch (Throwable ex) {
            Slog.e("System", "******************************************");
            Slog.e("System", "************ Failure starting system services", ex);
            throw ex;
        } finally {
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
        }

        // For debug builds, log event loop stalls to dropbox for analysis.
        if (StrictMode.conditionallyEnableDebugLogging()) {
            Slog.i(TAG, "Enabled StrictMode for system server main thread.");
        }

        // Loop forever.
        Looper.loop();
        throw new RuntimeException("Main thread loop unexpectedly exited");
    }

```

其基本流程：

1. zygote通过startSystemServer生成了嫡长子system_server；
2. ss条用handleSystemServerProcess完成自己使命
3. 然后完成一些初始化的后，通过一场抛出的方式执行SystemServer的main函数，
4. 加载.so库，并启动相关service
5. 并且加入binder通信系统，而且会提高优先级，同时再次还会初始化主线程。

##前文提到zygote会开启服务端Socket，那他是怎么被请求呢，

前文分析中已说明，通过runSelectLoopMode处理socket请求

**ActivityManagerService例子说明一切**

ActivityManagerService也是由SystemServer创建的，那他是怎么startActivity的呢？这之中startProcessLocked代码很多，关键部分

```java

Process.ProcessStartResult startResult = Process.start(entryPoint,
                    app.processName, uid, uid, gids, debugFlags, mountExternal,
                    app.info.targetSdkVersion, app.info.seinfo, requiredAbi, instructionSet,
                    app.info.dataDir, entryPointArgs);
            checkTime(startTime, "startProcess: returned from zygote!");
            Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);

```

这个Process就是关键，这个Process是android提供的，会通过其内部函数`openZygoteSocketIfNeedEd`发起socket连接，*ActivityManagerService驻留于SystemServer进程中，所以也就是SS想zygote发送的消息（请求参数有一个字符串：android.app.ActivityThread）*，那么在ZygoteInit通过runSelectLoopmode对其进行处理，还记得客户端在zygote都被用zugoteConnection来表示，而连接之后则会调用其runOnce()：

```java

boolean runOnce() throws ZygoteInit.MethodAndArgsCaller {

        String args[];
        Arguments parsedArgs = null;
        FileDescriptor[] descriptors;

        try {
            args = readArgumentList();
            descriptors = mSocket.getAncillaryFileDescriptors();
        } catch (IOException ex) {
            Log.w(TAG, "IOException on command socket " + ex.getMessage());
            closeSocket();
            return true;
        }

        if (args == null) {
            // EOF reached.
            closeSocket();
            return true;
        }

        /** the stderr of the most recent request, if avail */
        PrintStream newStderr = null;

        if (descriptors != null && descriptors.length >= 3) {
            newStderr = new PrintStream(
                    new FileOutputStream(descriptors[2]));
        }

        int pid = -1;
        FileDescriptor childPipeFd = null;
        FileDescriptor serverPipeFd = null;

        try {
            parsedArgs = new Arguments(args);

            if (parsedArgs.abiListQuery) {
                return handleAbiListQuery();
            }

            if (parsedArgs.permittedCapabilities != 0 || parsedArgs.effectiveCapabilities != 0) {
                throw new ZygoteSecurityException("Client may not specify capabilities: " +
                        "permitted=0x" + Long.toHexString(parsedArgs.permittedCapabilities) +
                        ", effective=0x" + Long.toHexString(parsedArgs.effectiveCapabilities));
            }

            applyUidSecurityPolicy(parsedArgs, peer);
            applyInvokeWithSecurityPolicy(parsedArgs, peer);

            applyDebuggerSystemProperty(parsedArgs);
            applyInvokeWithSystemProperty(parsedArgs);

            int[][] rlimits = null;

            if (parsedArgs.rlimits != null) {
                rlimits = parsedArgs.rlimits.toArray(intArray2d);
            }

            if (parsedArgs.invokeWith != null) {
                FileDescriptor[] pipeFds = Os.pipe2(O_CLOEXEC);
                childPipeFd = pipeFds[1];
                serverPipeFd = pipeFds[0];
                Os.fcntlInt(childPipeFd, F_SETFD, 0);
            }

            /**
             * In order to avoid leaking descriptors to the Zygote child,
             * the native code must close the two Zygote socket descriptors
             * in the child process before it switches from Zygote-root to
             * the UID and privileges of the application being launched.
             *
             * In order to avoid "bad file descriptor" errors when the
             * two LocalSocket objects are closed, the Posix file
             * descriptors are released via a dup2() call which closes
             * the socket and substitutes an open descriptor to /dev/null.
             */

            int [] fdsToClose = { -1, -1 };

            FileDescriptor fd = mSocket.getFileDescriptor();

            if (fd != null) {
                fdsToClose[0] = fd.getInt$();
            }

            fd = ZygoteInit.getServerSocketFileDescriptor();

            if (fd != null) {
                fdsToClose[1] = fd.getInt$();
            }

            fd = null;

            pid = Zygote.forkAndSpecialize(parsedArgs.uid, parsedArgs.gid, parsedArgs.gids,
                    parsedArgs.debugFlags, rlimits, parsedArgs.mountExternal, parsedArgs.seInfo,
                    parsedArgs.niceName, fdsToClose, parsedArgs.instructionSet,
                    parsedArgs.appDataDir);     			//进行fork
        } catch (ErrnoException ex) {
            logAndPrintError(newStderr, "Exception creating pipe", ex);
        } catch (IllegalArgumentException ex) {
            logAndPrintError(newStderr, "Invalid zygote arguments", ex);
        } catch (ZygoteSecurityException ex) {
            logAndPrintError(newStderr,
                    "Zygote security policy prevents request: ", ex);
        }

        try {
            if (pid == 0) {
                // in child
                IoUtils.closeQuietly(serverPipeFd);
                serverPipeFd = null;
                handleChildProc(parsedArgs, descriptors, childPipeFd, newStderr);       //对创建的子线程进行处理

                // should never get here, the child is expected to either
                // throw ZygoteInit.MethodAndArgsCaller or exec().
                return true;
            } else {
                // in parent...pid of < 0 means failure
                IoUtils.closeQuietly(childPipeFd);
                childPipeFd = null;
                return handleParentProc(pid, descriptors, serverPipeFd, parsedArgs);
            }
        } finally {
            IoUtils.closeQuietly(childPipeFd);
            IoUtils.closeQuietly(serverPipeFd);
        }
    }

    private boolean handleAbiListQuery() {
        try {
            final byte[] abiListBytes = abiList.getBytes(StandardCharsets.US_ASCII);
            mSocketOutStream.writeInt(abiListBytes.length);
            mSocketOutStream.write(abiListBytes);
            return false;
        } catch (IOException ioe) {
            Log.e(TAG, "Error writing to command socket", ioe);
            return true;
        }
    }

    /**

```

handleChildProc：

```java

private void handleChildProc(Arguments parsedArgs,
            FileDescriptor[] descriptors, FileDescriptor pipeFd, PrintStream newStderr)
            throws ZygoteInit.MethodAndArgsCaller {
        /**
         * By the time we get here, the native code has closed the two actual Zygote
         * socket connections, and substituted /dev/null in their place.  The LocalSocket
         * objects still need to be closed properly.
         */

        closeSocket();
        ZygoteInit.closeServerSocket();  //关闭继承来的socket

        if (descriptors != null) {
            try {
                Os.dup2(descriptors[0], STDIN_FILENO);
                Os.dup2(descriptors[1], STDOUT_FILENO);
                Os.dup2(descriptors[2], STDERR_FILENO);

                for (FileDescriptor fd: descriptors) {
                    IoUtils.closeQuietly(fd);
                }
                newStderr = System.err;
            } catch (ErrnoException ex) {
                Log.e(TAG, "Error reopening stdio", ex);
            }
        }

        if (parsedArgs.niceName != null) {
            Process.setArgV0(parsedArgs.niceName);
        }

        // End of the postFork event.
        Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
        if (parsedArgs.invokeWith != null) {
            WrapperInit.execApplication(parsedArgs.invokeWith,
                    parsedArgs.niceName, parsedArgs.targetSdkVersion,
                    VMRuntime.getCurrentInstructionSet(),
                    pipeFd, parsedArgs.remainingArgs);
        } else {
            RuntimeInit.zygoteInit(parsedArgs.targetSdkVersion,               //进行zygote初始化
                    parsedArgs.remainingArgs, null /* classLoader */);
        }
    }

```

接着电泳zygoteInit初始化工作，从这里便会开始执行main（invokeStatimain）喽

**android.app.ActivityThread也就是我们apk的main函数，显而易见apk都是zygote的儿子**

zygote是SS的爸爸，但是要不要兄弟，还是SS来控制的,其基本流程如下：

![](http://7xnvyl.com1.z0.glb.clouddn.com/2016-4-13zygotefork.JPG)

##到此zygote已经分析的差不多鸟，拓展点：

####开机速度影响因素

* preload()预加载，包裹预加载类，系统资源，以及webview准备等等
* 对apk信息进行收集
* SS创建的那些service

####虚拟机heapsize的限制

这个值可以被更改，各大厂商的根据定制会自行调整，16、32、64不等，当前主流的应该是64M，由于fork机制导致我们不能动态调节heapsize，解决思路有两个

*　虚拟机自己去搞
*　ｆｏｒｋ之后用ｅｘｅｃ家族函数重新创建虚拟机重新ｊｎｉ重新ｚｙｇｏｔｅ两片天，只能说能行，但是貌似不可行。
