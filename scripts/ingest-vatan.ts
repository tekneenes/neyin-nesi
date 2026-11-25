/**
 * Vatan Bilgisayar ürün sayfası (schema.org JSON-LD) -> GERÇEK fiyat teklifi.
 * Şartname: aynı marka + MPN ile Open Icecat'ten gelir.
 *
 * Kullanım:
 *   npx tsx scripts/ingest-vatan.ts --url=https://www.vatanbilgisayar.com/xxx.html [--url=...]
 *   npx tsx scripts/ingest-vatan.ts --sitemap --match=laptop --limit=10 [--delay=2000]
 *   ... --allow-no-specs   (Icecat'te bulunamayanları da yalnızca fiyatla ekle)
 *
 * Kurallar: robots.txt'in yasakladığı yollara gitmez (arama, login, ?page= vb.),
 * istekler arasında bekler (varsayılan 2 sn), tek bir User-Agent ile açıkça kendini belirtir.
 */
import { Product, PriceOffer } from '../src/types';
import { loadScrapedProducts, saveProduct } from '../src/server/scraper/storage/dataStore';
import { icecatFetch, toProduct } from './fetch-icecat';

const UA = 'NeyinNesiBot/0.1 (+fiyat-karsilastirma; iletisim: proje sahibi) Mozilla/5.0';
const SELLER = 'Vatan Bilgisayar';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function decodeEntities(s: string): string {
  return (s || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// robots.txt'te yasaklı kalıplar (Vatan): arama, login, sayfalama, sıralama, filtre
const BLOCKED = [/\/arama\//, /\/login/, /\?page=/, /\?srt=/, /\?opf=/, /\/yeni-urunler\//, /\/urun_kiyaslama\//];
const isAllowed = (u: string) => !BLOCKED.some(r => r.test(u));

interface ShopItem {
  url: string;
  name: string;
  brand: string;
  mpn: string;
  sku: string;
  price: number;
  currency: string;
  inStock: boolean;
}

async function fetchShopItem(url: string): Promise<ShopItem | null> {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'tr-TR,tr;q=0.9' }, signal: AbortSignal.timeout(25000) });
  if (!res.ok) {
    console.log(`  ✗ HTTP ${res.status}: ${url}`);
    return null;
  }
  const html = await res.text();
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (const b of blocks) {
    try {
      const j = JSON.parse(b);
      const arr = Array.isArray(j) ? j : j['@graph'] || [j];
      for (const o of arr) {
        if (!String(o['@type']).includes('Product')) continue;
        const offer = Array.isArray(o.offers) ? o.offers[0] : o.offers;
        const price = parseFloat(String(offer?.price ?? '').replace(',', '.'));
        if (!price || !o.name) continue;
        return {
          url: offer?.url || url,
          name: decodeEntities(o.name),
          brand: decodeEntities(typeof o.brand === 'string' ? o.brand : o.brand?.name || ''),
          mpn: decodeEntities(o.mpn || ''),
          sku: String(o.sku || ''),
          price,
          currency: offer?.priceCurrency === 'TRY' ? 'TL' : offer?.priceCurrency || 'TL',
          inStock: /InStock/i.test(offer?.availability || ''),
        };
      }
    } catch {
      /* sonraki blok */
    }
  }
  console.log(`  ✗ JSON-LD Product bulunamadı: ${url}`);
  return null;
}

async function listFromSitemap(match: RegExp, limit: number): Promise<string[]> {
  const res = await fetch('https://www.vatanbilgisayar.com/sitemap.axd?d=0', { headers: { 'User-Agent': UA } });
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => /\.html$/.test(u) && isAllowed(u) && match.test(u));
  return urls.slice(0, limit);
}

