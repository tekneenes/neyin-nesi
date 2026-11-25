import { pool } from '../src/server/db/postgres';

interface PriceDropEvent {
  productId: string;
  productName: string;
  sellerName: string;
  oldPrice: number;
  newPrice: number;
  dropAmount: number;
  dropPercentage: number;
}

export async function runPriceTrackerCron() {
  console.log('====================================================');
  console.log('   EPEY TARZI OTOMATİK FİYAT TAKİP CRON BOTU (ADIM 4)');
  console.log('====================================================');
  console.log(`[ZAMAN DAMGASI] ${new Date().toLocaleString('tr-TR')}`);

  // Doğrudan PostgreSQL'den ürünleri ve teklifleri çek (JSON dosyası gerekmez)
  const productsRes = await pool.query('SELECT id, full_name, current_best_price FROM products');
  const offersRes = await pool.query('SELECT product_id, seller_name, price FROM price_offers ORDER BY price ASC');

  console.log(`[TARAMA BAŞLADI] PostgreSQL'deki ${productsRes.rows.length} ana ürün taranıyor...`);

  const offersMap = new Map<string, Array<{ sellerName: string; price: number }>>();
  for (const o of offersRes.rows) {
    if (!offersMap.has(o.product_id)) offersMap.set(o.product_id, []);
    offersMap.get(o.product_id)!.push({
      sellerName: o.seller_name,
      price: parseFloat(o.price),
    });
  }

  const detectedDrops: PriceDropEvent[] = [];
  let updatedPricesCount = 0;
  const todayStr = new Date().toISOString().split('T')[0];

  for (const product of productsRes.rows) {
    const offers = offersMap.get(product.id);
    if (!offers || offers.length === 0) continue;

    const bestOffer = offers[0];

    // Çoklu satıcı arasındaki fiyat farkı / fırsat tespiti
    if (offers.length > 1) {
      const highestOffer = offers[offers.length - 1];
      const dropAmount = highestOffer.price - bestOffer.price;
      if (dropAmount > 0) {
        const dropPct = Math.round((dropAmount / highestOffer.price) * 100);
        detectedDrops.push({
          productId: product.id,
          productName: product.full_name,
          sellerName: bestOffer.sellerName,
          oldPrice: highestOffer.price,
          newPrice: bestOffer.price,
          dropAmount,
          dropPercentage: dropPct,
        });

        // price_drop_alerts tablosuna kaydet
        try {
          await pool.query(
            `INSERT INTO price_drop_alerts 
             (product_id, seller_name, previous_price, current_price, drop_amount, drop_percentage)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [product.id, bestOffer.sellerName, highestOffer.price, bestOffer.price, dropAmount, dropPct]
          );
        } catch {}
      }
    }

    // Bugünün fiyat noktasını price_history'ye kaydet
    try {
      await pool.query(
        `INSERT INTO price_history (product_id, recorded_date, price)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, recorded_date) 
         DO UPDATE SET price = EXCLUDED.price`,
        [product.id, todayStr, bestOffer.price]
      );
      updatedPricesCount++;
    } catch {}

    // Güncel en iyi fiyatı güncelle
    try {
      await pool.query(
        `UPDATE products SET current_best_price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [bestOffer.price, product.id]
      );
    } catch {}
  }

  // Özet Rapor
  console.log('\n--- CRON ÇALIŞMA RAPORU ---');
  console.log(`✓ Kaydedilen Günlük Fiyat Noktası: ${updatedPricesCount}`);
  console.log(`✓ Tespit Edilen Fırsat / Fiyat Farkı: ${detectedDrops.length} ürün`);

  if (detectedDrops.length > 0) {
    console.log('\n--- ÖNE ÇIKAN EN YÜKSEK FİYAT AVANTAJLARI ---');
    detectedDrops.sort((a, b) => b.dropAmount - a.dropAmount);
    detectedDrops.slice(0, 5).forEach((drop, idx) => {
      console.log(
        `${idx + 1}. ${drop.productName.slice(0, 50)}...`
      );
      console.log(
        `   En Ucuz Satıcı: ${drop.sellerName} (${drop.newPrice.toLocaleString('tr-TR')} TL)`
      );
      console.log(
        `   Piyasa Fiyatı: ${drop.oldPrice.toLocaleString('tr-TR')} TL -> Net Tasarruf: ${drop.dropAmount.toLocaleString('tr-TR')} TL (%${drop.dropPercentage} İndirim!)`
      );
    });
  }

  // Veritabanı İstatistikleri
  const stats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM products) as total_products,
      (SELECT COUNT(*) FROM price_offers) as total_offers,
      (SELECT COUNT(*) FROM price_history) as total_history_points,
      (SELECT COUNT(*) FROM price_drop_alerts) as total_alerts
  `);
  console.log('\n--- POSTGRESQL VERİTABANI İSTATİSTİKLERİ ---');
  console.log(`- Toplam Ürün: ${stats.rows[0].total_products}`);
  console.log(`- Canlı Mağaza Teklifi: ${stats.rows[0].total_offers}`);
  console.log(`- Fiyat Geçmişi Noktası: ${stats.rows[0].total_history_points}`);
  console.log(`- Kayıtlı Fiyat Alarmı: ${stats.rows[0].total_alerts}`);

  console.log('\n====================================================');
  console.log('   CRON FİYAT GÜNCELLEMESİ BAŞARIYLA TAMAMLANDI');
  console.log('====================================================\n');
}

runPriceTrackerCron()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Cron Bot Hatası:', err);
    process.exit(1);
  });
