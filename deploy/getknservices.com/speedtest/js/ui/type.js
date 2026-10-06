// type.js - proof 4, TEXT agent; round 5 (E2): the block types the answer line too.
// D4 + E2: on hero, plans, social, software and end the ONE orange block types the fear line (about cap
//     height, constant rhythm); on plans, social and software the strike then wipes across it; then the
//     same block drops to the next line and types the answer, and leaves. Two typed lines per scene,
//     one block at a time. Once per arrival; replays when the visitor comes back.
// D5: end screen: "YOUR BUSINESS" builds from stroke-sized tiles in the logo N's build order, the block
//     draws "next." on, drops to type the line under it, then waits on the baseline after "next.".
// Attaches by class name only; main.js keeps its own timelines. Reduced motion: all static.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const steps = (p, n) => Math.floor(clamp01(p) * n) / n;
const io = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// Seconds. Fear line, strike and answer line together stay under about 2.5 s.
const LEAD = 0.1;       // block shows, then starts typing
const TYPE = 0.8;       // one line
const BEAT = 0.1;       // pause on a finished line
const STRIKE = 0.3;     // strike wipe
const DROP = 0.12;      // the block moves to the next line
const REST = 0.22;      // block waits on the finished answer
const FADE = 0.2;       // block leaves
const BUILD = 0.7;      // YOUR BUSINESS tiles
const DRAW = 0.4;       // "next." draws on

const DEFS = [
  { scene: '.scene--hero', fear: '.hero__fear', text: null, strike: false, sol: '.hero__sub' },
  { scene: '.scene--plans', fear: '.scene--plans .fs__fear', text: '.fs__t', strike: true, sol: '.scene--plans .fs__sol' },
  { scene: '.scene--social', fear: '.scene--social .fs__fear', text: '.fs__t', strike: true, sol: '.scene--social .fs__sol' },
  { scene: '.scene--software', fear: '.scene--software .fs__fear', text: '.fs__t', strike: true, sol: '.scene--software .fs__sol' },
  { scene: '.scene--end', fear: '.end__fear', text: null, strike: false, sol: '.end__line', end: true },
];

