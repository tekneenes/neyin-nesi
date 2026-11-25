import { pool } from '../src/server/db/postgres';

// Her kategori ve alt ürün tipi için yüksek çözünürlüklü, gerçek ürün render ve stüdyo fotoğrafları
const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  'dizustu-bilgisayarlar': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', // MacBook / Alüminyum
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80', // Gaming Laptop RGB
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', // Slim Ultrabook
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', // Studio Laptop
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', // Minimalist Laptop
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80', // Workstation Laptop
  ],
  'monitorler': [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', // Curved Monitor
    'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80', // Gaming 144Hz Monitor
    'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=800&q=80', // 4K Designer Monitor
    'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80', // Dual Screen Setup
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80', // UltraWide Monitor
  ],
  'kulakliklar': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', // Over-Ear Studio
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80', // TWS Earbuds
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80', // Premium ANC Headphone
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', // HiFi Headphone
    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80', // Wireless Headset
  ],
  'bilgisayar-parcalari': [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', // Ekran Kartı GPU
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80', // AMD/Intel CPU İşlemci
    'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80', // RAM Bellek & Anakart
    'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80', // Sıvı Soğutma & Fan
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', // NVMe M.2 SSD
  ],
  'aksesuarlar': [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80', // Kablosuz Mouse
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', // Mekanik Klavye
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80', // Gaming Mousepad & Set
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80', // RGB Klavye Switch
    'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80', // USB-C Hub & Dock
  ],
};

async function diversifyCatalogImages() {
  console.log('Kategori bazlı görsel havuzunu dağıtıyoruz (Görsel monotonluğunu yok etme)...');
  const client = await pool.connect();

  try {
    for (const [catSlug, images] of Object.entries(CATEGORY_IMAGE_POOLS)) {
      console.log(`[${catSlug}] kategorisindeki ürünler çeşitlendiriliyor...`);

      // Icecat orijinal fotoğrafları hariç, tek tip Unsplash olanları çeşitlendir
      for (let i = 0; i < images.length; i++) {
        const targetImg = images[i];
        const res = await client.query(
          `UPDATE products 
           SET hero_image = $1 
           WHERE category_slug = $2 
             AND hero_image NOT ILIKE '%icecat.biz%' 
             AND hero_image NOT ILIKE '%gsmarena.com%' 
             AND (id::text ILIKE $3 OR (substring(id, length(id) - 1, 1) = $4))`,
          [targetImg, catSlug, `%${i}%`, String(i)]
        );
        console.log(`   -> Varyasyon ${i + 1}/${images.length}: ${res.rowCount} ürün güncellendi.`);
      }
    }
    console.log('✓ Görsel çeşitlendirme başarıyla tamamlandı!');
  } finally {
    client.release();
    await pool.end();
  }
}

diversifyCatalogImages().catch(console.error);
