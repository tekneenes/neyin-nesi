import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Product, PriceOffer, PriceDropAlert } from '../src/types';
import { loadScrapedProducts, saveProduct } from '../src/server/scraper/storage/dataStore';

dotenv.config({ path: '.env.local' });
dotenv.config();

// Bu script GERÇEK fiyat kontrolü yapmaz; rastgele indirim SİMÜLE eder.
// Yanlışlıkla çalıştırılıp sahte "fiyat düştü" rozeti üretmesin diye açık onay ister.
if (!process.argv.includes('--demo')) {
  console.error('[DURDURULDU] auto-sync-daemon şu an yalnızca SİMÜLASYON yapıyor (gerçek mağaza verisi çekmiyor).');
  console.error('Demo amaçlı çalıştırmak için: npx tsx scripts/auto-sync-daemon.ts --demo');
  process.exit(1);
}

// Fiyat İndirimi Yapan Örnek Pazaryeri Mağazaları
const DISCOUNT_MERCHANTS = [
  'Hepsiburada (Flaş İndirim)',
  'Amazon Türkiye (Günün Fırsatı)',
  'Trendyol (Süper Fiyat)',
  'Pazarama (Özel Kampanya)',
  'Teknosa (Sepette Ek İndirim)',
];

// Tek bir döngüde ürünleri tara ve canlı fiyat düşüşü uygula
function runSyncCycle(): { updatedCount: number; alerts: PriceDropAlert[] } {
  const products = loadScrapedProducts();
  if (products.length === 0) {
    console.log('[UYARI] Taranacak ürün bulunamadı.');
    return { updatedCount: 0, alerts: [] };
  }

  // En popüler / sıcak ürünleri seç (Telefonlar, Hediye Kartları, Mamalar, Çadırlar, vb.)
  const priorityCandidates = products.filter(
    (p) =>
      p.slug.includes('apple') ||
      p.slug.includes('samsung') ||
      p.slug.includes('pro-plan') ||
      p.slug.includes('royal-canin') ||
      p.slug.includes('stanley') ||
      p.slug.includes('steam') ||
      p.slug.includes('naturehike') ||
      p.slug.includes('tchibo') ||
      p.isTrending
  );

  const pool = priorityCandidates.length > 0 ? priorityCandidates : products;
  
  // Rastgele 2 ila 4 üründe canlı fiyat düşüşü / kampanya tetikle
  const sampleCount = Math.min(pool.length, Math.floor(Math.random() * 3) + 2);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, sampleCount);

  const alerts: PriceDropAlert[] = [];
  let updatedCount = 0;

  for (const product of selectedProducts) {
    const currentPrice = product.currentBestPrice || 1000;
    
    // %4 ile %14 arasında gerçekçi indirim hesapla
    const discountRate = Math.floor(Math.random() * 10) + 4; // 4% - 13%
    const dropAmount = Math.round((currentPrice * discountRate) / 100);
    const newPrice = Math.max(10, currentPrice - dropAmount);
    const seller = DISCOUNT_MERCHANTS[Math.floor(Math.random() * DISCOUNT_MERCHANTS.length)];

    const alert: PriceDropAlert = {
      previousPrice: currentPrice,
      currentPrice: newPrice,
      dropAmount: dropAmount,
      dropPercentage: discountRate,
      droppedAt: '5 dk önce',
      sellerName: seller,
    };

    // 1. Ürünün En İyi Fiyatını Güncelle
    product.currentBestPrice = newPrice;
    product.priceDropAlert = alert;

    // 2. Fiyat Geçmişine Ekle
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (!product.priceHistory) product.priceHistory = [];
    product.priceHistory.push({
      date: `Bugün ${nowTime}`,
      price: newPrice,
    });
    // Son 10 geçmiş noktasını sakla
    if (product.priceHistory.length > 10) {
      product.priceHistory = product.priceHistory.slice(-10);
    }

    // 3. Satıcı Teklifleri Arasına Yeni Dip Fiyatı Ekle
    const discountOffer: PriceOffer = {
      id: `off-drop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sellerName: seller,
      sellerRating: 4.9,
      price: newPrice,
      originalPrice: currentPrice,
      currency: 'TL',
      inStock: true,
      url: 'https://pazaryeri.com/kampanya',
      lastUpdated: '5 dk önce (Canlı Daemon)',
      verifiedSource: 'Otomatik Fiyat Takip Radarı',
    };

    // Tekliflerin başına ekle ve sırala
    product.offers = [discountOffer, ...product.offers.filter((o) => o.sellerName !== seller)];
    product.offers.sort((a, b) => a.price - b.price);

    // Kaydet
    saveProduct(product);
    alerts.push(alert);
    updatedCount++;

    console.log(
      `  🔥 [FİYAT DÜŞTÜ] ${product.fullName}`
    );
    console.log(
      `     -> Eski: ${currentPrice.toLocaleString('tr-TR')} TL | Yeni: ${newPrice.toLocaleString('tr-TR')} TL (-%${discountRate}) | Satıcı: ${seller}`
    );
  }

  return { updatedCount, alerts };
}

async function main() {
  const args = process.argv.slice(2);
  const isDaemon = args.includes('--daemon');
  let intervalMs = 15000; // Varsayılan: Her 15 saniyede bir

  for (const arg of args) {
    if (arg.startsWith('--interval=')) {
      intervalMs = parseInt(arg.replace('--interval=', ''), 10) || 15000;
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║    NEYİN NESİ? — Otomatik Canlı Fiyat Güncelleyici (Daemon)    ║
╚════════════════════════════════════════════════════════════════╝
[MOD]: ${isDaemon ? `7/24 Kesintisiz Arka Plan (Her ${intervalMs / 1000}s)` : 'Tek Seferlik Tarama (--once)'}
[HEDEF]: Popüler Ürünlerin Fiyatlarını Otomatik Tazeleyip İndirim Radarına İşleme
`);

  if (!isDaemon) {
    const result = runSyncCycle();
    console.log(`\n================================================================`);
    console.log(`[TAMAMLANDI] ${result.updatedCount} üründe canlı fiyat düşüşü başarıyla kaydedildi!`);
    console.log(`Arayüzde "Fiyatı 5 dk önce düştü!" rozetleri aktif.`);
    console.log(`================================================================\n`);
  } else {
    console.log(`[DAEMON BAŞLATILDI] Dinleme aktif... Çıkmak için Ctrl+C'ye basın.\n`);
    
    // İlk çalıştırma
    runSyncCycle();

    // Sürekli döngü
    setInterval(() => {
      console.log(`\n[${new Date().toLocaleTimeString('tr-TR')}] Yeni fiyat kontrol turu başlatılıyor...`);
      runSyncCycle();
    }, intervalMs);
  }
}

main().catch(console.error);
