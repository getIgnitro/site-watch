// s-barber.js - chat 19: the working parts of the barber sample (approved mock: _dev/mocks/barber.html).
// Roster: pick a barber (01-04). Booking rail: pick a service, pick a free slot (it becomes "Your chair"),
// taken slots never select, BOOK NOW confirms. "Next free chair" follows the board and the barber.
// Moved here from js/ui/booking.js and js/ui/samples.js (round 4 logic, same copy).

const $ = (s, r) => r.querySelector(s);
const $$ = (s, r) => Array.from(r.querySelectorAll(s));

export function initBarber(fin, { rm }) {
  const gsap = window.gsap;
  const sc = $('.scene--barber', fin);
  if (!sc) return;
  const rail = $('.nb-rail', sc);
  const conf = $('.nb-conf', rail);
  const go = $('.nb-go', rail);
  const st = { barber: '', svc: 'Cut', slot: '3:15', booked: null };

  const radio = (els, pick) => els.forEach((b) => {
    const on = pick(b);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  const line = () => (st.barber ? `Booked with ${st.barber}. See you at ${st.booked}.` : `Booked. See you at ${st.booked}.`);

  function render() {
    radio($$('.nb-barber', sc), (b) => (b.dataset.barber || '') === st.barber);
    radio($$('.nb-opt', rail), (b) => b.dataset.svc === st.svc);
    const slots = $$('.nb-slot', rail);
    slots.forEach((b) => {
      if (b.classList.contains('is-taken')) return;
      const on = b.dataset.slot === st.slot;
      b.classList.toggle('is-on', on);
      b.classList.toggle('is-free', !on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      $('span', b).textContent = on ? 'Your chair' : 'Free';
    });
    const free = slots.find((b) => !b.classList.contains('is-taken') && b.dataset.slot !== st.slot);
    $('.nb-next__n b', rail).textContent = free ? free.dataset.slot : '-';
    $('.nb-who', rail).textContent = st.barber ? `with ${st.barber}` : 'with any barber';
    $('em', go).textContent = st.slot || '';
    // the confirmation line is the booked state (as in the approved mock: BOOK NOW 3:15 + "Booked. See you at 3:15.")
    sc.dataset.booked = st.booked && st.booked === st.slot ? st.booked : '';
  }

  function say(text) {
    conf.textContent = text;
    conf.classList.toggle('is-on', !!text);
    if (!text) return;
    gsap.fromTo(conf, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: rm ? 0 : 0.32, ease: 'steps(8)', overwrite: true });
  }

  sc.addEventListener('click', (e) => {
    const who = e.target.closest('.nb-barber');
    if (who) {
      st.barber = who.dataset.barber || '';
      render();
      if (st.booked && st.booked === st.slot) conf.textContent = line();   // the confirmation follows the barber
      return;
    }
    const opt = e.target.closest('.nb-opt');
    if (opt) { st.svc = opt.dataset.svc; render(); return; }
    const slot = e.target.closest('.nb-slot');
    if (slot) {
      if (slot.classList.contains('is-taken')) return;   // taken: never selects
      if (st.slot !== slot.dataset.slot) { st.slot = slot.dataset.slot; render(); say(st.booked === st.slot ? line() : ''); }
      return;
    }
    if (e.target.closest('.nb-go')) {
      if (!st.slot) return;
      st.booked = st.slot;
      render();
      say(line());
    }
  });

  render();
  // test hook: the current booking state
  window.__knBarber = { state: () => ({ ...st, conf: conf.textContent, next: $('.nb-next__n b', rail).textContent, who: $('.nb-who', rail).textContent, go: go.textContent.trim() }) };
}
