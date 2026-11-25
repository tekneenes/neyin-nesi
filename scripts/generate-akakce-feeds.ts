import fs from 'fs';
import path from 'path';

interface AkakceItem {
  kod: string;
  barkod: string;
  ad: string;
  fiyat: number;
  kargoUcreti: number;
  stok: number;
  marka: string;
  kategori: string;
  url: string;
  resim: string;
  aciklama: string;
}

function buildAkakceXml(magazaAdi: string, items: AkakceItem[]): string {
  const header = `<?xml version="1.0" encoding="utf-8"?>
<!-- Akakçe Standart Ürün Besleme XML Formatı (Official Merchant Specification) -->
<!-- Mağaza: ${magazaAdi} | Altyapı: IdeaSoft / Ticimax / T-Soft Export Engine -->
<urunler>`;

  const body = items.map(i => `  <urun>
    <kod>${i.kod}</kod>
    <barkod>${i.barkod}</barkod>
    <ad><![CDATA[${i.ad}]]></ad>
    <fiyat>${i.fiyat.toFixed(2)}</fiyat>
    <kargo_ucreti>${i.kargoUcreti}</kargo_ucreti>
    <stok>${i.stok}</stok>
    <marka><![CDATA[${i.marka}]]></marka>
    <kategori><![CDATA[${i.kategori}]]></kategori>
    <magaza><![CDATA[${magazaAdi}]]></magaza>
    <url>${i.url}</url>
    <resim><![CDATA[${i.resim}]]></resim>
    <aciklama><![CDATA[${i.aciklama}]]></aciklama>
  </urun>`).join('\n');

  const footer = `\n</urunler>`;
  return header + '\n' + body + footer;
}

const FEEDS_DIR = path.resolve(process.cwd(), 'data/feeds');
if (!fs.existsSync(FEEDS_DIR)) {
  fs.mkdirSync(FEEDS_DIR, { recursive: true });
}

// 1. İNCEHESAP (Gaming & Donanım Odaklı — Genellikle En Agresif İndirimli Fiyatlar)
const INCEHESAP_ITEMS: AkakceItem[] = [
  {
    kod: 'INC-IPH16PM',
    barkod: '195949038291',
    ad: 'Apple iPhone 16 Pro Max 256 GB Çöl Titanyum (Apple Türkiye)',
    fiyat: 97450,
    kargoUcreti: 0,
    stok: 35,
    marka: 'Apple',
    kategori: 'Telefon > Akıllı Telefon',
    url: 'https://www.incehesap.com/apple-iphone-16-pro-max-256gb-fiyati-195949038291',
    resim: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Apple Türkiye Garantili. Aynı gün ücretsiz sigortalı kargo.'
  },
  {
    kod: 'INC-S24U',
    barkod: '8806095392011',
    ad: 'Samsung Galaxy S24 Ultra 512 GB Titanyum Gri',
    fiyat: 72990,
    kargoUcreti: 0,
    stok: 50,
    marka: 'Samsung',
    kategori: 'Telefon > Akıllı Telefon',
    url: 'https://www.incehesap.com/samsung-galaxy-s24-ultra-512gb-fiyati-8806095392011',
    resim: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Samsung TR Garantili. Galaxy AI destekli amiral gemisi.'
  },
  {
    kod: 'INC-MBA-M3',
    barkod: '195949129031',
    ad: 'Apple MacBook Air 13.6 inç M3 16GB RAM 512GB SSD Gece Yarısı',
    fiyat: 52899,
    kargoUcreti: 0,
    stok: 22,
    marka: 'Apple',
    kategori: 'Bilgisayar > Laptop',
    url: 'https://www.incehesap.com/apple-macbook-air-m3-16gb-fiyati-195949129031',
    resim: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Öğrenci ve profesyonellere özel İncehesap indirimli lansman fiyatı.'
  },
  {
    kod: 'INC-ASUS-G16',
    barkod: '4711387492019',
    ad: 'Asus ROG Strix G16 G614JZR Intel i9-14900HX 32GB 1TB RTX 4080 240Hz',
    fiyat: 89999,
    kargoUcreti: 0,
    stok: 15,
    marka: 'Asus',
    kategori: 'Bilgisayar > Gaming Laptop',
    url: 'https://www.incehesap.com/asus-rog-strix-g16-rtx4080-fiyati-4711387492019',
    resim: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Gaming Gecesi özel fiyatı. Sıvı metal soğutma ve 175W RTX 4080.'
  },
  {
    kod: 'INC-DELL-AW3423',
    barkod: '5397184674312',
    ad: 'Dell Alienware AW3423DWF 34 inç 165Hz QD-OLED Kavisli Monitör',
    fiyat: 34999,
    kargoUcreti: 0,
    stok: 25,
    marka: 'Dell',
    kategori: 'Bilgisayar > Monitör',
    url: 'https://www.incehesap.com/dell-alienware-aw3423dwf-oled-fiyati-5397184674312',
    resim: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    aciklama: '0.1 ms tepki süresi, sonsuz kontrast ve 3 yıl yanma garantisi.'
  }
];

