import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { productsApi } from '../../api/productsApi';
import { Product } from '../../types';
import { Search, X, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const POPULAR_SEARCHES = [
    'iPhone 17 Pro',
    'Galaxy S26 Ultra',
    'MacBook Air M4',
    'Robot Kol (Thor)',
    'PlayStation 5 Pro',
    'AirPods Pro 3',
    '120 Hz Ekran',
    'Titanyum',
    'OLED TV',
  ];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.search(searchTerm);
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (product: Product) => {
    setIsSearchOpen(false);
    navigate(`/urun/${product.brandSlug}/${product.slug}`);
  };

  const handleExecuteFullSearch = (term: string) => {
    setIsSearchOpen(false);
    navigate(`/ara?q=${encodeURIComponent(term)}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-[#14B8A6] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                handleExecuteFullSearch(searchTerm);
              }
            }}
            placeholder="Ürün, marka, özellik veya model ara... (Örn: 256 GB Samsung, 120Hz, M4)"
            className="flex-1 bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-xs"
            >
              Temizle
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Tags */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Tag className="w-3 h-3" /> Popüler:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchTerm(tag);
                  handleExecuteFullSearch(tag);
                }}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-[#14B8A6] hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap text-xs font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Doğrulanmış ürün veri tabanında aranıyor...
            </div>
          ) : searchTerm && results.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                "{searchTerm}" için sonuç bulunamadı.
              </p>
              <p className="text-xs text-slate-400">
                Lütfen marka adı (Apple, Samsung, Sony), model veya özellik yazarak tekrar deneyin.
              </p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="text-xs text-slate-400 px-2 pb-2 flex justify-between items-center">
                <span>Eşleşen Ürünler ({results.length})</span>
                <button
                  onClick={() => handleExecuteFullSearch(searchTerm)}
                  className="text-[#14B8A6] hover:underline flex items-center gap-1 font-medium"
                >
                  Tüm Arama Sayfasını Aç <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1.5">
                {results.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleSelect(prod)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors flex items-center justify-between gap-3 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.heroImage}
                        alt={prod.fullName}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{prod.brand}</span>
                          <span>·</span>
                          <span>{prod.categoryName}</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#14B8A6] transition-colors">
                          {prod.fullName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {prod.identitySummary}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {prod.currentBestPrice ? `${prod.currentBestPrice.toLocaleString('tr-TR')} TL` : '—'}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        %{prod.overallTrustScore} Doğruluk
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              Aramak istediğiniz ürün veya teknoloji özelliğini yukarıya yazın.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
