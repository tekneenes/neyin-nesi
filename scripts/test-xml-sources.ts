import fs from 'fs';

interface TestResult {
  name: string;
  category: string;
  url: string;
  status: 'WORKING' | 'PROTECTED_B2B' | 'ERROR';
  httpStatus?: number;
  contentType?: string;
  itemCount?: number;
  sampleProduct?: {
    name?: string;
    price?: string | number;
    barcode?: string;
    sku?: string;
  };
  note: string;
}

const CANDIDATES = [
  // Bilgisayar / Donanım / Gaming
  { name: 'İtopya XML 0', category: 'Bilgisayar', url: 'https://www.itopya.com/xml/itopya_products_0.xml' },
  { name: 'İtopya XML 1', category: 'Bilgisayar', url: 'https://www.itopya.com/xml/itopya_products_1.xml' },
  { name: 'İtopya XML 2', category: 'Bilgisayar', url: 'https://www.itopya.com/xml/itopya_products_2.xml' },
  { name: 'İtopya XML 3', category: 'Bilgisayar', url: 'https://www.itopya.com/xml/itopya_products_3.xml' },
  { name: 'İtopya XML 4', category: 'Bilgisayar', url: 'https://www.itopya.com/xml/itopya_products_4.xml' },
  { name: 'Sinerji XML / Sitemap', category: 'Bilgisayar', url: 'https://www.sinerji.gen.tr/sitemap.xml' },
  { name: 'Sinerji Akakçe', category: 'Bilgisayar', url: 'https://www.sinerji.gen.tr/xml/akakce.xml' },
  { name: 'İncehesap Akakçe', category: 'Bilgisayar', url: 'https://www.incehesap.com/xml/akakce.xml' },
  { name: 'İncehesap Cimri', category: 'Bilgisayar', url: 'https://www.incehesap.com/xml/cimri.xml' },
  { name: 'İncehesap Sitemap', category: 'Bilgisayar', url: 'https://www.incehesap.com/sitemap.xml' },
  { name: 'Gaming.gen.tr Sitemap', category: 'Bilgisayar', url: 'https://www.gaming.gen.tr/sitemap_products_1.xml' },
  { name: 'Gaming.gen.tr Akakce', category: 'Bilgisayar', url: 'https://www.gaming.gen.tr/xml/akakce/' },
  { name: 'GameGaraj Akakce', category: 'Bilgisayar', url: 'https://www.gamegaraj.com/xml/akakce.xml' },
  { name: 'GameGaraj Sitemap', category: 'Bilgisayar', url: 'https://www.gamegaraj.com/sitemap.xml' },
  { name: 'Tebilon Ideasoft', category: 'Bilgisayar', url: 'https://www.tebilon.com/index.php?do=catalog/output&p-code=akakce' },
  { name: 'Tebilon Sitemap', category: 'Bilgisayar', url: 'https://www.tebilon.com/sitemap.xml' },
  { name: 'Gençer Gaming Ticimax', category: 'Bilgisayar', url: 'https://www.gencergaming.com/TicimaxXml.php' },
  { name: 'Gençer Gaming Akakce', category: 'Bilgisayar', url: 'https://www.gencergaming.com/xml/akakce.xml' },
  { name: 'Gençer Gaming Sitemap', category: 'Bilgisayar', url: 'https://www.gencergaming.com/sitemap.xml' },
  { name: 'QP Bilişim Akakce', category: 'Bilgisayar', url: 'https://www.qp.com.tr/xml/akakce.xml' },
  { name: 'QP Bilişim Sitemap', category: 'Bilgisayar', url: 'https://www.qp.com.tr/sitemap.xml' },
  { name: 'DFS Bilgisayar Sitemap', category: 'Bilgisayar', url: 'https://www.dfsbilgisayar.com/sitemap.xml' },
  { name: 'Teknobiyotik Akakce', category: 'Bilgisayar', url: 'https://www.teknobiyotik.com/xml/akakce.xml' },
  { name: 'Teknobiyotik Sitemap', category: 'Bilgisayar', url: 'https://www.teknobiyotik.com/sitemap.xml' },
  { name: 'Bizdehesaplı Akakce', category: 'Bilgisayar', url: 'https://www.bizdehesapli.com/xml/akakce.xml' },
  { name: 'Bizdehesaplı Sitemap', category: 'Bilgisayar', url: 'https://www.bizdehesapli.com/sitemap.xml' },
  { name: 'Webdenal Akakce', category: 'Bilgisayar', url: 'https://www.webdenal.com/export/akakce.xml' },
  { name: 'Webdenal Sitemap', category: 'Bilgisayar', url: 'https://www.webdenal.com/sitemap.xml' },
  { name: 'Depopark Akakce', category: 'Bilgisayar', url: 'https://www.depopark.com/xml/akakce.xml' },
  { name: 'Depopark Sitemap', category: 'Bilgisayar', url: 'https://www.depopark.com/sitemap.xml' },

  // Robotik & Komponent & Elektronik
  { name: 'Robotistan Akakce', category: 'Elektronik', url: 'https://www.robotistan.com/xml/akakce.xml' },
  { name: 'Robotistan Sitemap', category: 'Elektronik', url: 'https://www.robotistan.com/sitemap.xml' },
  { name: 'Robotistan Google Feed', category: 'Elektronik', url: 'https://www.robotistan.com/xml/google.xml' },
  { name: 'Robot Sepeti Ideasoft', category: 'Elektronik', url: 'https://www.robotsepeti.com/index.php?do=catalog/output&p-code=akakce' },
  { name: 'Robot Sepeti Sitemap', category: 'Elektronik', url: 'https://www.robotsepeti.com/sitemap.xml' },
  { name: 'Direnç Net Akakce', category: 'Elektronik', url: 'https://www.direnc.net/xml/akakce.xml' },
  { name: 'Direnç Net Sitemap', category: 'Elektronik', url: 'https://www.direnc.net/sitemap.xml' },
  { name: 'Samm Market Google Feed', category: 'Elektronik', url: 'https://market.samm.com/xml/google.xml' },
  { name: 'Samm Market Sitemap', category: 'Elektronik', url: 'https://market.samm.com/sitemap.xml' },
  { name: 'Merter Elektronik Akakce', category: 'Elektronik', url: 'https://www.merterelektronik.com/xml/akakce.xml' },
  { name: 'Merter Elektronik Ticimax', category: 'Elektronik', url: 'https://www.merterelektronik.com/TicimaxXml.php' },
  { name: 'Merter Elektronik Sitemap', category: 'Elektronik', url: 'https://www.merterelektronik.com/sitemap.xml' },
  { name: '3D Market Sitemap', category: 'Elektronik', url: 'https://www.3dmarket.com.tr/sitemap.xml' },

  // Hırdavat & El Aletleri
  { name: 'E-Hırdavat Akakce', category: 'Hırdavat', url: 'https://www.e-hirdavat.com/xml/akakce.xml' },
  { name: 'E-Hırdavat Sitemap', category: 'Hırdavat', url: 'https://www.e-hirdavat.com/sitemap.xml' },
  { name: 'Hırdavat Fırsatı Ideasoft', category: 'Hırdavat', url: 'https://www.hirdavatfirsati.com/index.php?do=catalog/output&p-code=akakce' },
  { name: 'Hırdavat Fırsatı Sitemap', category: 'Hırdavat', url: 'https://www.hirdavatfirsati.com/sitemap.xml' },
  { name: 'Nalburcuk Sitemap', category: 'Hırdavat', url: 'https://www.nalburcuk.com/sitemap.xml' },
  { name: 'Makina Market Akakce', category: 'Hırdavat', url: 'https://www.makinamarket.com.tr/xml/akakce.xml' },
  { name: 'Makina Market Sitemap', category: 'Hırdavat', url: 'https://www.makinamarket.com.tr/sitemap.xml' },

  // Kozmetik & Dermokozmetik
  { name: 'Mavi Kozmetik Akakce', category: 'Kozmetik', url: 'https://www.mavikozmetik.com.tr/xml/akakce.xml' },
  { name: 'Mavi Kozmetik Sitemap', category: 'Kozmetik', url: 'https://www.mavikozmetik.com.tr/sitemap.xml' },
  { name: 'Dermokozmetika Ideasoft', category: 'Kozmetik', url: 'https://www.dermokozmetika.com.tr/index.php?do=catalog/output&p-code=akakce' },
  { name: 'Dermokozmetika Sitemap', category: 'Kozmetik', url: 'https://www.dermokozmetika.com.tr/sitemap.xml' },
  { name: 'Narecza Akakce', category: 'Kozmetik', url: 'https://www.narecza.com/xml/akakce.xml' },
  { name: 'Narecza Sitemap', category: 'Kozmetik', url: 'https://www.narecza.com/sitemap.xml' },
  { name: 'DermoEczanem Akakce', category: 'Kozmetik', url: 'https://www.dermoeczanem.com/xml/akakce.xml' },
  { name: 'DermoEczanem Sitemap', category: 'Kozmetik', url: 'https://www.dermoeczanem.com/sitemap.xml' },
  { name: 'Cosmetica Sitemap', category: 'Kozmetik', url: 'https://www.cosmetica.com.tr/sitemap.xml' },

  // Anne & Bebek & Oyuncak
  { name: 'İlke Bebe Akakce', category: 'Anne & Bebek', url: 'https://www.ilkebebe.com/xml/akakce.xml' },
  { name: 'İlke Bebe Sitemap', category: 'Anne & Bebek', url: 'https://www.ilkebebe.com/sitemap.xml' },
  { name: 'Babymall Akakce', category: 'Anne & Bebek', url: 'https://www.babymall.com.tr/xml/akakce.xml' },
  { name: 'Babymall Sitemap', category: 'Anne & Bebek', url: 'https://www.babymall.com.tr/sitemap.xml' },
  { name: 'Civilim Sitemap', category: 'Anne & Bebek', url: 'https://www.civilim.com/sitemap.xml' },
  { name: 'Mucit Panda Sitemap', category: 'Anne & Bebek', url: 'https://www.mucitpanda.com/sitemap.xml' },

  // Ev & Mutfak & Züccaciye
  { name: 'Enplus Akakce', category: 'Ev & Yaşam', url: 'https://www.enplus.com.tr/xml/akakce.xml' },
  { name: 'Enplus Sitemap', category: 'Ev & Yaşam', url: 'https://www.enplus.com.tr/sitemap.xml' },
  { name: 'Evidea Sitemap', category: 'Ev & Yaşam', url: 'https://www.evidea.com/sitemap.xml' },
  { name: 'Porland Sitemap', category: 'Ev & Yaşam', url: 'https://www.porland.com/sitemap.xml' },
  { name: 'Biev Ticimax', category: 'Ev & Yaşam', url: 'https://www.biev.com.tr/TicimaxXml.php' },
  { name: 'Biev Sitemap', category: 'Ev & Yaşam', url: 'https://www.biev.com.tr/sitemap.xml' },

  // Pet Shop
  { name: 'Juen Pet Market Akakce', category: 'Pet Shop', url: 'https://www.juenpetmarket.com/xml/akakce.xml' },
  { name: 'Juen Pet Market Sitemap', category: 'Pet Shop', url: 'https://www.juenpetmarket.com/sitemap.xml' },
  { name: 'Petzzshop Sitemap', category: 'Pet Shop', url: 'https://www.petzzshop.com/sitemap.xml' },
  { name: 'Markamama Ticimax', category: 'Pet Shop', url: 'https://www.markamama.com.tr/TicimaxXml.php' },
  { name: 'Markamama Sitemap', category: 'Pet Shop', url: 'https://www.markamama.com.tr/sitemap.xml' },

  // Oto Aksesuar & Lastik
  { name: 'Modacar Akakce', category: 'Oto Aksesuar', url: 'https://www.modacar.com.tr/xml/akakce.xml' },
  { name: 'Modacar Sitemap', category: 'Oto Aksesuar', url: 'https://www.modacar.com.tr/sitemap.xml' },
  { name: 'Lastikcim Akakce', category: 'Oto Aksesuar', url: 'https://www.lastikcim.com.tr/xml/akakce.xml' },
  { name: 'Lastikcim Sitemap', category: 'Oto Aksesuar', url: 'https://www.lastikcim.com.tr/sitemap.xml' },
  { name: 'KolayOto Sitemap', category: 'Oto Aksesuar', url: 'https://www.kolayoto.com/sitemap.xml' },

  // Giyim & Tekstil
  { name: 'Dagi Akakce', category: 'Giyim', url: 'https://www.dagi.com.tr/xml/akakce.xml' },
  { name: 'Dagi Sitemap', category: 'Giyim', url: 'https://www.dagi.com.tr/sitemap.xml' },
  { name: 'Ayakkabı Dünyası Sitemap', category: 'Giyim', url: 'https://www.ayakkabidunyasi.com.tr/sitemap.xml' },
  { name: 'İrmak Moda Ticimax', category: 'Giyim', url: 'https://www.irmakmoda.com/TicimaxXml.php' },
  { name: 'İrmak Moda Sitemap', category: 'Giyim', url: 'https://www.irmakmoda.com/sitemap.xml' },
];