function ensureCss() {
  if ($('link[href$="css/type.css"]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = 'css/type.css';
  document.head.appendChild(l);
}

// Wrap every character of the text nodes in `host` (other elements, e.g. the .blk cover, stay).
function wrapChars(host) {
  const out = [];
  Array.from(host.childNodes).forEach((n) => {
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    for (const ch of n.textContent) {
      const s = document.createElement('span');
      s.className = 'ty-c';
      s.textContent = ch;
      frag.appendChild(s);
      out.push(s);
    }
    n.replaceWith(frag);
  });
  return out;
}

const shownStyle = (el) => !!el && el.style.visibility !== 'hidden' && !(el.style.opacity !== '' && +el.style.opacity < 0.02);
const unclipped = (el) => !/100%/.test(el.style.clipPath || '');

export function initType(root = document, { rm = false } = {}) {
  ensureCss();
  const lines = [];
  for (const d of DEFS) {
    const fear = $(d.fear, root);
    const scene = fear && fear.closest(d.scene);
    if (!fear || !scene) continue;
    const sol = d.sol ? $(d.sol, root) : null;
    [fear, sol].forEach((el) => { if (el) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim()); });
    const L = { d, fear, scene, sol, on: false, done: false, t0: 0, t2: null, k: -1, k2: -1, chars: [], chars2: [], cur: null, tx: null, end: null };
    lines.push(L);
    if (rm) continue;
    L.tx = d.text ? $(d.text, fear) : fear;
    L.chars = wrapChars(L.tx);
    if (d.strike && L.tx) L.tx.classList.add('ty-t');
    if (sol) L.chars2 = wrapChars(sol);
    // the block lives on the scene, not on a line: the lines are clipped to their own boxes
    const cur = document.createElement('i');
    cur.className = 'ty-cur'; cur.setAttribute('aria-hidden', 'true');
    scene.appendChild(cur);
    L.cur = cur;
  }
  const endL = lines.find((l) => l.d.end);
  if (endL) endL.end = setupEnd(root, rm);
  if (rm) { document.documentElement.classList.add('ty-rm'); if (endL && endL.end) restEnd(endL.end); return { lines, finish() {} }; }
  document.documentElement.classList.add('ty');
  lines.forEach(reset);

  const loop = (now) => {
    for (const L of lines) {
      const shown = shownStyle(L.scene) && shownStyle(L.fear) && unclipped(L.fear);
      if (shown && !L.on) { L.on = true; L.t0 = now; L.done = false; L.t2 = null; }
      else if (!shown && L.on) { L.on = false; reset(L); }
      if (L.on && !L.done) frame(L, (now - L.t0) / 1000);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.addEventListener('resize', () => { if (endL && endL.end) { endL.end.s = 0; if (!endL.on || endL.done) endL.end.grid = null; } });
  // finish(sel): complete the lines of a scene at once (the visitor moved on inside the scene)
  return { lines, finish: (sel) => lines.filter((L) => L.scene.matches(sel)).forEach(finish) };
}

function reset(L) {
  L.k = -1; L.k2 = -1; L.done = false; L.t2 = null;
  L.chars.forEach((c) => c.classList.remove('on'));
  L.chars2.forEach((c) => c.classList.remove('on'));
  if (L.cur) L.cur.style.opacity = '0';
  if (L.tx && L.d.strike) L.tx.style.setProperty('--ty-sk', '0');
  if (L.end) resetEnd(L.end);
}

function finish(L) {
  if (!L.on || L.done) return;
  typeTo(L, 'k', L.chars, L.chars.length);
  typeTo(L, 'k2', L.chars2, L.chars2.length);
  if (L.tx && L.d.strike) L.tx.style.setProperty('--ty-sk', '1');
  L.cur.style.opacity = '0';
  if (L.end) {
    const E = L.end;
    E.one.style.clipPath = 'none'; E.em.style.clipPath = 'none';
    $$('i', E.tiles).forEach((t) => { t.style.opacity = '0'; });
    placeBlock(E, 1); E.rest = true;
  }
  L.done = true;
}

// Characters 0..k-1 of a line are on.
function typeTo(L, key, chars, k) {
  const prev = L[key];
  if (k === prev) return;
  for (let i = Math.max(0, prev); i < k; i++) chars[i].classList.add('on');
  for (let i = Math.max(0, k); i < prev; i++) chars[i].classList.remove('on');
  L[key] = k;
}
// How many characters are typed e seconds into a line of n (constant rhythm, TYPE for the whole line).
const countAt = (e, n) => (e < 0 ? 0 : Math.min(n, Math.floor((e / TYPE) * n) + 1));

// Where the block sits on a line (viewport px): right after char k-1 (or on the start of char 0),
// bottom on the baseline, about cap height.
function spot(chars, k, line) {
  const ref = k > 0 ? chars[k - 1] : chars[0];
  if (!ref) return null;
  const r = ref.getBoundingClientRect();
  const fs = parseFloat(getComputedStyle(line).fontSize) || 20;
  const size = fs * 0.7;
  // Instrument Sans: the inline box is ascent+descent; baseline sits about 79% down it.
  const base = r.top + r.height * 0.79;
  return { x: k > 0 ? r.right + fs * 0.08 : r.left, y: base - size, size };
}
function putCursor(L, s, op = 1) {
  if (!s) return;
  const host = L.scene.getBoundingClientRect();
  L.cur.style.width = L.cur.style.height = `${s.size.toFixed(1)}px`;
  L.cur.style.transform = `translate(${(s.x - host.left).toFixed(1)}px, ${(s.y - host.top).toFixed(1)}px)`;
  L.cur.style.opacity = op.toFixed(3);
}

function frame(L, e) {
  const n1 = L.chars.length, n2 = L.chars2.length, E = L.end;
  // line one, then its strike
  typeTo(L, 'k', L.chars, countAt(e - LEAD, n1));
  const typed1 = LEAD + TYPE + BEAT;
  if (L.d.strike && L.tx) L.tx.style.setProperty('--ty-sk', steps((e - typed1) / STRIKE, 12).toFixed(4));
  let free = typed1 + (L.d.strike ? STRIKE : 0);   // from here the block may leave line one
  let d0 = Infinity;                               // end screen: the block starts drawing "next."
  if (E) {
    const b0 = LEAD + TYPE * 0.5;
    endTiles(E, e - b0);
    d0 = Math.max(free, b0 + BUILD);
    free = d0 + DRAW + BEAT;
  }
  const solUp = !n2 || (shownStyle(L.sol) && unclipped(L.sol));
  if (L.t2 === null && e >= free && solUp) L.t2 = e;
  if (L.t2 === null) {
    // still on line one; on the end screen the same block then draws "next." and waits after it
    if (e >= d0) { L.cur.style.opacity = '0'; placeBlock(E, endDraw(E, (e - d0) / DRAW)); }
    else putCursor(L, spot(L.chars, L.k, L.fear));
    return;
  }
  // line two
  const e2 = e - L.t2, typed2 = DROP + TYPE;
  if (E) endDraw(E, 1);
  typeTo(L, 'k2', L.chars2, countAt(e2 - DROP, n2));
  if (!n2) {
    const p = e2 / FADE;
    putCursor(L, spot(L.chars, n1, L.fear), 1 - clamp01(p));
    if (p >= 1) { L.done = true; L.cur.style.opacity = '0'; }
  } else if (e2 < DROP && !E) {
    // the drop: three stepped positions between the end of line one and the start of line two
    const a = spot(L.chars, n1, L.fear), b = spot(L.chars2, 0, L.sol), p = steps(e2 / DROP, 3);
    putCursor(L, a && b ? { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, size: a.size + (b.size - a.size) * p } : b);
  } else if (e2 < typed2 + REST) {
    if (E) E.block.style.opacity = '0';
    putCursor(L, spot(L.chars2, L.k2, L.sol));
  } else if (E) {
    // the end screen keeps its one block: back on the baseline after "next."
    L.cur.style.opacity = '0';
    placeBlock(E, 1); E.rest = true;
    L.done = true;
  } else {
    const p = (e2 - typed2 - REST) / FADE;
    putCursor(L, spot(L.chars2, n2, L.sol), 1 - clamp01(p));
    if (p >= 1) { L.done = true; L.cur.style.opacity = '0'; }
  }
}

// ---------------- D5: the end headline ----------------
let ORDER = null;
fetch('assets/logo/kn-build-mark.json').then((r) => r.json()).then((j) => {
  const b = (j.n && j.n.blocks) || [];
  if (!b.length) return;
  const cx = b.map((q) => q.x + q.s / 2), cy = b.map((q) => q.y + q.s / 2);
  const x0 = Math.min(...cx), x1 = Math.max(...cx), y0 = Math.min(...cy), y1 = Math.max(...cy);
  const maxO = Math.max(...b.map((q) => q.order));
  ORDER = b.map((q, i) => ({ u: (cx[i] - x0) / (x1 - x0 || 1), v: (cy[i] - y0) / (y1 - y0 || 1), o: q.order / (maxO || 1) }));
}).catch(() => {});

function setupEnd(root, rm) {
  const h2 = $('.end__h2', root);
  if (!h2) return null;
  const ls = $$('.l', h2);
  const one = ls[0], em = ls[1] && $('em', ls[1]);
  if (!one || !em) return null;
  h2.classList.add('ty-h2');
  const tiles = document.createElement('span');
  tiles.className = 'ty-tiles'; tiles.setAttribute('aria-hidden', 'true');
  h2.appendChild(tiles);
  const block = document.createElement('i');
  block.className = 'ty-block'; block.setAttribute('aria-hidden', 'true');
  h2.appendChild(block);
  const probe = document.createElement('span');
  probe.className = 'ty-probe'; probe.setAttribute('aria-hidden', 'true');
  em.appendChild(probe);
  const E = { h2, one, em, tiles, block, probe, grid: null, flat: false, s: 0, rest: false, lastP: -1, lastN: -1 };
  // main.js fits the headline size after load and on resize: re-measure the stroke and re-seat the block.
  if (window.ResizeObserver) new ResizeObserver(() => { E.s = 0; if (E.rest) placeBlock(E, 1); }).observe(h2);
  return E;
}

// Stroke width of the display face: ink run across the middle of an "I".
function strokeOf(el) {
  const cs = getComputedStyle(el);
  const fs = parseFloat(cs.fontSize);
  const c = document.createElement('canvas');
  c.width = Math.ceil(fs * 1.4); c.height = Math.ceil(fs * 1.4);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
  try { g.fontStretch = 'expanded'; } catch (e) { /* older engines */ }
  g.textBaseline = 'alphabetic';
  g.fillText('I', fs * 0.2, fs * 1.0);
  const row = g.getImageData(0, Math.round(fs * 0.7), c.width, 1).data;
  let w = 0;
  for (let i = 3; i < row.length; i += 4) if (row[i] > 127) w++;
  return w > 2 ? w : fs * 0.2;
}

function buildGrid(E) {
  const one = E.one;
  const h2r = E.h2.getBoundingClientRect();
  const node = Array.from(one.childNodes).find((n) => n.nodeType === 3);
  if (!node) return null;
  const cs = getComputedStyle(one);
  const s = E.s = Math.max(8, Math.round(strokeOf(one)));
  // Word rects (the line may wrap on a phone).
  const words = [];
  const re = /\S+/g; let m;
  while ((m = re.exec(node.textContent))) {
    const rg = document.createRange(); rg.setStart(node, m.index); rg.setEnd(node, m.index + m[0].length);
    words.push({ w: m[0], r: rg.getBoundingClientRect() });
  }
  if (!words.length) return null;
  // DOM baseline: a zero-size inline-block sits on it; same offset for every word (one font).
  const pb = document.createElement('span'); pb.className = 'ty-probe'; one.insertBefore(pb, one.firstChild);
  const off = pb.getBoundingClientRect().bottom - words[0].r.top; pb.remove();
  const L = Math.min(...words.map((q) => q.r.left)), T = Math.min(...words.map((q) => q.r.top));
  const R = Math.max(...words.map((q) => q.r.right)), B = Math.max(...words.map((q) => q.r.bottom));
  const cols = Math.ceil((R - L) / s), rows = Math.ceil((B - T) / s);
  // Glyph coverage per tile from an offscreen render of the same words.
  const W = cols * s, H = rows * s;
  const cov = new Uint8Array(cols * rows);
  try {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    try { g.fontStretch = 'expanded'; } catch (e) { /* ok */ }
    try { g.letterSpacing = cs.letterSpacing; } catch (e) { /* ok */ }
    g.textBaseline = 'alphabetic';
    words.forEach((q) => {
      const t = q.w.toUpperCase();
      g.fillText(t, q.r.left - L, q.r.top - T + off);
    });
    const px = g.getImageData(0, 0, W, H).data;
    for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
      let hit = 0;
      for (let y = r * s + 1; y < (r + 1) * s; y += 3) for (let x = cI * s + 1; x < (cI + 1) * s; x += 3) if (px[(y * W + x) * 4 + 3] > 100) hit++;
      cov[r * cols + cI] = hit > 1 ? 1 : 0;
    }
  } catch (e) { cov.fill(1); }
  // Order: map each tile across the N's block field, take the nearest block's build order.
  const oneR = one.getBoundingClientRect();
  const list = [];
  for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
    const u = (cI + 0.5) / cols, v = (r + 0.5) / rows;
    let key = u;
    if (ORDER) {
      let best = 1e9;
      for (const q of ORDER) { const dd = (q.u - u) ** 2 + (q.v - v) ** 2; if (dd < best) { best = dd; key = q.o + Math.sqrt(dd) * 0.02; } }
    }
    list.push({ x: L - oneR.left + cI * s, y: T - oneR.top + r * s, hx: L - h2r.left + cI * s, hy: T - h2r.top + r * s, key, ink: cov[r * cols + cI] });
  }
  list.sort((a, b) => a.key - b.key);
  E.tiles.textContent = '';
  list.forEach((t, i) => {
    t.at = (i / list.length) * (BUILD - 0.08);
    if (!t.ink) return;
    const el = document.createElement('i');
    el.style.cssText = `left:${t.hx.toFixed(1)}px;top:${t.hy.toFixed(1)}px;width:${s}px;height:${s}px`;
    E.tiles.appendChild(el);
    t.el = el;
  });
  return { s, list };
}

function resetEnd(E) {
  E.rest = false; E.flat = false; E.lastP = -1; E.lastN = -1;
  E.one.style.clipPath = 'path("M0 0Z")';
  E.em.style.clipPath = 'inset(-30% 100% -30% -12%)';
  E.block.style.opacity = '0';
  $$('i', E.tiles).forEach((t) => { t.style.opacity = '0'; });
}

function restEnd(E) {
  E.one.style.clipPath = 'none';
  E.em.style.clipPath = 'none';
  E.rest = true;
  const place = () => placeBlock(E, 1);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { E.s = 0; place(); });
  place();
  window.addEventListener('resize', place);
}

