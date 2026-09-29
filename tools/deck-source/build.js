// Builds "When the vessel breaks" — Chapter 5 review deck (Oxford Textbook of Stroke, 2014).
// Usage: node build.js <output.pptx>
const pptxgen = require('pptxgenjs');
const JSZip = require('jszip');
const fs = require('fs');
const { iconPng, brainSVG, svgToPng, lobarDots, deepDots } = require('./assets');
const NOTES = require('./notes');

const OUT = process.argv[2] || 'deck.pptx';

// ---------- design tokens ----------
const C = {
  INK: '13233A', SLATE: '3E5C76', MIST: 'E8EDF3', MIST2: 'F3F5F8', WALL: 'C3CEDB',
  RED: 'C1272D', RED_D: '8E1B1F', RED_L: 'E88A8E', RED_B: 'E0474C', BLUSH: 'F6DCDD',
  TEXT: '1B2230', MUTED: '667285', GRID: 'C9D2DE', WHITE: 'FFFFFF',
  ON_DARK: 'C9D3E0', ON_DARK_MUTED: '93A6BC', RED_ON_DARK: 'F08A8E', INK_2: '1E3350',
};
const FH = 'Cambria', FB = 'Calibri';
const W = 13.333, MX = 0.6, CW = W - 2 * MX; // content width 12.133

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.author = 'Chapter 5 presenter';
pres.title = 'When the vessel breaks: pathophysiology of non-traumatic intracerebral haemorrhage';
pres.theme = { headFontFace: FH, bodyFontFace: FB };

let I = {}; // icons
let IMG = {}; // illustrations
let slideNo = 0;

// ---------- helpers ----------
function T(s, text, o) { s.addText(text, Object.assign({ fontFace: FB, color: C.TEXT, margin: 0, isTextBox: true, valign: 'top' }, o)); }
function kicker(s, text, color = C.RED) {
  T(s, text.toUpperCase(), { x: MX, y: 0.48, w: CW, h: 0.3, fontSize: 12, bold: true, color, charSpacing: 3, valign: 'middle' });
}
function title(s, text, o = {}) {
  T(s, text, Object.assign({ x: MX, y: 0.82, w: CW, h: 1.2, fontFace: FH, fontSize: 36, bold: true, color: C.INK }, o));
}
function source(s, text) {
  T(s, text, { x: MX, y: 6.5, w: CW, h: 0.3, fontSize: 10, italic: true, color: C.MUTED, valign: 'middle' });
}
function footer(s, sec) {
  T(s, 'Chapter 5  ·  Pathophysiology of non-traumatic ICH', { x: MX, y: 6.98, w: 5.5, h: 0.3, fontSize: 10, color: C.MUTED, valign: 'middle' });
  ['Vessel', 'Hours', 'Days', 'Bedside'].forEach((l, i) => {
    const x = 8.05 + i * 1.0, on = i + 1 === sec;
    s.addShape(pres.shapes.OVAL, { x, y: 7.065, w: 0.13, h: 0.13, fill: { color: on ? C.RED : C.GRID }, line: { color: on ? C.RED : C.GRID, width: 0.5 } });
    T(s, l, { x: x + 0.2, y: 6.98, w: 0.75, h: 0.3, fontSize: 10, bold: on, color: on ? C.RED : C.MUTED, valign: 'middle' });
  });
  T(s, String(slideNo), { x: 12.23, y: 6.98, w: 0.5, h: 0.3, fontSize: 10, color: C.MUTED, align: 'right', valign: 'middle' });
}
function circle(s, x, y, d, color, o = {}) {
  s.addShape(pres.shapes.OVAL, Object.assign({ x, y, w: d, h: d, fill: { color }, line: { color, width: 0.5 } }, o));
}
function ring(s, x, y, d, color, width = 1, dash) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: 'FFFFFF', transparency: 100 }, line: { color, width, dashType: dash || 'solid' } });
}
function iconCircle(s, icon, x, y, d, fill = C.INK) {
  circle(s, x, y, d, fill);
  const p = d * 0.25;
  s.addImage({ data: I[icon], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
function badge(s, n, x, y, d = 0.5, fill = C.RED, fs = 16) {
  circle(s, x, y, d, fill);
  T(s, String(n), { x, y, w: d, h: d, fontSize: fs, bold: true, color: C.WHITE, align: 'center', valign: 'middle' });
}
function card(s, x, y, w, h, fill = C.MIST2, shadow = false) {
  const o = { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0.5 }, rectRadius: 0.1 };
  if (shadow) o.shadow = { type: 'outer', blur: 8, offset: 2, angle: 90, color: '000000', opacity: 0.1 };
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, o);
}
function pill(s, text, x, y, w, h = 0.38, fill = C.BLUSH, color = C.RED_D, fs = 12) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0.5 }, rectRadius: h / 2 });
  T(s, text, { x, y, w, h, fontSize: fs, bold: true, color, align: 'center', valign: 'middle' });
}
function line(s, x1, y1, x2, y2, color = C.GRID, width = 1.5, arrow = false, dash) {
  const o = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color, width } };
  if (x2 < x1) o.flipH = true;
  if (y2 < y1) o.flipV = true;
  if (arrow) o.line.endArrowType = 'triangle';
  if (dash) o.line.dashType = dash;
  s.addShape(pres.shapes.LINE, o);
}
const sections = new Set();
function newSlide(section, bg = C.WHITE) {
  slideNo += 1;
  if (!sections.has(section)) { pres.addSection({ title: section }); sections.add(section); }
  const s = pres.addSlide({ sectionTitle: section });
  s.background = { color: bg };
  s.addNotes(NOTES[slideNo]);
  return s;
}
// the haematoma motif (core + oedema halos) used on dark slides
function motif(s, cx, cy, core, halos, name) {
  ring(s, cx - 3.0, cy - 3.0, 6.0, C.SLATE, 1);
  halos.forEach(([d, t]) => circle(s, cx - d / 2, cy - d / 2, d, C.RED, { fill: { color: C.RED, transparency: t }, line: { color: C.RED, transparency: 100, width: 0.5 } }));
  circle(s, cx - core / 2, cy - core / 2, core, C.RED, { objectName: name });
}

// ---------- slides ----------
function sTitle() {
  const s = newSlide('Opening', C.INK);
  motif(s, 10.2, 3.75, 2.9, [[5.1, 90], [4.0, 78]], '!!bleed');
  T(s, 'CHAPTER 5 REVIEW', { x: 0.8, y: 1.45, w: 6.0, h: 0.35, fontSize: 13, bold: true, color: C.RED_ON_DARK, charSpacing: 4, valign: 'middle' });
  T(s, 'When the vessel breaks', { x: 0.8, y: 1.9, w: 6.2, h: 1.9, fontFace: FH, fontSize: 54, bold: true, color: C.WHITE, valign: 'top' });
  T(s, 'Pathophysiology of non-traumatic intracerebral haemorrhage', { x: 0.8, y: 3.85, w: 6.0, h: 0.9, fontSize: 22, color: C.ON_DARK });
  T(s, [
    { text: 'Oxford Textbook of Stroke and Cerebrovascular Disease', options: { bold: true, color: C.WHITE, breakLine: true } },
    { text: 'Edited by Bo Norrving  ·  Oxford University Press, 2014', options: { breakLine: true } },
    { text: 'Chapter authors: Constanza Rossi & Charlotte Cordonnier' },
  ], { x: 0.8, y: 5.05, w: 6.2, h: 1.0, fontSize: 14, color: C.ON_DARK_MUTED, paraSpaceAfter: 3 });
  T(s, 'Chapter review  ·  Sunday 4 October 2026', { x: 0.8, y: 6.55, w: 6.0, h: 0.3, fontSize: 12, color: C.ON_DARK_MUTED, valign: 'middle' });
}

