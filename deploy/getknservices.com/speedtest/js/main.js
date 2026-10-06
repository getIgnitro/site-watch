// main.js - KN v5 "Watch it build": boot, intro (B0), scroll choreography, HUD.
// Stage: ./stage.js (engine) by default, ./stage-stub.js with ?stub=1 or if stage.js fails.
// No scrubbed reveals: the wall position and the marquee drift follow the scroll; every build-in is
// a short time-based stepped wipe fired when the scroll crosses its threshold, reversed fast when the
// visitor scrolls back. At any resting position everything is fully built.
// Proof 3: seven scenes (opening, plans, social, software, bakery, barber, end), working nav.
import { prepareDom, setRoots, hideSnap, snapIn, snapOut, rollIn, setRolls, shuffled } from './ui/build.js';
import { createLensGate } from './ui/lens.js';
import { createHud } from './ui/hud.js?v=1005';
import { initBooking } from './ui/booking.js';
import { initSamples } from './ui/samples.js';
import { initSamples2 } from './ui/samples2.js';
import { initBakery } from './ui/s-bakery.js';
import { initBarber } from './ui/s-barber.js';
import { initGarage } from './ui/s-garage.js';
import { initDental } from './ui/s-dental.js';
import { createFeed } from './ui/feed.js?v=1006';
import { initType } from './ui/type.js';
import { createPlans } from './ui/plans.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const params = new URLSearchParams(location.search);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

html.dataset.state = 'intro';
html.dataset.mode = 'hero';
html.classList.add('is-locked');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const SCENES = [
  { id: 'opening',  video: 'assets/scenes/opening.mp4', videoPhone: 'assets/scenes/m/opening.mp4',  poster: 'assets/scenes/opening.jpg',  color: '#0B0B0C', dim: 0.35 },
  { id: 'plans',    video: 'assets/scenes/opening.mp4', videoPhone: 'assets/scenes/m/opening.mp4',  poster: 'assets/scenes/opening.jpg',  color: '#0B0B0C', dim: 0.8 },
  { id: 'social',   color: '#E4DDD0', dim: 0 },   // 5 Oct: warm stone ground (was periwinkle #9CBEFE); = --ground in site.css
  { id: 'software', video: 'assets/scenes/software.mp4', videoPhone: 'assets/scenes/m/software.mp4', poster: 'assets/scenes/software.jpg', color: '#0B0B0C', dim: 0.55 },
  { id: 'bakery',   video: 'assets/scenes/bakery.mp4', videoPhone: 'assets/scenes/m/bakery.mp4',   poster: 'assets/scenes/bakery.jpg',   color: '#4A2E17', dim: 0.30 },
  { id: 'barber',   video: 'assets/scenes/barber.mp4', videoPhone: 'assets/scenes/m/barber.mp4',   poster: 'assets/scenes/barber.jpg',   color: '#0E2A21', dim: 0.30, film: { zoom: 1, x: -0.0271, y: 0 }, filmPhone: { zoom: 1, x: -0.5, y: 0 } },
  // round 7: grounds sampled from each poster (garage: the dark bay wall; dental: the back wall).
  // The dental film keeps a light dim: its sample text is dark on the bright room.
  // chat 19: optional film placement per scene, film: { zoom, x, y } (desktop) and filmPhone: { ... } (700 px and under);
  // zoom about the centre of the cover-fit film, then x / y shift in fractions of the viewport (+x right, +y down). See stage.js setCov.
  { id: 'garage',   video: 'assets/scenes/garage.mp4', videoPhone: 'assets/scenes/m/garage.mp4',   poster: 'assets/scenes/garage.jpg',   color: '#030B0E', dim: 0.30, film: { zoom: 1, x: 0, y: -0.028 }, filmPhone: { zoom: 0.42, x: -0.07, y: -0.27 } },
  { id: 'dental',   video: 'assets/scenes/dental.mp4', videoPhone: 'assets/scenes/m/dental.mp4',   poster: 'assets/scenes/dental.jpg',   color: '#CAC1B7', dim: 0.06,
    film: { zoom: 0.92, x: 0.136, y: 0.047 }, filmPhone: { zoom: 0.472, x: -0.345, y: -0.33 } },   // chat 19: the chair sits in the arch window
  { id: 'end', color: '#F3EEE4', dim: 0 },
];

// Scroll script in vh. Holds are the resting screens; flips are the only places content leaves.
// Proof 4: the plans hold is 260 vh and steps Launch -> Business -> Pro -> Store (PLAN_STEP vh each,
// Store keeps the tail). On a phone (no pin) the plans and social holds are re-measured at boot so
// their stacked content travels with the finger (script() is called again with the measured lengths).
const PHONE_MQ = matchMedia('(max-width: 700px)');
// chat 22: one scroll = one step on every screen with motion on, phones and touch screens included
const stepMode = () => !RM;
const PLAN_STEP = 60;
let SEG, FLIPS, FLIP_AT, HOLD, TOTAL, Z, REST, PLAN_REST;
function script(len = {}) {
  SEG = [
    ['hero', 30], ['rows', 50], ['plans', len.plans || 260], ['diagonal', 70], ['social', len.social || 140], ['radial', 70],
    ['software', 140], ['diagonal', 80], ['bakery', 150], ['rows', 80], ['barber', 150],
    ['diagonal', 80], ['garage', 150], ['rows', 80], ['dental', 150], ['diagonal', 50], ['end', 50],
  ];
  FLIPS = []; FLIP_AT = []; HOLD = {}; TOTAL = 0;
  for (const [k, n] of SEG) {
    if (['rows', 'diagonal', 'radial'].includes(k)) { FLIPS.push(k); FLIP_AT.push([TOTAL, TOTAL + n]); }
    else HOLD[k] = [TOTAL, TOTAL + n];
    TOTAL += n;
  }
  // Build zones: content builds once its flip is half done and leaves as the next flip starts.
  Z = {
    heroOut: FLIP_AT[0][0] - 4,
    plans: [mid(0), FLIP_AT[1][0] + 2],
    social: [mid(1), FLIP_AT[2][0] + 2],
    software: [mid(2), FLIP_AT[3][0] + 2],
    mqA: [FLIP_AT[3][0] - 4, FLIP_AT[3][1] - 14],
    bak1: [FLIP_AT[3][1] - 14, FLIP_AT[4][0] + 2], bak2: [HOLD.bakery[0] + 60, FLIP_AT[4][0] + 2],
    mqB: [FLIP_AT[4][0] - 4, FLIP_AT[4][1] - 14],
    bar1: [FLIP_AT[4][1] - 14, FLIP_AT[5][0] + 2], bar2: [HOLD.barber[0] + 60, FLIP_AT[5][0] + 2],
    // round 7: flips 5 (barber > garage) and 6 (garage > dental) are new; the end flip is now 7
    mqC: [FLIP_AT[5][0] - 4, FLIP_AT[5][1] - 14],
    gar1: [FLIP_AT[5][1] - 14, FLIP_AT[6][0] + 2], gar2: [HOLD.garage[0] + 60, FLIP_AT[6][0] + 2],
    mqD: [FLIP_AT[6][0] - 4, FLIP_AT[6][1] - 14],
    den1: [FLIP_AT[6][1] - 14, FLIP_AT[7][0] + 2], den2: [HOLD.dental[0] + 60, FLIP_AT[7][0] + 2],
    end: mid(7),
  };
  // Plan resting points inside the plans hold (vh): Launch, Business, Pro, Store.
  PLAN_REST = [0, 1, 2, 3].map((i) => HOLD.plans[0] + i * PLAN_STEP + 32);
  // Resting positions (vh) for the nav links and the shot list.
  REST = {
    top: 0,
    plans: PLAN_REST[0], social: HOLD.social[0] + 70, software: HOLD.software[0] + 70,
    bakery: HOLD.bakery[0] + 110, barber: HOLD.barber[0] + 110,
    garage: HOLD.garage[0] + 110, dental: HOLD.dental[0] + 110, end: TOTAL,
  };
}
function mid(i) { return (FLIP_AT[i][0] + FLIP_AT[i][1]) / 2; }
script();
// Which plan the scroll opens: Launch on arrival, then one step every PLAN_STEP vh of the hold.
const planAt = (t) => Math.max(0, Math.min(3, Math.floor((t - HOLD.plans[0]) / PLAN_STEP)));

