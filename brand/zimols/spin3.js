// 30 s video: faster globe + 7 day pop-ups with a green progress line that fills as each day appears.
// Usage: node spin3.js <framesDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const FPS = 30, DUR = 30, N = FPS * DUR;
const html = `<!doctype html><html><body style="margin:0;background:#000">
<canvas id="c" width="1080" height="1350"></canvas>
<script>
const DUR=30,W=1080,H=1350,INK='#1D1D1F',PAPER='#F5F5F7',ORANGE='#D97757',GREEN='#128C4A',MUTED='#6E6E73',LINE='#D2D2D7';
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const F='"Liberation Sans", Arial, sans-serif';
const DAYS=['Artifacts','Dizaina sistēma','Instagram karuseļi','LinkedIn posti','SEO bloga raksti','Web lapas audits','Video montāža'];
const T0=2.0, STEP=3.6, POP=0.45, FILL=0.5;
const X0=110, X6=970, LY=840;
const xk=k=>X0+k*(X6-X0)/6;
const clamp=(x)=>Math.max(0,Math.min(1,x));
const backOut=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const cubicOut=x=>1-Math.pow(1-x,3);
function draw(sec){
  ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  const cx=540, cy=400, R=230;
  // ground shadow
  ctx.save(); ctx.translate(cx, cy+R+60); ctx.scale(1,0.18);
  const sh=ctx.createRadialGradient(0,0,0,0,0,R*1.1);
  sh.addColorStop(0,'rgba(29,29,31,0.22)'); sh.addColorStop(1,'rgba(29,29,31,0)');
  ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,R*1.1,0,Math.PI*2); ctx.fill(); ctx.restore();
  // sphere
  const g=ctx.createRadialGradient(cx-85,cy-95,20,cx,cy,R*1.05);
  g.addColorStop(0,'#4a4a4e'); g.addColorStop(0.5,INK); g.addColorStop(1,'#0a0a0b');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
  // fast rotating meridians: 18 steps of 30 deg in 30 s = 3 full pattern cycles (seamless)
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  ctx.strokeStyle='rgba(245,245,247,0.18)'; ctx.lineWidth=2;
  const rot=(sec/DUR)*18*(Math.PI/6);
  for(let j=0;j<6;j++){
    const lon=rot+j*Math.PI/6;
    ctx.beginPath(); ctx.ellipse(cx,cy,Math.max(R*Math.abs(Math.cos(lon)),1),R,0,0,Math.PI*2); ctx.stroke();
  }
  for(const p of [-60,-30,0,30,60]){
    const a=p*Math.PI/180;
    ctx.beginPath(); ctx.ellipse(cx,cy+R*Math.sin(a),R*Math.cos(a),R*0.12*Math.cos(a),0,0,Math.PI*2); ctx.stroke();
  }
  const sd=ctx.createRadialGradient(cx-85,cy-95,R*0.08,cx,cy,R);
  sd.addColorStop(0,'rgba(255,255,255,0.14)'); sd.addColorStop(0.6,'rgba(0,0,0,0)'); sd.addColorStop(1,'rgba(0,0,0,0.45)');
  ctx.fillStyle=sd; ctx.fillRect(cx-R,cy-R,2*R,2*R);
  ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,R-1,0,Math.PI*2); ctx.stroke();
  // static text on ball
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,0.35)'; ctx.shadowBlur=12; ctx.shadowOffsetY=3;
  ctx.fillStyle=PAPER; ctx.font='bold 74px '+F; ctx.fillText('7 dienu',cx,cy-56);
  ctx.fillStyle=ORANGE; ctx.font='bold 74px '+F; ctx.fillText('Claude',cx,cy+20);
  ctx.fillStyle=PAPER; ctx.font='40px '+F; ctx.fillText('online izaicinājums',cx,cy+94);
  ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
  // day schedule
  const k = sec>=T0 ? Math.min(6, Math.floor((sec-T0)/STEP)) : -1;
  // progress track + fill
  ctx.lineCap='round'; ctx.lineWidth=8;
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(X0,LY); ctx.lineTo(X6,LY); ctx.stroke();
  let p=0;
  if(k>=1){ const Tk=T0+k*STEP; p=(k-1)+cubicOut(clamp((sec-Tk)/FILL)); }
  if(k===0){ p=0; }
  if(p>0){ ctx.strokeStyle=GREEN; ctx.beginPath(); ctx.moveTo(X0,LY); ctx.lineTo(X0+(p/6)*(X6-X0),LY); ctx.stroke(); }
  // nodes
  for(let i=0;i<7;i++){
    const lit = k>=i;
    const x=xk(i);
    const Ti=T0+i*STEP;
    const pop = lit ? backOut(clamp((sec-Ti)/0.35)) : 1;
    const r=12*pop;
    ctx.beginPath(); ctx.arc(x,LY,Math.max(r,0.1),0,Math.PI*2);
    if(lit){ ctx.fillStyle=GREEN; ctx.fill(); }
    else { ctx.fillStyle=PAPER; ctx.fill(); ctx.lineWidth=4; ctx.strokeStyle=LINE; ctx.stroke(); }
    ctx.fillStyle=lit?INK:MUTED; ctx.font='bold 26px '+F; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText(String(i+1), x, LY+54);
  }
  // day pop-up (current day only)
  if(k>=0){
    const Tk=T0+k*STEP;
    const local=sec-Tk;
    const s=backOut(clamp(local/POP));
    const a=clamp(local/0.2);
    ctx.save(); ctx.globalAlpha=a; ctx.translate(540, 0); ctx.scale(s,s); ctx.translate(-540,0);
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle=GREEN; ctx.font='bold 34px '+F; ctx.letterSpacing='6px';
    ctx.fillText('DIENA '+(k+1)+' / 7', 540+3, 700);
    ctx.fillStyle=INK; ctx.letterSpacing='0px'; ctx.font='bold 60px '+F;
    ctx.fillText(DAYS[k], 540, 775);
    ctx.restore();
  }
  // static headline + subline
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  ctx.fillStyle=INK; ctx.font='bold 96px '+F; ctx.fillText('Pievienojies arī tu',110,1000);
  ctx.fillStyle='rgba(29,29,31,0.88)'; ctx.font='42px '+F;
  ctx.fillText('prasmīgajiem satura veidotājiem, kuri',110,1088);
  ctx.fillText('māk lietot Claude',110,1140);
}
window.render=(t)=>{ draw(t*DUR); return cv.toDataURL('image/jpeg',0.92); };
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
