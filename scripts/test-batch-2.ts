import fs from 'fs';

interface BatchTestResult {
  name: string;
  category: string;
  url: string;
  sitemapUrl: string;
  xmlFeedUrl?: string;
  status: 'WORKING_XML' | 'WORKING_SITEMAP' | 'PROTECTED' | 'ERROR';
  itemCount: number;
  formatType: string;
  note: string;
}

const STORES = [
  // 1. Teknoloji & Büyük Perakende
  { name: 'Vatan Bilgisayar', category: 'Bilgisayar & Elektronik', url: 'https://www.vatanbilgisayar.com', sitemap: 'https://www.vatanbilgisayar.com/sitemap.xml', feed: 'https://www.vatanbilgisayar.com/xml/akakce.xml' },
  { name: 'Teknosa', category: 'Elektronik & Teknoloji', url: 'https://www.teknosa.com', sitemap: 'https://www.teknosa.com/sitemap.xml', feed: 'https://www.teknosa.com/xml/akakce.xml' },
  { name: 'MediaMarkt Türkiye', category: 'Elektronik & Teknoloji', url: 'https://www.mediamarkt.com.tr', sitemap: 'https://www.mediamarkt.com.tr/sitemap.xml', feed: 'https://www.mediamarkt.com.tr/xml/akakce.xml' },
  { name: 'PC Kolik', category: 'Gaming & Bilgisayar', url: 'https://pckolik.com', sitemap: 'https://pckolik.com/sitemap.xml', feed: 'https://pckolik.com/xml/akakce.xml' },
  { name: 'GameofPC', category: 'Gaming & Bilgisayar', url: 'https://gameofpc.com', sitemap: 'https://gameofpc.com/sitemap.xml', feed: 'https://gameofpc.com/xml/akakce.xml' },
  { name: 'FırsatBuFırsat', category: 'Genel E-Ticaret', url: 'https://www.firsatbufirsat.com', sitemap: 'https://www.firsatbufirsat.com/sitemap.xml', feed: 'https://www.firsatbufirsat.com/xml/akakce.xml' },

  // 2. Kitap & Hobi & Kültür
  { name: 'Kitapyurdu', category: 'Kitap & Kültür', url: 'https://www.kitapyurdu.com', sitemap: 'https://www.kitapyurdu.com/sitemap.xml', feed: 'https://www.kitapyurdu.com/xml/akakce.xml' },
  { name: 'D&R', category: 'Kitap & Hobi', url: 'https://www.dr.com.tr', sitemap: 'https://www.dr.com.tr/sitemap.xml', feed: 'https://www.dr.com.tr/xml/akakce.xml' },
  { name: 'İdefix', category: 'Kitap & Teknoloji', url: 'https://www.idefix.com', sitemap: 'https://www.idefix.com/sitemap.xml', feed: 'https://www.idefix.com/xml/akakce.xml' },
  { name: 'BKM Kitap', category: 'Kitap & Kırtasiye', url: 'https://www.bkmkitap.com', sitemap: 'https://www.bkmkitap.com/sitemap.xml', feed: 'https://www.bkmkitap.com/xml/akakce.xml' },
  { name: 'Kidega', category: 'Kitap & Hobi', url: 'https://kidega.com', sitemap: 'https://kidega.com/sitemap.xml', feed: 'https://kidega.com/xml/akakce.xml' },

  // 3. Kozmetik & Kişisel Bakım & Sağlık
  { name: 'Watsons Türkiye', category: 'Kozmetik & Bakım', url: 'https://www.watsons.com.tr', sitemap: 'https://www.watsons.com.tr/sitemap.xml', feed: 'https://www.watsons.com.tr/xml/akakce.xml' },
  { name: 'Gratis', category: 'Kozmetik & Bakım', url: 'https://www.gratis.com', sitemap: 'https://www.gratis.com/sitemap.xml', feed: 'https://www.gratis.com/xml/akakce.xml' },
  { name: 'Rossmann Türkiye', category: 'Kozmetik & Kişisel Bakım', url: 'https://www.rossmann.com.tr', sitemap: 'https://www.rossmann.com.tr/sitemap.xml', feed: 'https://www.rossmann.com.tr/xml/akakce.xml' },
  { name: 'Sachane', category: 'Kozmetik & Saç Bakımı', url: 'https://sachane.com', sitemap: 'https://sachane.com/sitemap.xml', feed: 'https://sachane.com/xml/akakce.xml' },
  { name: 'Kozmela', category: 'Kozmetik & Makyaj', url: 'https://www.kozmela.com', sitemap: 'https://www.kozmela.com/sitemap.xml', feed: 'https://www.kozmela.com/xml/akakce.xml' },
  { name: 'Recete', category: 'Dermokozmetik & Eczane', url: 'https://www.recete.com', sitemap: 'https://www.recete.com/sitemap.xml', feed: 'https://www.recete.com/xml/akakce.xml' },

  // 4. Anne, Bebek & Oyuncak
  { name: 'e-bebek', category: 'Anne & Bebek', url: 'https://www.e-bebek.com', sitemap: 'https://www.e-bebek.com/sitemap.xml', feed: 'https://www.e-bebek.com/xml/akakce.xml' },
  { name: 'Joker', category: 'Anne & Bebek', url: 'https://www.joker.com.tr', sitemap: 'https://www.joker.com.tr/sitemap.xml', feed: 'https://www.joker.com.tr/xml/akakce.xml' },
  { name: 'Toyzz Shop', category: 'Oyuncak & Çocuk', url: 'https://www.toyzzshop.com', sitemap: 'https://www.toyzzshop.com/sitemap.xml', feed: 'https://www.toyzzshop.com/xml/akakce.xml' },
  { name: 'Armağan Oyuncak', category: 'Oyuncak & Hobi', url: 'https://www.armaganoyuncak.com.tr', sitemap: 'https://www.armaganoyuncak.com.tr/sitemap.xml', feed: 'https://www.armaganoyuncak.com.tr/xml/akakce.xml' },

  // 5. Ev, Mutfak, Züccaciye & Yaşam
  { name: 'Karaca', category: 'Mutfak & Züccaciye', url: 'https://www.karaca.com', sitemap: 'https://www.karaca.com/sitemap.xml', feed: 'https://www.karaca.com/xml/akakce.xml' },
  { name: 'Korkmaz Store', category: 'Mutfak & Tencere', url: 'https://www.korkmazstore.com.tr', sitemap: 'https://www.korkmazstore.com.tr/sitemap.xml', feed: 'https://www.korkmazstore.com.tr/xml/akakce.xml' },
  { name: 'Schafer', category: 'Mutfak & Sofra', url: 'https://www.schafer.com.tr', sitemap: 'https://www.schafer.com.tr/sitemap.xml', feed: 'https://www.schafer.com.tr/xml/akakce.xml' },
  { name: 'Madame Coco', category: 'Ev Tekstili & Dekorasyon', url: 'https://www.madamecoco.com', sitemap: 'https://www.madamecoco.com/sitemap.xml', feed: 'https://www.madamecoco.com/xml/akakce.xml' },
  { name: 'English Home', category: 'Ev Tekstili & Yaşam', url: 'https://www.englishhome.com', sitemap: 'https://www.englishhome.com/sitemap.xml', feed: 'https://www.englishhome.com/xml/akakce.xml' },
  { name: 'Linens', category: 'Ev Tekstili & Perde', url: 'https://www.linens.com.tr', sitemap: 'https://www.linens.com.tr/sitemap.xml', feed: 'https://www.linens.com.tr/xml/akakce.xml' },
  { name: 'Yataş Bedding', category: 'Yatak & Ev Tekstili', url: 'https://www.yatasbedding.com.tr', sitemap: 'https://www.yatasbedding.com.tr/sitemap.xml', feed: 'https://www.yatasbedding.com.tr/xml/akakce.xml' },
  { name: 'Bellona', category: 'Mobilya & Dekorasyon', url: 'https://www.bellona.com.tr', sitemap: 'https://www.bellona.com.tr/sitemap.xml', feed: 'https://www.bellona.com.tr/xml/akakce.xml' },
  { name: 'İstikbal', category: 'Mobilya & Ev Eşyaları', url: 'https://www.istikbal.com.tr', sitemap: 'https://www.istikbal.com.tr/sitemap.xml', feed: 'https://www.istikbal.com.tr/xml/akakce.xml' },
  { name: 'Kelebek Mobilya', category: 'Mobilya & Tasarım', url: 'https://www.kelebek.com', sitemap: 'https://www.kelebek.com/sitemap.xml', feed: 'https://www.kelebek.com/xml/akakce.xml' },

  // 6. Yapı Market & Hırdavat & Toptan
  { name: 'Koçtaş', category: 'Yapı Market & Ev', url: 'https://www.koctas.com.tr', sitemap: 'https://www.koctas.com.tr/sitemap.xml', feed: 'https://www.koctas.com.tr/xml/akakce.xml' },
  { name: 'Bauhaus Türkiye', category: 'Yapı Market & Bahçe', url: 'https://www.bauhaus.com.tr', sitemap: 'https://www.bauhaus.com.tr/sitemap.xml', feed: 'https://www.bauhaus.com.tr/xml/akakce.xml' },
  { name: 'ToptanTR', category: 'Toptan Hızlı Tüketim', url: 'https://www.toptantr.com', sitemap: 'https://www.toptantr.com/sitemap.xml', feed: 'https://www.toptantr.com/xml/akakce.xml' },
  { name: 'Bizim Toptan', category: 'Toptan Market', url: 'https://www.bizimtoptan.com.tr', sitemap: 'https://www.bizimtoptan.com.tr/sitemap.xml', feed: 'https://www.bizimtoptan.com.tr/xml/akakce.xml' },
  { name: 'A101 Online', category: 'Market & Elektronik', url: 'https://www.a101.com.tr', sitemap: 'https://www.a101.com.tr/sitemap.xml', feed: 'https://www.a101.com.tr/xml/akakce.xml' },
  { name: 'Şok Market (Cepte Şok)', category: 'Market & Aktüel', url: 'https://www.sokmarket.com.tr', sitemap: 'https://www.sokmarket.com.tr/sitemap.xml', feed: 'https://www.sokmarket.com.tr/xml/akakce.xml' },
  { name: 'Migros Sanal Market', category: 'Süpermarket & Elektronik', url: 'https://www.migros.com.tr', sitemap: 'https://www.migros.com.tr/sitemap.xml', feed: 'https://www.migros.com.tr/xml/akakce.xml' },
  { name: 'CarrefourSA', category: 'Süpermarket & Beyaz Eşya', url: 'https://www.carrefoursa.com', sitemap: 'https://www.carrefoursa.com/sitemap.xml', feed: 'https://www.carrefoursa.com/xml/akakce.xml' },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

async function checkUrl(url: string) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': UA,
        'Accept': 'application/xml,text/xml,text/html,*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, status: res.status, text: '' };
    const text = await res.text();
    const isXml = text.includes('<?xml') || text.includes('<urlset') || text.includes('<sitemapindex') || text.includes('<products') || text.includes('<items');
    return { ok: isXml, status: res.status, text };
  } catch (err: any) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function testStore(store: typeof STORES[0]): Promise<BatchTestResult> {
  // 1. Önce doğrudan XML Feed dene
  if (store.feed) {
    const feedRes = await checkUrl(store.feed);
    if (feedRes.ok) {
      const items = [...feedRes.text.matchAll(/<(item|product|Urun)>/gi)].length;
      return {
        name: store.name,
        category: store.category,
        url: store.url,
        xmlFeedUrl: store.feed,
        sitemapUrl: store.sitemap,
        status: 'WORKING_XML',
        itemCount: items,
        formatType: 'Doğrudan Ürün XML Feed (Fiyat & Stoklu)',
        note: `Doğrudan Akakçe/Cimri XML feed'i açık ve ${items} ürün veriyor.`,
      };
    }
  }

  // 2. Sitemap XML dene
  const sitemapRes = await checkUrl(store.sitemap);
  if (sitemapRes.ok) {
    const locCount = [...sitemapRes.text.matchAll(/<loc>/gi)].length;
    return {
      name: store.name,
      category: store.category,
      url: store.url,
      sitemapUrl: store.sitemap,
      status: 'WORKING_SITEMAP',
      itemCount: locCount,
      formatType: 'Açık Ürün Sitemap Index (Schema.org Uyumlu)',
      note: `Sitemap XML'i %100 açık; ${locCount} adet ürün/kategori bağlantısı veriyor.`,
    };
  }

  // 3. 403 veya bot koruması mı?
  if (sitemapRes.status === 403 || sitemapRes.status === 401) {
    return {
      name: store.name,
      category: store.category,
      url: store.url,
      sitemapUrl: store.sitemap,
      status: 'PROTECTED',
      itemCount: 0,
      formatType: 'Cloudflare / WAF / B2B Korumalı',
      note: 'Cloudflare veya WAF bot koruması aktif (Özel proxy/header gerekir).',
    };
  }

  return {
    name: store.name,
    category: store.category,
    url: store.url,
    sitemapUrl: store.sitemap,
    status: 'ERROR',
    itemCount: 0,
    formatType: 'Geçersiz / Erişilemez',
    note: `HTTP ${sitemapRes.status || 'Timeout'}`,
  };
}

async function main() {
  console.log(`[TEST BATCH 2] ${STORES.length} adet büyük Türk perakendeci taranıyor...\n`);
  const results: BatchTestResult[] = [];

  for (let i = 0; i < STORES.length; i += 4) {
    const chunk = STORES.slice(i, i + 4);
    const chunkResults = await Promise.all(chunk.map(s => testStore(s)));
    for (const r of chunkResults) {
      results.push(r);
      const icon = r.status.startsWith('WORKING') ? '✓' : r.status === 'PROTECTED' ? '🛡️' : '✗';
      console.log(`${icon} [${r.status}] ${r.name} (${r.category}) -> ${r.note}`);
    }
  }

  const working = results.filter(r => r.status.startsWith('WORKING'));
  console.log(`\nBatch 2 Tamamlandı: ${working.length}/${results.length} kaynak başarıyla çalıştı.`);

  fs.writeFileSync('./scripts/batch2-results.json', JSON.stringify(results, null, 2), 'utf-8');
}

main().catch(console.error);
