// Deck v3: "When the vessel breaks", for an academic physiotherapy audience.
// v2 (Clinical Educator Wiki standards: story thread, message map of three, few words,
// Morph reveals, soft breaks, one prop moment) plus: learning objectives, evidence tags
// for appraisal, location-to-impairment, timing of mobilisation, a Day-4 reasoning case
// and the recovery debate.
// Usage: node build_v3.js <output.pptx>
const pptxgen = require('pptxgenjs');
const JSZip = require('jszip');
const fs = require('fs');
const { iconPng, brainSVG, svgToPng, lobarDots, deepDots } = require('./assets');
const NOTES = require('./notes_v3');
const REFS = require('./refs');

const OUT = process.argv[2] || 'deck_v3.pptx';

const C = {
  INK: '13233A', SLATE: '3E5C76', MIST: 'E8EDF3', MIST2: 'F3F5F8', WALL: 'C3CEDB',
  RED: 'C1272D', RED_D: '8E1B1F', RED_L: 'E88A8E', RED_B: 'E0474C', BLUSH: 'F6DCDD',
  TEXT: '1B2230', MUTED: '667285', GRID: 'C9D2DE', WHITE: 'FFFFFF', DOT: 'D5DCE5',
  ON_DARK: 'C9D3E0', ON_DARK_MUTED: '93A6BC', RED_ON_DARK: 'F08A8E', INK_2: '1E3350',
};
const FH = 'Cambria', FB = 'Calibri';
const W = 13.333, MX = 0.6, CW = W - 2 * MX;

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'When the vessel breaks: pathophysiology of non-traumatic intracerebral haemorrhage';
pres.theme = { headFontFace: FH, bodyFontFace: FB };

const I = {}, IMG = {};
let slideNo = 0;
const morphSlides = [];
const sections = new Set();

// ---------- helpers ----------
function T(s, text, o) {
  const opts = Object.assign({ fontFace: FB, color: C.TEXT, margin: 0, isTextBox: true, valign: 'top' }, o);
  if (!opts.objectName) delete opts.objectName;
  s.addText(text, opts);
}
function kicker(s, text, color = C.RED) {
  T(s, text.toUpperCase(), { x: MX, y: 0.42, w: 7.6, h: 0.32, fontSize: 14, bold: true, color, charSpacing: 3, valign: 'middle' });
}
function title(s, text, o = {}) {
  T(s, text, Object.assign({ x: MX, y: 0.78, w: CW, h: 0.85, fontFace: FH, fontSize: 40, bold: true, color: C.INK, valign: 'middle', objectName: 'title' }, o));
}
function source(s, text, dark = false) {
  T(s, text, { x: MX, y: 6.5, w: CW, h: 0.3, fontSize: 12, italic: true, color: dark ? C.ON_DARK_MUTED : C.MUTED, valign: 'middle' });
}
// Evidence tag (top right): study design, size and main limit. The "challenge it" layer.
function tag(s, text, { dark = false, x, y = 0.39 } = {}) {
  const h = 0.38, w = Math.min(5.4, 0.66 + text.length * 0.088);
  if (x === undefined) x = W - MX - w;
  const fill = dark ? C.INK_2 : C.MIST, col = dark ? C.ON_DARK : C.SLATE;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0.5 }, rectRadius: h / 2 });
  s.addImage({ data: dark ? I.magDark : I.magSlate, x: x + 0.17, y: y + 0.095, w: 0.19, h: 0.19 });
  T(s, text, { x: x + 0.44, y, w: w - 0.52, h, fontSize: 13, bold: true, color: col, valign: 'middle' });
}
function footer(s, sec, dark = false) {
  const mute = dark ? C.ON_DARK_MUTED : C.MUTED, off = dark ? C.SLATE : C.GRID, on = dark ? C.RED_ON_DARK : C.RED;
  T(s, 'Chapter 5  ·  Intracerebral haemorrhage', { x: MX, y: 6.98, w: 5.5, h: 0.3, fontSize: 11, color: mute, valign: 'middle' });
  ['Vessel', 'Hours', 'Days', 'Bedside'].forEach((l, i) => {
    const x = 7.95 + i * 1.03, isOn = i + 1 === sec;
    s.addShape(pres.shapes.OVAL, { x, y: 7.065, w: 0.14, h: 0.14, fill: { color: isOn ? on : off }, line: { color: isOn ? on : off, width: 0.5 }, objectName: `trk${i}` });
    T(s, l, { x: x + 0.21, y: 6.98, w: 0.78, h: 0.3, fontSize: 11, bold: isOn, color: isOn ? on : mute, valign: 'middle', objectName: `trkl${i}` });
  });
  T(s, String(slideNo), { x: 12.23, y: 6.98, w: 0.5, h: 0.3, fontSize: 11, color: mute, align: 'right', valign: 'middle', objectName: 'pageno' });
}
function circle(s, x, y, d, color, o = {}) {
  s.addShape(pres.shapes.OVAL, Object.assign({ x, y, w: d, h: d, fill: { color }, line: { color, width: 0.5 } }, o));
}
function ring(s, x, y, d, color, width = 1, dash, name) {
  const o = { x, y, w: d, h: d, fill: { color: 'FFFFFF', transparency: 100 }, line: { color, width, dashType: dash || 'solid' } };
  if (name) o.objectName = name;
  s.addShape(pres.shapes.OVAL, o);
}
function soft(s, x, y, d, color, t, name) {
  const o = { fill: { color, transparency: t }, line: { color, transparency: 100, width: 0.5 } };
  if (name) o.objectName = name;
  circle(s, x, y, d, color, o);
}
function iconCircle(s, icon, x, y, d, fill = C.INK, name) {
  circle(s, x, y, d, fill, name ? { objectName: name + 'c' } : {});
  const p = d * 0.25;
  const o = { data: I[icon], x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p };
  if (name) o.objectName = name + 'i';
  s.addImage(o);
}
function badge(s, n, x, y, d = 0.5, fill = C.RED, fs = 16) {
  circle(s, x, y, d, fill);
  T(s, String(n), { x, y, w: d, h: d, fontSize: fs, bold: true, color: C.WHITE, align: 'center', valign: 'middle' });
}
function card(s, x, y, w, h, fill = C.MIST2, name) {
  const o = { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0.5 }, rectRadius: 0.1 };
  if (name) o.objectName = name;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, o);
}
function pill(s, text, x, y, w, h = 0.44, fill = C.BLUSH, color = C.RED_D, fs = 14, name) {
  const o = { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0.5 }, rectRadius: h / 2 };
  if (name) o.objectName = name + 'b';
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, o);
  T(s, text, { x, y, w, h, fontSize: fs, bold: true, color, align: 'center', valign: 'middle', objectName: name ? name + 't' : undefined });
}
function line(s, x1, y1, x2, y2, color = C.GRID, width = 1.5, arrow = false, dash) {
  const o = { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color, width } };
  if (x2 < x1) o.flipH = true;
  if (y2 < y1) o.flipV = true;
  if (arrow) o.line.endArrowType = 'triangle';
  if (dash) o.line.dashType = dash;
  s.addShape(pres.shapes.LINE, o);
}
function newSlide(section, key, { bg = C.WHITE, morph = false, hidden = false } = {}) {
  slideNo += 1;
  if (!sections.has(section)) { pres.addSection({ title: section }); sections.add(section); }
  const s = pres.addSlide({ sectionTitle: section });
  s.background = { color: bg };
  if (!NOTES[key]) throw new Error('No notes for ' + key);
  s.addNotes(NOTES[key]);
  if (morph) morphSlides.push(slideNo);
  if (hidden && !process.env.SHOW_HIDDEN) s.hidden = true;
  return s;
}
// haematoma motif: skull ring, oedema halos, core
function motif(s, cx, cy, core, halos = [], skull = 6.0) {
  ring(s, cx - skull / 2, cy - skull / 2, skull, C.SLATE, 1, null, '!!skull');
  halos.forEach(([d, t], i) => soft(s, cx - d / 2, cy - d / 2, d, C.RED, t, `!!halo${i}`));
  circle(s, cx - core / 2, cy - core / 2, core, C.RED, { objectName: '!!bleed' });
}

