import https from 'https';
import zlib from 'zlib';
import readline from 'readline';
import { pool } from '../src/server/db/postgres';

async function updateExistingImagesOnly() {
  console.log('================================================================');
  console.log('   SADECE MEVCUT ÜRÜNLERİN GÖRSELLERİNİ GÜNCELLEME MOTORU       ');
  console.log('   (Yeni ürün KESİNLİKLE eklenmez - Sadece UPDATE yapılır)      ');
  console.log('================================================================\n');

  const username = process.env.ICECAT_USERNAME || 'muhammed1258';
  const password = process.env.ICECAT_PASSWORD || 'Mami4958';
  const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
  const url = 'https://data.icecat.biz/export/freexml/files.index.xml.gz';

  const client = await pool.connect();
  let totalMatched = 0;
  let totalScanned = 0;
  const startTime = Date.now();

  const req = https.get(url, { headers: { Authorization: auth } }, async (res) => {
    if (res.statusCode !== 200) {
      console.error(`HTTP Hatası: ${res.statusCode} ${res.statusMessage}`);
      return;
    }

    const gunzip = zlib.createGunzip();
    res.pipe(gunzip);

    const rl = readline.createInterface({ input: gunzip, crlfDelay: Infinity });

    let currentBlock = '';
    let inBlock = false;
    let updateBatch: { id: string; highPic: string; ean: string | null }[] = [];

    const flushBatch = async (batch: typeof updateBatch) => {
      if (batch.length === 0) return;
      try {
        await client.query('BEGIN');
        for (const it of batch) {
          // SADECE VE SADECE UPDATE (Yeni kayıt oluşturulmaz!)
          if (it.ean) {
            const r = await client.query(
              `UPDATE products SET hero_image = $1 WHERE (barcode = $2 OR id = $3) AND hero_image NOT ILIKE '%images.icecat.biz%'`,
              [it.highPic, it.ean, it.id]
            );
            totalMatched += r.rowCount || 0;
          } else {
            const r = await client.query(
              `UPDATE products SET hero_image = $1 WHERE id = $2 AND hero_image NOT ILIKE '%images.icecat.biz%'`,
              [it.highPic, it.id]
            );
            totalMatched += r.rowCount || 0;
          }
        }
        await client.query('COMMIT');
      } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('Update Hatası:', err.message);
      }
    };

    for await (const line of rl) {
      if (line.includes('<file ') || line.includes('<file\t')) {
        inBlock = true;
        currentBlock = line;
        if (!line.includes('</file>')) continue;
      } else if (inBlock) {
        currentBlock += ' ' + line;
        if (!line.includes('</file>')) continue;
      } else {
        continue;
      }

      inBlock = false;
      const block = currentBlock;
      currentBlock = '';
      totalScanned++;

      const picMatch = block.match(/HighPic="([^"]+)"/);
      if (!picMatch || !picMatch[1] || !picMatch[1].startsWith('http')) {
        continue;
      }

      const prodIdMatch = block.match(/Product_ID="([^"]+)"/);
      const eanMatch = block.match(/<EAN_UPC Value="([^"]+)"/);

      const prodId = prodIdMatch ? prodIdMatch[1] : null;
      if (!prodId) continue;

      const highPic = picMatch[1];
      const ean = eanMatch ? eanMatch[1] : null;

      updateBatch.push({
        id: `prod-icecat-${prodId}`,
        highPic,
        ean,
      });

      if (updateBatch.length >= 500) {
        await flushBatch([...updateBatch]);
        updateBatch.length = 0;

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`  -> ${totalScanned} Icecat XML bloğu tarandı | Mevcut Ürünlerden Güncellenen Resim Sayısı: ${totalMatched} (${elapsed} sn)`);
      }
    }

    if (updateBatch.length > 0) {
      await flushBatch(updateBatch);
    }

    client.release();
    await pool.end();
    console.log(`✓ Mevcut ürün görselleri güncellemesi tamamlandı! Toplam güncellenen: ${totalMatched}`);
  });
}

updateExistingImagesOnly().catch(console.error);