// ---------- DOM ----------
const fin = $('#layer');
prepareDom(fin);
setRoots(fin, null);
$('#track').style.height = `${TOTAL + 100}vh`;

const hud = createHud({ fine: FINE, rm: RM });
if (!FINE) { const cue = $('.cue'); if (cue && cue.lastChild && cue.lastChild.nodeType === 3) cue.lastChild.nodeValue = 'Swipe up. We build as you go.'; }
initBooking(fin, { rm: RM });
initSamples(fin, { rm: RM });
initSamples2(fin, { rm: RM });
initBakery(fin, { rm: RM });
initBarber(fin, { rm: RM });
initGarage(fin, { rm: RM });
initDental(fin, { rm: RM });
const feed = createFeed(fin, { rm: RM });
const typer = initType(fin, { rm: RM });
const plans = createPlans(fin, { rm: RM, onPick: (i) => pickPlan(i) });

// ---------- Lenis ----------
let lenis = null;
// (chat 22: mouse screens only. A stopped Lenis cancels every finger move, the sideways card rows included.)
if (!RM && window.Lenis && FINE && !PHONE_MQ.matches) {
  lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

// ---------- links: every in-page link scrolls to its resting screen ----------
let isLive = false;
function scrollToVh(vh) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const y = Math.round((max * vh) / TOTAL);
  const far = Math.abs(y - window.scrollY) / Math.max(1, window.innerHeight);
  if (lenis) lenis.scrollTo(y, { duration: Math.min(3.2, 1.2 + far * 0.12), easing: (x) => 1 - Math.pow(1 - x, 3) });
  else window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (!href.startsWith('#')) return;
  e.preventDefault();
  if (!isLive) return;
  const key = href.slice(1);
  if (stepper && stepper.on() && key in STEP_OF) stepper.goTo(STEP_OF[key]);
  else if (key in REST) scrollToVh(REST[key]);
});
// Picking a plan (click or keyboard focus on a collapsed column) opens it at once and scrolls to its
// resting point; the scroll-driven step waits until the scroll has arrived, so nothing flickers.
let planLock = 0;
function pickPlan(i) {
  if (!isLive) return;
  if (stepper && stepper.on()) { stepper.goTo(stepper.planStep(i)); return; }
  planLock = performance.now() + 1700;
  plans.go(i, true);
  scrollToVh(PLAN_REST[i]);
}
// Phone (no pin): the stacked plans and social screens travel up with the scroll through their hold.
// Chat 22: with steps on, the travel rests only at fixed stops (PH_STOPS, px of travel): the opening screen,
// then one stop per card with the card's top under the bar, so one swipe shows one whole card.
const PH = { plans: null, social: null }, PH_EXT = { plans: 0, social: 0 }, PH_STOPS = { plans: [{ y: 0 }], social: [{ y: 0 }] }, PH_PAD = 20;
let PH_BAR = 64;
function phoneFit(stepped) {
  const pv = $('.scene--plans .pv', fin), cards = $$('.scene--plans .plc', fin);
  if (pv) { pv.style.maxHeight = ''; pv.classList.remove('is-cut'); }
  cards.forEach((c) => c.style.removeProperty('--pf'));
  if (!stepped) return;
  const room = window.innerHeight - PH_BAR - 20;
  // a plan card taller than the screen: --pf shrinks its display parts (price, numerals, gaps); reading text keeps its floor
  cards.forEach((c) => {
    if (c.offsetHeight <= room) return;
    let lo = 0.6, hi = 1;
    for (let i = 0; i < 7; i++) { const m = (lo + hi) / 2; c.style.setProperty('--pf', m.toFixed(3)); if (c.offsetHeight > room) hi = m; else lo = m; }
    c.style.setProperty('--pf', lo.toFixed(3));
  });
  // the sample design under the plans heading is cut at the foot of the opening screen
  if (pv) {
    const h = Math.round(window.innerHeight - (pv.getBoundingClientRect().top - PH.plans.getBoundingClientRect().top) - 14);
    if (h >= 160 && pv.offsetHeight > h) { pv.style.maxHeight = `${h}px`; pv.classList.add('is-cut'); }
  }
}
function phoneStops(k) {
  const sc = PH[k], base = sc.getBoundingClientRect().top, room = window.innerHeight - PH_BAR - 20;
  const stops = [{ y: 0 }];
  $$(k === 'plans' ? '.plc' : '.card', sc).forEach((el, card) => {
    const r = el.getBoundingClientRect(), top = r.top - base;
    let y = Math.max(0, Math.round(top - PH_BAR - 8));
    stops.push({ y, card });
    // a card still taller than the screen gets further stops, a screenful each, down to its foot
    const foot = Math.round(top + r.height + 12 - window.innerHeight);
    while (foot - y > 18) { y = Math.min(foot, y + Math.round(room * 0.86)); stops.push({ y, card, more: true }); }
  });
  return stops;
}
function phoneMeasure() {
  const phone = PHONE_MQ.matches, stepped = phone && stepMode();
  PH_BAR = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 64;
  for (const k of Object.keys(PH)) {
    PH[k] = $(`.scene--${k}`, fin);
    gsap.set(PH[k], { y: 0, clipPath: 'none' }); PH[k]._phY = 0;
  }
  phoneFit(stepped);
  for (const k of Object.keys(PH)) {
    PH_EXT[k] = phone ? Math.max(0, PH[k].offsetHeight - window.innerHeight) : 0;
    PH_STOPS[k] = stepped ? phoneStops(k) : [{ y: 0 }];
    // the last card also rests with its top under the bar, even where the screen ends sooner
    if (stepped) PH_EXT[k] = Math.max(PH_EXT[k], PH_STOPS[k][PH_STOPS[k].length - 1].y);
  }
}
// the scroll position (vh) at which a stacked phone screen has travelled y px
const phoneT = (k, y) => HOLD[k][0] + PH_PAD + (PH_EXT[k] > 0 ? y / PH_EXT[k] : 0) * (HOLD[k][1] - HOLD[k][0] - 2 * PH_PAD);
// The stops read again from the layout as it is now, without fitting or resetting anything: each phone step
// starts with this, so a font that landed late cannot leave a card under the bar (live check, chat 22).
function phoneRestops() {
  if (!PHONE_MQ.matches || !stepMode()) return;
  for (const k of Object.keys(PH)) {
    if (!PH[k]) continue;
    PH_STOPS[k] = phoneStops(k);
    PH_EXT[k] = Math.max(0, PH[k].offsetHeight - window.innerHeight, PH_STOPS[k][PH_STOPS[k].length - 1].y);
  }
}
function phoneTravel(t) {
  for (const k of Object.keys(PH)) {
    const el = PH[k];
    if (!el) continue;
    const [a, b] = HOLD[k];
    const p = Math.max(0, Math.min(1, (t - a - PH_PAD) / Math.max(1, b - a - 2 * PH_PAD)));
    const y = Math.round(-PH_EXT[k] * p);
    // content that has travelled up is clipped under the top bar so it never runs behind the logo
    if (y !== el._phY) { el._phY = y; gsap.set(el, { y, clipPath: y < 0 ? `inset(${-y + PH_BAR}px 0px 0px 0px)` : 'none' }); }
  }
}

