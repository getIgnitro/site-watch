// s-dental.js - chat 19: the working parts of the dental sample (approved mock: _dev/mocks/dental.html).
//   booking pill   Reason dropdown (Check-up and clean / Whitening / Toothache), Dentist dropdown, time chips,
//                  round Book button -> the confirmation line with the chosen values
//   meet the team  the three monogram avatars pick the dentist too (both stay in step)
//   open now       Mon to Thu 8 am to 5 pm, Fri 8 am to 1 pm, on the visitor's clock
// The build itself (js-b1 / js-b2 + js-w / js-s3) is driven by main.js and samples.js.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
// opening hours per weekday (0 = Sunday), minutes after midnight
const HOURS = [null, [480, 1020], [480, 1020], [480, 1020], [480, 1020], [480, 780], null];
const MONO = { 'Dr. Maya Ellis': 'ME', 'Dr. Tom Reyes': 'TR', 'Jo Park': 'JP' };
const WHY = { Whitening: 'Booked for whitening.', Toothache: 'Booked for a toothache.' };

export function initDental(fin, { rm }) {
  const gsap = window.gsap;
  const sc = $('.scene--dental', fin);
  if (!sc) return;
  const book = $('.ld-book', sc);
  const conf = $('.ld-conf__t', sc);
  const state = { why: 'Check-up and clean', who: 'Dr. Maya Ellis' };

  // sample links go nowhere (an href="#" would jump the scroll story to the top)
  sc.addEventListener('click', (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });

  // ---------- dropdowns ----------
  const menus = Object.fromEntries($$('.ld-menu', sc).map((m) => [m.dataset.for, m]));
  let open = null;
  function place(m, btn) {
    const r = btn.getBoundingClientRect(), s = sc.getBoundingClientRect();
    m.style.left = `${Math.round(r.left - s.left - 12)}px`;
    m.style.top = `${Math.round(r.bottom - s.top + 10)}px`;
    m.style.minWidth = `${Math.round(r.width + 24)}px`;
  }
  function close() {
    if (!open) return;
    open.m.hidden = true;
    open.btn.setAttribute('aria-expanded', 'false');
    open = null;
  }
  function toggle(btn) {
    const m = menus[btn.dataset.dd];
    if (open && open.m === m) { close(); return; }
    close();
    place(m, btn);
    m.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    open = { m, btn };
    if (!rm) gsap.fromTo(m, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.18, ease: 'steps(4)', overwrite: true });
  }
  $$('.ld-dd', sc).forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); toggle(b); }));
  document.addEventListener('click', (e) => { if (open && !open.m.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const b = open.btn; close(); b.focus(); } });
  window.addEventListener('scroll', close, { passive: true });
  window.addEventListener('resize', close);

  // ---------- selections ----------
  const mark = (list, v, attr) => list.forEach((b) => {
    const on = b.dataset.v === v;
    b.classList.toggle('is-on', on);
    b.setAttribute(attr, on ? 'true' : 'false');
  });
  function setWhy(v) {
    state.why = v;
    $('#ld-why-v', sc).textContent = v;
    mark($$('.ld-opt', menus.why), v, 'aria-selected');
  }
  function setWho(v) {
    state.who = v;
    $('#ld-who-v', sc).textContent = v;
    $('.ld-dd[data-dd="who"] .ld-mini', sc).textContent = MONO[v] || '';
    mark($$('.ld-opt', menus.who), v, 'aria-selected');
    mark($$('.ld-doc', sc), v, 'aria-checked');
  }
  Object.values(menus).forEach((m) => m.addEventListener('click', (e) => {
    const o = e.target.closest('.ld-opt');
    if (!o) return;
    if (m.dataset.for === 'why') setWhy(o.dataset.v); else setWho(o.dataset.v);
    const b = open && open.btn;
    close();
    if (b) b.focus();
  }));
  $('.ld-docs', sc).addEventListener('click', (e) => { const d = e.target.closest('.ld-doc'); if (d) setWho(d.dataset.v); });
  $('.ld-slots', sc).addEventListener('click', (e) => {
    const s = e.target.closest('.ld-slot');
    if (!s) return;
    $$('.ld-slot', sc).forEach((b) => { const on = b === s; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); });
  });

  // ---------- book ----------
  function line() {
    const s = $('.ld-slot.is-on', sc);
    const lead = WHY[state.why] || 'Booked.';
    return `${lead} See you ${s.dataset.day} at ${s.dataset.time} with ${state.who}.`;
  }
  $('.ld-go', book).addEventListener('click', () => {
    close();
    conf.textContent = line();
    gsap.fromTo(conf, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: rm ? 0 : 0.32, ease: 'steps(8)', delay: rm ? 0 : 0.05, overwrite: true });
  });

  // ---------- open now, visitor's clock ----------
  const hours = $('.ld-hours', sc);
  function tick(day, now) {
    const d = new Date();
    if (day == null) day = d.getDay();
    if (now == null) now = d.getHours() * 60 + d.getMinutes();
    const h = HOURS[day];
    const isOpen = !!h && now >= h[0] && now < h[1];
    hours.dataset.open = isOpen ? '1' : '0';
    $('.ld-state', hours).textContent = isOpen ? 'Open now' : 'Closed now';
  }
  tick();
  let pin = null;   // set by the test hook at(): the pinned clock survives the 20 s re-tick
  setInterval(() => (pin ? tick(pin[0], pin[1]) : tick()), 20000);

  // test hooks: the clock (weekday 0 = Sunday, minutes after midnight) and the booking state
  window.__knDental = { at: (day, m) => { pin = [day, m]; tick(day, m); }, state: () => ({ ...state, time: $('.ld-slot.is-on', sc).textContent, conf: conf.textContent, open: hours.dataset.open }) };
}
