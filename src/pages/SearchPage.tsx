import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { Search, Tag, X, ChevronRight, Filter } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { searchQuery, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  useEffect(() => {
    setSearchTerm(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    productsApi
      .search(searchTerm)
      .then((res) => {
        setResults(res);
      })
      .finally(() => setIsLoading(false));
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/ara?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const SUGGESTED_QUERIES = [
    'iPhone 17 Pro',
    'Galaxy S26 Ultra',
    'MacBook Air M4',
    '120 Hz Ekran',
    'Titanyum',
    'OLED TV',
    'Leica Kamera',
  ];

  // Facet categories from current results
  const categoriesInResults = Array.from(new Set(results.map((r) => r.categoryName)));

  const displayResults =
    selectedCategoryFilter === 'all'
      ? results
      : results.filter((r) => r.categoryName === selectedCategoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
            Ana Sayfa
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">Ürün Arama</span>
        </nav>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl relative">
          <div className="flex items-center bg-white dark:bg-[#111827] rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-[#14B8A6] p-2 pl-4 shadow-xs">
            <Search className="w-5 h-5 text-[#14B8A6] flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün, marka, özellik veya donanım ara... (Örn: 256 GB Samsung, 120Hz)"
              className="w-full px-3 py-2 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex-shrink-0"
            >
              Ara
            </button>
          </div>
        </form>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 text-xs">
          <span className="text-slate-400 font-medium">Örnek aramalar:</span>
          {SUGGESTED_QUERIES.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSearchTerm(tag);
                navigate(`/ara?q=${encodeURIComponent(tag)}`);
              }}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] rounded-lg text-slate-600 dark:text-slate-300 transition-colors font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {/* Filter tags bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="text-xs text-slate-500 font-medium">
            {searchTerm ? (
              <span>
                "{searchTerm}" için <strong className="text-slate-900 dark:text-white">{results.length}</strong> ürün bulundu
              </span>
            ) : (
              <span>Katalogdaki tüm ürünler ({results.length})</span>
            )}
          </div>

          {categoriesInResults.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Kategori:</span>
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-2 py-1 rounded-md font-medium ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-[#14B8A6] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tümü
              </button>
              {categoriesInResults.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedCategoryFilter(catName)}
                  className={`px-2 py-1 rounded-md font-medium whitespace-nowrap ${
                    selectedCategoryFilter === catName
                      ? 'bg-[#14B8A6] text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Arama sonuçları derleniyor...
          </div>
        ) : displayResults.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aradığınız kriterlere uygun ürün bulunamadı
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Farklı bir model veya sadece marka adını (örn: "Apple" veya "Sony") yazarak arayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayResults.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
