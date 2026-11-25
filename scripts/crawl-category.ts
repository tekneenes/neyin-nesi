import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Product, PriceOffer } from '../src/types';
import { saveProduct } from '../src/server/scraper/storage/dataStore';

dotenv.config({ path: '.env.local' });
dotenv.config();

interface BatchCrawlItem {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  tier: 'tier1_deep_tech' | 'tier2_general_market' | 'tier3_digital_voucher';
  barcode: string;
  nominalValue?: number;
  weight?: string;
  imageUrl: string;
  identitySummary: string;
  dynamicAttributes: Array<{ key: string; label: string; value: string | number | boolean; isHighlight?: boolean }>;
  offers: PriceOffer[];
}

// Hazır Örnek Endüstriyel Katalog Havuzları (Epey Tier-2 ve Tier-3 Kategorileri)
const SEED_CATALOGS: Record<string, BatchCrawlItem[]> = {
  'hediye-kartlari': [
    {
      id: 'prod-apple-gift-card-250',
      slug: 'apple-hediye-karti-250-tl',
      title: 'Apple 250 TL Hediye Kartı (App Store & iTunes TR)',
      brand: 'Apple',
      categorySlug: 'hediye-kartlari',
      categoryName: 'Hediye Kartı & Dijital Kodlar',
      tier: 'tier3_digital_voucher',
      barcode: '0194253321449',
      nominalValue: 250,
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
      identitySummary: 'Apple ekosistemindeki App Store, Apple Music ve iCloud+ servislerinde geçerli 250 TL bakiye.',
      dynamicAttributes: [
        { key: 'nominal_value', label: 'Bakiye Tutarı', value: '250 TL', isHighlight: true },
        { key: 'platform', label: 'Platform', value: 'Apple App Store / TR', isHighlight: true },
        { key: 'format', label: 'Teslimat', value: 'Anında E-Pin / SMS', isHighlight: true },
        { key: 'validity', label: 'Geçerlilik', value: 'Süresiz' },
      ],
      offers: [
        {
          id: 'off-hb-250',
          sellerName: 'Hepsiburada Dijital',
          sellerRating: 4.9,
          price: 242,
          originalPrice: 250,
          currency: 'TL',
          inStock: true,
          url: 'https://hepsiburada.com',
          lastUpdated: '5 dakika önce',
          verifiedSource: 'Otomatik Feed Kontrolü',
        },
        {
          id: 'off-ty-250',
          sellerName: 'Trendyol',
          sellerRating: 4.8,
          price: 245,
          originalPrice: 250,
          currency: 'TL',
          inStock: true,
          url: 'https://trendyol.com',
          lastUpdated: '15 dakika önce',
          verifiedSource: 'API Doğrulamalı',
        },
      ],
    },
    {
      id: 'prod-steam-500-tl-cuzdan',
      slug: 'steam-500-tl-cuzdan-kodu',
      title: 'Steam 500 TL Cüzdan Kodu (Global / TR)',
      brand: 'Valve Steam',
      categorySlug: 'hediye-kartlari',
      categoryName: 'Hediye Kartı & Dijital Kodlar',
      tier: 'tier3_digital_voucher',
      barcode: '0850012345678',
      nominalValue: 500,
      imageUrl: 'https://images.unsplash.com/photo-1612287232049-749e75eb82b7?auto=format&fit=crop&w=800&q=80',
      identitySummary: 'Steam mağazasında binlerce oyun ve oyun içi öğe satın alımında geçerli 500 TL bakiye.',
      dynamicAttributes: [
        { key: 'nominal_value', label: 'Bakiye Tutarı', value: '500 TL', isHighlight: true },
        { key: 'platform', label: 'Platform', value: 'Valve Steam PC', isHighlight: true },
        { key: 'format', label: 'Teslimat', value: 'Anında Dijital Kod', isHighlight: true },
        { key: 'validity', label: 'Geçerlilik', value: 'Süresiz' },
      ],
      offers: [
        {
          id: 'off-hb-steam-500',
          sellerName: 'Hepsiburada',
          sellerRating: 4.9,
          price: 490,
          originalPrice: 500,
          currency: 'TL',
          inStock: true,
          url: 'https://hepsiburada.com',
          lastUpdated: '8 dakika önce',
          verifiedSource: 'Pazaryeri Feed',
        },
        {
          id: 'off-ty-steam-500',
          sellerName: 'Trendyol',
          sellerRating: 4.8,
          price: 494,
          originalPrice: 500,
          currency: 'TL',
          inStock: true,
          url: 'https://trendyol.com',
          lastUpdated: '20 dakika önce',
          verifiedSource: 'API Feed',
        },
      ],
    },
    {
      id: 'prod-playstation-network-500',
      slug: 'playstation-network-500-tl-psn-kodu',
      title: 'PlayStation Network 500 TL PSN Cüzdan Kodu',
      brand: 'Sony PlayStation',
      categorySlug: 'hediye-kartlari',
      categoryName: 'Hediye Kartı & Dijital Kodlar',
      tier: 'tier3_digital_voucher',
      barcode: '0711719543210',
      nominalValue: 500,
      imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
      identitySummary: 'PS5 ve PS4 konsollarında PlayStation Store oyunları ve PS Plus üyelikleri için geçerli 500 TL bakiye.',
      dynamicAttributes: [
        { key: 'nominal_value', label: 'Bakiye Tutarı', value: '500 TL', isHighlight: true },
        { key: 'platform', label: 'Platform', value: 'PlayStation Store TR', isHighlight: true },
        { key: 'format', label: 'Teslimat', value: 'Anında PSN E-Pin', isHighlight: true },
        { key: 'validity', label: 'Geçerlilik', value: 'Süresiz' },
      ],
      offers: [
        {
          id: 'off-pz-psn',
          sellerName: 'Pazarama',
          sellerRating: 4.8,
          price: 485,
          currency: 'TL',
          inStock: true,
          url: 'https://pazarama.com',
          lastUpdated: '12 dakika önce',
          verifiedSource: 'Feed Entegrasyonu',
        },
      ],
    },
  ],
  'evcil-hayvan': [
    {
      id: 'prod-pro-plan-somonlu-10kg',
      slug: 'pro-plan-somonlu-yetiskin-kedi-mamasi-10-kg',
      title: 'Pro Plan Somonlu Yetişkin Kedi Maması 10 kg',
      brand: 'Purina Pro Plan',
      categorySlug: 'kedi-mamasi',
      categoryName: 'Evcil Hayvan & Mama',
      tier: 'tier2_general_market',
      barcode: '7613035123456',
      weight: '10 kg',
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      identitySummary: 'Hassas sindirime sahip kediler için somon balığı proteinli, deri ve tüy sağlığını güçlendiren 10 kg yetişkin kuru kedi maması.',
      dynamicAttributes: [
        { key: 'weight', label: 'Ağırlık', value: '10 kg', isHighlight: true },
        { key: 'life_stage', label: 'Yaş Grubu', value: 'Yetişkin (1-7 Yaş)', isHighlight: true },
        { key: 'flavor', label: 'Aroma', value: 'Gerçek Somon Balığı (%18)', isHighlight: true },
        { key: 'unit_price', label: 'Birim Fiyat', value: '198 TL / kg', isHighlight: true },
      ],
      offers: [
        {
          id: 'off-amz-pp',
          sellerName: 'Amazon Türkiye',
          sellerRating: 4.9,
          price: 1980,
          currency: 'TL',
          inStock: true,
          url: 'https://amazon.com.tr',
          lastUpdated: '10 dakika önce',
          verifiedSource: 'Amazon Otomatik Fiyat Feed',
        },
        {
          id: 'off-pet-pp',
          sellerName: 'Petlebi',
          sellerRating: 4.8,
          price: 2020,
          currency: 'TL',
          inStock: true,
          url: 'https://petlebi.com',
          lastUpdated: '35 dakika önce',
          verifiedSource: 'Petshop Feed Entegrasyonu',
        },
      ],
    },
  ],
  'kamp-outdoor': [
    {
      id: 'prod-naturehike-cloud-up-2',
      slug: 'naturehike-cloud-up-2-kisilik-cadir',
      title: 'Naturehike Cloud Up 2 Kişilik 4 Mevsim Kamp Çadırı',
      brand: 'Naturehike',
      categorySlug: 'cadir',
      categoryName: 'Kamp Çadırı & Outdoor',
      tier: 'tier2_general_market',
      barcode: '6927595712348',
      imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      identitySummary: 'Yalnızca 1.7 kg ultra hafif ağırlığa sahip, 4000 mm su geçirmezlik dereceli 2 kişilik profesyonel trekking ve kamp çadırı.',
      dynamicAttributes: [
        { key: 'capacity', label: 'Kapasite', value: '2 Kişilik', isHighlight: true },
        { key: 'weight', label: 'Ağırlık', value: '1.7 kg (Ultra Hafif)', isHighlight: true },
        { key: 'waterproof', label: 'Su Geçirmezlik', value: '4000 mm PU Kaplama', isHighlight: true },
        { key: 'season', label: 'Mevsim', value: '4 Mevsim', isHighlight: true },
      ],
      offers: [
        {
          id: 'off-amz-nh',
          sellerName: 'Amazon Türkiye',
          sellerRating: 4.9,
          price: 4350,
          currency: 'TL',
          inStock: true,
          url: 'https://amazon.com.tr',
          lastUpdated: '20 dakika önce',
          verifiedSource: 'Satıcı API',
        },
        {
          id: 'off-hb-nh',
          sellerName: 'Hepsiburada',
          sellerRating: 4.8,
          price: 4499,
          currency: 'TL',
          inStock: true,
          url: 'https://hepsiburada.com',
          lastUpdated: '1 saat önce',
          verifiedSource: 'Pazaryeri Taraması',
        },
      ],
    },
  ],
};

