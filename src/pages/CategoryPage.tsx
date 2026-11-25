import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { Product, Category } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import {
  extractCategoryFacets,
  applyCategoryFilters,
  ActiveFiltersState,
  FacetGroup,
} from '../utils/filterEngine';
import {
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles,
  Search,
  Check,
  Tag,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { currentPath, routeParams, navigate } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Filters State
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [onlyMultiOffers, setOnlyMultiOffers] = useState<boolean>(false);
  const [minPriceInput, setMinPriceInput] = useState<number>(0);
  const [maxPriceInput, setMaxPriceInput] = useState<number>(150000);
  const [specFilters, setSpecFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState<ActiveFiltersState['sortBy']>('recommended');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [collapsedFacets, setCollapsedFacets] = useState<Record<string, boolean>>({});
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  const categorySlug = routeParams.category || '';

  // Fetch categories
  useEffect(() => {
    productsApi.getCategories().then((cats) => {
      setCategories(cats);
      if (categorySlug) {
        const cat = cats.find((c) => c.slug === categorySlug);
        setCurrentCategory(cat || null);
      } else {
        setCurrentCategory(null);
      }
    });
  }, [categorySlug]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    productsApi
      .getProducts({
        category: categorySlug || undefined,
      })
      .then((prods) => {
        setAllProducts(prods);
        setLoading(false);
      });
  }, [categorySlug]);

  // Reset filters and page when changing category
  useEffect(() => {
    setSelectedBrands([]);
    setSelectedSellers([]);
    setOnlyMultiOffers(false);
    setMinPriceInput(0);
    setMaxPriceInput(350000);
    setSpecFilters({});
    setBrandSearchQuery('');
    setCurrentPage(1);
  }, [categorySlug]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, selectedSellers, onlyMultiOffers, minPriceInput, maxPriceInput, specFilters, sortBy]);

  // Dynamically extract facets from current category's products
  const facets = useMemo(() => {
    return extractCategoryFacets(allProducts, categorySlug || undefined);
  }, [allProducts, categorySlug]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return applyCategoryFilters(allProducts, {
      selectedBrands,
      selectedSellers,
      onlyMultiOffers,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      specFilters,
      sortBy,
    });
  }, [
    allProducts,
    selectedBrands,
    selectedSellers,
    onlyMultiOffers,
    minPriceInput,
    maxPriceInput,
    specFilters,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Total active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (selectedSellers.length > 0) count += selectedSellers.length;
    if (onlyMultiOffers) count += 1;
    if (minPriceInput > 0 || maxPriceInput < 150000) count += 1;
    for (const vals of Object.values(specFilters)) {
      count += vals.length;
    }
    return count;
  }, [selectedBrands, selectedSellers, onlyMultiOffers, minPriceInput, maxPriceInput, specFilters]);

  const resetAllFilters = () => {
    setSelectedBrands([]);
    setSelectedSellers([]);
    setOnlyMultiOffers(false);
    setMinPriceInput(0);
    setMaxPriceInput(150000);
    setSpecFilters({});
    setBrandSearchQuery('');
  };

  const toggleBrand = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
  };

  const toggleSeller = (sellerName: string) => {
    setSelectedSellers((prev) =>
      prev.includes(sellerName) ? prev.filter((s) => s !== sellerName) : [...prev, sellerName]
    );
  };

  const toggleSpecValue = (facetId: string, val: string) => {
    setSpecFilters((prev) => {
      const current = prev[facetId] || [];
      const updated = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      if (updated.length === 0) {
        const copy = { ...prev };
        delete copy[facetId];
        return copy;
      }
      return { ...prev, [facetId]: updated };
    });
  };

  const toggleFacetCollapse = (facetId: string) => {
    setCollapsedFacets((prev) => ({
      ...prev,
      [facetId]: !prev[facetId],
    }));
  };

  // Filtered brands for brand search box
  const visibleBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return facets.brands;
    const q = brandSearchQuery.toLowerCase();
    return facets.brands.filter((b) => b.value.toLowerCase().includes(q));
  }, [facets.brands, brandSearchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Ana Sayfa
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => navigate('/kategoriler')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors ${
              !currentCategory ? 'font-bold text-slate-900 dark:text-white' : ''
            }`}
          >
            Kategoriler
          </button>
          {currentCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-white">{currentCategory.name}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              {currentCategory ? currentCategory.name : 'Tüm Donanım & Ürün Kataloğu'}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#14B8A6] border border-teal-200 dark:border-teal-800">
                {allProducts.length} Gerçek Model
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {currentCategory
                ? currentCategory.description
                : 'Türkiye yetkili teknoloji mağazalarının canlı fiyatları, çapraz mağaza tasarruf fırsatları ve üretici teknik şartnameleri.'}
            </p>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#14B8A6]" /> Sırala:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-800 dark:text-white shadow-sm"
            >
              <option value="recommended">⭐ Önerilen (Güven Skoru & Çoklu Teklif)</option>
              <option value="savings_desc">💰 En Yüksek Tasarruf / Fırsat</option>
              <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="newest">En Yeni Modeller</option>
              <option value="most_compared">En Çok Karşılaştırılanlar</option>
            </select>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#14B8A6]" />
              <span>Filtreler {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs no-scrollbar">
        <button
          onClick={() => navigate('/kategoriler')}
          className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            !currentCategory
              ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tümü ({categories.reduce((acc, c) => acc + c.productCount, 0)})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/kategori/${cat.slug}`)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentCategory?.slug === cat.slug
                ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                currentCategory?.slug === cat.slug
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.productCount}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Filter Sidebar (Desktop + Mobile Sheet) */}
        <aside
          className={`${
            showMobileFilters ? 'block fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 md:p-0 md:static md:bg-transparent' : 'hidden'
          } md:block md:col-span-1`}
        >
          <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
            {/* Sidebar Title & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#14B8A6]" />
                Detaylı Filtreler
                {activeFiltersCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#14B8A6] text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-[#14B8A6] hover:underline font-semibold"
                  >
                    Sıfırla
                  </button>
                )}
                {showMobileFilters && (
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 1. Multi-Seller / Savings Filter */}
            {facets.multiOfferCount > 0 && (
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyMultiOffers}
                    onChange={(e) => setOnlyMultiOffers(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6] accent-[#14B8A6]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-emerald-500" />
                      Fiyat Karşılaştırmalı Ürünler
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      En az 2 farklı mağaza teklifi olan {facets.multiOfferCount} modeli listele.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* 2. Price Range (Inputs + Slider) */}
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">Fiyat Aralığı (TL)</span>
                <span className="text-[11px] font-semibold text-[#14B8A6]">
                  {minPriceInput.toLocaleString('tr-TR')} - {maxPriceInput.toLocaleString('tr-TR')} TL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">En Az</span>
                  <input
                    type="number"
                    min={0}
                    max={maxPriceInput}
                    step={1000}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#14B8A6] outline-none"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">En Çok</span>
                  <input
                    type="number"
                    min={minPriceInput}
                    max={350000}
                    step={1000}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(Number(e.target.value) || 350000)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-[#14B8A6] outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={350000}
                step={2500}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(Number(e.target.value))}
                className="w-full accent-[#14B8A6] cursor-pointer"
              />
            </div>

            {/* 3. Brands (Multi-Select with Search) */}
            {facets.brands.length > 0 && (
              <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Marka ({facets.brands.length})
                  </span>
                  {selectedBrands.length > 0 && (
                    <button
                      onClick={() => setSelectedBrands([])}
                      className="text-[10px] text-[#14B8A6] hover:underline"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {facets.brands.length > 6 && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={brandSearchQuery}
                      onChange={(e) => setBrandSearchQuery(e.target.value)}
                      placeholder="Marka ara..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-[#14B8A6]"
                    />
                  </div>
                )}

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs custom-scrollbar">
                  {visibleBrands.map((b) => {
                    const isSelected = selectedBrands.includes(b.value);
                    return (
                      <label
                        key={b.value}
                        onClick={() => toggleBrand(b.value)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6] accent-[#14B8A6]"
                          />
                          <span>{b.value}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          {b.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Dynamic Category Facets (Collapsible Accordions) */}
            {facets.specFacets.map((facet) => {
              const isCollapsed = collapsedFacets[facet.id];
              const selectedValues = specFilters[facet.id] || [];

              return (
                <div key={facet.id} className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div
                    onClick={() => toggleFacetCollapse(facet.id)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#14B8A6] transition-colors">
                        {facet.label}
                      </span>
                      {selectedValues.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#14B8A6] text-white">
                          {selectedValues.length}
                        </span>
                      )}
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 text-xs custom-scrollbar">
                      {facet.options.map((opt) => {
                        const isChecked = selectedValues.includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            onClick={() => toggleSpecValue(facet.id, opt.value)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6] accent-[#14B8A6]"
                              />
                              <span className="truncate max-w-[150px]" title={opt.value}>
                                {opt.value}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                              {opt.count}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 5. Stores / Sellers Filter */}
            {facets.sellers.length > 1 && (
              <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Mağazalar ({facets.sellers.length})
                </span>
                <div className="space-y-1 text-xs">
                  {facets.sellers.map((s) => {
                    const isSelected = selectedSellers.includes(s.value);
                    return (
                      <label
                        key={s.value}
                        onClick={() => toggleSeller(s.value)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-[#14B8A6] focus:ring-[#14B8A6] accent-[#14B8A6]"
                          />
                          <span>{s.value}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          {s.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Verification Guarantee Box */}
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>%100 Doğrulanmış Veri</span>
              </div>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed text-[10.5px]">
                Katalogdaki donanım özellikleri yetkili teknik veri tabanlarından ve gerçek XML akışlarından derlenmiştir.
              </p>
            </div>

            {/* Mobile Apply Button */}
            {showMobileFilters && (
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 bg-[#14B8A6] text-white text-xs font-bold rounded-xl shadow-md hover:bg-teal-600 transition-colors"
              >
                Sonuçları Göster ({filteredProducts.length})
              </button>
            )}
          </div>
        </aside>

        {/* Right Main Column: Active Filter Chips + Product Grid */}
        <div className="md:col-span-3 space-y-4">
          {/* Active Filter Chips Bar */}
          {activeFiltersCount > 0 && (
            <div className="p-3 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5 text-[#14B8A6]" /> Seçili:
              </span>

              {/* Brands chips */}
              {selectedBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors group"
                >
                  <span className="font-semibold">{b}</span>
                  <X className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                </button>
              ))}

              {/* Sellers chips */}
              {selectedSellers.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSeller(s)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors group"
                >
                  <span>Mağaza: {s}</span>
                  <X className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                </button>
              ))}

              {/* Multi-offer chip */}
              {onlyMultiOffers && (
                <button
                  onClick={() => setOnlyMultiOffers(false)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors group font-semibold"
                >
                  <span>Çoklu Mağaza / Tasarruf</span>
                  <X className="w-3 h-3 text-emerald-500 group-hover:text-rose-600" />
                </button>
              )}

              {/* Spec filters chips */}
              {Object.entries(specFilters).flatMap(([facetId, vals]) =>
                vals.map((val) => (
                  <button
                    key={`${facetId}-${val}`}
                    onClick={() => toggleSpecValue(facetId, val)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors group"
                  >
                    <span className="text-[10px] text-teal-500/80">{facetId}:</span>
                    <span className="font-semibold">{val}</span>
                    <X className="w-3 h-3 text-teal-500 group-hover:text-rose-600" />
                  </button>
                ))
              )}

              {/* Clear All */}
              <button
                onClick={resetAllFilters}
                className="text-[11px] text-[#14B8A6] hover:underline font-bold ml-auto"
              >
                Tümünü Temizle
              </button>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Toplam <strong>{filteredProducts.length}</strong> model listeleniyor
              {categorySlug && currentCategory && ` (${currentCategory.name})`}
            </span>
            {filteredProducts.some((p) => p.offers && p.offers.length > 1) && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Canlı Mağaza Fiyat Kıyaslamaları Aktif
              </span>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 px-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-[#14B8A6]">
                <Filter className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Seçtiğiniz filtre kriterlerine uygun ürün bulunamadı.
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Farklı marka veya özellik kombinasyonlarını deneyebilir ya da filtreleri sıfırlayabilirsiniz.
                </p>
              </div>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-xl text-xs font-semibold hover:bg-teal-600 transition-colors shadow-sm"
              >
                Filtreleri Temizle ({activeFiltersCount})
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Gösterilen: <strong>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredProducts.length)}</strong> / Toplam <strong>{filteredProducts.length}</strong> ürün
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#14B8A6] transition-colors"
                    >
                      Önceki
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                      let pageNum = idx + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = Math.min(totalPages - 4 + idx, Math.max(1, currentPage - 2 + idx));
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#14B8A6] text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#14B8A6]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#14B8A6] transition-colors"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
