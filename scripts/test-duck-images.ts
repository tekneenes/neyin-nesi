import https from 'https';

async function searchDuckDuckGoImage(query: string): Promise<string | null> {
  return new Promise((resolve) => {
    // 1. Token al
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    https.get(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const vqdMatch = body.match(/vqd=['"]?([^'"&]+)/);
        if (!vqdMatch) {
          return resolve(null);
        }
        const vqd = vqdMatch[1];
        
        // 2. Resim JSON ara
        const apiUrl = `https://duckduckgo.com/i.js?l=tr-tr&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,type__transparent;&p=1`;
        https.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://duckduckgo.com/'
          }
        }, (apiRes) => {
          let apiBody = '';
          apiRes.on('data', c => apiBody += c);
          apiRes.on('end', () => {
            try {
              const data = JSON.parse(apiBody);
              if (data.results && data.results.length > 0) {
                resolve(data.results[0].image);
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          });
        }).on('error', () => resolve(null));
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log('Testing image search for Smeg FAB28RBL5:');
  const img1 = await searchDuckDuckGoImage('Smeg FAB28RBL5 buzdolabı beyaz fon');
  console.log('Smeg img:', img1);

  console.log('Testing image search for Liebherr CNef 4815:');
  const img2 = await searchDuckDuckGoImage('Liebherr CNef 4815 buzdolabı');
  console.log('Liebherr img:', img2);
}

run();
