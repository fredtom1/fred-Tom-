// Speaker script PDF: key point, talking points, cue and bridge for every slide, with slide thumbnails.
// Usage: node build_script.js <thumbsDir> <out.pdf>
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const lu = require('react-icons/lu');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const S = require('./script_content');

const THUMBS = process.argv[2] || 'thumbs_jpg';
const OUT = process.argv[3] || 'speaker_script.pdf';
const RED = '#C1272D', INK = '#13233A';
const icon = (name, color = RED, size = 14) => ReactDOMServer.renderToStaticMarkup(React.createElement(lu[name], { color, size: String(size), strokeWidth: 2 }));
const CUE = {
  pause: ['LuPause', 'Pause'], ask: ['LuHand', 'Ask the room'], point: ['LuMousePointer2', 'Point'],
  prop: ['LuCircleDot', 'Prop'], slow: ['LuGauge', 'Slow down'],
};
const thumb = (n) => {
  const f = path.join(THUMBS, `s${String(n).padStart(2, '0')}.jpg`);
  return 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
};
const pad = (n) => String(n).padStart(2, '0');

const css = `
@page { size: A4; margin: 15mm 16mm 17mm; }
:root { --ink:${INK}; --slate:#3E5C76; --red:${RED}; --redd:#8E1B1F; --blush:#F7E1E2; --mist:#EEF2F6; --muted:#667285; --rule:#D5DCE5; }
* { box-sizing:border-box; }
html, body { margin:0; padding:0; }
body { font-family:'Carlito','Calibri',sans-serif; color:var(--ink); font-size:10.6pt; line-height:1.42; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1, h2, h3 { font-family:'Caladea','Cambria',serif; margin:0; line-height:1.1; }
.label { font-size:7.6pt; letter-spacing:.14em; text-transform:uppercase; font-weight:700; color:var(--red); }
.muted { color:var(--muted); }
b { font-weight:700; }

/* cover */
.cover { position:relative; height:262mm; overflow:hidden; page-break-after:always; display:flex; flex-direction:column; }
.cover .arc { position:absolute; top:-70mm; right:-60mm; width:150mm; height:150mm; border-radius:50%; background:rgba(193,39,45,.10); }
.cover .arc2 { position:absolute; top:-35mm; right:-25mm; width:80mm; height:80mm; border-radius:50%; background:rgba(193,39,45,.16); }
.cover h1 { font-size:40pt; margin:4mm 0 3mm; max-width:120mm; letter-spacing:-.01em; }
.cover .sub { font-size:15pt; color:var(--slate); }
.cover .when { margin-top:5mm; display:flex; gap:3mm; flex-wrap:wrap; }
.chip { display:inline-flex; align-items:center; gap:1.5mm; padding:1.2mm 3mm; border-radius:20mm; background:var(--mist); font-size:9.5pt; font-weight:700; }
.chip.r { background:var(--blush); color:var(--redd); }
.idea { margin-top:12mm; background:var(--ink); color:#fff; border-radius:3mm; padding:7mm 8mm; }
.idea h2 { font-size:24pt; color:#fff; margin:2mm 0 5mm; }
.idea .label { color:#F08A8E; }
.idea ol { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,1fr); gap:5mm; }
.idea li { display:flex; gap:2.5mm; font-weight:700; font-size:11pt; line-height:1.3; }
.idea li i { font-style:normal; font-family:'Caladea','Cambria',serif; font-size:20pt; color:#F08A8E; line-height:1; }
.heart { margin-top:10mm; display:grid; grid-template-columns:1fr 1fr; gap:10mm; }
.heart h3 { font-size:13pt; margin:2mm 0 3mm; }
.lines { list-style:none; margin:0; padding:0; display:grid; gap:3mm; }
.lines li { display:grid; grid-template-columns:20mm 1fr; gap:2mm; font-size:10.5pt; }
.lines li span:first-child { font-size:7.6pt; letter-spacing:.1em; text-transform:uppercase; font-weight:700; color:var(--muted); padding-top:.6mm; }
.lines li span:last-child { font-family:'Caladea','Cambria',serif; font-size:12pt; font-weight:700; }
.legend { list-style:none; margin:0; padding:0; display:grid; gap:2.2mm; font-size:10pt; }
.legend li { display:flex; align-items:center; gap:2.5mm; }
.legend .k { display:inline-block; padding:.6mm 2mm; border-radius:1mm; background:var(--blush); color:var(--redd); font-weight:700; font-size:8pt; letter-spacing:.08em; text-transform:uppercase; }
.legend .s { display:inline-block; padding:.6mm 2mm; border-radius:1mm; background:var(--mist); font-weight:700; font-size:8pt; letter-spacing:.08em; text-transform:uppercase; }
.cover .bottom { margin-top:auto; border-top:.8pt solid var(--red); padding-top:3mm; font-size:9pt; color:var(--muted); display:flex; justify-content:space-between; gap:6mm; }

/* overview */
.overview { page-break-after:always; }
.overview h2 { font-size:22pt; margin:2mm 0 5mm; }
table { width:100%; border-collapse:collapse; font-size:10pt; }
th { text-align:left; font-size:7.6pt; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); padding:1.5mm 2mm; border-bottom:.8pt solid var(--rule); }
td { padding:2.2mm 2mm; border-bottom:.5pt solid var(--rule); vertical-align:top; }
td.num { font-family:'Caladea','Cambria',serif; font-weight:700; color:var(--red); font-size:13pt; width:12mm; }
td.t { font-weight:700; white-space:nowrap; width:16mm; }
.boxes { margin-top:7mm; display:grid; grid-template-columns:1fr 1fr; gap:6mm; }
.box { background:var(--mist); border-radius:2.5mm; padding:4.5mm 5mm; }
.box h3 { font-size:12.5pt; margin-bottom:2.5mm; display:flex; gap:2mm; align-items:center; }
.box ul { margin:0; padding-left:4.5mm; display:grid; gap:1.4mm; font-size:10pt; }
.box.r { background:var(--blush); }

/* section header */
.sec { display:flex; align-items:flex-end; gap:4mm; padding-bottom:2.5mm; border-bottom:.9pt solid var(--red); margin:7mm 0 1mm; break-after:avoid; page-break-after:avoid; }
.sec.first { margin-top:0; }
.sec .n { font-family:'Caladea','Cambria',serif; font-weight:700; font-size:30pt; line-height:.9; color:rgba(193,39,45,.55); min-width:14mm; }
.sec h2 { font-size:18pt; }
.sec .note { font-size:9.5pt; color:var(--muted); margin-top:1mm; }
.sec .chip { margin-left:auto; }
.break { page-break-before:always; }

/* slide block */
.slide { display:grid; grid-template-columns:58mm 1fr; gap:6mm; padding:5mm 0 4.5mm; border-bottom:.5pt solid var(--rule); break-inside:avoid; page-break-inside:avoid; }
.slide.div { grid-template-columns:34mm 1fr; padding:3.5mm 0; align-items:center; }
.slide .left { display:grid; gap:2mm; align-content:start; }
.slide img { width:100%; border-radius:1.4mm; border:.5pt solid var(--rule); display:block; }
.slide .meta { display:flex; justify-content:space-between; align-items:center; font-size:8.5pt; color:var(--muted); }
.slide .meta .time { display:inline-flex; gap:1mm; align-items:center; font-weight:700; color:var(--ink); }
.head { display:flex; align-items:baseline; gap:3mm; flex-wrap:wrap; }
.head .num { font-family:'Caladea','Cambria',serif; font-weight:700; font-size:18pt; color:var(--red); line-height:1; }
.head h3 { font-family:'Carlito','Calibri',sans-serif; font-size:12.5pt; font-weight:700; }
.vb { display:inline-flex; align-items:center; gap:1mm; padding:.4mm 2mm; border-radius:1mm; background:var(--ink); color:#fff; font-size:7.4pt; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.key { margin-top:2.5mm; background:var(--blush); border-radius:1.6mm; padding:2.2mm 3mm; }
.key .label { color:var(--redd); font-size:7pt; }
.key p { margin:.5mm 0 0; font-weight:700; font-size:11pt; line-height:1.3; color:var(--ink); }
.say { margin-top:2.8mm; }
.say .label { color:var(--slate); font-size:7pt; }
.say ul { list-style:none; margin:1mm 0 0; padding:0; display:grid; gap:1.4mm; }
.say li { display:grid; grid-template-columns:3.5mm 1fr; }
.say li::before { content:''; width:1.4mm; height:1.4mm; border-radius:50%; background:var(--red); margin-top:2.1mm; }
.say.vbx li { font-family:'Caladea','Cambria',serif; font-size:11pt; }
.cue { margin-top:2.6mm; display:grid; grid-template-columns:5mm 1fr; gap:1.5mm; font-size:10pt; }
.cue svg { margin-top:.6mm; }
.cue b { color:var(--redd); text-transform:uppercase; letter-spacing:.06em; font-size:8pt; margin-right:1mm; }
.next { margin-top:2.4mm; display:flex; gap:1.5mm; align-items:flex-start; font-style:italic; color:var(--slate); font-size:10pt; }
.next svg { flex:none; margin-top:.8mm; }
.slide.div .say { margin-top:0; }
.slide.div .say li { font-family:'Caladea','Cambria',serif; font-size:12pt; }

/* close page */
.qa { columns:2; column-gap:8mm; }
.qa div { break-inside:avoid; margin-bottom:3.2mm; }
.qa p { margin:0; font-size:9.6pt; }
.qa p.q { font-weight:700; color:var(--ink); font-size:10pt; }
.wrong { margin-top:6mm; display:grid; grid-template-columns:1fr 1fr; gap:6mm; }
`;

