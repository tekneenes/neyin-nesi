import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { GuideTerm } from '../types';
import { HelpCircle, ChevronRight, ArrowRight, BookOpen } from 'lucide-react';

export const GuidesPage: React.FC = () => {
  const { navigate } = useApp();
  const [terms, setTerms] = useState<GuideTerm[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    productsApi.getGuideTerms().then(setTerms);
  }, []);

  const categories = Array.from(new Set(terms.map((t) => t.category)));

  const filteredTerms =
    selectedCategory === 'all' ? terms : terms.filter((t) => t.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
            Ana Sayfa
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">Rehberler</span>
        </nav>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#14B8A6] uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Kavram Kılavuzu</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Neyin Nesi? Teknik Terimler Rehberi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          OLED, 120 Hz, RAM, IP68, Telefoto... Karmaşık donanım kavramlarını sade dille açıklıyor, ürün seçiminize rehberlik ediyoruz.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#14B8A6] text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tüm Kavramlar ({terms.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedCategory === c
                ? 'bg-[#14B8A6] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTerms.map((term) => (
          <div
            key={term.slug}
            onClick={() => navigate(`/rehber/${term.slug}`)}
            className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#14B8A6]/60 dark:hover:border-[#14B8A6]/60 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {term.commonProducts.length} örnek ürün
              </span>
              <span className="font-semibold text-[#14B8A6] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Açıklamayı Oku <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
