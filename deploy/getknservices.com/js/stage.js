/* KN website v5 — stage.js — the WebGL tile wall ("Watch it build").
 * Engine agent. Contract: BUILD_BOOK.md section 6.
 *
 * REQUIRED IMPORT MAP (index.html and stage-test.html carry exactly this, before any module script):
 *   <script type="importmap">
 *   { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js" } }
 *   </script>
 *
 * API (contract):
 *   const stage = await createStage(canvasEl, { scenes, logo, ink, peri, signal, reducedMotion });
 *   stage.playIntro({ logoTargetRect, skip }) -> Promise (resolves at 'live')
 *   stage.on(name, cb)  'logo-done' | 'wall-start' | 'wall-done' | 'live' | 'frame' | 'resize'  (returns an off() function)
 *   stage.setScenePosition(s)  s in 0..scenes.length-1; floor = front scene, fract = flip progress
 *   stage.setFlipStyle(i, 'diagonal' | 'rows' | 'radial')
 *   stage.lens  { cols, rows, tile, originX, originY, heat: Float32Array(cols*rows) }  CSS px, row-major
 *   stage.setLensEnabled(bool) · stage.tileCount · stage.destroy()
 * AMENDMENT 1: N scenes (any count). Scenes that share a video/poster URL share one element and one
 *   texture; `dim` is applied per face, so opening -> plans turns to a darker copy of the same film.
 * AMENDMENT 3 (C1-C4, supersedes B8): the logo intro is the client's own film (KN-05-Build.mp4) reproduced
 *   live in 2D (js/stage/logo2d.js; logo3d.js is rejected and no longer referenced). Intro is 4.0 s:
 *   mark-built 1.62 (new) · wall-start 2.70 · logo-done 3.20 · wall-done 3.55 · live 4.00 (same order). Flat-colour scenes may sit anywhere in the list; the lens is off on them.
 * Additions (non-breaking): stage.skipIntro() fast-forwards a running intro to 'live';
 *   playIntro({skip:true}) during a running intro does the same. stage.seekIntro(seconds|null, rect?)
 *   is a test-harness scrub. Options: `ink2` (colour of the landed "ink side", default #161618),
 *   `forceLens` (harness only: lens without a fine-pointer media match).
 * Default flip styles per transition: rows, diagonal, radial, diagonal, rows, radial (override with setFlipStyle).
 *
 * Colour: renderer output is sRGB; textures are uploaded raw and decoded sRGB->linear in the shader,
 * so a tile at rest with dim 0 reproduces the source pixel exactly.
 */
import * as THREE from 'three';
import { createLogo2D, INTRO, lockupRect } from './stage/logo2d.js';

const DEFAULTS = {
  scenes: [], logo: 'assets/logo/kn-build-mark.json',
  ink: '#0B0B0C', ink2: '#161618', peri: '#8FA2FF', signal: '#EB7E3B',
  reducedMotion: false, forceLens: false,
};
const FOV = 38;                 // vertical fov, degrees
const DEPTH_RATIO = 0.12;       // tile thickness / tile size
const OVERLAP_PX = 0.75;        // rest overlap (CSS px) so float edges can never open a hairline
const LENS_R = 1.8, LENS_DECAY = 0.6, LENS_ATTACK = 0.05;   // ~10 hot cells, 0.6 s trail
const STYLE_ID = { diagonal: 0, rows: 1, radial: 2 };
// Intro timeline (seconds) — BUILD_BOOK Amendment 3 C4 (live at 4.0 s). Logo beats live in logo2d.js.
const T = {
  built: INTRO.built,
  travelA: INTRO.travelA, travelB: INTRO.travelB, fadeB: INTRO.fadeB,
  wallA: INTRO.wallA, wallB: INTRO.wallB, flipA: INTRO.flipA, flipB: INTRO.flipB, total: INTRO.total,
};

// ---------- stand-in logo (same schema as assets/logo/kn-build-mark.json) ----------
const STANDIN_LOGO = (() => {
  const P = 12, S = 10.5, X0 = 128, cols = 9, rows = 10;
  const cells = new Map();
  const add = (c, r) => cells.set(c + ',' + r, [c, r]);
  for (let r = 0; r < rows; r++) { add(0, r); add(cols - 1, r); }
  for (let c = 1; c < cols - 1; c++) {
    add(c, Math.round(c * (rows - 1) / (cols - 1)));
    add(c, Math.round((c + 0.5) * (rows - 1) / (cols - 1)));
  }
  const blocks = [...cells.values()].map(([c, r]) => ({
    x: X0 + c * P + (P - S) / 2, y: r * P + (P - S) / 2, s: S, r: 0,
    fill: c === 0 ? 'periDeep' : c === cols - 1 ? 'periLight' : 'peri', order: c * rows + r,
  }));
  return {
    viewBox: [0, 0, 240, 120], standin: true,
    k: {
      polygons: [
        [[4, 0], [34, 0], [34, 120], [4, 120]],
        [[34, 48], [80, 0], [114, 0], [52, 66]],
        [[48, 54], [114, 120], [80, 120], [34, 80]],
      ],
      fill: { type: 'linear', x1: 0, y1: 0, x2: 1, y2: 1, stops: [[0, '#C7D0FF'], [1, '#4F6BEF']] },
    },
    n: { pitch: P, blocks },
    colors: { white: '#FFFFFF', periLight: '#B8C4FF', peri: '#8FA2FF', periDeep: '#4F6BEF' },
  };
})();

