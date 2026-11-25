import React from 'react';
import { Product, PopularComparison } from '../../types';
import { useApp } from '../../context/AppContext';
import { Scale, Flame, ArrowRight, Zap, TrendingUp } from 'lucide-react';

interface PopularComparisonsSectionProps {
  currentProduct: Product;
  comparisons: PopularComparison[];
  currentScore: number;
}

export const PopularComparisonsSection: React.FC<PopularComparisonsSectionProps> = ({
  currentProduct,
  comparisons,
  currentScore,
}) => {
  const { addToCompare, navigate } = useApp();

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  const handleCompareClick = (targetSlug: string) => {
    addToCompare(currentProduct.slug);
    addToCompare(targetSlug);
    navigate('/karsilastir');
  };

  return (
    <section className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
            <span>Popüler Karşılaştırmalar</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kullanıcıların {currentProduct.model} ile en sık kıyasladığı amiral gemisi rakipler ve kilit farklar
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 self-start sm:self-auto flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          <span>En Çok Kıyaslananlar</span>
        </span>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-50 dark:bg-[#0B0F14]/75 rounded-2xl border border-slate-200/80 dark:border-slate-800/90 flex flex-col justify-between space-y-4 hover:border-[#14B8A6]/50 transition-all group"
          >
            {/* Badge */}
            {item.badgeText && (
              <div className="self-start">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {item.badgeText}
                </span>
              </div>
            )}

            {/* Versus Head-to-Head Visual */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Left Product (Current) */}
              <div className="flex-1 flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={currentProduct.heroImage}
                    alt={currentProduct.model}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                    {currentProduct.model}
                  </div>
                  <div className="text-[11px] font-bold text-[#14B8A6]">
                    {currentScore} Puan
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-300 shadow-inner">
                  VS
                </div>
              </div>

              {/* Right Product (Rival) */}
              <div className="flex-1 flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={item.targetProductImage}
                    alt={item.targetProductName}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px]">
                    {item.targetProductName}
                  </div>
                  <div className="text-[11px] font-bold text-amber-500">
                    {item.targetProductScore ? `${item.targetProductScore} Puan` : 'Segment Rakibi'}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Difference Callout */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                Kilit Fark:
              </span>
              {item.highlightDifference}
            </div>

            {/* Price comparison line */}
            {item.targetProductPrice && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                <span>Rakip Fiyatı:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.targetProductPrice.toLocaleString('tr-TR')} TL
                </span>
              </div>
            )}

            {/* 1-Click Compare CTA */}
            <button
              onClick={() => handleCompareClick(item.targetProductSlug)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#14B8A6] dark:bg-slate-800 dark:hover:bg-[#14B8A6] text-slate-800 dark:text-slate-200 hover:text-white dark:hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs group-hover:bg-[#14B8A6] group-hover:text-white"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Hemen Karşılaştır</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
