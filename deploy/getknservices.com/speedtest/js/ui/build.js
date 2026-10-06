// build.js - DOM preparation and the block-build primitives (snap in / out, letters, rolls, tiles).
// Everything here runs BEFORE the layer is cloned, so the blueprint twin gets identical markup,
// and every tween targets both copies through class selectors.

const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const gsap = () => window.gsap;

export const SNAP = '.js-snap, .js-c, .js-b1, .js-b2, .js-e, .js-cap, .js-card';

export function prepareDom(root) {
  // 1. block covers
  $$(SNAP, root).forEach((el) => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (!el.querySelector(':scope > .blk')) { const b = document.createElement('i'); b.className = 'blk'; b.setAttribute('aria-hidden', 'true'); el.appendChild(b); }
  });
  // 2. hero letters
  $$('.hero__h1 .hl', root).forEach((line) => {
    const host = line.querySelector('em') || line;
    const text = host.textContent;
    host.textContent = '';
    for (const ch of text) {
      const s = document.createElement('span');
      s.className = ch === ' ' ? 'ch ch--sp' : 'ch';
      s.textContent = ch === ' ' ? ' ' : ch;
      host.appendChild(s);
    }
  });
  $$('.hero__h1', root).forEach((h) => { const r = document.createElement('i'); r.className = 'runner'; r.setAttribute('aria-hidden', 'true'); h.appendChild(r); });
  // 3. rolling digits
  $$('.js-roll', root).forEach((el) => {
    const to = String(el.dataset.to || '0');
    el.textContent = '';
    el.setAttribute('aria-hidden', 'true');
    for (const d of to) {
      if (!/[0-9]/.test(d)) { const s = document.createElement('span'); s.className = 'sep'; s.textContent = d; el.appendChild(s); continue; }
      const win = document.createElement('span'); win.className = 'roll';
      const col = document.createElement('span'); col.className = 'roll__col'; col.dataset.d = d;
      for (let k = 0; k <= 9; k++) { const s = document.createElement('span'); s.textContent = k; col.appendChild(s); }
      win.appendChild(col); el.appendChild(win);
    }
  });
  // 4. picture tiles (bakery cards): 4 x 5 squares of the 4:5 picture
  $$('.bk-media', root).forEach((m) => {
    const url = m.dataset.img;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
      const t = document.createElement('i');
      t.style.backgroundImage = `url("${url}")`;
      t.style.backgroundPosition = `${(c / 3) * 100}% ${(r / 4) * 100}%`;
      m.appendChild(t);
    }
  });
  // 5. card / step surfaces built from blocks (cols x rows close to square cells)
  $$('.card, .js-tiles', root).forEach((card) => {
    const [c, r] = card.classList.contains('card') ? [6, 9] : card.classList.contains('step') ? [6, 4] : [8, 4];
    const g = document.createElement('div'); g.className = card.classList.contains('card') ? 'card__tiles' : 'tiles'; g.setAttribute('aria-hidden', 'true');
    g.style.gridTemplateColumns = `repeat(${c}, 1fr)`; g.style.gridTemplateRows = `repeat(${r}, 1fr)`;
    for (let k = 0; k < c * r; k++) g.appendChild(document.createElement('i'));
    card.prepend(g);
  });
  // 5b. stat numerals: digit count drives their width-safe size (css --len)
  $$('.stat b', root).forEach((b) => b.style.setProperty('--len', b.textContent.trim().length));
  // 6. marquee text
  $$('.marquee--a .marquee__row', root).forEach((r) => { r.innerHTML = '<span>Build 01 <i>·</i> Bakery <i>·</i> </span>'.repeat(4); });
  $$('.marquee--b .marquee__row', root).forEach((r) => { r.innerHTML = '<span>Build 02 <i>·</i> Barber <i>·</i> </span>'.repeat(4); });
  $$('.marquee--c .marquee__row', root).forEach((r) => { r.innerHTML = '<span>Build 03 <i>·</i> Garage <i>·</i> </span>'.repeat(4); });
  $$('.marquee--d .marquee__row', root).forEach((r) => { r.innerHTML = '<span>Build 04 <i>·</i> Dental <i>·</i> </span>'.repeat(4); });
}

