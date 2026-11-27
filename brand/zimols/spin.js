// 30 s, 30 fps, 1080x1350: static CTA slide, rotating globe-like badge with the Claude mark.
// Usage: node spin.js <framesDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const markB64 = fs.readFileSync(path.join(__dirname, 'assets/claude-mark.png')).toString('base64');
const FPS = 30, DUR = 30, N = FPS * DUR;
const html = `<!doctype html><html><body style="margin:0;background:#000">
<canvas id="c" width="1080" height="1350"></canvas>
<img id="m" src="data:image/png;base64,${markB64}" style="display:none">
<script>
const W=1080,H=1350,INK='#1D1D1F',PAPER='#F5F5F7',ACC='#128C4A';
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
let tinted=null;
const img=document.getElementById('m');
function tint(){
  const o=document.createElement('canvas'); o.width=img.naturalWidth; o.height=img.naturalHeight;
  const x=o.getContext('2d'); x.drawImage(img,0,0);
  x.globalCompositeOperation='source-in'; x.fillStyle='rgba(255,255,255,0.95)'; x.fillRect(0,0,o.width,o.height);
  tinted=o;
}
function draw(t){ // t in [0,1)
  ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  const cx=540, cy=470, R=250;
  // soft ground shadow
  ctx.save(); ctx.translate(cx, cy+R+70); ctx.scale(1,0.18);
  const sh=ctx.createRadialGradient(0,0,0,0,0,R*1.1);
  sh.addColorStop(0,'rgba(18,140,74,0.38)'); sh.addColorStop(1,'rgba(18,140,74,0)');
  ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,R*1.1,0,Math.PI*2); ctx.fill(); ctx.restore();
  // sphere base
  const g=ctx.createRadialGradient(cx-80,cy-90,20,cx,cy,R*1.05);
  g.addColorStop(0,'#5ad996'); g.addColorStop(0.45,'#1fa862'); g.addColorStop(0.75,ACC); g.addColorStop(1,'#0a4a27');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
  // rotating marks, projected onto sphere (globe effect)
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  const rot = 2*Math.PI*2*t; // 2 full turns in 30 s, seamless loop
  const K=6, lat=[-0.66,0.66,-0.62,0.68,-0.66,0.62];
  for(let k=0;k<K;k++){
    const lon=rot+k*2*Math.PI/K, c=Math.cos(lon);
    if(c<=0.02) continue;
    const x=cx+R*0.72*Math.sin(lon), y=cy+R*lat[k];
    const s=R*0.46*(0.35+0.65*c);
    ctx.globalAlpha=0.12+0.8*c;
    ctx.drawImage(tinted,x-s/2,y-s/2,s,s);
  }
  ctx.globalAlpha=1;
  // shading overlay (fixed light)
  const sd=ctx.createRadialGradient(cx-70,cy-80,R*0.1,cx,cy,R);
  sd.addColorStop(0,'rgba(255,255,255,0.20)'); sd.addColorStop(0.6,'rgba(0,0,0,0)'); sd.addColorStop(1,'rgba(0,0,0,0.38)');
  ctx.fillStyle=sd; ctx.fillRect(cx-R,cy-R,2*R,2*R);
  ctx.restore();
  // rim
  ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,R-1,0,Math.PI*2); ctx.stroke();
  // static badge text
  ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,0.28)'; ctx.shadowBlur=10; ctx.shadowOffsetY=3;
  ctx.font='bold 58px "Liberation Sans", Arial, sans-serif';
  ctx.fillText('7 dienu',cx,cy-62); ctx.fillText('Claude',cx,cy+4); ctx.fillText('izaicinājums',cx,cy+70);
  ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
  // static headline + subline
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.fillStyle=INK; ctx.font='bold 100px "Liberation Sans", Arial, sans-serif';
  ctx.fillText('Pievienojies arī tu',110,985);
  ctx.fillStyle='rgba(29,29,31,0.88)'; ctx.font='44px "Liberation Sans", Arial, sans-serif';
  ctx.fillText('prasmīgajiem satura veidotājiem, kuri',110,1078);
  ctx.fillText('māk lietot MI',110,1134);
}
window.render=(t)=>{ draw(t); return cv.toDataURL('image/jpeg',0.92); };
window.ready=new Promise(r=>{ if(img.complete) {tint(); r();} else img.onload=()=>{tint(); r();}; });
</script></body></html>`;
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => window.ready);
  await page.evaluate(() => document.fonts.ready);
  for (let i = 0; i < N; i++) {
    const url = await page.evaluate(t => window.render(t), i / N);
    fs.writeFileSync(path.join(dir, `f_${String(i).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
    if (i % 150 === 0) console.log('frame', i);
  }
  await browser.close();
  console.log('done', N);
})().catch(e => { console.error(e); process.exit(1); });
