import * as cheerio from 'cheerio';
import { RawExtractedData } from '../types';

export function extractJsonLd(html: string, sourceUrl: string): RawExtractedData | null {
  const $ = cheerio.load(html);
  const jsonLdScripts = $('script[type="application/ld+json"]');

  if (jsonLdScripts.length === 0) {
    return null;
  }

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const content = $(jsonLdScripts[i]).html()?.trim();
      if (!content) continue;

      const parsed = JSON.parse(content);
      const productObj = findProductInJsonLd(parsed);

      if (productObj) {
        return parseSchemaProduct(productObj, sourceUrl);
      }
    } catch {
      // Continue to next script tag if invalid JSON
      continue;
    }
  }

  return null;
}

function findProductInJsonLd(data: any): any {
  if (!data) return null;

  if (data['@type'] === 'Product' || (Array.isArray(data['@type']) && data['@type'].includes('Product'))) {
    return data;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findProductInJsonLd(item);
      if (found) return found;
    }
  }

  if (Array.isArray(data['@graph'])) {
    for (const item of data['@graph']) {
      const found = findProductInJsonLd(item);
      if (found) return found;
    }
  }

  return null;
}

function parseSchemaProduct(p: any, sourceUrl: string): RawExtractedData {
  // Brand name resolution
  let brand = 'Bilinmeyen Marka';
  if (typeof p.brand === 'string') {
    brand = p.brand;
  } else if (p.brand && typeof p.brand.name === 'string') {
    brand = p.brand.name;
  }

  // Images resolution
  const images: string[] = [];
  if (typeof p.image === 'string') {
    images.push(p.image);
  } else if (Array.isArray(p.image)) {
    for (const img of p.image) {
      if (typeof img === 'string') images.push(img);
      else if (img?.url) images.push(img.url);
    }
  } else if (p.image?.url) {
    images.push(p.image.url);
  }

  // Price resolution
  let price: { current?: number; currency?: string; sellerName?: string } | undefined;
  if (p.offers) {
    const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
    if (offer) {
      const numericPrice = parseFloat(offer.price || offer.lowPrice || '0');
      if (!isNaN(numericPrice) && numericPrice > 0) {
        price = {
          current: numericPrice,
          currency: offer.priceCurrency || 'TL',
          sellerName: offer.seller?.name || 'Yetkili Satıcı',
        };
      }
    }
  }

  // Additional Properties / Specs
  const rawSpecs: Array<{ groupName?: string; label: string; value: string }> = [];
  if (Array.isArray(p.additionalProperty)) {
    for (const prop of p.additionalProperty) {
      if (prop.name && prop.value !== undefined) {
        rawSpecs.push({
          groupName: prop.propertyID || 'Teknik Özellikler',
          label: String(prop.name).trim(),
          value: String(prop.value).trim(),
        });
      }
    }
  }

  return {
    title: p.name || p.model,
    brand,
    model: p.model || p.name,
    description: p.description,
    categoryName: p.category,
    images,
    price,
    rawSpecs,
    sourceUrl,
    sourceType: 'json_ld',
  };
}
