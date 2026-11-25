import fs from 'fs';

const STORES_BATCH_3 = [
  // 1. Giyim & Spor & Ayakkabı
  { name: 'Mavi Jeans', category: 'Moda & Giyim', sitemap: 'https://www.mavi.com/sitemap.xml' },
  { name: 'LC Waikiki', category: 'Moda & Giyim', sitemap: 'https://www.lcwaikiki.com/sitemap.xml' },
  { name: 'DeFacto', category: 'Moda & Giyim', sitemap: 'https://www.defacto.com.tr/sitemap.xml' },
  { name: 'Koton', category: 'Moda & Giyim', sitemap: 'https://www.koton.com/sitemap.xml' },
  { name: 'FLO', category: 'Ayakkabı & Çanta', sitemap: 'https://www.flo.com.tr/sitemap.xml' },
  { name: 'Boyner', category: 'Çoklu Kategori & Giyim', sitemap: 'https://www.boyner.com.tr/sitemap.xml' },
  { name: 'InStreet', category: 'Ayakkabı & Spor', sitemap: 'https://www.instreet.com.tr/sitemap.xml' },
  { name: 'SuperStep', category: 'Spor & Sneaker', sitemap: 'https://www.superstep.com.tr/sitemap.xml' },
  { name: 'Sneaks Up', category: 'Spor Giyim & Sneaker', sitemap: 'https://www.sneaksup.com/sitemap.xml' },
  { name: 'Korayspor', category: 'Spor & Ekipman', sitemap: 'https://www.korayspor.com/sitemap.xml' },
  { name: 'Barçın Spor', category: 'Spor & Outdoor', sitemap: 'https://www.barcin.com/sitemap.xml' },
  { name: 'Yalı Spor', category: 'Spor & Ayakkabı', sitemap: 'https://www.yalispor.com.tr/sitemap.xml' },
  { name: 'Lescon', category: 'Spor & Eşofman', sitemap: 'https://www.lescon.com.tr/sitemap.xml' },

  // 2. Elektronik & Aksesuar & Yenilenmiş
  { name: 'EasyCep', category: 'Yenilenmiş Telefon & Elektronik', sitemap: 'https://easycep.com/sitemap.xml' },
  { name: 'Getmobil', category: 'Yenilenmiş Telefon & Tablet', sitemap: 'https://getmobil.com/sitemap.xml' },
  { name: 'MobilCadde', category: 'Telefon Aksesuarları & Kılıf', sitemap: 'https://www.mobilcadde.com/sitemap.xml' },
  { name: 'Spigen Türkiye', category: 'Telefon Kılıfı & Ekran Koruyucu', sitemap: 'https://www.spigen.com.tr/sitemap.xml' },
  { name: 'Anker Türkiye', category: 'Kulaklık, Şarj & Projeksiyon', sitemap: 'https://www.anker-tr.com/sitemap.xml' },
  { name: 'Robolink Market', category: 'Robotik & 3D Yazıcı', sitemap: 'https://www.robolinkmarket.com/sitemap.xml' },
  { name: 'F1 Depo', category: 'Elektronik & Arduino', sitemap: 'https://f1depo.com/sitemap.xml' },

  // 3. Pet Shop & Mama & Akvaryum
  { name: 'Petlebi', category: 'Pet Shop & Evcil Hayvan', sitemap: 'https://www.petlebi.com/sitemap.xml' },
  { name: 'MamaTR', category: 'Kedi & Köpek Maması', sitemap: 'https://www.mamatr.com/sitemap.xml' },
  { name: 'KolayMama', category: 'Kedi/Köpek Maması & Aksesuar', sitemap: 'https://www.kolaymama.com/sitemap.xml' },
  { name: 'Atakan Petshop', category: 'Akvaryum & Pet Malzemeleri', sitemap: 'https://www.atakanpetshop.com/sitemap.xml' },
  { name: 'Evcilal', category: 'Kuş, Kemirgen & Köpek Ürünleri', sitemap: 'https://www.evcilal.com/sitemap.xml' },

  // 4. Mutfak, Sofra & Ev Tekstili
  { name: 'Taç Ev Tekstili', category: 'Ev Tekstili & Perde', sitemap: 'https://www.tac.com.tr/sitemap.xml' },
  { name: 'Özdilek Ev Tekstili', category: 'Havlu, Bornoz & Nevresim', sitemap: 'https://www.ozdilekteyim.com/sitemap.xml' },
  { name: 'Jumbo', category: 'Lüks Sofra & Çatal-Kaşık', sitemap: 'https://www.jumbo.com.tr/sitemap.xml' },
  { name: 'Emsan', category: 'Mutfak & Tencere Setleri', sitemap: 'https://www.emsan.com.tr/sitemap.xml' },
  { name: 'Nehir Mutfak', category: 'Çatal-Kaşık & Çelik Mutfak', sitemap: 'https://www.nehir.com.tr/sitemap.xml' },
  { name: 'Bernardo', category: 'Porselen & Sofra Tasarımı', sitemap: 'https://www.bernardo.com.tr/sitemap.xml' },
  { name: 'Hisar', category: 'Sofra Sanatı & Tencere', sitemap: 'https://www.hisar.com.tr/sitemap.xml' },

  // 5. Oto Yedek Parça & Oto Bakım
  { name: 'Aloparca', category: 'Oto Yedek Parça & Filtre', sitemap: 'https://www.aloparca.com/sitemap.xml' },
  { name: 'OtoSuperMarket', category: 'Oto Bakım & Aksesuar', sitemap: 'https://www.otosupermarket.com/sitemap.xml' },
  { name: 'Parça Ofisi', category: 'Oto Yedek Parça B2B', sitemap: 'https://www.parcaofisi.com/sitemap.xml' },

  // 6. Kitap, Sanat & Kırtasiye
  { name: 'Kırmızı Kedi', category: 'Kitap & Edebiyat', sitemap: 'https://www.kirmizikedi.com/sitemap.xml' },
  { name: 'Alfa Kitap', category: 'Yayınevi & Kitap', sitemap: 'https://www.alfakitap.com/sitemap.xml' },
  { name: 'Remzi Kitabevi', category: 'Kitap & Sanat', sitemap: 'https://www.remzi.com.tr/sitemap.xml' },
  { name: 'Nezih', category: 'Kitap, Kırtasiye & Oyuncak', sitemap: 'https://www.nezih.com.tr/sitemap.xml' },
  { name: 'Panel Kırtasiye', category: 'Okul & Ofis Kırtasiyesi', sitemap: 'https://www.panelkirtasiye.com/sitemap.xml' },
  { name: 'Güven Sanat', category: 'Sanatsal Malzeme & Boya', sitemap: 'https://www.guvensanat.com/sitemap.xml' },
  { name: 'Karin Sanat', category: 'Hobi & Tuval & Fırça', sitemap: 'https://www.karinsanat.com/sitemap.xml' },

  // 7. Hırdavat & Sanayi
  { name: 'Hırdavat Dünyası', category: 'El Aletleri & Hırdavat', sitemap: 'https://www.hirdavatdunyasi.com/sitemap.xml' },
  { name: 'Akın Hırdavat', category: 'Civata & Yapı Malzemeleri', sitemap: 'https://www.akinhirdavat.com.tr/sitemap.xml' },
  { name: 'En Nalbur', category: 'Nalbur & Boya Malzemeleri', sitemap: 'https://www.ennalbur.com/sitemap.xml' },
];

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

async function check(store: typeof STORES_BATCH_3[0]) {
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
  console.log(`[BATCH 3 TEST] ${STORES_BATCH_3.length} adet mağaza test ediliyor...\n`);
  const results = [];

  for (let i = 0; i < STORES_BATCH_3.length; i += 5) {
    const batch = STORES_BATCH_3.slice(i, i + 5);
    const res = await Promise.all(batch.map(check));
    for (const r of res) {
      results.push(r);
      const icon = r.status === 'WORKING' ? '✓' : '✗';
      console.log(`${icon} [${r.status}] ${r.name} (${r.category}) -> ${r.status === 'WORKING' ? `${r.count} bağlantı` : r.status}`);
    }
  }

  const working = results.filter(r => r.status === 'WORKING');
  console.log(`\nBatch 3 Tamamlandı: ${working.length}/${results.length} mağaza çalışıyor.`);
  fs.writeFileSync('./scripts/batch3-results.json', JSON.stringify(results, null, 2), 'utf-8');
}

main().catch(console.error);
