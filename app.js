import * as THREE from 'three';
import { library } from './library.js';
import { desk } from './desk.js';

const $ = (id) => document.getElementById(id);
const V3 = THREE.Vector3;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967295; }
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

// ---------- timing ----------
// Motion is always on, by design: the system reduce-motion setting is not followed.
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function tween(ms, fn) {
  return new Promise((res) => {
    if (ms <= 0) { fn(1); res(); return; }
    const t0 = performance.now();
    const step = (now) => { const t = Math.min(1, (now - t0) / ms); fn(t); t < 1 ? requestAnimationFrame(step) : res(); };
    requestAnimationFrame(step);
  });
}
let toastTimer;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800); }

// ---------- data ----------
document.title = library.title;
$('lib-title').textContent = library.title;
const books = [];
library.shelves.forEach((shelf, si) => shelf.books.forEach((b) => books.push({ ...b, type: 'book', shelf, si })));
const files = desk.files.items.map((f) => ({ ...f, type: 'file', k: 'Vault file', glyph: 'page', download: desk.files.download }));
const handbook = { ...desk.handbook, type: 'tome', glyph: 'head', color: '#c96442' };
const phoneItem = { ...desk.phone, type: 'phone', glyph: 'socket', color: '#3b4250' };
const deskItems = [handbook, ...files, phoneItem];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- pixel textures ----------
const GLYPHS = {
  head:   ['..###..', '.#####.', '.#.#.#.', '.#####.', '..###..', '.#####.', '#######'],
  brush:  ['.....##', '....###', '...###.', '..###..', '.##....', '###....', '##.....'],
  gear:   ['#.###.#', '.#####.', '##...##', '##...##', '##...##', '.#####.', '#.###.#'],
  page:   ['#####..', '#...##.', '#.##..#', '#.....#', '#.###.#', '#.....#', '#######'],
  plug:   ['.#...#.', '.#...#.', '#######', '#######', '.#####.', '..###..', '...#...'],
  socket: ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#..#..#', '#.....#', '.#####.'],
  link:   ['.##....', '#..#...', '#..##..', '.##.##.', '..##..#', '...#..#', '....##.'],
  prompt: ['#......', '.#.....', '..#....', '.#.....', '#......', '.......', '...####'],
  box:    ['.#####.', '#.....#', '#######', '#..#..#', '#.###.#', '#.....#', '#######'],
};
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function shade(hex, f) {
  const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl);
  return '#' + new THREE.Color().setHSL(hsl.h, hsl.s, clamp(hsl.l * f, 0, 1)).getHexString();
}
function glyph(g, name, x, y, s, color) {
  g.fillStyle = color;
  (GLYPHS[name] || GLYPHS.page).forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g.fillRect(x + i * s, y + j * s, s, s); }));
}
function rng(seed) { let a = Math.floor(seed * 1e9); return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function spineTex(b) {
  const r = hash(b.n);
  const base = b.off ? '#7a7570' : shade(b.shelf.color, 0.86 + r * 0.3);
  return canvasTex(16, 64, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = shade(base, 0.62); g.fillRect(0, 0, 1, h); g.fillRect(w - 1, 0, 1, h);
    g.fillStyle = shade(base, 1.18); g.fillRect(1, 0, 1, h);
    const band = r > 0.5 ? '#d9b45a' : shade(base, 0.6);
    for (const y of r > 0.33 ? [5, 56] : [5, 9, 52, 56]) { g.fillStyle = band; g.fillRect(1, y, w - 2, 2); g.fillStyle = shade(base, 0.5); g.fillRect(1, y + 2, w - 2, 1); }
    glyph(g, b.shelf.glyph, 4, 17, 1, '#fff2d0');
    g.fillStyle = '#f4ecd0'; g.fillRect(3, 30, 10, 15);
    g.fillStyle = '#5b4d55'; for (let y = 33; y < 43; y += 3) g.fillRect(5, y, 4 + (Math.round(r * 3 + y) % 4), 1);
    if (b.off) { g.fillStyle = '#3a3634'; g.fillRect(1, 48, w - 2, 3); }
  });
}
function bookCoverTex(b) {
  const base = b.off ? '#7a7570' : b.shelf.color;
  return canvasTex(48, 72, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = shade(base, 0.6); g.fillRect(0, 0, 3, h);
    g.fillStyle = shade(base, 1.15); g.fillRect(3, 0, 1, h);
    g.strokeStyle = '#d9b45a'; g.lineWidth = 1; g.strokeRect(7.5, 5.5, w - 12, h - 11);
    glyph(g, b.shelf.glyph, 16, 14, 2, '#fff2d0');
    g.fillStyle = shade(base, 0.7); g.fillRect(12, 40, w - 22, 14);
  });
}
// Clawd, the Claude Code crab, as a 16x10 sprite. Accessories are drawn over it, one per handbook chapter.
const PAL = { O: '#d97757', o: '#a9532f', K: '#1a1a1a', W: '#ffffff', N: '#22335e', Y: '#e8b73a', P: '#6b3fa0', R: '#c0392b', G: '#9aa1ab', B: '#6b4226', C: '#f4ecd0' };
const CLAWD = ['...OOOOOOOOOO...', '...OOOOOOOOOO...', '...OOKOOOOKOO...', '...OOKOOOOKOO...', '.OOOOOOOOOOOOOO.', '.OOOOOOOOOOOOOO.', '...OOOOOOOOOO...', '...OOOOOOOOOO...', '...oooooooooo...', '....o.o..o.o....', '....o.o..o.o....'];
const ACCESSORIES = {
  hardhat: [[0, -3, ['....YYYYYYYY....', '...YYYYYYYYYY...', '.YYYYYYYYYYYYYY.']]],
  sunglasses: [[0, 2, ['....KWKKKKWK....', '....KKK..KKK....']]],
  detective: [[0, -3, ['....BBBBBBBB....', '...BBBBBBBBBB...', '..BBBBBBBBBBBB..']], [15, -1, ['.GGG.', 'G...G', 'G...G', 'G...G', '.GGG.', '...B.', '....B', '....B']]],
  headphones: [[0, -2, ['...NNNNNNNNNN...', '..N..........N..']], [1, 0, ['NN', 'NN', 'NN']], [13, 0, ['NN', 'NN', 'NN']]],
  medal: [[6, 4, ['R..R', 'RRRR', '.YY.', 'YYYY', '.YY.']]],
  wizard: [[0, -6, ['.......P........', '......PPP.......', '.....PPYPP......', '....PPPPPPP.....', '...PPPPPPPPP....', '.PPPPPPPPPPPPP..']]],
  captain: [[0, -4, ['....WWWWWWWW....', '...WWWWYYWWWW...', '...NNNNNNNNNN...', '..KKKKKKKKKKKK..']]],
  saxophone: [[14, 1, ['.YY', '..Y', '..Y', '.Y.', 'YY.', 'YYY', '.YY']], [12, 3, ['KY']]],
  beret: [[0, -3, ['.......R........', '...RRRRRRRRR....', '..RRRRRRRRRRR...']], [16, 1, ['Y', 'B', 'B', 'B', 'B']]],
  party: [[0, -6, ['.......Y........', '......RRR.......', '......YYY.......', '.....RRRRR......', '.....YYYYY......', '....RRRRRRR.....']], [-2, -4, ['Y', '.', '.', 'P']], [16, -2, ['R', '.', 'Y']]],
};
function sprite(g, rows, x, y, s) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => { if (PAL[ch]) { g.fillStyle = PAL[ch]; g.fillRect(x + i * s, y + j * s, s, s); } }));
}
function drawClawd(g, x, y, s, acc) {
  sprite(g, CLAWD, x, y, s);
  for (const [dx, dy, rows] of ACCESSORIES[acc] || []) sprite(g, rows, x + dx * s, y + dy * s, s);
}
function clawdArt(acc, bg) {
  const c = document.createElement('canvas'); c.width = 22; c.height = 21;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 22, 21);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(5, 19, 12, 1);
  drawClawd(g, 3, 8, 1, acc);
  return c.toDataURL();
}
const handbookCover = canvasTex(48, 66, (g, w, h) => {
  g.fillStyle = '#c96442'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#a9532f'; g.fillRect(0, 0, 4, h);
  g.fillStyle = '#f0e6d6'; g.fillRect(8, 6, w - 13, 30);
  drawClawd(g, 10, 14, 2, null);
  g.fillStyle = '#f0e6d6'; g.fillRect(10, 42, w - 17, 2); g.fillRect(14, 47, w - 25, 1); g.fillRect(14, 50, w - 29, 1);
  g.strokeStyle = '#f0e6d6'; g.lineWidth = 1; g.strokeRect(6.5, 3.5, w - 9, h - 7);
});
function fileCover(f) {
  return canvasTex(48, 66, (g, w, h) => {
    g.fillStyle = '#d3a866'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b98d4e'; g.fillRect(0, 0, w, 1); g.fillRect(0, h - 1, w, 1); g.fillRect(0, 0, 1, h); g.fillRect(w - 1, 0, 1, h);
    g.fillStyle = f.color; g.fillRect(0, 0, w, 7); g.fillRect(4, 7, 16, 2);
    g.fillStyle = '#f4ecd0'; g.fillRect(9, 22, 30, 16);
    g.fillStyle = '#5b4d55'; g.fillRect(12, 26, 22, 1); g.fillRect(12, 30, 16, 1); g.fillRect(12, 34, 19, 1);
  });
}
const phoneTop = canvasTex(14, 34, (g, w, h) => {
  g.fillStyle = '#3b4250'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#15181f'; g.fillRect(5, 1, 4, 1);
  g.fillStyle = '#15181f'; g.fillRect(1, 3, 12, 11); g.fillStyle = '#b8c79a'; g.fillRect(2, 4, 10, 9);
  g.fillStyle = '#1f2a14'; g.fillRect(3, 5, 6, 1); g.fillRect(3, 7, 7, 1); g.fillRect(3, 9, 5, 1);
  g.fillStyle = '#222730'; g.fillRect(2, 16, 3, 2); g.fillRect(9, 16, 3, 2); g.fillStyle = '#5a6376'; g.fillRect(6, 15, 2, 4);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { g.fillStyle = '#222730'; g.fillRect(2 + c * 4, 21 + r * 3, 3, 2); g.fillStyle = '#8b93a6'; g.fillRect(3 + c * 4, 21 + r * 3, 1, 1); }
});
const pagesTex = canvasTex(8, 16, (g, w, h) => {
  g.fillStyle = '#efe4c2'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#cfc19a'; for (let y = 1; y < h; y += 3) g.fillRect(0, y, w, 1);
});
const tomeSpine = canvasTex(8, 32, (g, w, h) => {
  g.fillStyle = '#a9532f'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f0e6d6'; for (const y of [3, 8, 23, 28]) g.fillRect(0, y, w, 1);
});
function repeatTex(t, x, y) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; }
const woodTex = repeatTex(canvasTex(32, 32, (g, w, h) => {
  const r = rng(0.42);
  g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y++) if (r() < 0.35) { g.fillStyle = r() < 0.5 ? '#6a3e22' : '#86542f'; g.fillRect(0, y, w, 1); }
  for (let i = 0; i < 3; i++) { g.fillStyle = '#5a321b'; g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 3, 1); }
}), 1, 1);
const wallTex = repeatTex(canvasTex(16, 16, (g) => {
  g.fillStyle = '#1c2147'; g.fillRect(0, 0, 16, 16);
  g.fillStyle = '#212759'; g.fillRect(0, 0, 8, 16);
  g.fillStyle = '#262d63'; g.fillRect(3, 6, 2, 2);
}), 36, 22);
const floorTex = repeatTex(canvasTex(32, 16, (g) => {
  g.fillStyle = '#3b2416'; g.fillRect(0, 0, 32, 16);
  g.fillStyle = '#2e1b10'; g.fillRect(0, 7, 32, 1); g.fillRect(0, 15, 32, 1); g.fillRect(12, 0, 1, 7); g.fillRect(26, 8, 1, 7);
}), 12, 6);