function sStats() {
  const s = newSlide('Opening');
  kicker(s, 'Why it matters');
  title(s, 'The deadliest type of stroke, and outcomes have not improved');
  const stats = [
    ['FaBrain', '10–20%', 'of all strokes are intracerebral haemorrhages'],
    ['FaHeartCrack', '40%', 'die within one month (median case fatality)'],
    ['FaPersonWalking', '12–39%', 'regain independence in the long term'],
  ];
  const w = (CW - 0.6) / 3;
  stats.forEach(([ic, num, lab], i) => {
    const x = MX + i * (w + 0.3), y = 2.3;
    card(s, x, y, w, 2.95);
    iconCircle(s, ic, x + 0.35, y + 0.35, 0.62, i === 1 ? C.RED : C.INK);
    T(s, num, { x: x + 0.35, y: y + 1.1, w: w - 0.7, h: 1.0, fontSize: 60, bold: true, color: i === 1 ? C.RED : C.INK, valign: 'middle' });
    T(s, lab, { x: x + 0.35, y: y + 2.12, w: w - 0.7, h: 0.7, fontSize: 16, color: C.TEXT });
  });
  card(s, MX, 5.5, CW, 0.72, C.BLUSH);
  T(s, [
    { text: 'Case fatality did not fall between 1980 and 2008, ' },
    { text: 'while care for ischaemic stroke moved forward.', options: { bold: true } },
  ], { x: MX + 0.35, y: 5.5, w: CW - 0.7, h: 0.72, fontSize: 17, color: C.RED_D, valign: 'middle' });
  source(s, 'Sources: van Asch et al., Lancet Neurol 2010 (36 population-based studies, 8145 patients); Macellari et al., Stroke 2014.');
  footer(s, 0);
}

function sBigIdea() {
  const s = newSlide('Opening');
  kicker(s, 'The big idea');
  title(s, 'ICH is a process, not a moment');
  T(s, 'Three mechanisms unfold on three timescales, and each one gives us a chance to act.', { x: MX, y: 1.5, w: CW, h: 0.45, fontSize: 19, color: C.SLATE });
  const steps = [
    { d: 0.8, fill: C.RED, n: '01', t: 'The broken vessel', x: 'Why a small artery gives way, and what else can bleed' },
    { d: 1.05, fill: C.RED, n: '02', t: 'The first hours', x: 'Rupture, growth and rising pressure' },
    { d: 1.3, fill: C.RED, n: '03', t: 'The days after', x: 'How the blood itself injures the brain', halo: 1.8 },
    { d: 1.05, fill: C.INK, n: '', icon: 'FaUserDoctor', t: 'At the bedside', x: 'What this means for our patients' },
  ];
  const colW = 2.83, gap = 0.27, cy = 3.7;
  const cxs = steps.map((st, i) => MX + i * (colW + gap) + st.d / 2);
  line(s, cxs[0], cy, cxs[3], cy, C.GRID, 2.5);
  steps.forEach((st, i) => {
    const x = MX + i * (colW + gap);
    if (st.halo) circle(s, x + st.d / 2 - st.halo / 2, cy - st.halo / 2, st.halo, C.RED, { fill: { color: C.RED, transparency: 82 }, line: { color: C.RED, transparency: 100, width: 0.5 } });
    if (st.icon) iconCircle(s, st.icon, x, cy - st.d / 2, st.d, st.fill);
    else badge(s, st.n, x, cy - st.d / 2, st.d, st.fill, 16 + i * 3);
    T(s, st.t, { x, y: 4.8, w: colW, h: 0.45, fontSize: 20, bold: true, color: C.INK });
    T(s, st.x, { x, y: 5.3, w: colW - 0.1, h: 0.8, fontSize: 15, color: C.TEXT });
  });
  footer(s, 0);
}

function sDivider(sec, num, name, sub, core, halos) {
  const s = newSlide(`${num} · ${name}`, C.INK);
  motif(s, 10.2, 3.75, core, halos, '!!bleed');
  T(s, num, { x: 0.8, y: 1.55, w: 3, h: 1.5, fontFace: FH, fontSize: 96, bold: true, color: C.RED_B, valign: 'bottom' });
  T(s, name, { x: 0.8, y: 3.2, w: 6.5, h: 0.95, fontFace: FH, fontSize: 48, bold: true, color: C.WHITE, valign: 'middle' });
  T(s, sub, { x: 0.8, y: 4.25, w: 6.0, h: 0.9, fontSize: 22, color: C.ON_DARK });
  return s;
}

