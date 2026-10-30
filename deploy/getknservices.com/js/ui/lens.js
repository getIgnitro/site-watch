// lens.js - the lens is wall-only. This gate turns it on only while the pointer is over open film:
// off over any text block, card, widget, button or the bar, off for the whole plans beat,
// the transitions and the end panel.

const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

export function createLensGate(stage, root) {
  let px = -1, py = -1, on = null;
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    px = e.clientX; py = e.clientY;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = -1; py = -1; });

  const SETS = {
    hero: ['.hero__fear', '.hl--1', '.hl--2 em', '.price', '.hero__side', '.cue'],
    bakery: ['.bk-nav', '.bk-hero', '.bk-bake', '.bk-foot', '.scene--bakery .kn-cap'],
    barber: ['.nb-panel', '.nb-hl', '.nb-rail', '.nb-prices', '.nb-find', '.scene--barber .kn-cap'],
    garage: ['.ga-head', '.ga-intro', '.ga-h1', '.ga-board', '.ga-call', '.ga-parts', '.scene--garage .kn-cap'],   // chat 19
    dental: ['.ld-nav', '.ld-hero', '.ld-book', '.ld-team', '.ld-guides', '.ld-hours', '.ld-foot', '.scene--dental .kn-cap'],   // chat 19
  };
  const cache = {};
  const els = (k) => (cache[k] = cache[k] || ['.bar'].concat(SETS[k]).flatMap((s) => $$(s, root)));

  function set(v) { if (v !== on) { on = v; stage.setLensEnabled(v); } }

  // t = scroll position in vh of the choreography; zone = 'hero' | 'bakery' | 'barber' | null
  return function update(zone) {
    if (px < 0 || !zone) return set(false);
    const tile = (stage.lens && stage.lens.tile) || 56;
    const m = tile * 1.5;
    for (const el of els(zone)) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity < 0.05) continue;
      if (px > r.left - m && px < r.right + m && py > r.top - m && py < r.bottom + m) return set(false);
    }
    set(true);
  };
}
