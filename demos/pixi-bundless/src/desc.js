import { h } from '/pixi-bundless/web_modules/preact.js';
import htm from '/pixi-bundless/web_modules/htm.js';
const html = htm.bind(h);
export default function() {
  return html`<p>通过↑ ↓控制方块的移动 躲避小车车  三秒后开始</p>`;
}