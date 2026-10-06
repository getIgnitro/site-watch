// plans.js - WEBSITE PLANS screen (proof 4, D3). Four plan columns: one open, three collapsed to
// name + price + "a month". Beside them a browser frame holds a coded sample garage site that builds
// up per plan (Launch -> Business -> Pro -> Store); the one orange block places each new part.
// main.js drives the open plan from the scroll (go), and gets told when a visitor picks a plan (onPick).
// fit() sizes the open card so it is filled top to bottom: --k scales name + price for all cards,
// --tz grows each card's two number tiles into the room its own bullets leave, --vn sizes the
// vertical names of the collapsed columns. Phone: CSS opens every card and the preview shows the full build.

import { snapIn, rollIn } from './build.js';

export function createPlans(root, { rm = false, onPick = () => {} } = {}) {
  const gsap = window.gsap;
  const sec = root.querySelector('#plans');
  const row = sec && sec.querySelector('.pln');
  if (!row) return { go() {}, fit() {}, open: () => 0, level: () => 0, phone: () => false };
  const cards = Array.from(row.querySelectorAll('.plc'));
  const pv = row.querySelector('.pv');
  const placer = pv.querySelector('.pv__placer');
  const parts = Array.from(pv.querySelectorAll('[data-from]'));
  const PHONE = matchMedia('(max-width: 700px)');
  let open = 0, level = 0, openTl = null, lvTl = null;

  // ---------- raw state (no motion) ----------
  function setOpenRaw(i) {
    row.dataset.open = String(i);
    cards.forEach((c, k) => {
      c.classList.toggle('is-open', k === i);
      const tab = c.querySelector('.plc__tab');
      if (tab) tab.setAttribute('aria-expanded', k === i ? 'true' : 'false');
    });
  }
  function setLevelRaw(L) {
    pv.dataset.level = String(L);
    parts.forEach((p) => {
      const off = +p.dataset.from > L;
      p.classList.toggle('is-off', off);
      if (!off) gsap.set(p, { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 });
    });
  }

  // ---------- the open card: its details build in as blocks ----------
  // The two columns that change width resize as plain solid blocks (contents hidden), then each
  // rebuilds its own content: the closed one its price + spine, the open one everything, digits rolling.
  const SWAP = 0.5;
  function animateOpen(card, prevCard) {
    if (openTl) openTl.progress(1).kill();
    openTl = gsap.timeline();
    const ins = [card, prevCard].filter(Boolean).map((c) => c.querySelector('.plc__in'));
    if (rm) { openTl.fromTo(ins, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: true }, SWAP); return; }
    openTl.set(ins, { autoAlpha: 0 }, 0);
    openTl.set(ins, { autoAlpha: 1 }, SWAP);
    const bits = Array.from(card.querySelectorAll('.plc__name, .plc__price, .plc__per, .plc__more .js-c'));
    snapIn(openTl, bits, SWAP, { d: 0.06, st: 0.035 });
    rollIn(openTl, card, SWAP + 0.05, { d: 0.45, st: 0.05 });
    if (prevCard) snapIn(openTl, Array.from(prevCard.querySelectorAll('.plc__price, .plc__per, .plc__name')), SWAP, { d: 0.06, st: 0.04 });
  }

  // ---------- the preview: new parts placed by the orange block, removed parts un-build ----------
  function animateLevel(from, to) {
    if (lvTl) lvTl.progress(1).kill();
    lvTl = gsap.timeline();
    if (to > from) {
      const added = parts.filter((p) => +p.dataset.from > from && +p.dataset.from <= to);
      pv.dataset.level = String(to);
      added.forEach((p) => p.classList.remove('is-off'));
      const blocks = added.filter((p) => p.classList.contains('gs-part'));
      const small = added.filter((p) => !p.classList.contains('gs-part'));
      small.forEach((p, n) => lvTl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'steps(3)', immediateRender: true }, 0.04 + n * 0.03));
      if (rm) { blocks.forEach((p) => lvTl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: true }, 0)); return; }
      const pr = pv.getBoundingClientRect();
      const sz = placer.offsetWidth || 16;
      let at = 0.06;
      blocks.forEach((p) => {
        const r = p.getBoundingClientRect();
        const x0 = r.left - pr.left, y0 = r.top - pr.top;
        lvTl.fromTo(p, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.24, ease: 'steps(6)', immediateRender: true }, at);
        lvTl.set(placer, { x: x0, y: y0, opacity: 1 }, at);
        lvTl.to(placer, { x: x0 + r.width - sz, duration: 0.24, ease: 'steps(6)' }, at);
        at += 0.2;
      });
      lvTl.to(placer, { opacity: 0, duration: 0.12, ease: 'steps(2)' }, at + 0.1);
    } else if (to < from) {
      const gone = parts.filter((p) => +p.dataset.from > to && +p.dataset.from <= from);
      gsap.set(placer, { opacity: 0 });
      gone.forEach((p, n) => lvTl.to(p, { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.14, ease: 'steps(4)' }, n * 0.025));
      lvTl.add(() => { setLevelRaw(to); }, 0.16 + gone.length * 0.025);
    }
  }

  // Open plan i. animate=false sets the state silently (scene off screen, first arrival, phone).
  function go(i, animate = true) {
    i = Math.max(0, Math.min(cards.length - 1, i | 0));
    if (PHONE.matches) { setOpenRaw(i); setLevelRaw(cards.length - 1); open = i; level = cards.length - 1; return; }
    if (i === open && level === i) return;
    const prevLevel = level, prevCard = i !== open ? cards[open] : null;
    setOpenRaw(i);
    open = i;
    level = i;
    if (animate) { animateOpen(cards[i], prevCard); animateLevel(prevLevel, i); }
    else { if (openTl) openTl.progress(1).kill(); if (lvTl) lvTl.progress(1).kill(); gsap.set(placer, { opacity: 0 }); setLevelRaw(i); }
  }

  // ---------- fit: fill the open card, size the collapsed spines ----------
  const px = (v) => parseFloat(v) || 0;
  function inner(card) { const cs = getComputedStyle(card); return card.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom); }
  // content height under .is-measuring (no min-height, no auto margins): the layout boxes only, so the
  // rolling digit columns that overflow their windows do not count
  function natural(card) { return card.querySelector('.plc__in').getBoundingClientRect().height; }
  function fit() {
    if (PHONE.matches) {
      row.style.removeProperty('--k'); row.style.removeProperty('--vn');
      cards.forEach((c) => c.style.removeProperty('--tz'));
      setLevelRaw(cards.length - 1); level = cards.length - 1;
      return;
    }
    const keep = open;
    row.classList.add('is-measuring');
    const vw = window.innerWidth;
    const tzMin = Math.max(44, Math.min(84, vw * 0.034));
    const tzMax = Math.max(84, Math.min(190, vw * 0.082));
    cards.forEach((c) => c.style.setProperty('--tz', `${tzMin}px`));
    const fitsAll = () => cards.every((c, i) => { setOpenRaw(i); return natural(c) <= inner(c) + 0.5; });
    let k = 1;
    row.style.setProperty('--k', '1');
    if (!fitsAll()) {
      let lo = 0.5, hi = 1;
      for (let n = 0; n < 8; n++) { const m = (lo + hi) / 2; row.style.setProperty('--k', String(m)); if (fitsAll()) lo = m; else hi = m; }
      k = lo; row.style.setProperty('--k', String(k));
    }
    cards.forEach((c, i) => {
      setOpenRaw(i);
      const fits = (tz) => { c.style.setProperty('--tz', `${tz}px`); return natural(c) <= inner(c) + 0.5; };
      if (fits(tzMax)) return;
      let lo = tzMin, hi = tzMax;
      for (let n = 0; n < 8; n++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; }
      c.style.setProperty('--tz', `${Math.floor(lo)}px`);
    });
    // collapsed spines: one size for all four names, the longest fills the free height of its column
    setOpenRaw(keep === 0 ? 1 : 0);
    const probe = cards[keep === 0 ? 0 : 1];
    row.style.setProperty('--vn', '100px');
    const nameOf = (c) => c.querySelector('.plc__name');
    let longest = 0, thick = 0;
    cards.forEach((c, i) => {
      setOpenRaw(i === 0 ? 1 : 0);
      const h = nameOf(c); longest = Math.max(longest, h.offsetHeight); thick = Math.max(thick, h.offsetWidth);
    });
    setOpenRaw(keep === 0 ? 1 : 0);
    const pr = probe.querySelector('.plc__pr');
    const cs = getComputedStyle(probe);
    const free = probe.clientHeight - px(cs.paddingBottom) - (pr.offsetTop + pr.offsetHeight) - 28;
    const wide = probe.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight);
    const vn = Math.max(20, Math.min(100 * free / Math.max(1, longest), 100 * wide / Math.max(1, thick)));
    row.style.setProperty('--vn', `${Math.floor(vn)}px`);
    // preview: measured at its fullest build; zoom the sample down only if that would overflow
    const site = pv.querySelector('.pv__site');
    pv.style.setProperty('--pvz', '1');
    setLevelRaw(cards.length - 1);
    const need = site.scrollHeight, have = site.clientHeight;
    pv.style.setProperty('--pvz', String(need > have + 1 ? Math.max(0.7, Math.floor((have / need) * 1000) / 1000) : 1));
    setLevelRaw(level);
    setOpenRaw(keep);
    void row.offsetWidth;
    row.classList.remove('is-measuring');
    row.dataset.k = k.toFixed(3);
  }

  // ---------- picking a plan: click anywhere on a collapsed column, or keyboard focus ----------
  cards.forEach((c, i) => {
    c.addEventListener('click', (e) => {
      if (PHONE.matches || c.classList.contains('is-open')) return;
      if (e.target.closest('a')) return;
      onPick(i);
    });
    c.addEventListener('focusin', () => { if (!PHONE.matches && !c.classList.contains('is-open')) onPick(i); });
  });

  setOpenRaw(0);
  setLevelRaw(PHONE.matches ? cards.length - 1 : 0);
  level = PHONE.matches ? cards.length - 1 : 0;
  return { go, fit, open: () => open, level: () => level, phone: () => PHONE.matches, count: cards.length };
}
