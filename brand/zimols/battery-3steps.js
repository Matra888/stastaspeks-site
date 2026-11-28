// 12 s video: empty battery (red bottom) fills green step by step as the 3 Meta ad steps are completed.
// Usage: node battery-3steps.js <framesDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const DUR = 12, FPS = 30, N = DUR * FPS;
const html = `<!doctype html><html><body style="margin:0;background:#000">
<canvas id="c" width="1080" height="1350"></canvas>
<script>
const W=1080,H=1350,INK='#1D1D1F',PAPER='#F5F5F7',GREEN='#128C4A',RED='#E5484D',MUTED='#6E6E73',LINE='#D2D2D7';
const F='"Liberation Sans", Arial, sans-serif';
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const STEPS=[
 {t:'Testē reklāmas organiski', s:'Vispirms kā parastus postus'},
 {t:'Tērē naudu tikai uz labākajām', s:'Tās, kas jau strādā organiski'},
 {t:'Remarketings', s:'Atkārtota reklāma ieinteresētajiem'}
];
const START=[1.0,4.0,7.0], FILL=0.5;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-x,3);
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function draw(t){
  ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  // title
  ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  ctx.fillStyle=INK; ctx.font='bold 84px '+F;
  ctx.fillText('Reklāmas 3 soļi', W/2, 220);
  // battery body
  const bx=240, by=330, bw=600, bh=820, cap=70;
  ctx.fillStyle=MUTED; rr(bx+bw/2-70, by-cap+8, 140, cap, 14); ctx.fill();
  ctx.fillStyle='#ffffff'; rr(bx,by,bw,bh,48); ctx.fill();
  ctx.strokeStyle=INK; ctx.lineWidth=12; rr(bx,by,bw,bh,48); ctx.stroke();
  // inner area
  const ix=bx+26, iy=by+26, iw=bw-52, ih=bh-52, ir=30;
  ctx.save(); rr(ix,iy,iw,ih,ir); ctx.clip();
  // red bottom band (empty warning)
  ctx.fillStyle=RED; ctx.fillRect(ix,iy+ih*0.66,iw,ih*0.34);
  // green fill per step (bottom-up, thirds)
  let level=0;
  for(let i=0;i<3;i++){
    const p=ease(clamp((t-START[i])/FILL));
    level += p/3;
  }
  if(level>0){ ctx.fillStyle=GREEN; ctx.fillRect(ix, iy+ih*(1-level), iw, ih*level); }
  ctx.restore();
  // step dividers
  ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=6;
  for(const f of [1/3,2/3]){ ctx.beginPath(); ctx.moveTo(ix+30,iy+ih*(1-f)); ctx.lineTo(ix+iw-30,iy+ih*(1-f)); ctx.stroke(); }
  // step text below battery
  let y=1245;
  let cur=-1; for(let i=0;i<3;i++){ if(t>=START[i]) cur=i; }
  for(let i=cur;i<=cur && i>=0;i++){
    const local=t-START[i];
    const a=clamp(local/0.3), sc=0.92+0.08*ease(clamp(local/0.3));
    ctx.save(); ctx.globalAlpha=a; ctx.translate(W/2,0); ctx.scale(sc,sc); ctx.translate(-W/2,0);
    ctx.fillStyle=GREEN; ctx.font='bold 40px '+F; ctx.fillText('Solis '+(i+1), W/2, 1190);
    ctx.fillStyle=INK; ctx.font='bold 50px '+F; ctx.fillText(STEPS[i].t, W/2, 1260);
    ctx.restore();
  }
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
    const url = await page.evaluate(t => window.render(t), i / FPS);
    fs.writeFileSync(path.join(dir, `f_${String(i).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log('done', N);
})().catch(e => { console.error(e); process.exit(1); });
