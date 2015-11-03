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

break:退出循环<br>next:进入下一次的循环,只舍弃当前循环<br>retry:重新开始循环,参数也重新开始,如果出现在begin   rescue(这个等于java的try catch)中,则从begin重新开始.<br>redo:重新开始当前的循环,循环参数保持当前值.

###5.方法、块、模块（module）
####方法

```ruby
def method_name (var1, var2)
   expr..
end
```
**实例(一看秒懂)**

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

def test(a1="Ruby", a2="Perl")
   puts "编程语言为 #{a1}"
   puts "编程语言为 #{a2}"
end
test "C", "C++"
test
```
**可变参数**

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

def sample (*test)
   puts "参数个数为 #{test.length}"
   for i in 0...test.length
      puts "参数值为 #{test[i]}"
   end
end
sample "Zara", "6", "F"
sample "Mac", "36", "M", "MCA"
```

**类方法**

```ruby
class Accounts
   def reading_charge
   end
   def Accounts.return_date
   end
end
```

上述定义的类中的方法`Accounts.return_date`不需要实例化,也可在外部直接调用

**alias undef顾名思义**

#####块

**基本定义方法**

```
blockname{


}
```
**基本用法**

```ruby
#!/usr/bin/ruby
# -*- coding: UTF-8 -*-

def test
   yield 5
   puts "在 test 方法内"
   yield 100
end
test {|i| puts "你在块 #{i} 内"}
```

块需要和def一起使用,yield只得就是调用当前定义的test块. yield后边可以不传递参数.

**BEGIN END**

每个 Ruby 源文件可以声明当文件被加载时要运行的代码块（BEGIN 块），以及程序完成执行后要运行的代码块（END 块）。

一个程序可以包含多个 BEGIN 和 END 块。BEGIN 块按照它们出现的顺序执行。END 块按照它们出现的相反顺序执行

####模块
模块（Module）定义了一个命名空间，相当于一个沙盒，在里边您的方法和常量不会与其他地方的方法常量冲突。
模块类似与类，但有一下不同：

* 模块不能被实例化
* 模块没有子类
* 模块智能被另一个模块定义

模块常量命名与类常量命名类似，以大写字母开头。方法定义看起来也相似：模块方法定义与类方法定义类似。
通过类方法，您可以在类方法名称前面放置模块名称和一个点号来调用模块方法，您可以使用模块名称和两个冒号来引用一个常量。

**require语句**

```ruby
$LOAD_PATH << '.'

require 'trig.rb'
require 'moral'

y = Trig.sin(Trig::PI/4)
wrongdoing = Moral.sin(Moral::VERY_BAD)
```

在这里，我们使用 `$LOAD_PATH << '.'` 让 Ruby 知道必须在当前目录中搜索被引用的文件。如果您不想使用 $LOAD_PATH，那么您可以使用 require_relative 来从一个相对目录引用文件。

注意：在这里，文件包含相同的函数名称。所以，这会在引用调用程序时导致代码模糊，但是模块避免了这种代码模糊，而且我们可以使用模块的名称调用适当的函数。

**include语句**

您可以在类中嵌入模块。为了在类中嵌入模块，您可以在类中使用*include*语句.

*如果模块是定义在一个单独的文件中，那么在嵌入模块之前就需要使用 **require** 语句引用该文件。*

**Mixins**

一个类可以继承多个模块,模块之间可以多重继承

```ruby
module Mymodule
  def Mymodule.out
    puts "in Mymodule.out#{2+4}"
  end
  def Mymodule.arry
    nums=Array.new(10){
      |e|e=e*2
    }
    linew=__LINE__
    puts(linew)
    puts "#{nums}"
  end
  def Mymodule.redo
    for i in 0..5
      if i > 2 then
        puts "局部变量的值为 #{i}"
        redo
      end
    end
  end
end
module Mymodule2
  include Mymodule
  Out=2
end
def method_test
  yield

end
method_test{
  puts("in block---")
}
class Module_test
  include Mymodule
  Mymodule.out
  Mymodule.arry

end

class Momoduletest2
  include Mymodule2
  puts "-------"
  puts Mymodule2::Out
  Mymodule.arry
end
```

