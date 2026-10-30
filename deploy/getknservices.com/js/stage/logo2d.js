/* KN website v5 — stage/logo2d.js — the logo intro = the client's own film (KN-05-Build.mp4), fine-tuned.
 * BUILD_BOOK Amendment 3. Used only by stage.js. No 3D, no camera, nothing flies in.
 *   - choreography measured from the film frame by frame: the K fades in place (ease-out, ~0.55 s); each N block
 *     fades in while settling about a third of a block into its slot, on the film's own arrival times (the
 *     three darker trailing blocks last); the wordmark + tagline fade in under the mark; a soft blue glow.
 *   - drawn with Canvas 2D (the same rasteriser as the DOM <img> of the SVG, so the hand-over is exact) at the
 *     device pixel ratio, composited in WebGL on integer device pixels. Vector-crisp at any pixel ratio.
 *   - fine tuning only: eased timing, the glow swells a little as the mark completes, ONE very soft sheen.
 */
import * as THREE from 'three';

export const INTRO = {
  kA: 0.03, kDur: 0.55,                  // K: in place, ease-out
  blockFade: 0.50, blockSlide: 0.55,     // each N block: fade + settle, ending at its arrival time
  built: 1.62,                           // N complete -> 'mark-built'
  glowIn: 0.40, swellA: 1.25, swellB: 1.80,
  textA: 1.72, textB: 2.16,              // wordmark + tagline fade in after a beat (film: 2.0-2.5 s; book C4: in by ~2.1)
  sheenA: 1.86, sheenB: 2.50,            // one very soft sheen across the finished mark
  outA: 2.56, outB: 2.98,                // wordmark, tagline and glow fade as the mark leaves
  travelA: 2.60, travelB: 3.20, fadeB: 3.28,
  wallA: 2.70, wallB: 3.55, flipA: 3.30, flipB: 4.00, total: 4.00,
};
// Film-measured arrival (s) of each N block, by json `order` (90 % of final brightness at the block centre).
const FILM_ARRIVE = [0.767, 0.767, 0.8, 0.833, 0.8, 0.7, 0.833, 0.833, 0.867, 0.833, 0.867, 0.867, 0.867, 0.9, 0.933, 0.9,
  0.933, 0.933, 0.933, 0.933, 0.933, 0.967, 0.433, 1.0, 1.0, 1.0, 1.0, 1.133, 1.133, 1.167, 1.233, 1.2, 1.233, 1.233, 1.233,
  1.3, 0.933, 0.767, 1.333, 1.367, 1.333, 1.0, 1.4, 1.4, 1.433, 1.433, 1.433, 1.433, 1.3, 1.467, 1.467, 1.333, 1.5, 1.533,
  1.567, 1.567, 1.5, 1.033, 1.5, 1.567, 1.633];
// The film's lockup in units of the mark height h (the mark is the json viewBox at scale 1.0 on 1920x1080).
const LOCK = { h: 0.3449, cx: 0.0289, cy: -0.2330, wmTop: 0.3114, wmCap: 0.1584, wmW: 1.2297, wmDx: -0.0208,
  tgTop: 0.5719, tgCap: 0.04296, tgW: 1.5438, tgDx: -0.0383, wmCol: '#FBFEFF', tgCol: '#9397A4' };
