import * as cheerio from 'cheerio';
import { RawExtractedData } from '../types';

/**
 * Brand Newsroom / Press Kit Extractor
 * Apple Newsroom, Samsung Newsroom, Sony Press, Xiaomi PR vb. resmi basın bültenlerini ve
 * stüdyo kalitesindeki basın kiti fotoğraflarını ayıklar.
 */
export function isNewsroomUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('newsroom') ||
    u.includes('news.samsung.com') ||
    u.includes('apple.com/newsroom') ||
    u.includes('/press') ||
    u.includes('presscentre') ||
    u.includes('media-assets') ||
    u.includes('prnewswire') ||
    u.includes('/announcements/') ||
    u.includes('/news/')
  );
}

export function extractNewsroomPress(html: string, url: string): RawExtractedData {
  const $ = cheerio.load(html);

  // 1. Title Extraction
  let title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim();

  // Clean trailing website suffixes (e.g. " - Apple (TR)", " | Samsung Newsroom")
  title = title
    .replace(/\s*[-–|•]\s*(Apple|Samsung|Sony|Xiaomi|Newsroom|Basın Odası).*$/i, '')
    .trim();

  // 2. Brand Detection
  let brand = 'Bilinmeyen Marka';
  const urlLower = url.toLowerCase();
  if (urlLower.includes('apple')) brand = 'Apple';
  else if (urlLower.includes('samsung')) brand = 'Samsung';
  else if (urlLower.includes('sony')) brand = 'Sony';
  else if (urlLower.includes('xiaomi')) brand = 'Xiaomi';
  else if (urlLower.includes('asus')) brand = 'Asus';
  else if (urlLower.includes('dji')) brand = 'DJI';
  else if (urlLower.includes('bambu')) brand = 'Bambu Lab';
  else if (urlLower.includes('lenovo')) brand = 'Lenovo';
  else if (urlLower.includes('dell')) brand = 'Dell';
  else if (urlLower.includes('google')) brand = 'Google';
  else {
    // Try meta author or publisher
    const publisher = $('meta[property="og:site_name"]').attr('content') || '';
    if (publisher) brand = publisher.replace(/Newsroom|Press|Basın/gi, '').trim();
  }

  // 3. High-Resolution Press Images (Studio Renderings)
  const images: string[] = [];

  // OG Image (usually the top 4K hero render)
  const ogImg = $('meta[property="og:image"]').attr('content');
  if (ogImg && isValidImageUrl(ogImg)) {
    images.push(resolveUrl(ogImg, url));
  }

  // Find high-res image tags in article/press kit galleries
  $(
    'article img, .newsroom-gallery img, .press-release img, figure img, .gallery-item img, img.hero-image, .media-library img'
  ).each((_, el) => {
    const src =
      $(el).attr('data-orig-src') ||
      $(el).attr('data-large-src') ||
      $(el).attr('data-src') ||
      $(el).attr('srcset')?.split(' ')[0] ||
      $(el).attr('src');

    if (src && isValidImageUrl(src)) {
      const fullUrl = resolveUrl(src, url);
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });

  // 4. Raw Specs Extraction
  const rawSpecs: Array<{ groupName?: string; label: string; value: string }> = [];

  // A) Check for official HTML Specification Tables (Samsung, Sony, Asus newsrooms often include a full spec table)
  $('table').each((_, table) => {
    let currentGroup = 'Teknik Basın Verileri';
    const caption = $(table).find('caption, th[colspan]').first().text().trim();
    if (caption) currentGroup = caption;

    $(table)
      .find('tr')
      .each((_, tr) => {
        const th = $(tr).find('th, td:first-child').text().trim();
        const td = $(tr).find('td:last-child').text().trim();

        if (th && td && th !== td && th.length < 60 && td.length < 250) {
          rawSpecs.push({
            groupName: currentGroup,
            label: cleanLabel(th),
            value: td,
          });
        }
      });
  });

  // B) Extract Tech Spec Bullet Points from Feature Lists (e.g. Apple Newsroom bullet points)
  $('article ul li, .press-body ul li, .entry-content ul li').each((_, li) => {
    const text = $(li).text().trim();
    // Look for bullet points with key metrics (e.g. "Ekran: 6.3 inç Super Retina XDR", "Ağırlık: 199 gram")
    if (text.includes(':') && text.length < 200) {
      const [lbl, ...valParts] = text.split(':');
      const val = valParts.join(':').trim();
      if (lbl.length < 40 && val.length > 0) {
        rawSpecs.push({
          groupName: 'Öne Çıkan Lansman Özellikleri',
          label: cleanLabel(lbl),
          value: val,
        });
      }
    } else if (hasHardwareKeyword(text) && text.length < 150) {
      // Direct feature mention (e.g. "3000 nit tepe parlaklık")
      rawSpecs.push({
        groupName: 'Lansman Donanım Özellikleri',
        label: extractLabelFromSentence(text),
        value: text,
      });
    }
  });

  // 5. Page Text Highlights (for AI summarization)
  const paragraphs: string[] = [];
  $('article p, .press-body p, .entry-content p').each((_, p) => {
    const pt = $(p).text().trim();
    if (pt.length > 50 && !pt.toLowerCase().includes('copyright') && paragraphs.length < 8) {
      paragraphs.push(pt);
    }
  });

  const pageTextHighlights = paragraphs.join('\n\n');

  // Description from meta or first paragraph
  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    paragraphs[0] ||
    `${brand} resmi basın bülteni lansman verileri.`;

  return {
    title,
    brand,
    description,
    images: images.slice(0, 8),
    rawSpecs,
    pageTextHighlights,
    sourceUrl: url,
    sourceType: 'newsroom_press',
  };
}

function isValidImageUrl(src: string): boolean {
  const s = src.toLowerCase();
  if (s.includes('icon') || s.includes('logo') || s.includes('avatar') || s.includes('tracking') || s.includes('.svg') || s.includes('pixel')) {
    return false;
  }
  return s.includes('.jpg') || s.includes('.jpeg') || s.includes('.png') || s.includes('.webp') || s.includes('image');
}

function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

function cleanLabel(raw: string): string {
  return raw
    .replace(/^[-•*]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasHardwareKeyword(text: string): string | false {
  const t = text.toLowerCase();
  const keywords = ['mah', 'mp', 'ghz', 'bionic', 'snapdragon', 'retina', 'oled', 'amoled', 'titanyum', 'nits', 'nit', '120hz', 'ip68', 'anc', 'ldac', 'dof', 'payload'];
  return keywords.some(k => t.includes(k)) ? t : false;
}

function extractLabelFromSentence(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('ekran') || t.includes('display') || t.includes('oled') || t.includes('nit')) return 'Ekran Özelliği';
  if (t.includes('kamera') || t.includes('camera') || t.includes('mp') || t.includes('zoom')) return 'Kamera Sistemi';
  if (t.includes('işlemci') || t.includes('chip') || t.includes('yonga') || t.includes('a1') || t.includes('snapdragon')) return 'İşlemci / Yonga Seti';
  if (t.includes('batarya') || t.includes('pil') || t.includes('mah') || t.includes('şarj')) return 'Batarya & Güç';
  if (t.includes('ağırlık') || t.includes('titanyum') || t.includes('boyut')) return 'Gövde & Tasarım';
  return 'Lansman Özelliği';
}