function sDefinition() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Non-traumatic ICH has two faces: primary and secondary');
  iconCircle(s, 'FaDroplet', MX, 2.3, 0.55, C.RED);
  T(s, [
    { text: 'Definition: ', options: { bold: true, color: C.INK } },
    { text: 'bleeding directly into brain tissue without trauma. Blood may spread into the ventricles or subarachnoid space.' },
  ], { x: MX + 0.75, y: 2.3, w: CW - 0.75, h: 0.55, fontSize: 16, valign: 'middle' });

  const cw = (CW - 0.3) / 2, y = 3.15, h = 3.15;
  // primary
  card(s, MX, y, cw, h, C.MIST);
  T(s, '≈80–85%', { x: MX + 0.35, y: y + 0.25, w: 2.6, h: 0.7, fontSize: 40, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'Primary ICH', { x: MX + 3.0, y: y + 0.3, w: cw - 3.3, h: 0.35, fontSize: 20, bold: true, color: C.INK });
  T(s, 'A small vessel weakened by chronic disease ruptures', { x: MX + 3.0, y: y + 0.66, w: cw - 3.3, h: 0.6, fontSize: 14, color: C.SLATE });
  const prim = [['Hypertensive arteriopathy', 'deep perforating arteries'], ['Cerebral amyloid angiopathy', 'cortical and leptomeningeal arteries']];
  prim.forEach(([a, b], i) => {
    const yy = y + 1.35 + i * 0.85;
    badge(s, i + 1, MX + 0.35, yy + 0.04, 0.5, C.INK, 16);
    T(s, [{ text: a, options: { bold: true, breakLine: true } }, { text: b, options: { color: C.SLATE } }], { x: MX + 1.05, y: yy - 0.02, w: cw - 1.4, h: 0.7, fontSize: 16 });
  });
  // secondary
  const x2 = MX + cw + 0.3;
  card(s, x2, y, cw, h, C.MIST2);
  T(s, '≈15–20%', { x: x2 + 0.35, y: y + 0.25, w: 2.6, h: 0.7, fontSize: 40, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'Secondary ICH', { x: x2 + 3.0, y: y + 0.3, w: cw - 3.3, h: 0.35, fontSize: 20, bold: true, color: C.INK });
  T(s, 'An identifiable lesion or condition causes the bleed', { x: x2 + 3.0, y: y + 0.66, w: cw - 3.3, h: 0.6, fontSize: 14, color: C.SLATE });
  const chips = ['Vascular malformations', 'Aneurysms', 'Tumours', 'Anticoagulants', 'Coagulopathy', 'Venous thrombosis', 'Haemorrhagic transformation', 'Cocaine & amphetamines'];
  let cx = x2 + 0.35, cyy = y + 1.4;
  chips.forEach((c) => {
    const w = 0.3 + c.length * 0.083;
    if (cx + w > x2 + cw - 0.3) { cx = x2 + 0.35; cyy += 0.52; }
    pill(s, c, cx, cyy, w, 0.4, C.WHITE, C.INK, 13);
    cx += w + 0.14;
  });
  source(s, 'Proportions: Macellari et al., Stroke 2014.');
  footer(s, 1);
}

function sSmashU() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Two small-vessel diseases cause over half of all ICH');
  const labels = ['Hypertension (H)   35%', 'Undetermined (U)   21%', 'Amyloid angiopathy (A)   20%', 'Medication (M)   14%', 'Structural lesion (S)   5%', 'Systemic disease (S)   5%'];
  const svd = [35, 0, 20, 0, 0, 0], other = [0, 21, 0, 14, 5, 5];
  s.addChart(pres.charts.BAR, [
    { name: 'Small-vessel disease', labels, values: svd },
    { name: 'Other causes', labels, values: other },
  ], {
    x: MX, y: 2.25, w: 7.7, h: 4.1, barDir: 'bar', barGrouping: 'stacked', barGapWidthPct: 45,
    chartColors: [C.RED, 'AEB9C7'], catAxisOrientation: 'maxMin', catAxisLabelFontFace: FB, catAxisLabelFontSize: 15,
    catAxisLabelColor: C.TEXT, catAxisLineShow: false, valAxisHidden: true, valAxisMaxVal: 40, valAxisMinVal: 0,
    valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, showValue: false,
  });
  const x = 8.75, w = W - MX - x;
  card(s, x, 2.3, w, 1.9, C.BLUSH);
  T(s, '55%', { x: x + 0.35, y: 2.42, w: w - 0.7, h: 0.85, fontSize: 48, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'hypertensive or amyloid angiopathy: the two small-vessel diseases', { x: x + 0.35, y: 3.27, w: w - 0.7, h: 0.8, fontSize: 15, color: C.RED_D });
  card(s, x, 4.45, w, 1.9, C.MIST2);
  T(s, '54%', { x: x + 0.35, y: 4.57, w: w - 0.7, h: 0.85, fontSize: 48, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'of anticoagulant-related bleeds were fatal by 3 months, the worst of any group', { x: x + 0.35, y: 5.42, w: w - 0.7, h: 0.8, fontSize: 15, color: C.TEXT });
  source(s, 'SMASH-U classification: Meretoja et al., Stroke 2012 (n = 1013, Helsinki). S = structural, M = medication, A = amyloid, S = systemic, H = hypertension, U = undetermined.');
  footer(s, 1);
}

function vessel(s, cx, cy, kind) {
  const D = 1.75, r = D / 2;
  if (kind === 'htn') {
    // microaneurysm bulge on the wall
    const a = -Math.PI / 4, br = 0.62;
    const bx = cx + (r + 0.05) * Math.cos(a), by = cy + (r + 0.05) * Math.sin(a);
    circle(s, bx - br / 2, by - br / 2, br, C.WALL);
    circle(s, bx - 0.2, by - 0.2, 0.4, C.RED);
  }
  circle(s, cx - r, cy - r, D, C.WALL);
  if (kind === 'normal') circle(s, cx - 0.68, cy - 0.68, 1.36, C.RED);
  if (kind === 'htn') {
    s.addShape(pres.shapes.OVAL, { x: cx - 0.74, y: cy - 0.74, w: 1.48, h: 1.48, fill: { color: 'F1F3F6' }, line: { color: 'AEB9C7', width: 1, dashType: 'dash' } });
    circle(s, cx - 0.27, cy - 0.27, 0.54, C.RED);
    // join the aneurysm lumen to the wall visually
    const a = -Math.PI / 4;
    const bx = cx + (r + 0.05) * Math.cos(a), by = cy + (r + 0.05) * Math.sin(a);
    circle(s, bx - 0.2, by - 0.2, 0.4, C.RED);
  }
  if (kind === 'caa') {
    circle(s, cx - 0.6, cy - 0.6, 1.2, C.RED);
    const n = 18;
    for (let k = 0; k < n; k++) {
      const t = (k / n) * Math.PI * 2 + 0.2;
      const rr = k % 2 ? 0.7 : 0.78, d = k % 3 ? 0.12 : 0.15;
      circle(s, cx + rr * Math.cos(t) - d / 2, cy + rr * Math.sin(t) - d / 2, d, C.INK);
    }
  }
}

function sVessels() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Two diseases weaken two different sets of vessels');
  const cols = [
    { k: 'normal', h: 'Healthy small artery', lines: ['Thin, elastic wall', 'Wide lumen', 'Smooth muscle buffers the pressure'] },
    { k: 'htn', h: 'Hypertensive arteriopathy', lines: ['Deep perforating arteries', 'Lipohyalinosis and fibrinoid necrosis: a thick, brittle wall', 'Charcot–Bouchard microaneurysms (role debated)'] },
    { k: 'caa', h: 'Cerebral amyloid angiopathy', lines: ['Cortical and leptomeningeal arteries', 'β-amyloid (dark dots) replaces smooth muscle', 'Mostly after 55; causes lobar bleeds'] },
  ];
  const w = (CW - 0.6) / 3;
  cols.forEach((c, i) => {
    const x = MX + i * (w + 0.3), y = 2.25;
    card(s, x, y, w, 4.1, i === 0 ? C.MIST2 : C.MIST);
    vessel(s, x + w / 2, y + 1.0, c.k);
    T(s, c.h, { x: x + 0.3, y: y + 1.98, w: w - 0.6, h: 0.4, fontSize: 18, bold: true, color: i === 0 ? C.SLATE : C.INK });
    let yy = y + 2.48;
    c.lines.forEach((l) => {
      const lines = Math.ceil(l.length / 37), h = lines * 0.25;
      circle(s, x + 0.32, yy + 0.09, 0.1, i === 0 ? C.GRID : C.RED);
      T(s, l, { x: x + 0.55, y: yy, w: w - 0.8, h: h + 0.02, fontSize: 14 });
      yy += h + 0.12;
    });
  });
  footer(s, 1);
}

function sBrainMap() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Location is the first clue to the cause');
  const ix = 0.75, iy = 2.2, ih = 4.25, sc = ih / 700;
  s.addImage({ data: IMG.map, x: ix, y: iy, w: 600 * sc, h: ih });
  const P = (px, py) => [ix + px * sc, iy + py * sc];
  const marks = [[1, 150, 395, C.INK], [2, 372, 470, C.INK], [3, 505, 150, C.RED]];
  marks.forEach(([n, px, py, col]) => { const [x, y] = P(px, py); circle(s, x - 0.24, y - 0.24, 0.48, C.WHITE); badge(s, n, x - 0.2, y - 0.2, 0.4, col, 14); });

  const x = 5.0, w = W - MX - x;
  card(s, x, 2.3, w, 1.95, C.MIST);
  badge(s, 1, x + 0.35, 2.52, 0.42, C.INK, 14); badge(s, 2, x + 0.85, 2.52, 0.42, C.INK, 14);
  T(s, 'Deep', { x: x + 1.45, y: 2.47, w: 1.2, h: 0.5, fontSize: 22, bold: true, color: C.INK, valign: 'middle' });
  pill(s, 'Hypertensive arteriopathy', x + 2.6, 2.53, 3.2, 0.4, C.INK, C.WHITE, 13);
  T(s, [
    { text: 'Putamen (1), thalamus (2), pons and cerebellum.', options: { bold: true, breakLine: true } },
    { text: 'Perforating arteries leave large trunks at right angles, so they take the full force of arterial pressure.' },
  ], { x: x + 0.35, y: 3.1, w: w - 0.7, h: 1.05, fontSize: 15, paraSpaceAfter: 4 });

  card(s, x, 4.45, w, 1.95, C.BLUSH);
  badge(s, 3, x + 0.35, 4.67, 0.42, C.RED, 14);
  T(s, 'Lobar', { x: x + 0.95, y: 4.62, w: 1.3, h: 0.5, fontSize: 22, bold: true, color: C.RED_D, valign: 'middle' });
  pill(s, 'Amyloid angiopathy (older adults)', x + 2.2, 4.68, 3.75, 0.4, C.RED, C.WHITE, 13);
  T(s, [
    { text: 'Cortex and the white matter just beneath it.', options: { bold: true, breakLine: true } },
    { text: 'Younger, normotensive or atypical? Look for an AVM, a tumour or venous thrombosis.' },
  ], { x: x + 0.35, y: 5.25, w: w - 0.7, h: 1.05, fontSize: 15, color: C.TEXT, paraSpaceAfter: 4 });
  source(s, 'Schematic axial section; the posterior fossa (pons, cerebellum) is not shown.');
  footer(s, 1);
}