// ---------- type fitting: the giant lines never overflow ----------
function fit() {
  const avail = window.innerWidth - 2 * parseFloat(getComputedStyle(html).getPropertyValue('--m') || 32);
  [['.hero__h1', '.hl'], ['.end__h2', '.l']].forEach(([host, line]) => {
    const h = $(host, fin);
    h.style.fontSize = '';
    const textW = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect().width; };
    const widest = Math.max(...$$(line, h).map(textW));
    const fs = parseFloat(getComputedStyle(h).fontSize);
    if (widest > avail * 0.985) h.style.fontSize = `${Math.floor(fs * (avail * 0.985) / widest)}px`;
  });
}
// Package screens: --k scales the big display parts (prices, numerals, names, button heights).
// Binary search for the largest k (capped) at which nothing overflows or runs wide: the cards fill
// their height with content instead of empty bands. Reading text keeps its floor whatever k is.
const K_MAX = { plans: 1.12, social: 1.12, software: 1.4 };
function fitPackages() {
  $$('.scene.pk:not(#plans)', fin).forEach((sc) => {
    const boxes = $$('.cards, .card, .card__body, .step, .sw-card, .stat', sc);
    const wide = $$('.card__price, .sw-card__price, .pk__h', sc);
    const lists = $$('.card__list', sc);
    const over = () => sc.scrollHeight > sc.clientHeight
      || boxes.some((b) => b.scrollHeight > b.clientHeight)
      || wide.some((w) => w.scrollWidth > w.clientWidth + 1)
      || lists.some((l) => l.scrollHeight > l.clientHeight + 1);
    const set = (k) => sc.style.setProperty('--k', k);
    let lo = 0.5, hi = K_MAX[sc.id] || 1;
    set(hi);
    if (over()) {
      for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; set(m); if (over()) hi = m; else lo = m; }
      lo = Math.max(0.5, lo - 0.012);
      set(lo);
    } else lo = hi;
    sc.dataset.k = lo.toFixed(3);
  });
  feed.measure();
  plans.fit();
}

// ---------- initial (unbuilt) states ----------
const PK = '.scene--plans, .scene--social, .scene--software';
function initialStates() {
  gsap.set('.logo', { opacity: 0 });
  hideSnap('.bar__nav, .bar__right .pill, .bar__right .btn', RM);
  gsap.set('.bar__build', { autoAlpha: 0 });
  gsap.set('.bar__bg', { scaleY: 0 });
  if (RM) gsap.set('.hero__h1', { autoAlpha: 0 });
  else gsap.set('.ch', { clipPath: 'inset(0% 100% 0% 0%)' });
  hideSnap('.scene--hero .js-snap', RM);
  setRolls('.scene--hero', false);
  gsap.set(`${PK}, .scene--bakery, .scene--barber, .scene--garage, .scene--dental, .scene--end, .marquee`, { autoAlpha: 0 });
  hideSnap(`.scene--plans .js-snap, .scene--plans .js-c, .scene--social .js-snap, .scene--social .js-c, .scene--software .js-snap, .scene--software .js-c`, RM);
  gsap.set('.card__tiles i, .tiles i', { opacity: RM ? 1 : 0 });
  gsap.set('.reel__tiles i', { opacity: RM ? 0 : 1 });
  gsap.set('.fs__t', { '--sk': RM ? 1 : 0 });
  setRolls('.scene--plans', RM); setRolls('.scene--social', RM); setRolls('.scene--software', RM); setRolls('.scene--end', RM);
  hideSnap('.scene--bakery .js-b1, .scene--bakery .js-b2, .scene--bakery .js-cap', RM);
  gsap.set('.scene--bakery .js-w', { opacity: RM ? 1 : 0 });
  hideSnap('.scene--barber .js-b1, .scene--barber .js-b2, .scene--barber .js-cap', RM);
  gsap.set('.scene--barber .js-w', { opacity: RM ? 1 : 0 });
  hideSnap('.scene--garage .js-b1, .scene--garage .js-b2, .scene--garage .js-cap', RM);
  hideSnap('.scene--dental .js-b1, .scene--dental .js-b2, .scene--dental .js-cap', RM);
  gsap.set('.scene--garage .js-w, .scene--dental .js-w', { opacity: RM ? 1 : 0 });
  hideSnap('.scene--end .js-e', RM);
}

