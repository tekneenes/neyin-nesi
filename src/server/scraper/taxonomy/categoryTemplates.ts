import { GoogleGenAI } from '@google/genai';

export interface TemplateSpecField {
  label: string;
  type: 'boolean' | 'string' | 'number';
  unit?: string;
  isKeyHighlight?: boolean;
}

export interface TemplateSpecGroup {
  groupTitle: string;
  fields: TemplateSpecField[];
}

export interface CategoryTemplate {
  categorySlug: string;
  categoryName: string;
  keyHighlightKeys: string[];
  groups: TemplateSpecGroup[];
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. ALTIN ŞABLONLAR (GOLD STANDARD TEMPLATES) — En Popüler Kategoriler
// ══════════════════════════════════════════════════════════════════════════════

export const GOLD_TEMPLATES: Record<string, CategoryTemplate> = {
  // ─── KULAKLIKLAR (Epey Standardı 45 Parametre) ───
  kulakliklar: {
    categorySlug: 'kulakliklar',
    categoryName: 'Kulaklıklar',
    keyHighlightKeys: [
      'Ses Çıkışı',
      'Bağlantı Tipi',
      'Bluetooth',
      'Bluetooth Standardı',
      'Hassasiyet',
      'Empedans',
      'Mikrofon',
      'Kumanda',
      'Sürücü Çapı',
      'Kullanım Süresi (Genel)',
      'Gürültü Engelleme (ANC)',
    ],
    groups: [
      {
        groupTitle: 'Genel Bilgiler',
        fields: [
          { label: 'Kulaklık Tipi', type: 'string' },
          { label: 'Kullanım Amacı', type: 'string' },
          { label: 'Kullanım Alanı', type: 'string' },
          { label: 'Uyumluluk', type: 'string' },
          { label: 'Sesli Asistan Desteği', type: 'boolean' },
          { label: 'Sesli Asistan Özelliği', type: 'string' },
          { label: 'Sensör', type: 'string' },
          { label: 'Öne Çıkan Özellikler', type: 'string' },
        ],
      },
      {
        groupTitle: 'Ses Özellikleri',
        fields: [
          { label: 'Ses Çıkışı', type: 'string', isKeyHighlight: true },
          { label: 'Çevresel Ses', type: 'boolean' },
          { label: 'Çevresel Ses Özelliği', type: 'string' },
          { label: 'Gürültü Engelleme (ANC)', type: 'boolean', isKeyHighlight: true },
          { label: 'Yüksek Çözünürlüklü Ses (Hi-Res)', type: 'boolean' },
          { label: 'Hi-Res Özelliği', type: 'string' },
          { label: 'Örnekleme Derinliği', type: 'string', unit: 'bit' },
          { label: 'Örnekleme Frekansı', type: 'string', unit: 'kHz' },
          { label: 'Hassasiyet', type: 'number', unit: 'dB', isKeyHighlight: true },
          { label: 'Düşük Frekans (Bas)', type: 'number', unit: 'Hz' },
          { label: 'Yüksek Frekans (Tiz)', type: 'number', unit: 'kHz' },
          { label: 'Empedans', type: 'number', unit: 'Ohm', isKeyHighlight: true },
          { label: 'Sürücü Çapı', type: 'number', unit: 'mm', isKeyHighlight: true },
          { label: 'Sürücü Özellikleri', type: 'string' },
          { label: 'Mikrofon', type: 'boolean', isKeyHighlight: true },
          { label: 'Mikrofon Özelliği', type: 'string' },
          { label: 'Konuşma Gürültü Engelleme (ENC)', type: 'boolean' },
          { label: 'Mikrofon Sayısı', type: 'string' },
        ],
      },
      {
        groupTitle: 'Bağlantı Özellikleri',
        fields: [
          { label: 'Bağlantı Tipi', type: 'string', isKeyHighlight: true },
          { label: 'Bluetooth', type: 'boolean', isKeyHighlight: true },
          { label: 'Bluetooth Yonga Seti', type: 'string' },
          { label: 'Bluetooth Standardı', type: 'string', isKeyHighlight: true },
          { label: 'Bluetooth Profili', type: 'string' },
          { label: 'Bluetooth Özellikleri (Kodekler)', type: 'string' },
          { label: 'Çoklu Bağlantı (Multipoint)', type: 'boolean' },
          { label: 'Kablolu Kullanabilme', type: 'boolean' },
          { label: 'Kullanım Mesafesi', type: 'number', unit: 'm' },
        ],
      },
      {
        groupTitle: 'Şarj ve Batarya Özellikleri',
        fields: [
          { label: 'Kullanım Süresi (Genel)', type: 'number', unit: 'saat', isKeyHighlight: true },
          { label: 'Kullanım Süresi (Yoğun/ANC Açık)', type: 'number', unit: 'saat' },
          { label: 'Şarj Tipi', type: 'string' },
          { label: 'Şarj Süresi', type: 'number', unit: 'dk' },
          { label: 'Hızlı Şarj', type: 'boolean' },
          { label: 'Hızlı Şarj Süresi', type: 'string' },
          { label: 'Hızlı Şarj Kullanım Süresi', type: 'string' },
          { label: 'Kablosuz Şarj', type: 'boolean' },
        ],
      },
      {
        groupTitle: 'Fiziksel Özellikler',
        fields: [
          { label: 'Akustik Yapı', type: 'string' },
          { label: 'Ağırlık', type: 'number', unit: 'g' },
          { label: 'Toza Dayanıklılık', type: 'boolean' },
          { label: 'Suya Dayanıklılık', type: 'boolean' },
          { label: 'Kumanda', type: 'boolean', isKeyHighlight: true },
          { label: 'Kumanda İşlevi', type: 'string' },
          { label: 'Renk Seçenekleri', type: 'string' },
        ],
      },
    ],
  },

  // ─── TELEFONLAR (Epey Standardı 50 Parametre) ───
  telefonlar: {
    categorySlug: 'telefonlar',
    categoryName: 'Telefonlar',
    keyHighlightKeys: [
      'Ekran Boyutu',
      'Ekran Yenileme Hızı',
      'Yonga Seti (İşlemci)',
      'Bellek (RAM)',
      'Dahili Depolama',
      'Batarya Kapasitesi',
      'Hızlı Şarj Gücü',
      'Ana Kamera Çözünürlüğü',
      '5G Desteği',
      'Suya Dayanıklılık',
    ],
    groups: [
      {
        groupTitle: 'Ekran',
        fields: [
          { label: 'Ekran Boyutu', type: 'number', unit: 'inç', isKeyHighlight: true },
          { label: 'Ekran Teknolojisi', type: 'string' },
          { label: 'Ekran Çözünürlüğü', type: 'string' },
          { label: 'Piksel Yoğunluğu (PPI)', type: 'number', unit: 'PPI' },
          { label: 'Ekran Yenileme Hızı', type: 'number', unit: 'Hz', isKeyHighlight: true },
          { label: 'Ekran Parlaklığı (Tepe)', type: 'number', unit: 'nits' },
          { label: 'Ekran Dayanıklılığı', type: 'string' },
          { label: 'Sürekli Açık Ekran (AOD)', type: 'boolean' },
        ],
      },
      {
        groupTitle: 'Performans ve Donanım',
        fields: [
          { label: 'Yonga Seti (Chipset)', type: 'string', isKeyHighlight: true },
          { label: 'CPU Çekirdek Sayısı', type: 'string' },
          { label: 'Üretim Teknolojisi', type: 'string', unit: 'nm' },
          { label: 'Grafik İşlemci (GPU)', type: 'string' },
          { label: 'Bellek (RAM)', type: 'string', isKeyHighlight: true },
          { label: 'Dahili Depolama', type: 'string', isKeyHighlight: true },
          { label: 'Hafıza Kartı Desteği', type: 'boolean' },
          { label: 'AnTuTu Puanı (v10)', type: 'number' },
        ],
      },
      {
        groupTitle: 'Kamera Sistemi',
        fields: [
          { label: 'Kamera Çözünürlüğü', type: 'number', unit: 'MP', isKeyHighlight: true },
          { label: 'Optik Görüntü Sabitleme (OIS)', type: 'boolean' },
          { label: 'Diyafram Açıklığı', type: 'string' },
          { label: 'İkinci Arka Kamera', type: 'string' },
          { label: 'Üçüncü Arka Kamera', type: 'string' },
          { label: 'Optik Zoom', type: 'string' },
          { label: 'Ön Kamera Çözünürlüğü', type: 'number', unit: 'MP' },
          { label: 'Video Kayıt Çözünürlüğü', type: 'string' },
        ],
      },
      {
        groupTitle: 'Batarya ve Şarj',
        fields: [
          { label: 'Batarya Kapasitesi', type: 'number', unit: 'mAh', isKeyHighlight: true },
          { label: 'Hızlı Şarj', type: 'boolean' },
          { label: 'Hızlı Şarj Gücü', type: 'number', unit: 'W', isKeyHighlight: true },
          { label: 'Kablosuz Şarj', type: 'boolean' },
          { label: 'Ters Kablosuz Şarj', type: 'boolean' },
        ],
      },
      {
        groupTitle: 'Tasarım ve Gövde',
        fields: [
          { label: 'Ağırlık', type: 'number', unit: 'g' },
          { label: 'Kalınlık', type: 'number', unit: 'mm' },
          { label: 'Gövde Malzemesi (Çerçeve)', type: 'string' },
          { label: 'Suya Dayanıklılık', type: 'boolean' },
          { label: 'Suya Dayanıklılık Seviyesi', type: 'string' },
          { label: 'Toza Dayanıklılık', type: 'boolean' },
        ],
      },
    ],
  },

  // ─── ROBOTİK & AÇIK KAYNAK DONANIM ───
  'robotik-acik-kaynak': {
    categorySlug: 'robotik-acik-kaynak',
    categoryName: 'Robotik & Açık Kaynak Donanım',
    keyHighlightKeys: [
      'Serbestlik Derecesi (DOF)',
      'Taşıma Kapasitesi (Payload)',
      'Önerilen Kontrol Kartı',
      'Üretim Yöntemi',
      'GitHub Yıldız Sayısı',
      'Lisans Türü',
    ],
    groups: [
      {
        groupTitle: 'Mekanik & Kinematik',
        fields: [
          { label: 'Serbestlik Derecesi (DOF)', type: 'string', isKeyHighlight: true },
          { label: 'Taşıma Kapasitesi (Payload)', type: 'string', isKeyHighlight: true },
          { label: 'Maksimum Uzanma Mesafesi (Reach)', type: 'string' },
          { label: 'Tekrarlanabilirlik Hassasiyeti', type: 'string' },
          { label: 'Mekanik Yapı / Kol Tipi', type: 'string' },
        ],
      },
      {
        groupTitle: 'Elektronik & Kontrol',
        fields: [
          { label: 'Önerilen Kontrol Kartı', type: 'string', isKeyHighlight: true },
          { label: 'Motor Tipleri', type: 'string' },
          { label: 'Sürücü Kartları', type: 'string' },
          { label: 'Güç Gereksinimi / Voltaj', type: 'string' },
          { label: 'Sensörler / Enkoderler', type: 'string' },
        ],
      },
      {
        groupTitle: 'Yazılım & Açık Kaynak',
        fields: [
          { label: 'Lisans Türü', type: 'string', isKeyHighlight: true },
          { label: 'GitHub Yıldız Sayısı', type: 'string', isKeyHighlight: true },
          { label: 'Desteklenen Yazılımlar (ROS / Python / Arduino)', type: 'string' },
          { label: 'CAD Dosya Formatı (STEP / FreeCAD / STL)', type: 'string' },
          { label: 'Üretim Yöntemi', type: 'string', isKeyHighlight: true },
        ],
      },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// 2. DİNAMİK ŞABLON ÜRETİCİ (Bilinmeyen / Yeni Kategoriler İçin)
// ══════════════════════════════════════════════════════════════════════════════

export async function getOrGenerateCategoryTemplate(
  categorySlug: string,
  categoryName: string,
  sampleText?: string
): Promise<CategoryTemplate> {
  // 1. Zaten hazır bir altın şablon var mı?
  if (GOLD_TEMPLATES[categorySlug]) {
    return GOLD_TEMPLATES[categorySlug];
  }

  // Benzer slug kontrolü
  const slugLower = categorySlug.toLowerCase();
  for (const key of Object.keys(GOLD_TEMPLATES)) {
    if (slugLower.includes(key) || key.includes(slugLower)) {
      return GOLD_TEMPLATES[key];
    }
  }

  // 2. Yoksa: Gemini AI ile bu kategoriye özel 15-20 parametrelik Epey kalitesinde dinamik şablon üret!
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Sen "Neyin Nesi?" ürün platformunun veri mimarısın.
Bizim için "${categoryName}" kategorisindeki ürünleri Epey kalitesinde eksiksiz karşılaştırabileceğimiz yapılandırılmış bir spesifikasyon şablonu (Category Template) oluştur.

Örnek bilgi: ${sampleText ? sampleText.slice(0, 500) : 'Genel teknolojik ürün'}

Gereksinimler:
- 4-5 mantıksal grup oluştur (Örn: Genel, Performans, Fiziksel, Bağlantı vb.).
- Her grupta en kritik teknik özellikleri (label, type: boolean|string|number) tanımla. Toplam 15-25 parametre olsun.
- En önemli 6 parametreyi "keyHighlightKeys" dizisine ekle.

YALNIZCA geçerli bir JSON çıktısı ver (markdown blokları olmadan):
{
  "categorySlug": "${categorySlug}",
  "categoryName": "${categoryName}",
  "keyHighlightKeys": ["Özellik 1", "Özellik 2"],
  "groups": [
    {
      "groupTitle": "Grup Başlığı",
      "fields": [
        { "label": "Özellik Adı", "type": "string" },
        { "label": "Özellik 2", "type": "boolean" }
      ]
    }
  ]
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const cleanJson = (res.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const generated = JSON.parse(cleanJson);
      if (generated && generated.groups) {
        // Cache this template into memory so we don't call AI again for the same category
        GOLD_TEMPLATES[categorySlug] = generated;
        return generated;
      }
    } catch (e) {
      console.warn(`[Taxonomy Engine] AI şablon üretiminde hata, varsayılan şablona dönülüyor:`, e);
    }
  }

  // 3. Fallback Genel Şablon
  return {
    categorySlug,
    categoryName,
    keyHighlightKeys: ['Model', 'Ana Donanım', 'Bağlantı', 'Ağırlık'],
    groups: [
      {
        groupTitle: 'Genel Bilgiler',
        fields: [
          { label: 'Marka', type: 'string' },
          { label: 'Model', type: 'string' },
          { label: 'Kullanım Alanı', type: 'string' },
        ],
      },
      {
        groupTitle: 'Teknik Özellikler',
        fields: [
          { label: 'Ana Donanım', type: 'string', isKeyHighlight: true },
          { label: 'Güç Tüketimi', type: 'string' },
          { label: 'Bağlantı Türü', type: 'string', isKeyHighlight: true },
        ],
      },
      {
        groupTitle: 'Fiziksel Özellikler',
        fields: [
          { label: 'Ağırlık', type: 'number', unit: 'g', isKeyHighlight: true },
          { label: 'Renk', type: 'string' },
        ],
      },
    ],
  };
}