function sMicrobleeds() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Microbleeds map the disease behind the bleed');
  const bw = 2.45, bh = bw * 700 / 600;
  s.addImage({ data: IMG.lobar, x: 0.7, y: 2.2, w: bw, h: bh });
  s.addImage({ data: IMG.deep, x: 3.55, y: 2.2, w: bw, h: bh });
  T(s, [{ text: 'Strictly lobar', options: { bold: true, breakLine: true, color: C.INK } }, { text: 'points to amyloid angiopathy', options: { color: C.SLATE } }], { x: 0.8, y: 5.1, w: 2.5, h: 0.6, fontSize: 14 });
  T(s, [{ text: 'Deep', options: { bold: true, breakLine: true, color: C.INK } }, { text: 'points to hypertensive disease', options: { color: C.SLATE } }], { x: 3.65, y: 5.1, w: 2.5, h: 0.6, fontSize: 14 });
  T(s, [
    { text: 'Seen in ' }, { text: '5%', options: { bold: true, color: C.RED } }, { text: ' of healthy adults, ' },
    { text: '34%', options: { bold: true, color: C.RED } }, { text: ' after ischaemic stroke and ' },
    { text: '60%', options: { bold: true, color: C.RED } }, { text: ' after ICH.' },
  ], { x: 0.8, y: 5.8, w: 5.3, h: 0.55, fontSize: 14 });

  const x = 6.5, w = W - MX - x;
  card(s, x, 2.25, w, 4.1, C.MIST);
  T(s, 'Modified Boston criteria: diagnosing CAA in life', { x: x + 0.35, y: 2.45, w: w - 0.7, h: 0.4, fontSize: 18, bold: true, color: C.INK });
  const tiers = [
    ['Definite', 'Full post-mortem shows severe CAA with a lobar bleed.'],
    ['Probable', 'Age ≥ 55; multiple lobar or cortical bleeds, or one plus cortical superficial siderosis; no other cause.'],
    ['Possible', 'Age ≥ 55; a single lobar bleed or siderosis; no other cause.'],
  ];
  tiers.forEach(([a, b], i) => {
    const yy = 3.05 + i * 0.95;
    pill(s, a, x + 0.35, yy, 1.35, 0.38, i === 1 ? C.RED : C.WHITE, i === 1 ? C.WHITE : C.INK, 13);
    T(s, b, { x: x + 1.9, y: yy - 0.02, w: w - 2.25, h: 0.85, fontSize: 14 });
  });
  iconCircle(s, 'FaDna', x + 0.35, 5.83, 0.42, C.SLATE);
  T(s, 'APOE ε2 and ε4 raise the risk of amyloid-related bleeding.', { x: x + 0.95, y: 5.8, w: w - 1.3, h: 0.48, fontSize: 14, color: C.SLATE, valign: 'middle' });
  source(s, 'Cordonnier et al., Brain 2007 (systematic review); Knudsen et al., Neurology 2001; Linn et al., Neurology 2010.');
  footer(s, 1);
}

function sSecondary() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Always ask: is something else causing this bleed?');
  const items = [
    ['FaCodeBranch', 'Vascular malformations', 'AVM, cavernoma, dural fistula or aneurysm. Commonest in the young.'],
    ['FaPills', 'Antithrombotic drugs', 'Anticoagulants make bleeds larger and keep them growing for longer.'],
    ['FaDisease', 'Tumours', 'Primary or metastatic. Fragile new tumour vessels bleed easily.'],
    ['FaWater', 'Venous thrombosis', 'Blocked drainage raises venous pressure until the tissue bleeds.'],
    ['FaRotate', 'Haemorrhagic transformation', 'An infarct turns into a bleed, sometimes after reperfusion.'],
    ['FaSyringe', 'Other causes', 'Cocaine, amphetamines, vasculitis, RCVS, moyamoya, coagulopathy.'],
  ];
  const w = (CW - 0.6) / 3, h = 1.95;
  items.forEach(([ic, hd, tx], i) => {
    const x = MX + (i % 3) * (w + 0.3), y = 2.3 + Math.floor(i / 3) * (h + 0.2);
    card(s, x, y, w, h, C.MIST2);
    iconCircle(s, ic, x + 0.3, y + 0.28, 0.55, i === 1 ? C.RED : C.INK);
    T(s, hd, { x: x + 0.3, y: y + 0.93, w: w - 0.6, h: 0.38, fontSize: 17, bold: true, color: C.INK });
    T(s, tx, { x: x + 0.3, y: y + 1.32, w: w - 0.5, h: 0.58, fontSize: 14 });
  });
  footer(s, 1);
}

