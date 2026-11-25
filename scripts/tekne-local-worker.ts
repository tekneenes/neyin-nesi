import pg from 'pg';
import * as cheerio from 'cheerio';
import fs from 'fs';
import os from 'os';

if (typeof (globalThis as any).File === 'undefined') {
  (globalThis as any).File = class File {};
}

const { Pool } = pg;

// 1. TEKNE YEREL VERİTABANI BAĞLANTISI
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'tekne';
const DB_PASSWORD = process.env.DB_PASSWORD || '123456';
const DB_NAME = process.env.DB_NAME || 'neyinnesi';

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  max: 5,
});

// 2. YEREL LLAMA-SERVER ENDPOINT
const LOCAL_LLAMA_URL = process.env.LOCAL_LLAMA_URL || 'http://127.0.0.1:8080/v1/chat/completions';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 3. DONANIM GÜVENLİK SENSÖRLERİ (TERMAL & RAM)
function getCpuTemperature(): number {
  try {
    if (fs.existsSync('/sys/class/hwmon')) {
      const hwmonDirs = fs.readdirSync('/sys/class/hwmon');
      for (const dir of hwmonDirs) {
        const dirPath = `/sys/class/hwmon/${dir}`;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (file.startsWith('temp') && file.endsWith('_input')) {
            const raw = fs.readFileSync(`${dirPath}/${file}`, 'utf-8').trim();
            const milliDeg = parseInt(raw, 10);
            if (!isNaN(milliDeg) && milliDeg > 0) {
              return Math.round(milliDeg / 1000);
            }
          }
        }
      }
    }
  } catch {}
  return 48;
}

function getAvailableRamMB(): number {
  if (process.platform === 'linux' && fs.existsSync('/proc/meminfo')) {
    try {
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
      const match = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/);
      if (match) {
        return Math.round(parseInt(match[1], 10) / 1024);
      }
    } catch {}
  }
  return Math.round(os.freemem() / 1024 / 1024);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function checkThermalSafety() {
  const temp = getCpuTemperature();
  const freeRam = getAvailableRamMB();

  if (temp >= 80) {
    console.warn(`\n🔥 [TERMAL FREN] CPU Sıcaklığı: ${temp}°C! Soğuyana kadar işlem duraklatılıyor...`);
    while (getCpuTemperature() > 68) {
      await sleep(8000);
      console.log(`   ⏳ Soğuma bekleniyor: ${getCpuTemperature()}°C (Hedef: <68°C)`);
    }
    console.log(`❄️ [TERMAL NORMAL] CPU sıcaklığı ${getCpuTemperature()}°C oldu. Devam ediliyor.\n`);
  } else if (temp >= 72) {
    console.log(`⚠️ [SICAKLIK DİNLENMESİ] CPU: ${temp}°C. 6 saniye fan molası veriliyor...`);
    await sleep(6000);
  }

  if (freeRam < 1000) {
    console.warn(`🧹 [RAM KORUMA] Boş RAM: ${freeRam} MB. Garbage Collection çalıştırılıyor...`);
    if (global.gc) {
      try {
        global.gc();
      } catch {}
    }
  }
}

// 4. HAFİF 30-SİTE DOM ÇEKME & SÜZME
async function searchDuckDuckGo(query: string, maxResults = 15): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encoded}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const urls: string[] = [];

    $('.result').each((_, el) => {
      if (urls.length >= maxResults) return;
      const titleEl = $(el).find('.result__title a');
      let rawHref = titleEl.attr('href') || '';
      let actualUrl = rawHref;
      if (rawHref.includes('uddg=')) {
        try {
          const match = rawHref.match(/uddg=([^&]+)/);
          if (match) actualUrl = decodeURIComponent(match[1]);
        } catch {
          actualUrl = rawHref;
        }
      }

      if (
        actualUrl.startsWith('http') &&
        !actualUrl.includes('duckduckgo.com') &&
        !actualUrl.includes('youtube.com') &&
        !actualUrl.includes('tiktok.com') &&
        !actualUrl.includes('pinterest.com')
      ) {
        urls.push(actualUrl);
      }
    });

    return urls;
  } catch {
    return [];
  }
}

async function fetchTechnicalSpecsFromPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const html = await res.text();

    const $ = cheerio.load(html);
    // Gereksizleri at (RAM koruma)
    $('script, style, noscript, svg, img, video, audio, iframe, header, footer, nav, aside, .cookie, .banner, .ads').remove();

    const specLines: string[] = [];
    const keywords = /(ram|bellek|hafıza|depolama|ssd|hdd|işlemci|cpu|gpu|ekran|çözünürlük|inç|inch|hz|pil|batarya|mah|kamera|mp|ağırlık|boyut|bağlantı|bluetooth|wifi|type-c|usb|watt|volt|android|ios|windows|panel|çekirdek|hız)/i;

    $('table tr, dl dt, dl dd, [class*="spec"] li, .tech-specs tr').each((_, el) => {
      const line = $(el).text().replace(/\s+/g, ' ').trim();
      if (line.length > 5 && line.length < 160 && keywords.test(line)) {
        specLines.push(line);
      }
    });

    const relevant = specLines.slice(0, 8).join(' | ');
    if (relevant.length < 20) return null;

    const domain = new URL(url).hostname.replace('www.', '');
    return `[${domain}]: ${relevant.slice(0, 250)}`;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

// 5. YEREL LLAMA-SERVER (QWEN 2.5 1.5B) İLE ÇAPRAZ DOĞRULAMA
async function queryAiForProductSpecs(
  fullName: string,
  brand: string,
  model: string,
  extractedSources: string[]
): Promise<any> {
  const condensedInput = extractedSources.slice(0, 8).join('\n').slice(0, 1500);

  const prompt = `Sen kıdemli donanım analistisin. Aşağıda "${fullName}" için web sitelerinden çekilen teknik tablo satırları yer almaktadır:

${condensedInput}

GÖREVLERİN:
1. Birbirini doğrulayan özellikleri "specGroups" listesine dönüştür.
2. Türkçe 2 cümlelik "identitySummary" yaz.
3. 3 güçlü yön "primaryStrengths" belirle.
4. 80-99 arası "suggestedTrustScore" ver.

SADECE ŞU JSON FORMATINDA CEVAP VER:
{
  "identitySummary": "...",
  "targetAudience": "Teknoloji meraklıları",
  "primaryStrengths": ["...", "...", "..."],
  "considerations": ["..."],
  "suggestedTrustScore": 95,
  "specGroups": [
    {
      "title": "Temel Özellikler",
      "items": [
        { "label": "İşlemci / Yonga Seti", "value": "..." },
        { "label": "Bellek (RAM)", "value": "..." }
      ]
    }
  ]
}`;

  // 1. Önce Tekne üzerindeki yerel llama-server'a istek at
  try {
    const localRes = await fetch(LOCAL_LLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Sen teknik donanım analistisin. Yalnızca geçerli JSON formatında yanıt ver.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 350,
        response_format: { type: 'json_object' },
      }),
    });

    if (localRes.ok) {
      const data = await localRes.json();
      const content = data.choices?.[0]?.message?.content || '';
      const cleanJson = content.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (localErr) {
    console.warn(`[Yerel AI Uyarısı] llama-server'a ulaşılamadı (${(localErr as any)?.message || localErr}).`);
  }

  // 2. Yedek: Gemini API varsa çağır
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      console.log(`[Yedek AI] Gemini Flash devreye giriyor...`);
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      }
    } catch (gErr) {
      console.error(`Gemini yedekleme hatası:`, gErr);
    }
  }

  return null;
}

