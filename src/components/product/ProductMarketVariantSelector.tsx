import React from 'react';
import { Product } from '../../types';
import { Globe, ShieldCheck, Cpu, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  product: Product;
  onSelectVariant: (slug: string) => void;
}

export const ProductMarketVariantSelector: React.FC<Props> = ({ product, onSelectVariant }) => {
  const allVariants = product.variants || [];
  const currentRegion = product.marketRegion || 'TR';

  // Benzersiz pazarlar
  const availableRegions = Array.from(
    new Set([currentRegion, ...allVariants.map((v) => v.marketRegion).filter(Boolean)])
  ) as string[];

  // Benzersiz RAM seçenekleri
  const availableRams = Array.from(
    new Set([product.ramGb, ...allVariants.map((v) => v.ramGb).filter(Boolean)])
  )
    .filter(Boolean)
    .sort((a, b) => (a as number) - (b as number)) as number[];

  // Benzersiz Depolama seçenekleri
  const availableStorages = Array.from(
    new Set([product.storageGb, ...allVariants.map((v) => v.storageGb).filter(Boolean)])
  )
    .filter(Boolean)
    .sort((a, b) => (a as number) - (b as number)) as number[];

  const getRegionBadge = (region: string) => {
    switch (region) {
      case 'TR':
        return {
          flag: '🇹🇷',
          title: 'Türkiye Resmi Pazarı',
          desc: 'Resmi distribütör garantili, standart Tip C/F priz, Türkçe Q klavye.',
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'EU':
        return {
          flag: '🇪🇺',
          title: 'Avrupa Birliği (EU)',
          desc: 'CE sertifikalı Avrupa sürümü, standart Tip C/F priz, QWERTZ/AZERTY/UK klavye.',
          bg: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300',
          dot: 'bg-blue-500',
        };
      case 'US':
        return {
          flag: '🇺🇸',
          title: 'Kuzey Amerika (ABD)',
          desc: 'ANSI klavye düzeni, 110V Tip A/B priz (dönüştürücü gerekir), uluslararası garanti.',
          bg: 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300',
          dot: 'bg-amber-500',
        };
      case 'CN':
        return {
          flag: '🇨🇳',
          title: 'Asya / Çin Pazarı',
          desc: 'Asya tipi priz, çift fiziksel SIM/özel donanım, ithalatçı garantili.',
          bg: 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300',
          dot: 'bg-rose-500',
        };
      default:
        return {
          flag: '🌐',
          title: 'Global / Uluslararası Sürüm',
          desc: 'Uluslararası standart konfigürasyon, evrensel donanım desteği.',
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-500/30 text-indigo-800 dark:text-indigo-300',
          dot: 'bg-indigo-500',
        };
    }
  };

  const activeBadge = getRegionBadge(currentRegion);

  const formatStorage = (gb?: number) => {
    if (!gb) return '';
    return gb >= 1024 ? `${gb / 1024} TB SSD` : `${gb} GB SSD`;
  };

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-850 dark:to-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      {/* 1. ÜST BİLGİ: SEÇİLİ PAZAR VE DONANIM ROZETİ */}
      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${activeBadge.bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">{activeBadge.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight">{activeBadge.title}</span>
              <span className={`w-2 h-2 rounded-full animate-pulse ${activeBadge.dot}`} />
              {currentRegion === 'TR' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  <CheckCircle2 className="w-3 h-3" />
                  Orijinal Türkçe
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                  <AlertCircle className="w-3 h-3" />
                  İthalatçı / Global
                </span>
              )}
            </div>
            <p className="text-xs opacity-90 mt-0.5 leading-snug">{activeBadge.desc}</p>
          </div>
        </div>

        {/* Küçük Priz & Garanti Hapları */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center text-[11px] font-semibold">
          {product.keyboardLayout && (
            <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-current/20 shadow-xs">
              ⌨️ {product.keyboardLayout}
            </span>
          )}
          {product.plugType && (
            <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-current/20 shadow-xs">
              🔌 {product.plugType.split('(')[0].trim()}
            </span>
          )}
          {product.warrantyBadge && (
            <span className="px-2.5 py-1 rounded-lg bg-white/70 dark:bg-black/30 border border-current/20 shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {product.warrantyBadge}
            </span>
          )}
        </div>
      </div>

      {/* 2. BÖLGESEL PAZAR SEÇİCİ SEKMELERİ */}
      {availableRegions.length > 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#14B8A6]" />
              Hedef Pazar & Garanti Sürümü
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {availableRegions.length} farklı pazar seçeneği
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableRegions.map((region) => {
              const isSelected = region === currentRegion;
              const rBadge = getRegionBadge(region);
              // Bu pazara ait bir varyant bul
              const targetVar =
                region === currentRegion
                  ? null
                  : allVariants.find((v) => v.marketRegion === region);

              return (
                <button
                  key={region}
                  onClick={() => {
                    if (targetVar) onSelectVariant(targetVar.slug);
                  }}
                  disabled={isSelected || !targetVar}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm ring-2 ring-[#14B8A6]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#14B8A6] hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <span>{rBadge.flag}</span>
                  <span>{region === 'TR' ? 'Türkiye (TR)' : region === 'EU' ? 'Avrupa (EU)' : region === 'US' ? 'ABD (US)' : region}</span>
                  {isSelected && <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#14B8A6] text-white">Aktif</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DONANIM / KAPASİTE SEÇİCİ (RAM & SSD) */}
      {(availableRams.length > 1 || availableStorages.length > 1) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          {/* RAM Seçenekleri */}
          {availableRams.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#14B8A6]" />
                Bellek (RAM)
              </span>
              <div className="flex flex-wrap gap-2">
                {availableRams.map((ram) => {
                  const isSelected = ram === product.ramGb;
                  const matchVar =
                    ram === product.ramGb
                      ? null
                      : allVariants.find((v) => v.ramGb === ram);

                  return (
                    <button
                      key={ram}
                      onClick={() => {
                        if (matchVar) onSelectVariant(matchVar.slug);
                      }}
                      disabled={isSelected || !matchVar}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#14B8A6] text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#14B8A6]'
                      }`}
                    >
                      {ram} GB
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Depolama Seçenekleri */}
          {availableStorages.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-[#14B8A6]" />
                Dahili Depolama (SSD/ROM)
              </span>
              <div className="flex flex-wrap gap-2">
                {availableStorages.map((storage) => {
                  const isSelected = storage === product.storageGb;
                  const matchVar =
                    storage === product.storageGb
                      ? null
                      : allVariants.find((v) => v.storageGb === storage);

                  return (
                    <button
                      key={storage}
                      onClick={() => {
                        if (matchVar) onSelectVariant(matchVar.slug);
                      }}
                      disabled={isSelected || !matchVar}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-[#14B8A6] text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#14B8A6]'
                      }`}
                    >
                      {formatStorage(storage)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
