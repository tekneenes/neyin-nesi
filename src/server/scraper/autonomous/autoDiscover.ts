import { searchWebForProduct, SearchResultItem } from '../search/webSearcher';
import { extractJsonLd } from '../extractors/jsonLdExtractor';
import { extractHtmlTables } from '../extractors/tableExtractor';
import { extractGitHubRepo } from '../extractors/githubExtractor';
import { normalizeToProduct } from '../ai/normalizer';
import { saveProduct } from '../storage/dataStore';
import { Product, SpecGroup, SpecItem } from '../../../types';
import { RawExtractedData } from '../types';

export async function autoDiscoverProduct(productQuery: string): Promise<{
  success: boolean;
  product?: Product;
  sourcesSearched?: string[];
  error?: string;
}> {
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`🤖 [Otonom Keşif Motoru] "${productQuery}" aranıyor...`);
  console.log(`══════════════════════════════════════════════════════════════`);

  const trimmedQuery = productQuery.trim();
  if (!trimmedQuery) {
    return { success: false, error: 'Arama sorgusu boş olamaz.' };
  }

  // 1. If it looks like a robotic arm / open hardware search, check GitHub first
  if (
    trimmedQuery.toLowerCase().includes('robot') ||
    trimmedQuery.toLowerCase().includes('kol') ||
    trimmedQuery.toLowerCase().includes('açık kaynak') ||
    trimmedQuery.toLowerCase().includes('open source')
  ) {
    const githubResult = await searchGitHubForProject(trimmedQuery);
    if (githubResult) {
      console.log(`[Otonom Keşif] GitHub'da açık kaynak donanım deposu bulundu: ${githubResult.sourceUrl}`);
      const product = await normalizeToProduct(githubResult);
      const { isNew } = saveProduct(product);
      return {
        success: true,
        product,
        sourcesSearched: [githubResult.sourceUrl],
      };
    }
  }

  // 2. Multi-source Web Search
  const candidateResults = await searchWebForProduct(trimmedQuery, 4);

  if (candidateResults.length === 0) {
    return {
      success: false,
      error: `"${trimmedQuery}" için internette yeterli teknik kaynak bulunamadı.`,
    };
  }

  console.log(`[Otonom Keşif] ${candidateResults.length} farklı kaynak taranıyor ve sentezleniyor...`);

  // 3. Concurrently fetch and extract data from multiple sources
  const extractedList: RawExtractedData[] = [];
  const sourcesUsed: string[] = [];

  for (const item of candidateResults) {
    try {
      console.log(`  ➔ Okunuyor: ${item.url}`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Extract JSON-LD first
      let raw = extractJsonLd(html, item.url);
      const tableData = extractHtmlTables(html, item.url);

      if (raw) {
        raw.rawSpecs = [...raw.rawSpecs, ...tableData.rawSpecs];
        if (raw.images.length === 0) raw.images = tableData.images;
        if (!raw.brand || raw.brand.includes('Bilinmeyen')) raw.brand = tableData.brand;
        raw.pageTextHighlights = `${tableData.pageTextHighlights || ''} ${item.snippet}`;
      } else {
        raw = tableData;
        raw.pageTextHighlights = `${raw.pageTextHighlights || ''} ${item.snippet}`;
      }

      if (raw && (raw.title || raw.rawSpecs.length > 0)) {
        extractedList.push(raw);
        sourcesUsed.push(item.url);
      }
    } catch (err) {
      console.warn(`  ⚠️ Kaynak okunamadı (${item.url}):`, err);
    }
  }

  if (extractedList.length === 0) {
    return {
      success: false,
      error: `Sayfalar ziyaret edildi ancak yapılandırılabilir teknik özellik bulunamadı.`,
    };
  }

  // 4. Synthesize multi-source data into one super-product
  console.log(`[Otonom Keşif] ${extractedList.length} kaynaktan gelen veriler tekilleştiriliyor ve birleştiriliyor...`);
  const synthesizedRaw = synthesizeRawData(trimmedQuery, extractedList);

  // 5. Normalize into Neyin Nesi Product format (with Gemini AI enrichment)
  const product = await normalizeToProduct(synthesizedRaw);
  product.dataSourcesCount = Math.max(sourcesUsed.length, 1);
  product.overallTrustScore = Math.min(95 + sourcesUsed.length, 99); // multi-source increases confidence!

  // 6. Save to catalog
  const { isNew } = saveProduct(product);
  console.log(`[Otonom Keşif] Başarılı! "${product.fullName}" sisteme kaydedildi (${isNew ? 'YENİ' : 'GÜNCELLENDİ'}).`);

  return {
    success: true,
    product,
    sourcesSearched: sourcesUsed,
  };
}

function synthesizeRawData(query: string, list: RawExtractedData[]): RawExtractedData {
  const allImages: string[] = [];
  const allSpecs: Array<{ groupName?: string; label: string; value: string }> = [];
  let bestTitle = query;
  let bestBrand = '';
  let bestDescription = '';
  let bestPrice: { current?: number; currency?: string; sellerName?: string } | undefined;
  const pageHighlights: string[] = [];

  const seenSpecLabels = new Set<string>();

  for (const item of list) {
    if (!bestBrand && item.brand && !item.brand.includes('Bilinmeyen') && !item.brand.includes('Resmi Üretici')) {
      bestBrand = item.brand;
    }
    if (item.title && (bestTitle === query || item.title.length > bestTitle.length)) {
      bestTitle = item.title;
    }
    if (!bestDescription && item.description) {
      bestDescription = item.description;
    }
    if (!bestPrice && item.price?.current) {
      bestPrice = item.price;
    }

    // Merge unique images
    item.images.forEach(img => {
      if (!allImages.includes(img) && allImages.length < 6) {
        allImages.push(img);
      }
    });

    // Merge unique specs
    item.rawSpecs.forEach(spec => {
      const normalizedLabel = spec.label.toLowerCase().trim();
      if (!seenSpecLabels.has(normalizedLabel)) {
        seenSpecLabels.add(normalizedLabel);
        allSpecs.push(spec);
      }
    });

    if (item.pageTextHighlights) {
      pageHighlights.push(item.pageTextHighlights);
    }
  }

  return {
    title: bestTitle,
    brand: bestBrand,
    model: bestTitle,
    description: bestDescription,
    images: allImages,
    price: bestPrice,
    rawSpecs: allSpecs,
    pageTextHighlights: pageHighlights.join(' \n\n ').slice(0, 8000),
    sourceUrl: list[0]?.sourceUrl || 'Çoklu Doğrulanmış Web Kaynakları',
    sourceType: 'html_table',
  };
}

async function searchGitHubForProject(query: string): Promise<RawExtractedData | null> {
  try {
    const cleanQ = encodeURIComponent(query.replace(/kol|robot|açık kaynak/gi, '').trim());
    const res = await fetch(`https://api.github.com/search/repositories?q=${cleanQ}+topic:robotics&sort=stars&order=desc`, {
      headers: {
        'User-Agent': 'NeyinNesi-Bot/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const topRepo = data.items[0];
      return extractGitHubRepo(topRepo.html_url);
    }
  } catch {
    return null;
  }
  return null;
}