// ---------- renderer ----------
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.setPixelRatio(1);
  $('scene').appendChild(renderer.domElement);
} catch { renderer = null; }

const scene = new THREE.Scene();
scene.background = new THREE.Color('#141833');
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const FOV_T = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const toonSteps = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]), 3, 1);
toonSteps.minFilter = toonSteps.magFilter = THREE.NearestFilter; toonSteps.needsUpdate = true;
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: toonSteps, ...opts });

scene.add(new THREE.HemisphereLight('#a9b4ff', '#2a1a12', 1.1));
const lamp = new THREE.DirectionalLight('#ffd9a0', 2.6);
lamp.position.set(-1, 6, 7); lamp.target.position.set(3, 0, 0); lamp.castShadow = true;
lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.002;
Object.assign(lamp.shadow.camera, { left: -11, right: 11, top: 10, bottom: -10, near: 1, far: 30 });
scene.add(lamp, lamp.target);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), toon({ map: wallTex }));
wall.receiveShadow = true; scene.add(wall);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 20), toon({ map: floorTex }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

// ---------- room: bookcase and desk ----------
const CW = 2.6, CH = 1.28, T = 0.12, D = 0.9, BD = 0.64;
const DW = 7.0, DD = 2.5, TH = 2.0;
const POSTER_H = 2.6, POSTER_W = POSTER_H * 72 / 101;
const posterTex = new THREE.TextureLoader().load('assets/poster.png');
posterTex.magFilter = posterTex.minFilter = THREE.NearestFilter; posterTex.generateMipmaps = false; posterTex.colorSpace = THREE.SRGBColorSpace;
const outlineMat = new THREE.MeshBasicMaterial({ color: '#120c10', side: THREE.BackSide });
const woodMat = toon({ map: woodTex });
const pagesMat = toon({ map: pagesTex });
const FACE_BOOK = new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), -Math.PI / 2);
const FACE_FLAT = new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), Math.PI / 2);
let shelfCase = null, deskGroup = null, cols = 0, caseW = 0, caseH = 0, cells = [];
let deskX = 0, topY = 0, deskZ = 0;

function addBox(group, w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; group.add(m); return m;
}
function outline(mesh, w, h, d) {
  const o = new THREE.Mesh(mesh.geometry, outlineMat);
  o.scale.set(1 + 0.03 / w, 1 + 0.03 / h, 1 + 0.03 / d); o.raycast = () => {}; mesh.add(o);
}
function dispose(g) { if (g) { g.traverse((o) => o.geometry && o.geometry.dispose()); scene.remove(g); } }

// A glass bowl with sand, coral, seaweed, bubbles and one clownfish. Purely for the room.
let fishbowl = null, organizerAt = [0, 0, 0], posterGroup = null;
function buildFishbowl(group, x, z) {
  const R = 0.52, cy = R * 0.92, b = new THREE.Group(); b.position.set(x, topY, z); group.add(b);
  const glassy = (color, opacity) => toon({ color, transparent: true, opacity, depthWrite: false });
  const mesh = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); b.add(m); return m; };
  const water = mesh(new THREE.SphereGeometry(R * 0.93, 20, 14, 0, Math.PI * 2, 0.6, Math.PI - 0.6), glassy('#2f8fcf', 0.42), 0, cy, 0);
  water.scale.y = 0.92;
  const surfR = R * 0.93 * Math.sin(0.6);
  mesh(new THREE.CircleGeometry(surfR, 20), glassy('#8fd0f2', 0.5), 0, cy + R * 0.93 * Math.cos(0.6) * 0.92, 0).rotation.x = -Math.PI / 2;
  mesh(new THREE.CylinderGeometry(R * 0.62, R * 0.48, 0.08, 16), toon({ color: '#e6cf8f' }), 0, 0.1, 0);
  const coral = [['#e0607e', new THREE.ConeGeometry(0.07, 0.24, 6), -0.17, 0.25, 0.06], ['#f39a3d', new THREE.SphereGeometry(0.08, 8, 6), 0.17, 0.18, -0.06],
    ['#9b59d0', new THREE.CylinderGeometry(0.025, 0.035, 0.22, 5), -0.05, 0.24, 0.16], ['#9b59d0', new THREE.CylinderGeometry(0.02, 0.03, 0.16, 5), 0.0, 0.21, 0.19],
    ['#e86a4f', new THREE.ConeGeometry(0.05, 0.16, 5), 0.2, 0.21, 0.12]];
  coral.forEach(([c, geo, px, py, pz]) => mesh(geo, toon({ color: c }), px, py, pz));
  const weeds = [[0.06, -0.2, 0.36], [-0.08, -0.17, 0.3], [0.2, -0.12, 0.26]].map(([px, pz, h]) => {
    const w = mesh(new THREE.BoxGeometry(0.03, h, 0.03), toon({ color: '#3f9b4f' }), px, 0.13, pz); w.geometry.translate(0, h / 2, 0); return w;
  });
  const fish = new THREE.Group(); b.add(fish);
  const part = (w, h, d, c, px, py, pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon({ color: c })); m.position.set(px, py, pz); fish.add(m); };
  part(0.18, 0.1, 0.06, '#f07a1d', 0, 0, 0);
  part(0.022, 0.104, 0.064, '#ffffff', -0.03, 0, 0); part(0.022, 0.104, 0.064, '#ffffff', 0.045, 0, 0);
  part(0.05, 0.08, 0.03, '#f07a1d', -0.11, 0, 0); part(0.012, 0.08, 0.032, '#1a1a1a', -0.135, 0, 0);
  part(0.014, 0.014, 0.066, '#1a1a1a', 0.07, 0.018, 0);
  const bubbles = [0, 1, 2].map((i) => mesh(new THREE.SphereGeometry(0.018, 6, 4), glassy('#ffffff', 0.7), 0.13 - i * 0.03, 0.2, -0.1 + i * 0.02));
  mesh(new THREE.SphereGeometry(R, 22, 16), glassy('#d8f2ff', 0.22), 0, cy, 0).scale.y = 0.92;
  mesh(new THREE.TorusGeometry(surfR + 0.03, 0.025, 6, 20), glassy('#e8f8ff', 0.55), 0, cy + R * 0.84, 0).rotation.x = Math.PI / 2;
  fishbowl = { fish, weeds, bubbles, cy };
}
function animateBowl(t) {
  if (!fishbowl) return;
  const { fish, weeds, bubbles, cy } = fishbowl;
  const a = t * 0.7;
  fish.position.set(Math.cos(a) * 0.22, cy - 0.04 + Math.sin(t * 1.6) * 0.04, Math.sin(a) * 0.22);
  fish.rotation.y = -a - Math.PI / 2;
  weeds.forEach((w, i) => { w.rotation.z = Math.sin(t * 1.3 + i) * 0.12; });
  bubbles.forEach((bb, i) => { const p = (t * 0.25 + i / 3) % 1; bb.position.y = 0.18 + p * 0.6; bb.visible = p < 0.92; });
}

