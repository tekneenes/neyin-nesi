import { Product, ProductScore, ScoreSubCategory, PopularComparison } from '../types';

/**
 * Neyin Nesi? Epey Tarzı Donanım & Fiyat/Performans Puanlama Motoru
 * Her ürün için kategori bazlı alt puanlar ve genel puan (100 üzerinden) hesaplar.
 */
export function calculateProductScore(product: Product): ProductScore {
  if (product.score) {
    return product.score;
  }

  const category = (product.categorySlug || '').toLowerCase();
  const allSpecs = product.specGroups.flatMap((g) => g.items);

  const findSpec = (query: string): string => {
    const q = query.toLowerCase();
    const item = allSpecs.find(
      (it) => it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q)
    );
    return item ? item.value : '';
  };

  const hasSpec = (query: string): boolean => {
    return !!findSpec(query);
  };

  let subScores: ScoreSubCategory[] = [];
  let overall = 80;

  if (category.includes('telefon')) {
    // 1. TELEFONLAR
    let perf = 82;
    const chipset = findSpec('yonga') || findSpec('işlemci') || findSpec('chipset');
    if (chipset.includes('A19') || chipset.includes('Snapdragon 8 Gen 4') || chipset.includes('Snapdragon 8 Elite')) {
      perf = 96;
    } else if (chipset.includes('A18') || chipset.includes('Snapdragon 8 Gen 3') || chipset.includes('Dimensity 9400')) {
      perf = 92;
    } else if (chipset.includes('A17') || chipset.includes('Snapdragon 8 Gen 2')) {
      perf = 88;
    }

    let screen = 84;
    const screenVal = findSpec('ekran') + ' ' + findSpec('yenileme') + ' ' + findSpec('parlaklık');
    if (screenVal.includes('120') || screenVal.includes('ProMotion') || screenVal.includes('LTPO')) screen += 6;
    if (screenVal.includes('OLED') || screenVal.includes('Super Retina') || screenVal.includes('AMOLED')) screen += 4;
    if (screenVal.includes('3000') || screenVal.includes('2600')) screen += 3;
    screen = Math.min(screen, 98);

    let camera = 80;
    const camVal = findSpec('kamera') + ' ' + findSpec('zoom') + ' ' + findSpec('optik');
    if (camVal.includes('48 MP') || camVal.includes('50 MP') || camVal.includes('200 MP')) camera += 7;
    if (camVal.includes('Periskop') || camVal.includes('5x') || camVal.includes('10x')) camera += 5;
    if (camVal.includes('OIS') || camVal.includes('Sensör-Shift')) camera += 4;
    camera = Math.min(camera, 97);

    let battery = 78;
    const batVal = findSpec('batarya') + ' ' + findSpec('şarj') + ' ' + findSpec('hızlı');
    if (batVal.includes('5000') || batVal.includes('5500') || batVal.includes('6000')) battery += 6;
    if (batVal.includes('45W') || batVal.includes('67W') || batVal.includes('100W')) battery += 7;
    else if (batVal.includes('35W') || batVal.includes('25W')) battery += 3;
    battery = Math.min(battery, 94);

    let fp = 75;
    if (product.currentBestPrice) {
      if (product.currentBestPrice < 35000) fp = 88;
      else if (product.currentBestPrice < 55000) fp = 84;
      else if (product.currentBestPrice < 75000) fp = 80;
      else fp = 78;
    }

    subScores = [
      { name: 'İşlemci & Performans', score: perf, verdict: perf >= 92 ? 'Sektör Lideri' : 'Üst Segment', icon: 'Cpu' },
      { name: 'Ekran & Görüntü', score: screen, verdict: screen >= 92 ? 'Referans Kalite' : 'Çok İyi', icon: 'Smartphone' },
      { name: 'Kamera & Video', score: camera, verdict: camera >= 90 ? 'Profesyonel Düzey' : 'Gelişmiş', icon: 'Camera' },
      { name: 'Batarya & Şarj', score: battery, verdict: battery >= 85 ? 'Hızlı & Dayanıklı' : 'Dengeli', icon: 'BatteryCharging' },
      { name: 'Fiyat / Performans', score: fp, verdict: fp >= 82 ? 'Çok Avantajlı' : 'Premium Segment', icon: 'BadgePercent' },
    ];

    overall = Math.round(perf * 0.3 + screen * 0.25 + camera * 0.25 + battery * 0.1 + fp * 0.1);
  } else if (category.includes('kulaklık')) {
    // 2. KULAKLIKLAR
    let sound = 88;
    const soundVal = findSpec('ses') + ' ' + findSpec('kodek') + ' ' + findSpec('hi-res') + ' ' + findSpec('sürücü');
    if (soundVal.includes('LDAC') || soundVal.includes('aptX') || soundVal.includes('Hi-Res')) sound += 5;
    if (soundVal.includes('30 mm') || soundVal.includes('40 mm')) sound += 3;
    sound = Math.min(sound, 97);

    let anc = 85;
    const ancVal = findSpec('gürültü') + ' ' + findSpec('anc') + ' ' + findSpec('engelleme');
    if (ancVal.includes('Aktif') || ancVal.includes('ANC') || ancVal.includes('V1') || ancVal.includes('QN1')) anc = 97;

    let battery = 84;
    const batVal = findSpec('kullanım') + ' ' + findSpec('pil') + ' ' + findSpec('saat');
    if (batVal.includes('40 saat') || batVal.includes('50 saat')) battery = 96;
    else if (batVal.includes('30 saat')) battery = 91;

    let comfort = 86;
    const weightVal = findSpec('ağırlık') + ' ' + findSpec('kafa bandı');
    if (weightVal.includes('250') || weightVal.includes('hafif')) comfort = 92;

    let fp = 80;
    if (product.currentBestPrice && product.currentBestPrice < 15000) fp = 86;

    subScores = [
      { name: 'Ses Kalitesi & Akustik', score: sound, verdict: 'Stüdyo Standardı', icon: 'Headphones' },
      { name: 'Gürültü Engelleme (ANC)', score: anc, verdict: 'Sınıfının En İyisi', icon: 'ShieldCheck' },
      { name: 'Pil Ömrü & Hızlı Şarj', score: battery, verdict: '40 Saat Dayanıklılık', icon: 'BatteryCharging' },
      { name: 'Konfor & Ergonomi', score: comfort, verdict: 'Ultra Hafif Kasa', icon: 'Smile' },
      { name: 'Fiyat / Performans', score: fp, verdict: 'Değerini Karşılıyor', icon: 'BadgePercent' },
    ];

    overall = Math.round(sound * 0.3 + anc * 0.3 + battery * 0.2 + comfort * 0.1 + fp * 0.1);
  } else if (category.includes('robotik') || category.includes('3d')) {
    // 3. ROBOTİK & AÇIK KAYNAK / 3D
    let mech = 86;
    if (hasSpec('dof') || hasSpec('serbestlik')) mech = 90;
    if (hasSpec('payload') || hasSpec('taşıma')) mech = 92;

    let openSource = 92;
    if (hasSpec('github') || hasSpec('yıldız') || hasSpec('lisans')) openSource = 98;

    let buildability = 85;
    if (hasSpec('3d') || hasSpec('baskı') || hasSpec('step')) buildability = 92;

    let fp = 88;

    subScores = [
      { name: 'Mekanik & Eksen Hassasiyeti', score: mech, verdict: 'Hassas Pozisyonlama', icon: 'Bot' },
      { name: 'Açık Kaynak & Topluluk', score: openSource, verdict: 'Tam Erişilebilir Tasarım', icon: 'Code2' },
      { name: 'Üretilebilirlik & BOM', score: buildability, verdict: 'Standart Parça Uyumu', icon: 'Wrench' },
      { name: 'Donanım & Kontrolcü', score: 85, verdict: 'Geniş Uyum', icon: 'Cpu' },
      { name: 'Fiyat / Maliyet Oranı', score: fp, verdict: 'Maksimum F/P', icon: 'BadgePercent' },
    ];

    overall = Math.round(mech * 0.3 + openSource * 0.3 + buildability * 0.2 + fp * 0.2);
  } else {
    // GENEL TEKNOLOJİ / DİĞER
    subScores = [
      { name: 'Ana Donanım & Güç', score: 86, verdict: 'Yüksek Standart', icon: 'Cpu' },
      { name: 'Yapı Kalitesi & Ergonomi', score: 88, verdict: 'Dayanıklı Kasa', icon: 'ShieldCheck' },
      { name: 'Yazılım & Ekosistem', score: 85, verdict: 'Geniş Destek', icon: 'Layers' },
      { name: 'Fiyat / Performans', score: 82, verdict: 'Segmentinde Başarılı', icon: 'BadgePercent' },
    ];
    overall = 86;
  }

  const ratingTier: ProductScore['ratingTier'] =
    overall >= 90 ? 'Mükemmel' : overall >= 80 ? 'Çok İyi' : overall >= 70 ? 'İyi' : 'Orta';

  return {
    overall,
    ratingTier,
    subScores,
    summaryVerdict: `Bu ürün kendi segmentindeki cihazların %${Math.min(99, overall + 4)}'ünden daha yüksek genel teknik donanım puanına sahiptir.`,
  };
}

