---
layout: post
title: "开启Vue学习之旅"
date: 2016-11-28 14:47:50 +0800
comments: true
categories: 前端
tags: [weex]
---

作为新入的js小白，如何选择合适的前端框架作为一个开端是一个（no thinking just do it）！！



简单记录自己看过的比较好的文章

<!--more-->

## [文档开始](http://cn.vuejs.org/v2/guide/class-and-style.html)

<h2>查漏不缺</h2>

[webPack](http://gold.xitu.io/entry/574fe7c579bc440052f6d805)

另外由于npm国内太慢,可以学则ied和[cnpm](https://npm.taobao.org/)替代。我采用了大阿里的cnpm，速度顶呱呱！

[webPack文档入口](https://webpack.js.org/get-started/)

[ES6的相关新增知识点集合](http://www.infoq.com/cn/es6-in-depth/)

## 一个有趣的小例子

html：

```html

<div id="watch-example">
  <p>
    Ask a yes/no question:
    <input v-model="question">
  </p>
  <p>{{ answer }}</p>
  <img src={{imageurl}} height="500" width="500" />
</div>

```

js：

```javascript

var watchExampleVM = new Vue({
  el: '#watch-example',
  data: {
  	imageurl: '',
    question: '',
    answer: 'I cannot give you an answer until you ask a question!'
  },
  watch: {
    // 如果 question 发生改变，这个函数就会运行
    question: function(newQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.getAnswer()
    }
  },
  methods: {
    // _.debounce 是一个通过 lodash 限制操作频率的函数。
    // 在这个例子中，我们希望限制访问yesno.wtf/api的频率
    // ajax请求直到用户输入完毕才会发出
    // 学习更多关于 _.debounce function (and its cousin
    // _.throttle), 参考: https://lodash.com/docs#debounce
    getAnswer: _.debounce(
      function() {
        var vm = this
        if (this.question.indexOf('?') === -1) {
          vm.answer = 'Questions usually contain a question mark. ;-)'
          return
        }
        vm.answer = 'Thinking...'
        axios.get('https://yesno.wtf/api')
          .then(function(response) {
            vm.answer = _.capitalize(response.data.answer)
            vm.imageurl=response.data.image
          })
          .catch(function(error) {
            vm.answer = 'Error! Could not reach the API. ' + error
          })
      },
      // 这是我们为用户停止输入等待的毫秒数
      500
    )
  }
})


```

主要依赖（用cnpm  --save  快得飞起）

```json

"dependencies": {
    "axios": "^0.15.3",
    "debounce": "^1.0.0",
    "lodash": "^4.17.2",
    "vue": "^2.1.0"
  },


```

跑起来，输入```sad？```  ```are you ok？```  接下来就是见证奇迹的时刻

[单页实践](http://gold.xitu.io/post/583d1fe00ce463006baca2fa)



on going
