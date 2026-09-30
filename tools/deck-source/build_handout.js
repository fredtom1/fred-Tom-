// Two-page A4 handout for the Chapter 5 talk. HTML -> PDF with Playwright/Chromium.
// Usage: node build_handout.js <out.pdf>
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const lu = require('react-icons/lu');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const OUT = process.argv[2] || 'handout.pdf';
const icon = (name, color = '#C1272D', size = 18) => {
  const C = lu[name];
  if (!C) throw new Error('icon ' + name);
  return ReactDOMServer.renderToStaticMarkup(React.createElement(C, { color, size: String(size), strokeWidth: 1.8 }));
};

const css = `
@page { size: A4; margin: 0; }
:root { --ink:#13233A; --slate:#3E5C76; --red:#C1272D; --redd:#8E1B1F; --blush:#F6DCDD; --mist:#EEF2F6; --muted:#667285; --rule:#D5DCE5; }
* { box-sizing: border-box; }
html, body { margin:0; padding:0; background:#fff; }
body { font-family: 'Carlito','Calibri',sans-serif; color: var(--ink); font-size: 9.3pt; line-height: 1.38; }
.page { width:210mm; height:297mm; padding:17mm 18mm 14mm; position:relative; overflow:hidden; page-break-after:always; }
.page:last-child { page-break-after:auto; }
.arc { position:absolute; top:-58mm; right:-52mm; width:120mm; height:120mm; border-radius:50%; background: rgba(193,39,45,.09); }
.arc2 { position:absolute; bottom:-70mm; left:-60mm; width:120mm; height:120mm; border-radius:50%; background: rgba(193,39,45,.06); }
.label { font-size:7.8pt; letter-spacing:.14em; text-transform:uppercase; font-weight:700; color: var(--red); }
h1.title { font-family:'Caladea','Cambria',serif; font-size:24pt; line-height:1.05; margin:3mm 0 2mm; letter-spacing:-.01em; max-width:150mm; }
.sub { color: var(--slate); font-size:10pt; max-width:150mm; }
.big { margin:5mm 0 5mm; background: var(--ink); color:#fff; border-radius:3mm; padding:4mm 6mm; display:grid; grid-template-columns: repeat(3,1fr); gap:5mm; }
.big div { display:flex; gap:3mm; align-items:flex-start; font-weight:700; font-size:10.5pt; line-height:1.3; }
.big b { font-family:'Caladea','Cambria',serif; color:#F08A8E; font-size:18pt; line-height:1; }
.cols { display:grid; grid-template-columns: 1fr 1fr; gap:8mm; }
.sec { display:flex; align-items:baseline; gap:3mm; border-bottom: 0.9pt solid var(--red); padding-bottom:1.2mm; margin: 0 0 3mm; }
.sec .n { font-family:'Caladea','Cambria',serif; font-size:24pt; color: var(--red); line-height:1; font-weight:700; }
.sec h2 { font-family:'Caladea','Cambria',serif; font-size:15pt; margin:0; }
h3 { font-size:10.5pt; margin: 3.2mm 0 1.3mm; display:flex; align-items:center; gap:2mm; }
h3 svg { flex:none; }
p { margin: 0 0 2mm; }
table { width:100%; border-collapse:collapse; font-size:9pt; }
th { text-align:left; font-size:7.8pt; letter-spacing:.08em; text-transform:uppercase; color: var(--muted); font-weight:700; padding:1mm 1.5mm; border-bottom:0.8pt solid var(--rule); }
td { padding:1.1mm 1.5mm; border-bottom:0.5pt solid var(--rule); vertical-align:top; }
td.k { font-weight:700; width:21mm; color: var(--slate); }
.num { text-align:right; font-weight:700; white-space:nowrap; }
tr.hi td { color: var(--redd); font-weight:700; }
ul.ic { list-style:none; padding:0; margin:0; }
ul.ic li { display:flex; gap:2.2mm; align-items:flex-start; margin: 0 0 1.4mm; }
ul.ic li svg { flex:none; margin-top:.4mm; }
.stat { display:flex; gap:3mm; margin:2mm 0; }
.stat div { flex:1; background: var(--mist); border-radius:2mm; padding:2.5mm 3mm; font-size:8.6pt; line-height:1.3; }
.stat div.r { background: var(--blush); color: var(--redd); }
.stat b { display:block; font-family:'Caladea','Cambria',serif; font-size:17pt; line-height:1.1; color: var(--ink); }
.stat div.r b { color: var(--red); }
.steps { display:grid; grid-template-columns: 1fr 1fr; gap:2.5mm 4mm; margin: 1mm 0 2mm; }
.steps div { display:flex; gap:2.5mm; font-size:9pt; line-height:1.3; }
.steps i { font-style:normal; font-family:'Caladea','Cambria',serif; font-weight:700; font-size:16pt; color: rgba(193,39,45,.55); line-height:1; width:8mm; flex:none; }
.note { background: var(--mist); border-radius:2mm; padding:2.5mm 3mm; font-size:8.8pt; margin-top:2mm; }
.dark { background: var(--ink); color:#fff; border-radius:2mm; padding:3mm 3.5mm; font-size:9pt; margin-top:2mm; }
.dark b { color:#F08A8E; }
.win { display:grid; grid-template-columns: repeat(3,1fr); gap:4mm; margin-top:1mm; }
.win div { border-top: 2pt solid var(--ink); padding-top:2mm; font-size:9pt; line-height:1.35; }
.win div.r { border-top-color: var(--red); }
.win strong { display:block; font-size:10.5pt; margin-bottom:.5mm; }
.win em { font-style:normal; color: var(--muted); font-size:8pt; text-transform:uppercase; letter-spacing:.08em; font-weight:700; display:block; margin-bottom:1mm; }
.refs { font-size:7.2pt; color: var(--muted); line-height:1.35; columns:2; column-gap:8mm; margin-top:4mm; }
.refs p { margin:0 0 .8mm; break-inside:avoid; }
.foot { position:absolute; left:18mm; right:18mm; bottom:9mm; border-top:0.8pt solid var(--red); padding-top:1.5mm; display:flex; justify-content:space-between; font-size:7.5pt; color: var(--muted); }
`;

