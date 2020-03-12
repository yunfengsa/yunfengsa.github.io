import { h, render } from '/pixi-bundless/web_modules/preact.js';
import htm from '/pixi-bundless/web_modules/htm.js';
import Desc from '/pixi-bundless/src/desc.js';
import { start } from '/pixi-bundless/src/pixi.js';

const html = htm.bind(h);

window.app = new PIXI.Application({width: 256, height: 256});
app.renderer.backgroundColor = 0xDCDCDC;
document.body.appendChild(app.view);

start();

render(html`<${Desc} />`, document.getElementById('app'));