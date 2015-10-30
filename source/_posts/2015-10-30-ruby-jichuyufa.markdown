---
layout: post
title: "Ruby_基础语法总结篇"
date: 2015-10-30 16:14:38 +0800
comments: true
categories: Ruby
---
车爱讴歌,言说Ruby,想想真是...(日le gou le,本ren jue dui ai dang,货mai guo huo)
<br>
小白开启ruby之旅

###1.变量
* 一般小写字母、下划线开头：变量（Variable）。
* $开头：全局变量（Global variable）。
* @开头：实例变量（Instance variable）。
* @@开头：类变量（Class variable）类变量被共享在整个继承链中
* 大写字母开头：常数（Constant）。
* 伪变量
	1. self:当前接收器对象
	2. true和false
	3. nil:代表undefined的值
	4. \_\_FILE__:当前源文件的名称
	5. \_\_LINE__:当前行在源文件中的编号
<!--more-->
###2.运算符

和一般性语言差别不大

###3.注释
当行注释:

```ruby
#!/usr/bin/ruby -w
# 这是一个单行注释。
puts "Hello, Ruby!"
```
多行注释:

您可以使用 =begin 和 =end 语法注释多行，如下所示：

```ruby
#!/usr/bin/ruby -w

puts "Hello, Ruby!"

=begin
这是一个多行注释。
可扩展至任意数量的行。
但 =begin 和 =end 只能出现在第一行和最后一行。 
=end
```
###4.基本逻辑

####判断
**if**

```Ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-
x=1
if x > 2
   puts "x 大于 2"
elsif x <= 2 and x!=0
   puts "x 是 1"
else
   puts "无法得知 x 的值"
end
```

**unless**

和if的意思想法,如果conditon为false, 则执行code

```Ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

x=1
unless x>2
   puts "x 小于 2"
 else
  puts "x 大于 2"
end
```
以上的运行结果为
> x 小于 2

**case**

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

$age =  5
case $age
when 0 .. 2
    puts "婴儿"
when 3 .. 6
    puts "小孩"
when 7 .. 12
    puts "child"
when 13 .. 18
    puts "少年"
else
    puts "其他年龄段的"
end
```
运行结果为:
> 小孩

####循环

**while**

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

$i = 0
$num = 5

while $i < $num  do
   puts("在循环语句中 i = #$i" )
   $i +=1
end
```

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

$i = 0
$num = 5
begin
   puts("在循环语句中 i = #$i" )
   $i +=1
end while $i < $num
```

**until**

条件为false的时候执行代码,用法同while

**for**

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

for i in 0..5
   puts "局部变量的值为 #{i}"
end
```

等同于

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

(0..5).each do |i|
   puts "局部变量的值为 #{i}"
end
```
**break next retry redo**

break:退出循环<br>next:进入下一次的循环,只舍弃当前循环<br>retry:重新开始循环,参数也重新开始,如果出现在begin   rescue(这个等于java的try catch)中,则从begin重新开始.



