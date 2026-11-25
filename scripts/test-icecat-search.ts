import https from 'https';

const username = process.env.ICECAT_USERNAME || 'muhammed1258';
const password = process.env.ICECAT_PASSWORD || 'Mami4958';
const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

// Test 1: Icecat REST API for product search by brand & product code / model
async function searchIcecat(brand: string, prodId: string) {
  // https://live.icecat.biz/api/?shopname=...&lang=tr&prod_id=...&vendor=...
  const url = `https://live.icecat.biz/api/?UserName=${username}&Language=tr&Brand=${encodeURIComponent(brand)}&ProductCode=${encodeURIComponent(prodId)}`;
  console.log('Querying:', url);

  return new Promise((resolve) => {
    https.get(url, { headers: { Authorization: auth } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, json });
        } catch {
          resolve({ status: res.statusCode, raw: data.slice(0, 300) });
        }
      });
    }).on('error', err => resolve({ error: err.message }));
  });
}

async function run() {
  const r1 = await searchIcecat('Smeg', 'FAB28RBL5');
  console.log('Smeg result:', JSON.stringify(r1, null, 2));

  const r2 = await searchIcecat('Liebherr', 'CNef 4815');
  console.log('Liebherr result:', JSON.stringify(r2, null, 2));
}

run();
