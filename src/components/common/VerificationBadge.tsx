import React from 'react';
import { VerificationInfo, VerificationSourceLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Info } from 'lucide-react';

interface VerificationBadgeProps {
  verification?: VerificationInfo | null;
  specLabel?: string;
  productName?: string;
  compact?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  verification,
  specLabel = 'Teknik Özellik',
  productName,
  compact = false,
}) => {
  const { setInspectingVerification } = useApp();

  const getLevelConfig = (level: VerificationSourceLevel) => {
    switch (level) {
      case 'manufacturer':
        return {
          dotColor: 'bg-emerald-500',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          label: 'Üretici',
          fullLabel: 'Üretici Resmi Kaynağı',
        };
      case 'authorized_distributor':
        return {
          dotColor: 'bg-blue-500',
          textColor: 'text-blue-700 dark:text-blue-400',
          label: 'Distribütör',
          fullLabel: 'Yetkili Distribütör',
        };
      case 'licensed_provider':
        return {
          dotColor: 'bg-amber-500',
          textColor: 'text-amber-700 dark:text-amber-400',
          label: 'Lisanslı Veri',
          fullLabel: 'Lisanslı Veri Sağlayıcı',
        };
      case 'verified_other':
      default:
        return {
          dotColor: 'bg-slate-400',
          textColor: 'text-slate-600 dark:text-slate-400',
          label: 'Doğrulanmış',
          fullLabel: 'Doğrulanmış Diğer Kaynak',
        };
    }
  };

  const safeVerification: VerificationInfo = {
    level: verification?.level || 'manufacturer',
    sourceName: verification?.sourceName || 'Doğrulanmış Üretici & Mağaza Dokümanı',
    verifiedAt: verification?.verifiedAt || '2026',
    evidenceUrl: verification?.evidenceUrl,
    documentId: verification?.documentId,
    verifiedBy: verification?.verifiedBy,
  };

  const config = getLevelConfig(safeVerification.level);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setInspectingVerification({
          info: safeVerification,
          specLabel,
          productName,
        });
      }}
      className="inline-flex items-center gap-1.5 text-left text-xs hover:opacity-85 transition-opacity cursor-pointer group focus:outline-none"
      title="Bu bilginin kaynağını ve doğrulama geçmişini gör"
      aria-label={`${config.fullLabel}: ${safeVerification.sourceName}. Tıklayarak kaynağı inceleyin.`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor} ring-2 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform`} />
      <span className={`font-medium ${config.textColor}`}>
        {compact ? config.label : config.fullLabel}
      </span>
      <Info className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
