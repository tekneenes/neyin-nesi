# Global ve Türkiye Telefon & Mobil Teknoloji Veri Kaynakları Rehberi (Cilt 2)

Bu rehber, **Neyin Nesi Platformu**'nun akıllı telefonlar (iPhone, Samsung Galaxy, Xiaomi, Google Pixel, OnePlus vb.), tabletler, akıllı saatler ve giyilebilir teknolojiler kategorisinde **Epey.com ve Akakçe seviyesine ulaşması** için hazırlanmış; **global donanım şartname veri tabanları** ile **Türkiye canlı fiyat/stok akışlarını** bir araya getiren ikinci büyük kaynak kılavuzudur.

---

## 1. Epey.com Tarzı Telefon Mimarisi: 2 Katmanlı Hibrit Model

Epey.com'da bir telefon sayfası (örneğin *iPhone 16 Pro* veya *Samsung Galaxy S24 Ultra*) incelendiğinde arkada iki bağımsız katmanın birleştiği görülür:

```
[KATMAN 1: GLOBAL DONANIM ŞARTNAMESİ]       [KATMAN 2: TÜRKİYE CANLI MAĞAZA TEKLİFLERİ]
(GSMArena, Open Icecat, Üretici API)         (İtopya, Bizdehesaplı, EasyCep, Vatan, Hepsiburada...)
 - 120Hz LTPO OLED Ekran, 3000 nits            - Mağaza 1: 54.999 TL (Stokta)
 - 48 MP Sony IMX Sensör, Periskop Zoom        - Mağaza 2: 57.250 TL (Stokta)
 - Apple A18 Pro / Snapdragon 8 Elite          - Mağaza 3: 59.999 TL
 - 5000 mAh Batarya, 45W Şarj                  - Fiyat Geçmişi & İndirim Alarmları
                   │                                         │
                   └──────────────────┬──────────────────────┘
                                      ▼
                  [NEYİN NESİ - MASTER TELEFON KARTI]
                     🏆 En Ucuz Satıcı + Güven Skoru
                     📊 TradingView Tarzı 90 Günlük Fiyat
                     📋 150+ Doğrulanmış Donanım Özelliği
```

---

## 2. Global Telefon Şartname & Donanım Veri Tabanları (Doğrulanmış Kaynaklar)

Akıllı telefonların tüm teknik detaylarını (kamera sensör boyutu, batarya mAh, ekran ppi, yonga seti, bağlantı bantları) sıfırdan elle girmek imkansızdır. Aşağıdaki kaynaklar dünyadaki tüm telefon modellerinin resmi teknik föylerini yapılandırılmış JSON formatında sunar:

### Kaynak 1: GSMArena Open Device Specs Dataset (Bytecharts)
* **Kapsam:** Dünyadaki tüm büyük akıllı telefon markalarının (Apple, Samsung, Xiaomi, Google, OnePlus, Vivo, Oppo, Motorola, Sony, Nothing vb.) **150+ parametrelik eksiksiz teknik föyü**.
* **Erişim Türü:** Doğrudan GitHub CDN üzerinden ücretsiz ve açık JSON dosyaları.
* **Depo Adresi:** `https://github.com/bytecharts/device_specs_gsmarena`
* **JSON Uç Noktaları:**
  * **Apple (Tüm iPhone modelleri):** `https://raw.githubusercontent.com/bytecharts/device_specs_gsmarena/main/apple-phones-48/{MODEL}/details.json`
  * **Samsung (Galaxy S, Z Fold, A serisi):** `https://raw.githubusercontent.com/bytecharts/device_specs_gsmarena/main/samsung-phones-9/{MODEL}/details.json`
  * **Xiaomi (Xiaomi, Redmi, POCO):** `https://raw.githubusercontent.com/bytecharts/device_specs_gsmarena/main/xiaomi-phones-80/{MODEL}/details.json`
  * **Google Pixel:** `https://raw.githubusercontent.com/bytecharts/device_specs_gsmarena/main/google-phones-107/{MODEL}/details.json`
  * **OnePlus:** `https://raw.githubusercontent.com/bytecharts/device_specs_gsmarena/main/oneplus-phones-95/{MODEL}/details.json`