// ---------- stage ----------
// The logo geometry is inlined in index.html (#kn-logo-data, a copy of assets/logo/kn-build-mark.json) and
// handed to the stage as a data: URL, so the intro never waits on the network. stage.js gives the file
// 1.2 s and then draws its thin stand-in N; on a slow phone connection that stand-in showed instead of the
// real mark (4 Oct). The file path stays as the fallback when the inline copy is missing.
function logoUrl() {
  const el = document.getElementById('kn-logo-data');
  const txt = el && el.textContent.trim();
  return txt ? 'data:application/json,' + encodeURIComponent(txt) : 'assets/logo/kn-build-mark.json';
}
async function makeStage() {
  let canvas = $('#stage');
  // speed: phones and touch screens get the lighter film files, a lower canvas resolution and no idle redraws
  const LITE = !FINE || PHONE_MQ.matches || window.innerWidth < 900;
  const scenes = SCENES.map((s) => (LITE && s.videoPhone) ? { ...s, video: s.videoPhone } : s);
  const cfg = { scenes, logo: logoUrl(), ink: '#0B0B0C', peri: '#9CBEFE', signal: '#EB7E3B', reducedMotion: RM, dprCap: LITE ? 1.5 : 2, idleSkip: !FINE };
  if (!params.has('stub')) {
    try {
      const m = await import('./stage.js?v=1006');
      const st = await m.createStage(canvas, cfg);
      if (st) return st;
    } catch (e) { console.warn('stage.js failed, using the stub', e); }
    const fresh = canvas.cloneNode(false);
    canvas.replaceWith(fresh);
    canvas = fresh;
  }
  const m = await import('./stage-stub.js?v=1006');
  return m.createStage(canvas, cfg);
}

// ---------- B0 intro, DOM side ----------
function heroBuild(tl) {
  if (RM) {
    tl.to('.hero__h1', { autoAlpha: 1, duration: 0.3 }, 0);
    snapIn(tl, '.scene--hero .js-snap', 0.1, { rm: true, d: 0.15, st: 0.04 });
    rollIn(tl, '.scene--hero', 0.1, { rm: true });
    return;
  }
  const h1 = $('.hero__h1', fin);
  const hr = h1.getBoundingClientRect();
  const chars = $$('.hero__h1 .ch', fin);
  const runner = $('.hero__h1 .runner', fin);
  const rs = parseFloat(getComputedStyle(h1).fontSize) * 0.12;
  const st = 0.05;
  snapIn(tl, '.hero__fear', 0, { d: 0.1 });
  tl.set(runner, { opacity: 1 }, 0);
  chars.forEach((ch, i) => {
    const cr = ch.getBoundingClientRect();
    tl.set(runner, { x: cr.right - hr.left + 2, y: cr.top - hr.top + cr.height * 0.55 - rs / 2 }, i * st);
    tl.fromTo(ch, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.1, ease: 'steps(3)', immediateRender: false }, i * st + 0.03);
  });
  const end = chars.length * st + 0.1;
  tl.to(runner, { opacity: 0, duration: 0.08, ease: 'steps(2)' }, end);
  tl.set(chars, { clipPath: 'none' }, end + 0.05); // italic overhangs of "build." stay whole at rest
  snapIn(tl, '.hero__sub', end, { d: 0.1 });
  snapIn(tl, '.price', end + 0.12, { d: 0.12 });
  rollIn(tl, '.scene--hero', end + 0.3, { d: 0.75, st: 0.08 });
  snapIn(tl, '.hero__badges .badge', end + 0.22, { d: 0.07, st: 0.06 });
  snapIn(tl, '.hero__btns .btn', end + 0.4, { d: 0.1, st: 0.1 });
}

function runIntro(stage) {
  return new Promise((resolve) => {
    hud.line('> building getknservices.com');
    const logoEl = $('.logo--paper', fin);
    const r = logoEl.getBoundingClientRect();
    const rect = new DOMRect(r.left, r.top, r.width || 64, r.height || 30);
    const heroTl = gsap.timeline({ paused: true });
    heroBuild(heroTl);
    const barTl = gsap.timeline({ paused: true });
    snapIn(barTl, '.bar__nav, .bar__right .pill, .bar__right .btn', 0, { d: 0.1, st: 0.07, rm: RM });

    let wallDone = false, typeDone = false, live = false, ended = false, logged = 0;
    const order = () => {
      const want = [];
      if (wallDone || live) want.push(`> ${stage.tileCount} blocks placed`);
      if ((wallDone && typeDone) || live) want.push('> type set');
      if (live) want.push('> film loaded', '> live');
      while (logged < want.length) hud.line(want[logged++]);
    };
    const showLogo = () => gsap.set('.logo--paper', { opacity: 1 });
    heroTl.eventCallback('onComplete', () => { typeDone = true; order(); });
    stage.on('logo-done', () => { showLogo(); barTl.play(); });
    stage.on('wall-start', () => heroTl.play());
    stage.on('wall-done', () => { wallDone = true; order(); });

    const t0 = performance.now();
    const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    const off = () => evs.forEach((ev) => window.removeEventListener(ev, onSkip, true));
    const finish = () => {
      if (ended) return;
      ended = true; live = true; off();
      heroTl.progress(1); barTl.progress(1); showLogo();
      order();
      resolve();
    };
    function onSkip() {
      if (performance.now() - t0 < 1000 || ended) return;
      off();
      if (typeof stage.skipIntro === 'function') stage.skipIntro();
      else stage.playIntro({ logoTargetRect: rect, skip: true });
      setTimeout(finish, 160);
    }
    evs.forEach((ev) => window.addEventListener(ev, onSkip, { capture: true, passive: true }));
    stage.on('live', finish);
    const p = stage.playIntro({ logoTargetRect: rect, skip: RM });
    if (p && typeof p.then === 'function') p.then(finish, finish);
    setTimeout(finish, 7500); // never strand the visitor (the intro may run up to 4.2 s)
  });
}

// ---------- time-based build timelines (seconds) ----------
const T = (o = {}) => gsap.timeline({ paused: true, defaults: { ease: 'none' }, ...o });
const showScene = (tl, sel) => tl.fromTo(sel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: false }, 0);
function popTiles(tl, tiles, at, each, seed, from = 0, to = 1) {
  shuffled(tiles.length, seed).forEach((k, i) => tl.fromTo(tiles[k], { opacity: from }, { opacity: to, duration: 0.02, ease: 'steps(1)', immediateRender: false }, at + i * each));
  return at + tiles.length * each;
}
// Fear line first (muted), then its block strike wipes across as the solution builds beneath it.
function fearSol(tl, scope, at) {
  snapIn(tl, `${scope} .fs__fear`, at, { d: 0.07, rm: RM });
  if (!RM) tl.fromTo($$(`${scope} .fs__t`, fin), { '--sk': 0 }, { '--sk': 1, duration: 0.44, ease: 'steps(14)', immediateRender: false }, at + 0.22);
  snapIn(tl, `${scope} .fs__sol`, at + 0.24, { d: 0.08, rm: RM });
}
// A block surface: its tiles pop in, the surface goes solid, then its parts snap in and digits roll.
function buildBlock(tl, box, at, seed, { each = 0.004, parts = 0.03 } = {}) {
  const tiles = $$(':scope > .card__tiles i, :scope > .tiles i', box);
  let t = at;
  if (!RM && tiles.length) {
    t = popTiles(tl, tiles, at, each, seed);
    const surf = getComputedStyle(tiles[0]).backgroundColor;
    tl.fromTo(box, { backgroundColor: 'rgba(0,0,0,0)' }, { backgroundColor: surf, duration: 0.02, ease: 'steps(1)', immediateRender: false }, t);
  }
  const bits = $$('.js-c', box);
  snapIn(tl, bits, at + 0.1, { d: 0.055, st: parts, rm: RM });
  rollIn(tl, box, at + 0.14, { d: 0.5, st: 0.05, rm: RM });
}

