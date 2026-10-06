// s-bakery.js - chat 19: the working parts of the bakery sample (approved mock: _dev/mocks/bakery.html).
// The order ticket: quantity steppers (0 to 9), line totals, total, the nav count and the "N items" line,
// pickup time (radio), Place order with a confirmation state. Carried over from the round 4 order panel
// (samples.js); the visitor-clock parts were dropped so the approved sample details stay as approved
// ("Open now", 9:00 am selected, all four times free).
// Phone: once the ticket is built, the sub line and the hanging sign step aside (class gc-tkon, css only).

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const money = (n) => `$${n.toFixed(2)}`;

export function initBakery(fin, { rm }) {
  const sc = $('.scene--bakery', fin);
  if (!sc) return;
  const tk = $('.gc-tk', sc);
  const rows = $$('.gc-row', tk);
  const qty = new Map(rows.map((li) => [li.dataset.item, +li.dataset.q || 0]));
  let pick = ($('.gc-time.is-on', tk) || $('.gc-time', tk)).dataset.t;

  const count = () => rows.reduce((s, li) => s + qty.get(li.dataset.item), 0);
  const total = () => rows.reduce((s, li) => s + (+li.dataset.price) * qty.get(li.dataset.item), 0);
  const note = $('.gc-tk__note', tk);
  const place = $('.gc-place span', tk);

  function render() {
    rows.forEach((li) => {
      const q = qty.get(li.dataset.item);
      $('output', li).textContent = q;
      $('.gc-row__l', li).textContent = money(q * (+li.dataset.price));
      li.classList.toggle('is-zero', q === 0);
      $('button[data-d="-1"]', li).disabled = q === 0;
      $('button[data-d="1"]', li).disabled = q === 9;
    });
    const n = count();
    $('.gc-tk__total b', tk).textContent = money(total());
    $('.gc-bag b', sc).textContent = n;
    note.textContent = `${n} ${n === 1 ? 'item' : 'items'} · ready at ${pick}`;
    $$('.gc-time', tk).forEach((b) => { const on = b.dataset.t === pick; b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); });
    tk.classList.remove('is-placed', 'is-empty');
    place.textContent = 'Place order';
  }

  tk.addEventListener('click', (e) => {
    const st = e.target.closest('.gc-step button');
    if (st) {
      const id = st.closest('.gc-row').dataset.item;
      qty.set(id, Math.max(0, Math.min(9, qty.get(id) + (+st.dataset.d))));
      render();
      return;
    }
    const tb = e.target.closest('.gc-time');
    if (tb) { pick = tb.dataset.t; render(); return; }
    if (e.target.closest('.gc-place')) {
      if (!count()) { tk.classList.add('is-empty'); note.textContent = 'Add an item first.'; return; }
      tk.classList.add('is-placed');
      place.textContent = 'Order placed';
      note.textContent = `Order placed for ${pick}.`;
    }
  });
  // arrow keys move the pickup choice, like a radio group
  $('.gc-times', tk).addEventListener('keydown', (e) => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!k) return;
    e.preventDefault();
    const bs = $$('.gc-time', tk);
    const i = (bs.findIndex((b) => b.dataset.t === pick) + k + bs.length) % bs.length;
    pick = bs[i].dataset.t; render(); bs[i].focus();
  });
  // sample links stay on the page
  sc.addEventListener('click', (e) => { const a = e.target.closest('a[href="#"]'); if (a) e.preventDefault(); });

  // phone: mark the scene once the ticket has started to build (main.js snaps .gc-tkw in at step 2)
  const tkw = $('.gc-tkw', sc);
  const sync = () => {
    const cs = tkw.style;
    const on = cs.visibility !== 'hidden' && !/100%/.test(cs.clipPath || 'inset(0% 100%') && (rm ? +(cs.opacity || 0) > 0.05 : true);
    sc.classList.toggle('gc-tkon', on);
  };
  new MutationObserver(sync).observe(tkw, { attributes: true, attributeFilter: ['style'] });
  sync();
  render();
}
