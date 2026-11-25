import https from 'https';
import zlib from 'zlib';
import readline from 'readline';
import { pool } from '../src/server/db/postgres';

function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

// Icecat Türkçe Kategori Adını Portalımızın Ana Kategorilerine Eşleme
function mapIcecatCatToPortal(icecatTrName: string): { slug: string; name: string } {
  const name = icecatTrName.trim();
  const lower = name.toLowerCase();

  // 1. Bilgisayar & Laptop
  if (/dizüstü|laptop|notebook|ultrabook|taşınabilir bilgisayar/.test(lower)) {
    return { slug: 'dizustu-bilgisayarlar', name: 'Dizüstü Bilgisayarlar' };
  }
  // 2. Telefonlar
  if (/akıllı telefon|cep telefonu|akıllı telefonlar|mobil telefon/.test(lower)) {
    return { slug: 'telefonlar', name: 'Akıllı Telefonlar' };
  }
  // 3. Tabletler
  if (/tablet|grafik tablet|e-kitap okuyucu|tabletler/.test(lower)) {
    return { slug: 'tabletler', name: 'Tablet & E-Kitap' };
  }
  // 4. Monitörler
  if (/monitör|ekran|düz panel|lcd|led ekran|kavisli monitör/.test(lower) && !/kolu|montaj|filtre|kablo/.test(lower)) {
    return { slug: 'monitorler', name: 'Monitörler' };
  }
  // 5. Kulaklık & Ses
  if (/kulaklık|kulak içi|kulak üstü|headset|kulaklıklar|hoparlör|soundbar|ses kartı/.test(lower)) {
    return { slug: 'kulakliklar', name: 'Kulaklık & Ses Sistemleri' };
  }
  // 6. Bilgisayar Parçaları (Donanım)
  if (/işlemci|anakart|grafik kartı|ekran kartı|bellek|ram|ssd|katı hal sürücü|dahili sabit|güç kaynağı|bilgisayar kasası|soğutma|fan/.test(lower)) {
    return { slug: 'bilgisayar-parcalari', name: 'Bilgisayar Parçaları' };
  }
  // 7. Çevre Birimleri & Aksesuarlar
  if (/klavye|fare|mouse|webcam|mouse pad|fare altlığı|yerleştirme istasyonu|docking|usb hub|kart okuyucu|kablo|adaptör|şarj cihazı|powerbank/.test(lower)) {
    return { slug: 'aksesuarlar', name: 'Aksesuarlar & Çevre Birimleri' };
  }
  // 8. Ağ Cihazları (Modem & Router)
  if (/yönlendirici|router|modem|ağ anahtarı|switch|erişim noktası|access point|wifi adaptör/.test(lower)) {
    return { slug: 'ag-cihazlari', name: 'Ağ & Modem Cihazları' };
  }
  // 9. Yazıcı & Sarf Malzemeleri
  if (/yazıcı|toner|kartuş|mürekkep|baskı kafası|tarayıcı|fotokopi/.test(lower)) {
    return { slug: 'yazici-sarf-malzemeleri', name: 'Yazıcı & Sarf Malzemeleri' };
  }
  // 10. Beyaz Eşya & Ankastre
  if (/buzdolabı|çamaşır|bulaşık|kurutma|fırın|ocak|davlumbaz|klima|mikrodalga/.test(lower)) {
    return { slug: 'beyaz-esya-ankastre', name: 'Beyaz Eşya & Ankastre' };
  }
  // 11. Televizyonlar
  if (/televizyon|smart tv|led tv|oled tv/.test(lower)) {
    return { slug: 'televizyonlar', name: 'Televizyonlar' };
  }
  // 12. Akıllı Saat & Giyilebilir
  if (/akıllı saat|akıllı bileklik|aktivite takip/.test(lower)) {
    return { slug: 'akilli-saatler', name: 'Akıllı Saatler' };
  }
  // 13. Oyun & Konsol
  if (/oyun konsolu|video oyunu|oyun kolu|gamepad|direksiyon seti/.test(lower)) {
    return { slug: 'oyun-konsollari', name: 'Oyun Konsolları & Hobi' };
  }
  // 14. Fotoğraf & Kamera
  if (/kamera|fotoğraf makinesi|dijital kamera|lens|objektif|tripod/.test(lower)) {
    return { slug: 'kameralar', name: 'Fotoğraf Makineleri & Kameralar' };
  }

  // Özel olarak Icecat'in kendi Türkçe kategori adını temiz bir şekilde kullan
  return {
    slug: cleanSlug(name),
    name: name,
  };
}

