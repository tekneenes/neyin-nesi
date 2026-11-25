import https from 'https';

const username = 'muhammed1258';
const appKey = 'e9eca7c7-1e7c-44fc-ad10-0b6ba7ad76cb';

async function fetchWithAppKey(brand: string, prodId: string) {
  const url = `https://live.icecat.biz/api/?UserName=${username}&app_key=${appKey}&Language=tr&Brand=${encodeURIComponent(brand)}&ProductCode=${encodeURIComponent(prodId)}`;
  console.log('Querying:', url);

  return new Promise((resolve) => {
    https.get(url, (res) => {
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
  const r1 = await fetchWithAppKey('Smeg', 'FAB28RBL5');
  console.log('Smeg with app_key status:', (r1 as any).status);
  const data = (r1 as any).json?.data;
  if (data) {
    console.log('Found product!');
    console.log('Title:', data.GeneralInfo?.Title);
    console.log('HighPic:', data.Image?.HighPic);
    console.log('Gallery:', data.Gallery?.map((g: any) => g.Pic));
  } else {
    console.log('Response:', JSON.stringify(r1, null, 2));
  }
}

run();
