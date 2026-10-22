const fs=require('fs');
global.window={};eval(fs.readFileSync(process.argv[2]+'/msrc/wordmark.js','utf8'));
const W=window.OBS_WORDMARK;const font=fs.readFileSync(process.argv[2]+'/font/nhgd65.woff2').toString('base64');
const vbw=4168.95,vbh=458.016,w=1186,s=w/vbw,h=vbh*s,top=609-h;
const html=`<!doctype html><html><head><style>@font-face{font-family:N;src:url(data:font/woff2;base64,${font}) format('woff2')}
html,body{margin:0;width:1200px;height:630px;background:#f1ede5;overflow:hidden}
.t{position:absolute;top:${59-34*0.72}px;font:500 34px/41px N;letter-spacing:-0.02em;color:#151313}
.l{left:26px}.r{right:${1200-1178}px;text-align:right}
svg{position:absolute;left:7px;top:${top}px;width:${w}px;height:${h}px}</style></head><body>
<div class="t l">Original<br>thinking<br>—</div><div class="t r">Built<br>to last<br>—</div>
<svg viewBox="${W.vb}"><g fill="#1a1a1a">${W.letters.map(d=>`<path d="${d}"/>`).join('')}</g></svg></body></html>`;
fs.writeFileSync('og.html',html);
