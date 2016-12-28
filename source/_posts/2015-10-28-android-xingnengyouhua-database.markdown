---
layout: post
title: "android性能优化第二篇_浅谈数据库优化"
date: 2015-10-28 22:22:09 +0800
comments: true
categories: android
tags: [android]
---
###1.数据库的优化是一个比较重要也是比较难把握的地方,我们先简单介绍一下数据库索引
索引,可以简单理解为目录,目录的大小要合适才会提高效率

**优点**
<br>可以大幅度提高检索的速度,包括单表查询,多表查询,分组查询,排序查询.

**缺点**
<br>进行数据库增删改的时候要对索引进行维护,所以会对增删改的操作影响性能.
<!--more-->
**索引的类型**

* 直接创建索引和间接创建索引
<br>1.直接创建,Android在SQLiteOpenHelper的oncreate或者onUpgrade进行excuSql创建语句
> CREATE INDEX mycolumn_index ON mytable (myclumn)

&nbsp;&nbsp;&nbsp;&nbsp;2.间接创建: 定义主键约束或者唯一性键约束，可以间接创建索引，主键默认为唯一索引。

* 普通索引和唯一性索引

普通索引：
`CREATE INDEX mycolumn_index ON mytable (myclumn)`
唯一性索引：保证在索引列中的全部数据是唯一的，对聚簇索引和非聚簇索引都可以使用，语句为

`CREATE UNIQUE COUSTERED INDEX myclumn_cindex ON mytable(mycolumn)`
 
* 单个索引和复合索引
 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;单个索引：索引建立语句中仅包含单个字段，如上面的普通索引和唯一性索引创建示例。

&nbsp;&nbsp;&nbsp;复合索引：又叫组合索引，在索引建立语句中同时包含多个字段，语句如：

&nbsp;`CREATE INDEX name_index ON username(firstname, lastname)`
其中firstname为前导列。
 
* 聚簇索引和非聚簇索引(聚集索引，群集索引)

&nbsp;聚簇索引：物理索引，与基表的物理顺序相同，数据值的顺序总是按照顺序排列，语句为：

`CREATE CLUSTERED INDEX mycolumn_cindex ON mytable(mycolumn) WITH ALLOW_DUP_ROW`
其中WITH ALLOW_DUP_ROW表示允许有重复记录的聚簇索引

&nbsp;非聚簇索引：

`CREATE UNCLUSTERED INDEX mycolumn_cindex ON mytable(mycolumn)`
索引默认为非聚簇索引

**这一部分只作为简单了解,毕竟android上的优化有限**

###2.事务
Sqlit在为进行插入,更新数据的时候自动会插入一个事务,如果这个过程可以在进行多次操作的时候只进行一次,则性能会有很大的提升

以下为显式使用事务的过程
```java
public void insertWithOneTransaction() {
    SQLiteDatabase db = sqliteOpenHelper.getWritableDatabase();
    // Begins a transaction
    db.beginTransaction();
    try {
        // your sqls
        for (int i = 0; i < 100; i++) {
            db.insert(yourTableName, null, value);
        }

        // marks the current transaction as successful
        db.setTransactionSuccessful();
    } catch (Exception e) {
        // process it
        e.printStackTrace();
    } finally {
        // end a transaction
        db.endTransaction();
    }
}
```

###3.异步线程

Sqlite是一个关系型数据库,**Sqlite最大的特点是,它是一个内嵌式的数据库,数据库服务器就在你的程序中,数据库的服务端和客户端运行在同一个进行中**

一般情况下,表查询的用时比较短不会出现anr(主线程耗时过长容易触发),但是如果超过100ms 最好还是利用单线程进行操作,然后利用[AsyncQueryHandler](http://developer.android.com/intl/zh-cn/reference/android/content/AsyncQueryHandler.html) 或者直接用简单的
```java
ExecutorService singleThreadExecutor = Executors.newSingleThreadExecutor();
singleThreadExecutor.execute(new Runnable() {

	@Override
	public void run() {
		// db operetions, u can use handler to send message after
		db.insert(yourTableName, null, value);
		handler.sendEmptyMessage(xx);
	}
});
```

###总结:
在android开发中,数据的优化确实不是一个最主要的问题,但是对于一个对安卓热爱的小蜗牛,如果程序中能想到的优化,只能有数据库级的话,想起来还是小鸡冻(danteng)啊...