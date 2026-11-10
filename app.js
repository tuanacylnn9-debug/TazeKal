/**
 * TazeKal — Ana Uygulama Mantığı ve Etkileşimler
 */

// Uygulama Durumu (State)
let productsState = [];
let statsState = {};
let activeTab = 'home'; // 'home', 'pantry', 'add', 'recipes', 'stats'
let activeFilter = 'all';
let selectedIcon = '🥛';
let selectedStorage = 'fridge';
let searchQuery = '';

// LocalStorage Anahtarları
const LS_PRODUCTS_KEY = 'tazekal_products_v1';
const LS_STATS_KEY = 'tazekal_stats_v1';

// Uygulamayı Başlatma
document.addEventListener('DOMContentLoaded', () => {
  initData();
  setupEventListeners();
  renderApp();
  renderCurrentDate();
});

// Güncel Tarih ve Saati Yazdırma (Mobil durum çubuğu)
function renderCurrentDate() {
  const timeEl = document.getElementById('phone-clock');
  if (timeEl) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
  }
}

// Verileri Yükle (Varsa LocalStorage'dan, yoksa data.js başlangıç verilerinden)
function initData() {
  const savedProds = localStorage.getItem(LS_PRODUCTS_KEY);
  if (savedProds) {
    try {
      productsState = JSON.parse(savedProds);
    } catch (e) {
      productsState = [...INITIAL_PRODUCTS];
    }
  } else {
    productsState = [...INITIAL_PRODUCTS];
    saveProducts();
  }

  const savedStats = localStorage.getItem(LS_STATS_KEY);
  if (savedStats) {
    try {
      statsState = JSON.parse(savedStats);
    } catch (e) {
      statsState = { ...INITIAL_STATS };
    }
  } else {
    statsState = { ...INITIAL_STATS };
    saveStats();
  }
}

function saveProducts() {
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(productsState));
}

function saveStats() {
  localStorage.setItem(LS_STATS_KEY, JSON.stringify(statsState));
}

// Kalan Gün Hesaplama & Aciliyet Seviyesi
function calculateDaysLeft(expiryDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = 'safe'; // 'urgent', 'warning', 'safe'
  let label = '';

  if (diffDays < 0) {
    status = 'urgent';
    label = 'Süresi Doldu!';
  } else if (diffDays === 0) {
    status = 'urgent';
    label = 'Bugün son!';
  } else if (diffDays === 1) {
    status = 'urgent';
    label = '1 gün kaldı';
  } else if (diffDays <= 3) {
    status = 'warning';
    label = `${diffDays} gün kaldı`;
  } else {
    status = 'safe';
    label = `${diffDays} gün kaldı`;
  }

  return { diffDays, status, label };
}

// Tarih Formatlayıcı (Örn: 2 Kasım Pzt)
function formatTurkishDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// ============================================================
// EKRAN RENDER İŞLEMLERİ
// ============================================================
function renderApp() {
  renderHomeView();
  renderPantryView();
  renderStatsView();
  renderNotificationBadge();
}

