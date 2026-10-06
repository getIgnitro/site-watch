// s-garage.js - chat 19: the working parts of the garage sample (approved mock: _dev/mocks/garage.html).
//   01 service board: pick a row (it lights), drop-off day and time, Book confirms on the status line
//   02 open now from the visitor's clock (Mon to Fri 7 am to 6 pm, Sat 8 am to 1 pm), Call the shop
//   03 parts shop: Add puts an item in the cart (count + running total), Checkout places the order
//   town tabs: switch the town line
// Layout help: the hazard tape starts where the headline ends; on a phone the seam (film / slab) follows the
// headline and the headline takes the height left over, so nothing overlaps the KN caption.
// The third build step (the .js-s3 blocks) is driven by samples.js, as for every sample.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = (n) => `$${n.toFixed(2)}`;
// opening hours per weekday (0 = Sunday), minutes after midnight
const HOURS = [null, [420, 1080], [420, 1080], [420, 1080], [420, 1080], [420, 1080], [480, 780]];

export function initGarage(fin, { rm }) {
  const sc = $('.scene--garage', fin);
  if (!sc) return;
  const gsap = window.gsap;
  const PHONE = matchMedia('(max-width: 700px)');
  const wipe = (el, text) => {
    el.textContent = text;
    if (gsap) gsap.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: rm ? 0 : 0.32, ease: 'steps(8)', overwrite: true });
  };
  const radio = (group, btn) => $$('[role="radio"]', group).forEach((b) => {
    const on = b === btn;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });

  // the sample's links go nowhere (and must not jump the scroll site to the top)
  sc.addEventListener('click', (e) => { if (e.target.closest('a[href="#"]')) e.preventDefault(); });

  // ---------- 01 service board ----------
  const board = $('.ga-board', sc);
  const rows = $$('.ga-rows .ga-row', board);
  const days = $('.ga-days', board), times = $('.ga-times', board), when = $('.ga-when', board), go = $('.ga-go', board);
  const status = $('.ga-status', board), stT = $('.ga-status__t', status);
  const sel = () => ({ row: rows.find((r) => r.classList.contains('is-on')) || rows[0], day: $('.is-on', days).dataset.v, time: $('.is-on', times).dataset.v });
  // desktop: the day and time chips sit in the lit row; phone: on their own row with the Book button
  function place() {
    const { row } = sel();
    if (PHONE.matches) { when.insertBefore(days, go); when.insertBefore(times, go); }
    else { $('.ga-cell--d', row).appendChild(days); $('.ga-cell--t', row).appendChild(times); }
  }
  function pending() {
    const s = sel();
    status.dataset.state = 'pending';
    stT.textContent = `${s.row.dataset.svc}, ${s.day} at ${s.time}.`;
  }
  function book() {
    const s = sel();
    status.dataset.state = 'booked';
    wipe(stT, `Booked. Drop off ${s.day} at ${s.time}.`);
  }
  function light(row) {
    rows.forEach((r) => {
      const on = r === row;
      r.classList.toggle('is-on', on);
      $('.ga-pick', r).setAttribute('aria-checked', on ? 'true' : 'false');
    });
    place();
  }
  board.addEventListener('click', (e) => {
    const pick = e.target.closest('.ga-pick');
    if (pick && pick.closest('.ga-rows')) { const r = pick.closest('.ga-row'); if (!r.classList.contains('is-on')) { light(r); pending(); } return; }
    const chip = e.target.closest('.ga-chip');
    if (chip) { radio(chip.parentElement, chip); pending(); return; }
    const bk = e.target.closest('.ga-bk');
    if (bk) { light(bk.closest('.ga-row')); book(); return; }
    if (e.target.closest('.ga-go')) book();
  });
  // the hero's Book a service button points at the board's Book button
  $('.ga-btn', sc).addEventListener('click', () => { const b = PHONE.matches ? go : $('.ga-bk', sel().row); b.focus({ preventScroll: true }); });

  // ---------- 03 parts shop ----------
  const parts = $('.ga-parts', sc);
  const cartN = $('.ga-cart b', parts), sumEl = $('.ga-pt__sum', parts), lab = $('.ga-pt__l', parts);
  let n = 0, sum = 0;
  $$('.ga-add.is-in', parts).forEach((b) => { n += 1; sum += +b.dataset.price; });   // the sample starts with 1 item, $24.00
  parts.addEventListener('click', (e) => {
    const add = e.target.closest('.ga-add');
    if (add) {
      n += 1; sum += +add.dataset.price;
      add.classList.add('is-in');
      cartN.textContent = n;
      sumEl.textContent = money(sum);
      lab.textContent = 'Total'; lab.classList.remove('is-done');
      if (gsap) gsap.fromTo(cartN, { scale: 1.35 }, { scale: 1, duration: rm ? 0 : 0.3, ease: 'steps(3)', overwrite: true });
      return;
    }
    if (e.target.closest('.ga-co')) { lab.classList.add('is-done'); wipe(lab, n ? 'Order placed' : 'Add an item first'); }
  });

  // ---------- town tabs ----------
  const tabs = $('.ga-tabs', sc);
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('.ga-tab');
    if (!b) return;
    radio(tabs, b);
    $('.ga-in b', sc).textContent = b.textContent.trim();
  });

  // ---------- 02 open now, visitor's clock ----------
  const open = $('.ga-open', sc);
  function tick(day, now) {
    const d = new Date();
    if (day == null) day = d.getDay();
    if (now == null) now = d.getHours() * 60 + d.getMinutes();
    const h = HOURS[day];
    const on = !!h && now >= h[0] && now < h[1];
    open.dataset.open = on ? '1' : '0';
    $('.ga-open__t', open).textContent = on ? 'Open now' : 'Closed now';
  }
  tick();
  let pin = null;   // set by the test hook at(): the pinned clock survives the 20 s re-tick
  setInterval(() => (pin ? tick(pin[0], pin[1]) : tick()), 20000);

  // ---------- layout: hazard tape, phone seam and headline size ----------
  const h1 = $('.ga-h1', sc), l2 = $('.ga-l2', sc), cap = $('.kn-cap', sc), last = parts;
  const endOf = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
  function layout() {
    const top = sc.getBoundingClientRect();
    if (PHONE.matches) {
      // the headline takes the room left between the head and the caption (2 lines at 0.86)
      let hs = Math.min(window.innerWidth * 0.135, 60);
      const gp0 = window.innerHeight < 720 ? 4 : 6;
      sc.style.setProperty('--hs', `${hs}px`); sc.style.setProperty('--gp', `${gp0}px`);
      for (let i = 0; i < 4; i++) {
        const over = last.getBoundingClientRect().bottom - (cap.getBoundingClientRect().top - 10);
        if (over <= 0) {
          // spare room: open the gaps a little (never past 14 px)
          const gp = Math.min(14, gp0 + Math.floor(-over / 5));
          sc.style.setProperty('--gp', `${gp}px`);
          break;
        }
        hs = Math.max(24, hs - over / 1.72 - 1);
        sc.style.setProperty('--hs', `${hs.toFixed(1)}px`);
      }
      const t = l2.getBoundingClientRect();
      sc.style.setProperty('--seam', `${Math.round(t.top - top.top + t.height * 0.52)}px`);
      sc.style.setProperty('--hzl', `${Math.round(endOf(l2).right - top.left + 10)}px`);
    } else {
      ['--hs', '--gp', '--seam'].forEach((p) => sc.style.removeProperty(p));
      const u = Math.min(window.innerWidth / 1920, (window.innerHeight - 60) / 1020);
      sc.style.setProperty('--hzl', `${Math.round(endOf(l2).right - top.left + 36 * u)}px`);
    }
  }
  place();
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener('resize', layout);
  PHONE.addEventListener('change', () => { place(); layout(); });

  // test hook: render the clock-driven parts for a weekday (0 = Sunday) and a time (minutes after midnight)
  window.__knGarage = { at: (day, m) => { pin = [day, m]; tick(day, m); }, layout };
}