/**
 * Popüler Karşılaştırmalar (En Çok Kıyaslanan Rakipler)
 */
export function getPopularComparisons(
  currentProduct: Product,
  allProducts: Product[]
): PopularComparison[] {
  if (currentProduct.popularComparisons && currentProduct.popularComparisons.length > 0) {
    return currentProduct.popularComparisons;
  }

  const currentScore = calculateProductScore(currentProduct).overall;

  // 1. Ürünün modeline özel hazır eşleştirmeler
  if (currentProduct.slug === 'iphone-17-pro') {
    return [
      {
        targetProductSlug: 'galaxy-s26-ultra',
        targetProductName: 'Samsung Galaxy S26 Ultra',
        targetProductBrand: 'Samsung',
        targetProductImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=80',
        targetProductPrice: 84999,
        targetProductScore: 92,
        highlightDifference: '200 MP Kamera & S-Pen vs A19 Pro & Kompakt Titanyum Gövde',
        badgeText: 'Doğrudan Amiral Gemisi Rakip',
      },
      {
        targetProductSlug: 'xiaomi-16-pro',
        targetProductName: 'Xiaomi 16 Pro',
        targetProductBrand: 'Xiaomi',
        targetProductImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80',
        targetProductPrice: 62999,
        targetProductScore: 88,
        highlightDifference: '6000 mAh Pil & 120W Şarj vs ProRes Video Ekosistemi',
        badgeText: 'F/P Güç Alternatifi',
      },
      {
        targetProductSlug: 'pixel-11-pro',
        targetProductName: 'Google Pixel 11 Pro',
        targetProductBrand: 'Google',
        targetProductImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=500&q=80',
        targetProductPrice: 72999,
        targetProductScore: 89,
        highlightDifference: 'Saf Android & Gelişmiş Gemini AI vs A19 Pro Grafik Gücü',
        badgeText: 'Yapay Zeka Rakibi',
      },
    ];
  }

  if (currentProduct.slug === 'sony-wh-1000xm5') {
    return [
      {
        targetProductSlug: 'sony-wh-1000xm6',
        targetProductName: 'Sony WH-1000XM6',
        targetProductBrand: 'Sony',
        targetProductImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80',
        targetProductPrice: 17499,
        targetProductScore: 94,
        highlightDifference: 'Yeni Nesil Çift V2 İşlemcili ANC ve Katlanabilir Yenilenmiş Menteşe',
        badgeText: 'Yeni Nesil Farkı',
      },
      {
        targetProductSlug: 'airpods-pro-3',
        targetProductName: 'Apple AirPods Pro 3',
        targetProductBrand: 'Apple',
        targetProductImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=80',
        targetProductPrice: 12999,
        targetProductScore: 89,
        highlightDifference: 'Kafa Üstü 40 Saat Pil Ömrü & 30mm Karbon Sürücü vs Kulak İçi Taşınabilirlik',
        badgeText: 'TWS Alternatifi',
      },
    ];
  }

  if (currentProduct.slug === 'angellm-thor') {
    return [
      {
        targetProductSlug: 'bcn3d-moveo',
        targetProductName: 'BCN3D Moveo Robotic Arm',
        targetProductBrand: 'BCN3D',
        targetProductImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=80',
        targetProductPrice: 18500,
        targetProductScore: 84,
        highlightDifference: 'Kompakt Nema 17 & 23 Hibrit Yapı vs Büyük Eğitsel Gövde',
        badgeText: 'Açık Kaynak Rakip',
      },
    ];
  }

  // 2. Dinamik olarak aynı kategorideki diğer ürünlerden türetme
  const rivals = allProducts.filter(
    (p) => p.slug !== currentProduct.slug && p.categorySlug === currentProduct.categorySlug
  );

  if (rivals.length > 0) {
    return rivals.slice(0, 3).map((r) => {
      const rScore = calculateProductScore(r).overall;
      return {
        targetProductSlug: r.slug,
        targetProductName: r.fullName,
        targetProductBrand: r.brand,
        targetProductImage: r.heroImage,
        targetProductPrice: r.currentBestPrice,
        targetProductScore: rScore,
        highlightDifference: `${r.brand} ekosistemi ve farklı tasarım yaklaşımı`,
        badgeText: rScore >= currentScore ? 'Üst Alternatif' : 'Ekonomik Seçenek',
      };
    });
  }

  return [];
}
