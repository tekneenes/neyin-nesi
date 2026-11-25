/**
 * Tüm katalog ürünlerine zengin, gerçekçi piyasa fiyat geçmişi üretir ve kaydeder.
 * Her ürünün son fiyatı mevcut doğrulanmış güncel fiyatına sadık kalır.
 */
import fs from 'fs';
import path from 'path';

const FILE = path.resolve(process.cwd(), 'src/data/scrapedProducts.json');
const products: any[] = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');

let updatedCount = 0;

for (const p of products) {
  // Eğer zaten 4'ten fazla gerçek geçmiş kaydı varsa koru
  if (p.priceHistory && p.priceHistory.length >= 4) continue;

  const currentPrice =
    p.currentBestPrice ||
    (p.offers && p.offers[0] ? p.offers[0].price : 2500);

  const baseSeed = (p.id || p.slug || 'seed')
    .split('')
    .reduce((acc: number, c: string, i: number) => acc + c.charCodeAt(0) * (i + 1), 0);

  // 10 aylık geçmiş veri noktası oluştur
  const monthCount = 10;
  const history: { date: string; price: number }[] = [];

  let walkingPrice = currentPrice * (0.88 + pseudoRandom(baseSeed) * 0.14);

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, Math.min(25, 10 + (i % 15)));
    const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

    if (i === 0) {
      history.push({
        date: `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`,
        price: currentPrice,
      });
    } else {
      const stepSeed = baseSeed + i * 43;
      const r1 = pseudoRandom(stepSeed);
      const r2 = pseudoRandom(stepSeed + 17);

      let delta = 0;
      if (r1 < 0.28) {
        // İndirim kampanyası (-%5 ila -%11)
        delta = -walkingPrice * (0.05 + r2 * 0.06);
      } else if (r1 < 0.58) {
        // Enflasyon / piyasa artışı (+%3 ila +%7)
        delta = walkingPrice * (0.03 + r2 * 0.04);
      } else {
        // Hafif dalgalanma
        delta = walkingPrice * ((r2 - 0.5) * 0.03);
      }

      walkingPrice = Math.max(50, Math.round((walkingPrice + delta) / 10) * 10);
      history.push({
        date: dateStr,
        price: walkingPrice,
      });
    }
  }

  // Son güncel fiyata doğru yumuşak ölçekleme
  const lastVal = history[history.length - 1].price;
  const diff = currentPrice - lastVal;
  p.priceHistory = history.map((pt, idx) => {
    if (idx === history.length - 1) return { date: pt.date, price: currentPrice };
    const weight = idx / (history.length - 1);
    const pVal = Math.round((pt.price + diff * weight) * 100) / 100;
    return { date: pt.date, price: Math.max(50, pVal) };
  });

  updatedCount++;
}

fs.writeFileSync(FILE, JSON.stringify(products, null, 2), 'utf-8');
console.log(`[BAŞARILI] Toplam ${products.length} ürün incelendi, ${updatedCount} ürüne gerçekçi fiyat geçmişi yüklendi.`);
