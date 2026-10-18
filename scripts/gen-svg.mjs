// Generates the animated profile header and footer (dark and light).
// The 3D scene (tilted rotating planet, orbit ring, perspective floor) is computed here and baked
// into SVG: GitHub READMEs run no JavaScript, but they do play SVG/SMIL and CSS animation.
// Usage: node scripts/gen-svg.mjs assets
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "assets";
mkdirSync(out, { recursive: true });

// Edit these when your numbers change.
const CHIPS = [["16", "merged OSS PRs"], ["7", "live projects"], ["TS", "first"]];
const ROLES = [
  "Full-stack TypeScript developer",
  "Open-source contributor · LibreDB · Lingui",
  "Next.js · Node.js · Supabase · Three.js",
];

const themes = {
  dark: {
    bg1: "#070b18", bg2: "#0f1830", muted: "#9fb0c3", chip: "#141f38", chipText: "#c9d6e3",
    a1: "#2dd4bf", a2: "#8b5cf6", a3: "#38bdf8", line: "#24345a", star: "#e6edf3",
    body0: "#1d3157", body1: "#0a1328", grid: "#38bdf8",
  },
  light: {
    bg1: "#f7f9fd", bg2: "#e9effa", muted: "#475569", chip: "#ffffff", chipText: "#1e293b",
    a1: "#0d9488", a2: "#7c3aed", a3: "#0284c7", line: "#d4dcea", star: "#7c3aed",
    body0: "#ffffff", body1: "#d6e2f5", grid: "#0284c7",
  },
};
const font = "'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const mono = "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace";

const W = 1200;
const H = 320;
const deg = Math.PI / 180;
const f1 = (n) => (Math.round(n * 10) / 10).toString();

// ----------------------------------------------------------------------------
// 3D planet
// ----------------------------------------------------------------------------
const PLANET = { cx: 955, cy: 150, r: 96, tilt: 22 * deg, roll: -16 * deg };

/** Unit-sphere point (lat, lon) after spinning the planet by `spin` about its own axis. */
function spherePoint(lat, lon, spin) {
  const L = lon + spin;
  return [Math.cos(lat) * Math.sin(L), Math.sin(lat), Math.cos(lat) * Math.cos(L)];
}

/** Axial tilt toward the viewer, then an in-plane roll; returns [screenX, screenY, depth]. */
function project([x, y, z], { cx, cy, r, tilt, roll }) {
  const y1 = y * Math.cos(tilt) - z * Math.sin(tilt);
  const z1 = y * Math.sin(tilt) + z * Math.cos(tilt);
  const x2 = x * Math.cos(roll) - y1 * Math.sin(roll);
  const y2 = x * Math.sin(roll) + y1 * Math.cos(roll);
  return [cx + r * x2, cy - r * y2, z1];
}

/**
 * A half meridian (north pole to south pole) as 6 cubic Beziers. Each 30-degree arc is
 * approximated in 3D (k = 4/3 tan(theta/4)) and then projected; orthographic projection is
 * affine, so the projected Beziers are exact images of the 3D ones.
 */
function meridian(lon, spin) {
  const seg = 30 * deg;
  const k = (4 / 3) * Math.tan(seg / 4);
  const pts = [];
  let depth = 0;
  for (let i = 0; i < 6; i++) {
    const a = 90 * deg - i * seg;
    const b = a - seg;
    const P0 = spherePoint(a, lon, spin);
    const P3 = spherePoint(b, lon, spin);
    // Tangent along decreasing latitude: -(d/d lat).
    const tan = (lat) => {
      const L = lon + spin;
      return [Math.sin(lat) * Math.sin(L), -Math.cos(lat), Math.sin(lat) * Math.cos(L)];
    };
    const T0 = tan(a);
    const T3 = tan(b);
    const P1 = P0.map((v, j) => v + k * T0[j]);
    const P2 = P3.map((v, j) => v - k * T3[j]);
    const [p0, p1, p2, p3] = [P0, P1, P2, P3].map((p) => project(p, PLANET));
    if (i === 0) pts.push(`M${f1(p0[0])} ${f1(p0[1])}`);
    pts.push(`C${f1(p1[0])} ${f1(p1[1])} ${f1(p2[0])} ${f1(p2[1])} ${f1(p3[0])} ${f1(p3[1])}`);
    depth += p0[2] + p3[2];
  }
  return { d: pts.join(""), depth: depth / 12 };
}

