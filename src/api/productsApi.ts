import { Product, Category, GuideTerm, CuratedCollection, SearchQueryFilters, DataCorrectionReport } from '../types';
import { CATEGORIES, GUIDE_TERMS, CURATED_COLLECTIONS } from '../data/mockDatabase';

let cachedCategories: Category[] | null = null;
const productDetailCache = new Map<string, Product>();

export const productsApi = {
  // 1. PostgreSQL'den Ürünleri Getir (Filtreleme, Arama, Sıralama Destekli)
  async getProducts(filters?: SearchQueryFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.brand) params.set('brand', filters.brand);
    if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters?.query) params.set('query', filters.query);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.limit) params.set('limit', String(filters.limit));

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[PostgreSQL API Hatası / Fallback]:', err);
      return [];
    }
  },

  // 2. Slug ile Tek Ürün Detayı (90 Günlük Fiyat Geçmişi ve Teknik Tablo)
  async getProductBySlug(slug: string): Promise<Product | null> {
    const key = slug.toLowerCase();
    if (productDetailCache.has(key)) {
      return productDetailCache.get(key)!;
    }
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.id) {
        productDetailCache.set(key, data);
        return data;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  // 3. Çoklu ID veya Slug ile Ürünleri Getir (Karşılaştırma ve Koleksiyonlar İçin)
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const res = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(','))}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // 4. Trend / Öne Çıkan Ürünler
  async getTrendingProducts(limit = 6): Promise<Product[]> {
    try {
      const res = await fetch(`/api/products/trending?limit=${limit}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // 5. Kategoriler ve PostgreSQL Canlı Ürün Sayıları
  async getCategories(): Promise<Category[]> {
    if (cachedCategories && cachedCategories.length > 0) return cachedCategories;
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('categories fetch failed');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedCategories = data;
        return data;
      }
    } catch {}
    return CATEGORIES;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find(c => c.slug === slug) || null;
  },

  // 6. Rehber Terimleri ve Koleksiyonlar
  async getGuideTerms(): Promise<GuideTerm[]> {
    return [...GUIDE_TERMS];
  },

  async getGuideTermBySlug(slug: string): Promise<GuideTerm | null> {
    const term = GUIDE_TERMS.find(t => t.slug === slug);
    return term ? { ...term } : null;
  },

  async getCuratedCollections(): Promise<CuratedCollection[]> {
    return [...CURATED_COLLECTIONS];
  },

  async getCuratedCollectionBySlug(slug: string): Promise<{ collection: CuratedCollection; products: Product[] } | null> {
    const collection = CURATED_COLLECTIONS.find(c => c.slug === slug);
    if (!collection) return null;
    const products = await this.getProductsByIds(collection.productSlugs);
    return { collection, products };
  },

  // 7. Hızlı Arama
  async search(query: string): Promise<Product[]> {
    return this.getProducts({ query, limit: 100 });
  },

  // 8. Canlı Platform İstatistikleri
  async getStats(): Promise<{
    totalProducts: number;
    totalOffers: number;
    totalSpecs: number;
    totalSupplyHistory: number;
  }> {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('stats fetch failed');
      return await res.json();
    } catch {
      return {
        totalProducts: 105671,
        totalOffers: 316448,
        totalSpecs: 73915,
        totalSupplyHistory: 1030165,
      };
    }
  },

  // 9. Hata Bildirimi (Simülasyon / Post)
  async submitCorrectionReport(report: Omit<DataCorrectionReport, 'id' | 'createdAt' | 'status'>): Promise<DataCorrectionReport> {
    return {
      ...report,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
  },
};