function todayTr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** Katman 4: Delta kaydı. Fiyat değişmediyse geçmişe satır EKLENMEZ. */
function applyDelta(product: Product, newPrice: number): 'ilk' | 'degisti' | 'ayni' {
  const hist = product.priceHistory || [];
  const last = hist[hist.length - 1];
  if (!last) {
    product.priceHistory = [{ date: todayTr(), price: newPrice }];
    return 'ilk';
  }
  if (last.price === newPrice) return 'ayni';
  product.priceHistory = [...hist, { date: todayTr(), price: newPrice }];
  if (newPrice < last.price) {
    product.priceDropAlert = {
      previousPrice: last.price,
      currentPrice: newPrice,
      dropAmount: last.price - newPrice,
      dropPercentage: Math.round(((last.price - newPrice) / last.price) * 100),
      droppedAt: 'bugün',
      sellerName: SELLER,
    };
  }
  return 'degisti';
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.filter(a => a.startsWith('--url=')).map(a => a.slice(6));
  const useSitemap = args.includes('--sitemap');
  const match = new RegExp(args.find(a => a.startsWith('--match='))?.slice(8) || '.', 'i');
  const limit = parseInt(args.find(a => a.startsWith('--limit='))?.slice(8) || '5', 10);
  const delay = parseInt(args.find(a => a.startsWith('--delay='))?.slice(8) || '2000', 10);
  const allowNoSpecs = args.includes('--allow-no-specs');

  let targets = urls.filter(isAllowed);
  if (useSitemap) targets = [...targets, ...(await listFromSitemap(match, limit))];
  if (targets.length === 0) {
    console.error('Kullanım: --url=<ürün sayfası>  veya  --sitemap --match=<regex> --limit=N');
    process.exit(1);
  }

  console.log(`[VATAN] ${targets.length} ürün sayfası okunacak (aralık: ${delay} ms)\n`);
  const stats = { fiyat: 0, specs: 0, atlandi: 0, ayni: 0, degisti: 0 };

  for (const url of targets) {
    const item = await fetchShopItem(url);
    await sleep(delay);
    if (!item) {
      stats.atlandi++;
      continue;
    }
    console.log(`• ${item.name}\n  marka=${item.brand} | MPN=${item.mpn} | ${item.price} ${item.currency} | stok=${item.inStock}`);

    // Şartname: Icecat'te marka+MPN ile ara
    let product: Product | null = null;
    if (item.brand && item.mpn) {
      let used = 'tr';
      let data = await icecatFetch({ brand: item.brand, code: item.mpn }, 'tr');
      if (data?.__error) {
        data = await icecatFetch({ brand: item.brand, code: item.mpn }, 'en');
        used = 'en';
      }
      if (!data?.__error) {
        product = toProduct(data, used);
        stats.specs++;
        console.log(`  ✓ Icecat şartname bulundu: ${product.specGroups.length} grup`);
      } else {
        console.log(`  – Icecat'te yok (${data.__error})`);
      }
    }

    if (!product) {
      if (!allowNoSpecs) {
        console.log('  → Şartnamesi olmadığı için eklenmedi (--allow-no-specs ile eklenebilir)\n');
        stats.atlandi++;
        continue;
      }
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
      product = {
        id: `prod-vatan-${item.sku}`,
        slug,
        brand: item.brand || 'Bilinmiyor',
        brandSlug: (item.brand || 'bilinmiyor').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        model: item.mpn || item.name,
        fullName: item.name,
        categorySlug: 'aksesuarlar',
        categoryName: 'Genel',
        releaseYear: new Date().getFullYear(),
        releaseDate: String(new Date().getFullYear()),
        heroImage: '',
        galleryImages: [],
        identitySummary: '',
        targetAudience: '',
        primaryStrengths: [],
        considerations: [],
        specGroups: [],
        offers: [],
        priceHistory: [],
        overallTrustScore: 0,
        dataSourcesCount: 1,
        lastOverallVerification: todayTr(),
        viewCount: 0,
        compareCount: 0,
        isDemoData: false,
      } as Product;
    }

    // Mevcut kayıtla birleştir (aynı slug => önceki teklif/geçmiş korunur)
    const existing = loadScrapedProducts().find(p => p.slug === product!.slug);
    if (existing) {
      product.offers = existing.offers || [];
      product.priceHistory = existing.priceHistory || [];
      product.priceDropAlert = existing.priceDropAlert;
      product.viewCount = existing.viewCount;
    }

    const offer: PriceOffer = {
      id: `off-vatan-${item.sku}`,
      sellerName: SELLER,
      sellerRating: 0,
      price: item.price,
      currency: item.currency,
      inStock: item.inStock,
      url: item.url,
      lastUpdated: new Date().toLocaleString('tr-TR'),
      verifiedSource: 'vatanbilgisayar.com ürün sayfası (schema.org JSON-LD)',
    };
    product.offers = [offer, ...product.offers.filter(o => o.sellerName !== SELLER)];
    product.currentBestPrice = Math.min(...product.offers.filter(o => !o.isDemo).map(o => o.price));

    const delta = applyDelta(product, item.price);
    saveProduct(product);
    stats.fiyat++;
    if (delta === 'ayni') stats.ayni++;
    if (delta === 'degisti') stats.degisti++;
    console.log(`  ✓ kaydedildi | fiyat geçmişi: ${delta}\n`);
  }

  console.log('[ÖZET]', stats);
}

main().catch(e => {
  console.error('[HATA]', e);
  process.exit(1);
});
