import { pool } from '../src/server/db/postgres';

async function initBrandsTable() {
  console.log('Brands tablosu oluşturuluyor ve normalize ediliyor...');

  await pool.query(`
    DROP TABLE IF EXISTS brands CASCADE;
    CREATE TABLE brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      slug VARCHAR(150) UNIQUE NOT NULL,
      product_count INT DEFAULT 0,
      logo_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_brands_slug ON brands(slug);
    CREATE INDEX idx_brands_count ON brands(product_count DESC);
  `);

  // Her slug için tek bir brand name seçerek topla
  await pool.query(`
    INSERT INTO brands (name, slug, product_count)
    SELECT 
      MAX(brand) as name,
      brand_slug as slug,
      COUNT(*) as product_count
    FROM products
    WHERE brand IS NOT NULL 
      AND brand != '' 
      AND brand_slug IS NOT NULL 
      AND brand_slug != ''
      AND length(brand_slug) < 80
      AND brand_slug NOT LIKE '%/%'
    GROUP BY brand_slug
    ORDER BY product_count DESC;
  `);

  const top = await pool.query('SELECT name, slug, product_count FROM brands ORDER BY product_count DESC LIMIT 15');
  console.log('\n--- BAŞARIYLA NORMALİZE EDİLEN EN BÜYÜK MARKALAR ---');
  for (const b of top.rows) {
    console.log(`  * ${b.name} (${b.slug}): ${b.product_count.toLocaleString('tr-TR')} ürün`);
  }

  const totalBrands = await pool.query('SELECT count(*) FROM brands');
  console.log(`\nToplam Benzersiz Temizlenmiş Marka Sayısı: ${totalBrands.rows[0].count}`);

  await pool.end();
}

initBrandsTable().catch(console.error);
