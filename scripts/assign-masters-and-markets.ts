import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://muhammed:@localhost:5432/neyinnesi',
  max: 10,
});

async function run() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('   NEYİNNESİ - ULTRA HIZLI MASTER ÜRÜN & BÖLGESEL PAZAR MOTORU');
  console.log('════════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();
  const client = await pool.connect();

  try {
    // 1. ADIM: Yinelenen modelleri temp tabloya çıkar (77.158 model)
    console.log('[1/4] Yinelenen model grupları taranıyor...');
    await client.query(`
      CREATE TEMP TABLE dup_models AS
      SELECT brand, model
      FROM products
      GROUP BY brand, model
      HAVING count(*) > 1;
      CREATE INDEX idx_temp_dup ON dup_models(brand, model);
    `);
    const dupCount = await client.query('SELECT count(*) FROM dup_models');
    console.log(`✓ ${parseInt(dupCount.rows[0].count, 10).toLocaleString('tr-TR')} adet mükerrer model grubu indekslendi.`);

    // 2. ADIM: Mükerrer modellerin master ve varyant eşleşmelerini temp tabloda sırala
    console.log('\n[2/4] Master ve varyant eşleşmeleri hesaplanıyor...');
    await client.query(`
      CREATE TEMP TABLE variant_map AS
      WITH ranked AS (
        SELECT 
          p.id,
          FIRST_VALUE(p.id) OVER (
            PARTITION BY p.brand, p.model 
            ORDER BY 
              CASE WHEN p.barcode LIKE '869%' THEN 0 ELSE 1 END,
              CASE WHEN p.hero_image LIKE '%icecat.biz%' THEN 0 ELSE 1 END,
              p.overall_trust_score DESC,
              p.id ASC
          ) as canonical_master_id,
          ROW_NUMBER() OVER (
            PARTITION BY p.brand, p.model 
            ORDER BY 
              CASE WHEN p.barcode LIKE '869%' THEN 0 ELSE 1 END,
              CASE WHEN p.hero_image LIKE '%icecat.biz%' THEN 0 ELSE 1 END,
              p.overall_trust_score DESC,
              p.id ASC
          ) as rn
        FROM products p
        JOIN dup_models d ON p.brand = d.brand AND p.model = d.model
      )
      SELECT id, canonical_master_id, (rn = 1) as is_master
      FROM ranked;
      CREATE INDEX idx_temp_vmap ON variant_map(id);
    `);
    const varCount = await client.query('SELECT count(*) FROM variant_map');
    console.log(`✓ ${parseInt(varCount.rows[0].count, 10).toLocaleString('tr-TR')} ürünün varyant hiyerarşisi hazırlandı.`);

    // 3. ADIM: İndeksli UPDATE ile tek seferde ana tabloya yaz
    console.log('\n[3/4] Ana tabloya master ve varyant bağları yazılıyor...');
    const updateRes = await client.query(`
      UPDATE products p
      SET 
        master_id = v.canonical_master_id,
        is_master = v.is_master
      FROM variant_map v
      WHERE p.id = v.id;
    `);
    console.log(`✓ ${updateRes.rowCount?.toLocaleString('tr-TR')} ürün başarıyla master/varyant olarak bağlandı.`);

    // Kalan tekil ürünleri kendi master'ı yap
    const singleRes = await client.query(`
      UPDATE products
      SET master_id = id, is_master = TRUE
      WHERE master_id IS NULL;
    `);
    console.log(`✓ ${singleRes.rowCount?.toLocaleString('tr-TR')} adet tekil ürün ana model olarak onaylandı.`);

    // 4. ADIM: Bölgesel Pazar, Klavye ve Donanım Çıkarımı
    console.log('\n[4/4] Bölgesel pazar etiketleri ve klavye düzenleri atanıyor...');

    // TR Pazarı (869 barkod veya Türkiye ifadeleri)
    const trRes = await client.query(`
      UPDATE products
      SET 
        market_region = 'TR',
        market_name = 'Türkiye Pazarı',
        keyboard_layout = 'Türkçe Q',
        plug_type = 'Tip C/F (Standart TR/AB)',
        warranty_badge = '2 Yıl Resmi Distribütör Garantili',
        supported_languages = ARRAY['Türkçe', 'İngilizce']
      WHERE barcode LIKE '869%' 
         OR full_name ILIKE '% türkiye%' 
         OR full_name ILIKE '% turkish%' 
         OR full_name ILIKE '% türkçe%'
         OR model ILIKE '% tr %'
         OR model ILIKE '% tr/%';
    `);
    console.log(`  ✓ TR Pazarı (Resmi TR Distribütör): ${trRes.rowCount?.toLocaleString('tr-TR')} ürün`);

    // US Pazarı (00-13 barkod veya US geçenler)
    const usRes = await client.query(`
      UPDATE products
      SET 
        market_region = 'US',
        market_name = 'Kuzey Amerika (ABD)',
        keyboard_layout = 'İngilizce (US ANSI)',
        plug_type = 'Tip A/B (110V ABD Priz)',
        warranty_badge = 'Uluslararası / İthalatçı Garantili',
        supported_languages = ARRAY['İngilizce', 'İspanyolca']
      WHERE (barcode ~ '^(00|01|06|07|08|09|10|11|12|13)' AND market_region != 'TR')
         OR full_name ILIKE '% us %' 
         OR full_name ILIKE '% usa%'
         OR model ILIKE '%(us)%';
    `);
    console.log(`  ✓ US Pazarı (Kuzey Amerika / ANSI): ${usRes.rowCount?.toLocaleString('tr-TR')} ürün`);

    // EU Pazarı (Avrupa Birliği)
    const euRes = await client.query(`
      UPDATE products
      SET 
        market_region = 'EU',
        market_name = 'Avrupa Birliği Pazarı',
        keyboard_layout = 'Avrupa Standardı QWERTZ/AZERTY',
        plug_type = 'Tip C/F (Standart TR/AB)',
        warranty_badge = 'İthalatçı / Uluslararası Garanti',
        supported_languages = ARRAY['İngilizce', 'Almanca', 'Fransızca']
      WHERE (barcode ~ '^(40|41|42|43|50|30|31|32|33|87)' AND market_region = 'GLOBAL')
         OR full_name ILIKE '% europe%' 
         OR full_name ILIKE '% eu %'
         OR full_name ILIKE '% de %';
    `);
    console.log(`  ✓ EU Pazarı (Avrupa Birliği): ${euRes.rowCount?.toLocaleString('tr-TR')} ürün`);

    // Telefonlar ve Tabletler için Sanal Klavye
    await client.query(`
      UPDATE products
      SET keyboard_layout = 'Sanal Ekran Klavyesi (Çoklu Dil)'
      WHERE category_slug IN ('telefonlar', 'tabletler', 'akilli-saatler');
    `);

    // Sayısal RAM Çıkarımı
    console.log('\n[RAM & Depolama Normalizasyonu]');
    for (const ram of [4, 8, 12, 16, 24, 32, 64, 128]) {
      const r = await client.query(`
        UPDATE products 
        SET ram_gb = $1
        WHERE ram_gb IS NULL AND (full_name ~* ('\\m' || $1 || '\\s*(gb|g)\\s*(ram|ddr|lpddr|bellek)?\\M') OR model ~* ('\\m' || $1 || '\\s*(gb|g)\\M'))
      `, [ram]);
      if (r.rowCount && r.rowCount > 0) {
        console.log(`  • ${ram} GB RAM: ${r.rowCount.toLocaleString('tr-TR')} ürün`);
      }
    }

    // Sayısal Depolama Çıkarımı
    const s512 = await client.query(`UPDATE products SET storage_gb = 512 WHERE storage_gb IS NULL AND (full_name ~* '\\m512\\s*(gb|g)\\M' OR model ~* '\\m512\\s*(gb|g)\\M');`);
    const s256 = await client.query(`UPDATE products SET storage_gb = 256 WHERE storage_gb IS NULL AND (full_name ~* '\\m256\\s*(gb|g)\\M' OR model ~* '\\m256\\s*(gb|g)\\M');`);
    const s1024 = await client.query(`UPDATE products SET storage_gb = 1024 WHERE storage_gb IS NULL AND (full_name ~* '\\m1\\s*(tb|t)\\M' OR model ~* '\\m1\\s*(tb|t)\\M');`);
    const s2048 = await client.query(`UPDATE products SET storage_gb = 2048 WHERE storage_gb IS NULL AND (full_name ~* '\\m2\\s*(tb|t)\\M' OR model ~* '\\m2\\s*(tb|t)\\M');`);
    console.log(`  • Depolama (SSD/ROM): 512GB (${s512.rowCount?.toLocaleString('tr-TR')}), 256GB (${s256.rowCount?.toLocaleString('tr-TR')}), 1TB (${s1024.rowCount?.toLocaleString('tr-TR')}), 2TB (${s2048.rowCount?.toLocaleString('tr-TR')})`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(`🎉 TÜM İŞLEMLER BAŞARIYLA TAMAMLANDI! (Toplam Süre: ${elapsed} saniye)`);
    console.log('════════════════════════════════════════════════════════════════');

    // Final Durum Özeti
    const masterStats = await client.query(`
      SELECT is_master, count(*) as count
      FROM products
      GROUP BY is_master
      ORDER BY is_master DESC
    `);
    console.log('\n📊 Master vs Varyant Durumu:');
    console.table(masterStats.rows);

    const marketStats = await client.query(`
      SELECT market_region, market_name, count(*) as count
      FROM products
      GROUP BY market_region, market_name
      ORDER BY count DESC
    `);
    console.log('\n🌍 Bölgesel Pazar Dağılımı:');
    console.table(marketStats.rows);

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('[HATA]:', err);
  process.exit(1);
});
