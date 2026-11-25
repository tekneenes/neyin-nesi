import { pool } from './db/postgres.ts';
import { Product, SpecGroup, PriceOffer, Category } from '../types/index.ts';
import { CATEGORIES } from '../data/mockDatabase.ts';

export async function fetchProductsFromDb(filters: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
  ids?: string[];
}): Promise<Product[]> {
  const conditions: string[] = ['1=1'];
  const values: any[] = [];
  let paramIdx = 1;

  if (filters.category && filters.category !== 'all') {
    conditions.push(`category_slug = $${paramIdx++}`);
    values.push(filters.category);
  }

  if (filters.brand) {
    conditions.push(`LOWER(brand) = LOWER($${paramIdx++})`);
    values.push(filters.brand);
  }

  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    conditions.push(`current_best_price >= $${paramIdx++}`);
    values.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    conditions.push(`current_best_price <= $${paramIdx++}`);
    values.push(filters.maxPrice);
  }

  if (filters.query) {
    const qClean = filters.query.trim().toLowerCase();
    conditions.push(`(LOWER(full_name) ILIKE $${paramIdx} OR LOWER(model) ILIKE $${paramIdx} OR LOWER(brand) ILIKE $${paramIdx})`);
    values.push(`%${qClean}%`);
    paramIdx++;
  }

  if (Array.isArray(filters.ids) && filters.ids.length > 0) {
    conditions.push(`(id = ANY($${paramIdx}) OR slug = ANY($${paramIdx}))`);
    values.push(filters.ids);
    paramIdx++;
  } else {
    // Arama ve kategori gezinmelerinde kopya kartları gizle, sadece Master (Ana) modelleri getir
    conditions.push('is_master = TRUE');
  }

  // Sadece yayında olan ürünleri kullanıcılara göster (admin tarafından yayından kaldırılanlar hariç)
  conditions.push('(is_published IS NULL OR is_published = TRUE)');

  // Sıralama
  let orderBy = 'overall_trust_score DESC, view_count DESC';
  switch (filters.sortBy) {
    case 'newest':
      orderBy = 'release_year DESC, id DESC';
      break;
    case 'most_compared':
      orderBy = 'compare_count DESC';
      break;
    case 'price_asc':
      orderBy = 'current_best_price ASC';
      break;
    case 'price_desc':
      orderBy = 'current_best_price DESC';
      break;
    case 'recommended':
    default:
      orderBy = 'overall_trust_score DESC, view_count DESC';
      break;
  }

  const limit = Math.min(filters.limit || 100, 300);
  const offset = filters.offset || 0;

  const sql = `
    SELECT * FROM products
    WHERE ${conditions.join(' AND ')}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const res = await pool.query(sql, values);
  if (res.rows.length === 0) return [];

  const productIds = res.rows.map(r => r.id);

  // Offers ve Specs'i paralel batch ile çek
  const [offersRes, specsRes] = await Promise.all([
    pool.query(
      'SELECT * FROM price_offers WHERE product_id = ANY($1) ORDER BY price ASC',
      [productIds]
    ),
    pool.query(
      `SELECT sg.title as group_title, si.* 
       FROM spec_items si
       JOIN spec_groups sg ON si.spec_group_id = sg.id
       WHERE si.product_id = ANY($1)
       ORDER BY si.id ASC`,
      [productIds]
    ),
  ]);

  // Offers haritası
  const offersMap = new Map<string, PriceOffer[]>();
  for (const o of offersRes.rows) {
    if (!offersMap.has(o.product_id)) offersMap.set(o.product_id, []);
    offersMap.get(o.product_id)!.push({
      id: o.id,
      sellerName: o.seller_name,
      sellerRating: parseFloat(o.seller_rating) || 4.8,
      price: parseFloat(o.price),
      currency: o.currency || 'TL',
      inStock: o.in_stock,
      url: o.url,
      verifiedSource: o.verified_source || 'Doğrulanmış Mağaza',
      lastUpdated: o.last_updated || 'Bugün',
    });
  }

  // Specs haritası
  const specsMap = new Map<string, Map<string, SpecGroup>>();
  for (const si of specsRes.rows) {
    if (!specsMap.has(si.product_id)) specsMap.set(si.product_id, new Map());
    const prodGroups = specsMap.get(si.product_id)!;
    if (!prodGroups.has(si.group_title)) {
      prodGroups.set(si.group_title, {
        id: `grp-${si.spec_group_id}`,
        title: si.group_title,
        items: [],
      });
    }
    prodGroups.get(si.group_title)!.items.push({
      id: si.id,
      label: si.label,
      value: si.value,
      numericValue: si.numeric_value ? parseFloat(si.numeric_value) : undefined,
      unit: si.unit,
      isKeyHighlight: si.is_key_highlight,
      verification: {
        level: si.verification_level || 'authorized_distributor',
        sourceName: si.verification_source || 'Resmi Mağaza',
        verifiedAt: si.verified_at || '2026',
      },
    });
  }

  return res.rows.map(r => ({
    id: r.id,
    slug: r.slug,
    brand: r.brand,
    brandSlug: r.brand_slug,
    model: r.model,
    fullName: r.full_name,
    categorySlug: r.category_slug,
    categoryName: r.category_name,
    releaseYear: r.release_year,
    releaseDate: r.release_date || `${r.release_year}`,
    heroImage: r.hero_image,
    galleryImages: [r.hero_image],
    identitySummary: r.identity_summary || '',
    targetAudience: r.target_audience || '',
    primaryStrengths: ['Doğrulanmış mağaza stok teklifi', 'Canlı fiyat takibi'],
    considerations: [],
    specGroups: specsMap.has(r.id) ? Array.from(specsMap.get(r.id)!.values()) : [],
    offers: offersMap.get(r.id) || [],
    priceHistory: [],
    currentBestPrice: parseFloat(r.current_best_price) || 0,
    overallTrustScore: r.overall_trust_score || 95,
    dataSourcesCount: r.data_sources_count || 1,
    lastOverallVerification: 'Bugün',
    viewCount: r.view_count || 0,
    compareCount: r.compare_count || 0,
    barcode: r.barcode,
    isDemoData: false,
    masterId: r.master_id,
    isMaster: r.is_master,
    marketRegion: r.market_region,
    marketName: r.market_name,
    keyboardLayout: r.keyboard_layout,
    plugType: r.plug_type,
    warrantyBadge: r.warranty_badge,
    ramGb: r.ram_gb,
    storageGb: r.storage_gb,
    mpn: r.mpn,
  }));
}

export async function fetchProductBySlugFromDb(slug: string): Promise<Product | null> {
  const prodRes = await pool.query('SELECT * FROM products WHERE slug = $1 LIMIT 1', [slug]);
  if (prodRes.rows.length === 0) return null;
  const r = prodRes.rows[0];

  const [offersRes, specsRes, historyRes, galleryRes, variantsRes] = await Promise.all([
    pool.query('SELECT * FROM price_offers WHERE product_id = $1 ORDER BY price ASC', [r.id]),
    pool.query(
      `SELECT sg.title as group_title, si.* 
       FROM spec_items si
       JOIN spec_groups sg ON si.spec_group_id = sg.id
       WHERE si.product_id = $1
       ORDER BY si.id ASC`,
      [r.id]
    ),
    pool.query('SELECT * FROM price_history WHERE product_id = $1 ORDER BY recorded_date ASC', [r.id]),
    pool.query('SELECT image_url FROM product_gallery WHERE product_id = $1 ORDER BY sort_order ASC', [r.id]),
    pool.query(
      `SELECT id, slug, model, full_name, barcode, current_best_price,
              market_region, market_name, keyboard_layout, plug_type,
              warranty_badge, ram_gb, storage_gb, mpn
       FROM products
       WHERE master_id = $1 AND id != $2
       ORDER BY 
         CASE WHEN market_region = 'TR' THEN 0 WHEN market_region = 'EU' THEN 1 ELSE 2 END,
         ram_gb ASC, storage_gb ASC
       LIMIT 30`,
      [r.master_id || r.id, r.id]
    ),
  ]);

  const groupMap = new Map<string, SpecGroup>();
  for (const si of specsRes.rows) {
    if (!groupMap.has(si.group_title)) {
      groupMap.set(si.group_title, {
        id: `grp-${si.spec_group_id}`,
        title: si.group_title,
        items: [],
      });
    }
    groupMap.get(si.group_title)!.items.push({
      id: si.id,
      label: si.label,
      value: si.value,
      numericValue: si.numeric_value ? parseFloat(si.numeric_value) : undefined,
      unit: si.unit,
      isKeyHighlight: si.is_key_highlight,
      verification: {
        level: si.verification_level,
        sourceName: si.verification_source,
        verifiedAt: si.verified_at,
      },
    });
  }

  const gallery = galleryRes.rows.map(g => g.image_url);
  if (gallery.length === 0) gallery.push(r.hero_image);

  return {
    id: r.id,
    slug: r.slug,
    brand: r.brand,
    brandSlug: r.brand_slug,
    model: r.model,
    fullName: r.full_name,
    categorySlug: r.category_slug,
    categoryName: r.category_name,
    releaseYear: r.release_year,
    releaseDate: r.release_date || `${r.release_year}`,
    heroImage: r.hero_image,
    galleryImages: gallery,
    identitySummary: r.identity_summary || '',
    targetAudience: r.target_audience || '',
    primaryStrengths: ['Doğrulanmış mağaza stok teklifi', 'Canlı fiyat takibi'],
    considerations: [],
    specGroups: Array.from(groupMap.values()),
    offers: offersRes.rows.map(o => ({
      id: o.id,
      sellerName: o.seller_name,
      sellerRating: parseFloat(o.seller_rating) || 4.8,
      price: parseFloat(o.price),
      currency: o.currency || 'TL',
      inStock: o.in_stock,
      url: o.url,
      verifiedSource: o.verified_source || 'Doğrulanmış Mağaza',
      lastUpdated: o.last_updated || 'Bugün',
    })),
    priceHistory: historyRes.rows.map(h => ({
      date: h.recorded_date.toISOString().split('T')[0],
      price: parseFloat(h.price),
    })),
    currentBestPrice: parseFloat(r.current_best_price) || 0,
    overallTrustScore: r.overall_trust_score || 95,
    dataSourcesCount: r.data_sources_count || 1,
    lastOverallVerification: 'Bugün',
    viewCount: r.view_count || 0,
    compareCount: r.compare_count || 0,
    barcode: r.barcode,
    isDemoData: false,
    masterId: r.master_id,
    isMaster: r.is_master,
    marketRegion: r.market_region,
    marketName: r.market_name,
    keyboardLayout: r.keyboard_layout,
    plugType: r.plug_type,
    warrantyBadge: r.warranty_badge,
    ramGb: r.ram_gb,
    storageGb: r.storage_gb,
    mpn: r.mpn,
    officialLinks: Array.isArray(r.official_links)
      ? r.official_links
      : r.official_links
      ? (typeof r.official_links === 'string' ? JSON.parse(r.official_links) : r.official_links)
      : [],
    dataSources: Array.isArray(r.data_sources)
      ? r.data_sources
      : r.data_sources
      ? (typeof r.data_sources === 'string' ? JSON.parse(r.data_sources) : r.data_sources)
      : [],
    variants: variantsRes.rows.map(v => ({
      id: v.id,
      slug: v.slug,
      model: v.model,
      fullName: v.full_name,
      barcode: v.barcode,
      currentBestPrice: parseFloat(v.current_best_price) || 0,
      marketRegion: v.market_region,
      marketName: v.market_name,
      keyboardLayout: v.keyboard_layout,
      plugType: v.plug_type,
      warrantyBadge: v.warranty_badge,
      ramGb: v.ram_gb,
      storageGb: v.storage_gb,
      mpn: v.mpn,
    })),
  };
}

export async function fetchCategoriesFromDb(): Promise<Category[]> {
  const countsRes = await pool.query(
    'SELECT category_slug, count(*) as cnt FROM products GROUP BY category_slug'
  );
  const countMap = new Map<string, number>();
  for (const r of countsRes.rows) {
    countMap.set(r.category_slug, parseInt(r.cnt, 10));
  }

  return CATEGORIES.map(cat => ({
    ...cat,
    productCount: countMap.get(cat.slug) || 0,
  })).sort((a, b) => b.productCount - a.productCount);
}

export async function fetchStatsFromDb() {
  const [pCount, oCount, sCount, hCount] = await Promise.all([
    pool.query('SELECT count(*) FROM products'),
    pool.query('SELECT count(*) FROM price_offers'),
    pool.query('SELECT count(*) FROM spec_items'),
    pool.query('SELECT count(*) FROM price_history'),
  ]);
  return {
    totalProducts: parseInt(pCount.rows[0].count, 10),
    totalOffers: parseInt(oCount.rows[0].count, 10),
    totalSpecs: parseInt(sCount.rows[0].count, 10),
    totalSupplyHistory: parseInt(hCount.rows[0].count, 10),
  };
}

// ══════════════════════════════════════════════════════════════════════════
// VERİTABANI GÖRSEL İNCELEME (DATABASE STUDIO & EXPLORER) API'LERİ
// ══════════════════════════════════════════════════════════════════════════

export async function fetchDbTablesOverview() {
  const tables = [
    { name: 'products', label: 'Ürün Kataloğu', icon: 'Package' },
    { name: 'price_offers', label: 'Mağaza Fiyat Teklifleri', icon: 'Tag' },
    { name: 'price_history', label: 'Fiyat Geçmişi Analitiği', icon: 'TrendingUp' },
    { name: 'spec_groups', label: 'Teknik Özellik Grupları', icon: 'Layers' },
    { name: 'spec_items', label: 'Teknik Özellik Maddeleri', icon: 'CheckCircle2' },
    { name: 'product_gallery', label: 'Ürün Galeri Görselleri', icon: 'Image' },
    { name: 'price_drop_alerts', label: 'Fiyat Düşüş Bildirimleri', icon: 'Bell' },
  ];

  const results = await Promise.all(
    tables.map(async (t) => {
      try {
        const countRes = await pool.query(`SELECT count(*) as count FROM ${t.name}`);
        const sizeRes = await pool.query(
          `SELECT pg_size_pretty(pg_total_relation_size($1)) as size`,
          [t.name]
        );
        return {
          ...t,
          count: parseInt(countRes.rows[0]?.count || '0', 10),
          size: sizeRes.rows[0]?.size || '0 kB',
        };
      } catch (err: any) {
        return { ...t, count: 0, size: '0 kB', error: err.message };
      }
    })
  );

  return results;
}

export async function fetchDbTableRows(tableName: string, options: { page?: number; limit?: number; search?: string }) {
  const allowedTables = [
    'products',
    'price_offers',
    'price_history',
    'spec_groups',
    'spec_items',
    'product_gallery',
    'price_drop_alerts',
  ];

  if (!allowedTables.includes(tableName)) {
    throw new Error('Geçersiz tablo adı');
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(10, options.limit || 25));
  const offset = (page - 1) * limit;

  // Sütun isimlerini çek
  const colsRes = await pool.query(
    `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = $1 
     ORDER BY ordinal_position`,
    [tableName]
  );
  const columns = colsRes.rows.map((r) => ({ name: r.column_name, type: r.data_type }));

  let querySql = `SELECT * FROM ${tableName}`;
  const values: any[] = [];
  let paramIdx = 1;

  if (options.search && options.search.trim()) {
    const s = `%${options.search.trim()}%`;
    const searchConditions: string[] = [];

    // Metin sütunlarında arama yap
    for (const c of columns) {
      if (['character varying', 'text', 'character'].includes(c.type)) {
        searchConditions.push(`${c.name} ILIKE $${paramIdx}`);
      }
    }
    if (searchConditions.length > 0) {
      querySql += ` WHERE (${searchConditions.join(' OR ')})`;
      values.push(s);
      paramIdx++;
    }
  }

  const countSql = `SELECT count(*) FROM (${querySql}) as total_sub`;
  const countRes = await pool.query(countSql, values);
  const totalRows = parseInt(countRes.rows[0]?.count || '0', 10);

  // Sıralama
  if (columns.some(c => c.name === 'created_at')) {
    querySql += ` ORDER BY created_at DESC`;
  } else if (columns.some(c => c.name === 'id')) {
    querySql += ` ORDER BY id ASC`;
  }

  querySql += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
  values.push(limit, offset);

  const rowsRes = await pool.query(querySql, values);

  return {
    tableName,
    columns,
    rows: rowsRes.rows,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit),
    },
  };
}

export async function executeDbSafeQuery(sql: string) {
  const trimmed = sql.trim();
  // Sadece SELECT komutlarına izin ver (Salt Okunur Güvenlik)
  if (!trimmed.toLowerCase().startsWith('select') && !trimmed.toLowerCase().startsWith('explain')) {
    throw new Error('Güvenlik nedeniyle Studio üzerinden sadece SELECT ve EXPLAIN sorguları çalıştırılabilir.');
  }

  const startTime = Date.now();
  const res = await pool.query(trimmed);
  const executionTimeMs = Date.now() - startTime;

  return {
    columns: res.fields.map(f => f.name),
    rows: res.rows.slice(0, 100), // Max 100 satır önizleme
    totalReturned: res.rows.length,
    executionTimeMs,
  };
}

// ══════════════════════════════════════════════════════════════════════════
// ÜRÜN VERİ YÖNETİMİ & EDİTORYAL DENETİM MERKEZİ (CURATION STUDIO)
// ══════════════════════════════════════════════════════════════════════════

export async function fetchAdminProducts(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string; // 'all' | 'approved' | 'review' | 'rejected'
  publishStatus?: string; // 'all' | 'published' | 'unpublished'
}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(10, options.limit || 25));
  const offset = (page - 1) * limit;

  const conditions: string[] = ['1=1'];
  const values: any[] = [];
  let pIdx = 1;

  if (options.status && options.status !== 'all') {
    if (options.status === 'review') {
      conditions.push("(p.audit_status = 'review' OR p.audit_status IS NULL)");
    } else {
      conditions.push(`p.audit_status = $${pIdx++}`);
      values.push(options.status);
    }
  }

  if (options.category && options.category !== 'all') {
    conditions.push(`p.category_slug = $${pIdx++}`);
    values.push(options.category);
  }

  if (options.publishStatus === 'published') {
    conditions.push('(p.is_published IS NULL OR p.is_published = TRUE)');
  } else if (options.publishStatus === 'unpublished') {
    conditions.push('p.is_published = FALSE');
  }

  if (options.search && options.search.trim()) {
    const s = `%${options.search.trim()}%`;
    conditions.push(`(p.full_name ILIKE $${pIdx} OR p.model ILIKE $${pIdx} OR p.brand ILIKE $${pIdx} OR p.barcode ILIKE $${pIdx} OR p.id ILIKE $${pIdx})`);
    values.push(s);
    pIdx++;
  }

  const whereSql = conditions.join(' AND ');

  const [statsRes, countRes, rowsRes] = await Promise.all([
    pool.query(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE audit_status = 'approved') as approved,
        count(*) FILTER (WHERE audit_status = 'review' OR audit_status IS NULL) as review,
        count(*) FILTER (WHERE audit_status = 'rejected') as rejected,
        count(*) FILTER (WHERE is_published = false) as unpublished,
        count(*) FILTER (WHERE is_published = true OR is_published IS NULL) as published
      FROM products
    `),
    pool.query(`SELECT count(*) FROM products p WHERE ${whereSql}`, values),
    pool.query(`
      SELECT 
        p.id, p.slug, p.brand, p.model, p.full_name, p.category_slug, p.category_name,
        p.hero_image, p.barcode, p.current_best_price, p.overall_trust_score,
        COALESCE(p.audit_status, 'review') as audit_status, p.audit_notes, 
        p.market_region, p.keyboard_layout, p.is_master,
        COALESCE(p.is_published, true) as is_published,
        COALESCE(p.official_links, '[]'::jsonb) as official_links,
        COALESCE(sc.spec_count, 0) as spec_count
      FROM products p
      LEFT JOIN (
        SELECT product_id, count(*) as spec_count 
        FROM spec_items 
        GROUP BY product_id
      ) sc ON sc.product_id = p.id
      WHERE ${whereSql}
      ORDER BY 
        CASE WHEN p.audit_status = 'review' OR p.audit_status IS NULL THEN 1 WHEN p.audit_status = 'approved' THEN 2 ELSE 3 END,
        p.id DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++}
    `, [...values, limit, offset]),
  ]);

  const totalRows = parseInt(countRes.rows[0]?.count || '0', 10);
  const st = statsRes.rows[0] || {};

  return {
    products: rowsRes.rows,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit),
    },
    stats: {
      total: parseInt(st.total || '0', 10),
      approved: parseInt(st.approved || '0', 10),
      review: parseInt(st.review || '0', 10),
      rejected: parseInt(st.rejected || '0', 10),
      unpublished: parseInt(st.unpublished || '0', 10),
      published: parseInt(st.published || '0', 10),
    },
  };
}

