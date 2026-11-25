import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { productsApi } from '../api/productsApi';
import { Product, SpecItem } from '../types';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { renderSpecValue } from '../utils/specRenderer';
import {
  Scale,
  Plus,
  X,
  Check,
  Share2,
  Trash2,
  ChevronRight,
  Filter,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, addToCompare, clearCompare, navigate } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [allAvailableProducts, setAllAvailableProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    productsApi.getProducts().then(setAllAvailableProducts);
  }, []);

  useEffect(() => {
    if (compareList.length === 0) {
      setProducts([]);
      return;
    }
    productsApi.getProductsByIds(compareList).then(setProducts);
  }, [compareList]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Compile all unique specification keys across selected products
  const specCategoriesMap: Record<string, { title: string; items: Record<string, { label: string; termSlug?: string }> }> = {};

  products.forEach((prod) => {
    prod.specGroups.forEach((group) => {
      if (!specCategoriesMap[group.id]) {
        specCategoriesMap[group.id] = { title: group.title, items: {} };
      }
      group.items.forEach((item) => {
        if (!specCategoriesMap[group.id].items[item.id]) {
          specCategoriesMap[group.id].items[item.id] = {
            label: item.label,
            termSlug: item.termSlug,
          };
        }
      });
    });
  });

  const getSpecValueForProduct = (prod: Product, groupId: string, itemId: string): SpecItem | null => {
    const group = prod.specGroups.find((g) => g.id === groupId);
    if (!group) return null;
    return group.items.find((i) => i.id === itemId) || null;
  };

  const areValuesDifferent = (groupId: string, itemId: string): boolean => {
    if (products.length <= 1) return false;
    const firstVal = getSpecValueForProduct(products[0], groupId, itemId)?.value;
    for (let i = 1; i < products.length; i++) {
      const nextVal = getSpecValueForProduct(products[i], groupId, itemId)?.value;
      if (firstVal !== nextVal) return true;
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-slate-900 dark:hover:text-white">
              Ana Sayfa
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-white">Karşılaştırma</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-[#14B8A6]" />
            Ürün Karşılaştırma Tablosu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Seçilen {products.length} ürünün tüm teknik özelliklerini ve üretici kaynaklarını yan yana inceleyin
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {products.length > 1 && (
            <button
              onClick={() => setOnlyDifferences(!onlyDifferences)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                onlyDifferences
                  ? 'bg-[#14B8A6] text-white border-[#14B8A6]'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Sadece Farkları Göster</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{shareCopied ? 'Kopyalandı!' : 'Paylaş'}</span>
          </button>

          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Karşılaştırmayı Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {products.length < 4 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ürün Ekle ({products.length}/4)</span>
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Scale className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Karşılaştırmak için henüz ürün seçmediniz
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Katalogdan veya ana sayfadaki ürün kartlarından "Karşılaştır" butonuna basarak 4 adede kadar cihazı ekleyebilirsiniz.
          </p>
          <button
            onClick={() => navigate('/ara')}
            className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Ürün Kataloğuna Git
          </button>
        </div>
      ) : (
        /* COMPARISON TABLE CONTAINER WITH HORIZONTAL SCROLL ON MOBILE */
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
          <table className="w-full text-left border-collapse min-w-[700px]">
            {/* Table Header: Sticky Product Cards */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
                <th className="p-4 w-60 text-xs font-bold text-slate-400 uppercase tracking-wider align-top">
                  Özellik / Ürün
                </th>
                {products.map((p) => (
                  <th key={p.id} className="p-4 align-top">
                    <div className="relative group space-y-2">
                      <button
                        onClick={() => removeFromCompare(p.slug)}
                        className="absolute -top-1 -right-1 p-1 bg-white dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs text-slate-400 transition-colors"
                        title="Tablodan Çıkar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <img src={p.heroImage} alt={p.fullName} className="max-h-full max-w-full object-contain" />
                      </div>

                      <div className="text-center">
                        <div className="text-[11px] text-slate-400 font-medium">{p.brand}</div>
                        <h4
                          onClick={() => navigate(`/urun/${p.brandSlug}/${p.slug}`)}
                          className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#14B8A6] cursor-pointer transition-colors"
                        >
                          {p.model}
                        </h4>
                        <div className="text-xs font-extrabold text-[#14B8A6] mt-1">
                          {p.currentBestPrice ? `${p.currentBestPrice.toLocaleString('tr-TR')} TL` : '—'}
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Grouped Specs */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {/* Executive Identity row */}
              <tr className="bg-slate-50/30 dark:bg-slate-850/30">
                <td className="p-4 font-bold text-slate-700 dark:text-slate-300 align-top">
                  “Bu ürünün nesi?”
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-slate-600 dark:text-slate-300 align-top leading-relaxed">
                    {p.identitySummary}
                  </td>
                ))}
              </tr>

              {/* Loop through each category and spec items */}
              {Object.entries(specCategoriesMap).map(([groupId, groupData]) => {
                const groupItems = Object.entries(groupData.items);

                // Filter differences if active
                const filteredItems = onlyDifferences
                  ? groupItems.filter(([itemId]) => areValuesDifferent(groupId, itemId))
                  : groupItems;

                if (filteredItems.length === 0) return null;

                return (
                  <React.Fragment key={groupId}>
                    {/* Section Header */}
                    <tr className="bg-slate-100/70 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                      <td colSpan={products.length + 1} className="py-2.5 px-4 uppercase text-[11px] tracking-wider text-[#14B8A6]">
                        {groupData.title}
                      </td>
                    </tr>

                    {filteredItems.map(([itemId, itemMeta]) => {
                      const isDiff = areValuesDifferent(groupId, itemId);

                      return (
                        <tr
                          key={itemId}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                            isDiff ? 'bg-amber-500/[0.03] dark:bg-amber-400/[0.02]' : ''
                          }`}
                        >
                          {/* Label Column */}
                          <td className="p-4 font-semibold text-slate-600 dark:text-slate-300 align-top">
                            <div className="flex items-center gap-1.5">
                              <span>{itemMeta.label}</span>
                              {isDiff && products.length > 1 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Farklı özellik" />
                              )}
                              {itemMeta.termSlug && (
                                <button
                                  onClick={() => navigate(`/rehber/${itemMeta.termSlug}`)}
                                  className="text-slate-400 hover:text-[#14B8A6]"
                                  title="Terim rehberine git"
                                >
                                  <HelpCircle className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Value for each product */}
                          {products.map((p) => {
                            const spec = getSpecValueForProduct(p, groupId, itemId);
                            return (
                              <td key={p.id} className="p-4 align-top">
                                {spec ? (
                                  <div className="space-y-1.5">
                                    <div className="font-medium text-slate-900 dark:text-white text-xs">
                                      {renderSpecValue(spec.value, spec.numericValue, spec.unit)}
                                    </div>
                                    <VerificationBadge
                                      verification={spec.verification}
                                      specLabel={spec.label}
                                      productName={p.model}
                                      compact
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Karşılaştırmaya Ürün Ekle
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {allAvailableProducts
                .filter((p) => !compareList.includes(p.slug))
                .map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      addToCompare(prod.slug);
                      setShowAddModal(false);
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#14B8A6] flex items-center justify-between gap-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.heroImage} alt="" className="w-10 h-10 object-contain rounded-lg" />
                      <div>
                        <div className="text-xs text-slate-500">{prod.brand}</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {prod.fullName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#14B8A6]">Ekle +</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