const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Chapter 5 handout</title><style>${css}</style></head><body>
<section class="page">
  <div class="arc"></div>
  <div class="label">Chapter 5 review · Handout</div>
  <h1 class="title">When the vessel breaks</h1>
  <div class="sub"><b>Pathophysiology of non-traumatic intracerebral haemorrhage.</b> Chapter 5, Oxford Textbook of Stroke and Cerebrovascular Disease (ed. Norrving, OUP 2014), by Constanza Rossi and Charlotte Cordonnier. Figures come from the primary studies listed overleaf.</div>
  <div class="big">
    <div><b>1</b><span>The vessel decides where it bleeds.</span></div>
    <div><b>2</b><span>The first hours decide how big it gets.</span></div>
    <div><b>3</b><span>The blood keeps injuring the brain for days.</span></div>
  </div>
  <div class="cols">
    <div>
      <div class="sec"><span class="n">01</span><h2>The vessel</h2></div>
      <p>About 80–85% of ICH is <b>primary</b>: a small vessel weakened by chronic disease ruptures. About 15–20% is <b>secondary</b> to an identifiable lesion or condition.</p>
      <h3>${icon('LuGitCompare')}The two small-vessel diseases</h3>
      <table>
        <tr><th></th><th>Hypertensive</th><th>Amyloid (CAA)</th></tr>
        <tr><td class="k">Vessels</td><td>Deep perforators</td><td>Cortical, leptomeningeal</td></tr>
        <tr><td class="k">Wall</td><td>Lipohyalinosis, fibrinoid necrosis; microaneurysms (debated)</td><td>β-amyloid replaces smooth muscle</td></tr>
        <tr><td class="k">Bleed site</td><td>Putamen, thalamus, pons, cerebellum</td><td>Lobar</td></tr>
        <tr><td class="k">Microbleeds</td><td>Deep</td><td>Strictly lobar</td></tr>
        <tr><td class="k">Patient</td><td>Long-standing hypertension</td><td>Age 55+; APOE ε2/ε4</td></tr>
      </table>
      <h3>${icon('LuChartBar')}Causes in one cohort (SMASH-U, n = 1013)</h3>
      <table>
        <tr class="hi"><td>Hypertension</td><td class="num">35%</td></tr>
        <tr><td>Undetermined</td><td class="num">21%</td></tr>
        <tr class="hi"><td>Amyloid angiopathy</td><td class="num">20%</td></tr>
        <tr><td>Anticoagulants (largest bleeds; 54% dead by 3 months)</td><td class="num">14%</td></tr>
        <tr><td>Structural lesion (AVM, cavernoma)</td><td class="num">5%</td></tr>
        <tr><td>Systemic disease (cirrhosis, low platelets)</td><td class="num">5%</td></tr>
      </table>
      <p style="margin-top:2.5mm"><b>Microbleeds</b> (tiny old leaks, black dots on blood-sensitive MRI) appear in 5% of healthy adults, 34% after ischaemic stroke and 60% of people with ICH.</p>
      <div class="dark" style="margin-top:3mm"><b>The patient in the talk.</b> Jill Bolte Taylor was 37 and normotensive when an AVM in her left hemisphere ruptured on 10 December 1996. It was a textbook secondary ICH.</div>
    </div>
    <div>
      <h3 style="margin-top:0">${icon('LuSearch')}Secondary causes: always ask</h3>
      <ul class="ic">
        <li>${icon('LuWaypoints', '#13233A', 15)}<span><b>Vascular malformations:</b> AVM, cavernoma, dural fistula, aneurysm. Commonest in younger patients.</span></li>
        <li>${icon('LuPill', '#13233A', 15)}<span><b>Antithrombotic drugs:</b> make bleeds larger and keep them growing for longer.</span></li>
        <li>${icon('LuCircleDot', '#13233A', 15)}<span><b>Tumours:</b> primary or metastatic; fragile new vessels.</span></li>
        <li>${icon('LuWaves', '#13233A', 15)}<span><b>Cerebral venous thrombosis:</b> blocked drainage raises venous pressure.</span></li>
        <li>${icon('LuRefreshCw', '#13233A', 15)}<span><b>Haemorrhagic transformation</b> of an infarct.</span></li>
        <li>${icon('LuSyringe', '#13233A', 15)}<span><b>Others:</b> cocaine, amphetamines, vasculitis, RCVS, moyamoya, coagulopathy.</span></li>
      </ul>
      <h3>${icon('LuTriangleAlert')}Red flags for a hidden lesion</h3>
      <ul class="ic">
        <li>${icon('LuCheck', '#C1272D', 14)}<span>Aged 45 or under, or no history of hypertension</span></li>
        <li>${icon('LuCheck', '#C1272D', 14)}<span>Lobar bleed, or blood only in the ventricles</span></li>
        <li>${icon('LuCheck', '#C1272D', 14)}<span>CT clues: subarachnoid blood, calcification, abnormal vessels</span></li>
        <li>${icon('LuCheck', '#C1272D', 14)}<span>A bleed next to a venous sinus, or a dense sinus</span></li>
        <li>${icon('LuCheck', '#C1272D', 14)}<span>On anticoagulants: check clotting at once</span></li>
      </ul>
      <div class="stat">
        <div class="r"><b>65%</b>had a lesion on angiography: aged 45 or under, normotensive, lobar bleed</div>
        <div><b>0%</b>had one: over 45, hypertensive, deep bleed</div>
      </div>
      <h3>${icon('LuClipboardList')}Modified Boston criteria for CAA</h3>
      <table>
        <tr><td class="k">Definite</td><td>Full post-mortem shows severe CAA with a lobar bleed.</td></tr>
        <tr><td class="k">Probable</td><td>Age 55+; multiple lobar or cortical bleeds (or one plus cortical superficial siderosis); no other cause.</td></tr>
        <tr><td class="k">Possible</td><td>Age 55+; a single lobar bleed or siderosis; no other cause.</td></tr>
      </table>
    </div>
  </div>
  <div class="foot"><span>Chapter 5 · When the vessel breaks</span><span>1 / 2</span></div>