export async function fetchAdminProductDetail(id: string) {
  const prodRes = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
  if (prodRes.rows.length === 0) return null;
  const product = prodRes.rows[0];

  const [groupsRes, itemsRes] = await Promise.all([
    pool.query('SELECT * FROM spec_groups WHERE product_id = $1 ORDER BY sort_order ASC, id ASC', [id]),
    pool.query('SELECT * FROM spec_items WHERE product_id = $1 ORDER BY id ASC', [id]),
  ]);

  const itemsByGroup = new Map<string, any[]>();
  for (const it of itemsRes.rows) {
    if (!itemsByGroup.has(it.spec_group_id)) itemsByGroup.set(it.spec_group_id, []);
    itemsByGroup.get(it.spec_group_id)!.push({
      id: it.id,
      label: it.label,
      value: it.value,
      unit: it.unit || '',
      isKeyHighlight: it.is_key_highlight || false,
      verificationLevel: it.verification_level || 'manufacturer',
      verificationSource: it.verification_source || 'Üretici Resmi Kaynağı',
      verifiedAt: it.verified_at || 'Bugün',
    });
  }

  const specGroups = groupsRes.rows.map(g => ({
    id: g.id,
    title: g.title,
    sortOrder: g.sort_order,
    items: itemsByGroup.get(g.id) || [],
  }));

  return {
    product: {
      id: product.id,
      slug: product.slug,
      brand: product.brand,
      model: product.model,
      fullName: product.full_name,
      categorySlug: product.category_slug,
      categoryName: product.category_name,
      heroImage: product.hero_image,
      barcode: product.barcode,
      currentBestPrice: parseFloat(product.current_best_price) || 0,
      auditStatus: product.audit_status || 'review',
      auditNotes: product.audit_notes || '',
      marketRegion: product.market_region || 'TR',
      marketName: product.market_name || 'Türkiye Pazarı',
      keyboardLayout: product.keyboard_layout || '',
      plugType: product.plug_type || '',
      warrantyBadge: product.warranty_badge || '',
      officialLinks: Array.isArray(product.official_links)
        ? product.official_links
        : product.official_links
        ? (typeof product.official_links === 'string' ? JSON.parse(product.official_links) : product.official_links)
        : [],
      dataSources: Array.isArray(product.data_sources)
        ? product.data_sources
        : product.data_sources
        ? (typeof product.data_sources === 'string' ? JSON.parse(product.data_sources) : product.data_sources)
        : [],
      isPublished: product.is_published !== false,
      ramGb: product.ram_gb,
      storageGb: product.storage_gb,
    },
    specGroups,
  };
}

