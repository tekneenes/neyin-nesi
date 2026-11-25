import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockDatabase';
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit3,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Tag,
  ArrowRight,
  Link as LinkIcon,
  Globe,
  Building2,
  FileCheck,
  Database,
  Award,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminProductSummary {
  id: string;
  slug: string;
  brand: string;
  model: string;
  full_name: string;
  category_slug: string;
  category_name: string;
  hero_image: string;
  barcode: string;
  current_best_price: number;
  audit_status: 'approved' | 'review' | 'rejected';
  audit_notes: string;
  market_region: string;
  keyboard_layout: string;
  is_master: boolean;
  spec_count: string | number;
  is_published?: boolean;
}

interface SpecItemEdit {
  id: string;
  label: string;
  value: string;
  unit?: string;
  isKeyHighlight?: boolean;
  verificationLevel: 'manufacturer' | 'authorized_distributor' | 'licensed_provider' | 'verified_other';
  verificationSource: string;
}

interface SpecGroupEdit {
  id: string;
  title: string;
  sortOrder: number;
  items: SpecItemEdit[];
}

interface OfficialLink {
  country: string;   // e.g. 'TR', 'GLOBAL', 'DE'
  label: string;     // e.g. 'Türkiye Resmi Tanıtım Sayfası'
  url: string;       // e.g. 'https://www.mi.com/tr/product/xiaomi-watch-s3/'
}

