import https from 'https';
import zlib from 'zlib';
import readline from 'readline';

const username = 'muhammed1258';
const password = 'Mami4958';
const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

async function test() {
  const req = https.get('https://data.icecat.biz/export/freexml/files.index.xml.gz', {
    headers: { Authorization: auth }
  }, (res) => {
    const gunzip = zlib.createGunzip();
    res.pipe(gunzip);
    const rl = readline.createInterface({ input: gunzip });

    let count = 0;
    let withPic = 0;
    let categories = new Map<string, number>();

    rl.on('line', (line) => {
      if (line.includes('<file ')) {
        count++;
        const picMatch = line.match(/HighPic="([^"]+)"/);
        const catMatch = line.match(/Catid="([^"]+)"/);
        const modelMatch = line.match(/Model_Name="([^"]+)"/);
        
        if (picMatch && picMatch[1].startsWith('http')) {
          withPic++;
          if (withPic <= 5) {
            console.log(`[Örnek ${withPic}] Cat:${catMatch?.[1]} Model:${modelMatch?.[1]} => ${picMatch[1]}`);
          }
        }

        if (count >= 10000) {
          rl.close();
          req.destroy();
          console.log(`\nİlk 10.000 Icecat kaydında fotoğraflı ürün sayısı: ${withPic}`);
        }
      }
    });
  });
}

test();
