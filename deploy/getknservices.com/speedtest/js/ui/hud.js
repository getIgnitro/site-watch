// hud.js - custom cursor, build log (intro only), lens hint, scroll cue.

const $ = (s, r = document) => r.querySelector(s);

export function createHud({ fine, rm }) {
  const gsap = window.gsap;
  const html = document.documentElement;
  const cursor = $('.cursor'), label = $('.cursor__label');
  const log = $('.log'), hint = $('.hint'), cue = $('.cue');

  // ---- cursor: 10 px signal square with a slight lag; 64 px block + mono label over buttons,
  //      except on sample-site controls, where it becomes a frame the size of the control (press state)
  if (fine) {
    html.classList.add('has-cursor');
    const p = { x: innerWidth / 2, y: innerHeight / 2 }, c = { x: p.x, y: p.y };
    let seen = false;
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      p.x = e.clientX; p.y = e.clientY;
      if (!seen) { seen = true; c.x = p.x; c.y = p.y; gsap.set(cursor, { opacity: 1 }); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { seen = false; gsap.set(cursor, { opacity: 0 }); });
    const setX = gsap.quickSetter(cursor, 'x', 'px'), setY = gsap.quickSetter(cursor, 'y', 'px');
    // press state (5 Oct): inside a sample site the 64 px CLICK block hid the rows around small controls.
    // There the block instead snaps onto the control it presses and takes that control's own size
    // (a 2 px signal frame, no word), and fills with a light signal tint while the button is held.
    const SAMPLE = '.site-bakery, .site-barber, .site-garage, .site-dental';
    let press = null; const sz = { w: 10, h: 10 };
    const endPress = () => {
      if (!press) return;
      press = null;
      // back to the 10 px square at once: the stepped size transition would flash a solid block the size of the control
      cursor.style.transition = 'none';
      cursor.classList.remove('is-press', 'is-down');
      cursor.style.width = cursor.style.height = cursor.style.marginLeft = cursor.style.marginTop = cursor.style.borderRadius = '';
      void cursor.offsetWidth;
      cursor.style.transition = '';
    };
    const startPress = (t) => {
      sz.w = cursor.offsetWidth || 10; sz.h = cursor.offsetHeight || 10;
      press = t;
      cursor.classList.remove('is-big');
      cursor.classList.add('is-press');
      cursor.style.borderRadius = getComputedStyle(t).borderRadius;
    };
    gsap.ticker.add(() => {
      const k = rm ? 1 : 0.28;
      let tx = p.x, ty = p.y;
      if (press) {
        const r = press.getBoundingClientRect();
        // the scene stepped away under a still pointer: let go
        if (!press.isConnected || !r.width || p.x < r.left - 2 || p.x > r.right + 2 || p.y < r.top - 2 || p.y > r.bottom + 2) endPress();
        else {
          tx = r.left + r.width / 2; ty = r.top + r.height / 2;
          sz.w += (r.width - sz.w) * k; sz.h += (r.height - sz.h) * k;
          const s = cursor.style;
          s.width = sz.w + 'px'; s.height = sz.h + 'px'; s.marginLeft = -sz.w / 2 + 'px'; s.marginTop = -sz.h / 2 + 'px';
        }
      }
      c.x += (tx - c.x) * k; c.y += (ty - c.y) * k;
      setX(c.x); setY(c.y);
    });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest && e.target.closest('[data-cursor]');
      if (!t) return;
      if (t.classList.contains('wa')) return;   /* the chat button opens itself on hover; a big block over it reads as a double edge */
      if (t.closest(SAMPLE)) { if (press !== t) { endPress(); startPress(t); } return; }
      label.textContent = t.dataset.cursor; cursor.classList.add('is-big');
    });
    document.addEventListener('pointerout', (e) => {
      const t = e.target.closest && e.target.closest('[data-cursor]');
      if (t && !(e.relatedTarget && t.contains(e.relatedTarget))) { cursor.classList.remove('is-big'); if (press === t) endPress(); }
    });
    let downAt = 0;
    addEventListener('pointerdown', (e) => {
      if (press && (e.pointerType === 'mouse' || e.pointerType === 'pen')) { downAt = performance.now(); cursor.classList.add('is-down'); }
    }, { passive: true });
    addEventListener('pointerup', () => {
      setTimeout(() => cursor.classList.remove('is-down'), Math.max(0, 140 - (performance.now() - downAt)));
    }, { passive: true });
  }

  // ---- build log: typed lines, max 3 visible, intro only
  const queue = [];
  let typing = false;
  function pump() {
    if (typing || !queue.length) return;
    typing = true;
    const text = queue.shift();
    const row = document.createElement('div');
    log.appendChild(row);
    while (log.children.length > 3) log.firstElementChild.remove();
    let i = 0;
    const step = () => {
      i = Math.min(text.length, i + (rm ? text.length : 2));
      row.innerHTML = '';
      row.textContent = text.slice(0, i);
      if (i < text.length) { const k = document.createElement('span'); k.className = 'caret'; row.appendChild(k); setTimeout(step, 16); }
      else { typing = false; pump(); }
    };
    step();
  }
  function line(text) { queue.push(text); pump(); }
  function flush() {
    while (queue.length) {
      const row = document.createElement('div'); row.textContent = queue.shift(); log.appendChild(row);
      while (log.children.length > 3) log.firstElementChild.remove();
    }
  }
  function hideLog(delay = 1.4) { gsap.to(log, { autoAlpha: 0, duration: rm ? 0.01 : 0.36, ease: 'steps(4)', delay }); }

  // ---- hint + cue
  let hintGone = false;
  function showHints() {
    gsap.to(cue, { opacity: 1, duration: 0.3, ease: 'steps(3)' });
  }
  function lensUsed() {}
  let cueOn = true;
  function scrollAt(vh) {
    const want = vh < 6;
    if (want !== cueOn) { cueOn = want; gsap.to(cue, { opacity: want ? 1 : 0, duration: 0.25, ease: 'steps(3)', overwrite: true }); }
  }

  return { line, flush, hideLog, showHints, lensUsed, scrollAt };
}
