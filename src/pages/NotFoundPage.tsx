import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Home, ArrowRight, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useApp();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/ara?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] mx-auto flex items-center justify-center">
        <HelpCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">404 Hatası</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Bu ürünün nesi olduğunu bulamadık.
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Aradığınız sayfa taşınmış, silinmiş veya henüz doğrulanmış veri tabanımıza eklenmemiş olabilir.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
        <div className="flex items-center bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 pl-3">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Doğru modeli burada arayın..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
          >
            Ara
          </button>
        </div>
      </form>

      <div className="pt-2">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </button>
      </div>
    </div>
  );
};
