// 9 s video v3: clearer battery (labelled 0/33/66/100%), empty red base -> full green, step text inside.
// Usage: node battery-3steps-v3.js <framesDir>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const DUR = 9, FPS = 30, N = DUR * FPS;
const html = `<!doctype html><html><body style="margin:0;background:#000">
<canvas id="c" width="1080" height="1350"></canvas>
<script>
const W=1080,H=1350,INK='#1D1D1F',PAPER='#F5F5F7',GREEN='#128C4A',RED='#E5484D',MUTED='#6E6E73';
const F='"Liberation Sans", Arial, sans-serif';
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
const STEPS=[
 {t:'Testē reklāmas organiski', pct:'33%'},
 {t:'Tērē naudu uz labākajām', pct:'66%'},
 {t:'Izmanto remārketingu un e-pastus jau esošai auditorijai', pct:'100%'}
];
const START=[0.4,3.0,5.6], FILL=0.5;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-x,3);
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function wrap(text,x,y,maxW,lh){const words=text.split(' ');let line='';for(const w of words){const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line,x,y);line=w;y+=lh;}else line=test;}ctx.fillText(line,x,y);}
function draw(t){
  ctx.fillStyle=PAPER; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  ctx.fillStyle=INK; ctx.font='bold 84px '+F; ctx.fillText('Reklāmas 3 soļi', W/2, 200);
  const bx=250, by=320, bw=580, bh=860, R=80;
  ctx.save(); ctx.translate(W/2, by+bh+36); ctx.scale(1,0.12);
  const gs=ctx.createRadialGradient(0,0,0,0,0,bw*0.7); gs.addColorStop(0,'rgba(29,29,31,0.35)'); gs.addColorStop(1,'rgba(29,29,31,0)');
  ctx.fillStyle=gs; ctx.beginPath(); ctx.arc(0,0,bw*0.7,0,Math.PI*2); ctx.fill(); ctx.restore();
  const cg=ctx.createLinearGradient(W/2-80,0,W/2+80,0); cg.addColorStop(0,'#4a4a4e'); cg.addColorStop(0.5,'#9a9aa0'); cg.addColorStop(1,'#4a4a4e');
  ctx.fillStyle=cg; rr(W/2-80, by-56, 160, 74, 18); ctx.fill();
  const bg=ctx.createLinearGradient(bx,0,bx+bw,0); bg.addColorStop(0,'#2a2a2e'); bg.addColorStop(0.5,'#111113'); bg.addColorStop(1,'#2a2a2e');
  ctx.save(); ctx.shadowColor='rgba(0,0,0,0.35)'; ctx.shadowBlur=40; ctx.shadowOffsetY=20;
  ctx.fillStyle=bg; rr(bx,by,bw,bh,R); ctx.fill(); ctx.restore();
  const ix=bx+26, iy=by+26, iw=bw-52, ih=bh-52, ir=56;
  ctx.save(); rr(ix,iy,iw,ih,ir); ctx.clip();
  ctx.fillStyle='#ffffff'; ctx.fillRect(ix,iy,iw,ih);
  const rg=ctx.createLinearGradient(0,iy+ih*0.66,0,iy+ih); rg.addColorStop(0,'#ff6b6f'); rg.addColorStop(1,RED);
  ctx.fillStyle=rg; ctx.fillRect(ix,iy+ih*0.66,iw,ih*0.34);
  let level=0; for(let i=0;i<3;i++){ level += ease(clamp((t-START[i])/FILL))/3; }
  if(level>0){
    const gy=iy+ih*(1-level);
    const gg=ctx.createLinearGradient(0,gy,0,iy+ih); gg.addColorStop(0,'#3fd58a'); gg.addColorStop(0.5,GREEN); gg.addColorStop(1,'#0c6a38');
    ctx.fillStyle=gg; ctx.fillRect(ix,gy,iw,ih*level);
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(ix,gy,iw,10);
  }
  const sh=ctx.createLinearGradient(ix,0,ix+iw,0);
  sh.addColorStop(0,'rgba(0,0,0,0.28)'); sh.addColorStop(0.12,'rgba(0,0,0,0)'); sh.addColorStop(0.88,'rgba(0,0,0,0)'); sh.addColorStop(1,'rgba(0,0,0,0.28)');
  ctx.fillStyle=sh; ctx.fillRect(ix,iy,iw,ih);
  ctx.restore();
  // level ticks on the right side
  ctx.textAlign='left'; ctx.font='bold 36px '+F;
  [['100%',0],['66%',1/3],['33%',2/3],['0%',1]].forEach(([lab,f])=>{
    const y=iy+ih*f; ctx.fillStyle=INK; ctx.fillText(lab, bx+bw+30, y+12);
    ctx.fillStyle='rgba(29,29,31,0.25)'; ctx.fillRect(bx+bw+8, y, 16, 3);
  });
  // step card inside battery
  let cur=-1; for(let i=0;i<3;i++){ if(t>=START[i]) cur=i; }
  if(cur>=0){
    const local=t-START[cur];
    const a=clamp(local/0.2), sc=0.9+0.1*ease(clamp(local/0.25));
    ctx.save(); ctx.globalAlpha=a; ctx.translate(W/2, by+bh/2); ctx.scale(sc,sc);
    ctx.shadowColor='rgba(0,0,0,0.25)'; ctx.shadowBlur=30; ctx.shadowOffsetY=10;
    ctx.fillStyle='#ffffff'; rr(-236,-190,472,380,36); ctx.fill();
    ctx.shadowColor='transparent';
    ctx.textAlign='center';
    ctx.fillStyle=GREEN; ctx.font='bold 40px '+F; ctx.fillText('SOLIS '+(cur+1)+' · '+STEPS[cur].pct, 0, -100);
    ctx.fillStyle=INK; ctx.font="bold 48px "+F; wrap(STEPS[cur].t, 0, -20, 420, 60);
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