function sRedFlags() {
  const s = newSlide('01 · The broken vessel');
  kicker(s, '01 · The broken vessel');
  title(s, 'Some features demand a hunt for a hidden lesion');
  const flags = [
    ['FaUser', 'Younger patient (45 or under)'],
    ['FaHeartPulse', 'No history of hypertension'],
    ['FaBrain', 'Lobar bleed, or blood only in the ventricles'],
    ['FaMagnifyingGlass', 'CT clues: subarachnoid blood, calcification, abnormal vessels'],
    ['FaWater', 'Bleed next to a venous sinus, or a dense sinus'],
    ['FaPills', 'On anticoagulants: check clotting straight away'],
  ];
  flags.forEach(([ic, tx], i) => {
    const y = 2.3 + i * 0.68;
    iconCircle(s, ic, MX, y, 0.5, C.INK);
    T(s, tx, { x: MX + 0.7, y, w: 6.4, h: 0.5, fontSize: 16, valign: 'middle' });
  });
  const x = 7.95, w = W - MX - x;
  card(s, x, 2.3, w, 1.95, C.BLUSH);
  T(s, '65%', { x: x + 0.35, y: 2.4, w: 2.2, h: 0.95, fontSize: 54, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'had a vascular lesion on angiography: aged 45 or under, no hypertension, lobar bleed', { x: x + 0.35, y: 3.35, w: w - 0.7, h: 0.8, fontSize: 14, color: C.RED_D });
  card(s, x, 4.45, w, 1.95, C.MIST2);
  T(s, '0%', { x: x + 0.35, y: 4.55, w: 2.2, h: 0.95, fontSize: 54, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'had one: over 45, hypertensive, with a putaminal, thalamic or posterior fossa bleed', { x: x + 0.35, y: 5.5, w: w - 0.7, h: 0.8, fontSize: 14 });
  source(s, 'Zhu et al., Stroke 1997 (prospective; 206 patients, all had catheter angiography).');
  footer(s, 1);
}

function sAvalanche() {
  const s = newSlide('02 · The first hours');
  kicker(s, '02 · The first hours');
  title(s, 'One rupture can trigger more ruptures around it');
  const w = (CW - 0.9) / 4;
  const steps = [
    ['Rupture', 'A diseased small artery gives way under arterial pressure.'],
    ['Dissection', 'Blood splits along tissue planes and a haematoma forms.'],
    ['Avalanche', 'The growing clot stretches and tears neighbouring vessels at its edge (Fisher, 1971).'],
    ['Tamponade', 'Bleeding stops when tissue pressure and clotting finally win.'],
  ];
  steps.forEach(([hd, tx], i) => {
    const x = MX + i * (w + 0.3), cx = x + w / 2, cy = 3.15;
    card(s, x, 2.25, w, 1.8, C.MIST2);
    if (i === 0) {
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.35, y: cy - 0.17, w: w - 0.7, h: 0.34, fill: { color: C.RED }, line: { color: C.WALL, width: 3 } });
      circle(s, cx - 0.26, cy - 0.62, 0.52, C.RED);
      circle(s, cx + 0.2, cy - 0.78, 0.2, C.RED);
      circle(s, cx - 0.42, cy - 0.74, 0.14, C.RED);
    } else {
      const d = i === 1 ? 1.05 : 1.2;
      if (i === 1) line(s, x + 0.3, cy, cx - d / 2, cy, C.WALL, 4);
      if (i === 2) {
        for (let k = 0; k < 7; k++) {
          const t = (k / 7) * Math.PI * 2 + 0.4;
          const x1 = cx + 0.55 * Math.cos(t), y1 = cy + 0.55 * Math.sin(t) * 0.95;
          const x2 = cx + 0.95 * Math.cos(t), y2 = cy + 0.95 * Math.sin(t) * 0.75;
          line(s, x1, y1, x2, y2, C.WALL, 2.5);
          circle(s, x2 - 0.09, y2 - 0.09, 0.18, C.RED);
        }
      }
      if (i === 3) ring(s, cx - 0.78, cy - 0.78, 1.56, C.INK, 2.25, 'dash');
      circle(s, cx - d / 2, cy - d / 2, d, C.RED);
    }
    if (i < 3) T(s, '›', { x: x + w + 0.02, y: cy - 0.35, w: 0.26, h: 0.6, fontSize: 36, bold: true, color: C.GRID, align: 'center', valign: 'middle' });
    badge(s, i + 1, x, 4.3, 0.44, C.RED, 15);
    T(s, hd, { x: x + 0.58, y: 4.3, w: w - 0.6, h: 0.44, fontSize: 18, bold: true, color: C.INK, valign: 'middle' });
    T(s, tx, { x, y: 4.9, w: w - 0.05, h: 1.3, fontSize: 15 });
  });
  source(s, 'Fisher CM, J Neuropathol Exp Neurol 1971: secondary bleeding points at the edge of hypertensive haematomas.');
  footer(s, 2);
}

