import https from 'https';
import zlib from 'zlib';
import readline from 'readline';
import { pool } from '../src/server/db/postgres';

function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

// 1. Icecat Resmi Marka Sözlüğü İndir
async function fetchIcecatSuppliers(): Promise<Map<string, string>> {
  console.log('[1/4] Icecat resmi marka referans listesi indiriliyor...');
  const username = process.env.ICECAT_USERNAME || 'muhammed1258';
  const password = process.env.ICECAT_PASSWORD || 'Mami4958';
  const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  const url = 'https://data.icecat.biz/export/freexml/refs/SuppliersList.xml.gz';

  return new Promise((resolve) => {
    https.get(url, { headers: { Authorization: auth } }, (res) => {
      const gunzip = zlib.createGunzip();
      res.pipe(gunzip);
      const rl = readline.createInterface({ input: gunzip });
      const map = new Map<string, string>();

      rl.on('line', (line) => {
        if (line.includes('<Supplier ID="')) {
          const idMatch = line.match(/ID="([^"]+)"/);
          const nameMatch = line.match(/Name="([^"]+)"/);
          if (idMatch && nameMatch) {
            map.set(idMatch[1], nameMatch[1]);
          }
        }
      });

      rl.on('close', () => {
        console.log(`✓ ${map.size} adet resmi marka sözlüğü belleğe alındı.`);
        resolve(map);
      });
    });
  });
}

// 2. Kategori Çıkarım Kuralları
function inferCategory(fullName: string, model: string): { slug: string; name: string } | null {
  const text = `${fullName} ${model}`.toLowerCase();

  // Bilgisayar & Laptop
  if (/laptop|notebook|macbook|thinkpad|zenbook|ideapad|pavilion|yoga|victus|legion|omen|tuf gaming|rog zephyrus|blade 15|aspire|vivobook|expertbook|latitude|vostro|precision/.test(text)) {
    return { slug: 'dizustu-bilgisayarlar', name: 'Dizüstü Bilgisayarlar' };
  }

  // Akıllı Telefonlar
  if (/smartphone|galaxy s|galaxy z|galaxy a|iphone|redmi|poco|pixel [0-9]|xperia|oneplus|realme|infinix|tecno/.test(text) && !/kılıf|case|cam|screen protector|cable/.test(text)) {
    return { slug: 'telefonlar', name: 'Akıllı Telefonlar' };
  }

  // Tabletler
  if (/ipad|galaxy tab|mediapad|matepad|lenovo tab|surface pro|tablet/.test(text) && !/kılıf|case|cover/.test(text)) {
    return { slug: 'tabletler', name: 'Tablet & E-Kitap' };
  }

  // Monitörler
  if (/monitör|monitor|curved display|oled display|gaming display|4k uhd monitor|qhd monitor|ips panel|fast ips/.test(text) && !/kolu|arm|mount|stand/.test(text)) {
    return { slug: 'monitorler', name: 'Monitörler' };
  }

  // Kulaklıklar
  if (/kulaklık|headphone|earphone|headset|earbud|airpods|galaxy buds|freebuds|tws|anc|over-ear|in-ear/.test(text)) {
    return { slug: 'kulakliklar', name: 'Kulaklıklar' };
  }

  // Akıllı Saatler
  if (/akıllı saat|smartwatch|apple watch|galaxy watch|fitbit|garmin|huawei watch|amazfit|smart band/.test(text)) {
    return { slug: 'akilli-saatler', name: 'Akıllı Saatler' };
  }

  // Bilgisayar Parçaları (Donanım)
  if (/geforce rtx|radeon rx|ekran kartı|graphics card|motherboard|anakart|intel core|amd ryzen|processor|işlemci|ddr4|ddr5|nvme m\.2|ssd |hard drive|power supply|psu|sıvı soğutma|liquid cooler/.test(text)) {
    return { slug: 'bilgisayar-parcalari', name: 'Bilgisayar Parçaları' };
  }

  // Çevre Birimleri & Aksesuarlar
  if (/klavye|keyboard|mouse|fare|mousepad|webcam|kamera|usb-c hub|docking station|adaptör|adapter|şarj aleti|charger|powerbank|kablo|cable|hdmi|type-c/.test(text)) {
    return { slug: 'aksesuarlar', name: 'Aksesuarlar & Çevre Birimleri' };
  }

  // Beyaz Eşya & Ankastre
  if (/buzdolabı|refrigerator|çamaşır makinesi|washing machine|bulaşık makinesi|dishwasher|kurutma makinesi|fırın|oven|ankastre|ocak|davlumbaz|klima|air conditioner/.test(text)) {
    return { slug: 'beyaz-esya-ankastre', name: 'Beyaz Eşya & Ankastre' };
  }

  // Televizyonlar
  if (/televizyon|smart tv|oled tv|qled tv|4k tv|android tv|google tv|webos tv/.test(text)) {
    return { slug: 'televizyonlar', name: 'Televizyonlar' };
  }

  return null;
}