// 6. ANA İŞÇİ DÖNGÜSÜ
async function runTekneWorker() {
  console.log(`\n==============================================================`);
  console.log(`🚀 [TEKNE 7/24 OTONOM WORKER] Başlatıldı!`);
  console.log(`📍 Veritabanı: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  console.log(`🧠 AI Modeli: Yerel Qwen 2.5 1.5B (llama-server: ${LOCAL_LLAMA_URL})`);
  console.log(`==============================================================\n`);

  let count = 0;

  while (true) {
    try {
      await checkThermalSafety();

      // Sıradaki eksik ürünü al
      const queryRes = await pool.query(`
        SELECT p.id, p.slug, p.brand, p.model, p.full_name
        FROM products p
        LEFT JOIN (
          SELECT product_id, count(*) as spec_count FROM spec_items GROUP BY product_id
        ) sc ON sc.product_id = p.id
        WHERE (p.audit_status = 'review' OR p.audit_status IS NULL)
          AND (sc.spec_count IS NULL OR sc.spec_count = 0)
          AND p.full_name IS NOT NULL AND length(trim(p.full_name)) > 3
        ORDER BY 
          CASE WHEN p.barcode IS NOT NULL AND p.barcode != '' THEN 0 ELSE 1 END,
          p.id ASC
        LIMIT 1;
      `);

      if (queryRes.rows.length === 0) {
        console.log(`ℹ️ [Kuyruk Boş] İncelenecek ürün bulunamadı. 30 saniye bekleniyor...`);
        await sleep(30000);
        continue;
      }

      const product = queryRes.rows[0];
      count++;
      console.log(`\n[#${count}] Taranıyor: "${product.full_name}" (ID: ${product.id})`);

      // 1. Arama (15 site + 15 site)
      const urls1 = await searchDuckDuckGo(`${product.full_name} teknik özellikleri`, 15);
      await sleep(1000);
      const urls2 = await searchDuckDuckGo(`${product.full_name} donanım inceleme test`, 15);
      const allUrls = Array.from(new Set([...urls1, ...urls2])).slice(0, 30);

      console.log(`   🔗 ${allUrls.length} web sitesi taranıyor...`);

      // 2. DOM'lardan teknik özellikleri çek
      const specTexts: string[] = [];
      for (const u of allUrls) {
        const text = await fetchTechnicalSpecsFromPage(u);
        if (text && text.length > 50) {
          specTexts.push(text);
        }
      }

      console.log(`   📊 ${specTexts.length} siteden teknik veri çıkarıldı. RAM boşaltılıyor...`);

      // RAM'i derhal boşalt
      if (global.gc) {
        try {
          global.gc();
        } catch {}
      }

      if (specTexts.length < 2) {
        console.warn(`   ⚠️ Yeterli veri kaynağı bulunamadı.`);
        await pool.query(
          `UPDATE products SET audit_notes = 'Web aramasında yeterli veri bulunamadı', updated_at = NOW() WHERE id = $1`,
          [product.id]
        );
        await sleep(5000);
        continue;
      }

      // 3. Yerel AI Modeli ile Doğrula ve JSON üret
      console.log(`   🧠 Yerel Qwen 1.5B ile sentezleniyor...`);
      const aiResult = await queryAiForProductSpecs(
        product.full_name,
        product.brand || '',
        product.model || product.full_name,
        specTexts
      );

      if (!aiResult || !aiResult.specGroups || aiResult.specGroups.length === 0) {
        console.warn(`   ⚠️ AI sentezi başarısız oldu.`);
        await sleep(5000);
        continue;
      }

      // 4. Veritabanına kaydet
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        for (let gIdx = 0; gIdx < aiResult.specGroups.length; gIdx++) {
          const group = aiResult.specGroups[gIdx];
          const groupId = `grp-${product.id}-${gIdx}`;
          await client.query(
            `INSERT INTO spec_groups (id, title, sort_order) VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title`,
            [groupId, group.title || 'Temel Özellikler', gIdx]
          );

          if (Array.isArray(group.items)) {
            for (let iIdx = 0; iIdx < group.items.length; iIdx++) {
              const item = group.items[iIdx];
              const itemId = `spec-${product.id}-${gIdx}-${iIdx}`;
              await client.query(
                `INSERT INTO spec_items (
                  id, product_id, spec_group_id, label, value, verification_level, verification_source, verified_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value`,
                [
                  itemId,
                  product.id,
                  groupId,
                  item.label,
                  item.value,
                  'verified_other',
                  'Yerel Qwen 1.5B Çoklu Web Doğrulaması',
                  'Bugün',
                ]
              );
            }
          }
        }

        const isAutoApproved = (aiResult.suggestedTrustScore || 90) >= 85 && specTexts.length >= 4;
        const newStatus = isAutoApproved ? 'approved' : 'review';

        await client.query(
          `UPDATE products SET
            identity_summary = COALESCE(NULLIF($1, ''), identity_summary),
            target_audience = COALESCE(NULLIF($2, ''), target_audience),
            primary_strengths = $3,
            considerations = $4,
            overall_trust_score = $5,
            data_sources_count = GREATEST(data_sources_count, $6),
            audit_status = $7,
            audit_notes = $8,
            updated_at = NOW()
          WHERE id = $9`,
          [
            aiResult.identitySummary || '',
            aiResult.targetAudience || '',
            aiResult.primaryStrengths || [],
            aiResult.considerations || [],
            aiResult.suggestedTrustScore || 92,
            specTexts.length,
            newStatus,
            `✓ 30-Site yerel Qwen 1.5B zinciri tarafından ${specTexts.length} siteden işlendi.`,
            product.id,
          ]
        );

        await client.query('COMMIT');
        console.log(`   ✅ [Tamamlandı] "${product.full_name}" -> ${newStatus.toUpperCase()}`);
      } catch (dbErr) {
        await client.query('ROLLBACK');
        console.error(`   ❌ DB Hatası:`, dbErr);
      } finally {
        client.release();
      }

      // Fan soğuma molası (6 saniye)
      await sleep(6000);
    } catch (err) {
      console.error(`Worker hatası:`, err);
      await sleep(10000);
    }
  }
}

runTekneWorker().catch(console.error);