const sectionFor = (n) => S.sections.find((s) => s.from === n);
const cueHtml = (cues) => cues.map(([k, t]) => `<div class="cue">${icon(CUE[k][0])}<span><b>${CUE[k][1]}</b>${t}</span></div>`).join('');

let body = '';
// ---------- cover ----------
body += `<section class="cover"><div class="arc"></div><div class="arc2"></div>
  <div class="label">Speaker script · Chapter 5 review</div>
  <h1>When the vessel breaks</h1>
  <div class="sub">What to say, slide by slide</div>
  <div class="when"><span class="chip r">Sunday 4 October 2026 · 8 pm</span><span class="chip">${icon('LuClock', INK, 12)} 17 minutes, then questions</span><span class="chip">29 slides</span></div>
  <div class="idea"><div class="label">The big idea</div><h2>ICH is a process, not a moment.</h2>
    <ol><li><i>1</i><span>The vessel decides where it bleeds.</span></li><li><i>2</i><span>The first hours decide how big it gets.</span></li><li><i>3</i><span>The blood keeps injuring the brain for days.</span></li></ol></div>
  <div class="heart">
    <div><div class="label">Know these by heart</div><h3>Three lines to own</h3>
      <ul class="lines">
        <li><span>First line</span><span>"My chapter is Chapter 5… I want to start with one person."</span></li>
        <li><span>Headline</span><span>"ICH is a process, not a moment."</span></li>
        <li><span>Last line</span><span>"Thank you. What would you like me to clarify?"</span></li>
      </ul></div>
    <div><div class="label">How to read each slide</div><h3>Key</h3>
      <ul class="legend">
        <li><span class="k">Key point</span> the one idea the room must leave with</li>
        <li><span class="s">Say</span> talking points, with the words to land in <b>bold</b></li>
        <li><span class="vb">${icon('LuQuote', '#fff', 10)} Word for word</span> learn these exactly</li>
        <li>${icon('LuPause')} Pause &nbsp; ${icon('LuHand')} Ask the room &nbsp; ${icon('LuMousePointer2')} Point</li>
        <li>${icon('LuCircleDot')} Prop (the golf ball) &nbsp; ${icon('LuGauge')} Slow down</li>
        <li>${icon('LuChevronsRight', '#3E5C76')} <i class="muted">the line that carries you to the next slide</i></li>
      </ul></div>
  </div>
  <div class="bottom"><span>Oxford Textbook of Stroke and Cerebrovascular Disease (ed. Norrving, OUP 2014). Chapter 5 by Constanza Rossi and Charlotte Cordonnier.</span><span>Aim for confidence, not memorising. Learn the three lines above; talk the rest.</span></div>
</section>`;

