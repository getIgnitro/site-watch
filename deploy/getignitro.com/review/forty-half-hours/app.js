/* Forty Half Hours: scene engine. One gesture = one scene, on every route. */
(function () {
  "use strict";
  var D = document, W = window;
  var COURSE = W.COURSE || { weeks: {} };
  var G = W.gsap || null;
  var RM = false;
  try { RM = W.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var ANIM = !!G && !RM;
  var HAS_SPLIT = false, HAS_TEXT = false;
  if (G) {
    try { if (W.SplitText) { G.registerPlugin(W.SplitText); HAS_SPLIT = true; } } catch (e) {}
    try { if (W.TextPlugin) { G.registerPlugin(W.TextPlugin); HAS_TEXT = true; } } catch (e) {}
  }
  var TOUCH = false;
  try { TOUCH = W.matchMedia("(pointer: coarse)").matches || ("ontouchstart" in W); } catch (e) {}

  /* the course spine: one stop per week */
  var WC = ["#FF7A1A", "#FF4D2A", "#FF6464", "#FF4D94", "#E83AB8", "#C04CE6", "#9358FF", "#6B45F5"];
  var GREEN = "#3DDC97";
  function wc(n) { return WC[(n - 1) % 8]; }
  function rgbOf(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hexa(hex, a) { var c = rgbOf(hex); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  /* ---------- storage (works with none) ---------- */
  var mem = {};
  function load(k, d) {
    try { var v = W.localStorage.getItem("fhh." + k); if (v !== null) return JSON.parse(v); } catch (e) {}
    return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : d;
  }
  function save(k, v) { mem[k] = v; try { W.localStorage.setItem("fhh." + k, JSON.stringify(v)); } catch (e) {} }
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  var S = { done: obj(load("done", {})), quiz: obj(load("quiz", {})), teacher: !!load("teacher", false), exam: load("exam", null), wq: obj(load("wq", {})) };

  /* ---------- data ---------- */
  var WEEKS = [], LESSONS = [], BYID = {};
  for (var wn = 1; wn <= 8; wn++) {
    var wk0 = COURSE.weeks[wn];
    if (!wk0 || !wk0.lessons) continue;
    wk0.n = wk0.n || wn;
    WEEKS.push(wk0);
    for (var li = 0; li < wk0.lessons.length; li++) {
      var l0 = wk0.lessons[li];
      l0._w = wk0.n; l0._k = LESSONS.length;
      LESSONS.push(l0); BYID[l0.id] = l0;
    }
  }
  function doneCount() { var n = 0; LESSONS.forEach(function (l) { if (S.done[l.id]) n++; }); return n; }

  /* ---------- helpers ---------- */
  function h(tag, a, kids) {
    var el = D.createElement(tag);
    if (a) for (var k in a) {
      var v = a[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "style") el.setAttribute("style", v);
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === "string" ? D.createTextNode(c) : c);
    });
    return el;
  }
  function qa(el, s) { return [].slice.call(el.querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(v, d) { if (!isFinite(v)) return "n/a"; d = d || 0; return v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function now() { return performance.now(); }
  var SVGNS = "http://www.w3.org/2000/svg";
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.6 4.6L19.2 7.4" pathLength="1"/></svg>';
  var ARROW = '<svg viewBox="0 0 48 24" aria-hidden="true"><path d="M2 12h40M32 3l10 9-10 9" pathLength="1"/></svg>';

  function split(el, type, mask) {
    if (!HAS_SPLIT || !el) return null;
    if (el._sp) return el._sp;
    try {
      var o = { type: type, linesClass: "ln", wordsClass: "wd", charsClass: "ch" };
      if (mask) o.mask = mask;
      el._sp = new W.SplitText(el, o);
    } catch (e) { el._sp = null; }
    return el._sp;
  }
  /* typewriter with a ghost copy that holds the final height */
  function tw(text, cls, tag) {
    var live = h("span", { class: "tw-live", "aria-hidden": "true" });
    var el = h(tag || "p", { class: "tw " + (cls || "") }, [h("span", { class: "tw-ghost" }, text), live]);
    live.textContent = text;
    return {
      el: el,
      type: function (tl, at, dur) {
        dur = dur || Math.min(2.6, 0.4 + text.length * 0.024);
        live.textContent = "";
        tl.call(function () { el.classList.add("typing"); }, null, at);
        if (HAS_TEXT) tl.to(live, { text: { value: text }, duration: dur, ease: "none" }, at);
        else { var o = { n: 0 }; tl.to(o, { n: text.length, duration: dur, ease: "none", onUpdate: function () { live.textContent = text.slice(0, Math.round(o.n)); } }, at); }
        tl.call(function () { el.classList.remove("typing"); live.textContent = text; }, null, at + dur + 0.05);
      }
    };
  }

  /* ---------- chrome ---------- */
  var stage = D.getElementById("stage"), counter = D.getElementById("counter"), pbarI = D.querySelector("#pbar i");
  var dotsEl = D.getElementById("dots"), stripEl = D.getElementById("strip"), gbarEl = D.getElementById("gbar"), ovEl = D.getElementById("ov");
  var glowA = D.getElementById("glowA"), glowB = D.getElementById("glowB"), body = D.body;
  var tswHdr = D.getElementById("tsw");

  /* grain: a tiny noise tile, made once */
  (function () {
    try {
      var c = D.createElement("canvas"); c.width = c.height = 140;
      var x = c.getContext("2d"), im = x.createImageData(140, 140);
      for (var i = 0; i < im.data.length; i += 4) { var v = Math.random() * 255 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.random() * 60 | 0; }
      x.putImageData(im, 0, 0);
      D.getElementById("grain").style.backgroundImage = "url(" + c.toDataURL("image/png") + ")";
    } catch (e) {}
  })();

  var glowFlip = false, glowCur = "";
  function glowBg(c) {
    return "radial-gradient(56% 52% at 80% 14%, " + hexa(c, .30) + ", transparent 72%)," +
      "radial-gradient(48% 46% at 8% 96%, " + hexa(c, .20) + ", transparent 74%)," +
      "radial-gradient(70% 60% at 50% 55%, " + hexa(c, .05) + ", transparent 80%)";
  }
  function setGlow(c, instant) {
    if (c === glowCur) return;
    glowCur = c;
    var nx = glowFlip ? glowA : glowB, ol = glowFlip ? glowB : glowA;
    glowFlip = !glowFlip;
    nx.style.background = glowBg(c);
    D.documentElement.style.setProperty("--acc", c);
    if (ANIM && !instant) { G.to(nx, { opacity: 1, duration: 1, ease: "power2.out", overwrite: true }); G.to(ol, { opacity: 0, duration: 1, ease: "power2.out", overwrite: true }); }
    else { nx.style.opacity = 1; ol.style.opacity = 0; }
  }
  if (ANIM) {
    G.to(glowA, { xPercent: 3, yPercent: -2, duration: 9, yoyo: true, repeat: -1, ease: "sine.inOut" });
    G.to(glowB, { xPercent: -3, yPercent: 2, duration: 11, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  function syncTeacher() {
    qa(D, ".sw[data-t], #tsw").forEach(function (b) { b.setAttribute("aria-checked", S.teacher ? "true" : "false"); });
  }
  /* teacher passcode: asked once per device, only when turning teacher mode on */
  var TEACHER_PASSCODE = "9896";
  function teacherUnlocked() { try { if (W.localStorage.getItem("fhh.tunlock") === "1") return true; } catch (e) {} return !!mem.tunlock; }
  function rememberUnlock() { mem.tunlock = true; try { W.localStorage.setItem("fhh.tunlock", "1"); } catch (e) {} }
  function setTeacher(on) {
    S.teacher = on; save("teacher", S.teacher); syncTeacher();
    toast(on ? "Teacher mode on. Each lesson now ends with your notes and the quiz answers." : "Teacher mode off.");
    if (ROUTEKIND === "lesson") rebuild();
  }
  function toggleTeacher() {
    if (!S.teacher && !teacherUnlocked()) { openPin(); return; }
    setTeacher(!S.teacher);
  }
  var toastEl = null, toastT = 0;
  function toast(msg) {
    if (!toastEl) { toastEl = h("div", { id: "toast", role: "status", "aria-live": "polite" }); D.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.remove("show"); void toastEl.offsetWidth; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 4000);
  }
  var PIN = null;
  function openPin() {
    if (PIN) return;
    var boxes = [0, 1, 2, 3].map(function (k) { return h("input", { class: "pin-d", type: "password", inputmode: "numeric", pattern: "[0-9]*", maxlength: "1", autocomplete: "off", "aria-label": "Digit " + (k + 1) }); });
    var msg = h("p", { class: "pin-m", "aria-live": "polite" }, "Asked once on this device.");
    var card = h("div", { class: "pin-c", role: "dialog", "aria-modal": "true", "aria-label": "Teacher passcode" }, [
      h("p", { class: "eyebrow" }, "Teacher mode"),
      h("h2", { class: "pin-t" }, "Enter the four-digit passcode."),
      h("div", { class: "pin-row" }, boxes), msg,
      h("button", { type: "button", class: "btn btn-q pin-x", onclick: function () { closePin(); } }, "Cancel")
    ]);
    var wrap = h("div", { id: "pin", class: "open" }, card);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closePin(); });
    function code() { return boxes.map(function (b) { return b.value; }).join(""); }
    function check() {
      var c = code(); if (c.length < 4) return;
      if (c === TEACHER_PASSCODE) { rememberUnlock(); closePin(); setTeacher(true); return; }
      msg.textContent = "That is not the passcode. Try again.";
      card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
      boxes.forEach(function (b) { b.value = ""; }); boxes[0].focus();
    }
    boxes.forEach(function (b, k) {
      b.addEventListener("input", function () {
        var v = b.value.replace(/\D/g, "");
        if (v.length > 1) { v.split("").slice(0, 4 - k).forEach(function (ch, j) { boxes[k + j].value = ch; }); var nx = Math.min(3, k + v.length); boxes[nx].focus(); check(); return; }
        b.value = v;
        if (v && k < 3) boxes[k + 1].focus();
        check();
      });
      b.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !b.value && k > 0) { boxes[k - 1].focus(); boxes[k - 1].value = ""; e.preventDefault(); }
        else if (e.key === "Escape") { closePin(); e.preventDefault(); }
      });
    });
    D.body.appendChild(wrap);
    PIN = wrap;
    if (ANIM) G.fromTo(card, { y: 40, autoAlpha: 0, scale: .96 }, { y: 0, autoAlpha: 1, scale: 1, duration: .5, ease: "power3.out" });
    setTimeout(function () { boxes[0].focus(); }, 60);
  }
  function closePin() { if (!PIN) return; var w = PIN; PIN = null; w.remove(); }
  tswHdr.addEventListener("click", toggleTeacher);

  var PHASES = [{ n: "Recap", m: "0–5 min", w: 5 }, { n: "Teach", m: "5–20 min", w: 15 }, { n: "Do it now", m: "20–27 min", w: 7 }, { n: "Homework", m: "27–30 min", w: 3 }];
  function buildStrip(l) {
    stripEl.innerHTML = "";
    stripEl.appendChild(h("span", { class: "sp-l" }, "W" + l._w + " · D" + l.day));
    stripEl.appendChild(h("span", { class: "sp-bar" }, PHASES.map(function (p) { return h("i", { class: "sp-seg", style: "--m:" + p.w }); })));
    stripEl.appendChild(h("span", { class: "sp-ph" }));
  }

  /* ---------- the stepper ---------- */
  var SC = [], cur = 0, TL = null, ROUTE = null, ROUTEKIND = "", NARROW = false, RS = {};

  function scene(kind, o) {
    o = o || {};
    var inner = h("div", { class: "si" }, o.kids);
    var el = h("section", { class: "scene sc-" + kind + (o.cls ? " " + o.cls : ""), "data-kind": kind, "aria-label": o.label || kind }, [o.back || null, inner]);
    return { el: el, inner: inner, back: o.back || null, kind: kind, key: o.key || kind, color: o.color || WC[0], phase: o.phase == null ? -1 : o.phase, loops: [], tl: null, label: o.label || kind };
  }
  function stopScene(s) {
    if (!s) return;
    if (s.tl) { s.tl.kill(); s.tl = null; }
    (s.loops || []).forEach(function (f) { try { f(); } catch (e) {} });
    s.loops = [];
    if (s.deact) s.deact(s);
  }
  function startScene(s, dir) {
    if (ANIM && s.play) { try { s.play(s, dir); } catch (e) { if (W.console) console.warn(e); } }
    if (s.act) s.act(s);
  }
  function fit(s) {
    var el = s.inner, k = 1, guard = 0;
    el.style.removeProperty("--k");
    s.el.removeAttribute("data-overflow");
    while (el.scrollHeight > el.clientHeight + 2 && guard < 10) {
      k -= 0.04; guard++;
      el.style.setProperty("--k", k.toFixed(2));
    }
    if (el.scrollHeight > el.clientHeight + 2) s.el.setAttribute("data-overflow", String(el.scrollHeight - el.clientHeight));
  }
  function mount(list, start, quiet) {
    if (TL) { TL.kill(); TL = null; }
    SC.forEach(stopScene);
    closeOv(true);
    stage.innerHTML = "";
    SC = list;
    list.forEach(function (s, i) {
      s.index = i;
      s.el.style.setProperty("--wc", s.color);
      s.el.style.setProperty("--wcA", hexa(s.color, .36));
      s.el.style.setProperty("--wcB", hexa(s.color, .14));
      s.el.style.setProperty("--wcC", hexa(s.color, .26));
      stage.appendChild(s.el);
    });
    list.forEach(function (s) { if (s.layout) s.layout(); });
    list.forEach(fit);
    cur = Math.max(0, Math.min(list.length - 1, start || 0));
    var s = SC[cur];
    s.el.classList.add("on");
    setGlow(s.color, quiet);
    if (ANIM && !quiet) G.fromTo(s.inner, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .9, ease: "power3.out" });
    startScene(s, 1);
    buildDots();
    chrome();
  }
  function go(i, dir) {
    if (i < 0 || i >= SC.length || i === cur) return false;
    dir = dir || (i > cur ? 1 : -1);
    if (TL) { var t0 = TL; TL = null; t0.progress(1); t0.kill(); }
    var a = SC[cur], b = SC[i];
    stopScene(a);
    cur = i;
    setGlow(b.color);
    if (!ANIM) {
      a.el.classList.remove("on"); b.el.classList.add("on");
      startScene(b, dir); chrome(); return true;
    }
    b.el.classList.add("on");
    var tl = G.timeline({ onComplete: function () { if (TL === tl) TL = null; } });
    tl.to(a.inner, { y: -dir * 90, autoAlpha: 0, duration: .42, ease: "power2.in" }, 0);
    if (a.back) tl.to(a.back, { y: -dir * 200, autoAlpha: 0, duration: .5, ease: "power2.in" }, 0);
    tl.call(function () {
      a.el.classList.remove("on");
      G.set([a.inner, a.back].filter(Boolean), { clearProps: "transform,opacity,visibility" });
    }, null, .5);
    tl.fromTo(b.inner, { y: dir * 120, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .85, ease: "power4.out", immediateRender: true }, .3);
    if (b.back) tl.fromTo(b.back, { y: dir * 280, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.15, ease: "power3.out", immediateRender: true }, .22);
    TL = tl;
    startScene(b, dir);
    chrome();
    return true;
  }
  function step(d) {
    if (PIN) { closePin(); return true; }
    if (OV) { closeOv(); return true; }
    return go(cur + d, d);
  }
  function chrome() {
    var s = SC[cur]; if (!s) return;
    counter.textContent = pad2(cur + 1) + " / " + pad2(SC.length);
    pbarI.style.clipPath = "inset(0 " + (100 - (cur + 1) / SC.length * 100).toFixed(2) + "% 0 0)";
    qa(dotsEl, "button").forEach(function (b, k) { b.classList.toggle("on", k === cur); if (k === cur) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    if (ROUTEKIND === "lesson") {
      var segs = qa(stripEl, ".sp-seg");
      segs.forEach(function (g, k) { g.classList.toggle("on", k === s.phase); g.classList.toggle("past", k < s.phase); });
      var ph = stripEl.querySelector(".sp-ph");
      if (ph && PHASES[s.phase]) ph.textContent = PHASES[s.phase].n + " · " + PHASES[s.phase].m;
    }
    body.setAttribute("data-scene", String(cur));
    W.__fhh = { route: ROUTE, kind: ROUTEKIND, index: cur, count: SC.length, scene: s.kind, key: s.key, go: function (k) { return go(k); } };
  }
  function buildDots() {
    dotsEl.innerHTML = "";
    if (ROUTEKIND !== "home") return;
    SC.forEach(function (s, k) {
      dotsEl.appendChild(h("button", { type: "button", "aria-label": s.label, onclick: function () { go(k); } }, h("i")));
    });
  }

  /* wheel: a notch is one scene, a stream (trackpad, free spin, inertia) is one scene */
  /* A gesture ends only when the wheel goes quiet. Events handled straight out of a main-thread stall
     (Chrome coalesces wheel events while the thread is busy) always belong to the gesture in progress. */
  var lockUntil = 0, lastTs = -1e4, stream = false, lastAbs = 0;
  var lastRaf = 0, rafOn = false, rafStopAt = 0;
  function hb() { lastRaf = now(); if (lastRaf < rafStopAt) requestAnimationFrame(hb); else rafOn = false; }
  function heartbeat() { rafStopAt = now() + 2500; if (!rafOn) { rafOn = true; lastRaf = now(); requestAnimationFrame(hb); } }
  W.addEventListener("wheel", function (e) {
    if (e.ctrlKey) return;
    e.preventDefault();
    var dy = e.deltaY, dx = e.deltaX;
    if (!dy || Math.abs(dx) > Math.abs(dy)) return;
    var t = now(), ts = e.timeStamp > 0 ? e.timeStamp : t, gap = ts - lastTs, a = Math.abs(dy);
    var stalled = rafOn && (t - lastRaf) > 90;
    lastTs = ts; heartbeat();
    if (t < lockUntil || stalled) { stream = true; lastAbs = a; return; }
    if (stream && gap < 320) { lastAbs = a; return; }
    if (stream && gap < 400 && a < lastAbs * 0.8) { lastAbs = a; return; }
    stream = true; lastAbs = a;
    step(dy > 0 ? 1 : -1);
    lockUntil = now() + 430;
  }, { passive: false });

  /* keys: one press, one scene */
  W.addEventListener("keydown", function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (OV && (e.key === "Escape")) { closeOv(); e.preventDefault(); return; }
    var tg = e.target, tag = tg && tg.tagName || "";
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    var isBtn = /^(BUTTON|A)$/.test(tag) || (tg && tg.getAttribute && tg.getAttribute("role") === "button");
    var k = e.key, dir = 0;
    if (k === "ArrowDown" || k === "PageDown" || k === "ArrowRight" || (k === " " && !isBtn && !e.shiftKey)) dir = 1;
    else if (k === "ArrowUp" || k === "PageUp" || k === "ArrowLeft" || (k === " " && !isBtn && e.shiftKey)) dir = -1;
    else if (k === "Home") { e.preventDefault(); if (!e.repeat) go(0, -1); return; }
    else if (k === "End") { e.preventDefault(); if (!e.repeat) go(SC.length - 1, 1); return; }
    if (!dir) return;
    e.preventDefault();
    if (e.repeat) return;
    step(dir);
  });

  /* touch: one swipe, one scene; a fling counts once */
  var ty0 = 0, tx0 = 0, tmode = 2, tstep = false;
  D.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { tmode = 2; return; }
    var tg = e.target;
    tmode = (tg && tg.closest && tg.closest("input[type=range], .pan-x")) ? 3 : 0;
    ty0 = e.touches[0].clientY; tx0 = e.touches[0].clientX; tstep = false;
  }, { passive: true });
  D.addEventListener("touchmove", function (e) {
    if (tmode >= 2 || e.touches.length !== 1) return;
    var dy = ty0 - e.touches[0].clientY, dx = tx0 - e.touches[0].clientX;
    if (tmode === 0) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      tmode = Math.abs(dy) >= Math.abs(dx) ? 1 : 2;
      if (tmode !== 1) return;
    }
    if (e.cancelable) e.preventDefault();
    if (!tstep && Math.abs(dy) >= 36) { tstep = true; step(dy > 0 ? 1 : -1); }
  }, { passive: false });
  D.addEventListener("touchend", function () { tmode = 2; }, { passive: true });
  D.addEventListener("touchcancel", function () { tmode = 2; }, { passive: true });

  /* ---------- overlay (a panel is a scene: any gesture closes it) ---------- */
  var OV = false;
  function openOv(node) {
    ovEl.innerHTML = ""; ovEl.appendChild(node); ovEl.classList.add("open"); OV = true;
    ovEl.onclick = function () { closeOv(); };
  }
  function closeOv(instant) {
    if (!OV) return;
    OV = false;
    if (ANIM && !instant) G.to(ovEl, { autoAlpha: 0, duration: .3, onComplete: function () { ovEl.classList.remove("open"); ovEl.innerHTML = ""; G.set(ovEl, { clearProps: "all" }); } });
    else { ovEl.classList.remove("open"); ovEl.innerHTML = ""; }
  }

  /* ---------- motifs: atmosphere in the week colour, never data ---------- */
  var MOTIFS = ["funnel", "dial", "bars", "line", "rings", "split"];
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + Math.max(0, Math.min(1, a)).toFixed(3) + ")"; }
  function noise(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  var DRAW = {
    funnel: function (x, w, hh, t, c) {
      var cx = w / 2, top = hh * .1, bot = hh * .9, wT = w * .44, wB = w * .07;
      function half(y) { return wT + (wB - wT) * ((y - top) / (bot - top)); }
      x.lineWidth = 1.5;
      for (var k = 0; k <= 5; k++) { var y = top + (bot - top) * k / 5, hw = half(y); x.strokeStyle = rgba(c, .14 + k * .06); x.beginPath(); x.moveTo(cx - hw, y); x.lineTo(cx + hw, y); x.stroke(); }
      x.strokeStyle = rgba(c, .55); x.lineWidth = 2;
      x.beginPath(); x.moveTo(cx - wT, top); x.lineTo(cx - wB, bot); x.moveTo(cx + wT, top); x.lineTo(cx + wB, bot); x.stroke();
      for (var i = 0; i < 110; i++) {
        var s = noise(i), u = noise(i + 50) * 2 - 1, L = Math.floor(s * 6), ph = (t * .16 + i / 110) % 1;
        var y2 = top + (bot - top) * ph, px = cx + u * half(y2) * .9, a = .9, st = ph * 5;
        if (st > L && L < 5) { var d = st - L; px += (u < 0 ? -1 : 1) * d * w * .12; y2 += d * d * 20; a = .9 - d * .8; }
        if (a <= 0) continue;
        x.fillStyle = rgba(c, a); x.beginPath(); x.arc(px, y2, 2.2 + s * 2.4, 0, 6.283); x.fill();
      }
      var g = x.createRadialGradient(cx, bot, 0, cx, bot, w * .3); g.addColorStop(0, rgba(c, .45)); g.addColorStop(1, rgba(c, 0));
      x.fillStyle = g; x.fillRect(0, bot - w * .3, w, w * .6);
    },
    dial: function (x, w, hh, t, c) {
      var cx = w / 2, cy = hh / 2, R = Math.min(w, hh) * .4, a0 = -Math.PI / 2, sw = (t * .45) % 1;
      x.lineWidth = Math.max(10, R * .1); x.strokeStyle = rgba(c, .12); x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.stroke();
      x.strokeStyle = rgba(c, .9); x.lineCap = "round"; x.beginPath(); x.arc(cx, cy, R, a0, a0 + sw * 6.283); x.stroke(); x.lineCap = "butt";
      for (var i = 0; i < 60; i++) {
        var an = a0 + i / 60 * 6.283, r1 = R * 1.14, r2 = R * (i % 5 ? 1.2 : 1.28);
        x.strokeStyle = rgba(c, (i / 60 <= sw ? .8 : .22)); x.lineWidth = i % 5 ? 1.5 : 3;
        x.beginPath(); x.moveTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); x.lineTo(cx + Math.cos(an) * r2, cy + Math.sin(an) * r2); x.stroke();
      }
      var na = a0 + sw * 6.283; x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = 3;
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(na) * R * .78, cy + Math.sin(na) * R * .78); x.stroke();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(cx, cy, 7, 0, 6.283); x.fill();
      x.strokeStyle = rgba(c, .3); x.lineWidth = 1; x.setLineDash([4, 10]); x.beginPath(); x.arc(cx, cy, R * .62, t * .3, t * .3 + 6.283); x.stroke(); x.setLineDash([]);
    },
    bars: function (x, w, hh, t, c) {
      var n = 7, gap = w * .03, bw = (w * .86 - gap * (n - 1)) / n, base = hh * .88, left = w * .07, hs = [], mx = 0, mi = 0;
      for (var i = 0; i < n; i++) { var v = .25 + .7 * (.5 + .5 * Math.sin(t * .8 + i * 1.9)) * (.5 + .5 * (i + 1) / n); hs.push(v); if (v > mx) { mx = v; mi = i; } }
      x.strokeStyle = rgba(c, .25); x.lineWidth = 1; x.beginPath(); x.moveTo(left - 10, base + .5); x.lineTo(w - left + 10, base + .5); x.stroke();
      for (var j = 0; j < n; j++) {
        var bh = hs[j] * hh * .74, bx = left + j * (bw + gap);
        var g = x.createLinearGradient(0, base - bh, 0, base); g.addColorStop(0, rgba(c, j === mi ? 1 : .6)); g.addColorStop(1, rgba(c, .08));
        x.fillStyle = g; x.beginPath(); if (x.roundRect) x.roundRect(bx, base - bh, bw, bh, [10, 10, 2, 2]); else x.rect(bx, base - bh, bw, bh); x.fill();
        if (j === mi) { x.fillStyle = "#fff"; x.beginPath(); x.arc(bx + bw / 2, base - bh - 16, 6, 0, 6.283); x.fill(); }
      }
    },
    line: function (x, w, hh, t, c) {
      x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 1;
      for (var g = 1; g < 6; g++) { x.beginPath(); x.moveTo(0, hh * g / 6); x.lineTo(w, hh * g / 6); x.stroke(); x.beginPath(); x.moveTo(w * g / 6, 0); x.lineTo(w * g / 6, hh); x.stroke(); }
      var n = 44, p = Math.min(1, ((t * .2) % 1.25)), pts = [];
      for (var i = 0; i <= n; i++) { var f = i / n; pts.push([w * .06 + f * w * .88, hh * .84 - Math.pow(f, 1.35) * hh * .64 + Math.sin(i * 1.7) * hh * .035 * (1 - f * .5)]); }
      var m = Math.max(1, Math.floor(p * n));
      var gr = x.createLinearGradient(0, hh * .2, 0, hh); gr.addColorStop(0, rgba(c, .32)); gr.addColorStop(1, rgba(c, 0));
      x.fillStyle = gr; x.beginPath(); x.moveTo(pts[0][0], hh * .9);
      for (var k = 0; k <= m; k++) x.lineTo(pts[k][0], pts[k][1]);
      x.lineTo(pts[m][0], hh * .9); x.closePath(); x.fill();
      x.strokeStyle = rgba(c, 1); x.lineWidth = 3.5; x.lineJoin = "round"; x.beginPath();
      for (var q = 0; q <= m; q++) { if (q) x.lineTo(pts[q][0], pts[q][1]); else x.moveTo(pts[q][0], pts[q][1]); }
      x.stroke();
      var hd = pts[m], rg = x.createRadialGradient(hd[0], hd[1], 0, hd[0], hd[1], 34); rg.addColorStop(0, rgba(c, .8)); rg.addColorStop(1, rgba(c, 0));
      x.fillStyle = rg; x.beginPath(); x.arc(hd[0], hd[1], 34, 0, 6.283); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(hd[0], hd[1], 6, 0, 6.283); x.fill();
    },
    rings: function (x, w, hh, t, c) {
      var cx = w / 2, cy = hh / 2, R = Math.min(w, hh) * .48;
      for (var k = 0; k < 8; k++) { var f = (t * .11 + k / 8) % 1, r = f * R; x.strokeStyle = rgba(c, (1 - f) * .75); x.lineWidth = 2 + (1 - f) * 4; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.stroke(); }
      var g = x.createRadialGradient(cx, cy, 0, cx, cy, R * .3); g.addColorStop(0, rgba(c, .9)); g.addColorStop(1, rgba(c, 0));
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R * .3, 0, 6.283); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(cx, cy, 8, 0, 6.283); x.fill();
    },
    split: function (x, w, hh, t, c) {
      var mid = w / 2;
      x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 1.5; x.setLineDash([6, 8]); x.beginPath(); x.moveTo(mid, hh * .06); x.lineTo(mid, hh * .94); x.stroke(); x.setLineDash([]);
      var cols = 5, rows = 8;
      for (var i = 0; i < 40; i++) {
        var lx = w * .06 + noise(i) * (mid - w * .12) + Math.sin(t * .7 + i) * 10, ly = hh * .1 + noise(i + 99) * hh * .8 + Math.cos(t * .6 + i * 2) * 10;
        x.fillStyle = "rgba(255,255,255,.35)"; x.beginPath(); x.arc(lx, ly, 4, 0, 6.283); x.fill();
        var gx = mid + w * .08 + (i % cols) * ((mid - w * .16) / (cols - 1)), gy = hh * .12 + Math.floor(i / cols) * (hh * .76 / (rows - 1));
        var pulse = .55 + .45 * Math.sin(t * 1.4 - (i % cols) * .5 - Math.floor(i / cols) * .3);
        x.fillStyle = rgba(c, pulse); x.beginPath(); x.arc(gx, gy, 5.5, 0, 6.283); x.fill();
      }
    }
  };
  function motif(kind, color) {
    var cv = h("canvas", { class: "mo-cv", "aria-hidden": "true" }), c = rgbOf(color);
    return {
      el: cv,
      run: function () {
        var r = cv.getBoundingClientRect(); if (!r.width || !r.height) return function () {};
        var dpr = Math.min(2, W.devicePixelRatio || 1);
        cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
        var x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
        var t0 = now(), raf = 0;
        function fr(n) { x.clearRect(0, 0, r.width, r.height); DRAW[kind](x, r.width, r.height, (n - t0) / 1000 + 1.2, c); raf = requestAnimationFrame(fr); }
        if (!ANIM) { DRAW[kind](x, r.width, r.height, 3.2, c); return function () {}; }
        raf = requestAnimationFrame(fr);
        return function () { cancelAnimationFrame(raf); };
      }
    };
  }

  /* celebratory burst */
  function burst(el, color) {
    if (!ANIM || !el) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, cols = [color, "#FFFFFF", "#FFD27A", GREEN];
    for (var i = 0; i < 36; i++) {
      var p = h("i", { class: "bp", style: "left:" + cx + "px;top:" + cy + "px;background:" + cols[i % 4] });
      D.body.appendChild(p);
      var an = Math.random() * 6.283, d = 120 + Math.random() * 260;
      G.fromTo(p, { x: 0, y: 0, scale: 1, opacity: 1 }, { x: Math.cos(an) * d, y: Math.sin(an) * d - 60, scale: .2, opacity: 0, rotate: Math.random() * 360, duration: 1.1 + Math.random() * .6, ease: "power3.out", onComplete: (function (q) { return function () { q.remove(); }; })(p) });
    }
    G.fromTo(el, { scale: 1 }, { scale: 1.12, duration: .22, yoyo: true, repeat: 1, ease: "power2.out" });
  }

  /* generic reveal of [data-a] children */
  function reveal(tl, s, dir, at) {
    var els = qa(s.inner, "[data-a]");
    if (els.length) tl.fromTo(els, { y: dir * 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .08, ease: "power3.out" }, at == null ? 0 : at);
  }
  function linesIn(tl, el, at, stg) {
    var sp = split(el, "lines", "lines");
    if (sp && sp.lines && sp.lines.length) tl.fromTo(sp.lines, { yPercent: 105 }, { yPercent: 0, duration: .9, stagger: stg || .07, ease: "power4.out" }, at);
    else tl.fromTo(el, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, ease: "power3.out" }, at);
  }

  /* ================= HOME ================= */
  function buildHome() {
    var L = [sCover(), sRoad(), sPromise(), sClock()];
    WEEKS.forEach(function (w) { L.push(sWeek(w, false)); });
    L.push(sCases(), sCFO(), sCapstone(), sStart());
    return L;
  }

  function sCover() {
    var clock = h("div", { class: "cv-clock", "aria-hidden": "true" }, h("span", { class: "cv-ck" }, clockText()));
    var hours = "Hours".split("").map(function (ch, i) { var c = [WC[0], WC[2], WC[3], WC[5], WC[7]][i]; return h("span", { style: "color:" + c }, ch); });
    var title = h("h1", { class: "cv-title" }, [h("span", { class: "cv-l" }, "Forty Half"), h("span", { class: "cv-l" }, hours)]);
    var sub = tw("Marketing, sales and digital marketing for a future CFO.", "cv-sub");
    var eb = h("p", { class: "eyebrow cv-eb" }, "Eight weeks · forty lessons · thirty minutes each");
    var cue = h("div", { class: "cue" }, [h("span", { class: "cue-t" }, TOUCH ? "Swipe up" : "Scroll"), h("span", { class: "cue-l" })]);
    var s = scene("cover", { key: "cover", label: "Cover", color: WC[0], back: clock, kids: [h("div", { class: "bx" }, [eb, title, sub.el]), cue] });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .25 }), sp = split(title, "words,chars");
      tl.fromTo(eb, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .7, ease: "power2.out" }, 0);
      tl.fromTo(sp ? sp.chars : title, { yPercent: 120, rotate: 10, autoAlpha: 0 }, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1.15, stagger: .045, ease: "power4.out" }, .05);
      sub.type(tl, 1.0, 1.8);
      tl.fromTo(cue, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .7 }, 2.2);
      tl.fromTo(clock, { scale: 1.06 }, { scale: 1, duration: 2.4, ease: "power2.out" }, 0);
    };
    return s;
  }
  function clockText() { var t = RS.clockLeft == null ? 1800 : RS.clockLeft; return pad2(Math.floor(t / 60)) + ":" + pad2(t % 60); }
  function startClock() {
    if (RS.clockId) return;
    RS.clockLeft = 1800;
    RS.clockId = setInterval(function () {
      RS.clockLeft = RS.clockLeft > 0 ? RS.clockLeft - 1 : 1800;
      var el = stage.querySelector(".cv-ck"); if (el) el.textContent = clockText();
    }, 1000);
    var id = RS.clockId;
    RS.clean.push(function () { clearInterval(id); });
  }

  function sPromise() {
    var lines = [["Explain", " marketing in one sentence."], ["Run", " a sales call and answer the objections."], ["Judge", " a marketing budget the way a CFO does."]];
    var cols = [WC[0], WC[3], WC[6]];
    var ls = lines.map(function (t, i) { return h("p", { class: "pr-l" }, [h("span", { style: "color:" + cols[i] }, t[0]), t[1]]); });
    var l4 = h("p", { class: "pr-4" }, "Eight weeks. Thirty minutes a day. Weekends off.");
    var eb = h("p", { class: "eyebrow" }, "By the end you can");
    var s = scene("promise", { key: "promise", label: "The promise", color: WC[3], kids: h("div", { class: "bx" }, [eb, h("div", { class: "pr-ls" }, ls), l4]) });
    s.play = function (s) {
      var tl = s.tl = G.timeline({ delay: .3 });
      tl.set(ls, { opacity: 1 }, 0);
      tl.fromTo(eb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, 0);
      ls.forEach(function (el, i) {
        var at = .1 + i * .85;
        linesIn(tl, el, at, .1);
        if (i > 0) tl.to(ls.slice(0, i), { opacity: .4, duration: .6, ease: "power2.out" }, at);
      });
      tl.fromTo(l4, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .8, ease: "power3.out" }, 2.75);
      tl.to(ls, { opacity: 1, duration: .9, ease: "power2.out" }, 2.95);
    };
    return s;
  }

  var SEGS = [
    { n: "Recap", a: 0, b: 5, c: "#FF7A1A", d: "Yesterday, in three questions" },
    { n: "Teach", a: 5, b: 20, c: "#FF4D94", d: "The ideas, a real case, the money" },
    { n: "Do it now", a: 20, b: 27, c: "#E83AB8", d: "Seven minutes on the clock" },
    { n: "Homework", a: 27, b: 30, c: "#9358FF", d: "The quiz, then tomorrow's task" }
  ];
  function pt(cx, cy, r, deg) { var t = (deg - 90) * Math.PI / 180; return (cx + r * Math.cos(t)).toFixed(2) + " " + (cy + r * Math.sin(t)).toFixed(2); }
  function arcD(cx, cy, r, a0, a1) { return "M" + pt(cx, cy, r, a0) + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + pt(cx, cy, r, a1); }
  function sClock() {
    var svg = '<svg viewBox="0 0 600 600" aria-hidden="true"><circle cx="300" cy="300" r="230" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="38"/>';
    for (var i = 0; i < 30; i++) {
      var a = i * 12, maj = i % 5 === 0;
      svg += '<line class="ck-tk" x1="' + pt(300, 300, 268, a).split(" ")[0] + '" y1="' + pt(300, 300, 268, a).split(" ")[1] + '" x2="' + pt(300, 300, maj ? 292 : 280, a).split(" ")[0] + '" y2="' + pt(300, 300, maj ? 292 : 280, a).split(" ")[1] + '" stroke="rgba(255,255,255,' + (maj ? .6 : .25) + ')" stroke-width="' + (maj ? 4 : 2) + '"/>';
    }
    SEGS.forEach(function (g) { svg += '<path class="ck-seg" d="' + arcD(300, 300, 230, g.a * 12 + 1.4, g.b * 12 - 1.4) + '" fill="none" stroke="' + g.c + '" stroke-width="38" pathLength="1" style="filter:drop-shadow(0 0 14px ' + hexa(g.c, .55) + ')"/>'; });
    svg += '<g class="ck-hand"><line x1="300" y1="122" x2="300" y2="40" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="300" cy="40" r="9" fill="#fff"/></g></svg>';
    var num = h("span", { class: "ck-num" }, "30");
    var dial = h("div", { class: "ck-dial" }, [h("div", { html: svg }), h("div", { class: "ck-c" }, [num, h("span", { class: "ck-lab" }, "minutes")])]);
    var rows = SEGS.map(function (g) {
      return h("div", { class: "lg-row", style: "--c:" + g.c }, [h("i", { class: "lg-dot" }), h("span", { class: "lg-n" }, g.n), h("span", { class: "lg-m" }, g.a + "–" + g.b + " min"), h("span", { class: "lg-d" }, g.d)]);
    });
    var title = h("h2", { class: "ck-title", "data-a": "" }, "Every lesson runs on the same clock.");
    var s = scene("clock", { key: "clock", label: "The clock", color: WC[4], kids: h("div", { class: "bx" }, [title, h("div", { class: "ck-grid" }, [dial, h("div", { class: "lg" }, rows)])]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 }), segs = qa(dial, ".ck-seg"), hand = dial.querySelector(".ck-hand"), o = { v: 0 };
      linesIn(tl, title, 0);
      tl.fromTo(qa(dial, ".ck-tk"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3, stagger: .015 }, 0);
      tl.fromTo(segs, { strokeDashoffset: 1, strokeDasharray: "1 1" }, { strokeDashoffset: 0, duration: .62, stagger: .62, ease: "power2.inOut" }, .25);
      tl.fromTo(hand, { rotation: 0, svgOrigin: "300 300" }, { rotation: 360, svgOrigin: "300 300", duration: 2.5, ease: "power2.inOut" }, .25);
      tl.fromTo(rows, { autoAlpha: .18, x: 30 }, { autoAlpha: 1, x: 0, duration: .5, stagger: .62, ease: "power3.out" }, .3);
      tl.fromTo(o, { v: 0 }, { v: 30, duration: 2.5, ease: "power2.inOut", onUpdate: function () { num.textContent = Math.round(o.v); } }, .25);
    };
    return s;
  }

  function sWeek(w, live) {
    var c = wc(w.n);
    var back = h("div", { class: "wk-num", "aria-hidden": "true" }, h("span", null, pad2(w.n)));
    var tiles = w.lessons.map(function (l) {
      var d5 = l.day === 5;
      return h(live ? "a" : "div", { class: "tile " + (live ? "live" : "ro") + (S.done[l.id] ? " done" : ""), href: live ? "#" + l.id : null, "aria-label": "Week " + w.n + ", day " + l.day + ": " + l.title + (S.done[l.id] ? ", done" : "") }, [
        h("span", { class: "t-day" }, "Day " + l.day),
        h("span", { class: "t-title" }, l.title),
        h("span", { class: "t-foot" }, [d5 ? h("span", { class: "t-tag" }, w.n === 8 ? "final exam" : "week quiz") : h("span", { class: "t-min" }, "30 min"), live ? h("span", { class: "t-ar", html: ARROW }) : null]),
        S.done[l.id] ? h("span", { class: "t-tick", html: TICK }) : null
      ]);
    });
    var title = h("h2", { class: "wk-title" }, w.title);
    var eb = h("p", { class: "eyebrow" }, "Week " + w.n + " of 8" + (live ? " · tap a day to open it" : ""));
    var pr = h("p", { class: "wk-pr" }, w.promise);
    var s = scene("week", { key: (live ? "cweek" : "week") + w.n, label: "Week " + w.n, color: c, back: back, kids: h("div", { class: "bx" }, [eb, title, pr, h("div", { class: "tiles" }, tiles)]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      tl.fromTo(eb, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: .6 }, 0);
      linesIn(tl, title, .05, .09);
      tl.fromTo(pr, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .8, ease: "power3.out" }, .35);
      tl.fromTo(tiles, { autoAlpha: 0, x: NARROW ? 0 : 110, y: NARROW ? 40 : 0 }, { autoAlpha: 1, x: 0, y: 0, duration: .9, stagger: .085, ease: "power4.out" }, .45);
      var num = back.firstChild;
      tl.fromTo(num, { xPercent: dir * 10 }, { xPercent: 0, duration: 1.8, ease: "power3.out" }, 0);
      var drift = G.to(num, { yPercent: -4, duration: 5, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.4 });
      s.loops.push(function () { drift.kill(); });
    };
    return s;
  }

  function caseKey(name) { var w = name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean); return w[0] === "the" ? w.slice(0, 2).join(" ") : w[0]; }
  function caseList() {
    var g = {}, order = [];
    LESSONS.forEach(function (l) { var cs = l.caseStudy; if (!cs || !cs.name) return; var k = caseKey(cs.name); if (!g[k]) { g[k] = []; order.push(k); } g[k].push(cs); });
    return order.map(function (k) {
      var arr = g[k].slice().sort(function (a, b) { return a.name.length - b.name.length; });
      var pick = arr[0], yr = pick.year;
      if (!/\d/.test(yr || "")) { for (var i = 0; i < arr.length; i++) if (/\d/.test(arr[i].year || "")) { yr = arr[i].year; break; } }
      return { name: pick.name, year: yr || "" };
    });
  }
  function sCases() {
    var list = caseList(), rows = [[], [], []];
    list.forEach(function (c, i) { rows[i % 3].push(c); });
    var rowEls = rows.map(function (r, ri) {
      function items() { return r.map(function (c, i) { return h("span", { class: "cw-i" + ((i + ri) % 3 === 1 ? " o" : "") }, [h("span", { class: "cw-n" }, c.name), h("span", { class: "cw-y" }, c.year), h("i", { class: "cw-s", style: "background:" + WC[(i * 3 + ri * 2) % 8] })]); }); }
      var track = h("div", { class: "cw-track" }, items().concat(items()));
      return h("div", { class: "cw-row" }, track);
    });
    var title = h("h2", { class: "cw-title" }, "Thirty proven stories from around the world.");
    var sub = h("p", { class: "cw-sub" }, "One in every lesson, each with its source.");
    var s = scene("cases", { key: "cases", label: "The case wall", color: WC[2], kids: h("div", { class: "bx bx-wide" }, [h("p", { class: "eyebrow" }, "The case wall"), title, h("div", { class: "cw-rows", "aria-label": list.map(function (c) { return c.name; }).join(", ") }, rowEls), sub]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      linesIn(tl, title, 0, .08);
      tl.fromTo(rowEls, { autoAlpha: 0, x: function (i) { return i % 2 ? -260 : 260; } }, { autoAlpha: 1, x: 0, duration: 1.2, stagger: .12, ease: "power3.out" }, .15);
      tl.fromTo(sub, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 }, .9);
    };
    s.act = function (s) {
      if (!ANIM) return;
      rowEls.forEach(function (row, i) {
        var tr = row.firstChild, half = tr.scrollWidth / 2, dur = half / (NARROW ? 34 : 52);
        var tw2 = i % 2 ? G.fromTo(tr, { x: -half }, { x: 0, duration: dur, ease: "none", repeat: -1 }) : G.fromTo(tr, { x: 0 }, { x: -half, duration: dur, ease: "none", repeat: -1 });
        s.loops.push(function () { tw2.kill(); });
      });
    };
    return s;
  }

  function sCFO() {
    var F = [{ l: "Budget", p: "AED", v: 10000 }, { l: "Clicks", v: 2500 }, { l: "Leads", v: 200 }, { l: "Customers", v: 40 }, { l: "CAC", p: "AED", v: 250 }];
    var R = ["CPC 4", "8%", "20%", "÷ 40"];
    var cells = [], figs = [], arrs = [];
    F.forEach(function (f, i) {
      var v = h("span", { class: "fig-v" }, fmt(f.v));
      v._t = f.v;
      var fig = h("div", { class: "fig" + (i === 4 ? " last" : "") }, [h("span", { class: "fig-l" }, f.l), h("span", { class: "fig-n" }, [f.p ? h("span", { class: "fig-p" }, f.p) : null, v])]);
      figs.push(fig); cells.push(fig);
      if (i < 4) { var ar = h("div", { class: "arr" }, [h("span", { class: "arr-i", html: ARROW }), h("span", { class: "arr-r" }, R[i])]); arrs.push(ar); cells.push(ar); }
    });
    var defs = '<defs><linearGradient id="fg1" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#FF7A1A" stop-opacity=".30"/><stop offset=".5" stop-color="#E83AB8" stop-opacity=".22"/><stop offset="1" stop-color="#6B45F5" stop-opacity=".30"/></linearGradient><linearGradient id="fg2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF7A1A" stop-opacity=".28"/><stop offset=".5" stop-color="#E83AB8" stop-opacity=".2"/><stop offset="1" stop-color="#6B45F5" stop-opacity=".3"/></linearGradient></defs>';
    var funH = h("div", { class: "fun fun-h", html: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + defs + '<polygon points="0,0 100,34 100,66 0,100" fill="url(#fg1)"/><polyline points="0,0 100,34" stroke="rgba(255,255,255,.18)" fill="none" vector-effect="non-scaling-stroke"/><polyline points="0,100 100,66" stroke="rgba(255,255,255,.18)" fill="none" vector-effect="non-scaling-stroke"/></svg>' });
    var funV = h("div", { class: "fun fun-v", html: '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' + defs + '<polygon points="0,0 100,0 72,100 28,100" fill="url(#fg2)"/></svg>' });
    var row = h("div", { class: "cfo-row" }, [funH, funV].concat(cells));
    var line = h("p", { class: "cfo-line" }, "Week 5 teaches you to build this and to argue with it.");
    var s = scene("cfo", { key: "cfo", label: "The CFO scene", color: WC[4], kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow" }, "Through a CFO's eyes · unit economics"), h("h2", { class: "cfo-t" }, "From the budget to the customer."), row, line]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      linesIn(tl, s.inner.querySelector(".cfo-t"), 0);
      tl.fromTo(funH, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 2.4, ease: "power2.inOut" }, .2);
      tl.fromTo(funV, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 2.4, ease: "power2.inOut" }, .2);
      figs.forEach(function (fg, i) {
        var at = .3 + i * .5, v = fg.querySelector(".fig-v"), o = { n: 0 };
        tl.fromTo(fg, { autoAlpha: 0, y: 40, scale: .92 }, { autoAlpha: 1, y: 0, scale: 1, duration: .7, ease: "back.out(1.6)" }, at);
        tl.fromTo(o, { n: 0 }, { n: v._t, duration: .9, ease: "power3.out", onUpdate: function () { v.textContent = fmt(Math.round(o.n)); } }, at);
        if (i < 4) {
          var ar = arrs[i];
          tl.fromTo(ar, { autoAlpha: 0, x: NARROW ? 0 : -20, y: NARROW ? -10 : 0 }, { autoAlpha: 1, x: 0, y: 0, duration: .5 }, at + .35);
          tl.fromTo(ar.querySelector("path"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .5, ease: "power2.out" }, at + .35);
        }
      });
      tl.fromTo(figs[4].querySelector(".fig-v"), { scale: 1 }, { scale: 1.14, duration: .35, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 60%" }, 2.55);
      tl.fromTo(line, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .8 }, 2.7);
    };
    return s;
  }

  function sCapstone() {
    var tl0 = [];
    for (var i = 0; i <= 6; i++) tl0.push(h("i", { class: "cap-tk" + (i % 2 === 0 ? " maj" : ""), style: "--p:" + (i / 6 * 100).toFixed(3) + "%" }));
    var months = [1, 2, 3].map(function (m) { return h("span", { class: "cap-m", style: "--p:" + ((m * 2 - 1) / 6 * 100).toFixed(3) + "%" }, "Month " + m); });
    var fns = [];
    for (var f = 1; f <= 6; f++) fns.push(h("span", { class: "cap-f", style: "--p:" + ((f - .5) / 6 * 100).toFixed(3) + "%" }, "F" + f));
    var dels = [["One-page plan", 0], ["Sales kit", 2], ["Dashboard", 4], ["Pitch", 6]].map(function (d, k) {
      return h("div", { class: "cap-d" + (d[1] === 0 ? " first" : d[1] === 6 ? " lastd" : ""), style: "--p:" + (d[1] / 6 * 100).toFixed(3) + "%;--c:" + [WC[0], WC[3], WC[5], WC[7]][k] }, [h("i", { class: "cap-dot" }), h("span", { class: "cap-dn" }, d[0])]);
    });
    var line = h("i", { class: "cap-line" });
    var tlEl = h("div", { class: "cap-tl" }, [line].concat(tl0, months, fns, dels));
    var title = h("h2", { class: "cap-t" }, "Week 8. You present the plan to your father.");
    var s = scene("capstone", { key: "capstone", label: "The capstone", color: WC[7], kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow" }, "The capstone · a 90-day plan"), title, tlEl]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      linesIn(tl, title, 0, .09);
      tl.fromTo(line, NARROW ? { scaleY: 0, transformOrigin: "50% 0%" } : { scaleX: 0, transformOrigin: "0% 50%" }, NARROW ? { scaleY: 1, duration: 1.6, ease: "power2.inOut" } : { scaleX: 1, duration: 1.6, ease: "power2.inOut" }, .3);
      tl.fromTo(tl0, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: .4, stagger: 1.6 / 6, ease: "back.out(2)" }, .3);
      tl.fromTo(fns, { autoAlpha: 0 }, { autoAlpha: 1, duration: .4, stagger: 1.6 / 6 }, .45);
      tl.fromTo(months, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .5 }, .6);
      dels.forEach(function (d, k) {
        var at = .35 + [0, 2, 4, 6][k] / 6 * 1.6;
        tl.fromTo(d, { autoAlpha: 0, y: NARROW ? 0 : -30, x: NARROW ? 30 : 0 }, { autoAlpha: 1, y: 0, x: 0, duration: .7, ease: "back.out(1.7)" }, at);
      });
    };
    return s;
  }

  function teacherRow(cls) {
    var b = h("button", { type: "button", class: "sw", "data-t": "1", role: "switch", "aria-checked": S.teacher ? "true" : "false", onclick: toggleTeacher }, [h("span", { class: "sw-l" }, "Teacher mode"), h("span", { class: "sw-t" })]);
    return h("div", { class: "trow " + (cls || "") }, [b, h("p", { class: "trow-p" }, "Adds a scene before each lesson's close with the teacher's notes and the quiz answer key.")]);
  }
  function nextUndone() { for (var i = 0; i < LESSONS.length; i++) if (!S.done[LESSONS[i].id]) return LESSONS[i]; return null; }
  function sStart() {
    var n = doneCount(), total = LESSONS.length || 40, nx = nextUndone();
    var big = h("a", { class: "btn-g st-big", href: "#course" }, [h("span", null, "Start the course"), h("span", { class: "btn-ar", html: ARROW })]);
    var sec = h("div", { class: "st-sec" }, [
      h("a", { class: "btn-o", href: "#glossary" }, "Glossary"),
      h("a", { class: "btn-o", href: "#exam" }, "Final exam")
    ]);
    var prog = h("div", { class: "st-prog" }, [h("p", { class: "st-pn" }, [h("b", null, String(n)), " of " + total + " lessons done"]), h("span", { class: "st-bar" }, h("i", { style: "width:" + (n / total * 100).toFixed(1) + "%" }))]);
    var foot = h("p", { class: "st-foot" }, "Ignitro Innovative Solutions · Doha");
    var map = h("div", { class: "st-map", "aria-hidden": "true" }, WEEKS.map(function (w) {
      return h("div", { class: "sm-col", style: "--c:" + wc(w.n) }, [h("span", { class: "sm-w" }, "W" + w.n)].concat(w.lessons.map(function (l) { return h("span", { class: "sm-d" + (S.done[l.id] ? " on" : "") }); })));
    }));
    var s = scene("start", { key: "start", label: "Start", color: WC[5], kids: [h("div", { class: "bx st-grid" }, [h("div", null, [h("p", { class: "eyebrow", "data-a": "" }, "Thirty minutes a day, starting now"), h("div", { "data-a": "" }, big), h("div", { "data-a": "" }, sec), h("div", { "data-a": "" }, prog), h("div", { "data-a": "" }, teacherRow())]), map]), foot] });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      reveal(tl, s, dir, 0);
      tl.fromTo(big, { scale: .86 }, { scale: 1, duration: 1.1, ease: "elastic.out(1,.6)" }, .05);
      tl.fromTo(foot, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 }, .6);
      tl.fromTo(qa(map, ".sm-d"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .5, ease: "back.out(2.4)", stagger: .02 }, .2);
    };
    return s;
  }


  /* the road: eight weeks as milestones on one winding road */
  var LEARN = ["Explain marketing in one sentence", "Run a sales call, answer objections", "Know what every digital channel is for", "Write content that sells", "Judge a budget like a CFO: CAC, LTV, payback", "Run the lead-to-cash system", "Audit and plan a real business", "Present the plan, pass the exam"];
  var STAGES = ["Foundations", "Digital", "Numbers and systems", "Strategy and capstone"];
  function roadD(P, vertical, lim) {
    lim = lim || 1000;
    var a = P[0], z = P[P.length - 1], d, i, p, q, m;
    if (!vertical) {
      d = "M0 " + a[1] + " L" + a[0] + " " + a[1];
      for (i = 1; i < P.length; i++) { p = P[i - 1]; q = P[i]; m = (q[0] - p[0]) / 2; d += " C" + (p[0] + m) + " " + p[1] + " " + (q[0] - m) + " " + q[1] + " " + q[0] + " " + q[1]; }
      return d + " L" + lim + " " + z[1];
    }
    d = "M" + a[0] + " 0 L" + a[0] + " " + a[1];
    for (i = 1; i < P.length; i++) { p = P[i - 1]; q = P[i]; m = (q[1] - p[1]) / 2; d += " C" + p[0] + " " + (p[1] + m) + " " + q[0] + " " + (q[1] - m) + " " + q[0] + " " + q[1]; }
    return d + " L" + z[0] + " " + lim;
  }
  function roadSvg(d, vb, gid, vertical) {
    return '<svg viewBox="' + vb + '" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + gid + '" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="' + (vertical ? 0 : 1) + '" y2="' + (vertical ? 1 : 0) + '"><stop offset="0" stop-color="#FF7A1A"/><stop offset=".3" stop-color="#FF6464"/><stop offset=".55" stop-color="#E83AB8"/><stop offset=".8" stop-color="#9358FF"/><stop offset="1" stop-color="#6B45F5"/></linearGradient></defs>' +
      '<path class="rd-bed" d="' + d + '" vector-effect="non-scaling-stroke"/>' +
      '<path class="rd-mid" d="' + d + '" vector-effect="non-scaling-stroke"/>' +
      '<path class="rd-ink" d="' + d + '" pathLength="1" stroke="url(#' + gid + ')" vector-effect="non-scaling-stroke"/></svg>';
  }
  function weekDone(n) { var w = COURSE.weeks[n], k = 0; if (w) w.lessons.forEach(function (l) { if (S.done[l.id]) k++; }); return k; }
  function sRoad() {
    var nx = doneCount() ? nextUndone() : null, here = nx ? nx._w : 0, box, ms = [], svgBox, legend = null, title = h("h2", { class: "rd-t" }, "The road, eight weeks.");
    function label(w, i) {
      return h("div", { class: "rd-l" }, [h("span", { class: "rd-wt" }, w.title), h("span", { class: "rd-ln" }, LEARN[i] || "")]);
    }
    function disc(w) { return h("span", { class: "rd-d" }, [h("b", null, String(w.n)), here === w.n ? h("span", { class: "rd-here" }, "You are here") : null]); }
    if (!NARROW) {
      var P = WEEKS.map(function (w, i) { return [Math.round(60 + i * 880 / 7), i % 2 ? 300 : 700]; });
      svgBox = h("div", { class: "rd-svg", html: roadSvg(roadD(P, false), "0 0 1000 1000", "rdg1", false) });
      ms = WEEKS.map(function (w, i) {
        return h("div", { class: "rd-m " + (i % 2 ? "up" : "dn") + (here === w.n ? " here" : ""), style: "--c:" + wc(w.n) }, [disc(w), label(w, i)]);
      });
      var pills = STAGES.map(function (st, k) {
        var a = P[k * 2], b = P[k * 2 + 1];
        return h("span", { class: "rd-pill", style: "--c:" + wc(k * 2 + 1) + ";left:" + ((a[0] + b[0]) / 20) + "%;top:" + (k % 2 ? 57 : 43) + "%" }, [h("b", null, st), h("i", null, " W" + (k * 2 + 1) + "\u2013" + (k * 2 + 2))]);
      });
      box = h("div", { class: "rd-box" }, [svgBox].concat(pills, ms));
      legend = h("div", { class: "rd-leg" }, STAGES.map(function (st, k) { return h("span", { class: "rd-chip", style: "--c:" + wc(k * 2 + 1) }, [h("b", null, st), h("i", null, " W" + (k * 2 + 1) + "\u2013" + (k * 2 + 2))]); }));
    } else {
      ms = WEEKS.map(function (w, i) {
        return h("div", { class: "rd-row " + (i % 2 ? "r" : "l") + (here === w.n ? " here" : ""), style: "--c:" + wc(w.n) }, [i % 2 === 0 ? h("p", { class: "rd-st" }, STAGES[i / 2] + " W" + (i + 1) + "–" + (i + 2)) : null, h("div", { class: "rd-rw" }, [disc(w), h("div", { class: "rd-l" }, [here === w.n ? h("span", { class: "rd-hr" }, "You are here") : null, h("span", { class: "rd-wt" }, w.title), h("span", { class: "rd-ln" }, LEARN[i] || "")])])]);
      });
      svgBox = h("div", { class: "rd-svg" });
      box = h("div", { class: "rd-list" }, [svgBox].concat(ms));
    }
    var s = scene("road", { key: "road", label: "The road", color: WC[3], kids: h("div", { class: "bx bx-wide rd-bx" }, [h("p", { class: "eyebrow" }, "The road map"), legend, title, box]) });
    s.layout = function () {
      var br = box.getBoundingClientRect(); if (!br.height || !br.width) return;
      if (NARROW) {
        var P2 = qa(box, ".rd-d").map(function (d) { var r = d.getBoundingClientRect(); return [Math.round((r.left + r.width / 2 - br.left) / br.width * 1000), Math.round((r.top + r.height / 2 - br.top) / br.height * 1000)]; });
        svgBox.innerHTML = roadSvg(roadD(P2, true), "0 0 1000 1000", "rdg2", true);
        return;
      }
      /* wide (v4): measure the real label heights, then place the two rows so no label leaves the box.
         The stage pills ride the road only when the span between the rows allows; otherwise the scene goes
         "tight": the pills hide and a stage legend sits above the title in place of the eyebrow. */
      var Wd = br.width, R0 = 28 + 46 + 4, GAP = 96, rs = 1, P, upY, dnY, span;
      var lw = Math.min(250, Math.max(140, (Wd - Wd * .16) / 7 * 2 - 14));
      var mx = Math.max(lw / 2 + 4, Wd * .05), step = (Wd - 2 * mx) / 7;
      lw = Math.min(lw, 2 * step - 12); mx = Math.max(lw / 2 + 4, Wd * .05); step = (Wd - 2 * mx) / 7;
      box.style.setProperty("--lw", Math.round(lw) + "px");
      function need() {
        var hu = 0, hd = 0;
        ms.forEach(function (m, i) { var hh = m.querySelector(".rd-l").offsetHeight; if (i % 2) hu = Math.max(hu, hh); else hd = Math.max(hd, hh); });
        return { hu: hu, hd: hd, total: hu + hd + 2 * R0 * rs + GAP };
      }
      function place() {
        var Hd = box.getBoundingClientRect().height;
        rs = 1; box.style.removeProperty("--rs");
        var n = need();
        if (n.total > Hd) { rs = Math.max(.66, Hd / n.total); box.style.setProperty("--rs", rs.toFixed(3)); n = need(); }
        var R = R0 * rs; upY = n.hu + R; dnY = Hd - n.hd - R;
        if (dnY - upY < GAP) { var mid = (upY + dnY) / 2; upY = mid - GAP / 2; dnY = mid + GAP / 2; }
        span = dnY - upY; P = WEEKS.map(function (w, i) { return [mx + i * step, i % 2 ? upY : dnY]; });
        ms.forEach(function (m, i) { m.style.left = P[i][0].toFixed(1) + "px"; m.style.top = P[i][1].toFixed(1) + "px"; });
        svgBox.innerHTML = roadSvg(roadD(P.map(function (q) { return [q[0] / Wd * 1000, q[1] / Hd * 1000]; }), false), "0 0 1000 1000", "rdg1", false);
      }
      s.el.classList.remove("tight");
      place();
      var ph = 0, room = 4 * step - 68, wide = true;
      pills.forEach(function (pl) { pl.classList.remove("short"); if (pl.offsetWidth > room) pl.classList.add("short"); if (pl.offsetWidth > room) wide = false; ph = Math.max(ph, pl.offsetHeight); });
      var po = Math.min(.175 * span, span / 2 - 28 * rs - ph / 2 - 4);
      if (!wide || po < ph / 2 + 6) { s.el.classList.add("tight"); place(); return; }
      pills.forEach(function (pl, k) { pl.style.left = ((P[k * 2][0] + P[k * 2 + 1][0]) / 2).toFixed(1) + "px"; pl.style.top = ((upY + dnY) / 2 + (k % 2 ? po : -po)).toFixed(1) + "px"; });
    };
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 }), ink = box.querySelector(".rd-ink"), bed = qa(box, ".rd-bed, .rd-mid");
      linesIn(tl, title, 0, .08);
      tl.fromTo(bed, { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, .1);
      if (ink) tl.fromTo(ink, { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, .2);
      tl.fromTo(qa(box, ".rd-d"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: .6, stagger: 2.2 / 8, ease: "back.out(2.6)" }, .3);
      tl.fromTo(qa(box, ".rd-wt, .rd-ln, .rd-st"), { autoAlpha: 0, y: NARROW ? 0 : 14, x: NARROW ? 16 : 0 }, { autoAlpha: 1, y: 0, x: 0, duration: .6, stagger: 2.2 / 20, ease: "power3.out" }, .45);
      tl.fromTo(qa(box, ".rd-pill"), { autoAlpha: 0, scale: .7 }, { autoAlpha: 1, scale: 1, duration: .5, stagger: .5, ease: "back.out(2)" }, .9);
      if (legend) tl.fromTo(qa(legend, ".rd-chip"), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .1, ease: "power3.out" }, .15);
      var hr = box.querySelector(".rd-here");
      if (hr) tl.fromTo(hr, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: .6, ease: "back.out(2)" }, 2.6);
    };
    return s;
  }

  /* ================= COURSE INDEX (behind Start) ================= */
  var pendingWeek = 0;
  function buildCourse() {
    var L = [], n = doneCount(), l = nextUndone() || LESSONS[0], total = LESSONS.length || 40;
    var segs = h("div", { class: "cn-clock" }, PHASES.map(function (p, k) { return h("div", { class: "cn-seg", style: "--m:" + p.w + ";--c:" + SEGS[k].c }, [h("i"), h("span", null, [h("b", null, p.n), " " + p.m])]); }));
    var card = h("div", { class: "cn-card", style: "--wc:" + wc(l._w) }, [
      h("p", { class: "cn-k" }, "Week " + l._w + " · Day " + l.day + " · " + (COURSE.weeks[l._w] ? COURSE.weeks[l._w].title : "")),
      h("h2", { class: "cn-t" }, l.title),
      h("p", { class: "cn-b" }, l.bigIdea),
      h("div", { class: "cn-row" }, [h("a", { class: "btn-g cn-open", href: "#" + l.id }, [h("span", null, "Open lesson"), h("span", { class: "btn-ar", html: ARROW })]), h("p", { class: "cn-n" }, [h("b", null, String(n)), " of " + total + " done"])])
    ]);
    var c0 = scene("cont", { key: "cont", label: "Continue", color: wc(l._w), kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow", "data-a": "" }, n ? "Continue where you stopped" : "Begin with Day 1"), h("div", { "data-a": "" }, card), h("div", { "data-a": "" }, segs)]) });
    c0.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); tl.fromTo(qa(segs, "i"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: .6, stagger: .2, ease: "power2.out" }, .5); };
    L.push(c0);
    WEEKS.forEach(function (w) { L.push(sWeek(w, true)); });
    var ref = scene("ref", { key: "ref", label: "Glossary and exam", color: WC[7], kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow", "data-a": "" }, "Look it up, then prove it"), h("h2", { class: "rf-t", "data-a": "" }, "Every term in one place. One exam across all eight weeks."), h("div", { class: "rf-row", "data-a": "" }, [h("a", { class: "btn-g", href: "#glossary" }, [h("span", null, "Glossary"), h("span", { class: "btn-ar", html: ARROW })]), h("a", { class: "btn-g", href: "#exam" }, [h("span", null, "Final exam"), h("span", { class: "btn-ar", html: ARROW })])]), h("a", { class: "cl-prev", href: "#home", "data-a": "" }, "Back to the start")]) });
    ref.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); };
    L.push(ref);
    return L;
  }

  /* ================= PROGRESS RAIL (lessons and #course) ================= */
  var railEl = h("nav", { id: "rail", "aria-label": "Course progress" });
  D.body.appendChild(railEl);
  function buildRail(curW, curD) {
    railEl.innerHTML = "";
    var vert = !NARROW;
    var P = WEEKS.map(function (w, i) { var f = Math.round(60 + i * 880 / 7), o = i % 2 ? 640 : 360; return vert ? [o, f] : [f, o]; });
    railEl.appendChild(h("div", { class: "rl-svg", html: roadSvg(roadD(P, vert), "0 0 1000 1000", "rlg", vert) }));
    WEEKS.forEach(function (w, i) {
      var k = weekDone(w.n), cur = w.n === curW;
      var fill = h("i", { class: "rl-f" });
      var tip = h("span", { class: "rl-tip" + (i < 2 ? " lo" : i > 5 ? " hi" : "") }, [h("b", null, "Week " + w.n + " · " + w.title), h("span", null, k + " of 5 done")]);
      var d = h("button", { type: "button", class: "rl-d" + (cur ? " cur" : ""), style: "--c:" + wc(w.n) + ";left:" + P[i][0] / 10 + "%;top:" + P[i][1] / 10 + "%", "aria-label": "Week " + w.n + ": " + w.title + ", " + k + " of 5 done", "data-w": String(w.n) }, [fill, h("span", { class: "rl-n" }, String(w.n)), tip]);
      d.addEventListener("click", function () { pendingWeek = w.n; if (ROUTE === "course") { go(w.n); pendingWeek = 0; } else location.hash = "course"; });
      railEl.appendChild(d);
      if (cur) {
        var ticks = h("span", { class: "rl-ticks", style: "left:" + P[i][0] / 10 + "%;top:" + P[i][1] / 10 + "%" }, w.lessons.map(function (l) { return h("i", { class: (S.done[l.id] ? "on" : "") + (l.day === curD ? " now" : "") }); }));
        railEl.appendChild(ticks);
      }
    });
    railFill(false);
  }
  function railFill(anim) {
    qa(railEl, ".rl-d").forEach(function (d) {
      var n = +d.getAttribute("data-w"), k = weekDone(n), f = d.querySelector(".rl-f"), w = COURSE.weeks[n];
      if (ANIM && anim) G.to(f, { scaleY: k / 5, duration: .6, ease: "power2.out" }); else f.style.transform = "scaleY(" + (k / 5) + ")";
      var sp = d.querySelector(".rl-tip span"); if (sp) sp.textContent = k + " of 5 done";
      d.setAttribute("aria-label", "Week " + n + ": " + (w ? w.title : "") + ", " + k + " of 5 done");
    });
    var cur = railEl.querySelector(".rl-ticks"), cw = railEl.querySelector(".rl-d.cur");
    if (cur && cw) { var w2 = COURSE.weeks[+cw.getAttribute("data-w")]; qa(cur, "i").forEach(function (t, j) { t.classList.toggle("on", !!(w2 && S.done[w2.lessons[j].id])); }); }
  }

  /* ================= LESSON ================= */
  function grp(key, n, onAll) { RS.g = RS.g || {}; if (!RS.g[key]) RS.g[key] = { answers: [], qs: [], n: n, onAll: onAll, scoreEls: [], fired: false }; RS.g[key].scoreEls = []; return RS.g[key]; }

  function buildLesson(l) {
    var c = wc(l._w), L = [], prev = LESSONS[l._k - 1], wk = COURSE.weeks[l._w];
    L.push(sLTitle(l, c, wk));
    if (!prev) L.push(sNoRecap(c));
    else {
      var g = grp("recap", prev.quiz.length);
      prev.quiz.forEach(function (q, i) { L.push(sQuestion({ q: q, c: c, phase: 0, label: "Recap · yesterday", i: i, g: g, key: "recap" + i, scoreLabel: "Recap" })); });
    }
    l.teach.forEach(function (t, i) { L.push(sTeach(l, t, i, c)); });
    sCase(l, c).forEach(function (s) { L.push(s); });
    L.push(sFinance(l));
    L.push(sDoNow(l, c));
    if (l.widget === "unitEconomics") { L.push(sUE(l, c, 0)); L.push(sUE(l, c, 1)); }
    else if (l.widget === "pipeline") L.push(sPipeline(l, c));
    else if (l.widget === "rolePlay" && l.rolePlay) l.rolePlay.forEach(function (r, i) { L.push(sRole(l, c, r, i, l.rolePlay.length)); });
    else if (l.widget === "flashcards") weekTerms(l._w).forEach(function (t, i, arr) { L.push(sFlash(l, c, t, i, arr.length)); });
    var qg = grp("quiz", l.quiz.length, function (x) { if (S.quiz[l.id] == null || x > S.quiz[l.id]) { S.quiz[l.id] = x; save("quiz", S.quiz); } });
    l.quiz.forEach(function (q, i) { L.push(sQuestion({ q: q, c: c, phase: 3, label: "Quiz", i: i, g: qg, key: "quiz" + i, scoreLabel: "Quiz" })); });
    if (l.day === 5 && wk) {
      if (!RS.wqPick) { var pool = []; wk.lessons.forEach(function (x) { x.quiz.forEach(function (q) { pool.push(q); }); }); RS.wqPick = shuffle(pool).slice(0, 8); }
      var wg = grp("wq", RS.wqPick.length, function (x) { if (S.wq[l._w] == null || x > S.wq[l._w]) { S.wq[l._w] = x; save("wq", S.wq); } });
      RS.wqPick.forEach(function (q, i) { L.push(sQuestion({ q: q, c: c, phase: 3, label: "Week quiz", i: i, g: wg, key: "wq" + i, scoreLabel: "Week quiz" })); });
    }
    if (S.teacher) L.push(sTeacher(l, c));
    L.push(sClose(l, c));
    return L;
  }

  function sLTitle(l, c, wk) {
    var back = h("div", { class: "lt-num", "aria-hidden": "true" }, h("span", null, "D" + l.day));
    var eb = h("p", { class: "eyebrow" }, "Week " + l._w + " · Day " + l.day + " · " + (wk ? wk.title : ""));
    var title = h("h1", { class: "lt-title" }, l.title);
    var big = tw(l.bigIdea, "lt-big");
    var meta = h("p", { class: "lt-meta" }, [h("i", { class: "lt-dot" }), "Thirty minutes · " + l.teach.length + " ideas · one case · a quiz"]);
    var s = scene("ltitle", { key: "title", label: "Title", color: c, phase: 0, back: back, kids: h("div", { class: "bx" }, [eb, title, big.el, meta]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 }), sp = split(title, "words,chars");
      tl.fromTo(eb, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: .6 }, 0);
      tl.fromTo(sp ? sp.chars : title, { yPercent: 110, rotate: 7, autoAlpha: 0 }, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 1, stagger: .022, ease: "power4.out" }, .05);
      big.type(tl, .85);
      tl.fromTo(meta, { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 }, 1.4);
      var num = back.firstChild, drift = G.to(num, { yPercent: -5, duration: 6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 });
      s.loops.push(function () { drift.kill(); });
    };
    return s;
  }
  function sNoRecap(c) {
    var s = scene("norecap", { key: "recap0", label: "Recap", color: c, phase: 0, kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow", "data-a": "" }, "Recap · three questions on yesterday"), h("h2", { class: "nr-t", "data-a": "" }, "First day. No recap."), h("p", { class: "nr-p", "data-a": "" }, "From tomorrow, every lesson opens with three questions on the day before.")]) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); };
    return s;
  }

  function sQuestion(o) {
    var q = o.q, g = o.g, i = o.i, n = g.n, last = i === n - 1;
    g.qs[i] = q;
    var eb = h("p", { class: "eyebrow" }, o.label + " · " + (i + 1) + " of " + n);
    var qq = h("h2", { class: "q-q" }, q.q);
    var opts = q.options.map(function (t, k) {
      return h("button", { type: "button", class: "opt", "data-k": String(k) }, [h("span", { class: "opt-l" }, "ABCD".charAt(k)), h("span", { class: "opt-t" }, t), h("span", { class: "opt-m", html: TICK })]);
    });
    var why = h("p", { class: "q-why" }, [h("b", null, "Why  "), q.why]);
    var score = last ? h("div", { class: "q-score", "aria-live": "polite" }) : null;
    if (score) g.scoreEls.push(score);
    function paint() {
      var a = g.answers[i]; if (a == null) return;
      opts.forEach(function (b, k) {
        b.classList.toggle("right", k === q.answer);
        b.classList.toggle("wrong", k === a && a !== q.answer);
        b.classList.toggle("dim", k !== a && k !== q.answer);
        b.disabled = true;
      });
      why.classList.add("show");
    }
    opts.forEach(function (b) {
      b.addEventListener("click", function () {
        if (g.answers[i] != null) return;
        var k = +b.getAttribute("data-k");
        g.answers[i] = k; paint();
        b.classList.add(k === q.answer ? "hit" : "miss");
        scoreUpdate(g, o.c);
      });
    });
    paint();
    var kids = [eb, qq, h("div", { class: "opts" }, opts), h("div", { class: "q-foot" }, [why, score])];
    var s = scene("q", { key: o.key, label: o.label + " " + (i + 1), color: o.c, phase: o.phase, kids: h("div", { class: "bx" }, kids) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      tl.fromTo(eb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 0);
      linesIn(tl, qq, .02, .07);
      tl.fromTo(opts, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .07, ease: "power3.out", clearProps: "transform" }, .25);
    };
    scoreUpdate(g, o.c, true);
    return s;
  }
  function scoreUpdate(g, c, quiet) {
    var answered = 0, right = 0;
    for (var i = 0; i < g.n; i++) { if (g.answers[i] != null) answered++; if (g.qs[i] && g.answers[i] === g.qs[i].answer) right++; }
    if (g.onAny) g.onAny();
    g.scoreEls.forEach(function (el) {
      if (g.answers[g.n - 1] == null) { el.innerHTML = ""; el.classList.remove("show"); return; }
      el.innerHTML = '<span class="qs-n">' + right + '<small> of ' + g.n + '</small></span><span class="qs-l">' + (answered < g.n ? (g.n - answered) + " unanswered" : right === g.n ? "All right. Clean sweep." : "right") + "</span>";
      el.classList.add("show");
      if (!quiet && answered === g.n && right === g.n) burst(el, c);
    });
    if (answered === g.n && !g.fired) { g.fired = true; if (g.onAll) g.onAll(right); }
  }

  function sTeach(l, t, i, c) {
    var kind = MOTIFS[(l._k * 2 + i) % 6];
    var back = h("div", { class: "tc-num", "aria-hidden": "true" }, pad2(i + 1));
    var mo = motif(kind, c);
    var eb = h("p", { class: "eyebrow" }, "Teach · " + (i + 1) + " of " + l.teach.length);
    var hh = h("h2", { class: "tc-h" }, t.h), p = h("p", { class: "tc-p" }, t.p);
    var moBox = h("div", { class: "tc-mo mo-" + kind }, mo.el);
    var s = scene("teach", { key: "teach" + i, label: "Teach " + (i + 1), color: c, phase: 1, back: back, kids: h("div", { class: "bx tc-grid" }, [h("div", { class: "tc-txt" }, [eb, hh, p]), moBox]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      tl.fromTo(eb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 0);
      linesIn(tl, hh, 0, .08);
      linesIn(tl, p, .3, .055);
      tl.fromTo(moBox, { autoAlpha: 0, scale: .86, rotate: dir * -6 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.3, ease: "power3.out" }, .1);
    };
    s.act = function (s) { s.loops.push(mo.run()); };
    return s;
  }

  function sCase(l, c) {
    var cs = l.caseStudy;
    function spot() { return h("div", { class: "spot", "aria-hidden": "true" }, [h("i", { class: "spot-cone" }), h("i", { class: "spot-floor" })]); }
    var eb = h("p", { class: "eyebrow" }, "Case file · " + cs.year);
    var nm = h("h2", { class: "cs-name" }, cs.name);
    var st = h("p", { class: "cs-story" }, cs.story);
    var hl = h("span", { class: "hl" }, cs.lesson);
    var side = h("div", { class: "cs-side" }, [h("p", { class: "cs-ll" }, "The lesson"), h("p", { class: "cs-lesson" }, hl), h("p", { class: "cs-src" }, "Source · " + cs.source)]);
    function playSide(tl, at) {
      tl.fromTo(side.querySelector(".cs-ll"), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: .5 }, at);
      tl.fromTo(side.querySelector(".cs-lesson"), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .7, ease: "power3.out" }, at + .1);
      tl.fromTo(hl, { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 1.1, ease: "power2.inOut" }, at + .5);
      tl.fromTo(side.querySelector(".cs-src"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, at + .9);
    }
    if (!NARROW) {
      var s = scene("case", { key: "case", label: "Case file", color: c, phase: 1, back: spot(), kids: h("div", { class: "bx" }, [eb, nm, h("div", { class: "cs-grid" }, [st, side])]) });
      s.play = function (s, dir) {
        var tl = s.tl = G.timeline({ delay: .3 });
        tl.fromTo(eb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 0);
        linesIn(tl, nm, 0, .08);
        linesIn(tl, st, .3, .04);
        playSide(tl, 1.0);
      };
      return [s];
    }
    var a = scene("case", { key: "caseA", label: "Case file", color: c, phase: 1, back: spot(), kids: h("div", { class: "bx" }, [eb, nm, st]) });
    a.play = function (s) { var tl = s.tl = G.timeline({ delay: .3 }); tl.fromTo(eb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 0); linesIn(tl, nm, 0, .08); linesIn(tl, st, .3, .04); };
    var b = scene("case", { key: "caseB", label: "Case file, the lesson", color: c, phase: 1, back: spot(), kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow" }, "Case file · " + cs.year), h("h2", { class: "cs-name2" }, cs.name), side]) });
    b.play = function (s) { var tl = s.tl = G.timeline({ delay: .3 }); playSide(tl, .1); };
    return [a, b];
  }

  function monoNums(text) {
    return esc(text).replace(/((?:AED|USD|QAR)\s?[\d][\d,.]*(?:\s?(?:billion|million|bn|m))?|\d[\d,.]*\s?%|\b\d[\d,.]*x\b|\b\d{1,3}(?:,\d{3})+\b|\b\d+:\d+\b)/g, '<span class="mn">$1</span>');
  }
  function sFinance(l) {
    var back = h("div", { class: "ledger", "aria-hidden": "true" }, [h("i", { class: "lg-margin" }), h("span", { class: "lg-hd" }, "DEBIT        CREDIT")]);
    var ul = h("span", { class: "fl-ul", html: '<svg viewBox="0 0 600 18" preserveAspectRatio="none" aria-hidden="true"><path d="M3 11 C 90 4, 180 15, 280 9 S 470 5, 597 10" pathLength="1"/></svg>' });
    var eb = h("p", { class: "fl-eb" }, ["Through a CFO's eyes", ul]);
    var t = h("p", { class: "fl-t", html: monoNums(l.financeLens) });
    var s = scene("finance", { key: "finance", label: "Finance lens", color: "#22B97A", phase: 1, back: back, kids: h("div", { class: "bx" }, [eb, t]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      tl.fromTo(eb, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: .6 }, 0);
      tl.fromTo(ul.querySelector("path"), { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, .25);
      linesIn(tl, t, .2, .06);
      tl.fromTo(qa(t, ".mn"), { color: "#F2FFF8" }, { color: GREEN, duration: .6, stagger: .08 }, 1.0);
    };
    return s;
  }

  /* do it now: task, steps, a 7:00 ring timer */
  var TIMER_FULL = 420;
  function timerState() { if (!RS.timer) RS.timer = { left: TIMER_FULL, run: false, end: 0, id: 0 }; return RS.timer; }
  function timerPaint() {
    var T = timerState(), left = T.run ? Math.max(0, (T.end - Date.now()) / 1000) : T.left;
    if (T.run && left <= 0) { T.run = false; T.left = 0; clearInterval(T.id); T.id = 0; left = 0; }
    var secs = Math.ceil(left - 1e-6);
    qa(stage, ".ring").forEach(function (r) {
      r.querySelector(".rg-t").textContent = secs > 0 ? Math.floor(secs / 60) + ":" + pad2(secs % 60) : "Time";
      r.querySelector(".rg-p").style.strokeDashoffset = String(1 - left / TIMER_FULL);
      r.classList.toggle("zero", secs <= 0);
      r.classList.toggle("running", T.run);
      var sb = r.parentNode.querySelector(".rg-start"); if (sb) sb.textContent = T.run ? "Pause" : (left < TIMER_FULL && left > 0 ? "Resume" : "Start");
    });
  }
  function timerToggle() {
    var T = timerState();
    if (T.run) { T.left = Math.max(0, (T.end - Date.now()) / 1000); T.run = false; clearInterval(T.id); T.id = 0; }
    else {
      if (T.left <= 0) T.left = TIMER_FULL;
      T.end = Date.now() + T.left * 1000; T.run = true;
      T.id = setInterval(timerPaint, 200);
      var id = T.id; RS.clean.push(function () { clearInterval(id); });
    }
    timerPaint();
  }
  function timerReset() { var T = timerState(); clearInterval(T.id); T.id = 0; T.run = false; T.left = TIMER_FULL; timerPaint(); }
  function sDoNow(l, c) {
    var eb = h("p", { class: "eyebrow" }, "Do it now · seven minutes");
    var task = h("h2", { class: "dn-task" }, l.doNow.task);
    var steps = l.doNow.steps.map(function (t) { return h("li", null, h("span", null, t)); });
    var ring = h("div", { class: "ring" }, [
      h("div", { html: '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle class="rg-p" cx="100" cy="100" r="88" fill="none" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" transform="rotate(-90 100 100)"/></svg>' }),
      h("div", { class: "rg-c" }, [h("span", { class: "rg-t", "aria-live": "polite" }, "7:00"), h("span", { class: "rg-l" }, "minutes")])
    ]);
    var btns = h("div", { class: "rg-b" }, [h("button", { type: "button", class: "btn rg-start", onclick: timerToggle }, "Start"), h("button", { type: "button", class: "btn btn-q", onclick: timerReset }, "Reset")]);
    var s = scene("donow", { key: "donow", label: "Do it now", color: c, phase: 2, kids: h("div", { class: "bx dn-grid" }, [h("div", { class: "dn-l" }, [eb, task, h("ol", { class: "dn-steps" }, steps)]), h("div", { class: "dn-r" }, [ring, btns])]) });
    s.play = function (s, dir) {
      var tl = s.tl = G.timeline({ delay: .3 });
      tl.fromTo(eb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 0);
      linesIn(tl, task, 0, .08);
      tl.fromTo(steps, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .6, stagger: .32, ease: "power3.out" }, .55);
      tl.fromTo(ring, { autoAlpha: 0, scale: .7, rotate: -30 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.2, ease: "power4.out" }, .15);
      tl.fromTo(btns, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6 }, .7);
    };
    s.act = function () { timerPaint(); };
    return s;
  }

  /* widgets */
  function slider(f, get, onChange) {
    var val = h("span", { class: "sl-v" });
    var inp = h("input", { type: "range", min: String(f.min), max: String(f.max), step: String(f.step), value: String(get()[f.k]), "aria-label": f.label });
    function paint() { val.textContent = f.fmt(+inp.value); inp.style.setProperty("--p", ((inp.value - f.min) / (f.max - f.min) * 100).toFixed(2) + "%"); }
    inp.addEventListener("input", function () { get()[f.k] = +inp.value; paint(); onChange(); });
    paint();
    var el = h("label", { class: "sl" }, [h("span", { class: "sl-top" }, [h("span", { class: "sl-l" }, f.label), val]), inp]);
    el._set = function () { inp.value = String(get()[f.k]); paint(); };
    return el;
  }
  function outEl(key, label, big) { return h("div", { class: "ou" + (big ? " big" : "") }, [h("span", { class: "ou-l" }, label), h("span", { class: "ou-v", "data-o": key })]); }
  function setOut(key, html) { qa(stage, '[data-o="' + key + '"]').forEach(function (e) { e.innerHTML = html; }); }
  function aedH(v) { return isFinite(v) ? '<small>AED</small>' + fmt(Math.round(v)) : "n/a"; }
  function cnt(v) { return isFinite(v) ? fmt(v, v < 10 && v % 1 ? 1 : 0) : "n/a"; }
  function div(a, b) { return b ? a / b : Infinity; }
  var UE_DEF = { budget: 10000, cpc: 4, conv: 8, close: 20, deal: 15000, margin: 40, freq: 1, years: 3 };
  var aedF = function (v) { return "AED " + fmt(v, v < 100 && v % 1 ? 1 : 0); }, pctF = function (v) { return fmt(v, v % 1 ? 1 : 0) + "%"; }, numF = function (v) { return fmt(v, v % 1 ? 1 : 0); };
  var UE_F = [
    [{ k: "budget", label: "Ad budget", min: 1000, max: 100000, step: 500, fmt: aedF }, { k: "cpc", label: "Cost per click", min: .5, max: 20, step: .5, fmt: aedF }, { k: "conv", label: "Landing page conversion", min: .5, max: 25, step: .5, fmt: pctF }, { k: "close", label: "Lead to customer", min: 1, max: 60, step: 1, fmt: pctF }],
    [{ k: "deal", label: "Average deal value", min: 1000, max: 100000, step: 500, fmt: aedF }, { k: "margin", label: "Gross margin", min: 5, max: 90, step: 1, fmt: pctF }, { k: "freq", label: "Purchases per year", min: 1, max: 12, step: 1, fmt: numF }, { k: "years", label: "Years retained", min: 1, max: 10, step: 1, fmt: numF }]
  ];
  function ueCalc() {
    var u = RS.ue;
    var clicks = div(u.budget, u.cpc), leads = clicks * u.conv / 100, cust = leads * u.close / 100;
    var cpl = div(u.budget, leads), cac = div(u.budget, cust), rev = cust * u.deal, roas = div(rev, u.budget), gp = rev * u.margin / 100;
    var gpy = u.deal * u.margin / 100 * u.freq, ltv = gpy * u.years, ratio = div(ltv, cac), pay = div(cac, gpy / 12);
    setOut("clicks", cnt(clicks)); setOut("leads", cnt(leads)); setOut("cust", cnt(cust)); setOut("cpl", aedH(cpl)); setOut("cac", aedH(cac));
    setOut("rev", aedH(rev)); setOut("roas", isFinite(roas) ? fmt(roas, 1) + "<small>×</small>" : "n/a"); setOut("gp", aedH(gp)); setOut("ltv", aedH(ltv));
    setOut("ratio", isFinite(ratio) ? fmt(ratio, 1) + "<small> : 1</small>" : "n/a"); setOut("pay", isFinite(pay) ? fmt(pay, 1) + "<small> months</small>" : "n/a");
    setOut("ue-verdict", !isFinite(ratio) ? "Add customers to read the ratio." : ratio >= 3 ? "Healthy. The rule of thumb is LTV at least three times CAC." : "Below 3 : 1. Each customer costs more than the rule allows.");
  }
  function sUE(l, c, half) {
    if (!RS.ue) RS.ue = JSON.parse(JSON.stringify(UE_DEF));
    var sls = UE_F[half].map(function (f) { return slider(f, function () { return RS.ue; }, ueCalc); });
    var outs = half === 0
      ? [outEl("clicks", "Clicks"), outEl("leads", "Leads"), outEl("cust", "Customers"), outEl("cpl", "Cost per lead"), outEl("cac", "CAC · cost per customer", true)]
      : [outEl("rev", "Revenue"), outEl("roas", "ROAS"), outEl("gp", "Gross profit"), outEl("ltv", "LTV · lifetime value", true), outEl("ratio", "LTV : CAC", true), outEl("pay", "Payback")];
    var reset = h("button", { type: "button", class: "btn btn-q", onclick: function () { RS.ue = JSON.parse(JSON.stringify(UE_DEF)); rebindUE(); ueCalc(); } }, "Reset");
    var verdict = half === 1 ? h("p", { class: "ue-verdict", "data-o": "ue-verdict" }) : null;
    var head = [h("p", { class: "eyebrow" }, "Calculator · unit economics · " + (half + 1) + " of 2"), h("h2", { class: "wd-t" }, half === 0 ? "From the budget to the customer." : "What a customer is worth.")];
    var s = scene("ue", { key: "ue" + half, label: "Calculator " + (half + 1), color: c, phase: 2, kids: h("div", { class: "bx" }, head.concat([h("div", { class: "wd-grid" }, [h("div", { class: "sls" }, sls.concat([reset])), h("div", { class: "ous-w" }, [h("div", { class: "ous" }, outs), verdict])])])) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); linesIn(tl, s.inner.querySelector(".wd-t"), 0); tl.fromTo(sls, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .6, stagger: .08 }, .15); tl.fromTo(outs, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .07, ease: "power3.out" }, .3); };
    s.act = function () { ueCalc(); };
    s._sls = sls;
    return s;
  }
  function rebindUE() { SC.forEach(function (s) { if (s._sls) s._sls.forEach(function (e) { e._set(); }); }); }

  var PL_DEF = { target: 1200000, deal: 20000, close: 25, meet: 50 };
  var PL_F = [{ k: "target", label: "Revenue target a year", min: 100000, max: 10000000, step: 50000, fmt: aedF }, { k: "deal", label: "Average deal value", min: 1000, max: 200000, step: 1000, fmt: aedF }, { k: "close", label: "Close rate · meeting to deal", min: 5, max: 80, step: 1, fmt: pctF }, { k: "meet", label: "Meeting rate · enquiry to meeting", min: 5, max: 90, step: 1, fmt: pctF }];
  function plCalc() {
    var p = RS.pl, ce = function (v) { return isFinite(v) ? fmt(Math.ceil(v - 1e-9)) : "n/a"; };
    var deals = div(p.target, p.deal), meets = div(deals, p.close / 100), enq = div(meets, p.meet / 100);
    setOut("deals", ce(deals)); setOut("meets", ce(meets)); setOut("enq", ce(enq)); setOut("enqm", ce(enq / 12)); setOut("enqw", ce(enq / 52));
  }
  function sPipeline(l, c) {
    if (!RS.pl) RS.pl = JSON.parse(JSON.stringify(PL_DEF));
    var sls = PL_F.map(function (f) { return slider(f, function () { return RS.pl; }, plCalc); });
    var outs = [outEl("deals", "Deals a year"), outEl("meets", "Qualified leads (meetings) a year"), outEl("enq", "Raw enquiries a year"), outEl("enqm", "Enquiries a month", true), outEl("enqw", "Enquiries a week", true)];
    var reset = h("button", { type: "button", class: "btn btn-q", onclick: function () { RS.pl = JSON.parse(JSON.stringify(PL_DEF)); sls.forEach(function (e) { e._set(); }); plCalc(); } }, "Reset");
    var s = scene("pl", { key: "pipeline", label: "Pipeline calculator", color: c, phase: 2, kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow" }, "Calculator · the pipeline"), h("h2", { class: "wd-t" }, "Work back from the target."), h("div", { class: "wd-grid" }, [h("div", { class: "sls" }, sls.concat([reset])), h("div", { class: "ous-w" }, h("div", { class: "ous" }, outs))])]) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); linesIn(tl, s.inner.querySelector(".wd-t"), 0); tl.fromTo(sls, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: .6, stagger: .08 }, .15); tl.fromTo(outs, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .07, ease: "power3.out" }, .3); };
    s.act = function () { plCalc(); };
    return s;
  }
  function flipCard(front, back, cls) {
    var inner = h("div", { class: "fc-in" }, [h("div", { class: "fc-f fc-front" }, front), h("div", { class: "fc-f fc-back" }, back)]);
    var card = h("div", { class: "fc " + (cls || ""), role: "button", tabindex: "0", "aria-pressed": "false" }, inner);
    function flip() { var on = card.classList.toggle("flip"); card.setAttribute("aria-pressed", on ? "true" : "false"); }
    card.addEventListener("click", flip);
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    return card;
  }
  function sRole(l, c, r, i, n) {
    var card = flipCard([h("span", { class: "fc-k" }, "The buyer says"), h("p", { class: "fc-big" }, "“" + r.prompt + "”"), h("span", { class: "fc-hint" }, "Tap to turn")], [h("span", { class: "fc-k" }, "A strong reply"), h("p", { class: "fc-txt" }, r.model), h("span", { class: "fc-hint" }, "Tap to turn back")], "fc-role");
    var s = scene("role", { key: "role" + i, label: "Role play " + (i + 1), color: c, phase: 2, kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow" }, "Role play · " + (i + 1) + " of " + n + " · answer out loud, then turn"), card]) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); tl.fromTo(card, { autoAlpha: 0, rotateX: dir * 24, y: dir * 60 }, { autoAlpha: 1, rotateX: 0, y: 0, duration: 1.1, ease: "power4.out" }, 0); };
    return s;
  }
  function weekTerms(n) {
    var w = COURSE.weeks[n], seen = {}, out = [];
    if (!w) return out;
    w.lessons.forEach(function (l) { (l.terms || []).forEach(function (t) { var k = t.term.toLowerCase().trim(); if (!seen[k]) { seen[k] = 1; out.push(t); } }); });
    return out;
  }
  function sFlash(l, c, t, i, n) {
    var card = flipCard([h("span", { class: "fc-k" }, "Term"), h("p", { class: "fc-big fc-term" }, t.term), h("span", { class: "fc-hint" }, "Tap to turn")], [h("span", { class: "fc-k" }, t.term), h("p", { class: "fc-txt fc-def" }, t.def), h("span", { class: "fc-hint" }, "Tap to turn back")], "fc-flash");
    var s = scene("flash", { key: "flash" + i, label: "Flashcard " + (i + 1), color: c, phase: 2, kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow" }, "Flashcards · week " + l._w + " · " + (i + 1) + " of " + n), card]) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); tl.fromTo(card, { autoAlpha: 0, rotateY: dir * -30, x: dir * 80 }, { autoAlpha: 1, rotateY: 0, x: 0, duration: 1.1, ease: "power4.out" }, 0); };
    return s;
  }

  function sTeacher(l, c) {
    var key = h("ol", { class: "te-key" }, l.quiz.map(function (q, i) { return h("li", null, [h("b", null, "Q" + (i + 1) + " · " + "ABCD".charAt(q.answer)), h("span", null, q.options[q.answer])]); }));
    var s = scene("teacher", { key: "teacher", label: "For the teacher", color: c, phase: 3, kids: h("div", { class: "bx te-grid" }, [h("div", null, [h("p", { class: "eyebrow", "data-a": "" }, "For the teacher"), h("h2", { class: "te-t", "data-a": "" }, "Notes and the answer key."), h("p", { class: "te-notes", "data-a": "" }, l.teacherNotes)]), h("div", { "data-a": "" }, [h("p", { class: "te-kl" }, "Quiz answer key"), key])]) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); };
    return s;
  }

  function sClose(l, c) {
    var nx = LESSONS[l._k + 1], pv = LESSONS[l._k - 1];
    var hw = h("h2", { class: "cl-hw" }, l.homework);
    var chips = l.terms.map(function (t) {
      var b = h("button", { type: "button", class: "chip", "aria-expanded": "false" }, [h("span", { class: "chip-t" }, t.term), h("span", { class: "chip-d" }, t.def)]);
      b.addEventListener("click", function () {
        var open = !b.classList.contains("open");
        chips.forEach(function (o) { o.classList.remove("open"); o.setAttribute("aria-expanded", "false"); });
        if (open) { b.classList.add("open"); b.setAttribute("aria-expanded", "true"); if (ANIM) G.fromTo(b.querySelector(".chip-d"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .45 }); }
      });
      return b;
    });
    var doneB = h("button", { type: "button", class: "donesw", role: "switch", "aria-checked": S.done[l.id] ? "true" : "false" }, [h("span", { class: "ds-box", html: TICK }), h("span", { class: "ds-l" }, S.done[l.id] ? "Lesson done" : "Mark lesson done")]);
    doneB.addEventListener("click", function () {
      if (S.done[l.id]) delete S.done[l.id]; else S.done[l.id] = true;
      save("done", S.done);
      var on = !!S.done[l.id];
      doneB.setAttribute("aria-checked", on ? "true" : "false");
      doneB.querySelector(".ds-l").textContent = on ? "Lesson done" : "Mark lesson done";
      if (on) burst(doneB.querySelector(".ds-box"), c);
      railFill(true);
    });
    var next = nx ? h("a", { class: "btn-g cl-next", href: "#" + nx.id }, [h("span", { class: "cl-nx" }, [h("span", null, "Next lesson"), h("small", null, "Week " + nx._w + " · Day " + nx.day + " · " + nx.title)]), h("span", { class: "btn-ar", html: ARROW })])
      : h("a", { class: "btn-g cl-next", href: "#exam" }, [h("span", { class: "cl-nx" }, [h("span", null, "Final exam"), h("small", null, "Twenty-five questions from all eight weeks")]), h("span", { class: "btn-ar", html: ARROW })]);
    var prev = pv ? h("a", { class: "cl-prev", href: "#" + pv.id }, "Previous lesson · " + pv.title) : h("a", { class: "cl-prev", href: "#course" }, "Back to the course");
    var s = scene("close", { key: "close", label: "Close", color: c, phase: 3, kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow", "data-a": "" }, "Homework · ten minutes, due tomorrow"), h("div", { "data-a": "" }, hw), h("div", { class: "chips", "data-a": "" }, chips), h("div", { class: "cl-act", "data-a": "" }, [doneB, next]), h("div", { "data-a": "" }, prev)]) });
    s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); tl.fromTo(next, { scale: .9 }, { scale: 1, duration: 1, ease: "elastic.out(1,.6)" }, .35); };
    return s;
  }

  /* ================= GLOSSARY ================= */
  function allTerms() {
    var seen = {}, out = [];
    LESSONS.forEach(function (l) { (l.terms || []).forEach(function (t) { var k = t.term.toLowerCase().trim(); if (seen[k]) return; seen[k] = 1; out.push({ term: t.term, def: t.def, w: l._w }); }); });
    out.sort(function (a, b) { return a.term.localeCompare(b.term, "en", { sensitivity: "base" }); });
    return out;
  }
  function buildGlossChips() {
    gbarEl.innerHTML = "";
    var f = RS.gf || 0;
    var labels = ["All"].concat([1, 2, 3, 4, 5, 6, 7, 8].map(function (n) { return "Week " + n; }));
    labels.forEach(function (t, k) {
      gbarEl.appendChild(h("button", { type: "button", class: "gchip" + (k === f ? " on" : ""), "aria-pressed": k === f ? "true" : "false", style: k ? "--wc:" + wc(k) : null, onclick: function () { RS.gf = k; buildGlossChips(); mount(buildGloss(), 0); } }, t));
    });
    gbarEl.classList.add("pan-x");
  }
  function buildGloss() {
    var f = RS.gf || 0, terms = allTerms().filter(function (t) { return !f || t.w === f; }), pages = [], L = [];
    for (var i = 0; i < terms.length; i += 9) pages.push(terms.slice(i, i + 9));
    pages.forEach(function (pg, p) {
      var cards = pg.map(function (t) {
        var card = h("div", { class: "gc", role: "button", tabindex: "0", "aria-label": t.term + ", tap for the definition", style: "--wc:" + wc(t.w) + ";--wcA:" + hexa(wc(t.w), .3) }, h("div", { class: "gc-in" }, [
          h("div", { class: "gc-f" }, [h("span", { class: "gc-w" }, "Week " + t.w), h("span", { class: "gc-term" }, t.term)]),
          h("div", { class: "gc-f gc-b" }, [h("span", { class: "gc-w" }, t.term), h("span", { class: "gc-def" }, t.def)])
        ]));
        function act() {
          if (NARROW) { openGlossCard(t); return; }
          card.classList.toggle("flip");
        }
        card.addEventListener("click", act);
        card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
        return card;
      });
      var head = h("div", { class: "gl-head" }, [h("h2", { class: "gl-t" }, f ? "Glossary · week " + f : "Glossary"), h("span", { class: "gl-p" }, "Page " + (p + 1) + " of " + pages.length + " · " + terms.length + " terms")]);
      var s = scene("gloss", { key: "g" + p, label: "Glossary page " + (p + 1), color: f ? wc(f) : WC[(p * 3) % 8], kids: h("div", { class: "bx bx-wide" }, [head, h("div", { class: "gl-grid" + (pg.length === 9 ? "" : " part") }, cards)]) });
      s.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); tl.fromTo(head, { autoAlpha: 0, y: dir * 20 }, { autoAlpha: 1, y: 0, duration: .6 }, 0); tl.fromTo(cards, { autoAlpha: 0, y: dir * 50, rotateX: dir * -20 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: .8, stagger: { each: .05, grid: "auto", from: dir > 0 ? "start" : "end" }, ease: "power3.out", clearProps: "transform" }, .05); };
      s.deact = function () { cards.forEach(function (c) { c.classList.remove("flip"); }); };
      L.push(s);
    });
    if (!L.length) L.push(scene("gloss", { key: "g0", label: "Glossary", color: WC[0], kids: h("div", { class: "bx" }, h("h2", { class: "gl-t" }, "No terms yet.")) }));
    return L;
  }
  function openGlossCard(t) {
    var card = h("div", { class: "ovc", style: "--wc:" + wc(t.w) + ";--wcA:" + hexa(wc(t.w), .3) }, h("div", { class: "ovc-in" }, [
      h("div", { class: "ovc-f" }, [h("span", { class: "gc-w" }, "Week " + t.w), h("span", { class: "ovc-term" }, t.term)]),
      h("div", { class: "ovc-f ovc-b" }, [h("span", { class: "gc-w" }, t.term), h("span", { class: "ovc-def" }, t.def), h("span", { class: "fc-hint" }, "Tap or swipe to close")])
    ]));
    openOv(card);
    if (ANIM) {
      G.fromTo(ovEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 });
      G.fromTo(card.firstChild, { rotateY: 0, scale: .7 }, { rotateY: 180, scale: 1, duration: .9, ease: "power3.inOut" });
    } else card.firstChild.style.transform = "rotateY(180deg)";
  }

  /* ================= EXAM ================= */
  function buildExam() {
    if (!RS.exam) {
      var pool = [];
      LESSONS.forEach(function (l) { l.quiz.forEach(function (q) { pool.push({ q: q, w: l._w }); }); });
      RS.exam = { pick: shuffle(pool).slice(0, 25) };
      RS.g = RS.g || {}; delete RS.g.exam;
    }
    var pick = RS.exam.pick, L = [];
    var g = grp("exam", pick.length, function (x) { if (S.exam == null || x > S.exam) { S.exam = x; save("exam", S.exam); } refreshResult(); });
    g.right = function () { var r = 0; pick.forEach(function (p, i) { if (g.answers[i] === p.q.answer) r++; }); return r; };
    g.onAny = function () { if (RS.refreshResult) RS.refreshResult(); };
    var intro = scene("xintro", { key: "xintro", label: "Final exam", color: WC[7], kids: h("div", { class: "bx" }, [h("p", { class: "eyebrow", "data-a": "" }, "Final exam"), h("h1", { class: "x-t", "data-a": "" }, "Twenty-five questions. All eight weeks."), h("p", { class: "x-p", "data-a": "" }, "One question per scene. Tap an answer to mark it. Your best score is kept on this device."), h("p", { class: "x-best", "data-a": "" }, S.exam != null ? "Best so far · " + S.exam + " of 25" : "No score yet")]) });
    intro.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); };
    L.push(intro);
    pick.forEach(function (p, i) { L.push(sQuestion({ q: p.q, c: wc(p.w), phase: -1, label: "Final exam · week " + p.w, i: i, g: g, key: "x" + i })); });
    var cells = h("div", { class: "xr-cells", "aria-hidden": "true" }, pick.map(function () { return h("i"); }));
    var big = h("p", { class: "xr-n" }), msg = h("p", { class: "xr-m" }), best = h("p", { class: "xr-b" });
    var again = h("button", { type: "button", class: "btn-g xr-again", onclick: function () { RS.exam = null; mount(buildExam(), 1); } }, [h("span", null, "Try again"), h("span", { class: "btn-ar", html: ARROW })]);
    var res = scene("xresult", { key: "xresult", label: "Result", color: WC[5], kids: h("div", { class: "bx xr-grid" }, [h("div", null, [h("p", { class: "eyebrow", "data-a": "" }, "Final exam · result"), h("div", { "data-a": "" }, big), h("div", { "data-a": "" }, msg), h("div", { "data-a": "" }, best), h("div", { class: "xr-act", "data-a": "" }, [again, h("a", { class: "btn-o", href: "#course" }, "Back to the course")])]), h("div", { "data-a": "" }, cells)]) });
    function refreshResult() {
      var answered = 0; for (var i = 0; i < pick.length; i++) if (g.answers[i] != null) answered++;
      var r = g.right();
      big.innerHTML = r + "<small>/" + pick.length + "</small>";
      var un = pick.length - answered;
      qa(cells, "i").forEach(function (c, k) { c.className = g.answers[k] == null ? "" : g.answers[k] === pick[k].q.answer ? "ok" : "no"; });
      msg.textContent = answered < pick.length ? un + (un === 1 ? " question" : " questions") + " still unanswered. Go back to finish " + (un === 1 ? "it." : "them.") : r >= 22 ? "Outstanding. You can hold this room." : r >= 18 ? "Strong. Review the weeks you missed and go again." : r >= 13 ? "A pass. Go back over the weeks behind the misses." : "Not yet. Re-run the week quizzes, then try again.";
      best.textContent = S.exam != null ? "Best score · " + S.exam + " of 25" : "Best score is saved once all 25 are answered.";
    }
    RS.refreshResult = refreshResult;
    res.play = function (s, dir) { var tl = s.tl = G.timeline({ delay: .3 }); reveal(tl, s, dir, 0); tl.fromTo(qa(cells, "i"), { scale: 0 }, { scale: 1, duration: .45, stagger: .03, ease: "back.out(2.5)" }, .3); var o = { v: 0 }, r = g.right(); tl.fromTo(o, { v: 0 }, { v: r, duration: 1.2, ease: "power3.out", onUpdate: function () { big.innerHTML = Math.round(o.v) + "<small>/" + pick.length + "</small>"; } }, .1); };
    res.act = function () { refreshResult(); if (g.right() === pick.length && ANIM) setTimeout(function () { burst(big, WC[5]); }, 900); };
    refreshResult();
    L.push(res);
    return L;
  }

  /* ================= router ================= */
  function buildFor(r) {
    if (r === "home") return buildHome();
    if (r === "glossary") return buildGloss();
    if (r === "exam") return buildExam();
    if (r === "course") return buildCourse();
    return buildLesson(BYID[r]);
  }
  var prevRoute = null;
  function render() {
    var hs = (location.hash || "").replace(/^#/, "") || "home";
    if (hs !== "home" && hs !== "glossary" && hs !== "exam" && hs !== "course" && !BYID[hs]) hs = "home";
    if (hs !== ROUTE) {
      if (RS.clean) RS.clean.forEach(function (f) { try { f(); } catch (e) {} });
      prevRoute = ROUTE;
      RS = { clean: [] };
    }
    ROUTE = hs;
    ROUTEKIND = hs === "home" ? "home" : hs === "glossary" ? "gloss" : hs === "exam" ? "exam" : hs === "course" ? "course" : "lesson";
    NARROW = W.innerWidth < 760;
    var rail = ROUTEKIND === "lesson" || ROUTEKIND === "course";
    body.className = "r-" + ROUTEKIND + (NARROW ? " narrow" : "") + (rail ? " has-rail" : "");
    D.querySelector("#hdr .wm").setAttribute("href", ROUTEKIND === "home" ? "#home" : "#course");
    railEl.innerHTML = "";
    if (ROUTEKIND === "lesson") buildRail(BYID[hs]._w, BYID[hs].day);
    else if (ROUTEKIND === "course") { var nu = nextUndone() || LESSONS[0]; buildRail(nu._w, nu.day); }
    stripEl.innerHTML = ""; gbarEl.innerHTML = "";
    if (ROUTEKIND === "lesson") buildStrip(BYID[hs]);
    if (ROUTEKIND === "gloss") buildGlossChips();
    if (ROUTEKIND === "home") startClock();
    var list = buildFor(hs), start = 0;
    if (ROUTEKIND === "course") { if (pendingWeek) start = pendingWeek; else if (prevRoute && BYID[prevRoute]) start = BYID[prevRoute]._w; pendingWeek = 0; }
    mount(list, start);
    syncTeacher();
    D.title = ROUTEKIND === "lesson" ? BYID[hs].title + " · Forty Half Hours" : ROUTEKIND === "gloss" ? "Glossary · Forty Half Hours" : ROUTEKIND === "exam" ? "Final exam · Forty Half Hours" : ROUTEKIND === "course" ? "The course · Forty Half Hours" : "Forty Half Hours";
  }
  function rebuild() {
    var key = SC[cur] && SC[cur].key, was = cur;
    NARROW = W.innerWidth < 760;
    body.classList.toggle("narrow", NARROW);
    if (ROUTEKIND === "lesson") buildRail(BYID[ROUTE]._w, BYID[ROUTE].day);
    else if (ROUTEKIND === "course") { var nu2 = nextUndone() || LESSONS[0]; buildRail(nu2._w, nu2.day); }
    var list = buildFor(ROUTE), idx = -1;
    for (var i = 0; i < list.length; i++) if (list[i].key === key) { idx = i; break; }
    if (idx < 0 && key === "teacher") { for (var j = 0; j < list.length; j++) if (list[j].key === "close") idx = j; }
    if (idx < 0 && /^case/.test(key || "")) { for (var k = 0; k < list.length; k++) if (/^case/.test(list[k].key)) { idx = k; break; } }
    if (idx < 0) idx = Math.min(was, list.length - 1);
    mount(list, idx, true);
  }
  var lastW = W.innerWidth, lastH = W.innerHeight, rzT = 0;
  W.addEventListener("resize", function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      if (W.innerWidth === lastW && Math.abs(W.innerHeight - lastH) < 120) return;
      lastW = W.innerWidth; lastH = W.innerHeight;
      rebuild();
    }, 180);
  });
  W.addEventListener("hashchange", render);

  var booted = false;
  function boot() { if (booted) return; booted = true; render(); }
  try {
    if (D.fonts && D.fonts.load) {
      Promise.all(["800 64px 'Bricolage Grotesque'", "500 20px Manrope", "700 20px Manrope", "400 20px 'JetBrains Mono'", "200 64px 'JetBrains Mono'"].map(function (f) { return D.fonts.load(f); })).then(boot, boot);
      setTimeout(boot, 3000);
    } else boot();
  } catch (e) { boot(); }
})();