function placeBlock(E, p) {
  if (!E.s) E.s = Math.max(8, Math.round(strokeOf(E.one)));
  const s = E.s;
  const h2r = E.h2.getBoundingClientRect();
  const pr = E.probe.getBoundingClientRect();
  const er = E.em.getBoundingClientRect();
  const endX = pr.left - h2r.left + s * 0.35;
  const x = (er.left - h2r.left) + (endX - (er.left - h2r.left)) * p;
  const y = pr.bottom - h2r.top - s;
  E.block.style.width = E.block.style.height = `${s}px`;
  E.block.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  E.block.style.opacity = '1';
}

// e = seconds since the build began: "YOUR BUSINESS" appears tile by tile in the N's order.
function endTiles(E, e) {
  if (e < 0 || E.flat) return;
  if (!E.grid) {
    E.grid = buildGrid(E);
    if (!E.grid) { E.flat = true; E.one.style.clipPath = 'none'; return; }
  }
  const { s, list } = E.grid;
  // count revealed tiles; clip path = union of revealed squares
  let n = 0;
  for (const t of list) if (e >= t.at + 0.03) n++; else break;
  if (n !== E.lastN) {
    E.lastN = n;
    if (n >= list.length) E.one.style.clipPath = 'none';
    else {
      let d = 'M0 0Z';
      for (let i = 0; i < n; i++) { const t = list[i]; d += `M${t.x.toFixed(1)} ${t.y.toFixed(1)}h${s}v${s}h-${s}Z`; }
      E.one.style.clipPath = `path("${d}")`;
    }
  }
  for (const t of list) if (t.el) { const on = e >= t.at && e < t.at + 0.09; const v = on ? '1' : '0'; if (t.el.style.opacity !== v) t.el.style.opacity = v; }
}

// "next." draws on (p 0..1); returns the eased position for the block riding its edge.
function endDraw(E, p) {
  const q = io(clamp01(p));
  E.em.style.clipPath = p >= 1 ? 'none' : `inset(-30% ${((1 - q) * 112 - 12).toFixed(2)}% -30% -12%)`;
  return q;
}
