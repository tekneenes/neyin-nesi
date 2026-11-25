import * as cheerio from 'cheerio';
import { RawExtractedData } from '../types';

export function extractHtmlTables(html: string, sourceUrl: string): RawExtractedData {
  const $ = cheerio.load(html);
  const rawSpecs: Array<{ groupName?: string; label: string; value: string }> = [];

  // 1. Resolve Brand from URL, meta, or domain
  const resolvedBrand = detectBrand($, sourceUrl);

  // 2. Extract Title & Clean Model Name
  let rawTitle =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    'Teknolojik Ürün';

  // Clean trailing website names from title (e.g. "iPhone 18 Pro - Apple" -> "iPhone 18 Pro")
  const cleanTitle = cleanProductTitle(rawTitle, resolvedBrand);

  // 3. Extract OpenGraph Description & Page Highlights
  const ogDescription =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    '';

  // 4. Extract from HTML <table> elements
  $('table').each((_, table) => {
    let currentGroupName = $(table).find('caption, th[colspan]').first().text().trim() || 'Genel Özellikler';

    $(table).find('tr').each((_, row) => {
      const ths = $(row).find('th');
      const tds = $(row).find('td');

      if (ths.length > 0 && tds.length === 0) {
        const potentialGroup = ths.text().trim();
        if (potentialGroup) currentGroupName = potentialGroup;
      } else if (ths.length > 0 && tds.length > 0) {
        const label = ths.first().text().trim();
        const value = tds.first().text().trim();
        if (label && value && label.length < 80 && value.length < 200) {
          rawSpecs.push({ groupName: currentGroupName, label, value });
        }
      } else if (tds.length >= 2) {
        const label = $(tds[0]).text().trim();
        const value = $(tds[1]).text().trim();
        if (label && value && label.length < 80 && value.length < 200) {
          rawSpecs.push({ groupName: currentGroupName, label, value });
        }
      }
    });
  });

  // 5. Extract from Definition Lists <dl>
  $('dl').each((_, dl) => {
    let currentLabel = '';
    $(dl).children().each((_, child) => {
      const tag = child.tagName.toLowerCase();
      if (tag === 'dt') {
        currentLabel = $(child).text().trim();
      } else if (tag === 'dd' && currentLabel) {
        const val = $(child).text().trim();
        if (val && currentLabel.length < 80 && val.length < 200) {
          rawSpecs.push({ groupName: 'Özellikler', label: currentLabel, value: val });
        }
        currentLabel = '';
      }
    });
  });

  // 6. Extract from custom spec containers (Apple, Samsung, e-commerce divs)
  $('[class*="techspecs"], [class*="spec-row"], [class*="specs-row"], .pdp-spec, .product-spec').each((_, el) => {
    const text = $(el).text().trim();
    if (text.includes(':')) {
      const [l, ...rest] = text.split(':');
      const v = rest.join(':').trim();
      if (l && v && l.length < 60 && v.length < 150) {
        rawSpecs.push({ groupName: 'Teknik Özellikler', label: l.trim(), value: v });
      }
    }
  });

  // 7. Heuristic Feature Extractor from Marketing Text & Meta Description (Especially for Apple / flagship landing pages!)
  const combinedText = `${cleanTitle}. ${ogDescription}. ${$('h2, h3').text()}`;
  extractHeuristicSpecsFromText(combinedText, rawSpecs, cleanTitle);

  // 8. Extract High-Res Images
  const images: string[] = [];
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) images.push(ogImage);

  $('img').each((_, img) => {
    const src = $(img).attr('src') || $(img).attr('data-src');
    if (src && !src.includes('data:image') && !src.includes('icon') && !src.includes('logo') && !src.includes('svg')) {
      const fullUrl = src.startsWith('//') ? 'https:' + src : src.startsWith('http') ? src : '';
      if (fullUrl && !images.includes(fullUrl)) images.push(fullUrl);
    }
  });

  // 9. Extract Price if in OG tags or schema
  let price: { current?: number; currency?: string; sellerName?: string } | undefined;
  const ogPrice = $('meta[property="product:price:amount"]').attr('content');
  const ogCurrency = $('meta[property="product:price:currency"]').attr('content') || 'TL';
  if (ogPrice && !isNaN(parseFloat(ogPrice))) {
    price = { current: parseFloat(ogPrice), currency: ogCurrency, sellerName: resolvedBrand || 'Resmi Satıcı' };
  }

  return {
    title: cleanTitle,
    brand: resolvedBrand,
    model: cleanTitle.replace(new RegExp(`^${resolvedBrand}\\s*`, 'i'), '').trim(),
    description: ogDescription || undefined,
    pageTextHighlights: combinedText.slice(0, 5000),
    images: images.slice(0, 5),
    price,
    rawSpecs,
    sourceUrl,
    sourceType: 'html_table',
  };
}

