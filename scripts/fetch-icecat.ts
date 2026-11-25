/**
 * Open Icecat -> katalog. GERÇEK üretici verisi çeker (uydurma yok).
 *
 * Kullanım:
 *   npx tsx scripts/fetch-icecat.ts --brand=HP --code=6B2C1EA
 *   npx tsx scripts/fetch-icecat.ts --gtin=0196786224355
 *   npx tsx scripts/fetch-icecat.ts --brand=HP --code=6B2C1EA --brand=HP --code=...   (çoklu: sırayla eşleşir)
 *
 * Kimlik: varsayılan herkese açık 'openIcecat-live' hesabı. Kendi hesabınız varsa
 *   ICECAT_USER ve (Full Icecat için) ICECAT_APP_KEY ortam değişkenlerini verin.
 *
 * Not: Yalnızca Open Icecat'e içerik veren markalar kayıtsız çalışır (örn. HP).
 * Sony/Apple gibi markalar "Full Icecat" ister (app_key gerekir).
 */
import dotenv from 'dotenv';
import { Product, SpecGroup, SpecItem } from '../src/types';
import { saveProduct } from '../src/server/scraper/storage/dataStore';

dotenv.config({ path: '.env.local' });
dotenv.config();

const USER = process.env.ICECAT_USER || process.env.ICECAT_USERNAME || 'openIcecat-live';
const APP_KEY = process.env.ICECAT_APP_KEY || '';

type Query = { brand?: string; code?: string; gtin?: string };

