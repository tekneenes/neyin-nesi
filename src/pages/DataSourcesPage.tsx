import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { ShieldCheck, CheckCircle2, ChevronRight, FileText, AlertTriangle, Layers, Calendar } from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const { navigate } = useApp();
  const [stats, setStats] = useState<{
    totalVerifiedSpecs: number;
    manufacturerSourcesCount: number;
    lastAuditDate: string;
    verifiedProductsCount: number;
    averageTrustScore: number;
  } | null>(null);

  useEffect(() => {
    productsApi.getVerificationStats().then(setStats);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
            Ana Sayfa
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900 dark:text-white">Veri Kaynakları ve Doğruluk</span>
        </nav>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Şeffaflık Taahhüdü</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Veri Kaynaklarımız ve Doğruluk Politikamız
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Neyin Nesi?'de gösterilen her teknik bilginin arkasında açık bir kaynak vardır. Pazarlama söylemleri yerine resmi dokümanları, laboratuvar testlerini ve yetkili sertifikaları esas alırız.
        </p>
      </div>

      {/* Live Verification Metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500">Doğrulanmış Teknik Veri</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {stats.totalVerifiedSpecs}+
            </div>
            <div className="text-[11px] text-emerald-600">Teknik satır</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Üretici Kaynaklı Veri</div>
            <div className="text-2xl font-extrabold text-[#14B8A6] mt-0.5">
              %{Math.round((stats.manufacturerSourcesCount / stats.totalVerifiedSpecs) * 100)}
            </div>
            <div className="text-[11px] text-slate-400">Doğrudan fabrika/marka</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Ortalama Güven Skoru</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              %{stats.averageTrustScore}
            </div>
            <div className="text-[11px] text-emerald-600">Çapraz denetimli</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Son Sistem Denetimi</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1 text-base">
              {stats.lastAuditDate}
            </div>
            <div className="text-[11px] text-slate-400">Günlük kontrol</div>
          </div>
        </div>
      )}

      {/* 4 Levels of Reliability */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          4 Kademeli Kaynak Sınıflandırma Sistemimiz
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level 1: Üretici */}
          <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-emerald-200/80 dark:border-emerald-950 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seviye 1: Üretici Doğrudan Kaynak
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apple, Samsung, Sony, Dell gibi doğrudan üretici markaların resmi basın bültenleri, teknik şartnameleri, CAD şemaları ve mühendislik dokümanları. Tahmin veya dedikodu içermez.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Güvenilirlik Oranı: %99.9
            </div>
          </div>

          {/* Level 2: Yetkili Distribütör */}
          <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-blue-200/80 dark:border-blue-950 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seviye 2: Yetkili Distribütör & İthalatçı
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bölge distribütörlerinin gümrük beyannameleri, Sanayi Bakanlığı tip onay belgeleri ve resmi garanti ithalatçı kayıtları.
            </p>
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
              Güvenilirlik Oranı: %99.0
            </div>
          </div>

          {/* Level 3: Lisanslı Test Laboratuvarı */}
          <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-amber-200/80 dark:border-amber-950 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seviye 3: Bağımsız Akredite Test Laboratuvarları
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              TÜV Rheinland, UL Solutions, DisplayMate, Rtings, CIPA ve Geekbench gibi uluslararası akredite ölçüm merkezlerinin gerçek donanım test sonuçları.
            </p>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Güvenilirlik Oranı: %98.5
            </div>
          </div>

          {/* Level 4: Doğrulanmış Diğer Kaynak */}
          <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Seviye 4: Doğrulanmış Çapraz Kontrol
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              En az 3 bağımsız teknoloji editörünün söküm (teardown) ve donanım inceleme videolarıyla teyit edilen ikincil doğrulamalar.
            </p>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Güvenilirlik Oranı: %97.0
            </div>
          </div>
        </div>
      </section>

      {/* Akakçe Çoklu Mağaza XML Besleme Ağı (IdeaSoft, Ticimax, T-Soft) */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Akakçe Modeli — Canlı Çoklu Mağaza Entegrasyonu</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bağlı E-Ticaret Mağaza XML Akışları (IdeaSoft, Ticimax, T-Soft)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Neyin Nesi?, Akakçe ve Cimri'nin kullandığı endüstriyel standartta çalışır. Türkiye'deki e-ticaret altyapılarından beslenen mağaza XML akışlarını okur ve EAN-13 barkoduyla aynı ürün altındaki en ucuz teklifleri listeler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">İncehesap</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">Ticimax XML</span>
            </div>
            <div className="text-xs text-slate-500">Bilgisayar, Donanım & Gaming Ekipmanları</div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Yenileme: 30 dk</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">● Canlı Feed</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Vatan Bilgisayar</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-semibold">T-Soft XML</span>
            </div>
            <div className="text-xs text-slate-500">Tüketici Elektroniği, Telefon & TV</div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Yenileme: 60 dk</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">● Canlı Feed</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Teknosa</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-semibold">IdeaSoft XML</span>
            </div>
            <div className="text-xs text-slate-500">Genel Teknoloji, Ses & Ev Aletleri</div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Yenileme: 60 dk</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">● Canlı Feed</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">PetGross / Petlebi</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold">IdeaSoft XML</span>
            </div>
            <div className="text-xs text-slate-500">Evcil Hayvan, Orijinal Kedi & Köpek Maması</div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Yenileme: 120 dk</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">● Canlı Feed</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Hepsiburada Satıcı Ağı</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-semibold">Hepsiburada XML</span>
            </div>
            <div className="text-xs text-slate-500">Resmi Mağazalar & Pazaryeri Satıcıları</div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Yenileme: 15 dk</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">● Canlı Feed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Queue & Correction Mechanism */}
      <section className="p-8 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#14B8A6] uppercase">
          <AlertTriangle className="w-4 h-4" />
          <span>Hata Bildirim Kuyruğu</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Bir hata bulduğunuzda ne olur?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
          Kullanıcılarımızın gönderdiği düzeltme önerileri doğrudan veri tabanını değiştirmez. Bildirimler sistemimizde benzersiz bir takip koduyla doğrulama kuyruğuna alınır. Editörlerimiz üretici dokümanlarını inceledikten sonra onaylar ve audit log'una işler.
        </p>

        <div className="pt-2">
          <button
            onClick={() => navigate('/iletisim?konu=hata')}
            className="px-5 py-2.5 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-colors"
          >
            Veri Hatası Bildirimi Gönder
          </button>
        </div>
      </section>
    </div>
  );
};