// 3. Bilinen Marka Çıkarım Listesi
const KNOWN_BRANDS = [
  'Apple', 'Samsung', 'HP', 'Lenovo', 'Dell', 'Asus', 'Acer', 'Philips', 'LG',
  'Sony', 'Xiaomi', 'Logitech', 'Kingston', 'Corsair', 'MSI', 'Gigabyte',
  'Intel', 'AMD', 'Canon', 'Epson', 'Brother', 'Toshiba', 'Huawei', 'Siemens',
  'Bosch', 'Arçelik', 'Beko', 'Vestel', 'Regal', 'Smeg', 'Liebherr', 'Franke',
  'JBL', 'Sennheiser', 'Bose', 'Razer', 'SteelSeries', 'Western Digital', 'Seagate',
  'BenQ', 'ViewSonic', 'TP-Link', 'Netgear', 'Synology', 'QNAP', 'Belkin', 'Anker',
  'Zyxel', 'Crucial', 'G.Skill', 'Thermaltake', 'Cooler Master', 'DeepCool', 'Noctua',
  'Zotac', 'Palit', 'Gainward', 'Inno3D', 'Sapphire', 'XFX', 'PowerColor', 'Honor',
  'Realme', 'Oppo', 'Vivo', 'Google', 'Nothing', 'TCL', 'Hisense', 'Grundig', 'Profilo'
];

function extractBrand(text: string): string | null {
  const tLower = ` ${text.toLowerCase()} `;
  for (const b of KNOWN_BRANDS) {
    const bLower = ` ${b.toLowerCase()} `;
    if (tLower.includes(bLower)) {
      return b;
    }
  }
  return null;
}

