import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { Heart, Scale, ShieldCheck, ArrowRight, Check, Sparkles, TrendingDown } from 'lucide-react';
import { calculateProductScore } from '../../utils/scoringEngine';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { navigate, addToCompare, removeFromCompare, isInCompare, isFavorite, toggleFavorite } = useApp();

  const inCompare = isInCompare(product.slug);
  const favorite = isFavorite(product.slug);
  const score = calculateProductScore(product).overall;

  const handleCardClick = () => {
    navigate(`/urun/${product.brandSlug}/${product.slug}`);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.slug);
    } else {
      addToCompare(product.slug);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.slug);
  };

  // Find 2-3 key highlight specs
  const keySpecs: string[] = [];
  product.specGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.isKeyHighlight && keySpecs.length < 3) {
        keySpecs.push(`${item.label}: ${item.value}`);
      }
    });
  });

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#14B8A6]/60 dark:hover:border-[#14B8A6]/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Top actions & Image container */}
        <div className="relative aspect-4/3 w-full bg-slate-50 dark:bg-slate-800/40 p-6 flex items-center justify-center overflow-hidden">
          <img
            src={product.heroImage?.trim() || product.galleryImages?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'}
            alt={product.fullName}
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Epey Tarzı Donanım Puanı Rozeti */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-black text-slate-900 dark:text-white bg-white/95 dark:bg-[#0B0F14]/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs z-10">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
            <span>{score} Puan</span>
          </div>


          {/* Anlık Canlı Fiyat Düşüşü Rozeti (Price Drop Radar) */}
          {product.priceDropAlert && (
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-md animate-pulse">
              <TrendingDown className="w-3 h-3" />
              <span>Fiyatı {product.priceDropAlert.droppedAt} düştü! (-%{product.priceDropAlert.dropPercentage})</span>
            </div>
          )}

          {/* Floating actions */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                favorite
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/60'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500'
              }`}
              title={favorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              aria-label="Favori Ekle"
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Quiet Trust score label (No Pill - clean text overlay) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>%{product.overallTrustScore} Doğrulanmış</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Metadata line (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{product.releaseYear}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#14B8A6] transition-colors leading-snug">
            {product.fullName}
          </h3>

          {/* Identity essence summary */}
          {!compact && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {product.identitySummary}
            </p>
          )}

          {/* Highlight specs (unboxed text) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            {keySpecs.map((spec, i) => (
              <div key={i} className="truncate">
                {spec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] text-slate-400">En Uygun Fiyat</span>
            {product.offers && product.offers.length > 1 && (
              <span className="px-1.5 py-0.2 rounded-md bg-[#14B8A6]/10 text-[#0d9488] dark:text-[#2dd4bf] font-bold text-[10px]">
                {product.offers.length} Satıcı
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            {product.priceDropAlert && (
              <span className="text-[11px] line-through text-slate-400 font-medium">
                {product.priceDropAlert.previousPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            <div className={`text-sm font-extrabold ${product.priceDropAlert ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {product.currentBestPrice
                ? `${product.currentBestPrice.toLocaleString('tr-TR')} TL`
                : 'Fiyat Yok'}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCompareToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              inCompare
                ? 'bg-[#14B8A6] text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Karşılaştırma listesine ekle/çıkar"
          >
            {inCompare ? (
              <>
                <Check className="w-3.5 h-3.5" /> Eklendi
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" /> Karşılaştır
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
