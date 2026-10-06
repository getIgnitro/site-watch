// stage-stub.js - a 2D stand-in for the engine's stage.js (BUILD_BOOK section 6 contract).
// Posters (not films), a per-tile flip squash for transitions, a real lens heat grid,
// and playIntro firing the same events on the same timing. For page work and fallback only.

export async function createStage(canvas, opts) {
  const ctx = canvas.getContext('2d');
  const scenes = opts.scenes || [];
  const N = scenes.length;
  const ink = opts.ink || '#0B0B0C', peri = opts.peri || '#9CBEFE', signal = opts.signal || '#FF4B14';
  const handlers = {};
  const emit = (n, d) => (handlers[n] || []).slice().forEach((f) => { try { f(d); } catch (e) { console.error(e); } });

  const lens = { cols: 0, rows: 0, tile: 0, originX: 0, originY: 0, heat: new Float32Array(0) };
  let W = 0, H = 0, dpr = 1, ragged = new Float32Array(0);
  let pos = 0, lensOn = false, destroyed = false;
  const flip = [];
  const pointer = { x: -1e5, y: -1e5, fine: matchMedia('(hover: hover) and (pointer: fine)').matches };

  // ---- scene surfaces (cover-fit poster + dim + soft vignette) ----
  const surf = scenes.map(() => document.createElement('canvas'));
  const mosaic = scenes.map(() => null);
  const imgs = scenes.map((s, i) => {
    if (!s.poster) return null;
    const im = new Image();
    im.onload = () => { paintScene(i); };
    im.src = s.poster;
    return im;
  });
  function paintScene(i) {
    if (!W || !lens.cols) return;
    const s = scenes[i], c = surf[i];
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = s.color || ink; g.fillRect(0, 0, W, H);
    const im = imgs[i];
    if (im && im.complete && im.naturalWidth) {
      // film placement, same contract as stage.js: { zoom, x, y }, .filmPhone at 700 px and under
      const f = (W <= 700 ? s.filmPhone : s.film) || null;
      const k = Math.max(W / im.naturalWidth, H / im.naturalHeight) * ((f && +f.zoom) || 1);
      const w = im.naturalWidth * k, h = im.naturalHeight * k;
      g.drawImage(im, (W - w) / 2 + (f ? (+f.x || 0) * W : 0), (H - h) / 2 + (f ? (+f.y || 0) * H : 0), w, h);
    }
    if (s.dim) {
      g.fillStyle = `rgba(0,0,0,${s.dim * 0.85})`; g.fillRect(0, 0, W, H);
      const v = g.createRadialGradient(W * 0.55, H * 0.45, Math.min(W, H) * 0.25, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${0.35 + s.dim * 0.3})`);
      g.fillStyle = v; g.fillRect(0, 0, W, H);
    }
    // mosaic colours: one sample per cell centre
    const m = new Uint8ClampedArray(lens.cols * lens.rows * 3);
    const small = document.createElement('canvas'); small.width = lens.cols; small.height = lens.rows;
    const sg = small.getContext('2d');
    sg.drawImage(c, lens.originX * dpr, lens.originY * dpr, lens.cols * lens.tile * dpr, lens.rows * lens.tile * dpr, 0, 0, lens.cols, lens.rows);
    const d = sg.getImageData(0, 0, lens.cols, lens.rows).data;
    for (let k2 = 0, j = 0; k2 < d.length; k2 += 4, j += 3) { m[j] = d[k2]; m[j + 1] = d[k2 + 1]; m[j + 2] = d[k2 + 2]; }
    mosaic[i] = m;
  }

  function layout() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const across = W < 700 ? 9 : 26;
    lens.tile = W / across; lens.cols = across; lens.rows = Math.ceil(H / lens.tile);
    lens.originX = 0; lens.originY = (H - lens.rows * lens.tile) / 2;
    lens.heat = new Float32Array(lens.cols * lens.rows);
    ragged = new Float32Array(lens.cols * lens.rows).map(() => 0.72 + Math.random() * 0.56);
    api.tileCount = lens.cols * lens.rows;
    scenes.forEach((_, i) => paintScene(i));
  }

  // ---- logo data for the intro ----
  let logo = null;
  try { logo = await (await fetch(opts.logo)).json(); } catch (e) { logo = null; }

  // ---- intro state ----
  const T = { wallStart: 1.9, logoDone: 2.4, wallDone: 3.2, live: 3.6 };
  let intro = null; // { t0, rect, fired:Set, resolve }
  function introTime() { return intro ? (performance.now() - intro.t0) / 1000 : 99; }
  function fire(name) { if (intro && !intro.fired.has(name)) { intro.fired.add(name); emit(name); } }

  function drawMark(t) {
    if (!logo) return;
    const [, , vw, vh] = logo.viewBox;
    const target = intro.rect;
    const cw = Math.min(W * 0.34, 440), chh = cw * vh / vw;
    let x = (W - cw) / 2, y = (H - chh) / 2, w = cw;
    if (t > T.wallStart) { // travel to the nav slot
      const k = Math.min(1, (t - T.wallStart) / (T.logoDone - T.wallStart));
      const e = 1 - Math.pow(1 - k, 3);
      x += (target.left - x) * e; y += (target.top - y) * e; w += (target.width - w) * e;
    }
    const s = w / vw;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // K fuses solid as blocks between 0.3 and 0.9
    const kk = Math.max(0, Math.min(1, (t - 0.3) / 0.6));
    if (kk > 0) {
      const gr = ctx.createLinearGradient(logo.k.fill.x1, logo.k.fill.y1, logo.k.fill.x2, logo.k.fill.y2);
      logo.k.fill.stops.forEach(([o, c]) => gr.addColorStop(o, c));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 330, vh * Math.ceil(kk * 6) / 6); ctx.clip();
      ctx.fillStyle = gr;
      logo.k.polygons.forEach((p) => { ctx.beginPath(); p.forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath(); ctx.fill(); });
      ctx.restore();
    }
    // N block by block, last one arrives in signal then settles
    const blocks = logo.n.blocks.slice().sort((a, b) => a.order - b.order);
    blocks.forEach((b, j) => {
      const tb = 0.9 + (j / blocks.length) * 0.75;
      const k = (t - tb) / 0.18;
      if (k <= 0) return;
      const kc = Math.min(1, k), z = 1 + (1 - kc) * 2.2;
      const last = j === blocks.length - 1;
      ctx.globalAlpha = kc;
      ctx.fillStyle = last && t < tb + 0.5 ? signal : b.fill;
      const cx = b.x + b.s / 2, cy = b.y + b.s / 2, ss = b.s * z;
      ctx.fillRect(cx - ss / 2, cy - ss / 2, ss, ss);
      ctx.globalAlpha = 1;
    });
    // one light sweep at 1.9
    if (t > 1.6 && t < 2.0) {
      const k = (t - 1.6) / 0.4, sx = -120 + k * (vw + 240);
      const g = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh); ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
  }

  // ---- per-frame draw ----
  let last = performance.now();
  function frame(now) {
    if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { cols, rows, tile, originX, originY, heat } = lens;
    const t = introTime();

    // lens heat: ragged radius 3.2 tiles, decays in ~0.9 s
    const decay = Math.exp(-dt / 0.3);
    const active = lensOn && pointer.fine && t > T.live;
    for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
      let h = heat[i] * decay;
      if (active) {
        const dx = (originX + (c + 0.5) * tile - pointer.x) / tile, dy = (originY + (r + 0.5) * tile - pointer.y) / tile;
        if (Math.hypot(dx, dy) < 3.2 * ragged[i]) h = 1;
      }
      heat[i] = h < 0.01 ? 0 : h;
    }

    ctx.fillStyle = ink; ctx.fillRect(0, 0, W, H);
    const front = Math.max(0, Math.min(N - 1, Math.floor(pos)));
    const f = pos - front, back = Math.min(N - 1, front + 1);
    const style = flip[front] || 'diagonal';
    const inIntro = intro && t < T.wallDone;
    for (let r = 0, i = 0; r < rows; r++) for (let c = 0; c < cols; c++, i++) {
      const x = originX + c * tile, y = originY + r * tile;
      let sceneIdx = front, sq = 1, inkSide = false;
      if (inIntro) {
        const d = (c / cols) * 0.5 + (r / rows) * 0.5;
        const land = T.wallStart + d * 0.6, turn = 2.6 + d * 0.5;
        if (t < land) continue;
        if (t < turn) { inkSide = true; sq = 1; }
        else { const k = Math.min(1, (t - turn) / 0.18); sq = Math.abs(Math.cos(k * Math.PI)); inkSide = k < 0.5; }
      } else if (f > 0.0001) {
        let d;
        if (style === 'rows') d = r / rows;
        else if (style === 'radial') d = Math.hypot(c / cols - 0.5, r / rows - 0.5) / 0.71;
        else d = (c / cols) * 0.55 + (r / rows) * 0.45;
        const k = Math.max(0, Math.min(1, (f - d * 0.55) / 0.45));
        sq = Math.abs(Math.cos(k * Math.PI));
        sceneIdx = k < 0.5 ? front : back;
      }
      const hv = heat[i];
      if (hv > 0.5 && !inIntro) {
        const m = mosaic[sceneIdx], j = i * 3, ins = tile * 0.08;
        ctx.fillStyle = m ? `rgb(${m[j]},${m[j + 1]},${m[j + 2]})` : '#222';
        ctx.fillRect(x + ins, y + ins, tile - ins * 2, tile - ins * 2);
        ctx.strokeStyle = peri; ctx.lineWidth = 1; ctx.strokeRect(x + ins + 2.5, y + ins + 2.5, tile - ins * 2 - 5, tile - ins * 2 - 5);
        continue;
      }
      const h = tile * sq, yy = y + (tile - h) / 2;
      if (inkSide) { ctx.fillStyle = '#161618'; ctx.fillRect(x + 1, yy + 1, tile - 2, Math.max(0, h - 2)); continue; }
      if (sq > 0.999) ctx.drawImage(surf[sceneIdx], x * dpr, y * dpr, tile * dpr, tile * dpr, x, y, tile, tile);
      else if (h > 0.5) ctx.drawImage(surf[sceneIdx], x * dpr, y * dpr, tile * dpr, tile * dpr, x + 0.5, yy, tile - 1, h);
    }
    if (intro && t < T.logoDone + 0.05) drawMark(t);
    if (intro) {
      if (t >= T.wallStart) fire('wall-start');
      if (t >= T.logoDone) fire('logo-done');
      if (t >= T.wallDone) fire('wall-done');
      if (t >= T.live && !intro.fired.has('live')) { fire('live'); intro.resolve(); }
    }
    emit('frame');
    requestAnimationFrame(frame);
  }

  const onMove = (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { pointer.x = e.clientX; pointer.y = e.clientY; } };
  const onLeave = () => { pointer.x = -1e5; pointer.y = -1e5; };
  const onResize = () => { layout(); emit('resize'); };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  window.addEventListener('resize', onResize);

  const api = {
    tileCount: 0,
    lens,
    on(name, cb) { (handlers[name] = handlers[name] || []).push(cb); return () => { handlers[name] = handlers[name].filter((f) => f !== cb); }; },
    playIntro({ logoTargetRect, skip = false } = {}) {
      if (intro && !intro.fired.has('live')) { // second call = skip to the end
        if (skip) intro.t0 = performance.now() - T.live * 1000;
        return intro.promise;
      }
      let resolve; const promise = new Promise((r) => (resolve = r));
      intro = { t0: performance.now() - (skip ? T.live * 1000 : 0), rect: logoTargetRect || { left: 32, top: 21, width: 64, height: 30 }, fired: new Set(), resolve, promise };
      return promise;
    },
    setScenePosition(s) { pos = Math.max(0, Math.min(N - 1, +s || 0)); },
    setFlipStyle(i, style) { flip[i] = style; },
    setLensEnabled(b) { lensOn = !!b; },
    destroy() { destroyed = true; window.removeEventListener('pointermove', onMove); window.removeEventListener('resize', onResize); document.removeEventListener('pointerleave', onLeave); },
    isStub: true,
  };
  layout();
  requestAnimationFrame(frame);
  return api;
}
