import https from 'https';
import zlib from 'zlib';
import readline from 'readline';

const username = 'muhammed1258';
const password = 'Mami4958';
const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

async function getTopBrands() {
  const url = 'https://data.icecat.biz/export/freexml/refs/SuppliersList.xml.gz';
  return new Promise<Map<string, string>>((resolve) => {
    https.get(url, { headers: { Authorization: auth } }, (res) => {
      const gunzip = zlib.createGunzip();
      res.pipe(gunzip);
      const rl = readline.createInterface({ input: gunzip });
      const suppliers = new Map<string, string>(); // ID -> Name

      rl.on('line', (line) => {
        if (line.includes('<Supplier ID="')) {
          const idMatch = line.match(/ID="([^"]+)"/);
          const nameMatch = line.match(/Name="([^"]+)"/);
          if (idMatch && nameMatch) {
            suppliers.set(idMatch[1], nameMatch[1]);
          }
        }
      });

      rl.on('close', () => {
        console.log(`Toplam Tanınan Resmi Marka/Tedarikçi Sayısı: ${suppliers.size}`);
        resolve(suppliers);
      });
    });
  });
}

getTopBrands();