async function run() {
  console.log('================================================================');
  console.log('   ICECAT TÜRKÇE KATEGORİ SÖZLÜĞÜ İLE 1.57M ÜRÜN SINIFLANDIRICI ');
  console.log('================================================================\n');

  const username = process.env.ICECAT_USERNAME || 'muhammed1258';
  const password = process.env.ICECAT_PASSWORD || 'Mami4958';
  const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  // Adım 1: Icecat CategoriesList.xml.gz dosyasından tüm Türkçe kategorileri hafızaya al
  console.log('[1/3] Icecat Türkçe kategori sözlüğü yükleniyor...');
  const catDictionary = new Map<string, string>(); // CatID -> Türkçe İsim

  await new Promise<void>((resolve, reject) => {
    https.get('https://data.icecat.biz/export/freexml/refs/CategoriesList.xml.gz', { headers: { Authorization: auth } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const gunzip = zlib.createGunzip();
      res.pipe(gunzip);
      const rl = readline.createInterface({ input: gunzip });

      let currentId: string | null = null;
      rl.on('line', (line) => {
        if (line.includes('<Category ID="')) {
          const m = line.match(/ID="([^"]+)"/);
          currentId = m ? m[1] : null;
        }
        if (currentId && line.includes('langid="20"')) {
          const valMatch = line.match(/Value="([^"]+)"/);
          if (valMatch && valMatch[1]) {
            catDictionary.set(currentId, valMatch[1]);
          }
        }
      });
      rl.on('close', () => {
        console.log(`✓ ${catDictionary.size} adet resmi Türkçe kategori sözlüğü hafızaya alındı.`);
        resolve();
      });
    }).on('error', reject);
  });

  // Adım 2: Icecat files.index.xml.gz akışından Product_ID ve Catid eşleşmesini oku
  console.log('\n[2/3] Icecat 14M İndeks akışı taranıyor ve ürün kategorileri eşleştiriliyor...');
  const client = await pool.connect();

  const req = https.get('https://data.icecat.biz/export/freexml/files.index.xml.gz', { headers: { Authorization: auth } }, async (res) => {
    if (res.statusCode !== 200) {
      console.error(`HTTP Hatası: ${res.statusCode}`);
      return;
    }

    const gunzip = zlib.createGunzip();
    res.pipe(gunzip);
    const rl = readline.createInterface({ input: gunzip, crlfDelay: Infinity });

    let count = 0;
    let updatedTotal = 0;
    const batchUpdates: { id: string; catSlug: string; catName: string }[] = [];
    const startTime = Date.now();

    const flushBatch = async (batch: typeof batchUpdates) => {
      if (batch.length === 0) return;
      try {
        await client.query('BEGIN');
        for (const item of batch) {
          const r = await client.query(
            `UPDATE products 
             SET category_slug = $1, category_name = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 AND category_slug = 'diger'`,
            [item.catSlug, item.catName, item.id]
          );
          updatedTotal += r.rowCount || 0;
        }
        await client.query('COMMIT');
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('Batch SQL Hatası:', err.message);
      }
    };

    for await (const line of rl) {
      if (line.includes('<file ') || line.includes('<file\t')) {
        count++;
        const prodIdMatch = line.match(/Product_ID="([^"]+)"/);
        const catIdMatch = line.match(/Catid="([^"]+)"/);

        if (prodIdMatch && catIdMatch) {
          const prodId = prodIdMatch[1];
          const catId = catIdMatch[1];
          const trCat = catDictionary.get(catId);

          if (trCat) {
            const mapped = mapIcecatCatToPortal(trCat);
            batchUpdates.push({
              id: `prod-icecat-${prodId}`,
              catSlug: mapped.slug,
              catName: mapped.name,
            });

            if (batchUpdates.length >= 1000) {
              await flushBatch([...batchUpdates]);
              batchUpdates.length = 0;

              const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
              console.log(`  -> ${count} Icecat kaydı tarandı | "Diğer" Kategorisinden Kurtarılan: ${updatedTotal} (${elapsed} sn)`);
            }
          }
        }
      }
    }

    if (batchUpdates.length > 0) {
      await flushBatch(batchUpdates);
    }

    client.release();
    await pool.end();

    console.log('\n================================================================');
    console.log(`🎉 1. FAZ TAMAMLANDI! Toplam ${updatedTotal} adet ürün doğru Türkçe kategorilerine taşındı.`);
    console.log('================================================================\n');
  });
}

run().catch(console.error);
