// Visual assets: icon rasteriser and schematic brain illustrations (SVG -> PNG).
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');

async function iconPng(name, color = '#FFFFFF', size = 256) {
  const Comp = fa[name];
  if (!Comp) throw new Error('Missing icon: ' + name);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color, size: String(size) })
  );
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

// Smooth closed path through points (Catmull-Rom -> cubic Bezier).
function smoothPath(pts) {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
}

function blobPath(cx, cy, r, seed) {
  const pts = [];
  const n = 28;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.1 * Math.sin(3 * t + seed) + 0.06 * Math.cos(5 * t + seed * 2.3));
    pts.push([cx + rr * Math.cos(t), cy + rr * Math.sin(t)]);
  }
  return smoothPath(pts);
}

// Schematic axial brain section. viewBox 600 x 700.
// bleeds: [{x, y, r, seed}] ; dots: [[x, y]] microbleeds
function brainSVG({ bleeds = [], dots = [] } = {}) {
  const cx = 300, cy = 350, ex = 226, ey = 282;
  const brain = 'M300,68 C420,68 522,170 526,360 C530,520 440,632 300,632 C160,632 70,520 74,360 C78,170 180,68 300,68 Z';
  let sulci = '';
  const N = 46;
  for (let k = 0; k < N; k++) {
    const t = (k / N) * Math.PI * 2;
    if (Math.abs(Math.sin(t)) < 0.14) continue; // keep midline clear
    const o = 0.965, i = 0.87 + 0.03 * Math.sin(k * 1.7);
    const x1 = cx + ex * o * Math.sin(t), y1 = cy - ey * o * Math.cos(t);
    const x2 = cx + ex * i * Math.sin(t), y2 = cy - ey * i * Math.cos(t);
    sulci += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#D2DAE4" stroke-width="4" stroke-linecap="round"/>`;
  }
  const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${(600 - parseFloat(x)).toFixed(1)},${y}`);
  const hornL = 'M292,212 C268,214 247,240 245,276 C243,312 255,342 276,354 C287,360 293,350 293,338 Z';
  const atrL = 'M288,440 C262,448 248,480 258,512 C264,528 280,526 283,510 C286,486 292,462 296,448 Z';
  const ventricles = [hornL, mirror(hornL), atrL, mirror(atrL)]
    .map((d) => `<path d="${d}" fill="#C9D5E4"/>`).join('') +
    '<rect x="296" y="362" width="8" height="58" rx="4" fill="#C9D5E4"/>';
  const deep =
    '<ellipse cx="205" cy="335" rx="30" ry="62" transform="rotate(-12 205 335)" fill="#DCE3EC" stroke="#BAC6D4" stroke-width="2"/>' +
    '<ellipse cx="395" cy="335" rx="30" ry="62" transform="rotate(12 395 335)" fill="#DCE3EC" stroke="#BAC6D4" stroke-width="2"/>' +
    '<ellipse cx="266" cy="408" rx="27" ry="40" fill="#DCE3EC" stroke="#BAC6D4" stroke-width="2"/>' +
    '<ellipse cx="334" cy="408" rx="27" ry="40" fill="#DCE3EC" stroke="#BAC6D4" stroke-width="2"/>';
  const bleedSvg = bleeds.map((b) =>
    `<circle cx="${b.x}" cy="${b.y}" r="${(b.r * 1.42).toFixed(1)}" fill="#F4D6D7" opacity="0.95"/>` +
    `<path d="${blobPath(b.x, b.y, b.r, b.seed || 1)}" fill="url(#bleed)"/>`
  ).join('');
  const dotSvg = dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#1B2230"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <radialGradient id="bleed" cx="42%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#E4575C"/>
      <stop offset="100%" stop-color="#8E1B1F"/>
    </radialGradient>
  </defs>
  <ellipse cx="300" cy="350" rx="254" ry="314" fill="#FFFFFF" stroke="#C9D2DE" stroke-width="14"/>
  <path d="${brain}" fill="#EEF2F6" stroke="#AEBBCB" stroke-width="3"/>
  ${sulci}
  <line x1="300" y1="70" x2="300" y2="196" stroke="#AEBBCB" stroke-width="3"/>
  <line x1="300" y1="522" x2="300" y2="630" stroke="#AEBBCB" stroke-width="3"/>
  ${ventricles}
  ${deep}
  ${bleedSvg}
  ${dotSvg}
</svg>`;
}

async function svgToPng(svg, width = 1200) {
  const buf = await sharp(Buffer.from(svg)).resize({ width }).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

// Points on the cortical ribbon for lobar microbleeds (angles in degrees from top, clockwise).
function lobarDots() {
  const cx = 300, cy = 350, ex = 226, ey = 282;
  const spec = [[32, 0.9], [55, 0.86], [78, 0.91], [102, 0.87], [126, 0.9], [150, 0.86],
    [208, 0.89], [233, 0.86], [256, 0.91], [281, 0.87], [306, 0.9], [330, 0.86], [66, 0.8], [292, 0.8]];
  return spec.map(([deg, f]) => {
    const t = (deg * Math.PI) / 180;
    return [Math.round(cx + ex * f * Math.sin(t)), Math.round(cy - ey * f * Math.cos(t))];
  });
}

function deepDots() {
  return [[212, 298], [198, 352], [226, 338], [388, 306], [404, 350], [380, 372],
    [262, 392], [272, 426], [338, 396], [330, 430], [300, 470]];
}

module.exports = { iconPng, brainSVG, svgToPng, lobarDots, deepDots };