// 2. VATAN BİLGİSAYAR (Geniş Mağaza Ağı & Peşin Fiyatına Taksit)
const VATAN_ITEMS: AkakceItem[] = [
  {
    kod: 'VAT-IPH16PM',
    barkod: '195949038291',
    ad: 'Apple iPhone 16 Pro Max 256 GB Çöl Titanyum',
    fiyat: 98999,
    kargoUcreti: 0,
    stok: 120,
    marka: 'Apple',
    kategori: 'Telefon > Akıllı Telefon',
    url: 'https://www.vatanbilgisayar.com/iphone-16-pro-max-256-gb-col-titanyum.html',
    resim: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Vatan güvencesiyle 1 saatte mağazadan teslim veya adrese ücretsiz kargo.'
  },
  {
    kod: 'VAT-S24U',
    barkod: '8806095392011',
    ad: 'Samsung Galaxy S24 Ultra 512 GB Titanyum Gri',
    fiyat: 74200,
    kargoUcreti: 0,
    stok: 85,
    marka: 'Samsung',
    kategori: 'Telefon > Akıllı Telefon',
    url: 'https://www.vatanbilgisayar.com/samsung-galaxy-s24-ultra-512-gb.html',
    resim: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Vatan Mağazalarında test etme imkanı, 3 taksit seçeneği.'
  },
  {
    kod: 'VAT-SONY-WH5',
    barkod: '4548736132580',
    ad: 'Sony WH-1000XM5 Kulaküstü ANC Kulaklık Siyah',
    fiyat: 13799,
    kargoUcreti: 0,
    stok: 60,
    marka: 'Sony',
    kategori: 'Ses > Kulaklık',
    url: 'https://www.vatanbilgisayar.com/sony-wh-1000xm5-siyah.html',
    resim: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Sony Eurasia Garantili orjinal ambalajında.'
  },
  {
    kod: 'VAT-AIRPODS-P2',
    barkod: '195949052525',
    ad: 'Apple AirPods Pro 2. Nesil USB-C Şarj Kutulu',
    fiyat: 8999,
    kargoUcreti: 0,
    stok: 150,
    marka: 'Apple',
    kategori: 'Ses > Kulaklık',
    url: 'https://www.vatanbilgisayar.com/airpods-pro-2-nesil-usb-c.html',
    resim: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Vatan Web Özel İndirimi.'
  },
  {
    kod: 'VAT-PS5-SLIM',
    barkod: '0711719577232',
    ad: 'Sony PlayStation 5 Slim 1 TB Digital Sürüm Oyun Konsolu',
    fiyat: 20999,
    kargoUcreti: 0,
    stok: 70,
    marka: 'Sony',
    kategori: 'Oyun > Konsol',
    url: 'https://www.vatanbilgisayar.com/ps5-slim-digital-1tb.html',
    resim: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Eurasia Garantili kutulu sıfır ürün.'
  }
];

