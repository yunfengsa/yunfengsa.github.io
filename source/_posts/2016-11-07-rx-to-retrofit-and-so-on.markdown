---
layout: post
title: "Rx的进攻路线（选取比较好的文章）"
date: 2016-11-07 10:11:35 +0800
comments: true
categories: rx
tags: [Rxjava]
---

##Rxjava的进攻路线，拿下第一个小碉堡

####[使用介绍](http://blog.csdn.net/job_hesc/article/details/45798307)

需要注意的是文中的lambda的配置过程已经过时!其他没啥，随便看看

build.gradle:

```java

android{
defaultConfig {
       .....
        jackOptions{
            enabled true
        }
    }
    ......
    compileOptions {
        targetCompatibility 1.8
        sourceCompatibility 1.8
    }
}

```

<!--more-->

####[Rxjava的操作符1](http://blog.csdn.net/job_hesc/article/details/46242117)

经典例子：

```java

//just是连续打印三行（Next:1 Next:2 Next:3）
Observable.just(1,2,3).repeatWhen(new Func1<Observable<? extends Void>, Observable<?>>() {
            @Override
            public Observable<?> call(Observable<? extends Void> observable) {
                //重复3次，range控制循环次数
                return observable.zipWith(Observable.range(1, 3), new Func2<Void, Integer, Integer>() {
                    @Override
                    public Integer call(Void aVoid, Integer integer) {
                        return integer;
                    }
                }).flatMap(new Func1<Integer, Observable<?>>() {
                    @Override
                    public Observable<?> call(Integer integer) {
                        System.out.println("delay repeat the " + integer + " count");
                        //1秒钟重复一次，控制间隔
                        return Observable.timer(1, TimeUnit.SECONDS);
                    }
                });
            }
        }).subscribe(new Subscriber<Integer>() {
            @Override
            public void onCompleted() {
                System.out.println("Sequence complete.");
            }

            @Override
            public void onError(Throwable e) {
                System.err.println("Error: " + e.getMessage());
            }

            @Override
            public void onNext(Integer value) {
                System.out.println("Next:" + value);
            }
        });

```

####[Rx操作符2](http://blog.csdn.net/job_hesc/article/details/46495281)

####[Rx操作符3]（http://blog.csdn.net/job_hesc/article/details/46495281）

####[Rx操作符4](http://blog.csdn.net/job_hesc/article/details/46612015)