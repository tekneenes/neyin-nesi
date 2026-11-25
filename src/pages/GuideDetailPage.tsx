import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { GuideTerm, Product } from '../types';
import { ChevronRight, ArrowLeft, Check, AlertCircle, Sparkles, Smartphone } from 'lucide-react';

export const GuideDetailPage: React.FC = () => {
  const { currentPath, routeParams, navigate } = useApp();
  const [term, setTerm] = useState<GuideTerm | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const slug = routeParams.slug || currentPath.replace('/rehber/', '').split('/')[0] || '';

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productsApi
      .getGuideTermBySlug(slug)
      .then((t) => {
        setTerm(t);
        if (t) {
          productsApi.getProducts().then((all) => {
            const matched = all.filter((p) =>
              t.commonProducts.some((cp) => p.fullName.includes(cp) || p.model.includes(cp))
            );
            setRelatedProducts(matched);
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Rehber yükleniyor...</p>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Rehber bulunamadı
        </h2>
        <button
          onClick={() => navigate('/rehber')}
          className="px-6 py-2.5 bg-[#14B8A6] text-white text-xs font-semibold rounded-xl"
        >
          Rehberler Listesine Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
          Ana Sayfa
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => navigate('/rehber')} className="hover:text-slate-900 dark:hover:text-white">
          Rehberler
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">{term.title}</span>
      </nav>

      {/* Title & Short Summary */}
      <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">
          {term.category} Kılavuzu
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          {term.title}
        </h1>

        <div className="p-5 bg-[#14B8A6]/5 dark:bg-[#14B8A6]/10 rounded-2xl border border-[#14B8A6]/20">
          <div className="text-xs font-bold text-[#14B8A6] uppercase mb-1">Özetle Neyin Nesi?</div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {term.shortExplanation}
          </p>
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Nasıl Çalışır ve Detayları Nelerdir?
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {term.detailedExplanation}
        </p>
      </div>

      {/* Why It Matters */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Satın Alırken Neden Önemli?
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {term.whyItMatters}
        </p>
      </div>

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Avantajları
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {term.prosAndCons.pros.map((p, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-3">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Dezavantajları ve Kısıtlamaları
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {term.prosAndCons.cons.map((c, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">!</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Products utilizing this concept */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Bu Teknolojiyi Kullanan Doğrulanmış Modeller
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/urun/${p.brandSlug}/${p.slug}`)}
                className="p-4 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#14B8A6] cursor-pointer flex items-center gap-4 transition-colors"
              >
                <img src={p.heroImage} alt="" className="w-14 h-14 object-contain" />
                <div>
                  <div className="text-xs text-slate-500">{p.brand}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{p.model}</div>
                  <div className="text-xs text-[#14B8A6] font-semibold">
                    {p.currentBestPrice ? `${p.currentBestPrice.toLocaleString('tr-TR')} TL` : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
