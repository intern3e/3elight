# ฐานข้อมูลสินค้า Triple E Trading (Catalogue Database)

สร้างจากใบราคาของผู้ผลิต 10 ชุด — ข้อมูลทุกรุ่นย่อยพร้อมราคาตั้ง แยกแบรนด์ / หมวด / กลุ่มสินค้า
เอาไปใช้กับเว็บอื่น ระบบหลังบ้าน หรือ Excel ได้ทันที

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `triplee_catalog.sqlite` | ฐานข้อมูล SQLite (เปิดด้วย DB Browser for SQLite, ต่อกับ PHP/Python/Node ได้เลย) |
| `catalog.json` | JSON แบบซ้อน: product → skus (เหมาะกับเว็บ/แอป, import เข้า MongoDB/Firestore) |
| `products.csv`, `skus.csv`, `brands.csv`, `categories.csv` | CSV (UTF-8 BOM เปิดใน Excel ภาษาไทยไม่เพี้ยน) import เข้า MySQL / WooCommerce / Shopify ได้ |
| `triplee_catalog.xlsx` | Excel ไว้ดู/แก้ราคา มี filter ทุกชีต |

## โครงสร้าง (schema)

```
sources (id, file, title, price_date)                 -- ใบราคาต้นทาง
brands (id, name, slug, product_count, sku_count)
categories (id, slug, name_th, name_en, group_slug, group_th, group_en, product_count, sku_count)
products (id, slug, brand_id → brands, category_id → categories, subcategory,
          title, name_th, name_en, description_th, specs_json,
          image, image_thumb, image_quality, image_shared, low_res_image,
          price_min, price_max, sku_count, source_id → sources, source_pages, price_date, spec_sheet_json)  -- spec_sheet_json: สเปคเต็ม + ตารางราคาขนาด×แกน (สายไฟ YAZAKI)
skus (id, product_id → products, model, option, specs_json, specs_text,
      list_price, price_note, discount_pct, net_price, unit, remark, currency, source_id, price_date)
price_history (sku_id → skus, source_id, page, price, price_date)  -- ราคาเก่าจากใบราคาอื่นที่ถูกแทนที่
VIEW v_sku_full  -- ตาราง SKU แบบแบนพร้อมชื่อแบรนด์/หมวด/สินค้า (ใช้ export ง่ายสุด)
```

- **product** = กลุ่มรุ่น / ซีรีส์ (เช่น "MCCB NF125", "KA Rotary Warning Light 5\"") 1 รูป 1 หน้าสินค้า
- **sku** = รหัสสั่งซื้อ 1 รายการ ที่ราคา 1 ราคา ถ้ารุ่นเดียวมีหลายราคา (2P/3P/4P, หลอดไส้/LED, แรงดันคอยล์)
  จะแยกเป็นหลาย SKU และใส่ความต่างไว้ใน `option`
- `list_price` = ราคาตั้งตามใบราคา (บาท) ส่วนใหญ่ **ยังไม่รวม VAT** · ถ้าใบราคาเขียน "สอบถามราคา / เลิกผลิต"
  → `list_price` ว่าง และข้อความอยู่ใน `price_note`
- `discount_pct`, `net_price` = ช่องส่วนลด/ราคาสุทธิ — **ใบราคาชุดนี้ไม่มีส่วนลดระบุไว้เลย จึงว่างทั้งหมด**
  เตรียมไว้ให้กรอกเองภายหลัง
- `image_quality` = `high` (ด้านสั้น ≥ 260px) · `medium` (150–259px) · `low` (เล็ก/เบลอ ไม่แสดงบนเว็บ) · `none`
  รูป `low` เก็บไว้ที่ `images/lowres/` (คอลัมน์ `low_res_image`) เพื่อให้รู้ว่าต้องหารูปใหม่
- `image_shared = 1` = ใช้รูปของรุ่นพี่น้องในซีรีส์เดียวกัน (เช่น E2E หลายรุ่นใช้รูปเดียวกัน)
- รุ่นเดียวกันอยู่หลายใบราคา → ใช้ **ใบราคาที่ใหม่สุด** ราคาเก่าเก็บไว้ใน `price_history`

## ตัวอย่าง SQL

```sql
-- ราคาเบรกเกอร์ Mitsubishi ทั้งหมด
SELECT model, option, list_price FROM v_sku_full
WHERE brand='MITSUBISHI ELECTRIC' AND category_en='Circuit Breakers' ORDER BY model;

-- ค้นหารุ่น
SELECT * FROM v_sku_full WHERE replace(model,'-','') LIKE '%MY2N%';

-- ใส่ส่วนลด 15% ให้ทั้งแบรนด์
UPDATE skus SET discount_pct=15, net_price=round(list_price*0.85,2)
WHERE product_id IN (SELECT id FROM products WHERE brand_id=(SELECT id FROM brands WHERE name='OMRON'));
```

## ข้อควรรู้
- ราคาอ่านจากใบราคา PDF/ภาพสแกน ตรวจสุ่ม 60 รายการทุกเล่มตรงทั้งหมด แต่ก่อนเสนอราคาลูกค้าควรเทียบกับใบราคาจริงอีกครั้ง
- Shinohawa หน้า 7–9 และ 69–99 ไฟล์ต้นฉบับเสีย (ข้อมูลว่าง) จึงยังไม่มีในฐานข้อมูล
- รูปจาก Shinohawa มีลายน้ำ "SHINOHAWA" ติดมาจากแคตตาล็อกต้นฉบับ

## สายไฟ YAZAKI (เพิ่ม 19 ต.ค. 2569)
- ที่มา: `yazaki pricelist.pdf` (Thai-Yazaki Electric Wire, ใบราคาไม่พิมพ์วันที่ → ใช้วันที่ไฟล์ 2024-06-24, source id `yz`)
- 37 รุ่น (1 หน้า = 1 รุ่น) · 1,638 SKU (1 SKU = 1 ขนาด × จำนวนแกน) · ราคา = บาท/เมตร (`unit` = เมตร) มีราคา 780 SKU
- หมวดย่อย: สายไฟฟ้าสำหรับอาคาร / สายไฟฟ้ากำลังแรงต่ำ / สายคอนโทรล / แรงสูง MV / แรงสูงพิเศษ HV / สายทนไฟ-หน่วงไฟ LSZH
- สายทนไฟ/หน่วงไฟ (13 รุ่น) และ 69/115 kV ใบราคาไม่มีราคา → `price_note` = "สนใจติดต่อฝ่ายขาย หรือตัวแทนจำหน่าย"
- ช่องที่ใบราคาถมดำ (ไม่มีขนาดนั้น) ไม่สร้าง SKU และแสดงเป็นขีดในตาราง
- `products.spec_sheet_json` = { subtitle, structure[[k,v]], technical[[k,v]], app_th[], app_en, section, price_note, tables[{rk,ck,cols,rows:[[label,[sku_id|"x"]]]}] }
- รูป: วาดใหม่จากเวกเตอร์ในไฟล์ PDF ที่ 576 dpi → `images/products/yazaki-*.webp` (คมทุกขนาดจอ)