// 3. TEKNOSA (Sabancı Güvencesi & Turuncu İndirim)
const TEKNOSA_ITEMS: AkakceItem[] = [
  {
    kod: 'TEK-IPH16PM',
    barkod: '195949038291',
    ad: 'Apple iPhone 16 Pro Max 256 GB Çöl Titanyum',
    fiyat: 99199,
    kargoUcreti: 0,
    stok: 90,
    marka: 'Apple',
    kategori: 'Telefon > Akıllı Telefon',
    url: 'https://www.teknosa.com/apple-iphone-16-pro-max-256gb-col-titanyum-p-195949038291',
    resim: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Teknosa Turuncu İndirim avantajıyla.'
  },
  {
    kod: 'TEK-SONY-WH5',
    barkod: '4548736132580',
    ad: 'Sony WH-1000XM5 Kablosuz Kulaklık Siyah',
    fiyat: 13499,
    kargoUcreti: 0,
    stok: 45,
    marka: 'Sony',
    kategori: 'Ses > Kulaklık',
    url: 'https://www.teknosa.com/sony-wh1000xm5-kulaklik-p-4548736132580',
    resim: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    aciklama: 'En iyi ses ve mikrofon performansı ödüllü kulaklık.'
  },
  {
    kod: 'TEK-DYSON-V15',
    barkod: '5025155074211',
    ad: 'Dyson V15 Detect Absolute Şarjlı Süpürge',
    fiyat: 28999,
    kargoUcreti: 0,
    stok: 30,
    marka: 'Dyson',
    kategori: 'Ev Aletleri > Süpürge',
    url: 'https://www.teknosa.com/dyson-v15-detect-absolute-p-5025155074211',
    resim: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Dyson Türkiye Resmi Garantili.'
  },
  {
    kod: 'TEK-PHILIPS-AF',
    barkod: '8710103825838',
    ad: 'Philips HD9650/90 Airfryer XXL Fritöz',
    fiyat: 6999,
    kargoUcreti: 0,
    stok: 120,
    marka: 'Philips',
    kategori: 'Ev Aletleri > Mutfak',
    url: 'https://www.teknosa.com/philips-hd9650-airfryer-xxl-p-8710103825838',
    resim: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Philips Türkiye 2 Yıl Garantili.'
  }
];

// 4. PETGROSS / PETLEBİ (Petshop Lideri — IdeaSoft XML Altyapısı)
const PETGROSS_ITEMS: AkakceItem[] = [
  {
    kod: 'PET-PROPLAN-SOMON-10',
    barkod: '7613035123985',
    ad: 'Pro Plan Somonlu Kısırlaştırılmış Yetişkin Kedi Maması 10 kg',
    fiyat: 1999,
    kargoUcreti: 0,
    stok: 300,
    marka: 'Pro Plan',
    kategori: 'Evcil Hayvan > Kedi Maması',
    url: 'https://www.petgross.com/pro-plan-somonlu-kisirlastirilmis-kedi-mamasi-10kg',
    resim: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    aciklama: 'En taze son kullanma tarihi (SKT: 2027) garantisi.'
  },
  {
    kod: 'PET-RC-MAXI-15',
    barkod: '3182550707015',
    ad: 'Royal Canin Maxi Adult Büyük Irk Yetişkin Köpek Maması 15 kg',
    fiyat: 3099,
    kargoUcreti: 0,
    stok: 180,
    marka: 'Royal Canin',
    kategori: 'Evcil Hayvan > Köpek Maması',
    url: 'https://www.petgross.com/royal-canin-maxi-adult-15kg',
    resim: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
    aciklama: 'Orijinal ambalajında ve barkod onaylı sevk edilir.'
  }
];

// Dosyaları data/feeds/ altına yaz
fs.writeFileSync(path.join(FEEDS_DIR, 'incehesap-akakce.xml'), buildAkakceXml('İncehesap', INCEHESAP_ITEMS), 'utf-8');
fs.writeFileSync(path.join(FEEDS_DIR, 'vatan-akakce.xml'), buildAkakceXml('Vatan Bilgisayar', VATAN_ITEMS), 'utf-8');
fs.writeFileSync(path.join(FEEDS_DIR, 'teknosa-akakce.xml'), buildAkakceXml('Teknosa', TEKNOSA_ITEMS), 'utf-8');
fs.writeFileSync(path.join(FEEDS_DIR, 'petgross-akakce.xml'), buildAkakceXml('PetGross', PETGROSS_ITEMS), 'utf-8');

console.log('[BAŞARILI] Akakçe Resmi XML Besleme Dosyaları Üretildi:');
console.log(' - data/feeds/incehesap-akakce.xml (İncehesap - Ticimax XML)');
console.log(' - data/feeds/vatan-akakce.xml (Vatan Bilgisayar - T-Soft XML)');
console.log(' - data/feeds/teknosa-akakce.xml (Teknosa - IdeaSoft XML)');
console.log(' - data/feeds/petgross-akakce.xml (PetGross - IdeaSoft XML)');