function buildRoom() {
  dispose(shelfCase); dispose(deskGroup);
  const n = library.shelves.length;
  cols = innerWidth / innerHeight < 0.85 ? 1 : Math.min(3, n);
  const rows = Math.ceil(n / cols);
  caseW = cols * CW + (cols + 1) * T; caseH = rows * CH + (rows + 1) * T;
  const g = new THREE.Group(); shelfCase = g; scene.add(g);
  addBox(g, caseW, caseH, 0.06, woodMat, 0, 0, -D / 2 + 0.03);
  for (let c = 0; c <= cols; c++) addBox(g, T, caseH, D, woodMat, -caseW / 2 + T / 2 + c * (CW + T), 0, 0);
  for (let r = 0; r <= rows; r++) addBox(g, caseW, T, D, woodMat, 0, caseH / 2 - T / 2 - r * (CH + T), 0);
  addBox(g, caseW + 0.16, 0.1, D + 0.12, woodMat, 0, caseH / 2 + 0.05, 0.02);
  wall.position.set(caseW / 2, 4, -D / 2 - 0.02);

  // Framed poster and a paper bin on the wall left of the case. Wide screens frame them in.
  // Built at unit size; fitCamera scales and places it to fill the wall left of the case.
  posterGroup = new THREE.Group(); g.add(posterGroup);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(POSTER_W, POSTER_H), toon({ map: posterTex }));
  poster.receiveShadow = true; posterGroup.add(poster);
  const frame = toon({ color: '#3b2416' });
  for (const [w, h, x, y] of [[POSTER_W + 0.16, 0.08, 0, POSTER_H / 2 + 0.04], [POSTER_W + 0.16, 0.08, 0, -POSTER_H / 2 - 0.04], [0.08, POSTER_H, -POSTER_W / 2 - 0.04, 0], [0.08, POSTER_H, POSTER_W / 2 + 0.04, 0]]) addBox(posterGroup, w, h, 0.06, frame, x, y, 0.01);
  const fy = -caseH / 2, bx = -caseW / 2 - 0.6, bz = 0.25;
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.7, 10, 1, true), toon({ color: '#7d8794', side: THREE.DoubleSide }));
  bin.position.set(bx, fy + 0.35, bz); bin.castShadow = bin.receiveShadow = true; g.add(bin);
  addBox(g, 0.42, 0.02, 0.42, toon({ color: '#2a2d33' }), bx, fy + 0.01, bz);
  const paper = toon({ color: '#f4ecd0' });
  for (const [x, y, z, r] of [[-0.06, 0.66, 0.02, 0.1], [0.08, 0.64, -0.05, 0.09], [0.02, 0.74, 0.06, 0.08], [0.45, 0.07, 0.25, 0.07]]) {
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), paper); ball.position.set(bx + x, fy + y, bz + z); ball.castShadow = true; g.add(ball);
  }
  floor.position.set(caseW / 2, -caseH / 2, 2);

  cells = library.shelves.map((shelf, si) => {
    const col = si % cols, row = Math.floor(si / cols);
    const left = -caseW / 2 + T + col * (CW + T);
    const bottom = caseH / 2 - T - row * (CH + T) - CH;
    return { shelf, si, col, row, left, bottom, cx: left + CW / 2 };
  });
  for (const cell of cells) {
    const list = books.filter((b) => b.si === cell.si);
    const widths = list.map((b) => 0.1 + hash(b.n + 'w') * 0.07);
    const fit = Math.min(1, (CW - 0.3) / widths.reduce((a, w) => a + w, 0.0001));
    let x = cell.left + 0.08;
    list.forEach((b, i) => {
      const w = widths[i] * fit, h = CH * (0.72 + hash(b.n + 'h') * 0.18);
      b.coverTex = b.coverTex || bookCoverTex(b);
      const coverMat = toon({ map: b.coverTex });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, BD), [coverMat, coverMat, pagesMat, pagesMat, toon({ map: spineTex(b) }), pagesMat]);
      outline(mesh, w, h, BD);
      mesh.castShadow = mesh.receiveShadow = true;
      b.rest = new V3(x + w / 2, cell.bottom + h / 2, D / 2 - 0.07 - BD / 2);
      mesh.position.copy(b.rest); mesh.userData.item = b;
      Object.assign(b, { mesh, h, pull: 0, cell, axis: 'z', faceQuat: FACE_BOOK, faceScale: (W, H) => new V3(H / h, H / h, W / BD) });
      g.add(mesh); x += w + 0.004;
    });
    if (list.length && x < cell.left + CW - 0.2) addBox(g, 0.04, CH * 0.42, BD * 0.8, toon({ color: '#4b4f5c' }), x + 0.04, cell.bottom + CH * 0.21, D / 2 - 0.07 - BD / 2);
  }

  // Desk to the right of the bookcase.
  const dg = new THREE.Group(); deskGroup = dg; scene.add(dg);
  const floorY = -caseH / 2;
  deskX = caseW / 2 + 1.1 + DW / 2; topY = floorY + TH; deskZ = -D / 2 + DD / 2 + 0.1;
  addBox(dg, DW, 0.14, DD, woodMat, deskX, topY - 0.07, deskZ);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addBox(dg, 0.14, TH - 0.14, 0.14, woodMat, deskX + sx * (DW / 2 - 0.2), floorY + (TH - 0.14) / 2, deskZ + sz * (DD / 2 - 0.2));
  const kraft = toon({ color: '#c99a5a' }), leather = toon({ color: '#a9532f' }), body = toon({ color: '#3b4250' }), rackWood = toon({ color: '#5a3420' });
  const flat = (item, dims, mats, x, z, rot) => {
    const [w, h, d] = dims;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
    outline(mesh, w, h, d); mesh.castShadow = mesh.receiveShadow = true;
    item.rest = new V3(x, topY + h / 2 + 0.012, z);
    mesh.position.copy(item.rest); mesh.rotation.y = rot; mesh.userData.item = item;
    Object.assign(item, { mesh, h, pull: 0, axis: 'y', faceQuat: FACE_FLAT, faceScale: (W, H) => new V3(W / w, W / w, H / d) });
    dg.add(mesh);
  };
  flat(handbook, [0.92, 0.3, 1.26], [pagesMat, toon({ map: tomeSpine }), toon({ map: handbookCover }), leather, pagesMat, pagesMat], deskX - 2.45, deskZ + 0.05, 0.14);

  // File organizer: a low rack of upright files, one per vault folder, colored like the vault sidebar.
  const RW = 0.3 + files.length * 0.23, ox = deskX - 0.55, oz = deskZ;
  addBox(dg, RW, 0.05, 0.95, rackWood, ox, topY + 0.025, oz);
  for (const s of [-1, 1]) addBox(dg, 0.05, 0.6, 0.95, rackWood, ox + s * (RW / 2 - 0.025), topY + 0.3, oz);
  addBox(dg, RW, 0.2, 0.05, rackWood, ox, topY + 0.1, oz + 0.45);
  organizerAt = [ox, topY, oz + 0.62];
  files.forEach((f, i) => {
    const w = 0.07, d = 0.82, h = 0.95 + hash(f.n) * 0.12;
    f.coverTex = f.coverTex || fileCover(f);
    const cover = toon({ map: f.coverTex });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [cover, cover, kraft, kraft, toon({ color: f.color }), kraft]);
    outline(mesh, w, h, d); mesh.castShadow = mesh.receiveShadow = true;
    const tab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.004, 0.09, 0.22), toon({ color: shade(f.color, 1.15) }));
    tab.position.set(0, h / 2 + 0.045, -d / 2 + 0.14 + (i % 3) * 0.24); mesh.add(tab);
    f.rest = new V3(ox - RW / 2 + 0.17 + i * 0.23, topY + 0.05 + h / 2, oz);
    mesh.position.copy(f.rest); mesh.userData.item = f;
    Object.assign(f, { mesh, h, pull: 0, axis: 'y', faceQuat: FACE_BOOK, faceScale: (W, H) => new V3(H / h, H / h, W / d) });
    dg.add(mesh);
  });
  flat(phoneItem, [0.32, 0.08, 0.76], [body, body, toon({ map: phoneTop }), body, body, body], deskX + 1.25, deskZ + 0.2, -0.32);
  buildFishbowl(dg, deskX + 2.5, deskZ + 0.05);
  lamp.target.position.set(deskX / 2, 0, 0);

  buildLabels();
  fitCamera();
}