// ---------- slides ----------
function sTitle() {
  const s = newSlide('Opening', 'title', { bg: C.INK });
  motif(s, 10.2, 3.75, 2.9, [[5.1, 90], [4.0, 78]]);
  T(s, 'CHAPTER 5  ·  FOR PHYSIOTHERAPY', { x: 0.8, y: 1.35, w: 6.4, h: 0.4, fontSize: 16, bold: true, color: C.RED_ON_DARK, charSpacing: 4, valign: 'middle' });
  T(s, 'When the vessel breaks', { x: 0.8, y: 1.85, w: 6.4, h: 2.1, fontFace: FH, fontSize: 60, bold: true, color: C.WHITE });
  T(s, 'Pathophysiology of non-traumatic intracerebral haemorrhage', { x: 0.8, y: 4.0, w: 6.0, h: 0.95, fontSize: 24, color: C.ON_DARK });
  T(s, [
    { text: 'Chapter 5: Rossi and Cordonnier (2014), pp. 51–60', options: { breakLine: true } },
    { text: 'In B. Norrving (Ed.), ' },
    { text: 'Oxford textbook of stroke and cerebrovascular disease', options: { italic: true } },
    { text: '. Oxford University Press.' },
  ], { x: 0.8, y: 5.3, w: 6.4, h: 0.85, fontSize: 14, color: C.ON_DARK_MUTED, paraSpaceAfter: 4 });
}

function hookBase(s, key) {
  T(s, '10 December 1996', { x: 0.8, y: 1.2, w: 7.8, h: 1.0, fontFace: FH, fontSize: 54, bold: true, color: C.WHITE, valign: 'middle', objectName: '!!date' });
  T(s, '7 a.m.  ·  Jill Bolte Taylor, neuroanatomist, aged 37', { x: 0.8, y: 2.25, w: 7.8, h: 0.5, fontSize: 20, color: C.RED_ON_DARK, valign: 'middle', objectName: '!!who' });
}
function sHook1() {
  const s = newSlide('Opening', 'hook1', { bg: C.INK });
  hookBase(s);
  T(s, '“I woke up to a pounding pain behind my left eye.”', { x: 0.8, y: 3.3, w: 7.4, h: 1.6, fontFace: FH, fontSize: 32, italic: true, color: C.WHITE, objectName: '!!quote' });
  motif(s, 10.7, 3.75, 0.45, [], 4.4);
  source(s, 'Source: Taylor (2008a).', true);
}
function sHook2() {
  const s = newSlide('Opening', 'hook2', { bg: C.INK, morph: true });
  hookBase(s);
  T(s, [
    { text: 'Within four hours she could not ', options: {} },
    { text: 'walk, talk, read or write.', options: { bold: true, color: C.RED_ON_DARK } },
  ], { x: 0.8, y: 3.3, w: 7.4, h: 1.6, fontFace: FH, fontSize: 32, color: C.WHITE, objectName: '!!line2' });
  motif(s, 10.7, 3.75, 2.2, [[3.4, 82]], 4.4);
  source(s, 'Source: Taylor (2008a).', true);
}

