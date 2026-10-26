(function () {
  const T = window.TK, { cats, brands, products, fmt, esc, t, EN } = T;
  T.mount('catalog');
  const $ = id => document.getElementById(id);
  const PAGE = 36;
  const url = new URL(location.href);
  const state = {
    q: url.searchParams.get('q') || '',
    cat: new Set((url.searchParams.get('cat') || '').split(',').filter(Boolean)),
    brand: new Set((url.searchParams.get('brand') || '').split(',').filter(Boolean)),
    group: url.searchParams.get('group') || '',
    priced: url.searchParams.get('priced') === '1',
    img: url.searchParams.get('img') === '1',
    sort: url.searchParams.get('sort') || 'rel',
    sub: url.searchParams.get('sub') || '',
    shown: PAGE
  };
  if (state.group) { cats.filter(c => c.group === state.group).forEach(c => state.cat.add(c.slug)); state.group = ''; }
  $('q').value = state.q; $('sort').value = state.sort; $('fPriced').checked = state.priced; $('fImg').checked = state.img;

  const catById = Object.fromEntries(cats.map(c => [c.id, c]));
  const brandById = Object.fromEntries(brands.map(b => [b.id, b]));
  const groups = [...new Set(cats.map(c => c.group))];

  function baseFilter(skip) {
    let list = T.search(state.q, products);
    if (state.priced) list = list.filter(p => p.pmin != null);
    if (state.img) list = list.filter(p => p.i);
    if (skip !== 'cat' && state.cat.size) list = list.filter(p => state.cat.has(catById[p.c].slug));
    if (skip !== 'brand' && state.brand.size) list = list.filter(p => state.brand.has(brandById[p.bi].slug));
    if (skip !== 'sub' && state.sub) list = list.filter(p => p.sc === state.sub);
    return list;
  }
  const score = p => (p.i ? (p.iq === 'high' ? 3 : 2) : 0) + (p.pmin != null ? 2 : 0) + Math.min(p.k, 20) / 20;

  function renderFilters() {
    const forCats = baseFilter('cat'), forBrands = baseFilter('brand');
    const cc = {}; forCats.forEach(p => cc[p.c] = (cc[p.c] || 0) + 1);
    const bc = {}; forBrands.forEach(p => bc[p.bi] = (bc[p.bi] || 0) + 1);
    $('fCats').innerHTML = groups.map(g => {
      const cs = cats.filter(c => c.group === g && c.count);
      if (!cs.length) return '';
      return `<div class="fgroup-title" style="--c:${T.groupColor(g)}">${esc(T.groupName(cs[0]))}</div>` + cs.map(c => `<label class="fopt${cc[c.id] ? '' : ' zero'}">
        <input type="checkbox" data-cat="${c.slug}" ${state.cat.has(c.slug) ? 'checked' : ''}> ${esc(T.catName(c))}<span class="n">${cc[c.id] || 0}</span></label>`).join('');
    }).join('');
    const bq = $('brandSearch').value.trim().toLowerCase();
    $('fBrands').innerHTML = brands.filter(b => b.count && (!bq || b.name.toLowerCase().includes(bq)))
      .sort((a, b) => (bc[b.id] || 0) - (bc[a.id] || 0) || a.name.localeCompare(b.name))
      .map(b => `<label class="fopt${bc[b.id] ? '' : ' zero'}"><input type="checkbox" data-brand="${b.slug}" ${state.brand.has(b.slug) ? 'checked' : ''}> ${esc(b.name)}<span class="n">${bc[b.id] || 0}</span></label>`).join('');
  }

  function render() {
    let list = baseFilter();
    const s = state.sort;
    if (s === 'pa') list = list.slice().sort((a, b) => (a.pmin ?? 1e12) - (b.pmin ?? 1e12));
    else if (s === 'pd') list = list.slice().sort((a, b) => (b.pmax ?? -1) - (a.pmax ?? -1));
    else if (s === 'name') list = list.slice().sort((a, b) => (a.b + a.n).localeCompare(b.b + b.n));
    else if (s === 'sku') list = list.slice().sort((a, b) => b.k - a.k);
    else list = list.slice().sort((a, b) => score(b) - score(a));
    $('count').innerHTML = t('found', { n: fmt(list.length) });
    $('grid').innerHTML = list.length ? list.slice(0, state.shown).map(T.cardHTML).join('')
      : `<div class="empty" style="grid-column:1/-1">${t('none')}</div>`;
    $('more').style.display = list.length > state.shown ? '' : 'none';
    // chips + headings
    const chips = [];
    if (state.q) chips.push(['q', '', `"${state.q}"`]);
    state.cat.forEach(c => chips.push(['cat', c, T.catBySlug[c] ? T.catName(T.catBySlug[c]) : c]));
    state.brand.forEach(b => chips.push(['brand', b, T.brandBySlug[b] ? T.brandBySlug[b].name : b]));
    $('chips').innerHTML = chips.map(c => `<button class="chip" data-k="${c[0]}" data-v="${esc(c[1])}">${esc(c[2])}</button>`).join('');
    let title = t('all_products'), sub = t('all_sub'), crumb = t('all_products');
    if (state.brand.size === 1 && !state.cat.size) { const b = T.brandBySlug[[...state.brand][0]]; if (b) { title = b.name + '.'; crumb = b.name; sub = t('brand_sub', { n: fmt(b.count), k: fmt(b.skus) }); } }
    else if (state.cat.size === 1 && !state.brand.size) { const c = T.catBySlug[[...state.cat][0]]; if (c) { title = T.catName(c); crumb = T.catName(c); sub = t('cat_sub', { c: T.catName(c), n: fmt(c.count) }); } }
    else if (state.cat.size > 1 && !state.brand.size) { const gs = new Set([...state.cat].map(s => T.catBySlug[s] && T.catBySlug[s].group)); if (gs.size === 1) { const c0 = cats.find(c => c.group === [...gs][0]); title = T.groupName(c0); crumb = T.groupName(c0); sub = T.groupName(c0); } }
    $('title').innerHTML = esc(title.replace(/\.$/, ''));
    const hb = state.brand.size === 1 && !state.cat.size ? T.brandBySlug[[...state.brand][0]] : null;
    const hl = $('headLogo'); if (hb) { hl.innerHTML = T.brandLogoHTML(hb); hl.hidden = false; } else { hl.hidden = true; hl.innerHTML = ''; } $('crumb').textContent = crumb; $('subtitle').textContent = sub;
    document.title = `${crumb} — Triple E Trading`;
    // sub-type chips (only when one category is selected and it has a few clear sub-types)
    const subsEl = $('subs'); const forSub = state.cat.size === 1 ? baseFilter('sub') : [];
    const sc = {}; forSub.forEach(p => { if (p.sc) sc[p.sc] = (sc[p.sc] || 0) + 1; });
    const keys = Object.keys(sc).sort((a, b) => sc[b] - sc[a]);
    if (keys.length >= 2 && keys.length <= 12) {
      const en = k => { const p = forSub.find(x => x.sc === k); return EN && p && p.sc_en ? p.sc_en : k; };
      subsEl.innerHTML = `<button class="sub${state.sub ? '' : ' on'}" data-sub="">${EN ? 'All types' : 'ทุกประเภท'} <i>${fmt(forSub.length)}</i></button>` +
        keys.map(k => `<button class="sub${state.sub === k ? ' on' : ''}" data-sub="${esc(k)}">${esc(en(k))} <i>${fmt(sc[k])}</i></button>`).join('');
    } else { subsEl.innerHTML = ''; if (state.sub && state.cat.size !== 1) state.sub = ''; }
    renderFilters(); syncURL();
  }
  function syncURL() {
    const u = new URL(location.href); u.search = '';
    if (state.q) u.searchParams.set('q', state.q);
    if (state.cat.size) u.searchParams.set('cat', [...state.cat].join(','));
    if (state.brand.size) u.searchParams.set('brand', [...state.brand].join(','));
    if (state.priced) u.searchParams.set('priced', '1');
    if (state.img) u.searchParams.set('img', '1');
    if (state.sort !== 'rel') u.searchParams.set('sort', state.sort);
    if (state.sub) u.searchParams.set('sub', state.sub);
    history.replaceState(null, '', u);
  }

  let qt;
  $('q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim(); state.shown = PAGE; render(); }, 160); });
  $('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $('fPriced').addEventListener('change', e => { state.priced = e.target.checked; state.shown = PAGE; render(); });
  $('fImg').addEventListener('change', e => { state.img = e.target.checked; state.shown = PAGE; render(); });
  $('brandSearch').addEventListener('input', renderFilters);
  $('filters').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.cat) { t.checked ? state.cat.add(t.dataset.cat) : state.cat.delete(t.dataset.cat); }
    else if (t.dataset.brand) { t.checked ? state.brand.add(t.dataset.brand) : state.brand.delete(t.dataset.brand); }
    else return;
    state.shown = PAGE; render();
  });
  $('filters').addEventListener('click', e => {
    const c = e.target.dataset.clear; if (!c) return;
    state[c].clear(); state.shown = PAGE; render();
  });
  $('chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    if (b.dataset.k === 'q') { state.q = ''; $('q').value = ''; } else state[b.dataset.k].delete(b.dataset.v);
    state.shown = PAGE; render();
  });
  $('subs').addEventListener('click', e => { const b = e.target.closest('.sub'); if (!b) return; state.sub = b.dataset.sub; state.shown = PAGE; render(); });
  $('more').addEventListener('click', () => { state.shown += PAGE * 2; render(); });
  const openF = v => { $('filters').classList.toggle('open', v); $('scrim').classList.toggle('show', v); };
  $('openFilters').addEventListener('click', () => openF(true));
  $('scrim').addEventListener('click', () => openF(false));
  render();
})();
