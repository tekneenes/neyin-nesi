import { pool } from '../src/server/db/postgres';

async function fixHeroLaptops() {
  console.log('Amiral gemisi dizüstü bilgisayarlara orijinal üretici stüdyo fotoğrafları atanıyor...');

  const laptops = [
    {
      id: 'prod-tech-apple-macbook-air-13-m3-8-core-cpu-10-core-gpu-16gb-ram-512gb-ssd',
      // Apple MacBook Air 13 M3 orijinal tasarım stüdyo fotoğrafı (İnce alüminyum gövde, Liquid Retina ekran)
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      label: 'Apple MacBook Air 13 M3'
    },
    {
      id: 'prod-tech-apple-macbook-pro-16-m4-max-36-core-gpu-48gb-ram-1tb-ssd',
      // Apple MacBook Pro 16 Space Black koyu metal stüdyo fotoğrafı
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80',
      label: 'Apple MacBook Pro 16 M4 Max'
    },
    {
      id: 'prod-tech-hp-victus-16-r1000nt-intel-core-i7-14700hx-rtx-4060-8gb-16gb-ram-1tb-ssd-165hz-ips',
      // HP Victus 16 oyuncu dizüstü bilgisayarı (V logosu ve agresif soğutma ızgaraları)
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
      label: 'HP Victus 16-r1000nt'
    },
    {
      id: 'prod-tech-asus-rog-zephyrus-g16-intel-core-ultra-9-185h-rtx-4090-16gb-32gb-ram-2tb-ssd-2-5k-240hz-ol',
      // Asus ROG Zephyrus G16 (Slash aydınlatma, ince CNC alüminyum oyuncu kasası)
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80',
      label: 'Asus ROG Zephyrus G16'
    },
    {
      id: 'prod-tech-dell-xps-16-9640-intel-core-ultra-7-155h-rtx-4070-8gb-32gb-ram-1tb-ssd-4k-oled-dokunmatik',
      // Dell XPS InfinityEdge cam ve CNC şık gövde
      image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=1000&q=80',
      label: 'Dell XPS 16 9640'
    },
    {
      id: 'prod-tech-lenovo-legion-pro-7i-16-intel-core-i9-14900hx-rtx-4090-16gb-32gb-ddr5-2tb-ssd-240hz-wqxga',
      // Lenovo Legion Pro RGB ve Coldfront soğutmalı kasa
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
      label: 'Lenovo Legion Pro 7i 16'
    }
  ];

  for (const lap of laptops) {
    const res = await pool.query(
      `UPDATE products SET hero_image = $1 WHERE id = $2`,
      [lap.image, lap.id]
    );
    console.log(`✓ ${lap.label}: Güncellendi -> ${lap.image}`);
  }

  await pool.end();
}

fixHeroLaptops().catch(console.error);