输出结果为

<pre>
in block---
in Mymodule.out6
9
[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
-------
2
9
[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
</pre>

###6. 字符串(String)
单引号可以直接引用一个简单的字符串<br> 双引号可以在其中计算一些方法值,比如`puts "X+Y=#{2+3}"`,会输出`X+Y=5`

**字符编码**

默认的字符集是ASCII,可以通过
> $KCODE='u'

进行更改<br>
下边是$KCODE的一些可能值

| 编码    |   &nbsp;描述             |
| ------ |:-------------|
| a      | ASCII     |
| e      | EUC       |
| n      | none(与a类似) |
| u      | UTF-8      |

字符串的内建方法参考具体的文档即可 [例如](http://www.runoob.com/ruby/ruby-string.html)

###7. 数组(Array)

[注意内建方法](http://www.runoob.com/ruby/ruby-array.html)

*要注意字符串的unpack和数组的pack方法*

###8. 哈希(Hash)
哈希(Hash)没有特定的顺序,*当访问hash中的键值不存在的时候,将返回默认值*

###9. 时间&日期
*Time*类

###10. Range

	(1..5)        #==> 1, 2, 3, 4, 5
	(1...5)       #==> 1, 2, 3, 4
	('a'..'d')    #==> 'a', 'b', 'c', 'd'

```ruby
#!/usr/bin/ruby

$, =", "   # Array 值分隔符
range1 = (1..10).to_a
range2 = ('bar'..'bat').to_a

puts "#{range1}"
puts "#{range2}"
```

输出	

	[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	["bar", "bas", "bat"]

###11. 迭代器

迭代指的是重复做相同的事

**each**

each迭代器总和一个块关联,它向块返回每一个值

```ruby
#!/usr/bin/ruby

ary = [1,2,3,4,5]
ary.each do |i|
   puts i
end
```

**collect**

collect不需要总是和一个块关联,collect方法返回整个集合

```ruby
#!/usr/bin/ruby

a = [1,2,3,4,5]
b = Array.new
b = a.collect{ |x|x }
puts b
```

###12. Ruby文件的输入和输出
**输入 输出**

Ruby提供一整套I/o方法,在内核中实现.例如*puts(和print的区别是光标移动到下一行) putc print(和puts的区别是光标移动到最后)*等等

**打开关闭文件**

* File.new
	* 您可以使用 File.new 方法创建一个 File 对象用于读取、写入或者读写，读写权限取决于 mode 参数。最后，您可以使用 File.close 方法来关闭该文件。
* File.open
	* 您可以使用 File.open 方法创建一个新的 file 对象，并把该 file 对象赋值给文件。但是，File.open 和 File.new 方法之间有一点不同。不同点是 File.open 方法可与块关联，而 File.new 方法不能。
	* 
| 模式 | &nbsp;描述 |
| --- |:---- |
| r  | 只读模式 |
| r+ | 读写模式,指针 |
| w | 只写模式,文件存在则重写 |
| w+ | 读写模式,文件存在,读写译存在文件 |
| a | 只写模式,如果文件存在,文件是追加模式 |
| a+ | 读写模式,如果文件存在,文件是追加模式 |

* sysread
	* 用于简单 I/O 的方法也可用于所有 file 对象。所以，gets 从标准输入读取一行，aFile.gets 从文件对象 aFile 读取一行。但是，I/O 对象提供了访问方法的附加设置，为我们提供了便利。
	* 您可以使用方法 sysread 来读取文件的内容。当使用方法 sysread 时，您可以使用任意一种模式打开文件。
		
```ruby
#!/usr/bin/ruby
aFile = File.new("input.txt", "r")
 if aFile
 content = aFile.sysread(20)
 puts content
 else
 puts "Unable to open file!"
 end
```
以上语句将输入文件的头20个字符,文件指针放置在文件中的第21个字符的位置.


* syswrite

您可以使用方法 syswrite 来向文件写入内容。当使用方法 syswrite 时，您需要以写入模式打开文件。

* each_byte方法<br>
用于迭代字符串的每一个字符

* IO.readlines方法<br>逐行读入

```ruby
#!/usr/bin/ruby
arr = IO.readlines("input.txt")
puts arr[0]
puts arr[1]
```
每一行是一个元素.

* IO.foreach<br>该方法也逐行返回输出。方法 foreach 与方法 readlines 之间不同的是，方法 foreach 与块相关联。但是，不像方法 readlines，方法 foreach 不是返回一个数组。

```ruby
#!/usr/bin/ruby
IO.foreach("input.txt"){|block| puts block}  #这段代码将把文件 test 的内容逐行传给变量 block，然后输出将显示在屏幕上。
```

* File.rename  File.delete<br>文件的重命名和删除
* 文件查询

```ruby
File::exists?("file.rb")#文件是否存在
File.file?("text.rb")#文件是否是一个文件
File::directory("text.rb")#是否是一个目录

```
* 文件目录Dir

```ruby
Dir.chdir("/a/b")#改变目录
Dir.pwd("/a/b")#获取当前目录
Dir.entries("/a/b").join(' ')#获取当前目录下的文件和目录列表 
Dir["/a/b/*"]#同上
```

[File的类及其内建方法](http://www.runoob.com/ruby/ruby-file-methods.html)<br>[Dir的类及其内建方法](http://www.runoob.com/ruby/ruby-dir-methods.html)

* 异常捕获

语法
<pre>
begin #开始
 
 raise.. #抛出异常
 
rescue [ExceptionType = StandardException] #捕获指定类型的异常 缺省值是StandardException
 $! #表示异常信息
 $@ #表示异常出现的代码位置
else #其余异常
 ..
ensure #不管有没有异常，进入该代码块
 
end #结束
</pre>
从 begin 到 rescue 中的一切是受保护的。如果代码块执行期间发生了异常，控制会传到 rescue 和 end 之间的块。
对于 begin 块中的每个 rescue 子句，Ruby 把抛出的异常与每个参数进行轮流比较。如果 rescue 子句中命名的异常与当前抛出的异常类型相同，或者是该异常的父类，则匹配成功。
如果异常不匹配所有指定的错误类型，我们可以在所有的 rescue 子句后使用一个 else 子句。

```ruby
#!/usr/bin/ruby

begin  
  raise 'A test exception.'  
rescue Exception => e  
  puts e.message  
  puts e.backtrace.inspect  
end  
```

输出结果为<br>
> A test exception.<br>
> ["main.rb:4"]

```ruby
begin 
   #.. 过程 
   #.. 抛出异常
rescue 
   #.. 处理错误
else
   #.. 如果没有异常则执行
ensure 
   #.. 最后确保执行
   #.. 这总是会执行
end
```

**使用 $! 变量可以捕获抛出的错误消息。**

**Catch 和 Throw**

raise 和 rescue 的异常机制能在发生错误时放弃执行，有时候需要在正常处理时跳出一些深层嵌套的结构。此时 catch 和 throw 就派上用场了。
catch 定义了一个使用给定的名称（可以是 Symbol 或 String）作为标签的块。块会正常执行知道遇到一个 throw。

```ruby
def promptAndGet(prom)
  print prom
  res = readline.chomp
  throw :quitRequested if res == "!"
  return res
end

catch :quitRequested do
  name = promptAndGet("Name: ") #从此处开始执行
  age = promptAndGet("Age: ")
  sex = promptAndGet("Sex: ")
  # ..
  # 处理信息
end
promptAndGet("Name:")
```
上面的程序需要人工交互,程序将从catch 定义的块开始执行,直到遇到 throw才会终止.