</section>

<section class="page">
  <div class="arc2"></div>
  <div class="cols">
    <div>
      <div class="sec"><span class="n">02</span><h2>The first hours</h2></div>
      <div class="steps">
        <div><i>01</i><span><b>Rupture.</b> A diseased small artery gives way under arterial pressure.</span></div>
        <div><i>02</i><span><b>Haematoma.</b> Blood splits the tissue planes.</span></div>
        <div><i>03</i><span><b>Avalanche.</b> The growing clot tears vessels at its edge (Fisher, 1971).</span></div>
        <div><i>04</i><span><b>Tamponade.</b> Tissue pressure and clotting stop the bleed.</span></div>
      </div>
      <div class="stat">
        <div class="r"><b>38 in 100</b>grew by over a third within 20 h (26 within the first hour)</div>
        <div><b>+5%</b>hazard of death for every 10% of growth</div>
      </div>
      <h3>${icon('LuTimer')}Higher risk of growth</h3>
      <p>Early presentation, a large baseline bleed, anticoagulant use and a <b>spot sign</b> (contrast leaking into the clot on CT angiography).</p>
      <h3>${icon('LuCircle')}Size in context</h3>
      <p>A golf ball holds about 40 mL. Volume of 60 mL or more with a GCS of 8 or less predicted 91% mortality at 30 days. A clot that grows by a third is only about 10% wider on a scan, so growth is easy to miss by eye.</p>
      <div class="stat">
        <div><b>≈45%</b>extend into the ventricles: hydrocephalus risk and a worse outcome</div>
        <div class="r"><b>40%</b>median case fatality at 1 month, unchanged 1980–2008</div>
      </div>
    </div>
    <div>
      <div class="sec"><span class="n">03</span><h2>The days after</h2></div>
      <table>
        <tr><th>When</th><th>What drives the oedema</th></tr>
        <tr><td class="k">Hours</td><td>Clot retraction squeezes serum into the tissue</td></tr>
        <tr><td class="k">Days 1–2</td><td>The coagulation cascade makes thrombin, which opens the blood–brain barrier</td></tr>
        <tr><td class="k">Day 3+</td><td>Red cells lyse; haemoglobin, haem and iron drive oxidative injury</td></tr>
        <tr><td class="k">Weeks</td><td>Macrophages clear the clot; a cavity and haemosiderin remain</td></tr>
      </table>
      <p style="margin-top:2mm">Oedema grew by about 75% in the first 24 hours in one study, and it can keep building into the second week.</p>
      <h3>${icon('LuFlame')}Three toxins, one result</h3>
      <ul class="ic">
        <li>${icon('LuFlaskConical', '#13233A', 15)}<span><b>Thrombin:</b> needed to stop the bleed, toxic at high levels.</span></li>
        <li>${icon('LuAtom', '#13233A', 15)}<span><b>Iron:</b> released from lysed red cells; fuels free radicals.</span></li>
        <li>${icon('LuFlame', '#13233A', 15)}<span><b>Inflammation:</b> microglia within hours, then neutrophils, macrophages, cytokines and MMP-9.</span></li>
      </ul>
      <p>All three lead to a leaky barrier, more oedema and neuronal death. Most of this evidence comes from animal models.</p>
      <div class="note"><b>Myth: the rim around the clot is starving tissue.</b> PET at 5–22 h showed blood flow at 56% of the other side, but oxygen use at 48%. The tissue is resting, not starving. In ICH ADAPT, lowering systolic pressure below 150 mmHg did not reduce flow around the clot.</div>
    </div>
  </div>
  <div class="sec" style="margin-top:6mm"><span class="n">04</span><h2>At the bedside: every stage is a window</h2></div>
  <div class="win">
    <div><em>Before and after</em><strong>The vessel</strong>Control blood pressure; it is the strongest tool against a first or second bleed. Review antithrombotics. Older adult with a lobar bleed: think CAA.</div>
    <div class="r"><em>First 24 hours</em><strong>The first hours</strong>Image fast, lower blood pressure early and reverse anticoagulants urgently. Keep neuro observations close; a falling GCS needs action now.</div>
    <div><em>Days to weeks</em><strong>The days after</strong>Expect fluctuation as oedema peaks. New drowsiness, headache, vomiting or a new deficit: stop and escalate. Reassess before every session and pace therapy.</div>
  </div>
  <div class="refs">
    <p>Rossi C, Cordonnier C. Pathophysiology of non-traumatic intracerebral haemorrhage. In: Norrving B, ed. Oxford Textbook of Stroke and Cerebrovascular Disease. OUP; 2014: ch. 5.</p>
    <p>Taylor JB. My stroke of insight. TED 2008.</p>
    <p>van Asch CJ, et al. Lancet Neurol 2010;9:167–176.</p>
    <p>Macellari F, et al. Stroke 2014;45:903–908.</p>
    <p>Meretoja A, et al. Stroke 2012;43:2592–2597.</p>
    <p>Cordonnier C, et al. Brain 2007;130:1988–2003.</p>
    <p>Knudsen KA, et al. Neurology 2001;56:537–539.</p>
    <p>Linn J, et al. Neurology 2010;74:1346–1350.</p>
    <p>Zhu XL, et al. Stroke 1997;28:1406–1409.</p>
    <p>Fisher CM. J Neuropathol Exp Neurol 1971;30:536–550.</p>
    <p>Brott T, et al. Stroke 1997;28:1–5.</p>
    <p>Davis SM, et al. Neurology 2006;66:1175–1181.</p>
    <p>Demchuk AM, et al. Lancet Neurol 2012;11:307–314.</p>
    <p>Broderick JP, et al. Stroke 1993;24:987–993.</p>
    <p>Hanley DF. Stroke 2009;40:1533–1538.</p>
    <p>Gebel JM, et al. Stroke 2002;33:2631–2635.</p>
    <p>Xi G, Keep RF, Hoff JT. Lancet Neurol 2006;5:53–63.</p>
    <p>Zazulia AR, et al. J Cereb Blood Flow Metab 2001;21:804–810.</p>
    <p>Butcher KS, et al. Stroke 2013;44:620–626.</p>
  </div>
  <div class="foot"><span>Chapter 5 · When the vessel breaks</span><span>2 / 2</span></div>
</section>
</body></html>`;

(async () => {
  fs.writeFileSync(path.join(path.dirname(path.resolve(OUT)), 'handout.html'), html);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.setViewportSize({ width: 794, height: 1123 });
  const n = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p) => { const top = p.getBoundingClientRect().top; const foot = p.querySelector('.foot').getBoundingClientRect().top - top; let max = 0; p.querySelectorAll('.cols > div > *, .win, .refs, .big, .sec').forEach((el) => { max = Math.max(max, el.getBoundingClientRect().bottom - top); }); return Math.round(foot - max); }));
  console.log('Wrote', OUT, 'px of space above footer per page:', n.join(','));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
