import React, { createContext, useContext, useState, useEffect } from 'react';
import { VerificationInfo, Product } from '../types';

export interface RouteState {
  path: string; // e.g. '/', '/urun/apple/iphone-17-pro', '/karsilastir', etc.
  params: Record<string, string>;
  searchQuery?: string;
}

export interface PriceAlert {
  id: string;
  productSlug: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  createdAt: string;
  email: string;
}

interface AppContextType {
  // Routing
  currentPath: string;
  routeParams: Record<string, string>;
  searchQuery: string;
  navigate: (to: string, replace?: boolean) => void;

  // Comparison
  compareList: string[]; // array of product slugs
  addToCompare: (slug: string) => boolean;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;

  // Favorites
  favorites: string[]; // array of product slugs
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;

  // Price alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  removePriceAlert: (id: string) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Active Modals & Inspecting
  inspectingVerification: { info: VerificationInfo; specLabel: string; productName?: string } | null;
  setInspectingVerification: (val: { info: VerificationInfo; specLabel: string; productName?: string } | null) => void;

  correctionProduct: { slug: string; name: string; defaultField?: string } | null;
  setCorrectionProduct: (val: { slug: string; name: string; defaultField?: string } | null) => void;

  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize route from window.location
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });

  // Comparison List (stored in localStorage)
  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nn_compare_list');
      return saved ? JSON.parse(saved) : ['iphone-17-pro', 'galaxy-s26-ultra'];
    } catch {
      return ['iphone-17-pro', 'galaxy-s26-ultra'];
    }
  });

  // Favorites (stored in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nn_favorites');
      return saved ? JSON.parse(saved) : ['iphone-17-pro'];
    } catch {
      return ['iphone-17-pro'];
    }
  });

  // Price alerts (stored in localStorage)
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('nn_price_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nn_theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // Modals
  const [inspectingVerification, setInspectingVerification] = useState<{ info: VerificationInfo; specLabel: string; productName?: string } | null>(null);
  const [correctionProduct, setCorrectionProduct] = useState<{ slug: string; name: string; defaultField?: string } | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync comparisons to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nn_compare_list', JSON.stringify(compareList));
    } catch (e) {
      console.warn(e);
    }
  }, [compareList]);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem('nn_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn(e);
    }
  }, [favorites]);

  // Sync price alerts
  useEffect(() => {
    try {
      localStorage.setItem('nn_price_alerts', JSON.stringify(priceAlerts));
    } catch (e) {
      console.warn(e);
    }
  }, [priceAlerts]);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('nn_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('nn_theme', 'light');
    }
  }, [isDarkMode]);

  // Handle popstate for browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('q') || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, replace = false) => {
    const [pathPart, queryPart] = to.split('?');
    const path = pathPart || '/';
    let q = '';
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      q = params.get('q') || '';
    }

    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }

    setCurrentPath(path);
    setSearchQuery(q);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCompare = (slug: string): boolean => {
    if (compareList.includes(slug)) return true;
    if (compareList.length >= 4) {
      return false; // Limit to 4 max
    }
    setCompareList(prev => [...prev, slug]);
    return true;
  };

  const removeFromCompare = (slug: string) => {
    setCompareList(prev => prev.filter(s => s !== slug));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (slug: string) => compareList.includes(slug);

  const toggleFavorite = (slug: string) => {
    setFavorites(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const isFavorite = (slug: string) => favorites.includes(slug);

  const addPriceAlert = (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
    setPriceAlerts(prev => [newAlert, ...prev]);
  };

  const removePriceAlert = (id: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== id));
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Derive route params from path
  const routeParams: Record<string, string> = {};
  if (currentPath.startsWith('/urun/')) {
    const parts = currentPath.replace('/urun/', '').split('/');
    if (parts.length >= 2) {
      routeParams.brand = parts[0];
      routeParams.slug = parts[1];
    } else if (parts.length === 1) {
      routeParams.slug = parts[0];
    }
  } else if (currentPath.startsWith('/kategori/')) {
    routeParams.category = currentPath.replace('/kategori/', '').split('/')[0];
  } else if (currentPath.startsWith('/kesfet/')) {
    routeParams.slug = currentPath.replace('/kesfet/', '').split('/')[0];
  } else if (currentPath.startsWith('/rehber/')) {
    routeParams.slug = currentPath.replace('/rehber/', '').split('/')[0];
  }

  return (
    <AppContext.Provider
      value={{
        currentPath,
        routeParams,
        searchQuery,
        navigate,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        favorites,
        toggleFavorite,
        isFavorite,
        priceAlerts,
        addPriceAlert,
        removePriceAlert,
        isDarkMode,
        toggleDarkMode,
        inspectingVerification,
        setInspectingVerification,
        correctionProduct,
        setCorrectionProduct,
        isAccountOpen,
        setIsAccountOpen,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
