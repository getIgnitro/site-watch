/* track.js - KN v5 Google Ads tracking (6 Oct 2026). Loads the Google tag and reports three conversions:
 *   purchase  - thanks.html reached after a Stripe payment (plan from localStorage kn_plan, set on the Pay click in launch.js)
 *   brief     - the build brief delivered (brief.js fires the kn:brief-sent event on success)
 *   whatsapp  - any tap on a wa.me link (page buttons and the chat square)
 * All ids and labels live in track-config.js. With an empty id this file does nothing, so it is safe on the live site. */
(function () {
  var C = window.KN_TRACK || {};
  if (!C.id) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.id);
  document.head.appendChild(s);
  gtag('js', new Date());
  /* measurement only: no remarketing / ad personalization (privacy.html says so; turning it on needs a privacy update first) */
  gtag('config', C.id, { allow_ad_personalization_signals: false });

  var PRICE = { launch: 99, business: 179, pro: 329, store: 499, essential: 499, growth: 899, full: 1799 };
  function once(key) { try { if (sessionStorage.getItem(key)) return false; sessionStorage.setItem(key, '1'); } catch (e) {} return true; }
  function conv(label, extra) {
    if (!label) return;
    var p = { send_to: C.id + '/' + label };
    for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) p[k] = extra[k];
    gtag('event', 'conversion', p);
  }

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  /* purchase: once per plan per browser session */
  if (page === 'thanks.html') {
    /* plan: ?plan= first (as thanks.html reads it), else kn_plan saved on the Pay click */
    var plan = '';
    try { plan = (new URLSearchParams(location.search).get('plan') || '').toLowerCase(); } catch (e) {}
    if (!PRICE[plan]) { try { plan = (localStorage.getItem('kn_plan') || '').toLowerCase(); } catch (e) {} }
    /* unknown plan: send no value, so Google applies the action's default (99 USD) instead of 0 */
    if (once('kn_conv_purchase_' + (plan || 'x'))) conv(C.purchase, PRICE[plan] ? { value: PRICE[plan], currency: 'USD' } : {});
  }

  /* brief sent */
  document.addEventListener('kn:brief-sent', function () { if (once('kn_conv_brief')) conv(C.brief); });

  /* WhatsApp tap: counted on every tap, Google de-duplicates by its own rules */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"]') : null;
    if (a) conv(C.whatsapp);
  }, true);
})();
