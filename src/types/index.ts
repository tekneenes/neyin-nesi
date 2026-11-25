export type VerificationSourceLevel = 'manufacturer' | 'authorized_distributor' | 'licensed_provider' | 'verified_other';

export interface VerificationInfo {
  level: VerificationSourceLevel;
  sourceName: string;
  sourceUrl?: string;
  verifiedAt: string; // e.g. "7 Ekim 2026"
  notes?: string;
}

export interface SpecItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
  numericValue?: number;
  verification: VerificationInfo;
  isKeyHighlight?: boolean;
  termSlug?: string; // Links to "Neyin Nesi?" concept glossary
}

export interface SpecGroup {
  id: string;
  title: string;
  iconName?: string;
  items: SpecItem[];
}

export interface PriceOffer {
  id: string;
  sellerName: string;
  sellerRating: number;
  price: number;
  originalPrice?: number;
  currency: string;
  inStock: boolean;
  url: string;
  lastUpdated: string;
  verifiedSource: string;
  isDemo?: boolean; // Gerçek bir mağazadan gelmeyen (örnek/simüle) teklif
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface ScoreSubCategory {
  name: string; // e.g. "Performans", "Ekran & Panel", "Kamera", "Batarya & Şarj", "F/P Oranı"
  score: number; // 0 - 100
  verdict?: string; // e.g. "Sektör Lideri", "Çok Başarılı", "İyi"
  icon?: string; // e.g. "Cpu", "Smartphone", "Camera", "BatteryCharging", "BadgePercent"
}

export interface PriceDropAlert {
  previousPrice: number;
  currentPrice: number;
  dropAmount: number;
  dropPercentage: number;
  droppedAt: string; // e.g. "5 dk önce", "Az önce"
  sellerName: string;
}

export interface ProductScore {
  overall: number; // e.g. 89/100 (Epey / Neyin Nesi Donanım Puanı)
  ratingTier: 'Mükemmel' | 'Çok İyi' | 'İyi' | 'Orta';
  subScores: ScoreSubCategory[];
  calculatedAt?: string;
  summaryVerdict?: string; // e.g. "Bu kategorideki cihazların %94'ünden daha yüksek genel donanım puanına sahip."
}

export interface PopularComparison {
  targetProductSlug: string;
  targetProductName: string;
  targetProductBrand: string;
  targetProductImage: string;
  targetProductPrice?: number;
  targetProductScore?: number;
  highlightDifference: string; // e.g. "Daha Yüksek Ekran Parlaklığı (+1000 nits) & A19 Pro"
  badgeText?: string; // e.g. "En Çok Kıyaslanan", "Segment Lideri", "F/P Alternatifi"
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  brandSlug: string;
  model: string;
  fullName: string;
  categorySlug: string;
  categoryName: string;
  releaseYear: number;
  releaseDate: string;
  heroImage: string;
  galleryImages: string[];
  
  // "Bu ürünün nesi?" — Executive identity summary
  identitySummary: string;
  targetAudience: string;
  primaryStrengths: string[];
  considerations: string[];
  
  // Technical specs separated from pricing
  specGroups: SpecGroup[];
  
  // Pricing and marketplace
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  currentBestPrice?: number;
  offers: PriceOffer[];
  priceHistory: PriceHistoryPoint[];
  
  // Reliability score
  overallTrustScore: number; // e.g. 98/100
  dataSourcesCount: number;
  lastOverallVerification: string;
  
  // User interest metrics
  viewCount: number;
  compareCount: number;
  isTrending?: boolean;

  // Epey tarzı Neyin Nesi Puanı ve Alt Puanlamalar
  score?: ProductScore;

  // Anlık Canlı Fiyat Düşüşü Radarı ("Fiyatı 5 dk önce düştü!")
  priceDropAlert?: PriceDropAlert;

  // true ise ürünün hiçbir gerçek mağaza teklifi yok; fiyat/stok örnek veridir
  isDemoData?: boolean;

  // Popüler Karşılaştırmalar (En Çok Kıyaslanan Rakipler)
  popularComparisons?: PopularComparison[];

  // 3 Katmanlı Kategori Taksonomisi (Tier-1: Donanım, Tier-2: Market/Pet/Kamp, Tier-3: Dijital Hediye Kartı/Kod)
  tier?: 'tier1_deep_tech' | 'tier2_general_market' | 'tier3_digital_voucher';
  barcode?: string; // EAN-13, GTIN, UPC barkodu
  
  // Tier-2 ve Genel Kategoriler için Esnek Özellikler (Key-Value)
  dynamicAttributes?: Array<{
    key: string;
    label: string;
    value: string | number | boolean;
    unit?: string;
    isHighlight?: boolean;
  }>;

  // Tier-3 Dijital Ürünler ve Hediye Kartları Detayı
  voucherDetails?: {
    nominalValue: number;
    currency: string;
    platform: string; // Apple App Store, Steam, Google Play, vb.
    format: 'Dijital Kod (E-Pin)' | 'Fiziksel Kart' | 'Hediye Çeki';
    validity?: string; // "Süresiz", "1 Yıl", vb.
  };

  // Epey/Global Master-Product & Bölgesel Varyant Altyapısı
  masterId?: string;
  isMaster?: boolean;
  marketRegion?: 'TR' | 'EU' | 'US' | 'CN' | 'MEA' | 'GLOBAL';
  marketName?: string;
  supportedLanguages?: string[];
  keyboardLayout?: string;
  plugType?: string;
  warrantyBadge?: string;
  ramGb?: number;
  storageGb?: number;
  mpn?: string;
  variants?: Array<{
    id: string;
    slug: string;
    model: string;
    fullName: string;
    barcode?: string;
    currentBestPrice?: number;
    marketRegion?: string;
    marketName?: string;
    keyboardLayout?: string;
    plugType?: string;
    warrantyBadge?: string;
    ramGb?: number;
    storageGb?: number;
    mpn?: string;
  }>;
  officialLinks?: Array<{ country: string; label: string; url: string }>;
  dataSources?: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
  featuredSpecKeys: string[];
}

export interface GuideTerm {
  slug: string;
  title: string; // e.g. "OLED Nedir?"
  shortExplanation: string;
  detailedExplanation: string;
  category: string;
  whyItMatters: string;
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  commonProducts: string[];
}

export interface CuratedCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  badgeText: string;
  productSlugs: string[];
}

export interface DataCorrectionReport {
  id: string;
  productSlug: string;
  productName: string;
  issueType: 'wrong_spec' | 'missing_spec' | 'wrong_image' | 'wrong_price' | 'other';
  fieldAffected: string;
  suggestedCorrection: string;
  sourceProof?: string;
  userEmail?: string;
  status: 'pending_review' | 'verified' | 'rejected';
  submittedAt: string;
}

export interface SearchQueryFilters {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'recommended' | 'newest' | 'most_compared' | 'price_asc' | 'price_desc';
  specs?: Record<string, string>;
}