async function runNormalization() {
  console.log('================================================================');
  console.log('   VERİTABANI İLİŞKİ KONTROLÜ, NORMALİZASYON & MARKA TEMİZLİĞİ ');
  console.log('================================================================\n');

  const client = await pool.connect();

  try {
    // A. "diger" veya hatalı kategoride kalmış ürünleri analiz et ve düzelt
    console.log('[2/4] Belirsiz veya "diger" kategorisindeki ürünler analiz ediliyor...');

    const sampleDiger = await client.query(
      `SELECT id, full_name, model, brand, barcode FROM products WHERE category_slug = 'diger' LIMIT 100000`
    );

    console.log(`  -> İncelenen "diger" kategori adedi: ${sampleDiger.rows.length}`);
    let reclassifiedCount = 0;
    let brandFixedCount = 0;

    await client.query('BEGIN');

    for (const r of sampleDiger.rows) {
      const detectedCat = inferCategory(r.full_name, r.model);
      const detectedBrand = extractBrand(r.full_name) || extractBrand(r.model);

      if (detectedCat || (detectedBrand && r.brand === r.model)) {
        const newCatSlug = detectedCat ? detectedCat.slug : null;
        const newCatName = detectedCat ? detectedCat.name : null;
        const newBrand = detectedBrand || r.brand;
        const newBrandSlug = cleanSlug(newBrand);

        let updateSql = `UPDATE products SET `;
        const params: any[] = [];
        let pIdx = 1;

        if (detectedCat) {
          updateSql += `category_slug = $${pIdx++}, category_name = $${pIdx++}, `;
          params.push(newCatSlug, newCatName);
          reclassifiedCount++;
        }

        if (detectedBrand && r.brand === r.model) {
          updateSql += `brand = $${pIdx++}, brand_slug = $${pIdx++}, `;
          params.push(newBrand, newBrandSlug);
          brandFixedCount++;
        }

        updateSql += `updated_at = CURRENT_TIMESTAMP WHERE id = $${pIdx}`;
        params.push(r.id);

        await client.query(updateSql, params);
      }
    }

    await client.query('COMMIT');
    console.log(`✓ Kategori Düzeltilen: ${reclassifiedCount} | Markası Ayrıştırılan: ${brandFixedCount}`);

    // B. Marka = Model olan (model kodunu marka sanmış) hatalı kayıtları düzelt
    console.log('\n[3/4] Marka adı model koduyla karışmış kayıtlar düzeltiliyor...');
    await client.query('BEGIN');

    const brandFixRes = await client.query(`
      UPDATE products 
      SET 
        brand = CASE 
          WHEN full_name ILIKE '%philips%' OR model ILIKE '%philips%' OR id ILIKE '%philips%' THEN 'Philips'
          WHEN full_name ILIKE '%samsung%' OR model ILIKE '%samsung%' THEN 'Samsung'
          WHEN full_name ILIKE '%apple%' OR model ILIKE '%apple%' THEN 'Apple'
          WHEN full_name ILIKE '%hp %' OR full_name ILIKE '%hewlett%' OR model ILIKE '%hp %' THEN 'HP'
          WHEN full_name ILIKE '%lenovo%' OR model ILIKE '%lenovo%' THEN 'Lenovo'
          WHEN full_name ILIKE '%dell%' OR model ILIKE '%dell%' THEN 'Dell'
          WHEN full_name ILIKE '%asus%' OR model ILIKE '%asus%' THEN 'Asus'
          WHEN full_name ILIKE '%acer%' OR model ILIKE '%acer%' THEN 'Acer'
          WHEN full_name ILIKE '%logitech%' OR model ILIKE '%logitech%' THEN 'Logitech'
          WHEN full_name ILIKE '%sony%' OR model ILIKE '%sony%' THEN 'Sony'
          WHEN full_name ILIKE '%kingston%' OR model ILIKE '%kingston%' THEN 'Kingston'
          WHEN full_name ILIKE '%lg %' OR full_name ILIKE '% lg%' THEN 'LG'
          WHEN full_name ILIKE '%canon%' THEN 'Canon'
          WHEN full_name ILIKE '%epson%' THEN 'Epson'
          WHEN full_name ILIKE '%cisco%' THEN 'Cisco'
          WHEN full_name ILIKE '%intel%' THEN 'Intel'
          WHEN full_name ILIKE '%amd%' THEN 'AMD'
          WHEN full_name ILIKE '%msi%' THEN 'MSI'
          WHEN full_name ILIKE '%gigabyte%' THEN 'Gigabyte'
          WHEN full_name ILIKE '%tp-link%' OR model ILIKE '%tp-link%' THEN 'TP-Link'
          WHEN full_name ILIKE '%arçelik%' OR model ILIKE '%arçelik%' THEN 'Arçelik'
          WHEN full_name ILIKE '%beko%' OR model ILIKE '%beko%' THEN 'Beko'
          WHEN full_name ILIKE '%vestel%' OR model ILIKE '%vestel%' THEN 'Vestel'
          WHEN full_name ILIKE '%bosch%' OR model ILIKE '%bosch%' THEN 'Bosch'
          WHEN full_name ILIKE '%siemens%' OR model ILIKE '%siemens%' THEN 'Siemens'
          ELSE brand
        END,
        brand_slug = LOWER(REGEXP_REPLACE(
          CASE 
            WHEN full_name ILIKE '%philips%' OR model ILIKE '%philips%' THEN 'philips'
            WHEN full_name ILIKE '%samsung%' OR model ILIKE '%samsung%' THEN 'samsung'
            WHEN full_name ILIKE '%apple%' OR model ILIKE '%apple%' THEN 'apple'
            WHEN full_name ILIKE '%hp %' OR model ILIKE '%hp %' THEN 'hp'
            WHEN full_name ILIKE '%lenovo%' OR model ILIKE '%lenovo%' THEN 'lenovo'
            WHEN full_name ILIKE '%dell%' OR model ILIKE '%dell%' THEN 'dell'
            WHEN full_name ILIKE '%asus%' OR model ILIKE '%asus%' THEN 'asus'
            WHEN full_name ILIKE '%acer%' OR model ILIKE '%acer%' THEN 'acer'
            WHEN full_name ILIKE '%logitech%' OR model ILIKE '%logitech%' THEN 'logitech'
            WHEN full_name ILIKE '%sony%' OR model ILIKE '%sony%' THEN 'sony'
            WHEN full_name ILIKE '%kingston%' OR model ILIKE '%kingston%' THEN 'kingston'
            WHEN full_name ILIKE '%lg %' OR full_name ILIKE '% lg%' THEN 'lg'
            ELSE brand_slug
          END, '[^a-z0-9]+', '-', 'g'))
      WHERE brand = model OR brand ILIKE '%/%' OR brand ILIKE '%-%';
    `);

    await client.query('COMMIT');
    console.log(`✓ Marka temizliği tamamlandı! Güncellenen kayıt: ${brandFixRes.rowCount}`);

    // C. Marka / Filtreleme Tablosunu Normalize Et (brands tablosu oluştur veya doldur)
    console.log('\n[4/4] Filtreleme ve arama için normalize `brands` tablosu indeksleniyor...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) UNIQUE NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        product_count INT DEFAULT 0,
        logo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
    `);

    await client.query(`
      INSERT INTO brands (name, slug, product_count)
      SELECT 
        brand as name,
        brand_slug as slug,
        count(*) as product_count
      FROM products
      WHERE brand IS NOT NULL AND brand != '' AND length(brand) < 80 AND brand NOT LIKE '%/%'
      GROUP BY brand, brand_slug
      ON CONFLICT (slug) DO UPDATE SET
        product_count = EXCLUDED.product_count,
        name = EXCLUDED.name;
    `);

    const topBrands = await client.query(
      `SELECT name, product_count FROM brands ORDER BY product_count DESC LIMIT 10`
    );

    console.log('\n--- EN BÜYÜK NORMALİZE MARKALAR ---');
    for (const b of topBrands.rows) {
      console.log(`  * ${b.name}: ${b.product_count} ürün`);
    }

    console.log('\n================================================================');
    console.log('🎉 NORMALİZASYON VE İLİŞKİ KONTROLÜ BAŞARIYLA TAMAMLANDI!');
    console.log('================================================================\n');

  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Kritik Hata:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runNormalization();
