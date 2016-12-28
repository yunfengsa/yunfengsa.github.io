---
layout: post
title: "octopress个性化配置"
date: 2015-10-28 18:54:00 +0800
comments: true
categories: octopress
tags: [octopress]
---
###增加分类栏
####1. 增加category_list插件
保存以下代码到plugins/category_list_tag.rb：
```ruby
module Jekyll
  class CategoryListTag < Liquid::Tag
    def render(context)
      html = ""
      categories = context.registers[:site].categories.keys
      categories.sort.each do |category|
        posts_in_category = context.registers[:site].categories[category].size
        category_dir = context.registers[:site].config['category_dir']
        category_url = File.join(category_dir, category.gsub(/_|\P{Word}/, '-').gsub(/-{2,}/, '-').downcase)
        html << "<li class='category'><a href='/#{category_url}/'>#{category} (#{posts_in_category})</a></li>\n"
      end
      html
    end
  end
end
Liquid::Template.register_tag('category_list', Jekyll::CategoryListTag)

```
####2. 添加source/_includes/asides/category_list.html文件，内容如下：
<section\> <br>
  <h1\>文章分类</h1\> <br>
  <ul id="categories"\> 
    `{\%
category_list
%\}`
  </ul\>//注意要把%与{之间的'\'去掉,去掉则运行服务器的代码
<br>
</section\>
####3. 修改\_config.yml文件，在default\_asides项中添加asides/category_list.html，值之间以逗号隔开。
'default_asides: [asides/category_list.html, asides/recent_posts.html]'
<!--more-->
###增加评论功能
Octopress本身内置有[Disqus](https://disqus.com)功能,注册之后直接在<br>
然后在_config.yml文件中进行下面设置
```
# Disqus Comments 
disqus_short_name: oec2003   # oec2003为添加站点信息时的Site Shortname 
disqus_show_comment_count: true
```
###使文章以摘要的形式展示
默认情况下在博客的首页是显示每篇文章的全部内容，更多时候我们只想在首页展示文章的一部分内容，当点击阅读全文时进入到文章的详细页面，在Octopress中可以很轻松实现该功能：

1. 在文章对应的markdown文件中，在需要显示在首页的文字后面添加<!—more—>，执行rake generate后在首页上会看到只显示<!—more—>前面的文字，文字后面会显示Read on链接，点击后进入文字的详细页面;

2. 如果想将Read on 修改为中文，可以修改_config.yml文件
`#excerpt_link: "Read on &rarr;"  # "Continue reading" link text at the bottom of excerpted articles`
<br>
`#excerpt_link: "阅读全文&rarr;"  # "Continue reading" link text at the bottom of excerpted articles`