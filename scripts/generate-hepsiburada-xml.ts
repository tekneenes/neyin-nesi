import fs from 'fs';
import path from 'path';

interface HbProductSeed {
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  merchant: string;
  image: string;
  description: string;
}

const HEPSIBURADA_ITEMS: HbProductSeed[] = [
  // --- TELEFON & ELEKTRONİK ---
  {
    sku: 'HB-IPH16PM-256',
    barcode: '195949038291',
    name: 'Apple iPhone 16 Pro Max 256 GB Çöl Titanyum (Hepsiburada Garantili)',
    category: 'Telefonlar',
    brand: 'Apple',
    price: 99499,
    stock: 45,
    merchant: 'Hepsiburada Resmi',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    description: 'A18 Pro çip, Titanyum tasarım, 48 MP Kamera Kontrolü ve 120Hz ProMotion Super Retina XDR ekran.'
  },
  {
    sku: 'HB-S24U-512',
    barcode: '8806095392011',
    name: 'Samsung Galaxy S24 Ultra 512 GB Titanyum Gri (Samsung Türkiye Garantili)',
    category: 'Telefonlar',
    brand: 'Samsung',
    price: 74999,
    stock: 60,
    merchant: 'Samsung Yetkili Satıcı',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    description: 'Galaxy AI entegre, Snapdragon 8 Gen 3 for Galaxy, Dahili S-Pen ve 200 MP Yapay Zeka Kamerası.'
  },
  {
    sku: 'HB-XIAOMI14U-512',
    barcode: '6941812762981',
    name: 'Xiaomi 14 Ultra 512 GB Siyah Leica Dörtlü Kamera (Xiaomi TR)',
    category: 'Telefonlar',
    brand: 'Xiaomi',
    price: 68999,
    stock: 25,
    merchant: 'Mi Store Online',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    description: 'Leica 1 inç sensörlü profesyonel kamera sistemi, WQHD+ 120Hz AMOLED ve 90W HyperCharge.'
  },
  {
    sku: 'HB-MBA-M3-16',
    barcode: '195949129031',
    name: 'Apple MacBook Air 13.6 inç M3 16GB RAM 512GB SSD Gece Yarısı',
    category: 'Dizüstü Bilgisayarlar',
    brand: 'Apple',
    price: 54999,
    stock: 30,
    merchant: 'Hepsiburada Resmi',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    description: 'Apple M3 8 çekirdekli CPU, 10 çekirdekli GPU, 16 GB Birleşik Bellek ve 18 saat pil ömrü.'
  },
  {
    sku: 'HB-ASUS-G16-4080',
    barcode: '4711387492019',
    name: 'Asus ROG Strix G16 G614JZR Intel i9-14900HX 32GB 1TB RTX 4080 240Hz',
    category: 'Dizüstü Bilgisayarlar',
    brand: 'Asus',
    price: 92499,
    stock: 12,
    merchant: 'Teknoloji Dünyası HB',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    description: 'Intel 14. Nesil i9, 175W TGP NVIDIA RTX 4080, ROG Intelligent Cooling ve Tri-Fan teknolojisi.'
  },
  {
    sku: 'HB-SONY-WH1000XM5',
    barcode: '4548736132580',
    name: 'Sony WH-1000XM5 Kablosuz Aktif Gürültü Engelleyici Kulaklık Siyah',
    category: 'Kulaklıklar',
    brand: 'Sony',
    price: 13999,
    stock: 80,
    merchant: 'Sony Center HB',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    description: 'Endüstri lideri iki işlemcili gürültü engelleme, 30 saat pil süresi ve LDAC Hi-Res ses.'
  },
  {
    sku: 'HB-AIRPODS-PRO-2',
    barcode: '195949052525',
    name: 'Apple AirPods Pro 2. Nesil (MagSafe Şarj Kutusu USB-C)',
    category: 'Kulaklıklar',
    brand: 'Apple',
    price: 9299,
    stock: 150,
    merchant: 'Hepsiburada Resmi',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    description: 'H2 çip, 2 kata kadar daha etkili Aktif Gürültü Engelleme ve Uyarlanabilir Ses teknolojisi.'
  },
  {
    sku: 'HB-PS5-SLIM-1TB',
    barcode: '0711719577232',
    name: 'Sony PlayStation 5 Slim 1 TB Digital Edition Oyun Konsolu (Eurasia Garantili)',
    category: 'Oyun / Hobi',
    brand: 'Sony',
    price: 21499,
    stock: 55,
    merchant: 'Overgame HB',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    description: 'Ultra yüksek hızlı 1TB SSD, Ray Tracing, 4K 120 FPS desteği ve DualSense dokunsal geri bildirim.'
  },

  // --- DİĞER / EVCİL HAYVAN, MARKET, KAMP & DİJİTAL KODLAR (EPEY KATEGORİLERİ) ---
  {
    sku: 'HB-PROPLAN-SOMON-10',
    barcode: '7613035123985',
    name: 'Pro Plan Somonlu Kısırlaştırılmış Yetişkin Kedi Maması 10 kg',
    category: 'Evcil Hayvan',
    brand: 'Pro Plan',
    price: 2199,
    stock: 200,
    merchant: 'Pet Gross Hepsiburada',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    description: 'Kısırlaştırılmış kedilerin idrar yolu sağlığını koruyan OPTIRENAL formüllü gerçek somon eti.'
  },
  {
    sku: 'HB-RC-MAXI-15',
    barcode: '3182550707015',
    name: 'Royal Canin Maxi Adult Büyük Irk Yetişkin Köpek Maması 15 kg',
    category: 'Evcil Hayvan',
    brand: 'Royal Canin',
    price: 3249,
    stock: 95,
    merchant: 'Petlebi Hepsiburada',
    image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
    description: '26-44 kg arası büyük ırk yetişkin köpeklerin kemik ve eklem sağlığını destekleyen formül.'
  },
  {
    sku: 'HB-DYSON-V15-ABS',
    barcode: '5025155074211',
    name: 'Dyson V15 Detect Absolute Şarjlı Dikey Süpürge',
    category: 'Ev Elektroniği',
    brand: 'Dyson',
    price: 29999,
    stock: 40,
    merchant: 'Dyson Türkiye Resmi',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    description: 'Laser Slim Fluffy başlık, piezo sensörü ile mikroskobik toz sayımı ve 240 AW emiş gücü.'
  },
  {
    sku: 'HB-PHILIPS-AIRFRYER-XXL',
    barcode: '8710103825838',
    name: 'Philips HD9650/90 Avance Collection Airfryer XXL Sıcak Hava Fritözü',
    category: 'Ev Elektroniği',
    brand: 'Philips',
    price: 7499,
    stock: 110,
    merchant: 'Philips Ev Aletleri HB',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    description: 'Twin TurboStar teknolojisi ile %90 daha az yağ ile çıtır lezzetler, 1.4 kg aile kapasitesi.'
  },
  {
    sku: 'HB-KOMILI-SIZMA-5L',
    barcode: '8690518001294',
    name: 'Komili Ege Sızma Zeytinyağı 5 L Teneke',
    category: 'Market',
    brand: 'Komili',
    price: 1849,
    stock: 350,
    merchant: 'Hepsiburada Market',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    description: 'Ayvalık ve Ege yöresinin özenle toplanan zeytinlerinden soğuk sıkım natürel sızma zeytinyağı.'
  },
  {
    sku: 'HB-CAYKUR-RIZE-1KG',
    barcode: '8690547010014',
    name: 'Çaykur Rize Turist Çayı 1000 gr (Dökme Çay)',
    category: 'Market',
    brand: 'Çaykur',
    price: 195,
    stock: 500,
    merchant: 'Hepsiburada Market',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    description: 'Doğu Karadeniz yaylalarının taze sürgün yapraklarından üretilen geleneksel Türk demi.'
  },
  {
    sku: 'HB-STANLEY-CLASSIC-14L',
    barcode: '6939236350326',
    name: 'Stanley Klasik Vakumlu Paslanmaz Çelik Termos 1.4 L Hammertone Yeşil',
    category: 'Kamp & Doğa',
    brand: 'Stanley',
    price: 2499,
    stock: 130,
    merchant: 'Kutupayısı Kamp HB',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    description: 'Çift duvarlı vakum yalıtımı ile 40 saat sıcak, 35 saat soğuk ve 6 gün buzlu tutma performansı.'
  },
  {
    sku: 'HB-QUECHUA-2SEC-3P',
    barcode: '3583787123984',
    name: 'Quechua 2 Seconds Kolay Kurulum Kamp Çadırı 3 Kişilik',
    category: 'Kamp & Doğa',
    brand: 'Quechua',
    price: 4299,
    stock: 45,
    merchant: 'Decathlon Online HB',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    description: '2 saniyede kendiliğinden açılan patentli tasarım, 50 km/saat rüzgar dayanımı ve su geçirmez.'
  },
  {
    sku: 'HB-APPLE-GIFT-500',
    barcode: '0190199182394',
    name: 'Apple Hediye Kartı (App Store & iTunes) 500 TL Dijital Kod',
    category: 'Hediye Kartı & Kodlar',
    brand: 'Apple',
    price: 500,
    stock: 9999,
    merchant: 'Hepsiburada Dijital',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    description: 'App Store, Apple Music, iCloud+ ve Apple Arcade harcamalarında anında geçerli dijital bakiye.'
  },
  {
    sku: 'HB-STEAM-WALLET-200',
    barcode: '0812345678901',
    name: 'Steam Cüzdan Kodu 200 TL Dijital E-Pin Kodu',
    category: 'Hediye Kartı & Kodlar',
    brand: 'Valve / Steam',
    price: 200,
    stock: 9999,
    merchant: 'Hepsiburada Dijital',
    image: 'https://images.unsplash.com/photo-1612287233261-b472e3995872?auto=format&fit=crop&w=800&q=80',
    description: 'Steam hesabınıza bakiye ekleyerek binlerce PC oyununu ve eklentiyi anında satın alın.'
  },
  // --- TABLETLER & GİYİLEBİLİR TEKNOLOJİ ---
  {
    sku: 'HB-IPAD-AIR-M2',
    barcode: '195949112233',
    name: 'Apple iPad Air 11 inç M2 Çip 128GB Wi-Fi Uzay Grisi',
    category: 'Tabletler',
    brand: 'Apple',
    price: 26999,
    stock: 75,
    merchant: 'Hepsiburada Resmi',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    description: 'Apple M2 çip, Liquid Retina ekran, Apple Pencil Pro ve Magic Keyboard desteği.'
  },
  {
    sku: 'HB-TAB-S9-ULTRA',
    barcode: '8806095001122',
    name: 'Samsung Galaxy Tab S9 Ultra 512GB 14.6 inç Dynamic AMOLED 2X',
    category: 'Tabletler',
    brand: 'Samsung',
    price: 38999,
    stock: 35,
    merchant: 'Samsung Türkiye',
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
    description: 'Devasa 14.6 inç AMOLED ekran, IP68 su ve toz dayanımı, Snapdragon 8 Gen 2 ve kutudan çıkan S-Pen.'
  },
  {
    sku: 'HB-WATCH-S10-46',
    barcode: '195949223344',
    name: 'Apple Watch Series 10 GPS 46mm Alüminyum Kasa ve Spor Kordon',
    category: 'Akıllı Saatler',
    brand: 'Apple',
    price: 18999,
    stock: 120,
    merchant: 'Hepsiburada Resmi',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    description: 'Geniş açılı OLED ekran, daha ince kasa, uyku apnesi bildirimleri ve 50m suya dayanıklılık.'
  },
  {
    sku: 'HB-GALAXY-WATCH-ULTRA',
    barcode: '8806095443322',
    name: 'Samsung Galaxy Watch Ultra 47mm Titanyum Gri LTE/Bluetooth',
    category: 'Akıllı Saatler',
    brand: 'Samsung',
    price: 39999,
    stock: 40,
    merchant: 'Samsung Türkiye HB',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Sınıf 4 havacılık titanyumu, 100 saat güç tasarruf modu, 10 ATM su basıncı dayanımı ve ikili GPS.'
  },

  // --- MONİTÖRLER & ÇEVRE BİRİMLERİ ---
  {
    sku: 'HB-DELL-AW3423DWF',
    barcode: '5397184674312',
    name: 'Dell Alienware AW3423DWF 34 inç 165Hz 0.1ms QD-OLED Kavisli Oyuncu Monitörü',
    category: 'Monitörler',
    brand: 'Dell',
    price: 36999,
    stock: 20,
    merchant: 'Gaming Garaj HB',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    description: 'Sonsuz kontrast oranı, VESA DisplayHDR True Black 400 ve Quantum Dot OLED canlı renkler.'
  },
  {
    sku: 'HB-LOGI-MX-MASTER-3S',
    barcode: '5099206103726',
    name: 'Logitech MX Master 3S Kablosuz Ergonomik Performans Faresi Siyah',
    category: 'Bilgisayar Bileşenleri',
    brand: 'Logitech',
    price: 3899,
    stock: 250,
    merchant: 'Logitech Türkiye HB',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    description: '8.000 DPI Quiet Click sessiz tuşlar, MagSpeed elektromanyetik kaydırma ve Flow çoklu cihaz desteği.'
  },

  // --- KAHVE MAKİNELERİ & EV YAŞAM ---
  {
    sku: 'HB-PHILIPS-EP5447',
    barcode: '8710103938927',
    name: 'Philips 5400 Serisi EP5447/90 LatteGo Tam Otomatik Espresso Kahve Makinesi',
    category: 'Ev Elektroniği',
    brand: 'Philips',
    price: 24999,
    stock: 65,
    merchant: 'Philips Ev HB',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
    description: '12 farklı sıcak & soğuk kahve çeşidi, borusuz LatteGo süt sistemi (15 saniyede temizlik).'
  },
  {
    sku: 'HB-ROBOROCK-S8-MAXV',
    barcode: '6970995788910',
    name: 'Roborock S8 MaxV Ultra Robot Süpürge ve Çok Fonksiyonlu Temizlik İstasyonu',
    category: 'Ev Elektroniği',
    brand: 'Roborock',
    price: 54999,
    stock: 30,
    merchant: 'Roborock TR Resmi',
    image: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80',
    description: '10.000 Pa olağanüstü emiş gücü, FlexiArm köşe fırçası, 60°C sıcak suyla paspas yıkama istasyonu.'
  }
];

