import fs from 'fs';
import path from 'path';

const CATEGORIES = [
  { name: 'Telefon & Aksesuar', brands: ['Apple', 'Samsung', 'Xiaomi', 'Anker', 'Spigen'] },
  { name: 'Bilgisayar & Donanım', brands: ['Apple', 'Asus', 'Lenovo', 'Dell', 'Logitech', 'Razer'] },
  { name: 'TV & Ses Sistemleri', brands: ['Sony', 'Samsung', 'LG', 'JBL', 'Sennheiser', 'Marshall'] },
  { name: 'Evcil Hayvan & Mama', brands: ['Royal Canin', 'Pro Plan', 'N&D', 'Acana', 'Ever Clean'] },
  { name: 'Hediye Kartı & Kod', brands: ['Apple', 'Steam', 'PlayStation', 'Xbox', 'Google Play'] },
  { name: 'Kamp & Outdoor', brands: ['Naturehike', 'Stanley', 'Coleman', 'Quechua', 'The North Face'] },
  { name: 'Market & Kahve', brands: ['Tchibo', 'Lavazza', 'Komili', 'Yudum', 'Illy', 'Nescafe'] },
];

const ADJECTIVES = ['Pro', 'Max', 'Ultra', 'Plus', 'Premium', 'Eco', 'Special Edition', 'Elite'];

function generateSampleXml(count: number = 350): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<products>\n`;

  for (let i = 1; i <= count; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const brand = cat.brands[i % cat.brands.length];
    const adj = ADJECTIVES[i % ADJECTIVES.length];
    const price = Math.floor(Math.random() * 45000) + 99;
    const barcode = `869${String(1000000000 + i).padStart(10, '0')}`;
    const title = `${brand} ${adj} Model ${100 + (i % 900)} (${cat.name})`;

    xml += `  <product>
    <id>P-${i}</id>
    <name>${title}</name>
    <description>${brand} marka yüksek kaliteli ${cat.name} ürünü. 2 Yıl distribütör garantili ve orijinal ambalajında.</description>
    <price>${price} TL</price>
    <brand>${brand}</brand>
    <barcode>${barcode}</barcode>
    <category>${cat.name}</category>
    <image>https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&amp;fit=crop&amp;w=800&amp;q=80</image>
    <url>https://ornekpazaryeri.com/urun/${i}</url>
    <seller>Yetkili E-Ticaret Dağıtıcısı</seller>
  </product>\n`;
  }

  xml += `</products>\n`;
  return xml;
}

const targetDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const filePath = path.join(targetDir, 'sample-merchant-feed.xml');
fs.writeFileSync(filePath, generateSampleXml(350), 'utf-8');
console.log(`[BAŞARILI] 350 ürünlük gerçek e-ticaret XML dosyası oluşturuldu: ${filePath}`);
