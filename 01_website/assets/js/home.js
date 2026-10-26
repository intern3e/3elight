(function () {
  const T = window.TK, { C, cats, brands, products, fmt, esc, SITE, t, EN } = T;
  T.mount('home');
  const $ = id => document.getElementById(id);
  const good = p => p.i && p.iq === 'high';
  const GROUPS = ['power', 'control', 'automation', 'measure', 'install', 'tools'].filter(g => cats.some(c => c.group === g && c.count));
  const grpName = g => T.groupName(cats.find(c => c.group === g));
  const LOG = T.LOGOS;
  const money = (n, p) => p && p.ss ? Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : fmt(n);
  const alt = p => esc(p.b + ' ' + T.title(p));
  function pickFor(g, n, o = {}) {
    const ids = new Set(cats.filter(c => c.group === g).map(c => c.id));
    const pool = products.filter(p => ids.has(p.c) && good(p) && (!o.priced || p.pmin) && (!o.noCable || !p.ss));
    const out = [], seenC = new Set(), seenI = new Set();
    for (const p of pool) { if (!seenC.has(p.c) && !seenI.has(p.i)) { out.push(p); seenC.add(p.c); seenI.add(p.i); } if (out.length >= n) break; }
    for (const p of pool) { if (out.length >= n) break; if (!out.includes(p) && !seenI.has(p.i)) { out.push(p); seenI.add(p.i); } }
    return out;
  }
  const byBrand = (slug, n) => { const b = T.brandBySlug[slug]; if (!b) return [];
    const seen = new Set(), SKIP = new Set(['shinohawa-bus-bar-insulator-sm']);
    return products.filter(p => p.bi === b.id && good(p) && !SKIP.has(p.s)).sort((x, y) => (!!y.pmin - !!x.pmin) || y.k - x.k)
      .filter(p => { const k = p.i + '|' + p.n.split(' ')[0]; if (seen.has(p.i) || seen.has(k)) return false; seen.add(p.i); seen.add(k); return true; }).slice(0, n); };
  // horizontal product rows with arrow buttons
  function row(el, list) {
    el.innerHTML = list.map(T.cardHTML).join('');
    const w = el.parentElement;
    w.insertAdjacentHTML('beforeend', `<button class="rbtn l" type="button" aria-label="prev">‹</button><button class="rbtn r" type="button" aria-label="next">›</button>`);
    w.querySelector('.rbtn.l').addEventListener('click', () => el.scrollBy({ left: -el.clientWidth * .8, behavior: 'smooth' }));
    w.querySelector('.rbtn.r').addEventListener('click', () => el.scrollBy({ left: el.clientWidth * .8, behavior: 'smooth' }));
  }

  // ---------- hero slideshow ----------
  const tot = C.totals;
  const pBreaker = pickFor('power', 1, { priced: true, noCable: true })[0];
  const pCable = products.find(p => p.s === 'yazaki-vct') || products.find(p => p.ss && p.i);
  const pCtrl = byBrand('omron', 1)[0] || pickFor('control', 1)[0];
  const minYz = products.filter(p => p.ss && p.pmin).reduce((a, p) => (!a || p.pmin < a.pmin) ? p : a, null);
  const SL = [
    { c: '#1C1C1C', hl: '#F7931E', fg: '#fff', p: pBreaker, k: t('v7_s1_k'), h: t('v7_s1_h'), big: fmt(tot.skus), small: t('v7_s1_small'), body: t('v7_s1_p', { b: fmt(tot.brands), p: fmt(tot.products) }),
      btn: ['catalog.html', t('v7_s1_btn')], btn2: ['quote.html', t('cta_quote')] },
    { c: '#14375E', hl: '#E3262E', fg: '#fff', p: pCable, wide: true, k: t('v7_s2_k'), h: t('v7_s2_h'), big: minYz ? '฿' + money(minYz.pmin, minYz) : 'YAZAKI', small: minYz ? t('per_m') : '', body: t('v7_s2_p'),
      btn: ['catalog.html?brand=yazaki', t('v7_s2_btn')] },
    { c: '#F7931E', hl: '#1C1C1C', fg: '#1C1C1C', p: pCtrl, k: t('v7_s3_k'), h: t('v7_s3_h'), big: fmt((T.brandBySlug.omron || {}).skus || 0), small: t('v7_s3_small'), body: t('v7_s3_p'),
      btn: ['catalog.html?brand=omron', t('v7_s3_btn')] }
  ].filter(s => s.p);
  $('slides').innerHTML = SL.map((s, i) => `<div class="slide${i ? '' : ' on'}" style="--c:${s.c};--hl:${s.hl};color:${s.fg}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${SL.length}">
      <div class="pic"><a class="plate${s.wide ? ' wide' : ''}" href="product.html?p=${encodeURIComponent(s.p.s)}"><img src="${s.p.i}" alt="${alt(s.p)}" onload="window.TK.fitImg(this)"></a></div>
      <div class="txt"><p class="k">${s.k}</p><h2>${s.h}</h2><div class="big">${s.big}${s.small ? `<small>${s.small}</small>` : ''}</div><p>${s.body}</p>
        <div class="btn-row"><a class="btn ${s.fg === '#fff' ? 'white' : ''}" href="${s.btn[0]}">${s.btn[1]}</a>${s.btn2 ? `<a class="btn line" style="color:${s.fg};border-color:${s.fg}" href="${s.btn2[0]}">${s.btn2[1]}</a>` : ''}</div></div>
      <span class="note">${esc(s.p.b)} · ${esc(T.title(s.p))}</span>
    </div>`).join('') +
    `<button class="sl-arrow prev" type="button" aria-label="prev">‹</button><button class="sl-arrow next" type="button" aria-label="next">›</button>
     <div class="sl-nav">${SL.map((s, i) => `<button type="button" class="${i ? '' : 'on'}" aria-label="slide ${i + 1}"></button>`).join('')}</div>`;
  let si = 0; const slides = [...document.querySelectorAll('.slide')], dots = [...document.querySelectorAll('.sl-nav button')];
  const go = n => { si = (n + slides.length) % slides.length; slides.forEach((s, i) => s.classList.toggle('on', i === si)); dots.forEach((d, i) => d.classList.toggle('on', i === si)); };
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));
  document.querySelector('.sl-arrow.prev').addEventListener('click', () => { go(si - 1); restart(); });
  document.querySelector('.sl-arrow.next').addEventListener('click', () => { go(si + 1); restart(); });
  let timer; const restart = () => { clearInterval(timer); timer = setInterval(() => go(si + 1), 6500); };
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) restart();

  // ---------- featured: one strong item per category, priced first ----------
  const feat = [];
  GROUPS.forEach(g => pickFor(g, 3, { priced: true, noCable: true }).forEach(p => feat.push(p)));
  const featOrder = []; for (let i = 0; i < 3; i++) GROUPS.forEach((g, k) => { const p = feat.filter(x => cats[x.c - 1].group === g)[i]; if (p) featOrder.push(p); });
  row($('rowFeat'), featOrder.slice(0, 18));

  // ---------- group tiles ----------
  $('tiles').innerHTML = GROUPS.map(g => { const cs = cats.filter(c => c.group === g && c.count); const n = cs.reduce((a, c) => a + c.count, 0);
    const im = pickFor(g, 3, { noCable: g !== 'install' });
    return `<a class="tile rv" href="catalog.html?group=${g}"><span class="lbl">${esc(grpName(g))}<small>${t('v5_grp_cnt', { n: fmt(n), c: cs.length })}</small></span>
      <span class="imgs">${im.map(p => `<img src="${p.t}" alt="${alt(p)}" loading="lazy">`).join('')}</span><span class="go">${t('v7_shop')}</span></a>`; }).join('');

  // ---------- YAZAKI ----------
  const yz = products.filter(p => p.ss && p.i).sort((a, b) => (!!b.pmin - !!a.pmin) || a.id - b.id);
  row($('rowYz'), yz.slice(0, 12));

  // ---------- brand grid ----------
  const withLogo = brands.filter(b => LOG[b.slug] && b.count).sort((a, b) => b.count - a.count);
  $('bgrid').innerHTML = withLogo.slice(0, 12).map(b => { const L = LOG[b.slug];
    return `<a href="catalog.html?brand=${b.slug}" title="${esc(b.name)}"${L.bg ? ` class="bgchip"` : ''}><img src="${L.src}" alt="${esc(b.name)}" loading="lazy"${L.bg ? ` style="background:${L.bg}"` : ''}></a>`; }).join('');
  const ordered = brands.filter(b => b.count).sort((a, b) => (!!LOG[b.slug] - !!LOG[a.slug]) || b.count - a.count);
  let showAll = false;
  function drawBrands() {
    $('brandGrid').hidden = !showAll;
    if (showAll && !$('brandGrid').innerHTML) $('brandGrid').innerHTML = ordered.map(b => `<a class="brand-cell" href="catalog.html?brand=${b.slug}">${T.brandLogoHTML(b)}
      <span class="bn"><b>${esc(b.name)}</b><span>${fmt(b.count)}</span></span></a>`).join('');
    $('brandMore').textContent = showAll ? t('brands_less') : t('brands_all', { n: ordered.length });
  }
  $('brandMore').addEventListener('click', () => { showAll = !showAll; drawBrands(); });
  drawBrands();

  // ---------- category tiles (dark) ----------
  const used = new Set();
  const topCats = cats.filter(c => c.count).sort((a, b) => b.count - a.count).map(c => {
    const p = products.find(p => p.c === c.id && good(p) && !p.ss && !used.has(p.i)); if (p) used.add(p.i); return [c, p]; }).filter(x => x[1]).slice(0, 6);
  $('ctiles').innerHTML = topCats.map(([c, p]) => `<a class="ctile rv" href="catalog.html?cat=${c.slug}"><span class="cimg"><img src="${p.t}" alt="${alt(p)}" loading="lazy"></span>
    <span class="lbl"><b>${esc(T.catName(c))}</b><span>${t('v7_shop_n', { n: fmt(c.count) })}</span></span></a>`).join('');

  // ---------- brand rows ----------
  [['omron', 'row1', 'r1'], ['shinohawa', 'row2', 'r2']].forEach(([slug, id, k]) => { const b = T.brandBySlug[slug]; if (!b) return;
    $(k + 'Eb').textContent = t('v7_brand_eb', { k: fmt(b.skus) }); $(k + 'H').textContent = b.name; $(k + 'All').href = 'catalog.html?brand=' + slug;
    row($(id), byBrand(slug, 14)); });

  // ---------- banner ----------
  const bp = pickFor('control', 2, { priced: true })[1] || pCtrl;
  if (bp) $('bannerPic').innerHTML = `<a class="plate" href="product.html?p=${encodeURIComponent(bp.s)}"><img src="${bp.i}" alt="${alt(bp)}" loading="lazy" onload="window.TK.fitImg(this)"></a>`;

  // ---------- band + story ----------
  $('band').innerHTML = T.marqHTML(t('v7_band'), '<span aria-hidden="true">●</span>');
  $('storyH').textContent = t('v7_story_h', { y: EN ? SITE.since_ce : SITE.since_be });
  $('facts').innerHTML = [[fmt(tot.skus), t('v5_r_models')], [fmt(tot.brands), t('v7_f_brands')], [fmt(tot.categories), t('v7_f_cats')], [EN ? SITE.since_ce : SITE.since_be, t('v7_f_since')]]
    .map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('');

  // ---------- FAQ + LINE ----------
  $('faqList').innerHTML = t('faq').map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><span>${esc(f[0])}</span></summary><p>${esc(f[1])}</p></details>`).join('');
  $('lineId').textContent = SITE.line_id; $('lineBtn').href = SITE.line_url; $('callBtn').href = 'tel:' + SITE.phone_tel;
  T.reveal();
})();