// 1. ANA SAYFA RENDER
function renderHomeView() {
  const activeProducts = productsState.filter(p => !p.consumed);
  
  // Ürünleri kalan günlerine göre sırala (en aciller en başta)
  const sorted = [...activeProducts].sort((a, b) => {
    return calculateDaysLeft(a.expiryDate).diffDays - calculateDaysLeft(b.expiryDate).diffDays;
  });

  // Acil tüketilmesi gerekenler (<= 2 gün)
  const urgentItems = sorted.filter(p => {
    const calc = calculateDaysLeft(p.expiryDate);
    return calc.diffDays <= 2;
  });

  // Özet Kartı Bilgileri
  const urgentCountEl = document.getElementById('urgent-count-badge');
  if (urgentCountEl) {
    urgentCountEl.textContent = urgentItems.length;
  }
  
  const urgentDescEl = document.getElementById('urgent-summary-desc');
  if (urgentDescEl) {
    if (urgentItems.length === 0) {
      urgentDescEl.textContent = 'Harika! Şu an acil tüketilmesi gereken ürünün yok.';
    } else {
      urgentDescEl.textContent = `Önümüzdeki 48 saat içinde tüketilmesi gereken ${urgentItems.length} ürün var.`;
    }
  }

  // Ana Sayfa Ürün Listesi
  const listContainer = document.getElementById('home-expiring-list');
  if (!listContainer) return;

  // Filtreleme
  let displayedItems = sorted;
  if (activeFilter === 'urgent') {
    displayedItems = sorted.filter(p => calculateDaysLeft(p.expiryDate).diffDays <= 2);
  } else if (activeFilter !== 'all') {
    displayedItems = sorted.filter(p => p.category === activeFilter);
  }

  if (displayedItems.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">🌱</div>
        <div class="empty-state-text">Bu kategoride ürün bulunamadı</div>
        <div class="empty-state-sub">Yeni bir ürün eklemek için aşağıdaki "+" butonuna tıkla.</div>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = displayedItems.map(item => createProductCardHtml(item)).join('');

  // Bu Ay İsraf Edilmeden Tüketilenler Alanı (İstatistik Kartı)
  renderMonthlyWidget();
}

// 2. KİLERİM (TÜM ÜRÜNLER) RENDER
function renderPantryView() {
  const container = document.getElementById('pantry-product-list');
  if (!container) return;

  let activeProducts = productsState.filter(p => !p.consumed);

  // Arama filtresi
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    activeProducts = activeProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (CATEGORIES[p.category] && CATEGORIES[p.category].name.toLowerCase().includes(q))
    );
  }

  // Saklama konumu filtresi
  const pantryStorageFilter = document.querySelector('.pantry-filter-chip.active')?.dataset.storage || 'all';
  if (pantryStorageFilter !== 'all') {
    activeProducts = activeProducts.filter(p => p.storage === pantryStorageFilter);
  }

  // Sıralama
  activeProducts.sort((a, b) => calculateDaysLeft(a.expiryDate).diffDays - calculateDaysLeft(b.expiryDate).diffDays);

  const totalCountEl = document.getElementById('pantry-total-count');
  if (totalCountEl) totalCountEl.textContent = `${activeProducts.length} Ürün`;

  if (activeProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">🧺</div>
        <div class="empty-state-text">Aramanızla eşleşen ürün bulunamadı</div>
        <div class="empty-state-sub">Farklı bir arama yapmayı deneyin veya yeni ürün ekleyin.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = activeProducts.map(item => createProductCardHtml(item)).join('');
}

// 3. İSTATİSTİK WIDGET VE EKRANI RENDER
function renderMonthlyWidget() {
  const savedCountEl = document.getElementById('widget-saved-count');
  const savedMoneyEl = document.getElementById('widget-saved-money');
  const savedCO2El = document.getElementById('widget-saved-co2');

  if (savedCountEl) savedCountEl.textContent = statsState.savedItemsCount;
  if (savedMoneyEl) savedMoneyEl.textContent = `₺${statsState.savedMoneyTRY}`;
  if (savedCO2El) savedCO2El.textContent = `${statsState.preventedCO2Kg} kg`;

  // Detaylı istatistik ekranı varsa güncelle
  const detailSavedCount = document.getElementById('detail-saved-count');
  if (detailSavedCount) detailSavedCount.textContent = statsState.savedItemsCount;

  const detailSavedMoney = document.getElementById('detail-saved-money');
  if (detailSavedMoney) detailSavedMoney.textContent = `₺${statsState.savedMoneyTRY}`;

  const detailSavedCO2 = document.getElementById('detail-saved-co2');
  if (detailSavedCO2) detailSavedCO2.textContent = `${statsState.preventedCO2Kg} kg`;
}

function renderStatsView() {
  renderMonthlyWidget();
  renderConsumedHistory();
}