export async function saveAdminProductDetail(id: string, payload: {
  product?: {
    fullName?: string;
    brand?: string;
    model?: string;
    categorySlug?: string;
    categoryName?: string;
    heroImage?: string;
    barcode?: string;
    currentBestPrice?: number;
    auditStatus?: string;
    auditNotes?: string;
    marketRegion?: string;
    keyboardLayout?: string;
    plugType?: string;
    warrantyBadge?: string;
    ramGb?: number;
    storageGb?: number;
    officialLinks?: Array<{ country: string; label: string; url: string }>;
    dataSources?: string[];
    isPublished?: boolean;
  };
  specGroups?: Array<{
    id?: string;
    title: string;
    sortOrder?: number;
    items: Array<{
      id?: string;
      label: string;
      value: string;
      unit?: string;
      isKeyHighlight?: boolean;
      verificationLevel?: string;
      verificationSource?: string;
    }>;
  }>;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const p = payload.product || {};
    const checkRes = await client.query('SELECT id FROM products WHERE id = $1', [id]);
    let productId = id;

    if (checkRes.rows.length === 0) {
      // YENİ ÜRÜN OLUŞTURMA (INSERT)
      const brand = (p.brand || 'Genel').trim();
      const model = (p.model || 'Model').trim();
      const fullName = (p.fullName || `${brand} ${model}`).trim();
      
      const rawSlug = (p.model ? `${brand}-${model}` : (fullName || `urun-${Date.now()}`))
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `prod-${Date.now()}`;
      
      let finalSlug = rawSlug;
      const slugCheck = await client.query('SELECT id FROM products WHERE slug = $1', [finalSlug]);
      if (slugCheck.rows.length > 0) {
        finalSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`;
      }

      productId = id && !id.startsWith('new-') ? id : `prod-${finalSlug}`;
      const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'marka';
      const categorySlug = p.categorySlug || 'akilli-saatler';
      const categoryName = p.categoryName || 'Akıllı Saatler';
      const heroImage = p.heroImage || 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=600&q=80';

      await client.query(`
        INSERT INTO products (
          id, slug, brand, brand_slug, model, full_name, category_slug, category_name,
          hero_image, barcode, current_best_price, audit_status, audit_notes,
          market_region, keyboard_layout, plug_type, warranty_badge,
          ram_gb, storage_gb, official_links, data_sources, is_published, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17,
          $18, $19, $20, $21, $22, NOW(), NOW()
        )
      `, [
        productId, finalSlug, brand, brandSlug, model, fullName, categorySlug, categoryName,
        heroImage, p.barcode || '', p.currentBestPrice || 0, p.auditStatus || 'review', p.auditNotes || '',
        p.marketRegion || 'TR', p.keyboardLayout || '', p.plugType || '', p.warrantyBadge || 'Resmi Distribütör Garantili',
        p.ramGb || null, p.storageGb || null,
        JSON.stringify(p.officialLinks || []),
        JSON.stringify(p.dataSources || ['Üretici Resmi Kaynağı', 'Neyin Nesi Araştırma & Doğrulama Ekibi']),
        p.isPublished !== undefined ? p.isPublished : true
      ]);
    } else {
      await client.query(`
        UPDATE products
        SET 
          full_name = COALESCE($1, full_name),
          brand = COALESCE($2, brand),
          model = COALESCE($3, model),
          category_slug = COALESCE($4, category_slug),
          category_name = COALESCE($5, category_name),
          hero_image = COALESCE($6, hero_image),
          barcode = COALESCE($7, barcode),
          current_best_price = COALESCE($8, current_best_price),
          audit_status = COALESCE($9, audit_status),
          audit_notes = COALESCE($10, audit_notes),
          market_region = COALESCE($11, market_region),
          keyboard_layout = COALESCE($12, keyboard_layout),
          plug_type = COALESCE($13, plug_type),
          warranty_badge = COALESCE($14, warranty_badge),
          ram_gb = COALESCE($15, ram_gb),
          storage_gb = COALESCE($16, storage_gb),
          official_links = COALESCE($17, official_links),
          data_sources = COALESCE($18, data_sources),
          is_published = COALESCE($19, is_published),
          updated_at = NOW()
        WHERE id = $20
      `, [
        p.fullName, p.brand, p.model, p.categorySlug, p.categoryName,
        p.heroImage, p.barcode, p.currentBestPrice, p.auditStatus, p.auditNotes,
        p.marketRegion, p.keyboardLayout, p.plugType, p.warrantyBadge,
        p.ramGb, p.storageGb,
        p.officialLinks ? JSON.stringify(p.officialLinks) : null,
        p.dataSources ? JSON.stringify(p.dataSources) : null,
        p.isPublished !== undefined ? p.isPublished : null,
        productId
      ]);
    }

    if (Array.isArray(payload.specGroups)) {
      await client.query('DELETE FROM spec_items WHERE product_id = $1', [productId]);
      await client.query('DELETE FROM spec_groups WHERE product_id = $1', [productId]);

      for (let gi = 0; gi < payload.specGroups.length; gi++) {
        const grp = payload.specGroups[gi];
        if (!grp.title || !grp.title.trim()) continue;
        const groupId = `grp-${productId.replace(/[^a-zA-Z0-9]/g, '')}-${gi}`;
        
        await client.query(`
          INSERT INTO spec_groups (id, product_id, title, sort_order)
          VALUES ($1, $2, $3, $4)
        `, [groupId, productId, grp.title.trim(), gi]);

        if (Array.isArray(grp.items)) {
          for (let ii = 0; ii < grp.items.length; ii++) {
            const item = grp.items[ii];
            if (!item.label || !item.label.trim()) continue;
            const itemId = `item-${productId.replace(/[^a-zA-Z0-9]/g, '')}-${gi}-${ii}`;
            
            await client.query(`
              INSERT INTO spec_items (
                id, spec_group_id, product_id, label, value, unit,
                is_key_highlight, verification_level, verification_source, verified_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
              itemId,
              groupId,
              productId,
              item.label.trim(),
              String(item.value || '').trim(),
              item.unit || null,
              !!item.isKeyHighlight,
              item.verificationLevel || 'manufacturer',
              item.verificationSource || 'Üretici Resmi Kaynağı',
              new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
            ]);
          }
        }
      }
    }

    categoryPresetsCache.clear();
    await client.query('COMMIT');
    return { success: true, id: productId };
  } catch (err: any) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateAdminProductStatus(id: string, status: string) {
  if (!['approved', 'review', 'rejected'].includes(status)) {
    throw new Error('Geçersiz onay durumu');
  }
  await pool.query('UPDATE products SET audit_status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
  return { success: true, status };
}

// ══════════════════════════════════════════════════════════════════════════════
// KATEGORİYE ÖZEL CANLI VERİTABANI BAŞLIK VE ÖZELLİK ÖNERİ MOTORU
// ══════════════════════════════════════════════════════════════════════════════
const categoryPresetsCache = new Map<string, { timestamp: number; data: any }>();

function normalizeLabelKey(label: string): string {
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

export async function fetchCategoryPresets(categorySlug: string) {
  const cacheKey = categorySlug || 'all';
  const cached = categoryPresetsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 1000 * 15) {
    return cached.data;
  }

  const whereCat = categorySlug && categorySlug !== 'all' ? 'WHERE p.category_slug = $1' : '';
  const params = categorySlug && categorySlug !== 'all' ? [categorySlug] : [];

  const [groupsRes, labelsRes, sampleValuesRes] = await Promise.all([
    // 1. Bu kategorideki en yaygın gruplar
    pool.query(`
      SELECT sg.title, count(DISTINCT si.id) as item_cnt
      FROM spec_groups sg
      JOIN spec_items si ON si.spec_group_id = sg.id
      JOIN products p ON si.product_id = p.id
      ${whereCat}
      GROUP BY sg.title
      ORDER BY item_cnt DESC
      LIMIT 30
    `, params),

    // 2. Bu kategorideki en yaygın özellik isimleri
    pool.query(`
      SELECT si.label, count(*) as cnt
      FROM spec_items si
      JOIN products p ON si.product_id = p.id
      ${whereCat}
      GROUP BY si.label
      ORDER BY cnt DESC
      LIMIT 100
    `, params),

    // 3. Her bir özellik için en çok kullanılan ve en güncel değer seçenekleri (Partitioned Ranking)
    pool.query(`
      WITH ranked_specs AS (
        SELECT 
          si.label, 
          si.value, 
          count(*) as val_cnt,
          row_number() OVER (
            PARTITION BY lower(trim(si.label)) 
            ORDER BY 
              min(CASE 
                WHEN si.id LIKE 'item-%' OR si.verification_level = 'manufacturer' OR si.verification_source ILIKE '%Resmi%' THEN 0 
                ELSE 1 
              END) ASC,
              count(*) DESC, 
              max(si.id) DESC
          ) as rn
        FROM spec_items si
        JOIN products p ON si.product_id = p.id
        WHERE ${categorySlug && categorySlug !== 'all' ? 'p.category_slug = $1 AND ' : ''}length(trim(si.value)) > 0 AND length(si.value) <= 120
        GROUP BY si.label, si.value
      )
      SELECT label, value, val_cnt
      FROM ranked_specs
      WHERE rn <= 35
      ORDER BY rn ASC, val_cnt DESC
      LIMIT 3000;
    `, params),
  ]);

  // Grupla: label -> string[] (hem orijinal, hem normalize edilmiş anahtarlarla indeksle)
  const valueMap: Record<string, string[]> = {};

  const addValue = (key: string, val: string) => {
    if (!key || !val) return;
    const cleanK = key.trim();
    if (!cleanK) return;
    if (!valueMap[cleanK]) valueMap[cleanK] = [];
    if (!valueMap[cleanK].includes(val) && valueMap[cleanK].length < 35) {
      valueMap[cleanK].push(val);
    }
  };

  for (const row of sampleValuesRes.rows) {
    const rawLabel = row.label || '';
    const rawVal = row.value || '';
    if (!rawLabel || !rawVal) continue;

    // 1. Düz küçük harf
    const lblLower = rawLabel.toLowerCase().trim();
    addValue(lblLower, rawVal);

    // 2. Türkçe küçük harf
    const trLower = rawLabel.toLocaleLowerCase('tr-TR').trim();
    if (trLower !== lblLower) {
      addValue(trLower, rawVal);
    }

    // 3. Türkçe ve noktalama temizliği
    const cleanKey = normalizeLabelKey(rawLabel);
    if (cleanKey && cleanKey !== lblLower && cleanKey !== trLower) {
      addValue(cleanKey, rawVal);
    }

    // 4. Parantez temizlenmiş hali (Örn: "İşlemci (CPU)" -> "islemci")
    const withoutParens = normalizeLabelKey(rawLabel.replace(/\([^)]*\)/g, ''));
    if (withoutParens && withoutParens !== cleanKey) {
      addValue(withoutParens, rawVal);
    }

    // 5. Parantez içi hali (Örn: "İşlemci (CPU)" -> "cpu")
    const parenMatch = rawLabel.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1]) {
      const parenKey = normalizeLabelKey(parenMatch[1]);
      if (parenKey && parenKey.length > 1 && parenKey !== cleanKey && parenKey !== withoutParens) {
        addValue(parenKey, rawVal);
      }
    }
  }

  const result = {
    categorySlug,
    groups: groupsRes.rows.map((r) => r.title),
    labels: labelsRes.rows.map((r) => r.label),
    valueSuggestions: valueMap,
  };

  categoryPresetsCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

