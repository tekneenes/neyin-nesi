import React from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="w-full bg-[#0B0F14] text-slate-300 border-t border-slate-800 transition-colors pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-850">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" showTagline />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              İnternetteki dağınık ürün bilgilerini doğrulanmış kaynaklarla anlaşılır, karşılaştırılabilir ve şeffaf hale getiren bağımsız ürün keşif platformu.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900/60 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Doğrulanmış Üretici Verisi
              </div>
              <span className="text-slate-600">·</span>
              <span>Reklamsız Ürün Karşılaştırma</span>
            </div>
          </div>

          {/* Keşfet */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Keşfet
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/ara')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Tüm Ürünler
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/kategoriler')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Kategoriler
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/karsilastir')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Ürün Karşılaştırma
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/kesfet')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Seçkiler & Trendler
                </button>
              </li>
            </ul>
          </div>

          {/* Bilgi & Metodoloji */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Bilgi & Güven
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/rehber')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Neyin Nesi? Rehberler
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/veri-kaynaklari')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Veri Kaynakları ve Doğruluk
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/iletisim?konu=hata')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Veri Hatası Bildir
                </button>
              </li>
            </ul>
          </div>

          {/* Kurumsal & Yasal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Kurumsal & Yasal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/hakkimizda')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Hakkımızda
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/iletisim')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  İletişim & İş Birliği
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/yasal/gizlilik')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Gizlilik ve KVKK
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/yasal/kullanim-kosullari')}
                  className="hover:text-[#14B8A6] transition-colors"
                >
                  Kullanım Koşulları
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 Neyin Nesi? Tüm hakları saklıdır.</span>
            <span>·</span>
            <span className="text-slate-400">Anla. Karşılaştır. Karar ver.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/veri-kaynaklari')} className="hover:text-slate-300">
              Veri Politikası
            </button>
            <button onClick={() => navigate('/yasal/gizlilik')} className="hover:text-slate-300">
              Çerezler
            </button>
            <button onClick={() => navigate('/yasal/kullanim-kosullari')} className="hover:text-slate-300">
              Şartlar
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
