/* ask.js - "Ask us first" question form on the plan pages (26 Oct 2026).
 * Why: Clarity showed ad visitors reading the prices for 30 s+ and leaving, because the only
 * next steps were a paid order or WhatsApp. This gives them a no-payment question form.
 * Posts to the existing contact.php (name, email, message; interest = the plan they last tapped),
 * shows the answer in the page, and fires kn:lead-sent (track.js reports it to Google Ads)
 * plus a Clarity event, so every question shows up in both dashboards. */
(function () {
  var d = document, form = d.getElementById('ask-form');
  if (!form) return;
  var ok = d.getElementById('ask-ok'), msg = form.querySelector('.fm__msg'),
      btn = form.querySelector('button[type="submit"]'), interest = form.querySelector('input[name="interest"]');

  /* remember the plan the visitor last tapped, so the email says which one they looked at */
  d.addEventListener('click', function (e) {
    var p = e.target && e.target.closest ? e.target.closest('[data-plan]') : null;
    if (p && interest) interest.value = p.getAttribute('data-plan') || 'unsure';
  }, true);

  function clarity(name) { try { if (window.clarity) window.clarity('event', name); } catch (e) {} }
  form.addEventListener('focusin', function once() { clarity('ask-form-start'); form.removeEventListener('focusin', once); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending';
    msg.className = 'fm__msg'; msg.textContent = '';
    fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.err) || 'send');
        form.hidden = true; ok.hidden = false;
        try { d.dispatchEvent(new CustomEvent('kn:lead-sent', { detail: { from: 'ask' } })); } catch (x) {}
        clarity('ask-form-sent');
      })
      .catch(function (err) {
        btn.disabled = false; btn.textContent = label;
        msg.className = 'fm__msg is-err';
        msg.textContent = String(err && err.message) === 'rate'
          ? 'Too many messages from this connection. Please email hello@getknservices.com.'
          : 'That did not send. Please try again, or email hello@getknservices.com.';
      });
  });
})();