// ══════════════════════════════════════════════════════════════════════════════
// ÜRÜN SİLME VE YAYIN DURUMU YÖNETİMİ
// ══════════════════════════════════════════════════════════════════════════════

export async function deleteAdminProduct(id: string) {
  if (!id) throw new Error('Ürün ID gerekli');
  const res = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id, full_name', [id]);
  if (res.rowCount === 0) throw new Error('Ürün bulunamadı veya zaten silinmiş');
  return { success: true, deleted: res.rows[0] };
}

export async function setAdminProductPublish(id: string, isPublished: boolean) {
  if (!id) throw new Error('Ürün ID gerekli');
  const res = await pool.query(
    'UPDATE products SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_published, full_name',
    [isPublished, id]
  );
  if (res.rowCount === 0) throw new Error('Ürün bulunamadı');
  return { success: true, id, isPublished: res.rows[0].is_published, fullName: res.rows[0].full_name };
}

// ══════════════════════════════════════════════════════════════════════════════
// DIŞ KAYNAK (EPEY / CIMRI / AKAKÇE) AKILLI EŞLEŞTİRME VE ÖZELLİK SENKRONİZASYONU
// ══════════════════════════════════════════════════════════════════════════════

export async function findMatchingCandidates(query: string) {
  if (!query || !query.trim()) return [];
  const cleanQ = query.trim().toLowerCase();
  
  // Kelimelere ayır, anlamsız parantez/harfleri temizle
  const rawTokens = cleanQ
    .replace(/[^a-z0-9ğüşıöç\s]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['tb', 'gb', 'ram', 'ssd', 've', 'ile'].includes(t));

  if (rawTokens.length === 0) return [];

  const whereClauses: string[] = [];
  const params: any[] = [];
  
  rawTokens.slice(0, 6).forEach((token, idx) => {
    params.push(`%${token}%`);
    whereClauses.push(`(LOWER(p.full_name) ILIKE $${idx + 1} OR LOWER(p.model) ILIKE $${idx + 1} OR LOWER(p.brand) ILIKE $${idx + 1})`);
  });

  // Relevance expression in SQL so top matches are returned first
  const relevanceExpr = rawTokens.slice(0, 6).map((token, idx) => {
    return `(CASE WHEN LOWER(p.full_name) ILIKE $${idx + 1} THEN 3 WHEN LOWER(p.model) ILIKE $${idx + 1} THEN 2 WHEN LOWER(p.brand) ILIKE $${idx + 1} THEN 1 ELSE 0 END)`;
  }).join(' + ');

  const sql = `
    SELECT 
      p.id, p.slug, p.full_name, p.brand, p.model, p.category_name, p.category_slug,
      p.hero_image, p.current_best_price, p.audit_status,
      COUNT(si.id)::int as spec_count,
      (${relevanceExpr}) as relevance_score
    FROM products p
    LEFT JOIN spec_items si ON p.id = si.product_id
    WHERE ${whereClauses.join(' OR ')}
    GROUP BY p.id
    ORDER BY relevance_score DESC, p.view_count DESC
    LIMIT 30
  `;

  const res = await pool.query(sql, params);

  // JavaScript tarafında benzerlik puanı hesaplama
  const scored = res.rows.map(row => {
    const fullNameLower = (row.full_name || '').toLowerCase();
    const modelLower = (row.model || '').toLowerCase();
    const brandLower = (row.brand || '').toLowerCase();

    let matchedTokens = 0;
    for (const token of rawTokens) {
      if (fullNameLower.includes(token) || modelLower.includes(token) || brandLower.includes(token)) {
        matchedTokens++;
      }
    }

    const tokenRatio = matchedTokens / rawTokens.length;
    let bonus = 0;

    // Tam metin veya alt kelime uyumu bonusu
    if (fullNameLower.includes(cleanQ) || cleanQ.includes(fullNameLower)) {
      bonus += 0.35;
    }
    if (row.brand && cleanQ.includes(brandLower)) {
      bonus += 0.15;
    }

    const finalScore = Math.min(100, Math.round((tokenRatio * 60 + bonus * 40) * 100) / 100);

    return {
      id: row.id,
      slug: row.slug,
      fullName: row.full_name,
      brand: row.brand,
      model: row.model,
      categoryName: row.category_name,
      categorySlug: row.category_slug,
      heroImage: row.hero_image,
      currentBestPrice: parseFloat(row.current_best_price) || 0,
      auditStatus: row.audit_status,
      specCount: row.spec_count || 0,
      matchScore: Math.round(finalScore),
    };
  });

  // Puana göre azalan sırala
  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 6);
}

