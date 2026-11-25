# NEYİN NESİ? — Ürün Karşılaştırma ve Keşif Platformu

> **"Anla. Karşılaştır. Karar ver."**  
> *Bir ürünün gerçekten neyin nesi olduğunu keşfet.*

---

## 📌 1. Proje Amacı ve Marka Vizyonu

**Neyin Nesi?**, internetteki ürünleri sadece listeleyen veya fiyat sıralayan sıradan bir e-ticaret/fiyat sitesi değildir.

Temel amacı: **İnsanların satın almadan önce teknolojik ve elektronik ürünleri derinlemesine anlamasına, teknik jargondan sıyrılarak tarafsız şekilde karşılaştırmasına ve doğru kararı vermesine yardımcı olmaktır.**

- **Marka Adı:** Neyin Nesi? *(Kesinlikle "Kimin Nesi?" değil)*
- **Odak Kategoriler:** Akıllı Telefonlar, Dizüstü Bilgisayarlar, Tabletler, Monitörler, Televizyonlar, Kulaklıklar, Akıllı Saatler, Kameralar, Oyun Konsolları, Ev Elektroniği ve Aksesuarlar.

---

## 🎨 2. Marka Kimliği & Tasarım İlkeleri

Platform; **modern, güven veren, sade, teknoloji odaklı ve ferah** bir his sunar. Klasik teknoloji bloglarından ve karmaşık fiyat sitelerinden tamamen ayrışır.

### Renk Paleti
| Renk Rolü | Kod / Değer | Kullanım Alanı |
| :--- | :--- | :--- |
| **Ana Renk (Turkuaz)** | `#14B8A6` | Vurgular, butonlar, seçili filtreler, güven rozetleri |
| **Koyu Zemin (Dark Mode)** | `#0B0F14` / `#111827` | Arka plan ve koyu mod yüzey kartları |
| **Açık Zemin (Light Mode)** | `#F8FAFC` / `#FFFFFF` | Ferah ve okunaklı arka plan, temiz kartlar |
| **Ana Metin** | `#111827` (Açık) / `#F1F5F9` (Koyu) | Tipografi hiyerarşisi |
| **İkincil Metin** | `#64748B` / `#94A3B8` | Açıklamalar, meta bilgiler |
| **Kenarlıklar (Border)** | `#E2E8F0` / `#1E293B` | Zarif, ince ayrımlar (8-18px radius) |

---

## 🏗️ 3. Mimari Temel Kuralı: Veri ve Tasarımın Ayrılması (Headless Data Model)

Frontend katmanı hiçbir ürün bilgisini componentler içine gömmez (hard-code etmez).
- **Teknik Özellik Kaynağı** ile **Fiyat Kaynağı** tamamen bağımsızdır.
- Bütün ürünler, özellikler, rehberler ve fiyat teklifleri normalize edilmiş API/Veri sözleşmeleri üzerinden tüketilir.
- Veri toplama motoru değiştiğinde frontend etkilenmez; frontend yenilendiğinde veri yapısı bozulmaz.

---

## 🔄 4. Veri Toplama, Doğrulama & Güvenilirlik Mimarisi (Data Pipeline)

Neyin Nesi?'nin en önemli marka değeri **Veri Doğruluğu ve Şeffaflığıdır**.

```
[Veri Kaynakları: Üreticiler / Distribütörler / Datasheets / Satıcılar]
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │        ETL & Veri Kazıma / API Motoru        │
        │ - Schema.org & JSON-LD parser                │
        │ - Teknik PDF / Datasheet çıkarıcı            │
        │ - Marketplace fiyat akışları                 │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │      Normalizasyon & Doğrulama Katmanı       │
        │ - Birim çevrimleri (mAh, nits, Hz, gram vb.) │
        │ - Model eşleştirme & Tekilleştirme           │
        │ - AI Çelişki Denetçisi (Conflict Detector)   │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │   Doğruluk Seviyesi Etiketleme & Depolama    │
        │ 🟢 Üretici  🔵 Distribütör                   │
        │ 🟡 Lisanslı Sağlayıcı  ⚪ Doğrulanmış Kaynak │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
                Frontend & API Servis Katmanı
```

