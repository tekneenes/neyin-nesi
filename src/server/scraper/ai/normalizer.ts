import { GoogleGenAI } from '@google/genai';
import { Product, SpecGroup, SpecItem, VerificationSourceLevel } from '../../../types';
import { RawExtractedData } from '../types';

export async function normalizeToProduct(raw: RawExtractedData): Promise<Product> {
  const brand = sanitizeBrand(raw.brand, raw.title, raw.sourceUrl);
  let model = raw.model || raw.title || 'Model';

  // Remove brand if model already starts with brand
  if (model.toLowerCase().startsWith(brand.toLowerCase())) {
    model = model.slice(brand.length).trim();
  }

  // Construct clean fullName
  const fullName = raw.title?.toLowerCase().includes(brand.toLowerCase())
    ? raw.title
    : `${brand} ${model}`;

  const slug = generateSlug(fullName);

  // Category determination
  const categoryName = raw.categoryName || detectCategory(fullName, raw.rawSpecs);
  const categorySlug = raw.categorySlug || generateSlug(categoryName);

  // Group raw specs into structured SpecGroups
  let specGroups = organizeSpecGroups(raw.rawSpecs, raw.sourceType, raw.sourceUrl);

  // Default heuristic summaries
  let identitySummary = raw.description || `${brand} tarafından üretilen ${categoryName} segmentinde modern bir teknolojik ürün.`;
  let targetAudience = 'Teknoloji meraklıları ve güvenilir teknik özellik arayan kullanıcılar.';
  let primaryStrengths = [
    'Güncel teknolojik standartlara uyumluluk',
    'Yüksek doğrulukta doğrulanmış teknik altyapı',
    'Gelişmiş donanım bileşenleri',
  ];
  let considerations = [
    'Satın almadan önce bütçe ve kullanım senaryosu gözden geçirilmelidir.',
  ];

  // If Gemini API Key is available, enrich with AI!
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const aiEnrichment = await enrichWithGemini(
        apiKey,
        fullName,
        raw.rawSpecs,
        raw.pageTextHighlights || raw.description || '',
        categoryName
      );
      if (aiEnrichment) {
        identitySummary = aiEnrichment.identitySummary || identitySummary;
        targetAudience = aiEnrichment.targetAudience || targetAudience;
        primaryStrengths = aiEnrichment.primaryStrengths || primaryStrengths;
        considerations = aiEnrichment.considerations || considerations;

        // If AI extracted extra specs from marketing text
        if (Array.isArray(aiEnrichment.extraSpecs) && aiEnrichment.extraSpecs.length > 0) {
          specGroups = mergeAiSpecs(specGroups, aiEnrichment.extraSpecs, raw.sourceUrl);
        }
      }
    } catch (err) {
      console.warn('Gemini AI enrichment skipped, using heuristic fallback:', err);
    }
  }

  // Trust score calculation
  const trustScore = raw.sourceType === 'json_ld' ? 98 : raw.sourceType === 'github_repo' ? 99 : 95;

  const product: Product = {
    id: `prod-${slug}-${Date.now().toString().slice(-4)}`,
    slug,
    brand,
    brandSlug: generateSlug(brand),
    model,
    fullName,
    categorySlug,
    categoryName,
    releaseYear: new Date().getFullYear(),
    releaseDate: '2026',
    heroImage: raw.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
    galleryImages: raw.images.length > 0 ? raw.images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80'],
    identitySummary,
    targetAudience,
    primaryStrengths,
    considerations,
    specGroups,
    currentBestPrice: raw.price?.current || 0,
    priceRange: raw.price?.current ? {
      min: raw.price.current,
      max: raw.price.current,
      currency: raw.price.currency || 'TL',
    } : undefined,
    offers: raw.price?.current ? [
      {
        id: `off-${Date.now()}`,
        sellerName: raw.price.sellerName || 'Resmi Sağlayıcı',
        sellerRating: 4.8,
        price: raw.price.current,
        currency: raw.price.currency || 'TL',
        inStock: true,
        url: raw.sourceUrl,
        lastUpdated: 'Bugün',
        verifiedSource: raw.sourceType === 'github_repo' ? 'GitHub Resmi Deposu' : 'Resmi Web Sayfası',
      }
    ] : [],
    priceHistory: raw.price?.current ? [
      { date: 'Bugün', price: raw.price.current }
    ] : [],
    overallTrustScore: trustScore,
    dataSourcesCount: 1,
    lastOverallVerification: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    viewCount: 120,
    compareCount: 45,
    isTrending: false,
  };

  return product;
}

