---
layout: post
title: "加速Gradle之路"
date: 2016-10-17 10:03:14 +0800
comments: true
categories: gradle
---

android studio天然支持的gradle构建工具，遍历的帮助我们构建工程，然而，gradle的构建时间也着实让人苦恼，尤其在开启multidex的情况下，构建时间可以多达几十分钟，甚至按照小时计算，在此，其实出现过很多优化方案，比如[freeline](https://github.com/alibaba/freeline?spm=5176.100239.blogcont61022.78.LptOhC)增量编译工具。

<!--more-->

####Gradle 的生命周期

* 初始化：扫描工程找出需要build的项目
* 配置：分别对每一个module运行其build.gradle来构建任务流程图
* 执行：开始执行构建你的app

在此记录下加速gradle的一些优化方法:

```java

# The Gradle daemon aims to improve the startup and execution time of Gradle.
# When set to true the Gradle daemon is to run the build.
org.gradle.daemon=true

# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
# Default value: -Xmx10248m -XX:MaxPermSize=256m
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
org.gradle.parallel=true

# Enables new incubating mode that makes Gradle selective when configuring projects.
# Only relevant projects are configured which results in faster builds for large multi-projects.
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:configuration_on_demand
org.gradle.configureondemand=true

```

####注意你的lint

module的导入与gradle是极其浪费时间的，一定要注意删除无关的module，同时也未必需要在每次进行gradle的时候都进行`lint`检查。

    gradle build -x lint -x lintVitalRelease

如果希望一直不进行lint

可以在build.gradle中

```

tasks.whenTaskAdded { task ->
    if (task.name.equals("lint")) {
        task.enabled = false
    }
}

```

####其他

另外还要注意在gradle中的task逻辑不宜过于复杂<br>在depencies中的依赖库如果是动态的当然也会增加时间。

