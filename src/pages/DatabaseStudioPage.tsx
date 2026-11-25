import React, { useState, useEffect } from 'react';
import {
  Database,
  Table,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  FileText,
  Activity,
  Terminal,
  Play,
  Layers,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TableMeta {
  name: string;
  label: string;
  icon: string;
  count: number;
  size: string;
  error?: string;
}

interface TableDataResponse {
  tableName: string;
  columns: { name: string; type: string }[];
  rows: any[];
  pagination: {
    page: number;
    limit: number;
    totalRows: number;
    totalPages: number;
  };
}

export const DatabaseStudioPage: React.FC = () => {
  const { navigate } = useApp();
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('products');
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // SQL Console State
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT brand, count(*) as urun_sayisi, round(avg(current_best_price), 2) as ortalama_fiyat FROM products GROUP BY brand ORDER BY urun_sayisi DESC LIMIT 10;');
  const [sqlLoading, setSqlLoading] = useState<boolean>(false);
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Tabloları getir
  const loadTables = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/db/tables');
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error('Tablolar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  // Seçili tablo verisini getir
  const loadTableData = async (tbl: string, targetPage: number, searchTerm: string = search) => {
    try {
      setTableLoading(true);
      const params = new URLSearchParams({
        name: tbl,
        page: targetPage.toString(),
        limit: pageSize.toString(),
      });
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }
      const res = await fetch(`/api/db/table?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (err) {
      console.error('Tablo verisi yüklenemedi:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // SQL Sorgusu çalıştır
  const handleRunSql = async () => {
    if (!sqlQuery.trim()) return;
    setSqlLoading(true);
    setSqlError(null);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSqlError(data.error || 'Sorgu hatası');
        setSqlResult(null);
      } else {
        setSqlResult(data);
        setSqlError(null);
      }
    } catch (err: any) {
      setSqlError(err.message || 'Bağlantı hatası');
      setSqlResult(null);
    } finally {
      setSqlLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    setPage(1);
    loadTableData(selectedTable, 1, search);
  }, [selectedTable, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTableData(selectedTable, 1, search);
  };

  const totalCatalogProducts = tables.find(t => t.name === 'products')?.count || 0;
  const totalOffers = tables.find(t => t.name === 'price_offers')?.count || 0;
  const totalHistory = tables.find(t => t.name === 'price_history')?.count || 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      {/* Üst Bar */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-16 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">PostgreSQL Studio & Veritabanı Tarayıcısı</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Canlı Bağlantı (Port 5432)
              </span>
            </div>
            <p className="text-xs text-slate-400">neyinnesi veritabanı • Yerel Güvenli & Optimize Akış</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadTables();
              loadTableData(selectedTable, page, search);
            }}
            disabled={loading || tableLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loading || tableLoading) ? 'animate-spin text-teal-400' : ''}`} />
            Yenile
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white transition"
          >
            Siteye Dön
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Metrik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Toplam Kayıtlı Ürün</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {totalCatalogProducts ? totalCatalogProducts.toLocaleString('tr-TR') : '...'}
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Hedef: 500.000+ Başarıldı</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Aktif Fiyat Teklifleri</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {totalOffers ? totalOffers.toLocaleString('tr-TR') : '...'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Doğrulanmış Dağıtıcı Fiyatları</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Fiyat Geçmiş Noktaları</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">
                {totalHistory ? totalHistory.toLocaleString('tr-TR') : '...'}
              </h3>
              <p className="text-[11px] text-purple-400 mt-0.5">Zaman Serisi Analitiği</p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Toplam Tablo Sayısı</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{tables.length} Tablo</h3>
              <p className="text-[11px] text-amber-400 mt-0.5">İlişkisel Veri Mimarisi</p>
            </div>
          </div>
        </div>

        {/* Ana İçerik: Sol Menü Tablolar + Sağ Tablo Veri Görüntüleyici */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Tablo Listesi */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                Veritabanı Tabloları
              </h2>
              <div className="space-y-1">
                {tables.map((t) => {
                  const isSelected = selectedTable === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => {
                        setSelectedTable(t.name);
                        setSearch('');
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Table className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
                        <div className="truncate">
                          <div className="truncate">{t.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{t.name}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-slate-400">
                          {t.count > 1000 ? `${(t.count / 1000).toFixed(0)}k` : t.count}
                        </span>
                        <div className="text-[9px] text-slate-500 font-mono">{t.size}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hızlı SQL Konsolu Açıklaması */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span>Salt Okunur SQL Motoru</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Veritabanınız tamamen güvendedir. Sayfanın altındaki SQL konsolundan dilediğiniz analiz sorgusunu doğrudan çalıştırabilirsiniz.
              </p>
            </div>
          </div>

          {/* Sağ Tablo Görünümü */}
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
              {/* Tablo Üst Arama & Sayfalama Kontrolleri */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Table className="w-4 h-4 text-teal-400" />
                    <span>{selectedTable}</span>
                  </h3>
                  {tableData && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Toplam {tableData.pagination.totalRows.toLocaleString('tr-TR')} satır
                    </span>
                  )}
                </div>

                {/* Arama Formu */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tabloda filtrele / ara..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-medium text-white transition"
                  >
                    Ara
                  </button>
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        loadTableData(selectedTable, 1, '');
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                    >
                      Temizle
                    </button>
                  )}
                </form>
              </div>

              {/* Tablo İçerik Tablosu */}
              <div className="overflow-x-auto min-h-[420px] max-h-[580px] overflow-y-auto mt-4 rounded-xl border border-slate-800/80 bg-slate-950">
                {tableLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
                    <p className="text-xs">PostgreSQL verileri okunuyor...</p>
                  </div>
                ) : !tableData || tableData.rows.length === 0 ? (
                  <div className="py-24 text-center text-slate-500 text-xs">
                    Kayıt bulunamadı.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-slate-300 font-mono uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-800/60 bg-slate-900">#</th>
                        {tableData.columns.map((col) => (
                          <th key={col.name} className="py-2.5 px-3 border-r border-slate-800/60 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-slate-200">{col.name}</span>
                              <span className="text-[9px] text-teal-500/80 font-normal lowercase">{col.type}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60 transition group">
                          <td className="py-2 px-3 text-[11px] text-slate-500 border-r border-slate-800/60 bg-slate-950/40">
                            {(tableData.pagination.page - 1) * tableData.pagination.limit + idx + 1}
                          </td>
                          {tableData.columns.map((col) => {
                            const val = row[col.name];
                            let displayVal = val === null || val === undefined ? 'NULL' : String(val);
                            const isNull = val === null || val === undefined;
                            const isImage = typeof val === 'string' && (val.startsWith('http') && (val.includes('images.unsplash') || val.includes('.jpg') || val.includes('.png')));

                            return (
                              <td
                                key={col.name}
                                className={`py-2 px-3 text-[11px] border-r border-slate-800/60 whitespace-nowrap max-w-[280px] truncate ${
                                  isNull ? 'text-slate-600 italic' : 'text-slate-300'
                                }`}
                                title={typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              >
                                {isImage ? (
                                  <div className="flex items-center gap-2">
                                    <img src={val} alt="thumb" className="w-6 h-6 object-cover rounded bg-slate-800 shrink-0" />
                                    <span className="truncate">{val}</span>
                                  </div>
                                ) : typeof val === 'object' && val !== null ? (
                                  JSON.stringify(val)
                                ) : (
                                  displayVal
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Alt Sayfalama */}
              {tableData && tableData.pagination.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800 text-xs">
                  <div className="text-slate-400">
                    Sayfa <span className="font-semibold text-white">{tableData.pagination.page}</span> / {tableData.pagination.totalPages.toLocaleString('tr-TR')}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newPage = Math.max(1, page - 1);
                        setPage(newPage);
                        loadTableData(selectedTable, newPage, search);
                      }}
                      disabled={page <= 1 || tableLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-xs px-2 text-slate-300">
                      {page}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = Math.min(tableData.pagination.totalPages, page + 1);
                        setPage(newPage);
                        loadTableData(selectedTable, newPage, search);
                      }}
                      disabled={page >= tableData.pagination.totalPages || tableLoading}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                      className="ml-3 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="25">25 satır</option>
                      <option value="50">50 satır</option>
                      <option value="100">100 satır</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Canlı SQL Sorgu Konsolu */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <span>Canlı SQL Sorgu Konsolu (Read-Only)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Örnek: <code className="bg-slate-900 px-1 py-0.5 rounded text-teal-300">SELECT brand, count(*) FROM products GROUP BY brand</code>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500 resize-y leading-relaxed"
                  placeholder="SELECT * FROM products LIMIT 10;"
                />
                <button
                  onClick={handleRunSql}
                  disabled={sqlLoading}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white shadow-lg transition"
                >
                  <Play className={`w-3.5 h-3.5 ${sqlLoading ? 'animate-spin' : ''}`} />
                  {sqlLoading ? 'Çalışıyor...' : 'Sorguyu Çalıştır'}
                </button>
              </div>

              {sqlError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sqlError}</span>
                </div>
              )}

              {sqlResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Başarılı • {sqlResult.totalReturned} satır döndü
                    </span>
                    <span className="font-mono">Süre: {sqlResult.executionTimeMs} ms</span>
                  </div>

                  <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead className="bg-slate-900 text-slate-300 text-[10px] uppercase sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          {sqlResult.columns.map((col: string) => (
                            <th key={col} className="py-2 px-3 border-r border-slate-800/60 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sqlResult.rows.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-900/50">
                            {sqlResult.columns.map((col: string) => (
                              <td key={col} className="py-2 px-3 text-[11px] text-slate-300 border-r border-slate-800/60 whitespace-nowrap">
                                {row[col] !== null ? String(row[col]) : <span className="italic text-slate-600">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
