import { Product } from '../types';

export interface FacetOption {
  value: string;
  label?: string;
  count: number;
}

export interface FacetGroup {
  id: string;
  label: string;
  options: FacetOption[];
  isCollapsedByDefault?: boolean;
}

export interface CategoryFacets {
  brands: FacetOption[];
  sellers: FacetOption[];
  multiOfferCount: number;
  priceMin: number;
  priceMax: number;
  specFacets: FacetGroup[];
}

export interface ActiveFiltersState {
  selectedBrands: string[];
  selectedSellers: string[];
  onlyMultiOffers: boolean;
  minPrice: number;
  maxPrice: number;
  specFilters: Record<string, string[]>; // facetId -> selectedValues[]
  sortBy: 'recommended' | 'newest' | 'most_compared' | 'price_asc' | 'price_desc' | 'savings_desc';
}

/**
 * Extracts faceted filter options dynamically from products.
 */
export function extractCategoryFacets(
  products: Product[],
  categorySlug?: string
): CategoryFacets {
  const list = categorySlug ? products.filter((p) => p.categorySlug === categorySlug) : products;

  // 1. Brands
  const brandCountMap = new Map<string, number>();
  for (const p of list) {
    if (p.brand) {
      const b = p.brand.trim();
      brandCountMap.set(b, (brandCountMap.get(b) || 0) + 1);
    }
  }
  const brands: FacetOption[] = Array.from(brandCountMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  // 2. Sellers & Multi-Offer Count
  const sellerCountMap = new Map<string, number>();
  let multiOfferCount = 0;
  for (const p of list) {
    if (p.offers && p.offers.length > 1) {
      multiOfferCount++;
    }
    if (p.offers && p.offers.length > 0) {
      for (const off of p.offers) {
        if (off.sellerName) {
          const s = off.sellerName.trim();
          sellerCountMap.set(s, (sellerCountMap.get(s) || 0) + 1);
        }
      }
    }
  }
  const sellers: FacetOption[] = Array.from(sellerCountMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);

  // 3. Price min and max
  let priceMin = Infinity;
  let priceMax = 0;
  for (const p of list) {
    const pr = p.currentBestPrice || 0;
    if (pr > 0) {
      if (pr < priceMin) priceMin = pr;
      if (pr > priceMax) priceMax = pr;
    }
  }
  if (priceMin === Infinity) priceMin = 0;
  if (priceMax === 0) priceMax = 150000;

  // 4. Dynamic Spec Facets
  const specFacetsMap = new Map<string, Map<string, number>>();

  // Helper to register facet option
  const addFacet = (facetKey: string, optionVal: string) => {
    if (!optionVal) return;
    const cleanOpt = optionVal.trim();
    if (cleanOpt.length === 0 || cleanOpt.length > 40) return;
    if (!specFacetsMap.has(facetKey)) {
      specFacetsMap.set(facetKey, new Map());
    }
    const valMap = specFacetsMap.get(facetKey)!;
    valMap.set(cleanOpt, (valMap.get(cleanOpt) || 0) + 1);
  };

  for (const p of list) {
    const rawName = (p.fullName || '').toLowerCase();

    // From structured specs
    if (p.specGroups) {
      const seenForProd = new Set<string>();
      for (const g of p.specGroups) {
        for (const it of g.items) {
          const lbl = (it.label || '').trim();
          const val = (it.value || '').trim();
          if (!lbl || !val || lbl.length > 30 || val.length > 35) continue;
          if (['Marka', 'Model', 'Model Kodu (MPN)', 'Ürün Kodu (SKU)', 'Kategori', 'Yetkili Satıcı'].includes(lbl)) continue;

          // Normalized label
          let groupLabel = lbl;
          if (lbl === 'İşlemci soketi' || lbl === 'Desteklenen işlemci prizleri') groupLabel = 'Soket Tipi';
          if (lbl === 'Destekli hafıza türü' || lbl === 'Grafik adaptörü hafıza tipi') groupLabel = 'Hafıza Türü';
          if (lbl === 'Hafıza yolu') groupLabel = 'Veri Yolu (Bit)';
          if (lbl === 'İşlemci üreticisi') groupLabel = 'İşlemci Üreticisi';
          if (lbl === 'Maksimum bellek') groupLabel = 'Maksimum RAM';
          if (lbl === 'Ekran boyutu') groupLabel = 'Ekran Boyutu';
          if (lbl === 'Ekran çözünürlüğü') groupLabel = 'Çözünürlük';
          if (lbl === 'Panel tipi') groupLabel = 'Panel Tipi';

          const facetKey = groupLabel;
          const combo = `${facetKey}:::${val}`;
          if (!seenForProd.has(combo)) {
            seenForProd.add(combo);
            addFacet(facetKey, val);
          }
        }
      }
    }

    // Smart Hardware Facet Extraction from product titles
    // CPU Specifics
    if (p.categorySlug === 'islemci') {
      const seriesMatch = rawName.match(/\b(ryzen [3579]|core i[3579]|core ultra [3579]|celeron|pentium)\b/i);
      if (seriesMatch) {
        addFacet('İşlemci Serisi', seriesMatch[0].toUpperCase());
      }
      const socketMatch = rawName.match(/\b(am5|am4|1700|1851)\b/i);
      if (socketMatch) {
        addFacet('Soket', socketMatch[0].toUpperCase());
      }
      const coreMatch = rawName.match(/(\d{1,2})\s*çekirdek/i);
      if (coreMatch) {
        addFacet('Çekirdek Sayısı', `${coreMatch[1]} Çekirdek`);
      }
    }

    // GPU Specifics
    if (p.categorySlug === 'ekran-kartlari') {
      const vramMatch = rawName.match(/\b(\d{1,2}gb)\b/i);
      if (vramMatch) {
        addFacet('VRAM Kapasitesi', vramMatch[0].toUpperCase());
      }
      const gddrMatch = rawName.match(/\b(gddr[67]x?)\b/i);
      if (gddrMatch) {
        addFacet('Bellek Tipi', gddrMatch[0].toUpperCase());
      }
      const bitMatch = rawName.match(/\b(128|192|256|384)\s*bit\b/i);
      if (bitMatch) {
        addFacet('Veri Yolu', `${bitMatch[1]} Bit`);
      }
    }

    // SSD Specifics
    if (p.categorySlug === 'ssd-depolama') {
      const capMatch = rawName.match(/\b(250gb|480gb|500gb|512gb|1tb|2tb|4tb)\b/i);
      if (capMatch) {
        addFacet('Kapasite', capMatch[0].toUpperCase());
      }
      const genMatch = rawName.match(/\b(gen4|gen5|gen3|pcie 4\.0|pcie 5\.0|sata)\b/i);
      if (genMatch) {
        addFacet('Arayüz Standardı', genMatch[0].toUpperCase());
      }
    }

    // RAM Specifics
    if (p.categorySlug === 'bellek') {
      const ddrMatch = rawName.match(/\b(ddr4|ddr5)\b/i);
      if (ddrMatch) {
        addFacet('RAM Tipi', ddrMatch[0].toUpperCase());
      }
      const capMatch = rawName.match(/\b(8gb|16gb|32gb|64gb)\b/i);
      if (capMatch) {
        addFacet('RAM Kapasitesi', capMatch[0].toUpperCase());
      }
    }
  }

  // Filter facets that have at least 2 distinct choices and not too cluttered
  const specFacets: FacetGroup[] = [];
  for (const [id, valMap] of specFacetsMap.entries()) {
    if (valMap.size >= 2 && valMap.size <= 20) {
      specFacets.push({
        id,
        label: id,
        options: Array.from(valMap.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count),
      });
    }
  }

  // Sort facet groups by total filled counts descending
  specFacets.sort((a, b) => {
    const sumA = a.options.reduce((s, o) => s + o.count, 0);
    const sumB = b.options.reduce((s, o) => s + o.count, 0);
    return sumB - sumA;
  });

  return {
    brands,
    sellers,
    multiOfferCount,
    priceMin: Math.floor(priceMin),
    priceMax: Math.ceil(priceMax),
    specFacets: specFacets.slice(0, 8), // top 8 relevant facets
  };
}

/**
 * Filters and sorts products based on active filter state.
 */
export function applyCategoryFilters(
  products: Product[],
  filters: ActiveFiltersState
): Product[] {
  let list = [...products];

  // 1. Brands
  if (filters.selectedBrands.length > 0) {
    const lowerBrands = filters.selectedBrands.map((b) => b.toLowerCase());
    list = list.filter((p) => p.brand && lowerBrands.includes(p.brand.toLowerCase()));
  }

  // 2. Sellers
  if (filters.selectedSellers.length > 0) {
    list = list.filter((p) => {
      if (!p.offers || p.offers.length === 0) return false;
      return p.offers.some((o) => filters.selectedSellers.includes(o.sellerName));
    });
  }

  // 3. Multi-offer / Savings Only
  if (filters.onlyMultiOffers) {
    list = list.filter((p) => p.offers && p.offers.length > 1);
  }

  // 4. Price bounds
  if (filters.minPrice > 0) {
    list = list.filter((p) => (p.currentBestPrice || 0) >= filters.minPrice);
  }
  if (filters.maxPrice < Infinity) {
    list = list.filter((p) => (p.currentBestPrice || 0) <= filters.maxPrice);
  }

  // 5. Dynamic Spec Filters
  for (const [facetId, selectedVals] of Object.entries(filters.specFilters)) {
    if (!selectedVals || selectedVals.length === 0) continue;

    list = list.filter((p) => {
      const rawName = (p.fullName || '').toLowerCase();
      // Check spec groups
      let hasMatch = false;
      if (p.specGroups) {
        for (const g of p.specGroups) {
          for (const it of g.items) {
            let label = (it.label || '').trim();
            if (label === 'İşlemci soketi' || label === 'Desteklenen işlemci prizleri') label = 'Soket Tipi';
            if (label === 'Destekli hafıza türü' || label === 'Grafik adaptörü hafıza tipi') label = 'Hafıza Türü';
            if (label === 'Hafıza yolu') label = 'Veri Yolu (Bit)';
            if (label === 'İşlemci üreticisi') label = 'İşlemci Üreticisi';
            if (label === 'Maksimum bellek') label = 'Maksimum RAM';
            if (label === 'Ekran boyutu') label = 'Ekran Boyutu';
            if (label === 'Ekran çözünürlüğü') label = 'Çözünürlük';
            if (label === 'Panel tipi') label = 'Panel Tipi';

            if (label === facetId && selectedVals.includes(it.value)) {
              hasMatch = true;
              break;
            }
          }
          if (hasMatch) break;
        }
      }

      // Check smart text matches if not found in spec groups
      if (!hasMatch) {
        for (const val of selectedVals) {
          if (rawName.includes(val.toLowerCase())) {
            hasMatch = true;
            break;
          }
        }
      }

      return hasMatch;
    });
  }

  // 6. Sorting
  switch (filters.sortBy) {
    case 'newest':
      list.sort((a, b) => (b.releaseYear || 2026) - (a.releaseYear || 2026));
      break;
    case 'most_compared':
      list.sort((a, b) => (b.compareCount || 0) - (a.compareCount || 0));
      break;
    case 'price_asc':
      list.sort((a, b) => (a.currentBestPrice || 0) - (b.currentBestPrice || 0));
      break;
    case 'price_desc':
      list.sort((a, b) => (b.currentBestPrice || 0) - (a.currentBestPrice || 0));
      break;
    case 'savings_desc':
      list.sort((a, b) => {
        const diffA = a.priceRange ? a.priceRange.max - a.priceRange.min : 0;
        const diffB = b.priceRange ? b.priceRange.max - b.priceRange.min : 0;
        return diffB - diffA;
      });
      break;
    case 'recommended':
    default:
      // Multi-store offers + high trust score first
      list.sort((a, b) => {
        const offerBonusA = (a.offers?.length || 0) > 1 ? 200 : 0;
        const offerBonusB = (b.offers?.length || 0) > 1 ? 200 : 0;
        return (b.overallTrustScore + offerBonusB) - (a.overallTrustScore + offerBonusA);
      });
      break;
  }

  return list;
}