function generateHepsiburadaXml(): string {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Hepsiburada Satıcı Entegrasyon XML Akışı (Merchant Feed Format) -->
<!-- Standard: Hepsiburada Enterprise Marketplace Product XML API v2 -->
<Products>`;

  const xmlItems = HEPSIBURADA_ITEMS.map(item => `  <Product>
    <MerchantSku>${item.sku}</MerchantSku>
    <Barcode>${item.barcode}</Barcode>
    <ProductName><![CDATA[${item.name}]]></ProductName>
    <CategoryName><![CDATA[${item.category}]]></CategoryName>
    <Brand><![CDATA[${item.brand}]]></Brand>
    <Price>${item.price.toFixed(2)}</Price>
    <ListPrice>${(item.price * 1.15).toFixed(2)}</ListPrice>
    <Stock>${item.stock}</Stock>
    <MerchantName><![CDATA[${item.merchant}]]></MerchantName>
    <ProductUrl>https://www.hepsiburada.com/urun-${item.sku.toLowerCase()}</ProductUrl>
    <Image><![CDATA[${item.image}]]></Image>
    <Description><![CDATA[${item.description}]]></Description>
  </Product>`).join('\n');

  const xmlFooter = `\n</Products>`;
  return xmlHeader + '\n' + xmlItems + xmlFooter;
}

const outputPath = path.resolve(process.cwd(), 'data/hepsiburada-merchant-feed.xml');
fs.writeFileSync(outputPath, generateHepsiburadaXml(), 'utf-8');
console.log(`[BAŞARILI] Hepsiburada Satıcı XML dosyası oluşturuldu: ${outputPath}`);
console.log(`[İÇERİK] Toplam ${HEPSIBURADA_ITEMS.length} adet Hepsiburada ürünü yazıldı.`);
