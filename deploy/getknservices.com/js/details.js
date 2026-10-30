/* details.js - KN v5 plan details pages: stepped build-in as each group enters the view, prices roll up once,
   sideways-swipe edge fade on the compare table. Hidden pre-states exist only while html.dt-anim is set (head
   script): with no script, a failed script or reduced motion, everything is simply visible. */
(function () {
  'use strict';
  window.__dtLive = true;
  var d = document, root = d.documentElement;
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  // compare table: edge fade until the visitor reaches the last column
  qsa('.cmp__scroll').forEach(function (sc) {
    var box = sc.parentNode;
    function upd() { box.classList.toggle('is-end', sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4); }
    sc.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

  if (!root.classList.contains('dt-anim')) return;
  try { run(); } catch (e) { root.classList.remove('dt-anim'); }

  function run() {
    // 1. rolling digits (the visible text stays for screen readers in a .vh twin)
    qsa('.js-roll').forEach(function (el) {
      var to = String(el.getAttribute('data-to') || el.textContent);
      var sr = d.createElement('span'); sr.className = 'vh'; sr.textContent = to;
      el.textContent = ''; el.setAttribute('aria-hidden', 'true');
      to.split('').forEach(function (ch) {
        if (!/[0-9]/.test(ch)) { var s = d.createElement('span'); s.className = 'sep'; s.textContent = ch; el.appendChild(s); return; }
        var win = d.createElement('span'); win.className = 'roll';
        var col = d.createElement('span'); col.className = 'roll__col'; col.style.setProperty('--d', ch);
        for (var k = 0; k <= 9; k++) { var n = d.createElement('span'); n.textContent = k; col.appendChild(n); }
        win.appendChild(col); el.appendChild(win);
      });
      el.parentNode.insertBefore(sr, el.nextSibling);
    });

    // 2. block covers for every snap target
    qsa('.rv').forEach(function (el) {
      var b = d.createElement('i'); b.className = 'blk'; b.setAttribute('aria-hidden', 'true'); el.appendChild(b);
    });

    // 3. tiled surfaces: 8 x 4 squares appear in a fixed shuffled order
    qsa('.js-tiles').forEach(function (el, n) {
      var c = 8, r = 4, seed = 7 + n * 13;
      var g = d.createElement('div'); g.className = 'tl'; g.setAttribute('aria-hidden', 'true');
      g.style.gridTemplateColumns = 'repeat(' + c + ', 1fr)'; g.style.gridTemplateRows = 'repeat(' + r + ', 1fr)';
      for (var k = 0; k < c * r; k++) {
        seed = (seed * 9301 + 49297) % 233280;
        var t = d.createElement('i'); t.style.setProperty('--td', (seed / 233280 * 0.26).toFixed(3) + 's'); g.appendChild(t);
      }
      el.insertBefore(g, el.firstChild);
    });

    // 4. groups: every target belongs to its closest .rvg (or is its own group); stagger in DOM order
    var groups = [], items = [];
    qsa('.rv, .rvo').forEach(function (el) {
      var g = el.closest('.rvg') || el, i = groups.indexOf(g);
      if (i < 0) { groups.push(g); items.push([]); i = groups.length - 1; }
      items[i].push(el);
    });
    groups.forEach(function (g, i) {
      var list = items[i], base = g.classList.contains('js-tiles') ? 0.26 : 0;
      var st = Math.min(parseFloat(g.getAttribute('data-st') || '0.05'), 0.9 / Math.max(1, list.length));
      list.forEach(function (el, k) { var t = base + k * st; el.__dl = t; el.style.setProperty('--dl', t.toFixed(3) + 's'); });
    });

    function reveal(g) {
      var i = groups.indexOf(g); if (i < 0 || g.__shown) return;
      g.__shown = true; g.classList.add('is-in');
      var max = 0;
      items[i].forEach(function (el) {
        el.classList.add('is-in'); max = Math.max(max, el.__dl || 0);
        setTimeout(function () { el.classList.add('is-done'); }, ((el.__dl || 0) + 0.3) * 1000);
      });
      setTimeout(function () { g.classList.add('is-done'); }, (max + 0.45) * 1000);
    }
    function revealAll() { groups.forEach(reveal); }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); reveal(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    groups.forEach(function (g) { io.observe(g); });

    // the last groups can sit below the trigger line at the very end of the page
    window.addEventListener('scroll', function () {
      if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) revealAll();
    }, { passive: true });
    window.addEventListener('beforeprint', revealAll);

    // a deep link (#pro) lands again once the web fonts have settled the layout
    if (location.hash && d.fonts && d.fonts.ready) {
      var target = d.getElementById(location.hash.slice(1));
      if (target) d.fonts.ready.then(function () { target.scrollIntoView({ block: 'start', behavior: 'instant' }); });
    }
  }
})();
