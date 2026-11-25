import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import { SpecGroup, SpecItem } from '../../../types';
import { enforceHardwareSafety, sleep } from '../hardware/hardwareWatchdog';

export interface SiteExtractedSummary {
  url: string;
  domain: string;
  title: string;
  cleanedText: string;
}

export interface DeepEnrichmentResult {
  productFullName: string;
  brand: string;
  model: string;
  searchedUrlsCount: number;
  successfulSitesCount: number;
  sources: Array<{ url: string; domain: string }>;
  specGroups: SpecGroup[];
  identitySummary: string;
  targetAudience: string;
  primaryStrengths: string[];
  considerations: string[];
  suggestedTrustScore: number;
}

/**
 * DuckDuckGo HTML üzerinden arama yapıp link listesi döner.
 * API key gerektirmez, son derece hafiftir.
 */
async function searchDuckDuckGo(query: string, maxResults = 15): Promise<Array<{ title: string; url: string }>> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encoded}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results: Array<{ title: string; url: string }> = [];

    $('.result').each((_, el) => {
      if (results.length >= maxResults) return;
      const titleEl = $(el).find('.result__title a');
      const title = titleEl.text().trim();
      let rawHref = titleEl.attr('href') || '';

      let actualUrl = rawHref;
      if (rawHref.includes('uddg=')) {
        try {
          const match = rawHref.match(/uddg=([^&]+)/);
          if (match) actualUrl = decodeURIComponent(match[1]);
        } catch {
          actualUrl = rawHref;
        }
      }

      if (
        actualUrl.startsWith('http') &&
        !actualUrl.includes('duckduckgo.com') &&
        !actualUrl.includes('youtube.com') &&
        !actualUrl.includes('tiktok.com') &&
        !actualUrl.includes('pinterest.com')
      ) {
        results.push({ title, url: actualUrl });
      }
    });

    return results;
  } catch (err) {
    console.warn(`[Search Warning] DuckDuckGo araması başarısız (${query}):`, err);
    return [];
  }
}

/**
 * Tek bir URL'in HTML'ini indirir, DOM'daki gereksiz elemanları siler,
 * sadece teknik tabloları ve saf metni ~2000 karaktere sıkıştırarak döner.
 */
