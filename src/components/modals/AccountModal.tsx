import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { productsApi } from '../../api/productsApi';
import { Product } from '../../types';
import { Heart, Scale, Bell, Settings, X, Trash2, ArrowRight } from 'lucide-react';

export const AccountModal: React.FC = () => {
  const {
    isAccountOpen,
    setIsAccountOpen,
    favorites,
    toggleFavorite,
    compareList,
    removeFromCompare,
    priceAlerts,
    removePriceAlert,
    navigate,
    isDarkMode,
    toggleDarkMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'favorites' | 'comparisons' | 'alerts' | 'settings'>('favorites');
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isAccountOpen) return;
    productsApi.getProductsByIds(favorites).then(setFavoriteProducts);
    productsApi.getProductsByIds(compareList).then(setCompareProducts);
  }, [isAccountOpen, favorites, compareList]);

  if (!isAccountOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Hesabım ve Takip Paneli
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kayıtlı cihazlar, karşılaştırmalar ve fiyat alarmları
            </p>
          </div>
          <button
            onClick={() => setIsAccountOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-2 bg-slate-50/50 dark:bg-slate-850">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'favorites'
                ? 'border-[#14B8A6] text-[#14B8A6]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favoriler ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('comparisons')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'comparisons'
                ? 'border-[#14B8A6] text-[#14B8A6]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            Karşılaştırmalar ({compareList.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-[#14B8A6] text-[#14B8A6]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            Fiyat Alarmları ({priceAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-[#14B8A6] text-[#14B8A6]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Ayarlar
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'favorites' && (
            <div>
              {favoriteProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Henüz favorilere eklenmiş bir ürün yok.
                </div>
              ) : (
                <div className="space-y-3">
                  {favoriteProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.heroImage}
                          alt={prod.fullName}
                          className="w-12 h-12 rounded-lg object-cover bg-white"
                        />
                        <div>
                          <div className="text-xs text-slate-500">{prod.brand}</div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {prod.fullName}
                          </div>
                          <div className="text-xs text-[#14B8A6] font-bold">
                            {prod.currentBestPrice ? `${prod.currentBestPrice.toLocaleString('tr-TR')} TL` : 'Fiyat yok'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsAccountOpen(false);
                            navigate(`/urun/${prod.brandSlug}/${prod.slug}`);
                          }}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium"
                        >
                          İncele <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(prod.slug)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Favorilerden çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comparisons' && (
            <div>
              {compareProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Karşılaştırma listesinde ürün bulunmuyor.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-slate-500">Seçilen Ürünler ({compareProducts.length}/4)</span>
                    <button
                      onClick={() => {
                        setIsAccountOpen(false);
                        navigate('/karsilastir');
                      }}
                      className="px-3 py-1.5 text-xs bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0f766e] flex items-center gap-1"
                    >
                      Karşılaştırma Tablosuna Git <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {compareProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.heroImage}
                          alt={prod.fullName}
                          className="w-12 h-12 rounded-lg object-cover bg-white"
                        />
                        <div>
                          <div className="text-xs text-slate-500">{prod.brand}</div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {prod.fullName}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCompare(prod.slug)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Listeden çıkar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              {priceAlerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Aktif fiyat uyarınız bulunmuyor. Ürün sayfalarından "Fiyat Takibi Başlat" seçeneğini kullanabilirsiniz.
                </div>
              ) : (
                <div className="space-y-3">
                  {priceAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {alert.productName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Hedef: <span className="font-bold text-[#14B8A6]">{alert.targetPrice.toLocaleString('tr-TR')} TL</span> (Kayıtlı: {alert.currentPrice.toLocaleString('tr-TR')} TL) · {alert.email}
                        </div>
                      </div>
                      <button
                        onClick={() => removePriceAlert(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Görünüm Teması</div>
                  <div className="text-xs text-slate-500">Açık ve koyu tema arasında geçiş yapın</div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:opacity-90"
                >
                  {isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">Veri Gizliliği ve Çerezler</div>
                <div className="text-xs text-slate-500 mt-1">
                  Neyin Nesi?, kullanıcı verilerinizi üçüncü taraflarla paylaşmaz ve izinsiz pazarlama çerezleri yerleştirmez.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