### Güvenilirlik Seviyeleri (Trust Badges)
1. 🟢 **Üretici (Manufacturer):** Apple, Samsung vb. doğrudan resmi ürün teknik özellikleri.
2. 🔵 **Yetkili Distribütör:** Resmi ithalatçı ve teyitli bölgesel spesifikasyonlar.
3. 🟡 **Lisanslı Veri Sağlayıcı:** GSMArena, DisplayMate, Geekbench vb. kurumsal kıyaslama verileri.
4. ⚪ **Diğer Doğrulanmış Kaynaklar:** Bağımsız laboratuvar testleri ve teyit edilmiş incelemeler.

### Topluluk Düzeltme & Hata Bildirim Kuyruğu (`/veri-bildir`)
- Kullanıcılar ürün sayfasındaki "Hata mı buldun? Bize bildir" butonuyla hatalı veya eksik spesifikasyonları raporlayabilir.
- Bildirimler doğrudan canlı veriyi değiştirmez; yönetici ve doğrulama kuyruğuna aktarılır.

---

## 🤖 5. Yapay Zekâ (AI) Yetenekleri (Gemini Powered)

Neyin Nesi?, yapay zekâyı gösteriş için değil; **karmaşık teknik bilgiyi anlaşılır kılmak ve doğru kararı verdirmek** için kullanır:

1. **"Bu Ürünün Nesi?" — Akıllı Kimlik Özeti:**
   - Onlarca satırlık teknik tabloyu okumak istemeyenler için ürünün ruhunu özetleyen 2-3 cümlelik tarafsız özet, öne çıkan 3 güçlü yan ve satın alırken dikkat edilmesi gerekenler.
2. **AI Karşılaştırma Karar Asistanı:**
   - İki veya üç cihaz kıyaslandığında; "Kimin için hangisi daha iyi?" analizini üretir. (Örn: *“Fotoğraf ve video üretimi için A cihazı, yoğun pil ömrü ve bütçe dostu performans için B cihazı önerilir.”*)
3. **Doğal Dille Akıllı Arama & Keşif (Semantic Query Parser):**
   - *"50.000 TL altı, bataryası en az 1.5 gün giden ve 120Hz ekranlı telefon"* gibi doğal dildeki aramaları anında parametrik filtrelere dönüştürür.
4. **"Neyin Nesi?" Terim Sadeleştirici (Jargon Buster):**
   - Sayfada geçen "OLED", "LTPO", "Ray Tracing", "NPU", "IP68" gibi teknik terimlere tıklandığında, kullanıcının anlayacağı dille ne işe yaradığını açıklar.
5. **Veri Toplama ve Çelişki Denetçisi (AI Data Auditor):**
   - Farklı kaynaklardan çekilen verilerde çelişki olduğunda (örn. bir kaynakta 45W şarj, diğerinde 25W şarj) kaynakları çapraz kontrol edip teyit skorunu belirler.

---

## 🗺️ 6. Kapsamlı Geliştirme Yol Haritası (Roadmap)

```
[FAZ 1: UI & Çekirdek Deneyim] ────────► [FAZ 2: Veri Toplama Altyapısı]
             │                                        │
             ▼                                        ▼
[FAZ 3: AI Katmanı & Zekâ]    ────────► [FAZ 4: Topluluk & Fiyat Takip]
             │                                        │
             ▼                                        ▼
[FAZ 5: Ölçeklenme & SEO Motoru]
```

