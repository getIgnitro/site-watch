// feed.js - the social screen's reel feed. Two columns of real reels (muted loops), column A drifts
// up, column B drifts down, both take extra speed from scroll velocity. The list is repeated so the
// loop is seamless. Only reels inside the viewport play, and only while the social screen is on.
// Each reel carries a grid of ground-coloured cover tiles that main.js pops off to build it.

export function createFeed(root, { rm }) {
  const gsap = window.gsap;
  const feed = root.querySelector('.feed');
  if (!feed) return { setOn() {}, setVelocity() {}, measure() {}, tiles: () => [] };
  const chip = feed.querySelector('.feed__chip');
  const cols = (feed.dataset.cols || '1,2,3|4,5,6').split('|').map((s) => s.split(','));
  const tracks = [];
  const videos = [];

  cols.forEach((list, ci) => {
    const col = document.createElement('div');
    col.className = 'feed__col';
    col.setAttribute('aria-hidden', 'true');
    const tr = document.createElement('div');
    tr.className = 'feed__track';
    [...list, ...list].forEach((n) => {
      const r = document.createElement('div');
      r.className = 'reel';
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
      ['muted', 'loop', 'playsinline'].forEach((a) => v.setAttribute(a, ''));
      v.setAttribute('preload', 'none');
      v.setAttribute('disablepictureinpicture', '');
      v.poster = `assets/reels/reel-${n}.jpg`;
      v.dataset.src = `assets/reels/reel-${n}.mp4`;   // speed: attached when the reel first plays
      v.tabIndex = -1;
      r.appendChild(v);
      const t = document.createElement('i');
      t.className = 'reel__tiles';
      for (let k = 0; k < 45; k++) t.appendChild(document.createElement('i'));
      r.appendChild(t);
      tr.appendChild(r);
      videos.push(v);
    });
    col.appendChild(tr);
    feed.insertBefore(col, chip);
    tracks.push({ el: tr, dir: ci % 2 ? 1 : -1, pos: ci % 2 ? -1e5 : 0, loop: 0, horiz: false });
  });

  function measure() {
    tracks.forEach((t) => {
      const kids = t.el.children;
      const half = kids.length / 2;
      t.horiz = getComputedStyle(t.el).flexDirection === 'row';
      t.loop = t.horiz ? kids[half].offsetLeft - kids[0].offsetLeft : kids[half].offsetTop - kids[0].offsetTop;
    });
  }
  measure();

  let on = false, vel = 0, holdUntil = 0, pump = 0;
  const visible = new Set();
  const queue = [];
  // Starting a reel stalls the frame (up to 0.2 s for the first one), and six starting in the same frame
  // froze the scene change for a quarter of a second. So reels start ONE at a time, and not before the
  // screen has built and typed its lines (posters show meanwhile).
  const start = (v) => { if (!v.src && v.dataset.src) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  function next() {
    pump = 0;
    if (!on) { queue.length = 0; return; }
    const wait = holdUntil - performance.now();
    if (wait > 0) { pump = setTimeout(next, wait); return; }
    const v = queue.shift();
    if (v && visible.has(v) && v.paused) start(v);
    if (queue.length) pump = setTimeout(next, 180);
  }
  function sync() {
    videos.forEach((v) => {
      const want = on && visible.has(v);
      if (want && v.paused) { if (rm) start(v); else if (!queue.includes(v)) queue.push(v); }
      else if (!want && !v.paused) v.pause();
    });
    if (queue.length && !pump) pump = setTimeout(next, 0);
  }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
    sync();
  }, { threshold: 0 });
  videos.forEach((v) => io.observe(v));

  gsap.ticker.add((time, dt) => {
    if (!on || rm) return;
    const sp = (30 + Math.min(1400, Math.abs(vel) * 22)) * Math.min(dt, 50) / 1000;
    tracks.forEach((t) => {
      if (!t.loop) return;
      t.pos += t.dir * sp;
      const p = (((t.pos % t.loop) - t.loop) % t.loop);
      t.el.style.transform = t.horiz ? `translate3d(${p.toFixed(2)}px,0,0)` : `translate3d(0,${p.toFixed(2)}px,0)`;
    });
  });

  return {
    setOn(b) { if (b !== on) { on = b; if (b) holdUntil = performance.now() + 2700; sync(); } },
    setVelocity(v) { vel = v; },
    measure,
    tiles: () => Array.from(feed.querySelectorAll('.reel__tiles')),
  };
}