// ---------- small helpers ----------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const clamp01 = (x) => clamp(x, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const expoInOut = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
const quartOut = (t) => 1 - Math.pow(1 - clamp01(t), 4);
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function layoutFor(W, H) {
  const target = clamp(W / 26, 44, 76);
  const cols = Math.max(1, Math.round(W / target));
  const tile = W / cols;
  const rows = Math.max(1, Math.ceil(H / tile - 1e-6));
  return { cols, rows, tile, originX: 0, originY: (H - rows * tile) / 2 };
}
function rectOf(r) {
  if (!r) return null;
  const x = r.left ?? r.x, y = r.top ?? r.y;
  if (![x, y, r.width, r.height].every(Number.isFinite) || r.width <= 0 || r.height <= 0) return null;
  return { x, y, w: r.width, h: r.height };
}

// ---------- shaders ----------
const GLSL_COMMON = /* glsl */`
const float PI = 3.141592653589793;
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }
`;
const GLSL_LIN = /* glsl */`
vec3 toLin(vec3 c){ return mix(c * 0.0773993808, pow(c * 0.9478672986 + 0.0521327014, vec3(2.4)), step(0.04045, c)); }
`;

const WALL_VS = /* glsl */`
attribute vec2 aCell;
attribute vec4 aRand;
attribute float aHeat;
uniform vec2 uView; uniform vec2 uOrigin; uniform float uTile; uniform vec2 uGrid;
uniform float uDepth; uniform float uOver; uniform float uProg; uniform float uStyle;
uniform vec2 uRad; uniform float uRadMax; uniform float uLift; uniform float uHot; uniform float uAsm;
uniform vec4 uCovA; uniform vec4 uCovB;
varying vec2 vUvA; varying vec2 vUvB; varying vec2 vCA; varying vec2 vCB; varying vec2 vScr; varying vec2 vLoc;
varying vec3 vN; varying vec3 vW; varying float vFace; varying float vHeat; varying float vMot; varying float vFog;
${GLSL_COMMON}
float easeIO(float p){ return p < 0.5 ? 8.0*p*p*p*p : 1.0 - pow(-2.0*p + 2.0, 4.0) * 0.5; }
void main(){
  vec2 cCss = uOrigin + (aCell + 0.5) * uTile;                  // cell centre, CSS px, y down
  vec2 rest = vec2(cCss.x - uView.x * 0.5, uView.y * 0.5 - cCss.y);
  vec2 gn = aCell / max(uGrid - 1.0, vec2(1.0));
  float d; float spread;
  if (uStyle < 0.5)      { d = (gn.x + (1.0 - gn.y)) * 0.5 + (aRand.x - 0.5) * 0.07; spread = 0.58; }
  else if (uStyle < 1.5) { d = gn.y + (aRand.x - 0.5) * 0.016;                         spread = 0.64; }
  else                   { d = length(cCss - uRad) / uRadMax + (aRand.x - 0.5) * 0.06;  spread = 0.58; }
  d = clamp(d, 0.0, 1.0);
  float p = uStyle > 2.5 ? 0.0 : clamp((uProg - d * spread) / (1.0 - spread), 0.0, 1.0);
  float th = PI * easeIO(p);
  float mot = sin(th);
  float h = aHeat;
  // intro assembly: fly in from scattered depth, land in a wave from the centre out
  float da = clamp(length(cCss - uView * 0.5) / length(uView * 0.5) + (aRand.y - 0.5) * 0.3, 0.0, 1.0);
  float pa = clamp((uAsm - da * 0.52) / 0.48, 0.0, 1.0);
  float fly = pow(1.0 - pa, 4.0);
  float sc = 1.0 - 0.05 * mot - 0.10 * h;
  float lift = uLift * mot + uHot * uTile * 0.32 * h;
  // thickness only while the tile moves: a tile at rest has no side faces to leak into a seam
  float dep = uDepth * smoothstep(0.0, 0.2, max(max(mot, fly), h));
  vec3 lp = position * vec3(uTile * uOver * sc, uTile * uOver * sc, dep);
  mat3 M = rotY((aRand.w - 0.5) * 1.8 * fly) * rotX(th + (aRand.z - 0.5) * 2.4 * fly);
  vec3 wp = M * lp;
  vec3 off = vec3((aRand.zw - 0.5) * uView * 0.7, -(1100.0 + 2600.0 * aRand.y)) * fly;
  wp += vec3(rest, -dep * 0.5 + lift) + off;
  vW = wp;
  vN = M * normal;
  float fz = normal.z;
  vFace = fz > 0.5 ? 1.0 : (fz < -0.5 ? -1.0 : 0.0);
  vec2 fl = fz < -0.5 ? vec2(position.x, -position.y) : position.xy;   // back face: upright, unmirrored after the x-flip
  vLoc = fl + 0.5;
  vec2 pCss = cCss + vec2(fl.x, -fl.y) * uTile * uOver;
  vec2 su = vec2(pCss.x / uView.x, 1.0 - pCss.y / uView.y);
  vScr = su;
  vUvA = (su - 0.5) * uCovA.xy + 0.5 + uCovA.zw;
  vUvB = (su - 0.5) * uCovB.xy + 0.5 + uCovB.zw;
  vec2 sc0 = vec2(cCss.x / uView.x, 1.0 - cCss.y / uView.y);
  vCA = (sc0 - 0.5) * uCovA.xy + 0.5 + uCovA.zw;
  vCB = (sc0 - 0.5) * uCovB.xy + 0.5 + uCovB.zw;
  vHeat = h;
  vMot = max(mot, 1.0 - pa);
  vFog = clamp(1.0 + wp.z / 2400.0, 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`;