function heroOutTl() {
  const tl = T();
  if (RM) { snapOut(tl, '.scene--hero .js-snap', 0, { rm: true, d: 0.1, st: 0 }); tl.fromTo('.hero__h1', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, immediateRender: false }, 0); }
  else {
    tl.fromTo('.hl--1', { xPercent: 0 }, { xPercent: -44, duration: 0.5, ease: 'power3.in', immediateRender: false }, 0);
    tl.fromTo('.hl--2', { xPercent: 0 }, { xPercent: 70, duration: 0.5, ease: 'power3.in', immediateRender: false }, 0);
    const ch = $$('.hero__h1 .ch', fin);
    shuffled(ch.length, 11).forEach((k, i) => tl.fromTo(ch[k], { clipPath: 'inset(-30% -30% -30% -30%)' },
      { clipPath: i % 2 ? 'inset(0% 0% 0% 100%)' : 'inset(100% 0% 0% 0%)', duration: 0.09, ease: 'steps(3)', immediateRender: false }, 0.05 + i * 0.022));
    snapOut(tl, '.scene--hero .js-snap', 0, { d: 0.07, st: 0.025 });
  }
  tl.fromTo('.scene--hero', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01, immediateRender: false }, RM ? 0.25 : 0.52);
  return tl;
}

function headTl(tl, scope) {
  snapIn(tl, `${scope} .pk__h`, 0, { d: 0.07, rm: RM });
  fearSol(tl, scope, 0.06);
  snapIn(tl, `${scope} .badge`, 0.34, { d: 0.05, st: 0.045, rm: RM });
}

function plansTl() {
  const tl = T();
  showScene(tl, '.scene--plans');
  headTl(tl, '.scene--plans');
  $$('.scene--plans .plc', fin).forEach((card, ci) => buildBlock(tl, card, 0.08 + ci * 0.07, 3 + ci));
  buildBlock(tl, $('.scene--plans .pv', fin), 0.22, 9, { each: 0.004, parts: 0.025 });
  return tl;
}

function socialTl() {
  const tl = T();
  showScene(tl, '.scene--social');
  headTl(tl, '.scene--social');
  $$('.scene--social .card', fin).forEach((card, ci) => buildBlock(tl, card, 0.1 + ci * 0.08, 30 + ci));
  snapIn(tl, '.so__note', 0.62, { d: 0.06, rm: RM });
  if (!RM) feed.tiles().forEach((t, i) => popTiles(tl, Array.from(t.children), 0.06 + (i % 6) * 0.07 + Math.floor(i / 6) * 0.03, 0.006, 50 + i, 1, 0));
  snapIn(tl, '.feed__chip', 0.7, { d: 0.07, rm: RM });
  return tl;
}

function softwareTl() {
  const tl = T();
  showScene(tl, '.scene--software');
  headTl(tl, '.scene--software');
  $$('.scene--software .step', fin).forEach((s, i) => buildBlock(tl, s, 0.12 + i * 0.13, 70 + i, { each: 0.008, parts: 0.04 }));
  $$('.scene--software .sw-card', fin).forEach((c, i) => buildBlock(tl, c, 0.5 + i * 0.08, 80 + i, { each: 0.006 }));
  snapIn(tl, '.scene--software .sw-foot .js-snap', 0.78, { d: 0.06, st: 0.05, rm: RM });
  return tl;
}

function marqueeTl(sel) {
  const tl = T();
  if (RM) return tl;
  tl.fromTo(sel, { autoAlpha: 0, clipPath: 'inset(50% 0% 50% 0%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'steps(5)', immediateRender: false }, 0);
  return tl;
}

// chat 19: all four samples build through the generic pair (site frame js-b1 + caption, then js-b2 with its .js-w parts)
// round 7: garage and dental build like the barber: the site, then the booking widget part by part
function sample1Tl(key) {
  const tl = T();
  showScene(tl, `.scene--${key}`);
  snapIn(tl, `.scene--${key} .js-b1`, 0, { d: 0.08, st: 0.06, rm: RM });
  snapIn(tl, `.scene--${key} .js-cap`, 0.16, { d: 0.08, rm: RM });
  return tl;
}
function sample2Tl(key) {
  const tl = T();
  snapIn(tl, `.scene--${key} .js-b2`, 0, { d: 0.08, rm: RM });
  if (!RM) $$(`.scene--${key} .js-w`, fin).forEach((el, i) =>
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.02, ease: 'steps(1)', immediateRender: false }, 0.16 + i * 0.024));
  return tl;
}
function endTl() {
  const tl = T();
  showScene(tl, '.scene--end');
  snapIn(tl, '.scene--end .js-e', 0, { d: 0.06, st: 0.045, rm: RM });
  rollIn(tl, '.scene--end', 0.3, { d: 0.6, st: 0.05, rm: RM });
  return tl;
}

// ---------- scroll ----------
function sceneAt(t) {
  let s = 0;
  for (let i = 0; i < FLIP_AT.length; i++) {
    const [a, b] = FLIP_AT[i];
    if (t >= b) s = i + 1;
    else { if (t > a) s = i + (t - a) / (b - a); break; }
  }
  return s;
}
const inRange = (t, [a, b]) => t >= a && t < b;
const modeAt = (t) => (inRange(t, [mid(1), mid(2)]) || t >= mid(7)) ? 'ink' : inRange(t, [Z.bak1[0], mid(7)]) ? 'build' : 'hero';
const chapAt = (t) => inRange(t, [Z.bak1[0], Z.bar1[0]]) ? 1 : inRange(t, [Z.bar1[0], Z.gar1[0]]) ? 2
  : inRange(t, [Z.gar1[0], Z.den1[0]]) ? 3 : inRange(t, [Z.den1[0], mid(7)]) ? 4 : 0;