interface ProductDetailEdit {
  id: string;
  slug: string;
  brand: string;
  model: string;
  fullName: string;
  categorySlug: string;
  categoryName: string;
  heroImage: string;
  barcode: string;
  currentBestPrice: number;
  auditStatus: 'approved' | 'review' | 'rejected';
  auditNotes: string;
  marketRegion: string;
  marketName: string;
  keyboardLayout: string;
  plugType: string;
  warrantyBadge: string;
  officialLinks: OfficialLink[];
  dataSources?: string[];
  isPublished?: boolean;
  ramGb?: number;
  storageGb?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// ÜRÜN VERİ VE DOĞRULAMA KAYNAKLARI (ÇOKLU SEÇİM)
// ══════════════════════════════════════════════════════════════════════════════
export interface DataSourcePreset {
  id: string;
  label: string;
  description: string;
  isOfficial?: boolean;
}

export const PRESET_DATA_SOURCES: DataSourcePreset[] = [
  {
    id: 'neyin_nesi_team',
    label: 'Neyin Nesi Araştırma & Doğrulama Ekibi',
    description: 'Uzman editör ve veri doğrulama ekibi tarafından bizzat teyit/kontrol edilmiş veri',
    isOfficial: true,
  },
  {
    id: 'manufacturer',
    label: 'Üretici Resmi Kaynağı',
    description: 'Resmi marka web sitesi, teknik spesifikasyon föyü ve lansman afişleri',
    isOfficial: true,
  },
  {
    id: 'authorized_distributor',
    label: 'Yetkili Distribütör & İthalatçı Belgeleri',
    description: 'Resmi ülke distribütörü garanti, uygunluk ve kutu içeriği beyannameleri',
  },
  {
    id: 'licensed_provider',
    label: 'Lisanslı Veri Sağlayıcı (Icecat / EPREL / GS1)',
    description: 'Uluslararası standart ürün veri katalogları ve resmi enerji verimlilik kayıtları',
  },
  {
    id: 'independent_lab',
    label: 'Bağımsız Test Laboratuvarı & İnceleme Kuruluşları',
    description: 'DxOMark, DisplayMate, Rtings, Stiftung Warentest vb. bağımsız laboratuvar ölçümleri',
  },
  {
    id: 'certification_registry',
    label: 'Resmi Sertifikasyon Kayıtları (CE / TSE / FCC / CCC)',
    description: 'Radyasyon, güvenlik, kablosuz frekans ve şarj sertifikasyon sicil verileri',
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// DÜNYA ÜLKELERİ VE BÖLGESEL PAZARLAR KATALOĞU
// ══════════════════════════════════════════════════════════════════════════════
export interface MarketOption {
  code: string;
  name: string;
  flag: string;
  group: 'Ana Pazarlar' | 'Avrupa' | 'Asya & Pasifik' | 'Amerika' | 'Orta Doğu & Afrika' | 'Diğer';
}

export const WORLD_MARKETS: MarketOption[] = [
  // Ana Pazarlar & Birlikler
  { code: 'TR', name: 'Türkiye Pazarı (Resmi TR)', flag: '🇹🇷', group: 'Ana Pazarlar' },
  { code: 'GLOBAL', name: 'Global / Uluslararası', flag: '🌐', group: 'Ana Pazarlar' },
  { code: 'EU', name: 'Avrupa Birliği (Genel EU)', flag: '🇪🇺', group: 'Ana Pazarlar' },
  { code: 'US', name: 'Amerika Birleşik Devletleri (ABD)', flag: '🇺🇸', group: 'Ana Pazarlar' },
  { code: 'CN', name: 'Çin Halk Cumhuriyeti (CN)', flag: '🇨🇳', group: 'Ana Pazarlar' },

  // Avrupa
  { code: 'DE', name: 'Almanya', flag: '🇩🇪', group: 'Avrupa' },
  { code: 'GB', name: 'Birleşik Krallık (İngiltere)', flag: '🇬🇧', group: 'Avrupa' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷', group: 'Avrupa' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹', group: 'Avrupa' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸', group: 'Avrupa' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱', group: 'Avrupa' },
  { code: 'PL', name: 'Polonya', flag: '🇵🇱', group: 'Avrupa' },
  { code: 'SE', name: 'İsveç', flag: '🇸🇪', group: 'Avrupa' },
  { code: 'CH', name: 'İsviçre', flag: '🇨🇭', group: 'Avrupa' },
  { code: 'AT', name: 'Avusturya', flag: '🇦🇹', group: 'Avrupa' },
  { code: 'BE', name: 'Belçika', flag: '🇧🇪', group: 'Avrupa' },
  { code: 'NO', name: 'Norveç', flag: '🇳🇴', group: 'Avrupa' },
  { code: 'DK', name: 'Danimarka', flag: '🇩🇰', group: 'Avrupa' },
  { code: 'FI', name: 'Finlandiya', flag: '🇫🇮', group: 'Avrupa' },
  { code: 'PT', name: 'Portekiz', flag: '🇵🇹', group: 'Avrupa' },
  { code: 'GR', name: 'Yunanistan', flag: '🇬🇷', group: 'Avrupa' },
  { code: 'CZ', name: 'Çekya', flag: '🇨🇿', group: 'Avrupa' },
  { code: 'RO', name: 'Romanya', flag: '🇷🇴', group: 'Avrupa' },
  { code: 'HU', name: 'Macaristan', flag: '🇭🇺', group: 'Avrupa' },
  { code: 'IE', name: 'İrlanda', flag: '🇮🇪', group: 'Avrupa' },
  { code: 'RU', name: 'Rusya', flag: '🇷🇺', group: 'Avrupa' },
  { code: 'UA', name: 'Ukrayna', flag: '🇺🇦', group: 'Avrupa' },

  // Asya & Pasifik
  { code: 'JP', name: 'Japonya', flag: '🇯🇵', group: 'Asya & Pasifik' },
  { code: 'KR', name: 'Güney Kore', flag: '🇰🇷', group: 'Asya & Pasifik' },
  { code: 'IN', name: 'Hindistan', flag: '🇮🇳', group: 'Asya & Pasifik' },
  { code: 'TW', name: 'Tayvan', flag: '🇹🇼', group: 'Asya & Pasifik' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', group: 'Asya & Pasifik' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', group: 'Asya & Pasifik' },
  { code: 'AU', name: 'Avustralya', flag: '🇦🇺', group: 'Asya & Pasifik' },
  { code: 'NZ', name: 'Yeni Zelanda', flag: '🇳🇿', group: 'Asya & Pasifik' },
  { code: 'MY', name: 'Malezya', flag: '🇲🇾', group: 'Asya & Pasifik' },
  { code: 'ID', name: 'Endonezya', flag: '🇮🇩', group: 'Asya & Pasifik' },
  { code: 'TH', name: 'Tayland', flag: '🇹🇭', group: 'Asya & Pasifik' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', group: 'Asya & Pasifik' },
  { code: 'PH', name: 'Filipinler', flag: '🇵🇭', group: 'Asya & Pasifik' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', group: 'Asya & Pasifik' },
  { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿', group: 'Asya & Pasifik' },
  { code: 'KZ', name: 'Kazakistan', flag: '🇰🇿', group: 'Asya & Pasifik' },
  { code: 'UZ', name: 'Özbekistan', flag: '🇺🇿', group: 'Asya & Pasifik' },

  // Amerika
  { code: 'CA', name: 'Kanada', flag: '🇨🇦', group: 'Amerika' },
  { code: 'MX', name: 'Meksika', flag: '🇲🇽', group: 'Amerika' },
  { code: 'BR', name: 'Brezilya', flag: '🇧🇷', group: 'Amerika' },
  { code: 'AR', name: 'Arjantin', flag: '🇦🇷', group: 'Amerika' },
  { code: 'CL', name: 'Şili', flag: '🇨🇱', group: 'Amerika' },
  { code: 'CO', name: 'Kolombiya', flag: '🇨🇴', group: 'Amerika' },

  // Orta Doğu & Afrika
  { code: 'AE', name: 'Birleşik Arap Emirlikleri (BAE)', flag: '🇦🇪', group: 'Orta Doğu & Afrika' },
  { code: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦', group: 'Orta Doğu & Afrika' },
  { code: 'QA', name: 'Katar', flag: '🇶🇦', group: 'Orta Doğu & Afrika' },
  { code: 'KW', name: 'Kuveyt', flag: '🇰🇼', group: 'Orta Doğu & Afrika' },
  { code: 'IL', name: 'İsrail', flag: '🇮🇱', group: 'Orta Doğu & Afrika' },
  { code: 'EG', name: 'Mısır', flag: '🇪🇬', group: 'Orta Doğu & Afrika' },
  { code: 'ZA', name: 'Güney Afrika', flag: '🇿🇦', group: 'Orta Doğu & Afrika' },
  { code: 'MA', name: 'Fas', flag: '🇲🇦', group: 'Orta Doğu & Afrika' },
  { code: 'NG', name: 'Nijerya', flag: '🇳🇬', group: 'Orta Doğu & Afrika' },
];

export const getMarketDisplay = (codesStr: string) => {
  if (!codesStr) return '🌐 Global';
  const codes = codesStr.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (codes.length === 0) return '🌐 Global';

  const displays = codes.map((c) => {
    const found = WORLD_MARKETS.find((m) => m.code === c);
    return found ? `${found.flag} ${found.code}` : `🌐 ${c}`;
  });

  return displays.join(' • ');
};

export const getMarketName = (codesStr: string) => {
  if (!codesStr) return 'Global / Uluslararası';
  const codes = codesStr.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean);
  if (codes.length === 0) return 'Global / Uluslararası';

  const names = codes.map((c) => {
    const found = WORLD_MARKETS.find((m) => m.code === c);
    return found ? found.name : c;
  });

  return names.join(', ');
};

// ══════════════════════════════════════════════════════════════════════════════
// ÖN TANIMLI GRUP VE ÖZELLİK ÖNERİ KÜTÜPHANESİ (HIZLI SEÇİM & SERBEST YAZIM)
// ══════════════════════════════════════════════════════════════════════════════
export const PRESET_GROUP_TITLES = [
  'EKRAN & GÖRÜNTÜ ÖZELLİKLERİ',
  'BATARYA & ŞARJ DONANIMI',
  'İŞLEMCİ & TEMEL DONANIM',
  'KAMERA SİSTEMİ & VİDEO',
  'KABLOSUZ BAĞLANTI & AĞ',
  'TASARIM, GÖVDE & DAYANIKLILIK',
  'SES & MULTİMEDYA',
  'YAZILIM & GÜVENLİK',
  'SAĞLIK & BİYOMETRİK SENSÖRLER',
  'DEPOLAMA & BELLEK',
  'FIRIN & OCAK DONANIMI',
  'MOTOR & PERFORMANS',
  'BOYUTLAR & AĞIRLIK',
];

export const PRESET_SPEC_LABELS = [
  'Bluetooth Sürümü',
  'Wi-Fi Standardı',
  'Ekran Boyutu',
  'Ekran Teknolojisi',
  'Çözünürlük',
  'Ekran Yenileme Hızı',
  'Parlaklık',
  'Sürekli Açık Ekran (AOD)',
  'Pil Kapasitesi',
  'Hızlı Şarj Gücü',
  'Kablosuz Şarj',
  'Tipik Kullanım Ömrü',
  'Şarj Süresi',
  'NFC Desteği',
  '5G Desteği',
  'SIM Kart Tipi',
  'İşlemci (CPU)',
  'Grafik İşlemci (GPU)',
  'Yonga Seti (Chipset)',
  'RAM Kapasitesi',
  'Dahili Depolama',
  'Suya Dayanıklılık',
  'Toza Dayanıklılık',
  'Parmak İzi Okuyucu',
  'İşletim Sistemi',
  'Gövde Materyali',
  'Ağırlık',
  'Boyutlar',
  'Hoparlör / Ses Çıkışı',
  'GPS / Konum Belirleme',
  'Optik Görüntü Sabitleme (OIS)',
];

export const SPEC_VALUE_SUGGESTIONS: Record<string, string[]> = {
  // Bluetooth Sürümü
  'bluetooth sürümü': [
    'Bluetooth 5.4',
    'Bluetooth 5.3',
    'Bluetooth 5.2',
    'Bluetooth 5.1',
    'Bluetooth 5.0',
    'Bluetooth 4.2',
    'Bluetooth 4.0',
    'Yok',
  ],
  'bluetooth': [
    'Bluetooth 5.4',
    'Bluetooth 5.3',
    'Bluetooth 5.2',
    'Bluetooth 5.0',
    'Bluetooth 4.2',
    'Yok',
  ],

  // Wi-Fi Standardı
  'wi-fi standardı': [
    'Wi-Fi 7 (802.11be)',
    'Wi-Fi 6E (802.11ax)',
    'Wi-Fi 6 (802.11ax)',
    'Wi-Fi 5 (802.11ac)',
    'Dual-Band Wi-Fi (2.4 / 5 GHz)',
    'Yok',
  ],
  'wi-fi': [
    'Wi-Fi 7 (802.11be)',
    'Wi-Fi 6E (802.11ax)',
    'Wi-Fi 6 (802.11ax)',
    'Wi-Fi 5 (802.11ac)',
    'Var',
    'Yok',
  ],

  // Ekran Yenileme Hızı
  'ekran yenileme hızı': ['120 Hz', '144 Hz', '165 Hz', '240 Hz', '90 Hz', '60 Hz'],
  'yenileme hızı': ['120 Hz', '144 Hz', '165 Hz', '240 Hz', '90 Hz', '60 Hz'],

  // Ekran Teknolojisi
  'ekran teknolojisi': [
    'AMOLED Dokunmatik Panel',
    'Super AMOLED',
    'LTPO OLED (1-120 Hz)',
    'OLED',
    'IPS LCD',
    'Mini-LED',
    'QLED',
    'TFT LCD',
  ],

  // Sürekli Açık Ekran
  'sürekli açık ekran (aod)': ['Var', 'Yok'],
  'sürekli açık ekran': ['Var', 'Yok'],
  'aod': ['Var', 'Yok'],

  // NFC Desteği
  'nfc desteği': ['Var', 'Var (Temassız Ödeme & Akıllı Kartlar)', 'Yok'],
  'nfc': ['Var', 'Yok'],

  // 5G Desteği
  '5g desteği': ['Var (Sub-6 GHz & mmWave)', 'Var (Sub-6 GHz)', 'Yok (4.5G LTE)'],
  '5g': ['Var', 'Yok'],

  // SIM Kart Tipi
  'sim kart tipi': [
    'Nano-SIM + eSIM',
    'Çift Nano-SIM',
    'Çift eSIM',
    'Tek Nano-SIM',
    'eSIM Destekli',
  ],
  'sim kart': [
    'Nano-SIM + eSIM',
    'Çift Nano-SIM',
    'Çift eSIM',
    'Tek Nano-SIM',
  ],

  // Suya Dayanıklılık
  'suya dayanıklılık': [
    '5 ATM (50 Metre Su Geçirmezlik)',
    '10 ATM (100 Metre)',
    'IP68 (1.5 Metre 30 Dk)',
    'IP67 (1 Metre 30 Dk)',
    'IPX4 (Sıçramalara Karşı)',
    'Suya Dayanıklı Değil',
  ],

  // Toza Dayanıklılık
  'toza dayanıklılık': ['IP6X (Tam Toz Geçirmez)', 'IP5X', 'Yok'],

  // Hızlı Şarj Gücü
  'hızlı şarj gücü': [
    '120W HyperCharge',
    '100W Hızlı Şarj',
    '67W Turbo Şarj',
    '45W Süper Hızlı Şarj',
    '33W Hızlı Şarj',
    '25W Hızlı Şarj',
    '18W Hızlı Şarj',
    'Yok',
  ],
  'hızlı şarj': [
    '120W HyperCharge',
    '67W Turbo Şarj',
    '45W Hızlı Şarj',
    '33W',
    '25W',
    'Var',
    'Yok',
  ],

  // Kablosuz Şarj
  'kablosuz şarj': [
    'Var (15W Qi2 / MagSafe)',
    'Var (50W Ultra Hızlı Kablosuz)',
    'Var (15W Standart Qi)',
    'Yok',
  ],

  // Parmak İzi Okuyucu
  'parmak izi okuyucu': [
    'Ekran İçi Ultrasonik',
    'Ekran İçi Optik',
    'Güç Tuşuna Entegre (Yan)',
    'Yok',
  ],

  // İşletim Sistemi
  'işletim sistemi': [
    'Android 15',
    'Android 14',
    'iOS 18',
    'HyperOS 2.0',
    'Wear OS 5',
    'Windows 11 Pro',
    'Windows 11 Home',
    'macOS Sequoia',
    'iPadOS 18',
  ],

  // RAM Kapasitesi
  'ram kapasitesi': ['8 GB', '12 GB', '16 GB', '24 GB', '32 GB', '64 GB', '4 GB', '6 GB'],
  'ram': ['8 GB', '12 GB', '16 GB', '24 GB', '32 GB', '64 GB'],

  // Dahili Depolama
  'dahili depolama': ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB', '64 GB'],
  'depolama': ['128 GB', '256 GB', '512 GB', '1 TB', '2 TB'],

  // Pil Kapasitesi
  'pil kapasitesi': [
    '5000 mAh Li-Po',
    '5400 mAh Li-Po',
    '6000 mAh Si-C',
    '4500 mAh Li-Po',
    '486 mAh Li-Po',
    '590 mAh Li-Po',
  ],

  // Gövde Materyali
  'gövde materyali': [
    'Alüminyum Kasa, Cam Arka Yüzey',
    'Titanyum Çerçeve, Seramik Arka',
    'Paslanmaz Çelik Kasa',
    'Polikarbonat Gövde',
    'Magnezyum Alaşım',
  ],

  // Optik Görüntü Sabitleme (OIS)
  'optik görüntü sabitleme (ois)': ['Var (Donanımsal OIS)', 'Sensör Kaydırmalı OIS', 'Yok (Yalnızca EIS)'],

  // Hoparlör / Ses Çıkışı
  'hoparlör / ses çıkışı': [
    'Stereo Çift Hoparlör (Dolby Atmos)',
    'Dörtlü Stereo Hoparlör',
    'Mono Hoparlör',
  ],

  // İşlemci / CPU / Yonga Seti
  'islemci cpu': [
    'Xring T1',
    'Qualcomm Snapdragon W5 Gen 1 (4 nm)',
    'Qualcomm Snapdragon W5+ Gen 1 (4 nm)',
    'Apple S9 SiP',
    'Apple S8 SiP',
    'Exynos W1000 (3 nm)',
    'Exynos W930',
    'Snapdragon Wear 4100+',
    'Apollo4 Plus',
  ],
  'islemci': [
    'Xring T1',
    'Qualcomm Snapdragon W5 Gen 1 (4 nm)',
    'Qualcomm Snapdragon W5+ Gen 1 (4 nm)',
    'Apple S9 SiP',
    'Exynos W1000 (3 nm)',
    'Snapdragon Wear 4100+',
    'Apollo4 Plus',
  ],
  'yardimci islemci': ['Cortex-M', 'Apollo4 Plus', 'Cortex-M55', 'Cortex-M33', 'Yok'],
  'grafik islemcisi gpu': [
    'Yok (Donanımsal 2D/3D Arayüz Hızlandırıcı Mevcut)',
    'Adreno 504',
    'Adreno A702',
    'Mali-G68',
    'Yok',
  ],
  // İşlemci Frekansı
  'islemci cpu frekansi': ['500 MHz', '1.2 GHz', '1.5 GHz', '2.0 GHz', '2.4 GHz', '3.0 GHz', 'Belirtilmemiş'],
  'islemci frekansi': ['500 MHz', '1.2 GHz', '1.5 GHz', '2.0 GHz', '2.4 GHz', '3.0 GHz', 'Belirtilmemiş'],
  'frekans': ['500 MHz', '1.2 GHz', '1.5 GHz', '2.0 GHz', '2.4 GHz', '3.0 GHz'],
};

// Yardımcı: Türkçe ve büyük/küçük harf duyarsız temiz anahtar üretir
export function normalizeLabelKey(label: string): string {
  if (!label) return '';
  return label
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Yardımcı: Özellik adına göre uygun hazır seçenekleri bulur
export const getSuggestionsForLabel = (label: string): string[] => {
  if (!label || !label.trim()) return [];
  const cleanNorm = normalizeLabelKey(label);
  const rawLower = label.toLowerCase().trim();

  // 1. Birebir eşleşme
  if (SPEC_VALUE_SUGGESTIONS[cleanNorm]) {
    return SPEC_VALUE_SUGGESTIONS[cleanNorm];
  }
  if (SPEC_VALUE_SUGGESTIONS[rawLower]) {
    return SPEC_VALUE_SUGGESTIONS[rawLower];
  }

  const isFreq = cleanNorm.includes('frekans') || cleanNorm.includes('hiz');
  const isCoprocessor = cleanNorm.includes('yardimci') || cleanNorm.includes('coprocessor');
  const isGpu = cleanNorm.includes('gpu') || cleanNorm.includes('grafik');
  const isCpu = (cleanNorm.includes('islemci') || cleanNorm.includes('cpu')) && !isFreq && !isCoprocessor && !isGpu;

  // 2. Kısmi eşleşme (alan korumalı)
  for (const [key, options] of Object.entries(SPEC_VALUE_SUGGESTIONS)) {
    const cleanKey = normalizeLabelKey(key);

    if (isFreq && !cleanKey.includes('frekans') && !cleanKey.includes('hiz') && !cleanKey.includes('mhz') && !cleanKey.includes('ghz')) {
      continue;
    }
    if (isCoprocessor && !cleanKey.includes('yardimci') && !cleanKey.includes('coprocessor')) {
      continue;
    }
    if (isGpu && !cleanKey.includes('gpu') && !cleanKey.includes('grafik')) {
      continue;
    }
    if (isCpu && (cleanKey.includes('yardimci') || cleanKey.includes('gpu') || cleanKey.includes('grafik') || cleanKey.includes('frekans') || cleanKey.includes('hiz'))) {
      continue;
    }

    if (
      cleanNorm === cleanKey ||
      cleanNorm.includes(cleanKey) ||
      cleanKey.includes(cleanNorm) ||
      rawLower.includes(key) ||
      key.includes(rawLower)
    ) {
      return options;
    }
  }

  return [];
};

// Yardımcı: Canlı veritabanı kategori önerileri ile statik önerileri harmanlar ve sıralar
export const getCombinedSuggestions = (
  label: string,
  categoryPresetsMap: Record<string, string[]>
): string[] => {
  if (!label || !label.trim()) return [];
  const cleanLabel = normalizeLabelKey(label);
  const rawLower = label.toLowerCase().trim();
  const trLower = label.toLocaleLowerCase('tr-TR').trim();
  const withoutParens = normalizeLabelKey(label.replace(/\([^)]*\)/g, ''));

  let dbCatSuggestions: string[] = [];

  // 1. Doğrudan anahtar eşleşmesi
  if (categoryPresetsMap[cleanLabel]?.length) {
    dbCatSuggestions = categoryPresetsMap[cleanLabel];
  } else if (categoryPresetsMap[rawLower]?.length) {
    dbCatSuggestions = categoryPresetsMap[rawLower];
  } else if (categoryPresetsMap[trLower]?.length) {
    dbCatSuggestions = categoryPresetsMap[trLower];
  } else if (withoutParens && categoryPresetsMap[withoutParens]?.length) {
    dbCatSuggestions = categoryPresetsMap[withoutParens];
  }

  // 2. Kısmi eşleşme (alan korumalı)
  if (dbCatSuggestions.length === 0 && cleanLabel) {
    const isFreq = cleanLabel.includes('frekans') || cleanLabel.includes('hiz');
    const isCoprocessor = cleanLabel.includes('yardimci') || cleanLabel.includes('coprocessor');
    const isGpu = cleanLabel.includes('gpu') || cleanLabel.includes('grafik');
    const isCpu = (cleanLabel.includes('islemci') || cleanLabel.includes('cpu')) && !isFreq && !isCoprocessor && !isGpu;

    for (const [dbKey, vals] of Object.entries(categoryPresetsMap || {})) {
      if (!vals || vals.length === 0) continue;
      const cleanDbKey = normalizeLabelKey(dbKey);

      if (isFreq && !cleanDbKey.includes('frekans') && !cleanDbKey.includes('hiz') && !cleanDbKey.includes('mhz')) continue;
      if (isCoprocessor && !cleanDbKey.includes('yardimci') && !cleanDbKey.includes('coprocessor')) continue;
      if (isGpu && !cleanDbKey.includes('gpu') && !cleanDbKey.includes('grafik')) continue;
      if (isCpu && (cleanDbKey.includes('yardimci') || cleanDbKey.includes('gpu') || cleanDbKey.includes('grafik') || cleanDbKey.includes('frekans') || cleanDbKey.includes('hiz'))) continue;

      if (
        cleanDbKey === cleanLabel ||
        cleanDbKey === withoutParens ||
        cleanLabel.includes(cleanDbKey) ||
        cleanDbKey.includes(cleanLabel)
      ) {
        dbCatSuggestions = vals;
        break;
      }
    }
  }

  const staticSuggestions = getSuggestionsForLabel(label);

  // Birleştir ve büyük/küçük harf duyarsız tekilleştir
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const s of [...dbCatSuggestions, ...staticSuggestions]) {
    const valTrim = (s || '').trim();
    if (!valTrim) continue;
    const lowerKey = normalizeLabelKey(valTrim);
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      merged.push(valTrim);
    }
  }

  return merged;
};

export const DataCurationStudioPage: React.FC = () => {
  const { navigate } = useApp();

  // Liste State
  const [products, setProducts] = useState<AdminProductSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPublishStatus, setSelectedPublishStatus] = useState<string>('all'); // 'all' | 'published' | 'unpublished'
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [stats, setStats] = useState({ total: 0, approved: 0, review: 0, rejected: 0, published: 0, unpublished: 0 });

  // Silme Onay Modalı State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Düzenleme Modalı State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDetailEdit | null>(null);
  const [editingSpecGroups, setEditingSpecGroups] = useState<SpecGroupEdit[]>([]);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Yeni grup ekleme state
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [showAddGroupInput, setShowAddGroupInput] = useState(false);

  // Kategoriye Özel Dinamik Veritabanı Öneri Kütüphanesi
  const [categoryPresets, setCategoryPresets] = useState<{
    groups: string[];
    labels: string[];
    valueSuggestions: Record<string, string[]>;
  }>({
    groups: [],
    labels: [],
    valueSuggestions: {},
  });
  const [presetsLoading, setPresetsLoading] = useState<boolean>(false);

  // Çoklu Pazar / Ülke Seçici State
  const [isMarketDropdownOpen, setIsMarketDropdownOpen] = useState<boolean>(false);
  const [marketSearchQuery, setMarketSearchQuery] = useState<string>('');

  // Resmi Marka Linkleri State
  const [isLinkCountryDropdownOpen, setIsLinkCountryDropdownOpen] = useState<number | null>(null); // hangi linkin dropdown'ı açık
  const [linkCountrySearch, setLinkCountrySearch] = useState<string>('');

  const handleAddOfficialLink = () => {
    if (!editingProduct) return;
    const newLink: OfficialLink = { country: 'GLOBAL', label: '', url: '' };
    setEditingProduct({
      ...editingProduct,
      officialLinks: [...(editingProduct.officialLinks || []), newLink],
    });
  };

  const handleUpdateOfficialLink = (idx: number, field: keyof OfficialLink, val: string) => {
    if (!editingProduct) return;
    const links = [...(editingProduct.officialLinks || [])];
    links[idx] = { ...links[idx], [field]: val };
    setEditingProduct({ ...editingProduct, officialLinks: links });
  };

  const handleRemoveOfficialLink = (idx: number) => {
    if (!editingProduct) return;
    const links = (editingProduct.officialLinks || []).filter((_, i) => i !== idx);
    setEditingProduct({ ...editingProduct, officialLinks: links });
  };

  // Veri Kaynakları State & Handlers
  const [customDataSourceInput, setCustomDataSourceInput] = useState<string>('');

  const handleToggleDataSource = (sourceLabel: string) => {
    if (!editingProduct) return;
    const currentSources = editingProduct.dataSources || [];
    let nextSources: string[];
    if (currentSources.includes(sourceLabel)) {
      nextSources = currentSources.filter((s) => s !== sourceLabel);
    } else {
      nextSources = [...currentSources, sourceLabel];
    }
    setEditingProduct({ ...editingProduct, dataSources: nextSources });
  };

  const handleAddCustomDataSource = () => {
    if (!editingProduct || !customDataSourceInput.trim()) return;
    const trimmed = customDataSourceInput.trim();
    const currentSources = editingProduct.dataSources || [];
    if (!currentSources.includes(trimmed)) {
      setEditingProduct({
        ...editingProduct,
        dataSources: [...currentSources, trimmed],
      });
    }
    setCustomDataSourceInput('');
  };

  const handleRemoveDataSource = (sourceLabel: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      dataSources: (editingProduct.dataSources || []).filter((s) => s !== sourceLabel),
    });
  };

  const handleToggleMarketCode = (code: string) => {
    if (!editingProduct) return;
    const currentCodes = (editingProduct.marketRegion || 'TR')
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    let nextCodes: string[];
    if (currentCodes.includes(code)) {
      nextCodes = currentCodes.filter((c) => c !== code);
      if (nextCodes.length === 0) nextCodes = ['GLOBAL'];
    } else {
      nextCodes = [...currentCodes, code];
    }

    const nextRegion = nextCodes.join(',');
    setEditingProduct({
      ...editingProduct,
      marketRegion: nextRegion,
      marketName: getMarketName(nextRegion),
    });
  };

  // 1. Ürün Listesini Yükle
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (search.trim()) params.set('search', search.trim());
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedPublishStatus !== 'all') params.set('publishStatus', selectedPublishStatus);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error('Ürünler yüklenemedi');
      const data = await res.json();

      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalRows(data.pagination?.totalRows || 0);
      setStats(data.stats || { total: 0, approved: 0, review: 0, rejected: 0, published: 0, unpublished: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, selectedStatus, selectedCategory, selectedPublishStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  // 2. Hızlı Durum Değiştirme (Listeden Tek Tıkla)
  const handleQuickStatusChange = async (id: string, newStatus: 'approved' | 'review' | 'rejected', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/admin/product-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        // UI'da hemen güncelle
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, audit_status: newStatus } : p))
        );
        // İstatistikleri güncelle
        setStats((prev) => {
          const oldProd = products.find((p) => p.id === id);
          const oldSt = oldProd?.audit_status || 'review';
          return {
            ...prev,
            [oldSt]: Math.max(0, (prev as any)[oldSt] - 1),
            [newStatus]: (prev as any)[newStatus] + 1,
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2.b. Ürünü Yayına Al / Yayından Kaldır (Taslağa Çek)
  const handleTogglePublish = async (id: string, currentlyPublished: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextPublished = !currentlyPublished;
    try {
      const res = await fetch('/api/admin/product-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPublished: nextPublished }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_published: nextPublished } : p))
        );
        if (editingProduct && editingProduct.id === id) {
          setEditingProduct((prev) => (prev ? { ...prev, isPublished: nextPublished } : null));
        }
        setStats((prev) => ({
          ...prev,
          published: nextPublished ? prev.published + 1 : Math.max(0, prev.published - 1),
          unpublished: nextPublished ? Math.max(0, prev.unpublished - 1) : prev.unpublished + 1,
        }));
        setToastMessage(nextPublished ? '✓ Ürün başarıyla YAYINA ALINDI!' : 'ℹ️ Ürün YAYINDAN KALDIRILDI (Taslak)');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        alert('Yayın durumu güncellenemedi');
      }
    } catch (err) {
      console.error(err);
      alert('Yayın durumu güncellenirken hata oluştu');
    }
  };

  // 2.c. Ürün Silme İstemi (Onay Modalı Açar)
  const handleDeleteClick = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm({ id, name });
  };

  // 2.d. Silmeyi Gerçekleştir
  const handleExecuteDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleteLoading(true);
      const res = await fetch('/api/admin/product-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteConfirm.id }),
      });
      if (!res.ok) throw new Error('Silme işlemi başarısız');

      const deletedId = deleteConfirm.id;
      setProducts((prev) => prev.filter((p) => p.id !== deletedId));
      setTotalRows((prev) => Math.max(0, prev - 1));
      if (editingProductId === deletedId) {
        setEditingProductId(null);
        setEditingProduct(null);
      }
      setToastMessage('✓ Ürün ve bağlı özellikleri kalıcı olarak silindi.');
      setTimeout(() => setToastMessage(null), 3000);
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error(err);
      alert('Ürün silinemedi: ' + (err.message || 'Hata'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // 3. Ürün Detayını Aç & Düzenle (Dinamik Kategori Önerilerini de Getirir)
  const openEditModal = async (id: string) => {
    setEditingProductId(id);
    setDetailLoading(true);
    setIsLinkCountryDropdownOpen(null);
    try {
      const res = await fetch(`/api/admin/product-detail?id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Detay yüklenemedi');
      const data = await res.json();
      // Ensure officialLinks and dataSources are always arrays
      setEditingProduct({
        ...data.product,
        isPublished: data.product?.isPublished !== false,
        officialLinks: Array.isArray(data.product?.officialLinks) ? data.product.officialLinks : [],
        dataSources: Array.isArray(data.product?.dataSources) && data.product.dataSources.length > 0
          ? data.product.dataSources
          : ['Üretici Resmi Kaynağı', 'Neyin Nesi Araştırma & Doğrulama Ekibi'],
      });
      setEditingSpecGroups(data.specGroups || []);

      // Bu ürünün ait olduğu kategorideki gerçek veritabanı gruplarını ve özelliklerini yükle
      if (data.product?.categorySlug) {
        fetchCategoryPresets(data.product.categorySlug);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Kategoriye ait dinamik önerileri getir
  const fetchCategoryPresets = (categorySlug: string) => {
    setPresetsLoading(true);
    fetch(`/api/admin/category-presets?category=${encodeURIComponent(categorySlug)}`)
      .then((r) => r.json())
      .then((pData) => {
        setCategoryPresets({
          groups: pData.groups || [],
          labels: pData.labels || [],
          valueSuggestions: pData.valueSuggestions || {},
        });
      })
      .catch((e) => console.error('Kategori önerileri yükleme hatası:', e))
      .finally(() => setPresetsLoading(false));
  };

  // 3b. Yeni Ürün Ekle Modalını Aç
  const handleOpenNewProductModal = () => {
    const tempId = `new-${Date.now()}`;
    setEditingProductId(tempId);
    setDetailLoading(false);
    setIsLinkCountryDropdownOpen(null);
    setEditingProduct({
      id: tempId,
      slug: '',
      fullName: '',
      brand: '',
      model: '',
      categorySlug: 'akilli-saatler',
      categoryName: 'Akıllı Saatler',
      heroImage: '',
      barcode: '',
      currentBestPrice: 0,
      auditStatus: 'review',
      auditNotes: 'Yeni ürün girişi yapıldı',
      marketRegion: 'TR',
      marketName: 'Türkiye Pazarı (Resmi TR)',
      keyboardLayout: '',
      plugType: 'Tip C (Avrupa Standart)',
      warrantyBadge: 'Resmi Distribütör Garantili',
      officialLinks: [],
      dataSources: ['Neyin Nesi Araştırma & Doğrulama Ekibi', 'Üretici Resmi Kaynağı'],
    });

    setEditingSpecGroups([
      {
        id: `grp-${tempId}-0`,
        title: 'TEMEL TEKNİK ÖZELLİKLER',
        sortOrder: 0,
        items: [
          {
            id: `item-${tempId}-0-0`,
            label: 'Ekran Boyutu',
            value: '',
            verificationLevel: 'manufacturer',
            verificationSource: 'Üretici Resmi Kaynağı',
          },
          {
            id: `item-${tempId}-0-1`,
            label: 'Batarya Kapasitesi',
            value: '',
            verificationLevel: 'manufacturer',
            verificationSource: 'Üretici Resmi Kaynağı',
          },
        ],
      },
    ]);

    fetchCategoryPresets('akilli-saatler');
  };

  // 4. Özellik Grubu Ekle
  const handleAddGroup = () => {
    if (!newGroupTitle.trim()) return;
    const newGrp: SpecGroupEdit = {
      id: `grp-new-${Date.now()}`,
      title: newGroupTitle.trim(),
      sortOrder: editingSpecGroups.length,
      items: [],
    };
    setEditingSpecGroups([...editingSpecGroups, newGrp]);
    setNewGroupTitle('');
    setShowAddGroupInput(false);
  };

  // 5. Özellik Grubu Sil
  const handleDeleteGroup = (groupId: string) => {
    setEditingSpecGroups(editingSpecGroups.filter((g) => g.id !== groupId));
  };

  // 6. Gruba Yeni Özellik Satırı Ekle
  const handleAddItem = (groupId: string) => {
    setEditingSpecGroups(
      editingSpecGroups.map((g) => {
        if (g.id !== groupId) return g;
        const newItem: SpecItemEdit = {
          id: `item-new-${Date.now()}`,
          label: '',
          value: '',
          verificationLevel: 'manufacturer',
          verificationSource: 'Üretici Resmi Kaynağı',
        };
        return {
          ...g,
          items: [...g.items, newItem],
        };
      })
    );
  };

  // 7. Özellik Satırını Güncelle
  const handleItemChange = (
    groupId: string,
    itemId: string,
    field: keyof SpecItemEdit,
    val: any
  ) => {
    setEditingSpecGroups(
      editingSpecGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.map((it) => (it.id === itemId ? { ...it, [field]: val } : it)),
        };
      })
    );
  };

  // 8. Özellik Satırını Sil
  const handleDeleteItem = (groupId: string, itemId: string) => {
    setEditingSpecGroups(
      editingSpecGroups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          items: g.items.filter((it) => it.id !== itemId),
        };
      })
    );
  };

  // 9. Değişiklikleri Veritabanına Kaydet
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    try {
      setSaveLoading(true);
      const isNew = editingProduct.id.startsWith('new-');
      const res = await fetch('/api/admin/product-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          product: editingProduct,
          specGroups: editingSpecGroups,
        }),
      });

      if (!res.ok) throw new Error('Kaydedilemedi');
      const resultData = await res.json();
      const savedId = resultData.id || editingProduct.id;

      setToastMessage(isNew ? '✓ Yeni ürün başarıyla oluşturuldu ve kataloğa eklendi!' : '✓ Ürün ve teknik özellikler başarıyla kaydedildi!');
      setTimeout(() => setToastMessage(null), 3000);

      if (isNew) {
        // Yeni ürünü ürünler listesinin en başına ekle ve toplam sayıyı güncelle
        const newProductSummary: AdminProductSummary = {
          id: savedId,
          slug: editingProduct.slug || savedId.replace(/^prod-/, ''),
          brand: editingProduct.brand || 'Genel',
          model: editingProduct.model || 'Model',
          full_name: editingProduct.fullName || `${editingProduct.brand} ${editingProduct.model}`,
          category_slug: editingProduct.categorySlug || 'akilli-saatler',
          category_name: editingProduct.categoryName || 'Akıllı Saatler',
          hero_image: editingProduct.heroImage || 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=600&q=80',
          barcode: editingProduct.barcode || '',
          current_best_price: editingProduct.currentBestPrice || 0,
          audit_status: editingProduct.auditStatus || 'review',
          audit_notes: editingProduct.auditNotes || '',
          market_region: editingProduct.marketRegion || 'TR',
          keyboard_layout: editingProduct.keyboardLayout || '',
          is_master: false,
          spec_count: editingSpecGroups.reduce((acc, g) => acc + g.items.length, 0),
          is_published: editingProduct.isPublished !== false,
        };
        setProducts((prev) => [newProductSummary, ...prev]);
        setTotalRows((t) => t + 1);
        setStats((s) => ({ ...s, total: s.total + 1, review: s.review + 1 }));
        setEditingProduct({ ...editingProduct, id: savedId });
      } else {
        // Ana listedeki kaydı da güncelle
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  full_name: editingProduct.fullName,
                  brand: editingProduct.brand,
                  model: editingProduct.model,
                  hero_image: editingProduct.heroImage,
                  barcode: editingProduct.barcode,
                  category_slug: editingProduct.categorySlug,
                  category_name: editingProduct.categoryName,
                  current_best_price: editingProduct.currentBestPrice,
                  audit_status: editingProduct.auditStatus,
                  market_region: editingProduct.marketRegion,
                  keyboard_layout: editingProduct.keyboardLayout,
                  spec_count: editingSpecGroups.reduce((acc, g) => acc + g.items.length, 0),
                  is_published: editingProduct.isPublished !== false,
                }
              : p
          )
        );
      }

      if (editingProduct.categorySlug) {
        fetchCategoryPresets(editingProduct.categorySlug);
      }
    } catch (err) {
      console.error(err);
      alert('Kaydetme hatası oluştu!');
    } finally {
      setSaveLoading(false);
    }
  };

  // Birleşik Durum & Yayın Filtresi (Sekmeler arası çakışmayı önler)
  const activeFilterKey =
    selectedPublishStatus === 'unpublished'
      ? 'unpublished'
      : selectedPublishStatus === 'published'
      ? 'published'
      : selectedStatus;

  const handleSelectFilter = (key: string) => {
    setPage(1);
    setSearch(''); // Arama kutusunu sıfırla ki seçili filtrenin ürünleri doğrudan listelensin
    if (activeFilterKey === key) {
      // Zaten aktif olan sekmeye tekrar basıldıysa filtreyi kaldırıp tümüne dön
      setSelectedStatus('all');
      setSelectedPublishStatus('all');
      return;
    }

    if (key === 'published') {
      setSelectedStatus('all');
      setSelectedPublishStatus('published');
    } else if (key === 'unpublished') {
      setSelectedStatus('all');
      setSelectedPublishStatus('unpublished');
    } else {
      setSelectedStatus(key);
      setSelectedPublishStatus('all');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 font-sans">
      {/* 1. ÜST HERO & İSTATİSTİK BAŞLIĞI (YATAY FERAH YAPI - YAZILAR YANA DOĞRU, FİLTRELER ALT KISIMDA) */}
      <div className="border-b border-slate-800 bg-[#0B0F14]/95 backdrop-blur sticky top-16 z-30 py-3 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto space-y-2.5">
          {/* Üst Satır: Başlık, Açıklama Yatay Yana Doğru ve Yeni Ürün Ekle Butonu */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-pulse shrink-0" />
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight whitespace-nowrap">
                  🛠️ Veri Denetim & Editoryal Stüdyo
                </h1>
              </div>
              <span className="hidden lg:inline text-slate-700">|</span>
              <p className="text-xs text-slate-400 whitespace-normal lg:whitespace-nowrap">
                Katalogdaki ürünleri listeleyin, onay durumlarını (✅ Onaylı, ❓ İncelenecek, ❌ Hatalı) yönetin ve teknik tabloları zenginleştirin.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewProductModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] shrink-0 active:scale-95 cursor-pointer self-start lg:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Ürün Ekle</span>
            </button>
          </div>

          {/* Alt Kısım: Filtre Sekmeleri */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap pt-2 border-t border-slate-800/60">
            {/* Tümü */}
            <button
              onClick={() => handleSelectFilter('all')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeFilterKey === 'all'
                  ? 'bg-slate-800 border-[#14B8A6] text-white shadow-sm ring-1 ring-[#14B8A6]/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📦 Tümü: <span className="text-white font-mono">{stats.total.toLocaleString('tr-TR')}</span>
            </button>

            {/* Onaylı */}
            <button
              onClick={() => handleSelectFilter('approved')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilterKey === 'approved'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-emerald-400 hover:border-emerald-500/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Onaylı (✅): <span className="font-mono">{stats.approved.toLocaleString('tr-TR')}</span>
            </button>

            {/* İncelenecek */}
            <button
              onClick={() => handleSelectFilter('review')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilterKey === 'review'
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-sm ring-1 ring-amber-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-amber-400 hover:border-amber-500/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              İncelenecek (❓): <span className="font-mono">{stats.review.toLocaleString('tr-TR')}</span>
            </button>

            {/* Hatalı */}
            <button
              onClick={() => handleSelectFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilterKey === 'rejected'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-sm ring-1 ring-rose-500/50'
                  : 'bg-slate-900/60 border-slate-800 text-rose-400 hover:border-rose-500/50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              Hatalı (❌): <span className="font-mono">{stats.rejected.toLocaleString('tr-TR')}</span>
            </button>

            {/* Ayırıcı */}
            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Yayında */}
            <button
              onClick={() => handleSelectFilter('published')}
              title="Yalnızca yayında olan ürünleri filtrele"
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilterKey === 'published'
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-sm ring-1 ring-emerald-400/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Yayında: <span className="font-mono">{stats.published.toLocaleString('tr-TR')}</span>
            </button>

            {/* Taslak */}
            {stats.unpublished > 0 && (
              <button
                onClick={() => handleSelectFilter('unpublished')}
                title="Yayından kaldırılan / taslak ürünleri filtrele"
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFilterKey === 'unpublished'
                    ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-amber-400'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                Taslak: <span className="font-mono">{stats.unpublished.toLocaleString('tr-TR')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 2. ARAMA VE FİLTRELEME ÇUBUĞU */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ürün adı, marka, model, barkod veya ID ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#14B8A6] hover:bg-[#0d9488] text-white font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              Ara
            </button>
            <button
              type="button"
              onClick={handleOpenNewProductModal}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
              title="Yeni Ürün Ekle"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Ürün Ekle</span>
            </button>
          </form>

          {/* Sayfalama Kontrolleri */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Toplam <strong className="text-white font-mono">{totalRows.toLocaleString('tr-TR')}</strong> ürün (Sayfa {page} / {totalPages})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. ANA ÜRÜN SIRALI LİSTESİ */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Ürünler yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-base font-bold text-white">Eşleşen ürün bulunamadı</p>
              <p className="text-xs text-slate-400">
                {activeFilterKey !== 'all'
                  ? `Seçili filtrenizde (${activeFilterKey === 'approved' ? 'Onaylı' : activeFilterKey === 'rejected' ? 'Hatalı' : activeFilterKey === 'review' ? 'İncelenecek' : activeFilterKey === 'unpublished' ? 'Taslak' : 'Yayında'}) şu an ürün bulunmuyor.`
                  : 'Arama kriterinizi veya filtreleri değiştirmeyi deneyin.'}
              </p>
              {(activeFilterKey !== 'all' || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedPublishStatus('all');
                    setSearch('');
                    setPage(1);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#14B8A6] mt-2 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Filtreleri Temizle & Tümünü Göster
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Görsel</th>
                    <th className="py-3 px-4">Ürün & Model</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Barkod & Pazar</th>
                    <th className="py-3 px-4 text-center">Özellikler</th>
                    <th className="py-3 px-4 text-center">Yayın Durumu</th>
                    <th className="py-3 px-4 text-center">Onay Durumu</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {products.map((prod) => {
                    const status = prod.audit_status || 'review';
                    const displayName = (prod.full_name && prod.full_name.trim()) || prod.model || 'İsimsiz Ürün';
                    return (
                      <tr
                        key={prod.id}
                        onClick={() => openEditModal(prod.id)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        {/* Görsel */}
                        <td className="py-3 px-4 shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700/60 shrink-0 flex items-center justify-center overflow-hidden">
                            {prod.hero_image ? (
                              <img
                                src={prod.hero_image}
                                alt=""
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </td>

                        {/* Ürün & Model */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="font-extrabold text-white text-sm group-hover:text-[#14B8A6] transition-colors truncate">
                              {displayName}
                            </div>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(displayName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title={`Google'da ara: ${displayName}`}
                              className="shrink-0 p-1 rounded-lg text-slate-600 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-slate-300">{prod.brand}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500 truncate">{prod.id}</span>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                            {prod.category_name || prod.category_slug}
                          </span>
                        </td>

                        {/* Barkod & Pazar */}
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-300">{prod.barcode || '—'}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-slate-300">{getMarketDisplay(prod.market_region)}</span>
                          </div>
                        </td>


                        {/* Özellik Sayısı */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              Number(prod.spec_count) > 0
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {prod.spec_count} özellik
                          </span>
                        </td>

                        {/* Yayın Durumu (Yayında / Taslak) */}
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleTogglePublish(prod.id, prod.is_published !== false, e)}
                            title={prod.is_published !== false ? 'Şu anda yayında. Tıklayarak yayından kaldırın (taslak).' : 'Şu anda taslak. Tıklayarak yayına alın.'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                              prod.is_published !== false
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {prod.is_published !== false ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <Globe className="w-3.5 h-3.5" />
                                <span>Yayında</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Yayında Değil</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Hızlı Onay Butonları (Tik, Soru, X) */}
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                            {/* Tik (Approved) */}
                            <button
                              onClick={(e) => handleQuickStatusChange(prod.id, 'approved', e)}
                              title="Bu ürün tamam (Onayla)"
                              className={`p-1.5 rounded-lg transition-all ${
                                status === 'approved'
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            {/* Soru İşareti (Review) */}
                            <button
                              onClick={(e) => handleQuickStatusChange(prod.id, 'review', e)}
                              title="İnceleniyor / Eksik Veri"
                              className={`p-1.5 rounded-lg transition-all ${
                                status === 'review'
                                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                  : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                              }`}
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>

                            {/* X (Rejected) */}
                            <button
                              onClick={(e) => handleQuickStatusChange(prod.id, 'rejected', e)}
                              title="Hatalı / Reddedildi"
                              className={`p-1.5 rounded-lg transition-all ${
                                status === 'rejected'
                                  ? 'bg-rose-500 text-white shadow-sm'
                                  : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                              }`}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {/* İşlemler (Düzenle + Sil) */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(prod.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-[#14B8A6] hover:text-white text-slate-300 font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Düzenle
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(prod.id, prod.full_name || prod.model, e)}
                              title="Ürünü Kalıcı Olarak Sil"
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/25 transition-all inline-flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. ÜRÜN VE TEKNİK ÖZELLİK DÜZENLEME MODALI (GÖRSELDEKİ TABLONUN AYNISI) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {editingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0B0F14] border border-slate-800 rounded-2xl w-full max-w-5xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white truncate max-w-lg">
                    {editingProduct?.id?.startsWith('new-')
                      ? '✨ Yeni Ürün Ekle & Katalog Tanımla'
                      : (editingProduct?.fullName || 'Ürün Düzenleme')}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingProduct?.id?.startsWith('new-')
                      ? 'Sıfırdan yeni bir ürün tanımlayın, kategorisini, fotoğraflarını ve teknik özelliklerini belirleyin.'
                      : 'Genel bilgileri, fotoğrafı ve teknik tablo özelliklerini dilediğiniz gibi güncelleyin.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Yayın Durumu Butonu */}
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = editingProduct.isPublished === false ? true : false;
                      setEditingProduct({ ...editingProduct, isPublished: next });
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      editingProduct.isPublished !== false
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    }`}
                    title={editingProduct.isPublished !== false ? 'Şu an yayında. Tıklayarak taslağa çekin.' : 'Şu an taslak. Tıklayarak yayına alın.'}
                  >
                    {editingProduct.isPublished !== false ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Yayında</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Taslak (Yayında Değil)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Canlı Mağaza Sayfasında Gör */}
                {editingProduct?.slug && (
                  <button
                    onClick={() => window.open(`/urun/${editingProduct.slug}`, '_blank')}
                    className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
                    title="Kullanıcı Görünümünü Aç"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                {/* Kapat */}
                <button
                  onClick={() => setEditingProductId(null)}
                  className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {detailLoading ? (
                <div className="py-24 text-center">
                  <div className="inline-block w-8 h-8 border-3 border-[#14B8A6] border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm text-slate-400">Ürün verileri ve teknik özellikleri yükleniyor...</p>
                </div>
              ) : !editingProduct ? (
                <div className="py-12 text-center text-slate-400">Ürün verisi bulunamadı.</div>
              ) : (
                <>
                  {/* BİLDİRİM TOAST */}
                  {toastMessage && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{toastMessage}</span>
                    </div>
                  )}

                  {/* KISIM 1: GÖRSEL VE TEMEL BİLGİLER */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        Görsel ve Ürün Kimliği
                      </h3>
                      {/* Onay Durumu Rozetleri */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, auditStatus: 'approved' })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                            editingProduct.auditStatus === 'approved'
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Onaylandı (✅)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, auditStatus: 'review' })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                            editingProduct.auditStatus === 'review'
                              ? 'bg-amber-600 text-slate-950 border-amber-400 font-extrabold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          İnceleniyor (❓)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, auditStatus: 'rejected' })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                            editingProduct.auditStatus === 'rejected'
                              ? 'bg-rose-600 text-white border-rose-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Hatalı (❌)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Fotoğraf Önizleme ve URL */}
                      <div className="md:col-span-4 flex flex-col items-center gap-3">
                        <div className="w-44 h-44 rounded-2xl bg-white p-2 border border-slate-700/80 flex items-center justify-center overflow-hidden shadow-md">
                          {editingProduct.heroImage ? (
                            <img
                              src={editingProduct.heroImage}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-slate-400" />
                          )}
                        </div>
                        <div className="w-full">
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Fotoğraf URL Linki
                          </label>
                          <input
                            type="text"
                            value={editingProduct.heroImage || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, heroImage: e.target.value })
                            }
                            placeholder="https://...jpg"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#14B8A6]"
                          />
                        </div>
                      </div>

                      {/* Temel Bilgiler Form Alanları */}
                      <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Tam Ürün Adı (Başlık)
                          </label>
                          <input
                            type="text"
                            value={editingProduct.fullName || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, fullName: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Marka
                          </label>
                          <input
                            type="text"
                            value={editingProduct.brand || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, brand: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Model Kodu / Adı
                          </label>
                          <input
                            type="text"
                            value={editingProduct.model || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, model: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Barkod (EAN-13 / GTIN)
                          </label>
                          <input
                            type="text"
                            value={editingProduct.barcode || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingProduct, barcode: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#14B8A6]"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
                            <span>Kategori</span>
                            <span className="text-[10px] text-[#14B8A6] font-semibold">{editingProduct.categoryName || 'Kategori Seçin'}</span>
                          </label>
                          <select
                            value={editingProduct.categorySlug || 'akilli-saatler'}
                            onChange={(e) => {
                              const chosenSlug = e.target.value;
                              const chosenCat = CATEGORIES.find((c) => c.slug === chosenSlug);
                              setEditingProduct({
                                ...editingProduct,
                                categorySlug: chosenSlug,
                                categoryName: chosenCat?.name || chosenSlug,
                              });
                              fetchCategoryPresets(chosenSlug);
                            }}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#14B8A6] cursor-pointer"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat.slug} value={cat.slug}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>



                        {/* HEDEF PAZARLAR / ÜLKELER (ÇOKLU SEÇİM & ARAMA DESTEKLİ) */}
                        <div className="relative sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
                            <span>Hedef Pazarlar / Ülkeler (Çoklu Seçim)</span>
                            <span className="text-[10px] text-[#14B8A6] font-semibold">
                              {
                                (editingProduct.marketRegion || 'TR')
                                  .split(',')
                                  .filter(Boolean).length
                              }{' '}
                              ülke seçili
                            </span>
                          </label>

                          {/* Seçili Ülkelerin Rozetleri & Açma Tetikleyicisi */}
                          <div
                            onClick={() => setIsMarketDropdownOpen(!isMarketDropdownOpen)}
                            className="min-h-[38px] p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus-within:border-[#14B8A6] cursor-pointer flex flex-wrap gap-1 items-center justify-between hover:border-slate-700 transition-colors"
                          >
                            <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
                              {(editingProduct.marketRegion || 'TR')
                                .split(',')
                                .map((c) => c.trim().toUpperCase())
                                .filter(Boolean)
                                .map((c) => {
                                  const found = WORLD_MARKETS.find((m) => m.code === c);
                                  return (
                                    <span
                                      key={c}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleMarketCode(c);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] font-bold hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all group"
                                      title={`${found?.name || c} (Kaldırmak için tıkla)`}
                                    >
                                      <span>{found ? `${found.flag} ${found.code}` : `🌐 ${c}`}</span>
                                      <X className="w-3 h-3 text-slate-500 group-hover:text-rose-400" />
                                    </span>
                                  );
                                })}
                            </div>
                            <span className="text-slate-500 text-xs px-1.5">▾</span>
                          </div>

                          {/* Çoklu Seçim ve Arama Açılır Menüsü */}
                          {isMarketDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#070b10] border border-slate-700/80 rounded-xl shadow-2xl p-2.5 max-h-72 overflow-y-auto space-y-2 backdrop-blur-md">
                              {/* Arama Kutusu & Hızlı Butonlar */}
                              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                                <div className="relative flex-1">
                                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    placeholder="Ülke adı veya kodu ara (Almanya, DE, US, TR)..."
                                    value={marketSearchQuery}
                                    onChange={(e) => setMarketSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                                    autoFocus
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsMarketDropdownOpen(false)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                                >
                                  Tamam
                                </button>
                              </div>

                              {/* Ülke Listesi (Filtrelenmiş & Gruplanmış) */}
                              <div className="space-y-2">
                                {(['Ana Pazarlar', 'Avrupa', 'Asya & Pasifik', 'Amerika', 'Orta Doğu & Afrika'] as const).map(
                                  (grpName) => {
                                    const filtered = WORLD_MARKETS.filter(
                                      (m) =>
                                        m.group === grpName &&
                                        (!marketSearchQuery.trim() ||
                                          m.name.toLowerCase().includes(marketSearchQuery.toLowerCase()) ||
                                          m.code.toLowerCase().includes(marketSearchQuery.toLowerCase()))
                                    );

                                    if (filtered.length === 0) return null;

                                    const currentSelected = (editingProduct.marketRegion || 'TR')
                                      .split(',')
                                      .map((c) => c.trim().toUpperCase());

                                    return (
                                      <div key={grpName} className="space-y-1">
                                        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                                          {grpName}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                          {filtered.map((m) => {
                                            const isSelected = currentSelected.includes(m.code);
                                            return (
                                              <button
                                                key={m.code}
                                                type="button"
                                                onClick={() => handleToggleMarketCode(m.code)}
                                                className={`px-2 py-1.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition-all ${
                                                  isSelected
                                                    ? 'bg-[#14B8A6]/20 border-[#14B8A6] text-white shadow-sm'
                                                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
                                                }`}
                                              >
                                                <span className="truncate flex items-center gap-1.5">
                                                  <span>{m.flag}</span>
                                                  <span className="truncate">{m.name}</span>
                                                </span>
                                                {isSelected && (
                                                  <Check className="w-3.5 h-3.5 text-[#14B8A6] shrink-0 ml-1" />
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KISIM 2: RESMİ MARKA / LANSMAN LİNKLERİ (ÜLKEYE GÖRE) */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        Resmi Marka & Lansman Linkleri
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Ülkeye göre üretici tanıtım / lansıman sayfası URL'leri
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(editingProduct.officialLinks || []).map((link, idx) => {
                        const foundMarket = WORLD_MARKETS.find((m) => m.code === link.country);
                        return (
                          <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 group">
                            {/* Ülke Seçici */}
                            <div className="relative w-full sm:w-48 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsLinkCountryDropdownOpen(isLinkCountryDropdownOpen === idx ? null : idx);
                                  setLinkCountrySearch('');
                                }}
                                className="w-full h-full min-h-[38px] px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 hover:border-[#14B8A6] transition-colors"
                              >
                                <span className="text-base">{foundMarket?.flag || '🌐'}</span>
                                <span className="truncate flex-1 text-left">{foundMarket?.name || link.country || 'Ülke Seç'}</span>
                                <span className="text-slate-500">▾</span>
                              </button>

                              {isLinkCountryDropdownOpen === idx && (
                                <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-[#070b10] border border-slate-700/80 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto">
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Ülke ara..."
                                    value={linkCountrySearch}
                                    onChange={(e) => setLinkCountrySearch(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6] mb-2"
                                  />
                                  <div className="space-y-0.5">
                                    {WORLD_MARKETS.filter(
                                      (m) =>
                                        !linkCountrySearch.trim() ||
                                        m.name.toLowerCase().includes(linkCountrySearch.toLowerCase()) ||
                                        m.code.toLowerCase().includes(linkCountrySearch.toLowerCase())
                                    ).map((m) => (
                                      <button
                                        key={m.code}
                                        type="button"
                                        onClick={() => {
                                          handleUpdateOfficialLink(idx, 'country', m.code);
                                          setIsLinkCountryDropdownOpen(null);
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all ${
                                          link.country === m.code
                                            ? 'bg-[#14B8A6]/20 text-white border border-[#14B8A6]/40'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                      >
                                        <span>{m.flag}</span>
                                        <span className="truncate">{m.name}</span>
                                        {link.country === m.code && <Check className="w-3 h-3 text-[#14B8A6] ml-auto shrink-0" />}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Etiket & URL */}
                            <div className="flex flex-col gap-1.5 flex-1">
                              <input
                                type="text"
                                placeholder="Kısa etiket (ör: Türkiye Resmi Tanıtım Sayfası)"
                                value={link.label}
                                onChange={(e) => handleUpdateOfficialLink(idx, 'label', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                              />
                              <div className="relative">
                                <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="url"
                                  placeholder="https://www.mi.com/tr/product/xiaomi-watch-s3/"
                                  value={link.url}
                                  onChange={(e) => handleUpdateOfficialLink(idx, 'url', e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-[#14B8A6] font-mono placeholder-slate-600 focus:outline-none focus:border-[#14B8A6]"
                                />
                              </div>
                            </div>

                            {/* Aç & Sil */}
                            <div className="flex sm:flex-col gap-1.5 shrink-0">
                              {link.url && (
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-[#14B8A6]/20 text-slate-400 hover:text-[#14B8A6] transition-colors border border-slate-700/60"
                                  title="Linki yeni sekmede aç"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveOfficialLink(idx)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700/60"
                                title="Bu linki kaldır"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {(editingProduct.officialLinks || []).length === 0 && (
                        <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          <Globe className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                          Henüz resmi link eklenmemiş. Aşağıdan ekleyin.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddOfficialLink}
                      className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-[#14B8A6] text-slate-400 hover:text-[#14B8A6] text-xs font-bold transition-all flex items-center justify-center gap-2 bg-slate-950/30"
                    >
                      <Plus className="w-4 h-4" />
                      Yeni Ülke / Bölge Linki Ekle
                    </button>
                  </div>

                  {/* KISIM 3: ÜRÜN VERİ KAYNAKLARI (ÇOKLU SEÇİM) */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          Ürün Veri Kaynakları & Doğrulama Ekibi
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ürün sayfasında topluca gösterilecek veri kaynakları (Birden fazla seçilebilir)
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-teal-400 border border-teal-500/30">
                        {(editingProduct.dataSources || []).length} Kaynak Seçili
                      </span>
                    </div>

                    {/* Hazır Kaynak Seçenekleri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {PRESET_DATA_SOURCES.map((src) => {
                        const isSelected = (editingProduct.dataSources || []).includes(src.label);
                        return (
                          <button
                            key={src.id}
                            type="button"
                            onClick={() => handleToggleDataSource(src.label)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'bg-slate-900/90 border-[#14B8A6] ring-1 ring-[#14B8A6]/40 shadow-sm'
                                : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? 'bg-[#14B8A6] text-slate-950 font-bold'
                                  : 'border border-slate-700 bg-slate-900'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-bold ${
                                    isSelected ? 'text-white' : 'text-slate-300'
                                  }`}
                                >
                                  {src.label}
                                </span>
                                {src.isOfficial && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                                    Resmi/Ekip
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {src.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Özel Kaynak Ekleme ve Seçili Ek Kaynaklar */}
                    <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customDataSourceInput}
                          onChange={(e) => setCustomDataSourceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomDataSource();
                            }
                          }}
                          placeholder="Farklı bir kaynak adı ekle (Örn: DxOMark Laboratuvarı, GSM Arena...)"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomDataSource}
                        disabled={!customDataSourceInput.trim()}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Özel Kaynak Ekle
                      </button>
                    </div>

                    {/* Özel Eklenen Ek Kaynaklar Listesi (Varsa) */}
                    {(editingProduct.dataSources || []).some(
                      (s) => !PRESET_DATA_SOURCES.some((p) => p.label === s)
                    ) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-400 mr-1">Özel Eklenen:</span>
                        {(editingProduct.dataSources || [])
                          .filter((s) => !PRESET_DATA_SOURCES.some((p) => p.label === s))
                          .map((customSrc, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-teal-300 border border-teal-500/30"
                            >
                              <span>{customSrc}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDataSource(customSrc)}
                                className="text-slate-400 hover:text-rose-400"
                                title="Kaldır"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* KISIM 4: TEKNİK ÖZELLİK TABLOLARI */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          Teknik Özellik Tabloları
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Ürün grupları ve teknik spesifikasyonlar (özellik adı & değeri)
                        </p>
                      </div>

                      <div className="text-xs text-slate-400 font-medium">
                        {editingSpecGroups.reduce((acc, g) => acc + g.items.length, 0)} özellik tanımlı
                      </div>
                    </div>

                    {/* HTML5 DATALIST PRESETS FOR SEARCHABLE AUTOCOMPLETE (CANLI DB + GENEL YEDEKLER) */}
                    <datalist id="preset-group-titles">
                      {Array.from(new Set([...(categoryPresets.groups || []), ...PRESET_GROUP_TITLES])).map((title) => (
                        <option key={title} value={title} />
                      ))}
                    </datalist>

                    <datalist id="preset-spec-labels">
                      {Array.from(new Set([...(categoryPresets.labels || []), ...PRESET_SPEC_LABELS])).map((lbl) => (
                        <option key={lbl} value={lbl} />
                      ))}
                    </datalist>

                    {/* GRUPLAR VE ÖZELLİK TABLOLARI */}
                    {editingSpecGroups.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                        <p className="text-xs text-slate-400">
                          Bu ürün için henüz girilmiş teknik özellik tablosu yok.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setNewGroupTitle(
                              `${editingProduct.categoryName || 'Teknik'} Donanım ve Özellikleri`
                            );
                            setShowAddGroupInput(true);
                          }}
                          className="px-4 py-2 bg-[#14B8A6] text-white font-bold text-xs rounded-xl hover:bg-[#0d9488] transition-colors inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          İlk Özellik Grubunu Oluştur
                        </button>
                      </div>
                    ) : (
                      editingSpecGroups.map((grp) => (
                        <div
                          key={grp.id}
                          className="rounded-2xl border border-slate-800 bg-[#070b10] overflow-hidden shadow-lg"
                        >
                          {/* Grup Başlık Şeridi */}
                          <div className="py-3 px-4 sm:px-5 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 flex-1 mr-4">
                              <span className="w-1.5 h-4 rounded-full bg-[#14B8A6]" />
                              <input
                                type="text"
                                list="preset-group-titles"
                                value={grp.title}
                                placeholder="Grup Başlığı..."
                                onChange={(e) =>
                                  setEditingSpecGroups(
                                    editingSpecGroups.map((g) =>
                                      g.id === grp.id ? { ...g, title: e.target.value } : g
                                    )
                                  )
                                }
                                className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-200 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-[#14B8A6] focus:outline-none w-full"
                              />
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs text-slate-400 font-medium">
                                {grp.items.length} özellik
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddItem(grp.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#14B8A6]/20 text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white border border-[#14B8A6]/30 text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Özellik Ekle
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGroup(grp.id)}
                                title="Bu Grubu Sil"
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Özellik Satırları Tablosu */}
                          <div className="divide-y divide-slate-800/60">
                            {grp.items.map((item) => {
                              // Canlı veritabanındaki kategori değerleri + standart önerileri harmanla
                              const allSuggestions = getCombinedSuggestions(
                                item.label,
                                categoryPresets.valueSuggestions || {}
                              );
                              const datalistId = `val-preset-${item.id}`;

                              // Kullanıcı değer yazarken eşleşenleri başa al
                              const valTrim = (item.value || '').trim();
                              const valNorm = normalizeLabelKey(valTrim);

                              let pillSuggestions = allSuggestions;
                              if (valNorm.length > 0) {
                                const matches = allSuggestions.filter((s) => normalizeLabelKey(s).includes(valNorm));
                                const rest = allSuggestions.filter((s) => !normalizeLabelKey(s).includes(valNorm));
                                pillSuggestions = [...matches, ...rest];
                              }

                              const displayedPills = pillSuggestions.slice(0, 18);

                              return (
                                <div
                                  key={item.id}
                                  className="py-3 px-4 sm:px-5 hover:bg-slate-900/30 transition-colors space-y-2"
                                >
                                  {/* Datalist for this specific item's value */}
                                  {allSuggestions.length > 0 && (
                                    <datalist id={datalistId}>
                                      {allSuggestions.slice(0, 40).map((sug) => (
                                        <option key={sug} value={sug} />
                                      ))}
                                    </datalist>
                                  )}

                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                    {/* Özellik Adı (Sol Sütun - Datalist Destekli - 5 Kolon) */}
                                    <div className="md:col-span-5">
                                      <input
                                        type="text"
                                        list="preset-spec-labels"
                                        placeholder="Örn: Bluetooth Sürümü, Ekran Boyutu..."
                                        value={item.label}
                                        onChange={(e) =>
                                          handleItemChange(grp.id, item.id, 'label', e.target.value)
                                        }
                                        className="w-full text-xs sm:text-sm font-semibold text-slate-300 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-[#14B8A6] focus:outline-none"
                                      />
                                    </div>

                                    {/* Özellik Değeri (Orta Sütun - Datalist ve Serbest Yazım Destekli - 6 Kolon) */}
                                    <div className="md:col-span-6">
                                      <input
                                        type="text"
                                        list={allSuggestions.length > 0 ? datalistId : undefined}
                                        placeholder="Örn: Bluetooth 5.4, 120 Hz, Var, Yok..."
                                        value={item.value}
                                        onChange={(e) =>
                                          handleItemChange(grp.id, item.id, 'value', e.target.value)
                                        }
                                        className="w-full text-xs sm:text-sm font-bold text-white bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800 focus:border-[#14B8A6] focus:outline-none"
                                      />
                                    </div>

                                    {/* Silme (Sağ Sütun - 1 Kolon) */}
                                    <div className="md:col-span-1 flex items-center justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteItem(grp.id, item.id)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                                        title="Bu Özelliği Kaldır"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Hazır Hızlı Seçim Butonları (Veritabanından & Sözlükten) */}
                                  {displayedPills.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap pl-0 md:pl-[41.66%] pt-0.5 pb-1">
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-1">
                                        <Sparkles className="w-2.5 h-2.5 text-[#14B8A6]" />
                                        Seçenekler:
                                      </span>
                                      {displayedPills.map((sug) => {
                                        const isSelected =
                                          (item.value || '').trim().toLocaleLowerCase('tr-TR') ===
                                          sug.trim().toLocaleLowerCase('tr-TR');
                                        return (
                                          <button
                                            key={sug}
                                            type="button"
                                            onClick={() =>
                                              handleItemChange(grp.id, item.id, 'value', sug)
                                            }
                                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                                              isSelected
                                                ? 'bg-[#14B8A6] text-white shadow-sm font-bold'
                                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                                            }`}
                                          >
                                            {sug}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}

                    {/* YENİ GRUP BAŞLIĞI EKLEME FORMU + KATEGORİYE ÖZEL CANLI VERİTABANI BAŞLIKLARI */}
                    {showAddGroupInput ? (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            list="preset-group-titles"
                            placeholder="Yeni Grup Başlığı yazın veya aşağıdaki kategoride kayıtlı başlıklardan seçin..."
                            value={newGroupTitle}
                            onChange={(e) => setNewGroupTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#14B8A6]"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleAddGroup}
                            className="px-4 py-2 bg-[#14B8A6] text-white text-xs font-bold rounded-xl hover:bg-[#0d9488]"
                          >
                            Grup Ekle
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddGroupInput(false)}
                            className="px-3 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:text-white"
                          >
                            İptal
                          </button>
                        </div>

                        {/* Kategoriye Göre Veritabanında Kayıtlı Başlıklar */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-[#14B8A6]" />
                              <span>
                                {editingProduct.categoryName || 'Bu Kategoride'} Kayıtlı Başlıklar:
                              </span>
                            </span>
                            {presetsLoading && (
                              <span className="text-[10px] text-[#14B8A6] animate-pulse">
                                Veritabanından taranıyor...
                              </span>
                            )}
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            {/* Önce Bu Kategoride DB'de Olan Gruplar, Yoksa Standart Gruplar */}
                            {(categoryPresets.groups.length > 0
                              ? categoryPresets.groups
                              : PRESET_GROUP_TITLES
                            ).map((title) => (
                              <button
                                key={title}
                                type="button"
                                onClick={() => {
                                  const newGrp: SpecGroupEdit = {
                                    id: `grp-new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                    title: title,
                                    sortOrder: editingSpecGroups.length,
                                    items: [],
                                  };
                                  setEditingSpecGroups([...editingSpecGroups, newGrp]);
                                  setShowAddGroupInput(false);
                                  setNewGroupTitle('');
                                }}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-[#14B8A6]/20 text-slate-300 hover:text-[#14B8A6] border border-slate-800 hover:border-[#14B8A6]/40 transition-all font-semibold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3 text-[#14B8A6]" />
                                {title}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddGroupInput(true)}
                        className="w-full py-3 rounded-xl border border-dashed border-slate-800 hover:border-[#14B8A6] text-slate-400 hover:text-[#14B8A6] text-xs font-bold transition-all flex items-center justify-center gap-2 bg-slate-900/30"
                      >
                        <Plus className="w-4 h-4" />
                        Yeni Teknik Özellik Grubu Ekle ({editingProduct.categoryName || 'Kategori'} Başlıklarından Seç veya Yaz)
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer (Kaydet Butonu) */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between sticky bottom-0 z-20">
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                  <span className="hidden sm:inline">Değişiklikler doğrudan PostgreSQL veritabanına kaydedilir.</span>
                </div>
                {/* Mevcut ürün ise Sil Butonu */}
                {editingProduct && !editingProduct.id.startsWith('new-') && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(editingProduct.id, editingProduct.fullName || editingProduct.model)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/25 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ürünü Sil</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProductId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={saveLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {saveLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingProduct?.id?.startsWith('new-')
                    ? '✨ Yeni Ürünü Kaydet & Kataloğa Ekle'
                    : 'Değişiklikleri Veritabanına Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. ÜRÜN SİLME ONAY MODALI */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ürünü Silmek İstediğinize Emin misiniz?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <strong className="text-rose-300">"{deleteConfirm.name}"</strong> ürünü ve bu ürüne bağlı tüm teknik özellikler, fiyatlar ve fotoğraflar veritabanından kalıcı olarak silinecektir. Bu işlem geri alınamaz!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleExecuteDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Evet, Kalıcı Olarak Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