* **İçerdiği Donanım Alanları:**
  * Ekran: Panel türü, boyut, çözünürlük, yenileme hızı (Hz), parlaklık (nits), koruma camı (Gorilla Glass Victus / Ceramic Shield).
  * Kamera: Ana kamera sensör boyutu, diyafram (f/1.6 vb.), OIS, optik zoom, ultra geniş açı, ön kamera, 4K/8K video yetenekleri.
  * İşlemci & Performans: Chipset (Apple A-serisi, Qualcomm Snapdragon, MediaTek Dimensity), CPU çekirdek frekansları, GPU modeli.
  * Batarya & Şarj: Pil kapasitesi (mAh), kablolu şarj gücü (W), kablosuz şarj desteği, ters kablosuz şarj.
  * Tasarım: Kasa materyali (Titanyum, Alüminyum, Cam), su/toz koruma sertifikası (IP68/IP65), ağırlık (gram).

---

### Kaynak 2: Open Icecat Global Enterprise XML/JSON Kataloğu
* **Kapsam:** Dünyadaki yetkili üreticilerin (Apple, Samsung, HP, Lenovo, Philips, Sony) doğrudan sağladığı **15.000.000+ ürün föyü**.
* **Erişim Türü:** Icecat Open Catalog REST API & XML (Ücretsiz Open Icecat aboneliğiyle tam açık).
* **Doğrudan Sorgu:**
  ```bash
  https://data.icecat.biz/xml_s3/xml_server3.cgi?prod_id={MODEL_KODU};vendor={MARKA};lang=tr;output=productxml
  ```
* **Avantajı:** Türkçe teknik terimler, resmi pazarlama açıklamaları, orijinal üretici yüksek çözünürlüklü galeri fotoğrafları ve EAN-13 barkodları içerir.

---

### Kaynak 3: HuggingFace & Kaggle Global E-Commerce & Phone Datasets
* **Kapsam:** Dünyanın önde gelen e-ticaret sitelerinden (Amazon Global, Flipkart, BestBuy) toplanmış, temizlenmiş 50.000+ telefon ve tablet veri seti.
* **Erişim:**
  * `HuggingFace Datasets: e-commerce-smartphones-specifications`
  * `Flipkart Mobile Dataset: 20,000+ Verified Phones with RAM, ROM, Camera & Battery`
* **Format:** Parquet / JSON / CSV.

---

## 3. Türkiye Telefon Canlı Fiyat, Stok ve Mağaza Kaynakları (Doğrulanmış)

Yukarıdaki teknik şartnameler platformumuza aktarıldıktan sonra, bu modellerin **Türkiye'deki güncel TL fiyatları ve stok teklifleri** aşağıdaki doğrulanmış mağaza akışlarından çekilir:

| No | Mağaza / Sağlayıcı | Kapsam | Canlı URL / Feed | Tip & Özellik |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **EasyCep** | Tüm iPhone, Samsung, Xiaomi, Huawei | `https://easycep.com/products-sitemap1.xml` | **20.339 Gerçek Telefon Linki** |
| 2 | **Bizdehesaplı** | Sıfır Telefon, Tablet, Ağ Cihazı | `https://www.bizdehesapli.com/sitemap.xml` | **2.108 Ürün (CDATA + GTIN Barkod)** |
| 3 | **Getmobil** | Lisanslı Yenilenmiş Telefon & Tablet | `https://getmobil.com/sitemap.xml` | 5 Alt XML Ürün Akışı |
| 4 | **MobilCadde** | Şarj Aletleri, Powerbank, MagSafe | `https://www.mobilcadde.com/sitemap.xml` | 11 Alt XML, 5.000+ Aksesuar |
| 5 | **Spigen Türkiye** | Orijinal GaN Şarj Cihazları, Kılıf | `https://www.spigen.com.tr/sitemap.xml` | 28 Alt XML, Premium Donanım |
| 6 | **Senatech (Destek Bilişim)**| TSE Onaylı Yenilenmiş Telefon | `https://senatech.com/sitemap.xml` | Canlı Stok & Fiyat Beslemesi |
| 7 | **İtopya (XML 4 & 0)** | Hazır Laptop, Çevre Birimleri | `https://www.itopya.com/xml/itopya_products_4.xml` | 900+ Laptop & Monitör |
| 8 | **Xiaomi Türkiye (Mi.com)** | Xiaomi, Redmi, POCO Serisi | `https://www.mi.com/tr/sitemap.xml` | Resmi Türkiye Kataloğu & Fiyatlar |
| 9 | **Samsung Türkiye** | Galaxy S, Z, A, M Serisi & Saat | `https://www.samsung.com/tr/sitemap.xml` | Resmi Distribütör Garantili Modeller |
| 10 | **Vatan Bilgisayar** | Akıllı Telefon & Tablet Kategorisi | `https://www.vatanbilgisayar.com/sitemap.xml` | Geniş Perakende Ağı |

---