// ---------- overview ----------
const rows = S.sections.filter((s) => s.time).map((s, i) => {
  const next = S.sections[i + 1];
  const to = next ? next.from - 1 : 28;
  return `<tr><td class="num">${s.num || '00'}</td><td><b>${s.name}</b><br><span class="muted">${s.note}</span></td><td class="muted">Slides ${s.from}–${to}</td><td class="t">${s.time}</td></tr>`;
}).join('');
body += `<section class="overview"><div class="label">The talk on one page</div><h2>Running order</h2>
  <table><tr><th></th><th>Section</th><th>Slides</th><th>Time</th></tr>${rows}
  <tr><td></td><td><b>Questions</b><br><span class="muted">Leave the references up. Backups on slides 30 and 31.</span></td><td class="muted">Slide 29</td><td class="t">Rest of slot</td></tr></table>
  <div class="boxes">
    <div class="box r"><h3>${icon('LuHand')} Three moments with the room</h3><ul>
      <li><b>Slide 12, ~6 min:</b> 30 seconds with a neighbour: "Primary or secondary?"</li>
      <li><b>Slide 16, ~9 min:</b> hands up for A, B or C before the dots reveal.</li>
      <li><b>Slide 23, ~14 min:</b> hands up: "true or false?"</li>
      <li>Always <b>say what you see</b>: "Most of you went for B."</li>
      <li>Online: use the chat or reactions instead of hands.</li></ul></div>
    <div class="box"><h3>${icon('LuCircleDot', INK)} The golf-ball moment</h3><ul>
      <li>Ball in a pocket you can reach without looking.</li>
      <li>On slide 18, take it out <b>before</b> you speak.</li>
      <li>Hold it at shoulder height. Three seconds of silence.</li>
      <li>Then: "Jill's surgeons removed a clot this size."</li>
      <li>Put it down where everyone can still see it.</li></ul></div>
    <div class="box"><h3>${icon('LuListChecks', INK)} Before you start</h3><ul>
      <li>Presenter View on; clicker tested; water within reach.</li>
      <li>Slides saved in three places; PDF on your phone.</li>
      <li>Your three messages on a card, in case the tech fails.</li>
      <li>Talk to two or three people before you begin.</li>
      <li>Feet planted, one slow breath out, find a friendly face.</li></ul></div>
    <div class="box"><h3>${icon('LuTriangleAlert', INK)} If things go wrong</h3><ul>
      <li><b>Lost your place:</b> read the slide title aloud and carry on.</li>
      <li><b>Running long:</b> skip slides 9, 11, 15, 19 and 22 (saves about 3.5 minutes).</li>
      <li><b>Tech fails:</b> give the three messages and Jill's story from your card.</li>
      <li><b>Rambling question:</b> "Do you mean X or Y?"</li>
      <li><b>Don't know:</b> "I don't want to guess. I'll check and come back to you."</li></ul></div>
  </div></section>`;

