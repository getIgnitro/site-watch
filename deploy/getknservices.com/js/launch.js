/* launch.js - KN v5 launch pages: the plan picker and order panel on start.html, the contact form on
   contact.html. Plain script, no build step. Payment links come from js/pay-config.js (window.KN_PAY). */
(function () {
  'use strict';
  var d = document;
  var PLANS = {
    launch:    { name: 'Launch',    group: 'Website plan',      price: 99 },
    business:  { name: 'Business',  group: 'Website plan',      price: 179 },
    pro:       { name: 'Pro',       group: 'Website plan',      price: 329 },
    store:     { name: 'Store',     group: 'Website plan',      price: 499 },
    essential: { name: 'Essential', group: 'Social media plan', price: 499 },
    growth:    { name: 'Growth',    group: 'Social media plan', price: 899 },
    full:      { name: 'Full',      group: 'Social media plan', price: 1799 }
  };
  function qs(s, r) { return (r || d).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function usd(n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function param(k) { try { return new URLSearchParams(location.search).get(k) || ''; } catch (e) { return ''; } }
  function payLink(key) {
    var u = (window.KN_PAY || {})[key] || '';
    return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_\-\/]+$/.test(u) ? u : '';
  }

  /* Post a form to contact.php and report back in the page. */
  function wire(form, done) {
    var msg = qs('.fm__msg', form), btn = qs('button[type="submit"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending';
      msg.className = 'fm__msg'; msg.textContent = '';
      fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (o) {
          if (o.j && o.j.ok) { done(); return; }
          throw new Error((o.j && o.j.err) || 'send');
        })
        .catch(function (err) {
          btn.disabled = false; btn.textContent = label;
          msg.className = 'fm__msg is-err';
          msg.textContent = String(err && err.message) === 'rate'
            ? 'Too many messages from this connection. Please email hello@getknservices.com.'
            : 'That did not send. Please try again, or email hello@getknservices.com.';
        });
    });
  }

  /* ---------- start.html ---------- */
  var order = qs('#order');
  if (order) {
    var picks = qsa('.pk'), cur = '';
    var el = {
      empty: qs('#or-empty'), body: qs('#or-body'), name: qs('#or-name'), grp: qs('#or-grp'),
      due: qs('#or-due'), then: qs('#or-then'), pay: qs('#or-pay'), payAmt: qs('#or-pay-amt'),
      payBox: qs('#or-paybox'), form: qs('#or-form'), plan: qs('#or-plan'), ask: qs('#or-ask'), done: qs('#or-done')
    };
    var choose = function (key, scroll) {
      var p = PLANS[key];
      if (!p) return;
      cur = key;
      picks.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-plan') === key)); });
      el.empty.hidden = true; el.body.hidden = false;
      el.name.textContent = p.name;
      el.grp.textContent = p.group;
      el.due.textContent = usd(p.price);
      el.then.textContent = usd(p.price);
      el.ask.setAttribute('href', 'contact.html?plan=' + key);
      var link = payLink(key);
      el.payBox.hidden = !link; el.form.hidden = !!link;
      qs('#or-due-k').textContent = link ? 'Due today' : 'First month';
      if (link) { el.pay.setAttribute('href', link + '?client_reference_id=' + key); el.payAmt.textContent = usd(p.price); }
      else { el.plan.value = key; }
      try { history.replaceState(null, '', 'start.html?plan=' + key); } catch (e) {}
      if (scroll && window.matchMedia('(max-width: 980px)').matches) order.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    picks.forEach(function (b) { b.addEventListener('click', function () { choose(b.getAttribute('data-plan'), true); }); });
    /* Remember the plan on Pay: thanks.html reads kn_plan to send a website customer on to the brief. */
    el.pay.addEventListener('click', function () { if (PLANS[cur]) { try { localStorage.setItem('kn_plan', cur); } catch (e) {} } });
    wire(el.form, function () {
      el.form.hidden = true; el.done.hidden = false;
      picks.forEach(function (b) { b.disabled = true; });
    });
    if (PLANS[param('plan')]) choose(param('plan'), false);
    if (param('sent') === '1') { el.empty.hidden = true; el.body.hidden = true; el.done.hidden = false; }
  }

  /* ---------- contact.html ---------- */
  var cform = qs('#enquiry');
  if (cform) {
    var sel = qs('select[name="interest"]', cform), ta = qs('textarea', cform);
    var want = param('plan') || param('need');
    if (want && qs('option[value="' + want.replace(/[^a-z]/g, '') + '"]', sel)) sel.value = want;
    var hint = function () {
      ta.setAttribute('placeholder', sel.value === 'call'
        ? 'Give us two or three times that suit you, with your time zone, and the number to call.'
        : sel.value === 'software' ? 'Describe one workflow in your own words.' : 'Tell us about your business and what you need.');
    };
    sel.addEventListener('change', hint); hint();
    var sentBox = qs('#sent');
    wire(cform, function () { try { document.dispatchEvent(new CustomEvent('kn:lead-sent', { detail: { from: 'contact' } })); } catch (e) {} cform.hidden = true; sentBox.hidden = false; sentBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    if (param('sent') === '1') { cform.hidden = true; sentBox.hidden = false; }
    if (param('error')) { var m = qs('.fm__msg', cform); m.className = 'fm__msg is-err'; m.textContent = 'That did not send. Please try again, or email hello@getknservices.com.'; }
  }
})();