function buildScroll(stage) {
  // One light-scrubbed timeline carries only the scroll position (vh) and the marquee drift.
  const P = { t: 0 };
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(P, { t: TOTAL, duration: TOTAL }, 0);
  if (!RM) {
    tl.fromTo('.marquee--a .marquee__track', { xPercent: 6 }, { xPercent: -44, duration: 80, immediateRender: false }, FLIP_AT[3][0]);
    tl.fromTo('.marquee--b .marquee__track', { xPercent: 6 }, { xPercent: -44, duration: 80, immediateRender: false }, FLIP_AT[4][0]);
    tl.fromTo('.marquee--c .marquee__track', { xPercent: 6 }, { xPercent: -44, duration: 80, immediateRender: false }, FLIP_AT[5][0]);
    tl.fromTo('.marquee--d .marquee__track', { xPercent: 6 }, { xPercent: -44, duration: 80, immediateRender: false }, FLIP_AT[6][0]);
  }
  ScrollTrigger.create({ animation: tl, trigger: '#track', start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: RM ? true : 0.5 });

  const zones = [
    { tl: heroOutTl(), on: (t) => t >= Z.heroOut, back: 1.6 },
    { tl: plansTl(), on: (t) => inRange(t, Z.plans), back: 2.4 },
    { tl: socialTl(), on: (t) => inRange(t, Z.social), back: 2.4 },
    { tl: softwareTl(), on: (t) => inRange(t, Z.software), back: 2.4 },
    { tl: marqueeTl('.marquee--a'), on: (t) => inRange(t, Z.mqA), back: 2 },
    { tl: sample1Tl('bakery'), on: (t) => inRange(t, Z.bak1), back: 2.2 },
    { tl: sample2Tl('bakery'), on: (t) => inRange(t, Z.bak2), back: 2.2 },
    { tl: marqueeTl('.marquee--b'), on: (t) => inRange(t, Z.mqB), back: 2 },
    { tl: sample1Tl('barber'), on: (t) => inRange(t, Z.bar1), back: 2.2 },
    { tl: sample2Tl('barber'), on: (t) => inRange(t, Z.bar2), back: 2.2 },
    { tl: marqueeTl('.marquee--c'), on: (t) => inRange(t, Z.mqC), back: 2 },
    { tl: sample1Tl('garage'), on: (t) => inRange(t, Z.gar1), back: 2.2 },
    { tl: sample2Tl('garage'), on: (t) => inRange(t, Z.gar2), back: 2.2 },
    { tl: marqueeTl('.marquee--d'), on: (t) => inRange(t, Z.mqD), back: 2 },
    { tl: sample1Tl('dental'), on: (t) => inRange(t, Z.den1), back: 2.2 },
    { tl: sample2Tl('dental'), on: (t) => inRange(t, Z.den2), back: 2.2 },
    { tl: endTl(), on: (t) => t >= Z.end, back: 2.2 },
  ].map((z) => ({ ...z, st: false }));

  const gate = createLensGate(stage, fin);
  let lastS = -1, mode = 'hero', chap = 0, v = 0, ground = '';
  const rows = $$('.marquee__row');
  const setRowX = gsap.quickSetter(rows, 'x', 'px');
  const lensZone = (t) => t < Z.heroOut ? 'hero'
    : inRange(t, [HOLD.bakery[0] + 10, HOLD.bakery[1] - 2]) ? 'bakery'
    : inRange(t, [HOLD.barber[0] + 10, HOLD.barber[1] - 2]) ? 'barber'
    : inRange(t, [HOLD.garage[0] + 10, HOLD.garage[1] - 2]) ? 'garage'
    : inRange(t, [HOLD.dental[0] + 10, HOLD.dental[1] - 2]) ? 'dental' : null;
  gsap.ticker.add(() => {
    const t = stepper && stepper.on() ? stepper.pos() : P.t;   // step mode: the stepper's own timing, no scrub lag
    const s = sceneAt(t);
    if (s !== lastS) { lastS = s; stage.setScenePosition(s); }
    for (const z of zones) {
      const w = z.on(t);
      if (w !== z.st) { z.st = w; if (w) z.tl.timeScale(1).play(); else z.tl.timeScale(z.back).reverse(); }
    }
    const m = modeAt(t);
    if (m !== mode) { mode = m; setMode(m); }
    // the dental room is light: the step indicator turns ink there, as on the paper end panel
    const g = inRange(t, [mid(1), mid(2)]) ? 'stone' : t >= mid(6) ? 'paper' : 'dark';
    if (g !== ground) { ground = g; html.dataset.ground = g; }
    const c = chapAt(t);
    if (c !== chap) { chap = c; setChap(c); }
    hud.scrollAt(t);
    gate(lensZone(t));
    const lv = lenis ? lenis.velocity : 0;
    v += (lv - v) * 0.08;
    feed.setOn(inRange(t, Z.social));
    // plans: the scroll steps Launch -> Business -> Pro -> Store while the screen is up; off screen the
    // state is set silently (from above = Launch, from below = Store). Phone: no pin, content travels.
    if (PHONE_MQ.matches) phoneTravel(t);
    else if (performance.now() > planLock) {
      if (inRange(t, Z.plans)) { if (planAt(t) !== plans.open()) plans.go(planAt(t), true); }
      else if (planAt(t) !== plans.open()) plans.go(planAt(t), false);
    }
    feed.setVelocity(v);
    if (!RM && (inRange(t, Z.mqA) || inRange(t, Z.mqB) || inRange(t, Z.mqC) || inRange(t, Z.mqD))) setRowX(Math.max(-420, Math.min(420, -v * 9)));
  });
}

function setMode(m) {
  html.dataset.mode = m;
  const d = RM ? 0 : 0.26;
  gsap.to('.bar__bg', { scaleY: m === 'build' ? 1 : 0, duration: d, ease: 'steps(4)', overwrite: true });
  gsap.to('.bar__nav', { clipPath: m === 'build' ? 'inset(0% 0% 0% 100%)' : 'inset(0% 0% 0% 0%)', duration: d, ease: 'steps(4)', overwrite: true });
  gsap.to('.logo--ink', { opacity: m === 'ink' ? 1 : 0, duration: d, ease: 'steps(2)', overwrite: true });
  gsap.to('.logo--paper', { opacity: m === 'ink' ? 0 : 1, duration: d, ease: 'steps(2)', overwrite: true });
}
function setChap(c) {
  const d = RM ? 0 : 0.24;
  [1, 2, 3, 4].forEach((k) => gsap.to(`.bar__build--${k}`, {
    autoAlpha: c === k ? 1 : 0, clipPath: c === k ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)',
    duration: d, ease: 'steps(4)', delay: c === k ? d : 0, overwrite: true,
  }));
}

