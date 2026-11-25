import fs from 'fs';
import path from 'path';
import { Product } from '../src/types';
import { pool, initDatabase, saveProductToPostgres } from '../src/server/db/postgres';

const FILE = path.resolve(process.cwd(), 'src/data/scrapedProducts.json');

async function main() {
  console.log('====================================================');
  console.log('   TÜM ÜRÜNLERİ POSTGRESQL VERİTABANINA KALICI AKTARIM');
  console.log('====================================================\n');

  if (!fs.existsSync(FILE)) {
    console.error('Hata: scrapedProducts.json dosyası bulunamadı!');
    process.exit(1);
  }

  // 1. Şemayı başlat
  console.log('[1/3] Veritabanı tabloları doğrulanıyor...');
  await initDatabase();
  console.log('✓ Tablolar ve indeksler hazır.\n');

  // 2. Ürünleri yükle
  const raw = fs.readFileSync(FILE, 'utf-8');
  const products: Product[] = JSON.parse(raw);
  console.log(`[2/3] Toplam ${products.length} master ürün belleğe alındı.`);

  // 3. PostgreSQL'e tek tek upsert et
  console.log('[3/3] PostgreSQL veritabanına kalıcı kayıt başlatılıyor...');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    try {
      await saveProductToPostgres(prod);
      successCount++;
      if ((i + 1) % 250 === 0 || i === products.length - 1) {
        console.log(`-> ${i + 1}/${products.length} ürün işlendi (%${Math.round(((i + 1) / products.length) * 100)})`);
      }
    } catch (err: any) {
      errorCount++;
      // Hata detayını ilk birkaç tanede göster
      if (errorCount <= 3) {
        console.warn(`Uyarı [${prod.id}]:`, err.message);
      }
    }
  }

  // 4. Sonuç sayımı
  const pCount = await pool.query('SELECT COUNT(*) FROM products');
  const oCount = await pool.query('SELECT COUNT(*) FROM price_offers');
  const hCount = await pool.query('SELECT COUNT(*) FROM price_history');
  const sCount = await pool.query('SELECT COUNT(*) FROM spec_items');

  console.log('\n====================================================');
  console.log('🎉 VERİTABANI TAMAMLAMA VE KALICILIK İŞLEMİ BİTTİ!');
  console.log(`- Başarıyla Kaydedilen Ürün: ${successCount}`);
  if (errorCount > 0) console.log(`- Atlanan / Hatalı Kayıt: ${errorCount}`);
  console.log('\n--- GÜNCEL POSTGRESQL VERİTABANI İSTATİSTİKLERİ ---');
  console.log(`- Toplam Ürün Sayısı: ${pCount.rows[0].count}`);
  console.log(`- Canlı Mağaza Teklifi Sayısı: ${oCount.rows[0].count}`);
  console.log(`- Fiyat Geçmişi Veri Noktası: ${hCount.rows[0].count}`);
  console.log(`- Doğrulanmış Teknik Özellik Satırı: ${sCount.rows[0].count}`);
  console.log('====================================================\n');

  await pool.end();
}

main().catch(console.error);