const SHEEN = 0.10;   // peak lightening of the one sheen (0 = off)
// Build book C1 asks for the three darker trailing blocks last. In the film itself they arrive mid-build
// (about 0.8-1.0 s). true = book, false = exactly the film.
const TRAIL_LAST = true;
// BRAND STORY TEST (2 Oct): "Blue is built. Orange is next." Every block lands orange and cools to its own blue;
// the outermost trailing block lands last and stays orange. `on: false` restores the plain build.
const HOT = { on: true, color: '#EB7E3B', lead: 0.10, cool: 0.30 };
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
// Glow, measured on the film's hold frame: centred on the mark, wide ellipse (half strength ~1.3 h across, ~0.9 h tall).
const GLOW = { dy: 0.02, rx: 1.6, ry: 1.05, col: [4 / 255, 10 / 255, 28 / 255] };

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const outQuad = (x) => { x = clamp01(x); return 1 - (1 - x) * (1 - x); };
const outCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const outQuart = (x) => 1 - Math.pow(1 - clamp01(x), 4);
const inOutSine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const inOutQuart = (x) => { x = clamp01(x); return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; };
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// hold layout of the lockup (CSS px), shared with stage.js for the travel
export function lockupRect(W, H, vw, vh) {
  const asp = vw / vh;
  const h = Math.min(H * LOCK.h, W * 0.84 / asp);
  return { cx: W / 2 + LOCK.cx * h, cy: H / 2 + LOCK.cy * h, s: h / vh, h };
}

