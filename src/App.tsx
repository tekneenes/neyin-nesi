import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingCompareBar } from './components/comparison/FloatingCompareBar';
import { VerificationInspectorModal } from './components/modals/VerificationInspectorModal';
import { CorrectionReportModal } from './components/modals/CorrectionReportModal';
import { SearchModal } from './components/search/SearchModal';
import { AccountModal } from './components/modals/AccountModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ComparePage } from './pages/ComparePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchPage } from './pages/SearchPage';
import { ExplorePage } from './pages/ExplorePage';
import { GuidesPage } from './pages/GuidesPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DatabaseStudioPage } from './pages/DatabaseStudioPage';
import { DataCurationStudioPage } from './pages/DataCurationStudioPage';

const AppContent: React.FC = () => {
  const { currentPath, setIsSearchOpen } = useApp();

  // Listen for keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  // Route selector
  const renderCurrentView = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage />;
    }
    if (currentPath.startsWith('/urun/')) {
      return <ProductDetailPage />;
    }
    if (currentPath === '/karsilastir' || currentPath.startsWith('/karsilastir/')) {
      return <ComparePage />;
    }
    if (currentPath === '/kategoriler' || currentPath.startsWith('/kategori/')) {
      return <CategoryPage />;
    }
    if (currentPath === '/ara' || currentPath.startsWith('/ara?')) {
      return <SearchPage />;
    }
    if (currentPath === '/kesfet' || currentPath.startsWith('/kesfet/')) {
      return <ExplorePage />;
    }
    if (currentPath === '/rehber') {
      return <GuidesPage />;
    }
    if (currentPath.startsWith('/rehber/')) {
      return <GuideDetailPage />;
    }
    if (currentPath === '/veri-kaynaklari') {
      return <DataSourcesPage />;
    }
    if (currentPath === '/hakkimizda') {
      return <AboutPage />;
    }
    if (currentPath === '/iletisim' || currentPath.startsWith('/iletisim?')) {
      return <ContactPage />;
    }
    if (currentPath === '/veritabani' || currentPath === '/db' || currentPath === '/studio') {
      return <DatabaseStudioPage />;
    }
    if (
      currentPath === '/veri-yonetimi' ||
      currentPath === '/duzenle' ||
      currentPath === '/sturdi' ||
      currentPath === '/editor'
    ) {
      return <DataCurationStudioPage />;
    }
    if (
      currentPath.startsWith('/yasal') ||
      currentPath === '/gizlilik' ||
      currentPath === '/kvkk' ||
      currentPath === '/kullanim-kosullari'
    ) {
      return <LegalPage />;
    }

    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F14] text-[#111827] dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      <Footer />

      {/* Floating comparison tray bar */}
      <FloatingCompareBar />

      {/* Modals & Overlays */}
      <VerificationInspectorModal />
      <CorrectionReportModal />
      <SearchModal />
      <AccountModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
