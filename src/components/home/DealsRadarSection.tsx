import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingDown, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface DealItem {
  slug: string;
  brandSlug: string;
  name: string;
  brand: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  sellerName: string;
  badge: string;
}

export const DealsRadarSection: React.FC = () => {
  const { navigate } = useApp();

  const deals: DealItem[] = [
    {
      slug: 'sony-wh-1000xm5',
      brandSlug: 'sony',
      name: 'Sony WH-1000XM5 Kablosuz Kulaklık',
      brand: 'Sony',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80',
      originalPrice: 15499,
      discountedPrice: 13950,
      discountPercent: 10,
      sellerName: 'İdefix',
      badge: 'Son 30 Günün En Düşüğü',
    },
    {
      slug: 'dell-xps-14-plus',
      brandSlug: 'dell',
      name: 'Dell XPS 14 Plus (OLED Dokunmatik)',
      brand: 'Dell',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80',
      originalPrice: 68999,
      discountedPrice: 61499,
      discountPercent: 11,
      sellerName: 'Hepsiburada',
      badge: 'Tarihi Dip Fiyat',
    },
    {
      slug: 'xiaomi-16-pro',
      brandSlug: 'xiaomi',
      name: 'Xiaomi 16 Pro 5G (512 GB)',
      brand: 'Xiaomi',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
      originalPrice: 69999,
      discountedPrice: 62999,
      discountPercent: 10,
      sellerName: 'Amazon TR',
      badge: 'Fırsat İndirimi',
    },
    {
      slug: 'lg-g5-oled-evo-65',
      brandSlug: 'lg',
      name: 'LG G5 OLED evo 65" 4K Smart TV',
      brand: 'LG',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
      originalPrice: 84999,
      discountedPrice: 76999,
      discountPercent: 9,
      sellerName: 'MediaMarkt',
      badge: 'Stok Sonu İndirimi',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>Fırsat Radarı & Dip Fiyatlar</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Fiyatı Düşen Popüler Ürünler
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Son günlerde fiyatı dip seviyeye gerileyen ve pazar yerlerinde gerçek indirim yakalayan modeller
          </p>
        </div>

        <button
          onClick={() => navigate('/ara')}
          className="text-sm font-semibold text-[#14B8A6] hover:text-[#0f766e] flex items-center gap-1 self-start sm:self-auto"
        >
          Tüm Fırsatları Gör <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/urun/${item.brandSlug}/${item.slug}`)}
            className="group p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#14B8A6]/60 dark:hover:border-[#14B8A6]/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Badges bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {item.badge}
                </span>

                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-xs">
                  -%{item.discountPercent}
                </span>
              </div>

              {/* Product Thumbnail */}
              <div className="w-full h-36 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {item.brand}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#14B8A6] transition-colors line-clamp-2 mt-0.5">
                {item.name}
              </h3>
            </div>

            {/* Price Box */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 line-through">
                  {item.originalPrice.toLocaleString('tr-TR')} TL
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {item.sellerName}
                </span>
              </div>

              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {item.discountedPrice.toLocaleString('tr-TR')} TL
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