/** Opacity from depth: lines on the far side fade, lines facing the viewer glow. */
function depthOpacity(z) {
  const t = Math.min(1, Math.max(0, (z + 0.3) / 0.75));
  const s = t * t * (3 - 2 * t);
  return (0.1 + 0.85 * s).toFixed(3);
}

/** Split a sampled 3D loop into front (depth > 0) and back paths. */
function splitLoop(points3d, proj) {
  const projected = points3d.map((p) => proj(p));
  const runs = { front: [], back: [] };
  let current = null;
  let side = null;
  projected.forEach(([x, y, z], i) => {
    const s = z >= 0 ? "front" : "back";
    if (s !== side) {
      if (current) {
        current.push([x, y]);
        runs[side].push(current);
      }
      current = i === 0 ? [] : [projected[i - 1].slice(0, 2)];
      side = s;
    }
    current.push([x, y]);
  });
  runs[side].push(current);
  const toPath = (list) =>
    list.map((run) => run.map(([x, y], j) => `${j ? "L" : "M"}${f1(x)} ${f1(y)}`).join("")).join("");
  return { front: toPath(runs.front), back: toPath(runs.back) };
}

function latitude(lat) {
  const pts = [];
  for (let i = 0; i <= 96; i++) pts.push(spherePoint(lat, (i / 96) * 360 * deg, 0));
  return splitLoop(pts, (p) => project(p, PLANET));
}

// Orbit ring: a horizontal circle of radius 1.55 seen from slightly above (tipped 16 degrees toward
// the viewer), so it reads as a flat ellipse whose far half passes behind the planet.
const ORBIT = { cx: PLANET.cx, cy: PLANET.cy, r: PLANET.r * 1.55, tilt: 16 * deg, roll: 14 * deg };
function orbitPoint(t) {
  return project([Math.cos(t), 0, Math.sin(t)], ORBIT);
}

// ----------------------------------------------------------------------------
// Perspective floor
// ----------------------------------------------------------------------------
const FLOOR = { horizon: 236, bottom: H, left: 600, vx: 955, zNear: 1, spacing: 0.75, lines: 10 };
const floorY = (z) => FLOOR.horizon + (FLOOR.bottom - FLOOR.horizon) * (FLOOR.zNear / z);

