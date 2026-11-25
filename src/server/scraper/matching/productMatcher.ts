import { Product, PriceOffer } from '../../../types';

/**
 * Normalizes hardware titles into a canonical hardware signature.
 * E.g.:
 * "INTEL Core i5 14400F 2.5GHz 20MB Önbellek 10 Çekirdek 1700 10nm Tray İşlemci"
 * and
 * "INTEL CORE i5-14400F 2.50GHZ 10 CEKIRDEK 20MB TRAY"
 * both map to signature: "intel:core-i5-14400f"
 */
export function extractHardwareSignature(product: Product): string {
  // 1. If explicit Barcode exists (EAN-13, GTIN), that is the absolute primary key
  if (product.barcode && product.barcode.length >= 8) {
    return `barcode:${product.barcode.trim()}`;
  }

  const raw = `${product.brand || ''} ${product.model || ''} ${product.fullName || ''}`.toLowerCase();

  // 2. Hardware Patterns Regex Matching
  // Intel CPUs (e.g. i5-14400F, i7-14700K, Ultra 5 225F)
  const intelMatch = raw.match(/i[3579][ -]?\d{4,5}[kfcrtx]*/i) || raw.match(/ultra [3579] \d{3}[a-z]*/i);
  if (intelMatch) {
    const code = intelMatch[0].replace(/\s+/g, '-').replace('ultra-', 'ultra-');
    return `cpu:intel:${code}`;
  }

  // AMD CPUs (e.g. ryzen 5 5600, ryzen 7 7800x3d, ryzen 9 9950x3d)
  const amdMatch = raw.match(/ryzen [3579] \d{4}[a-z0-9]*/i);
  if (amdMatch) {
    const code = amdMatch[0].replace(/\s+/g, '-');
    return `cpu:amd:${code}`;
  }

  // NVIDIA GPUs (e.g. rtx 4060, rtx 4070 ti, rtx 5060 ti, rtx 5080)
  const rtxMatch = raw.match(/rtx \d{4}( ti)?( super)?/i);
  if (rtxMatch) {
    // Also extract brand if present
    const brand = raw.includes('gigabyte') ? 'gigabyte' : raw.includes('msi') ? 'msi' : raw.includes('asus') ? 'asus' : raw.includes('palit') ? 'palit' : raw.includes('zotac') ? 'zotac' : 'nvidia';
    const code = rtxMatch[0].replace(/\s+/g, '-');
    return `gpu:${brand}:${code}`;
  }

  // AMD GPUs (e.g. rx 7800 xt, rx 9060 xt)
  const rxMatch = raw.match(/rx \d{4}[a-z0-9]*/i);
  if (rxMatch) {
    const code = rxMatch[0].replace(/\s+/g, '-');
    return `gpu:amd:${code}`;
  }

  // Samsung SSD (e.g. 990 pro 1tb, 980 pro 2tb, 9100 pro)
  const samsungSsdMatch = raw.match(/9\d{2,3} pro/i);
  if (raw.includes('samsung') && samsungSsdMatch) {
    const capMatch = raw.match(/\b(1tb|2tb|4tb|500gb)\b/i);
    const cap = capMatch ? capMatch[0] : '';
    return `ssd:samsung:${samsungSsdMatch[0].replace(/\s+/g, '-')}:${cap}`;
  }

  // MSI Spatium SSD (e.g. spatium m450, m461, m470, m560)
  const msiSsdMatch = raw.match(/spatium m\d{3}/i);
  if (msiSsdMatch) {
    const capMatch = raw.match(/\b(1tb|2tb|4tb|500gb)\b/i);
    const cap = capMatch ? capMatch[0] : '';
    return `ssd:msi:${msiSsdMatch[0].replace(/\s+/g, '-')}:${cap}`;
  }

  // Motherboards (e.g. b760, b650, x870, z790)
  const mbMatch = raw.match(/\b(b760|b650|b850|b840|x870|z790|h610)[a-z0-9-]*/i);
  if (mbMatch && (raw.includes('anakart') || raw.includes('motherboard') || product.categorySlug.includes('anakart'))) {
    const brand = raw.includes('asus') ? 'asus' : raw.includes('msi') ? 'msi' : raw.includes('gigabyte') ? 'gigabyte' : 'mb';
    return `mb:${brand}:${mbMatch[0]}`;
  }

  // Raspberry Pi (e.g. raspberry pi 5 4gb, raspberry pi 5 8gb)
  const rpiMatch = raw.match(/raspberry pi (4|5)( \dgb)?/i);
  if (rpiMatch) {
    return `maker:rpi:${rpiMatch[0].replace(/\s+/g, '-')}`;
  }

  // Fallback slug signature
  const clean = raw
    .replace(/\b(en ucuz|fiyati|kutusuz|fansiz|tray|box|siyah|beyaz|white|black|rgb|argb|gaming|oyuncu|islemci|ekran karti|anakart|ssd|ram)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  return `gen:${product.categorySlug}:${clean}`;
}

/**
 * Clusters products by canonical hardware signature and merges multiple store offers.
 */
export function clusterAndMergeProducts(products: Product[]): {
  mergedProducts: Product[];
  totalClusters: number;
  multiStoreClusters: number;
} {
  // Normalize category slugs across all stores
  for (const p of products) {
    if (p.categorySlug === 'ekran-karti') {
      p.categorySlug = 'ekran-kartlari';
      p.categoryName = 'Ekran Kartları';
    } else if (p.categorySlug === 'anakart') {
      p.categorySlug = 'anakartlar';
      p.categoryName = 'Anakartlar';
    } else if (p.categorySlug === 'depolama') {
      p.categorySlug = 'ssd-depolama';
      p.categoryName = 'SSD & Depolama';
    }
  }

  const signatureMap = new Map<string, Product[]>();

  for (const p of products) {
    const sig = extractHardwareSignature(p);
    if (!signatureMap.has(sig)) {
      signatureMap.set(sig, []);
    }
    signatureMap.get(sig)!.push(p);
  }

  const mergedProducts: Product[] = [];
  let multiStoreClusters = 0;

  for (const [sig, group] of signatureMap.entries()) {
    if (group.length === 1) {
      // Single product, keep as is
      mergedProducts.push(group[0]);
    } else {
      // Multiple items from different stores or duplicates!
      // Pick the primary master product (the one with richest specs or icecat id)
      group.sort((a, b) => (b.specGroups?.length || 0) - (a.specGroups?.length || 0));
      const master = { ...group[0] };

      // Collect all unique offers across the cluster
      const allOffers: PriceOffer[] = [];
      const seenOfferSellers = new Set<string>();

      for (const prod of group) {
        if (Array.isArray(prod.offers)) {
          for (const off of prod.offers) {
            // Deduplicate by seller name
            if (!seenOfferSellers.has(off.sellerName)) {
              seenOfferSellers.add(off.sellerName);
              allOffers.push(off);
            }
          }
        }
      }

      // Sort offers by price ascending (cheapest store first)
      allOffers.sort((a, b) => a.price - b.price);

      if (allOffers.length > 1) {
        multiStoreClusters++;
        const lowestPrice = allOffers[0].price;
        const highestPrice = allOffers[allOffers.length - 1].price;

        master.offers = allOffers;
        master.currentBestPrice = lowestPrice;
        master.dataSourcesCount = allOffers.length;
        master.priceRange = {
          min: lowestPrice,
          max: highestPrice,
        };

        // If there is a price drop difference between sellers, generate alert
        if (highestPrice > lowestPrice) {
          const diff = highestPrice - lowestPrice;
          const pct = Math.round((diff / highestPrice) * 100);
          master.priceDropAlert = {
            previousPrice: highestPrice,
            currentPrice: lowestPrice,
            dropAmount: diff,
            dropPercentage: pct,
            droppedAt: 'Farklı Satıcı Teklifi',
            sellerName: allOffers[0].sellerName,
          };
        }
      }

      mergedProducts.push(master);
    }
  }

  return {
    mergedProducts,
    totalClusters: signatureMap.size,
    multiStoreClusters,
  };
}
