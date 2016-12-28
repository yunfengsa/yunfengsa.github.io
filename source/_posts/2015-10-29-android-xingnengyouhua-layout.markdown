---
layout: post
title: "android_性能优化第三篇_布局篇"
date: 2015-10-29 10:02:44 +0800
comments: true
categories: android
tags: [android]
---

养成良好的布局编写习惯,是一个androidUI良好表现的保证,多使用抽象布局标签,去除不必要的嵌套节点和view节点,减少inflate是关键.

###步骤1 抽象布局标签
####<include\>标签
这个很简单,我们平时引入header或者footer的时候,多用此标签,添加layout属性即可,若在此写入其他属性(比如layout_id等),其实就是对引入的子布局顶节点的定义.

####<viewstub\>标签
这个标签对于初学者可能用的比较少,但是这个很重要,他和include 的功能有点类似,也是用来引入外部布局. 但是这个标签默认不会扩张,即不会占用显示也不会占用位置,在解析的时候节省cpu和内存.<br>
这个标签一般用来引入那些默认不会显示的布局.当需要显示的时候:
<!--more-->
```java
private View networkErrorView;
 
private void showNetError() {
	// not repeated infalte
	if (networkErrorView != null) {
		networkErrorView.setVisibility(View.VISIBLE);
		return;
	}
 
	ViewStub stub = (ViewStub)findViewById(R.id.network_error_layout);
	networkErrorView = stub.inflate();
	Button networkSetting = (Button)networkErrorView.findViewById(R.id.network_setting);
	Button refresh = (Button)findViewById(R.id.network_refresh);
}
 
private void showNormal() {
	if (networkErrorView != null) {
		networkErrorView.setVisibility(View.GONE);
	}
}
```
**利用**`viewstub.inflate`**进行展开就可以了,当然也可以使用**`viewstub.setvisibility(View.VISIBLE)`**这种情况下,则不需要显式的转换为viewstub进行操作**

####<merge\>标签
这个标签的主要作用就是减少不必要的节点

适用场景:

* 布局的顶节点是Framelayout并且不需要设置background或padding等属性, 可用mege代替,意味Activity的内容视图的parentview就是framlayout.
* 当include 的时候,子节点的顶布局可以使用mege,这样引入便会自动忽略顶节点

###步骤2 去除不必要的嵌套和view节点

* 不需要的节点尽量使用viewtub和GONG(visibility)
* 尽量使用RelativeLayout代替LinearLayout

###步骤3 减少inflate

比如在viewstub标签中的讲解,我们stub.inflate的view可以设置为全局变量,这样在下次判定不为空的时候,直接显示即可
```java
if (networkErrorView != null) {   //neworkErrorView为全局变量
	networkErrorView.setVisibility(View.VISIBLE);
	return;
}
```

还有一个典型的例子listview的getview中的convertview\viewholder的使用,这个很简单,不赘述.

###其他补充点

**用SurfaveView或TextureView代替普通的view**

SurfaceView和TextureView可以通过绘图操作移动到另一个单独的线程上提高性能.

[Textureview](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2014/1213/2153.html)是在android4.0之后引入的.

**使用RenderJavascript**

RenderScript是Adnroid3.0引进的用来在Android上写高性能代码的一种语言，语法给予C语言的C99标准，他的结构是独立的，所以不需要为不同的CPU或者GPU定制代码代码。(暂时只是膜拜中)

**使用OpenGL绘图**

android支持OpenGL API的高性能绘图  android4.3以后支持OpenGL ES3.0,功能真是越来越强大啊

**尽量为所有的分辨率创建资源**

这样可以减少不必要的硬件缩放,这里有一个神奇的工具[Android Asset Studio](http://romannurik.github.io/AndroidAssetStudio/index.html)

*这里简单说一下不同的分辨率对用的drawable或者mipmap的资源配置*

首先Drawable资源分为xxhdpi，xhdpi，hdpi，mdpi，ldpi，分别为超超高密度400dpi（左右），超高密度320dpi，高密度240dpi，中密度160dpi，低密度120dpi。


然后手机的屏幕又分为FWVGA，WVGA，VGA，HVGA，QVGA，其中
* VGA是：Video Graphic Array，显示标准为480 x 640；
* WVGA是Wide VGA，分辨率为480 x 800；
* FWVGA是Full Wide VGA，分辨率为：480 x 854；
* HVGA是Half VGA，分辨率为：320 x 480；
* QVGA是Quarter VGA，分辨率为：240 x 320；


xxhdpi：主要存放超超高密度图片，背景图：1080 x 1920，Icon：144 x 144，适配机型：谷歌 Nexus 4<br>
xhdpi：主要存放超高密度图片，背景图：720 x 1280，Icon：96 x 96，适配机型：小米2等大屏手机<br>
hdpi：主要放高密度图片：背景图：480 x 800，Icon：72 x 72，适配机型：WVGA(480 x 800)和FWVGA(480 x 854)<br>
mdpi：主要放中密度图片：背景图 ：320 x 480，Icon：48 x 48，适配机型：HVGA(320 x 480)<br>
ldpi：主要放低密度图片：背景图：240 x 320，Icon：36 x 36，适配机型：QVGA(240 x 320)<br>

###性能调优工具
* hierarchy viewer<br>[详情点此](http://developer.android.com/intl/zh-cn/tools/debugging/debugging-ui.html)
* layoutopt<br>layoutopt是一个可以提供layout及其层级优化提示的命令行，在sdk16以后已经被lint取代，在Windows->Show View->Other->Android->Lint Warnings查看lint优化提示，lint具体介绍可见[Improving Your Code with lint](http://developer.android.com/intl/zh-cn/tools/debugging/improving-w-lint.html)。