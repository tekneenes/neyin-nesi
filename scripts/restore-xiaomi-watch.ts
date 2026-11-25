import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://muhammed:@localhost:5432/neyinnesi',
});

async function fix() {
  const id = 'prod-watch-xiaomi-watch-s5-46mm';
  await pool.query('DELETE FROM spec_items WHERE product_id = $1', [id]);
  await pool.query('DELETE FROM spec_groups WHERE product_id = $1', [id]);

  const groups = [
    {
      title: 'EKRAN & GÖRÜNTÜ ÖZELLİKLERİ',
      items: [
        { label: 'Ekran Boyutu', value: '1.43 inç', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Ekran Teknolojisi', value: 'AMOLED Dokunmatik Panel', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Çözünürlük', value: '466 x 466 piksel (326 PPI)', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Parlaklık', value: '1500 nits (HBM) / 2200 nits Tepe Parlaklık', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Sürekli Açık Ekran (AOD)', value: 'Var', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
      ]
    },
    {
      title: 'BATARYA & ŞARJ DONANIMI',
      items: [
        { label: 'Pil Kapasitesi', value: '486 mAh Li-Po', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Tipik Kullanım Ömrü', value: '15 Gün Standart Kullanım', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'AOD Modunda Pil Ömrü', value: '5 Gün Yoğun Kullanım', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Şarj Süresi', value: '45 Dakika Manyetik Hızlı Şarj', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
      ]
    },
    {
      title: 'SAĞLIK, SPOR & BİYOMETRİK SENSÖRLER',
      items: [
        { label: 'Nabız ve SpO2 Sensörü', value: '12 Kanallı Hassas PPG Sensörü', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Vücut Sıcaklığı Ölçümü', value: 'Var (Hassas Cilt Sıcaklığı Sensörü)', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Spor Modları', value: '150+ Profesyonel Spor ve Egzersiz Modu', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Suya Dayanıklılık', value: '5 ATM (50 Metre Su Geçirmezlik)', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
      ]
    },
    {
      title: 'BAĞLANTI, KONUM & AKILLI ÖZELLİKLER',
      items: [
        { label: 'GPS / Konum Takibi', value: 'Çift Frekanslı L1+L5 GNSS (GPS, GLONASS, Galileo, BDS, QZSS)', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Bluetooth Sürümü', value: 'Bluetooth 5.3 (BLE)', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'Bluetooth Telefon Görüşmesi', value: 'Dahili Mikrofon ve Yüksek Sesli Hoparlör', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
        { label: 'NFC Desteği', value: 'Var (Temassız Ödeme & Akıllı Kartlar)', verificationLevel: 'manufacturer', verificationSource: 'Xiaomi Resmi Üretici Şartnamesi' },
      ]
    }
  ];

  for (let gi = 0; gi < groups.length; gi++) {
    const grp = groups[gi];
    const grpId = 'grp-' + id + '-' + gi;
    await pool.query('INSERT INTO spec_groups (id, product_id, title, sort_order) VALUES ($1, $2, $3, $4)', [grpId, id, grp.title, gi]);

    for (let ii = 0; ii < grp.items.length; ii++) {
      const it = grp.items[ii];
      const itId = 'item-' + id + '-' + gi + '-' + ii;
      await pool.query(`
        INSERT INTO spec_items (id, spec_group_id, product_id, label, value, verification_level, verification_source, verified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Bugün')
      `, [itId, grpId, id, it.label, it.value, it.verificationLevel, it.verificationSource]);
    }
  }

  console.log('Xiaomi Watch specs restored perfectly!');
  await pool.end();
}

fix().catch(console.error);
