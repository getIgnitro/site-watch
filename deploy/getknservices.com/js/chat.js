// WhatsApp chat button, every page (3 Oct; compact 5 Oct).
// At rest only the orange glyph square shows. Mouse: hover or keyboard focus slides the label out to the
// left (pure CSS, css/site.css). Touch: the first tap adds .is-open (label shows), the second tap opens
// the chat; a tap elsewhere, a scroll or scene change, Escape, or 4 s idle closes it again.
// The square never rests on a link or button: when one is under it, it is lifted just clear of it
// (--wa-lift), and when that would take more than MAXLIFT it is tucked away (.is-off) until the control
// has moved on. Rects are re-checked on scroll, resize and every 400 ms (the home page moves its scenes
// with transforms, so scroll events alone are not enough).
(function () {
  var d = document, w = window, b = d.querySelector('.wa');
  if (!b || !b.getBoundingClientRect || !w.requestAnimationFrame) return;
  var ic = b.querySelector('.wa__i') || b;

  // ---- open / close -------------------------------------------------------------------------------
  var open = false, idle = 0, lastType = '', openY = 0;
  function setOpen(v) {
    clearTimeout(idle);
    open = v;
    if (v !== b.classList.contains('is-open')) b.classList.toggle('is-open', v);
    if (v) { openY = w.scrollY; idle = setTimeout(function () { setOpen(false); }, 4000); }
  }
  b.addEventListener('pointerdown', function (e) { lastType = e.pointerType || ''; });
  b.addEventListener('touchstart', function () { lastType = 'touch'; }, { passive: true });
  b.addEventListener('click', function (e) {
    var t = lastType; lastType = '';
    if ((t === 'touch' || t === 'pen') && !open) { e.preventDefault(); setOpen(true); return; }
    if (open) setTimeout(function () { setOpen(false); }, 0);      // the chat opens; fold the label back
  });
  d.addEventListener('pointerdown', function (e) { if (open && !b.contains(e.target)) setOpen(false); }, true);
  d.addEventListener('keydown', function (e) { if (open && (e.key === 'Escape' || e.key === 'Esc')) setOpen(false); });
  w.addEventListener('scroll', function () { if (open && Math.abs(w.scrollY - openY) > 4) setOpen(false); }, { passive: true, capture: true });
  w.addEventListener('wheel', function () { if (open) setOpen(false); }, { passive: true });
  b.addEventListener('focusout', function () { if (open) setOpen(false); });

  // ---- never rest on a control --------------------------------------------------------------------
  var SEL = 'a[href], button, [role="button"], input:not([type="hidden"]), select, textarea, summary, .scene .go, .scene [data-cursor]';
  var PAD = 8, MAXLIFT = 96, raf = 0, lift = -1;
  // home page: every scene sits in the layout before it is shown (main.js fades scenes with
  // visibility + opacity), so an element only counts while its own scene is on screen.
  function shown(el) {
    var sc = el.closest ? el.closest('.scene') : null;
    if (sc) {
      var cs = getComputedStyle(sc);
      if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    }
    var s = getComputedStyle(el);
    return s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05;
  }
  // the resting square, from its CSS position (the transform is ignored, so a lift in flight never
  // feeds back into the measurement)
  function rest() {
    var cs = getComputedStyle(b), de = d.documentElement;
    var R = de.clientWidth - parseFloat(cs.right), B = de.clientHeight - parseFloat(cs.bottom);
    var s = ic.offsetWidth || 56, h = b.offsetHeight || s;
    return { left: R - s, right: R, top: B - h, bottom: B };
  }
  function check() {
    raf = 0;
    var a = rest(), els = d.querySelectorAll(SEL), rs = [], i, r;
    for (i = 0; i < els.length; i++) {
      var el = els[i];
      if (b.contains(el)) continue;
      r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right < a.left - PAD || r.left > a.right + PAD) continue;                 // not in the column
      if (r.top > a.bottom + PAD || r.bottom < a.top - MAXLIFT - PAD) continue;       // out of reach
      if (!shown(el)) continue;           // inline text links count too ("Send us your workflow." on start.html)
      rs.push(r);
    }
    var dy = 0, k, moved;
    for (k = 0; k < 8; k++) {
      moved = false;
      for (i = 0; i < rs.length; i++) {
        r = rs[i];
        if (r.top <= a.bottom - dy + PAD && r.bottom >= a.top - dy - PAD) { dy = a.bottom - r.top + PAD; moved = true; }
      }
      if (!moved || dy > MAXLIFT) break;
    }
    var off = dy > MAXLIFT || moved;
    if (off) dy = 0;
    dy = Math.round(dy);
    if (dy !== lift) { lift = dy; b.style.setProperty('--wa-lift', dy + 'px'); }
    if (off !== b.classList.contains('is-off')) b.classList.toggle('is-off', off);
    if (off && open) setOpen(false);
  }
  function queue() { if (!raf) raf = requestAnimationFrame(check); }
  w.addEventListener('scroll', queue, { passive: true, capture: true });
  w.addEventListener('resize', queue);
  setInterval(queue, 400);
  check();
})();
