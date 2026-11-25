import fs from 'fs';
import path from 'path';
import { Product } from '../../../types';
import { saveProductToPostgres } from '../../db/postgres';

const STORAGE_FILE = path.resolve(process.cwd(), 'src/data/scrapedProducts.json');

export function loadScrapedProducts(): Product[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(raw) || [];
  } catch (error) {
    console.error('Error loading scraped products from disk:', error);
    return [];
  }
}

export function saveProduct(product: Product): { saved: boolean; isNew: boolean } {
  const currentProducts = loadScrapedProducts();
  const existingIndex = currentProducts.findIndex(p => p.slug === product.slug || p.id === product.id);

  let isNew = false;
  if (existingIndex >= 0) {
    // Update existing
    currentProducts[existingIndex] = {
      ...currentProducts[existingIndex],
      ...product,
      viewCount: currentProducts[existingIndex].viewCount + 1,
    };
  } else {
    // Append new
    currentProducts.push(product);
    isNew = true;
  }

  // 1. PostgreSQL'e kaydet (Arka planda kalıcı veritabanı)
  saveProductToPostgres(product).catch(err => {
    console.warn('[PostgreSQL Senkronizasyon Uyarısı]:', err.message);
  });

  // 2. Client önbelleğini güncelle
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(currentProducts, null, 2), 'utf-8');
    return { saved: true, isNew };
  } catch (error) {
    console.error('Failed to save product to file:', error);
    return { saved: false, isNew };
  }
}
