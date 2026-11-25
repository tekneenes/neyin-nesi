import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Check, X } from 'lucide-react';
import { Product } from '../../types';

interface PriceAlertModalProps {
  product: Product | null;
  onClose: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ product, onClose }) => {
  const { addPriceAlert } = useApp();
  const [targetPrice, setTargetPrice] = useState<number>(() => {
    return product?.currentBestPrice ? Math.floor(product.currentBestPrice * 0.95) : 50000;
  });
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    addPriceAlert({
      productSlug: product.slug,
      productName: product.fullName,
      targetPrice,
      currentPrice: product.currentBestPrice || 0,
      email,
    });
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Fiyat Takibi Başlat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {product.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Fiyat Alarmı Kuruldu
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Fiyat {targetPrice.toLocaleString('tr-TR')} TL seviyesine veya altına indiğinde {email} adresine bildirim gönderilecektir.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Şu Anki En Uygun Fiyat:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {product.currentBestPrice ? `${product.currentBestPrice.toLocaleString('tr-TR')} TL` : 'Fiyat bilgisi yok'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Hedef Fiyatınız (TL)
              </label>
              <input
                type="number"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Bildirim E-posta Adresiniz
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adiniz@ornek.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Alarm Kur
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