// ---------- camera ----------
// Links like #/stark open that item straight away, so a single book can be shared.
const deepLink = location.hash.startsWith('#/') ? [...books, ...deskItems].find((i) => slug(i.n) === location.hash.slice(2)) : null;
let view = location.hash === '#desk' || (deepLink && deepLink.type !== 'book') ? 'desk' : 'shelf';
let shelfX = 0, scrollRange = 0, yTop = 0, yBottom = 0, dist = 10, camX = 0, parallax = 0, viewT = 1;
const camFrom = { pos: new V3(), look: new V3() }, camLook = new V3();
function usable() { return (innerHeight - (innerWidth < 640 ? 190 : 200)) / innerHeight; }
function fitCamera() {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const perUnit = 2 * FOV_T * camera.aspect; // visible width per unit of distance
  const byH = (caseH * 1.04) / (2 * FOV_T * usable());
  if (cols === 1) {
    shelfX = 0; posterGroup.visible = false;
    dist = (caseW * 1.06) / perUnit;
  } else {
    // The case fills the height; the poster grows into whatever wall is left, with equal margins on both sides.
    const mL = 0.12, mR = 0.35, gap = 0.45, pwMin = 1.3, pwMax = (caseH * 0.68 * POSTER_W) / POSTER_H;
    dist = byH;
    let avail = dist * perUnit - caseW - mL - mR - gap;
    if (avail < pwMin) { avail = pwMin; dist = (caseW + mL + mR + gap + pwMin) / perUnit; }
    const pw = Math.min(avail, pwMax), s = pw / POSTER_W;
    const left = caseW / 2 - caseW - gap - pw;
    posterGroup.visible = true; posterGroup.scale.setScalar(s);
    posterGroup.position.set(left + pw / 2, caseH / 2 - 0.3 - (POSTER_H * s) / 2, -D / 2 + 0.03);
    // The left margin is kept slim on purpose; +0.12 offsets the case front sitting closer to the camera.
    shelfX = (left - mL + caseW / 2 + mR) / 2 + 0.12;
  }
  const over = Math.max(0, caseH * 1.04 - 2 * dist * FOV_T * usable());
  yTop = over / 2; yBottom = -over / 2;
  scrollRange = view === 'shelf' && over > 0 ? (over / (2 * dist * FOV_T)) * h * 1.4 : 0;
  $('spacer').style.height = h + scrollRange + 'px';
}
const scroll01 = () => (scrollRange ? clamp(scrollY / scrollRange, 0, 1) : 0);
const camYForScroll = () => lerp(yTop, yBottom, scroll01()) - 0.08;
function pose(v) {
  if (v === 'shelf') { const cy = camYForScroll(); return { pos: new V3(shelfX + camX, cy + 0.1, dist), look: new V3(shelfX, cy, 0) }; }
  const look = new V3(deskX, topY + 0.05, deskZ + 0.15);
  const pitch = THREE.MathUtils.degToRad(46);
  // Portrait screens frame the three objects, not the whole table, so they stay big enough to tap.
  const d = Math.max(((camera.aspect < 1 ? 6.7 : DW * 1.04)) / (2 * FOV_T * camera.aspect), (DD * 1.5) / (2 * FOV_T * usable()));
  return { pos: look.clone().add(new V3(camX * 0.6, Math.sin(pitch) * d, Math.cos(pitch) * d)), look };
}
function ensureVisible(b) {
  if (!scrollRange || !b.mesh || view !== 'shelf') return;
  const t = clamp((yTop - b.mesh.position.y) / (yTop - yBottom || 1), 0, 1);
  if (Math.abs(b.mesh.position.y - camYForScroll()) > dist * FOV_T * 0.55) scrollTo({ top: t * scrollRange, behavior: 'smooth' });
}
function setView(v) {
  if (busy || reading || v === view) return;
  view = v; sel = null; hovered = null;
  $('view-shelf').setAttribute('aria-pressed', String(v === 'shelf'));
  $('view-desk').setAttribute('aria-pressed', String(v === 'desk'));
  $('scene').setAttribute('aria-label', v === 'shelf' ? 'Bookshelf. Arrow keys pick a book, Enter opens it.' : 'Desk. Arrow keys pick an item, Enter opens it.');
  history.replaceState(null, '', v === 'desk' ? '#desk' : location.pathname + location.search);
  camFrom.pos.copy(camera.position); camFrom.look.copy(camLook);
  if (v === 'desk') scrollTo(0, 0);
  fitCamera(); idleText();
  viewT = 0; tween(900, (t) => { viewT = t; });
}
function walkTo(v) {
  setView(v);
  if (v === 'desk') select(deskItems[0]);
  else { const top = cells.find((c) => c.row === 0 && c.col === cols - 1); select(books.filter((b) => b.si === top.si).at(-1)); }
}
// With focus outside the room (nothing picked yet), left and right switch rooms directly.
document.addEventListener('keydown', (e) => {
  if (reading || busy || catalog.open || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  if (document.activeElement !== document.body) return;
  e.preventDefault(); setView(e.key === 'ArrowRight' ? 'desk' : 'shelf');
});
// Scroll down to walk to the desk, up to walk back. On a phone the shelf scrolls first, then the desk.
let wheelLock = 0;
addEventListener('wheel', (e) => {
  if (reading || busy || catalog.open || performance.now() < wheelLock) return;
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (Math.abs(d) < 25) return;
  if (d > 0 && view === 'shelf' && (!scrollRange || scrollY >= scrollRange - 2)) setView('desk');
  else if (d < 0 && view === 'desk') setView('shelf');
  else return;
  wheelLock = performance.now() + 1100;
}, { passive: true });
$('view-shelf').onclick = () => setView('shelf');
$('view-desk').onclick = () => setView('desk');

// ---------- overlays ----------
const plaques = [];
function buildLabels() {
  $('labels').innerHTML = ''; plaques.length = 0;
  for (const cell of cells) {
    const p = el('div', 'plaque', cell.shelf.name + (cell.shelf.books.length ? '' : ' (empty)'));
    $('labels').append(p); plaques.push({ el: p, view: 'shelf', at: () => [cell.cx, cell.bottom - T / 2, D / 2 + 0.01] });
  }
  for (const [name, at] of [['Handbook', () => [handbook.rest.x, topY, handbook.rest.z + 0.78]], [desk.files.n, () => organizerAt], [phoneItem.n, () => [phoneItem.rest.x, topY, phoneItem.rest.z + 0.55]]]) {
    const p = el('div', 'plaque', name);
    $('labels').append(p); plaques.push({ el: p, view: 'desk', at });
  }
}
const v3 = new V3();
function toScreen(x, y, z) { v3.set(x, y, z).project(camera); return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight, v3.z]; }