export async function syncExternalSpecs(payload: {
  targetProductId?: string;
  externalName: string;
  brand?: string;
  model?: string;
  categorySlug?: string;
  sourceUrl?: string;
  price?: number;
  heroImage?: string;
  specGroups: Array<{
    title: string;
    items: Array<{
      label: string;
      value: string;
      unit?: string;
      isKeyHighlight?: boolean;
    }>;
  }>;
}) {
  let targetId = payload.targetProductId;

  // Yeni ürün olarak eklenecekse
  if (!targetId || targetId === 'new') {
    const brand = (payload.brand || 'Genel').trim();
    const model = (payload.model || payload.externalName || 'Model').trim();
    const fullName = (payload.externalName || `${brand} ${model}`).trim();

    const rawSlug = fullName
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `prod-${Date.now()}`;

    targetId = `prod-${rawSlug}-${Date.now().toString().slice(-4)}`;

    await saveAdminProductDetail(targetId, {
      product: {
        fullName,
        brand,
        model,
        categorySlug: payload.categorySlug || 'akilli-telefonlar',
        categoryName: 'Akıllı Telefonlar',
        heroImage: payload.heroImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        currentBestPrice: payload.price || 0,
        auditStatus: 'approved',
        auditNotes: `Dış kaynaktan eklendi: ${payload.sourceUrl || 'Operatör Onaylı'}`,
        dataSources: ['Epey Özellik Tablosu', 'Neyin Nesi Operatör Doğrulaması'],
        isPublished: true,
      },
      specGroups: payload.specGroups,
    });

    return {
      success: true,
      action: 'created',
      productId: targetId,
      specGroupCount: payload.specGroups.length,
      itemCount: payload.specGroups.reduce((acc, g) => acc + (g.items?.length || 0), 0)
    };
  }

  // Mevcut ürünü güncelle
  const existingRes = await pool.query('SELECT * FROM products WHERE id = $1', [targetId]);
  if (existingRes.rows.length === 0) {
    throw new Error(`Eşleştirilecek ürün veritabanında bulunamadı: ${targetId}`);
  }

  const existingProd = existingRes.rows[0];
  const updateProductFields: any = {
    auditStatus: 'approved',
    auditNotes: `Epey ile senkronize edildi: ${payload.sourceUrl || 'Doğrulandı'}`,
  };

  if ((!existingProd.current_best_price || Number(existingProd.current_best_price) === 0) && payload.price) {
    updateProductFields.currentBestPrice = payload.price;
  }

  if (payload.heroImage && (!existingProd.hero_image || existingProd.hero_image.includes('unsplash'))) {
    updateProductFields.heroImage = payload.heroImage;
  }

  // Veri kaynaklarını güncelle
  let existingSources = ['Neyin Nesi Veritabanı', 'Epey Özellik Tablosu (Operatör Doğrulamalı)'];
  try {
    if (existingProd.data_sources) {
      const parsed = typeof existingProd.data_sources === 'string' ? JSON.parse(existingProd.data_sources) : existingProd.data_sources;
      if (Array.isArray(parsed)) {
        existingSources = Array.from(new Set([...parsed, 'Epey Özellik Tablosu (Operatör Doğrulamalı)']));
      }
    }
  } catch (_) {}
  updateProductFields.dataSources = existingSources;

  await saveAdminProductDetail(targetId, {
    product: updateProductFields,
    specGroups: payload.specGroups,
  });

  return {
    success: true,
    action: 'updated',
    productId: targetId,
    productName: existingProd.full_name,
    specGroupCount: payload.specGroups.length,
    itemCount: payload.specGroups.reduce((acc, g) => acc + (g.items?.length || 0), 0)
  };
}


