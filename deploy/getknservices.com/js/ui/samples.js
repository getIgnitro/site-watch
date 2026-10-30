// samples.js - round 4: working features inside the two sample sites, built in as a THIRD build step
// on scroll, inside each sample's own hold (no change to the scroll script):
//   bakery  pickup order (quantities, running total, pickup time), opening hours with a live
//           "Open now" state from the sample's own hours (6:30 am to 3 pm, visitor's clock), directions
//   barber  choose your barber, price list, next free chair (follows the booking widget), call + directions
// Each feature carries a KN tag naming the plan that includes it (see the round 4 report for sources).
// Phone: the step-2 panel steps aside and the features arrive as a sideways strip in its place.
import { hideSnap, snapIn } from './build.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// own stylesheet (index.html <head> is shared; this keeps the edit inside the sample sections)
(() => {
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('../../css/samples.css', import.meta.url).href;
  document.head.appendChild(l);
})();

export function initSamples(fin, { rm }) {
  const gsap = window.gsap;
  const PHONE = matchMedia('(max-width: 700px)');

  // block covers, then the unbuilt state
  $$('.js-s3', fin).forEach((el) => {
    if (!el.querySelector(':scope > .blk')) { const b = document.createElement('i'); b.className = 'blk'; b.setAttribute('aria-hidden', 'true'); el.appendChild(b); }
  });
  hideSnap('.scene--bakery .js-s3', rm);
  hideSnap('.scene--barber .js-s3', rm);
  hideSnap('.scene--garage .js-s3', rm);   // round 7: garage and dental features (js/ui/samples2.js)
  hideSnap('.scene--dental .js-s3', rm);

  // bakery: chat 19 moved its working parts to js/ui/s-bakery.js

  // barber: chat 19 moved its working parts to js/ui/s-barber.js

  // ---------- third build step, on scroll ----------
  const sets = {};
  const HERO = { barber: '.nb-hl' };
  const ASIDE = { barber: '.nb-rail' };   // garage (chat 19): its features have their own place, never swap   // dental (chat 19) has no .sx-f and never swaps
  const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  // desktop: if the features would touch the hero or the step-2 panel at this size, they take the panel's place
  const modes = {};   // decided once per screen size, so what the visitor typed never flips the layout
  function modeFor(key) {
    const sc = $(`.scene--${key}`, fin);
    const id = `${key}-${window.innerWidth}x${window.innerHeight}`;
    if (!modes[id]) modes[id] = decide(key, sc);
    sc.classList.toggle('sx-swap', modes[id] === 's');
    return modes[id];
  }
  function decide(key, sc) {
    sc.classList.remove('sx-swap');
    if (PHONE.matches) return 'p';
    const feats = $$('.sx-f', sc).filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect());
    const others = $$(`${HERO[key]}, ${ASIDE[key]}`, sc).map((e) => e.getBoundingClientRect());
    return feats.some((f) => others.some((o) => hit(f, o))) ? 's' : 'd';
  }
  function stepTl(key, mode) {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    let at = 0;
    if (mode !== 'd') {   // the step-2 panel steps aside, the features build in its place
      // (a class, not a tween: main.js already tweens the barber widget's clip and visibility)
      const sc = $(`.scene--${key}`, fin);
      const sync = () => sc.classList.toggle('sx-aside', tl.time() > 0.06);
      tl.eventCallback('onUpdate', sync);
      tl.eventCallback('onReverseComplete', sync);
      tl.to({}, { duration: 0.14 }, 0);
      at = 0.1;
    }
    snapIn(tl, `.scene--${key} .js-s3`, at, { d: 0.07, st: 0.08, rm });
    return tl;
  }
  const tlFor = (key) => { const m = modeFor(key); const k = `${key}-${m}`; return (sets[k] = sets[k] || stepTl(key, m)); };
  let zones = null;
  function setup() {
    const k = window.__kn;
    if (!k || !k.HOLD || !k.REST || !k.HOLD.bakery || !k.HOLD.barber) return false;
    const z = (key) => [k.HOLD[key][0] + 0.77 * (k.REST[key] - k.HOLD[key][0]), k.HOLD[key][1] + 2];
    zones = ['bakery', 'barber', 'garage', 'dental'].filter((key) => k.HOLD[key]).map((key) => ({ key, z: z(key), on: false, tl: null }));
    return true;
  }
  gsap.ticker.add(() => {
    if (document.documentElement.dataset.state !== 'live') return;
    if (!zones && !setup()) return;
    const k = window.__kn;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const t = (window.scrollY / max) * k.TOTAL;
    for (const z of zones) {
      const w = t >= z.z[0] && t < z.z[1];
      if (w === z.on) continue;
      z.on = w;
      if (w) { z.tl = tlFor(z.key); z.tl.timeScale(1).play(); }
      else if (z.tl) z.tl.timeScale(2.2).reverse();
    }
  });
  // a phone/desktop switch while a step is built: settle the new set, drop the old one
  PHONE.addEventListener('change', () => {
    (zones || []).forEach((z) => {
      if (!z.tl) return;
      z.tl.progress(0).pause();
      z.tl = tlFor(z.key);
      z.tl.progress(z.on ? 1 : 0).pause();
    });
  });
}