function detectBrand($: cheerio.CheerioAPI, url: string): string {
  const urlLower = url.toLowerCase();

  // Known domain mappings
  if (urlLower.includes('apple.com')) return 'Apple';
  if (urlLower.includes('samsung.com')) return 'Samsung';
  if (urlLower.includes('sony.com')) return 'Sony';
  if (urlLower.includes('google.com')) return 'Google';
  if (urlLower.includes('mi.com') || urlLower.includes('xiaomi.com')) return 'Xiaomi';
  if (urlLower.includes('huawei.com')) return 'Huawei';
  if (urlLower.includes('dji.com')) return 'DJI';
  if (urlLower.includes('dyson.com')) return 'Dyson';
  if (urlLower.includes('asus.com')) return 'Asus';
  if (urlLower.includes('lenovo.com')) return 'Lenovo';
  if (urlLower.includes('dell.com')) return 'Dell';
  if (urlLower.includes('hp.com')) return 'HP';
  if (urlLower.includes('oneplus.com')) return 'OnePlus';
  if (urlLower.includes('playstation.com')) return 'Sony PlayStation';

  // Check meta tags
  const siteName = $('meta[property="og:site_name"]').attr('content');
  if (siteName && siteName.length < 30) return siteName.trim();

  const brandMeta = $('meta[name="brand"], meta[property="product:brand"]').attr('content');
  if (brandMeta && brandMeta.length < 30) return brandMeta.trim();

  // Check title
  const pageTitle = $('title').text();
  const knownBrands = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Asus', 'Dell', 'Lenovo', 'HP', 'LG', 'Philips', 'Dyson', 'DJI'];
  for (const b of knownBrands) {
    if (pageTitle.includes(b)) return b;
  }

  return 'Resmi Üretici';
}

function cleanProductTitle(rawTitle: string, brand: string): string {
  let cleaned = rawTitle
    .replace(/\s*[-–|•]\s*(Apple|Samsung|Sony|Resmi Sitesi|Resmi Satıcı|Official Site).*$/i, '')
    .replace(/\s*\|\s*.*$/, '')
    .trim();

  if (cleaned.startsWith(`${brand} `)) {
    cleaned = cleaned.replace(new RegExp(`^${brand}\\s+`, 'i'), '');
  }
  return cleaned || 'Teknolojik Ürün';
}

function extractHeuristicSpecsFromText(
  text: string,
  rawSpecs: Array<{ groupName?: string; label: string; value: string }>,
  productName: string
) {
  // 1. Processor / Chipset detection
  const chipMatch = text.match(/(A\d+\s*Pro(?:\s*chip)?|A\d+\s*Bionic|Apple\s*M\d+(?:\s*(?:Pro|Max))?|Snapdragon\s*\d+\s*(?:Gen\s*\d+)?|Tensor\s*G\d+|Intel\s*Core\s*(?:Ultra\s*)?\w+|Ryzen\s*\d+)/i);
  if (chipMatch && !rawSpecs.some(s => s.label.toLowerCase().includes('işlemci'))) {
    rawSpecs.push({ groupName: 'Performans & Donanım', label: 'İşlemci (Chipset)', value: chipMatch[0].trim() });
  }

  // 2. Camera resolution
  const cameraMatch = text.match(/(\d+\s*MP[\w\s,]+(?:camera|kamera|Fusion|telephoto|ultrawide|Main))/i);
  if (cameraMatch && !rawSpecs.some(s => s.label.toLowerCase().includes('kamera'))) {
    rawSpecs.push({ groupName: 'Kamera Sistemi', label: 'Ana Kamera Çözünürlüğü', value: cameraMatch[0].trim() });
  }

  // 3. Vapor Chamber / Cooling
  if (text.toLowerCase().includes('vapor chamber') || text.toLowerCase().includes('buhar odası')) {
    rawSpecs.push({ groupName: 'Soğutma & Termal', label: 'Termal Tasarım', value: 'Yeni Nesil Buhar Odası (Vapor Chamber) Soğutma' });
  }

  // 4. AI & Neural Engine
  if (text.toLowerCase().includes('total ai powerhouse') || text.toLowerCase().includes('apple intelligence') || text.toLowerCase().includes('galaxy ai')) {
    rawSpecs.push({ groupName: 'Yapay Zekâ (AI)', label: 'AI Yetenekleri', value: 'Entegre NPU ve Gelişmiş Donanımsal Yapay Zekâ Desteği' });
  }

  // 5. Variable Aperture
  if (text.toLowerCase().includes('variable aperture') || text.toLowerCase().includes('değişken diyafram')) {
    rawSpecs.push({ groupName: 'Kamera Sistemi', label: 'Diyafram Teknolojisi', value: 'Değişken Diyafram (Variable Aperture)' });
  }

  // 6. Battery leap
  if (text.toLowerCase().includes('leap in battery life') || text.toLowerCase().includes('pil ömrü')) {
    rawSpecs.push({ groupName: 'Batarya', label: 'Pil Performansı', value: 'Gelişmiş Yüksek Verimlilik ve Uzun Pil Dayanımı' });
  }
}
