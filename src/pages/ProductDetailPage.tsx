import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { Product, SpecItem } from '../types';
import { PriceAlertModal } from '../components/modals/PriceAlertModal';
import { renderSpecValue } from '../utils/specRenderer';
import {
  ChevronRight,
  ShieldCheck,
  Scale,
  Heart,
  Bell,
  AlertTriangle,
  ExternalLink,
  Check,
  X,
  Layers,
  HelpCircle,
  TrendingDown,
  Info,
  Sparkles,
  ShoppingBag,
  Gift,
  QrCode,
  Tag,
  Globe,
  Building2,
  Award,
  FileCheck,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { ProductScoreCard } from '../components/product/ProductScoreCard';
import { PopularComparisonsSection } from '../components/product/PopularComparisonsSection';
import { PriceHistoryChart } from '../components/product/PriceHistoryChart';
import { ProductMarketVariantSelector } from '../components/product/ProductMarketVariantSelector';
import { calculateProductScore, getPopularComparisons } from '../utils/scoringEngine';

export const ProductDetailPage: React.FC = () => {
  const {
    currentPath,
    routeParams,
    navigate,
    addToCompare,
    removeFromCompare,
    isInCompare,
    isFavorite,
    toggleFavorite,
    setCorrectionProduct,
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);

  // Extract slug from routeParams or URL
  const slug = routeParams.slug || currentPath.split('/').pop() || '';

  useEffect(() => {
    productsApi.getProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productsApi
      .getProductBySlug(slug)
      .then((p) => {
        setProduct(p);
        if (p) {
          const validImg = p.heroImage?.trim() || p.galleryImages?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80';
          setSelectedImage(validImg);
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500">Ürün ve doğrulanmış teknik veriler yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ürün Bulunamadı</h2>
        <p className="text-sm text-slate-500">Aradığınız ürün katalogda bulunamadı veya kaldırılmış olabilir.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#14B8A6] text-white font-semibold text-sm rounded-xl hover:bg-[#0d9488] transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const productScore = product ? calculateProductScore(product) : null;
  const popularComparisons = product ? getPopularComparisons(product, allProducts) : [];

  const inCompare = isInCompare(product.slug);
  const favorite = isFavorite(product.slug);

  const handleCompareClick = () => {
    if (inCompare) {
      removeFromCompare(product.slug);
    } else {
      addToCompare(product.slug);
    }
  };

  const handleReportError = (fieldLabel?: string) => {
    setCorrectionProduct({
      slug: product.slug,
      name: product.fullName,
      defaultField: fieldLabel || 'Genel Teknik Özellikler',
    });
  };

  // Collect key highlight specs across all groups (Epey tarzı Temel Özellikler)
  // Only include concise, high-impact specs (prevent long paragraphs from stretching cards)
  const keySpecs: SpecItem[] = [];
  const priorityLabels = [
    'Ses Çıkışı',
    'Bağlantı Tipi',
    'Bluetooth',
    'Bluetooth Standardı',
    'Hassasiyet',
    'Empedans',
    'Mikrofon',
    'Kumanda',
    'Sürücü Çapı',
    'Kullanım Süresi (Genel)',
    'Gürültü Engelleme (Dinleme)',
    'Gürültü Engelleme (ANC)',
    'Yüksek Çözünürlüklü Ses (Hi-Res)',
    'Ağırlık',
    'Ekran Boyutu',
    'Ekran Yenileme Hızı',
    'Yonga Seti (Chipset)',
    'İşlemci (Chipset)',
    'Bellek (RAM)',
    'Dahili Depolama',
    'Batarya Kapasitesi',
    'Hızlı Şarj Gücü',
    'Ana Kamera Çözünürlüğü',
    'Serbestlik Derecesi (DOF)',
    'Taşıma Kapasitesi (Payload)',
  ];

  // 1. Add priority labels if they match
  priorityLabels.forEach((pLabel) => {
    for (const group of product.specGroups) {
      const found = group.items.find((it) => it.label.toLowerCase() === pLabel.toLowerCase());
      if (found && !keySpecs.some((k) => k.label === found.label)) {
        keySpecs.push(found);
        break;
      }
    }
  });

  // 2. Fallback: add items with isKeyHighlight or short values (< 30 chars) if still fewer than 12
  if (keySpecs.length < 12) {
    product.specGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (
          (item.isKeyHighlight || keySpecs.length < 12) &&
          item.value.length <= 35 &&
          !keySpecs.some((k) => k.label === item.label)
        ) {
          keySpecs.push(item);
        }
      });
    });
  }



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
      {/* 1. BREADCRUMB & METADATA BAR (İki sütun da tam olarak aynı yatay hizada) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">
        {/* Sol Sütun (5 cols): Breadcrumb */}
        <nav aria-label="Breadcrumb" className="lg:col-span-5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white shrink-0">
            Ana Sayfa
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => navigate(`/kategori/${product.categorySlug}`)}
            className="hover:text-slate-900 dark:hover:text-white shrink-0"
          >
            {product.categoryName}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 shrink-0">{product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white truncate">{product.model}</span>
        </nav>

        {/* Sağ Sütun (7 cols): Ürün Meta Bilgileri */}
        <div className="lg:col-span-7 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-bold text-slate-700 dark:text-slate-300">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{product.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>{product.releaseDate}</span>
          <span aria-hidden="true">·</span>
          <span>Son Doğrulama: {product.lastOverallVerification}</span>
        </div>
      </div>

      {/* 2. PRODUCT HERO SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Media Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-4/3 sm:aspect-square w-full rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-8 flex items-center justify-center relative overflow-hidden shadow-xs">
            <img
              src={selectedImage?.trim() || product.heroImage?.trim() || product.galleryImages?.find((g) => g?.trim()) || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'}
              alt={product.fullName}
              className="max-h-full max-w-full object-contain"
            />
            {/* Quick Verification Shield */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-slate-200/60 dark:border-slate-800 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>%{product.overallTrustScore} Doğrulanmış Veri</span>
            </div>
          </div>

          {/* Thumbnails */}
          {product.galleryImages?.filter((img) => Boolean(img?.trim())).length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.galleryImages
                .filter((img) => Boolean(img?.trim()))
                .map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl border p-1 bg-white dark:bg-[#111827] flex-shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
              {product.fullName}
            </h1>

            {/* Badges: Tier, Barcode & Category */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {product.tier === 'tier3_digital_voucher' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Gift className="w-3.5 h-3.5" />
                  Dijital Hediye Kartı / E-Pin (Tier-3)
                </span>
              )}
              {product.tier === 'tier2_general_market' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Tüketim & Market / Kamp (Tier-2)
                </span>
              )}
              {product.barcode && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  Barkod / EAN: {product.barcode}
                </span>
              )}
            </div>
          </div>

          {/* BÖLGESEL PAZAR, KLAVYE VE DONANIM VARYANT SEÇİCİSİ */}
          <ProductMarketVariantSelector
            product={product}
            onSelectVariant={(variantSlug) => navigate(`/urun/${variantSlug}`)}
          />

          {/* DYNAMIC ATTRIBUTES (For Tier-2 and Tier-3 Products) */}
          {product.dynamicAttributes && product.dynamicAttributes.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#14B8A6]" />
                Kategori Nitelikleri & Özellikler
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.dynamicAttributes.map((attr) => (
                  <div
                    key={attr.key}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="text-[11px] text-slate-400 truncate">{attr.label}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {String(attr.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* "BU ÜRÜNÜN NESİ?" — EXECUTIVE PRODUCT IDENTITY */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Bu ürünün nesi?
              </h2>
              <span className="text-[11px] text-slate-400">Doğrulanmış Ürün Kimliği</span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {product.identitySummary}
            </p>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">Kimin İçin Uygun?</strong>{' '}
              {product.targetAudience}
            </div>

            {/* Strengths and considerations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
              <div>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                  Öne Çıkan Güçlü Yönleri
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {product.primaryStrengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                  Satın Almadan Önce Bilinmesi Gerekenler
                </span>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  {product.considerations.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500">!</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* PRICE DROP ALERT BANNER (Fiyatı 5 dk önce düştü) */}
          {product.priceDropAlert && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between text-xs animate-in fade-in shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center shadow-xs">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-rose-700 dark:text-rose-300 text-sm flex items-center gap-1.5">
                    <span>🔥 Fiyatı {product.priceDropAlert.droppedAt} Düştü!</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                      -%{product.priceDropAlert.dropPercentage}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5 text-xs">
                    Önceki Fiyat: <span className="line-through font-medium">{product.priceDropAlert.previousPrice.toLocaleString('tr-TR')} TL</span>{' '}
                    &rarr; Yeni En Uygun: <strong className="text-rose-600 dark:text-rose-400 font-bold">{product.priceDropAlert.currentPrice.toLocaleString('tr-TR')} TL</strong>{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">({product.priceDropAlert.dropAmount.toLocaleString('tr-TR')} TL Kazanç)</span>
                  </div>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-xs">
                {product.priceDropAlert.sellerName}
              </span>
            </div>
          )}


          {/* Pricing bar */}
          <div className="p-4 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Güncel En Uygun Fiyat</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {product.currentBestPrice
                  ? `${product.currentBestPrice.toLocaleString('tr-TR')} TL`
                  : 'Fiyat bulunamadı'}
              </div>
              {product.priceRange && (
                <div className="text-xs text-slate-500">
                  Fiyat aralığı: {product.priceRange.min.toLocaleString('tr-TR')} –{' '}
                  {product.priceRange.max.toLocaleString('tr-TR')} TL
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPriceAlertModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                title="Fiyat düşünce haber ver"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Fiyat Takibi</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCompareClick}
              className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                inCompare
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                  : 'bg-[#14B8A6] text-white hover:bg-[#0d9488] shadow-xs'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{inCompare ? 'Karşılaştırma Listesinde' : 'Karşılaştır'}</span>
            </button>

            <button
              onClick={() => toggleFavorite(product.slug)}
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
                favorite
                  ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Favorilere ekle"
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{favorite ? 'Favorilerde' : 'Favoriye Ekle'}</span>
            </button>

            <button
              onClick={() => handleReportError()}
              className="px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-900 transition-colors text-xs font-medium flex items-center gap-1.5"
              title="Hatalı veya eksik veri bildir"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hata Bildir</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. EPEY TARZI NEYİN NESİ DONANIM & F/P PUANLAMA KARTI */}
      {productScore && (
        <ProductScoreCard score={productScore} productName={product.fullName} />
      )}

      {/* 4. EPEY TARZI KİLİT TEMEL ÖZELLİKLER BANDI (Key Highlights Strip) */}
      {keySpecs.length > 0 && (
        <section className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#14B8A6]" />
              <span>{product.model} Temel Özellikleri</span>
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              Hızlı Bakış
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {keySpecs.slice(0, 12).map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-[#0B0F14]/75 hover:bg-slate-100/70 dark:hover:bg-[#0B0F14] rounded-xl border border-slate-200/70 dark:border-slate-800/90 hover:border-[#14B8A6]/40 dark:hover:border-[#14B8A6]/40 transition-all flex flex-col justify-between min-h-[76px]"
              >
                <div
                  className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate mb-1"
                  title={item.label}
                >
                  {item.label}
                </div>
                <div className="mt-auto">
                  {renderSpecValue(item.value, item.numericValue, item.unit)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SATICI FİYATLARI VE PAZARYERİ TEKLİFLERİ (Epey / Akakçe Tarzı) */}
      {product.offers.length > 0 && (
        <section className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#14B8A6]" />
                <span>{product.model} Fiyatları</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Farklı mağazalardaki anlık fiyatlar ve stok durumları
              </p>
            </div>

            <div className="text-xs text-slate-400">
              {product.offers.length} Satıcı Teklifi Bulundu
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {product.offers.map((offer, idx) => {
              const isBest = idx === 0;
              const priceDiff = idx > 0 ? offer.price - product.offers[0].price : 0;
              return (
                <div
                  key={offer.id}
                  className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-3 rounded-xl transition-colors ${
                    isBest && product.offers.length > 1
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Store Name Badge */}
                    <div className="w-24 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider shrink-0">
                      {offer.sellerName}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {product.fullName}
                        </div>
                        {isBest && product.offers.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] tracking-wide shadow-xs flex items-center gap-1">
                            🏆 En Ucuz
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{offer.verifiedSource}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">· {offer.lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {offer.price.toLocaleString('tr-TR')} {offer.currency}
                      </div>
                      {priceDiff > 0 ? (
                        <div className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                          +{priceDiff.toLocaleString('tr-TR')} TL daha pahalı
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Ücretsiz Kargo
                        </div>
                      )}
                    </div>

                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs ${
                        isBest && product.offers.length > 1 ? 'bg-[#14B8A6] hover:bg-[#0d9488]' : 'bg-[#EA580C] hover:bg-[#C2410C]'
                      }`}
                    >
                      <span>Siteye Git</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FİYAT GEÇMİŞİ GRAFİĞİ (Trading-View Alan Grafiği & Aşağıya Azalan Renk Gradyanı) */}
          {((product.priceHistory && product.priceHistory.length > 0) || product.currentBestPrice) && (
            <PriceHistoryChart product={product} />
          )}
        </section>
      )}

      {/* 6. POPÜLER KARŞILAŞTIRMALAR (En Çok Kıyaslanan Rakipler) */}
      {popularComparisons.length > 0 && (
        <PopularComparisonsSection
          currentProduct={product}
          comparisons={popularComparisons}
          currentScore={productScore ? productScore.overall : 85}
        />
      )}

      {/* 7. DETAYLI TEKNİK ÖZELLİKLER */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Teknik Özellikler
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm teknik donanım ve katalog detayları
            </p>
          </div>
        </div>

        {/* DOĞRULANMIŞ VERİ & GÜVENİLİRLİK MERKEZİ (PREMIUM AESTHETICS) */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-500/25 bg-gradient-to-br from-[#061217] via-[#09151e] to-[#04090e] p-5 sm:p-6 shadow-xl shadow-teal-950/20 backdrop-blur-md">
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Top Bar: Icon, Title & Live Status */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 text-teal-400 shadow-md shadow-teal-500/10 shrink-0">
                <ShieldCheck className="w-6 h-6 text-teal-400" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    Doğrulanmış Teknik Özellikler & Veri Kaynakları
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    %100 Teyitli Katalog
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Bu ürünün tüm teknik donanım ve katalog değerleri bağımsız teyit süreçlerinden geçirilmiştir:
                </p>
              </div>
            </div>

            {/* Sağ Taraf: Resmi Lansman / Tanıtım Linkleri (Varsa) */}
            {Array.isArray(product.officialLinks) && product.officialLinks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {product.officialLinks.slice(0, 3).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-teal-950/60 text-slate-200 hover:text-white border border-slate-700/80 hover:border-teal-500/50 shadow-sm transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                    <span>{link.label || 'Resmi Marka Tanıtım Sayfası'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-400 transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Orta Kısım: Zengin Kaynak Kartları Izgarası */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-5">
            {((product.dataSources && product.dataSources.length > 0)
              ? product.dataSources
              : ['Üretici Resmi Kaynağı', 'Neyin Nesi Araştırma & Doğrulama Ekibi']
            ).map((srcName, idx) => {
              const isNeyinNesi = srcName.includes('Neyin Nesi');
              const isManufacturer = srcName.includes('Üretici');
              const isDistributor = srcName.includes('Distribütör');
              const isLicensed = srcName.includes('Lisanslı') || srcName.includes('Icecat');
              const isLab = srcName.includes('Laboratuvar') || srcName.includes('Test');
              const isCert = srcName.includes('Sertifikasyon') || srcName.includes('CE');

              // İkon & Meta Belirleme
              let IconComp = CheckCircle2;
              let subtitle = 'Teyit Edilmiş Veri Kaynağı';
              let cardBg = 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700';
              let iconBg = 'bg-slate-800 text-slate-300 border-slate-700';

              if (isNeyinNesi) {
                IconComp = ShieldCheck;
                subtitle = 'Editoryal Test & Güvence';
                cardBg = 'border-teal-500/40 bg-gradient-to-br from-teal-950/40 via-slate-900/70 to-slate-950/80 shadow-md shadow-teal-950/30 ring-1 ring-teal-500/20';
                iconBg = 'bg-teal-500/20 text-teal-300 border-teal-500/30';
              } else if (isManufacturer) {
                IconComp = Building2;
                subtitle = 'Resmi Lansman & Şartname';
                cardBg = 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950/70 hover:border-emerald-500/50';
                iconBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              } else if (isDistributor) {
                IconComp = FileCheck;
                subtitle = 'Yetkili İthalatçı & Garanti';
                cardBg = 'border-blue-500/30 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-950/70 hover:border-blue-500/50';
                iconBg = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
              } else if (isLicensed) {
                IconComp = Layers;
                subtitle = 'Icecat & EPREL Standart Sicili';
                cardBg = 'border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-950/70 hover:border-amber-500/50';
                iconBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
              } else if (isLab) {
                IconComp = Sparkles;
                subtitle = 'Laboratuvar Ölçüm Raporu';
                cardBg = 'border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-slate-950/70 hover:border-purple-500/50';
                iconBg = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
              } else if (isCert) {
                IconComp = Award;
                subtitle = 'CE / TSE / FCC Sertifikası';
                cardBg = 'border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-slate-900/60 to-slate-950/70 hover:border-rose-500/50';
                iconBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
              }

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${cardBg}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white block truncate">
                      {srcName}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {subtitle}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alt Bilgi Şeridi */}
          <div className="relative z-10 flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-800/60 text-[11px] text-slate-400">
            <BadgeCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Tüm verilerimiz pazarlama abartılarından arındırılmış olup doğrudan üretici şartnameleri ve tarafsız test verilerine dayanır.
            </span>
          </div>
        </div>

        {/* Single-Column Full-Width Stacked Spec Groups */}
        <div className="space-y-6">
          {product.specGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-[#14B8A6]" />
                  <span>{group.title}</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {group.items.length} özellik
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="px-6 py-3.5 grid grid-cols-12 gap-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors text-xs sm:text-sm"
                  >
                    {/* Spec Label (5 cols) */}
                    <div className="col-span-12 sm:col-span-5 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.termSlug && (
                        <button
                          onClick={() => navigate(`/rehber/${item.termSlug}`)}
                          className="text-slate-400 hover:text-[#14B8A6] transition-colors"
                          title="Bu kavramın ne anlama geldiğini öğren"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Spec Value (7 cols) */}
                    <div className="col-span-12 sm:col-span-7 font-medium text-slate-900 dark:text-white">
                      {renderSpecValue(item.value, item.numericValue, item.unit)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Price Alert Modal */}
      {showPriceAlertModal && (
        <PriceAlertModal
          product={product}
          onClose={() => setShowPriceAlertModal(false)}
        />
      )}
    </div>
  );
};