function sStat() {
  const s = newSlide('Opening', 'stat');
  kicker(s, 'Why it matters');
  tag(s, 'Systematic review · 36 studies · n = 8145');
  T(s, '40%', { x: MX, y: 1.45, w: 6.4, h: 3.0, fontFace: FH, fontSize: 200, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'die within a month of an intracerebral haemorrhage', { x: 7.0, y: 2.1, w: 5.7, h: 1.6, fontSize: 32, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'No improvement from 1980 to 2008.', { x: 7.0, y: 3.8, w: 5.7, h: 0.6, fontSize: 24, color: C.SLATE, valign: 'middle' });
  source(s, 'Median 1-month case fatality 40.4%; 36 population studies, n = 8145 (van Asch et al., 2010).');
  footer(s, 0);
}

function sBigIdea() {
  const s = newSlide('Opening', 'bigidea');
  kicker(s, 'The big idea');
  title(s, 'ICH is a process, not a moment');
  const steps = [['The vessel', 0.8, 0], ['The first hours', 1.2, 0], ['The days after', 1.6, 2.3]];
  const colW = 3.9, gap = 0.3, cy = 3.55;
  const x0 = MX + 0.3;
  line(s, x0 + 0.8, cy, x0 + 2 * (colW + gap) + 0.8, cy, C.GRID, 3);
  steps.forEach(([t, d, halo], i) => {
    const x = x0 + i * (colW + gap), cx = x + 0.8;
    if (halo) soft(s, cx - halo / 2, cy - halo / 2, halo, C.RED, 82);
    circle(s, cx - d / 2, cy - d / 2, d, C.RED);
    T(s, String(i + 1), { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fontSize: 20 + i * 6, bold: true, color: C.WHITE, align: 'center', valign: 'middle' });
    T(s, t, { x, y: 4.85, w: colW, h: 0.6, fontSize: 28, bold: true, color: C.INK });
  });
  T(s, 'Each stage is a window to act.', { x: x0, y: 5.6, w: 10, h: 0.55, fontSize: 24, color: C.SLATE });
  source(s, 'Framework adapted from Rossi and Cordonnier (2014).');
  footer(s, 0);
}

function sObjectives() {
  const s = newSlide('Opening', 'objectives');
  kicker(s, 'Tonight');
  title(s, 'Four things you will be able to do');
  const rows = [['Explain', 'why a bleed keeps injuring the brain'], ['Predict', 'the impairment and the risk of decline'], ['Appraise', 'the strength of each claim'], ['Apply', 'time and pace therapy to the stage']];
  rows.forEach(([v, t], i) => {
    const y = 1.95 + i * 1.1;
    if (i) line(s, MX, y - 0.08, 7.85, y - 0.08, C.GRID, 1);
    T(s, v, { x: MX, y, w: 2.4, h: 0.95, fontFace: FH, fontSize: 30, bold: true, color: C.RED, valign: 'middle' });
    T(s, t, { x: MX + 2.45, y, w: 4.85, h: 0.95, fontSize: 21, valign: 'middle' });
  });
  const x = 8.3, w = W - MX - x;
  card(s, x, 1.95, w, 4.35, C.INK);
  T(s, 'Two ways to listen', { x: x + 0.4, y: 2.15, w: w - 0.8, h: 0.6, fontFace: FH, fontSize: 26, bold: true, color: C.WHITE, valign: 'middle' });
  T(s, 'THE TITLE', { x: x + 0.4, y: 2.95, w: w - 0.8, h: 0.35, fontSize: 13, bold: true, color: C.RED_ON_DARK, charSpacing: 2, valign: 'middle' });
  T(s, 'is the message. New to stroke? Hold on to it.', { x: x + 0.4, y: 3.32, w: w - 0.8, h: 0.8, fontSize: 19, color: C.ON_DARK });
  T(s, 'THE TAG', { x: x + 0.4, y: 4.35, w: 1.3, h: 0.38, fontSize: 13, bold: true, color: C.RED_ON_DARK, charSpacing: 2, valign: 'middle' });
  tag(s, 'Cohort · n = 1013', { x: x + 1.65, y: 4.35 });
  T(s, 'is the evidence. Experienced? Challenge it.', { x: x + 0.4, y: 4.85, w: w - 0.8, h: 0.8, fontSize: 19, color: C.ON_DARK });
  footer(s, 0);
}

function sDivider(sec, key, num, name, sub, core, halos) {
  const s = newSlide(`${num} · ${name}`, key, { bg: C.INK, morph: true });
  motif(s, 10.2, 3.75, core, halos);
  T(s, num, { x: 0.8, y: 1.45, w: 3, h: 1.6, fontFace: FH, fontSize: 110, bold: true, color: C.RED_B, valign: 'bottom' });
  T(s, name, { x: 0.8, y: 3.2, w: 6.8, h: 1.0, fontFace: FH, fontSize: 54, bold: true, color: C.WHITE, valign: 'middle' });
  T(s, sub, { x: 0.8, y: 4.3, w: 6.3, h: 0.9, fontSize: 26, color: C.ON_DARK });
}

function sSmashU() {
  const s = newSlide('01 · The vessel', 'smashu');
  kicker(s, '01 · The vessel');
  tag(s, 'Cohort · n = 1013 · one centre');
  title(s, 'Hypertension and amyloid cause over half');
  const labels = ['Hypertension  35%', 'Undetermined  21%', 'Amyloid angiopathy  20%', 'Anticoagulants  14%', 'Structural lesion  5%', 'Systemic disease  5%'];
  s.addChart(pres.charts.BAR, [
    { name: 'Small-vessel disease', labels, values: [35, 0, 20, 0, 0, 0] },
    { name: 'Other causes', labels, values: [0, 21, 0, 14, 5, 5] },
  ], {
    x: MX, y: 1.85, w: 8.3, h: 4.5, barDir: 'bar', barGrouping: 'stacked', barGapWidthPct: 40,
    chartColors: [C.RED, 'AEB9C7'], catAxisOrientation: 'maxMin', catAxisLabelFontFace: FB, catAxisLabelFontSize: 18,
    catAxisLabelColor: C.TEXT, catAxisLineShow: false, valAxisHidden: true, valAxisMaxVal: 38, valAxisMinVal: 0,
    valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, showLegend: false, showValue: false,
  });
  const x = 9.3, w = W - MX - x;
  card(s, x, 2.0, w, 4.3, C.BLUSH);
  T(s, '55%', { x: x + 0.35, y: 2.85, w: w - 0.7, h: 1.4, fontFace: FH, fontSize: 80, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'two small-vessel diseases', { x: x + 0.35, y: 4.3, w: w - 0.7, h: 1.1, fontSize: 26, bold: true, color: C.RED_D });
  source(s, 'SMASH-U classification, n = 1013, Helsinki (Meretoja et al., 2012). Full breakdown on the handout.');
  footer(s, 1);
}

function vessel(s, cx, cy, kind, D = 2.1) {
  const r = D / 2;
  if (kind === 'htn') {
    const a = -Math.PI / 4, br = D * 0.36;
    const bx = cx + (r + 0.05) * Math.cos(a), by = cy + (r + 0.05) * Math.sin(a);
    circle(s, bx - br / 2, by - br / 2, br, C.WALL);
  }
  circle(s, cx - r, cy - r, D, C.WALL);
  if (kind === 'normal') circle(s, cx - r * 0.78, cy - r * 0.78, D * 0.78, C.RED);
  if (kind === 'htn') {
    s.addShape(pres.shapes.OVAL, { x: cx - r * 0.85, y: cy - r * 0.85, w: D * 0.85, h: D * 0.85, fill: { color: 'F1F3F6' }, line: { color: 'AEB9C7', width: 1, dashType: 'dash' } });
    circle(s, cx - r * 0.3, cy - r * 0.3, D * 0.3, C.RED);
    const a = -Math.PI / 4, bx = cx + (r + 0.05) * Math.cos(a), by = cy + (r + 0.05) * Math.sin(a), bd = D * 0.23;
    circle(s, bx - bd / 2, by - bd / 2, bd, C.RED);
  }
  if (kind === 'caa') {
    circle(s, cx - r * 0.68, cy - r * 0.68, D * 0.68, C.RED);
    const n = 18;
    for (let k = 0; k < n; k++) {
      const t = (k / n) * Math.PI * 2 + 0.2, rr = r * (k % 2 ? 0.8 : 0.89), d = D * (k % 3 ? 0.07 : 0.085);
      circle(s, cx + rr * Math.cos(t) - d / 2, cy + rr * Math.sin(t) - d / 2, d, C.INK);
    }
  }
}
function sVessels() {
  const s = newSlide('01 · The vessel', 'vessels');
  kicker(s, '01 · The vessel');
  title(s, 'Two diseases, two sets of vessels');
  const cols = [['normal', 'Healthy', 'Thin wall, wide channel'], ['htn', 'Hypertension', 'Deep arteries: thick, brittle wall'], ['caa', 'Amyloid angiopathy', 'Surface arteries: amyloid replaces muscle']];
  const w = (CW - 0.6) / 3;
  cols.forEach(([k, h, t], i) => {
    const x = MX + i * (w + 0.3);
    card(s, x, 1.9, w, 4.45, i === 0 ? C.MIST2 : C.MIST);
    vessel(s, x + w / 2, 3.25, k);
    T(s, h, { x: x + 0.35, y: 4.6, w: w - 0.7, h: 0.55, fontSize: 26, bold: true, color: i === 0 ? C.SLATE : C.INK });
    T(s, t, { x: x + 0.35, y: 5.2, w: w - 0.6, h: 0.95, fontSize: 20 });
  });
  source(s, 'Hypertensive arteriopathy (Fisher, 1971); amyloid angiopathy (Rossi & Cordonnier, 2014).');
  footer(s, 1);
}

function mapSlide(key, withLobar) {
  const s = newSlide('01 · The vessel', key, { morph: withLobar });
  kicker(s, '01 · The vessel');
  title(s, 'Where it bleeds tells you why');
  const ih = 4.55, sc = ih / 700, ix = 0.9, iy = 1.85;
  s.addImage({ data: withLobar ? IMG.mapAll : IMG.mapDeep, x: ix, y: iy, w: 600 * sc, h: ih, objectName: '!!brain' });
  const x = 5.6;
  card(s, x, 1.95, W - MX - x, 2.0, C.MIST, '!!deepcard');
  T(s, 'Deep', { x: x + 0.4, y: 2.1, w: 3, h: 0.8, fontFace: FH, fontSize: 40, bold: true, color: C.INK, valign: 'middle', objectName: '!!deept' });
  T(s, '→ hypertension', { x: x + 3.0, y: 2.1, w: 4, h: 0.8, fontSize: 30, bold: true, color: C.INK, valign: 'middle', objectName: '!!deeph' });
  T(s, 'putamen · thalamus · pons · cerebellum', { x: x + 0.4, y: 3.0, w: 6.5, h: 0.6, fontSize: 20, color: C.SLATE, valign: 'middle', objectName: '!!deeps' });
  if (withLobar) {
    card(s, x, 4.2, W - MX - x, 2.1, C.BLUSH);
    T(s, 'Lobar', { x: x + 0.4, y: 4.35, w: 3, h: 0.8, fontFace: FH, fontSize: 40, bold: true, color: C.RED_D, valign: 'middle' });
    T(s, '→ amyloid (older adults)', { x: x + 3.0, y: 4.35, w: 4.2, h: 0.8, fontSize: 26, bold: true, color: C.RED_D, valign: 'middle' });
    T(s, 'Young or atypical? Look for a lesion.', { x: x + 0.4, y: 5.25, w: 6.5, h: 0.6, fontSize: 20, color: C.RED_D, valign: 'middle' });
  }
  source(s, 'Schematic axial slice; the pons and cerebellum sit below this level. Deep vs lobar patterns (Macellari et al., 2014; Meretoja et al., 2012).');
  footer(s, 1);
}

function sLocation() {
  const s = newSlide('01 · The vessel', 'location');
  kicker(s, '01 · The vessel  ·  what you will see');
  tag(s, 'PLIC: 3 imaging cohorts · n = 43–305');
  title(s, 'Location predicts the impairment');
  const rows = [
    ['Putamen, internal capsule', [{ text: 'Opposite-side weakness. ' }, { text: 'Clot on the PLIC: worse motor outcome.', options: { bold: true, color: C.RED_D } }], true],
    ['Thalamus', 'Opposite-side sensory loss, ataxia; later, central pain'],
    ['Cerebellum', 'Same-side ataxia, truncal sway. Drowsy = emergency.'],
    ['Pons', 'Often severe: four-limb weakness, cranial nerve signs'],
    ['Lobar', 'By lobe: weakness, neglect, aphasia, field loss; seizures'],
  ];
  rows.forEach(([loc, txt, hi], i) => {
    const y = 1.9 + i * 0.89;
    card(s, MX, y, CW, 0.8, hi ? C.BLUSH : i === 4 ? C.MIST2 : C.MIST);
    T(s, loc, { x: MX + 0.35, y, w: 3.75, h: 0.8, fontSize: 22, bold: true, color: hi ? C.RED_D : C.INK, valign: 'middle' });
    T(s, txt, { x: MX + 4.2, y, w: CW - 4.45, h: 0.8, fontSize: 20, valign: 'middle' });
  });
  source(s, 'PLIC involvement and motor outcome (Gupta et al., 2025; Murray et al., 2025; Puig et al., 2019).');
  footer(s, 1);
}

function sMicrobleeds() {
  const s = newSlide('01 · The vessel', 'microbleeds');
  kicker(s, '01 · The vessel');
  tag(s, 'Systematic review · mixed MRI methods');
  title(s, 'Microbleeds are the footprints');
  const bw = 2.9, bh = bw * 700 / 600;
  s.addImage({ data: IMG.lobar, x: 0.8, y: 1.85, w: bw, h: bh });
  s.addImage({ data: IMG.deep, x: 4.1, y: 1.85, w: bw, h: bh });
  T(s, [{ text: 'Surface', options: { bold: true, breakLine: true, color: C.INK } }, { text: '→ amyloid', options: { color: C.SLATE } }], { x: 0.9, y: 5.35, w: 2.9, h: 0.9, fontSize: 22 });
  T(s, [{ text: 'Deep', options: { bold: true, breakLine: true, color: C.INK } }, { text: '→ hypertension', options: { color: C.SLATE } }], { x: 4.2, y: 5.35, w: 2.9, h: 0.9, fontSize: 22 });
  const x = 7.6, w = W - MX - x;
  card(s, x, 2.0, w, 4.3, C.MIST);
  T(s, '60%', { x: x + 0.4, y: 2.4, w: w - 0.8, h: 1.5, fontFace: FH, fontSize: 88, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'of people with ICH have microbleeds on MRI', { x: x + 0.4, y: 3.95, w: w - 0.8, h: 1.1, fontSize: 24, bold: true, color: C.INK });
  T(s, 'Healthy adults: 5%', { x: x + 0.4, y: 5.25, w: w - 0.8, h: 0.5, fontSize: 20, color: C.SLATE });
  source(s, 'Systematic review (Cordonnier et al., 2007). Boston criteria on the handout (Knudsen et al., 2001).');
  footer(s, 1);
}

function chips(s, positions) {
  const items = [['FaUser', '37 years old'], ['FaHeartPulse', 'No hypertension'], ['FaBrain', 'Lobar bleed']];
  items.forEach(([ic, t], i) => {
    const [x, y, w] = positions[i];
    card(s, x, y, w, 1.0, C.MIST, `!!chip${i}`);
    iconCircle(s, ic, x + 0.22, y + 0.17, 0.66, C.INK, `!!chipI${i}`);
    T(s, t, { x: x + 1.05, y, w: w - 1.15, h: 1.0, fontSize: 24, bold: true, color: C.INK, valign: 'middle', objectName: `!!chipT${i}` });
  });
}
function sCase1() {
  const s = newSlide('01 · The vessel', 'case1');
  kicker(s, 'Your turn  ·  30 seconds with your neighbour');
  title(s, 'Jill: primary or secondary?');
  const w = (CW - 0.6) / 3;
  chips(s, [0, 1, 2].map((i) => [MX + i * (w + 0.3), 2.45, w]));
  T(s, '?', { x: MX, y: 3.75, w: CW, h: 2.4, fontFace: FH, fontSize: 150, bold: true, color: C.GRID, align: 'center', valign: 'middle' });
  source(s, 'Case details: Taylor (2008b).');
  footer(s, 1);
}
function sCase2() {
  const s = newSlide('01 · The vessel', 'case2', { morph: true });
  kicker(s, 'Your turn  ·  30 seconds with your neighbour');
  tag(s, 'Prospective · n = 206 · one centre');
  title(s, 'Secondary: an arteriovenous malformation', { color: C.RED });
  const w = (CW - 0.6) / 3;
  chips(s, [0, 1, 2].map((i) => [MX + i * (w + 0.3), 1.95, w]));
  const cw = (CW - 0.3) / 2;
  card(s, MX, 3.25, cw, 3.05, C.BLUSH);
  T(s, '65%', { x: MX + 0.4, y: 3.45, w: cw - 0.8, h: 1.3, fontFace: FH, fontSize: 80, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'of patients like Jill had a lesion on angiography', { x: MX + 0.4, y: 4.8, w: cw - 0.8, h: 1.2, fontSize: 24, bold: true, color: C.RED_D });
  const x2 = MX + cw + 0.3;
  card(s, x2, 3.25, cw, 3.05, C.MIST2);
  T(s, '0%', { x: x2 + 0.4, y: 3.45, w: cw - 0.8, h: 1.3, fontFace: FH, fontSize: 80, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'if over 45, hypertensive, with a deep bleed', { x: x2 + 0.4, y: 4.8, w: cw - 0.8, h: 1.2, fontSize: 24, bold: true, color: C.INK });
  source(s, 'Prospective; 206 patients, all had catheter angiography (Zhu et al., 1997). Other secondary causes on the handout.');
  footer(s, 1);
}

function sAvalanche() {
  const s = newSlide('02 · The first hours', 'avalanche');
  kicker(s, '02 · The first hours');
  tag(s, 'Autopsy series · mechanism, not frequency');
  title(s, 'One rupture can trigger more');
  const w = (CW - 0.9) / 4, cy = 3.55;
  ['Rupture', 'Haematoma', 'Avalanche', 'Tamponade'].forEach((hd, i) => {
    const x = MX + i * (w + 0.3), cx = x + w / 2;
    card(s, x, 1.95, w, 3.2, C.MIST2);
    if (i === 0) {
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.3, y: cy - 0.2, w: w - 0.6, h: 0.4, fill: { color: C.RED }, line: { color: C.WALL, width: 4 } });
      circle(s, cx - 0.33, cy - 0.85, 0.66, C.RED);
      circle(s, cx + 0.3, cy - 1.05, 0.24, C.RED);
      circle(s, cx - 0.55, cy - 0.98, 0.17, C.RED);
    } else {
      const d = i === 1 ? 1.35 : 1.5;
      if (i === 1) line(s, x + 0.25, cy, cx - d / 2, cy, C.WALL, 5);
      if (i === 2) {
        for (let k = 0; k < 7; k++) {
          const t = (k / 7) * Math.PI * 2 + 0.4;
          const x1 = cx + 0.7 * Math.cos(t), y1 = cy + 0.7 * Math.sin(t);
          const x2 = cx + 1.15 * Math.cos(t), y2 = cy + 1.1 * Math.sin(t);
          line(s, x1, y1, x2, y2, C.WALL, 3);
          circle(s, x2 - 0.11, y2 - 0.11, 0.22, C.RED);
        }
      }
      if (i === 3) ring(s, cx - 0.98, cy - 0.98, 1.96, C.INK, 2.5, 'dash');
      circle(s, cx - d / 2, cy - d / 2, d, C.RED);
    }
    if (i < 3) T(s, '›', { x: x + w + 0.02, y: cy - 0.4, w: 0.26, h: 0.7, fontSize: 40, bold: true, color: C.GRID, align: 'center', valign: 'middle' });
    badge(s, i + 1, x, 5.45, 0.56, C.RED, 20);
    T(s, hd, { x: x + 0.7, y: 5.45, w: w - 0.7, h: 0.56, fontSize: 26, bold: true, color: C.INK, valign: 'middle' });
  });
  source(s, 'Secondary bleeding points at the edge of the haematoma (Fisher, 1971).');
  footer(s, 2);
}

function waffle(s, colored) {
  const d = 0.32, pitch = 0.4, x0 = 0.85, y0 = 1.95;
  for (let k = 0; k < 100; k++) {
    const r = Math.floor(k / 10), c = k % 10;
    const col = !colored ? C.DOT : k < 26 ? C.RED_D : k < 38 ? C.RED_L : C.DOT;
    circle(s, x0 + c * pitch, y0 + r * pitch, d, col, { objectName: `!!d${String(k).padStart(2, '0')}`, line: { color: col, width: 0.5 } });
  }
  T(s, 'Each dot = one patient, scanned within 3 hours of onset', { x: x0, y: y0 + 10 * pitch + 0.05, w: 4.4, h: 0.3, fontSize: 12, italic: true, color: C.MUTED, valign: 'middle', objectName: '!!dotcap' });
}
function sPredict() {
  const s = newSlide('02 · The first hours', 'predict');
  kicker(s, 'Your turn  ·  hands up');
  title(s, 'How many bleeds keep growing?');
  waffle(s, false);
  const x = 6.2;
  [['A', '5'], ['B', '15'], ['C', '40']].forEach(([l, v], i) => {
    const y = 2.1 + i * 1.3;
    card(s, x, y, 5.6, 1.05, C.MIST);
    badge(s, l, x + 0.25, y + 0.2, 0.65, C.INK, 22);
    T(s, `${v} in 100`, { x: x + 1.2, y, w: 4, h: 1.05, fontSize: 32, bold: true, color: C.INK, valign: 'middle' });
  });
  footer(s, 2);
}
function sReveal() {
  const s = newSlide('02 · The first hours', 'reveal', { morph: true });
  kicker(s, 'Your turn  ·  hands up');
  tag(s, 'Prospective · n = 103 · within 3 h');
  title(s, '38 in 100 keep growing', { color: C.RED });
  waffle(s, true);
  const x = 6.2, w = W - MX - x;
  [[C.RED_D, '26 grew within the first hour'], [C.RED_L, '12 more grew within 20 hours'], [C.DOT, '62 did not grow substantially']].forEach(([col, t], i) => {
    const y = 2.15 + i * 0.7;
    circle(s, x, y + 0.08, 0.36, col);
    T(s, t, { x: x + 0.6, y, w: w - 0.6, h: 0.52, fontSize: 22, valign: 'middle' });
  });
  card(s, x, 4.45, w, 1.85, C.INK);
  T(s, [
    { text: 'Jill: four hours', options: { bold: true, color: C.WHITE, breakLine: true } },
    { text: 'from headache to losing her speech', options: { color: C.ON_DARK } },
  ], { x: x + 0.4, y: 4.45, w: w - 0.8, h: 1.85, fontSize: 24, valign: 'middle' });
  source(s, 'Growth > 33%, n = 103 (Brott et al., 1997). Every 10% of growth: +5% hazard of death (Davis et al., 2006).');
  footer(s, 2);
}

function golfBall(s, cx, cy, D) {
  s.addShape(pres.shapes.OVAL, { x: cx - D * 0.42, y: cy + D * 0.44, w: D * 0.84, h: D * 0.14, fill: { color: '000000', transparency: 55 }, line: { color: '000000', transparency: 100, width: 0.5 } });
  circle(s, cx - D / 2, cy - D / 2, D, 'FAFBFC', { line: { color: 'D5DCE5', width: 1 } });
  const dd = D * 0.075, step = D * 0.11, r = D / 2 - dd * 0.9;
  for (let row = -6; row <= 6; row++) {
    for (let col = -6; col <= 6; col++) {
      const x = col * step + (row % 2 ? step / 2 : 0), y = row * step * 0.87;
      const dist = Math.hypot(x, y);
      if (dist > r) continue;
      const k = 1 - 0.35 * (dist / r) ** 2; // foreshorten towards the rim
      circle(s, cx + x - (dd * k) / 2, cy + y - (dd * k) / 2, dd * k, 'DCE2EA');
    }
  }
  soft(s, cx - D * 0.36, cy - D * 0.4, D * 0.42, C.WHITE, 45);
}
function sGolf() {
  const s = newSlide('02 · The first hours', 'golf', { bg: C.INK });
  kicker(s, '02 · The first hours', C.RED_ON_DARK);
  tag(s, 'Cohort · n = 188 · 1990s care', { dark: true });
  title(s, "Jill's clot was the size of a golf ball", { color: C.WHITE });
  const cx = 3.4, cy = 4.1, D = 3.1, D60 = D * Math.cbrt(60 / 40.7);
  ring(s, cx - D60 / 2, cy - D60 / 2, D60, C.RED_ON_DARK, 2, 'dash');
  golfBall(s, cx, cy, D);
  T(s, '60 mL', { x: cx + D60 * 0.36, y: cy - D60 / 2 - 0.2, w: 1.4, h: 0.4, fontSize: 18, bold: true, color: C.RED_ON_DARK, valign: 'middle' });
  const x = 6.6, w = W - MX - x;
  T(s, 'A golf ball ≈ 40 mL', { x, y: 1.95, w, h: 0.95, fontFace: FH, fontSize: 44, bold: true, color: C.WHITE, valign: 'middle' });
  T(s, [
    { text: '60 mL + GCS ≤ 8: ', options: { color: C.ON_DARK } },
    { text: '91% predicted 30-day mortality', options: { bold: true, color: C.RED_ON_DARK } },
  ], { x, y: 3.1, w, h: 1.1, fontSize: 26 });
  card(s, x, 4.5, w, 1.75, C.INK_2);
  T(s, 'A clot that grows by a third looks only 10% wider on a scan.', { x: x + 0.4, y: 4.5, w: w - 0.8, h: 1.75, fontSize: 26, bold: true, color: C.WHITE, valign: 'middle' });
  source(s, 'Volume and 30-day mortality, n = 188 (Broderick et al., 1993). Clot size (Taylor, 2008b). A golf ball is 42.7 mm across (about 40.7 mL).', true);
  footer(s, 2, true);
}

function sMass() {
  const s = newSlide('02 · The first hours', 'mass');
  kicker(s, '02 · The first hours');
  tag(s, 'Review of cohort data');
  title(s, 'The skull is a closed box');
  const cx = 3.1, cy = 4.15;
  [[4.3, 'EEF1F5'], [3.2, 'DCE3EB'], [2.1, C.BLUSH]].forEach(([dd, col]) => circle(s, cx - dd / 2, cy - dd / 2, dd, col));
  circle(s, cx - 0.55, cy - 0.55, 1.1, C.RED);
  const labels = [[1.88, 1.75, 'Shift and herniation'], [1.33, 1.25, 'Raised pressure'], [0.8, 0.7, 'Compression'], [0.3, 0, 'The clot']];
  labels.forEach(([rm, dy, tx], i) => {
    const y = cy - dy, xs = cx + Math.sqrt(Math.max(rm * rm - dy * dy, 0));
    circle(s, xs - 0.06, y - 0.06, 0.12, C.INK);
    line(s, xs, y, 5.6, y, C.MUTED, 1);
    T(s, tx, { x: 5.7, y: y - 0.27, w: 2.6, h: 0.54, fontSize: 20, bold: i === 3, color: i === 3 ? C.RED : C.TEXT, valign: 'middle' });
  });
  const x = 8.55, w = W - MX - x;
  card(s, x, 2.0, w, 4.3, C.MIST);
  T(s, '≈45%', { x: x + 0.4, y: 2.35, w: w - 0.8, h: 1.4, fontFace: FH, fontSize: 72, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'break into the ventricles', { x: x + 0.4, y: 3.8, w: w - 0.8, h: 0.95, fontSize: 24, bold: true, color: C.INK });
  T(s, '→ hydrocephalus, worse outcome', { x: x + 0.4, y: 4.6, w: w - 0.8, h: 0.95, fontSize: 20, color: C.SLATE });
  source(s, 'Intraventricular extension and outcome (Hanley, 2009).');
  footer(s, 2);
}

function sTimeline() {
  const s = newSlide('03 · The days after', 'timeline');
  kicker(s, '03 · The days after');
  tag(s, 'Serial CT · hyperacute ICH');
  title(s, 'Oedema builds in waves');
  const y = 3.25;
  line(s, 0.9, y, 12.45, y, C.GRID, 3, true);
  const pts = [['Hours', 'Clot retracts', 0.5, C.BLUSH], ['Days 1–2', 'Thrombin', 0.7, C.RED_L], ['Day 3+', 'Iron', 0.9, C.RED], ['Weeks', 'Clearance', 1.1, C.RED_D]];
  const colW = 2.9;
  pts.forEach(([when, what, d, col], i) => {
    const x = MX + 0.15 + i * (colW + 0.15), cx = x + 0.55;
    T(s, when, { x, y: 1.95, w: colW, h: 0.5, fontSize: 22, bold: true, color: C.SLATE, valign: 'middle' });
    circle(s, cx - d / 2, y - d / 2, d, col, { line: { color: C.WHITE, width: 2.5 } });
    T(s, what, { x, y: 4.0, w: colW, h: 0.6, fontSize: 28, bold: true, color: C.INK });
  });
  card(s, MX, 5.0, 7.3, 1.3, C.BLUSH);
  T(s, [{ text: '+75% ', options: { bold: true, color: C.RED, fontSize: 36, fontFace: FH } }, { text: 'oedema in the first 24 hours', options: { bold: true, color: C.RED_D } }], { x: MX + 0.35, y: 5.0, w: 6.8, h: 1.3, fontSize: 22, valign: 'middle' });
  card(s, MX + 7.6, 5.0, CW - 7.6, 1.3, C.INK);
  T(s, 'Jill: surgery 17 days later', { x: MX + 7.95, y: 5.0, w: CW - 8.3, h: 1.3, fontSize: 22, bold: true, color: C.WHITE, valign: 'middle' });
  source(s, 'Oedema mechanisms (Xi et al., 2006); +75% in 24 h (Gebel et al., 2002); timing of Jill\'s surgery (Taylor, 2008b).');
  footer(s, 3);
}

function sCascade() {
  const s = newSlide('03 · The days after', 'cascade');
  kicker(s, '03 · The days after');
  tag(s, 'Mostly animal models · not yet a treatment');
  title(s, 'Three toxins, one result');
  const items = [['FaFlask', 'Thrombin'], ['FaAtom', 'Iron'], ['FaFire', 'Inflammation']];
  const w = (CW - 0.6) / 3;
  items.forEach(([ic, t], i) => {
    const x = MX + i * (w + 0.3), cx = x + w / 2;
    iconCircle(s, ic, cx - 0.8, 1.95, 1.6, C.RED);
    T(s, t, { x, y: 3.7, w, h: 0.65, fontSize: 30, bold: true, color: C.INK, align: 'center', valign: 'middle' });
    line(s, cx, 4.45, cx, 5.0, C.MUTED, 2, true);
  });
  card(s, MX, 5.1, CW, 1.2, C.INK);
  T(s, 'Leaky barrier   →   more oedema   →   neuronal death', { x: MX, y: 5.1, w: CW, h: 1.2, fontSize: 30, bold: true, color: C.WHITE, align: 'center', valign: 'middle' });
  source(s, 'Mechanisms (Xi et al., 2006). The deferoxamine trial i-DEF was neutral (Selim et al., 2019).');
  footer(s, 3);
}

function sMyth1() {
  const s = newSlide('03 · The days after', 'myth1');
  kicker(s, 'Your turn  ·  true or false?');
  title(s, 'True or false?');
  card(s, MX, 2.1, CW, 3.2, C.MIST, '!!claimcard');
  T(s, '“The rim around the clot is starving tissue.”', { x: MX + 0.6, y: 2.1, w: CW - 1.2, h: 3.2, fontFace: FH, fontSize: 44, bold: true, italic: true, color: C.INK, valign: 'middle', align: 'center', objectName: '!!claim' });
  footer(s, 3);
}
function sMyth2() {
  const s = newSlide('03 · The days after', 'myth2', { morph: true });
  kicker(s, 'Your turn  ·  true or false?');
  tag(s, 'PET n = 19, then RCT n = 75');
  title(s, 'False: the rim is resting, not starving', { color: C.RED });
  card(s, MX, 1.95, 4.4, 4.35, C.MIST, '!!claimcard');
  T(s, '“The rim around the clot is starving tissue.”', { x: MX + 0.35, y: 1.95, w: 3.7, h: 2.3, fontFace: FH, fontSize: 24, bold: true, italic: true, color: C.MUTED, valign: 'middle', objectName: '!!claim' });
  T(s, 'Lowering BP below 150 did not reduce flow around the clot (ICH ADAPT).', { x: MX + 0.35, y: 4.3, w: 3.7, h: 1.8, fontSize: 20, bold: true, color: C.INK });
  const x = 5.4, cw = W - MX - x;
  T(s, 'Rim vs the same area on the other side (PET)', { x, y: 1.95, w: cw, h: 0.45, fontSize: 18, bold: true, color: C.INK, valign: 'middle' });
  s.addChart(pres.charts.BAR, [
    { name: 'Other side', labels: ['Blood flow', 'Oxygen use'], values: [100, 100] },
    { name: 'Rim around the clot', labels: ['Blood flow', 'Oxygen use'], values: [56, 48] },
  ], {
    x, y: 2.4, w: cw, h: 3.95, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 55,
    chartColors: ['C3CEDB', C.RED], showValue: true, dataLabelFormatCode: '0"%"', dataLabelPosition: 'outEnd',
    dataLabelFontSize: 18, dataLabelFontFace: FB, dataLabelColor: C.TEXT, dataLabelFontBold: true,
    catAxisLabelFontFace: FB, catAxisLabelFontSize: 20, catAxisLabelColor: C.TEXT, catAxisLineShow: true,
    catAxisLineColor: C.GRID, valAxisHidden: true, valAxisMaxVal: 120, valAxisMinVal: 0,
    valGridLine: { style: 'none' }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendFontFace: FB, legendFontSize: 16, legendColor: C.TEXT,
  });
  source(s, 'PET, n = 19, 5–22 h after onset (Zazulia et al., 2001); ICH ADAPT randomised trial, n = 75 (Butcher et al., 2013).');
  footer(s, 3);
}

function sTiming() {
  const s = newSlide('04 · At the bedside', 'timing');
  kicker(s, '04 · At the bedside  ·  when to start');
  tag(s, 'RCTs · mostly small · low certainty');
  title(s, 'Early helps; very early and intense may not');
  const x0 = 0.9, x1 = 12.2, hx = (h) => x0 + ((x1 - x0) * h) / 72;
  const rows = [
    ['AVERT Trial Collaboration Group (2015)  ·  RCT  ·  n = 2104  ·  infarcts and bleeds', 'High dose within 24 h: fewer good outcomes (46% vs 50%)', 0, 24, C.RED],
    ['Liu et al. (2014)  ·  RCT  ·  n = 243  ·  ICH', 'Rehab started within 48 h: better MBI, fewer deaths', 0, 48, C.SLATE],
    ['Yen et al. (2020)  ·  RCT  ·  n = 60  ·  mild to moderate ICH', 'Out of bed at 24–72 h: better FIM-motor and walking', 24, 72, C.INK],
  ];
  rows.forEach(([who, what, a, b, col], i) => {
    const y = 1.9 + i * 1.03, xa = hx(a);
    T(s, who, { x: xa, y, w: x1 - xa + 0.5, h: 0.3, fontSize: 14, bold: true, color: C.MUTED, valign: 'middle' });
    T(s, what, { x: xa, y: y + 0.3, w: x1 - xa + 0.5, h: 0.42, fontSize: 20, bold: true, color: col === C.RED ? C.RED_D : C.INK, valign: 'middle' });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: xa, y: y + 0.77, w: hx(b) - xa, h: 0.2, fill: { color: col }, line: { color: col, width: 0.5 }, rectRadius: 0.1 });
  });
  const ay = 5.05;
  line(s, x0, ay, x1 + 0.35, ay, C.GRID, 2, true);
  [0, 24, 48, 72].forEach((h) => {
    line(s, hx(h), ay - 0.09, hx(h), ay + 0.09, C.MUTED, 1.5);
    T(s, `${h} h`, { x: hx(h) - 0.5, y: ay + 0.12, w: 1.0, h: 0.28, fontSize: 14, bold: true, color: C.MUTED, align: 'center', valign: 'middle' });
  });
  card(s, MX, 5.55, CW, 0.82, C.INK);
  T(s, [{ text: 'Short and frequent ', options: { bold: true, color: C.WHITE } }, { text: 'sessions did better (Bernhardt et al., 2016)', options: { color: C.ON_DARK } }], { x: MX + 0.35, y: 5.55, w: 7.6, h: 0.82, fontSize: 19, valign: 'middle' });
  T(s, 'Certainty: low (Kan et al., 2026)', { x: MX + 8.1, y: 5.55, w: CW - 8.35, h: 0.82, fontSize: 18, bold: true, color: C.RED_ON_DARK, align: 'right', valign: 'middle' });
  source(s, 'Kan et al. (2026): 17 RCTs, n = 1396. Blood pressure variability was unchanged with early mobilisation (Yen et al., 2021).');
  footer(s, 4);
}

function sDay4a() {
  const s = newSlide('04 · At the bedside', 'day4a');
  kicker(s, 'Your turn  ·  clinical reasoning');
  title(s, 'Day 4: drowsier than yesterday');
  const lw = 4.7;
  card(s, MX, 1.9, lw, 2.75, C.MIST);
  T(s, 'MR K, 68  ·  A COMPOSITE CASE', { x: MX + 0.35, y: 2.05, w: lw - 0.7, h: 0.35, fontSize: 13, bold: true, color: C.SLATE, charSpacing: 2, valign: 'middle' });
  T(s, 'Left putaminal bleed, 22 mL', { x: MX + 0.35, y: 2.42, w: lw - 0.7, h: 0.95, fontSize: 25, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'Long-standing hypertension', { x: MX + 0.35, y: 3.37, w: lw - 0.7, h: 0.42, fontSize: 19, valign: 'middle' });
  line(s, MX + 0.35, 3.92, MX + lw - 0.35, 3.92, C.GRID, 1);
  T(s, 'Yesterday: sat out 20 min, GCS 15', { x: MX + 0.35, y: 4.0, w: lw - 0.7, h: 0.5, fontSize: 18, color: C.SLATE, valign: 'middle' });
  const rx = MX + lw + 0.3, rw = W - MX - rx, cw = (rw - 0.7) / 2;
  card(s, rx, 1.9, rw, 2.75, C.BLUSH);
  T(s, 'TODAY, 9 A.M.', { x: rx + 0.35, y: 2.05, w: rw - 0.7, h: 0.35, fontSize: 13, bold: true, color: C.RED_D, charSpacing: 2, valign: 'middle' });
  ['GCS 13', 'New headache', 'Vomited once', 'BP 184/98'].forEach((t, i) => {
    const cx = rx + 0.35 + (i % 2) * cw, cy = 2.6 + Math.floor(i / 2) * 0.95;
    circle(s, cx, cy + 0.28, 0.2, C.RED);
    T(s, t, { x: cx + 0.38, y: cy, w: cw - 0.45, h: 0.76, fontSize: 28, bold: true, color: C.RED_D, valign: 'middle' });
  });
  T(s, 'Planned: sit-to-stand practice. What do you do?', { x: MX, y: 4.85, w: CW, h: 0.5, fontSize: 22, bold: true, color: C.INK, valign: 'middle' });
  const ow = (CW - 0.6) / 3;
  [['A', 'Go ahead, but shorter'], ['B', 'Bed-level work only'], ['C', 'Hold and escalate']].forEach(([l, t], i) => {
    const x = MX + i * (ow + 0.3), y = 5.5;
    card(s, x, y, ow, 0.82, C.MIST);
    badge(s, l, x + 0.2, y + 0.13, 0.56, C.INK, 20);
    T(s, t, { x: x + 0.95, y, w: ow - 1.05, h: 0.82, fontSize: 21, bold: true, color: C.INK, valign: 'middle' });
  });
  source(s, 'A composite teaching case, not a real patient.');
  footer(s, 4);
}

function sDay4b() {
  const s = newSlide('04 · At the bedside', 'day4b', { morph: true });
  kicker(s, 'Your turn  ·  clinical reasoning');
  title(s, 'C: hold the session and escalate', { color: C.RED });
  const steps = [
    ['Notice', 'GCS down 2. New headache, vomiting, BP up.'],
    ['Interpret', 'Day 4: oedema still building. Or growth? Hydrocephalus?'],
    ['Act', 'Stop. Tell the medical team now. Repeat neuro obs.'],
    ['Reflect', 'The timeline predicted this. Screen before every session.'],
  ];
  const w = (CW - 0.9) / 4;
  steps.forEach(([h, t], i) => {
    const x = MX + i * (w + 0.3), hot = i === 2;
    card(s, x, 1.95, w, 3.15, hot ? C.BLUSH : C.MIST);
    badge(s, i + 1, x + 0.3, 2.2, 0.62, hot ? C.RED : C.INK, 22);
    T(s, h, { x: x + 0.3, y: 2.95, w: w - 0.6, h: 0.6, fontSize: 28, bold: true, color: hot ? C.RED_D : C.INK, valign: 'middle' });
    T(s, t, { x: x + 0.3, y: 3.6, w: w - 0.5, h: 1.4, fontSize: 19 });
    if (i < 3) T(s, '›', { x: x + w + 0.02, y: 3.1, w: 0.26, h: 0.7, fontSize: 40, bold: true, color: C.GRID, align: 'center', valign: 'middle' });
  });
  const c1 = MX + w / 2, c4 = MX + 3 * (w + 0.3) + w / 2, ly = 5.6;
  line(s, c4, 5.1, c4, ly, C.SLATE, 2);
  line(s, c4, ly, c1, ly, C.SLATE, 2);
  line(s, c1, ly, c1, 5.12, C.SLATE, 2, true);
  T(s, 'Repeat before every session', { x: (c1 + c4) / 2 - 2.0, y: ly - 0.22, w: 4.0, h: 0.44, fontSize: 17, bold: true, color: C.SLATE, align: 'center', valign: 'middle', fill: { color: C.WHITE } });
  source(s, 'Clinical reasoning cycle adapted from Levett-Jones et al. (2010).');
  footer(s, 4);
}

function sRecovery() {
  const s = newSlide('04 · At the bedside', 'recovery');
  kicker(s, 'Prognosis  ·  do bleeds recover better?');
  tag(s, 'Observational · confounded by severity');
  title(s, 'It depends what you match');
  const tx = 4.45, tw = 3.75, zc = [tx + tw / 6, tx + tw / 2, tx + (5 * tw) / 6];
  ['ICH worse', 'No difference', 'ICH better'].forEach((l, i) => T(s, l, { x: zc[i] - 0.75, y: 1.92, w: 1.5, h: 0.4, fontSize: 14, bold: true, color: C.MUTED, align: 'center', valign: 'middle' }));
  const rows = [
    ['Kelly et al. (2003)', 'n = 1064  ·  unmatched', 2, 'grey'],
    ['Paolucci et al. (2003)', 'n = 270  ·  matched on the deficit', 2, 'ink'],
    ['Salvadori et al. (2021)', 'n = 229  ·  unmatched', 1, 'grey'],
    ['Oosterveer et al. (2022)', 'n = 360  ·  unmatched', 1, 'grey'],
    ['Balk et al. (2026)', 'n = 194  ·  matched on lesion size, site', 0, 'red'],
  ];
  const ry = (i) => 2.42 + i * 0.78;
  rows.forEach((r, i) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tx, y: ry(i) + 0.12, w: tw, h: 0.46, fill: { color: C.MIST2 }, line: { color: C.MIST2, width: 0.5 }, rectRadius: 0.23 }));
  line(s, zc[1], 2.36, zc[1], 6.3, C.GRID, 1.5, false, 'dash');
  rows.forEach(([who, how, z, k], i) => {
    const y = ry(i), col = k === 'grey' ? 'AEB9C7' : k === 'red' ? C.RED : C.INK;
    T(s, [{ text: who, options: { bold: true, color: C.INK, breakLine: true } }, { text: how, options: { fontSize: 14, bold: k !== 'grey', color: k === 'grey' ? C.MUTED : k === 'red' ? C.RED_D : C.SLATE } }], { x: MX, y, w: 3.8, h: 0.7, fontSize: 18, valign: 'middle' });
    circle(s, zc[z] - 0.2, y + 0.15, 0.4, col);
  });
  const x = 8.7, w = W - MX - x;
  card(s, x, 2.42, w, 1.85, C.MIST);
  T(s, 'MATCH ON THE DEFICIT', { x: x + 0.35, y: 2.55, w: w - 0.7, h: 0.35, fontSize: 13, bold: true, color: C.SLATE, charSpacing: 2, valign: 'middle' });
  T(s, 'ICH looks better', { x: x + 0.35, y: 2.9, w: w - 0.7, h: 0.55, fontSize: 26, bold: true, color: C.INK, valign: 'middle' });
  T(s, 'More of the deficit is pressure, and pressure resolves.', { x: x + 0.35, y: 3.45, w: w - 0.6, h: 0.75, fontSize: 17 });
  card(s, x, 4.45, w, 1.85, C.BLUSH);
  T(s, 'MATCH ON THE LESION', { x: x + 0.35, y: 4.58, w: w - 0.7, h: 0.35, fontSize: 13, bold: true, color: C.RED_D, charSpacing: 2, valign: 'middle' });
  T(s, 'ICH looks worse', { x: x + 0.35, y: 4.93, w: w - 0.7, h: 0.55, fontSize: 26, bold: true, color: C.RED, valign: 'middle' });
  T(s, 'The blood itself is toxic.', { x: x + 0.35, y: 5.48, w: w - 0.6, h: 0.75, fontSize: 17, color: C.RED_D });
  source(s, 'Each dot shows the direction of the main finding, not its size. Severe early deficit is not a fixed ceiling (Yoo & Chung, 2026).');
  footer(s, 4);
}

function sWindows() {
  const s = newSlide('04 · At the bedside', 'windows');
  kicker(s, '04 · At the bedside');
  title(s, 'Every stage is a window to act');
  const rows = [
    ['FaHeartPulse', 'The vessel', 'Before and after', 'Know the cause. Check BP before, during and after activity.'],
    ['FaStopwatch', 'The first hours', 'First 24–72 hours', 'Neuro obs first. Short, gentle sessions; nothing intense.'],
    ['FaFire', 'The days after', 'Days to weeks', 'Screen every session. Expect ups and downs. Drowsy: escalate.'],
    ['FaPersonWalking', 'The months after', 'Weeks to months', 'No early ceiling. Target what the location predicts.'],
  ];
  rows.forEach(([ic, m, when, act], i) => {
    const y = 1.9 + i * 1.12, hot = i === 2;
    card(s, MX, y, CW, 1.0, hot ? C.BLUSH : C.MIST);
    iconCircle(s, ic, MX + 0.25, y + 0.17, 0.66, hot ? C.RED : C.INK);
    T(s, m, { x: 1.75, y: y + 0.06, w: 3.2, h: 0.52, fontSize: 24, bold: true, color: C.INK, valign: 'bottom' });
    T(s, when, { x: 1.75, y: y + 0.6, w: 3.2, h: 0.32, fontSize: 15, bold: true, color: hot ? C.RED_D : C.SLATE, valign: 'top' });
    T(s, act, { x: 4.95, y, w: 7.6, h: 1.0, fontSize: 21, valign: 'middle' });
  });
  source(s, '(AVERT Trial Collaboration Group, 2015; Bernhardt et al., 2016; Levett-Jones et al., 2010; Puig et al., 2019; Yoo & Chung, 2026)');
  footer(s, 4);
}

function sThree() {
  const s = newSlide('04 · At the bedside', 'three');
  kicker(s, 'Summary');
  title(s, 'If you remember three things');
  const items = ['The vessel decides where it bleeds.', 'The first hours decide how big it gets.', 'The blood keeps injuring the brain for days.'];
  items.forEach((t, i) => {
    const y = 2.1 + i * 1.35, d = 0.8 + i * 0.12;
    circle(s, MX + 0.5 - d / 2, y + 0.5 - d / 2, d, C.RED);
    T(s, String(i + 1), { x: MX + 0.5 - d / 2, y: y + 0.5 - d / 2, w: d, h: d, fontSize: 24, bold: true, color: C.WHITE, align: 'center', valign: 'middle' });
    T(s, t, { x: MX + 1.4, y, w: CW - 1.4, h: 1.0, fontFace: FH, fontSize: 34, bold: true, color: C.INK, valign: 'middle' });
  });
  source(s, 'Adapted from Rossi and Cordonnier (2014).');
  footer(s, 4);
}

function sClose() {
  const s = newSlide('Close', 'close', { bg: C.INK, morph: true });
  motif(s, 10.4, 3.75, 0.45, [], 4.4);
  T(s, 'EIGHT YEARS LATER', { x: 0.8, y: 1.2, w: 7, h: 0.4, fontSize: 16, bold: true, color: C.RED_ON_DARK, charSpacing: 4, valign: 'middle' });
  T(s, 'Jill walked onto the TED stage holding a human brain.', { x: 0.8, y: 1.7, w: 7.4, h: 1.5, fontSize: 28, color: C.ON_DARK });
  T(s, 'ICH is a process,\nnot a moment.', { x: 0.8, y: 3.3, w: 7.6, h: 1.7, fontFace: FH, fontSize: 48, bold: true, color: C.WHITE });
  T(s, 'Which claim would you challenge?', { x: 0.8, y: 5.4, w: 7.4, h: 0.6, fontSize: 24, color: C.RED_ON_DARK, bold: true });
  source(s, 'Source: Taylor (2008a, 2008b).', true);
}

// APA 7 reference list: alphabetical, every author (up to 20), hanging indent (added in post-processing).
function refRuns(e, last) {
  const runs = REFS.segments(e).map(({ t, i }) => ({ text: t, options: i ? { italic: true } : {} }));
  runs[runs.length - 1].options.breakLine = !last;
  return runs;
}
function sRefs() {
  const list = REFS.sorted();
  // paginate: estimate wrapped lines per entry for a 12 pt column 5.95 in wide (about 88 characters a line)
  const lines = (e) => Math.ceil(REFS.toPlain(e).length / 92) + 0.37;
  const colCap = 24.4, cols = [];
  let cur = [], used = 0;
  for (const e of list) {
    const l = lines(e);
    if (used + l > colCap && cur.length) { cols.push(cur); cur = []; used = 0; }
    cur.push(e); used += l;
  }
  if (cur.length) cols.push(cur);
  const pages = Math.ceil(cols.length / 2);
  for (let p = 0; p < pages; p++) {
    const s = newSlide('Close', p === 0 ? 'refs' : 'refs2');
    kicker(s, `Sources  ·  APA 7th edition  ·  ${p + 1} of ${pages}`);
    title(s, 'References');
    [cols[2 * p], cols[2 * p + 1]].forEach((col, j) => {
      if (!col) return;
      const runs = col.flatMap((e, k) => refRuns(e, k === col.length - 1));
      s.addText(runs, { x: MX + j * 6.18, y: 1.8, w: 5.95, h: 5.0, fontFace: FB, fontSize: 12, color: C.TEXT, margin: 0, valign: 'top', paraSpaceAfter: 5, isTextBox: true, objectName: `apaRefs${p}_${j}` });
    });
  }
}

function sBackupCauses() {
  const s = newSlide('Backup', 'backupCauses', { hidden: true });
  kicker(s, 'Backup  ·  if asked', C.SLATE);
  title(s, 'Other causes of a secondary bleed');
  const items = [['FaCodeBranch', 'Vascular malformations'], ['FaPills', 'Antithrombotic drugs'], ['FaDisease', 'Tumours'], ['FaWater', 'Venous thrombosis'], ['FaRotate', 'Haemorrhagic transformation'], ['FaSyringe', 'Drugs, vasculitis, RCVS, moyamoya']];
  const w = (CW - 0.6) / 3, h = 2.0;
  items.forEach(([ic, t], i) => {
    const x = MX + (i % 3) * (w + 0.3), y = 2.0 + Math.floor(i / 3) * (h + 0.25);
    card(s, x, y, w, h, C.MIST2);
    iconCircle(s, ic, x + 0.3, y + 0.3, 0.7, C.INK);
    T(s, t, { x: x + 0.3, y: y + 1.1, w: w - 0.6, h: 0.8, fontSize: 22, bold: true, color: C.INK });
  });
  source(s, 'Causes of secondary intracerebral haemorrhage (Macellari et al., 2014).');
  footer(s, 1);
}
function sBackupNew() {
  const s = newSlide('Backup', 'backupNew', { hidden: true });
  kicker(s, 'Backup  ·  beyond the 2014 chapter', C.SLATE);
  title(s, 'What has changed since the book');
  const items = [['2022', 'Boston criteria v2.0', 'White-matter MRI markers added'], ['2023', 'INTERACT3', 'Care bundle improved 6-month function'], ['2024', 'ENRICH', 'Early minimally invasive surgery helped lobar bleeds'], ['2024', 'ANNEXA-I', 'Andexanet: better haemostasis, more thrombosis']];
  const w = (CW - 0.3) / 2, h = 2.0;
  items.forEach(([yr, hd, tx], i) => {
    const x = MX + (i % 2) * (w + 0.3), y = 2.0 + Math.floor(i / 2) * (h + 0.25);
    card(s, x, y, w, h, i % 3 === 0 ? C.MIST : C.MIST2);
    pill(s, yr, x + 0.3, y + 0.35, 1.0, 0.46, C.INK, C.WHITE, 16);
    T(s, hd, { x: x + 1.5, y: y + 0.3, w: w - 1.8, h: 0.56, fontSize: 26, bold: true, color: C.INK, valign: 'middle' });
    T(s, tx, { x: x + 0.3, y: y + 1.05, w: w - 0.6, h: 0.8, fontSize: 20 });
  });
  source(s, '(Charidimou et al., 2022; Connolly et al., 2024; Ma et al., 2023; Pradilla et al., 2024)');
  footer(s, 0);
}

// ---------- transitions ----------
const FADE = '<p:transition spd="med"><p:fade/></p:transition>';
const MORPH = '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">' +
  '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">' +
  '<p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="1000"><p159:morph option="byObject"/></p:transition>' +
  '</mc:Choice><mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>';
async function addTransitions(buf) {
  const zip = await JSZip.loadAsync(buf);
  for (const f of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const n = parseInt(f.match(/slide(\d+)\.xml/)[1], 10);
    let xml = await zip.file(f).async('string');
    const tr = morphSlides.includes(n) ? MORPH : FADE;
    xml = xml.replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?name="apaRefs[\s\S]*?<\/p:sp>/g, (sp) => sp.replace(/indent="0" marL="0"/g, 'indent="-228600" marL="228600"'));
    xml = xml.includes('</p:clrMapOvr>') ? xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + tr) : xml.replace('</p:cSld>', '</p:cSld>' + tr);
    zip.file(f, xml);
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

(async () => {
  for (const n of ['FaUser', 'FaHeartPulse', 'FaBrain', 'FaStopwatch', 'FaFire', 'FaFlask', 'FaAtom', 'FaCodeBranch', 'FaPills', 'FaDisease', 'FaWater', 'FaRotate', 'FaSyringe', 'FaPersonWalking']) I[n] = await iconPng(n);
  I.magSlate = await iconPng('FaMagnifyingGlass', '#3E5C76');
  I.magDark = await iconPng('FaMagnifyingGlass', '#C9D3E0');
  const deep = [{ x: 208, y: 330, r: 34, seed: 1.2 }, { x: 336, y: 408, r: 21, seed: 2.1 }];
  IMG.mapDeep = await svgToPng(brainSVG({ bleeds: deep }), 1400);
  IMG.mapAll = await svgToPng(brainSVG({ bleeds: [...deep, { x: 452, y: 222, r: 38, seed: 0.4 }] }), 1400);
  IMG.lobar = await svgToPng(brainSVG({ dots: lobarDots() }), 900);
  IMG.deep = await svgToPng(brainSVG({ dots: deepDots() }), 900);

  sTitle(); sHook1(); sHook2(); sStat(); sBigIdea(); sObjectives();
  sDivider(1, 'div1', '01', 'The vessel', 'Why does a small artery give way?', 1.4, []);
  sSmashU(); sVessels(); mapSlide('map1', false); mapSlide('map2', true); sLocation(); sMicrobleeds(); sCase1(); sCase2();
  sDivider(2, 'div2', '02', 'The first hours', 'Rupture, growth and pressure', 2.2, [[2.9, 85]]);
  sAvalanche(); sPredict(); sReveal(); sGolf(); sMass();
  sDivider(3, 'div3', '03', 'The days after', 'When the blood becomes a toxin', 2.7, [[4.2, 88], [3.5, 78]]);
  sTimeline(); sCascade(); sMyth1(); sMyth2();
  sDivider(4, 'div4', '04', 'At the bedside', 'What it means for physiotherapy', 2.7, [[4.6, 90], [3.7, 80]]);
  sTiming(); sDay4a(); sDay4b(); sRecovery(); sWindows(); sThree(); sClose(); sRefs(); sBackupCauses(); sBackupNew();

  const buf = await pres.write({ outputType: 'nodebuffer' });
  fs.writeFileSync(OUT, await addTransitions(buf));
  console.log('Wrote', OUT, 'slides:', slideNo, 'morph:', morphSlides.join(','));
})().catch((e) => { console.error(e); process.exit(1); });
