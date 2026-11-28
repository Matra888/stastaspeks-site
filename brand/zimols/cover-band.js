// Abstract cover infographic (no text): dark ink background, rising green-to-yellow bars with a funnel-like baseline.
const { chromium } = require('playwright');
const out = process.argv[2];
const html = `<!doctype html><html><body style="margin:0"><canvas id="c" width="1080" height="470"></canvas><script>
const c=document.getElementById('c'),x=c.getContext('2d');
const W=1080,H=470;
const bg=x.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#2a2a2e'); bg.addColorStop(1,'#0b0b0c');
x.fillStyle=bg; x.fillRect(0,0,W,H);
// subtle grid
x.strokeStyle='rgba(255,255,255,0.05)'; x.lineWidth=2;
for(let y=60;y<H;y+=90){x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}
const bars=[{h:0.22,c:['#2a7d55','#128C4A']},{h:0.46,c:['#2fa868','#128C4A']},{h:0.72,c:['#3fd58a','#128C4A']},{h:0.98,c:['#F7C52B','#F5B800']}];
const baseY=400, bw=130, gap=34, x0=(W-(4*130+3*34))/2;
bars.forEach((b,i)=>{
  const bx=x0+i*(bw+gap), bh=b.h*300, by=baseY-bh;
  x.save(); x.shadowColor='rgba(0,0,0,0.5)'; x.shadowBlur=40; x.shadowOffsetY=18;
  const g=x.createLinearGradient(bx,by,bx,baseY); g.addColorStop(0,b.c[0]); g.addColorStop(1,b.c[1]);
  x.fillStyle=g; x.beginPath(); x.roundRect(bx,by,bw,bh,28); x.fill(); x.restore();
  // gloss
  x.save(); x.beginPath(); x.roundRect(bx,by,bw,bh,28); x.clip(); const gl=x.createLinearGradient(bx,0,bx+bw,0); gl.addColorStop(0,'rgba(255,255,255,0.25)'); gl.addColorStop(0.3,'rgba(255,255,255,0)'); x.fillStyle=gl; x.fillRect(bx,by,bw,bh); x.restore();
});
// baseline
x.fillStyle='rgba(255,255,255,0.35)'; x.fillRect(x0-40,baseY+18,4*bw+3*gap+80,6);
</script></body></html>`;
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1080,height:470}});await p.setContent(html,{waitUntil:'load'});await p.evaluate(()=>new Promise(r=>setTimeout(r,200)));await p.screenshot({path:out,type:'jpeg',quality:92});await b.close();console.log(out);})().catch(e=>{console.error(e);process.exit(1);});
