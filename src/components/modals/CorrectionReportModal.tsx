import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { productsApi } from '../../api/productsApi';
import { AlertCircle, CheckCircle, X, Send } from 'lucide-react';

export const CorrectionReportModal: React.FC = () => {
  const { correctionProduct, setCorrectionProduct } = useApp();
  const [issueType, setIssueType] = useState<'wrong_spec' | 'missing_spec' | 'wrong_image' | 'wrong_price' | 'other'>('wrong_spec');
  const [fieldAffected, setFieldAffected] = useState(correctionProduct?.defaultField || '');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [sourceProof, setSourceProof] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!correctionProduct) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestedCorrection.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await productsApi.submitCorrectionReport({
        productSlug: correctionProduct.slug,
        productName: correctionProduct.name,
        issueType,
        fieldAffected: fieldAffected || 'Genel',
        suggestedCorrection,
        sourceProof,
        userEmail,
      });
      setSubmittedId(result.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCorrectionProduct(null);
    setSubmittedId(null);
    setSuggestedCorrection('');
    setSourceProof('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Veri Hatası Bildir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {correctionProduct.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Geri Bildiriminiz Alındı
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Katkınız için teşekkürler. Bildiriminiz <span className="font-mono text-xs font-semibold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">#{submittedId}</span> koduyla doğrulama kuyruğuna eklendi. Editörlerimiz üretici dokümanlarını inceledikten sonra veri güncellenecektir.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Tamam
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Sorun Türü
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white"
              >
                <option value="wrong_spec">Yanlış teknik bilgi</option>
                <option value="missing_spec">Eksik özellik</option>
                <option value="wrong_price">Hatalı fiyat veya satıcı linki</option>
                <option value="wrong_image">Hatalı ürün görseli</option>
                <option value="other">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Etkilenen Alan / Özellik Başlığı
              </label>
              <input
                type="text"
                value={fieldAffected}
                onChange={(e) => setFieldAffected(e.target.value)}
                placeholder="Örn: Batarya Kapasitesi, Ekran Yenileme Hızı..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Doğru Bilgi & Açıklamanız <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                placeholder="Örn: Apple resmi şartnamesinde ağırlık 199g değil 187g olarak güncellendi..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Kaynak / Link Kanıtı (Opsiyonel)
              </label>
              <input
                type="text"
                value={sourceProof}
                onChange={(e) => setSourceProof(e.target.value)}
                placeholder="Resmi PDF linki veya üretici URL..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                E-posta Adresiniz (Sonuç bildirimi için opsiyonel)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="adiniz@ornek.com"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !suggestedCorrection.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-[#0f766e] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'İletiliyor...' : 'Doğrulama Kuyruğuna Gönder'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