function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ----------------------------------------------------------------------------
// Header
// ----------------------------------------------------------------------------
function header(t) {
  // Chips and roles (left side).
  let x = 72;
  const chipSvg = CHIPS.map(([n, label], i) => {
    const w = 34 + (n.length + label.length) * 8.6;
    const g = `<g class="chip" style="animation-delay:${(0.9 + i * 0.15).toFixed(2)}s">
  <rect x="${x}" y="224" rx="15" width="${w}" height="30" fill="${t.chip}" stroke="${t.line}"/>
  <text x="${x + 14}" y="244" font-family="${mono}" font-size="13" fill="${t.a1}" font-weight="700">${n}</text>
  <text x="${x + 22 + n.length * 8.4}" y="244" font-family="${font}" font-size="13" fill="${t.chipText}">${label}</text>
</g>`;
    x += w + 12;
    return g;
  }).join("\n");
  const roleSvg = ROLES.map(
    (r, i) => `<text class="role r${i}" x="72" y="186" font-family="${font}" font-size="24" fill="${t.muted}">${r}</text>`,
  ).join("\n");

  // Meridians: 12 half meridians 30 degrees apart. The pattern repeats every 30 degrees of spin,
  // so one 30-degree cycle, looped, reads as continuous rotation.
  const FRAMES = 12;
  const SPIN_DUR = "2.6s";
  const meridians = [];
  const stillMeridians = [];
  for (let m = 0; m < 12; m++) {
    const lon = m * 30 * deg;
    const frames = [];
    for (let f = 0; f <= FRAMES; f++) frames.push(meridian(lon, (f / FRAMES) * 30 * deg));
    const d = frames.map((fr) => fr.d).join(";");
    const op = frames.map((fr) => depthOpacity(fr.depth)).join(";");
    meridians.push(
      `<path d="${frames[0].d}" fill="none" stroke="${t.a1}" stroke-width="1.4" stroke-opacity="${depthOpacity(frames[0].depth)}">` +
        `<animate attributeName="d" values="${d}" dur="${SPIN_DUR}" repeatCount="indefinite"/>` +
        `<animate attributeName="stroke-opacity" values="${op}" dur="${SPIN_DUR}" repeatCount="indefinite"/></path>`,
    );
    stillMeridians.push(
      `<path d="${frames[0].d}" fill="none" stroke="${t.a1}" stroke-width="1.4" stroke-opacity="${depthOpacity(frames[0].depth)}"/>`,
    );
  }

  const lats = [-60, -30, 0, 30, 60].map((l) => ({ l, ...latitude(l * deg) }));
  const latBack = lats.map(({ back }) => `<path d="${back}" fill="none" stroke="${t.a3}" stroke-opacity=".14" stroke-width="1.1"/>`).join("");
  const latFront = lats
    .map(({ l, front }) => `<path d="${front}" fill="none" stroke="${t.a3}" stroke-opacity="${l === 0 ? ".9" : ".55"}" stroke-width="${l === 0 ? 1.8 : 1.2}"/>`)
    .join("");

  // Orbit ring and satellite.
  const ringPts = [];
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * 2 * Math.PI;
    ringPts.push([Math.cos(a), 0, Math.sin(a)]);
  }
  const ring = splitLoop(ringPts, (p) => project(p, ORBIT));
  const SAT_STEPS = 72;
  const satVals = [];
  const satFront = [];
  for (let i = 0; i <= SAT_STEPS; i++) {
    const [sx, sy, sz] = orbitPoint((i / SAT_STEPS) * 2 * Math.PI);
    satVals.push(`${f1(sx)},${f1(sy)}`);
    satFront.push(sz >= 0 ? 1 : 0);
  }
  const keyTimes = satFront.map((_, i) => (i / SAT_STEPS).toFixed(4)).join(";");
  const SAT_DUR = "9s";
  const satMotion = `<animateMotion values="${satVals.join(";")}" dur="${SAT_DUR}" repeatCount="indefinite"/>`;
  const satFrontOpacity = `<animate attributeName="opacity" values="${satFront.join(";")}" keyTimes="${keyTimes}" calcMode="discrete" dur="${SAT_DUR}" repeatCount="indefinite"/>`;
  const [stillSx, stillSy] = orbitPoint(0.35 * Math.PI);

  // Perspective floor: horizontal lines slide toward the viewer; one spacing per cycle loops.
  const FLOOR_FRAMES = 10;
  const FLOOR_DUR = "1.6s";
  const zFar = FLOOR.zNear + FLOOR.spacing * FLOOR.lines;
  const floorLines = [];
  const stillFloor = [];
  for (let i = 0; i < FLOOR.lines; i++) {
    const ys = [];
    for (let f = 0; f <= FLOOR_FRAMES; f++) {
      const z = FLOOR.zNear + FLOOR.spacing * (i + 1 - f / FLOOR_FRAMES);
      ys.push(f1(floorY(z)));
    }
    floorLines.push(
      `<line x1="${FLOOR.left}" x2="${W}" y1="${ys[0]}" y2="${ys[0]}"><animate attributeName="y1" values="${ys.join(";")}" dur="${FLOOR_DUR}" repeatCount="indefinite"/><animate attributeName="y2" values="${ys.join(";")}" dur="${FLOOR_DUR}" repeatCount="indefinite"/></line>`,
    );
    stillFloor.push(`<line x1="${FLOOR.left}" x2="${W}" y1="${ys[0]}" y2="${ys[0]}"/>`);
  }
  const verticals = [];
  for (let bx = FLOOR.vx - 900; bx <= FLOOR.vx + 900; bx += 75) {
    const yTop = floorY(zFar);
    const tTop = (yTop - FLOOR.horizon) / (FLOOR.bottom - FLOOR.horizon);
    const xTop = FLOOR.vx + (bx - FLOOR.vx) * tTop;
    verticals.push(`<line x1="${f1(xTop)}" y1="${f1(yTop)}" x2="${f1(bx)}" y2="${H}"/>`);
  }

  // Stars.
  const rnd = rand(7);
  const stars = [];
  for (let i = 0; i < 34; i++) {
    const sx = 600 + rnd() * 590;
    const sy = 14 + rnd() * 200;
    const dx = sx - PLANET.cx;
    const dy = sy - PLANET.cy;
    if (Math.hypot(dx, dy) < PLANET.r * 1.15) continue;
    stars.push(
      `<circle class="star" cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(0.6 + rnd() * 1.2)}" style="animation-delay:${(rnd() * 4).toFixed(2)}s"/>`,
    );
  }

  const { cx, cy, r } = PLANET;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Jeevan, full-stack TypeScript developer and open-source contributor">
