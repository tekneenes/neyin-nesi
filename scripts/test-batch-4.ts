import fs from 'fs';

const STORES_BATCH_4 = [
  { name: 'Trendyol', category: 'Pazaryeri & Çoklu Kategori', sitemap: 'https://www.trendyol.com/sitemap.xml' },
  { name: 'Hepsiburada', category: 'Pazaryeri & Çoklu Kategori', sitemap: 'https://www.hepsiburada.com/sitemap.xml' },
  { name: 'N11', category: 'Pazaryeri & Çoklu Kategori', sitemap: 'https://www.n11.com/sitemap.xml' },
  { name: 'Pazarama', category: 'Pazaryeri & Çoklu Kategori', sitemap: 'https://www.pazarama.com/sitemap.xml' },
  { name: 'Çiçeksepeti (Extra)', category: 'Pazaryeri & Hediye', sitemap: 'https://www.ciceksepeti.com/sitemap.xml' },
  { name: 'Decathlon Türkiye', category: 'Spor & Outdoor & Bisiklet', sitemap: 'https://www.decathlon.com.tr/sitemap.xml' },
  { name: 'IKEA Türkiye', category: 'Mobilya & Ev Gereçleri', sitemap: 'https://www.ikea.com.tr/sitemap.xml' },
  { name: 'Vivense', category: 'Mobilya & Dekorasyon', sitemap: 'https://www.vivense.com/sitemap.xml' },
  { name: 'Doğtaş Mobilya', category: 'Mobilya & Koltuk', sitemap: 'https://www.dogtas.com/sitemap.xml' },
  { name: 'Enza Home', category: 'Mobilya & Yatak', sitemap: 'https://www.enzahome.com.tr/sitemap.xml' },
  { name: 'Lova Yatak', category: 'Yatak & Baza', sitemap: 'https://www.lovayatak.com/sitemap.xml' },
  { name: 'Evkur', category: 'Beyaz Eşya & Elektronik', sitemap: 'https://www.evkur.com.tr/sitemap.xml' },
  { name: 'Kiğılı', category: 'Erkek Giyim & Takım Elbise', sitemap: 'https://www.kigili.com/sitemap.xml' },
  { name: 'Altınyıldız Classics', category: 'Erkek Moda & Takım Elbise', sitemap: 'https://www.altinyildizclassics.com/sitemap.xml' },
  { name: 'Damat Tween', category: 'Erkek Giyim & Aksesuar', sitemap: 'https://www.damattween.com/sitemap.xml' },
  { name: 'Ramsey', category: 'Erkek Giyim & Palto', sitemap: 'https://www.ramsey.com.tr/sitemap.xml' },
  { name: 'Derimod', category: 'Deri Ceket & Ayakkabı', sitemap: 'https://derimod.com.tr/sitemap.xml' },
  { name: 'Greyder', category: 'Outdoor Ayakkabı & Bot', sitemap: 'https://www.greyder.com/sitemap.xml' },
  { name: 'Kemal Tanca', category: 'Ayakkabı & Çanta', sitemap: 'https://www.kemaltanca.com.tr/sitemap.xml' },
  { name: 'Penti', category: 'İç Giyim, Çorap & Mayo', sitemap: 'https://www.penti.com/sitemap.xml' },
  { name: 'Suwen', category: 'İç Giyim & Ev Giyimi', sitemap: 'https://www.suwen.com.tr/sitemap.xml' },
  { name: 'Modanisa', category: 'Kadın Moda & Tesettür', sitemap: 'https://www.modanisa.com/sitemap.xml' },
  { name: 'Sefamerve', category: 'Giyim & Şal & Eşarp', sitemap: 'https://www.sefamerve.com/sitemap.xml' },
  { name: 'E-Dermokozmetik', category: 'Kozmetik & Cilt Bakımı', sitemap: 'https://www.dermokozmetik.com/sitemap.xml' },
  { name: 'MedikalGross', category: 'Sağlık & Medikal Malzemeler', sitemap: 'https://www.medikalgross.com/sitemap.xml' },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

async function check(store: typeof STORES_BATCH_4[0]) {
  try {
    const res = await fetch(store.sitemap, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/xml,text/xml,*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { ...store, status: 'ERROR', code: res.status };
    const text = await res.text();
    const isXml = text.includes('<?xml') || text.includes('<urlset') || text.includes('<sitemapindex');
    if (!isXml) return { ...store, status: 'NOT_XML', code: res.status };

    const locCount = [...text.matchAll(/<loc>/gi)].length;
    return { ...store, status: 'WORKING', count: locCount };
  } catch (err: any) {
    return { ...store, status: 'ERROR', error: err.message };
  }
}

async function main() {
  console.log(`[BATCH 4 TEST] ${STORES_BATCH_4.length} adet mağaza test ediliyor...\n`);
  const results = [];

  for (let i = 0; i < STORES_BATCH_4.length; i += 5) {
    const batch = STORES_BATCH_4.slice(i, i + 5);
    const res = await Promise.all(batch.map(check));
    for (const r of res) {
      results.push(r);
      const icon = r.status === 'WORKING' ? '✓' : '✗';
      console.log(`${icon} [${r.status}] ${r.name} (${r.category}) -> ${r.status === 'WORKING' ? `${r.count} bağlantı` : r.status}`);
    }
  }

  const working = results.filter(r => r.status === 'WORKING');
  console.log(`\nBatch 4 Tamamlandı: ${working.length}/${results.length} mağaza çalışıyor.`);
  fs.writeFileSync('./scripts/batch4-results.json', JSON.stringify(results, null, 2), 'utf-8');
}

main().catch(console.error);
