import { extractJsonLd } from './extractors/jsonLdExtractor';
import { extractHtmlTables } from './extractors/tableExtractor';
import { extractGitHubRepo } from './extractors/githubExtractor';
import { isNewsroomUrl, extractNewsroomPress } from './extractors/newsroomExtractor';
import { normalizeToProduct } from './ai/normalizer';
import { saveProduct } from './storage/dataStore';
import { Product } from '../../types';
import { RawExtractedData } from './types';

export async function ingestFromUrl(url: string): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    console.log(`[Scraper Pipeline] Starting ingestion for: ${url}`);

    // Check if the URL is just a homepage / root domain
    try {
      const parsedUrl = new URL(url);
      const cleanPath = parsedUrl.pathname.replace(/\/+$/, '');
      if (!url.includes('github.com') && (cleanPath === '' || cleanPath === '/tr' || cleanPath === '/en' || cleanPath === '/us')) {
        return {
          success: false,
          error: `"${url}" bir genel ana sayfadır. Neyin Nesi? tekil ürünleri inceler. Lütfen doğrudan bir ürün veya teknik özellik sayfası girin (Örn: https://www.apple.com/iphone-16-pro/ veya https://www.apple.com/iphone-16-pro/specs/).`,
        };
      }
    } catch {}

    let rawData: RawExtractedData | null = null;

    // 1. If it's a GitHub URL (Open Source Hardware / Robotic Arm)
    if (url.includes('github.com')) {
      console.log(`[Scraper Pipeline] Detected GitHub Open Hardware repository.`);
      rawData = await extractGitHubRepo(url);
    } else {
      // 2. Standard Web Page (E-commerce / Spec Sheet / Manufacturer)
      console.log(`[Scraper Pipeline] Fetching web page content...`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: Sayfa yüklenemedi.` };
      }

      const html = await res.text();

      // Check if it's an official Brand Newsroom / Press Kit page
      if (isNewsroomUrl(url)) {
        console.log(`[Scraper Pipeline] Detected Official Brand Newsroom / Press Kit source.`);
        rawData = extractNewsroomPress(html, url);

        // Check if there are also JSON-LD specs to merge
        const jsonLd = extractJsonLd(html, url);
        if (jsonLd && jsonLd.rawSpecs.length > 0) {
          rawData.rawSpecs = [...rawData.rawSpecs, ...jsonLd.rawSpecs];
        }
      } else {
        // Attempt JSON-LD first (fastest and most accurate Schema.org standard)
        rawData = extractJsonLd(html, url);

        // Extract HTML table and marketing highlights
        const tableData = extractHtmlTables(html, url);

        if (rawData) {
          // Merge specs and enrich with tableData
          rawData.rawSpecs = [...rawData.rawSpecs, ...tableData.rawSpecs];
          if (rawData.images.length === 0) rawData.images = tableData.images;
          if (!rawData.brand || rawData.brand.includes('Bilinmeyen')) rawData.brand = tableData.brand;
          rawData.pageTextHighlights = tableData.pageTextHighlights;
          if (!rawData.title) rawData.title = tableData.title;
        } else {
          rawData = tableData;
        }
      }
    }

    if (!rawData || (!rawData.title && rawData.rawSpecs.length === 0)) {
      return { success: false, error: 'Sayfadan geçerli bir ürün veya teknik özellik çıkarılamadı.' };
    }

    console.log(`[Scraper Pipeline] Raw data extracted (${rawData.rawSpecs.length} spesifikasyon). Normalizing...`);

    // 3. Normalize into "Neyin Nesi?" Standard Product format
    const product = await normalizeToProduct(rawData);

    // 4. Save to persistent storage
    const { isNew } = saveProduct(product);
    console.log(`[Scraper Pipeline] Success! Product ${product.fullName} saved (${isNew ? 'YENİ ÜRÜN' : 'GÜNCELLENDİ'}).`);

    return { success: true, product };
  } catch (error: any) {
    console.error('[Scraper Pipeline] Error:', error);
    return { success: false, error: error.message || 'Bilinmeyen bir hata oluştu.' };
  }
}
