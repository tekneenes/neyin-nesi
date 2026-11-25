export interface MegaMenuSubCategory {
  name: string;
  slug: string;
  iconName: string;
  badge?: string;
  isPopular?: boolean;
}

export interface MegaMenuSection {
  title: string;
  slug: string;
  items: MegaMenuSubCategory[];
}

export interface MegaMenuTab {
  id: string;
  label: string;
  slug: string;
  icon: string;
  highlight?: boolean;
  sections?: MegaMenuSection[];
}

export const MEGA_MENU_TABS: MegaMenuTab[] = [
  {
    id: 'telefon',
    label: 'TELEFON',
    slug: 'telefonlar',
    icon: 'Smartphone',
    sections: [
      {
        title: 'Telefon & Aksesuar',
        slug: 'telefon-aksesuar',
        items: [
          { name: 'Cep Telefonu', slug: 'telefonlar', iconName: 'Smartphone', isPopular: true },
          { name: 'Akıllı Saat', slug: 'akilli-saatler', iconName: 'Watch', isPopular: true },
          { name: 'Bluetooth Kulaklık', slug: 'kulakliklar', iconName: 'Headphones', isPopular: true },
          { name: 'Powerbank & Şarj', slug: 'aksesuarlar', iconName: 'BatteryCharging' },
          { name: 'Ekran Koruyucu & Kılıf', slug: 'kiliflar', iconName: 'Shield' },
        ],
      },
    ],
  },
  {
    id: 'bilgisayar-tablet',
    label: 'BİLGİSAYAR-TABLET',
    slug: 'dizustu-bilgisayarlar',
    icon: 'Laptop',
    sections: [
      {
        title: 'Bilgisayar & Donanım',
        slug: 'bilgisayar',
        items: [
          { name: 'Dizüstü Bilgisayar (Laptop)', slug: 'dizustu-bilgisayarlar', iconName: 'Laptop', isPopular: true },
          { name: 'Tablet', slug: 'tabletler', iconName: 'Tablet', isPopular: true },
          { name: 'Monitör', slug: 'monitorler', iconName: 'Monitor' },
          { name: 'Ekran Kartı (GPU)', slug: 'ekran-kartlari', iconName: 'Cpu' },
          { name: 'İşlemci (CPU)', slug: 'islemciler', iconName: 'Cpu' },
          { name: 'SSD & Depolama', slug: 'ssd-depolama', iconName: 'HardDrive' },
        ],
      },
    ],
  },
  {
    id: 'tv-ses',
    label: 'TV-GÖRÜNTÜ-SES',
    slug: 'televizyonlar',
    icon: 'Tv',
    sections: [
      {
        title: 'Görüntü ve Ses Sistemleri',
        slug: 'goruntu-ses',
        items: [
          { name: 'Televizyon (TV)', slug: 'televizyonlar', iconName: 'Tv', isPopular: true },
          { name: 'Soundbar & Hoparlör', slug: 'hoparlorler', iconName: 'Volume2' },
          { name: 'Projeksiyon', slug: 'projeksiyon', iconName: 'Cast' },
          { name: 'Kulaklık', slug: 'kulakliklar', iconName: 'Headphones' },
        ],
      },
    ],
  },
  {
    id: 'ev-yasam',
    label: 'EV-YAŞAM-BAHÇE',
    slug: 'ev-elektronigi',
    icon: 'Home',
    sections: [
      {
        title: 'Ev Aletleri & Yaşam',
        slug: 'ev-aletleri',
        items: [
          { name: 'Robot Süpürge', slug: 'ev-elektronigi', iconName: 'Bot', isPopular: true },
          { name: 'Kahve Makinesi', slug: 'kahve-makineleri', iconName: 'Coffee' },
          { name: 'Airfryer & Pişirici', slug: 'airfryer', iconName: 'Flame' },
          { name: 'Klima & Vantilatör', slug: 'klima', iconName: 'Wind' },
        ],
      },
    ],
  },
  {
    id: 'anne-bebek',
    label: 'ANNE-BEBEK',
    slug: 'anne-bebek',
    icon: 'Baby',
    sections: [
      {
        title: 'Anne ve Bebek',
        slug: 'anne-bebek-urunleri',
        items: [
          { name: 'Bebek Arabası', slug: 'bebek-arabasi', iconName: 'Car' },
          { name: 'Oto Koltuğu', slug: 'oto-koltugu', iconName: 'Shield' },
          { name: 'Bebek Bezi & Bakım', slug: 'bebek-bezi', iconName: 'Package' },
        ],
      },
    ],
  },
  {
    id: 'tasitlar',
    label: 'TAŞITLAR',
    slug: 'tasitlar',
    icon: 'CarFront',
    sections: [
      {
        title: 'Ulaşım & Taşıtlar',
        slug: 'ulasim',
        items: [
          { name: 'Elektrikli Scooter', slug: 'elektrikli-scooter', iconName: 'Zap', isPopular: true },
          { name: 'Elektrikli Bisiklet', slug: 'elektrikli-bisiklet', iconName: 'Bike' },
          { name: 'Otomobil Lastiği', slug: 'lastikler', iconName: 'Disc' },
          { name: 'Araç İçi Kamera', slug: 'arac-kamerasi', iconName: 'Video' },
        ],
      },
    ],
  },
  {
    id: 'ayakkabi',
    label: 'AYAKKABI',
    slug: 'ayakkabi',
    icon: 'Footprints',
    sections: [
      {
        title: 'Spor & Günlük Ayakkabı',
        slug: 'ayakkabi-modelleri',
        items: [
          { name: 'Spor Ayakkabı / Sneaker', slug: 'spor-ayakkabi', iconName: 'Footprints', isPopular: true },
          { name: 'Outdoor & Trekking Bot', slug: 'outdoor-bot', iconName: 'Mountain' },
          { name: 'Koşu Ayakkabısı', slug: 'kosu-ayakkabisi', iconName: 'Activity' },
        ],
      },
    ],
  },
  {
    id: 'diger',
    label: 'DİĞER',
    slug: 'diger',
    icon: 'Layers',
    highlight: true,
    sections: [
      {
        title: 'Oyun / Hobi',
        slug: 'oyun-hobi',
        items: [
          { name: 'Video Oyunları', slug: 'video-oyunlari', iconName: 'Trophy' },
          { name: 'Oyuncu Koltuğu', slug: 'oyuncu-koltugu', iconName: 'Armchair' },
          { name: 'Oyun Kolu (Gamepad)', slug: 'oyun-kolu', iconName: 'Gamepad2', isPopular: true },
          { name: 'Oyun Konsolu', slug: 'oyun-konsollari', iconName: 'Tv2', isPopular: true },
          { name: 'Elektrikli Scooter', slug: 'elektrikli-scooter', iconName: 'Zap' },
          { name: 'Lego & Yapı Oyuncakları', slug: 'lego', iconName: 'Boxes' },
          { name: 'Drone', slug: 'drone', iconName: 'Plane' },
          { name: 'VR / Sanal Gerçeklik', slug: 'sanal-gerceklik', iconName: 'Glasses' },
          { name: 'Gitar & Enstrüman', slug: 'enstrumanlar', iconName: 'Music' },
        ],
      },
      {
        title: 'Evcil Hayvan',
        slug: 'evcil-hayvan',
        items: [
          { name: 'Köpek Maması', slug: 'kopek-mamasi', iconName: 'Bone' },
          { name: 'Kedi Maması', slug: 'kedi-mamasi', iconName: 'Cat', isPopular: true },
          { name: 'Kedi Kumu', slug: 'kedi-kumu', iconName: 'Package' },
          { name: 'Otomatik Mama Kabı', slug: 'mama-kabi', iconName: 'Utensils' },
        ],
      },
      {
        title: 'Market & Tüketim',
        slug: 'market',
        items: [
          { name: 'Sıvı Yağ & Zeytinyağı', slug: 'sivi-yag', iconName: 'Droplet' },
          { name: 'Bal & Reçel', slug: 'bal', iconName: 'Heart' },
          { name: 'Kahve & Çekirdek', slug: 'kahve', iconName: 'Coffee', isPopular: true },
          { name: 'Çay', slug: 'cay', iconName: 'CupSoda' },
          { name: 'Şampuan & Duş Jeli', slug: 'sampuan', iconName: 'Sparkles' },
          { name: 'Deterjan & Temizlik', slug: 'deterjan', iconName: 'ShieldAlert' },
        ],
      },
      {
        title: 'Kamp & Outdoor',
        slug: 'kamp-malzemeleri',
        items: [
          { name: 'Çadır', slug: 'cadir', iconName: 'Tent', isPopular: true },
          { name: 'Mat & Şişme Yatak', slug: 'mat', iconName: 'Layers' },
          { name: 'Uyku Tulumu', slug: 'uyku-tulumu', iconName: 'Moon' },
          { name: 'Termos', slug: 'termos', iconName: 'Coffee' },
          { name: 'Kamp Sandalyesi & Masa', slug: 'kamp-sandalyesi', iconName: 'Armchair' },
          { name: 'Kamp Ocağı & Mangal', slug: 'kamp-ocagi', iconName: 'Flame' },
        ],
      },
      {
        title: 'Dijital, Kartlar & Diğer',
        slug: 'dijital-diger',
        items: [
          { name: 'Apple Hediye Kartı & Kodlar', slug: 'hediye-kartlari', iconName: 'Gift', isPopular: true, badge: 'Çok Aranan' },
          { name: 'Steam Cüzdan Kodu', slug: 'hediye-kartlari', iconName: 'CreditCard', isPopular: true },
          { name: 'Soğuk Kripto Cüzdan', slug: 'soguk-cuzdan', iconName: 'Key' },
          { name: 'Güneş Gözlüğü', slug: 'gunes-gozlugu', iconName: 'Glasses' },
          { name: 'Saat', slug: 'saatler', iconName: 'Watch' },
          { name: 'Outdoor Mont', slug: 'outdoor-mont', iconName: 'Shirt' },
          { name: 'Altın & Yatırım', slug: 'altin', iconName: 'Coins' },
        ],
      },
    ],
  },
];