async function main() {
  const args = process.argv.slice(2);
  let categoryKey = 'all';

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      categoryKey = arg.replace('--category=', '');
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║    NEYİN NESİ? — Toplu Kategori & Batch Ürün Tarayıcısı        ║
╚════════════════════════════════════════════════════════════════╝
[MOD] Endüstriyel Ölçek: Toplu Tarama & Master Katalog Entegrasyonu
[HEDEF KATEGORİ]: ${categoryKey}
`);

  let itemsToProcess: BatchCrawlItem[] = [];

  if (categoryKey === 'all') {
    Object.values(SEED_CATALOGS).forEach((list) => {
      itemsToProcess.push(...list);
    });
  } else if (SEED_CATALOGS[categoryKey]) {
    itemsToProcess = SEED_CATALOGS[categoryKey];
  } else {
    console.error(`Bilinmeyen kategori: ${categoryKey}. Mevcut: hediye-kartlari, evcil-hayvan, kamp-outdoor, all`);
    process.exit(1);
  }

  console.log(`[Toplu İçe Aktarım] Toplam ${itemsToProcess.length} adet ürün işleniyor...\n`);

  let addedCount = 0;

  for (const item of itemsToProcess) {
    const minPrice = Math.min(...item.offers.map((o) => o.price));
    const maxPrice = Math.max(...item.offers.map((o) => o.price));

    const product: Product = {
      id: item.id,
      slug: item.slug,
      brand: item.brand,
      brandSlug: item.brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      model: item.title,
      fullName: item.title,
      categorySlug: item.categorySlug,
      categoryName: item.categoryName,
      releaseYear: 2026,
      releaseDate: '2026',
      heroImage: item.imageUrl,
      galleryImages: [item.imageUrl],
      identitySummary: item.identitySummary,
      targetAudience: 'Bu kategoride en iyi fiyatı ve doğrulanmış özellikleri arayan tüketiciler.',
      primaryStrengths: [
        'Anlık satıcı fiyat karşılaştırması ve stok takibi',
        'Barkod (EAN/GTIN) doğrulamalı tekilleştirilmiş ürün kartı',
        'Pazaryerleri arasındaki en ucuz teklif tespiti',
      ],
      considerations: ['Fiyatlar satıcıların canlı stok ve kampanya koşullarına göre değişkenlik gösterebilir.'],
      tier: item.tier,
      barcode: item.barcode,
      dynamicAttributes: item.dynamicAttributes,
      voucherDetails: item.nominalValue
        ? {
            nominalValue: item.nominalValue,
            currency: 'TL',
            platform: item.brand,
            format: 'Dijital Kod (E-Pin)',
            validity: 'Süresiz',
          }
        : undefined,
      specGroups: [
        {
          id: 'spec-temel',
          title: 'Temel Nitelikler',
          items: item.dynamicAttributes.map((attr, idx) => ({
            id: `sp-${idx}`,
            label: attr.label,
            value: String(attr.value),
            verification: {
              level: 'manufacturer',
              sourceName: 'Doğrulanmış Katalog Akışı',
              verifiedAt: 'Bugün',
            },
            isKeyHighlight: attr.isHighlight,
          })),
        },
      ],
      priceRange: {
        min: minPrice,
        max: maxPrice,
        currency: 'TL',
      },
      currentBestPrice: minPrice,
      offers: item.offers,
      priceHistory: [
        { date: '1 Eki', price: maxPrice },
        { date: '8 Eki', price: minPrice },
      ],
      overallTrustScore: 98,
      dataSourcesCount: item.offers.length,
      lastOverallVerification: '8 Ekim 2026',
      viewCount: 1540,
      compareCount: 120,
      isTrending: true,
    };

    saveProduct(product);
    addedCount++;
    console.log(`  ✓ Eklendi [${item.tier}]: ${product.fullName} (Barkod: ${product.barcode}) -> En ucuz: ${product.currentBestPrice} TL (${product.offers.length} Satıcı Teklifi)`);
  }

  console.log(`\n================================================================`);
  console.log(`[BAŞARILI] Toplam ${addedCount} ürün başarıyla Master Kataloğa kaydedildi!`);
  console.log(`scrapedProducts.json dosyası güncellendi.`);
  console.log(`================================================================\n`);
}

main().catch(console.error);
