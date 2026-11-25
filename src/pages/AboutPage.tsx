import React from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { ShieldCheck, Target, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
          Ana Sayfa
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">Hakkımızda</span>
      </nav>

      {/* Hero */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[#0f766e] dark:text-[#2dd4bf] bg-[#14B8A6]/10 border border-[#14B8A6]/20">
          <Target className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>Misyonumuz</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Neyin Nesi? — Anla. Karşılaştır. Karar ver.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          İnternette ürün bilgisi çok fazla, fakat doğru ve şeffaf bilgiye ulaşmak her zaman kolay değil. Neyin Nesi?, teknoloji dünyasındaki dağınık bilgileri anlaşılır, kıyaslanabilir ve kaynakları doğrulanabilir hale getirmek için kuruldu.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Alışveriş Sitesi Değiliz</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Amacımız ürün satmak veya sizi bir mağazaya yönlendirmek değil; satın almadan önce ürünün ne olduğunu gerçek anlamda kavramanıza yardımcı olmaktır.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Kaynak Şeffaflığı</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            “Bu bilgi nereden geliyor?” sorusuna her zaman cevap veririz. Hiçbir teknik özellik tahmine dayalı olarak listelenmez.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Anlaşılır Dil</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Teknik terimleri gizemli kısaltmalar olmaktan çıkarıp “Neyin Nesi?” rehberlerimizle günlük dilde sadeleştiririz.
          </p>
        </div>
      </div>

      {/* Quote / Manifesto */}
      <div className="p-8 bg-gradient-to-br from-[#0B0F14] to-[#111827] text-white rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6]">Temel Vaadimiz</h4>
        <p className="text-lg sm:text-xl font-bold leading-relaxed">
          “Bir ürün hakkında internette dağınık halde bulunan bilgileri anlaşılır, karşılaştırılabilir ve mümkün olduğunca kaynaklarıyla birlikte sunmak.”
        </p>
        <span className="text-xs text-slate-400 block pt-2">© 2026 Neyin Nesi? Editoryal Kurulu</span>
      </div>
    </div>
  );
};
