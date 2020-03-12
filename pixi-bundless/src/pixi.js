import { hitTestRectangle, addKeyboardEvent, randomInt } from '/pixi-bundless/src/utils.js';
let loader = PIXI.Loader.shared,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

// start
export const start = () => {
  loader
  .add(['images/multi.png', 'images/car.png'])
  .load(setup);
}

// 爆炸
const loadBoom = () => {
  let multi = TextureCache["images/multi.png"];
  let recRocket = new Rectangle(96 + 32, 64 + 32, 32, 32);
  multi.frame = recRocket;
  let rocket = new Sprite(multi);
  return rocket;
}

// 小车
const loadCar = () => {
  let car = new Sprite(TextureCache['images/car.png']);
  car.width = 32;
  car.height = 32;
  return car
}

// 产生一个方块 模拟躲避屋
const generateWall = () => {
  let rectangle = new PIXI.Graphics();
  rectangle.lineStyle(0, 0xFF3300, 0);
  rectangle.beginFill(0x66CCFF);
  rectangle.drawRect(0, 0, 32, 32);
  rectangle.endFill();
  rectangle.x = 32 * 7;
  rectangle.y = 0;
  return rectangle;
}

// 生成文本实体
const generateText = (text) => {
  let style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fill: "white",
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
  });
  let message = new PIXI.Text(text, style);
  message.position.set(54, 96);
  return message;
}

// container移动函数
const move = (container, delta) => {
  return () => {
    const { y } = container.getGlobalPosition();
    if ((delta > 0 && y > (256 - 32)) || (delta < 0 && y <= 0)) {
      return;
    }
    container.y += delta;
  }
}

// main
const setup = () => {
  // 加载资源
  const car = loadCar();
  const boom = loadBoom();
  const text = generateText('you lose!!')
  const moving = new PIXI.Container();
  moving.addChild(car);
  moving.addChild(boom);
  boom.visible = false;
  const rec = generateWall();

  // 监听按键
  let upPress = addKeyboardEvent(0x26);
  let downPress = addKeyboardEvent(0x28);
  const goUp = move(rec, -1);
  const goDown = move(rec, 1);
 
  upPress.press = () => {
    app.ticker.add(goUp);
  };
  upPress.release = () => {
    app.ticker.remove(goUp);
  };
  downPress.press = () => {
    app.ticker.add(goDown);
  }
  downPress.release = () => {
    app.ticker.remove(goDown);
  };

  app.stage.addChild(rec);
  app.stage.addChild(moving);

  // 启动并进行碰撞检测
  const rocketRun = () => {
    if (moving.x >= 256) {
      moving.y = randomInt(0, 7) * 32
      moving.x = 0;
    } else {
      moving.x += 1;
    }
    if (hitTestRectangle(moving,rec)) {
      boom.visible = true;
      app.stage.addChild(text);
      app.ticker.remove(rocketRun);
    }
  }
  setTimeout(() => {
    app.ticker.add(rocketRun)
  }, 3000);
}