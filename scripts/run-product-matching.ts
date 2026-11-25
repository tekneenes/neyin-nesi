import fs from 'fs';
import path from 'path';
import { clusterAndMergeProducts } from '../src/server/scraper/matching/productMatcher';
import { saveProductToPostgres } from '../src/server/db/postgres';
import { Product } from '../src/types';

const FILE = path.resolve(process.cwd(), 'src/data/scrapedProducts.json');

async function main() {
  console.log('====================================================');
  console.log('   EPEY MASTER ÜRÜN EŞLEŞTİRME MOTORU (ADIM 2)');
  console.log('====================================================\n');

  const rawProducts: Product[] = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  console.log(`[BAŞLANGIÇ] Toplam ${rawProducts.length} ham ürün inceleniyor...`);

  const { mergedProducts, totalClusters, multiStoreClusters } = clusterAndMergeProducts(rawProducts);

  console.log(`✓ Kümeleme Tamamlandı:`);
  console.log(`  - Tekil Ürün Kümesi (Master Products): ${totalClusters}`);
  console.log(`  - Birden Fazla Mağaza Teklifi Olan Ürünler: ${multiStoreClusters}`);
  console.log(`  - Düzenlenen Katalog Boyutu: ${mergedProducts.length}`);

  // Display multi-store matched products
  console.log('\n--- BİRDEN FAZLA MAĞAZADA EŞLEŞEN GERÇEK ÜRÜNLER ---');
  let shown = 0;
  for (const p of mergedProducts) {
    if (p.offers.length > 1) {
      shown++;
      console.log(`\n${shown}. [MASTER ÜRÜN] ${p.fullName}`);
      console.log(`   En Uygun: ${p.currentBestPrice} TL | Mağaza Sayısı: ${p.offers.length}`);
      p.offers.forEach((o, i) => {
        console.log(`     └─ Mağaza ${i + 1}: ${o.sellerName} -> ${o.price} TL ${i === 0 ? '🏆 (EN UCUZ)' : ''}`);
      });
      if (p.priceRange) {
        const diff = p.priceRange.max - p.priceRange.min;
        console.log(`     💰 Tasarruf Fırsatı: ${diff.toLocaleString('tr-TR')} TL Fark!`);
      }
    }
  }

  // Save merged catalog to JSON
  fs.writeFileSync(FILE, JSON.stringify(mergedProducts, null, 2), 'utf-8');
  console.log(`\n✓ Dosya güncellendi: ${FILE}`);

  // Sync multi-store products to PostgreSQL
  console.log('[PostgreSQL Senkronizasyonu] Eşleşen ürünler PostgreSQL veritabanına aktarılıyor...');
  let pgCount = 0;
  for (const p of mergedProducts) {
    try {
      await saveProductToPostgres(p);
      pgCount++;
    } catch {}
  }
  console.log(`✓ PostgreSQL veritabanında ${pgCount} ana ürün başarıyla güncellendi.`);
  console.log('\n====================================================');
  console.log('   EŞLEŞTİRME VE MAĞAZA BİRLEŞTİRME TAMAMLANDI');
  console.log('====================================================\n');
}

main().catch(console.error);