// ---------- round 5 (E1): one scroll = one step ----------
// Motion on: one wheel tick, trackpad swipe, finger swipe, Page Down / Up, Space or arrow key moves exactly
// ONE step and the step plays by itself; nothing scrubs. Desktop steps: hero, the four plans, social,
// software, the four samples, end. Phone (700 px and narrower, chat 22): the stacked plans and social screens
// open on their heading and then give every card a step of its own (PH_STOPS). Reduced motion keeps
// natural scrolling.
const PLAN_NAMES = ['Launch', 'Business', 'Pro', 'Store'], SOCIAL_NAMES = ['Essential', 'Growth', 'Full'];
let STEP_OF = { top: 0 };   // nav link key -> step, rebuilt with the step list
const SAMPLE_KEYS = ['bakery', 'barber', 'garage', 'dental'];
const FLIP_S = 0.8;   // seconds the wall takes to flip to the next scene
let stepper = null;
function createStepper() {
  const S = { t: 0 };
  let steps = [], sig = '', cur = 0, tl = null, on = false, lockUntil = 0, queued = null, qTimer = 0;
  const seen = new Set([0]);
  const maxY = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pos = () => (window.scrollY / maxY()) * TOTAL;
  const put = () => window.scrollTo(0, (maxY() * S.t) / TOTAL);

  // the indicator: the block motif, blue = seen, ONE orange = current; each block jumps to its step
  const nav = document.createElement('nav');
  nav.className = 'stepnav'; nav.setAttribute('aria-label', 'Sections');
  document.body.appendChild(nav);
  // The step list: { name, scene, t (vh), sub, plan (desktop plan index), card (phone card index) }.
  function measure() {
    const L = [];
    const add = (name, scene, t, o = {}) => L.push({ name, scene, t, ...o });
    add('Start', 'hero', 0);
    if (PHONE_MQ.matches) {
      PH_STOPS.plans.forEach((s, i) => add(i ? `Website plans: ${PLAN_NAMES[s.card]}` : 'Website plans', 'plans', phoneT('plans', s.y), { sub: i > 0, card: s.card, more: s.more }));
      PH_STOPS.social.forEach((s, i) => add(i ? `Social media: ${SOCIAL_NAMES[s.card]}` : 'Social media', 'social', phoneT('social', s.y), { sub: i > 0, card: s.card, more: s.more }));
    } else {
      PLAN_REST.forEach((t, i) => add(`Website plans: ${PLAN_NAMES[i]}`, 'plans', t, { sub: i > 0, plan: i }));
      add('Social media', 'social', REST.social);
    }
    add('Software', 'software', REST.software);
    SAMPLE_KEYS.forEach((k) => add(`Sample build: ${k}`, k, REST[k]));
    add('Get started', 'end', TOTAL);
    const was = steps[cur];
    steps = L;
    STEP_OF = { top: 0 };
    L.forEach((s, i) => { if (i && !(s.scene in STEP_OF)) STEP_OF[s.scene] = i; });
    const now = L.map((s) => s.name + (s.more ? '+' : '')).join('|');
    if (now === sig) return;
    // the list changed (first run, or the screen crossed the phone width): rebuild the indicator
    if (sig) { cur = Math.max(0, L.findIndex((s) => s.scene === was.scene)); seen.clear(); seen.add(cur); }
    sig = now;
    nav.textContent = '';
    L.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', s.name);
      if (s.sub) b.className = 'is-sub';
      b.appendChild(document.createElement('i'));
      b.addEventListener('click', () => goTo(i));
      nav.appendChild(b);
    });
    paint();
  }
  function paint() {
    Array.from(nav.children).forEach((b, i) => {
      b.classList.toggle('is-on', i === cur);
      b.classList.toggle('is-seen', i !== cur && seen.has(i));
      if (i === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  // The way from here to step j as [vh, seconds, ease] legs. Only the wall flips are seen moving; the
  // rest of the scroll length is build thresholds, so those legs are short, or timed to the build.
  function route(from, j) {
    const to = steps[j].t, fwd = to > from;
    const lo = Math.min(from, to) - 1, hi = Math.max(from, to) + 1;
    const flips = FLIP_AT.filter(([a, b]) => a >= lo && b <= hi);
    // inside one screen: on a phone the stacked screen slides to its next card and answers the finger at once
    if (!flips.length) return PHONE_MQ.matches ? { legs: [[to, 0.5, 'power3.out']], lock: 0.4, d: 0.5 } : { legs: [[to, 0.3, 'power2.out']], lock: 0.7, d: 0.3 };
    if (flips.length > 1) { const d = Math.min(2.4, 0.9 + 0.3 * flips.length); return { legs: [[to, d, 'power2.inOut']], lock: d * 0.85, d }; }
    const [a, b] = flips[0];
    // Straight past the point where this screen's content starts to leave, then the wall flips at one
    // steady speed: the page answers the scroll at once (an eased start left a third of a second dead).
    const legs = [[fwd ? a + 3 : b - 3, 0.05, 'none'], [fwd ? b : a, FLIP_S, 'none']];
    const key = steps[j].scene;
    if (fwd && SAMPLE_KEYS.includes(key)) {
      // the sample builds itself: the site, then its cards or booking, then the working features
      const h = HOLD[key][0], f = h + 0.77 * (REST[key] - h);
      legs.push([h + 58, 0.5, 'none'], [h + 62, 0.05, 'none'], [f - 2, 0.65, 'none'], [to, 0.1, 'none']);
    } else legs.push([to, 0.12, 'none']);
    return { legs, lock: 0.05 + FLIP_S + 0.05, d: legs.reduce((sum, l) => sum + l[1], 0) };
  }

  function run(j, now = false) {
    if (!now && PHONE_MQ.matches) { phoneRestops(); measure(); }
    j = Math.max(0, Math.min(steps.length - 1, j));
    if (tl) { tl.kill(); tl = null; }
    clearTimeout(qTimer); queued = null;
    S.t = pos();
    const r = now ? null : route(S.t, j);
    const plan = steps[j].plan;                             // desktop only: the phone shows every plan stacked
    if (r && plan !== undefined && j !== cur) {
      if (steps[cur].plan !== undefined && inRange(S.t, Z.plans)) {
        typer.finish('.scene--plans');                      // the typing block is done before the placing block starts
        planLock = performance.now() + 500;
        plans.go(plan, true);                               // open it now; the scroll position follows
      } else {
        planLock = performance.now() + r.d * 1000 + 80;     // arriving from another scene: that plan is open as the screen builds
        plans.go(plan, false);
      }
    }
    cur = j; seen.add(j); paint();
    if (!r) { S.t = steps[j].t; put(); lockUntil = 0; return; }
    tl = gsap.timeline({ onUpdate: put, onComplete: () => { tl = null; } });
    r.legs.forEach(([vh, d, ease]) => tl.to(S, { t: vh, duration: d, ease }));
    lockUntil = performance.now() + r.lock * 1000;
    qTimer = setTimeout(() => {
      const q = queued; queued = null;
      if (q) { if ('to' in q) goTo(q.to); else step(q.dir); }
    }, r.lock * 1000 + 30);
  }
  // One step forward or back. While a step's transition plays the input is locked; one step is queued.
  function step(dir) {
    if (!on || !isLive) return;
    if (performance.now() < lockUntil) { queued = { dir }; return; }
    const j = cur + dir;
    if (j >= 0 && j < steps.length) run(j);
  }
  function goTo(j) {
    if (!on || !isLive || !steps[j]) return;
    if (performance.now() < lockUntil) { queued = { to: j }; return; }
    if (j !== cur || Math.abs(pos() - steps[j].t) > 1) run(j);
  }

  // Wheel and trackpad: one gesture = one step. A new gesture starts after 200 ms of silence. Inside one
  // unbroken stream a second step needs the lock to be over AND either a clear rise out of the tail (a
  // second swipe) or equal wheel notches (a wheel kept turning), so a swipe's inertia never skips a scene.
  let wAt = 0, wPrev = 0, wS = 0, wLow = 0;
  window.addEventListener('wheel', (e) => {
    if (!on || e.ctrlKey) return;
    if (e.cancelable) e.preventDefault();
    if (!isLive || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    const now = performance.now();
    const d = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 32 : 1);
    const fresh = now - wAt > 200;
    wAt = now;
    let go = false;
    if (fresh) { go = d >= 2; wS = d; wLow = d; }
    else {
      wS += (d - wS) * 0.5;
      if (now < lockUntil || wS < wLow) wLow = wS;   // the valley follows the stream while locked, afterwards only down
      else if ((wS > wLow * 2.5 && wS > wLow + 20) || (d >= 50 && d === wPrev)) go = true;
    }
    wPrev = d;
    if (go) step(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (!on || !isLive || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target && e.target.closest ? e.target : null;
    if (el && el.closest('input, textarea, select, [contenteditable="true"]')) return;
    const ctl = el && el.closest('a, button, [role="button"], [role="radio"]');
    const radio = el && el.closest('[role="radio"], [role="radiogroup"]');
    let dir = 0, jump = -1;
    switch (e.key) {
      case 'PageDown': dir = 1; break;
      case 'PageUp': dir = -1; break;
      case 'ArrowDown': if (radio) return; dir = 1; break;
      case 'ArrowUp': if (radio) return; dir = -1; break;
      case ' ': if (ctl) return; dir = e.shiftKey ? -1 : 1; break;
      case 'Home': jump = 0; break;
      case 'End': jump = steps.length - 1; break;
      default: return;
    }
    e.preventDefault();
    if (e.repeat) return;
    if (jump >= 0) goTo(jump); else step(dir);
  });

  // Touch (chat 22): one vertical swipe = one step, however long or fast the swipe. The step starts as the
  // finger passes 30 px, it does not wait for the lift; a short quick flick counts on the lift. The page itself
  // never pans, so it cannot rest half way between two screens. Sideways swipes are left to the card rows.
  let tch = null;
  window.addEventListener('touchstart', (e) => {
    tch = on && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, at: performance.now(), dir: '', done: false } : null;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!on || !tch) return;
    if (e.touches.length > 1) { tch = null; return; }        // a pinch is not a swipe
    const dx = e.touches[0].clientX - tch.x, dy = e.touches[0].clientY - tch.y;
    if (!tch.dir) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      tch.dir = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
    }
    if (tch.dir === 'x') return;
    if (e.cancelable) e.preventDefault();
    if (!tch.done && Math.abs(dy) > 30) { tch.done = true; step(dy < 0 ? 1 : -1); }
  }, { passive: false });
  window.addEventListener('touchend', (e) => {
    const g = tch; tch = null;
    if (!g || g.done || g.dir !== 'y' || !e.changedTouches.length) return;
    const dy = e.changedTouches[0].clientY - g.y;
    if (Math.abs(dy) > 12 && performance.now() - g.at < 300) step(dy < 0 ? 1 : -1);
  }, { passive: true });
  window.addEventListener('touchcancel', () => { tch = null; }, { passive: true });

  // Step mode on or off for this screen (also after a resize); in step mode the stepper owns the scroll.
  function refresh() {
    const want = stepMode();
    if (want === on) { if (on && !tl) { measure(); S.t = steps[cur].t; put(); } return; }
    on = want;
    html.classList.toggle('is-step', on);
    if (tl) { tl.kill(); tl = null; }
    clearTimeout(qTimer); queued = null; lockUntil = 0;
    if (lenis && isLive) { if (on) lenis.stop(); else lenis.start(); }
    if (on) {
      measure();
      const t = pos();
      cur = steps.reduce((best, s, i) => (Math.abs(s.t - t) < Math.abs(steps[best].t - t) ? i : best), 0);
      seen.add(cur);
      run(cur, true);
    }
  }
  // the step that shows plan i whole (a plan picked by click or keyboard)
  const planStep = (i) => { const j = steps.findIndex((s) => s.scene === 'plans' && !s.more && (s.plan === i || s.card === i)); return j < 0 ? STEP_OF.plans : j; };
  return { on: () => on, pos, step, goTo, refresh, planStep, index: () => cur, list: () => steps, busy: () => !!tl, locked: () => performance.now() < lockUntil };
}

// ---------- hero drift against the pointer ----------
function heroDrift() {
  if (!FINE || RM) return;
  const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    tgt.x = -(e.clientX / window.innerWidth - 0.5) * 16;
    tgt.y = -(e.clientY / window.innerHeight - 0.5) * 8;
  }, { passive: true });
  const h1 = $('.hero__h1', fin);
  const sx = gsap.quickSetter(h1, 'x', 'px'), sy = gsap.quickSetter(h1, 'y', 'px');
  gsap.ticker.add(() => { cur.x += (tgt.x - cur.x) * 0.05; cur.y += (tgt.y - cur.y) * 0.05; sx(cur.x); sy(cur.y); });
}