## 4. Standart Türkiye Merchant XML Besleme Formatları (B2B / Pazaryeri)

Türkiye'deki 10.000'den fazla e-ticaret sitesi (Ticimax, İdeasoft, T-Soft, Shopify ve WooCommerce altyapılı mağazalar) Akakçe, Cimri ve Google Alışveriş için otomatik XML çıktıları üretir. Platformumuz bu formatları doğrudan okuyabilmektedir:

### Format A: Akakçe Standart Ürün Beslemesi (`akakce.xml`)
```xml
<?xml version="1.0" encoding="utf-8"?>
<urunler>
  <urun>
    <id>IPHONE-16-PRO-128</id>
    <ad><![CDATA[Apple iPhone 16 Pro 128GB Çöl Titanyum]]></ad>
    <marka>Apple</marka>
    <fiyat>79999.00</fiyat>
    <para_birimi>TL</para_birimi>
    <stok>1</stok>
    <barkod>0195949782145</barkod>
    <kategori><![CDATA[Telefon > Akıllı Telefon]]></kategori>
    <resim>https://site.com/images/iphone-16-pro.jpg</resim>
    <url>https://site.com/apple-iphone-16-pro-128gb</url>
  </urun>
</urunler>
```

### Format B: Google Merchant / Cimri Standart Beslemesi (`google-shopping.xml`)
```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>SAM-S24U-256</g:id>
      <g:title>Samsung Galaxy S24 Ultra 256GB Titanyum Gri</g:title>
      <g:brand>Samsung</g:brand>
      <g:price>64999.00 TRY</g:price>
      <g:availability>in stock</g:availability>
      <g:gtin>8806095312345</g:gtin>
      <g:image_link>https://site.com/s24-ultra.jpg</g:image_link>
      <g:link>https://site.com/samsung-galaxy-s24-ultra-256gb</g:link>
    </item>
  </channel>
</rss>
```

---

## 5. Telefon Kategorisi İçin Neyin Nesi Donanım ve Puanlama Mimarisi

Telefonlar sisteme eklenirken `specGroups` aşağıdaki 6 ana başlıkta yapılandırılır:

1. **Ekran & Panel:**
   * Boyut (inç), Çözünürlük (Piksel), Panel Türü (OLED / AMOLED / IPS), Yenileme Hızı (120Hz / 60Hz), Tepe Parlaklık (nits).
2. **Kamera & Video:**
   * Ana Kamera (MP), Diyafram Açıklığı, Sensör Boyutu, OIS (Optik Görüntü Sabitleme), Telefoto Optik Zoom (3x, 5x), Ön Kamera (MP), 4K/8K Video.
3. **Performans & Donanım:**
   * Yonga Seti (Chipset), CPU Çekirdek Sayısı ve Frekansı, RAM Bellek (GB), Dahili Hafıza (GB/TB), UFS Standardı (UFS 4.0 / 3.1).
4. **Batarya & Hızlı Şarj:**
   * Pil Kapasitesi (mAh), Kablolu Şarj Gücü (Watt), Kablosuz Şarj (Watt), Şarj Süresi (Dakika).
5. **Gövde, Materyal & Dayanıklılık:**
   * Çerçeve Materyali (Titanyum / Alüminyum), Su ve Toz Direnci (IP68), Ağırlık (Gram), Kalınlık (mm).
6. **Yazılım & Ekosistem:**
   * İşletim Sistemi (iOS / Android), Güncelleme Garantisi Süresi, Yapay Zeka Özellikleri (Apple Intelligence, Galaxy AI).

---

## 6. Özet Eylem Planı (Action Plan)

1. **Aşama 1 (Donanım Kütüphanesini Aktarmak):**
   * `bytecharts/device_specs_gsmarena` deposundan en popüler 200 akıllı telefonun (iPhone 11-16 serisi, Samsung Galaxy S20-S25 serisi, Xiaomi 13-15 serisi) 150+ alanlık eksiksiz teknik şartnamesini platformun PostgreSQL veritabanına aktarmak.
2. **Aşama 2 (Canlı Fiyat Eşleştirmesi):**
   * EasyCep, Bizdehesaplı ve İtopya üzerinden bu modellerin canlı TL mağaza fiyatlarını barkod (EAN/GTIN) ve donanım imzası ile eşleştirmek.
3. **Aşama 3 (Kategori Filtrelerine Bağlamak):**
   * Kategori sayfasında "Telefonlar" sekmesini açarak RAM (8GB, 12GB), Dahili Hafıza (128GB, 256GB), Ekran Hz, Kamera MP ve Batarya mAh filtrelerini canlı hale getirmek.
