import fs from 'fs';
import path from 'path';
import { initDatabase, saveProductToPostgres, getProductsCount, pool } from '../src/server/db/postgres';
import { Product } from '../src/types';

const JSON_FILE = path.resolve(process.cwd(), 'src/data/scrapedProducts.json');

async function main() {
  console.log('====================================================');
  console.log('   POSTGRESQL MİGRASYON MOTORU (NEYİN NESİ PRO)');
  console.log('====================================================\n');

  // 1. Şemayı ve tabloları oluştur
  console.log('[1/3] PostgreSQL tabloları ve indeksleri hazırlanıyor...');
  try {
    await initDatabase();
    console.log('✓ Tablolar (products, price_offers, price_history, spec_items, product_gallery) hazırlandı.');
  } catch (err: any) {
    console.error('✗ Tablo oluşturma hatası:', err.message);
    process.exit(1);
  }

  // 2. Mevcut JSON verilerini oku
  if (!fs.existsSync(JSON_FILE)) {
    console.error('✗ Kaynak JSON dosyası bulunamadı:', JSON_FILE);
    process.exit(1);
  }

  const rawProducts: Product[] = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  console.log(`\n[2/3] ${rawProducts.length} adet doğrulanmış ürün PostgreSQL'e aktarılıyor...`);

  let count = 0;
  for (const prod of rawProducts) {
    try {
      await saveProductToPostgres(prod);
      count++;
      if (count % 50 === 0 || count === rawProducts.length) {
        console.log(`  ✓ [${count}/${rawProducts.length}] ${prod.fullName.slice(0, 45)}...`);
      }
    } catch (err: any) {
      console.error(`  ✗ [HATA] ${prod.fullName}:`, err.message);
    }
  }

  // 3. Doğrulama ve Rapor
  const totalInDb = await getProductsCount();
  console.log('\n====================================================');
  console.log(`[MİGRASYON TAMAMLANDI]`);
  console.log(`- Aktarılan Ürün Sayısı: ${count}`);
  console.log(`- PostgreSQL Toplam Kayıt: ${totalInDb}`);
  console.log('====================================================\n');

  await pool.end();
}

main().catch(err => {
  console.error('[GENEL HATA]', err);
  process.exit(1);
});