export function createLogo2D(renderer, opts = {}) {
  const ink = new THREE.Color().setStyle(opts.ink || '#0B0B0C', THREE.SRGBColorSpace);
  const fontBase = opts.fontBase || new URL('../../assets/fonts/', import.meta.url).href;
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -1, 1);   // device pixels, y down via negative bottom
  const quad = () => new THREE.PlaneGeometry(1, 1);
  const premul = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor };
  const texVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const texFS = `uniform sampler2D uTex; uniform vec4 uUv; uniform float uA; varying vec2 vUv;
    void main(){ gl_FragColor = texture2D(uTex, uUv.xy + vUv * uUv.zw) * uA; }`;   // premultiplied, raw sRGB bytes

  // glow: soft periwinkle, local to the lockup, added on top of the ink (dithered: no banding)
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Vector2() }, uR: { value: new THREE.Vector2(1, 1) }, uI: { value: 0 }, uCol: { value: new THREE.Vector3(...GLOW.col) } },
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec2 uC; uniform vec2 uR; uniform float uI; uniform vec3 uCol;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 q = (gl_FragCoord.xy - uC) / uR;
        float g = exp(-dot(q, q)) * uI;
        vec3 c = uCol * g + (hash(gl_FragCoord.xy) - 0.5) / 255.0 * step(0.02, g);
        gl_FragColor = vec4(max(c, 0.0), 1.0);
      }`,
  });
  glowMat.toneMapped = false;
  const glow = new THREE.Mesh(quad(), glowMat); glow.frustumCulled = false; glow.renderOrder = 0;
  scene.add(glow);

  // text layer (drawn once per size), mark layer (redrawn while it animates)
  const textCv = document.createElement('canvas'), markCv = document.createElement('canvas');
  const textTex = new THREE.CanvasTexture(textCv), markTex = new THREE.CanvasTexture(markCv);
  for (const t of [textTex, markTex]) {
    t.colorSpace = THREE.NoColorSpace; t.premultiplyAlpha = true; t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
  }
  const textMat = new THREE.ShaderMaterial({ ...premul, uniforms: { uTex: { value: textTex }, uUv: { value: new THREE.Vector4(0, 0, 1, 1) }, uA: { value: 0 } }, vertexShader: texVS, fragmentShader: texFS });
  const markMat = new THREE.ShaderMaterial({ ...premul, uniforms: { uTex: { value: markTex }, uUv: { value: new THREE.Vector4(0, 0, 1, 1) }, uA: { value: 1 } }, vertexShader: texVS, fragmentShader: texFS });
  textMat.toneMapped = false; markMat.toneMapped = false;
  const textQ = new THREE.Mesh(quad(), textMat), markQ = new THREE.Mesh(quad(), markMat);
  for (const [m, o] of [[textQ, 1], [markQ, 2]]) { m.frustumCulled = false; m.renderOrder = o; scene.add(m); }

  let L = null;                              // derived from the logo json
  const fonts = { ready: false };
  let textKey = '', markSize = '';
  (async () => {
    try {
      if (typeof FontFace === 'undefined') return;
      const a = new FontFace('KN Wordmark', `url(${fontBase}Sora-600.ttf)`, { weight: '600' });
      const b = new FontFace('KN Tagline', `url(${fontBase}InstrumentSans-500.ttf)`, { weight: '500' });
      await Promise.all([a.load(), b.load()]);
      document.fonts.add(a); document.fonts.add(b);
      fonts.ready = true; textKey = '';
    } catch (e) { console.warn('stage: wordmark fonts did not load; the intro shows the mark only.', e); }
  })();

  function build(j) {
    const [vx, vy, vw, vh] = j.viewBox;
    const colors = j.colors || {};
    const resolve = (f) => (typeof f === 'string' && f[0] === '#') ? f : (colors[f] || opts.peri || '#8FA2FF');
    const nb = [...(j.n && j.n.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const sizes = nb.map((b) => +b.s || 0).filter((x) => x > 0).sort((a, b) => a - b);
    const bsz = sizes.length ? sizes[sizes.length >> 1] : vw / 24;
    // K: one path (overlaps fill once), its own gradient (userSpace or bbox fractions, as the SVG)
    // one winding for every K polygon, so the nonzero union fills its shared edges with no hairline seam
    const area = (p) => p.reduce((acc, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return acc + x * y2 - x2 * y; }, 0);
    // `outline` = the K as ONE simple polygon (the union of stem + arms): the three overlapping polygons left a
    // diagonal hairline in the stem where the GPU rasteriser split it at the junction
    const polys = ((j.k && (j.k.outline ? [j.k.outline] : j.k.polygons)) || []).map((p) => (area(p) < 0 ? [...p].reverse() : p));
    let kx0 = Infinity, ky0 = Infinity, kx1 = -Infinity, ky1 = -Infinity;
    for (const p of polys) for (const [x, y] of p) { kx0 = Math.min(kx0, x); ky0 = Math.min(ky0, y); kx1 = Math.max(kx1, x); ky1 = Math.max(ky1, y); }
    const kf = (j.k && j.k.fill) || {};
    const frac = [kf.x1, kf.y1, kf.x2, kf.y2].every((v) => v != null && +v >= 0 && +v <= 1);
    const GX = (v, d) => frac ? kx0 + (+(v ?? d)) * (kx1 - kx0) : +(v ?? d), GY = (v, d) => frac ? ky0 + (+(v ?? d)) * (ky1 - ky0) : +(v ?? d);
    const grad = { x1: GX(kf.x1, 0), y1: GY(kf.y1, 0), x2: GX(kf.x2, 1), y2: GY(kf.y2, 0),
      stops: (Array.isArray(kf.stops) && kf.stops.length ? kf.stops : [[0, '#FFFFFF'], [1, resolve('periLight')]]).map(([o, c]) => [clamp01(+o), resolve(c)]) };
    // N blocks: the film's arrival times (blended with an even sweep by order, which smooths measuring noise);
    // the three darker trailing blocks (darkest fills) arrive last, as in the film.
    const nN = nb.length;
    const lumOf = (hex) => { const c = new THREE.Color().setStyle(hex, THREE.SRGBColorSpace); return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; };
    const trail = new Set(nb.map((b, k) => [k, lumOf(resolve(b.fill))]).sort((a, b) => a[1] - b[1]).filter((x) => x[1] < 0.12).slice(0, 3).map((x) => x[0]));
    const useFilm = !j.standin && nN === FILM_ARRIVE.length;
    const R = mulberry32(5303);
    const trailOrder = [...trail].sort((a, b) => nb[a].x - nb[b].x || nb[b].y - nb[a].y);
    const blocks = nb.map((b, k) => {
      const even = 0.76 + 0.84 * (nN > 1 ? k / (nN - 1) : 0);
      let arrive = useFilm ? FILM_ARRIVE[k] : even;   // the film's own arrival times
      if (TRAIL_LAST && trail.has(k)) arrive = INTRO.built - 0.16 + 0.08 * trailOrder.indexOf(k);
      arrive = Math.min(arrive, INTRO.built);
      const side = R() < 0.5 ? -1 : 1;
      return { x: b.x, y: b.y, s: +b.s || bsz, r: Math.min(+b.r || 0, (+b.s || bsz) / 2), fill: resolve(b.fill), arrive,
        hot: trailOrder.length > 0 && k === trailOrder[trailOrder.length - 1],
        dx: side * (0.22 + 0.14 * R()) * bsz, dy: (R() - 0.5) * 0.10 * bsz };
    });
    L = { vx, vy, vw, vh, bsz, polys, grad, blocks, standin: !!j.standin };
    markSize = ''; textKey = '';
  }

  // ---- drawing ----
  function drawMark(g, t, k, ox, oy, sheen) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, markCv.width, markCv.height);
    g.setTransform(k, 0, 0, k, ox - L.vx * k, oy - L.vy * k);
    const kA = outQuad((t - INTRO.kA) / INTRO.kDur);
    if (kA > 0 && L.polys.length) {
      // The K is rasterised on a small CPU canvas and stamped in. Chrome's GPU canvas splits a filled polygon into
      // triangles and left a diagonal hairline inside the stem (measured: 235 off pixels on GPU, 0 on CPU).
      // It is re-drawn only when the scale or the sub-pixel offset changes, so the hold costs nothing.
      if (!L.kbox) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of L.polys) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
        L.kbox = [x0, y0, x1, y1]; L.kCv = document.createElement('canvas'); L.kKey = '';
      }
      const [bx0, by0, bx1, by1] = L.kbox;
      const dx = ox - L.vx * k + bx0 * k, dy = oy - L.vy * k + by0 * k, ix = Math.floor(dx), iy = Math.floor(dy);
      const key = `${k.toFixed(5)}|${(dx - ix).toFixed(3)}|${(dy - iy).toFixed(3)}`;
      if (key !== L.kKey) {
        L.kKey = key;
        const w = Math.ceil((bx1 - bx0) * k) + 3, h = Math.ceil((by1 - by0) * k) + 3;
        if (L.kCv.width !== w || L.kCv.height !== h) { L.kCv.width = w; L.kCv.height = h; }
        const c = L.kCv.getContext('2d', { willReadFrequently: true });
        c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
        c.setTransform(k, 0, 0, k, dx - ix + 1 - bx0 * k, dy - iy + 1 - by0 * k);
        const gr = c.createLinearGradient(L.grad.x1, L.grad.y1, L.grad.x2, L.grad.y2);
        for (const [o, col] of L.grad.stops) gr.addColorStop(o, col);
        c.fillStyle = gr; c.beginPath();
        for (const p of L.polys) { p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); }
        c.fill('nonzero');
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = kA; g.drawImage(L.kCv, ix - 1, iy - 1);
      g.setTransform(k, 0, 0, k, ox - L.vx * k, oy - L.vy * k);
    }
    for (const B of L.blocks) {
      const u0 = t - (B.arrive - INTRO.blockSlide);
      if (u0 <= 0) continue;
      const a = inOutSine((t - (B.arrive - INTRO.blockFade)) / INTRO.blockFade);
      if (a <= 0.001) continue;
      const e = outQuart(u0 / INTRO.blockSlide);
      const sc = lerp(0.9, 1, e), s = B.s * sc;
      const cx = B.x + B.s / 2 + B.dx * (1 - e), cy = B.y + B.s / 2 + B.dy * (1 - e);
      let fill = B.fill;
      if (HOT.on && /^#[0-9a-f]{6}$/i.test(B.fill)) {
        const h = B.hot ? 1 : Math.max(0, Math.min(1, 1 - (t - (B.arrive - HOT.lead)) / HOT.cool));
        if (h > 0) { const o = hexRgb(HOT.color), c = hexRgb(B.fill), m = h * h * (3 - 2 * h); fill = `rgb(${o.map((v, i) => Math.round(c[i] + (v - c[i]) * m)).join(',')})`; }
      }
      g.globalAlpha = a; g.fillStyle = fill;
      g.beginPath(); g.roundRect(cx - s / 2, cy - s / 2, s, s, B.r * sc); g.fill();
    }
    g.globalAlpha = 1;
    if (sheen > 0.001) {   // one soft diagonal band, only on the mark's own pixels
      const u = inOutSine((t - INTRO.sheenA) / (INTRO.sheenB - INTRO.sheenA));
      const span = L.vw * 1.5, x = L.vx - 0.35 * L.vw + u * span, w = L.vw * 0.16;
      const gr = g.createLinearGradient(x - w, L.vy + L.vh * 0.3, x + w, L.vy - L.vh * 0.1);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${(SHEEN * sheen).toFixed(4)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.globalCompositeOperation = 'source-atop'; g.fillStyle = gr;
      g.fillRect(L.vx - L.vw * 0.2, L.vy - L.vh * 0.2, L.vw * 1.4, L.vh * 1.4);
      g.globalCompositeOperation = 'source-over';
    }
  }
  function fitText(g, text, family, weight, capPx, widthPx) {
    let size = 100;
    g.letterSpacing = '0px'; g.font = `${weight} ${size}px "${family}"`;
    const cap = g.measureText('H').actualBoundingBoxAscent || size * 0.7;
    size = capPx * size / cap;
    g.font = `${weight} ${size}px "${family}"`;
    let ls = 0;
    for (let i = 0; i < 3; i++) {
      g.letterSpacing = `${ls}px`;
      const m = g.measureText(text), ink = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      ls += (widthPx - ink) / Math.max(text.length - 1, 1);
    }
    g.letterSpacing = `${ls}px`;
    const m = g.measureText(text);
    return { size, ls, left: m.actualBoundingBoxLeft, ink: m.actualBoundingBoxLeft + m.actualBoundingBoxRight };
  }
  function drawText(dev, rect) {
    // canvas spans the text block under the mark at the hold scale, in device pixels
    const h = rect.h * dev, cxD = rect.cx * dev, markBot = (rect.cy + rect.h / 2) * dev;
    const x0 = Math.floor(cxD - h * 0.9), y0 = Math.floor(markBot + h * (LOCK.wmTop - 0.05));
    const w = Math.ceil(h * 1.8) + 2, hh = Math.ceil(h * (LOCK.tgTop + LOCK.tgCap - LOCK.wmTop + 0.16)) + 2;
    if (textCv.width !== w || textCv.height !== hh) { textCv.width = w; textCv.height = hh; }
    const g = textCv.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, hh);
    g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    const wm = fitText(g, 'KN Services', 'KN Wordmark', 600, LOCK.wmCap * h, LOCK.wmW * h);
    g.fillStyle = LOCK.wmCol;
    g.fillText('KN Services', cxD + LOCK.wmDx * h - wm.ink / 2 + wm.left - x0, markBot + (LOCK.wmTop + LOCK.wmCap) * h - y0);
    const tg = fitText(g, 'WEBSITES · SOCIAL MEDIA · SOFTWARE', 'KN Tagline', 500, LOCK.tgCap * h, LOCK.tgW * h);
    g.fillStyle = LOCK.tgCol;
    g.fillText('WEBSITES · SOCIAL MEDIA · SOFTWARE', cxD + LOCK.tgDx * h - tg.ink / 2 + tg.left - x0, markBot + (LOCK.tgTop + LOCK.tgCap) * h - y0);
    g.letterSpacing = '0px';
    textTex.needsUpdate = true;
    return { x0, y0, w, h: hh };
  }

  let textBox = null;
  // ctx: { W, H, bufW, bufH, a: {cx, cy, s, h}, b: {cx, cy, s} }   (CSS px; a = hold, b = top-bar target)
  function update(t, ctx) {
    if (!L || t >= INTRO.fadeB) { scene.visible = false; return false; }
    scene.visible = true;
    const { W, H, bufW, bufH, a, b } = ctx;
    const dev = bufW / W;                                   // device px per CSS px (exact, any pixel ratio)
    cam.left = 0; cam.right = bufW; cam.top = 0; cam.bottom = -bufH; cam.updateProjectionMatrix();
    const out = 1 - inOutSine((t - INTRO.outA) / (INTRO.outB - INTRO.outA));
    // glow
    const gIn = inOutSine(t / INTRO.glowIn), swell = 1 + 0.18 * inOutSine((t - INTRO.swellA) / (INTRO.swellB - INTRO.swellA));
    glowMat.uniforms.uI.value = gIn * swell * out;
    glowMat.uniforms.uC.value.set(W / 2 * dev, bufH - (a.cy + a.h * GLOW.dy) * dev);
    glowMat.uniforms.uR.value.set(a.h * GLOW.rx * dev, a.h * GLOW.ry * dev);
    glow.position.set(bufW / 2, -bufH / 2, 0); glow.scale.set(bufW, bufH, 1);
    glow.visible = glowMat.uniforms.uI.value > 0.002;
    // text (fonts permitting)
    const tA = fonts.ready ? outCubic((t - INTRO.textA) / (INTRO.textB - INTRO.textA)) * out : 0;
    textQ.visible = tA > 0.002;
    if (textQ.visible) {
      const key = `${bufW}x${bufH}:${a.cx.toFixed(2)},${a.cy.toFixed(2)},${a.h.toFixed(3)}`;
      if (key !== textKey) { textKey = key; textBox = drawText(dev, a); }
      textMat.uniforms.uA.value = tA;
      textQ.position.set(textBox.x0 + textBox.w / 2, -(textBox.y0 + textBox.h / 2), 0); textQ.scale.set(textBox.w, textBox.h, 1);
      textMat.uniforms.uUv.value.set(0, 0, 1, 1);
    }
    // mark: hold rect -> top-bar rect
    const k = inOutQuart((t - INTRO.travelA) / (INTRO.travelB - INTRO.travelA));
    const cx = lerp(a.cx, b.cx, k), cy = lerp(a.cy, b.cy, k), s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), k));
    const pad = Math.ceil(0.6 * L.bsz * a.s * dev) + 2;
    const need = `${Math.ceil(L.vw * a.s * dev) + 2 * pad + 2}x${Math.ceil(L.vh * a.s * dev) + 2 * pad + 2}`;
    if (need !== markSize) { markSize = need; const [w, h] = need.split('x').map(Number); markCv.width = w; markCv.height = h; markTex.dispose(); }
    const k2 = s * dev;                                    // device px per vb unit
    const lx = (cx - L.vw / 2 * s) * dev - 0.6 * L.bsz * k2, ty = (cy - L.vh / 2 * s) * dev - 0.6 * L.bsz * k2;
    const ix = Math.floor(lx), iy = Math.floor(ty);
    const uw = Math.min(markCv.width, Math.ceil((L.vw + 1.2 * L.bsz) * k2) + 2), uh = Math.min(markCv.height, Math.ceil((L.vh + 1.2 * L.bsz) * k2) + 2);
    const sheen = t > INTRO.sheenA && t < INTRO.sheenB ? Math.sin(Math.PI * clamp01((t - INTRO.sheenA) / (INTRO.sheenB - INTRO.sheenA))) : 0;
    drawMark(markCv.getContext('2d'), t, k2, lx - ix + 0.6 * L.bsz * k2, ty - iy + 0.6 * L.bsz * k2, sheen);
    markTex.needsUpdate = true;
    markQ.position.set(ix + uw / 2, -(iy + uh / 2), 0); markQ.scale.set(uw, uh, 1);
    markMat.uniforms.uUv.value.set(0, 1 - uh / markCv.height, uw / markCv.width, uh / markCv.height);
    return true;
  }

  function render() { renderer.render(scene, cam); }
  function dispose() {
    for (const m of [glow, textQ, markQ]) { m.geometry.dispose(); m.material.dispose(); }
    textTex.dispose(); markTex.dispose();
  }
  return { build, update, render, dispose, get built() { return !!L; }, get fontsReady() { return fonts.ready; } };
}