<title>Jeevan, full-stack TypeScript developer and open-source contributor</title>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg1}"/><stop offset="1" stop-color="${t.bg2}"/></linearGradient>
  <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${t.a1}"><animate attributeName="stop-color" values="${t.a1};${t.a2};${t.a3};${t.a1}" dur="8s" repeatCount="indefinite"/></stop>
    <stop offset="1" stop-color="${t.a2}"><animate attributeName="stop-color" values="${t.a2};${t.a3};${t.a1};${t.a2}" dur="8s" repeatCount="indefinite"/></stop>
  </linearGradient>
  <radialGradient id="body" cx="0.36" cy="0.32" r="0.78"><stop offset="0" stop-color="${t.body0}"/><stop offset="1" stop-color="${t.body1}"/></radialGradient>
  <radialGradient id="atmo"><stop offset="0.62" stop-color="${t.a1}" stop-opacity="0.32"/><stop offset="1" stop-color="${t.a1}" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowB"><stop offset="0" stop-color="${t.a2}" stop-opacity="0.42"/><stop offset="1" stop-color="${t.a2}" stop-opacity="0"/></radialGradient>
  <radialGradient id="sat"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="${t.a3}"/><stop offset="1" stop-color="${t.a3}" stop-opacity="0"/></radialGradient>
  <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <linearGradient id="floorSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.25" stop-color="#fff" stop-opacity="1"/></linearGradient>
  <mask id="floorMask"><rect x="${FLOOR.left}" y="${FLOOR.horizon}" width="${W - FLOOR.left}" height="${H - FLOOR.horizon}" fill="url(#floorFade)"/></mask>
  <mask id="floorMaskSide"><rect x="${FLOOR.left}" y="0" width="${W - FLOOR.left}" height="${H}" fill="url(#floorSide)"/></mask>
  <clipPath id="card"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${t.line}" stroke-width="1" opacity="0.35"/></pattern>
</defs>
<style>
  .hello { opacity: 0; animation: rise .8s cubic-bezier(.2,.7,.2,1) .1s forwards; }
  .name { opacity: 0; animation: rise .9s cubic-bezier(.2,.7,.2,1) .25s forwards; }
  .underline { stroke-dasharray: 260; stroke-dashoffset: 260; animation: draw 1.2s ease-out .7s forwards; }
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  .role { opacity: 0; animation: cycle 12s infinite; }
  .r1 { animation-delay: 4s; }
  .r2 { animation-delay: 8s; }
  @keyframes cycle { 0% { opacity: 0; transform: translateY(10px); } 4%,29% { opacity: 1; transform: none; } 33%,100% { opacity: 0; transform: translateY(-10px); } }
  .chip { opacity: 0; animation: rise .6s ease-out forwards; }
  .dot { transform-box: fill-box; transform-origin: center; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .35; } }
  .star { fill: ${t.star}; animation: twinkle 3.6s ease-in-out infinite; }
  @keyframes twinkle { 0%,100% { opacity: .15; } 50% { opacity: .9; } }
  .float { animation: float 6s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  .still { display: none; }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
    .hello, .name, .chip, .r0 { opacity: 1 !important; }
    .underline { stroke-dashoffset: 0 !important; }
    .motion { display: none; }
    .still { display: inline; }
  }
