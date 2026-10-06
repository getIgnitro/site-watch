/* KN website v5 — stage/logo3d.js — the logo intro as a live 3D product shot (BUILD_BOOK Amendment 2, B8).
 * Used only by stage.js: one scene + one camera, drawn over the wall during the intro.
 *   Geometry  exact from kn-build-mark.json. K = three extruded slabs with a small bevel (the two arms fuse
 *             into one chevron once seated); N = its rounded blocks, real depth 0.6 of the side, json `order`.
 *   Look      MeshPhysicalMaterial (matte ceramic + light clearcoat), a soft studio environment (PMREM of an
 *             emissive softbox room), key light upper left, periwinkle rim from the right, ACES, sRGB.
 *   Shadow    analytic soft shadows on a dark matte back wall one block depth behind the mark; the penumbra
 *             grows with the caster's height, so every landing tightens its own shadow. Contact darkening
 *             on block sides that face a neighbour.
 *   Focus     blocks in front of the focal plane are drawn as soft impostors whose blur follows their depth;
 *             the real mesh takes over as they land (no full-screen pass).
 *   Resolve   depth collapses, shading converges on the exact flat fills (sRGB), the mark travels to the
 *             top-bar rect; stage.js hands over to the DOM <img>.
 */
import * as THREE from 'three';

// Intro timeline, seconds. stage.js fires its events from these (order: wall-start, logo-done, wall-done, live).
export const INTRO = {
  lightA: 0.00, lightB: 0.60,                 // studio light comes up on the back wall
  kStart: 0.10, kStagger: 0.15, kDur: 0.84,   // stem, upper arm, lower arm
  fuse: 1.26,                                 // arms fuse into one chevron
  nStart: 0.66, nSpan: 1.08, nDur: 0.50,      // N blocks in json order (accelerating)
  lastGap: 0.12, lastDur: 0.60, cool: 0.35,   // the last block arrives in signal orange, then cools
  camB: 2.46,                                 // push-in + parallax end square-on
  sweepA: 2.46, sweepB: 2.98,                 // hold: one light sweep
  flatA: 2.98, flatB: 3.28,                   // depth collapses, light flattens to the fills
  bgA: 2.96, bgB: 3.16,                       // back wall + shadows fade to ink, then leave
  travelA: 3.10, travelB: 3.62, fadeB: 3.70,  // to the top-bar rect; DOM takes over at travelB
  wallA: 3.14, wallB: 3.98, flipA: 3.52, flipB: 4.20, total: 4.20,
};

