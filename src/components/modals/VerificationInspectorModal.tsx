import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Calendar, ExternalLink, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export const VerificationInspectorModal: React.FC = () => {
  const { inspectingVerification, setInspectingVerification, setCorrectionProduct } = useApp();

  if (!inspectingVerification) return null;

  const { info, specLabel, productName } = inspectingVerification;

  const handleOpenCorrection = () => {
    const pName = productName || 'Bu Ürün';
    setInspectingVerification(null);
    setCorrectionProduct({
      slug: 'current-product',
      name: pName,
      defaultField: `${specLabel}`,
    });
  };

  const getSourceDetails = (level: string) => {
    switch (level) {
      case 'manufacturer':
        return {
          title: 'Üretici Doğrudan Kaynak',
          badgeColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          desc: 'Bu veri, doğrudan donanım üreticisinin yayınladığı resmi ürün şartnamesi, lansman basın bülteni veya yetkili mühendislik dokümanlarından alınmış ve doğrulanmıştır.',
          trustLevel: '%99.9 Güvenilirlik',
        };
      case 'authorized_distributor':
        return {
          title: 'Yetkili Distribütör & İthalatçı Kaydı',
          badgeColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          desc: 'Bu veri, resmi ithalatçı ve bölge distribütörlerinin gümrük ve sertifikasyon beyannamelerinden temin edilmiştir.',
          trustLevel: '%99.0 Güvenilirlik',
        };
      case 'licensed_provider':
        return {
          title: 'Lisanslı Test Laboratuvarı & Sağlayıcı',
          badgeColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          desc: 'Bu veri, bağımsız akredite test laboratuvarları (TÜV, UL, DisplayMate, Rtings, Geekbench) tarafından yapılan ölçümlerle belgelenmiştir.',
          trustLevel: '%98.5 Güvenilirlik',
        };
      default:
        return {
          title: 'Doğrulanmış İkincil Kaynak',
          badgeColor: 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          desc: 'Bu veri, birden fazla bağımsız teknoloji editörü ve kamuya açık teknik şemaların çapraz kontrolü ile doğrulanmıştır.',
          trustLevel: '%97.0 Güvenilirlik',
        };
    }
  };

  const details = getSourceDetails(info.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-title" className="text-base font-semibold text-slate-900 dark:text-white">
                Bu bilgi nereden geliyor?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Neyin Nesi? Veri Doğrulama Protokolü
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectingVerification(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Spec preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">İncelenen Özellik</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
              {specLabel} {productName ? `(${productName})` : ''}
            </div>
          </div>

          {/* Source classification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kaynak Seviyesi</span>
              <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${details.badgeColor}`}>
                {details.title}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {details.desc}
            </p>
          </div>

          {/* Details list */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 py-1">
            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Referans Belge / Kurum:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{info.sourceName}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Son Doğrulama Tarihi:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">{info.verifiedAt}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Doğrulama Skoru:
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{details.trustLevel}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-[#14B8A6]/5 dark:bg-[#14B8A6]/10 p-3 rounded-xl border border-[#14B8A6]/20">
            Neyin Nesi? hiçbir ürün verisini tahmine veya pazarlama iddialarına dayandırmaz. Tüm özellikler en az bir birincil veya bağımsız laboratuvar kaynağı ile eşleştirilir.
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleOpenCorrection}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-medium transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Bir hata mı buldun? Bize bildir
          </button>

          <button
            onClick={() => setInspectingVerification(null)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