async function fetchAndCleanDOM(url: string): Promise<SiteExtractedSummary | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 sn zaman aşımı

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const html = await res.text();

    const $ = cheerio.load(html);

    // Gereksiz etiketleri tamamen DOM'dan kaldır (Bellek tasarrufu)
    $('script, style, noscript, svg, img, video, audio, iframe, header, footer, nav, aside, .cookie, .banner, .ads, #footer, #header').remove();

    const pageTitle = $('title').text().trim() || '';

    // Sadece teknik tablolar ve özellik bloklarını öne çıkar
    const specBlocks: string[] = [];
    $('table, dl, ul, [class*="spec"], [class*="technical"], [class*="feature"], [id*="spec"], article, main').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 30 && text.length < 3000) {
        specBlocks.push(text);
      }
    });

    let cleanedText = specBlocks.join(' \n ');
    if (!cleanedText || cleanedText.length < 100) {
      cleanedText = $('body').text().replace(/\s+/g, ' ').trim();
    }

    // Site başına en fazla 2500 karakter temiz teknik metin al
    cleanedText = cleanedText.slice(0, 2500);

    const domain = new URL(url).hostname.replace('www.', '');

    return {
      url,
      domain,
      title: pageTitle,
      cleanedText,
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * 30 Web Sitesi Toplama ve AI Zinciri:
 * 1. 2 farklı sorgu ile toplam 30 siteyi bulur.
 * 2. Sırayla hafif HTTP ile DOM'u çeker, temizler, sıkıştırır.
 * 3. AĞ VE TARAYICI SÜREÇLERİNİ TAMAMEN KAPATIR, RAM'İ BOŞALTIR.
 * 4. 30 sitenin temiz metnini tek parça olarak Gemini Flash'a gönderir.
 * 5. Çapraz doğrulanmış SpecGroup ve güvenilir JSON üretir.
 */
export async function deepEnrichProductWith30Sites(
  brand: string,
  model: string,
  existingFullName?: string
): Promise<DeepEnrichmentResult | null> {
  const fullName = existingFullName || `${brand} ${model}`.trim();
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`🚀 [30-Site Otonom Zenginleştirici] Başlatılıyor: "${fullName}"`);
  console.log(`══════════════════════════════════════════════════════════════`);

  // Donanım Güvenlik Kontrolü (Termal & RAM)
  await enforceHardwareSafety();

  // 1. FAZ: 2 Farklı Arama ile Toplam 30 Site Bulma
  console.log(`📡 [Faz 1] Arama 1: "${fullName} teknik özellikler data sheet" (15 site)...`);
  const batch1 = await searchDuckDuckGo(`${fullName} technical specifications data sheet`, 15);
  await sleep(1500); // DuckDuckGo rate limit nezaket molası

  console.log(`📡 [Faz 1] Arama 2: "${fullName} inceleme test donanım özellikleri" (15 site)...`);
  const batch2 = await searchDuckDuckGo(`${fullName} review benchmark test donanım özellikleri`, 15);

  // URL'leri tekilleştir
  const seenUrls = new Set<string>();
  const targetCandidates: Array<{ title: string; url: string }> = [];

  [...batch1, ...batch2].forEach((item) => {
    if (!seenUrls.has(item.url) && targetCandidates.length < 30) {
      seenUrls.add(item.url);
      targetCandidates.push(item);
    }
  });

  console.log(`🔗 [Faz 1] Toplam ${targetCandidates.length} benzersiz web sitesi sırayla taranıyor...`);

  // 2. FAZ: Sırayla DOM Çekme & Sıkıştırma (Sıfır RAM Tüketimi)
  const siteSummaries: SiteExtractedSummary[] = [];

  for (let i = 0; i < targetCandidates.length; i++) {
    const candidate = targetCandidates[i];
    const summary = await fetchAndCleanDOM(candidate.url);

    if (summary && summary.cleanedText.length > 80) {
      siteSummaries.push(summary);
      console.log(`   [${i + 1}/${targetCandidates.length}] ✓ ${summary.domain} (${summary.cleanedText.length} karakter ayıklandı)`);
    } else {
      console.log(`   [${i + 1}/${targetCandidates.length}] ✖ Atlandı / İçerik yetersiz: ${candidate.url}`);
    }

    // Her 5 istekte bir kısa dinlenme (termal ısınmayı engellemek için)
    if (i % 5 === 0 && i > 0) {
      await sleep(1000);
    }
  }

  // 3. FAZ: YAŞAM DÖNGÜSÜ TEMİZLİĞİ (RAM'İ TAMAMEN BOŞALT)
  console.log(`\n🧹 [Faz 1 Sonu] Web çekimi bitti. Ağ nesneleri temizleniyor, RAM boşaltılıyor...`);
  if (global.gc) {
    try {
      global.gc();
    } catch {}
  }

  // Donanım durumu kontrolü
  await enforceHardwareSafety();

  if (siteSummaries.length < 2) {
    console.warn(`⚠️ Yeterli veri kaynağı bulunamadı (${siteSummaries.length} site).`);
    return null;
  }

  // 4. FAZ: 30 SİTEYİ TEK PARÇA İNCELEYEN AI MODELİ (Gemini 2.5 Flash)
  console.log(`\n🧠 [Faz 2] ${siteSummaries.length} web sitesi içeriği tek parça halinde AI modeline aktarılıyor...`);

  const combinedDomsText = siteSummaries
    .map(
      (s, idx) =>
        `--- KAYNAK #${idx + 1} (${s.domain} | ${s.url}) ---\nBAŞLIK: ${s.title}\nMETİN:\n${s.cleanedText}\n`
    )
    .join('\n\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.error('❌ GEMINI_API_KEY bulunamadı! AI sentezi yapılamıyor.');
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `Sen "Neyin Nesi?" tarafsız ürün keşif ve doğrulama platformunun kıdemli donanım analistisin.
Sana tek bir ürün için internetten taranmış ${siteSummaries.length} farklı web sitesinin saf teknik içerikleri ve tabloları verildi.

Ürün Adı: ${fullName}
Marka: ${brand}
Model: ${model}

GÖREVLERİN:
1. Bu ${siteSummaries.length} farklı web sitesinin içeriklerini ÇAPRAZ DOĞRULA (Cross-verification).
2. Yalnızca birden fazla kaynakta birbirini teyit eden gerçek üretici ve teknik özellikleri yapılandırılmış "specGroups" listesine dönüştür.
3. Çelişkili, uydurma veya tek bir şüpheli sitede geçen yanlış verileri ele.
4. Her özellik için hangi kaynaklardan doğrulandığını ve en az 1 doğrulanmış kaynak URL'ini belirt.
5. Türkçe, tarafsız ve net bir "identitySummary" (Bu Ürünün Nesi?), "targetAudience" (Hedef Kitle), en az 3 "primaryStrengths" (Güçlü Yönler) ve 1-2 "considerations" (Dikkat Edilmesi Gerekenler) yaz.
6. Veri tutarlılığına göre 80-99 arası bir "suggestedTrustScore" hesapla.

YALNIZCA GEÇERLİ BİR JSON ÇIKTISI VER (Başka açıklama veya markdown backtick olmadan):
{
  "identitySummary": "...",
  "targetAudience": "...",
  "primaryStrengths": ["...", "...", "..."],
  "considerations": ["..."],
  "suggestedTrustScore": 95,
  "specGroups": [
    {
      "id": "sg-0",
      "title": "İşlemci & Donanım",
      "items": [
        {
          "id": "si-0",
          "label": "Yonga Seti",
          "value": "...",
          "unit": "",
          "isKeyHighlight": true,
          "verification": {
            "level": "manufacturer",
            "sourceName": "Doğrulanmış Web Kaynakları",
            "sourceUrl": "...",
            "verifiedAt": "Bugün"
          }
        }
      ]
    }
  ]
}`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { text: `\n\n=== 30 SİTEDEN ÇIKARILAN TEKNİK KAYNAKLAR ===\n\n${combinedDomsText}` },
          ],
        },
      ],
    });

    const responseText = aiResponse.text || '';
    const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    console.log(`✨ [Başarılı] AI sentezi tamamlandı! ${parsed.specGroups?.length || 0} özellik grubu oluşturuldu.`);

    return {
      productFullName: fullName,
      brand,
      model,
      searchedUrlsCount: targetCandidates.length,
      successfulSitesCount: siteSummaries.length,
      sources: siteSummaries.map((s) => ({ url: s.url, domain: s.domain })),
      specGroups: parsed.specGroups || [],
      identitySummary: parsed.identitySummary || '',
      targetAudience: parsed.targetAudience || '',
      primaryStrengths: parsed.primaryStrengths || [],
      considerations: parsed.considerations || [],
      suggestedTrustScore: parsed.suggestedTrustScore || 95,
    };
  } catch (err) {
    console.error('❌ [AI Hatası] Gemini 2.5 Flash sentezi sırasında hata oluştu:', err);
    return null;
  }
}