const LOOK = Object.assign({
  // tone: Khronos PBR Neutral, not ACES: ACES washed the periwinkle to grey-white (probe 201,214,232 for #9CBEFE);
  // Neutral holds the true fills at the hold (163,191,246), so the resolve to the flat vector is seamless.
  tone: 'neutral', exposure: 1.0, env: 0.55, key: 1.25, keyDecay: 0.7, rim: 1.1, sheen: 3.2,
  pool: [0.058, 0.055, 0.052], sweep: 13.0, sweepW: 0.13, rough: 0.5, cc: 0.6, ccRough: 0.2,
}, (typeof globalThis !== 'undefined' && globalThis.__KN_LOOK) || {});
const TONE = { aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping, agx: THREE.AgXToneMapping }[LOOK.tone] || THREE.ACESFilmicToneMapping;
const EXPOSURE = LOOK.exposure;
const DEPTH_K = 0.6;          // block depth / block side
const KEY_DIR = [-0.55, 0.62, 1.0];   // towards the key light (upper left, front)
const BLUR_K = 0.12;          // defocus: sigma (vb) = BLUR_K * mark height * z / D
const SIG_HI = 1.7, SIG_LO = 0.35;    // impostor -> mesh hand-over window (sigma, vb units)

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const outQuart = (x) => 1 - Math.pow(1 - clamp01(x), 4);
const outCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const inOutCubic = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const inOutSine = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
const expoInOut = (t) => t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
// weighted settle 0 -> 1: fast approach, an overshoot of `ov` along depth only, the last 15 % slow. Never elastic.
function settle(f, ov) {
  if (f <= 0) return 0; if (f >= 1) return 1;
  const a = 0.85;
  if (f < a) return (1 + ov) * outQuart(f / a);
  const v = (f - a) / (1 - a); return 1 + ov * (1 - v * v * (3 - 2 * v));
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const srgb = (hex) => { const c = new THREE.Color(); c.setStyle(hex, THREE.SRGBColorSpace); return c.convertLinearToSRGB(); };
const lin = (hex) => { const c = new THREE.Color(); c.setStyle(hex, THREE.SRGBColorSpace); return c; };

// rounded box, front face at z = 0 (same construction as three's RoundedBoxGeometry)
function roundedBox(w, h, d, r, seg = 3) {
  const n = seg * 2 + 1;
  const g = new THREE.BoxGeometry(1, 1, 1, n, n, n);
  g.deleteAttribute('uv');
  const pos = g.attributes.position, nor = g.attributes.normal;
  const half = 0.5 / n, bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r;
  const v = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    q.set(v.x - Math.sign(v.x) * half, v.y - Math.sign(v.y) * half, v.z - Math.sign(v.z) * half).normalize();
    pos.setXYZ(i, bx * Math.sign(v.x) + q.x * r, by * Math.sign(v.y) + q.y * r, bz * Math.sign(v.z) + q.z * r - d / 2);
    nor.setXYZ(i, q.x, q.y, q.z);
  }
  return g;
}
// smooth normals across angles under `deg`, keep real creases (non-indexed geometry)
function creaseNormals(geo, deg) {
  const p = geo.attributes.position, n = p.count, cosA = Math.cos(deg * Math.PI / 180);
  const fw = new Float32Array(n), fu = new Float32Array(n);   // per-triangle weighted / unit normals (3 per tri)
  const map = new Map(), key = (i) => `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let f = 0; f < n / 3; f++) {
    a.fromBufferAttribute(p, f * 3); b.fromBufferAttribute(p, f * 3 + 1); c.fromBufferAttribute(p, f * 3 + 2);
    c.sub(b); b.sub(a); b.cross(c);
    fw[f * 3] = b.x; fw[f * 3 + 1] = b.y; fw[f * 3 + 2] = b.z;
    const l = b.length() || 1; fu[f * 3] = b.x / l; fu[f * 3 + 1] = b.y / l; fu[f * 3 + 2] = b.z / l;
    for (let k = 0; k < 3; k++) { const kk = key(f * 3 + k); if (!map.has(kk)) map.set(kk, []); map.get(kk).push(f); }
  }
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const f0 = Math.floor(i / 3); let x = 0, y = 0, z = 0;
    for (const f of map.get(key(i))) {
      if (fu[f * 3] * fu[f0 * 3] + fu[f * 3 + 1] * fu[f0 * 3 + 1] + fu[f * 3 + 2] * fu[f0 * 3 + 2] >= cosA) { x += fw[f * 3]; y += fw[f * 3 + 1]; z += fw[f * 3 + 2]; }
    }
    const l = Math.hypot(x, y, z) || 1; out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
}
const polyArea = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length]; s += x0 * y1 - x1 * y0; } return s / 2; };
// union of two polygons that share one edge (the two K arms) -> one outline, or null
function mergeShared(A0, B0, tol = 0.05) {
  const nrm = (p) => polyArea(p) < 0 ? [...p].reverse() : [...p];
  const A = nrm(A0), B = nrm(B0), nA = A.length, nB = B.length;
  const eq = (p, q) => Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol;
  for (let i = 0; i < nA; i++) for (let j = 0; j < nB; j++) {
    if (eq(A[i], B[(j + 1) % nB]) && eq(A[(i + 1) % nA], B[j])) {
      const out = [];
      for (let k = 1; k <= nA; k++) out.push(A[(i + k) % nA]);
      for (let k = 2; k < nB; k++) out.push(B[(j + k) % nB]);
      return out;
    }
  }
  return null;
}

const GLSL_SOFT = /* glsl */`
float knPhi(float x){ return 1.0 / (1.0 + exp(-1.702 * x)); }
float knRoundBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void knEdge(vec2 p, vec2 vi, vec2 vj, inout float d, inout float s){
  vec2 e = vj - vi, w = p - vi;
  vec2 b = w - e * clamp(dot(w, e) / max(dot(e, e), 1e-6), 0.0, 1.0);
  d = min(d, dot(b, b));
  bool c1 = p.y >= vi.y, c2 = p.y < vj.y, c3 = e.x * w.y > e.y * w.x;
  if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
}
float knQuad(vec2 p, vec2 v0, vec2 v1, vec2 v2, vec2 v3){
  float d = dot(p - v0, p - v0), s = 1.0;
  knEdge(p, v0, v3, d, s); knEdge(p, v1, v0, d, s); knEdge(p, v2, v1, d, s); knEdge(p, v3, v2, d, s);
  return s * sqrt(d);
}`;

export function createLogo3D(renderer, opts = {}) {
  const ink = opts.ink || '#0B0B0C', signal = opts.signal || '#FF4B14', peri = opts.peri || '#8FA2FF';
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 1, 10000);
  const group = new THREE.Group();
  scene.add(group);

  // ----- studio environment (soft boxes in a dark room) -----
  const pm = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const envDispose = [];
  const room = new THREE.Mesh(new THREE.BoxGeometry(26, 18, 26), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.010, 0.010, 0.011), side: THREE.BackSide }));
  envScene.add(room); envDispose.push(room);
  const panel = (w, h, col, k, p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: lin(col).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0, 0); envScene.add(m); envDispose.push(m);
  };
  panel(8, 6, '#ffffff', 5.0, [-7, 6, 8]);         // key softbox, upper left front
  panel(1.6, 11, peri, 6.0, [10, 0.5, -2.5]);       // periwinkle strip, right, slightly behind
  panel(14, 3, '#fff4e8', 1.0, [0, 8.5, 1.5]);      // overhead fill
  panel(18, 5, '#ffffff', LOOK.sheen, [0, 3.0, 11.5]);  // wide softbox above the camera: the sheen on the front faces
  panel(12, 5, '#ffffff', 0.25, [2, -3, 12]);       // weak low front fill
  panel(16, 3, '#ffffff', 0.08, [0, -8.5, 2]);      // floor bounce
  const envRT = pm.fromScene(envScene, 0.03);
  pm.dispose();
  for (const m of envDispose) { m.geometry.dispose(); m.material.dispose(); }
  scene.environment = envRT.texture;
  scene.environmentIntensity = LOOK.env;

  // key: a point source upper left (gentle falloff across the mark), rim: periwinkle from behind right
  const key = new THREE.PointLight('#fff8f0', 1, 0, LOOK.keyDecay);
  const rim = new THREE.DirectionalLight(peri, LOOK.rim); rim.position.set(1.0, 0.22, -0.9);
  scene.add(key, rim);

  // ----- shared uniforms for the block materials -----
  const U = {
    uFlat: { value: 0 }, uAO: { value: 0.6 }, uDepth: { value: 18 },
    uSweep: { value: new THREE.Vector4(0, 1, 1000, 0) }, uSweepH: { value: 1000 },
    uSweepCol: { value: new THREE.Color(1.0, 0.985, 0.97) }, uSignal: { value: lin(signal) },
    uG1: { value: new THREE.Vector2() }, uG2: { value: new THREE.Vector2(1, 0) },
    uGc1: { value: new THREE.Vector3(1, 1, 1) }, uGc2: { value: new THREE.Vector3(1, 1, 1) },
  };
  function blockMaterial(kind) {
    const m = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: LOOK.rough, metalness: 0, clearcoat: LOOK.cc, clearcoatRoughness: LOOK.ccRough,
      vertexColors: kind === 'k',
    });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.defines = sh.defines || {};
      if (kind === 'n') sh.defines.KN_N = '';
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
varying vec3 vKWP; varying vec3 vKOP; varying vec3 vKON; varying vec3 vKFlat; varying vec4 vKNb; varying float vKHeat;
#ifdef KN_N
attribute vec3 aFlat; attribute vec4 aNb; attribute float aHeat;
#else
attribute vec2 aVb; uniform vec2 uG1; uniform vec2 uG2; uniform vec3 uGc1; uniform vec3 uGc2;
#endif`).replace('#include <project_vertex>', `#include <project_vertex>
vKOP = position; vKON = normal;
{ vec4 wq = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  wq = instanceMatrix * wq;
#endif
  vKWP = (modelMatrix * wq).xyz; }
#ifdef KN_N
vKFlat = aFlat; vKNb = aNb; vKHeat = aHeat;
#else
{ vec2 gd = uG2 - uG1; float gt = clamp(dot(aVb - uG1, gd) / max(dot(gd, gd), 1e-6), 0.0, 1.0); vKFlat = mix(uGc1, uGc2, gt); }
vKNb = vec4(0.0); vKHeat = 0.0;
#endif`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vKWP; varying vec3 vKOP; varying vec3 vKON; varying vec3 vKFlat; varying vec4 vKNb; varying float vKHeat;
uniform float uFlat; uniform float uAO; uniform float uDepth; uniform vec4 uSweep; uniform float uSweepH; uniform vec3 uSweepCol; uniform vec3 uSignal;`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += uSignal * vKHeat;`)
        .replace('#include <aomap_fragment>', `#include <aomap_fragment>
#ifdef KN_N
{ // contact darkening: block sides that face a neighbour, deeper = darker
  vec3 on = normalize(vKON);
  float w = dot(vKNb, vec4(max(-on.x, 0.0), max(on.x, 0.0), max(on.y, 0.0), max(-on.y, 0.0)));
  float deep = clamp(-vKOP.z / max(uDepth, 1e-3), 0.0, 1.0);
  float occ = 1.0 - uAO * w * mix(0.45, 1.0, deep);
  reflectedLight.indirectDiffuse *= occ; reflectedLight.indirectSpecular *= occ;
  reflectedLight.directDiffuse *= mix(1.0, occ, 0.7); reflectedLight.directSpecular *= occ;
#ifdef USE_CLEARCOAT
  clearcoatSpecularIndirect *= occ; clearcoatSpecularDirect *= occ;
#endif
}
#endif`)
        .replace('#include <opaque_fragment>', `{ // one strip light sweeping left to right: its reflection slides across faces and bevels
  vec3 Nw = inverseTransformDirection(normal, viewMatrix);
  vec3 I = normalize(vKWP - cameraPosition);
  vec3 R = reflect(I, Nw);
  float band = 0.0;
  if (uSweep.w > 0.0 && R.z > 0.02) {
    vec3 hp = vKWP + R * ((uSweep.z - vKWP.z) / R.z);
    float dx = (hp.x - uSweep.x - hp.y * 0.24) / uSweep.y;
    band = exp(-dx * dx) * (1.0 - smoothstep(uSweepH * 0.55, uSweepH, abs(hp.y)));
  }
  float fr = 0.06 + 0.94 * pow(1.0 - clamp(dot(Nw, -I), 0.0, 1.0), 5.0);
  outgoingLight += uSweepCol * band * fr * uSweep.w;
}
#include <opaque_fragment>`)
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
gl_FragColor.rgb = mix(gl_FragColor.rgb, vKFlat, uFlat);`);
    };
    m.customProgramCacheKey = () => 'kn3d-' + kind;
    return m;
  }
  const matN = blockMaterial('n'), matK = blockMaterial('k');

  // ----- back wall (dark matte, a soft pool of key light) -----
  const wallU = {
    uSize: { value: new THREE.Vector2(1000, 1000) }, uInkS: { value: srgb(ink) }, uPoolS: { value: new THREE.Color(LOOK.pool[0], LOOK.pool[1], LOOK.pool[2]) },
    uPool: { value: new THREE.Vector4(0, 0, 500, 500) }, uLight: { value: 0 },
  };
  const wallMat = new THREE.ShaderMaterial({
    uniforms: wallU, depthWrite: true,
    vertexShader: `uniform vec2 uSize; varying vec2 vP; void main(){ vP = position.xy * uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(vP, 0.0, 1.0); }`,
    fragmentShader: `uniform vec3 uInkS; uniform vec3 uPoolS; uniform vec4 uPool; uniform float uLight; varying vec2 vP;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 q = (vP - uPool.xy) / uPool.zw;
        float pool = exp(-dot(q, q)) * uLight;
        vec3 c = uInkS + uPoolS * pool;
        c += (hash(gl_FragCoord.xy) - 0.5) * (1.6 / 255.0) * smoothstep(0.0, 0.06, pool);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  wallMat.toneMapped = false;
  const wallMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wallMat);
  wallMesh.frustumCulled = false; wallMesh.renderOrder = -2;
  group.add(wallMesh);

  // ----- shadow quads (analytic soft coverage, blended to ink so they only remove the pool light) -----
  const shadowMat = new THREE.ShaderMaterial({
    uniforms: { uZ: { value: 0 }, uInkS: { value: srgb(ink) }, uOn: { value: 1 } },
    transparent: true, depthWrite: false, depthTest: true,
    vertexShader: `attribute vec4 aA; attribute vec4 aB; attribute vec2 aS; uniform float uZ;
      varying vec2 vP; varying vec4 vA; varying vec4 vB; varying vec2 vS;
      void main(){
        if (aS.y <= 0.0) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        vec2 mn = min(min(aA.xy, aA.zw), min(aB.xy, aB.zw)) - 3.0 * aS.x;
        vec2 mx = max(max(aA.xy, aA.zw), max(aB.xy, aB.zw)) + 3.0 * aS.x;
        vec2 p = mix(mn, mx, position.xy + 0.5);
        vP = p; vA = aA; vB = aB; vS = aS;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, uZ, 1.0);
      }`,
    fragmentShader: `uniform vec3 uInkS; uniform float uOn; varying vec2 vP; varying vec4 vA; varying vec4 vB; varying vec2 vS;
      ${GLSL_SOFT}
      void main(){
        float d = knQuad(vP, vA.xy, vA.zw, vB.xy, vB.zw);
        float a = vS.y * uOn * knPhi(-d / max(vS.x, 0.5));
        gl_FragColor = vec4(uInkS, a);
      }`,
  });
  shadowMat.toneMapped = false;

  // ----- out-of-focus impostors -----
  const sprNMat = new THREE.ShaderMaterial({
    uniforms: { uRad: { value: 4 }, uGain: { value: 1 } },
    transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `attribute vec4 aP; attribute vec4 aQ; attribute vec3 aC;
      varying vec2 vL; varying float vH; varying vec4 vQ; varying vec3 vC;
      void main(){
        if (aQ.z <= 0.002) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        float ext = aP.w + 3.0 * aQ.y;
        vec2 c = position.xy * 2.0 * ext;
        float cs = cos(aQ.x), sn = sin(aQ.x);
        vec2 r = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
        vL = c; vH = aP.w; vQ = aQ; vC = aC;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(aP.xy + r, aP.z, 1.0);
      }`,
    fragmentShader: `uniform float uRad; uniform float uGain; varying vec2 vL; varying float vH; varying vec4 vQ; varying vec3 vC;
      ${GLSL_SOFT}
      void main(){
        float d = knRoundBox(vL, vec2(vH), min(uRad, vH));
        float s = max(vQ.y, fwidth(d) * 0.6);
        float cov = knPhi(-d / s);
        vec2 n = vL / max(vH, 1e-3);
        float g = clamp(0.5 + 0.35 * (-n.x + n.y), 0.0, 1.0);
        vec3 col = vC * uGain * vQ.w * (0.78 + 0.36 * g);
        gl_FragColor = vec4(col, cov * vQ.z);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sprKMat = new THREE.ShaderMaterial({
    uniforms: { uGain: { value: 1 }, uG1: U.uG1, uG2: U.uG2, uGl1: { value: new THREE.Color() }, uGl2: { value: new THREE.Color() } },
    transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `attribute vec4 aP; attribute vec4 aA; attribute vec4 aB; attribute vec4 aQ; attribute vec2 aCV;
      varying vec2 vL; varying vec4 vA; varying vec4 vB; varying vec4 vQ; varying vec2 vVb;
      void main(){
        if (aQ.y <= 0.002) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
        vec2 mn = min(min(aA.xy, aA.zw), min(aB.xy, aB.zw)) - 3.0 * aQ.x;
        vec2 mx = max(max(aA.xy, aA.zw), max(aB.xy, aB.zw)) + 3.0 * aQ.x;
        vec2 c = mix(mn, mx, position.xy + 0.5);
        float cs = cos(aP.w), sn = sin(aP.w);
        vec2 r = vec2(c.x * cs - c.y * sn, c.x * sn + c.y * cs);
        vL = c; vA = aA; vB = aB; vQ = aQ; vVb = vec2(aCV.x + c.x, aCV.y - c.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(aP.xy + r, aP.z, 1.0);
      }`,
    fragmentShader: `uniform float uGain; uniform vec2 uG1; uniform vec2 uG2; uniform vec3 uGl1; uniform vec3 uGl2;
      varying vec2 vL; varying vec4 vA; varying vec4 vB; varying vec4 vQ; varying vec2 vVb;
      ${GLSL_SOFT}
      void main(){
        float d = knQuad(vL, vA.xy, vA.zw, vB.xy, vB.zw);
        float s = max(vQ.x, fwidth(d) * 0.6);
        float cov = knPhi(-d / s);
        vec2 gd = uG2 - uG1; float gt = clamp(dot(vVb - uG1, gd) / max(dot(gd, gd), 1e-6), 0.0, 1.0);
        vec3 col = mix(uGl1, uGl2, gt) * uGain * vQ.z;
        gl_FragColor = vec4(col, cov * vQ.y);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { uCol: { value: srgb(signal) }, uI: { value: 0 } },
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vU; void main(){ vU = position.xy * 2.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uCol; uniform float uI; varying vec2 vU; void main(){ float a = exp(-dot(vU, vU) * 3.4) * uI; gl_FragColor = vec4(uCol * a, 1.0); }`,
  });
  haloMat.toneMapped = false;
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), haloMat);
  halo.frustumCulled = false; halo.renderOrder = 6; halo.visible = false;
  group.add(halo);

  // ----- built per logo -----
  let L = null;   // everything derived from the json
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), tmpP = new THREE.Vector3(), tmpS = new THREE.Vector3();
  const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();

  function clearBuilt() {
    if (!L) return;
    for (const o of L.objects) { group.remove(o); o.geometry.dispose(); }
    L = null;
  }

  function build(j) {
    clearBuilt();
    const [vx, vy, vw, vh] = j.viewBox;
    const cx = vx + vw / 2, cy = vy + vh / 2;
    const colors = j.colors || {};
    const resolve = (f) => (typeof f === 'string' && f[0] === '#') ? f : (colors[f] || peri);
    const nb = [...(j.n && j.n.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const sizes = nb.map((b) => +b.s || 0).filter((x) => x > 0).sort((a, b) => a - b);
    const bsz = sizes.length ? sizes[sizes.length >> 1] : vw / 24;
    const pitch = +(j.n && j.n.pitch) || bsz * 1.2;
    const depth = bsz * DEPTH_K;
    const rad = nb.length ? Math.max(Math.min(+nb[0].r || 0, bsz * 0.45), bsz * 0.06) : bsz * 0.12;
    const wallZ = -2 * depth;               // the mark floats one block depth in front of the wall
    const objects = [];
    const R = mulberry32(9157);

    // K gradient (userSpace or bbox fractions, like the SVG)
    const polys = (j.k && j.k.polygons) || [];
    let kx0 = Infinity, ky0 = Infinity, kx1 = -Infinity, ky1 = -Infinity;
    for (const p of polys) for (const [x, y] of p) { kx0 = Math.min(kx0, x); ky0 = Math.min(ky0, y); kx1 = Math.max(kx1, x); ky1 = Math.max(ky1, y); }
    const kf = (j.k && j.k.fill) || {};
    const stops = Array.isArray(kf.stops) && kf.stops.length ? kf.stops : [[0, colors.white || '#FFFFFF'], [1, colors.periLight || peri]];
    const fracG = [kf.x1, kf.y1, kf.x2, kf.y2].every((v) => v != null && +v >= 0 && +v <= 1);
    const GX = (v, d) => fracG ? kx0 + (+(v ?? d)) * (kx1 - kx0) : +(v ?? d), GY = (v, d) => fracG ? ky0 + (+(v ?? d)) * (ky1 - ky0) : +(v ?? d);
    const g1 = [GX(kf.x1, 0), GY(kf.y1, 0)], g2 = [GX(kf.x2, 1), GY(kf.y2, 0)];
    const c1 = resolve(stops[0][1]), c2 = resolve(stops[stops.length - 1][1]);
    U.uG1.value.set(g1[0], g1[1]); U.uG2.value.set(g2[0], g2[1]);
    const s1 = srgb(c1), s2 = srgb(c2);
    U.uGc1.value.set(s1.r, s1.g, s1.b); U.uGc2.value.set(s2.r, s2.g, s2.b);
    sprKMat.uniforms.uGl1.value.copy(lin(c1)); sprKMat.uniforms.uGl2.value.copy(lin(c2));
    const gradLin = (x, y) => {
      const dx = g2[0] - g1[0], dy = g2[1] - g1[1], t = clamp01(((x - g1[0]) * dx + (y - g1[1]) * dy) / (dx * dx + dy * dy || 1));
      // the SVG interpolates in sRGB: mix there, then linearise for the albedo
      return new THREE.Color(lerp(s1.r, s2.r, t), lerp(s1.g, s2.g, t), lerp(s1.b, s2.b, t)).convertSRGBToLinear();
    };
    // K slab geometry: polygon (vb) -> extruded slab centred on its own centroid, front face at z = 0
    const bt = Math.min(depth * 0.25, bsz * 0.15);
    const slabGeo = (poly) => {
      let px = 0, py = 0; for (const [x, y] of poly) { px += x; py += y; } px /= poly.length; py /= poly.length;
      const sh = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x - px, -(y - py))));
      const g = new THREE.ExtrudeGeometry(sh, { depth: Math.max(depth - 2 * bt, 0.5), bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelOffset: -bt, bevelSegments: 3, steps: 1, curveSegments: 1 });
      g.deleteAttribute('uv');
      g.translate(0, 0, -(Math.max(depth - 2 * bt, 0.5) + bt));
      const pos = g.attributes.position, vb = new Float32Array(pos.count * 2), col = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) + px, y = py - pos.getY(i);
        vb[i * 2] = x; vb[i * 2 + 1] = y;
        const c = gradLin(x, y); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      g.setAttribute('aVb', new THREE.BufferAttribute(vb, 2));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      creaseNormals(g, 40);
      return { g, px, py };
    };
    const slabs = polys.map((poly, i) => {
      const { g, px, py } = slabGeo(poly);
      const mesh = new THREE.Mesh(g, matK); mesh.frustumCulled = false; mesh.visible = false;
      group.add(mesh); objects.push(mesh);
      const lx = px - cx, ly = cy - py;
      const corners = poly.length === 4 ? poly.map(([x, y]) => [x - px, -(y - py)]) : null;
      const dir = Math.hypot(lx, ly) > 1 ? [lx / Math.hypot(lx, ly), ly / Math.hypot(lx, ly)] : [-1, 0];
      return {
        mesh, x: lx, y: ly, vbx: px, vby: py, corners,
        t0: INTRO.kStart + i * INTRO.kStagger, dur: INTRO.kDur,
        z0: 0.40 + 0.04 * i,                                   // fraction of D
        ax: dir[0] * vh * 0.05 + (R() - 0.5) * vh * 0.04, ay: dir[1] * vh * 0.05 + (R() - 0.5) * vh * 0.04,
        rx: (R() - 0.5) * 0.12, ry: (R() - 0.5) * 0.16, rz: (R() - 0.5) * 0.10,
        size: Math.min(kx1 - kx0, bsz * 3),
      };
    });
    // the two arms fuse into one chevron once seated (they share an edge in the real mark)
    let chevron = null;
    if (polys.length === 3) {
      const u = mergeShared(polys[1], polys[2]);
      if (u) {
        const { g, px, py } = slabGeo(u);
        const mesh = new THREE.Mesh(g, matK); mesh.frustumCulled = false; mesh.visible = false;
        mesh.position.set(px - cx, cy - py, 0);
        group.add(mesh); objects.push(mesh);
        chevron = { mesh };
      }
    }
    // N blocks
    const nN = nb.length;
    const geoN = roundedBox(bsz, bsz, depth, rad, 3);
    const flat = new Float32Array(nN * 3), nbF = new Float32Array(nN * 4), heat = new Float32Array(nN);
    geoN.setAttribute('aFlat', new THREE.InstancedBufferAttribute(flat, 3));
    geoN.setAttribute('aNb', new THREE.InstancedBufferAttribute(nbF, 4));
    const heatAttr = new THREE.InstancedBufferAttribute(heat, 1); heatAttr.setUsage(THREE.DynamicDrawUsage);
    geoN.setAttribute('aHeat', heatAttr);
    const meshN = new THREE.InstancedMesh(geoN, matN, Math.max(nN, 1));
    meshN.count = nN; meshN.frustumCulled = false; meshN.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(meshN); objects.push(meshN);
    const cells = new Set(), cellOf = (b) => [Math.round((b.x + (+b.s || bsz) / 2) / pitch), Math.round((b.y + (+b.s || bsz) / 2) / pitch)];
    for (const b of nb) cells.add(cellOf(b).join(','));
    const blocks = nb.map((b, k) => {
      const s = +b.s || bsz, bx = b.x + s / 2, by = b.y + s / 2;
      const fill = resolve(b.fill), fs = srgb(fill);
      flat.set([fs.r, fs.g, fs.b], k * 3);
      const [gc, gr] = cellOf(b);
      nbF.set([cells.has(`${gc - 1},${gr}`) ? 1 : 0, cells.has(`${gc + 1},${gr}`) ? 1 : 0, cells.has(`${gc},${gr - 1}`) ? 1 : 0, cells.has(`${gc},${gr + 1}`) ? 1 : 0], k * 4);
      meshN.setColorAt(k, lin(fill));
      const last = k === nN - 1;
      const u = nN > 2 ? k / (nN - 2) : 0;
      const t0 = last ? INTRO.nStart + INTRO.nSpan + INTRO.lastGap : INTRO.nStart + INTRO.nSpan * (0.5 * u + 0.5 * (1 - (1 - u) * (1 - u)));
      const lx = bx - cx, ly = cy - by, ang = R() * Math.PI * 2;
      const turn = (0.35 + 0.65 * R()) * (Math.PI / 2) * (R() < 0.5 ? -1 : 1);
      return {
        x: lx, y: ly, s, fill, lin: lin(fill), last,
        t0, dur: last ? INTRO.lastDur : INTRO.nDur,
        z0: last ? 0.36 : 0.26 + 0.12 * R(),
        ax: Math.cos(ang) * vh * (0.03 + 0.04 * R()), ay: Math.sin(ang) * vh * (0.03 + 0.04 * R()),
        rx: (R() - 0.5) * 0.5, ry: (R() - 0.5) * 0.5, rz: last ? Math.PI / 2 * 0.6 : turn,
      };
    });
    meshN.instanceColor.setUsage(THREE.DynamicDrawUsage);
    // shadows: one quad per caster (K slabs + N blocks)
    const nS = slabs.length + nN;
    const shGeo = new THREE.InstancedBufferGeometry();
    const pg = new THREE.PlaneGeometry(1, 1);
    shGeo.index = pg.index; shGeo.setAttribute('position', pg.attributes.position);
    const shA = new THREE.InstancedBufferAttribute(new Float32Array(nS * 4), 4), shB = new THREE.InstancedBufferAttribute(new Float32Array(nS * 4), 4), shS = new THREE.InstancedBufferAttribute(new Float32Array(nS * 2), 2);
    for (const a of [shA, shB, shS]) a.setUsage(THREE.DynamicDrawUsage);
    shGeo.setAttribute('aA', shA); shGeo.setAttribute('aB', shB); shGeo.setAttribute('aS', shS);
    shGeo.instanceCount = nS;
    const shadows = new THREE.Mesh(shGeo, shadowMat); shadows.frustumCulled = false; shadows.renderOrder = 1;
    group.add(shadows); objects.push(shadows);
    shadowMat.uniforms.uZ.value = wallZ + 0.4;
    // impostors
    const spGeo = new THREE.InstancedBufferGeometry(); spGeo.index = pg.index; spGeo.setAttribute('position', pg.attributes.position);
    const spP = new THREE.InstancedBufferAttribute(new Float32Array(nN * 4), 4), spQ = new THREE.InstancedBufferAttribute(new Float32Array(nN * 4), 4), spC = new THREE.InstancedBufferAttribute(new Float32Array(nN * 3), 3);
    for (const a of [spP, spQ, spC]) a.setUsage(THREE.DynamicDrawUsage);
    spGeo.setAttribute('aP', spP); spGeo.setAttribute('aQ', spQ); spGeo.setAttribute('aC', spC); spGeo.instanceCount = nN;
    const sprN = new THREE.Mesh(spGeo, sprNMat); sprN.frustumCulled = false; sprN.renderOrder = 5;
    group.add(sprN); objects.push(sprN);
    sprNMat.uniforms.uRad.value = rad;
    const nK = slabs.length;
    const skGeo = new THREE.InstancedBufferGeometry(); skGeo.index = pg.index; skGeo.setAttribute('position', pg.attributes.position);
    const skP = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(nK, 1) * 4), 4), skA = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(nK, 1) * 4), 4), skB = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(nK, 1) * 4), 4), skQ = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(nK, 1) * 4), 4), skCV = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(nK, 1) * 2), 2);
    for (const a of [skP, skA, skB, skQ]) a.setUsage(THREE.DynamicDrawUsage);
    skGeo.setAttribute('aP', skP); skGeo.setAttribute('aA', skA); skGeo.setAttribute('aB', skB); skGeo.setAttribute('aQ', skQ); skGeo.setAttribute('aCV', skCV); skGeo.instanceCount = nK;
    slabs.forEach((sl, i) => { skCV.array[i * 2] = sl.vbx; skCV.array[i * 2 + 1] = sl.vby; if (sl.corners) { const c = sl.corners; skA.array.set([c[0][0], c[0][1], c[1][0], c[1][1]], i * 4); skB.array.set([c[2][0], c[2][1], c[3][0], c[3][1]], i * 4); } });
    const sprK = new THREE.Mesh(skGeo, sprKMat); sprK.frustumCulled = false; sprK.renderOrder = 4;
    group.add(sprK); objects.push(sprK);
    halo.scale.setScalar(bsz * 4.2);
    U.uDepth.value = depth;
    L = { vw, vh, cx, cy, bsz, depth, rad, wallZ, slabs, chevron, blocks, meshN, heatAttr, shA, shB, shS, spP, spQ, spC, skP, skQ, objects, nN, nK, standin: !!j.standin };
    // compile every program now (compile() skips hidden objects, so show them for the call): no hitch mid-intro
    const tm = renderer.toneMapping, te = renderer.toneMappingExposure, hidden = [];
    scene.traverse((ob) => { if (!ob.visible) { hidden.push(ob); ob.visible = true; } });
    renderer.toneMapping = TONE; renderer.toneMappingExposure = EXPOSURE;
    try { renderer.compile(scene, cam); } catch (e) { /* compiled on first draw instead */ }
    renderer.toneMapping = tm; renderer.toneMappingExposure = te;
    for (const ob of hidden) ob.visible = false;
  }

  // light direction projection onto the wall: offset per unit of height
  const SHX = -KEY_DIR[0] / KEY_DIR[2], SHY = -KEY_DIR[1] / KEY_DIR[2];
  function shadowOf(i, pts, h, size, peak) {
    const o = L;
    const sig = 2.2 + 0.42 * Math.max(h, 0);
    const e = 1 / (1 + 2.2 * Math.pow(sig / Math.max(size, 1), 2));
    const dx = SHX * h, dy = SHY * h;
    o.shA.array.set([pts[0][0] + dx, pts[0][1] + dy, pts[1][0] + dx, pts[1][1] + dy], i * 4);
    o.shB.array.set([pts[2][0] + dx, pts[2][1] + dy, pts[3][0] + dx, pts[3][1] + dy], i * 4);
    o.shS.array[i * 2] = sig; o.shS.array[i * 2 + 1] = peak * e;
  }

  // ctx: { W, H, fov (deg), a: {cx, cy, s}, b: {cx, cy, s} }  (CSS px; a = hold, b = top-bar target)
  function update(t, ctx) {
    if (!L) { group.visible = false; return false; }
    const o = L;
    const vis = t < INTRO.fadeB;
    group.visible = vis;
    if (!vis) return false;
    const { W, H, fov } = ctx;
    // camera: slow push-in (3 %) and a degree or two of parallax, ending square-on at the hold
    const D = (H / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const ec = inOutCubic(t / INTRO.camB);
    const dist = D * (1 + 0.03 * (1 - ec)), yaw = THREE.MathUtils.degToRad(1.5) * (1 - ec), pitch = THREE.MathUtils.degToRad(-0.9) * (1 - ec);
    cam.fov = fov; cam.aspect = W / H; cam.near = Math.max(1, D * 0.2); cam.far = D * 1.5 + 4000;
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    // placement (travel to the top-bar rect)
    const kT = expoInOut(clamp01((t - INTRO.travelA) / (INTRO.travelB - INTRO.travelA)));
    const { a, b } = ctx;
    const mcx = lerp(a.cx, b.cx, kT), mcy = lerp(a.cy, b.cy, kT), s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), kT));
    group.position.set(mcx - W / 2, H / 2 - mcy, 0); group.scale.setScalar(s);
    const Dvb = D / a.s;                                  // camera distance in vb units at the hold scale
    const flat = smooth((t - INTRO.flatA) / (INTRO.flatB - INTRO.flatA));
    const zs = 1 - 0.985 * flat;
    U.uFlat.value = flat; U.uAO.value = 0.62 * (1 - flat);
    // wall + light
    const light = smooth((t - INTRO.lightA) / (INTRO.lightB - INTRO.lightA)) * (1 - smooth((t - INTRO.bgA) / (INTRO.bgB - INTRO.bgA)));
    const wallOn = t < INTRO.bgB;
    wallMesh.visible = wallOn;
    wallMesh.position.set(0, 0, o.wallZ);
    wallMat.uniforms.uSize.value.set(W * 1.7 / s, H * 1.7 / s);
    wallMat.uniforms.uLight.value = light;
    wallMat.uniforms.uPool.value.set(-o.vw * 0.06, o.vh * 0.12, o.vw * 0.80, o.vh * 1.15);
    // key light: upper left front of the mark, intensity normalised at the mark centre (falloff = decay)
    {
      const mWk = o.vw * s, kx = -0.75 * mWk, ky = 0.62 * mWk, kz = 0.95 * mWk;
      key.position.set(group.position.x + kx, group.position.y + ky, kz);
      key.intensity = LOOK.key * Math.PI * Math.pow(Math.hypot(kx, ky, kz), LOOK.keyDecay) * (1 - 0.6 * flat);
    }
    shadowMat.uniforms.uOn.value = light * (1 - flat);
    const shadowsOn = wallOn && light > 0.001;
    // sweep: one strip light, left to right, at the hold
    const sw = (t - INTRO.sweepA) / (INTRO.sweepB - INTRO.sweepA);
    const mW = o.vw * s;
    U.uSweep.value.set(lerp(-1.45, 1.45, inOutSine(sw)) * mW, LOOK.sweepW * mW, cam.position.z, sw > 0 && sw < 1 ? LOOK.sweep * Math.pow(Math.sin(Math.PI * sw), 0.8) : 0);
    U.uSweepH.value = o.vh * s * 2.6;
    const blurK = BLUR_K * o.vh;
    // ---- K slabs ----
    const fused = !!o.chevron && t >= INTRO.fuse;
    o.slabs.forEach((sl, i) => {
      const f = clamp01((t - sl.t0) / sl.dur);
      const started = t >= sl.t0;
      const z0 = sl.z0 * Dvb, z = z0 * (1 - settle(f, 0.01));
      const ray = 1 - z / Dvb, eA = outQuart(f / 0.72), eR = outCubic(f / 0.7);
      const x = sl.x * ray + sl.ax * (1 - eA), y = sl.y * ray + sl.ay * (1 - eA);
      const rz = sl.rz * (1 - eR);
      const sig = blurK * Math.max(z, 0) / Dvb;
      const meshOn = started && sig < SIG_HI && !(fused && i > 0);
      sl.mesh.visible = meshOn;
      sl.mesh.position.set(x, y, z);
      sl.mesh.rotation.set(sl.rx * (1 - eR), sl.ry * (1 - eR), rz);
      sl.mesh.scale.set(1, 1, zs);
      const alpha = started && sl.corners ? smooth(f / 0.16) * smooth((sig - SIG_LO) / (SIG_HI - SIG_LO)) : 0;
      if (!sl.corners) sl.mesh.visible = started;
      o.skP.array.set([x, y, z, rz], i * 4);
      o.skQ.array.set([Math.max(sig, 0.01), alpha, 0.66 + 0.34 * (1 - smooth(sig / 14)), 0], i * 4);
      if (sl.corners) {
        const cs = Math.cos(rz), sn = Math.sin(rz);
        const pts = sl.corners.map(([px, py]) => [x + px * cs - py * sn, y + px * sn + py * cs]);
        shadowOf(i, pts, (z - o.depth * 0.5) - o.wallZ, sl.size, started && shadowsOn ? 0.80 * smooth(f / 0.3) : 0);
      } else { o.shS.array[i * 2 + 1] = 0; }
    });
    if (o.chevron) { o.chevron.mesh.visible = fused; o.chevron.mesh.scale.set(1, 1, zs); }
    // ---- N blocks ----
    const half = o.bsz / 2;
    let hotX = 0, hotY = 0, hotZ = 0, hotI = 0;
    o.blocks.forEach((B, k) => {
      const started = t >= B.t0;
      const f = clamp01((t - B.t0) / B.dur);
      const z0 = B.z0 * Dvb, z = started ? z0 * (1 - settle(f, 0.018)) : z0;
      const ray = 1 - z / Dvb, eA = outQuart(f / 0.7), eR = outCubic(f / 0.62);
      const x = B.x * ray + B.ax * (1 - eA), y = B.y * ray + B.ay * (1 - eA);
      const rz = B.rz * (1 - eR);
      const sig = blurK * Math.max(z, 0) / Dvb;
      const meshOn = started && sig < SIG_HI;
      const sc = B.s / o.bsz;
      tmpE.set(B.rx * (1 - eR), B.ry * (1 - eR), rz);
      tmpQ.setFromEuler(tmpE); tmpP.set(x, y, z); tmpS.set(meshOn ? sc : 0, meshOn ? sc : 0, meshOn ? sc * zs : 0);
      tmpM.compose(tmpP, tmpQ, tmpS);
      o.meshN.setMatrixAt(k, tmpM);
      // impostor
      const alpha = started ? smooth(f / 0.18) * smooth((sig - SIG_LO) / (SIG_HI - SIG_LO)) : 0;
      let col = B.lin, hot = 0;
      if (B.last) {
        const seat = B.t0 + B.dur;
        const cool = smooth((t - seat) / INTRO.cool);
        hot = 1 - cool;
        // signal -> its logo colour through a neutral of matched luminance (never through pink or purple)
        const ls = U.uSignal.value, lb = B.lin, lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
        const gN = 0.5 * (lum(ls) + lum(lb));
        if (cool < 0.5) col = tmpC.copy(ls).lerp(tmpC2.setRGB(gN, gN, gN), cool * 2);
        else col = tmpC.setRGB(gN, gN, gN).lerp(lb, cool * 2 - 1);
        o.meshN.setColorAt(k, col);
        o.heatAttr.array[k] = 0.65 * hot * hot * (1 - flat);
        hotX = x; hotY = y; hotZ = z; hotI = started ? hot : 0;
      }
      o.spP.array.set([x, y, z, half * sc], k * 4);
      o.spQ.array.set([rz, Math.max(sig, 0.01), alpha, 0.62 + 0.38 * (1 - smooth(sig / 14))], k * 4);
      o.spC.array.set([col.r, col.g, col.b], k * 3);
      const cs = Math.cos(rz), sn = Math.sin(rz), hs = half * sc;
      const pts = [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]].map(([px, py]) => [x + px * cs - py * sn, y + px * sn + py * cs]);
      shadowOf(o.nK + k, pts, (z - o.depth * 0.5) - o.wallZ, B.s, started && shadowsOn ? 0.78 * smooth(f / 0.3) : 0);
    });
    o.meshN.instanceMatrix.needsUpdate = true;
    if (o.meshN.instanceColor) o.meshN.instanceColor.needsUpdate = true;
    o.heatAttr.needsUpdate = true;
    for (const at of [o.shA, o.shB, o.shS, o.spP, o.spQ, o.spC, o.skP, o.skQ]) at.needsUpdate = true;
    // the hot block's glow
    halo.visible = hotI > 0.01 && flat < 1;
    if (halo.visible) { halo.position.set(hotX, hotY, hotZ + 0.5); haloMat.uniforms.uI.value = 0.42 * hotI * hotI * (1 - flat); }
    return true;
  }

  function render() {
    const tm = renderer.toneMapping, te = renderer.toneMappingExposure;
    renderer.toneMapping = TONE; renderer.toneMappingExposure = EXPOSURE;
    renderer.render(scene, cam);
    renderer.toneMapping = tm; renderer.toneMappingExposure = te;
  }

  function dispose() {
    clearBuilt();
    for (const m of [matN, matK, wallMat, shadowMat, sprNMat, sprKMat, haloMat]) m.dispose();
    wallMesh.geometry.dispose(); halo.geometry.dispose();
    envRT.dispose();
  }

  return { build, update, render, dispose, get built() { return !!L; }, get standin() { return !!(L && L.standin); }, scene, camera: cam };
}
