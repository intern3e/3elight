/* Shared helpers: header/footer, data access, brand logos, quote list (localStorage). */
(function () {
  const C = window.CATALOG;            // data/catalog.js
  const SITE = window.SITE_CONFIG;     // data/config.js
  const LOGOS = window.BRAND_LOGOS || {}; // data/brand-logos.js
  const I = window.I18N, t = I.t, EN = I.lang === 'en';
  const catName = c => c ? (EN ? c.name_en : c.name_th) : '';
  const groupName = c => c ? (EN ? c.group_en : c.group_th) : '';
  const subName = p => EN ? (p.en || '') : (p.th || '');
  const title = p => (EN && p.n_en) ? p.n_en : p.n;

  // ---------- indexes ----------
  const cats = C.categories, brands = C.brands, products = C.products;
  const catBySlug = Object.fromEntries(cats.map(c => [c.slug, c]));
  const brandById = Object.fromEntries(brands.map(b => [b.id, b]));
  const brandBySlug = Object.fromEntries(brands.map(b => [b.slug, b]));
  const prodBySlug = Object.fromEntries(products.map(p => [p.s, p]));

  // one pop colour per product group
  const GROUP_COLOR = { power: 'var(--orange)', control: 'var(--wasabi)', automation: 'var(--pink)',
    measure: 'var(--yellow)', install: 'var(--orange-hot)', tools: 'var(--mint)' };
  const groupColor = g => GROUP_COLOR[g] || 'var(--orange)';
  const catColor = id => { const c = cats[id - 1]; return groupColor(c && c.group); };
  const POPS = ['var(--orange)', 'var(--wasabi)', 'var(--pink)', 'var(--yellow)', 'var(--mint)', 'var(--orange-hot)'];
  const brandColor = name => { let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return POPS[h % POPS.length]; };

  const fmt = n => n == null ? '' : Number(n).toLocaleString('th-TH', { maximumFractionDigits: 2 });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = (k, url) => new URL(url || location.href).searchParams.get(k);

  function priceHTML(p) {
    if (p.pmin == null) return `<span class="price ask">${t('price_ask')}</span>`;
    const u = p.ss ? `<small class="u">${t('per_m')}</small>` : '';
    const fm = p.ss ? (n => Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : fmt;
    if (p.pmax && p.pmax !== p.pmin) return `<span class="price"><small>${t('price_from')}</small>฿${fm(p.pmin)}${u}</span>`;
    return `<span class="price">฿${fm(p.pmin)}${u}</span>`;
  }

  const ICON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="8" width="36" height="48" rx="6"/><path d="M24 20h16M24 28h16"/><path d="M34 36l-6 9h8l-6 9"/></svg>';
  function mediaHTML(p, big) {
    if (p.i) {
      const src = big ? p.i : p.t;
      return `<img src="${src}" alt="${esc(p.b + ' ' + title(p))}" loading="lazy" decoding="async" onload="window.TK.fitImg(this)">`;
    }
    const c = cats[p.c - 1];
    return `<div class="ph" style="--c:${catColor(p.c)}">${ICON}<span>${esc(catName(c))}</span></div>`;
  }
  // never stretch an image beyond its real pixels (keeps it crisp)
  function fitImg(img) {
    const w = img.naturalWidth;
    if (w) { img.style.maxWidth = `min(100%, ${w}px)`; img.style.maxHeight = `min(100%, ${img.naturalHeight}px)`; }
  }

  // brand logo tile (real logo when we have one, otherwise a coloured name tile)
  function brandLogoHTML(b, cls) {
    const L = LOGOS[b.slug];
    if (L) {
      return `<div class="brand-logo${L.fill ? ' fill' : ''} ${cls || ''}" style="${L.bg ? 'background:' + L.bg : ''}"><img src="${L.src}" alt="${esc(b.name)} logo" loading="lazy"></div>`;
    }
    return `<div class="brand-logo mono-tile ${cls || ''}" style="--c:${brandColor(b.name)}">${esc(b.name)}</div>`;
  }

  function cardHTML(p) {
    return `<a class="pcard" href="product.html?p=${encodeURIComponent(p.s)}">
      <div class="media${p.ss ? ' wide' : ''}">${p.k > 1 ? `<span class="flag">${t('models', { n: fmt(p.k) })}</span>` : ''}${mediaHTML(p)}</div>
      <div class="body">
        <div class="brand">${esc(p.b)}</div>
        <h3>${esc(title(p))}</h3>
        ${subName(p) ? `<div class="th">${esc(subName(p))}</div>` : ''}
        <div class="foot">${priceHTML(p)}</div>
      </div></a>`;
  }

  // ---------- quote list ----------
  const QKEY = 'triplee_quote_v1';
  function qget() { try { return JSON.parse(localStorage.getItem(QKEY)) || []; } catch (e) { return []; } }
  function qset(list) { try { localStorage.setItem(QKEY, JSON.stringify(list)); } catch (e) {} updateCount(); }
  function qhas(id) { return qget().some(x => x.id === id); }
  function qtoggle(item) {
    const list = qget(); const i = list.findIndex(x => x.id === item.id);
    if (i >= 0) { list.splice(i, 1); qset(list); toast(t('removed')); return false; }
    list.push(Object.assign({ qty: 1 }, item)); qset(list); toast(t('added')); return true;
  }
  function updateCount() {
    const n = qget().length;
    document.querySelectorAll('.quote-btn .count').forEach(el => { el.textContent = n; el.classList.toggle('show', n > 0); });
  }
  let tt;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1800);
  }

  // ---------- 3E logo (vector redraw of the company gear mark) ----------
  const GEAR = 'M36.83,13.82 L37.84,4.60 L62.16,4.60 L63.17,13.82 L64.73,14.43 L66.27,15.11 L73.50,9.30 L90.70,26.50 L84.89,33.73 L85.57,35.27 L86.18,36.83 L95.40,37.84 L95.40,62.16 L86.18,63.17 L85.57,64.73 L84.89,66.27 L90.70,73.50 L73.50,90.70 L66.27,84.89 L64.73,85.57 L63.17,86.18 L62.16,95.40 L37.84,95.40 L36.83,86.18 L35.27,85.57 L33.73,84.89 L26.50,90.70 L9.30,73.50 L15.11,66.27 L14.43,64.73 L13.82,63.17 L4.60,62.16 L4.60,37.84 L13.82,36.83 L14.43,35.27 L15.11,33.73 L9.30,26.50 L26.50,9.30 L33.73,15.11 L35.27,14.43 Z';
  function logoSVG(cls) {
    return `<svg class="${cls || 'logo-mark'}" viewBox="0 0 100 100" aria-hidden="true">
      <path d="${GEAR}" fill="#F7931E" stroke="#141414" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="27" fill="#FFFBEA" stroke="#141414" stroke-width="3"/>
      <text x="50" y="61.5" text-anchor="middle" font-family="Instrument Sans, Arial, sans-serif" font-weight="800" font-size="31" letter-spacing="-1.5" fill="#141414">3E</text></svg>`;
  }
  // outlined "stamp" version used on the paper note
  function stampSVG() {
    const ring = 'TRIPLE E TRADING · SINCE 2004 · ';
    return `<svg class="stamp" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="stp" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#E2601B" stroke-width="2.5"/><circle cx="50" cy="50" r="29" fill="none" stroke="#E2601B" stroke-width="1.5"/>
      <text font-family="Outfit, Arial" font-weight="800" font-size="8.6" fill="#E2601B" letter-spacing="1.4"><textPath href="#stp">${ring}</textPath></text>
      <text x="50" y="59" text-anchor="middle" font-family="Outfit, Arial" font-weight="900" font-size="25" fill="#E2601B">3E</text></svg>`;
  }
  function logoHTML() {
    return `<a class="logo" href="index.html" aria-label="${esc(SITE.name_en)}">${logoSVG()}<span class="lt">TRIPLE <em>E</em></span></a>`;
  }

  // small line icons
  const IC = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8 9.5 9.5 0 0 1-4-.9L3 20l1.4-4A7.8 7.8 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8 8.4 8.4 0 0 1 9 8z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M3 9h18M9 20v-6h6v6"/></svg>',
    gear: `<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="${GEAR}"/><circle cx="50" cy="50" r="18" fill="var(--bg)"/></svg>`,
    arrow: '<svg class="arrow-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 12h17M14 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h12v10H2zM14 9h4l4 4v3h-8"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
    boxes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h8v8H3zM13 13h8v8h-8zM8 3h8v8H8z"/></svg>'
  };

  // ---------- chrome ----------
  const prefsHTML = () => `<div class="prefs">
      <div class="lang-sw" role="group" aria-label="${t('lang_switch')}"><button type="button" data-lang="th" aria-pressed="${!EN}">TH</button><button type="button" data-lang="en" aria-pressed="${EN}">EN</button></div>
      <button class="theme-btn" type="button" aria-label="${t('theme')}" title="${t('theme')}" aria-pressed="${I.isDark()}">
        <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>
      </button></div>`;
  const NAV = () => [['catalog.html', t('nav_catalog'), 'catalog'], ['index.html#categories', t('nav_cats'), 'cats'], ['index.html#brands', t('nav_brands'), 'brands'],
    ['index.html#faq', t('nav_faq'), 'faq'], ['index.html#contact', t('nav_contact'), 'contact']];
  const GROUPS = ['power', 'control', 'automation', 'measure', 'install', 'tools'];
  const BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  const SRCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
  const BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  function catsPanel() {
    return `<div class="dd-inner">` + GROUPS.map(g => { const cs = cats.filter(c => c.group === g && c.count).sort((a, b) => b.count - a.count);
      if (!cs.length) return '';
      return `<div><h5><a href="catalog.html?group=${g}" style="color:inherit;padding:0">${esc(groupName(cs[0]))}</a></h5>${cs.slice(0, 7).map(c => `<a href="catalog.html?cat=${c.slug}">${esc(catName(c))}</a>`).join('')}</div>`; }).join('') +
      `<div class="dd-foot"><a class="btn sm" href="catalog.html">${t('dd_all_products')}</a></div></div>`;
  }
  function brandsPanel() {
    const bl = brands.filter(b => LOGOS[b.slug] && b.count).sort((a, b) => b.count - a.count).slice(0, 16);
    return `<div class="dd-inner">` + bl.map(b => { const L = LOGOS[b.slug]; return `<a class="bl" href="catalog.html?brand=${b.slug}" title="${esc(b.name)}"${L.bg ? ` style="background:${L.bg}"` : ''}><img src="${L.src}" alt="${esc(b.name)}" loading="lazy"></a>`; }).join('') +
      `<div class="dd-foot"><a class="btn sm line" href="index.html#brands">${t('dd_all_brands', { n: brands.filter(b => b.count).length })}</a></div></div>`;
  }
  const marqHTML = (items, sep) => { const one = items.map(x => `<span>${x}</span>${sep || ''}`).join(''); return `<div class="marq-track">${one}${one}</div>`; };
  function header(active) {
    const link = n => `<a href="${n[0]}" class="${active === n[2] ? 'active' : ''}">${n[1]}</a>`;
    const ann = t('v7_ann', { p: SITE.phones[0].value, l: SITE.line_id });
    const tot = C.totals;
    const strip = t('v7_strip', { k: fmt(tot.skus), b: fmt(tot.brands), p: fmt(tot.products) });
    return `<div class="announce" role="region" aria-label="${t('v7_ann_lbl')}"><button type="button" class="ann-prev" aria-label="prev">‹</button><span class="msg" id="annMsg">${ann[0]}</span><button type="button" class="ann-next" aria-label="next">›</button></div>
    <header class="site-header"><div class="wrap nav">
      <button class="icon-btn menu-toggle" type="button" aria-expanded="false" aria-controls="siteMenu" aria-label="${t('menu')}">${BURGER}</button>
      ${logoHTML()}
      <nav class="nav-links" aria-label="${t('menu')}">
        ${link(NAV()[0])}
        <div class="dd"><button type="button" aria-expanded="false">${t('nav_cats')}</button><div class="dd-panel cats">${catsPanel()}</div></div>
        <div class="dd"><button type="button" aria-expanded="false">${t('nav_brands')}</button><div class="dd-panel brands">${brandsPanel()}</div></div>
        <a class="hot" href="catalog.html?brand=yazaki">${t('v7_hot')}</a>
        ${link(NAV()[3])}${link(NAV()[4])}
      </nav>
      <div class="nav-cta">
        ${prefsHTML()}
        <button class="icon-btn search-btn" type="button" aria-label="${t('search_btn')}">${SRCH}</button>
        <a class="icon-btn quote-btn" href="quote.html" aria-label="${t('quote')}" title="${t('quote')}">${BAG}<span class="count">0</span></a>
      </div></div></header>
    <div class="strip marq" style="--dur:60s" aria-hidden="true">${marqHTML(strip, '<span>✦</span>')}</div>
    <div class="search-ov" id="searchOv" aria-hidden="true"><div class="panel">
      <form action="catalog.html" role="search"><span aria-hidden="true">${SRCH.replace('<svg ', '<svg width="22" height="22" ')}</span><input name="q" placeholder="${esc(t('search_ph'))}" autocomplete="off" aria-label="${t('search_btn')}"><button class="close" type="button" aria-label="${t('close')}">✕</button></form>
      <div class="tags">${t('quick').map(q => `<a href="catalog.html?q=${encodeURIComponent(q)}">${esc(q)}</a>`).join('')}</div></div></div>
    <div class="menu" id="siteMenu" aria-hidden="true">
      <div class="menu-top">${logoHTML()}<button class="menu-close" type="button" aria-label="${t('close')}">✕</button></div>
      <nav>${[['index.html', t('nav_home'), 'home']].concat(NAV().slice(0, 3), [['catalog.html?brand=yazaki', t('v7_hot'), 'yz']], NAV().slice(3), [['quote.html', t('quote'), 'quote']]).map(link).join('')}</nav>
      ${prefsHTML()}
      <div class="menu-contact">${t('tel')} <a href="tel:${SITE.phones[0].tel}">${esc(SITE.phones[0].value)}</a> · <a href="tel:${SITE.phones[1].tel}">${esc(SITE.phones[1].value)}</a><br>LINE <a href="${SITE.line_url}" target="_blank" rel="noopener">${esc(SITE.line_id)}</a><br>${esc(EN ? SITE.address_en : SITE.address_th)}</div>
    </div>`;
  }
  function footer() {
    const top = cats.slice().sort((a, b) => b.count - a.count).slice(0, 7);
    const tb = brands.slice().sort((a, b) => b.count - a.count).slice(0, 7);
    return `<footer class="site-footer"><div class="wrap">
      <div class="footer-grid">
        <div class="fcol"><h4>${t('v7_f_email')}</h4>${SITE.email ? `<a href="mailto:${SITE.email}">${esc(SITE.email)}</a>` : ''}<h4 style="margin-top:18px">LINE</h4><a href="${SITE.line_url}" target="_blank" rel="noopener">${esc(SITE.line_id)}</a></div>
        <div class="fcol"><h4>${t('v7_f_call')}</h4><a href="tel:${SITE.phones[0].tel}">${esc(SITE.phones[0].value)}</a><a href="tel:${SITE.phones[1].tel}">${esc(SITE.phones[1].value)}</a></div>
        <div class="fcol"><h4>${t('v7_f_tax')}</h4><span>${esc(SITE.tax_id || '')}</span><h4 style="margin-top:18px">${t('v7_f_addr')}</h4><a href="${SITE.map_url}" target="_blank" rel="noopener">${esc(EN ? SITE.address_en : SITE.address_th)}</a></div>
        <div class="fcol"><h4>${t('foot_popular')}</h4>${top.map(c => `<a href="catalog.html?cat=${c.slug}">${esc(catName(c))}</a>`).join('')}</div>
        <div class="fcol"><h4>${t('foot_brands')}</h4>${tb.map(b => `<a href="catalog.html?brand=${b.slug}">${esc(b.name)}</a>`).join('')}</div>
        <div class="fcol"><h4>${t('foot_service')}</h4><a href="catalog.html">${t('foot_search')}</a><a href="quote.html">${t('quote')}</a><a href="index.html#faq">${t('foot_howto')}</a><a href="index.html#contact">${t('nav_contact')}</a>${SITE.shop_url ? `<a href="${SITE.shop_url}" target="_blank" rel="noopener">${t('foot_shop')}</a>` : ''}</div>
        <div class="fcol"><h4>${t('v7_f_company')}</h4><span>${esc(EN ? SITE.name_en : SITE.name_th)}</span><span style="color:var(--muted)">${t('since', { y: EN ? SITE.since_ce : SITE.since_be })}</span></div>
      </div>
      <div class="footer-bottom"><span>${t('foot_note')}</span><span>© ${new Date().getFullYear()} ${esc(EN ? SITE.name_en : SITE.name_th)}</span></div>
    </div></footer>`;
  }

  // pill buttons: wrap the label so it can "roll" on hover
  function roll(root) {
    (root || document).querySelectorAll('.btn').forEach(b => {
      if (b.firstElementChild && b.firstElementChild.classList.contains('r')) return;
      const keep = [...b.childNodes].filter(n => n.nodeType === 1 && n.classList.contains('count'));
      const r = document.createElement('span'); r.className = 'r';
      [...b.childNodes].forEach(n => { if (!keep.includes(n)) r.appendChild(n); });
      b.insertBefore(r, b.firstChild);
    });
  }
  // fade-up on scroll
  let io;
  function reveal(root) {
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-rv');
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    (root || document).querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
  }
  function mount(active) {
    document.body.insertAdjacentHTML('afterbegin', header(active));
    document.body.insertAdjacentHTML('beforeend', footer());
    updateCount();
    I.applyStatic();
    document.querySelectorAll('.lang-sw button').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== I.lang) I.setLang(b.dataset.lang); }));
    document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', I.toggleTheme));
    const menu = document.getElementById('siteMenu'), tog = document.querySelector('.menu-toggle');
    const setMenu = v => { menu.classList.toggle('open', v); menu.setAttribute('aria-hidden', String(!v)); tog.setAttribute('aria-expanded', String(v)); document.body.style.overflow = v ? 'hidden' : ''; };
    tog.addEventListener('click', () => setMenu(true));
    menu.querySelector('.menu-close').addEventListener('click', () => setMenu(false));
    menu.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    const dds = [...document.querySelectorAll('.nav-links .dd')];
    const closeDD = () => dds.forEach(d => { d.classList.remove('open'); d.querySelector(':scope > button').setAttribute('aria-expanded', 'false'); });
    dds.forEach(d => { const b = d.querySelector(':scope > button');
      b.addEventListener('click', e => { e.stopPropagation(); const o = !d.classList.contains('open'); closeDD(); d.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); });
      d.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { closeDD(); d.classList.add('open'); } });
      d.addEventListener('mouseleave', () => { if (matchMedia('(hover:hover)').matches) d.classList.remove('open'); }); });
    document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeDD(); });
    const ann = t('v7_ann', { p: SITE.phones[0].value, l: SITE.line_id }), am = document.getElementById('annMsg'); let ai = 0;
    const showAnn = d => { ai = (ai + d + ann.length) % ann.length; am.innerHTML = ann[ai]; };
    document.querySelector('.ann-prev').addEventListener('click', () => showAnn(-1));
    document.querySelector('.ann-next').addEventListener('click', () => showAnn(1));
    setInterval(() => showAnn(1), 5000);
    const ov = document.getElementById('searchOv');
    const setOv = v => { ov.classList.toggle('open', v); ov.setAttribute('aria-hidden', String(!v)); if (v) setTimeout(() => ov.querySelector('input').focus(), 30); };
    document.querySelector('.search-btn').addEventListener('click', () => setOv(true));
    ov.querySelector('.close').addEventListener('click', () => setOv(false));
    ov.addEventListener('click', e => { if (e.target === ov) setOv(false); });
    const hd = document.querySelector('.site-header');
    addEventListener('scroll', () => hd.classList.toggle('scrolled', scrollY > 10), { passive: true });
    addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); closeDD(); setOv(false); } });
    roll();
    new MutationObserver(() => roll()).observe(document.body, { childList: true, subtree: true });
    reveal();
  }

  // search used by catalog + home
  function norm(s) { return String(s || '').toLowerCase().replace(/[\s\-_/.]+/g, ''); }
  function search(q, list) {
    const terms = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return list;
    const nt = terms.map(norm);
    return list.filter(p => {
      const hay = p._h || (p._h = (p.b + ' ' + p.n + ' ' + (p.th || '') + ' ' + (p.en || '') + ' ' + (p.sc || '') + ' ' + (p.sc_en || '') + ' ' + cats[p.c - 1].name_th + ' ' + cats[p.c - 1].name_en).toLowerCase());
      const hn = p._hn || (p._hn = norm(hay + ' ' + p.m));
      return terms.every((t, i) => hay.includes(t) || hn.includes(nt[i]));
    });
  }

  window.TK = { C, SITE, LOGOS, cats, brands, products, catBySlug, brandById, brandBySlug, prodBySlug, fmt, esc, qs, priceHTML, mediaHTML,
    cardHTML, fitImg, qget, qset, qhas, qtoggle, toast, mount, search, ICON, IC, groupColor, catColor, brandColor, brandLogoHTML, logoSVG, stampSVG, reveal, roll, t, EN, catName, groupName, subName, title, marqHTML };
})();
