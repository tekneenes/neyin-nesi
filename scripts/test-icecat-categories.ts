import https from 'https';
import zlib from 'zlib';
import readline from 'readline';

const username = 'muhammed1258';
const password = 'Mami4958';
const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

async function parseCategories() {
  console.log('CategoriesList.xml.gz indiriliyor ve Türkçe isimler taranıyor...');
  const url = 'https://data.icecat.biz/export/freexml/refs/CategoriesList.xml.gz';

  return new Promise((resolve) => {
    https.get(url, { headers: { Authorization: auth } }, (res) => {
      const gunzip = zlib.createGunzip();
      res.pipe(gunzip);
      const rl = readline.createInterface({ input: gunzip });

      const catMap = new Map<string, string>(); // CatID -> TR Name
      let currentCatId: string | null = null;
      let count = 0;

      rl.on('line', (line) => {
        if (line.includes('<Category ID="')) {
          const match = line.match(/ID="([^"]+)"/);
          currentCatId = match ? match[1] : null;
        }

        if (currentCatId && line.includes('langid="20"')) {
          const valMatch = line.match(/Value="([^"]+)"/);
          if (valMatch && valMatch[1]) {
            catMap.set(currentCatId, valMatch[1]);
            count++;
            if (count <= 10) {
              console.log(`Cat ID ${currentCatId} -> ${valMatch[1]}`);
            }
          }
        }
      });

      rl.on('close', () => {
        console.log(`✓ Toplam Türkçe Kategori Sayısı: ${catMap.size}`);
        resolve(catMap);
      });
    });
  });
}

parseCategories();
