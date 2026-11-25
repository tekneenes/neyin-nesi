import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Product, PriceOffer, SpecGroup, SpecItem } from '../../types';

dotenv.config({ path: '.env.local' });
dotenv.config();

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  `postgresql://${process.env.USER || 'postgres'}@localhost:5432/neyinnesi`;

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 1. Veritabanı ve Şema Başlatıcı
export async function initDatabase(): Promise<void> {
  const schemaPath = path.resolve(process.cwd(), 'src/server/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
}

// 2. Ürünü PostgreSQL'e Kaydet / Güncelle (Upsert)
export async function saveProductToPostgres(p: Product): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // a. Slug çakışmasını akıllıca yönet: Aynı slug varsa bu aynı üründür, mevcut master ürüne bağla!
    let targetId = p.id;
    const existingSlug = await client.query('SELECT id, current_best_price FROM products WHERE slug = $1', [p.slug]);

    if (existingSlug.rows.length > 0 && existingSlug.rows[0].id !== p.id) {
      targetId = existingSlug.rows[0].id;
      const currentBest = Number(existingSlug.rows[0].current_best_price);
      if (p.currentBestPrice > 0 && (currentBest === 0 || p.currentBestPrice < currentBest)) {
        await client.query(
          'UPDATE products SET current_best_price = $1, data_sources_count = data_sources_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [p.currentBestPrice, targetId]
        );
      } else {
        await client.query(
          'UPDATE products SET data_sources_count = data_sources_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [targetId]
        );
      }
    } else {
      await client.query(
        `INSERT INTO products (
          id, slug, brand, brand_slug, model, full_name, category_slug, category_name,
          release_year, release_date, hero_image, identity_summary, target_audience,
          current_best_price, overall_trust_score, data_sources_count, barcode,
          view_count, compare_count, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          current_best_price = EXCLUDED.current_best_price,
          hero_image = EXCLUDED.hero_image,
          overall_trust_score = EXCLUDED.overall_trust_score,
          barcode = COALESCE(EXCLUDED.barcode, products.barcode),
          updated_at = CURRENT_TIMESTAMP`,
        [
          p.id,
          p.slug,
          p.brand,
          p.brandSlug,
          p.model,
          p.fullName,
          p.categorySlug,
          p.categoryName,
          p.releaseYear,
          p.releaseDate,
          p.heroImage,
          p.identitySummary || '',
          p.targetAudience || '',
          p.currentBestPrice || 0,
          p.overallTrustScore || 95,
          p.dataSourcesCount || 1,
          p.barcode || null,
          p.viewCount || 0,
          p.compareCount || 0,
        ]
      );
    }

    // b. price_offers ekle
    if (Array.isArray(p.offers)) {
      for (const off of p.offers) {
        const offerId = `${targetId}-${off.sellerName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        await client.query(
          `INSERT INTO price_offers (
            id, product_id, seller_name, seller_rating, price, currency, in_stock, url, verified_source, last_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            price = EXCLUDED.price,
            in_stock = EXCLUDED.in_stock,
            last_updated = EXCLUDED.last_updated`,
          [
            offerId,
            targetId,
            off.sellerName,
            off.sellerRating || 4.8,
            off.price,
            off.currency || 'TL',
            off.inStock ?? true,
            off.url || (off as any).productUrl || `https://www.bizdehesapli.com/urun/${targetId}`,
            off.verifiedSource || 'Doğrulanmış Mağaza Sayfası',
            off.lastUpdated || 'Bugün',
          ]
        );
      }
    }

    // c. price_history ekle
    if (Array.isArray(p.priceHistory)) {
      for (const ph of p.priceHistory) {
        if (!ph.date || !ph.price) continue;
        let validDate = ph.date;
        if (validDate === 'Bugün' || !validDate) {
          validDate = new Date().toISOString().split('T')[0];
        } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(validDate)) {
          const [d, m, y] = validDate.split('.');
          validDate = `${y}-${m}-${d}`;
        }
        await client.query(
          `INSERT INTO price_history (product_id, recorded_date, price)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, recorded_date) DO UPDATE SET price = EXCLUDED.price`,
          [targetId, validDate, ph.price]
        );
      }
    }

    // d. spec_groups ve spec_items ekle
    if (Array.isArray(p.specGroups)) {
      for (let gi = 0; gi < p.specGroups.length; gi++) {
        const g = p.specGroups[gi];
        const groupId = `${targetId}-grp-${gi}`;
        await client.query(
          `INSERT INTO spec_groups (id, product_id, title, sort_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title`,
          [groupId, targetId, g.title, gi]
        );

        if (Array.isArray(g.items)) {
          for (let ii = 0; ii < g.items.length; ii++) {
            const item = g.items[ii];
            const itemId = `${groupId}-item-${ii}`;
            await client.query(
              `INSERT INTO spec_items (
                id, spec_group_id, product_id, label, value, numeric_value, unit,
                is_key_highlight, verification_level, verification_source, verified_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (id) DO UPDATE SET
                value = EXCLUDED.value,
                verification_level = EXCLUDED.verification_level`,
              [
                itemId,
                groupId,
                targetId,
                item.label,
                item.value,
                item.numericValue || null,
                item.unit || null,
                item.isKeyHighlight ?? false,
                item.verification?.level || 'authorized_distributor',
                item.verification?.sourceName || 'Mağaza Resmi Sayfası',
                item.verification?.verifiedAt || '2026',
              ]
            );
          }
        }
      }
    }

    // e. gallery images
    if (Array.isArray(p.galleryImages)) {
      for (let i = 0; i < p.galleryImages.length; i++) {
        await client.query(
          `INSERT INTO product_gallery (product_id, image_url, sort_order)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [targetId, p.galleryImages[i], i]
        );
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// 3. PostgreSQL'den Ürünleri Getir (Sayfalama ve Filtreli)
export async function getProductsFromPostgres(limit = 50, offset = 0, category?: string): Promise<Product[]> {
  let sql = 'SELECT * FROM products';
  const params: any[] = [];

  if (category) {
    sql += ' WHERE category_slug = $1';
    params.push(category);
  }

  sql += ` ORDER BY current_best_price ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const res = await pool.query(sql, params);
  const products: Product[] = [];

  for (const row of res.rows) {
    const [offersRes, historyRes, specsRes] = await Promise.all([
      pool.query('SELECT * FROM price_offers WHERE product_id = $1 ORDER BY price ASC', [row.id]),
      pool.query('SELECT * FROM price_history WHERE product_id = $1 ORDER BY recorded_date ASC', [row.id]),
      pool.query(
        `SELECT sg.title as group_title, si.* 
         FROM spec_items si
         JOIN spec_groups sg ON si.spec_group_id = sg.id
         WHERE si.product_id = $1`,
        [row.id]
      ),
    ]);

    // Build specGroups
    const groupMap = new Map<string, SpecGroup>();
    for (const item of specsRes.rows) {
      if (!groupMap.has(item.group_title)) {
        groupMap.set(item.group_title, {
          id: `grp-${item.spec_group_id}`,
          title: item.group_title,
          items: [],
        });
      }
      groupMap.get(item.group_title)!.items.push({
        id: item.id,
        label: item.label,
        value: item.value,
        numericValue: item.numeric_value ? parseFloat(item.numeric_value) : undefined,
        unit: item.unit,
        isKeyHighlight: item.is_key_highlight,
        verification: {
          level: item.verification_level,
          sourceName: item.verification_source,
          verifiedAt: item.verified_at,
        },
      });
    }

    products.push({
      id: row.id,
      slug: row.slug,
      brand: row.brand,
      brandSlug: row.brand_slug,
      model: row.model,
      fullName: row.full_name,
      categorySlug: row.category_slug,
      categoryName: row.category_name,
      releaseYear: row.release_year,
      releaseDate: row.release_date,
      heroImage: row.hero_image,
      galleryImages: [row.hero_image],
      identitySummary: row.identity_summary,
      targetAudience: row.target_audience,
      primaryStrengths: ['Doğrulanmış mağaza stok teklifi', 'Canlı fiyat takibi'],
      considerations: [],
      specGroups: Array.from(groupMap.values()),
      offers: offersRes.rows.map(o => ({
        id: o.id,
        sellerName: o.seller_name,
        sellerRating: parseFloat(o.seller_rating),
        price: parseFloat(o.price),
        currency: o.currency,
        inStock: o.in_stock,
        url: o.url,
        verifiedSource: o.verified_source,
        lastUpdated: o.last_updated,
      })),
      priceHistory: historyRes.rows.map(h => ({
        date: h.recorded_date.toISOString().split('T')[0],
        price: parseFloat(h.price),
      })),
      currentBestPrice: parseFloat(row.current_best_price),
      overallTrustScore: row.overall_trust_score,
      dataSourcesCount: row.data_sources_count,
      lastOverallVerification: 'Bugün',
      viewCount: row.view_count,
      compareCount: row.compare_count,
      barcode: row.barcode,
      isDemoData: false,
    });
  }

  return products;
}

// 4. Toplam Ürün Sayısı
export async function getProductsCount(): Promise<number> {
  const res = await pool.query('SELECT COUNT(*) FROM products');
  return parseInt(res.rows[0].count, 10);
}
