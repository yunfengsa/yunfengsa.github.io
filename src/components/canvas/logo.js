import React from 'react';
import PropTypes from 'prop-types';
import styles from './logo.scss';

function SnowPlugin(props) {
  window.onload = function () {

    var oC = document.getElementById('canvas');
    
    const {width, height} = oC.getBoundingClientRect();
    // console.log(canvasRect)
    const oGc = oC.getContext('2d');

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
    var Snow = function () {

    }
    Snow.prototype = {
        init: function () {
            this.x = random(0, width);
            this.y = 0;
            this.r = random(0.5, 1.5);
            this.vy = random(1, 2);
        },
        draw: function (cxt) {
            cxt.beginPath();
            cxt.fillStyle = 'white';
            cxt.arc(this.x, this.y + this.r, this.r, 0, Math.PI * 2, false);
            cxt.fill();
            cxt.closePath();
            this.update(cxt);
        },
        update: function (cxt) {
            if (this.y < height - this.r) {
                this.y += this.vy;
            } else {
                this.init();
            }
        }
    }

    const snow = [];
    for (let i = 0; i < 300; i++) {
        setTimeout(function () {
            let oSnow = new Snow();
            oSnow.init();
            snow.push(oSnow);
        }, 10 * i);
    }

    (function move() {
        oGc.clearRect(0, 0, width, height);
        for (let i = 0; i < snow.length; i++) {
            snow[i].draw(oGc);
        }
        requestAnimationFrame(move);
    })();
}
  return (
    <div className={styles.root}>
      <div className={styles.bkcontainer}>
        <img className={styles.bkimg} 
          src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1545910452210&di=5497271a95b800a4d07f5912407f6fc2&imgtype=0&src=http%3A%2F%2Fupload.mnw.cn%2F2015%2F0512%2F1431437317161.jpg" />
        <img className={styles.bkimg}  
          src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1545822856194&di=d4b4beb8803ea52a2de6b05d6509e936&imgtype=0&src=http%3A%2F%2Fphotocdn.sohu.com%2F20150506%2FImg412494447.jpg" />
      </div>
      <canvas id="canvas" className={styles.snow}>
	      你的浏览器居然不支持Canvas？！赶快换一个吧！！
	    </canvas>
    </div>
  );
}


export default SnowPlugin;