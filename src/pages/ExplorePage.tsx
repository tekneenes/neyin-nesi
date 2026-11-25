import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { CuratedCollection, Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { Sparkles, ChevronRight, ArrowRight, Layers, ShieldCheck } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { navigate } = useApp();
  const [collections, setCollections] = useState<CuratedCollection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState<string>('2026-en-iyi-telefonlar');

  useEffect(() => {
    productsApi.getCuratedCollections().then(setCollections);
    productsApi.getProducts().then(setAllProducts);
  }, []);

  const activeCollection = collections.find((c) => c.slug === selectedCollectionSlug) || collections[0];

  const collectionProducts = activeCollection
    ? allProducts.filter((p) => activeCollection.productSlugs.includes(p.slug))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
            Ana Sayfa
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">Keşfet & Seçkiler</span>
        </nav>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#14B8A6] uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Dinamik Editör Seçkileri</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Teknolojiyi İhtiyacına Göre Keşfet
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          Yapay içerikler yerine doğrudan test ve üretici verilerine dayanan dinamik listeler.
        </p>
      </div>

      {/* Collections Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {collections.map((col) => {
          const isActive = (activeCollection?.slug === col.slug);
          return (
            <button
              key={col.id}
              onClick={() => setSelectedCollectionSlug(col.slug)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-[#14B8A6] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{col.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Collection Banner & Description */}
      {activeCollection && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#14B8A6] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{activeCollection.badgeText}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {activeCollection.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeCollection.description}
            </p>
          </div>

          <div className="text-xs text-slate-400 flex-shrink-0">
            {collectionProducts.length} doğrulanmış cihaz eşleşti
          </div>
        </div>
      )}

      {/* Curated Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collectionProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
};
