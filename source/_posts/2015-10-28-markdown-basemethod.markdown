---
layout: post
title: "Markdown_基本使用方法"
date: 2015-10-28 18:18:21 +0800
comments: true
categories: Markdown
tags: [Markdown]
---

##标题
<pre>
Markdown 支持两种标题的语法，类 Setext 和类 atx 形式。

类 Setext 形式是用底线的形式，利用 = （最高阶标题）和 - （第二阶标题），例如：

This is an H1
=============

This is an H2
-------------
任何数量的 = 和 - 都可以有效果。

类 Atx 形式则是在行首插入 1 到 6 个 # ，对应到标题 1 到 6 阶，例如：

# 这是 H1

## 这是 H2

###### 这是 H6
你可以选择性地「闭合」类 atx 样式的标题，这纯粹只是美观用的，若是觉得这样看起来比较舒适，你就可以在行尾加上 #，而行尾的 # 数量也不用和开头一样（行首的井字符数量决定标题的阶数）：

# 这是 H1 #

## 这是 H2 ##

### 这是 H3 ######
</pre>
<!--more-->
##区块引用
<pre>
Markdown 标记区块引用是使用类似 email 中用 > 的引用方式。如果你还熟悉在 email 信件中的引言部分，你就知道怎么在 Markdown 文件中建立一个区块引用，那会看起来像是你自己先断好行，然后在每行的最前面加上 > ：

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
> 
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.
Markdown 也允许你偷懒只在整个段落的第一行最前面加上 > ：

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
id sem consectetuer libero luctus adipiscing.
区块引用可以嵌套（例如：引用内的引用），只要根据层次加上不同数量的 > ：

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.
引用的区块内也可以使用其他的 Markdown 语法，包括标题、列表、代码区块等：

> ## 这是一个标题。
> 
> 1.   这是第一行列表项。
> 2.   这是第二行列表项。
> 
> 给出一些例子代码：
> 
>     return shell_exec("echo $input | $markdown_script");
任何像样的文本编辑器都能轻松地建立 email 型的引用。例如在 BBEdit 中，你可以选取文字后然后从选单中选择增加引用阶层。
</pre>
##列表
<pre>
Markdown 支持有序列表和无序列表。

无序列表使用星号、加号或是减号作为列表标记：

*   Red
*   Green
*   Blue
等同于：

+   Red
+   Green
+   Blue
也等同于：

-   Red
-   Green
-   Blue
有序列表则使用数字接着一个英文句点：

1.  Bird
2.  McHale
3.  Parish
很重要的一点是，你在列表标记上使用的数字并不会影响输出的 HTML 结果，上面的列表所产生的 HTML 标记为："
&ltol>
&lt;li>Bird&lt;/li>
&lt;li>McHale&lt;/li>
&lt;li>Parish&lt;/li>
&lt;/ol>
如果你的列表标记写成：

1.  Bird
1.  McHale
1.  Parish
或甚至是：

3. Bird
1. McHale
8. Parish
你都会得到完全相同的 HTML 输出。重点在于，你可以让 Markdown 文件的列表数字和输出的结果相同，或是你懒一点，你可以完全不用在意数字的正确性。

如果你使用懒惰的写法，建议第一个项目最好还是从 1. 开始，因为 Markdown 未来可能会支持有序列表的 start 属性。

列表项目标记通常是放在最左边，但是其实也可以缩进，最多 3 个空格，项目标记后面则一定要接着至少一个空格或制表符。

要让列表看起来更漂亮，你可以把内容用固定的缩进整理好：

*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
    viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
    Suspendisse id sem consectetuer libero luctus adipiscing.
但是如果你懒，那也行：

*   Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
viverra nec, fringilla in, laoreet vitae, risus.
*   Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
Suspendisse id sem consectetuer libero luctus adipiscing.
如果列表项目间用空行分开，在输出 HTML 时 Markdown 就会将项目内容用 &lt;p> 标签包起来，举例来说：

*   Bird
*   Magic
会被转换为：

&lt;ul>
&lt;li>Bird&lt;/li>
&lt;li>Magic&lt;/li>
&lt;/ul>
但是这个：

*   Bird

*   Magic
会被转换为：

&lt;ul>
&lt;li>&lt;p>Bird&lt;/p>&lt;/li>
&lt;li>&lt;p>Magic&lt;/p>&lt;/li>
&lt;/ul>
列表项目可以包含多个段落，每个项目下的段落都必须缩进 4 个空格或是 1 个制表符：

1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.
如果你每行都有缩进，看起来会看好很多，当然，再次地，如果你很懒惰，Markdown 也允许：

*   This is a list item with two paragraphs.

    This is the second paragraph in the list item. You're
only required to indent the first line. Lorem ipsum dolor
sit amet, consectetuer adipiscing elit.

*   Another item in the same list.
如果要在列表项目内放进引用，那 > 就需要缩进：

*   A list item with a blockquote:

    > This is a blockquote
    > inside a list item.
如果要放代码区块的话，该区块就需要缩进两次，也就是 8 个空格或是 2 个制表符：

*   一列表项包含一个列表区块：

        <代码写在这>
当然，项目列表很可能会不小心产生，像是下面这样的写法：

1986. What a great season.
换句话说，也就是在行首出现数字-句点-空白，要避免这样的状况，你可以在句点前面加上反斜杠。

1986\. What a great season.
</pre>
##链接
* 直接写 \[文本](url)
##代码区块
这是一个普通普通段落
	这是一个代码区块 只需要首航缩进4个空格即可(tab)
##强调
Markdown 使用星号（\*）和底线（\_）作为标记强调字词的符号，被 \* 或 \_ 包围的字词会被转成用 &lt;em> 标签包围，用两个 \* 或 \_ 包起来的话，则会被转成 &lt;strong>，例如：

\*single asterisks*效果如下

*single asterisks*

\_single underscores_效果如下

_single underscores_

\*\*double asterisks**效果如下

**double asterisks**

\_\_double underscores\_\_效果如下

__double underscores__

##代码区段
使用``把代码包起来(键盘左上角的反引号),当然利用<code\> </code\>包起来也是一样的

`这是一段代码`