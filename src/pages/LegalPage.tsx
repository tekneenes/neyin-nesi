import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, Shield, FileText, Lock } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const { currentPath, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'gizlilik' | 'kvkk' | 'kullanim-kosullari' | 'reklam'>(() => {
    if (currentPath.includes('gizlilik')) return 'gizlilik';
    if (currentPath.includes('kullanim-kosullari')) return 'kullanim-kosullari';
    return 'gizlilik';
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
          Ana Sayfa
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">Yasal Bilgilendirme</span>
      </nav>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('gizlilik')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'gizlilik' ? 'bg-[#14B8A6] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Gizlilik & Çerez Politikası
        </button>
        <button
          onClick={() => setActiveTab('kvkk')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'kvkk' ? 'bg-[#14B8A6] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          KVKK Aydınlatma
        </button>
        <button
          onClick={() => setActiveTab('kullanim-kosullari')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'kullanim-kosullari' ? 'bg-[#14B8A6] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Kullanım Koşulları
        </button>
        <button
          onClick={() => setActiveTab('reklam')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'reklam' ? 'bg-[#14B8A6] text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Reklam & Bağımsızlık İlkesi
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs">
        {activeTab === 'gizlilik' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Gizlilik ve Çerez Politikası
            </h2>
            <p>
              Neyin Nesi? olarak ziyaretçilerimizin gizliliğine azami hassasiyet gösteriyoruz. Platformumuzda kullanıcılarımızın kişisel verileri izinsiz olarak toplanmaz, üçüncü taraf reklam ağlarına satılmaz.
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
              Çerezler (Cookies)
            </h3>
            <p>
              Sitemizde yalnızca kullanıcı deneyimini optimize etmek (açık/koyu tema tercihi, favoriler, karşılaştırma listesi) amacıyla zorunlu yerel depolama ve teknik oturum çerezleri kullanılır. İstilacı davranışsal takip kodları barındırılmaz.
            </p>
          </div>
        )}

        {activeTab === 'kvkk' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              6698 Sayılı KVKK Uyarınca Aydınlatma Metni
            </h2>
            <p>
              Veri sorumlusu sıfatıyla Neyin Nesi?, fiyat alarmı kaydı veya iletişim formlarında paylaştığınız e-posta ve iletişim bilgilerinizi yalnızca belirtilen hizmeti ifa etmek amacıyla işler.
            </p>
            <p>
              Kişisel verileriniz, kanuni yükümlülükler haricinde hiçbir kurum veya kişiyle paylaşılmaz. İstediğiniz an verilerinizin silinmesini talep edebilirsiniz.
            </p>
          </div>
        )}

        {activeTab === 'kullanim-kosullari' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Kullanım Koşulları
            </h2>
            <p>
              Neyin Nesi?'de yer alan ürün özellikleri üretici ve yetkili distribütör verilerine dayanmakla birlikte, üreticilerin haber vermeksizin şartname revizyonu yapma hakkı saklıdır.
            </p>
            <p>
              Kullanıcılar satın alma kararlarını nihai olarak resmi satış noktasındaki sözleşme şartlarına göre vermelidir.
            </p>
          </div>
        )}

        {activeTab === 'reklam' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Reklam ve Bağımsızlık Politikası
            </h2>
            <p>
              Platformumuzda reklam veya sponsorluk alanları bulunsa dahi, hiçbir ticari anlaşma bir ürünün teknik puanını, doğrulama durumunu veya karşılaştırma tablosundaki nesnel sırasını değiştiremez.
            </p>
            <p>
              Asla ekranı kaplayan pop-up'lar, kullanıcıyı yanıltan butonlar veya agresif reklam formatları kullanılmaz. Güvenilirlik her şeyin önündedir.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          Son güncelleme: 7 Ekim 2026 · Neyin Nesi? Yasal Uyum Departmanı
        </div>
      </div>
    </div>
  );
};
