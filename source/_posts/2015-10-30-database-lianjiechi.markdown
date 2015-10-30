---
layout: post
title: "数据库连接池(C3P0)"
date: 2015-10-30 11:36:42 +0800
comments: true
categories: 数据库
---
**什么是数据库连接池呢?**

简单的说:就是程序在启动的时候建立足够的连接,在程序需要连接的时候,直接在连接池中申请连接,可想而知,这对连接数据库的速度是会有很大提升..

**基本的运行机制是怎样的呢?**

1. 初始化的时候创建连接池
2. 使用的时候向连接池请求可用的连接
3. 使用结束将连接返回给连接池
4. 退出程序的时候,断开所有连接并释放资源
<!--more-->
**那有没有现成好用额度开源项目呢(这怎么可以是个问题,那是必须的有啊)**

C3P0就是一个很优秀的连接池,虽然名字比较怪异,,***[代码下载连接点击此](http://sourceforge.net/projects/c3p0/)***  下载有问题可走此路:http://yunpan.cn/cFDCI5FW6I2tb  访问密码 3633

*下边就是一段简单的示例代码,很简单*

```java
 
importjava.beans.PropertyVetoException;
importjava.sql.Connection;
importjava.sql.SQLException;
importcom.mchange.v2.c3p0.ComboPooledDataSource;
 
public final class ConnectionManager{
//使用单利模式创建数据库连接池
private static ConnectionManagerinstance;
private static ComboPooledDataSourcedataSource;
 
private ConnectionManager() throws SQLException,PropertyVetoException{
dataSource=new ComboPooledDataSource();
 
dataSource.setUser("root");//用户名
dataSource.setPassword("123456");//密码
dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/zww");//数据库地址
dataSource.setDriverClass("com.mysql.jdbc.Driver");
dataSource.setInitialPoolSize(5);//初始化连接数
dataSource.setMinPoolSize(1);//最小连接数
dataSource.setMaxPoolSize(10);//最大连接数
dataSource.setMaxStatements(50);//最长等待时间
dataSource.setMaxIdleTime(60);//最大空闲时间，单位毫秒
}
 
public static final ConnectionManager getInstance(){
if(instance==null){
try{
instance=new ConnectionManager();
}catch(Exceptione){
e.printStackTrace();
}
}
return instance;
}
 
public synchronized final Connection getConnection(){
Connectionconn=null;
try{
conn=dataSource.getConnection();
}catch(SQLExceptione){
e.printStackTrace();
}
returnconn;
}
}
```

这样我们只有在第一次初始连接池的时候速度会稍微慢一些,但是在之后的连接花费时间明显减少..