function sWaffle() {
  const s = newSlide('02 · The first hours');
  kicker(s, '02 · The first hours');
  title(s, 'More than a third of haematomas keep growing');
  const d = 0.3, pitch = 0.38, x0 = 0.75, y0 = 2.3;
  for (let k = 0; k < 100; k++) {
    const r = Math.floor(k / 10), c = k % 10;
    const col = k < 26 ? C.RED_D : k < 38 ? C.RED_L : 'D5DCE5';
    circle(s, x0 + c * pitch, y0 + r * pitch, d, col);
  }
  T(s, 'Each dot = 1 patient scanned within 3 hours of onset', { x: x0, y: y0 + 10 * pitch + 0.02, w: 4.2, h: 0.28, fontSize: 11, italic: true, color: C.MUTED, valign: 'middle' });
  const x = 5.55, w = W - MX - x;
  T(s, '38 in 100', { x, y: 2.2, w, h: 0.85, fontSize: 54, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'grew by more than a third within 20 hours, and growth went with neurological decline.', { x, y: 3.05, w, h: 0.65, fontSize: 16 });
  const leg = [[C.RED_D, '26 grew within the first hour after the first scan'], [C.RED_L, '12 more grew between 1 and 20 hours'], ['D5DCE5', '62 showed no substantial growth']];
  leg.forEach(([col, tx], i) => {
    const y = 3.85 + i * 0.4;
    circle(s, x, y + 0.07, 0.22, col);
    T(s, tx, { x: x + 0.38, y, w: w - 0.4, h: 0.36, fontSize: 14, valign: 'middle' });
  });
  card(s, x, 5.2, w, 1.15, C.MIST);
  iconCircle(s, 'FaStopwatch', x + 0.3, 5.46, 0.62, C.INK);
  T(s, [
    { text: 'Every 10% of growth raised the hazard of death by 5%.', options: { bold: true, breakLine: true } },
    { text: 'Higher risk: early scan, large bleed, anticoagulants, CTA "spot sign".', options: { color: C.SLATE } },
  ], { x: x + 1.12, y: 5.26, w: w - 1.35, h: 1.0, fontSize: 14, valign: 'middle', paraSpaceAfter: 3 });
  source(s, 'Brott et al., Stroke 1997 (n = 103); Davis et al., Neurology 2006; spot sign: Demchuk et al., Lancet Neurol 2012 (PREDICT).');
  footer(s, 2);
}

function sMass() {
  const s = newSlide('02 · The first hours');
  kicker(s, '02 · The first hours');
  title(s, 'Volume and ventricles turn a bleed into a crisis');
  const cx = 2.75, cy = 4.3;
  const rings = [[3.9, 'EEF1F5'], [2.9, 'DCE3EB'], [1.9, C.BLUSH]];
  rings.forEach(([dd, col]) => circle(s, cx - dd / 2, cy - dd / 2, dd, col));
  circle(s, cx - 0.5, cy - 0.5, 1.0, C.RED);
  const labels = [[1.7, 1.6, 'Midline shift and herniation'], [1.2, 1.15, 'Raised intracranial pressure'], [0.72, 0.65, 'Compression and tissue destruction'], [0.3, 0, 'The clot']];
  labels.forEach(([rm, dy, tx], i) => {
    const y = cy - dy, xs = cx + Math.sqrt(Math.max(rm * rm - dy * dy, 0));
    circle(s, xs - 0.05, y - 0.05, 0.1, C.INK);
    line(s, xs, y, 5.05, y, C.MUTED, 1);
    T(s, tx, { x: 5.15, y: y - 0.25, w: 2.3, h: 0.5, fontSize: 14, bold: i === 3, color: i === 3 ? C.RED : C.TEXT, valign: 'middle' });
  });
  const x = 7.85, w = W - MX - x;
  card(s, x, 2.3, w, 1.95, C.BLUSH);
  T(s, '91%', { x: x + 0.35, y: 2.4, w: 2.2, h: 0.9, fontSize: 54, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'predicted 30-day mortality with volume ≥ 60 mL and GCS ≤ 8. Volume is the strongest single predictor.', { x: x + 0.35, y: 3.3, w: w - 0.7, h: 0.85, fontSize: 14, color: C.RED_D });
  card(s, x, 4.45, w, 1.95, C.MIST2);
  T(s, '≈45%', { x: x + 0.35, y: 4.55, w: 2.4, h: 0.9, fontSize: 54, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'extend into the ventricles. Ventricular blood can cause hydrocephalus and predicts a worse outcome.', { x: x + 0.35, y: 5.45, w: w - 0.7, h: 0.85, fontSize: 14 });
  source(s, 'Broderick et al., Stroke 1993 (Cincinnati, n = 188); Hanley, Stroke 2009.');
  footer(s, 2);
}

function sTimeline() {
  const s = newSlide('03 · The days after');
  kicker(s, '03 · The days after');
  title(s, 'Oedema builds in waves over the first two weeks');
  const y = 3.45;
  line(s, 0.9, y, 12.45, y, C.GRID, 3, true);
  const pts = [
    ['First hours', 'Clot retraction', 'The clot contracts and squeezes serum into the surrounding tissue.', 0.42, C.BLUSH],
    ['Days 1–2', 'Thrombin', 'The clotting cascade opens the blood–brain barrier.', 0.58, C.RED_L],
    ['Day 3 onward', 'Red-cell lysis', 'Haemoglobin, haem and iron drive oxidative injury.', 0.74, C.RED],
    ['Weeks', 'Clearance', 'Macrophages remove the clot, leaving a cavity and haemosiderin.', 0.9, C.RED_D],
  ];
  const colW = 2.85;
  pts.forEach(([when, hd, tx, d, col], i) => {
    const x = MX + 0.1 + i * (colW + 0.18);
    const cx = x + 0.45;
    T(s, when.toUpperCase(), { x, y: 2.3, w: colW, h: 0.35, fontSize: 13, bold: true, color: C.SLATE, charSpacing: 2, valign: 'middle' });
    circle(s, cx - d / 2, y - d / 2, d, col, { line: { color: C.WHITE, width: 2 } });
    T(s, hd, { x, y: 4.2, w: colW, h: 0.4, fontSize: 18, bold: true, color: C.INK });
    T(s, tx, { x, y: 4.65, w: colW - 0.15, h: 1.0, fontSize: 15 });
  });
  card(s, MX, 5.75, CW, 0.62, C.MIST);
  T(s, [
    { text: 'Oedema grew by about 75% in the first 24 hours ', options: { bold: true, color: C.INK } },
    { text: 'and can keep building into the second week.' },
  ], { x: MX + 0.35, y: 5.75, w: CW - 0.7, h: 0.62, fontSize: 16, valign: 'middle' });
  source(s, 'Xi, Keep & Hoff, Lancet Neurol 2006; oedema growth: Gebel et al., Stroke 2002.');
  footer(s, 3);
}

function sCascade() {
  const s = newSlide('03 · The days after');
  kicker(s, '03 · The days after');
  title(s, 'Three toxic pathways drive secondary injury');
  const cols = [
    ['FaFlask', 'Thrombin', 'Hours to days', 'Needed to stop the bleed. At high levels it opens the barrier, inflames and kills cells.'],
    ['FaAtom', 'Haemoglobin and iron', 'Day 3 onward', 'Red cells lyse. Haem oxygenase frees iron, which fuels free radicals and lipid damage.'],
    ['FaFire', 'Inflammation', 'Hours to weeks', 'Microglia activate within hours. Neutrophils, macrophages, cytokines and MMP-9 follow.'],
  ];
  const w = (CW - 0.6) / 3;
  cols.forEach(([ic, hd, when, tx], i) => {
    const x = MX + i * (w + 0.3), y = 2.25;
    card(s, x, y, w, 2.75, C.MIST2);
    iconCircle(s, ic, x + 0.3, y + 0.3, 0.62, C.RED);
    pill(s, when, x + w - 1.95, y + 0.42, 1.65, 0.38);
    T(s, hd, { x: x + 0.3, y: y + 1.1, w: w - 0.6, h: 0.42, fontSize: 19, bold: true, color: C.INK });
    T(s, tx, { x: x + 0.3, y: y + 1.55, w: w - 0.55, h: 1.1, fontSize: 14 });
    line(s, x + w / 2, y + 2.8, x + w / 2, 5.3, C.MUTED, 1.5, true);
  });
  card(s, MX, 5.35, CW, 1.0, C.INK);
  T(s, [
    { text: 'Blood–brain barrier breakdown   →   more oedema   →   neuronal death', options: { bold: true, color: C.WHITE, breakLine: true, fontSize: 18 } },
    { text: 'This is why patients can worsen days after the bleeding has stopped.', options: { color: C.ON_DARK, fontSize: 14 } },
  ], { x: MX + 0.4, y: 5.35, w: CW - 0.8, h: 1.0, valign: 'middle', paraSpaceAfter: 2 });
  source(s, 'Xi, Keep & Hoff, Lancet Neurol 2006. Most mechanistic evidence comes from animal models.');
  footer(s, 3);
}

function sMyth() {
  const s = newSlide('03 · The days after');
  kicker(s, '03 · The days after');
  title(s, 'The rim around the clot is not ischaemic');
  const w = 5.75;
  card(s, MX, 2.25, w, 1.6, C.MIST2);
  iconCircle(s, 'FaXmark', MX + 0.3, 2.5, 0.52, C.MUTED);
  T(s, 'The old idea', { x: MX + 1.0, y: 2.45, w: w - 1.3, h: 0.4, fontSize: 17, bold: true, color: C.MUTED });
  T(s, 'The rim is ischaemic tissue starved of blood, so lowering blood pressure could harm it.', { x: MX + 1.0, y: 2.88, w: w - 1.3, h: 0.85, fontSize: 15, color: C.TEXT });
  card(s, MX, 4.05, w, 1.6, C.MIST);
  iconCircle(s, 'FaCheck', MX + 0.3, 4.3, 0.52, C.INK);
  T(s, 'What PET showed', { x: MX + 1.0, y: 4.25, w: w - 1.3, h: 0.4, fontSize: 17, bold: true, color: C.INK });
  T(s, 'Blood flow falls, but oxygen use falls further. Oxygen extraction drops: hypoperfusion without ischaemia.', { x: MX + 1.0, y: 4.68, w: w - 1.3, h: 0.9, fontSize: 15 });

  const x = 6.75, cw = W - MX - x;
  T(s, 'Rim around the clot, as % of the mirror region', { x, y: 2.25, w: cw, h: 0.35, fontSize: 14, bold: true, color: C.INK });
  s.addChart(pres.charts.BAR, [
    { name: 'Mirror region', labels: ['Blood flow', 'Oxygen use'], values: [100, 100] },
    { name: 'Rim around clot', labels: ['Blood flow', 'Oxygen use'], values: [56, 48] },
  ], {
    x: x - 0.1, y: 2.6, w: cw + 0.1, h: 3.05, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60,
    chartColors: ['C3CEDB', C.RED], showValue: true, dataLabelFormatCode: '0"%"', dataLabelPosition: 'outEnd',
    dataLabelFontSize: 13, dataLabelFontFace: FB, dataLabelColor: C.TEXT, dataLabelFontBold: true,
    catAxisLabelFontFace: FB, catAxisLabelFontSize: 14, catAxisLabelColor: C.TEXT, catAxisLineShow: true,
    catAxisLineColor: C.GRID, valAxisHidden: true, valAxisMaxVal: 120, valAxisMinVal: 0,
    valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendFontFace: FB, legendFontSize: 12, legendColor: C.TEXT,
  });
  card(s, MX, 5.85, CW, 0.55, C.BLUSH);
  iconCircle(s, 'FaLightbulb', MX + 0.2, 5.9, 0.44, C.RED);
  T(s, [
    { text: 'So what? ', options: { bold: true } },
    { text: 'Lowering systolic pressure below 150 mmHg did not reduce blood flow around the haematoma (ICH ADAPT).' },
  ], { x: MX + 0.8, y: 5.85, w: CW - 1.0, h: 0.55, fontSize: 15, color: C.RED_D, valign: 'middle' });
  source(s, 'Zazulia et al., J Cereb Blood Flow Metab 2001 (PET, n = 19, 5–22 h after onset); Butcher et al., Stroke 2013.');
  footer(s, 3);
}

function sActions() {
  const s = newSlide('04 · At the bedside');
  kicker(s, '04 · At the bedside');
  title(s, 'Every mechanism opens a window to act');
  const hdr = [['MECHANISM', 1.55], ['WHEN', 4.5], ['WHAT WE DO', 6.7]];
  hdr.forEach(([t, x]) => T(s, t, { x, y: 1.75, w: 2.5, h: 0.3, fontSize: 11, bold: true, color: C.MUTED, charSpacing: 3, valign: 'middle' }));
  const rows = [
    ['FaHeartPulse', 'Small-vessel disease', 'Before and after', 'Control blood pressure. Review antithrombotics. Older adult with a lobar bleed? Think CAA.'],
    ['FaStopwatch', 'Haematoma growth', 'First hours', 'Fast imaging, early blood pressure lowering and urgent anticoagulant reversal. Close neuro observations.'],
    ['FaTriangleExclamation', 'Mass effect and ventricular blood', 'First days', 'New drowsiness, headache, vomiting or deficit? Stop and escalate: think growth or hydrocephalus.'],
    ['FaFire', 'Secondary injury', 'Days to weeks', 'Expect fluctuation as oedema peaks. Reassess before each session and pace therapy.'],
  ];
  rows.forEach(([ic, m, when, act], i) => {
    const y = 2.15 + i * 1.07;
    card(s, MX, y, CW, 0.95, i % 2 ? C.MIST2 : C.MIST);
    iconCircle(s, ic, MX + 0.22, y + 0.18, 0.6, i === 1 ? C.RED : C.INK);
    T(s, m, { x: 1.55, y, w: 2.8, h: 0.95, fontSize: 16, bold: true, color: C.INK, valign: 'middle' });
    pill(s, when, 4.5, y + 0.28, 1.85, 0.4);
    T(s, act, { x: 6.7, y, w: 5.75, h: 0.95, fontSize: 14, valign: 'middle' });
  });
  footer(s, 4);
}

function sTakeHomes() {
  const s = newSlide('04 · At the bedside');
  kicker(s, 'Summary');
  title(s, 'Five things to take home');
  const items = [
    'ICH is a process, not a moment.',
    'Deep bleeds point to hypertension. Lobar bleeds in older adults point to CAA.',
    'Young, normotensive or atypical? Hunt for a secondary cause.',
    'About one in three haematomas grows in the first hours.',
    'The blood is toxic: thrombin, iron and inflammation injure the brain for days.',
  ];
  items.forEach((t, i) => {
    const y = 2.15 + i * 0.86;
    badge(s, i + 1, MX, y + 0.06, 0.56, i === 0 ? C.RED : C.INK, 18);
    T(s, t, { x: MX + 0.85, y, w: 7.9, h: 0.7, fontSize: 19, bold: i === 0, color: i === 0 ? C.RED : C.TEXT, valign: 'middle' });
  });
  const cx = 11.3, cy = 4.1;
  [[2.9, 90], [2.25, 78]].forEach(([d, t]) => circle(s, cx - d / 2, cy - d / 2, d, C.RED, { fill: { color: C.RED, transparency: t }, line: { color: C.RED, transparency: 100, width: 0.5 } }));
  circle(s, cx - 0.78, cy - 0.78, 1.56, C.RED);
  T(s, 'Vessel → hours → days', { x: cx - 1.7, y: cy + 1.6, w: 3.4, h: 0.35, fontSize: 13, bold: true, color: C.SLATE, align: 'center', valign: 'middle' });
  footer(s, 4);
}

function sClosing() {
  const s = newSlide('Close', C.INK);
  motif(s, 10.2, 3.75, 3.2, [[5.5, 90], [4.4, 78]], '!!bleed');
  T(s, 'THANK YOU', { x: 0.8, y: 1.35, w: 6, h: 0.35, fontSize: 13, bold: true, color: C.RED_ON_DARK, charSpacing: 4, valign: 'middle' });
  T(s, 'Questions and discussion', { x: 0.8, y: 1.8, w: 6.4, h: 1.6, fontFace: FH, fontSize: 48, bold: true, color: C.WHITE });
  T(s, 'When the vessel breaks, the clock starts: hours for growth, days for toxicity.', { x: 0.8, y: 3.6, w: 6.2, h: 0.9, fontSize: 20, color: C.ON_DARK });
  card(s, 0.8, 4.85, 6.3, 1.5, C.INK_2);
  iconCircle(s, 'FaComments', 1.1, 5.3, 0.6, C.RED);
  T(s, 'Which of these windows do we meet most often in our own practice, and are we timing our assessments around it?', { x: 1.9, y: 4.95, w: 5.0, h: 1.3, fontSize: 16, color: C.WHITE, valign: 'middle' });
}

function sReferences() {
  const s = newSlide('Close');
  kicker(s, 'Sources');
  title(s, 'References');
  const refs = [
    'Rossi C, Cordonnier C. Pathophysiology of non-traumatic intracerebral haemorrhage. In: Norrving B, ed. Oxford Textbook of Stroke and Cerebrovascular Disease. Oxford University Press; 2014: chapter 5.',
    'van Asch CJ, et al. Incidence, case fatality, and functional outcome of intracerebral haemorrhage over time. Lancet Neurol 2010;9:167–176.',
    'Macellari F, et al. Neuroimaging in intracerebral hemorrhage. Stroke 2014;45:903–908.',
    'Meretoja A, et al. SMASH-U: a proposal for etiologic classification of intracerebral hemorrhage. Stroke 2012;43:2592–2597.',
    'Cordonnier C, Al-Shahi Salman R, Wardlaw J. Spontaneous brain microbleeds: systematic review. Brain 2007;130:1988–2003.',
    'Knudsen KA, et al. Clinical diagnosis of cerebral amyloid angiopathy: validation of the Boston criteria. Neurology 2001;56:537–539.',
    'Linn J, et al. Prevalence of superficial siderosis in patients with cerebral amyloid angiopathy. Neurology 2010;74:1346–1350.',
    'Zhu XL, Chan MS, Poon WS. Spontaneous intracranial hemorrhage: which patients need diagnostic cerebral angiography? Stroke 1997;28:1406–1409.',
    'Fisher CM. Pathological observations in hypertensive cerebral hemorrhage. J Neuropathol Exp Neurol 1971;30:536–550.',
    'Brott T, et al. Early hemorrhage growth in patients with intracerebral hemorrhage. Stroke 1997;28:1–5.',
    'Davis SM, et al. Hematoma growth is a determinant of mortality and poor outcome after intracerebral hemorrhage. Neurology 2006;66:1175–1181.',
    'Demchuk AM, et al. Prediction of haematoma growth and outcome using CT angiography spot sign (PREDICT). Lancet Neurol 2012;11:307–314.',
    'Broderick JP, et al. Volume of intracerebral hemorrhage: a powerful and easy-to-use predictor of 30-day mortality. Stroke 1993;24:987–993.',
    'Hanley DF. Intraventricular hemorrhage: severity factor and treatment target in spontaneous intracerebral hemorrhage. Stroke 2009;40:1533–1538.',
    'Gebel JM, et al. Natural history of perihematomal edema in hyperacute spontaneous intracerebral hemorrhage. Stroke 2002;33:2631–2635.',
    'Xi G, Keep RF, Hoff JT. Mechanisms of brain injury after intracerebral haemorrhage. Lancet Neurol 2006;5:53–63.',
    'Zazulia AR, et al. Hypoperfusion without ischemia surrounding acute intracerebral hemorrhage. J Cereb Blood Flow Metab 2001;21:804–810.',
    'Butcher KS, et al. The Intracerebral Hemorrhage Acutely Decreasing Arterial Pressure Trial (ICH ADAPT). Stroke 2013;44:620–626.',
  ];
  const half = Math.ceil(refs.length / 2);
  [refs.slice(0, half), refs.slice(half)].forEach((col, j) => {
    T(s, col.map((r, i) => ({ text: `${j * half + i + 1}. ${r}`, options: { breakLine: i < col.length - 1 } })), {
      x: MX + j * 6.2, y: 1.85, w: 5.9, h: 4.95, fontSize: 10.5, color: C.TEXT, paraSpaceAfter: 5,
    });
  });
}

function sBackup() {
  const s = newSlide('Backup');
  s.hidden = true; // shown only on demand during Q&A
  kicker(s, 'Backup  ·  beyond the 2014 chapter', C.SLATE);
  title(s, 'What has changed since the book was published');
  const items = [
    ['2022', 'Boston criteria v2.0', 'Adds white-matter MRI markers to diagnose CAA in life.', 'Charidimou et al., Lancet Neurol 2022'],
    ['2023', 'INTERACT3', 'A care bundle (early BP lowering, glucose and fever control, anticoagulant reversal) improved function at 6 months.', 'Ma et al., Lancet 2023'],
    ['2024', 'ENRICH', 'Early minimally invasive clot removal improved outcomes, with the benefit driven by lobar bleeds.', 'Pradilla et al., N Engl J Med 2024'],
    ['2024', 'ANNEXA-I', 'Andexanet improved haemostasis in factor Xa inhibitor bleeds, but with more thrombotic events.', 'Connolly et al., N Engl J Med 2024'],
  ];
  const w = (CW - 0.3) / 2, h = 1.95;
  items.forEach(([yr, hd, tx, src], i) => {
    const x = MX + (i % 2) * (w + 0.3), y = 2.2 + Math.floor(i / 2) * (h + 0.2);
    card(s, x, y, w, h, i % 3 === 0 ? C.MIST : C.MIST2);
    pill(s, yr, x + 0.3, y + 0.3, 0.8, 0.38, C.INK, C.WHITE, 12);
    T(s, hd, { x: x + 1.3, y: y + 0.27, w: w - 1.6, h: 0.44, fontSize: 18, bold: true, color: C.INK, valign: 'middle' });
    T(s, tx, { x: x + 0.3, y: y + 0.85, w: w - 0.6, h: 0.72, fontSize: 14 });
    T(s, src, { x: x + 0.3, y: y + 1.55, w: w - 0.6, h: 0.3, fontSize: 10, italic: true, color: C.MUTED });
  });
  footer(s, 0);
}

// ---------- transitions (post-process) ----------
const FADE = '<p:transition spd="med"><p:fade/></p:transition>';
const MORPH = '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">' +
  '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">' +
  '<p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="900"><p159:morph option="byObject"/></p:transition>' +
  '</mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>';

async function addTransitions(buf, morphSlides) {
  const zip = await JSZip.loadAsync(buf);
  const files = Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f));
  for (const f of files) {
    const n = parseInt(f.match(/slide(\d+)\.xml/)[1], 10);
    let xml = await zip.file(f).async('string');
    const tr = morphSlides.includes(n) ? MORPH : FADE;
    if (xml.includes('</p:clrMapOvr>')) xml = xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + tr);
    else xml = xml.replace('</p:cSld>', '</p:cSld>' + tr);
    zip.file(f, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// ---------- main ----------
(async () => {
  const icons = ['FaCodeBranch', 'FaBrain', 'FaHeartCrack', 'FaPersonWalking', 'FaUserDoctor', 'FaDroplet', 'FaDna', 'FaCircleNodes', 'FaPills',
    'FaDisease', 'FaWater', 'FaRotate', 'FaSyringe', 'FaUser', 'FaHeartPulse', 'FaMagnifyingGlass', 'FaStopwatch', 'FaFlask',
    'FaAtom', 'FaFire', 'FaXmark', 'FaCheck', 'FaLightbulb', 'FaTriangleExclamation', 'FaComments'];
  for (const n of icons) I[n] = await iconPng(n);
  IMG.map = await svgToPng(brainSVG({ bleeds: [{ x: 208, y: 330, r: 34, seed: 1.2 }, { x: 336, y: 408, r: 21, seed: 2.1 }, { x: 452, y: 222, r: 38, seed: 0.4 }] }), 1400);
  IMG.lobar = await svgToPng(brainSVG({ dots: lobarDots() }), 900);
  IMG.deep = await svgToPng(brainSVG({ dots: deepDots() }), 900);

  sTitle(); sStats(); sBigIdea();
  sDivider(1, '01', 'The broken vessel', 'Why does a small artery give way, and what else can bleed?', 1.5, []);
  sDefinition(); sSmashU(); sVessels(); sBrainMap(); sMicrobleeds(); sSecondary(); sRedFlags();
  sDivider(2, '02', 'The first hours', 'Rupture, growth and rising pressure', 2.2, [[2.9, 85]]);
  sAvalanche(); sWaffle(); sMass();
  sDivider(3, '03', 'The days after', 'When the blood itself becomes a toxin', 2.7, [[4.2, 88], [3.5, 78]]);
  sTimeline(); sCascade(); sMyth();
  sDivider(4, '04', 'At the bedside', 'What the mechanisms mean for our patients', 2.7, [[4.6, 90], [3.7, 80]]);
  sActions(); sTakeHomes(); sClosing(); sReferences(); sBackup();

  const buf = await pres.write({ outputType: 'nodebuffer' });
  if (process.env.RAW) fs.writeFileSync('raw.pptx', buf);
  const out = await addTransitions(buf, [4, 12, 16, 20]);
  fs.writeFileSync(OUT, out);
  console.log('Wrote', OUT, 'slides:', slideNo);
})().catch((e) => { console.error(e); process.exit(1); });
