import dotenv from 'dotenv';
import { ingestFromUrl } from '../src/server/scraper/pipeline';
import { autoDiscoverProduct } from '../src/server/scraper/autonomous/autoDiscover';

// Load .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  let targetUrl = '';
  let searchQuery = '';

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      targetUrl = arg.replace('--url=', '');
    } else if (arg.startsWith('--newsroom=')) {
      targetUrl = arg.replace('--newsroom=', '');
    } else if (arg.startsWith('--github=')) {
      targetUrl = arg.replace('--github=', '');
    } else if (arg.startsWith('--search=') || arg.startsWith('--query=')) {
      searchQuery = arg.replace(/^--(?:search|query)=/, '');
    }
  }

  // If no arguments provided, display help and run demo search
  if (!targetUrl && !searchQuery) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║    NEYİN NESİ? — Otonom Çok Kaynaklı Ürün Keşif & Kazıma       ║
╚════════════════════════════════════════════════════════════════╝

Kullanım:
  # 1. OTONOM ARAMA (İnterneti tarar, birden çok kaynaktan veriyi okur ve birleştirir):
  npx tsx scripts/run-scraper.ts --search="<ÜRÜN_VEYA_PROJE_ADI>"

  # 2. RESMİ BASIN ODASI (NEWSROOM / PRESS KIT):
  npx tsx scripts/run-scraper.ts --newsroom="<APPLE/SAMSUNG/SONY_NEWSROOM_URL>"

  # 3. TEKİL URL İLE AKTARMA:
  npx tsx scripts/run-scraper.ts --url="<HEDEF_WEB_SAYFASI_URL>"

  # 4. GITHUB AÇIK KAYNAK DONANIM / ROBOTİK REPOSU:
  npx tsx scripts/run-scraper.ts --github="<GITHUB_REPO_URL>"

Örnekler:
  npx tsx scripts/run-scraper.ts --newsroom="https://www.apple.com/newsroom/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/"
  npx tsx scripts/run-scraper.ts --search="Sony WH-1000XM5"
  npx tsx scripts/run-scraper.ts --search="Galaxy S25 Ultra"
`);
    searchQuery = 'Sony WH-1000XM5';
    console.log(`[Demo Modu] Örnek otonom çok kaynaklı arama başlatılıyor: "${searchQuery}"\n`);
  }

  if (searchQuery) {
    // 1. Autonomous Multi-Source Discovery
    const result = await autoDiscoverProduct(searchQuery);

    if (result.success && result.product) {
      printSuccessReport(result.product, result.sourcesSearched);
    } else {
      console.error(`❌ Hata: ${result.error}`);
      process.exit(1);
    }
  } else if (targetUrl) {
    // 2. Direct Single URL Ingestion
    console.log(`Tarama başlatılıyor: ${targetUrl}`);
    const result = await ingestFromUrl(targetUrl);

    if (result.success && result.product) {
      printSuccessReport(result.product, [targetUrl]);
    } else {
      console.error(`❌ Hata: ${result.error}`);
      process.exit(1);
    }
  }
}

function printSuccessReport(product: any, sourcesSearched?: string[]) {
  console.log(`
════════════════════════════════════════════════════════════════
✅ BAŞARIYLA İÇE AKTARILDI & SENTEZLENDİ!
════════════════════════════════════════════════════════════════
Ürün Adı: ${product.fullName}
Marka: ${product.brand}
Kategori: ${product.categoryName}
Slug: /urun/${product.categorySlug}/${product.slug}
Doğruluk Skoru: %${product.overallTrustScore} (${product.dataSourcesCount} bağımsız kaynaktan doğrulandı)
Özellik Grubu Sayısı: ${product.specGroups.length}
Toplam Çıkarılan Özellik: ${product.specGroups.reduce((acc: number, g: any) => acc + g.items.length, 0)}

🔍 "Bu Ürünün Nesi?" Özeti:
${product.identitySummary}

⭐ Güçlü Yönler:
${product.primaryStrengths.map((s: string) => `  • ${s}`).join('\n')}

Taranan ve Birleştirilen Kaynaklar:
${(sourcesSearched || []).map((s: string) => `  🔗 ${s}`).join('\n')}

Veri kaydedildi: src/data/scrapedProducts.json
════════════════════════════════════════════════════════════════
`);
}

main().catch(console.error);
