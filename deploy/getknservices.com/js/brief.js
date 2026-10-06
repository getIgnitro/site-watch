/* brief.js - KN v5 website brief (brief.html). One brief per paid website plan; our team builds the first
   draft from it. Plain script, no build step. Answers are saved on the device as the customer goes
   (localStorage kn_brief_v1). Files go to brief.php one at a time, the moment they are picked.
   QA helpers: ?stub=1 answers every brief.php call in the page (stub=failsend / failup / fail for errors);
   &step=<n>&demo=1 jumps to a step with sample answers (never saved); &step=done&demo=1 shows the receipt. */
(function () {
  'use strict';
  window.__dtLive = true;
  var d = document, root = d.documentElement, main = d.getElementById('main');
  var KEY = 'kn_brief_v1', API = 'brief.php', MB = 1024 * 1024;
  var PLANS = {
    launch:   { name: 'Launch',   days: 3,  mail: 1, price: 99 },
    business: { name: 'Business', days: 5,  mail: 3, price: 179 },
    pro:      { name: 'Pro',      days: 7,  mail: 5, price: 329 },
    store:    { name: 'Store',    days: 10, mail: 5, price: 499 }
  };
  var EXPECT = { launch: [7, 26], business: [8, 32], pro: [8, 38], store: [8, 35] };
  var EXT = /\.(jpe?g|png|webp|gif|heic|pdf|csv|xlsx|xls|docx?|txt)$/i;
  var IMG_EXT = /\.(jpe?g|png|webp|gif|heic)$/i;
  var P = new URLSearchParams(location.search);
  var STUB = P.get('stub') || '', DEMO = P.get('demo') === '1';

  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tok() { var a = new Uint8Array(16); (window.crypto || window.msCrypto).getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function rid() { return Math.random().toString(36).slice(2, 10); }
  function low(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function has(v) { return v != null && String(v).trim() !== ''; }
  function isMail(v) { return /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(String(v || '').trim()); }
  function lines(arr) { return arr.filter(function (x) { return has(x); }).join('\n'); }
  function money(n) { return '$' + n; }

  /* ---------- state ---------- */
  var S = load() || {};
  if (!/^[0-9a-f]{32}$/.test(S.token || '')) S.token = tok();
  S.a = S.a || {}; S.f = S.f || {}; S.step = S.step || 0; S.max = S.max || 0;
  var ui = { err: {}, exp: {}, sending: false, msg: '' };
  var urlPlan = P.get('plan');
  if (PLANS[urlPlan]) { if (S.plan && S.plan !== urlPlan) { S.step = 0; S.max = 0; } S.plan = urlPlan; }
  else if (!PLANS[S.plan]) S.plan = '';

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save() {
    if (DEMO) return;
    var f = {};
    Object.keys(S.f).forEach(function (k) { f[k] = (S.f[k] || []).filter(function (x) { return x.st === 'ok' || x.st === 'rm'; }).map(function (x) { return { id: x.id, name: x.name, stored: x.stored, size: x.size, img: x.img, thumb: x.thumb, st: 'ok' }; }); });
    var o = { v: 1, token: S.token, plan: S.plan, step: S.step, max: S.max, a: S.a, f: f };
    try { localStorage.setItem(KEY, JSON.stringify(o)); }
    catch (e) { // over quota: keep answers, drop thumbnails
      try { Object.keys(f).forEach(function (k) { f[k].forEach(function (x) { delete x.thumb; }); }); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e2) {}
    }
  }
  function A(id) { return S.a[id] || (S.a[id] = {}); }
  function val(id, k) { var a = S.a[id]; return a && a[k] != null ? a[k] : ''; }
  function on(id, k, v) { var x = val(id, k); return Array.isArray(x) ? x.indexOf(v) > -1 : x === v; }
  function files(key) { return (S.f[key] || []).filter(function (x) { return x.st === 'ok'; }); }

  /* ---------- building blocks (HTML strings, bound by data attributes) ---------- */
  function inp(id, k, ph, o) {
    o = o || {};
    return '<input' + (o.full ? ' class="full"' : '') + ' type="' + (o.type || 'text') + '" data-k="' + id + '|' + k + '" value="' + esc(val(id, k)) +
      '" placeholder="' + esc(ph) + '" aria-label="' + esc(o.al || ph) + '"' + (o.ac ? ' autocomplete="' + o.ac + '"' : '') +
      (o.im ? ' inputmode="' + o.im + '"' : '') + ' maxlength="' + (o.max || 300) + '">';
  }
  function ta(id, k, ph, o) {
    o = o || {};
    return '<textarea class="full' + (o.sm ? ' sm' : '') + '" data-k="' + id + '|' + k + '" placeholder="' + esc(ph) + '" aria-label="' + esc(o.al || ph) + '" maxlength="' + (o.max || 4000) + '">' + esc(val(id, k)) + '</textarea>';
  }
  function sel(id, k, opts, ph) {
    return '<select data-k="' + id + '|' + k + '" aria-label="' + esc(ph) + '"><option value="">' + esc(ph) + '</option>' +
      opts.map(function (v) { return '<option' + (val(id, k) === v ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') + '</select>';
  }
  function pick(id, k, opts, o) {
    o = o || {};
    return '<div class="chs" role="group" aria-label="' + esc(o.al || 'Choices') + '">' + opts.map(function (v) {
      var is = on(id, k, v);
      return '<button type="button" class="bch' + (is ? ' on' : '') + '" data-p="' + id + '|' + k + '" data-v="' + esc(v) + '"' +
        (o.multi ? ' data-max="' + (o.max || 99) + '"' : '') + (o.toggle ? ' data-t="1"' : '') + ' aria-pressed="' + is + '">' + esc(v) + '</button>';
    }).join('') + '</div>';
  }
  function fm(html) { return '<div class="fm">' + html + '</div>'; }
  function sub(t) { return '<p class="bf-sub">' + esc(t) + '</p>'; }

  /* uploads: key = where the list lives in S.f, slot = the brief.php slot */
  var UPQ = {}, SLOT = {};
  function up(qid, key, slot, o) {
    UPQ[key] = qid; SLOT[key] = slot;
    var fs = S.f[key] || [], ok = files(key), busy = fs.filter(function (x) { return x.st === 'q' || x.st === 'up'; }).length;
    var single = o.max === 1, last = ok[ok.length - 1];
    var tag = busy ? 'Uploading' : single ? (last ? 'Uploaded' : '') : (ok.length ? ok.length + ' added' : 'Up to ' + o.max);
    var icon = '<span class="up__plus" aria-hidden="true">+</span>', t = o.title, dsc = o.desc;
    if (single && last && !busy) {
      icon = '<span class="up__logo" aria-hidden="true">' + (last.thumb ? '<img src="' + esc(last.thumb) + '" alt="">' : esc((last.name.split('.').pop() || '').toUpperCase().slice(0, 4))) + '</span>';
      t = last.name; dsc = 'Uploaded. Tap to replace it.';
    }
    var h = '<label class="up" data-drop="' + key + '">' + icon + '<div><p class="up__t">' + esc(t) + '</p><p class="up__d">' + esc(dsc) + '</p></div>' +
      '<span class="up__x">' + esc(tag) + '</span><input type="file" data-up="' + key + '" data-max="' + o.max + '"' + (single ? '' : ' multiple') +
      ' accept="' + (o.img ? 'image/*,.heic' : slot === 'logo' ? 'image/*,.heic,.pdf' : 'image/*,.heic,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt') + '" aria-label="' + esc(o.title) + '"></label>';
    var shown = fs.filter(function (x) { return !(single && x === last && x.st === 'ok' && !busy); });
    if (single && last && !busy) h += '<button type="button" class="bf-rm" style="justify-self:start" data-rm="' + key + '|' + last.id + '" aria-label="Remove ' + esc(last.name) + '">Remove this file</button>';
    var imgs = shown.filter(function (x) { return x.img; }), docs = shown.filter(function (x) { return !x.img; });
    if (imgs.length) {
      var lim = ui.exp[key] ? imgs.length : 8, more = imgs.length - lim;
      if (more === 1) { lim++; more = 0; }
      h += '<div class="ths">' + imgs.slice(0, lim).map(function (x) { return tile(key, x); }).join('') +
        (more > 0 ? '<button type="button" class="more" data-more="' + key + '" aria-label="Show all ' + imgs.length + ' photos">+' + more + '</button>' : '') + '</div>';
    }
    if (docs.length) h += '<ul class="fls">' + docs.map(function (x) { return row(key, x); }).join('') + '</ul>';
    return h;
  }
  function kb(n) { return n >= MB ? (n / MB).toFixed(1) + ' MB' : Math.max(1, Math.round((n || 0) / 1024)) + ' KB'; }
  function stText(x) { return x.st === 'q' ? 'Waiting' : x.st === 'up' ? 'Uploading' : x.st === 'rm' ? 'Removing' : x.st === 'err' ? (x.msg || 'Not uploaded. Try again.') : ''; }
  function tile(key, x) {
    var st = stText(x);
    return '<div class="th' + (x.st === 'err' ? ' is-err' : x.st !== 'ok' ? ' is-up' : '') + '">' + (x.thumb ? '<img src="' + esc(x.thumb) + '" alt="">' : '') +
      (x.thumb ? '' : '<span class="th__n">' + esc(x.name) + '</span>') + (st ? '<span class="th__s">' + esc(st) + '</span>' : '') +
      (x.st === 'err' && MEM[x.id] ? '<button type="button" class="th__x" data-retry="' + key + '|' + x.id + '" aria-label="Try ' + esc(x.name) + ' again" style="right:44px">&#8635;</button>' : '') +
      (x.st === 'up' || x.st === 'rm' ? '' : '<button type="button" class="th__x" data-rm="' + key + '|' + x.id + '" aria-label="Remove ' + esc(x.name) + '">&times;</button>') + '</div>';
  }
  function row(key, x) {
    var st = stText(x);
    return '<li' + (x.st === 'err' ? ' class="is-err"' : '') + '><span>' + esc(x.name) + '</span><small>' + esc(st || kb(x.size)) + '</small>' +
      (x.st === 'err' && MEM[x.id] ? '<button type="button" class="bf-rm" data-retry="' + key + '|' + x.id + '">Try again</button>' : '') +
      (x.st === 'up' || x.st === 'rm' ? '' : '<button type="button" class="bf-rm" data-rm="' + key + '|' + x.id + '" aria-label="Remove ' + esc(x.name) + '">Remove</button>') + '</li>';
  }
  function upText(key) { var f = files(key); return f.length ? 'Uploaded (' + f.length + '): ' + f.map(function (x) { return x.stored || x.name; }).join(', ') : ''; }

  /* ---------- the questions ---------- */
  var TRADES = ['Restaurant or cafe', 'Bakery', 'Barber or salon', 'Dental or medical', 'Auto repair', 'Home services', 'Retail shop', 'Fitness', 'Professional services', 'Other'];
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var LOOKS = [
    ['bakery', 'Warm and handmade', 'Rich photos, serif type, a slow feel'],
    ['barber', 'Dark and classic', 'Deep colors, gold details, quiet'],
    ['dental', 'Light and clean', 'White space, soft color, calm'],
    ['garage', 'Bold and strong', 'Big type, high contrast, direct']
  ];
  var PROOF = [['Years in business', 'For example: family business since 2009'], ['Licensed', 'License number and who issued it'], ['Insured', 'Insured with, and for what'], ['Awards', 'Which award, and the year'], ['Guarantee', 'What you guarantee, in one line']];

  function Q(id, l, o, r, ok, tx) { o = o || {}; return { id: id, l: l, hint: o.hint || '', opt: !!o.opt, r: r, ok: ok, tx: tx }; }
  function pairs(id, n, a, b) { var h = ''; for (var i = 0; i < n; i++) h += inp(id, 'q' + i, a + ' ' + (i + 1)) + inp(id, 'a' + i, b); return h; }
  function cnt(id, pre, n) { var c = 0; for (var i = 0; i < n; i++) if (has(val(id, pre + i))) c++; return c; }
  function list(id, pre, n, lbl) { var o = []; for (var i = 0; i < n; i++) if (has(val(id, pre + i))) o.push((lbl ? lbl(i) : (i + 1) + '. ') + val(id, pre + i)); return lines(o); }
  function svcs(id, n, start) {
    var h = '';
    for (var i = 0; i < n; i++) h += sub('Page ' + (start + i)) + inp(id, 'n' + i, 'Service name', { full: true, al: 'Service ' + (start + i) + ' name' }) + ta(id, 'l' + i, 'Two or three lines about it (optional)', { sm: true, al: 'Service ' + (start + i) + ' lines, optional' });
    return fm(h);
  }
  function svcText(id, n) { var o = []; for (var i = 0; i < n; i++) if (has(val(id, 'n' + i))) o.push((i + 1) + '. ' + val(id, 'n' + i) + (has(val(id, 'l' + i)) ? ': ' + val(id, 'l' + i).replace(/\s*\n\s*/g, ' ') : ' (lines: write them from my answers)')); return lines(o); }
  function faqQ(id) {
    return Q(id, 'The 5 questions customers always ask, with your answers', {},
      function () { return pick(id, 'm', ['I will type them', 'Write them from my answers'], { al: 'How to answer' }) + (val(id, 'm') === 'I will type them' ? fm(pairs(id, 5, 'Question', 'Your answer')) : ''); },
      function () { return val(id, 'm') === 'Write them from my answers' || (val(id, 'm') === 'I will type them' && has(val(id, 'q0'))); },
      function () { if (val(id, 'm') !== 'I will type them') return val(id, 'm'); var o = []; for (var i = 0; i < 5; i++) if (has(val(id, 'q' + i))) o.push('Q: ' + val(id, 'q' + i) + '\nA: ' + (val(id, 'a' + i) || '(no answer given)')); return o.join('\n'); });
  }
  function contactQ(id, l) {
    return Q(id, l, {}, function () { return fm(inp(id, 'e', 'Email', { type: 'email', ac: 'email', im: 'email' }) + inp(id, 'm', 'Mobile', { type: 'tel', ac: 'tel', im: 'tel' })); },
      function () { return isMail(val(id, 'e')) && has(val(id, 'm')); }, function () { return lines(['Email: ' + val(id, 'e'), 'Mobile: ' + val(id, 'm')]); });
  }
  function seoQ(id) {
    return Q(id, 'The 5 searches you want to be found for, and 3 competitors you watch', { hint: 'At least one search. Write it the way a customer types it into Google.' },
      function () { var h = sub('Searches'); for (var i = 0; i < 5; i++) h += inp(id, 's' + i, 'Search ' + (i + 1), { full: i === 0 }); h += sub('Competitors (optional)'); for (var j = 0; j < 3; j++) h += inp(id, 'c' + j, 'Competitor ' + (j + 1) + ', name or website', { full: j === 2 }); return fm(h); },
      function () { return cnt(id, 's', 5) > 0; },
      function () { return lines(['Searches:\n' + list(id, 's', 5), cnt(id, 'c', 3) ? 'Competitors:\n' + list(id, 'c', 3) : 'Competitors: none given']); });
  }

  function build(plan) {
    var pl = PLANS[plan], store = plan === 'store';
    var steps = [];
    steps.push({ t: 'Your business', h: 'Your <em>business</em>', nx: 'your customers', qs: [
      Q('name', 'Business name, as it should appear on the site', {},
        function () { return fm(inp('name', 'v', 'Business name', { full: true, ac: 'organization', max: 120 })); },
        function () { return has(val('name', 'v')); }, function () { return val('name', 'v'); }),
      Q('trade', 'Your trade, and what you do in one line', {},
        function () { return fm(sel('trade', 't', TRADES, 'Pick your trade') + (val('trade', 't') === 'Other' ? inp('trade', 'o', 'Your trade') : '') + inp('trade', 'l', 'What you do, in one line', { full: val('trade', 't') === 'Other' })); },
        function () { return has(val('trade', 't')) && has(val('trade', 'l')) && (val('trade', 't') !== 'Other' || has(val('trade', 'o'))); },
        function () { return lines(['Trade: ' + (val('trade', 't') === 'Other' ? 'Other: ' + val('trade', 'o') : val('trade', 't')), 'What we do: ' + val('trade', 'l')]); }),
      Q('where', 'Where do customers find you?', {},
        function () { var m = val('where', 'm'); return pick('where', 'm', ['They come to us', 'We go to them', 'Both'], { al: 'Where customers find you' }) +
          (m === 'They come to us' || m === 'Both' ? fm(inp('where', 'ad', 'Street address, town, state, ZIP', { full: true, ac: 'street-address' })) : '') +
          (m === 'We go to them' || m === 'Both' ? fm(inp('where', 'tw', 'The towns you travel to', { full: true })) : ''); },
        function () { var m = val('where', 'm'); return (m === 'They come to us' && has(val('where', 'ad'))) || (m === 'We go to them' && has(val('where', 'tw'))) || (m === 'Both' && has(val('where', 'ad')) && has(val('where', 'tw'))); },
        function () { var m = val('where', 'm'); return lines([m, m !== 'We go to them' ? 'Address: ' + val('where', 'ad') : '', m !== 'They come to us' ? 'Towns we travel to: ' + val('where', 'tw') : '']); }),
      Q('contact', 'Phone and email your customers should use', {},
        function () { return fm(inp('contact', 'p', 'Phone', { type: 'tel', ac: 'tel', im: 'tel' }) + inp('contact', 'e', 'Email', { type: 'email', ac: 'email', im: 'email' })); },
        function () { return has(val('contact', 'p')) && isMail(val('contact', 'e')); },
        function () { return lines(['Phone: ' + val('contact', 'p'), 'Email: ' + val('contact', 'e')]); }),
      Q('hours', 'Opening hours', { hint: 'Type the times, or mark the day closed.' },
        function () {
          var h = '<div class="hrs">';
          DAYS.forEach(function (dn, i) {
            var x = val('hours', 'x' + i) === '1';
            h += '<div class="hr' + (x ? ' off' : '') + '"><b>' + dn + '</b>' + inp('hours', 'o' + i, 'Opens', { al: dn + ' opens', max: 20 }) + inp('hours', 'c' + i, 'Closes', { al: dn + ' closes', max: 20 }) +
              '<button type="button" class="hr__c" data-p="hours|x' + i + '" data-v="1" data-t="1" aria-pressed="' + x + '" aria-label="' + dn + ' closed">Closed</button></div>';
          });
          return h + '</div><button type="button" class="bf-link" data-copy="hours">Copy Monday to Tuesday through Friday</button>' + pick('hours', 'ap', ['By appointment only'], { toggle: true, al: 'Appointments' });
        },
        function () { if (val('hours', 'ap')) return true; for (var i = 0; i < 7; i++) if (!(val('hours', 'x' + i) === '1' || (has(val('hours', 'o' + i)) && has(val('hours', 'c' + i))))) return false; return true; },
        function () { var o = DAYS.map(function (dn, i) { return dn + ': ' + (val('hours', 'x' + i) === '1' ? 'Closed' : has(val('hours', 'o' + i)) ? val('hours', 'o' + i) + ' to ' + val('hours', 'c' + i) : 'not given'); }); if (val('hours', 'ap')) o.push('By appointment only'); return o.join('\n'); }),
      Q('proof', 'Proof you can show', { opt: true, hint: 'Optional. Only what is true today. We show it exactly as you give it.' },
        function () { var picked = val('proof', 'p') || []; return pick('proof', 'p', PROOF.map(function (x) { return x[0]; }), { multi: true, al: 'Proof you can show' }) +
          (picked.length ? fm(PROOF.filter(function (x) { return picked.indexOf(x[0]) > -1; }).map(function (x, i, arr) { return inp('proof', x[0], x[1], { al: x[0] + ': ' + x[1], full: arr.length % 2 === 1 && i === arr.length - 1 }); }).join('')) : ''); },
        function () { var p = val('proof', 'p') || []; return p.length > 0 && p.every(function (k) { return has(val('proof', k)); }); },
        function () { return lines((val('proof', 'p') || []).map(function (k) { return k + ': ' + (val('proof', k) || '(no detail given)'); })); })
    ] });

    steps.push({ t: 'Your customers', h: 'Your <em>customers</em>', nx: 'what you sell', qs: [
      Q('who', 'Who is your best customer?', { hint: 'Pick up to 2, then describe them in one line.' },
        function () { return pick('who', 'p', ['Homeowners', 'Families', 'Businesses', 'Walk-ins', 'Visitors and tourists', 'Other'], { multi: true, max: 2, al: 'Best customer, up to 2' }) + fm(inp('who', 'l', 'Describe them in one line', { full: true })); },
        function () { return (val('who', 'p') || []).length > 0 && has(val('who', 'l')); },
        function () { return lines(['Picked: ' + (val('who', 'p') || []).join(', '), 'In one line: ' + val('who', 'l')]); }),
      Q('why', 'Why do customers choose you over the others in town?', { hint: 'Pick up to 3, then say it in one line.' },
        function () { return pick('why', 'p', ['Price', 'Speed', 'Quality', 'Years of experience', 'Family-owned', 'Guarantee', 'Open late or weekends', 'Friendly service', 'Other'], { multi: true, max: 3, al: 'Why customers choose you, up to 3' }) + fm(inp('why', 'l', 'Say it in one line, in your words', { full: true })); },
        function () { return (val('why', 'p') || []).length > 0 && has(val('why', 'l')); },
        function () { return lines(['Picked: ' + (val('why', 'p') || []).join(', '), 'In one line: ' + val('why', 'l')]); })
    ] });

    var sell = store
      ? Q('sell', 'Your products', { hint: 'One row per product: name, price, category, options, stock, photo file name. <a href="assets/brief/product-sheet-template.csv" download>Download our template</a>.' },
          function () { var m = val('sell', 'm'); return pick('sell', 'm', ['Upload the product sheet', 'Export from my current shop'], { al: 'How you send your products' }) +
            (m === 'Export from my current shop' ? pick('sell', 'shop', ['Shopify', 'Etsy', 'Square', 'WooCommerce', 'Other'], { al: 'Your current shop' }) : '') +
            (m ? up('sell', 'products', 'products', { max: 5, title: m === 'Upload the product sheet' ? 'Add your product sheet' : 'Add your export file', desc: 'CSV or Excel. Tap to choose the file.' }) : ''); },
          function () { var m = val('sell', 'm'); return files('products').length > 0 && (m === 'Upload the product sheet' || (m === 'Export from my current shop' && has(val('sell', 'shop')))); },
          function () { var m = val('sell', 'm'); return lines([m + (m === 'Export from my current shop' ? ' (' + val('sell', 'shop') + ')' : ''), upText('products')]); })
      : Q('sell', 'Your services or products, with prices', {},
          function () { var m = val('sell', 'm'); return pick('sell', 'm', ['I will type them', 'I will upload a price list', 'No prices on the site'], { al: 'How you send your prices' }) +
            (m === 'I will type them' ? fm(ta('sell', 'list', 'One per line: name, price', { al: 'Services or products, one per line: name, price' })) : '') +
            (m === 'I will upload a price list' ? up('sell', 'pricelist', 'pricelist', { max: 3, title: 'Add your price list', desc: 'PDF, photo, Word or Excel.' }) : '') +
            (m === 'No prices on the site' ? fm(ta('sell', 'names', 'One per line: the names only', { al: 'Services or products, names only, one per line' })) : ''); },
          function () { var m = val('sell', 'm'); return (m === 'I will type them' && has(val('sell', 'list'))) || (m === 'I will upload a price list' && files('pricelist').length > 0) || (m === 'No prices on the site' && has(val('sell', 'names'))); },
          function () { var m = val('sell', 'm'); return lines([m, m === 'I will type them' ? val('sell', 'list') : m === 'No prices on the site' ? val('sell', 'names') : upText('pricelist')]); });
    steps.push({ t: 'What you sell', h: 'What you <em>sell</em>', nx: 'your look', qs: [
      sell,
      Q('top', 'The 3 you most want to sell', { hint: 'At least one.' },
        function () { return fm(inp('top', 'v0', 'First', { full: true, al: 'First one you most want to sell' }) + inp('top', 'v1', 'Second') + inp('top', 'v2', 'Third')); },
        function () { return cnt('top', 'v', 3) > 0; }, function () { return list('top', 'v', 3); }),
      Q('offer', 'Any offer running now?', { opt: true, hint: 'Optional.' },
        function () { return fm(inp('offer', 'v', 'For example: 10% off your first order', { full: true, al: 'Offer running now' })); },
        function () { return has(val('offer', 'v')); }, function () { return val('offer', 'v'); })
    ] });

    steps.push({ t: 'Your look and photos', h: 'Your <em>look</em>', nx: 'your words', qs: [
      Q('logo', 'Your logo', { hint: 'Upload the biggest one you have, or let us make a simple one.' },
        function () { return up('logo', 'logo', 'logo', { max: 1, img: false, title: 'Add your logo', desc: 'PNG, JPG or PDF. Tap to choose the file.' }) + pick('logo', 'none', ['I have none. Make a simple one from my name.'], { toggle: true, al: 'No logo' }); },
        function () { return files('logo').length > 0 || has(val('logo', 'none')); },
        function () { return files('logo').length ? upText('logo') : val('logo', 'none'); }),
      Q('colors', 'Your colors', {},
        function () { return pick('colors', 'm', ['Match my logo', 'I will pick', 'You choose'], { al: 'Your colors' }) +
          (val('colors', 'm') === 'I will pick' ? fm('<label>Main color' + inp('colors', 'c1', '', { type: 'color', al: 'Main color' }).replace('value=""', 'value="#1f3a5f"') + '</label><label>Second color' + inp('colors', 'c2', '', { type: 'color', al: 'Second color' }).replace('value=""', 'value="#eb7e3b"') + '</label>') : ''); },
        function () { return has(val('colors', 'm')); },
        function () { var m = val('colors', 'm'); return m === 'I will pick' ? 'I will pick: ' + (val('colors', 'c1') || '#1f3a5f') + ' and ' + (val('colors', 'c2') || '#eb7e3b') : m; }),
      Q('look', 'Which look is closest to you?', { hint: 'Four of our sample sites. Pick the feeling, not the trade.' },
        function () { return '<div class="lks" role="group" aria-label="Looks">' + LOOKS.map(function (x) { var is = val('look', 'v') === x[1];
          return '<button type="button" class="lk' + (is ? ' on' : '') + '" data-p="look|v" data-v="' + esc(x[1]) + '" aria-pressed="' + is + '"><img src="assets/scenes/' + x[0] + '.jpg" alt=""><span class="lk__b"><span>' + esc(x[1]) + '<small>' + esc(x[2]) + '</small></span><i class="lk__tick" aria-hidden="true"></i></span></button>'; }).join('') + '</div>'; },
        function () { return has(val('look', 'v')); }, function () { var v = val('look', 'v'); var x = LOOKS.filter(function (l) { return l[1] === v; })[0]; return x ? v + ' (' + x[2] + ')' : v; }),
      Q('likes', 'Up to 2 websites you like', { opt: true, hint: 'Optional. Any business, any trade.' },
        function () { return fm(inp('likes', 'u0', 'Website link', { type: 'url', im: 'url', al: 'First website link' }) + inp('likes', 'w0', 'What do you like about it?') + inp('likes', 'u1', 'Website link', { type: 'url', im: 'url', al: 'Second website link' }) + inp('likes', 'w1', 'What do you like about it?')); },
        function () { return has(val('likes', 'u0')) || has(val('likes', 'u1')); },
        function () { var o = []; for (var i = 0; i < 2; i++) if (has(val('likes', 'u' + i))) o.push(val('likes', 'u' + i) + (has(val('likes', 'w' + i)) ? ': ' + val('likes', 'w' + i) : '')); return lines(o); }),
      Q('photos', 'Your photos', { hint: 'Your work, your place, your team. Up to 30.' },
        function () { return up('photos', 'photos', 'photos', { max: 30, img: true, title: 'Add photos', desc: 'Drop them here, or tap to choose from your phone.' }) + pick('photos', 'none', ['I have none. Use stock photos that fit my trade.'], { toggle: true, al: 'No photos' }); },
        function () { return files('photos').length > 0 || has(val('photos', 'none')); },
        function () { return lines([upText('photos'), files('photos').length ? '' : val('photos', 'none')]); })
    ] });

    steps.push({ t: 'Your words', h: 'Your <em>words</em>', nx: 'getting found', qs: [
      Q('know', 'The 3 things a customer must know before they call', { hint: 'At least one. Short lines.' },
        function () { return fm(inp('know', 'v0', 'First thing', { full: true }) + inp('know', 'v1', 'Second thing', { full: true }) + inp('know', 'v2', 'Third thing', { full: true })); },
        function () { return cnt('know', 'v', 3) > 0; }, function () { return list('know', 'v', 3); }),
      Q('about', 'About you', {},
        function () { return pick('about', 'm', ['I will paste it', 'Write it from my answers'], { al: 'About you' }) + (val('about', 'm') === 'I will paste it' ? fm(ta('about', 'v', 'Paste your about text here', { al: 'About you text' })) : ''); },
        function () { var m = val('about', 'm'); return m === 'Write it from my answers' || (m === 'I will paste it' && has(val('about', 'v'))); },
        function () { var m = val('about', 'm'); return m === 'I will paste it' ? 'I will paste it:\n' + val('about', 'v') : m; }),
      Q('reviews', 'Reviews to show', {},
        function () { var m = val('reviews', 'm'), h = '';
          if (m === 'I will paste them') { for (var i = 0; i < 5; i++) h += ta('reviews', 'r' + i, 'Review ' + (i + 1) + ', with the customer\'s first name', { sm: true }); h = fm(h); }
          if (m === 'Use my Google reviews') h = fm(inp('reviews', 'g', 'Link to your Google reviews', { full: true, type: 'url', im: 'url' }));
          return pick('reviews', 'm', ['I will paste them', 'Use my Google reviews', 'None for now'], { al: 'Reviews' }) + h; },
        function () { var m = val('reviews', 'm'); return m === 'None for now' || (m === 'I will paste them' && cnt('reviews', 'r', 5) > 0) || (m === 'Use my Google reviews' && has(val('reviews', 'g'))); },
        function () { var m = val('reviews', 'm'); return m === 'I will paste them' ? 'Pasted:\n' + list('reviews', 'r', 5) : m === 'Use my Google reviews' ? 'Use my Google reviews: ' + val('reviews', 'g') : m; }),
      Q('never', 'Anything that must NOT appear on the site', { opt: true, hint: 'Optional.' },
        function () { return fm(ta('never', 'v', 'For example: no prices for catering, no photos of the kitchen', { al: 'What must not appear', sm: true })); },
        function () { return has(val('never', 'v')); }, function () { return val('never', 'v'); })
    ] });

    /* Built on every render, so the boxes show what is saved (a string built once here went stale). */
    var mails = function () { var s = ''; for (var mi = 0; mi < pl.mail; mi++) s += inp('mail', 'v' + mi, mi === 0 ? 'For example: hello@' : 'Mailbox ' + (mi + 1) + ' (optional)', { al: 'Mailbox ' + (mi + 1) + (mi ? ', optional' : ''), max: 64, full: pl.mail === 1 }); return s; };
    steps.push({ t: 'Getting found', h: 'Getting <em>found</em>', nx: plan === 'launch' ? 'sign-off' : 'your plan', qs: [
      Q('cta', 'The first thing a visitor should do', {},
        function () { var m = val('cta', 'm'), ph = /Call|Text|WhatsApp/.test(m) ? 'The number for it' : 'The link for it, if you have one';
          return pick('cta', 'm', ['Call', 'Text', 'WhatsApp', 'Book a time', 'Ask for a quote', 'Order online'], { al: 'First thing a visitor should do' }) + (m ? fm(inp('cta', 'v', ph, { full: true, type: /Call|Text|WhatsApp/.test(m) ? 'tel' : 'text' })) : ''); },
        function () { var m = val('cta', 'm'); return has(m) && (!/^(Call|Text|WhatsApp)$/.test(m) || has(val('cta', 'v'))); },
        function () { return lines([val('cta', 'm'), has(val('cta', 'v')) ? 'Number or link: ' + val('cta', 'v') : 'No link yet']); }),
      Q('domain', 'Your domain', { hint: 'The address of your site, like yourbusiness.com.' },
        function () { var m = val('domain', 'm');
          return pick('domain', 'm', ['I own one', 'Get me one'], { al: 'Your domain' }) +
            (m === 'I own one' ? fm(inp('domain', 'v', 'yourbusiness.com', { full: true, al: 'Your domain' })) + '<p class="bf-note">Where did you buy it?</p>' + pick('domain', 'r', ['GoDaddy', 'Namecheap', 'Squarespace', 'Wix', 'Other', 'Not sure'], { al: 'Where you bought it' }) : '') +
            (m === 'Get me one' ? fm(inp('domain', 'w0', 'First choice', { full: true, al: 'First choice of name' }) + inp('domain', 'w1', 'Second choice') + inp('domain', 'w2', 'Third choice')) : ''); },
        function () { var m = val('domain', 'm'); return (m === 'I own one' && has(val('domain', 'v')) && has(val('domain', 'r'))) || (m === 'Get me one' && has(val('domain', 'w0'))); },
        function () { var m = val('domain', 'm'); return m === 'I own one' ? lines(['I own one: ' + val('domain', 'v'), 'Bought at: ' + val('domain', 'r')]) : lines(['Get me one, in order:', list('domain', 'w', 3)]); }),
      Q('mail', 'Your business mailbox name' + (pl.mail > 1 ? 's' : ''), { hint: 'For example hello@. Your ' + pl.name + ' plan includes ' + pl.mail + (pl.mail > 1 ? ' mailboxes. The first one is needed.' : ' mailbox.') },
        function () { return fm(mails()); }, function () { return has(val('mail', 'v0')); }, function () { return list('mail', 'v', pl.mail); }),
      Q('links', 'Links you already have', { opt: true, hint: 'Optional. Paste what you have.' },
        function () { return fm(['Google Business Profile', 'Facebook', 'Instagram', 'Yelp', 'Old website'].map(function (n, i) { return inp('links', 'v' + i, n, { type: 'url', im: 'url', full: i === 4 }); }).join('')); },
        function () { return cnt('links', 'v', 5) > 0; },
        function () { var n = ['Google Business Profile', 'Facebook', 'Instagram', 'Yelp', 'Old website']; return list('links', 'v', 5, function (i) { return n[i] + ': '; }); })
    ] });

    if (plan !== 'launch') {
      var pq = [];
      if (!store) {
        pq.push(
          Q('pages', 'The 3 services that get their own page', { hint: 'Name each one. Leave the lines empty and we write them from your answers.' },
            function () { return svcs('pages', 3, 1); }, function () { return cnt('pages', 'n', 3) === 3; }, function () { return svcText('pages', 3); }),
          faqQ('faq'),
          Q('book', 'What can customers book online?', {},
            function () { return pick('book', 'm', ['Bookable services', 'No online booking'], { al: 'Online booking' }) + (val('book', 'm') === 'Bookable services' ? fm(ta('book', 'v', 'One per line: service, how long, price', { al: 'Bookable services, one per line: service, how long, price' })) : ''); },
            function () { var m = val('book', 'm'); return m === 'No online booking' || (m === 'Bookable services' && has(val('book', 'v'))); },
            function () { var m = val('book', 'm'); return m === 'Bookable services' ? 'Bookable services:\n' + val('book', 'v') : m; }),
          Q('takes', 'Who takes bookings, and when?', { hint: 'Needed unless you have no online booking.' },
            function () { if (val('book', 'm') === 'No online booking') return '<p class="bf-note">No online booking, so nothing is needed here.</p>';
              return fm(inp('takes', 'n', 'Names of the people who take bookings', { full: true })) + pick('takes', 'm', ['Same as opening hours', 'Different hours'], { al: 'When' }) + (val('takes', 'm') === 'Different hours' ? fm(inp('takes', 'h', 'The hours for bookings', { full: true })) : ''); },
            function () { if (val('book', 'm') === 'No online booking') return true; var m = val('takes', 'm'); return has(val('takes', 'n')) && (m === 'Same as opening hours' || (m === 'Different hours' && has(val('takes', 'h')))); },
            function () { if (val('book', 'm') === 'No online booking') return 'Not needed: no online booking'; var m = val('takes', 'm'); return lines(['Names: ' + val('takes', 'n'), m === 'Different hours' ? 'Hours: ' + val('takes', 'h') : m]); }),
          Q('pay', 'Take payment on the site?', {},
            function () { return pick('pay', 'm', ['Yes', 'No'], { al: 'Take payment' }) + (val('pay', 'm') === 'Yes' ? '<p class="bf-note">Your Stripe account</p>' + pick('pay', 's', ['I have one', 'I need one'], { al: 'Stripe account' }) : ''); },
            function () { var m = val('pay', 'm'); return m === 'No' || (m === 'Yes' && has(val('pay', 's'))); },
            function () { var m = val('pay', 'm'); return m === 'Yes' ? 'Yes. Stripe account: ' + val('pay', 's') : m; }),
          contactQ('leads', 'Where should new leads and the Monday summary go?')
        );
        if (plan === 'pro') {
          pq.push(
            Q('more', '4 more services for their own page', { hint: 'Names needed. Lines are optional.' },
              function () { return svcs('more', 4, 4); }, function () { return cnt('more', 'n', 4) === 4; }, function () { return svcText('more', 4); }),
            Q('towns', 'The 3 towns you most want customers from', { hint: 'At least one.' },
              function () { return fm(inp('towns', 'v0', 'First town', { full: true }) + inp('towns', 'v1', 'Second town') + inp('towns', 'v2', 'Third town')); },
              function () { return cnt('towns', 'v', 3) > 0; }, function () { return list('towns', 'v', 3); }),
            Q('team', 'Your team', { hint: 'Up to 6 people: name, role, one line and a photo each.' },
              function () {
                var h = pick('team', 'none', ['No team page yet. Show the owner only.'], { toggle: true, al: 'No team page' });
                if (val('team', 'none')) return h;
                var n = Math.min(6, Math.max(1, +val('team', 'c') || 1));
                for (var i = 0; i < n; i++) h += '<div class="tm"><p class="tm__h">Person ' + (i + 1) + '</p>' + fm(inp('team', 'n' + i, 'Name') + inp('team', 'r' + i, 'Role') + inp('team', 'l' + i, 'One line about them', { full: true })) +
                  up('team', 'team' + i, 'team', { max: 1, img: true, title: 'Add a photo', desc: 'A clear photo of their face.' }) + '</div>';
                if (n < 6) h += '<button type="button" class="bf-link" data-add="team">Add a person</button>';
                return h;
              },
              function () { return has(val('team', 'none')) || cnt('team', 'n', 6) > 0; },
              function () { if (val('team', 'none')) return val('team', 'none'); var o = []; for (var i = 0; i < 6; i++) if (has(val('team', 'n' + i))) o.push((i + 1) + '. ' + val('team', 'n' + i) + (has(val('team', 'r' + i)) ? ', ' + val('team', 'r' + i) : '') + (has(val('team', 'l' + i)) ? '. ' + val('team', 'l' + i) : '') + (files('team' + i).length ? ' [photo: ' + (files('team' + i)[0].stored || files('team' + i)[0].name) + ']' : ' [no photo]')); return lines(o); }),
            Q('blog', '3 blog topics your customers ask about', { hint: 'Or let us choose.' },
              function () { return pick('blog', 'you', ['You choose'], { toggle: true, al: 'Blog topics' }) + (val('blog', 'you') ? '' : fm(inp('blog', 'v0', 'First topic', { full: true }) + inp('blog', 'v1', 'Second topic') + inp('blog', 'v2', 'Third topic'))); },
              function () { return has(val('blog', 'you')) || cnt('blog', 'v', 3) > 0; }, function () { return val('blog', 'you') ? 'You choose' : list('blog', 'v', 3); }),
            Q('hiring', 'Hiring now?', {},
              function () { return pick('hiring', 'm', ['Yes', 'Not now'], { al: 'Hiring now' }) + (val('hiring', 'm') === 'Yes' ? fm(inp('hiring', 'r', 'The roles you are hiring for', { full: true }) + inp('hiring', 'e', 'Email for applications', { full: true, type: 'email', im: 'email' })) : ''); },
              function () { var m = val('hiring', 'm'); return m === 'Not now' || (m === 'Yes' && has(val('hiring', 'r')) && isMail(val('hiring', 'e'))); },
              function () { var m = val('hiring', 'm'); return m === 'Yes' ? lines(['Yes. Roles: ' + val('hiring', 'r'), 'Applications to: ' + val('hiring', 'e')]) : m; }),
            seoQ('seo')
          );
        }
      } else {
        pq.push(
          Q('pphotos', 'Product photos', { hint: 'Up to 100. Or a link to a shared folder.' },
            function () { return up('pphotos', 'productphotos', 'productphotos', { max: 100, img: true, title: 'Add product photos', desc: 'Name them the way your product sheet does.' }) + fm(inp('pphotos', 'link', 'Or a link to a shared folder (Google Drive, Dropbox)', { full: true, type: 'url', im: 'url' })); },
            function () { return files('productphotos').length > 0 || has(val('pphotos', 'link')); },
            function () { return lines([upText('productphotos'), has(val('pphotos', 'link')) ? 'Shared folder: ' + val('pphotos', 'link') : '']); }),
          Q('cats', 'Categories', { hint: 'How your shop is organized. Or let us do it.' },
            function () { return pick('cats', 'you', ['You organize it'], { toggle: true, al: 'Categories' }) + (val('cats', 'you') ? '' : fm(ta('cats', 'v', 'For example: Bread, Pastries, Cakes, Gift boxes', { sm: true, al: 'Your categories' }))); },
            function () { return has(val('cats', 'you')) || has(val('cats', 'v')); }, function () { return val('cats', 'you') ? 'You organize it' : val('cats', 'v'); }),
          Q('delivery', 'Delivery', { hint: 'Pick all that apply.' },
            function () { var p = val('delivery', 'p') || [], h = pick('delivery', 'p', ['Shipping', 'Local pickup', 'Local delivery'], { multi: true, al: 'Delivery' });
              if (p.indexOf('Shipping') > -1) {
                var pm = val('delivery', 'pm');
                h += '<p class="bf-note">Shipping price</p>' + pick('delivery', 'pm', ['Flat rate', 'Free over', 'By weight'], { al: 'Shipping price' }) +
                  (pm === 'Flat rate' || pm === 'Free over' ? fm(inp('delivery', 'amt', pm === 'Flat rate' ? 'Flat rate in $' : 'Free over $', { full: true, im: 'decimal' })) : '') +
                  '<p class="bf-note">Where you ship</p>' + pick('delivery', 'wh', ['All US states', 'Only these'], { al: 'Where you ship' }) +
                  (val('delivery', 'wh') === 'Only these' ? fm(inp('delivery', 'st', 'The states you ship to', { full: true })) : '');
              }
              return h; },
            function () { var p = val('delivery', 'p') || []; if (!p.length) return false; if (p.indexOf('Shipping') < 0) return true; var pm = val('delivery', 'pm'), wh = val('delivery', 'wh');
              return has(pm) && (pm === 'By weight' || has(val('delivery', 'amt'))) && (wh === 'All US states' || (wh === 'Only these' && has(val('delivery', 'st')))); },
            function () { var p = val('delivery', 'p') || [], o = [p.join(', ')]; if (p.indexOf('Shipping') > -1) { var pm = val('delivery', 'pm'); o.push('Shipping price: ' + pm + (pm !== 'By weight' && has(val('delivery', 'amt')) ? ' $' + String(val('delivery', 'amt')).replace(/^\$/, '') : '')); o.push('Ships to: ' + (val('delivery', 'wh') === 'Only these' ? val('delivery', 'st') : val('delivery', 'wh'))); } return lines(o); }),
          Q('returns', 'Returns', {},
            function () { return pick('returns', 'm', ['No returns', '14 days', '30 days', 'My own policy'], { al: 'Returns' }) + (val('returns', 'm') === 'My own policy' ? fm(ta('returns', 'v', 'Your returns policy', { sm: true })) : ''); },
            function () { var m = val('returns', 'm'); return has(m) && (m !== 'My own policy' || has(val('returns', 'v'))); },
            function () { var m = val('returns', 'm'); return m === 'My own policy' ? 'My own policy:\n' + val('returns', 'v') : m; }),
          Q('tax', 'Sales tax', { hint: 'The states where you collect it.' },
            function () { return pick('tax', 'ns', ['Not sure. Ask me.'], { toggle: true, al: 'Sales tax' }) + (val('tax', 'ns') ? '' : fm(inp('tax', 'v', 'States where you collect sales tax', { full: true }))); },
            function () { return has(val('tax', 'ns')) || has(val('tax', 'v')); }, function () { return val('tax', 'ns') ? 'Not sure. Ask me.' : val('tax', 'v'); }),
          Q('stripe', 'Stripe account', { hint: 'Stripe takes the card payments in your shop.' },
            function () { return pick('stripe', 'm', ['I have one', 'I need one'], { al: 'Stripe account' }); },
            function () { return has(val('stripe', 'm')); }, function () { return val('stripe', 'm'); }),
          faqQ('faq'),
          contactQ('orders', 'Where should orders and leads go?'),
          seoQ('seo')
        );
      }
      steps.push({ t: 'Your plan', h: 'Your <em>plan</em>', nx: 'sign-off', qs: pq });
    }

    steps.push({ t: 'Sign-off', h: 'Sign-<em>off</em>', qs: [
      Q('approver', 'The one person who approves the site', { hint: 'We send the first draft to this person, and take the list of changes from them.' },
        function () { return fm(inp('approver', 'n', 'Name', { full: true, ac: 'name' }) + inp('approver', 'e', 'Email', { type: 'email', ac: 'email', im: 'email' }) + inp('approver', 'm', 'Mobile', { type: 'tel', ac: 'tel', im: 'tel' })); },
        function () { return has(val('approver', 'n')) && isMail(val('approver', 'e')) && has(val('approver', 'm')); },
        function () { return lines(['Name: ' + val('approver', 'n'), 'Email: ' + val('approver', 'e'), 'Mobile: ' + val('approver', 'm')]); }),
      Q('done', 'Ready to send', {},
        function () { return pick('done', 'v', ['This brief is complete. Build my first draft from it.'], { toggle: true, al: 'Confirm' }); },
        function () { return has(val('done', 'v')); }, function () { return val('done', 'v') ? 'Yes. This brief is complete. Build my first draft from it.' : ''; })
    ] });

    var n = 0;
    steps.forEach(function (s) { s.qs.forEach(function (q) { n++; q.n = pad(n); q.step = s; }); });
    steps.total = n;
    var want = EXPECT[plan];
    window.__briefCounts = window.__briefCounts || {};
    window.__briefCounts[plan] = { steps: steps.length, questions: n, ok: steps.length === want[0] && n === want[1] };
    if (!window.__briefCounts[plan].ok) console.error('brief: ' + plan + ' has ' + steps.length + ' steps / ' + n + ' questions, expected ' + want.join(' / '));
    return steps;
  }
  // assert every plan's totals once, at load
  Object.keys(PLANS).forEach(function (k) { build(k); });

  /* ---------- counting ---------- */
  var STEPS = [];
  function isOk(q) { try { return !!q.ok(); } catch (e) { return false; } }
  function stepCount(s) { return s.qs.filter(isOk).length; }
  function total() { return STEPS.reduce(function (t, s) { return t + stepCount(s); }, 0); }
  function findQ(id) { for (var i = 0; i < STEPS.length; i++) for (var j = 0; j < STEPS[i].qs.length; j++) if (STEPS[i].qs[j].id === id) return STEPS[i].qs[j]; return null; }

  /* ---------- reveal: the site's own .rv build-in (details.css), run on demand for each new screen ---------- */
  function reveal(scope) {
    if (!root.classList.contains('dt-anim')) return;
    qsa('.rv', scope).forEach(function (el, k) {
      if (!qs(':scope > .blk', el)) { var b = d.createElement('i'); b.className = 'blk'; b.setAttribute('aria-hidden', 'true'); el.appendChild(b); }
      var t = k * 0.06; el.style.setProperty('--dl', t.toFixed(3) + 's');
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-in'); }); });
      setTimeout(function () { el.classList.add('is-done'); }, (t + 0.3) * 1000 + 40);
    });
  }

  /* ---------- screens ---------- */
  function hero(k, h1, p, badges, id) {
    return '<section class="dh dh--peri dh--tight" aria-labelledby="' + id + '"><p class="dh__k rv">' + k + '</p><h1 class="dh__h1 rv" id="' + id + '" tabindex="-1">' + h1 + '</h1>' +
      '<p class="dh__p rv">' + p + '</p><ul class="badges badges--ink">' + badges.map(function (b) { return '<li class="badge rv">' + b + '</li>'; }).join('') + '</ul></section>';
  }
  function pill(t) { var p = d.getElementById('bf-pill'); if (p) p.innerHTML = '<span>' + esc(t) + '</span>'; }

  function renderPicker() {
    pill('Website brief');
    main.innerHTML = hero('Your website brief', 'Tell us <em>once</em>', 'First, pick the plan you ordered. Then short questions, mostly picks and uploads. Our team builds your first draft from your answers.', ['One brief', 'One first draft', 'One list of changes'], 'bf-h1') +
      '<section class="co" aria-label="Your plan"><div class="co__pick"><div class="co__grp"><h2 class="co__k" id="bf-pick">Which plan did you order?</h2>' +
      '<div class="pks bf-pks" style="--n:4" role="group" aria-labelledby="bf-pick">' + Object.keys(PLANS).map(function (k) { var p = PLANS[k];
        return '<button class="pk" type="button" data-plan="' + k + '" aria-pressed="false"><span class="pk__name">' + p.name + '</span><span class="pk__price"><span class="cur">$</span>' + p.price + '</span><span class="pk__per">a month</span><span class="pk__per">' + EXPECT[k][1] + ' questions</span><i class="pk__tick" aria-hidden="true"></i></button>'; }).join('') +
      '</div></div></div><aside class="or" aria-label="Your brief"><p class="or__k">Your brief</p><p class="or__empty">Pick your plan to begin.</p>' +
      '<p class="or__promise" style="margin-top:clamp(18px,3vh,30px)"><b>First draft in 3 to 10 business days</b>By plan. Counted from the day you send this brief. Then one list of changes, then launch.</p><p class="or__note">Saved on this device as you go.</p></aside></section>';
    reveal(main);
  }

  function renderStep(focus) {
    var pl = PLANS[S.plan], i = Math.min(S.step, STEPS.length - 1), s = STEPS[i], last = i === STEPS.length - 1;
    S.step = i;
    pill(pl.name + ' plan');
    var biz = val('name', 'v');
    var top = i === 0
      ? hero('Your website brief · ' + pl.name + ' plan','Tell us <em>once</em>', STEPS.total + ' short questions, mostly picks and uploads. Our team builds your first draft from your answers.', ['One brief', 'One first draft', 'One list of changes'], 'bf-h1')
      : '<div class="strip"><b>&#9632; Your website brief · ' + pl.name + ' plan</b>' + (biz ? '<span>' + esc(biz) + '</span>' : '') + '</div>';
    var hTag = i === 0 ? 'h2' : 'h1';
    var pane = '<p class="bf__step rv">Step ' + (i + 1) + ' of ' + STEPS.length + '</p><' + hTag + ' class="dt-h2 rv" id="bf-sh" tabindex="-1">' + s.h + '</' + hTag + '>' +
      '<div class="bf-in">' + s.qs.map(renderQ).join('') +
      '<div class="nv">' + (i > 0 ? '<button type="button" class="btn btn--xl btn--line" data-nav="back">Back</button>' : '') +
      '<button type="button" class="btn btn--xl" data-nav="' + (last ? 'send' : 'next') + '"' + (ui.sending ? ' disabled' : '') + '>' + (last ? (ui.sending ? 'Sending' : 'Send my brief') : 'Next: ' + s.nx) + '</button></div>' +
      '<p class="nv__msg" id="bf-msg" role="alert">' + esc(ui.msg) + '</p></div>';
    main.innerHTML = top + '<section class="co" aria-label="Your brief"><div class="co__pick bf-pane">' + pane + '</div>' + cardHtml() + '</section>';
    reveal(main);
    card(true);
    if (focus) { var h = d.getElementById('bf-sh'); window.scrollTo(0, 0); if (h) try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
  }

  function renderQ(q) {
    var err = ui.err[q.id] || '';
    return '<div class="q' + (err ? ' is-bad' : '') + '" id="q-' + q.id + '" role="group" aria-labelledby="ql-' + q.id + '">' +
      '<div class="q__top"><span class="q__n">' + q.n + '</span><div><p class="q__l" id="ql-' + q.id + '">' + esc(q.l) + '</p>' + (q.hint ? '<p class="q__hint">' + q.hint + '</p>' : '') + '</div></div>' +
      '<div class="q__body">' + q.r() + '<p class="q__err" role="alert">' + esc(err) + '</p></div></div>';
  }
  function rq(id) {
    var q = findQ(id), el = d.getElementById('q-' + id);
    if (!q || !el) return;
    var a = d.activeElement, keep = null;
    if (a && el.contains(a)) keep = a.getAttribute('data-k') ? '[data-k="' + a.getAttribute('data-k') + '"]' : a.getAttribute('data-p') ? '[data-p="' + a.getAttribute('data-p') + '"][data-v="' + (a.getAttribute('data-v') || '').replace(/"/g, '\\"') + '"]' : a.getAttribute('data-up') ? '[data-up="' + a.getAttribute('data-up') + '"]' : null;
    var tmp = d.createElement('div'); tmp.innerHTML = renderQ(q); el.parentNode.replaceChild(tmp.firstChild, el);
    if (keep) { var n = qs(keep, d.getElementById('q-' + id)); if (n) try { n.focus({ preventScroll: true }); } catch (e) { n.focus(); } }
  }

  function cardHtml() {
    var pl = PLANS[S.plan];
    return '<aside class="or" aria-label="Your brief progress"><p class="or__k">Your brief</p><p class="or__name">' + pl.name + '</p><p class="or__grp">Website plan · ' + STEPS.total + ' questions</p>' +
      '<div class="pg" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="' + STEPS.total + '"><i id="bf-pg"></i></div><p class="pg__t" id="bf-pgt"></p>' +
      '<ul class="or__rows" id="bf-rows"></ul><p class="or__promise"><b>First draft in ' + pl.days + ' business days</b>Counted from the day you send this brief. Then one list of changes, then launch.</p>' +
      '<p class="or__note">Saved on this device as you go.</p></aside>';
  }
  function card(fresh) {
    var bar = d.getElementById('bf-pg'); if (!bar) return;
    var n = total(), N = STEPS.total, w = Math.round(n / N * 100) + '%';
    if (fresh) { bar.style.width = '0%'; requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = w; }); }); } else bar.style.width = w;
    bar.parentNode.setAttribute('aria-valuenow', n);
    d.getElementById('bf-pgt').textContent = n + ' of ' + N + ' answered';
    d.getElementById('bf-rows').innerHTML = STEPS.map(function (s, k) {
      var c = stepCount(s), m = s.qs.length, req = s.qs.every(function (q) { return q.opt || isOk(q); });
      var done = k !== S.step && k <= S.max && req, cls = k === S.step ? 'bcur' : done ? 'done' : '';
      var st = (k === S.step || k <= S.max || c) ? c + ' of ' + m : String(m);
      var inner = '<span>' + esc(s.t) + '</span><span class="bst">' + st + (done ? '<i class="tk" aria-label="done"></i>' : '') + '</span>';
      return '<li' + (cls ? ' class="' + cls + '"' : '') + '>' + (k !== S.step && k <= S.max ? '<button type="button" class="bf-go" data-go="' + k + '" aria-label="Go to ' + esc(s.t) + ', ' + st + ' answered">' + inner + '</button>' : inner) + '</li>';
    }).join('');
  }
  var cardT;
  function cardSoon() { clearTimeout(cardT); cardT = setTimeout(function () { card(false); }, 120); }

  function businessDays(n, from) {
    var t = from ? new Date(from.getTime()) : new Date(); t.setHours(12, 0, 0, 0);
    var g = t.getDay(); if (g === 6) t.setDate(t.getDate() + 2); else if (g === 0) t.setDate(t.getDate() + 1);   // weekend: received Monday
    while (n > 0) { t.setDate(t.getDate() + 1); g = t.getDay(); if (g !== 0 && g !== 6) n--; }
    return t;
  }
  function renderDone(n, N) {
    var pl = PLANS[S.plan], biz = val('name', 'v') || 'Your business';
    var by = businessDays(pl.days).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    pill(pl.name + ' plan');
    main.innerHTML = hero(esc(biz) + ' · ' + pl.name + ' plan', 'Brief <em>received</em>', 'Our team builds your first draft from it. Your private preview link arrives by ' + by + '.', [n + ' of ' + N + ' answered', 'A copy is in your inbox'], 'ok-h1') +
      '<section class="hm" aria-labelledby="hm-h"><h2 class="dt-h2" id="hm-h">What happens <em>next</em></h2><ol class="hm__steps">' +
      '<li class="hm__s"><span class="hm__n" aria-hidden="true">1</span><p class="hm__t">We build your first draft.</p><p class="hm__d">From your brief, within ' + pl.days + ' business days. It comes to you on a private link.</p></li>' +
      '<li class="hm__s"><span class="hm__n" aria-hidden="true">2</span><p class="hm__t">You send one list of changes.</p><p class="hm__d">Everything you want changed, in one list, within 5 days.</p></li>' +
      '<li class="hm__s"><span class="hm__n" aria-hidden="true">3</span><p class="hm__t">We make them and launch.</p><p class="hm__d">You check the list was done, and your site goes live on your domain.</p></li>' +
      '<li class="hm__s"><span class="hm__n" aria-hidden="true">4</span><p class="hm__t">After launch.</p><p class="hm__d">Small updates are included, one request at a time. Bigger work is quoted first.</p></li></ol></section>';
    reveal(main);
    window.scrollTo(0, 0);
    var h = d.getElementById('ok-h1'); if (h) try { h.focus({ preventScroll: true }); } catch (e) {}
  }

  /* ---------- talking to brief.php ---------- */
  function call(action, fd) {
    fd.set('action', action); fd.set('token', S.token);
    if (STUB) return new Promise(function (res) {
      setTimeout(function () {
        if (STUB === 'fail' || (STUB === 'failsend' && action === 'send') || (STUB === 'failup' && action === 'upload')) return res({ ok: false, err: 'stub' });
        if (action === 'upload') { var f = fd.get('file'); return res({ ok: true, name: String(f.name || 'file').replace(/[^A-Za-z0-9._-]+/g, '-'), size: f.size }); }
        if (action === 'send') { var o = {}; fd.forEach(function (v, k) { o[k] = v; }); window.__briefSent = o; }
        (window.__briefCalls = window.__briefCalls || []).push(action);
        res({ ok: true });
      }, 90);
    });
    return fetch(API + '?action=' + action, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
      .then(function (r) { return r.json(); });
  }

  /* ---------- uploads: one at a time ---------- */
  var MEM = {}, JOBS = [], busy = false;
  function entry(key, id) { return (S.f[key] || []).filter(function (x) { return x.id === id; })[0]; }
  function addFiles(key, max, list) {
    var qid = UPQ[key], fs = S.f[key] = S.f[key] || [], msgs = [];
    var room = max === 1 ? 1 : max - fs.filter(function (x) { return x.st !== 'err'; }).length;
    var arr = Array.prototype.slice.call(list || []);
    var okx = /^(photos|productphotos|team)$/.test(SLOT[key]) ? IMG_EXT : SLOT[key] === 'logo' ? /\.(jpe?g|png|webp|gif|heic|pdf)$/i : EXT;
    arr.forEach(function (f) {
      if (!okx.test(f.name)) { msgs.push('That file type is not accepted: ' + f.name); return; }
      if (room <= 0) { msgs.push('Up to ' + max + (max === 1 ? ' file' : ' files') + ' here. ' + f.name + ' was not added.'); return; }
      room--;
      var e = { id: rid(), name: f.name, size: f.size, st: 'q', img: IMG_EXT.test(f.name) };
      fs.push(e); MEM[e.id] = f; JOBS.push({ key: key, id: e.id, single: max === 1 });
    });
    ui.err[qid] = msgs.join(' ');
    rq(qid); pump();
  }
  function pump() {
    if (busy) return; var job = JOBS.shift(); if (!job) return;
    busy = true;
    upload(job).then(done, done);
    function done() { busy = false; pump(); }
  }
  function upload(job) {
    var e = entry(job.key, job.id), qid = UPQ[job.key], f = e && MEM[e.id];
    if (!e || !f) return Promise.resolve();
    e.st = 'up'; e.msg = ''; rq(qid);
    var slot = SLOT[job.key];
    return prep(f, e.img && slot !== 'logo').then(function (r) {
      if (r.thumb) e.thumb = r.thumb;
      if (r.blob.size > 12 * MB) { var x = new Error('big'); x.big = 1; throw x; }
      var fd = new FormData(); fd.append('slot', slot); fd.append('file', r.blob, r.name);
      return call('upload', fd).then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.err) || 'upload');
        e.st = 'ok'; e.stored = j.name || r.name; e.size = j.size || r.blob.size; delete MEM[e.id];
        if (job.single) (S.f[job.key] || []).filter(function (x) { return x !== e && x.st === 'ok'; }).forEach(function (old) { removeFile(job.key, old.id, true); });
        if (job.key === 'logo' && has(val('logo', 'none'))) delete A('logo').none;
        if (job.key === 'photos' && has(val('photos', 'none'))) delete A('photos').none;
        if (ui.err[qid] && isOk(findQ(qid) || { ok: function () { return false; } })) ui.err[qid] = '';
      });
    }).catch(function (x) { e.st = 'err'; e.msg = x && x.big ? 'Too big. 12 MB at most.' : 'Not uploaded. Try again.'; })
      .then(function () { save(); rq(qid); cardSoon(); });
  }
  /* images: thumbnail for the page; downsize to 2400 px JPEG 0.85 unless already small (never the logo: keep its transparency) */
  function prep(f, shrink) {
    var out = { blob: f, name: f.name, thumb: '' };
    if (!/\.(jpe?g|png|webp|gif)$/i.test(f.name) || !window.createImageBitmap) return Promise.resolve(out);
    return createImageBitmap(f).then(function (bm) {
      var w = bm.width, h = bm.height, big = Math.max(w, h);
      var t = d.createElement('canvas'), ts = Math.min(1, 200 / big);
      t.width = Math.max(1, Math.round(w * ts)); t.height = Math.max(1, Math.round(h * ts));
      t.getContext('2d').drawImage(bm, 0, 0, t.width, t.height);
      out.thumb = shrink ? t.toDataURL('image/jpeg', 0.6) : t.toDataURL('image/png');
      if (!shrink || (big <= 2400 && f.size <= 4 * MB)) return out;
      var s = Math.min(1, 2400 / big), c = d.createElement('canvas');
      c.width = Math.round(w * s); c.height = Math.round(h * s);
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bm, 0, 0, c.width, c.height);
      return new Promise(function (res) {
        c.toBlob(function (b) { if (b && b.size < f.size) { out.blob = b; out.name = f.name.replace(/\.[^.]+$/, '') + '.jpg'; } res(out); }, 'image/jpeg', 0.85);
      });
    }).catch(function () { return out; });
  }
  function removeFile(key, id, quiet) {
    var e = entry(key, id), qid = UPQ[key]; if (!e) return;
    function drop() { S.f[key] = (S.f[key] || []).filter(function (x) { return x !== e; }); delete MEM[e.id]; save(); rq(qid); cardSoon(); }
    JOBS = JOBS.filter(function (j) { return j.id !== id; });
    if (e.st !== 'ok') { drop(); return; }
    e.st = 'rm'; if (!quiet) rq(qid);
    var fd = new FormData(); fd.append('slot', SLOT[key]); fd.append('name', e.stored || e.name);
    call('remove', fd).then(function (j) { if (!j || !j.ok) throw 0; drop(); })
      .catch(function () { e.st = 'ok'; ui.err[qid] = 'Not removed. Try again.'; rq(qid); });
  }

  /* ---------- moving between steps ---------- */
  function check(s) {
    var bad = s.qs.filter(function (q) { return !q.opt && !isOk(q); });
    s.qs.forEach(function (q) { ui.err[q.id] = bad.indexOf(q) > -1 ? (q.id === 'done' ? 'Tick this to send your brief.' : 'Please answer this one.') : (ui.err[q.id] === 'Please answer this one.' ? '' : ui.err[q.id] || ''); });
    return bad;
  }
  function pending() { return Object.keys(S.f).some(function (k) { return (S.f[k] || []).some(function (x) { return x.st === 'q' || x.st === 'up' || x.st === 'rm'; }); }); }
  function go(k) { S.step = k; S.max = Math.max(S.max, k); ui.msg = ''; save(); renderStep(true); }
  function next() {
    var s = STEPS[S.step], bad = check(s);
    if (bad.length) {
      ui.msg = bad.length === 1 ? 'Answer the marked question to go on.' : 'Answer the ' + bad.length + ' marked questions to go on.';
      s.qs.forEach(function (q) { rq(q.id); });
      d.getElementById('bf-msg').textContent = ui.msg;
      var el = d.getElementById('q-' + bad[0].id); el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      var f = qs('input, select, textarea, button', el); if (f) try { f.focus({ preventScroll: true }); } catch (e) {}
      return;
    }
    go(S.step + 1);
  }
  function send() {
    if (ui.sending) return;
    for (var k = 0; k < STEPS.length; k++) {
      if (check(STEPS[k]).length) { if (k !== S.step) { S.step = k; renderStep(true); } next(); return; }
    }
    if (pending()) { ui.msg = 'Wait for your uploads to finish, then send.'; d.getElementById('bf-msg').textContent = ui.msg; return; }
    var answers = STEPS.map(function (s) {
      return { title: s.t, items: s.qs.map(function (q) { var a = ''; try { a = isOk(q) ? q.tx() : (q.opt ? '' : q.tx()); } catch (e) {} return { n: q.n, q: q.l, a: has(a) ? String(a) : 'Not answered' }; }) };
    });
    var fd = new FormData();
    fd.append('plan', S.plan); fd.append('business', val('name', 'v')); fd.append('email', val('approver', 'e'));
    fd.append('answers', JSON.stringify(answers)); fd.append('website', '');
    ui.sending = true; ui.msg = '';
    var btn = qs('[data-nav="send"]'); if (btn) { btn.disabled = true; btn.textContent = 'Sending'; }
    d.getElementById('bf-msg').textContent = '';
    var n = total(), N = STEPS.total;
    call('send', fd).then(function (j) {
      if (!j || !j.ok) throw new Error((j && j.err) || 'send');
      try { localStorage.removeItem(KEY); } catch (e) {}
      ui.sending = false; renderDone(n, N);
      try { document.dispatchEvent(new CustomEvent('kn:brief-sent')); } catch (e) {}
    }).catch(function () {
      ui.sending = false; ui.msg = 'Not sent. Please try again, or email hello@getknservices.com.';
      if (btn) { btn.disabled = false; btn.textContent = 'Send my brief'; }
      d.getElementById('bf-msg').textContent = ui.msg;
    });
  }

  /* ---------- events (one set, delegated) ---------- */
  function setVal(el) {
    var p = el.getAttribute('data-k').split('|'); A(p[0])[p[1]] = el.value;
    save(); cardSoon();
    var q = findQ(p[0]);
    if (q && ui.err[p[0]] && isOk(q)) { ui.err[p[0]] = ''; var box = d.getElementById('q-' + p[0]); if (box) { box.classList.remove('is-bad'); var m = qs('.q__err', box); if (m) m.textContent = ''; } }
    if (p[0] === 'name') { var sp = qs('.strip span'); if (sp) sp.textContent = el.value; }
  }
  main.addEventListener('input', function (e) { var t = e.target; if (t.hasAttribute && t.hasAttribute('data-k')) setVal(t); });
  main.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-up')) { var k = t.getAttribute('data-up'); addFiles(k, +t.getAttribute('data-max'), t.files); t.value = ''; return; }
    if (t.hasAttribute('data-k')) { setVal(t); if (t.tagName === 'SELECT') rq(t.getAttribute('data-k').split('|')[0]); }
  });
  main.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('button'); if (!t || !main.contains(t)) return;
    var a;
    if ((a = t.getAttribute('data-p'))) {
      var p = a.split('|'), id = p[0], k = p[1], v = t.getAttribute('data-v'), o = A(id);
      if (t.hasAttribute('data-max')) {
        var arr = Array.isArray(o[k]) ? o[k].slice() : [], ix = arr.indexOf(v), max = +t.getAttribute('data-max');
        if (ix > -1) arr.splice(ix, 1); else if (arr.length < max) arr.push(v); else { ui.err[id] = 'Pick up to ' + max + '. Tap one to remove it first.'; rq(id); return; }
        o[k] = arr;
      } else if (t.hasAttribute('data-t') && o[k] === v) delete o[k]; else o[k] = v;
      if (id === 'logo' && k === 'none' && o.none) { files('logo').forEach(function (x) { removeFile('logo', x.id); }); }
      if (ui.err[id] && /^Pick up to/.test(ui.err[id])) ui.err[id] = '';
      var q = findQ(id); if (q && ui.err[id] && isOk(q)) ui.err[id] = '';
      save(); rq(id);
      if (id === 'book') rq('takes');
      cardSoon(); return;
    }
    if ((a = t.getAttribute('data-nav'))) { if (a === 'next') next(); else if (a === 'back') go(Math.max(0, S.step - 1)); else send(); return; }
    if ((a = t.getAttribute('data-go'))) { go(+a); return; }
    if ((a = t.getAttribute('data-rm'))) { a = a.split('|'); removeFile(a[0], a[1]); return; }
    if ((a = t.getAttribute('data-retry'))) { a = a.split('|'); var en = entry(a[0], a[1]); if (en) { en.st = 'q'; JOBS.push({ key: a[0], id: a[1], single: SLOT[a[0]] === 'logo' || /^team\d$/.test(a[0]) }); rq(UPQ[a[0]]); pump(); } return; }
    if ((a = t.getAttribute('data-more'))) { ui.exp[a] = true; rq(UPQ[a]); return; }
    if ((a = t.getAttribute('data-add'))) { A('team').c = Math.min(6, (+val('team', 'c') || 1) + 1); save(); rq('team'); var nn = qs('[data-k="team|n' + (A('team').c - 1) + '"]'); if (nn) nn.focus(); return; }
    if ((a = t.getAttribute('data-copy'))) { var h = A('hours'); for (var di = 1; di < 5; di++) { h['o' + di] = h.o0 || ''; h['c' + di] = h.c0 || ''; h['x' + di] = h.x0 || ''; } save(); rq('hours'); cardSoon(); return; }
    if ((a = t.getAttribute('data-plan'))) {
      S.plan = a; S.step = 0; S.max = 0; save();
      try { history.replaceState(null, '', 'brief.html?plan=' + a + (STUB ? '&stub=' + STUB : '')); } catch (x) {}
      start(); return;
    }
  });
  ['dragenter', 'dragover'].forEach(function (ev) { main.addEventListener(ev, function (e) { var u = e.target.closest && e.target.closest('[data-drop]'); if (!u) return; e.preventDefault(); u.classList.add('is-drag'); }); });
  main.addEventListener('dragleave', function (e) { var u = e.target.closest && e.target.closest('[data-drop]'); if (u) u.classList.remove('is-drag'); });
  main.addEventListener('drop', function (e) {
    var u = e.target.closest && e.target.closest('[data-drop]'); if (!u) return; e.preventDefault(); u.classList.remove('is-drag');
    var inpt = qs('input[type="file"]', u); addFiles(u.getAttribute('data-drop'), +inpt.getAttribute('data-max'), e.dataTransfer.files);
  });

  /* ---------- sample answers for screenshots (?demo=1), never saved ---------- */
  function demo() {
    var img = ['assets/bakery/item-1.jpg', 'assets/bakery/item-2.jpg', 'assets/bakery/item-3.jpg', 'assets/scenes/bakery.jpg'];
    function pics(n, pre) { var o = []; for (var i = 0; i < n; i++) o.push({ id: rid(), name: pre + '-' + (i + 1) + '.jpg', stored: pre + '-' + (i + 1) + '.jpg', size: 840000, img: true, thumb: img[i % 4], st: 'ok' }); return o; }
    S.a = {
      name: { v: 'Golden Crust Bakery' }, trade: { t: 'Bakery', l: 'Fresh bread and pastries, baked every morning' },
      where: { m: 'They come to us', ad: '100 Example Street, Casper, WY 82601' }, contact: { p: '(307) 555-0142', e: 'hello@goldencrust.example' },
      hours: { o0: '7:00 AM', c0: '6:00 PM', o1: '7:00 AM', c1: '6:00 PM', o2: '7:00 AM', c2: '6:00 PM', o3: '7:00 AM', c3: '6:00 PM', o4: '7:00 AM', c4: '6:00 PM', o5: '8:00 AM', c5: '2:00 PM', x6: '1' },
      proof: { p: ['Years in business', 'Guarantee'], 'Years in business': 'Family bakery since 2009', Guarantee: 'Fresh today, or your money back' },
      who: { p: ['Families', 'Walk-ins'], l: 'Local families who stop in on the way to work and school' },
      why: { p: ['Quality', 'Family-owned', 'Friendly service'], l: 'Everything is baked here every morning, by the same family' },
      sell: S.plan === 'store' ? { m: 'Upload the product sheet' } : { m: 'I will type them', list: 'Sourdough loaf, $8\nCroissant, $4\nCinnamon roll, $5\nCelebration cake, from $45' },
      top: { v0: 'Sourdough loaf', v1: 'Celebration cakes', v2: 'Breakfast box' }, offer: { v: 'A free coffee with any two pastries before 9 AM' },
      colors: { m: 'Match my logo' }, look: { v: 'Warm and handmade' }, likes: { u0: 'https://example.com', w0: 'The big food photos' },
      know: { v0: 'Everything is baked fresh each morning', v1: 'Cakes need 48 hours notice', v2: 'Free parking at the back' },
      about: { m: 'Write it from my answers' }, reviews: { m: 'Use my Google reviews', g: 'https://g.page/r/example' },
      cta: { m: 'Call', v: '(307) 555-0142' }, domain: { m: 'I own one', v: 'goldencrustbakery.com', r: 'GoDaddy' },
      mail: { v0: 'hello', v1: 'orders', v2: 'cakes', v3: 'jobs', v4: 'events' }, links: { v0: 'https://g.page/example', v2: 'https://instagram.com/example' },
      pages: { n0: 'Celebration cakes', n1: 'Catering', n2: 'Wholesale bread' }, faq: { m: 'Write them from my answers' },
      book: { m: 'Bookable services', v: 'Cake tasting, 30 min, $15\nCatering call, 20 min, free' }, takes: { n: 'Maria and Tom', m: 'Same as opening hours' },
      pay: { m: 'Yes', s: 'I need one' }, leads: { e: 'maria@goldencrust.example', m: '(307) 555-0199' },
      more: { n0: 'Breakfast boxes', n1: 'Gluten-free range', n2: 'Baking classes', n3: 'Gift cards' }, towns: { v0: 'Casper', v1: 'Mills', v2: 'Evansville' },
      team: { c: 2, n0: 'Maria Lopez', r0: 'Owner and head baker', l0: 'Bakes every loaf before sunrise', n1: 'Tom Lopez', r1: 'Cakes', l1: 'Makes every celebration cake by hand' },
      blog: { you: 'You choose' }, hiring: { m: 'Not now' }, seo: { s0: 'bakery in Casper', s1: 'birthday cakes Casper', s2: 'sourdough Casper WY', c0: 'Main Street Bakes' },
      pphotos: { link: 'https://drive.google.com/example' }, cats: { v: 'Bread, Pastries, Cakes, Gift boxes' },
      delivery: { p: ['Shipping', 'Local pickup'], pm: 'Free over', amt: '60', wh: 'All US states' }, returns: { m: '14 days' }, tax: { v: 'Wyoming' }, stripe: { m: 'I need one' },
      orders: { e: 'orders@goldencrust.example', m: '(307) 555-0199' },
      approver: { n: 'Maria Lopez', e: 'maria@goldencrust.example', m: '(307) 555-0199' }, done: { v: 'This brief is complete. Build my first draft from it.' }
    };
    S.f = {
      logo: [{ id: rid(), name: 'golden-crust-logo.png', stored: 'golden-crust-logo.png', size: 48000, img: true, thumb: 'assets/bakery/item-1.jpg', st: 'ok' }],
      photos: pics(12, 'bakery-photo'), products: [{ id: rid(), name: 'golden-crust-products.csv', stored: 'golden-crust-products.csv', size: 6200, img: false, st: 'ok' }],
      productphotos: pics(18, 'product'), team0: pics(1, 'maria'), team1: pics(1, 'tom')
    };
    S.token = 'd0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0';
  }

  /* ---------- start ---------- */
  function start() {
    if (!PLANS[S.plan]) { renderPicker(); return; }
    STEPS = build(S.plan);
    if (DEMO) {
      demo();
      var sp = P.get('step');
      if (sp === 'done') { renderDone(total(), STEPS.total); return; }
      S.step = Math.max(0, Math.min(STEPS.length - 1, (parseInt(sp, 10) || 1) - 1)); S.max = STEPS.length - 1;
    }
    S.max = Math.max(S.max, S.step);
    renderStep(false);
  }
  window.__brief = { state: function () { return S; }, steps: function () { return STEPS; }, total: total };
  start();
})();