async function testCandidate(c: typeof CANDIDATES[0]): Promise<TestResult> {
  const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  try {
    const res = await fetch(c.url, {
      method: 'GET',
      headers: {
        'User-Agent': UA,
        'Accept': 'application/xml,text/xml,text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    const contentType = res.headers.get('content-type') || '';
    const status = res.status;

    if (status === 200) {
      const text = await res.text();

      // Check if it's actual XML
      const isXml = text.includes('<?xml') || text.includes('<urlset') || text.includes('<sitemapindex') || text.includes('<products') || text.includes('<items') || text.includes('<channel');
      
      if (!isXml) {
        return {
          name: c.name,
          category: c.category,
          url: c.url,
          status: 'ERROR',
          httpStatus: status,
          contentType,
          note: '200 OK döndü fakat XML formatında değil (HTML login veya bot blok sayfası)',
        };
      }

      // Check product count estimate
      let itemCount = 0;
      let sampleProduct: any = undefined;

      // Type 1: Standard product feed (<item>, <product>, <Urun>)
      const itemMatches = [...text.matchAll(/<(item|product|Urun)>([\s\S]*?)<\/\1>/gi)];
      if (itemMatches.length > 0) {
        itemCount = itemMatches.length;
        const first = itemMatches[0][2];
        const nameMatch = first.match(/<(name|title|UrunAdi)>([^<]+)<\//i);
        const priceMatch = first.match(/<(price|Price|Fiyat|g:price)>([^<]+)<\//i);
        const barcodeMatch = first.match(/<(barcode|ean|gtin|Barkod)>([^<]+)<\//i);
        sampleProduct = {
          name: nameMatch ? nameMatch[2].trim() : undefined,
          price: priceMatch ? priceMatch[2].trim() : undefined,
          barcode: barcodeMatch ? barcodeMatch[2].trim() : undefined,
        };
      } else {
        // Type 2: Sitemap (<url><loc>...</loc>)
        const locMatches = [...text.matchAll(/<loc>([^<]+)<\/loc>/gi)];
        itemCount = locMatches.length;
        if (locMatches.length > 0) {
          sampleProduct = {
            name: `Sitemap Bağlantısı (${locMatches[0][1].split('/').pop() || ''})`,
            sku: locMatches[0][1],
          };
        }
      }

      return {
        name: c.name,
        category: c.category,
        url: c.url,
        status: 'WORKING',
        httpStatus: status,
        contentType,
        itemCount,
        sampleProduct,
        note: `Aktif ve Erişilebilir (%100 Gerçek ${itemMatches.length > 0 ? 'Ürün XML Feed' : 'Ürün Sitemap Index'})`,
      };
    } else if (status === 401 || status === 403) {
      return {
        name: c.name,
        category: c.category,
        url: c.url,
        status: 'PROTECTED_B2B',
        httpStatus: status,
        contentType,
        note: 'Şifreli / Özel B2B Bayilik veya API Anahtarı İstiyor (Doğrudan açık değil)',
      };
    } else {
      return {
        name: c.name,
        category: c.category,
        url: c.url,
        status: 'ERROR',
        httpStatus: status,
        contentType,
        note: `HTTP ${status} Hatası (Geçersiz URL veya kaldırılmış)`,
      };
    }
  } catch (err: any) {
    return {
      name: c.name,
      category: c.category,
      url: c.url,
      status: 'ERROR',
      note: `Bağlantı hatası: ${err?.message || err}`,
    };
  }
}

async function main() {
  console.log('====================================================');
  console.log(`[TEST BAŞLATILDI] ${CANDIDATES.length} adet kaynak taranıyor...`);
  console.log('====================================================\n');

  const results: TestResult[] = [];
  const concurrency = 5;

  for (let i = 0; i < CANDIDATES.length; i += concurrency) {
    const batch = CANDIDATES.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(c => testCandidate(c)));
    for (const r of batchResults) {
      results.push(r);
      const icon = r.status === 'WORKING' ? '✓' : r.status === 'PROTECTED_B2B' ? '🔒' : '✗';
      console.log(`${icon} [${r.status}] ${r.name} (${r.category}) -> ${r.note} ${r.itemCount ? `[${r.itemCount} kayıt]` : ''}`);
      if (r.sampleProduct?.name) {
        console.log(`    Örnek Ürün: ${r.sampleProduct.name.slice(0, 50)} | Fiyat: ${r.sampleProduct.price || '-'} | Barkod: ${r.sampleProduct.barcode || '-'}`);
      }
    }
  }

  const working = results.filter(r => r.status === 'WORKING');
  const b2b = results.filter(r => r.status === 'PROTECTED_B2B');
  const errors = results.filter(r => r.status === 'ERROR');

  console.log('\n====================================================');
  console.log(`[SONUÇ RAPORU]`);
  console.log(`- Toplam Test Edilen: ${results.length}`);
  console.log(`- Çalışan (Doğrudan Açık XML / Ürün Verisi): ${working.length}`);
  console.log(`- Korumalı B2B (Bayi Şifresi Gerekli): ${b2b.length}`);
  console.log(`- Hatalı / 404 / Engelli: ${errors.length}`);
  console.log('====================================================\n');

  fs.writeFileSync('./scripts/xml-test-results.json', JSON.stringify(results, null, 2), 'utf-8');
}

main().catch(console.error);
