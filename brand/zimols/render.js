// Usage: node render.js content.json outDir
// content.json: { "format": "ig_carousel"|"linkedin"|"blog_hero", "slides": [ ... ] }
// slide types:
//  { "type":"cover", "photo":"assets/p2.jpg", "headline":["line1","line2"], "sub":"..." }
//  { "type":"list",  "bg":"ink"|"paper"|"accent", "eyebrow":"...", "headline":"...", "items":["..."], "footer":"..." }
//  { "type":"cta",   "bg":"accent", "headline":"...", "sub":"..." }
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens.json'), 'utf8'));
const [, , contentPath, outDir] = process.argv;
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const F = T.formats[content.format || 'ig_carousel'];
const C = T.color;
const b64 = p => fs.readFileSync(path.resolve(path.dirname(contentPath), p)).toString('base64');
const css = `
html,body{margin:0;background:#000}
.s{position:relative;width:${F.w}px;height:${F.h}px;overflow:hidden;font-family:${T.font.body};color:${C.paper}}
.pad{position:absolute;left:110px;right:110px;bottom:190px}
.display{font-family:${T.font.display};font-weight:700;font-size:104px;line-height:1.04;letter-spacing:-2px}
.sub{margin-top:34px;font-size:46px;line-height:1.3;opacity:.92}
.pill{display:inline-block;margin-top:40px;padding:18px 34px;border-radius:999px;background:${C.accent};color:${C.accent_ink};font-size:46px;font-weight:700;line-height:1.2}
.eyebrow{font-size:30px;letter-spacing:4px;text-transform:uppercase;color:${C.accent};margin-bottom:36px;font-weight:600}
.list{margin:48px 0 0;padding:0;list-style:none;font-size:44px;line-height:1.35}
.list li{padding-left:56px;position:relative;margin-bottom:22px}
.list li:before{content:"";position:absolute;left:0;top:22px;width:24px;height:24px;background:${C.accent}}
.footer{margin-top:56px;font-family:${T.font.display};font-size:52px;font-weight:700;color:${C.accent}}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 15%}
.shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 42%,rgba(29,29,31,.82) 78%,rgba(29,29,31,.92) 100%)}
.badge{position:absolute;left:50%;top:170px;transform:translateX(-50%);width:520px;height:520px;border-radius:50%;
background:radial-gradient(circle at 32% 26%,#5ad996 0%,#1fa862 38%,${C.accent} 62%,#0a4a27 100%);
color:${C.accent_ink};display:flex;align-items:center;justify-content:center;text-align:center;padding:70px;box-sizing:border-box;
font-family:${T.font.display};font-weight:700;font-size:60px;line-height:1.08;letter-spacing:-1px;
text-shadow:0 3px 10px rgba(0,0,0,.28);
box-shadow:inset -28px -36px 70px rgba(0,0,0,.32),inset 26px 26px 50px rgba(255,255,255,.28),0 50px 90px rgba(18,140,74,.38),0 14px 30px rgba(0,0,0,.18)}
.quotes{margin-top:56px}
.q{margin-bottom:46px}
.q .qt{font-size:40px;line-height:1.35;font-weight:400}
.q .qn{margin-top:16px;font-size:28px;font-weight:700;color:${C.accent}}
.q .qrow{display:flex;align-items:center;gap:20px}
.q .qlogo{height:64px;max-width:150px;object-fit:contain;background:#fff;border-radius:12px;padding:8px}
.emoji{font-family:'Noto Color Emoji',sans-serif;font-size:150px;line-height:1;margin-bottom:24px}
.feat{margin-top:44px;display:flex;flex-direction:column;gap:22px}
.card{display:flex;align-items:center;gap:30px;background:#fff;border-radius:28px;padding:30px 36px;box-shadow:0 10px 30px rgba(29,29,31,0.08)}
.chk{flex:0 0 auto;width:68px;height:68px;border-radius:50%;background:${C.accent};color:#fff;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:700}
.card .lbl{font-size:42px;font-weight:600;line-height:1.2;color:${C.ink}}
.qpill{display:inline-block;white-space:nowrap;background:${C.accent};color:#fff;font-weight:700;font-size:92px;line-height:1.1;letter-spacing:-1px;padding:34px 52px;border-radius:40px}
.hl{background:${C.accent};color:#fff;padding:0 14px;border-radius:12px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.bg-ink{background:${C.ink}} .bg-paper{background:${C.paper};color:${C.ink}} .bg-accent{background:${C.accent};color:${C.accent_ink}}
.bg-paper .eyebrow{color:${C.accent}} .bg-paper .footer{color:${C.accent}} .bg-paper .list li:before{background:${C.accent}}
.bg-accent .eyebrow{color:${C.accent_ink}} .bg-accent .footer{color:${C.accent_ink}} .bg-accent .list li:before{background:${C.accent_ink}}
`;
function slide(s) {
  if (s.type === 'cover') {
    const img = `data:image/jpeg;base64,${b64(s.photo)}`;
    return `<div class="s bg-ink"><img class="photo" src="${img}"><div class="shade"></div>
      <div class="pad">${s.emoji ? `<div class="emoji">${s.emoji}</div>` : ''}<div class="display">${s.headline.join('<br>')}</div>${s.sub ? `<div class="sub">${s.sub}</div>` : ''}</div></div>`;
  }
  if (s.type === 'list') {
    return `<div class="s bg-${s.bg || 'paper'}"><div class="pad">
      ${s.eyebrow ? `<div class="eyebrow">${s.eyebrow}</div>` : ''}
      <div class="display" style="font-size:${s.headlineSize || 104}px">${s.headline}</div>
      ${s.sub ? (s.subStyle === 'pill' ? `<div><span class="pill">${s.sub}</span></div>` : `<div class="sub">${s.sub}</div>`) : ''}
      <ul class="list">${s.items.map(i => `<li>${i}</li>`).join('')}</ul>
      ${s.footer ? `<div class="footer">${s.footer}</div>` : ''}</div></div>`;
  }
  if (s.type === 'cta') {
    return `<div class="s bg-${s.bg || 'accent'}">${s.badge ? `<div class="badge">${s.badge}</div>` : ''}<div class="pad"><div class="display" style="font-size:${s.headlineSize || 104}px">${s.headline}</div>${s.sub ? `<div class="sub">${s.sub}</div>` : ''}</div></div>`;
  }
  if (s.type === 'quotes') {
    return `<div class="s bg-${s.bg || 'paper'}"><div class="pad">
      <div class="display">${s.headline}</div>
      <div class="quotes">${s.items.map(i => `<div class="q"><div class="qt">${i.text}</div><div class="qrow" style="margin-top:16px">${i.logo ? `<img class="qlogo" src="data:image/png;base64,${b64(i.logo)}">` : ''}<div class="qn" style="margin-top:0">${i.name}</div></div></div>`).join('')}</div>
      </div></div>`;
  }
  if (s.type === 'features') {
    return `<div class="s bg-${s.bg || 'paper'}"><div class="pad">
      <div class="display" style="font-size:${s.headlineSize || 104}px">${s.headline}</div>
      ${s.sub ? `<div><span class="pill">${s.sub}</span></div>` : ''}
      <div class="feat">${s.items.map(i => `<div class="card"><div class="chk">✓</div><div class="lbl">${i}</div></div>`).join('')}</div>
      ${s.footer ? `<div class="footer">${s.footer}</div>` : ''}</div></div>`;
  }
  if (s.type === 'question') {
    const top = s.top ? `<div class="display" style="font-size:${s.topSize || 76}px;margin-bottom:44px">${s.top}</div>` : '';
    const head = s.plain ? `<div class="display" style="font-size:${s.headlineSize || 120}px">${s.headline}</div>` : `<div class="qpill">${s.headline}</div>`;
    return `<div class="s bg-${s.bg || 'paper'}"><div class="pad">${top}${head}${s.sub ? `<div class="sub" style="margin-top:40px">${s.sub}</div>` : ''}${s.sub2 ? `<div style="margin-top:36px;font-size:42px;font-weight:400;color:${C.ink}">${s.sub2}</div>` : ''}</div></div>`;
  }
  throw new Error('unknown slide type ' + s.type);
}
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: F.w, height: F.h }, deviceScaleFactor: 1 });
  for (let i = 0; i < content.slides.length; i++) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${slide(content.slides[i])}</body></html>`;
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(outDir, `${content.name || 'post'}_${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: out });
    console.log(out);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
