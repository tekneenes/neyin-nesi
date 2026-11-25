import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { Product, Category, GuideTerm, CuratedCollection } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Watch,
  Camera,
  Gamepad2,
  Monitor,
  Home,
  Cable,
  Bot,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  Flame,
  Gift,
  Cat,
  Tent,
  CircleDot,
  BatteryCharging,
  Zap,
  Refrigerator,
  Tablet,
} from 'lucide-react';
import { LiveStatsBanner } from '../components/home/LiveStatsBanner';
import { MatchupOfTheWeek } from '../components/home/MatchupOfTheWeek';
import { DealsRadarSection } from '../components/home/DealsRadarSection';

export const HomePage: React.FC = () => {
  const { navigate, setIsSearchOpen, addToCompare } = useApp();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [guideTerms, setGuideTerms] = useState<GuideTerm[]>([]);
  const [collections, setCuratedCollections] = useState<CuratedCollection[]>([]);
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // Quick Compare Selector State
  const [compareProd1, setCompareProd1] = useState('iphone-17-pro');
  const [compareProd2, setCompareProd2] = useState('galaxy-s26-ultra');

  useEffect(() => {
    productsApi.getTrendingProducts().then(setTrendingProducts);
    productsApi.getProducts().then(setAllCatalogProducts);
    productsApi.getCategories().then(setCategories);
    productsApi.getGuideTerms().then((terms) => setGuideTerms(terms.slice(0, 4)));
    productsApi.getCuratedCollections().then((cols) => setCuratedCollections(cols.slice(0, 3)));
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      navigate(`/ara?q=${encodeURIComponent(quickSearchInput.trim())}`);
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleLaunchCompare = () => {
    addToCompare(compareProd1);
    addToCompare(compareProd2);
    navigate('/karsilastir');
  };

  const getCategoryIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-[#14B8A6]' };
    switch (iconName) {
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'Headphones': return <Headphones {...props} />;
      case 'Tv': return <Tv {...props} />;
      case 'Watch': return <Watch {...props} />;
      case 'Camera': return <Camera {...props} />;
      case 'Gamepad2': return <Gamepad2 {...props} />;
      case 'Monitor': return <Monitor {...props} />;
      case 'Home': return <Home {...props} />;
      case 'Bot': return <Bot {...props} />;
      case 'CircleDot': return <CircleDot {...props} />;
      case 'BatteryCharging': return <BatteryCharging {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Refrigerator': return <Refrigerator {...props} />;
      case 'Tablet': return <Tablet {...props} />;
      case 'Gift': return <Gift {...props} />;
      case 'Cat': return <Cat {...props} />;
      case 'Tent': return <Tent {...props} />;
      default: return <Cable {...props} />;
    }
  };

  const POPULAR_TAGS = [
    'Apple Hediye Kartı',
    'iPhone 17 Pro',
    'Galaxy S26 Ultra',
    'Kedi Maması',
    'MacBook Air M4',
    'Steam Cüzdan',
    'AirPods Pro 3',
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-12 overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 bg-linear-to-b from-white via-slate-50/50 to-white dark:from-[#0B0F14] dark:via-[#111827]/40 dark:to-[#0B0F14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Subtle reliable kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf] bg-[#14B8A6]/10 border border-[#14B8A6]/20">
            <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
            <span>Doğrulanmış Üretici Veritabanı · 2026</span>
          </div>

          {/* Main Hero Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
            Aradığın ürünün gerçekten{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#14B8A6] to-[#0d9488]">
              neyin nesi
            </span>{' '}
            olduğunu keşfet.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Özellikleri incele, ürünleri kaynaklarıyla karşılaştır ve satın almadan önce daha bilinçli karar ver.
          </p>

          {/* Large Search Box */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="max-w-2xl mx-auto relative mt-8 shadow-lg rounded-2xl"
          >
            <div className="relative flex items-center bg-white dark:bg-[#111827] rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-[#14B8A6] transition-all p-2 pl-4">
              <Search className="w-5 h-5 text-[#14B8A6] flex-shrink-0" />
              <input
                type="text"
                value={quickSearchInput}
                onChange={(e) => setQuickSearchInput(e.target.value)}
                placeholder="Ürün, marka veya model ara... (Örn: iPhone 17 Pro, Galaxy S26 Ultra, MacBook Air...)"
                className="w-full px-3 py-2.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <span>Keşfet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-medium">Popüler aramalar:</span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/ara?q=${encodeURIComponent(tag)}`)}
                className="text-slate-600 dark:text-slate-300 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CANLI İSTATİSTİK & ÜRÜN SAYACI ŞERİDİ (GERÇEK VERİ TABANI METRİKLERİ) */}
      <LiveStatsBanner products={allCatalogProducts} />

      {/* 3. CATEGORIES DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Kategorilere Göre Keşfet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Her teknoloji kategorisi için detaylı donanım filtreleri
            </p>
          </div>
          <button
            onClick={() => navigate('/kategoriler')}
            className="text-sm font-semibold text-[#14B8A6] hover:text-[#0f766e] flex items-center gap-1"
          >
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/kategori/${cat.slug}`)}
              className="group text-left p-4 sm:p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#14B8A6]/60 dark:hover:border-[#14B8A6]/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-[#14B8A6]/10 transition-colors">
                {getCategoryIcon(cat.icon)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#14B8A6] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  {cat.productCount} model incelendi
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. HAFTANIN DÜELLOSU & ZİRVE KIYASLAMASI (İnteraktif Oylamalı) */}
      <MatchupOfTheWeek />

      {/* 5. TREND PRODUCTS (Kategori Sekmeli Akıllı Vitrin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14B8A6] uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Gündem & Keşif Vitrini</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Şu sıralar neyin nesi?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              En çok incelenen, donanım puanı yüksek ve karşılaştırılan güncel ürünler
            </p>
          </div>

          <button
            onClick={() => navigate('/ara')}
            className="text-sm font-semibold text-[#14B8A6] hover:text-[#0f766e] flex items-center gap-1 self-start md:self-auto"
          >
            Tüm Kataloğu Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Kategori Filtreleme Sekmeleri */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold no-scrollbar">
          {[
            { id: 'all', label: 'Tüm Popülerler', icon: '🔥' },
            { id: 'beyaz-esya', label: 'Beyaz Eşya', icon: '❄️' },
            { id: 'hediye-kartlari', label: 'Hediye Kartı & Kod', icon: '🎁' },
            { id: 'telefonlar', label: 'Telefonlar', icon: '📱' },
            { id: 'tabletler', label: 'Tabletler', icon: '📱' },
            { id: 'dizustu-bilgisayarlar', label: 'Laptoplar', icon: '💻' },
            { id: 'kulakliklar', label: 'Kulaklıklar', icon: '🎧' },
            { id: 'kedi-mamasi', label: 'Evcil Hayvan', icon: '🐱' },
            { id: 'robotik-acik-kaynak', label: 'Robotik', icon: '🤖' },
            { id: 'oyun-konsollari', label: 'Konsollar', icon: '🎮' },
            { id: 'televizyonlar', label: 'TV & Panel', icon: '📺' },
          ].map((tab) => {
            const isActive = selectedCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#14B8A6] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedCategoryTab === 'all'
            ? trendingProducts
            : allCatalogProducts.filter((p) => p.categorySlug === selectedCategoryTab)
          ).slice(0, 6).map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. FIRSAT RADARI & DİP FİYATLAR */}
      <DealsRadarSection />

      {/* 7. COMPARISON CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0B0F14] to-[#111827] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#14B8A6]/20 text-[#2dd4bf] border border-[#14B8A6]/30">
              <Scale className="w-4 h-4" />
              <span>Kıyaslama Motoru</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Karar veremiyor musun?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              İki veya daha fazla cihazı yan yana koy. Ekran parlaklığından batarya kapasitesine kadar tüm teknik farkları üretici doğrulamasıyla tek tabloda incele.
            </p>

            {/* Quick compare pair selector */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 bg-white/10 rounded-xl p-2.5 border border-white/10 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">1. Ürün</span>
                <span className="font-bold text-white text-sm">Apple iPhone 17 Pro</span>
              </div>

              <div className="text-center font-extrabold text-[#14B8A6] text-sm px-2">
                VS
              </div>

              <div className="flex-1 bg-white/10 rounded-xl p-2.5 border border-white/10 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">2. Ürün</span>
                <span className="font-bold text-white text-sm">Samsung Galaxy S26 Ultra</span>
              </div>

              <button
                onClick={handleLaunchCompare}
                className="px-6 py-3 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-sm font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>Karşılaştır</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "NEYİN NESİ?" BILGI REHBERLERI (TERİMLER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14B8A6] uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>Kavram Kılavuzu</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              “Neyin Nesi?” Sayfaları
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Teknik özellikleri sadece listelemiyoruz; ne anlama geldiğini anlaşılır kılıyoruz
            </p>
          </div>

          <button
            onClick={() => navigate('/rehber')}
            className="text-sm font-semibold text-[#14B8A6] hover:text-[#0f766e] flex items-center gap-1"
          >
            Tüm Rehberleri Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {guideTerms.map((term) => (
            <div
              key={term.slug}
              onClick={() => navigate(`/rehber/${term.slug}`)}
              className="p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#14B8A6]/60 dark:hover:border-[#14B8A6]/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider">
                  {term.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#14B8A6] transition-colors">
                  {term.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {term.shortExplanation}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-[#14B8A6] flex items-center gap-1">
                <span>Detaylı İncele</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. VERİ GÜVENİLİRLİK MANİFESTOSU BÖLÜMÜ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Veri Şeffaflığı İlkesi</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Her teknik verinin arkasında bir kaynak var.
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Neyin Nesi?'de hiçbir özellik tahmin edilmez. Ağırlıktan ekran parlaklığına kadar her satırın yanında üretici dokümanı veya onaylı test sertifikası gösterilir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/veri-kaynaklari')}
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity"
            >
              Doğrulama Metodolojisini Oku
            </button>
            <button
              onClick={() => navigate('/iletisim?konu=hata')}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              Veri Hatası Bildir
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
