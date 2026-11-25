import React from 'react';
import { Check, X } from 'lucide-react';

interface RenderSpecOptions {
  compact?: boolean;
}

/**
 * Teknik özellik değerlerini (Var/Yok + Ek Açıklama Notları, Çoklu Rozetler, Ölçüler)
 * modern ve zengin bir görsel formatta render eder.
 */
export function renderSpecValue(
  val: string | undefined | null,
  numeric?: number,
  unit?: string,
  options: RenderSpecOptions = {}
): React.ReactNode {
  if (!val || typeof val !== 'string' || val.trim() === '') {
    return <span className="text-slate-400 font-normal">—</span>;
  }

  const trimmed = val.trim();
  const vLower = trimmed.toLowerCase();

  // 1. "YOK" DURUMLARI (Örn: "Yok", "Yok Donanımsal 2D/3D Arayüz...", "Yok (Not)")
  if (
    vLower === 'yok' ||
    vLower.startsWith('yok ') ||
    vLower.startsWith('yok,') ||
    vLower.startsWith('yok(') ||
    vLower.startsWith('yok:') ||
    vLower.startsWith('yok -')
  ) {
    const extraNote = trimmed
      .replace(/^yok[\s,:\-\(\)]*/i, '')
      .replace(/\)$/, '')
      .trim();

    return (
      <div className="inline-flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/25 text-xs shrink-0">
          <X className="w-3.5 h-3.5" />
          <span>Yok</span>
        </span>
        {extraNote && (
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {extraNote}
          </span>
        )}
      </div>
    );
  }

  // 2. "VAR" DURUMLARI (Örn: "Var", "Var (Donanımsal Güç Tasarruf Çipi)", "Var - 5 dk şarj")
  if (
    vLower === 'var' ||
    vLower.startsWith('var ') ||
    vLower.startsWith('var,') ||
    vLower.startsWith('var(') ||
    vLower.startsWith('var:') ||
    vLower.startsWith('var -')
  ) {
    const extraNote = trimmed
      .replace(/^var[\s,:\-\(\)]*/i, '')
      .replace(/\)$/, '')
      .trim();

    return (
      <div className="inline-flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/25 text-xs shrink-0">
          <Check className="w-3.5 h-3.5" />
          <span>Var</span>
        </span>
        {extraNote && (
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {extraNote}
          </span>
        )}
      </div>
    );
  }

  // 3. "OPSİYONEL" DURUMLARI (Örn: "Opsiyonel", "Opsiyonel (eSIM Modeli)")
  if (vLower.startsWith('opsiyonel')) {
    const extraNote = trimmed
      .replace(/^opsiyonel[\s,:\-\(\)]*/i, '')
      .replace(/\)$/, '')
      .trim();

    return (
      <div className="inline-flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/25 text-xs shrink-0">
          <span>Opsiyonel</span>
        </span>
        {extraNote && (
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {extraNote}
          </span>
        )}
      </div>
    );
  }

  // 4. ÇOKLU DEĞER KONTROLÜ (Virgül, noktalı virgül veya alt alta satırlar)
  // Çözünürlük ve boyut ölçülerini (örn: "466 x 466 pixels", "47.3 x 47.3 x 12 mm") bölme
  const isDimensionOrResolution = /^\d+(\.\d+)?\s*x\s*\d+/i.test(trimmed);
  if (!isDimensionOrResolution) {
    // Parantez içi virgülleri koruyarak böl (Örn: "BeiDou (BDS), Galileo")
    const parts = trimmed.includes('\n')
      ? trimmed.split('\n').map(p => p.trim()).filter(Boolean)
      : trimmed
          .split(/;|\s*,\s*(?![^()]*\))/)
          .map(p => p.trim())
          .filter(Boolean);

    if (parts.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5 py-0.5">
          {parts.map((part, pIdx) => (
            <span
              key={pIdx}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/70 hover:border-[#14B8A6]/50 transition-colors"
            >
              {part}
            </span>
          ))}
        </div>
      );
    }
  }

  // 5. STANDART TEK DEĞER (Metin veya Sayı + Birim)
  return (
    <span className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm leading-snug break-words">
      {trimmed}
    </span>
  );
}
