(function () {
  const T = window.TK, { C, cats, products, fmt, esc, t, EN } = T;
  T.mount('catalog');
  const app = document.getElementById('app');
  const p = T.prodBySlug[T.qs('p')] || products.find(x => String(x.id) === T.qs('id'));
  if (!p) { app.innerHTML = `<div class="empty" style="margin:60px 0">${t('not_found')} <a href="catalog.html" style="text-decoration:underline">${t('back_catalog')}</a></div>`; return; }
  const cat = cats[p.c - 1];
  // [id, model, option, specs, price, note, unit, remark, disc, net, option_en, specs_en, unit_en, remark_en, note_en]
  const rows = (window.SKUS[p.id] || []).map(r => EN ? [r[0], r[1], r[10] || r[2], r[11] || r[3], r[4], r[14] || r[5], r[12] || r[6], r[13] || r[7], r[8], r[9]] : r);
  const src = C.sources[p.src] || {};
  document.title = `${p.b} ${T.title(p)} — Triple E Trading`;
  const brand = T.brandById[p.bi];
  const dateTh = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return EN ? `${+dd}/${+m}/${y}` : `${+dd}/${+m}/${+y + 543}`; };

  const hasDisc = rows.some(r => r[8] || r[9]);
  const hasUnit = rows.some(r => r[6]);
  const hasOpt = rows.some(r => r[2]);
  const hasSpec = rows.some(r => r[3]);
  const priceTop = p.pmin == null ? `<span class="lbl">${t('price')}</span><span class="blob ask" style="--c:var(--yellow)"><b>${t('price_ask')}</b></span>`
    : (p.pmax !== p.pmin ? `<span class="lbl">${t('list_price')}</span><span class="blob"><b>${fmt(p.pmin)} – ${fmt(p.pmax)}</b><small>฿</small></span>` : `<span class="lbl">${t('list_price')}</span><span class="blob"><b>${fmt(p.pmin)}</b><small>฿</small></span>`);
  const specs = Object.entries((EN ? p.sp_en : p.sp) || {}).filter(([k, v]) => v !== '' && v != null);

  const SS = p.ss;
  const crumbs = `<div class="crumbs" style="padding-top:34px"><a href="index.html">${t('crumb_home')}</a><span>/</span><a href="catalog.html?cat=${cat.slug}">${esc(T.catName(cat))}</a><span>/</span><a href="catalog.html?brand=${T.brandById[p.bi].slug}">${esc(p.b)}</a></div>`;
  const brandHTML = `<a class="pd-brand" href="catalog.html?brand=${brand.slug}">${T.LOGOS[brand.slug] ? `<span class="bl"><img src="${T.LOGOS[brand.slug].src}" alt="${esc(brand.name)}" style="${T.LOGOS[brand.slug].bg ? 'background:' + T.LOGOS[brand.slug].bg + ';padding:4px 8px' : ''}"></span>` : ''}<span class="tagline">${esc(p.b)} · ${esc(cat.name_en)}</span></a>`;
  const relatedHTML = `<section class="related"><h2 class="display h-md" style="margin-bottom:26px">${t('related')}</h2>
    <div class="grid" id="related"></div></section>`;
  if (SS) { renderCable(); } else {
  app.innerHTML = crumbs + `
  <div class="pd">
    <div class="pd-media"><div class="pd-img">${T.mediaHTML(p, true)}</div>
      ${p.i ? '' : `<div class="pd-note">${t('no_img')}</div>`}</div>
    <div class="pd-info">
      <a class="pd-brand" href="catalog.html?brand=${brand.slug}">${T.LOGOS[brand.slug] ? `<span class="bl"><img src="${T.LOGOS[brand.slug].src}" alt="${esc(brand.name)}" style="${T.LOGOS[brand.slug].bg ? 'background:' + T.LOGOS[brand.slug].bg + ';padding:4px 8px' : ''}"></span>` : ''}<span class="tagline">${esc(p.b)} · ${esc(cat.name_en)}</span></a>
      <h1 class="display">${esc(T.title(p))}</h1>
      ${T.subName(p) ? `<p class="th-name">${esc(T.subName(p))}</p>` : ''}
      <div class="meta-row"><span class="badge c" style="--c:${T.catColor(p.c)}">${esc(T.catName(cat))}</span>${(EN ? p.sc_en : p.sc) ? `<span class="badge">${esc(EN ? p.sc_en : p.sc)}</span>` : ''}<span class="badge signal">${t('models', { n: fmt(p.k) })}</span></div>
      ${EN ? (p.d_en ? `<p class="desc">${esc(p.d_en)}</p>` : '') : (p.d ? `<p class="desc">${esc(p.d)}</p>` : (p.en ? `<p class="desc">${esc(p.en)}</p>` : ''))}
      <div class="pd-price">${priceTop}<span class="vat">${t('price_at', { d: dateTh(src.date) })}</span></div>
      ${specs.length ? `<ul class="spec-list">${specs.map(([k, v]) => `<li><span>${esc(k)}</span>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</li>`).join('')}</ul>` : ''}
      ${rows.length ? `<div class="picker"><label for="pick">${t('v7_pick')}</label>
        <select id="pick">${rows.length > 1 ? `<option value="">${esc(t('v7_pick_ph', { n: fmt(rows.length) }))}</option>` : ''}${rows.map(r => `<option value="${r[0]}">${esc([r[1], r[2]].filter(Boolean).join(' · '))}${r[4] != null ? ' — ฿' + fmt(r[4]) : ''}</option>`).join('')}</select>
        <div class="pp"><span>${t('v7_pick_price')}</span><b id="pickPrice">—</b></div>
        <button class="btn block" id="pickAdd" type="button" ${rows.length > 1 ? 'disabled' : ''}>${t('v7_add_sel')}</button></div>` : ''}
      <div class="btn-row"><a class="btn line" href="#models">${t('v7_see_table')} ↓</a><a class="btn line" href="tel:${T.SITE.phone_tel}">${t('call_ask')}</a></div>
    </div>
  </div>
  <section class="sku-wrap" id="models">
    <div class="sku-head"><div><p class="tagline" style="margin:0">MODELS & PRICES</p><h2>${t('models_h')} <span class="badge signal">${t('models', { n: fmt(rows.length) })}</span></h2></div>
      ${rows.length > 8 ? `<label class="search-field"><span class="ico">⌕</span><input id="skuq" placeholder="${t('sku_ph')}"></label>` : ''}</div>
    <div class="table-scroll"><table class="sku"><thead><tr>
      <th>${t('th_model')}</th>${hasOpt ? `<th>${t('th_opt')}</th>` : ''}${hasSpec ? `<th>${t('th_spec')}</th>` : ''}<th style="text-align:right">${t('th_price')}</th>
      ${hasDisc ? `<th style="text-align:right">${t('th_disc')}</th><th style="text-align:right">${t('th_net')}</th>` : ''}${hasUnit ? `<th>${t('th_unit')}</th>` : ''}<th></th></tr></thead>
      <tbody id="skuBody"></tbody></table></div>
    <p class="src-note">${t('src_note', { d: dateTh(src.date) })}</p>
  </section>` + relatedHTML;

  const body = document.getElementById('skuBody');
  function draw(f) {
    const q = (f || '').toLowerCase().replace(/[\s\-]/g, '');
    const list = q ? rows.filter(r => (r[1] + r[2] + r[3]).toLowerCase().replace(/[\s\-]/g, '').includes(q)) : rows;
    body.innerHTML = list.map(r => {
      const on = T.qhas(r[0]);
      const price = r[4] != null ? fmt(r[4]) : `<span style="color:var(--muted);font-weight:500">${esc(r[5] || t('ask'))}</span>`;
      return `<tr><td class="model">${esc(r[1])}${r[7] ? `<span class="rm">${esc(r[7])}</span>` : ''}</td>
        ${hasOpt ? `<td class="opt">${esc(r[2])}</td>` : ''}${hasSpec ? `<td class="specs">${esc(r[3])}</td>` : ''}<td class="num">${price}</td>
        ${hasDisc ? `<td class="num disc">${r[8] ? t('disc', { n: r[8] }) : ''}</td><td class="num disc">${r[9] ? t('net', { n: fmt(r[9]) }) : ''}</td>` : ''}
        ${hasUnit ? `<td class="unit">${esc(r[6])}</td>` : ''}
        <td class="addc"><button class="add${on ? ' on' : ''}" data-id="${r[0]}" title="${t('add_quote')}">${on ? '✓' : '+'}</button></td></tr>`;
    }).join('');
  }
  draw();
  const sq = document.getElementById('skuq'); if (sq) sq.addEventListener('input', e => draw(e.target.value));
  const pick = document.getElementById('pick'), pAdd = document.getElementById('pickAdd'), pPrice = document.getElementById('pickPrice');
  const syncPick = () => { if (!pick) return; const r = rows.find(x => x[0] === +pick.value);
    pPrice.textContent = r ? (r[4] != null ? '฿' + fmt(r[4]) : (r[5] || t('ask'))) : '—';
    pAdd.disabled = !r; const on = r && T.qhas(r[0]); pAdd.textContent = on ? t('v7_in_list') : t('v7_add_sel'); pAdd.classList.toggle('orange', !!on); };
  if (pick) { pick.addEventListener('change', syncPick); syncPick();
    pAdd.addEventListener('click', () => { const r = rows.find(x => x[0] === +pick.value); if (!r) return;
      T.qtoggle({ id: r[0], model: r[1], option: r[2], price: r[4], unit: r[6], brand: p.b, product: T.title(p), slug: p.s }); syncPick(); draw(sq ? sq.value : ''); }); }
  app.addEventListener('click', e => { if (e.target.closest('.add[data-id]')) setTimeout(syncPick, 0); });
  }
  app.addEventListener('click', e => {
    const b = e.target.closest('.add[data-id]'); if (!b) return;
    const r = rows.find(x => x[0] === +b.dataset.id);
    const on = T.qtoggle({ id: r[0], model: r[1], option: r[2], price: r[4], unit: r[6], brand: p.b, product: T.title(p), slug: p.s });
    b.classList.toggle('on', on); b.textContent = on ? '✓' : '+';
  });

  // ---------- cable spec sheet + size x core price matrix (Yazaki etc.) ----------
  function renderCable() {
    const byId = Object.fromEntries(rows.map(r => [r[0], r]));
    const f2 = n => Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const unitS = EN ? '/m' : '/ม.';
    const LBL = { 'Conductor': 'ตัวนำ', 'Insulation': 'ฉนวน', 'Core identification': 'การแยกสีแกน', 'Sheath': 'เปลือก', 'Shield': 'ชีลด์',
      'Fire barrier tape': 'เทปกันไฟ', 'Inner Sheath': 'เปลือกใน', 'Outer Sheath': 'เปลือกนอก', 'Armor': 'เกราะ', 'Filler': 'วัสดุเสริม',
      'Binder tape and Separator tape': 'เทปพันรัด / เทปคั่น', 'Inner sheath (multi core)': 'เปลือกใน (หลายแกน)', 'Classification': 'คุณสมบัติ',
      'Rated voltage': 'แรงดันพิกัด', 'Testing voltage': 'แรงดันทดสอบ', 'Reference standard': 'มาตรฐานอ้างอิง', 'Remark': 'หมายเหตุ',
      'Construction': 'โครงสร้าง', 'Flame retardant': 'การหน่วงไฟ', 'Acid gas emission': 'ก๊าซกรด', 'Smoke emission': 'ปริมาณควัน',
      'Non-toxic gases': 'ก๊าซพิษ', 'Circuit integrity': 'การทนไฟของวงจร' };
    const th = k => { const m = /^Reference standard - (.+)$/.exec(k); return m ? `${LBL['Reference standard']} · ${LBL[m[1]] || m[1]}` : (LBL[k] || k); };
    const dl = list => `<dl>${list.map(([k, v]) => `<div><dt>${EN ? esc(k) : `${esc(th(k))}<small>${esc(k)}</small>`}</dt><dd>${esc(v).replace(/; /g, '<br>')}</dd></div>`).join('')}</dl>`;
    const priceTxt = p.pmin == null ? `<span class="blob ask" style="--c:var(--yellow)"><b>${t('price_ask')}</b></span>`
      : `<span class="blob"><b>${f2(p.pmin)}${p.pmax !== p.pmin ? ' – ' + f2(p.pmax) : ''}</b><small>฿${unitS}</small></span>`;
    const core = n => EN ? `${n} core${+n > 1 ? 's' : ''}` : `${n} แกน`;
    const colH = (tb, c) => tb.ck === 'cores' ? core(c) : tb.ck === 'size' ? `${esc(c)} mm²` : (EN ? 'Price (฿/m)' : 'ราคา (บาท/เมตร)');
    const rowH = (tb, r) => tb.rk === 'cores' ? core(r) : `${esc(r)}`;
    const cell = id => {
      if (id === 'x') return `<td class="na" title="${t('cab_na')}">—</td>`;
      const r = byId[id]; if (!r) return '<td class="na">—</td>';
      const on = T.qhas(id);
      return `<td><span class="pv">${r[4] != null ? f2(r[4]) : `<em>${t('ask')}</em>`}</span><button class="add sm${on ? ' on' : ''}" data-id="${id}" title="${t('add_quote')} · ${esc(r[1])}" aria-label="${t('add_quote')} ${esc(r[1])}">${on ? '✓' : '+'}</button></td>`;
    };
    const tables = SS.tables.map(tb => `<div class="mx-wrap">
      ${(EN ? tb.label_en : tb.label_th) ? `<h3 class="mx-cap">${esc(EN ? tb.label_en : tb.label_th)}</h3>` : ''}
      <div class="table-scroll"><table class="mx"><thead><tr><th>${tb.rk === 'cores' ? (EN ? 'Cores' : 'จำนวนแกน') : (EN ? 'Size (mm²)' : 'ขนาด (mm²)')}</th>${tb.cols.map(c => `<th>${colH(tb, c)}</th>`).join('')}</tr></thead>
      <tbody>${tb.rows.map(([r, cs]) => `<tr><th>${rowH(tb, r)}</th>${cs.map(cell).join('')}</tr>`).join('')}</tbody></table></div></div>`).join('');
    const app_ = EN ? (SS.app_en ? `<p>${esc(SS.app_en)}</p>` : '')
      : `${SS.app_th.length ? `<ul>${SS.app_th.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${SS.app_en ? `<p class="en">${esc(SS.app_en)}</p>` : ''}`;
    app.innerHTML = crumbs + `
    <div class="pd cable${SS.ratio > 3.2 ? ' wide' : ''}">
      <div class="pd-info">${brandHTML}
        <h1 class="display">${esc(T.title(p))}</h1>
        <p class="th-name">${esc(EN ? p.en : p.th)}</p>
        <p class="cab-sub">${esc(SS.subtitle)}</p>
        <div class="meta-row"><span class="badge c" style="--c:${T.catColor(p.c)}">${esc(T.catName(cat))}</span><span class="badge">${esc(EN ? p.sc_en : p.sc)}</span><span class="badge signal">${t('models', { n: fmt(p.k) })}</span></div>
        <div class="pd-price"><span class="lbl">${t('list_price')}</span>${priceTxt}<span class="vat">${t('cab_date', { d: dateTh(src.date) })}</span></div>
        <div class="btn-row"><a class="btn" href="#models">${t('cab_table')} ↓</a><a class="btn ghost" href="tel:${T.SITE.phone_tel}">${t('call_ask')}</a></div>
      </div>
      <figure class="cable-fig"><img src="${p.i}" alt="${esc(p.b + ' ' + T.title(p))}" decoding="async"><figcaption>${t('cab_fig')}</figcaption></figure>
    </div>
    <section class="sheet">
      <div class="sheet-card" style="--c:var(--orange)"><p class="tagline">CABLE STRUCTURE</p><h2>${t('cab_struct')}</h2>${dl(SS.structure)}</div>
      <div class="sheet-card" style="--c:var(--wasabi)"><p class="tagline">TECHNICAL DATA</p><h2>${t('cab_tech')}</h2>${dl(SS.technical)}</div>
      <div class="sheet-card" style="--c:var(--pink)"><p class="tagline">APPLICATION</p><h2>${t('cab_app')}</h2>${app_}</div>
    </section>
    <section class="sku-wrap" id="models">
      <div class="sku-head"><div><p class="tagline" style="margin:0">PRICE TABLE</p><h2>${t('cab_table')} <span class="badge signal">${EN ? 'Baht / metre' : 'บาท / เมตร'}</span></h2></div></div>
      ${SS.price_note ? `<div class="cab-note">${esc(EN ? SS.price_note_en || SS.price_note : SS.price_note)} — ${t('cab_note_q')}</div>` : ''}
      ${tables}
      <p class="src-note">${t('cab_src', { d: dateTh(src.date) })}</p>
    </section>` + relatedHTML;
  }

  // related: same category, prefer same brand, with images
  const rel = products.filter(x => x.c === p.c && x.id !== p.id && x.i)
    .sort((a, b) => (b.bi === p.bi) - (a.bi === p.bi) || (b.iq === 'high') - (a.iq === 'high')).slice(0, 8);
  document.getElementById('related').innerHTML = rel.map(T.cardHTML).join('');
})();
