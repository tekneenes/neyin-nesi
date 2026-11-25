/**
 * Sahte / yanlış eşleşmiş verileri temizler. Tekrar çalıştırılabilir (idempotent).
 *
 *  1. Marka şartname scriptinin yanlış ürünlere bastığı grupları siler
 *     (AirPods Max hariç: o gerçekten apple.com/tr'den çekildi).
 *  2. Simülasyondan gelen "Fiyatı düştü" rozetlerini (priceDropAlert) siler.
 *  3. Gerçek bir kaynaktan gelmeyen teklifleri `isDemo: true` ile etiketler.
 *     Hiç gerçek teklifi olmayan ürünler `isDemoData: true` olur.
 */
import fs from 'fs';
import path from 'path';

const FILE = path.resolve(process.cwd(), 'src/data/scrapedProducts.json');
const products: any[] = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

// Benim ürettiğim / şablondan gelen teklif ID önekleri
const DEMO_OFFER_ID = /^off-(xml|drop|store|mass|hb|ty|pz|amz|pet)-/;

// Doğrulanabilir teklif: mağaza sayfasına giden derin bir ürün URL'si olmalı
// (sadece ana sayfa linki ya da üretici yardım/doküman sayfası fiyat kanıtı değildir).
function hasVerifiableUrl(url?: string): boolean {
  try {
    const u = new URL(url || '');
    if (/helpguide|support\.|docs?\./i.test(u.hostname)) return false;
    return u.pathname.length > 1;
  } catch {
    return false;
  }
}
// Marka scriptinin eklediği grup ID'leri
const BRAND_GROUP_ID = /^grp-(apple|samsung|xiaomi|huawei|honor|oppo|tecno)-\d+$/;

const stats = { wrongSpecGroups: 0, dupGroups: 0, dropAlerts: 0, demoOffers: 0, demoProducts: 0 };

for (const p of products) {
  const isAirPodsMax = /airpods max/i.test(p.fullName);

  // 1) Yanlış eşleşmiş marka şartnameleri
  const before = (p.specGroups || []).length;
  p.specGroups = (p.specGroups || []).filter((g: any) => {
    if (!BRAND_GROUP_ID.test(g.id)) return true;
    return isAirPodsMax; // AirPods Max'te kalsın
  });
  stats.wrongSpecGroups += before - p.specGroups.length;

  // AirPods Max: aynı başlıklı tekrar eden grupları ele
  if (isAirPodsMax) {
    const seen = new Set<string>();
    const b = p.specGroups.length;
    p.specGroups = p.specGroups.filter((g: any) => {
      if (!BRAND_GROUP_ID.test(g.id)) return true;
      if (seen.has(g.title)) return false;
      seen.add(g.title);
      return true;
    });
    stats.dupGroups += b - p.specGroups.length;
  }

  // 2) Simüle fiyat düşüşü rozetleri
  if (p.priceDropAlert) {
    delete p.priceDropAlert;
    stats.dropAlerts++;
  }

  // 3) Demo etiketleme
  let realOffers = 0;
  for (const o of p.offers || []) {
    if (DEMO_OFFER_ID.test(o.id || '') || !hasVerifiableUrl(o.url)) {
      if (!o.isDemo) stats.demoOffers++;
      o.isDemo = true;
    } else {
      delete o.isDemo;
      realOffers++;
    }
  }
  if (realOffers === 0) {
    if (!p.isDemoData) stats.demoProducts++;
    p.isDemoData = true;
  } else {
    delete p.isDemoData;
    // Gerçek ürünlerin ana fiyatı yalnızca gerçek tekliflerden hesaplanır
    const real = p.offers.filter((o: any) => !o.isDemo).map((o: any) => o.price);
    p.currentBestPrice = Math.min(...real);
  }
}

fs.writeFileSync(FILE, JSON.stringify(products, null, 2), 'utf-8');

const realProducts = products.filter(p => !p.isDemoData);
console.log('Temizlik tamam:', stats);
console.log(`Toplam ürün: ${products.length} | gerçek teklifli: ${realProducts.length} | demo: ${products.length - realProducts.length}`);