</style>
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <circle cx="760" cy="300" r="260" fill="url(#glowB)"/>
  ${stars.join("")}
  <g mask="url(#floorMaskSide)"><g mask="url(#floorMask)" stroke="${t.grid}" stroke-opacity=".55" stroke-width="1">
    ${verticals.join("")}
    <g class="motion">${floorLines.join("")}</g>
    <g class="still">${stillFloor.join("")}</g>
  </g></g>
  <g class="float">
    <circle cx="${cx}" cy="${cy}" r="${f1(r * 1.42)}" fill="url(#atmo)"/>
    <path d="${ring.back}" fill="none" stroke="${t.a2}" stroke-opacity=".35" stroke-width="1.6"/>
    <g class="motion"><circle r="4.5" fill="${t.a3}" opacity=".45">${satMotion}</circle></g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#body)"/>
    ${latBack}
    <g class="motion">${meridians.join("")}</g>
    <g class="still">${stillMeridians.join("")}</g>
    ${latFront}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.a1}" stroke-opacity=".55" stroke-width="1.5"/>
    <path d="${ring.front}" fill="none" stroke="${t.a2}" stroke-opacity=".85" stroke-width="2"/>
    <g class="motion"><g opacity="1">${satFrontOpacity}<circle r="11" fill="url(#sat)">${satMotion}</circle><circle r="3.6" fill="#ffffff">${satMotion}</circle></g></g>
    <g class="still"><circle cx="${f1(stillSx)}" cy="${f1(stillSy)}" r="11" fill="url(#sat)"/><circle cx="${f1(stillSx)}" cy="${f1(stillSy)}" r="3.6" fill="#ffffff"/></g>
  </g>
</g>
<text class="hello" x="74" y="86" font-family="${font}" font-size="20" fill="${t.muted}">Hi, I&#39;m</text>
<text class="name" x="70" y="142" font-family="${font}" font-size="64" font-weight="800" fill="url(#name)" letter-spacing="-1">Jeevan</text>
<path class="underline" d="M74 156 C 140 166, 230 150, 312 158" fill="none" stroke="url(#name)" stroke-width="4" stroke-linecap="round"/>
${roleSvg}
${chipSvg}
<g><circle class="dot" cx="${x + 18}" cy="239" r="5" fill="#22c55e"/><text x="${x + 30}" y="244" font-family="${font}" font-size="13" fill="${t.muted}">open to freelance &amp; junior roles</text></g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="20" fill="none" stroke="${t.line}"/>
</svg>
`;
}

function footer(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 90" width="1200" height="90" role="img" aria-label="Decorative wave">
<title>Decorative wave</title>
<defs><linearGradient id="w" x1="0" x2="1"><stop offset="0" stop-color="${t.a1}"/><stop offset=".5" stop-color="${t.a3}"/><stop offset="1" stop-color="${t.a2}"/></linearGradient></defs>
<style>
  .w1 { animation: slide 10s linear infinite; }
  .w2 { animation: slide 16s linear infinite reverse; }
  /* Both paths span 0..1800 with a 600px wavelength, so sliding by one wavelength loops seamlessly
     in either direction while the visible 0..1200 stays covered. */
  @keyframes slide { from { transform: translateX(0); } to { transform: translateX(-600px); } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
<g class="w1" opacity=".35"><path d="M0 50 Q150 20 300 50 T600 50 T900 50 T1200 50 T1500 50 T1800 50 V90 H0Z" fill="url(#w)"/></g>
<g class="w2" opacity=".55"><path d="M0 62 Q150 82 300 62 T600 62 T900 62 T1200 62 T1500 62 T1800 62 V90 H0Z" fill="url(#w)"/></g>
</svg>
`;
}

for (const [name, t] of Object.entries(themes)) {
  writeFileSync(join(out, `header-${name}.svg`), header(t));
  writeFileSync(join(out, `footer-${name}.svg`), footer(t));
}
console.log("written to", out);