// ---------- selection ----------
let sel = null, hovered = null, reading = null, busy = false;
const touchFirst = matchMedia('(hover: none)').matches;
const box = { name: $('box-name'), text: $('box-text'), read: $('read-btn') };
const viewItems = () => (view === 'shelf' ? books : deskItems);
function idleText() {
  box.name.textContent = view === 'shelf' ? 'Pick a book' : 'Pick something on the desk';
  box.text.textContent = touchFirst ? 'Tap to see what it is, tap again to open it.' : 'Hover to see what it is, click to open. Arrow keys and Enter work too.';
  box.read.disabled = true; box.read.textContent = 'Read';
}
function select(item, { scroll = false } = {}) {
  if (!item) return;
  const changed = sel !== item; sel = item;
  box.name.replaceChildren(item.n);
  const small = el('small', null, item.k); box.name.append(small);
  if (item.off) box.name.append(el('span', 'off', 'off'));
  box.text.textContent = item.b;
  box.read.disabled = false;
  box.read.textContent = item.type === 'phone' ? 'Pick up' : 'Read';
  box.read.setAttribute('aria-label', (item.type === 'phone' ? 'Pick up ' : 'Read ') + item.n);
  if (changed) { const c = $('cursor'); c.classList.remove('bob'); void c.offsetWidth; c.classList.add('bob'); }
  if (scroll) ensureVisible(item);
}
function step(d) { const list = viewItems(); const i = sel ? list.indexOf(sel) : -1; select(list[(i + d + list.length) % list.length], { scroll: true }); }
function vertical(d) {
  if (view !== 'shelf') return;
  const cur = sel || books[0];
  const target = cells.find((c) => c.col === cur.cell.col && c.row === cur.cell.row + d);
  const list = target ? books.filter((b) => b.si === target.si) : [];
  if (!list.length) return;
  const x = cur.mesh.position.x - cur.cell.left;
  select(list.reduce((a, b) => (Math.abs(b.mesh.position.x - target.left - x) < Math.abs(a.mesh.position.x - target.left - x) ? b : a)), { scroll: true });
}

// ---------- picking ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let pointerType = 'mouse';
function pick(e) {
  if (!renderer) return null;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(viewItems().map((b) => b.mesh), false)[0];
  return hit ? hit.object.userData.item : null;
}
const sceneEl = $('scene');
sceneEl.addEventListener('pointerdown', (e) => { pointerType = e.pointerType; });
sceneEl.addEventListener('pointermove', (e) => {
  parallax = (e.clientX / innerWidth) * 2 - 1;
  if (e.pointerType !== 'mouse' || busy || reading) return;
  hovered = pick(e);
  sceneEl.style.cursor = hovered ? 'pointer' : 'default';
  if (hovered) select(hovered);
});
sceneEl.addEventListener('pointerleave', () => { hovered = null; });
sceneEl.addEventListener('click', (e) => {
  if (busy || reading) return;
  const b = pick(e);
  if (!b) return;
  if (pointerType === 'mouse' || sel === b) openItem(b); else select(b);
});
sceneEl.addEventListener('keydown', (e) => {
  if (busy || reading) return;
  const k = e.key;
  // Walking off the right edge of the shelf goes to the desk, off the left of the desk comes back.
  if (k === 'ArrowRight' && view === 'shelf' && sel && sel.cell.col === cols - 1 && books.filter((b) => b.si === sel.si).at(-1) === sel) { e.preventDefault(); walkTo('desk'); return; }
  if (k === 'ArrowLeft' && view === 'desk' && (!sel || sel === deskItems[0])) { e.preventDefault(); walkTo('shelf'); return; }
  if (k === 'ArrowRight') step(1); else if (k === 'ArrowLeft') step(-1);
  else if (k === 'ArrowDown') vertical(1); else if (k === 'ArrowUp') vertical(-1);
  else if ((k === 'Enter' || k === ' ') && sel) openItem(sel);
  else return;
  e.preventDefault();
});
sceneEl.addEventListener('focus', () => { if (!sel) select(viewItems()[0]); });
$('prev-book').onclick = () => step(-1);
$('next-book').onclick = () => step(1);
box.read.onclick = () => sel && openItem(sel);

// ---------- flying objects between the room and the screen ----------
function screenTransform(item, rect) {
  const d = 4, k = (2 * d * FOV_T) / innerHeight;
  const pos = camera.localToWorld(new V3((rect.left + rect.width / 2 - innerWidth / 2) * k, -(rect.top + rect.height / 2 - innerHeight / 2) * k, -d));
  return { pos, quat: camera.quaternion.clone().multiply(item.faceQuat), scale: item.faceScale(rect.width * k, rect.height * k) };
}
async function fly(item, to, ms) {
  const m = item.mesh, p0 = m.position.clone(), q0 = m.quaternion.clone(), s0 = m.scale.clone();
  await tween(ms, (t) => { const e = ease(t); m.position.lerpVectors(p0, to.pos, e); m.quaternion.slerpQuaternions(q0, to.quat, e); m.scale.lerpVectors(s0, to.scale, e); });
}
async function liftOut(item, rect) {
  if (!item.mesh || !renderer) return;
  item.home = { parent: item.mesh.parent, quat: item.mesh.quaternion.clone() };
  await tween(200, (t) => { item.pull = lerp(item.pull, item.axis === 'z' ? 0.5 : 0.35, t); applyPull(item); });
  scene.attach(item.mesh);
  await fly(item, screenTransform(item, rect), 650);
}
function snapToScreen(item, rect) {
  if (!item.mesh || !renderer) return;
  const to = screenTransform(item, rect);
  item.mesh.position.copy(to.pos); item.mesh.quaternion.copy(to.quat); item.mesh.scale.copy(to.scale); item.mesh.visible = true;
}
async function flyHome(item) {
  if (!item.mesh || !renderer || !item.home) return;
  const { parent, quat } = item.home;
  const out = item.rest.clone(); if (item.axis === 'z') out.z += 0.5; else out.y += 0.35;
  await fly(item, { pos: parent.localToWorld(out), quat: quat.clone(), scale: new V3(1, 1, 1) }, 600);
  parent.attach(item.mesh); item.mesh.quaternion.copy(quat); item.pull = item.axis === 'z' ? 0.5 : 0.35;
}
function applyPull(item) {
  const p = item.mesh.position;
  if (item.axis === 'z') { p.x = item.rest.x; p.y = item.rest.y; p.z = item.rest.z + item.pull; }
  else { p.x = item.rest.x; p.z = item.rest.z; p.y = item.rest.y + item.pull; }
}
function openItem(item) {
  if (busy || reading) return;
  history.replaceState(null, '', '#/' + slug(item.n));
  return item.type === 'phone' ? openPhone(item) : openReader(item);
}

