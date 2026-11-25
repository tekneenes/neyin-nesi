import * as cheerio from 'cheerio';
import { SpecGroup, SpecItem } from '../src/types';
import { loadScrapedProducts, saveProduct } from '../src/server/scraper/storage/dataStore';

interface AppleSpecTarget {
  name: string;
  slug: string;
  url: string;
  category: string;
}

const APPLE_SPEC_TARGETS: AppleSpecTarget[] = [
  {
    name: 'Apple AirPods Max 2 (USB-C)',
    slug: 'apple-airpods-max-2-usb-c',
    url: 'https://www.apple.com/tr/airpods-max/specs/',
    category: 'Kulaklıklar',
  },
  {
    name: 'Apple iPhone 16 Pro',
    slug: 'apple-iphone-16-pro',
    url: 'https://www.apple.com/tr/iphone-16-pro/specs/',
    category: 'Telefonlar',
  },
];

export async function scrapeAppleSpecsPage(targetUrl: string): Promise<SpecGroup[]> {
  console.log(`[APPLE RESMİ SPECS] İndiriliyor: ${targetUrl}...`);
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  if (!response.ok) {
    throw new Error(`Apple sayfası indirilemedi: HTTP ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const specGroups: SpecGroup[] = [];

  // Apple'ın standart techspecs tablo yapısı
  $('section.section-specs .techspecs [role="rowgroup"], .techspecs .row, section.section-specs .techspec-row').each((idx, el) => {
    const rawHeader = $(el).find('[role="rowheader"], h2, h3, .row-header').text().trim();
    if (!rawHeader) return;

    // Başlığı temizle
    const groupTitle = rawHeader.replace(/\s+/g, ' ');

    const items: SpecItem[] = [];

    // Hücreleri ve maddeleri topla
    $(el).find('ul li, [role="cell"] p, .cell-item').each((cIdx, cEl) => {
      let text = $(cEl).text().trim().replace(/\s+/g, ' ');
      // Dipnot numaralarını temizle (Örn: "Uzamsal Ses4" -> "Uzamsal Ses")
      text = text.replace(/([a-zA-ZğüşıöçĞÜŞİÖÇ])\d+$/g, '$1');

      if (text && text.length > 2 && !text.startsWith('http')) {
        items.push({
          id: `sp-apple-${idx}-${cIdx}`,
          label: items.length === 0 ? groupTitle : `Özellik ${cIdx + 1}`,
          value: text,
          verification: {
            level: 'manufacturer',
            sourceName: 'Apple Resmi Teknik Şartnamesi (apple.com/tr/specs)',
            sourceUrl: targetUrl,
            verifiedAt: 'Canlı Doğrulandı',
            notes: 'Apple Türkiye resmi şartname tablosundan otomatik ayrıştırıldı.',
          },
          isKeyHighlight: cIdx === 0,
        });
      }
    });

    if (items.length > 0) {
      specGroups.push({
        id: `grp-apple-${idx}`,
        title: groupTitle,
        items: items.slice(0, 10), // En önemli 10 maddeyi al
      });
    }
  });

  return specGroups;
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║    NEYİN NESİ? — APPLE RESMİ TEKNİK ŞARTNAME ÇEKİCİ            ║
╚════════════════════════════════════════════════════════════════╝
[KAYNAK] apple.com/tr/[model]/specs/ (Seviye 1: Üretici Şartnamesi)
`);

  const existingProducts = loadScrapedProducts();

  for (const target of APPLE_SPEC_TARGETS) {
    try {
      const groups = await scrapeAppleSpecsPage(target.url);
      console.log(`[AYRIŞTIRILDI] ${target.name}: Toplam ${groups.length} grup ve ${groups.reduce((acc, g) => acc + g.items.length, 0)} teknik özellik çıkarıldı.`);

      // Mevcut ürünü bul veya güncelle
      let prod = existingProducts.find(p => p.slug.includes('airpods-max') || p.fullName.toLowerCase().includes('airpods max'));

      if (prod) {
        // Mevcut ürünün teknik özelliklerini Apple'ın resmi verisiyle zenginleştir
        prod.specGroups = [...groups, ...(prod.specGroups || [])];
        saveProduct(prod);
        console.log(`  -> [GÜNCELLENDİ] "${prod.fullName}" resmi Apple şartnamesi ile güncellendi!`);
      } else {
        console.log(`  -> (Bilgi) "${target.name}" için mevcut ürün arandı.`);
      }
    } catch (err: any) {
      console.error(`[HATA] ${target.name} çekilemedi:`, err.message);
    }
  }

  console.log('\n[TAMAMLANDI] Apple resmi şartname çekimi başarıyla sonuçlandı.\n');
}

main().catch(err => {
  console.error('[HATA] Apple scraper genel hatası:', err);
});