// ---------- boot ----------
async function boot() {
  await Promise.race([document.fonts.ready, wait(2500)]);
  fit();
  fitPackages();
  phoneMeasure();
  if (PHONE_MQ.matches) {
    const lenOf = (k) => Math.max(140, Math.ceil((PH_EXT[k] / window.innerHeight) * 100 + 2 * PH_PAD));
    script({ plans: lenOf('plans'), social: lenOf('social') });
    $('#track').style.height = `${TOTAL + 100}vh`;
  }
  initialStates();
  const stage = await makeStage();
  FLIPS.forEach((s, i) => stage.setFlipStyle(i, s));
  stage.setScenePosition(0);
  stage.setLensEnabled(false);
  window.__kn = { stage, lenis, TOTAL, REST, HOLD, Z };

  await runIntro(stage);

  isLive = true;
  html.classList.remove('is-locked');
  fit(); fitPackages(); phoneMeasure();      // fonts that landed during the intro: measure again before the steps are set
  stepper = createStepper();
  stepper.refresh();                         // step mode keeps Lenis stopped: the stepper owns the scroll
  window.__kn.step = stepper;
  if (lenis && !stepper.on()) lenis.start();
  hud.hideLog(1.6);
  hud.showHints();
  buildScroll(stage);
  heroDrift();
  html.dataset.state = 'live';
  // A resize, or a font that lands after boot (slow network: the fallback face was measured), lays the
  // screens out again and re-rests the current step; never under a step in flight.
  let rz = 0;
  const relayout = () => { clearTimeout(rz); rz = setTimeout(function again() {
    if (stepper.busy()) { rz = setTimeout(again, 300); return; }
    fit(); fitPackages(); phoneMeasure(); ScrollTrigger.refresh(); stepper.refresh();
  }, 150); };
  window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', relayout);
}

boot();
