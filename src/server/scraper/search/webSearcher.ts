import * as cheerio from 'cheerio';

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

export async function searchWebForProduct(query: string, maxResults = 4): Promise<SearchResultItem[]> {
  const searchQuery = `${query} technical specifications`;
  console.log(`[Web Discovery] Searching web for: "${searchQuery}"...`);

  try {
    // DuckDuckGo HTML search endpoint (Free, no API key required)
    const encodedQuery = encodeURIComponent(searchQuery);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) {
      console.warn(`[Web Discovery] Search request failed with status: ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: SearchResultItem[] = [];

    $('.result').each((_, el) => {
      if (results.length >= maxResults) return;

      const titleEl = $(el).find('.result__title a');
      const title = titleEl.text().trim();
      let rawHref = titleEl.attr('href') || '';

      // DuckDuckGo wraps links in /l/?uddg=...
      let actualUrl = rawHref;
      if (rawHref.includes('uddg=')) {
        try {
          const match = rawHref.match(/uddg=([^&]+)/);
          if (match) {
            actualUrl = decodeURIComponent(match[1]);
          }
        } catch {
          actualUrl = rawHref;
        }
      }

      const snippet = $(el).find('.result__snippet').text().trim();

      // Filter out low quality links or ad aggregators
      if (
        actualUrl.startsWith('http') &&
        !actualUrl.includes('duckduckgo.com') &&
        !actualUrl.includes('youtube.com') &&
        !actualUrl.includes('pinterest.com') &&
        !actualUrl.includes('tiktok.com')
      ) {
        results.push({
          title,
          url: actualUrl,
          snippet,
        });
      }
    });

    console.log(`[Web Discovery] Found ${results.length} relevant candidate source pages.`);
    return results;
  } catch (error) {
    console.error('[Web Discovery] Search error:', error);
    return [];
  }
}

/**
 * Markaların resmi basın odalarında (Newsroom / Press Kit) lansman bülteni arar.
 */
export async function searchNewsroomForProduct(brand: string, model: string): Promise<SearchResultItem[]> {
  const query = `${brand} ${model} (newsroom OR press OR "press release" OR "basin odasi")`;
  console.log(`[Newsroom Discovery] Searching official brand newsrooms for: "${query}"...`);
  return searchWebForProduct(query, 3);
}
