import https from 'https';
import zlib from 'zlib';
import readline from 'readline';
import { pool } from '../src/server/db/postgres';

async function syncIcecatImages() {
  console.log('====================================================');
  console.log('   ICECAT CANLI ÜRÜN GÖRSELLERİ SENKRONİZASYON MOTORU ');
  console.log('====================================================\n');

  const username = process.env.ICECAT_USERNAME || 'muhammed1258';
  const password = process.env.ICECAT_PASSWORD || 'Mami4958';
  const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  const streamUrl = 'https://data.icecat.biz/export/freexml/daily.index.xml.gz';

  console.log(`[1/3] Icecat akışına bağlanılıyor: ${streamUrl}`);

  const req = https.get(
    streamUrl,
    {
      headers: {
        Authorization: authHeader,
        'User-Agent': 'NeyinNesi-SyncEngine/1.0',
      },
    },
    async (res) => {
      if (res.statusCode !== 200) {
        console.error(`HTTP Hatası: ${res.statusCode} ${res.statusMessage}`);
        return;
      }

      console.log('✓ Akış başladı. XML ayrıştırılıyor ve yüksek kaliteli görseller taranıyor...');

      const gunzip = zlib.createGunzip();
      res.pipe(gunzip);

      const rl = readline.createInterface({
        input: gunzip,
        crlfDelay: Infinity,
      });

      const imageBatch: { productId?: string; eans: string[]; highPic: string; modelName?: string }[] = [];
      let totalParsed = 0;
      let matchedCount = 0;
      const startTime = Date.now();

      const processBatch = async (batch: typeof imageBatch) => {
        if (batch.length === 0) return;
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          for (const item of batch) {
            // Barkod veya ID ile eşleştir
            if (item.productId) {
              const res1 = await client.query(
                `UPDATE products SET hero_image = $1 WHERE id = $2 OR id = $3`,
                [item.highPic, `prod-icecat-${item.productId}`, item.productId]
              );
              matchedCount += res1.rowCount || 0;
            }
            if (item.eans.length > 0) {
              const res2 = await client.query(
                `UPDATE products SET hero_image = $1 WHERE barcode = ANY($2)`,
                [item.highPic, item.eans]
              );
              matchedCount += res2.rowCount || 0;
            }
          }
          await client.query('COMMIT');
        } catch (e: any) {
          await client.query('ROLLBACK');
          console.error('Batch update hatası:', e.message);
        } finally {
          client.release();
        }
      };

      let currentFile: { productId?: string; highPic?: string; modelName?: string; eans: string[] } | null = null;

      for await (const line of rl) {
        const trimmed = line.trim();

        if (trimmed.startsWith('<file ') || trimmed.includes('<file ')) {
          const highPicMatch = trimmed.match(/HighPic="([^"]+)"/);
          const prodIdMatch = trimmed.match(/Product_ID="([^"]+)"/);
          const modelMatch = trimmed.match(/Model_Name="([^"]+)"/);

          if (highPicMatch && highPicMatch[1] && highPicMatch[1].startsWith('http')) {
            currentFile = {
              productId: prodIdMatch ? prodIdMatch[1] : undefined,
              highPic: highPicMatch[1],
              modelName: modelMatch ? modelMatch[1] : undefined,
              eans: [],
            };
          } else {
            currentFile = null;
          }
        }

        if (currentFile && trimmed.includes('<EAN_UPC ')) {
          const valMatch = trimmed.match(/Value="([^"]+)"/);
          if (valMatch && valMatch[1]) {
            currentFile.eans.push(valMatch[1]);
          }
        }

        if (currentFile && (trimmed.endsWith('</file>') || trimmed.includes('</file>'))) {
          imageBatch.push({
            productId: currentFile.productId,
            highPic: currentFile.highPic!,
            modelName: currentFile.modelName,
            eans: currentFile.eans,
          });
          totalParsed++;
          currentFile = null;

          if (imageBatch.length >= 200) {
            await processBatch([...imageBatch]);
            imageBatch.length = 0;
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`  -> ${totalParsed} Icecat ürünü tarandı | Eşleşen & Güncellenen: ${matchedCount} (${elapsed} sn)`);
          }
        }
      }

      if (imageBatch.length > 0) {
        await processBatch(imageBatch);
      }

      console.log('\n====================================================');
      console.log('🎉 ICECAT GERÇEK GÖRSELLERİ EŞLEŞTİRME TAMAMLANDI!');
      console.log(`- Toplam Taranan Icecat Resmi: ${totalParsed}`);
      console.log(`- Veritabanında Güncellenen Gerçek Ürün Fotoğrafı: ${matchedCount}`);
      console.log('====================================================\n');
      await pool.end();
    }
  );

  req.on('error', (err) => {
    console.error('Bağlantı Hatası:', err);
  });
}

syncIcecatImages();
