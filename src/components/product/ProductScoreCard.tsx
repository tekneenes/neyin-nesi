import React from 'react';
import { ProductScore } from '../../types';
import {
  Award,
  Cpu,
  Smartphone,
  Camera,
  BatteryCharging,
  BadgePercent,
  Headphones,
  ShieldCheck,
  Smile,
  Bot,
  Code2,
  Wrench,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ProductScoreCardProps {
  score: ProductScore;
  productName: string;
}

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Cpu':
      return <Cpu className="w-3.5 h-3.5" />;
    case 'Smartphone':
      return <Smartphone className="w-3.5 h-3.5" />;
    case 'Camera':
      return <Camera className="w-3.5 h-3.5" />;
    case 'BatteryCharging':
      return <BatteryCharging className="w-3.5 h-3.5" />;
    case 'BadgePercent':
      return <BadgePercent className="w-3.5 h-3.5" />;
    case 'Headphones':
      return <Headphones className="w-3.5 h-3.5" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-3.5 h-3.5" />;
    case 'Smile':
      return <Smile className="w-3.5 h-3.5" />;
    case 'Bot':
      return <Bot className="w-3.5 h-3.5" />;
    case 'Code2':
      return <Code2 className="w-3.5 h-3.5" />;
    case 'Wrench':
      return <Wrench className="w-3.5 h-3.5" />;
    default:
      return <Layers className="w-3.5 h-3.5" />;
  }
};

export const ProductScoreCard: React.FC<ProductScoreCardProps> = ({ score, productName }) => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Banner: Overall Score & Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          {/* Radial / Badge Score Circle */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0d9488] p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#0B0F14] rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {score.overall}
              </span>
              <span className="text-[10px] font-bold text-[#14B8A6] uppercase tracking-wider mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Neyin Nesi Donanım Puanı
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {score.ratingTier}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {productName} Kategori Performansı
            </h3>
            {score.summaryVerdict && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {score.summaryVerdict}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 self-start sm:self-auto bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Doğrulanmış 40+ parametre bazlı hesaplandı</span>
        </div>
      </div>

      {/* Sub-Scores Grid with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {score.subScores.map((sub, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-50 dark:bg-[#0B0F14]/70 rounded-xl border border-slate-200/70 dark:border-slate-800/80 space-y-2 hover:border-[#14B8A6]/40 dark:hover:border-[#14B8A6]/40 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <span className="text-[#14B8A6]">{getIcon(sub.icon)}</span>
                <span>{sub.name}</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {sub.score} <span className="text-[10px] text-slate-400 font-normal">/100</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  sub.score >= 90
                    ? 'bg-gradient-to-r from-emerald-500 to-[#14B8A6]'
                    : sub.score >= 80
                    ? 'bg-gradient-to-r from-[#14B8A6] to-cyan-500'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${sub.score}%` }}
              />
            </div>

            {sub.verdict && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium text-right">
                {sub.verdict}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
