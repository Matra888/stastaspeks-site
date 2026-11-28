// Storyboard PNG: plan for the 3-step battery video. Usage: node battery-plan.js <outPng>
const { chromium } = require('playwright');
const out = process.argv[2];
const html = `<!doctype html><html><body style="margin:0"><div id="p" style="width:1080px;height:1350px;background:#F5F5F7;font-family:'Liberation Sans',Arial,sans-serif;color:#1D1D1F;padding:70px 110px;box-sizing:border-box">
<div style="font-size:30px;letter-spacing:4px;color:#128C4A;font-weight:700">VIDEO PLĀNS · 9 s · 1080×1350</div>
<div style="font-size:76px;font-weight:700;margin-top:18px;line-height:1.05">Reklāmas 3 soļi</div>
<div style="margin-top:40px;display:flex;flex-direction:column;gap:22px">
${[
 ['0–0,4 s','Tukša baterija ar sarkanu apakšu','0%','Atvēršana: "Reklāmas 3 soļi"'],
 ['0,4–3 s','Solis 1: Testē reklāmas organiski','33%','Baterija piepildās līdz 1/3, zaļš'],
 ['3–5,6 s','Solis 2: Tērē naudu uz labākajām','66%','Baterija līdz 2/3'],
 ['5,6–9 s','Solis 3: Izmanto remārketingu un e-pastus jau esošai auditorijai','100%','Pilna baterija, beigu kadrs'],
].map((r,i)=>`<div style="display:flex;gap:36px;align-items:center;background:#fff;border-radius:28px;padding:24px 32px;box-shadow:0 10px 30px rgba(29,29,31,0.08)">
<div style="width:130px;height:130px;border-radius:24px;background:${i===0?'#E5484D':'#128C4A'};color:#fff;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:700;flex:0 0 auto">${r[2]}</div>
<div><div style="font-size:30px;color:#128C4A;font-weight:700">${r[0]}</div><div style="font-size:38px;font-weight:700;line-height:1.2;margin-top:4px">${r[1]}</div><div style="font-size:30px;color:#1D1D1F;margin-top:8px">${r[3]}</div></div></div>`).join('')}
</div></div></body></html>`;
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage({viewport:{width:1080,height:1350}});await p.setContent(html,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:out});await b.close();console.log(out);})().catch(e=>{console.error(e);process.exit(1);});
