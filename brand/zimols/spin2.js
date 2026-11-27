// Clean 30 s globe: ink sphere, rotating meridian grid, Claude-orange "Claude" word.
// Usage: node spin2.js <framesDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const FPS = 30, DUR = 30, N = FPS * DUR;
const html = `<!doctype html><html><body style="margin:0;background:#000">
<canvas id="c" width="1080" height="1350"></canvas>
<script>
const W=1080,H=1350,INK='#1D1D1F',PAPER='#F5F5F7',ORANGE='#D97757';
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const F='"Liberation Sans", Arial, sans-serif';
function draw(t){
  ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  const cx=540, cy=470, R=250;
  // soft neutral ground shadow
  ctx.save(); ctx.translate(cx, cy+R+70); ctx.scale(1,0.18);
  const sh=ctx.createRadialGradient(0,0,0,0,0,R*1.1);
  sh.addColorStop(0,'rgba(29,29,31,0.22)'); sh.addColorStop(1,'rgba(29,29,31,0)');
  ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,R*1.1,0,Math.PI*2); ctx.fill(); ctx.restore();
  // sphere base (ink)
  const g=ctx.createRadialGradient(cx-90,cy-100,20,cx,cy,R*1.05);
  g.addColorStop(0,'#4a4a4e'); g.addColorStop(0.5,INK); g.addColorStop(1,'#0a0a0b');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
  // rotating meridians + fixed latitudes (globe grid)
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  ctx.strokeStyle='rgba(245,245,247,0.16)'; ctx.lineWidth=2;
  const rot=(2*Math.PI*2*t)/6; // 2 turns in 30 s, period aligned with 6-meridian spacing
  for(let j=0;j<6;j++){
    const lon=rot+j*Math.PI/6;
    ctx.beginPath(); ctx.ellipse(cx,cy,Math.max(R*Math.abs(Math.cos(lon)),1),R,0,0,Math.PI*2); ctx.stroke();
  }
  for(const p of [-60,-30,0,30,60]){
    const a=p*Math.PI/180;
    ctx.beginPath(); ctx.ellipse(cx,cy+R*Math.sin(a),R*Math.cos(a),R*0.12*Math.cos(a),0,0,Math.PI*2); ctx.stroke();
  }
  // light sheen (fixed)
  const sd=ctx.createRadialGradient(cx-90,cy-100,R*0.08,cx,cy,R);
  sd.addColorStop(0,'rgba(255,255,255,0.14)'); sd.addColorStop(0.6,'rgba(0,0,0,0)'); sd.addColorStop(1,'rgba(0,0,0,0.45)');
  ctx.fillStyle=sd; ctx.fillRect(cx-R,cy-R,2*R,2*R);
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,R-1,0,Math.PI*2); ctx.stroke();
  // static text on ball
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,0.35)'; ctx.shadowBlur=12; ctx.shadowOffsetY=3;
  ctx.fillStyle='#F5F5F7'; ctx.font='bold 78px '+F; ctx.fillText('7 dienu',cx,cy-58);
  ctx.fillStyle=ORANGE; ctx.font='bold 78px '+F; ctx.fillText('Claude',cx,cy+22);
  ctx.fillStyle='#F5F5F7'; ctx.font='42px '+F; ctx.fillText('online izaicinājums',cx,cy+100);
  ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
  // static headline + subline
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.fillStyle=INK; ctx.font='bold 100px '+F; ctx.fillText('Pievienojies arī tu',110,985);
  ctx.fillStyle='rgba(29,29,31,0.88)'; ctx.font='44px '+F;
  ctx.fillText('prasmīgajiem satura veidotājiem, kuri',110,1078);
  ctx.fillText('māk lietot Claude',110,1134);
}
window.render=(t)=>{ draw(t); return cv.toDataURL('image/jpeg',0.92); };
window.ready=document.fonts.ready;
</script></body></html>`;
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => window.ready);
  for (let i = 0; i < N; i++) {
    const url = await page.evaluate(t => window.render(t), i / N);
    fs.writeFileSync(path.join(dir, `f_${String(i).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log('done', N);
})().catch(e => { console.error(e); process.exit(1); });
