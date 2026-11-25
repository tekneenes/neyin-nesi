import { pool } from '../src/server/db/postgres';

async function fixWhiteGoods() {
  console.log('Fixing white goods images by category_slug and names...');

  // 1. Çamaşır Makineleri
  const r1 = await pool.query(`
    UPDATE products 
    SET hero_image = 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80'
    WHERE (category_slug IN ('beyaz-esya', 'beyaz-esya-ankastre', 'ev-elektronigi'))
      AND (full_name ILIKE '%çamaşır%' OR full_name ILIKE '%camasir%' OR model ILIKE '%çamaşır%')
  `);
  console.log(`Çamaşır: ${r1.rowCount} güncellendi`);

  // 2. Bulaşık Makineleri
  const r2 = await pool.query(`
    UPDATE products 
    SET hero_image = 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80'
    WHERE (category_slug IN ('beyaz-esya', 'beyaz-esya-ankastre', 'ev-elektronigi'))
      AND (full_name ILIKE '%bulaşık%' OR full_name ILIKE '%bulasik%' OR model ILIKE '%bulaşık%')
  `);
  console.log(`Bulaşık: ${r2.rowCount} güncellendi`);

  // 3. Buzdolapları
  const r3 = await pool.query(`
    UPDATE products 
    SET hero_image = 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80'
    WHERE (category_slug IN ('beyaz-esya', 'beyaz-esya-ankastre', 'ev-elektronigi'))
      AND (full_name ILIKE '%buzdolabı%' OR full_name ILIKE '%buzdolabi%' OR full_name ILIKE '%no-frost%')
  `);
  console.log(`Buzdolabı: ${r3.rowCount} güncellendi`);

  // 4. Fırın & Ankastre
  const r4 = await pool.query(`
    UPDATE products 
    SET hero_image = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    WHERE (category_slug IN ('beyaz-esya', 'beyaz-esya-ankastre', 'ev-elektronigi'))
      AND (full_name ILIKE '%fırın%' OR full_name ILIKE '%firin%' OR full_name ILIKE '%ocak%' OR full_name ILIKE '%ankastre%')
  `);
  console.log(`Fırın/Ankastre: ${r4.rowCount} güncellendi`);

  // 5. Kurutma Makineleri
  const r5 = await pool.query(`
    UPDATE products 
    SET hero_image = 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80'
    WHERE (category_slug IN ('beyaz-esya', 'beyaz-esya-ankastre', 'ev-elektronigi'))
      AND (full_name ILIKE '%kurutma%')
  `);
  console.log(`Kurutma: ${r5.rowCount} güncellendi`);

  // Kalan yün fotoğrafı olan tüm kayıtları modern teknoloji cihazı görseliyle değiştir
  const r6 = await pool.query(`
    UPDATE products 
    SET hero_image = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    WHERE hero_image = 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'
  `);
  console.log(`Kalan tüm yün fotoğrafları değiştirildi: ${r6.rowCount}`);

  await pool.end();
}

fixWhiteGoods().catch(console.error);
