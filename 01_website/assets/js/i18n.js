/* Language (TH / EN) and colour theme (light / dark) — loaded first on every page. */
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---------- theme ----------
  const root = document.documentElement;
  const savedTheme = store.get('triplee_theme');            // 'light' | 'dark' | null (= follow system)
  if (savedTheme === 'light' || savedTheme === 'dark') root.setAttribute('data-theme', savedTheme);
  const isDark = () => root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  function toggleTheme() {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next); store.set('triplee_theme', next);
    document.querySelectorAll('.theme-btn').forEach(b => b.setAttribute('aria-pressed', String(next === 'dark')));
  }

  // ---------- language ----------
  const q = new URLSearchParams(location.search).get('lang');
  let LANG = (q === 'en' || q === 'th') ? q : (store.get('triplee_lang') || 'th');
  if (q) store.set('triplee_lang', LANG);
  root.lang = LANG;
  root.classList.add('lang-' + LANG);
  function setLang(l) {
    store.set('triplee_lang', l);
    const u = new URL(location.href);
    if (u.searchParams.has('lang') || !store.get('triplee_lang')) { u.searchParams.set('lang', l); location.replace(u); } else location.reload();
  }

  const D = {
    th: {
      nav_home: 'หน้าแรก', nav_catalog: 'สินค้าทั้งหมด', nav_cats: 'หมวดหมู่', nav_brands: 'แบรนด์', nav_contact: 'ติดต่อเรา',
      quote: 'ใบขอราคา', call_order: 'โทรสั่งซื้อ', menu: 'เมนู', theme: 'สลับโหมดมืด/สว่าง', lang_switch: 'เปลี่ยนภาษา',
      mobile: 'มือถือ', since: 'อุปกรณ์ไฟฟ้าโรงงานและอาคาร ตั้งแต่ปี {y}',
      foot_popular: 'หมวดยอดนิยม', foot_brands: 'แบรนด์', foot_service: 'บริการ', foot_search: 'ค้นหาสินค้า', foot_howto: 'วิธีสั่งซื้อ',
      foot_shop: 'ร้านค้าออนไลน์ (TARAD)', foot_note: 'ราคาตั้งตามใบราคาผู้ผลิต อาจเปลี่ยนแปลงได้โดยไม่ต้องแจ้งล่วงหน้า', tel: 'โทร',
      price_ask: 'สอบถามราคา', price_from: 'เริ่ม', models: '{n} รุ่น', items: '{n} รายการ', added: 'เพิ่มในใบขอราคาแล้ว', removed: 'นำออกจากใบขอราคาแล้ว',
      // home
      hero_since: 'ตั้งแต่ปี 2547', hero_h2: 'อุปกรณ์ไฟฟ้าโรงงานและตู้คอนโทรล <span class="hl">ครบในที่เดียว</span>',
      hero_p: 'ค้นหารุ่น เช็คราคาตั้ง แล้วส่งใบขอราคาให้ทีมขายได้ทันที', hero_all: 'ดูสินค้าทั้งหมด', hero_contact: 'ติดต่อทีมขาย',
      search_ph: 'ค้นหารุ่น เช่น MY2N, NF125-SV, เบรกเกอร์ 3P, ไฟหมุน…', search_btn: 'ค้นหา',
      quick: ['เบรกเกอร์', 'แมกเนติก', 'รีเลย์', 'ไฟหมุน', 'พร็อกซิมิตี้', 'มิเตอร์', 'หางปลา', 'ตู้ไฟ'],
      s1_sub: 'ของครบ ราคาชัด เลือกง่าย ในที่เดียว', s1_p: 'รวมข้อมูลจากใบราคาของผู้ผลิตปี 2024–2025 แยกเป็นหมวด แบรนด์ และรุ่นย่อยทุกตัว พร้อมราคาตั้ง',
      st_products: 'รายการสินค้า', st_skus: 'รุ่นย่อยพร้อมราคา', st_brands: 'แบรนด์ชั้นนำ', st_cats: 'หมวดสินค้า',
      s2_sub: 'เลือกตามกลุ่มงาน หรือหมวดสินค้า', s2_p: 'ตั้งแต่ระบบจ่ายไฟ ป้องกัน ควบคุม ออโตเมชัน งานวัด จนถึงงานเดินสายและติดตั้ง',
      g_power: 'เบรกเกอร์ ACB / MCCB / MCB, ฟิวส์, กันไฟกระชาก, คาปาซิเตอร์', g_control: 'แมกเนติก รีเลย์ ไทม์เมอร์ สวิตช์ปุ่มกด ไพลอตแลมป์ ไฟสัญญาณ',
      g_automation: 'PLC อินเวอร์เตอร์ เซ็นเซอร์ พร็อกซิมิตี้ พาวเวอร์ซัพพลาย', g_measure: 'มิเตอร์วัดไฟ ดิจิตอล / อนาล็อก, CT, เครื่องมือวัด',
      g_install: 'เทอร์มินอล หางปลา รางสาย ตู้ไฟ ปลั๊กอุตสาหกรรม พัดลมตู้', g_tools: 'เครื่องมือช่าง นิวเมติกส์ วาล์ว เคมีภัณฑ์ และอื่นๆ',
      why_lead: '{name} {biz} ดำเนินธุรกิจมาตั้งแต่ปี {y}',
      why1_h: 'ตั้งแต่ปี {y}', why1_p: 'ประสบการณ์ด้านอุปกรณ์ไฟฟ้าโรงงานและอาคารมากกว่า 20 ปี',
      why2_h: '{n} รุ่นพร้อมราคา', why2_p: 'ค้นหาด้วยรหัสรุ่นได้ทันที เห็นราคาตั้งก่อนขอใบเสนอราคา',
      why3_h: '{n} แบรนด์ในที่เดียว', why3_p: 'OMRON, MITSUBISHI, HITACHI, FUJI, QUBIX, SHINOHAWA และอีกมากมาย',
      why4_h: 'ทีมขายช่วยเลือกรุ่น', why4_p: 'ส่งรายการมาทาง LINE หรือโทร ทีมขายช่วยเช็คของและเสนอราคาตามจำนวน',
      s4_sub: 'แบรนด์ที่เราจำหน่าย', s4_p: 'แบรนด์ชั้นนำทั้งญี่ปุ่น ยุโรป และแบรนด์คุณภาพสำหรับงานติดตั้ง คลิกโลโก้เพื่อดูสินค้าทั้งหมดของแบรนด์นั้น',
      brands_all: 'ดูแบรนด์ทั้งหมด ({n})', brands_less: 'ย่อรายการแบรนด์',
      s5_sub: 'สินค้าแนะนำจากหลายหมวด', s6_sub: 'คำถามที่พบบ่อย',
      faq: [
        ['ราคาบนเว็บเป็นราคาอะไร?', 'เป็นราคาตั้ง (List price) ตามใบราคาของผู้ผลิตแต่ละแบรนด์ ส่วนใหญ่ยังไม่รวม VAT ราคาจริงและส่วนลดตามจำนวน กรุณาส่งใบขอราคาหรือโทรสอบถามทีมขาย'],
        ['สั่งซื้ออย่างไร?', 'กดปุ่ม + ที่รุ่นที่ต้องการในหน้าสินค้าเพื่อเพิ่มลงใบขอราคา ใส่จำนวน แล้วคัดลอกรายการส่งให้เราทาง LINE อีเมล หรือโทรแจ้งทีมขาย'],
        ['รายการที่เขียนว่า "สอบถามราคา" หมายถึงอะไร?', 'ผู้ผลิตไม่ได้ระบุราคาตั้งไว้ หรือเป็นสินค้าสั่งประกอบ/สั่งพิเศษ ราคาขึ้นกับรุ่นย่อยและจำนวน ติดต่อเราเพื่อเช็คราคาและระยะเวลาส่งของ'],
        ['ราคาอัปเดตล่าสุดเมื่อไร?', 'ทุกสินค้าแสดงวันที่ของใบราคาที่ใช้ หากรุ่นเดียวกันมีหลายใบราคา ระบบใช้ใบราคาที่ใหม่ที่สุด'],
        ['หาไม่เจอรุ่นที่ต้องการ?', 'พิมพ์รหัสรุ่นบางส่วนในช่องค้นหาได้ เช่น "E2E" หรือ "SC-N" หากยังไม่พบ เราจัดหาสินค้านอกแคตตาล็อกให้ได้ ติดต่อทีมขายได้เลย']
      ],
      cta_label: 'REQUEST A QUOTE · ขอใบเสนอราคา', cta_p: 'ส่งรายการที่ต้องการมาได้เลย ทีมขายช่วยเลือกรุ่นที่เหมาะกับงาน เช็คของ และเสนอราคาตามจำนวน',
      cta_quote: 'เปิดใบขอราคา', cta_line: 'แอด LINE', c_office: 'โทรศัพท์สำนักงาน', c_mobile: 'มือถือ', c_line: 'LINE Official', c_email: 'อีเมล', c_addr: 'ที่อยู่',
      // home v4
      nav_faq: 'คำถามที่พบบ่อย', close: 'ปิด', call: 'โทรหาเรา', contact_us: 'ติดต่อเรา',
      hero_sub: 'อุปกรณ์ไฟฟ้าโรงงานและตู้คอนโทรล <b>{n} รุ่น</b> จาก <b>{b} แบรนด์</b> ค้นหารุ่น เช็คราคาตั้ง แล้วส่ง<b>ใบขอราคา</b>ให้ทีมขายได้ทันที',
      st_years: 'ปีในธุรกิจ', st_brands2: 'แบรนด์ชั้นนำ', reel_cap: 'กำลังหาอุปกรณ์สำหรับตู้คอนโทรลอยู่ใช่ไหม?', reel_models: 'รุ่น',
      story_lbl: 'ตั้งแต่ปี 2547', note_h: 'ทุกตู้คอนโทรล มีรายละเอียดของมัน',
      note_p: '{name} จำหน่ายปลีกและส่งอุปกรณ์ไฟฟ้าสำหรับโรงงานและอาคารมาตั้งแต่ปี 2547 เราช่วยหารุ่นที่ใช่ เช็คของ และเสนอราคาให้ทันงาน จากถนนวุฒากาศ เขตธนบุรี กรุงเทพฯ',
      connect_tag: 'อยากรู้ว่าตู้ของคุณขาดอะไร?', connect_p: 'ส่งรายการมาได้เลย ทีมขายช่วย<b>เลือกรุ่นที่เหมาะกับงาน</b> เช็คของ และเสนอราคาตามจำนวน',
      strip_cap: 'ใช่แล้ว เรามี<b>แบรนด์ชั้นนำ</b> และ<b>ความรู้เรื่องงานไฟฟ้า</b>',
      why_tag: '<span class="o">ของครบ.</span> ราคาชัด.',
      why_p: 'เหมือนการเดินสายไฟที่ดี งานจะออกมาดีต้องเริ่มจากอุปกรณ์ที่ใช่ <b>เราช่วยให้คุณเลือกถูก</b> ได้ของ<b>ทันเวลา</b> และ<b>ราคาเหมาะสม</b>',
      why1_h: 'ตั้งแต่ <b>{y}</b>', why2_h: '<b>{n}</b> รุ่นพร้อมราคา', why3_h: '{n} แบรนด์ <b>ที่เดียว</b>',
      steps_tag: 'สั่งของยังไง?', steps_p: 'โฟกัสกับงานของคุณ <b>เรื่องหาของ ปล่อยให้เราดูแล</b>',
      step1_h: 'ค้นหา<b>รุ่น</b>', step1_p: 'พิมพ์รหัสรุ่น ชื่อสินค้า หรือแบรนด์ <b>เห็นราคาตั้งทันที</b>',
      step2_h: 'กด <b>+</b> ขอราคา', step2_p: 'เพิ่มรุ่นที่ต้องการลง<b>ใบขอราคา</b> ใส่จำนวน แล้วคัดลอกหรือพิมพ์ได้',
      step3_h: 'ส่งให้<b>ทีมขาย</b>', step3_p: 'ส่งรายการทาง <b>LINE หรือโทร</b> ทีมขายเช็คของและเสนอราคาตามจำนวน',
      shop_tag: 'เรามีอะไรบ้าง?', shop_p: 'ตั้งแต่ระบบจ่ายไฟ ป้องกัน ควบคุม ออโตเมชัน งานวัด จนถึงงานเดินสายและติดตั้ง <b>ครบทุกส่วนของตู้</b>',
      cloud_cap: 'หมวดสินค้าทั้งหมด <b>{n} หมวด</b> · คลิกเพื่อดูสินค้า',
      price_tag: 'ราคาตั้ง ดูได้เลย', price_p: 'ราคาตั้งจากใบราคาผู้ผลิต <b>เห็นก่อนขอใบเสนอราคา</b> เลือกกลุ่มสินค้าเพื่อดูตัวอย่าง',
      plan_models: 'รุ่นย่อยและราคาตั้ง', plan_sub: '{k} รุ่นในกลุ่มนี้ ตัวอย่าง:', plan_btn: 'ดูทุกรุ่น', plan_flag: 'รุ่นเยอะสุด',
      plans_note: 'ราคาตั้งตามใบราคาผู้ผลิต ส่วนใหญ่ยังไม่รวม VAT · ส่วนลดตามจำนวน สอบถามทีมขาย',
      unsure_h: 'ยังหาไม่เจอ?', unsure_p: 'ไม่เป็นไร เรา<b>จัดหาสินค้านอกแคตตาล็อก</b>ได้ด้วย บอกรุ่นที่ต้องการ แล้วเราจะหาให้',
      brands_tag: 'แบรนด์ที่เราจำหน่าย', brands_p: 'แบรนด์ชั้นนำทั้งญี่ปุ่น ยุโรป และแบรนด์คุณภาพสำหรับงานติดตั้ง <b>คลิกเพื่อดูสินค้าของแต่ละแบรนด์</b>',
      bcard: '{n} รายการ · {k} รุ่นย่อย',
      faq_tag: 'มีคำถาม?', faq_more: 'ยังไม่เจอคำตอบ?', faq_btn: 'ถามทีมขาย',
      roll_tag: 'โทร หรือ LINE?', tz: 'เราอยู่ที่<b>กรุงเทพฯ (เวลาประเทศไทย)</b><br>ตอนนี้เวลา {time} น.', talk: 'คุยกับเราทาง LINE', or_call: 'หรือโทร {p}',
      cab_na: 'ไม่มีขนาดนี้', cab_date: 'ราคาต่อเมตร ตามใบราคาผู้ผลิต (ไฟล์ลงวันที่ {d})', cab_table: 'ตารางราคา', cab_fig: 'โครงสร้างสาย (ภาพจากผู้ผลิต)',
      cab_struct: 'โครงสร้างสาย', cab_tech: 'ข้อมูลทางเทคนิค', cab_app: 'การใช้งาน', cab_note_q: 'กด + เพื่อเพิ่มขนาดที่ต้องการลงใบขอราคา',
      cab_src: 'ราคาตั้งต่อเมตรตามใบราคา YAZAKI (ใบราคาไม่ได้พิมพ์วันที่ ไฟล์ลงวันที่ {d}) ช่องที่เป็นขีด = ไม่มีขนาด/จำนวนแกนนั้น กรุณายืนยันราคา ส่วนลด และความยาวขั้นต่ำกับทีมขายก่อนสั่งซื้อ',
      per_m: '/ม.',
      // v5 (editorial design)
      v5_kicker: 'อุปกรณ์ไฟฟ้าโรงงานและอาคาร · ตั้งแต่ปี 2547',
      v5_h1: 'อุปกรณ์ไฟฟ้าที่ใช่ <span class="glow">ราคาที่ชัด</span> ครบในที่เดียว',
      v5_sub: 'ค้นหาจาก <b>{k} รุ่น</b> ของ <b>{b} แบรนด์</b> ตั้งแต่เบรกเกอร์ แมกเนติก เซ็นเซอร์ ไปจนถึงสายไฟ YAZAKI เห็นราคาตั้งก่อนคุยกับทีมขาย แล้วส่งใบขอราคาได้ในไม่กี่คลิก',
      v5_note: 'ราคาตั้งจากใบราคาผู้ผลิต · {p} รายการสินค้า', v5_band: 'แบรนด์ชั้นนำที่เราจัดจำหน่าย',
      v5_intro_h: 'เราไม่ได้เป็นแค่ร้านขายของ แต่เป็น<span class="glow">ทีมจัดหา</span>อุปกรณ์ไฟฟ้าที่อยู่ข้างงานคุณ',
      v5_intro_p: '<b>บริษัท ทริปเปิ้ล อี เทรดดิ้ง จำกัด</b> จำหน่ายปลีกและส่งอุปกรณ์ไฟฟ้าสำหรับโรงงานและอาคารมาตั้งแต่ปี 2547 เรารวมใบราคาของผู้ผลิตหลายสิบแบรนด์ไว้ในที่เดียว ค้นหาด้วยรหัสรุ่นได้ทันที และทีมขายพร้อมช่วยเลือกรุ่นที่เหมาะกับงาน เช็คของ และเสนอราคาตามจำนวน',
      v5_intro_btn: 'คุยกับทีมขาย',
      v5_stmt: 'ช่างและฝ่ายจัดซื้อไม่ควรต้องรอหลายวันเพียงเพื่อรู้ว่าอุปกรณ์ชิ้นหนึ่งราคาเท่าไร เราจึงเปิดราคาตั้งให้เห็นตั้งแต่แรก แล้วใช้เวลาไปกับเรื่องที่สำคัญกว่า คือช่วยคุณเลือกให้ถูกรุ่น',
      v5_stmt_who: 'ทีมขาย Triple E Trading', v5_stmt_since: 'ดูแลงานไฟฟ้าตั้งแต่ปี {y}',
      v5_ranges_h: 'แบรนด์เด่นในคลังของเรา <span class="glow">ครบทั้งรุ่นและราคา</span>',
      v5_feat_yazaki: 'สายไฟ YAZAKI ครบตั้งแต่สายในอาคาร สายคอนโทรล ไปจนถึงสายแรงสูง 115 kV พร้อมตารางราคาต่อเมตร',
      v5_feat_omron: 'รีเลย์ ไทม์เมอร์ เซ็นเซอร์ และอุปกรณ์ควบคุม OMRON กว่า {k} รุ่น ค้นหาด้วยรหัสรุ่นได้ทันที',
      v5_feat_shinohawa: 'อุปกรณ์ตู้คอนโทรล SHINOHAWA กว่า {k} รุ่น ตั้งแต่เซ็นเซอร์ ลิมิตสวิตช์ ไปจนถึงเทอร์มินอล',
      v5_feat_qubix: 'สวิตช์ปุ่มกด แคมสวิตช์ และมิเตอร์ QUBIX สำหรับตู้ไฟทุกขนาด',
      v5_results: 'ในแคตตาล็อก', v5_r_models: 'รุ่นย่อยพร้อมราคา', v5_r_products: 'รายการสินค้า', v5_r_from: 'ราคาเริ่มต้น', v5_view_brand: 'ดูสินค้า', v5_viewall: 'ดูสินค้าทั้งหมด',
      v5_groups_h: 'หมวดสินค้า', v5_groups_p: 'หกกลุ่มหลักที่ครอบคลุมทุกส่วนของตู้ไฟและงานติดตั้ง เลือกกลุ่มเพื่อดูหมวดย่อยและสินค้าทั้งหมด', v5_grp_cnt: '{n} รายการ · {c} หมวด',
      v5_cloud_h: 'ทุกหมวดที่<span class="glow">งานไฟฟ้าต้องใช้</span>', v5_cloud_p: 'คลิกหมวดเพื่อดูสินค้า ราคาตั้ง และรุ่นย่อยทั้งหมด',
      v5_how_h: 'สั่งซื้อกับเรา<br>ง่ายกว่าที่คิด', v5_how_p: 'สี่ขั้นตอน ตั้งแต่ค้นหารุ่นจนถึงได้ใบเสนอราคา',
      v5_how1_h: 'ค้นหารุ่น', v5_how1_p: 'พิมพ์รหัสรุ่น ชื่อสินค้า หรือแบรนด์ ระบบค้นหาครอบคลุมทุกรุ่นย่อยในแคตตาล็อก',
      v5_how2_h: 'เช็คราคาตั้ง', v5_how2_p: 'ทุกรุ่นแสดงราคาตั้งตามใบราคาผู้ผลิต พร้อมวันที่ของใบราคา วางงบได้ตั้งแต่ก่อนติดต่อ',
      v5_how3_h: 'ส่งใบขอราคา', v5_how3_p: 'กด + เพิ่มรุ่นลงใบขอราคา ใส่จำนวน แล้วคัดลอกส่งทาง LINE หรืออีเมล',
      v5_how4_h: 'ยืนยันกับทีมขาย', v5_how4_p: 'ทีมขายตรวจสอบสต็อก ส่วนลดตามจำนวน และกำหนดส่ง แล้วยืนยันกลับหาคุณ',
      v5_brands_eb: 'แบรนด์', v5_brands_h: 'แบรนด์ชั้นนำ<span class="glow">ในคลังของเรา</span>',
      v5_brands_p: 'จากญี่ปุ่น ยุโรป และแบรนด์คุณภาพสำหรับงานติดตั้ง คลิกการ์ดเพื่อดูสินค้าทั้งหมดของแบรนด์นั้น',
      v5_faq_eb: 'คำถามที่พบบ่อย', v5_faq_h: 'ก่อนสั่งซื้อ ควรรู้อะไรบ้าง',
      v5_line_h: 'ขอราคาผ่าน LINE', v5_line_p: 'ส่งรหัสรุ่น รูปป้ายสินค้า หรือรายการที่ต้องการมาได้เลย ทีมขายจะตอบกลับพร้อมราคา',
      v5_scatter: ['ทุกงาน', 'ไฟฟ้า', 'ควรได้', 'ของดี'], v5_cta_p: 'บอกเราว่ากำลังทำงานอะไรอยู่ ทีมขายทริปเปิ้ล อี เทรดดิ้ง จะช่วยหารุ่นที่ใช่ เช็คของ และเสนอราคาให้',
      v5_cta_call: 'โทรคุยกับทีมขาย',
      dd_all_products: 'ดูสินค้าทั้งหมด', dd_all_brands: 'ดูแบรนด์ทั้งหมด ({n})', foot_contact: 'ติดต่อ',
      fbox_h: 'ใบขอราคา', fbox_p: 'รวมรุ่นที่ต้องการไว้ในรายการเดียว แล้วส่งให้ทีมขายทาง LINE หรืออีเมล', fbox_btn: 'เปิดใบขอราคา',
      foot_tag: 'อุปกรณ์ไฟฟ้าโรงงานและอาคาร ครบ ชัด ในที่เดียว',
      v7_ann_lbl: 'ประกาศ', v7_ann: ['ราคาตั้งตามใบราคาผู้ผลิต · ดูราคาได้ทันทีทุกรุ่น', 'ขอใบเสนอราคาผ่าน LINE <a href="https://line.me/R/ti/p/@3ethailand" target="_blank" rel="noopener">{l}</a>', 'โทรสั่งซื้อ / สอบถาม {p}', 'ใหม่! สายไฟ YAZAKI ครบทุกขนาด พร้อมตารางราคาต่อเมตร'],
      v7_strip: ['{k} รุ่นพร้อมราคาตั้ง', '{b} แบรนด์', '{p} รายการสินค้า', 'สายไฟ YAZAKI ราคาต่อเมตร', 'ขอใบเสนอราคาง่ายใน 1 นาที', 'ตั้งแต่ปี 2547'],
      v7_hot: 'สายไฟ YAZAKI',
      v7_s1_k: 'อุปกรณ์ไฟฟ้าโรงงาน', v7_s1_h: 'ครบทุกรุ่น<br>ในที่เดียว', v7_s1_small: 'รุ่น', v7_s1_p: 'เบรกเกอร์ แมกเนติก รีเลย์ เซ็นเซอร์ มิเตอร์ จาก {b} แบรนด์ ({p} รายการ) พร้อมราคาตั้งให้เทียบได้ทันที', v7_s1_btn: 'เลือกซื้อสินค้า',
      v7_s2_k: 'ใหม่ · สายไฟ', v7_s2_h: 'YAZAKI<br>ทุกขนาด', v7_s2_p: 'THW, VAF, VCT, NYY, CV และอีกมาก พร้อมสเปค ภาพหน้าตัด และตารางราคาต่อเมตรทุกขนาด', v7_s2_btn: 'ดูสายไฟ YAZAKI',
      v7_s3_k: 'งานคอนโทรล', v7_s3_h: 'OMRON<br>ของแท้', v7_s3_small: 'รุ่น', v7_s3_p: 'รีเลย์ ไทม์เมอร์ เซ็นเซอร์ สวิตช์ และอุปกรณ์ออโตเมชัน สำหรับตู้คอนโทรลและเครื่องจักร', v7_s3_btn: 'ดูสินค้า OMRON',
      v7_feat_eb: 'แนะนำ', v7_feat_h: 'สินค้าขายดีประจำหมวด', v7_view_all: 'ดูทั้งหมด',
      v7_grp_eb: 'เลือกตามงาน', v7_grp_h: 'คุณกำลังหาอะไรอยู่?', v7_shop: 'เลือกซื้อ', v7_shop_n: 'ดู {n} รายการ',
      v7_yz_eb: 'คอลเลกชัน', v7_yz_h: 'สายไฟ YAZAKI', v7_yz_p: 'ทุกรุ่นมีภาพหน้าตัด สเปค และตารางราคาต่อเมตรแยกตามขนาด', v7_yz_all: 'ดูสายไฟทั้งหมด',
      v7_br_eb: 'แบรนด์', v7_br_h: 'เลือกตามแบรนด์', v7_cat_eb: 'หมวดยอดนิยม', v7_cat_h: 'เลือกตามประเภทสินค้า', v7_brand_eb: 'แบรนด์แนะนำ · {k} รุ่น',
      v7_bn_eb: 'ใบขอราคา', v7_bn_h: 'เลือกหลายรุ่น<br>ขอราคาทีเดียว', v7_bn_p: 'กด + ที่รุ่นที่ต้องการ ใส่จำนวน แล้วส่งรายการให้ทีมขายทาง LINE หรืออีเมล รับราคาพร้อมส่วนลดตามจำนวน', v7_bn_btn: 'เริ่มเลือกสินค้า',
      v7_band: ['ราคาตั้งชัดเจน', 'ของแท้จากผู้ผลิต', 'สายไฟ YAZAKI', 'OMRON', 'MITSUBISHI', 'ราคาปลีกและส่ง', 'ขอใบเสนอราคาทาง LINE'],
      v7_story_eb: 'เรื่องของเรา', v7_story_h: 'ดูแลงานไฟฟ้าโรงงานและอาคาร ตั้งแต่ปี {y}', v7_story_p: 'บริษัท ทริปเปิ้ล อี เทรดดิ้ง จำกัด จำหน่ายปลีกและส่งอุปกรณ์ไฟฟ้าสำหรับโรงงาน อาคาร และตู้คอนโทรล เรารวบรวมใบราคาของผู้ผลิตมาไว้ในที่เดียว เพื่อให้ช่างและฝ่ายจัดซื้อหาเจอเร็ว เทียบราคาง่าย และขอใบเสนอราคาได้ทันที',
      v7_f_brands: 'แบรนด์', v7_f_cats: 'หมวดสินค้า', v7_f_since: 'ปีที่ก่อตั้ง (พ.ศ.)', v7_ln_eb: 'ติดต่อทีมขาย',
      v7_f_email: 'อีเมล', v7_f_call: 'โทรหาเรา', v7_f_tax: 'เลขประจำตัวผู้เสียภาษี', v7_f_addr: 'ที่อยู่', v7_f_company: 'บริษัท',
      v7_pick: 'เลือกรุ่น', v7_pick_ph: '— เลือกรุ่น ({n} รุ่น) —', v7_pick_price: 'ราคาตั้งรุ่นนี้', v7_add_sel: 'เพิ่มรุ่นนี้ลงใบขอราคา', v7_in_list: 'อยู่ในใบขอราคาแล้ว · กดเพื่อนำออก', v7_see_table: 'ดูตารางทุกรุ่น',
      // catalog
      crumb_home: 'หน้าแรก', all_products: 'สินค้าทั้งหมด', f_cats: 'หมวดสินค้า', f_brands: 'แบรนด์', f_clear: 'ล้าง', f_brand_ph: 'ค้นหาแบรนด์…',
      f_price: 'ราคา', f_priced: 'มีราคาตั้ง', f_img: 'มีรูปสินค้า', filters: 'ตัวกรอง', cat_q_ph: 'ค้นหาชื่อสินค้า รหัสรุ่น หรือแบรนด์…',
      sort_rel: 'เรียง: แนะนำ', sort_pa: 'ราคา ต่ำ → สูง', sort_pd: 'ราคา สูง → ต่ำ', sort_name: 'ชื่อ A → Z', sort_sku: 'จำนวนรุ่นมากสุด',
      found: 'พบ <b>{n}</b> รายการ', none: 'ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองลบตัวกรองหรือค้นหาด้วยรหัสรุ่นบางส่วน', more: 'ดูเพิ่มเติม',
      all_sub: 'ค้นหาจากชื่อสินค้า รหัสรุ่น หรือเลือกหมวดและแบรนด์ทางซ้าย', brand_sub: '{n} รายการ · {k} รุ่นย่อย', cat_sub: '{c} · {n} รายการ',
      // product
      not_found: 'ไม่พบสินค้านี้', back_catalog: 'กลับไปหน้าสินค้า', no_img: 'ยังไม่มีรูปสินค้าที่คมชัดพอสำหรับรายการนี้',
      price: 'ราคา', list_price: 'ราคาตั้ง', price_at: 'ราคา ณ {d} · ยังไม่รวม VAT', pick_model: 'เลือกรุ่น / ขอราคา', call_ask: 'โทรสอบถาม',
      models_h: 'รุ่นย่อยและราคาตั้ง', sku_ph: 'กรองรหัสรุ่น…', th_model: 'รหัสรุ่น', th_opt: 'ตัวเลือก', th_spec: 'สเปค', th_price: 'ราคาตั้ง (฿)',
      th_disc: 'ส่วนลด', th_net: 'ราคาสุทธิ', th_unit: 'หน่วย', add_quote: 'เพิ่มในใบขอราคา', ask: 'สอบถาม', disc: 'ลด {n}%', net: 'สุทธิ {n}',
      src_note: 'ราคาตั้งตามใบราคาผู้ผลิต ณ {d} (ส่วนใหญ่ยังไม่รวม VAT) อาจเปลี่ยนแปลงได้ กรุณายืนยันราคาและส่วนลดกับทีมขายก่อนสั่งซื้อ', related: 'สินค้าที่เกี่ยวข้อง',
      // quote
      q_lead: 'รายการที่เลือกไว้ ใส่จำนวน แล้วพิมพ์ หรือคัดลอกส่งให้ฝ่ายขายทางอีเมล / LINE', q_copy: 'คัดลอกรายการ', q_print: 'พิมพ์ / บันทึก PDF',
      q_csv: 'ดาวน์โหลด CSV', q_clear: 'ล้างรายการ', q_empty: 'ยังไม่มีรายการ — เปิดหน้าสินค้าแล้วกดปุ่ม + ที่รุ่นที่ต้องการ', q_go: 'ไปเลือกสินค้า',
      q_product: 'สินค้า', q_qty: 'จำนวน', q_sum: 'รวม (฿)', q_total: 'รวมราคาตั้ง (ยังไม่รวม VAT / ส่วนลด)', q_ask_n: 'มี {n} รายการที่ต้องสอบถามราคา',
      q_del: 'ลบ', q_title: 'ขอใบเสนอราคา', copied: 'คัดลอกแล้ว', copy_fail: 'คัดลอกไม่สำเร็จ — เลือกข้อความด้านล่างแล้วคัดลอกเอง'
    },
    en: {
      nav_home: 'Home', nav_catalog: 'All products', nav_cats: 'Categories', nav_brands: 'Brands', nav_contact: 'Contact',
      quote: 'Quote list', call_order: 'Call to order', menu: 'Menu', theme: 'Toggle dark / light mode', lang_switch: 'Change language',
      mobile: 'Mobile', since: 'Factory & building electrical supply since {y}',
      foot_popular: 'Popular categories', foot_brands: 'Brands', foot_service: 'Services', foot_search: 'Product search', foot_howto: 'How to order',
      foot_shop: 'Online shop (TARAD)', foot_note: 'List prices from manufacturer price lists; subject to change without notice.', tel: 'Tel',
      price_ask: 'Price on request', price_from: 'from', models: '{n} models', items: '{n} items', added: 'Added to quote list', removed: 'Removed from quote list',
      hero_since: 'Since 2004', hero_h2: 'Factory electrical parts and control-panel gear, <span class="hl">all in one place</span>',
      hero_p: 'Find a model, check the list price, and send a quote request to our sales team in seconds.', hero_all: 'Browse all products', hero_contact: 'Contact sales',
      search_ph: 'Search a model, e.g. MY2N, NF125-SV, 3P breaker, warning light…', search_btn: 'Search',
      quick: ['breaker', 'contactor', 'relay', 'warning light', 'proximity', 'meter', 'cable lug', 'enclosure'],
      s1_sub: 'Complete range, clear prices, easy to choose', s1_p: 'Compiled from manufacturer price lists 2024–2025 and organised by category, brand and every sub-model, with list prices.',
      st_products: 'Products', st_skus: 'Priced models', st_brands: 'Leading brands', st_cats: 'Categories',
      s2_sub: 'Browse by system or by category', s2_p: 'From power distribution and protection to control, automation, measurement, wiring and installation.',
      g_power: 'ACB / MCCB / MCB breakers, fuses, surge protection, capacitors', g_control: 'Contactors, relays, timers, push buttons, pilot lamps, signal lights',
      g_automation: 'PLCs, inverters, sensors, proximity switches, power supplies', g_measure: 'Digital / analog panel meters, CTs, test instruments',
      g_install: 'Terminals, cable lugs, wiring ducts, enclosures, industrial plugs, panel fans', g_tools: 'Hand tools, pneumatics, valves, chemicals and more',
      why_lead: '{name_en} — retail and wholesale electrical equipment for factories and buildings since {ce}.',
      why1_h: 'Since {ce}', why1_p: 'Over 20 years supplying electrical equipment for factories and buildings.',
      why2_h: '{n} priced models', why2_p: 'Search by model code and see the list price before you ask for a quote.',
      why3_h: '{n} brands, one supplier', why3_p: 'OMRON, MITSUBISHI, HITACHI, FUJI, QUBIX, SHINOHAWA and many more.',
      why4_h: 'Sales help you choose', why4_p: 'Send your list by LINE or phone; our team checks stock and quotes by quantity.',
      s4_sub: 'Brands we carry', s4_p: 'Leading Japanese and European brands plus reliable installation brands. Click a logo to see all of that brand\'s products.',
      brands_all: 'Show all brands ({n})', brands_less: 'Show fewer brands',
      s5_sub: 'Featured picks across categories', s6_sub: 'Frequently asked questions',
      faq: [
        ['What prices are shown?', 'List prices from each manufacturer\'s price list, mostly excluding VAT. For net prices and quantity discounts, send a quote request or call our sales team.'],
        ['How do I order?', 'Press + next to the models you need on a product page to add them to your quote list, set quantities, then copy the list and send it to us by LINE, e-mail or phone.'],
        ['What does "Price on request" mean?', 'The manufacturer did not publish a list price, or the item is built to order. Contact us for the price and lead time.'],
        ['When were prices last updated?', 'Every product shows the date of its price list. When a model appears in several price lists, the newest one is used.'],
        ['Can\'t find the model you need?', 'Type part of the model code, e.g. "E2E" or "SC-N". If it still isn\'t listed, we can source items outside this catalogue — just contact sales.']
      ],
      cta_label: 'REQUEST A QUOTE', cta_p: 'Send us your list. Our sales team will help pick the right models, check stock and quote by quantity.',
      cta_quote: 'Open quote list', cta_line: 'Add us on LINE', c_office: 'Office phone', c_mobile: 'Mobile', c_line: 'LINE Official', c_email: 'E-mail', c_addr: 'Address',
      nav_faq: 'FAQ', close: 'Close', call: 'Call us', contact_us: 'Contact us',
      hero_sub: 'Factory and control-panel electrical parts: <b>{n} models</b> from <b>{b} brands</b>. Find a model, check the list price and send a <b>quote request</b> in seconds.',
      st_years: 'Years in business', st_brands2: 'Leading brands', reel_cap: 'Looking for control-panel parts?', reel_models: 'models',
      story_lbl: 'SINCE 2004', note_h: 'Every panel has its own story',
      note_p: '{name_en} has supplied electrical equipment to factories and buildings, retail and wholesale, since 2004. We help you find the right model, check stock and quote on time, from Wutthakat Road, Thon Buri, Bangkok.',
      connect_tag: 'DISCOVER WHAT YOUR PANEL NEEDS.', connect_p: 'Send us your list. Our team helps you <b>pick the right models</b>, checks stock and quotes by quantity.',
      strip_cap: 'Yes, we have <b>the best brands</b> and <b>know-how</b>',
      why_tag: '<span class="o">RIGHT PARTS.</span> RIGHT PRICE.',
      why_p: 'Like good wiring, a good job starts with the right parts. <b>We help you choose correctly</b>, get it <b>on time</b> and at <b>the right price</b>.',
      why1_h: 'Since <b>{y}</b>', why2_h: '<b>{n}</b> priced models', why3_h: '{n} brands, <b>one</b> supplier',
      steps_tag: 'WHAT NOW?', steps_p: 'Focus on <b>what matters</b>. We will handle the sourcing.',
      step1_h: 'Search <b>Fast</b>', step1_p: 'Type a model code, product name or brand and <b>see the list price</b> right away.',
      step2_h: 'Quote <b>Easy</b>', step2_p: 'Add models to your <b>quote list</b>, set quantities, then copy or print it.',
      step3_h: 'Get <b>Supplied</b>', step3_p: 'Send it by <b>LINE or phone</b>; our team checks stock and quotes by quantity.',
      shop_tag: 'HOW, YOU ASK?', shop_p: 'From power distribution and protection to control, automation, metering, wiring and installation: <b>every part of the panel</b>.',
      cloud_cap: 'All <b>{n} categories</b> · click one to browse',
      price_tag: 'OUR PRICE LIST', price_p: 'List prices straight from manufacturer price lists. <b>See them before you ask for a quote.</b> Pick a group to preview.',
      plan_models: 'Models & list prices', plan_sub: '{k} models in this range, e.g.:', plan_btn: 'See all models', plan_flag: 'Most models',
      plans_note: 'List prices from manufacturer price lists, mostly excl. VAT · Quantity discounts on request.',
      unsure_h: 'STILL UNSURE?', unsure_p: 'No worries. We also <b>source items outside this catalogue</b>. Tell us what you need and we will find it.',
      brands_tag: 'OUR SPOTLIGHT', brands_p: 'Leading Japanese and European brands plus reliable installation brands. <b>Click one to see its products.</b>',
      bcard: '{n} products · {k} models',
      faq_tag: 'GOT QUESTIONS?', faq_more: 'DIDN\'T FIND IT HERE?', faq_btn: 'Ask our team',
      roll_tag: 'CALL OR LINE?', tz: 'We are on <b>Bangkok time (ICT)</b>.<br>It is {time} here.', talk: 'Talk with us on LINE', or_call: 'or call {p}',
      cab_na: 'Not available in this size', cab_date: 'Price per metre, manufacturer list (file dated {d})', cab_table: 'Price table', cab_fig: 'Cable construction (manufacturer drawing)',
      cab_struct: 'Cable structure', cab_tech: 'Technical data', cab_app: 'Application', cab_note_q: 'press + to add the sizes you need to your quote list',
      cab_src: 'List prices per metre from the YAZAKI price list (no date printed; file dated {d}). A dash means that size / core count is not made. Please confirm prices, discounts and minimum lengths with our sales team before ordering.',
      per_m: '/m',
      v5_kicker: 'Factory & building electrical supply · since 2004',
      v5_h1: 'The right part. <span class="glow">A clear price.</span> One supplier.',
      v5_sub: 'Search <b>{k} models</b> from <b>{b} brands</b>, from breakers, contactors and sensors to YAZAKI cable. See the list price first, then send a quote request in a few clicks.',
      v5_note: 'List prices from manufacturer price lists · {p} products', v5_band: 'Leading brands we supply',
      v5_intro_h: 'More than a shop: your <span class="glow">sourcing team</span> for electrical parts',
      v5_intro_p: '<b>Triple E Trading Co., Ltd.</b> has supplied electrical equipment to factories and buildings, retail and wholesale, since 2004. We bring dozens of manufacturer price lists together in one place, searchable by model code, and our sales team helps you pick the right model, checks stock and quotes by quantity.',
      v5_intro_btn: 'Talk to sales',
      v5_stmt: 'Technicians and buyers should not have to wait days just to learn what a part costs. So we show list prices up front and spend our time on what matters more: helping you choose the right model.',
      v5_stmt_who: 'Triple E Trading sales team', v5_stmt_since: 'Serving electrical work since {y}',
      v5_ranges_h: 'Featured brands, <span class="glow">every model priced</span>',
      v5_feat_yazaki: 'YAZAKI cable from building wire and control cable up to 115 kV, with per-metre price tables',
      v5_feat_omron: 'OMRON relays, timers, sensors and control gear: {k} models, searchable by code',
      v5_feat_shinohawa: 'SHINOHAWA panel components, {k} models from sensors and limit switches to terminals',
      v5_feat_qubix: 'QUBIX push buttons, cam switches and panel meters for switchboards of every size',
      v5_results: 'In the catalogue', v5_r_models: 'Priced models', v5_r_products: 'Products', v5_r_from: 'Starting price', v5_view_brand: 'View range', v5_viewall: 'View all products',
      v5_groups_h: 'What we stock', v5_groups_p: 'Six groups that cover every part of the panel and the installation. Pick one to see all its categories and products.', v5_grp_cnt: '{n} products · {c} categories',
      v5_cloud_h: 'Every category <span class="glow">a panel needs</span>', v5_cloud_p: 'Click a category to see its products, list prices and every sub-model.',
      v5_how_h: 'How ordering<br>works', v5_how_p: 'Four steps from finding a model to getting your quote.',
      v5_how1_h: 'Find the model', v5_how1_p: 'Type a model code, product name or brand. Search covers every sub-model in the catalogue.',
      v5_how2_h: 'Check the list price', v5_how2_p: 'Every model shows the manufacturer list price and the price-list date, so you can budget before you call.',
      v5_how3_h: 'Send a quote request', v5_how3_p: 'Press + to add models to your quote list, set quantities, then copy it to LINE or e-mail.',
      v5_how4_h: 'Confirm with sales', v5_how4_p: 'Our team checks stock, quantity discounts and lead time, then confirms back to you.',
      v5_brands_eb: 'Brands', v5_brands_h: 'Leading brands <span class="glow">in our range</span>',
      v5_brands_p: 'Japanese, European and reliable installation brands. Click a card to see everything we carry from that brand.',
      v5_faq_eb: 'Got questions?', v5_faq_h: 'Good to know',
      v5_line_h: 'Quote on LINE', v5_line_p: 'Send model codes, a photo of the nameplate or your list. Our sales team replies with prices.',
      v5_scatter: ['Every', 'panel', 'deserves', 'good parts'], v5_cta_p: 'Tell us what you are working on. The Triple E Trading sales team will find the right models, check stock and send you a quote.',
      v5_cta_call: 'Call our sales team',
      dd_all_products: 'View all products', dd_all_brands: 'All brands ({n})', foot_contact: 'Contact',
      fbox_h: 'Your quote', fbox_p: 'Collect the models you need in one list, then send it to sales by LINE or e-mail.', fbox_btn: 'Open quote list',
      foot_tag: 'Factory and building electrical supply: complete, clear, in one place.',
      v7_ann_lbl: 'Announcements', v7_ann: ['List prices from manufacturer price lists · see every model price instantly', 'Get a quotation on LINE <a href="https://line.me/R/ti/p/@3ethailand" target="_blank" rel="noopener">{l}</a>', 'Orders & enquiries: {p}', 'New! Full YAZAKI cable range with price-per-metre tables'],
      v7_strip: ['{k} models with list prices', '{b} brands', '{p} products', 'YAZAKI cable per metre', 'Quote request in 1 minute', 'Since 2004'],
      v7_hot: 'YAZAKI cable',
      v7_s1_k: 'Factory electrical supply', v7_s1_h: 'Every model<br>in one place', v7_s1_small: 'models', v7_s1_p: 'Breakers, contactors, relays, sensors and meters from {b} brands ({p} products), with list prices you can compare instantly.', v7_s1_btn: 'Shop products',
      v7_s2_k: 'New · Cable', v7_s2_h: 'YAZAKI<br>every size', v7_s2_p: 'THW, VAF, VCT, NYY, CV and more, with specs, cross-section drawings and price-per-metre tables for every size.', v7_s2_btn: 'Shop YAZAKI cable',
      v7_s3_k: 'Control', v7_s3_h: 'Genuine<br>OMRON', v7_s3_small: 'models', v7_s3_p: 'Relays, timers, sensors, switches and automation parts for control panels and machines.', v7_s3_btn: 'Shop OMRON',
      v7_feat_eb: 'Featured', v7_feat_h: 'Best sellers by category', v7_view_all: 'View all',
      v7_grp_eb: 'Shop by job', v7_grp_h: 'What are you looking for?', v7_shop: 'Shop', v7_shop_n: 'Shop {n} products',
      v7_yz_eb: 'Collection', v7_yz_h: 'YAZAKI cable', v7_yz_p: 'Every type with a cross-section drawing, specs and a per-metre price table by size.', v7_yz_all: 'View all cable',
      v7_br_eb: 'Brands', v7_br_h: 'Shop by brand', v7_cat_eb: 'Popular categories', v7_cat_h: 'Shop by product type', v7_brand_eb: 'Featured brand · {k} models',
      v7_bn_eb: 'Quote list', v7_bn_h: 'Pick many models,<br>one quotation', v7_bn_p: 'Press + next to the models you need, set quantities and send the list to our sales team by LINE or e-mail. We reply with prices and volume discounts.', v7_bn_btn: 'Start shopping',
      v7_band: ['Clear list prices', 'Genuine parts', 'YAZAKI cable', 'OMRON', 'MITSUBISHI', 'Retail & wholesale', 'Quote on LINE'],
      v7_story_eb: 'Our story', v7_story_h: 'Supplying factory & building electrical since {y}', v7_story_p: 'Triple E Trading Co., Ltd. sells electrical equipment for factories, buildings and control panels, retail and wholesale. We bring manufacturer price lists together in one place so technicians and buyers can find parts fast, compare prices and request a quotation right away.',
      v7_f_brands: 'Brands', v7_f_cats: 'Categories', v7_f_since: 'Founded', v7_ln_eb: 'Talk to sales',
      v7_f_email: 'Email', v7_f_call: 'Call us', v7_f_tax: 'Tax ID', v7_f_addr: 'Address', v7_f_company: 'Company',
      v7_pick: 'Choose model', v7_pick_ph: '— Choose a model ({n} models) —', v7_pick_price: 'List price for this model', v7_add_sel: 'Add this model to quote', v7_in_list: 'In your quote list · press to remove', v7_see_table: 'See all models',
      crumb_home: 'Home', all_products: 'All products', f_cats: 'Categories', f_brands: 'Brands', f_clear: 'Clear', f_brand_ph: 'Find a brand…',
      f_price: 'Price', f_priced: 'Has list price', f_img: 'Has photo', filters: 'Filters', cat_q_ph: 'Search product name, model code or brand…',
      sort_rel: 'Sort: recommended', sort_pa: 'Price: low → high', sort_pd: 'Price: high → low', sort_name: 'Name A → Z', sort_sku: 'Most models',
      found: '<b>{n}</b> products', none: 'No products match. Try removing a filter or searching part of the model code.', more: 'Load more',
      all_sub: 'Search by product name or model code, or pick categories and brands on the left.', brand_sub: '{n} products · {k} models', cat_sub: '{c} · {n} products',
      not_found: 'Product not found.', back_catalog: 'Back to products', no_img: 'No sharp product photo is available for this item yet.',
      price: 'Price', list_price: 'List price', price_at: 'Price as of {d} · excl. VAT', pick_model: 'Choose model / get a quote', call_ask: 'Call us',
      models_h: 'Models & list prices', sku_ph: 'Filter model code…', th_model: 'Model', th_opt: 'Option', th_spec: 'Specs', th_price: 'List price (฿)',
      th_disc: 'Discount', th_net: 'Net price', th_unit: 'Unit', add_quote: 'Add to quote list', ask: 'Ask', disc: '-{n}%', net: 'Net {n}',
      src_note: 'List prices from the manufacturer price list dated {d} (mostly excl. VAT), subject to change. Please confirm prices and discounts with our sales team before ordering.', related: 'Related products',
      q_lead: 'Your selected items. Set quantities, then print or copy the list and send it to sales by e-mail / LINE.', q_copy: 'Copy list', q_print: 'Print / save PDF',
      q_csv: 'Download CSV', q_clear: 'Clear list', q_empty: 'Your quote list is empty — open a product page and press + next to the models you need.', q_go: 'Browse products',
      q_product: 'Product', q_qty: 'Qty', q_sum: 'Total (฿)', q_total: 'List-price total (excl. VAT / discounts)', q_ask_n: '{n} item(s) need a price quote',
      q_del: 'Remove', q_title: 'Request for quotation', copied: 'Copied', copy_fail: 'Copy failed — select the text below and copy it manually'
    }
  };
  function t(key, vars) {
    let s = (D[LANG] && D[LANG][key] != null) ? D[LANG][key] : (D.th[key] != null ? D.th[key] : key);
    const sub = x => (typeof x === 'string' && vars) ? x.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : x;
    s = Array.isArray(s) ? s.map(sub) : sub(s);
    return s;
  }
  // product-data translation (Thai strings → English) when LANG = en
  function tr(s) { if (LANG !== 'en' || !s) return s; const M = window.I18N_TH_EN; return (M && M[s]) || s; }

  // static markup: data-i18n (text), data-i18n-html, data-i18n-ph (placeholder), data-i18n-aria
  function applyStatic(rootEl) {
    (rootEl || document).querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    (rootEl || document).querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    (rootEl || document).querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    (rootEl || document).querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  }
  window.I18N = { get lang() { return LANG; }, t, tr, setLang, applyStatic, toggleTheme, isDark };
})();