// ---------- slides ----------
let firstSec = true;
for (const sl of S.slides) {
  const sec = sectionFor(sl.n);
  if (sec) {
    body += `<div class="sec${firstSec ? ' first' : ''}"><span class="n">${sec.num || (sec.name === 'Opening' ? '00' : 'Q')}</span><div><h2>${sec.name}</h2><div class="note">${sec.note}</div></div>${sec.time ? `<span class="chip">${icon('LuClock', INK, 12)} ${sec.time}</span>` : ''}</div>`;
    firstSec = false;
  }
  const meta = `<div class="meta"><span>Slide ${sl.n}</span>${sl.time ? `<span class="time">${icon('LuClock', INK, 11)} ${sl.time}</span>` : ''}</div>`;
  if (sl.divider) {
    body += `<article class="slide div"><div class="left"><img src="${thumb(sl.n)}" alt="Slide ${sl.n}">${meta}</div>
      <div><div class="say"><ul>${sl.say.map((t) => `<li><span>${t}</span></li>`).join('')}</ul></div></div></article>`;
    continue;
  }
  body += `<article class="slide"><div class="left"><img src="${thumb(sl.n)}" alt="Slide ${sl.n}">${meta}</div>
    <div class="right">
      <div class="head"><span class="num">${pad(sl.n)}</span><h3>${sl.title}</h3>${sl.verbatim ? `<span class="vb">${icon('LuQuote', '#fff', 10)} Word for word</span>` : ''}</div>
      <div class="key"><div class="label">Key point</div><p>${sl.key}</p></div>
      <div class="say${sl.verbatim ? ' vbx' : ''}"><div class="label">Say</div><ul>${sl.say.map((t) => `<li><span>${t}</span></li>`).join('')}</ul></div>
      ${cueHtml(sl.cues)}
      ${sl.next ? `<div class="next">${icon('LuChevronsRight', '#3E5C76')}<span>${sl.next}</span></div>` : ''}
    </div></article>`;
}

// ---------- Q&A ----------
body += `<section class="break"><div class="sec first"><span class="n">?</span><div><h2>Likely questions</h2><div class="note">Answer in under 30 seconds: answer, one fact, stop.</div></div></div>
  <div class="qa">${S.qa.map(([q, a]) => `<div><p class="q">${q}</p><p>${a}</p></div>`).join('')}</div>
  <div class="box r" style="margin-top:4mm"><h3>${icon('LuMessageCircleQuestion')} If the room goes quiet</h3>
  <ul><li>Ask: "Which of these windows do we meet most often in our own practice, and are we timing our assessments around it?"</li><li>Then wait a full five seconds. Silence gives people time to think.</li></ul></div>
</section>`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Speaker script · When the vessel breaks</title><style>${css}</style></head><body>${body}</body></html>`;

(async () => {
  fs.writeFileSync('speaker_script.html', html);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="font-family:Carlito,Calibri,sans-serif;font-size:7.5pt;color:#667285;width:100%;padding:0 16mm;display:flex;justify-content:space-between;"><span>Chapter 5 · When the vessel breaks · Speaker script</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await browser.close();
  console.log('Wrote', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