// ---------- page content ----------
function emblem(item) {
  const c = document.createElement('canvas'); c.width = c.height = 9;
  glyph(c.getContext('2d'), item.shelf ? item.shelf.glyph : item.glyph, 1, 1, 1, item.off ? '#7a7570' : (item.shelf ? item.shelf.color : item.color));
  const img = el('img', 'emblem'); img.src = c.toDataURL(); img.alt = ''; img.width = img.height = 54; return img;
}
function cmdBlock(code, label) {
  const d = el('div', 'cmd');
  const b = el('button', 'copy', 'Copy'); b.type = 'button'; b.setAttribute('aria-label', 'Copy ' + (label || 'command').toLowerCase());
  d.append(el('code', null, code), b); return d;
}
function link(label, href, download) {
  const a = el('a', null, label); a.href = href;
  if (download) a.setAttribute('download', ''); else if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
  return a;
}
function titleBlock(item) {
  const g = el('div', 'group'); const head = el('div', 'head'); const t = el('div');
  t.append(el('p', 'kind', item.k), el('h3', null, item.n)); head.append(t, emblem(item));
  g.append(head, el('div', 'rule'), el('p', 'lede', item.b)); return g;
}
function bookSections(b) {
  const s = [{ node: titleBlock(b) }, { h: 'What it does' }, { p: b.w }];
  if (b.how) s.push({ h: 'How it works' }, { list: b.how });
  if (b.u) s.push({ h: 'When to reach for it' }, { list: b.u });
  if (b.ex) s.push({ h: 'Try saying' }, { say: b.ex });
  if (b.tip) { const t = el('p', 'tip'); t.append('Tip: ' + b.tip); s.push({ node: t }); }
  const get = b.get || {};
  s.push({ h: 'Get it' });
  if (b.off) s.push({ p: 'Installed on my machine but switched off.' });
  if (get.cmd) s.push({ code: get.cmd, label: 'install command' });
  if (get.note) s.push({ p: get.note });
  const links = el('p', 'links');
  if (get.file) links.append(link('Download the file', get.file, true));
  if (get.link) links.append(link(get.file ? 'Open the page' : 'Open the page', get.link));
  if (b.s && b.s !== get.link) links.append(link('Source', b.s));
  if (links.childNodes.length) s.push({ node: links });
  if (b.t) { const tags = el('div', 'tags'); b.t.forEach((t) => tags.append(el('span', null, t))); s.push({ node: tags }); }
  return s;
}
function deskSections(item) {
  const s = [{ node: titleBlock(item) }, ...item.sections];
  if (item.download) { const p = el('p', 'links'); p.append(link('Download this as Markdown', item.download, true)); s.push({ h: 'Take it with you' }, { p: 'The same content as one Markdown file, ready to hand to your own agent.' }, { node: p }); }
  return s;
}
// Text with **bold** runs, built as nodes (never innerHTML).
function rich(tag, cls, text) {
  const e = el(tag, cls);
  String(text).split(/\*\*(.+?)\*\*/).forEach((part, i) => { if (part) e.append(i % 2 ? el('strong', null, part) : part); });
  return e;
}
function toBlocks(sections) {
  const out = []; let pending = null;
  const push = (node) => { if (pending) { const g = el('div', 'group'); g.append(pending, node); out.push(g); pending = null; } else out.push(node); };
  for (const s of sections) {
    if (s.h) { if (pending) out.push(pending); pending = el('h4', null, s.h); }
    else if (s.p) push(rich('p', null, s.p));
    else if (s.list) s.list.forEach((li) => { const ul = el('ul'); ul.append(rich('li', null, li)); push(ul); });
    else if (s.say) s.say.forEach((x) => push(el('p', 'say', x)));
    else if (s.pairs) s.pairs.forEach(([a, b]) => { const d = el('div', 'pair'); d.append(el('b', null, a), rich('span', null, b)); push(d); });
    else if (s.code) push(cmdBlock(s.code, s.label));
    else if (s.node) push(s.node);
  }
  if (pending) out.push(pending);
  return out;
}
// Flow blocks into as many pages as they need, measuring real rendered height.
function paginate(blocks, pw, ph) {
  const meas = el('div', 'page');
  meas.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;width:${pw}px;height:${ph}px;`;
  $('stage').append(meas);
  const limit = () => meas.getBoundingClientRect().bottom - parseFloat(getComputedStyle(meas).paddingBottom);
  const pages = []; let cur = [];
  for (const b of blocks) {
    meas.append(b);
    if (b.getBoundingClientRect().bottom > limit() + 0.5 && cur.length) { b.remove(); pages.push(cur); cur = []; meas.replaceChildren(b); }
    cur.push(b);
  }
  if (cur.length) pages.push(cur);
  meas.remove();
  return pages.map((bl) => { const p = el('div', 'page'); p.append(...bl); return p; });
}
// The handbook: a contents page, then each chapter opens with its title on a left page and a Clawd on the right.
const ART_BG = ['#f3d9b1', '#cfe3f0', '#e5d4ef', '#d7ecd3', '#f5e3a8', '#e9d6f2', '#d3dcef', '#f6d7cf', '#f0e0c8', '#dcefe7'];
const ART_ALT = { hardhat: 'in a hard hat', sunglasses: 'in sunglasses', detective: 'with a detective hat and magnifier', headphones: 'with headphones', medal: 'wearing a medal', wizard: 'in a wizard hat', captain: 'in a navy captain hat', saxophone: 'playing a saxophone', beret: 'in a beret with a paintbrush', party: 'in a party hat' };
function handbookPages(item, ph) {
  const toc = el('div', 'page toc'); const list = el('ol', 'toc-list');
  toc.append(el('p', 'kind', item.k), el('h3', null, 'Contents'), el('div', 'rule'), list);
  const P = [toc], starts = [];
  item.chapters.forEach((ch, i) => {
    if (!single() && P.length % 2 === 0) P.push(blank());
    starts.push(P.length);
    const t = el('div', 'page chapter-title');
    t.append(el('p', 'kind', 'Chapter ' + (i + 1)), el('h3', null, ch.title), el('div', 'rule'), rich('p', 'lede', ch.intro));
    const art = el('div', 'page chapter-art'); const img = el('img');
    img.src = clawdArt(ch.art, ART_BG[i % ART_BG.length]); img.alt = 'Clawd the Claude crab ' + (ART_ALT[ch.art] || '');
    art.style.backgroundColor = ART_BG[i % ART_BG.length]; art.append(img);
    P.push(t, art, ...paginate(toBlocks(ch.sections), pw, ph));
  });
  item.chapters.forEach((ch, i) => {
    const b = el('button', 'toc-row'); b.type = 'button';
    b.append(el('span', null, i + 1 + '. ' + ch.title), el('span', 'toc-page', String(starts[i] + 1)));
    b.onclick = () => turn(single() ? starts[i] + 1 : (starts[i] + 3) / 2);
    const li = el('li'); li.append(b); list.append(li);
  });
  const dl = el('p', 'links'); dl.append(link('Download the handbook as Markdown', item.download, true)); toc.append(dl);
  return P;
}

// ---------- the book itself ----------
const reader = $('reader'), spread = $('spread');
const SEG = 8;
let leaves = [], flips = 0, pw = 0;
function endpaper(lines) {
  const p = el('div', 'page endpaper'); const s = el('div', 'stamp');
  lines.forEach((l, i) => s.append(el(i ? 'p' : 'h4', null, l))); p.append(s); return p;
}
const blank = () => el('div', 'page blank');
function cover(item) {
  const c = el('div', 'cover');
  const tex = item.type === 'tome' ? handbookCover : item.coverTex;
  c.style.backgroundImage = `url(${tex.image.toDataURL()})`;
  const plate = el('div', 'plate'); plate.append(el('h3', null, item.n), el('p', null, item.k)); c.append(plate); return c;
}
function exLibris(item) {
  if (item.type === 'book') return ['From the library of ' + library.owner, item.shelf.name + ' shelf', 'Updated ' + library.updated];
  return [item.n, 'From ' + library.owner + (item.type === 'file' ? "'s vault" : "'s desk"), 'Updated ' + library.updated];
}
// A leaf is one sheet. At rest it shows two full faces; while turning it swaps to a chain of
// thin hinged strips that bend in sequence, which is what makes the page curl.
function makeLeaf(front, back) {
  const leaf = el('div', 'leaf');
  front.classList.add('face', 'front', 'rest'); back.classList.add('face', 'back', 'rest');
  const curl = el('div', 'curl'); curl.setAttribute('aria-hidden', 'true'); curl.inert = true;
  const sw = pw / SEG; const segs = []; let parent = curl;
  for (let i = 0; i < SEG; i++) {
    const seg = el('div', 'seg');
    const f = el('div', 'face front'), b = el('div', 'face back');
    const fc = front.cloneNode(true), bc = back.cloneNode(true);
    fc.classList.remove('face', 'rest'); fc.classList.add('slice'); fc.style.left = -i * sw + 'px';
    bc.classList.remove('face', 'rest', 'front'); bc.classList.add('slice'); bc.style.left = -(pw - (i + 1) * sw) + 'px';
    f.append(fc); b.append(bc); seg.append(f, b); parent.append(seg); segs.push(seg); parent = seg;
  }
  leaf.append(front, back, curl); leaf.segs = segs; spread.append(leaf);
  return leaf;
}
function stack() {
  leaves.forEach((l, i) => { if (!l.classList.contains('turning')) l.style.zIndex = i < flips ? i + 1 : leaves.length * 2 - i; });
  leaves.forEach((l, i) => { l.children[0].inert = i !== flips; l.children[1].inert = i !== flips - 1; });
}
const single = () => innerWidth <= 640;
function buildReader(item) {
  spread.replaceChildren(); flips = 0;
  pw = single() ? Math.min(innerWidth * 0.88, 420) : Math.min(innerWidth * 0.4, 460, (innerHeight - 140) * 0.72);
  const ph = Math.min(pw / 0.68, innerHeight - (single() ? 120 : 140));
  spread.style.setProperty('--pw', pw + 'px'); spread.style.setProperty('--ph', ph + 'px'); spread.style.setProperty('--sw', pw / SEG + 'px');
  spread.classList.add('closed');
  reader.classList.remove('skin-book', 'skin-file', 'skin-tome'); reader.classList.add('skin-' + item.type);
  const pages = item.type === 'tome' ? handbookPages(item, ph) : paginate(toBlocks(item.type === 'book' ? bookSections(item) : deskSections(item)), pw, ph);
  pages.forEach((p, i) => { if (!p.matches('.blank, .chapter-art')) p.append(el('p', 'folio', String(i + 1))); });
  leaves = [makeLeaf(cover(item), endpaper(exLibris(item)))];
  if (single()) pages.forEach((p) => leaves.push(makeLeaf(p, blank())));
  else for (let i = 0; i < pages.length; i += 2) leaves.push(makeLeaf(pages[i], pages[i + 1] || blank()));
  leaves.push(makeLeaf(endpaper(['The end', item.type === 'book' ? 'Put it back on the shelf when done.' : 'Put it back on the desk when done.']), blank()));
  stack(); updateCount();
  $('reader-title').textContent = item.n;
}
function updateCount() {
  const max = leaves.length - 1;
  $('page-count').textContent = flips === 0 ? 'Cover' : (single() ? 'Page ' : 'Spread ') + flips + ' of ' + max;
  $('page-prev').disabled = flips === 0; $('page-next').disabled = flips === max;
}
const TURN_MS = 900;
function animateTurn(leaf, forward) {
  const from = forward ? 0 : -180, to = forward ? -180 : 0;
  leaf.style.transform = 'none'; leaf.classList.add('turning');
  spread.style.setProperty('--turn', TURN_MS + 'ms');
  const segs = leaf.segs;
  const anims = [segs[0].animate([{ transform: `rotateY(${from}deg)` }, { transform: `rotateY(${to}deg)` }], { duration: TURN_MS, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' })];
  // Each strip bends a little further than the one before it, so the free edge leads the turn.
  for (let i = 1; i < segs.length; i++) {
    const bend = (forward ? -1 : 1) * (2 + i * 1.6);
    anims.push(segs[i].animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${bend}deg)`, offset: 0.42 }, { transform: 'rotateY(0deg)' }], { duration: TURN_MS, easing: 'ease-in-out' }));
  }
  return anims[0].finished.then(() => { leaf.style.transform = `rotateY(${to}deg)`; leaf.classList.remove('turning'); anims.forEach((a) => a.cancel()); });
}
function turn(to) {
  to = clamp(to, 0, leaves.length - 1);
  if (to === flips) return;
  const forward = to > flips;
  const leaf = forward ? leaves[flips] : leaves[flips - 1];
  if (leaf.classList.contains('turning')) return;
  flips += forward ? 1 : -1;
  spread.classList.toggle('closed', flips === 0);
  leaf.style.zIndex = 999;
  const done = animateTurn(leaf, forward);
  stack(); updateCount();
  done.then(stack);
  if (flips !== to) setTimeout(() => turn(to), Math.abs(to - flips) > 2 ? 70 : 140);
}
// Closing shuts the book in one motion: every turned page swings back together, like a real cover.
function shut() {
  const turned = leaves.slice(0, flips);
  flips = 0; spread.classList.add('closed'); updateCount();
  if (!turned.length) return Promise.resolve();
  const D = 650;
  turned.forEach((l, i) => { l.style.zIndex = 500 + i; });
  const anims = turned.map((l) => l.animate([{ transform: 'rotateY(-180deg)' }, { transform: 'rotateY(0deg)' }], { duration: D, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }));
  setTimeout(() => turned.forEach((l, i) => { l.style.zIndex = 500 + turned.length - i; }), D / 2);
  return anims[0].finished.then(() => { turned.forEach((l) => { l.style.transform = 'rotateY(0deg)'; }); anims.forEach((a) => a.cancel()); stack(); });
}
$('page-next').onclick = () => turn(flips + 1);
$('page-prev').onclick = () => turn(flips - 1);
$('close-book').onclick = () => closeReader();
// A click anywhere outside the book or phone puts it back.
reader.addEventListener('click', (e) => { if (!e.target.closest('.spread, .reader-bar')) closeReader(); });
$('phone').addEventListener('click', (e) => { if (!e.target.closest('.handset, #phone-close')) closePhone(); });
let swipeX = null;
$('stage').addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
$('stage').addEventListener('pointerup', (e) => {
  if (swipeX == null || busy) return;
  const dx = e.clientX - swipeX; swipeX = null;
  if (e.target.closest('a, button, code')) return;
  const mid = spread.getBoundingClientRect(); const center = single() ? 0 : mid.left + mid.width / 2;
  if (Math.abs(dx) > 40) turn(flips + (dx < 0 ? 1 : -1));
  else if (Math.abs(dx) < 8) turn(flips + (e.clientX > center ? 1 : -1));
});
function trapTab(e, root) {
  const f = [...root.querySelectorAll('button:not(:disabled), a[href]')].filter((x) => x.offsetParent && !x.closest('[inert]'));
  const i = f.indexOf(document.activeElement);
  if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
}
// Keys go to whichever overlay is open, even if focus fell back to the page body.
document.addEventListener('keydown', (e) => {
  if (!reading || busy) return;
  (reading.type === 'phone' ? phoneKeys : readerKeys)(e);
});
function readerKeys(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeReader(); }
  else if (e.key === 'ArrowRight') turn(flips + 1);
  else if (e.key === 'ArrowLeft') turn(flips - 1);
  else if (e.key === 'Home') turn(0);
  else if (e.key === 'End') turn(leaves.length - 1);
  else if (e.key === 'Tab') trapTab(e, reader);
}

