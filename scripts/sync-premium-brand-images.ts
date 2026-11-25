import { pool } from '../src/server/db/postgres';

async function updateSpecificModels() {
  console.log('Güncel ürün modellerine nokta atışı resmi fotoğrafları atanıyor...');

  const updates = [
    {
      match: '%FAB28RBL5%',
      image: 'https://smeg-tr.com/wp-content/uploads/2022/08/FAB28RBL5.jpg',
      label: 'Smeg FAB28RBL5 Siyah Retro Buzdolabı'
    },
    {
      match: '%CNef 4815%',
      image: 'https://api.liebherr.com.ua/c-storage/media/shop/f0/90/product-Dvukhkamerniy-kholodilnik-Liebherr-CNef-4815_f090b45ccfaa4d9de39a087137faa464.jpg',
      label: 'Liebherr CNef 4815 NoFrost Kombi Buzdolabı'
    },
    {
      match: '%FMA 654%',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      label: 'Franke Maris FMA Ankastre İndüksiyonlu Ocak'
    },
    {
      match: '%FMY 99%',
      image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80',
      label: 'Franke Mythos Ankastre Fırın'
    },
    {
      match: '%BM 4101%',
      image: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=800&q=80',
      label: 'Regal BM 4101 Bulaşık Makinesi'
    },
    {
      match: '%RGL 9102%',
      image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
      label: 'Regal RGL 9102 Çamaşır Makinesi'
    },
    {
      match: '%NF 48020%',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      // Düz beyaz çift kapak no-frost buzdolabı
      imageReplacement: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
      label: 'Regal NF 48020 No-Frost Buzdolabı'
    }
  ];

  for (const u of updates) {
    const img = (u as any).imageReplacement || u.image;
    const res = await pool.query(
      `UPDATE products SET hero_image = $1 WHERE full_name ILIKE $2 OR model ILIKE $2`,
      [img, u.match]
    );
    console.log(`✓ ${u.label}: ${res.rowCount} kayıt güncellendi -> ${img}`);
  }

  await pool.end();
}

updateSpecificModels().catch(console.error);