// Hidden pre-state for a set of snap targets.
export function hideSnap(sel, rm) {
  const g = gsap();
  if (rm) { g.set(sel, { autoAlpha: 0 }); g.set(blkOf(sel), { scaleX: 0 }); return; }
  g.set(sel, { clipPath: 'inset(0% 100% 0% 0%)' });
  g.set(blkOf(sel), { scaleX: 1, transformOrigin: '100% 50%' });
}
export function showSnap(sel) {
  const g = gsap();
  g.set(sel, { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1 });
  g.set(blkOf(sel), { scaleX: 0 });
}
function blkOf(sel) {
  return els(sel).map((e) => e.querySelector(':scope > .blk')).filter(Boolean);
}
function els(sel) { return typeof sel === 'string' ? $$(sel) : (sel.length !== undefined ? Array.from(sel) : [sel]); }

// The finished layer and its blueprint twin. Staggers index WITHIN a layer, so the twin's
// element i always moves with the finished element i.
let ROOTS = [document];
export function setRoots(fin, bp) { ROOTS = bp ? [fin, bp] : [fin]; }
export function pairs(sel) {
  if (typeof sel !== 'string') return els(sel).map((e) => [e]);
  const lists = ROOTS.map((r) => $$(sel, r));
  return lists[0].map((e, i) => lists.map((l) => l[i]).filter(Boolean));
}
const blks = (pair) => pair.map((e) => e.querySelector(':scope > .blk')).filter(Boolean);

// Snap in: a solid block grows in steps, then retreats and leaves the finished element.
// d = duration of each half, st = stagger, in timeline units (seconds or vh).
export function snapIn(tl, sel, at, { d = 0.12, st = 0.08, rm = false } = {}) {
  const list = pairs(sel);
  list.forEach((pair, i) => {
    const p = at + i * st;
    if (rm) { tl.fromTo(pair, { autoAlpha: 0 }, { autoAlpha: 1, duration: d * 2, ease: 'none', immediateRender: false }, p); return; }
    const b = blks(pair);
    // autoAlpha is in the to-vars too: a build at position 0 that is reversed and replayed (the visitor
    // comes back to a scene) must be made visible again, which a from-only value does not do
    tl.fromTo(pair, { clipPath: 'inset(0% 100% 0% 0%)', autoAlpha: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', autoAlpha: 1, duration: d, ease: 'steps(4)', immediateRender: false }, p);
    if (b.length) tl.fromTo(b, { scaleX: 1, transformOrigin: '100% 50%' }, { scaleX: 0, transformOrigin: '100% 50%', duration: d, ease: 'steps(4)', immediateRender: false }, p + d);
  });
  return at + Math.max(0, list.length - 1) * st + d * 2;
}
// Snap out: the block covers the element again, then the block is taken away.
export function snapOut(tl, sel, at, { d = 0.12, st = 0.06, rm = false } = {}) {
  const list = pairs(sel);
  list.forEach((pair, i) => {
    const p = at + i * st;
    if (rm) { tl.fromTo(pair, { autoAlpha: 1 }, { autoAlpha: 0, duration: d * 2, ease: 'none', immediateRender: false }, p); return; }
    const b = blks(pair);
    if (b.length) tl.fromTo(b, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, transformOrigin: '0% 50%', duration: d, ease: 'steps(4)', immediateRender: false }, p);
    tl.fromTo(pair, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: d, ease: 'steps(4)', immediateRender: false }, p + d);
  });
  return at + Math.max(0, list.length - 1) * st + d * 2;
}

// Digits roll up to their value.
export function rollIn(tl, scope, at, { d = 0.6, st = 0.06, rm = false } = {}) {
  const list = typeof scope === 'string' ? pairs(`${scope} .roll__col`) : $$('.roll__col', scope).map((e) => [e]);
  list.forEach((pair, i) => {
    const to = -10 * (+pair[0].dataset.d);
    if (rm) { tl.set(pair, { yPercent: to }, at); return; }
    tl.fromTo(pair, { yPercent: 0 }, { yPercent: to, duration: d, ease: 'power3.out', immediateRender: false }, at + (i % 3) * st);
  });
}
export function setRolls(scope, done) {
  els(`${scope} .roll__col`).forEach((col) => gsap().set(col, { yPercent: done ? -10 * (+col.dataset.d) : 0 }));
}

// Deterministic shuffle so both layers' tiles share one order.
export function shuffled(n, seed = 7) {
  const a = Array.from({ length: n }, (_, i) => i);
  let s = seed;
  for (let i = n - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
