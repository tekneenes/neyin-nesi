import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MEGA_MENU_TABS, MegaMenuTab, MegaMenuSection } from '../../data/megaMenuData';
import {
  Smartphone,
  Laptop,
  Tv,
  Home,
  Baby,
  Footprints,
  Layers,
  ChevronDown,
  Gift,
  CreditCard,
  Cat,
  Bone,
  Coffee,
  Tent,
  Flame,
  Gamepad2,
  Watch,
  Headphones,
  Zap,
  Armchair,
  Shirt,
  Glasses,
  Coins,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Monitor,
  Video,
  Disc,
  Bike,
  Package,
  Car,
  Droplet,
  Sparkles,
  Trophy,
  Key,
  CarFront,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  Laptop,
  Tv,
  Home,
  Baby,
  Footprints,
  Layers,
  Gift,
  CreditCard,
  Cat,
  Bone,
  Coffee,
  Tent,
  Flame,
  Gamepad2,
  Watch,
  Headphones,
  Zap,
  Armchair,
  Shirt,
  Glasses,
  Coins,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Monitor,
  Video,
  Disc,
  Bike,
  Package,
  Car,
  CarFront,
  Droplet,
  Sparkles,
  Trophy,
  Key,
};

export const MegaCategoryNav: React.FC = () => {
  const { navigate, currentPath } = useApp();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeTab = MEGA_MENU_TABS.find((t) => t.id === activeTabId);

  const handleMouseEnter = (tabId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveTabId(tabId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveTabId(null);
    }, 220);
  };

  const handleItemClick = (slug: string) => {
    setIsOpen(false);
    setActiveTabId(null);
    navigate(`/kategori/${slug}`);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveTabId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={navRef}
      onMouseLeave={handleMouseLeave}
      className="relative w-full border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-200 select-none"
    >
      {/* Top Strip Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-0 h-10 text-xs font-semibold tracking-wide">
          <div className="flex items-center gap-1">
            {MEGA_MENU_TABS.map((tab) => {
              const isActive = activeTabId === tab.id && isOpen;
              const isHighlight = tab.highlight;

              return (
                <button
                  key={tab.id}
                  onMouseEnter={() => handleMouseEnter(tab.id)}
                  onClick={() => {
                    if (tab.sections && tab.sections.length > 0) {
                      setActiveTabId(tab.id);
                      setIsOpen(!isOpen || activeTabId !== tab.id);
                    } else {
                      navigate(`/kategori/${tab.slug}`);
                    }
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-xs font-semibold ${
                    isActive
                      ? 'bg-[#14B8A6]/10 text-[#14B8A6] font-bold dark:bg-[#14B8A6]/15'
                      : isHighlight
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.sections && tab.sections.length > 0 && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive ? 'rotate-180 text-[#14B8A6]' : 'text-slate-400'
                      }`}
                    />
                  )}
                  {isHighlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
            <span>100.000+ Doğrulanmış Ürün Kataloğu</span>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown Overlay */}
      {isOpen && activeTab && activeTab.sections && activeTab.sections.length > 0 && (
        <div
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          className="absolute top-full left-0 w-full bg-white/95 dark:bg-[#0B0F14]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 shadow-2xl py-6 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800 dark:text-slate-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-bold text-xs uppercase tracking-wider">
                  {activeTab.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tüm alt kategoriler ve popüler ürün grupları
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
              >
                Kapat (Esc)
              </button>
            </div>

            {/* Grid of Sections (Epey Multi-Column Layout) */}
            <div
              className={`grid gap-6 ${
                activeTab.sections.length >= 5
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                  : activeTab.sections.length === 4
                  ? 'grid-cols-2 md:grid-cols-4'
                  : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {activeTab.sections.map((section: MegaMenuSection) => (
                <div key={section.slug} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-[#14B8A6]/60 pb-1.5 flex items-center justify-between">
                    <span>{section.title}</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => {
                      const IconComponent = ICON_MAP[item.iconName] || Layers;
                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => handleItemClick(item.slug)}
                            className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-left group"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <IconComponent className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#14B8A6] transition-colors shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </span>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Quick Action Banner */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  <span><strong>Apple Hediye Kartı</strong> ve Dijital Kodlarda Anlık Fiyat Karşılaştırması</span>
                </span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ara');
                }}
                className="text-[#14B8A6] hover:underline font-semibold"
              >
                Tüm Kataloğu Gör &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