async function openReader(item) {
  if (busy || reading) return;
  busy = true; reading = item; select(item);
  document.body.style.overflow = 'hidden';
  $('cursor').style.display = 'none';
  reader.hidden = false;
  buildReader(item);
  await liftOut(item, leaves[0].getBoundingClientRect());
  reader.classList.add('shown');
  await wait(180);
  if (item.mesh) item.mesh.visible = false;
  await wait(120);
  turn(1);
  $('page-next').focus();
  busy = false;
}
async function closeReader() {
  if (busy || !reading || reading.type === 'phone') return;
  busy = true; const item = reading;
  await shut();
  await wait(250);
  snapToScreen(item, leaves[0].getBoundingClientRect());
  reader.classList.remove('shown');
  await wait(200);
  reader.hidden = true;
  await flyHome(item);
  finishClose();
}
function finishClose() {
  reading = null; busy = false;
  document.body.style.overflow = '';
  history.replaceState(null, '', view === 'desk' ? '#desk' : location.pathname + location.search);
  if (pendingRebuild) { pendingRebuild = false; buildRoom(); }
  sceneEl.focus({ preventScroll: true });
}

// ---------- the phone ----------
const phone = $('phone'), lcd = $('lcd-body');
let pstack = [], psel = 0;
const KEYS = [['1', ''], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', ''], ['0', ''], ['#', '']];
KEYS.forEach(([k, sub]) => {
  const b = el('button', 'key'); b.type = 'button'; b.append(k, el('small', null, sub || ' '));
  b.setAttribute('aria-label', /\d/.test(k) ? 'Key ' + k : k === '*' ? 'Star key' : 'Hash key');
  b.onclick = () => { if (/\d/.test(k)) pickNumber(Number(k) === 0 ? 10 : Number(k)); };
  $('keypad').append(b);
});
function phoneList() {
  const top = pstack[pstack.length - 1];
  if (!top) return desk.phone.menus.map((m) => m.name + ' (' + m.items.length + ')');
  if (top.item == null) return desk.phone.menus[top.menu].items.map((i) => i.n);
  return null;
}
function renderPhone(focusRow) {
  const top = pstack[pstack.length - 1];
  const title = !top ? 'Menu' : top.item == null ? desk.phone.menus[top.menu].name : desk.phone.menus[top.menu].items[top.item].n;
  $('phone-title').textContent = title;
  const list = phoneList();
  if (list) {
    const ul = el('ul');
    list.forEach((label, i) => {
      const li = el('li'); const b = el('button', 'row'); b.type = 'button';
      b.append(el('span', null, i < 9 ? String(i + 1) : ' '), el('span', null, label));
      b.setAttribute('aria-current', String(i === psel));
      b.onclick = () => { psel = i; enterPhone(); };
      li.append(b); ul.append(li);
    });
    lcd.replaceChildren(ul);
    const row = ul.children[psel]?.firstChild;
    if (row) { row.scrollIntoView({ block: 'nearest' }); if (focusRow) row.focus(); }
  } else {
    const it = desk.phone.menus[top.menu].items[top.item];
    const d = el('div', 'detail'); d.append(el('h3', null, it.n));
    if (it.by) d.append(el('p', 'by', 'by ' + it.by));
    d.append(el('p', null, it.d));
    if (it.why) d.append(el('p', null, it.why));
    (it.links || []).forEach((l) => { const p = el('p'); p.append(link(l.label, l.href, l.download)); d.append(p); });
    lcd.replaceChildren(d); lcd.scrollTop = 0;
    if (focusRow) (d.querySelector('a') || $('key-back')).focus();
  }
}
function enterPhone() {
  const top = pstack[pstack.length - 1];
  if (!top) pstack.push({ menu: psel });
  else if (top.item == null) pstack.push({ menu: top.menu, item: psel });
  else return;
  psel = 0; renderPhone(true);
}
function backPhone() {
  const top = pstack.pop();
  if (!top) return;
  psel = top.item != null ? top.item : top.menu;
  renderPhone(true);
}
function movePhone(d) { const list = phoneList(); if (!list) { lcd.scrollTop += d * 40; return; } psel = (psel + d + list.length) % list.length; renderPhone(true); }
function pickNumber(n) { const list = phoneList(); if (list && n <= list.length) { psel = n - 1; enterPhone(); } }
$('key-select').onclick = $('key-ok').onclick = () => enterPhone();
$('key-back').onclick = () => backPhone();
$('key-up').onclick = () => movePhone(-1);
$('key-down').onclick = () => movePhone(1);
$('phone-close').onclick = () => closePhone();
function phoneKeys(e) {
  if (e.key === 'Escape') { e.preventDefault(); closePhone(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); movePhone(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); movePhone(1); }
  else if (e.key === 'Backspace' || e.key === 'ArrowLeft') { e.preventDefault(); backPhone(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); enterPhone(); }
  else if (/^[1-9]$/.test(e.key)) pickNumber(Number(e.key));
  else if (e.key === 'Tab') trapTab(e, phone);
}
async function openPhone(item) {
  if (busy || reading) return;
  busy = true; reading = item; select(item);
  document.body.style.overflow = 'hidden';
  $('cursor').style.display = 'none';
  pstack = []; psel = 0; renderPhone(false);
  phone.hidden = false;
  await liftOut(item, $('handset').getBoundingClientRect());
  phone.classList.add('shown');
  await wait(180);
  if (item.mesh) item.mesh.visible = false;
  lcd.querySelector('button')?.focus();
  busy = false;
}
async function closePhone() {
  if (busy || !reading || reading.type !== 'phone') return;
  busy = true; const item = reading;
  snapToScreen(item, $('handset').getBoundingClientRect());
  phone.classList.remove('shown');
  await wait(200);
  phone.hidden = true;
  await flyHome(item);
  finishClose();
}

// ---------- copy buttons ----------
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy');
  if (!btn) return;
  const code = btn.previousElementSibling;
  try { await navigator.clipboard.writeText(code.textContent); toast('Copied to clipboard'); btn.textContent = 'Copied'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
  catch { const r = document.createRange(); r.selectNodeContents(code); getSelection().removeAllRanges(); getSelection().addRange(r); toast('Selected. Press Ctrl+C to copy'); }
});

