---
layout: post
title: "Rails_on_windows_纪念一下坑爹之旅"
date: 2015-11-05 17:11:06 +0800
comments: true
categories: rails
---


作为一个开发者,使用Windows的平台真心需要勇气啊,单单跑个rails就出现了一个致命而搞笑的问题

##nokogiri

nokogiri 是一个开源的渲染器,rails的基本组件中理论上已经包含他,但是在运行'rails server'的时候却会奇怪的出现

< '''''''1.6.6.2...
< cannot load such file 'nikogiri'

明明已经安装了,而且在Gemfile也已经包含进去了 却总是说加载失败,stackflow很久,不得不说stackflow 内容全,但是真心很多东西太老了,原因就是这个版本不支持最新的ruby2.2.3,默认rail会加载1.6.6版本,还好今年八月份出了新的issue,[自行膜拜](https://github.com/flavorjones)

解决的办法

1. Look for the latest version of Nokogiri in Nokogiri's github repo.
2. Run gem uninstall nokogiri.
3. Add gem "nokogiri", ">= 1.6.7.rc" to your Gemfile.
4. Run bundle install.
5. Run bundle update nokogiri if bundle has locked Nokogiri at some version.

可能因为我更新过bundle,里边有两个版本的nokogiri 卸载掉老版的就行了.

##强烈建议ubuntu，前两天ubuntu升级，也导致了ruby的损坏

还是乖乖用nvm吧

####安装RVM

	$ gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
	$ curl -sSL https://get.rvm.io | bash -s stable
	# 如果上面的连接失败，可以尝试: 
	$ curl -L https://raw.githubusercontent.com/wayneeseguin/rvm/master/binscripts/rvm-installer | bash -s stable

出现ssl错误，按照command option提示操作（别忘记source！！）。

	$ source ~/.rvm/scripts/rvm
修改 RVM 下载 Ruby 的源，到 Ruby China 的镜像:

	echo "ruby_url=https://cache.ruby-china.org/pub/ruby" > ~/.rvm/user/db

检查一下是否安装正确`rvm -v`

####安装ruby

	$ rvm requirements
	$ rvm install 2.3.0


RVM 装好以后，需要执行下面的命令将指定版本的 Ruby 设置为系统默认版本

	$ rvm use 2.3.0 --default
安装 Bundler
	$ gem install bundler

####安装rails

$ gem install rails

接下来就是可以raile new xx喽，很可能出现netparseerror，安装openssl之后还出现问题，那就是GFW了，更改gem的源就行了 https://ruby.taobao.org/或者https://gems.ruby-china.org/   然后：

	$ bundle config mirror.https://rubygems.org https://ruby.taobao.org
或者修改Gemfile的source
	source 'https://rubygems.org/'
	gem 'rails', '4.1.0'
	...
然后：
	bundle install