function renderConsumedHistory() {
  const container = document.getElementById('consumed-history-list');
  if (!container) return;

  const consumed = productsState.filter(p => p.consumed);
  if (consumed.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="padding: 20px;">
        <div class="empty-state-icon">✨</div>
        <div class="empty-state-text">Henüz kurtarılan ürün geçmişi yok</div>
        <div class="empty-state-sub">Ürünleri tükettikçe "Tükettim" butonuna basarak buraya ekleyebilirsiniz.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = consumed.map(item => `
    <div class="product-card" style="opacity: 0.85;">
      <div class="product-card-left">
        <div class="product-thumb-box" style="background: var(--color-safe-bg);">${item.icon}</div>
        <div class="product-info">
          <div class="product-name" style="text-decoration: line-through;">${item.name}</div>
          <div class="product-meta-row">
            <span class="product-meta-pill">Kurtarıldı 🌱</span>
            <span>${item.quantity} ${item.unit}</span>
          </div>
        </div>
      </div>
      <div class="days-left-badge safe">Tüketildi ✓</div>
    </div>
  `).join('');
}

// 4. BİLDİRİM NOKTASI RENDER
function renderNotificationBadge() {
  const badgeDot = document.getElementById('header-notif-dot');
  if (!badgeDot) return;

  const urgentCount = productsState.filter(p => !p.consumed && calculateDaysLeft(p.expiryDate).diffDays <= 2).length;
  badgeDot.style.display = urgentCount > 0 ? 'block' : 'none';
}

// ÜRÜN KARTI HTML ÜRETECİ (Modern, yuvarlak köşeli, zengin detaylar)
function createProductCardHtml(item) {
  const { status, label } = calculateDaysLeft(item.expiryDate);
  const formattedDate = formatTurkishDate(item.expiryDate);
  const storageInfo = STORAGE_LOCATIONS[item.storage] || { name: 'Kiler', icon: '🧺' };

  return `
    <div class="product-card" id="card-${item.id}">
      <div class="product-card-left">
        <div class="product-thumb-box">
          ${item.icon}
        </div>
        <div class="product-info">
          <div class="product-name">${item.name}</div>
          <div class="product-meta-row">
            <span class="product-meta-pill">${storageInfo.icon} ${storageInfo.name}</span>
            <span class="product-expiry-date">📅 ${formattedDate}</span>
            <span>• ${item.quantity} ${item.unit}</span>
          </div>
        </div>
      </div>
      
      <div class="product-card-right">
        <div class="days-left-badge ${status}">
          ${label}
        </div>
        <div class="product-quick-actions">
          <button class="action-btn-pill" onclick="handleMarkConsumed('${item.id}')" title="İsraf olmadan tükettim">
            <span>✓</span> Tükettim
          </button>
          <button class="action-btn-pill btn-delete" onclick="handleDeleteProduct('${item.id}')" title="Sil">
            ✕
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// ETKİLEŞİM & İŞLEM HANDLERLARI
// ============================================================

// Ürünü "Tükettim" Olarak İşaretle (İsraf Önleme Başarısı!)
function handleMarkConsumed(productId) {
  const item = productsState.find(p => p.id === productId);
  if (!item) return;

  item.consumed = true;
  saveProducts();

  // İstatistikleri artır (+1 ürün, ortalama ₺30 tasarruf, ~0.7 kg CO2)
  statsState.savedItemsCount += 1;
  statsState.savedMoneyTRY += 30;
  statsState.preventedCO2Kg = +(statsState.preventedCO2Kg + 0.7).toFixed(1);
  saveStats();

  // Konfeti ve kutlama efekti
  triggerConfetti();
  showToast(`🎉 Tebrikler! "${item.name}" kurtarıldı!`);

  renderApp();
}

// Ürünü Sil
function handleDeleteProduct(productId) {
  const item = productsState.find(p => p.id === productId);
  if (!item) return;

  productsState = productsState.filter(p => p.id !== productId);
  saveProducts();

  showToast(`🗑️ "${item.name}" kilerinizden kaldırıldı.`);
  renderApp();
}

// Yeni Ürün Ekleme Formu Gönderimi
function handleAddProductSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('input-prod-name');
  const catInput = document.getElementById('input-prod-cat');
  const dateInput = document.getElementById('input-prod-date');
  const qtyInput = document.getElementById('input-prod-qty');
  const unitInput = document.getElementById('input-prod-unit');

  const name = nameInput.value.trim();
  const category = catInput.value;
  const expiryDate = dateInput.value;
  const quantity = parseFloat(qtyInput.value) || 1;
  const unit = unitInput.value;

  if (!name) {
    showToast('⚠️ Lütfen ürün adını giriniz.');
    nameInput.focus();
    return;
  }

  if (!expiryDate) {
    showToast('⚠️ Lütfen son kullanma tarihini seçiniz.');
    dateInput.focus();
    return;
  }

  const newProduct = {
    id: 'prod_' + Date.now(),
    name: name,
    category: category,
    storage: selectedStorage,
    icon: selectedIcon,
    quantity: quantity,
    unit: unit,
    expiryDate: expiryDate,
    addedDate: new Date().toISOString().split('T')[0],
    consumed: false
  };

  productsState.unshift(newProduct);
  saveProducts();

  // Formu sıfırla
  nameInput.value = '';
  qtyInput.value = '1';
  setDefaultExpiryDate(3);

  // Başarı bildirimi ve ana sayfaya yönlendir
  showToast(`✨ "${newProduct.name}" başarıyla eklendi!`);
  renderApp();
  switchTab('home');
}

// Varsayılan Son Kullanma Tarihini Ayarla
function setDefaultExpiryDate(offsetDays) {
  const dateInput = document.getElementById('input-prod-date');
  if (dateInput) {
    dateInput.value = getOffsetDate(offsetDays);
  }
}

// ============================================================
// TAB & SAYFA YÖNETİMİ
// ============================================================
function switchTab(tabName) {
  activeTab = tabName;

  // Tüm ekranları gizle, aktif olanı göster
  document.querySelectorAll('.view-screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(`view-${tabName}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Alt navigasyon butonlarının durumunu güncelle
  document.querySelectorAll('.nav-tab-item').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Üst sayfaya kaydır
  const scrollContainer = document.querySelector('.app-screen-container');
  if (scrollContainer) scrollContainer.scrollTop = 0;

  renderApp();
}

// ============================================================
// EVENT LISTENERS VE BAĞLANTILAR
// ============================================================
function setupEventListeners() {
  // Alt Menü Butonları
  document.querySelectorAll('.nav-tab-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // Hızlı Kategori Filtre Butonları (Ana Sayfa)
  document.querySelectorAll('.home-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.home-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderHomeView();
    });
  });

  // Kiler Saklama Filtreleri
  document.querySelectorAll('.pantry-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.pantry-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderPantryView();
    });
  });

  // Arama Girişi
  const searchInput = document.getElementById('pantry-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderPantryView();
    });
  }

  // Yeni Ürün Formu Submit
  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', handleAddProductSubmit);
  }

  // İkon Seçici Butonları
  document.querySelectorAll('.icon-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.icon-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedIcon = btn.dataset.icon;
    });
  });

  // Saklama Konumu Butonları
  document.querySelectorAll('.storage-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.storage-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedStorage = btn.dataset.storage;
    });
  });

  // Tarih Kısayolları (+1 gün, +3 gün, +1 hafta)
  document.querySelectorAll('.date-shortcut-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.days, 10);
      setDefaultExpiryDate(days);
    });
  });

  // Hızlı Ürün Adı Etiketleri
  document.querySelectorAll('.quick-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const nameInput = document.getElementById('input-prod-name');
      const catInput = document.getElementById('input-prod-cat');
      if (nameInput) nameInput.value = tag.dataset.name;
      if (catInput && tag.dataset.cat) catInput.value = tag.dataset.cat;
      if (tag.dataset.icon) {
        selectedIcon = tag.dataset.icon;
        document.querySelectorAll('.icon-choice-btn').forEach(b => {
          b.classList.toggle('selected', b.dataset.icon === selectedIcon);
        });
      }
    });
  });

  // Miktar Stepper Butonları
  const btnMinus = document.getElementById('btn-qty-minus');
  const btnPlus = document.getElementById('btn-qty-plus');
  const qtyInput = document.getElementById('input-prod-qty');
  if (btnMinus && btnPlus && qtyInput) {
    btnMinus.addEventListener('click', () => {
      const val = parseFloat(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
    btnPlus.addEventListener('click', () => {
      const val = parseFloat(qtyInput.value) || 1;
      qtyInput.value = val + 1;
    });
  }

  // Bildirim Butonu & Modalı
  const notifBtn = document.getElementById('header-notif-btn');
  const notifModal = document.getElementById('notifications-modal');
  const closeNotifBtn = document.getElementById('close-notif-modal');
  if (notifBtn && notifModal) {
    notifBtn.addEventListener('click', () => {
      populateNotifications();
      notifModal.classList.add('active');
    });
  }
  if (closeNotifBtn && notifModal) {
    closeNotifBtn.addEventListener('click', () => notifModal.classList.remove('active'));
  }

  // Modal dışına tıklayınca kapatma
  if (notifModal) {
    notifModal.addEventListener('click', (e) => {
      if (e.target === notifModal) notifModal.classList.remove('active');
    });
  }

  // Masaüstü Görünüm Değiştirici (Mobil Çerçeve / Geniş Mod)
  const viewPhoneBtn = document.getElementById('btn-view-phone');
  const viewFullBtn = document.getElementById('btn-view-full');
  const desktopWrapper = document.querySelector('.desktop-wrapper');
  if (viewPhoneBtn && viewFullBtn && desktopWrapper) {
    viewPhoneBtn.addEventListener('click', () => {
      desktopWrapper.classList.remove('fullscreen-mode');
      viewPhoneBtn.classList.add('active');
      viewFullBtn.classList.remove('active');
    });
    viewFullBtn.addEventListener('click', () => {
      desktopWrapper.classList.add('fullscreen-mode');
      viewFullBtn.classList.add('active');
      viewPhoneBtn.classList.remove('active');
    });
  }

  // Form başlangıç tarihi: +3 gün
  setDefaultExpiryDate(3);
}

// Bildirim Panelini Doldur
function populateNotifications() {
  const container = document.getElementById('notif-list-container');
  if (!container) return;

  const urgentItems = productsState.filter(p => !p.consumed && calculateDaysLeft(p.expiryDate).diffDays <= 2);

  if (urgentItems.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--color-text-secondary); font-size: 13px;">
        ✅ Bildiriminiz yok. Tüm ürünlerinizin tazeliği kontrol altında!
      </div>
    `;
    return;
  }

  container.innerHTML = urgentItems.map(item => {
    const calc = calculateDaysLeft(item.expiryDate);
    return `
      <div style="padding: 12px; background: var(--color-offwhite-bg); border-radius: var(--radius-md); margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">${item.icon}</span>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: var(--color-primary-dark);">${item.name}</div>
            <div style="font-size: 11px; color: var(--color-urgent-text); font-weight: 600;">Son Tüketim: ${calc.label}</div>
          </div>
        </div>
        <button class="action-btn-pill" onclick="handleMarkConsumed('${item.id}'); document.getElementById('notifications-modal').classList.remove('active');">
          Tükettim
        </button>
      </div>
    `;
  }).join('');
}

// ============================================================
// TOAST VE BİLDİRİM AÇILIRLARI
// ============================================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  container.appendChild(toast);

  // Animasyonla aç
  setTimeout(() => toast.classList.add('show'), 10);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ============================================================
// KONFETİ EFEKTİ (BAŞARI VE İSRAF ÖNLEME KUTLAMASI)
// ============================================================
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;

  const particles = [];
  const colors = ['#9ED4B1', '#3B7D5C', '#183A2B', '#FEF4E4', '#FFD166', '#06D6A0'];

  for (let i = 0; i < 45; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
      r: Math.random() * 5 + 3,
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.7) * 9,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      alpha: 1
    });
  }

  let animationFrame;
  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.25; // yer çekimi
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        activeParticles++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(renderParticles);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  renderParticles();
}
