// ==UserScript==
// @name         Neyin Nesi - Epey & Dış Kaynak Akıllı Eşleştirici
// @namespace    http://localhost:3000/
// @version      1.2.0
// @description  Epey.com ürün özelliklerini okur, yerel Neyin Nesi veritabanınızla (localhost:3000) insan denetimli eşleştirir ve tek tıkla aktarır.
// @author       Neyin Nesi Geliştirme Ekibi
// @match        *://*.epey.com/*
// @match        *://epey.com/*
// @match        *://*.akakce.com/*
// @match        *://*.cimri.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      localhost
// @connect      127.0.0.1
// ==/UserScript==

(function () {
  'use strict';

  const API_BASE = 'http://localhost:3000/api/admin';

  // HTTPS -> HTTP (Mixed Content) ve CORS engelini aşmak için GM_xmlhttpRequest sarmalayıcısı
  function makeApiRequest(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== 'undefined') {
        GM_xmlhttpRequest({
          method,
          url,
          headers: { 'Content-Type': 'application/json' },
          data: data ? JSON.stringify(data) : null,
          onload: (response) => {
            try {
              if (response.status >= 200 && response.status < 300) {
                resolve(JSON.parse(response.responseText));
              } else {
                reject(new Error(`API Hatası (HTTP ${response.status}): ${response.responseText}`));
              }
            } catch (e) {
              reject(e);
            }
          },
          onerror: (err) => reject(new Error('Yerel sunucuya (localhost:3000) bağlanılamadı. Terminalde "npm run dev" açık mı?'))
        });
      } else {
        fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: data ? JSON.stringify(data) : null
        })
          .then(r => r.json())
          .then(resolve)
          .catch(reject);
      }
    });
  }

  // 1. Ürün Başlığını Sayfadan veya Title'dan %100 Garanti Çıkar
  function extractProductTitle() {
    // a. h1 veya baslik
    const h1 = document.querySelector('h1.baslik, h1, .urun_adi, .baslik, [itemprop="name"]');
    if (h1 && h1.innerText && h1.innerText.trim().length > 3) {
      const clean = h1.innerText.replace(/fiyatları|fiyatı|özellikleri|incelemesi|yorumu/gi, '').trim();
      if (clean.length > 2) return clean;
    }

    // b. document.title fallback'i (Örn: "Apple iPhone 16 Pro Max (1 TB) Fiyatı ve Özellikleri - Epey")
    const dt = document.title || '';
    if (dt) {
      const cleaned = dt.split(/fiyat|özellik|inceleme|-|–|—|\|/i)[0].trim();
      if (cleaned && cleaned.length > 3 && !cleaned.toLowerCase().includes('epey')) {
        return cleaned;
      }
    }
    return '';
  }

  // 2. Fiyat ve Görsel Bilgilerini Çıkar
  function extractPriceAndImage() {
    let price = 0;
    // Epey'deki en ucuz fiyat kutusu veya ilk teklif
    const priceEl = document.querySelector('.fiyat, #fiyat_en_ucuz, .urun_fiyat, [itemprop="price"], .fiyatlar .fiyat');
    if (priceEl) {
      const cleanPrice = priceEl.innerText.replace(/[^0-9,\.]/g, '').replace(/\./g, '').replace(',', '.');
      price = parseFloat(cleanPrice) || 0;
    }

    let heroImage = '';
    const imgEl = document.querySelector('#gorsel img, .gorsel img, .urun_gorseli img, [class*="galeri"] img, meta[property="og:image"]');
    if (imgEl) {
      heroImage = imgEl.src || imgEl.content || '';
    }

    return { price, heroImage };
  }

  // 3. Epey Teknik Özelliklerini (Hem Üst Özet Barı Hem Alt Tabloları) Ayrıştır
  function extractSpecifications() {
    const specGroups = [];
    const seenLabels = new Set();

    // A) ÜST ÖZET ÖZELLİKLERİ (Ekran Boyutu, Dahili Depolama, RAM, Batarya, Hızlı Şarj vb.)
    const summaryItems = [];
    const candidateSummaryEls = document.querySelectorAll('[class*="ozet"], [class*="ozellik"], div, li');
    
    candidateSummaryEls.forEach(el => {
      // Sadece doğrudan çocukları veya kısa metin içeren kutuları ara
      if (el.children.length > 0 && el.children.length <= 4) {
        const text = el.innerText.trim();
        if (text.includes(':') && text.length < 90 && !text.includes('\n\n')) {
          const parts = text.split(':');
          if (parts.length === 2) {
            const label = parts[0].trim();
            let value = parts[1].trim();
            if (!value && (el.innerHTML.includes('Var') || el.innerHTML.includes('tik') || el.innerHTML.includes('check'))) {
              value = 'Var';
            }
            if (label && value && !seenLabels.has(label.toLowerCase()) && label.length < 40) {
              seenLabels.add(label.toLowerCase());
              summaryItems.push({ label, value, isKeyHighlight: true });
            }
          }
        }
      }
    });

    if (summaryItems.length > 0) {
      specGroups.push({
        title: 'Önemli Temel Özellikler',
        items: summaryItems
      });
    }

    // B) DETAYLI TABLOLAR (#ozellikler, table, .ozellik_tablo, .detay vb.)
    const tables = document.querySelectorAll('#ozellikler table, #bilgiler table, .ozellik_tablo, .detay table, table.ozellik, table');

    tables.forEach(table => {
      // Tablo başlığı
      const caption = table.querySelector('caption, thead th, .grup_baslik');
      let groupTitle = caption ? caption.innerText.trim() : '';

      const prevHeading = table.previousElementSibling;
      if (!groupTitle && prevHeading && ['H2', 'H3', 'H4', 'DIV'].includes(prevHeading.tagName)) {
        groupTitle = prevHeading.innerText.trim();
      }

      const tableGroup = {
        title: groupTitle || 'Teknik Detaylar',
        items: []
      };

      const rows = table.querySelectorAll('tr');
      rows.forEach(tr => {
        const thColspan = tr.querySelector('th[colspan], td.baslik[colspan]');
        if (thColspan) {
          if (tableGroup.items.length > 0) {
            specGroups.push({ ...tableGroup });
            tableGroup.items = [];
          }
          tableGroup.title = thColspan.innerText.trim();
          return;
        }

        const cells = tr.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const rawLabel = cells[0].innerText.trim();
          let rawVal = cells[1].innerText.trim();

          if (!rawVal) {
            const html = cells[1].innerHTML;
            if (html.includes('fa-check') || html.includes('tik') || html.includes('yes') || html.includes('true') || html.includes('Var')) {
              rawVal = 'Var';
            } else if (html.includes('fa-times') || html.includes('carpi') || html.includes('no') || html.includes('false') || html.includes('Yok')) {
              rawVal = 'Yok';
            }
          }

          if (rawLabel && rawVal && !seenLabels.has(rawLabel.toLowerCase()) && rawLabel.length < 80) {
            seenLabels.add(rawLabel.toLowerCase());
            tableGroup.items.push({
              label: rawLabel,
              value: rawVal,
              isKeyHighlight: false
            });
          }
        }
      });

      if (tableGroup.items.length > 0) {
        specGroups.push(tableGroup);
      }
    });

    return specGroups;
  }

  // Tüm Verileri Paketle
  function parseAllPageData() {
    const externalName = extractProductTitle();
    const { price, heroImage } = extractPriceAndImage();
    const specGroups = extractSpecifications();
    const totalSpecs = specGroups.reduce((acc, g) => acc + (g.items?.length || 0), 0);

    return {
      externalName,
      price,
      heroImage,
      sourceUrl: window.location.href,
      specGroups,
      totalSpecs
    };
  }

  // 4. Arayüzü Ekrana Ekleme (Floating Widget)
  function injectAssistantUI() {
    if (document.getElementById('nn-assistant-widget')) return;

    let pageData = parseAllPageData();
    const isProduct = !!pageData.externalName;

    const widget = document.createElement('div');
    widget.id = 'nn-assistant-widget';
    widget.innerHTML = `
      <div class="nn-box">
        <div class="nn-header">
          <div class="nn-brand">
            <span class="nn-logo-dot"></span>
            <strong>Neyin Nesi</strong>
            <span class="nn-badge">Operatör Asistanı</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <button id="nn-rescan-btn" title="Sayfayı Tekrar Tara" style="background:#334155; border:none; color:#38bdf8; font-size:12px; cursor:pointer; padding:3px 6px; border-radius:4px;">🔄 Tara</button>
            <button id="nn-toggle-btn" title="Küçült" style="background:#334155; border:none; color:#f1f5f9; font-size:14px; cursor:pointer; padding:2px 7px; border-radius:4px;">−</button>
          </div>
        </div>

        <div class="nn-content" id="nn-content-body">
          <div class="nn-source-summary">
            <div class="nn-source-title" id="nn-product-title-display">
              ${isProduct ? `📌 <strong>${pageData.externalName}</strong>` : 'ℹ️ Ürün sayfası taranıyor...'}
            </div>
            <div class="nn-source-meta" id="nn-product-meta-display">
              <span>📊 <strong id="nn-spec-count">${pageData.totalSpecs}</strong> Özellik Bulundu</span>
              ${pageData.price > 0 ? `<span>💰 <strong>${pageData.price.toLocaleString('tr-TR')} TL</strong></span>` : ''}
            </div>
          </div>

          <div class="nn-candidates-section">
            <div class="nn-section-title">
              <span>Neyin Nesi Veritabanı Eşleşmesi</span>
              <span id="nn-api-status" class="nn-status-badge">Aranıyor...</span>
            </div>

            <div id="nn-candidates-list" class="nn-candidates-list">
              <div class="nn-loader">Veritabanı taranıyor...</div>
            </div>

            <!-- Manuel Arama Alanı -->
            <div class="nn-manual-search">
              <input type="text" id="nn-manual-input" placeholder="Veritabanında başka bir isimle ara..." />
              <button id="nn-manual-search-btn">🔍 Ara</button>
            </div>
          </div>

          <div class="nn-actions">
            <button id="nn-sync-btn" class="nn-btn-primary" ${isProduct ? '' : 'disabled'}>
              ⚡ Seçili Ürüne Özellikleri Aktar & Onayla
            </button>
            <div id="nn-result-msg" class="nn-result-msg"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // CSS Stilleri
    const style = document.createElement('style');
    style.innerHTML = `
      #nn-assistant-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #f1f5f9;
        font-size: 13px;
      }
      .nn-box {
        width: 380px;
        background: #0f172a !important;
        border: 2px solid #6366f1 !important;
        border-radius: 14px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(99, 102, 241, 0.4);
        overflow: hidden;
      }
      .nn-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: #1e293b;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .nn-brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #fff;
      }
      .nn-logo-dot {
        width: 10px;
        height: 10px;
        background: #6366f1;
        border-radius: 50%;
        box-shadow: 0 0 10px #6366f1;
      }
      .nn-badge {
        font-size: 10px;
        background: rgba(99, 102, 241, 0.25);
        color: #c7d2fe;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
      .nn-content {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 520px;
        overflow-y: auto;
      }
      .nn-source-summary {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 10px;
        border-radius: 8px;
      }
      .nn-source-title {
        font-size: 13px;
        font-weight: 600;
        color: #f8fafc;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .nn-source-meta {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: #94a3b8;
        margin-top: 6px;
      }
      .nn-source-meta strong { color: #38bdf8; }
      .nn-section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        margin-bottom: 6px;
      }
      .nn-status-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(234, 179, 8, 0.2);
        color: #facc15;
      }
      .nn-status-badge.ok {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
      }
      .nn-status-badge.err {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }
      .nn-candidates-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 200px;
        overflow-y: auto;
      }
      .nn-candidate-card {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .nn-candidate-card:hover {
        background: #334155;
        border-color: #6366f1;
      }
      .nn-candidate-card.selected {
        background: rgba(99, 102, 241, 0.25);
        border-color: #6366f1;
      }
      .nn-candidate-info {
        flex: 1;
        min-width: 0;
      }
      .nn-cand-title {
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .nn-cand-meta {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 2px;
      }
      .nn-cand-score {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        background: #312e81;
        color: #a5b4fc;
      }
      .nn-cand-score.high {
        background: #14532d;
        color: #4ade80;
      }
      .nn-manual-search {
        display: flex;
        gap: 6px;
        margin-top: 6px;
      }
      .nn-manual-search input {
        flex: 1;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 11px;
        color: #fff;
      }
      .nn-manual-search button {
        background: #334155;
        border: 1px solid #475569;
        border-radius: 6px;
        color: #fff;
        padding: 0 10px;
        font-size: 11px;
        cursor: pointer;
      }
      .nn-btn-primary {
        width: 100%;
        background: #4f46e5;
        color: #fff;
        border: none;
        padding: 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
      }
      .nn-btn-primary:hover:not(:disabled) { background: #4338ca; }
      .nn-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .nn-result-msg {
        font-size: 11px;
        text-align: center;
        min-height: 16px;
      }
      .nn-result-msg.success { color: #4ade80; font-weight: 600; }
      .nn-result-msg.error { color: #f87171; }
      .nn-loader { font-size: 11px; color: #94a3b8; text-align: center; padding: 12px 0; }
    `;
    document.head.appendChild(style);

    // Olaylar ve Fonksiyonlar
    let selectedProductId = null;
    let isMinimized = false;

    const toggleBtn = document.getElementById('nn-toggle-btn');
    const rescanBtn = document.getElementById('nn-rescan-btn');
    const contentBody = document.getElementById('nn-content-body');
    const candidatesList = document.getElementById('nn-candidates-list');
    const apiStatus = document.getElementById('nn-api-status');
    const syncBtn = document.getElementById('nn-sync-btn');
    const resultMsg = document.getElementById('nn-result-msg');
    const manualInput = document.getElementById('nn-manual-input');
    const manualBtn = document.getElementById('nn-manual-search-btn');
    const specCountEl = document.getElementById('nn-spec-count');
    const titleDisplay = document.getElementById('nn-product-title-display');

    toggleBtn.onclick = () => {
      isMinimized = !isMinimized;
      contentBody.style.display = isMinimized ? 'none' : 'flex';
      toggleBtn.innerText = isMinimized ? '+' : '−';
    };

    // Adayları Getir
    async function loadCandidates(query) {
      if (!query || !query.trim()) {
        candidatesList.innerHTML = '<div class="nn-loader">Ürün adı aranıyor...</div>';
        return;
      }

      candidatesList.innerHTML = '<div class="nn-loader">Adaylar taranıyor...</div>';
      apiStatus.innerText = 'Taranıyor...';
      apiStatus.className = 'nn-status-badge';

      try {
        const candidates = await makeApiRequest(`${API_BASE}/match-candidates?query=${encodeURIComponent(query)}`);
        apiStatus.innerText = `${candidates.length} Aday Bulundu`;
        apiStatus.className = 'nn-status-badge ok';
        renderCandidates(candidates);
      } catch (err) {
        apiStatus.innerText = 'Bağlantı Hatası';
        apiStatus.className = 'nn-status-badge err';
        candidatesList.innerHTML = `
          <div style="font-size:11px; color:#f87171; padding:8px; text-align:center;">
            ⚠️ Yerel sunucuya bağlanılamadı.<br>
            Terminalde <b>npm run dev</b> komutunun çalıştığından emin olun.
          </div>
        `;
      }
    }

    function renderCandidates(candidates) {
      if (!candidates || candidates.length === 0) {
        candidatesList.innerHTML = `
          <div class="nn-candidate-card selected" data-id="new">
            <input type="radio" name="nn-prod" value="new" checked />
            <div class="nn-candidate-info">
              <div class="nn-cand-title">➕ Neyin Nesi'nde Yeni Ürün Olarak Oluştur</div>
              <div class="nn-cand-meta"><span>Bu başlıkla veritabanına yeni kart açar</span></div>
            </div>
          </div>
        `;
        selectedProductId = 'new';
        syncBtn.disabled = false;
        return;
      }

      let html = '';
      candidates.forEach((cand, idx) => {
        const isSelected = idx === 0;
        if (isSelected) selectedProductId = cand.id;

        const scoreClass = cand.matchScore >= 70 ? 'high' : '';
        html += `
          <div class="nn-candidate-card ${isSelected ? 'selected' : ''}" data-id="${cand.id}">
            <input type="radio" name="nn-prod" value="${cand.id}" ${isSelected ? 'checked' : ''} />
            <div class="nn-candidate-info">
              <div class="nn-cand-title" title="${cand.fullName}">${cand.fullName}</div>
              <div class="nn-cand-meta">
                <span>${cand.categoryName || 'Kategori'}</span> •
                <span>${cand.specCount || 0} mevcut özellik</span>
              </div>
            </div>
            <div class="nn-cand-score ${scoreClass}">%${cand.matchScore}</div>
          </div>
        `;
      });

      html += `
        <div class="nn-candidate-card" data-id="new">
          <input type="radio" name="nn-prod" value="new" />
          <div class="nn-candidate-info">
            <div class="nn-cand-title">➕ Yeni Ürün Olarak Ekle</div>
            <div class="nn-cand-meta"><span>Veritabanında yoksa sıfırdan oluşturur</span></div>
          </div>
        </div>
      `;

      candidatesList.innerHTML = html;
      syncBtn.disabled = false;

      candidatesList.querySelectorAll('.nn-candidate-card').forEach(card => {
        card.onclick = () => {
          candidatesList.querySelectorAll('.nn-candidate-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          const radio = card.querySelector('input[type="radio"]');
          radio.checked = true;
          selectedProductId = card.getAttribute('data-id');
          syncBtn.disabled = false;
        };
      });
    }

    // Yeniden Tarama
    rescanBtn.onclick = () => {
      pageData = parseAllPageData();
      if (pageData.externalName) {
        titleDisplay.innerHTML = `📌 <strong>${pageData.externalName}</strong>`;
        specCountEl.innerText = pageData.totalSpecs;
        syncBtn.disabled = false;
        loadCandidates(pageData.externalName);
      }
    };

    manualBtn.onclick = () => {
      const q = manualInput.value.trim();
      if (q) loadCandidates(q);
    };
    manualInput.onkeypress = (e) => {
      if (e.key === 'Enter') manualBtn.click();
    };

    // Senkronize Et
    syncBtn.onclick = async () => {
      if (!selectedProductId) return;

      // Son kez güncel özellikleri tara
      pageData = parseAllPageData();

      syncBtn.disabled = true;
      syncBtn.innerText = '⏳ Özellikler Aktarılıyor...';
      resultMsg.className = 'nn-result-msg';
      resultMsg.innerText = '';

      const payload = {
        targetProductId: selectedProductId,
        externalName: pageData.externalName,
        price: pageData.price,
        heroImage: pageData.heroImage,
        sourceUrl: pageData.sourceUrl,
        specGroups: pageData.specGroups
      };

      try {
        const data = await makeApiRequest(`${API_BASE}/sync-external-specs`, 'POST', payload);
        resultMsg.className = 'nn-result-msg success';
        resultMsg.innerHTML = `🎉 <strong>${data.itemCount || pageData.totalSpecs}</strong> özellik başarıyla kaydedildi!`;
        syncBtn.innerText = '✅ Senkronizasyon Tamamlandı!';

        setTimeout(() => {
          syncBtn.innerText = '⚡ Yeniden Güncelle';
          syncBtn.disabled = false;
        }, 3000);
      } catch (err) {
        resultMsg.className = 'nn-result-msg error';
        resultMsg.innerText = `Hata: ${err.message}`;
        syncBtn.innerText = '⚡ Tekrar Dene';
        syncBtn.disabled = false;
      }
    };

    // İlk Başlatma ve Otomatik Tarama
    if (pageData.externalName) {
      loadCandidates(pageData.externalName);
    } else {
      setTimeout(() => {
        pageData = parseAllPageData();
        if (pageData.externalName) {
          titleDisplay.innerHTML = `📌 <strong>${pageData.externalName}</strong>`;
          specCountEl.innerText = pageData.totalSpecs;
          loadCandidates(pageData.externalName);
        }
      }, 1000);
    }
  }

  // Sayfa yüklenince çalıştır
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(injectAssistantUI, 500);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(injectAssistantUI, 500));
  }
})();
