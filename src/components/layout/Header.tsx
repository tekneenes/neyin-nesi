import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { Search, Scale, Heart, Moon, Sun, User, Menu, X } from 'lucide-react';
import { MegaCategoryNav } from './MegaCategoryNav';

export const Header: React.FC = () => {
  const {
    currentPath,
    navigate,
    compareList,
    favorites,
    isDarkMode,
    toggleDarkMode,
    setIsAccountOpen,
    setIsSearchOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Ürünler', path: '/ara' },
    { label: 'Kategoriler', path: '/kategoriler' },
    { label: 'Karşılaştır', path: '/karsilastir' },
    { label: 'Keşfet', path: '/kesfet' },
    { label: 'Rehber', path: '/rehber' },
    { label: '⚡ Veritabanı', path: '/veritabani' },
    { label: '🛠️ Veri Stüdyosu', path: '/veri-yonetimi' },
  ];

  const isActive = (path: string) => {
    if (path === '/ara' && (currentPath === '/ara' || currentPath.startsWith('/urun/'))) return true;
    if (path === '/kategoriler' && (currentPath === '/kategoriler' || currentPath.startsWith('/kategori/'))) return true;
    return currentPath === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0B0F14]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <BrandLogo size="md" showTagline={false} />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`text-sm font-medium transition-colors relative py-1 focus:outline-none ${
                    active
                      ? 'text-[#14B8A6] font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14B8A6] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 border border-slate-200/60 dark:border-slate-700/60 text-xs transition-colors"
            title="Arama (Ctrl+K)"
            aria-label="Ürün Ara"
          >
            <Search className="w-4 h-4 text-[#14B8A6]" />
            <span className="hidden lg:inline text-slate-400">Ürün veya özellik ara...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Comparison Drawer Trigger */}
          <button
            onClick={() => navigate('/karsilastir')}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Karşılaştırma Listesi"
            aria-label="Karşılaştırma Listesi"
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#14B8A6] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Favorites Trigger */}
          <button
            onClick={() => setIsAccountOpen(true)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Favorilerim"
            aria-label="Favorilerim"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500/20' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            aria-label="Tema Değiştir"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Account Profile Trigger */}
          <button
            onClick={() => setIsAccountOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#14B8A6] text-slate-700 dark:text-slate-200 hover:text-[#14B8A6] transition-colors text-xs font-semibold"
            aria-label="Hesap ve Takip"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Hesabım</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Menüyü Aç"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 2. Alt Katman: Mega Kategori Gezintisi (Bütünleşik Tek Parça) */}
      <MegaCategoryNav />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F14] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(link.path);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium ${
                isActive(link.path)
                  ? 'bg-[#14B8A6]/10 text-[#14B8A6] font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Tema</span>
            <button
              onClick={toggleDarkMode}
              className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              {isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