### 📍 Faz 1: Çekirdek UI, Veri Mimarisi ve Gezinme (Mevcut Temel)
- [x] Modern tasarım sistemi (Neyin Nesi Turkuaz, Koyu/Açık Tema, 8px spacing, kart yapısı).
- [x] Tüm ana sayfaların rotaları (`/`, `/urun/:brand/:model`, `/karsilastir`, `/kategoriler`, `/ara`, `/kesfet`, `/rehber`, `/veri-kaynaklari`, `/hakkimizda`, `/iletisim`, `/yasal`).
- [x] Karşılaştırma tepsisi (Floating comparison tray) ve yan yana teknik kıyaslama matrisi.
- [x] Doğrulama bilgi modalı (`VerificationInspectorModal`) ve Hata Bildirim modalı (`CorrectionReportModal`).
- [x] Responsive layout (Desktop, Tablet, Mobile) ve Cmd+K / Arama diyaloğu.

### 📍 Faz 2: Veri Toplama & Entegrasyon Pipeline'ı
- [ ] **Data Crawler & Scraper Motoru:**
  - Üretici resmi sayfaları için headless scraper (Puppeteer/Cheerio/Playwright).
  - Open Data & GSMArena/Notebookcheck benzeri teknik veri entegrasyon protokolü.
- [ ] **Normalizasyon & Veri Doğrulama Motoru:**
  - Değerlerin standart birimlere oturtulması (ekran boyutu inç, ağırlık gram, batarya mAh vb.).
  - Eksik veri tamamlama kuyruğu.
- [ ] **Fiyat & Satıcı Entegratörü:**
  - Fiyat sağlayıcı API'leri ve fiyat geçmişi (Price History Tracker) veri modeli.

### 📍 Faz 3: Yapay Zekâ (Gemini) Entegrasyon Katmanı
- [ ] Gemini API ile `@google/genai` entegrasyonunu canlı veriyle bağlama:
  - Gerçek zamanlı **"Bu Ürünün Nesi?"** kimlik özeti üretimi (cache'lenerek saklanır).
  - İki ürün arası **"Neyin Nesi Karar Asistanı"** karşılaştırma yorumlayıcısı.
  - Doğal dille arama sorgusu çözümleyici (Search intent extractor).
- [ ] Teknik Terim Sözlüğü ("Neyin Nesi?") için interaktif soru-cevap widget'ı.

### 📍 Faz 4: Kullanıcı Hesabı, Fiyat Uyarıları ve Doğrulama Masası
- [ ] Kullanıcı profil sistemi (Favoriler, karşılaştırma listeleri, son incelenenler).
- [ ] **Fiyat Takip & Hedef Fiyat Uyarısı:** "Bu ürün 45.000 TL altına düştüğünde bana bildir".
- [ ] **Veri Doğrulama Admin Paneli:** Kullanıcıların `/veri-bildir` üzerinden ilettiği düzeltmelerin onaylanıp veri tabanına işlendiği yönetim masası.

### 📍 Faz 5: İleri Düzey SEO, Arama Performansı ve Ölçekleme
- [ ] Temiz URL yapıları: `/urun/{marka}/{model}`, `/karsilastir/{u1}-vs-{u2}`, `/rehber/{slug}`.
- [ ] Dinamik OpenGraph, JSON-LD Product & Breadcrumb Schema üretimi.
- [ ] Hızlı arama için indeksleme (Typesense / OpenSearch uyumluluğu).
- [ ] Redis önbellekleme mimarisi ve CDN medya optimizasyonu.

---

## 💻 7. Yerel Kurulum ve Çalıştırma

```bash
# 1. Bağımlılıkları kurun
npm install

# 2. Ortam değişkenlerini ayarlayın (.env.local oluşturun)
GEMINI_API_KEY=your_gemini_api_key_here

# 3. Geliştirici sunucusunu başlatın (Port: 3000)
npm run dev
```

---

## 📄 Lisans ve Mülkiyet
© 2026 **Neyin Nesi?** — Tüm hakları saklıdır.