const WALL_FS = /* glsl */`
uniform sampler2D uTexA; uniform sampler2D uTexB;
uniform float uHasA; uniform float uHasB; uniform vec3 uColA; uniform vec3 uColB;
uniform float uDimA; uniform float uDimB; uniform float uXf;
uniform vec2 uTapA; uniform vec2 uTapB;
uniform vec3 uInk; uniform vec3 uSide; uniform vec3 uPeri; uniform vec3 uCam;
uniform vec2 uView; uniform float uTile; uniform float uFade;
varying vec2 vUvA; varying vec2 vUvB; varying vec2 vCA; varying vec2 vCB; varying vec2 vScr; varying vec2 vLoc;
varying vec3 vN; varying vec3 vW; varying float vFace; varying float vHeat; varying float vMot; varying float vFog;
${GLSL_LIN}
float offFilm(vec2 uv){ vec2 d = max(-uv, uv - 1.0); return step(0.004, max(d.x, d.y)); }
vec3 scA(vec2 uv){ return (uHasA > 0.5 && offFilm(uv) < 0.5) ? toLin(texture2D(uTexA, clamp(uv, 0.0, 1.0)).rgb) : uColA; }
vec3 scB(vec2 uv){ return (uHasB > 0.5 && offFilm(uv) < 0.5) ? toLin(texture2D(uTexB, clamp(uv, 0.0, 1.0)).rgb) : uColB; }
vec3 brighter(vec3 a, vec3 b){ return dot(a, vec3(0.2126, 0.7152, 0.0722)) >= dot(b, vec3(0.2126, 0.7152, 0.0722)) ? a : b; }
vec3 mosA(){ vec3 m = scA(vCA); for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) m = brighter(m, scA(vCA + vec2(float(i), float(j)) * uTapA)); return m; }
vec3 mosB(){ vec3 m = scB(vCB); for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) m = brighter(m, scB(vCB + vec2(float(i), float(j)) * uTapB)); return m; }
float dimF(float dim){
  vec2 q = (vScr - 0.5) * vec2(uView.x / uView.y, 1.0);
  float v = smoothstep(0.18, 1.0, length(q));
  return pow(clamp(1.0 - dim * (0.62 + 0.38 * v), 0.0, 1.0), 2.2);   // darkening judged in sRGB, applied in linear
}
void main(){
  vec3 n = normalize(vN);
  vec3 L = normalize(vec3(-0.35, 0.6, 1.0));
  vec3 V = normalize(uCam - vW);
  vec3 Hh = normalize(L + V);
  float lam = max(dot(n, L), 0.0);
  float sp = pow(max(dot(n, Hh), 0.0), 96.0);
  float sp0 = pow(max(Hh.z, 0.0), 96.0);
  vec3 col;
  if (abs(vFace) > 0.5) {
    bool fr = vFace > 0.0;
    vec3 c;
    if (fr) {
      c = scA(vUvA) * dimF(uDimA);
      if (uXf > 0.0) c = mix(c, scB(vUvB) * dimF(uDimB), uXf);
    } else {
      c = scB(vUvB) * dimF(uDimB);
    }
    float hasT = fr ? uHasA : uHasB;                    // the lens draws nothing on a flat-colour scene
    float heat = vHeat * hasT;
    if (heat > 0.002) {
      vec3 mo = fr ? mosA() * dimF(uDimA) : mosB() * dimF(uDimB);
      c = mix(c, mo, clamp(heat * 1.15, 0.0, 1.0));
    }
    c *= lam / L.z;                                  // exactly 1.0 for a face at rest
    c += max(sp - sp0, 0.0) * 0.045;                 // a touch of glint; exactly 0.0 at rest
    vec2 eL = min(vLoc, 1.0 - vLoc) * uTile;
    float ed = min(eL.x, eL.y);
    c += (1.0 - smoothstep(0.0, 2.5, ed)) * vMot * 0.05;           // bevel catch-light, only in motion
    float aa = max(fwidth(ed), 0.0001);
    float ln = 1.0 - smoothstep(0.5, 0.5 + aa, abs(ed - 3.5));
    c = mix(c, uPeri, 0.35 * ln * smoothstep(0.05, 0.45, heat));    // hairline periwinkle inner line, 35 %
    col = c;
  } else {
    col = uSide * (0.45 + 1.15 * lam) + sp * 0.05;                  // ink sides with a little light
  }
  col = mix(uInk, col, vFog * uFade);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

// ---------- the stage ----------
export async function createStage(canvas, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const DPR_CAP = Math.max(1, Math.min(2, +opts.dprCap || 2));   // speed: 1.5 on phones (main.js), 2 elsewhere
  const IDLE_SKIP = !!opts.idleSkip;                              // speed: touch screens draw only when something changed

  const reduced = !!opts.reducedMotion;
  const listeners = new Map();
  const emit = (name, data) => { const set = listeners.get(name); if (set) for (const cb of [...set]) { try { cb(data); } catch (e) { console.error(e); } } };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const C = (hex) => new THREE.Color(hex);
  const inkC = C(opts.ink), ink2C = C(opts.ink2);
  renderer.setClearColor(inkC, 1);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10000);
  const wallScene = new THREE.Scene();
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;

  // ----- scenes (film / poster / colour). N scenes; media shared per URL (AMENDMENT 1, A7) -----
  const loader = new THREE.TextureLoader();
  const posters = new Map(), films = new Map();
  const posterFor = (url) => {
    if (!url) return null;
    if (posters.has(url)) return posters.get(url);
    const m = { url, tex: null, aspect: 16 / 9, failed: false };
    posters.set(url, m);
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.NoColorSpace; tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      m.tex = tex; m.aspect = tex.image.width / tex.image.height || 16 / 9;
      try {   // tiny CPU copy for the wall self-test (expected brightness at sample points)
        const cv = document.createElement('canvas'); cv.width = 48; cv.height = 27;
        const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(tex.image, 0, 0, 48, 27);
        m.thumb = g.getImageData(0, 0, 48, 27);
      } catch (e) { m.thumb = null; }
    }, undefined, () => { m.failed = true; });
    return m;
  };
  // A film replaces its poster only once a real frame is on the GPU. Uploads are driven by the
  // engine (initTexture + currentTime), never only by requestVideoFrameCallback, which some
  // embedded / hidden / power-saving contexts never fire: that left a never-uploaded texture bound = black wall.
  const filmFor = (url) => {
    if (!url || reduced) return null;                       // reduced motion: stills only
    if (films.has(url)) return films.get(url);
    const v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'none';   // speed: nothing downloads until a scene needs it
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.crossOrigin = 'anonymous';
    const m = { url, video: v, tex: null, ready: false, failed: false, blocked: false, lastT: -1, uploads: 0, started: false };
    m.start = () => { if (m.started || m.failed) return; m.started = true; v.preload = 'auto'; v.src = url; v.load(); };
    m.upload = () => {
      if (m.failed || v.readyState < 2 || !v.videoWidth) return;
      if (!m.tex) {
        const t = new THREE.VideoTexture(v);
        t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter;
        m.tex = t;
      }
      try {
        m.tex.needsUpdate = true;
        renderer.initTexture(m.tex);
        m.lastT = v.currentTime; m.uploads++; m.ready = true;
      } catch (e) { m.ready = false; }
    };
    v.addEventListener('loadeddata', m.upload);
    v.addEventListener('seeked', m.upload);
    v.addEventListener('error', () => { m.failed = true; m.ready = false; }, { once: true });
    films.set(url, m);
    return m;
  };
  const scenes = (opts.scenes && opts.scenes.length ? opts.scenes : [{ color: opts.ink }]).map((def, i) => ({
    i, def, color: C(def.color || opts.ink), dim: clamp01(+def.dim || 0),
    poster: posterFor(def.poster), film: filmFor(def.video),
  }));
  const texOf = (sc) => (sc.film && sc.film.ready) ? sc.film.tex : (sc.poster && sc.poster.tex) || null;
  const aspectOf = (sc) => (sc.film && sc.film.ready && sc.film.video.videoWidth) ? sc.film.video.videoWidth / sc.film.video.videoHeight : (sc.poster ? sc.poster.aspect : 16 / 9);
  // Film placement (optional, per scene): SCENES[i].film = { zoom, x, y } on desktop, .filmPhone at 700 px and under.
  // zoom is about the centre of the cover-fit film (1 = cover); x / y then shift it in fractions of the viewport,
  // CSS sense (+x right, +y down). Carried in uCov: .xy = cover scale / zoom, .zw = the shift in film uv.
  // Outside the film the wall shows the scene colour. stage-stub.js mirrors this in paintScene.
  const filmOf = (sc) => (sc && sc.def && (st.W <= 700 ? sc.def.filmPhone : sc.def.film)) || null;
  function setCov(cov, sc, at) {
    const av = st.W / st.H; let cx = 1, cy = 1;
    if (at > av) cx = av / at; else cy = at / av;
    const f = filmOf(sc), z = (f && +f.zoom) || 1; cx /= z; cy /= z;
    return cov.set(cx, cy, f ? -(+f.x || 0) * cx : 0, f ? (+f.y || 0) * cy : 0);
  }

  // ----- state -----
  const st = {
    W: 1, H: 1, dpr: 1, L: null,
    s: 0, front: 0, prog: 0,
    styles: scenes.map((_, i) => ['rows', 'diagonal', 'radial', 'diagonal', 'rows', 'radial'][i % 6]),   // default for opening>plans>social>software>bakery>barber>end
    mode: 'idle', introT: 0, introStart: 0, introSeek: null, introFired: new Set(), introResolve: null,
    introTarget: 0, logoTarget: null,
    lensOn: true, pointer: { x: 0, y: 0, active: false, seen: false }, sp: { x: 0, y: 0 },
    radial: { x: 0, y: 0, for: -1 },
    last: performance.now(), raf: 0, destroyed: false,
    fallback: false, test: { front: -1, passes: 0, fails: 0, last: 0 },
  };
  const lens = { cols: 0, rows: 0, tile: 0, originX: 0, originY: 0, heat: new Float32Array(0) };
  let lensRand = new Float32Array(0);

  // ----- wall mesh -----
  const wallUniforms = {
    uView: { value: new THREE.Vector2(1, 1) }, uOrigin: { value: new THREE.Vector2() }, uTile: { value: 50 },
    uGrid: { value: new THREE.Vector2(1, 1) }, uDepth: { value: 6 }, uOver: { value: 1 },
    uProg: { value: 0 }, uStyle: { value: 0 }, uRad: { value: new THREE.Vector2() }, uRadMax: { value: 1 },
    uLift: { value: 0 }, uHot: { value: reduced ? 0 : 1 }, uAsm: { value: 1 },
    uCovA: { value: new THREE.Vector4(1, 1, 0, 0) }, uCovB: { value: new THREE.Vector4(1, 1, 0, 0) },
    uTexA: { value: blank }, uTexB: { value: blank }, uHasA: { value: 0 }, uHasB: { value: 0 },
    uColA: { value: C(opts.ink) }, uColB: { value: C(opts.ink) }, uDimA: { value: 0 }, uDimB: { value: 0 }, uXf: { value: 0 },
    uTapA: { value: new THREE.Vector2() }, uTapB: { value: new THREE.Vector2() },
    uInk: { value: inkC.clone() }, uSide: { value: C('#1C1C20') }, uPeri: { value: C(opts.peri) },
    uCam: { value: new THREE.Vector3() }, uFade: { value: 1 },
  };
  const wallMat = new THREE.ShaderMaterial({ vertexShader: WALL_VS, fragmentShader: WALL_FS, uniforms: wallUniforms });
  wallMat.toneMapped = false;
  let wall = null, heatAttr = null;

  function buildWall(L) {
    if (wall) { wallScene.remove(wall); wall.geometry.dispose(); wall.dispose?.(); }
    const n = L.cols * L.rows;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const cell = new Float32Array(n * 2), rnd = new Float32Array(n * 4);
    lensRand = new Float32Array(n);
    for (let r = 0; r < L.rows; r++) for (let c = 0; c < L.cols; c++) {
      const i = r * L.cols + c;
      cell[i * 2] = c; cell[i * 2 + 1] = r;
      const R = mulberry32(c * 7919 + r * 104729 + 17);
      for (let k = 0; k < 4; k++) rnd[i * 4 + k] = R();
      lensRand[i] = R();
    }
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 2));
    geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rnd, 4));
    heatAttr = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
    heatAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aHeat', heatAttr);
    wall = new THREE.InstancedMesh(geo, wallMat, n);
    wall.frustumCulled = false;
    wall.visible = st.mode !== 'idle';
    wallScene.add(wall);
    Object.assign(lens, { cols: L.cols, rows: L.rows, tile: L.tile, originX: L.originX, originY: L.originY, heat: heatAttr.array });
  }

  // ----- logo: the client's film, live in 2D (own scene + ortho camera, drawn over the wall during the intro) -----
  const logo2d = createLogo2D(renderer, { ink: opts.ink, peri: opts.peri });
  let logo = null, logoKey = '';

  // ----- poster fallback: one full-screen quad, used only if the wall fails its pixel self-test -----
  const fbUniforms = {
    uTexA: { value: blank }, uTexB: { value: blank }, uHasA: { value: 0 }, uHasB: { value: 0 },
    uColA: { value: C(opts.ink) }, uColB: { value: C(opts.ink) }, uDimA: { value: 0 }, uDimB: { value: 0 },
    uCovA: { value: new THREE.Vector4(1, 1, 0, 0) }, uCovB: { value: new THREE.Vector4(1, 1, 0, 0) },
    uXf: { value: 0 }, uView: { value: wallUniforms.uView.value },
  };
  const fbMat = new THREE.ShaderMaterial({
    uniforms: fbUniforms, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vS; void main(){ vS = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D uTexA; uniform sampler2D uTexB; uniform float uHasA; uniform float uHasB;
      uniform vec3 uColA; uniform vec3 uColB; uniform float uDimA; uniform float uDimB; uniform vec4 uCovA; uniform vec4 uCovB;
      uniform float uXf; uniform vec2 uView; varying vec2 vS;
      ${GLSL_LIN}
      float dimF(float dim){ vec2 q = (vS - 0.5) * vec2(uView.x / uView.y, 1.0); float v = smoothstep(0.18, 1.0, length(q)); return pow(clamp(1.0 - dim * (0.62 + 0.38 * v), 0.0, 1.0), 2.2); }
      void main(){
        vec2 ua = (vS - 0.5) * uCovA.xy + 0.5 + uCovA.zw, ub = (vS - 0.5) * uCovB.xy + 0.5 + uCovB.zw;
        vec2 da = max(-ua, ua - 1.0), db = max(-ub, ub - 1.0);
        vec3 a = ((uHasA > 0.5 && max(da.x, da.y) < 0.004) ? toLin(texture2D(uTexA, clamp(ua, 0.0, 1.0)).rgb) : uColA) * dimF(uDimA);
        vec3 b = ((uHasB > 0.5 && max(db.x, db.y) < 0.004) ? toLin(texture2D(uTexB, clamp(ub, 0.0, 1.0)).rgb) : uColB) * dimF(uDimB);
        gl_FragColor = vec4(mix(a, b, uXf), 1.0);
        #include <colorspace_fragment>
      }`,
  });
  fbMat.toneMapped = false;
  const fbScene = new THREE.Scene();
  const fbQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fbMat);
  fbQuad.frustumCulled = false; fbScene.add(fbQuad);
  function bindFb(slot, sc) {
    const u = fbUniforms, tex = sc.poster && sc.poster.tex;
    u['uTex' + slot].value = tex || blank; u['uHas' + slot].value = tex ? 1 : 0;
    u['uCol' + slot].value.copy(sc.color); u['uDim' + slot].value = sc.dim;
    const av = st.W / st.H, at = tex ? sc.poster.aspect : av, cov = u['uCov' + slot].value;
    setCov(cov, tex ? sc : null, at);
  }
  // self-test: at rest, where the scene's poster/colour is bright, the wall must not read ink/black
  let rowBuf = new Uint8Array(4);
  function expectedAt(sc, sx, sy) {
    const tex = texOf(sc);
    let r, g, b;
    if (tex && sc.poster && sc.poster.thumb) {
      const av = st.W / st.H, at = sc.poster.aspect; let cx = 1, cy = 1;
      if (at > av) cx = av / at; else cy = at / av;
      const f = filmOf(sc);
      if (f) {
        const z = +f.zoom || 1; cx /= z; cy /= z; sx -= (+f.x || 0); sy -= (+f.y || 0);
        const fu = (sx - 0.5) * cx + 0.5, fv = (sy - 0.5) * cy + 0.5;
        if (fu < 0 || fu > 1 || fv < 0 || fv > 1) { const c = sc.color.clone().convertLinearToSRGB(); return Math.max(c.r, c.g, c.b) * 255 * (1 - sc.dim * 0.8); }
      }
      const T = sc.poster.thumb;
      const px = clamp(Math.floor(((sx - 0.5) * cx + 0.5) * T.width), 0, T.width - 1), py = clamp(Math.floor(((sy - 0.5) * cy + 0.5) * T.height), 0, T.height - 1);
      const i = (py * T.width + px) * 4; r = T.data[i]; g = T.data[i + 1]; b = T.data[i + 2];
    } else if (!tex) {
      const c = sc.color.clone().convertLinearToSRGB(); r = c.r * 255; g = c.g * 255; b = c.b * 255;
    } else return -1;
    return Math.max(r, g, b) * (1 - sc.dim * 0.8);
  }
  function selfTest(now) {
    const T0 = st.test;
    if (T0.front !== st.front) { T0.front = st.front; T0.passes = 0; T0.fails = 0; }
    if (T0.passes >= 2 || now - T0.last < 700 || st.prog > 0.001) return;
    T0.last = now;
    const sc = scenes[st.front], gl = renderer.getContext();
    const bw = gl.drawingBufferWidth, bh = gl.drawingBufferHeight;
    let bright = 0, dark = 0;
    if (rowBuf.length < bw * 4) rowBuf = new Uint8Array(bw * 4);
    for (const sy of [0.3, 0.7]) {                       // two row reads per test (one GPU sync each)
      gl.readPixels(0, Math.floor((1 - sy) * bh), bw, 1, gl.RGBA, gl.UNSIGNED_BYTE, rowBuf);
      for (let i = 0; i < 6; i++) {
        const sx = (i + 0.5) / 6;
        if (expectedAt(sc, sx, sy) < 60) continue;
        bright++;
        const k = Math.floor(sx * bw) * 4;
        if (Math.max(rowBuf[k], rowBuf[k + 1], rowBuf[k + 2]) <= 18) dark++;
      }
    }
    if (bright < 3) return;
    if (dark >= Math.ceil(bright * 0.75)) {
      if (++T0.fails >= 2) { st.fallback = true; console.warn('stage: the tile wall did not draw in this browser; showing scene posters on a plain full-screen quad instead.'); }
    } else { T0.fails = 0; T0.passes++; }
  }

  async function fetchLogo() {
    const url = opts.logo;
    if (!url) return STANDIN_LOGO;
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) return STANDIN_LOGO;
      const j = await r.json();
      if (!j || !Array.isArray(j.viewBox) || !j.n || !Array.isArray(j.n.blocks)) return STANDIN_LOGO;
      return j;
    } catch (e) { return STANDIN_LOGO; }
  }

  function buildLogo(j) {
    const key = JSON.stringify(j);
    if (key === logoKey && logo2d.built) return;
    logoKey = key; logo = j;
    logo2d.build(j);
  }

  // ----- layout / resize -----
  function resize(force) {
    const W = canvas.clientWidth || window.innerWidth, H = canvas.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    if (!force && W === st.W && H === st.H && dpr === st.dpr) return;
    st.W = W; st.H = H; st.dpr = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const D = (H / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    camera.position.set(0, 0, D); camera.near = Math.max(1, D * 0.5); camera.far = D + 5000;   // tight range = depth precision
    camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
    wallUniforms.uCam.value.copy(camera.position);
    const L = layoutFor(W, H);
    const rebuild = !st.L || L.cols !== st.L.cols || L.rows !== st.L.rows;
    st.L = L;
    if (rebuild) buildWall(L); else Object.assign(lens, { tile: L.tile, originX: L.originX, originY: L.originY });
    const u = wallUniforms;
    u.uView.value.set(W, H); u.uOrigin.value.set(L.originX, L.originY); u.uTile.value = L.tile;
    u.uGrid.value.set(L.cols, L.rows); u.uDepth.value = L.tile * DEPTH_RATIO; u.uOver.value = 1 + OVERLAP_PX / L.tile;
    u.uLift.value = reduced ? 0 : L.tile * 1.15;
    emit('resize', { width: W, height: H, cols: L.cols, rows: L.rows, tile: L.tile });
  }

  // ----- scene binding -----
  function bindSlot(slot, sc, flat) {
    const u = wallUniforms, A = slot === 'A';
    const tex = flat ? null : texOf(sc);
    (A ? u.uTexA : u.uTexB).value = tex || blank;
    (A ? u.uHasA : u.uHasB).value = tex ? 1 : 0;
    (A ? u.uColA : u.uColB).value.copy(flat || sc.color);
    (A ? u.uDimA : u.uDimB).value = flat ? 0 : sc.dim;
    const av = st.W / st.H, at = tex ? aspectOf(sc) : av;
    const cov = (A ? u.uCovA : u.uCovB).value;
    setCov(cov, tex ? sc : null, at);
    (A ? u.uTapA : u.uTapB).value.set(0.28 * st.L.tile / st.W * cov.x, 0.28 * st.L.tile / st.H * cov.y);
  }
  // only the films on screen play (front + incoming); a film shared by two scenes counts once
  let gestureArmed = false;
  const onGesture = () => {
    for (const m of films.values()) m.blocked = false;
    for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.removeEventListener(ev, onGesture, true);
    gestureArmed = false;
  };
  function playSet(want) {
    let fresh = false;
    for (const m of films.values()) {
      if (m.failed) continue;
      const v = m.video, on = want.has(m);
      if (on) m.start();
      if (on && v.paused && !m.blocked) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {
          if (m.blocked) return;
          m.blocked = true;   // autoplay refused: keep the still, retry on the first gesture
          console.warn('stage: film did not autoplay, showing its still until the first click/key/scroll:', m.url);
          if (!gestureArmed) { gestureArmed = true; for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart']) window.addEventListener(ev, onGesture, true); }
        });
      } else if (!on && !v.paused) v.pause();
      // upload new frames ourselves (does not rely on requestVideoFrameCallback)
      if (on && m.ready && v.currentTime !== m.lastT && v.readyState >= 2) { m.lastT = v.currentTime; m.tex.needsUpdate = true; fresh = true; }
      else if (on && !m.ready) { m.upload(); if (m.ready) fresh = true; }
    }
    return fresh;
  }

  // ----- lens -----
  const fine = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
  function lensAllowed() { return st.lensOn && st.mode === 'live' && !st.fallback && !!texOf(scenes[st.front]) && (opts.forceLens || (fine && fine.matches)); }
  function updateLens(dt) {
    const L = st.L, heat = lens.heat; if (!L || !heat.length) return;
    const k = 1 - Math.exp(-dt / 0.06);
    st.sp.x += (st.pointer.x - st.sp.x) * k; st.sp.y += (st.pointer.y - st.sp.y) * k;
    const on = lensAllowed() && st.pointer.active;
    const up = dt / LENS_ATTACK, down = dt / LENS_DECAY;
    let any = false;
    for (let r = 0, i = 0; r < L.rows; r++) {
      const cy = L.originY + (r + 0.5) * L.tile;
      for (let c = 0; c < L.cols; c++, i++) {
        let h = heat[i];
        let hot = false;
        if (on) {
          const cx = L.originX + (c + 0.5) * L.tile;
          const d = Math.hypot(cx - st.sp.x, cy - st.sp.y) / L.tile;
          hot = d < LENS_R * (0.85 + 0.3 * lensRand[i]);
        }
        h = hot ? Math.min(1, h + up) : Math.max(0, h - down);
        if (h !== heat[i]) any = true;
        heat[i] = h;
      }
    }
    if (any || st.heatDirty) { heatAttr.needsUpdate = true; st.heatDirty = any; }
  }
  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const r = canvas.getBoundingClientRect();
    st.pointer.x = e.clientX - r.left; st.pointer.y = e.clientY - r.top; st.pointer.active = true;
    if (!st.pointer.seen) { st.pointer.seen = true; st.sp.x = st.pointer.x; st.sp.y = st.pointer.y; }
  };
  const onLeave = () => { st.pointer.active = false; };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('mouseleave', onLeave);
  window.addEventListener('blur', onLeave);
  const onResize = () => resize(false);
  window.addEventListener('resize', onResize);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
  if (ro) ro.observe(canvas);

  // ----- intro -----
  function markRects() {
    const [, , vw, vh] = logo.viewBox;
    const a = lockupRect(st.W, st.H, vw, vh);           // the film's lockup: mark above, wordmark under
    const t = st.logoTarget;
    const b = t ? { cx: t.x + t.w / 2, cy: t.y + t.h / 2, s: Math.min(t.w / vw, t.h / vh) } : { cx: a.cx, cy: a.cy, s: a.s * 0.25 };
    return { a, b, vw, vh };
  }
  function fireUpTo(t) {
    const evs = [['mark-built', T.built], ['wall-start', T.wallA], ['logo-done', T.travelB], ['wall-done', T.wallB], ['live', T.total]];
    for (const [name, at] of evs) {
      if (t >= at && !st.introFired.has(name)) {
        st.introFired.add(name);
        if (name === 'live') { st.mode = 'live'; emit('live'); const r = st.introResolve; st.introResolve = null; if (r) r(); }
        else emit(name);
      }
    }
  }
  function applyIntro(t) {
    const rects = logo ? markRects() : null;
    st.logoOn = !!rects && st.mode === 'intro' && logo2d.update(t, { W: st.W, H: st.H, bufW: canvas.width, bufH: canvas.height, a: rects.a, b: rects.b });
    // wall
    const wallOn = t >= T.wallA;
    if (wall) wall.visible = wallOn;
    wallUniforms.uAsm.value = clamp01((t - T.wallA) / (T.wallB - T.wallA));
    fireUpTo(t);
  }
  function playIntro({ logoTargetRect, skip } = {}) {
    st.logoTarget = rectOf(logoTargetRect) || st.logoTarget;
    if (st.mode === 'intro' && st.introResolve) { if (skip) skipIntro(); return st.introPromise; }
    st.introTarget = st.front;
    st.introFired = new Set();
    st.introPromise = new Promise((res) => { st.introResolve = res; });
    if (skip || reduced) {
      st.mode = 'intro'; st.introSeek = T.total + 0.01;            // end state at once, events in order
      wallUniforms.uAsm.value = 1;
      if (reduced) st.fadeStart = performance.now();               // reduced motion: no flight, the wall fades in
      Promise.resolve().then(() => { for (const n of ['mark-built', 'logo-done', 'wall-start', 'wall-done']) { st.introFired.add(n); emit(n); } fireUpTo(T.total + 1); });
      return st.introPromise;
    }
    // never wait on the logo file: re-read it in the background (picks up a newer file on replay)
    fetchLogo().then((j) => { if (!st.destroyed) buildLogo(j); });
    st.mode = 'intro'; st.introStart = performance.now(); st.introSeek = null; st.introT = 0;
    return st.introPromise;
  }
  function skipIntro() {
    if (st.mode !== 'intro') return;
    st.introSeek = null; st.introStart = performance.now() - (T.total + 0.01) * 1000;
  }

  // ----- per-frame -----
  function frame(now) {
    if (st.destroyed) return;
    st.raf = requestAnimationFrame(frame);
    step(now);
  }
  function step(now) {
    const dt = Math.min(0.1, Math.max(0, (now - st.last) / 1000)); st.last = now;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    if (dpr !== st.dpr) resize(true);
    const u = wallUniforms;
    const want = new Set();
    if (st.mode === 'intro') {
      const t = st.introSeek != null ? st.introSeek : (now - st.introStart) / 1000;
      st.introT = t;
      applyIntro(t);
    }
    if (st.mode === 'intro') {
      const t = st.introT;
      const tgt = scenes[clamp(st.introTarget, 0, scenes.length - 1)];
      bindSlot('A', tgt, ink2C); bindSlot('B', tgt, null);
      u.uProg.value = clamp01((t - T.flipA) / (T.flipB - T.flipA));
      u.uStyle.value = 0; u.uXf.value = 0;
      if (tgt.film) want.add(tgt.film);   // start decoding at t = 0, while the screen is still ink: its warm-up never lands mid-flip
    } else if (st.mode === 'live') {
      if (wall) wall.visible = true;
      u.uAsm.value = 1;
      const f = st.front, p = st.prog, A = scenes[f], B = scenes[Math.min(f + 1, scenes.length - 1)];
      bindSlot('A', A, null); bindSlot('B', B, null);
      if (A.film) want.add(A.film); if (p > 0 && B.film) want.add(B.film);
      if (B.film) B.film.start();   // speed: the next scene's film downloads while this one plays
      if (reduced) { u.uStyle.value = 3; u.uProg.value = 0; u.uXf.value = p * p * (3 - 2 * p); }
      else {
        const style = st.styles[f] || 'diagonal';
        u.uStyle.value = STYLE_ID[style] ?? 0; u.uProg.value = p; u.uXf.value = 0;
        if (style === 'radial') {
          if (p > 0 && st.radial.for !== f) { st.radial.for = f; st.radial.x = st.pointer.seen ? st.sp.x : st.W / 2; st.radial.y = st.pointer.seen ? st.sp.y : st.H / 2; }
          if (p === 0) st.radial.for = -1;
          u.uRad.value.set(st.radial.x, st.radial.y);
          u.uRadMax.value = Math.max(...[[0, 0], [st.W, 0], [0, st.H], [st.W, st.H]].map(([x, y]) => Math.hypot(x - st.radial.x, y - st.radial.y)), 1);
        }
      }
    }
    u.uFade.value = st.fadeStart ? clamp01((now - st.fadeStart) / 700) : 1;
    const fresh = playSet(want);
    updateLens(dt);
    emit('frame', { time: now / 1000, dt });
    const D = st.drawn || (st.drawn = { front: -1, prog: -1, W: 0, H: 0, fade: -1 });
    if (IDLE_SKIP && st.mode === 'live' && !fresh && !st.fallback && D.front === st.front && D.prog === st.prog
        && D.W === st.W && D.H === st.H && D.fade === 1 && u.uFade.value === 1) return;   // nothing changed: keep the last frame
    st.drawn = { front: st.front, prog: st.prog, W: st.W, H: st.H, fade: u.uFade.value };
    renderer.clear();
    if (st.fallback && st.mode === 'live') {
      const f = st.front, p = st.prog;
      bindFb('A', scenes[f]); bindFb('B', scenes[Math.min(f + 1, scenes.length - 1)]);
      fbUniforms.uXf.value = p * p * (3 - 2 * p);
      renderer.render(fbScene, camera);
    } else {
      renderer.render(wallScene, camera);
      if (st.mode === 'live') selfTest(now);
    }
    if (st.mode === 'intro' && st.logoOn) logo2d.render();
  }

  resize(true);
  // read the logo file now (max 1.2 s; the stand-in covers a missing or slow file)
  buildLogo(await Promise.race([fetchLogo(), new Promise((r) => setTimeout(() => r(STANDIN_LOGO), 1200))]));
  // compile the wall + fallback programs now (the wall is hidden until wall-start; compile() skips hidden meshes)
  if (wall) { const v = wall.visible; wall.visible = true; try { renderer.compile(wallScene, camera); renderer.compile(fbScene, camera); } catch (e) { /* first draw compiles */ } wall.visible = v; }
  st.raf = requestAnimationFrame(frame);

  const stage = {
    playIntro, skipIntro,
    // test harness: scrub the intro to t seconds (null resumes real time from there)
    seekIntro(t, logoTargetRect) {
      if (logoTargetRect) st.logoTarget = rectOf(logoTargetRect) || st.logoTarget;
      if (st.mode !== 'intro' && t != null) { st.introFired = new Set(); st.mode = 'intro'; }
      st.introSeek = t; if (t == null) st.introStart = performance.now() - st.introT * 1000;
    },
    on(name, cb) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(cb); return () => listeners.get(name).delete(cb); },
    setScenePosition(s) {
      const n = scenes.length;
      s = clamp(+s || 0, 0, n - 1); st.s = s;
      let f = Math.floor(s), p = s - f;
      if (f >= n - 1) { f = n - 1; p = 0; }
      st.front = f; st.prog = p;
    },
    setFlipStyle(i, style) { if (STYLE_ID[style] != null && i >= 0) st.styles[i] = style; },
    setLensEnabled(b) { st.lensOn = !!b; },
    get lens() { return lens; },
    get tileCount() { return st.L ? st.L.cols * st.L.rows : 0; },
    get introTime() { return st.introT; },
    debug() {
      return { mode: st.mode, fallback: st.fallback, front: st.front, prog: st.prog, dpr: st.dpr, canvas: [canvas.width, canvas.height], test: { ...st.test },
        films: [...films.values()].map((m) => ({ url: m.url, ready: m.ready, failed: m.failed, blocked: m.blocked, uploads: m.uploads, paused: m.video.paused, rs: m.video.readyState, t: +m.video.currentTime.toFixed(2) })),
        posters: [...posters.values()].map((m) => ({ url: m.url, loaded: !!m.tex, failed: m.failed })) };
    },
    renderOnce() { step(performance.now()); },
    setFallback(b) { st.fallback = !!b; st.test = { front: -1, passes: b ? 99 : 0, fails: 0, last: 0 }; },
    get logoIsStandIn() { return !!(logo && logo.standin); },
    destroy() {
      st.destroyed = true; cancelAnimationFrame(st.raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      for (const m of films.values()) { m.video.pause(); m.video.removeAttribute('src'); m.video.load(); if (m.tex) m.tex.dispose(); }
      for (const m of posters.values()) if (m.tex) m.tex.dispose();
      if (wall) wall.geometry.dispose();
      logo2d.dispose();
      wallMat.dispose(); fbMat.dispose(); blank.dispose();
      renderer.dispose();
      listeners.clear();
    },
  };
  return stage;
}
