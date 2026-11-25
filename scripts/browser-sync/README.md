# 🚀 Neyin Nesi - Dış Kaynak (Epey / Akakçe / Cimri) Akıllı Eşleştirme & Senkronizasyon Asistanı

Bu araç, **"İnsan Denetimli (Human-in-the-Loop)"** veri zenginleştirme mantığıyla çalışır. Epey veya benzeri platformlarda bir ürün incelerken:
1. Sayfadaki teknik özellikler tablosunu DOM'dan otomatik okur,
2. Neyin Nesi veritabanınızda ismi en çok benzeyen ürünleri listeler,
3. Sizin tek tıkla onayınızla tüm teknik özellikleri Neyin Nesi veritabanına aktarır.

---

## 🛠️ Kurulum (2 Farklı Yöntem)

### 1. Yöntem: Tampermonkey Eklentisi (En Kolay & Kalıcı Yol)
1. Tarayıcınıza (Chrome / Edge / Brave / Opera) **[Tampermonkey](https://www.tampermonkey.net/)** eklentisini kurun.
2. Tampermonkey simgesine tıklayıp **"Yeni Script Ekle"** (Create a new script) deyin.
3. [`scripts/browser-sync/neyin-nesi-matcher.user.js`](./neyin-nesi-matcher.user.js) dosyasındaki tüm kodları kopyalayıp editöre yapıştırın ve **Kaydet (Ctrl+S / Cmd+S)** yapın.
4. Terminalde Neyin Nesi geliştirme sunucunuzun çalıştığından emin olun:
   ```bash
   npm run dev
   ```

### 2. Yöntem: Kurulumsuz Doğrudan Konsol (DevTools Console)
Eğer eklenti kurmak istemiyorsanız:
1. Epey'de herhangi bir ürün sayfasını açın.
2. Klavyeden **F12** veya **Sağ Tık -> İncele (Inspect) -> Console (Konsol)** sekmesine geçin.
3. [`scripts/browser-sync/neyin-nesi-matcher.user.js`](./neyin-nesi-matcher.user.js) içindeki kodu yapıştırıp **Enter**'a basın.
4. Sağ altta Neyin Nesi Asistan penceresi anında belirecektir.

---

## 🎯 Nasıl Kullanılır?

1. **Epey'de Ürüne Gidin:** Örneğin `epey.com/akilli-telefonlar/samsung-galaxy-s24-ultra.html` sayfasını açın.
2. **Asistan Açılır:** Sağ altta şık, modern karanlık temalı **"Neyin Nesi Operatör Asistanı"** paneli görünür.
3. **Eşleşmeyi İnceleyin:**
   - Panelde bulunan özellik sayısı (örneğin: *54 Özellik Hazır*) yazar.
   - Veritabanınızdaki adaylar (% benzerlik oranıyla) listelenir.
   - Doğru ürünü seçin (veya veritabanında henüz yoksa *"➕ Yeni Ürün Olarak Ekle"* seçeneğini işaretleyin).
4. **Tek Tıkla Aktarın:**
   - **"⚡ Seçili Ürüne Özellikleri Aktar & Onayla"** butonuna basın.
   - 1 saniye içinde tüm teknik tablo (Ekran, Yonga Seti, Kamera, Batarya vb.) PostgreSQL veritabanınıza yazılır ve ürün *"Doğrulandı"* olarak işaretlenir.

---

## 🛡️ Neden Güvenli?

- **Bot Engeli Yok:** İstekleri siz tarayıcınızda normal insan gibi gezerek açtığınız için Cloudflare veya IP ban riski %0'dır.
- **Hatalı Eşleşme Riski Yok:** Yapay zekanın yanlış ürünü güncellemesine izin verilmez; son kararı ve onayı her zaman siz verirsiniz.
- **Dinamik Veri Kalitesi:** Birimler, boolean (Var/Yok) özellikleri ve başlıklar standartlaştırılmış PostgreSQL `spec_groups` ve `spec_items` tablolarına kaydedilir.