export async function icecatFetch(q: Query, lang: string): Promise<any | null> {
  const p = new URLSearchParams({ UserName: USER, Language: lang });
  if (APP_KEY) p.set('app_key', APP_KEY);
  if (q.gtin) p.set('GTIN', q.gtin);
  if (q.brand) p.set('Brand', q.brand);
  if (q.code) p.set('ProductCode', q.code);

  const res = await fetch(`https://live.icecat.biz/api?${p.toString()}`);
  const json: any = await res.json().catch(() => null);
  if (!json || !json.data) {
    const msg = json?.Message || `HTTP ${res.status}`;
    return { __error: msg, __lang: lang };
  }
  return json.data;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function categoryToSlug(name: string): string {
  const n = (name || '').toLowerCase();
  if (/notebook|laptop/.test(n)) return 'dizustu-bilgisayarlar';
  if (/monitor|display/.test(n)) return 'monitorler';
  if (/headphone|headset|earphone/.test(n)) return 'kulakliklar';
  if (/smartphone|mobile phone/.test(n)) return 'telefonlar';
  if (/television|tv/.test(n)) return 'televizyonlar';
  if (/camera/.test(n)) return 'kameralar';
  return 'aksesuarlar';
}

export function toProduct(d: any, usedLang: string): Product {
  const g = d.GeneralInfo;
  const verifiedAt = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const sourceUrl = `https://icecat.biz/${usedLang}/p/${encodeURIComponent((g.Brand || '').toLowerCase())}/${encodeURIComponent(g.BrandPartCode || '')}/`;

  const specGroups: SpecGroup[] = (d.FeaturesGroups || [])
    .map((fg: any, gi: number): SpecGroup => {
      const title = fg.FeatureGroup?.Name?.Value || `Grup ${gi + 1}`;
      const items: SpecItem[] = (fg.Features || [])
        .map((f: any, fi: number): SpecItem | null => {
          const label = f.Feature?.Name?.Value;
          const value = f.PresentationValue;
          if (!label || value === undefined || value === '') return null;
          return {
            id: `ic-${g.IcecatId}-${gi}-${fi}`,
            label,
            value: String(value),
            verification: {
              level: 'manufacturer',
              sourceName: 'Open Icecat (marka tarafından sağlanan ürün verisi)',
              sourceUrl,
              verifiedAt,
              notes: `Icecat ürün kimliği: ${g.IcecatId}`,
            },
            isKeyHighlight: false,
          };
        })
        .filter(Boolean) as SpecItem[];
      return { id: `ic-grp-${g.IcecatId}-${gi}`, title, items };
    })
    .filter((x: SpecGroup) => x.items.length > 0);

  const gallery: string[] = (d.Gallery || [])
    .map((x: any) => x.Pic || x.Pic500x500)
    .filter(Boolean);
  const hero = d.Image?.HighPic || d.Image?.Pic500x500 || gallery[0] || '';

  const gtins: string[] = Array.isArray(g.GTIN) ? g.GTIN : g.GTIN ? [g.GTIN] : [];
  const releaseYear = parseInt(String(g.ReleaseDate || '').slice(-4), 10) || new Date().getFullYear();
  const title: string = g.Title || `${g.Brand} ${g.ProductName}`;
  const catName: string = g.Category?.Name?.Value || g.Category || 'Genel';

  return {
    id: `prod-icecat-${g.IcecatId}`,
    slug: slugify(title).slice(0, 80),
    brand: g.Brand,
    brandSlug: slugify(g.Brand),
    model: g.ProductName || title,
    fullName: title,
    categorySlug: categoryToSlug(catName),
    categoryName: catName,
    releaseYear,
    releaseDate: g.ReleaseDate || String(releaseYear),
    heroImage: hero,
    galleryImages: gallery.slice(0, 8),
    // Icecat'te olmayan editoryal alanlar UYDURULMAZ, boş bırakılır.
    identitySummary: g.Summary?.ShortSummaryDescription || g.Summary?.LongSummaryDescription || '',
    targetAudience: '',
    primaryStrengths: [],
    considerations: [],
    specGroups,
    offers: [], // Fiyat kaynağı henüz yok: sahte teklif eklenmez
    priceHistory: [],
    overallTrustScore: 0,
    dataSourcesCount: 1,
    lastOverallVerification: verifiedAt,
    viewCount: 0,
    compareCount: 0,
    barcode: gtins[0],
    isDemoData: false,
  } as Product;
}

async function main() {
  const args = process.argv.slice(2);
  const brands = args.filter(a => a.startsWith('--brand=')).map(a => a.slice(8));
  const codes = args.filter(a => a.startsWith('--code=')).map(a => a.slice(7));
  const gtins = args.filter(a => a.startsWith('--gtin=')).map(a => a.slice(7));

  const queries: Query[] = [
    ...codes.map((c, i) => ({ brand: brands[i] || brands[0], code: c })),
    ...gtins.map(g => ({ gtin: g })),
  ];

  if (queries.length === 0) {
    console.error('Kullanım: --brand=HP --code=6B2C1EA  veya  --gtin=...');
    process.exit(1);
  }

  console.log(`[ICECAT] Kullanıcı: ${USER} | app_key: ${APP_KEY ? 'var' : 'yok'}\n`);

  for (const q of queries) {
    const label = q.gtin ? `GTIN ${q.gtin}` : `${q.brand} ${q.code}`;
    // Önce Türkçe, yoksa İngilizce
    let used = 'tr';
    let data = await icecatFetch(q, 'tr');
    if (data?.__error) {
      const trErr = data.__error;
      data = await icecatFetch(q, 'en');
      used = 'en';
      if (data?.__error) {
        console.log(`✗ ${label}: bulunamadı -> ${data.__error} (tr: ${trErr})`);
        continue;
      }
      console.log(`  (${label}: Türkçe içerik yok -> İngilizce kullanıldı: "${trErr}")`);
    }

    const product = toProduct(data, used);
    saveProduct(product);
    const featureCount = product.specGroups.reduce((a, g) => a + g.items.length, 0);
    console.log(`✓ ${product.fullName}`);
    console.log(`  barkod: ${product.barcode} | dil: ${used} | ${product.specGroups.length} grup, ${featureCount} özellik, ${product.galleryImages.length} görsel`);
  }
}

if (process.argv[1]?.endsWith('fetch-icecat.ts')) {
  main().catch(e => {
    console.error('[HATA]', e);
    process.exit(1);
  });
}