// ---------- catalog ----------
const catalog = $('catalog');
function buildCatalog() {
  const list = $('catalog-list'); list.replaceChildren();
  const group = (name, color, items, goView) => {
    const h = el('h3'); const sw = el('i'); sw.style.background = color; h.append(sw, name + ' (' + items.length + ')');
    const ul = el('ul');
    if (!items.length) ul.append(el('li', null, 'This shelf is empty. Add books in library.js.'));
    items.forEach((it) => {
      const li = el('li'); const btn = el('button'); btn.type = 'button';
      btn.append(it.n + (it.off ? ' (off)' : ''), el('span', null, it.k));
      btn.onclick = async () => {
        catalog.close();
        if (view !== goView) { setView(goView); await wait(950); }
        select(it, { scroll: true }); await wait(scrollRange ? 500 : 50); openItem(it);
      };
      li.dataset.find = [it.n, it.k, it.b, ...(it.t || [])].join(' ').toLowerCase();
      li.append(btn); ul.append(li);
    });
    list.append(h, ul);
  };
  library.shelves.forEach((shelf, si) => group(shelf.name, shelf.color, books.filter((b) => b.si === si), 'shelf'));
  group('On the desk', '#c79a5b', deskItems, 'desk');
}
const search = $('catalog-search');
search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase(); let any = false;
  for (const ul of $('catalog-list').querySelectorAll('ul')) {
    let n = 0;
    for (const li of ul.children) { li.hidden = !!q && !(li.dataset.find || '').includes(q); if (!li.hidden) n++; }
    ul.hidden = ul.previousElementSibling.hidden = n === 0; if (n) any = true;
  }
  $('catalog-empty').hidden = any;
});
function openCatalog() { catalog.showModal(); search.select(); }
document.addEventListener('keydown', (e) => { if (e.key === '/' && !reading && !catalog.open) { e.preventDefault(); openCatalog(); } });
$('index-btn').onclick = openCatalog;
$('catalog-close').onclick = () => catalog.close();

// ---------- loop ----------
let pendingRebuild = false, lastCols = 0;
function resize() {
  if (!renderer) return;
  const px = innerWidth < 700 ? 2 : 3;
  renderer.setSize(Math.ceil(innerWidth / px), Math.ceil(innerHeight / px), false);
  const wantCols = innerWidth / innerHeight < 0.85 ? 1 : 3;
  if (wantCols !== lastCols) { lastCols = wantCols; if (reading) pendingRebuild = true; else buildRoom(); }
  else fitCamera();
}
addEventListener('resize', resize);

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!reading && !busy) {
    camX = lerp(camX, parallax * 0.18, Math.min(1, dt * 3));
    const target = pose(view);
    const e = ease(viewT);
    camera.position.lerpVectors(camFrom.pos, target.pos, e); camLook.lerpVectors(camFrom.look, target.look, e);
    camera.lookAt(camLook);
    for (const it of [...books, ...deskItems]) {
      if (!it.mesh || it.mesh.parent === scene) continue;
      const goal = it === sel || it === hovered ? (it.axis === 'z' ? 0.14 : 0.12) : 0;
      it.pull = lerp(it.pull, goal, Math.min(1, dt * 12));
      applyPull(it);
    }
    for (const p of plaques) {
      const [x, y, z] = toScreen(...p.at());
      p.el.style.display = p.view === view && z < 1 ? 'block' : 'none';
      p.el.style.left = x + 'px'; p.el.style.top = y + 'px';
    }
    const c = $('cursor');
    if (sel && sel.mesh) {
      const top = sel.axis === 'z' ? [sel.mesh.position.x, sel.rest.y + sel.h / 2 + 0.03, sel.mesh.position.z + BD / 2] : [sel.mesh.position.x, sel.mesh.position.y + sel.h / 2 + 0.25, sel.rest.z];
      const [x, y] = toScreen(...top);
      c.style.display = 'block'; c.style.transform = `translate(${x - 10}px, ${y - 18}px)`;
    } else c.style.display = 'none';
  }
  $('labels').style.visibility = reading ? 'hidden' : 'visible';
  animateBowl(now / 1000);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

// ---------- start ----------
buildCatalog();
if (!renderer) {
  box.name.textContent = 'No 3D in this browser';
  box.text.textContent = 'WebGL could not start here. The card catalog still opens every book.';
  $('scene').setAttribute('aria-hidden', 'true');
  catalog.showModal();
} else {
  document.fonts.ready.then(() => {
    resize();
    const p = pose(view); camFrom.pos.copy(p.pos); camFrom.look.copy(p.look); camera.position.copy(p.pos); camLook.copy(p.look);
    $('view-shelf').setAttribute('aria-pressed', String(view === 'shelf'));
    $('view-desk').setAttribute('aria-pressed', String(view === 'desk'));
    idleText();
    requestAnimationFrame(loop);
    if (deepLink) { select(deepLink, { scroll: true }); setTimeout(() => openItem(deepLink), 500); }
  });
}
