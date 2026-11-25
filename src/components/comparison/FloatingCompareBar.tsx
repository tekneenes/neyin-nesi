import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { productsApi } from '../../api/productsApi';
import { Product } from '../../types';
import { Scale, ArrowRight, X, Trash2 } from 'lucide-react';

export const FloatingCompareBar: React.FC = () => {
  const { compareList, removeFromCompare, clearCompare, navigate, currentPath } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (compareList.length === 0) {
      setProducts([]);
      return;
    }
    productsApi.getProductsByIds(compareList).then(setProducts);
  }, [compareList]);

  // Don't show while already on compare page
  if (compareList.length === 0 || currentPath === '/karsilastir') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl animate-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[#0B0F14]/95 text-white backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3">
        {/* Left: Products mini avatars */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center -space-x-2 flex-shrink-0">
            {products.map((p) => (
              <div
                key={p.id}
                className="relative group w-10 h-10 rounded-xl bg-white p-1 border-2 border-[#0B0F14] overflow-hidden shadow-xs flex-shrink-0"
                title={p.fullName}
              >
                <img src={p.heroImage} alt={p.model} className="w-full h-full object-contain" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCompare(p.slug);
                  }}
                  className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title="Kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Karşılaştırma Listesi</span>
              <span className="text-[#14B8A6]">({products.length}/4)</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate hidden sm:block">
              {products.map((p) => p.model).join(' vs ')}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-xl"
            title="Tümünü Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/karsilastir')}
            className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Karşılaştır</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