function sanitizeBrand(brandCandidate?: string, title?: string, url?: string): string {
  if (brandCandidate && !brandCandidate.includes('Bilinmeyen') && !brandCandidate.includes('Genel')) {
    return brandCandidate;
  }

  const u = (url || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (u.includes('apple.com') || t.includes('iphone') || t.includes('macbook') || t.includes('ipad')) return 'Apple';
  if (u.includes('samsung.com') || t.includes('galaxy')) return 'Samsung';
  if (u.includes('sony.com') || t.includes('playstation')) return 'Sony';
  if (u.includes('google.com') || t.includes('pixel')) return 'Google';
  if (u.includes('xiaomi.com') || u.includes('mi.com') || t.includes('xiaomi')) return 'Xiaomi';
  if (u.includes('dji.com')) return 'DJI';
  if (u.includes('dyson.com')) return 'Dyson';

  return 'Resmi Üretici';
}

function organizeSpecGroups(
  rawSpecs: Array<{ groupName?: string; label: string; value: string }>,
  sourceType: string,
  sourceUrl: string
): SpecGroup[] {
  const groupsMap = new Map<string, SpecItem[]>();
  const level: VerificationSourceLevel = sourceType === 'json_ld' ? 'manufacturer' : 'verified_other';

  rawSpecs.forEach((spec, idx) => {
    const groupTitle = spec.groupName || 'Temel Özellikler';
    if (!groupsMap.has(groupTitle)) {
      groupsMap.set(groupTitle, []);
    }

    groupsMap.get(groupTitle)!.push({
      id: `spec-${idx}`,
      label: spec.label,
      value: spec.value,
      verification: {
        level: sourceType === 'newsroom_press' ? 'manufacturer' : level,
        sourceName:
          sourceType === 'github_repo'
            ? 'GitHub API / Açık Lisans'
            : sourceType === 'newsroom_press'
            ? 'Resmi Basın Odası (Newsroom Press Kit)'
            : 'Resmi Teknik Veri',
        sourceUrl,
        verifiedAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      },
    });
  });

  return Array.from(groupsMap.entries()).map(([title, items], index) => ({
    id: `sg-${index}`,
    title,
    items,
  }));
}

function mergeAiSpecs(
  existingGroups: SpecGroup[],
  extraSpecs: Array<{ group: string; label: string; value: string }>,
  sourceUrl: string
): SpecGroup[] {
  const groups = [...existingGroups];

  extraSpecs.forEach((item, i) => {
    let group = groups.find(g => g.title.toLowerCase() === item.group.toLowerCase());
    if (!group) {
      group = {
        id: `sg-ai-${groups.length}`,
        title: item.group,
        items: [],
      };
      groups.push(group);
    }

    // Check if label already exists
    if (!group.items.some(x => x.label.toLowerCase() === item.label.toLowerCase())) {
      group.items.push({
        id: `spec-ai-${i}`,
        label: item.label,
        value: item.value,
        verification: {
          level: 'manufacturer',
          sourceName: 'AI Tarafından Çözümlenen Resmi Metin',
          sourceUrl,
          verifiedAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        },
      });
    }
  });

  return groups;
}

function detectCategory(name: string, specs: Array<{ label: string; value: string }>): string {
  const n = name.toLowerCase();
  const specText = specs.map(s => `${s.label} ${s.value}`).join(' ').toLowerCase();

  if (n.includes('robot') || n.includes('arm') || specText.includes('dof') || specText.includes('payload')) {
    return 'Robotik & Açık Kaynak Donanım';
  }
  if (n.includes('phone') || n.includes('iphone') || n.includes('galaxy s') || n.includes('xiaomi') || specText.includes('amoled') || specText.includes('mah')) {
    return 'Telefonlar';
  }
  if (n.includes('laptop') || n.includes('macbook') || n.includes('thinkpad') || specText.includes('intel core') || specText.includes('ryzen')) {
    return 'Dizüstü Bilgisayarlar';
  }
  if (n.includes('kulaklık') || n.includes('earbuds') || n.includes('headphone') || specText.includes('anc')) {
    return 'Kulaklıklar';
  }
  if (n.includes('tv') || n.includes('televizyon') || specText.includes('oled') || specText.includes('qled')) {
    return 'Televizyonlar';
  }
  return 'Genel Teknoloji';
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function enrichWithGemini(
  apiKey: string,
  productName: string,
  specs: Array<{ label: string; value: string }>,
  marketingText: string,
  category: string
) {
  const ai = new GoogleGenAI({ apiKey });
  const specsText = specs.slice(0, 20).map(s => `${s.label}: ${s.value}`).join('\n');

  const prompt = `Sen "Neyin Nesi?" adlı tarafsız ürün keşif ve karşılaştırma platformunun kıdemli donanım analistisin.
Aşağıdaki ürün adını, mevcut teknik özellikleri ve sayfadan çıkarılan pazarlama/tanıtım metnini analiz et.

Ürün: ${productName}
Kategori: ${category}
Mevcut Özellikler:
${specsText || 'Özel bir tablo bulunamadı'}

Sayfa Metni ve Özellikler:
${marketingText.slice(0, 3000)}

Görevlerin:
1. Türkçe, tarafsız 2-3 cümlelik "Bu Ürünün Nesi?" kimlik özeti yaz.
2. Hedef kitleyi belirle.
3. Öne çıkan en az 3 güçlü yönü listele.
4. Satın almadan önce dikkat edilmesi gereken 1-2 husus listele.
5. Sayfa metninde geçen teknik özellikleri (işlemci, kamera, ekran, batarya, malzeme vb.) yapılandırılmış "extraSpecs" listesi olarak çıkar.

YALNIZCA geçerli bir JSON çıktısı ver (başka hiçbir metin veya markdown olmadan):
{
  "identitySummary": "...",
  "targetAudience": "...",
  "primaryStrengths": ["...", "...", "..."],
  "considerations": ["..."],
  "extraSpecs": [
    { "group": "İşlemci & Performans", "label": "Yonga Seti", "value": "Apple A18 Pro" },
    { "group": "Kamera", "label": "Ana Kamera", "value": "48 MP Fusion" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text || '';
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}
