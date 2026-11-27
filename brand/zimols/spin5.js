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
const DAYS=['Artifacts','Dizaina sistēma','Instagram karuseļi','LinkedIn posti','Automatizēti bloga raksti','Web lapas audits','Video montāža'];
const T0=0.3, STEP=1.0, POP=0.4, FILL=0.45;
const X0=110, X6=970, LY=840;
const xk=i=>X0+(i+1)*(X6-X0)/7;
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
  // faster rotating meridians: 36 steps of 30 deg in 30 s = 3 full pattern cycles (seamless)
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  ctx.strokeStyle='rgba(245,245,247,0.18)'; ctx.lineWidth=2;
  const rot=(sec/DUR)*36*(Math.PI/6);
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
  // progress: 3D glossy bar (YouTuber style)
  const k = sec>=T0 ? Math.min(6, Math.floor((sec-T0)/STEP)) : -1;
  // fill starts at the left edge immediately; each day pushes the head forward
  let u=0;
  if(k>=0){ const Ti=T0+k*STEP; u=k+cubicOut(clamp((sec-Ti)/FILL)); }
  const headX=X0+u*(X6-X0)/7;
  const TH=26, TX=X0-14, TW=(X6-X0)+28, TY=LY-TH/2;
  const rr=(x,y,w,h,r)=>{ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();};
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.12)'; ctx.shadowBlur=10; ctx.shadowOffsetY=4;
  const tg=ctx.createLinearGradient(0,TY,0,TY+TH); tg.addColorStop(0,'#dcdce1'); tg.addColorStop(1,'#eeeef2');
  ctx.fillStyle=tg; rr(TX,TY,TW,TH,TH/2); ctx.fill();
  ctx.restore();
  if(u>0.001){
    const fx=TX, fw=Math.max(TH, headX-TX);
    ctx.save();
    ctx.shadowColor='rgba(18,140,74,0.45)'; ctx.shadowBlur=20; ctx.shadowOffsetY=6;
    const fg=ctx.createLinearGradient(0,TY,0,TY+TH); fg.addColorStop(0,'#3fd58a'); fg.addColorStop(0.55,'#128C4A'); fg.addColorStop(1,'#0c6a38');
    ctx.fillStyle=fg; rr(fx,TY,fw,TH,TH/2); ctx.fill();
    ctx.restore();
    ctx.save(); rr(fx,TY,fw,TH,TH/2); ctx.clip();
    ctx.fillStyle='rgba(255,255,255,0.28)'; ctx.fillRect(fx,TY+3,fw,8);
    ctx.restore();
    const hx=headX+4, hy=LY;
    ctx.save(); ctx.shadowColor='rgba(18,140,74,0.5)'; ctx.shadowBlur=18; ctx.shadowOffsetY=4;
    const kg=ctx.createRadialGradient(hx-6,hy-8,3,hx,hy,22); kg.addColorStop(0,'#ffffff'); kg.addColorStop(0.25,'#8af0b8'); kg.addColorStop(1,'#128C4A');
    ctx.fillStyle=kg; ctx.beginPath(); ctx.arc(hx,hy,20,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  // nodes + numbers
  for(let i=0;i<7;i++){
    const lit = k>=i, x=xk(i), Ti=T0+i*STEP;
    const pop = lit ? backOut(clamp((sec-Ti)/0.35)) : 1;
    ctx.beginPath(); ctx.arc(x,LY,Math.max(7*pop,0.1),0,Math.PI*2);
    ctx.fillStyle = lit ? '#ffffff' : '#c4c4ca'; ctx.fill();
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle=lit?INK:MUTED; ctx.font='bold 26px '+F;
    ctx.fillText(String(i+1), x, LY+64);
  }
  // day name pop-up (no 'DIENA n/7' label)
  if(k>=0){
    const Tk=T0+k*STEP, local=sec-Tk;
    const s=backOut(clamp(local/POP)), a=clamp(local/0.2);
    ctx.save(); ctx.globalAlpha=a; ctx.translate(540,0); ctx.scale(s,s); ctx.translate(-540,0);
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle=INK; ctx.font='bold 60px '+F;
    ctx.fillText(DAYS[k], 540, 740);
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
