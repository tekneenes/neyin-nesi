export interface MerchantStoreConfig {
  id: string;
  name: string;
  platform: 'IdeaSoft' | 'Ticimax' | 'T-Soft' | 'ikas' | 'WooCommerce' | 'Hepsiburada_API';
  feedFormat: 'akakce_xml' | 'hepsiburada_xml' | 'google_merchant';
  feedPathOrUrl: string;
  rating: number;
  syncIntervalMinutes: number;
  categorySpecialty: string;
  isActive: boolean;
  notes: string;
}

export const REGISTERED_MERCHANT_STORES: MerchantStoreConfig[] = [
  {
    id: 'store-incehesap',
    name: 'İncehesap',
    platform: 'Ticimax',
    feedFormat: 'akakce_xml',
    feedPathOrUrl: 'data/feeds/incehesap-akakce.xml',
    rating: 4.9,
    syncIntervalMinutes: 30,
    categorySpecialty: 'Bilgisayar & Donanım',
    isActive: true,
    notes: 'Gaming hazır sistemler, ekran kartları ve monitörlerde lider fiyatlar.'
  },
  {
    id: 'store-vatan',
    name: 'Vatan Bilgisayar',
    platform: 'T-Soft',
    feedFormat: 'akakce_xml',
    feedPathOrUrl: 'data/feeds/vatan-akakce.xml',
    rating: 4.8,
    syncIntervalMinutes: 60,
    categorySpecialty: 'Tüketici Elektroniği & Telefon',
    isActive: true,
    notes: 'Geniş mağaza ağı ve resmi distribütör garantili ürünler.'
  },
  {
    id: 'store-teknosa',
    name: 'Teknosa',
    platform: 'IdeaSoft',
    feedFormat: 'akakce_xml',
    feedPathOrUrl: 'data/feeds/teknosa-akakce.xml',
    rating: 4.7,
    syncIntervalMinutes: 60,
    categorySpecialty: 'Genel Teknoloji & Beyaz Eşya',
    isActive: true,
    notes: 'Sabancı güvencesi, hızlı kargo ve taksit avantajları.'
  },
  {
    id: 'store-petgross',
    name: 'PetGross / Petlebi',
    platform: 'IdeaSoft',
    feedFormat: 'akakce_xml',
    feedPathOrUrl: 'data/feeds/petgross-akakce.xml',
    rating: 4.9,
    syncIntervalMinutes: 120,
    categorySpecialty: 'Evcil Hayvan & Mama',
    isActive: true,
    notes: 'Kedi ve köpek mamalarında orijinal seri numaralı paket garantisi.'
  },
  {
    id: 'store-hepsiburada',
    name: 'Hepsiburada Resmi Mağaza',
    platform: 'Hepsiburada_API',
    feedFormat: 'hepsiburada_xml',
    feedPathOrUrl: 'data/hepsiburada-merchant-feed.xml',
    rating: 4.8,
    syncIntervalMinutes: 15,
    categorySpecialty: 'Pazaryeri & Süpermarket',
    isActive: true,
    notes: 'Hepsiburada doğrudan satıcı ve Premium teslimat teklifleri.'
  }
];
