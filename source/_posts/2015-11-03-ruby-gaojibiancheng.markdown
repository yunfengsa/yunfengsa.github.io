---
layout: post
title: "Ruby_高级教程"
date: 2015-11-03 20:33:50 +0800
comments: true
categories: ruby
---

##Ruby 面向对象

as we all know,ruby是一门纯面向对象的语言,即使是最原始的东西:字符串\数字\true\false都是对象.
<!--more-->

**访问器(accessor) & 设置器(setter)方法**

```ruby
#!/usr/bin/ruby -w

# 定义类
class Box
   # 构造器方法
   def initialize(w,h)
      @width, @height = w, h
   end

   # 访问器方法
   def getWidth
      @width
   end
   def getHeight
      @height
   end

   # 设置器方法
   def setWidth=(value)
      @width = value
   end
   def setHeight=(value)
      @height = value
   end
end

# 创建对象
box = Box.new(10, 20)

# 使用设置器方法
box.setWidth = 30
box.setHeight = 50

# 使用访问器方法
x = box.getWidth()
y = box.getHeight()

```

**类变量和类方法**

类变量是在类的所有实例中共享的变量。换句话说，类变量的实例可以被所有的对象实例访问。类变量以两个 @ 字符（@@）作为前缀，类变量必须在类定义中被初始化，如下面实例所示。
类方法使用 def self.methodname() 定义，类方法以 end 分隔符结尾。类方法可使用带有类名称的 classname.methodname 形式调用

```ruby
#!/usr/bin/ruby -w

class Box
   # 初始化类变量
   @@count = 0
   def initialize(w,h)
      # 给实例变量赋值
      @width, @height = w, h

      @@count += 1
   end

   def self.printCount()
      puts "Box count is : #@@count"
   end
end

# 创建两个对象
box1 = Box.new(10, 20)
box2 = Box.new(30, 100)

# 调用类方法来输出盒子计数
Box.printCount()
```

**to_s方法**

```ruby
#!/usr/bin/ruby -w

class Box
   # 构造器方法
   def initialize(w,h)
      @width, @height = w, h
   end
   # 定义 to_s 方法
   def to_s
      "(w:#@width,h:#@height)"  # 对象的字符串格式
   end
end

# 创建对象
box = Box.new(10, 20)

# 自动调用 to_s 方法
puts "String representation of box is : #{box}"
```

输出结果为

> String representation of box is : (w:10,h:20)


**访问控制**

Ruby 为您提供了三个级别的实例方法保护，分别是 public、private 或 protected。Ruby 不在实例和类变量上应用任何访问控制。

* *Public 方法*： Public 方法可被任意对象调用。默认情况下，方法都是 public 的，除了 initialize 方法总是 private 的。
* *Private 方法*： Private 方法不能从类外部访问或查看。只有类方法可以访问私有成员。
* *Protected 方法*： Protected 方法只能被类及其子类的对象调用。**访问也只能在类及其子类内部进行**。

```ruby
#!/usr/bin/ruby -w

# 定义类
class Box
   # 构造器方法
   def initialize(w,h)
      @width, @height = w, h
   end

   # 实例方法默认是 public 的
   def getArea
      getWidth() * getHeight
   end

   # 定义 private 的访问器方法
   def getWidth
      @width
   end
   def getHeight
      @height
   end
   # make them private
   private :getWidth, :getHeight

   # 用于输出面积的实例方法
   def printArea
      @area = getWidth() * getHeight
      puts "Big box area is : #@area"
   end
   # 让实例方法是 protected 的
   protected :printArea
end

# 创建对象
box = Box.new(10, 20)

# 调用实例方法
a = box.getArea()
puts "Area of the box is : #{a}"

# 尝试调用 protected 的实例方法
box.printArea()
```

当上面的代码执行时，它会产生以下结果。在这里，第一种方法调用成功，但是第二方法会产生一个问题。

> Area of the box is : 200<br>
> test.rb:42: protected method `printArea' called for #<br>
> <Box:0xb7f11280 @height=20, @width=10> (NoMethodError)

**继承**

继承，是面向对象编程中最重要的概念之一。继承允许我们根据另一个类定义一个类，这样使得创建和维护应用程序变得更加容易。
继承有助于重用代码和快速执行，不幸的是，Ruby 不支持多继承，但是 Ruby 支持 mixins。mixin 就像是多继承的一个特定实现，在多继承中，只有接口部分是可继承的。
当创建类时，程序员可以直接指定新类继承自某个已有类的成员，这样就不用从头编写新的数据成员和成员函数。这个已有类被称为基类或父类，新类被称为派生类或子类。
Ruby 也提供了子类化的概念，子类化即继承，下面的实例解释了这个概念。扩展一个类的语法非常简单。只要添加一个 < 字符和父类的名称到类语句中即可.

```ruby
#!/usr/bin/ruby -w

# 定义类
class Box
   # 构造器方法
   def initialize(w,h)
      @width, @height = w, h
   end
   # 实例方法
   def getArea
      @width * @height
   end
end

# 定义子类
class BigBox < Box

   # 添加一个新的实例方法
   def printArea
      @area = @width * @height
      puts "Big box area is : #@area"
   end
end

# 创建对象
box = BigBox.new(10, 20)

# 输出面积
box.printArea()
```

**方法重载**

直接在新类中重写方法.

**运算符重载**


