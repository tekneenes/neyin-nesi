import { pool } from '../src/server/db/postgres';
import { deepEnrichProductWith30Sites } from '../src/server/scraper/autonomous/deepEnricher30';
import { getHardwareStatus, enforceHardwareSafety, sleep } from '../src/server/scraper/hardware/hardwareWatchdog';

async function startWorker() {
  console.log(`\n==============================================================`);
  console.log(`🤖 [NEYİN NESİ?] 30-Site Otonom Derin Zenginleştirme Worker'ı`);
  console.log(`==============================================================`);

  const initialHw = getHardwareStatus();
  console.log(`🖥️ Başlangıç Donanım Durumu: CPU: ${initialHw.cpuTemp}°C | Boş RAM: ${initialHw.freeRamMB} MB`);

  let processedCount = 0;
  let successCount = 0;

  while (true) {
    try {
      // 1. Donanım Güvenlik Kontrolü
      await enforceHardwareSafety();

      // 2. Teknik özelliği eksik olan sıradaki ürünü çek (Öncelik: Barkodlu veya popüler olanlar)
      const res = await pool.query(`
        SELECT p.id, p.slug, p.brand, p.model, p.full_name, p.category_slug, p.barcode
        FROM products p
        LEFT JOIN (
          SELECT product_id, count(*) as spec_count 
          FROM spec_items 
          GROUP BY product_id
        ) sc ON sc.product_id = p.id
        WHERE (p.audit_status = 'review' OR p.audit_status IS NULL)
          AND (sc.spec_count IS NULL OR sc.spec_count = 0)
          AND p.full_name IS NOT NULL 
          AND length(trim(p.full_name)) > 3
        ORDER BY 
          CASE WHEN p.barcode IS NOT NULL AND p.barcode != '' THEN 0 ELSE 1 END,
          p.current_best_price DESC,
          p.id ASC
        LIMIT 1;
      `);

      if (res.rows.length === 0) {
        console.log(`ℹ️ [Kuyruk Boş] Zenginleştirilecek ürün kalmadı veya tüm ürünler tamamlandı. 30 sn bekleniyor...`);
        await sleep(30000);
        continue;
      }

      const product = res.rows[0];
      processedCount++;

      console.log(`\n--------------------------------------------------------------`);
      console.log(`[İşlem #${processedCount}] Ürün: "${product.full_name}" (ID: ${product.id})`);
      console.log(`--------------------------------------------------------------`);

      // 3. 30-Site Toplama & AI Zincirini Çalıştır
      const result = await deepEnrichProductWith30Sites(
        product.brand || '',
        product.model || product.full_name,
        product.full_name
      );

      if (!result || !result.specGroups || result.specGroups.length === 0) {
        console.warn(`⚠️ "${product.full_name}" için yeterli teknik veri sentezlenemedi.`);
        // Sürekli aynı ürüne takılmamak için not düşüp review olarak bırak
        await pool.query(
          `UPDATE products SET audit_notes = '30-Site aramasında yetersiz veri bulundu', updated_at = NOW() WHERE id = $1`,
          [product.id]
        );
        await sleep(5000);
        continue;
      }

      // 4. Veritabanına SpecGroups ve SpecItems Kaydet
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        for (let gIdx = 0; gIdx < result.specGroups.length; gIdx++) {
          const group = result.specGroups[gIdx];
          const groupTitle = group.title || 'Temel Özellikler';
          const groupId = `grp-${product.id}-${gIdx}`;

          // Grup oluştur / güncelle
          await client.query(
            `INSERT INTO spec_groups (id, title, sort_order) 
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title`,
            [groupId, groupTitle, gIdx]
          );

          // Kalemleri ekle
          if (Array.isArray(group.items)) {
            for (let iIdx = 0; iIdx < group.items.length; iIdx++) {
              const item = group.items[iIdx];
              const itemId = `spec-${product.id}-${gIdx}-${iIdx}`;
              const ver = item.verification || {};

              await client.query(
                `INSERT INTO spec_items (
                  id, product_id, spec_group_id, label, value, unit, is_key_highlight,
                  verification_level, verification_source, verified_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO UPDATE SET 
                  value = EXCLUDED.value,
                  verification_source = EXCLUDED.verification_source,
                  verified_at = EXCLUDED.verified_at`,
                [
                  itemId,
                  product.id,
                  groupId,
                  item.label,
                  item.value,
                  item.unit || null,
                  item.isKeyHighlight || false,
                  ver.level || 'verified_other',
                  ver.sourceName || 'Doğrulanmış Çoklu Web Kaynakları',
                  ver.verifiedAt || 'Bugün',
                ]
              );
            }
          }
        }

        // 5. Ürün Kartını Güncelle & Akıllı Onay Kararı Ver
        const isAutoApproved = result.suggestedTrustScore >= 85 && result.successfulSitesCount >= 4;
        const newStatus = isAutoApproved ? 'approved' : 'review';
        const note = isAutoApproved
          ? `✓ 30-Site AI zinciri tarafından ${result.successfulSitesCount} farklı siteden çapraz doğrulandı (Otomatik Onaylandı).`
          : `ℹ️ 30-Site AI zinciri tarafından ${result.successfulSitesCount} siteden veri çekildi. İnceleme bekliyor.`;

        await client.query(
          `UPDATE products SET 
            identity_summary = COALESCE(NULLIF($1, ''), identity_summary),
            target_audience = COALESCE(NULLIF($2, ''), target_audience),
            primary_strengths = $3,
            considerations = $4,
            overall_trust_score = $5,
            data_sources_count = GREATEST(data_sources_count, $6),
            audit_status = $7,
            audit_notes = $8,
            updated_at = NOW()
          WHERE id = $9`,
          [
            result.identitySummary,
            result.targetAudience,
            result.primaryStrengths,
            result.considerations,
            result.suggestedTrustScore,
            result.successfulSitesCount,
            newStatus,
            note,
            product.id,
          ]
        );

        await client.query('COMMIT');
        successCount++;
        console.log(`✅ [Kayıt Başarılı] "${product.full_name}" başarıyla zenginleştirildi -> Durum: ${newStatus.toUpperCase()}`);
      } catch (dbErr) {
        await client.query('ROLLBACK');
        console.error(`❌ DB Kayıt Hatası:`, dbErr);
      } finally {
        client.release();
      }

      // 6. RAM Boşaltma & Zorunlu Termal Soğuma Molası
      if (global.gc) {
        try {
          global.gc();
        } catch {}
      }

      const currentHw = getHardwareStatus();
      console.log(`📊 Donanım: CPU ${currentHw.cpuTemp}°C | Boş RAM: ${currentHw.freeRamMB} MB | Toplam Başarılı: ${successCount}`);

      // Her ürün sonrası fanın çalışıp işlemciyi soğutması için 6 saniye mola
      await sleep(6000);
    } catch (loopErr) {
      console.error(`💥 Worker döngü hatası:`, loopErr);
      await sleep(10000);
    }
  }
}

startWorker().catch((err) => {
  console.error('Fatal worker crash:', err);
  process.exit(1);
});
