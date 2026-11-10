/**
 * TazeKal — Veri Modeli ve Başlangıç Örnek Ürünleri
 */

// Gün ekleme fonksiyonu (Tarihlerin her zaman dinamik ve güncel kalması için)
function getOffsetDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Kategoriler
const CATEGORIES = {
  dairy: { id: 'dairy', name: 'Süt & Kahvaltılık', icon: '🥛', color: '#EBF7F0' },
  produce: { id: 'produce', name: 'Meyve & Sebze', icon: '🥬', color: '#EAF5EC' },
  meat: { id: 'meat', name: 'Et & Balık', icon: '🥩', color: '#FDF2E9' },
  bakery: { id: 'bakery', name: 'Fırın & Ekmek', icon: '🥖', color: '#FEF9E7' },
  drinks: { id: 'drinks', name: 'İçecekler', icon: '🧃', color: '#EBF5FB' },
  pantry: { id: 'pantry', name: 'Kuru Gıda', icon: '🌾', color: '#F5EEF8' },
};

// Saklama Konumları
const STORAGE_LOCATIONS = {
  fridge: { id: 'fridge', name: 'Buzdolabı', icon: '❄️' },
  freezer: { id: 'freezer', name: 'Dondurucu', icon: '🧊' },
  pantry: { id: 'pantry', name: 'Kiler', icon: '🧺' },
};

// Başlangıç Mock Ürün Verileri
const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Tam Yağlı Günlük Süt',
    category: 'dairy',
    storage: 'fridge',
    icon: '🥛',
    quantity: 1,
    unit: 'Litre',
    expiryDate: getOffsetDate(0), // Bugün!
    addedDate: getOffsetDate(-3),
    consumed: false
  },
  {
    id: 'prod_2',
    name: 'Taze Tarla Çileği',
    category: 'produce',
    storage: 'fridge',
    icon: '🍓',
    quantity: 500,
    unit: 'Gram',
    expiryDate: getOffsetDate(1), // 1 gün kaldı
    addedDate: getOffsetDate(-2),
    consumed: false
  },
  {
    id: 'prod_3',
    name: 'Bebek Ispanak',
    category: 'produce',
    storage: 'fridge',
    icon: '🥬',
    quantity: 1,
    unit: 'Paket',
    expiryDate: getOffsetDate(0), // Bugün!
    addedDate: getOffsetDate(-2),
    consumed: false
  },
  {
    id: 'prod_4',
    name: 'Tavuk Göğsü Fileto',
    category: 'meat',
    storage: 'fridge',
    icon: '🍗',
    quantity: 600,
    unit: 'Gram',
    expiryDate: getOffsetDate(2), // 2 gün kaldı
    addedDate: getOffsetDate(-1),
    consumed: false
  },
  {
    id: 'prod_5',
    name: 'Ekşi Mayalı Ekmek',
    category: 'bakery',
    storage: 'pantry',
    icon: '🥖',
    quantity: 1,
    unit: 'Adet',
    expiryDate: getOffsetDate(2), // 2 gün kaldı
    addedDate: getOffsetDate(-1),
    consumed: false
  },
  {
    id: 'prod_6',
    name: 'Organik Köy Yumurtası',
    category: 'dairy',
    storage: 'fridge',
    icon: '🥚',
    quantity: 10,
    unit: 'Adet',
    expiryDate: getOffsetDate(3), // 3 gün kaldı
    addedDate: getOffsetDate(-4),
    consumed: false
  },
  {
    id: 'prod_7',
    name: 'Taze Kaşar Peyniri',
    category: 'dairy',
    storage: 'fridge',
    icon: '🧀',
    quantity: 400,
    unit: 'Gram',
    expiryDate: getOffsetDate(5), // 5 gün kaldı
    addedDate: getOffsetDate(-5),
    consumed: false
  },
  {
    id: 'prod_8',
    name: 'Somon Fileto',
    category: 'meat',
    storage: 'freezer',
    icon: '🐟',
    quantity: 2,
    unit: 'Porsiyon',
    expiryDate: getOffsetDate(7), // 7 gün kaldı
    addedDate: getOffsetDate(-1),
    consumed: false
  },
  {
    id: 'prod_9',
    name: 'Süzme Yoğurt',
    category: 'dairy',
    storage: 'fridge',
    icon: '🥣',
    quantity: 900,
    unit: 'Gram',
    expiryDate: getOffsetDate(9), // 9 gün kaldı
    addedDate: getOffsetDate(-2),
    consumed: false
  }
];

// Başlangıç İsraf Tasarrufu İstatistikleri
const INITIAL_STATS = {
  savedItemsCount: 16,
  savedMoneyTRY: 480,
  preventedCO2Kg: 11.2,
  wastedItemsCount: 2
};

// Akıllı Tarif Önerileri
const RECIPE_SUGGESTIONS = [
  {
    id: 'rec_1',
    title: 'Çilekli & Muzlu Taze Smoothie',
    desc: 'Bugün tüketilmesi gereken çilek ve sütünü lezzetli ve besleyici bir içeceğe dönüştürün.',
    ingredients: ['🍓 Çilek', '🥛 Süt', '🍯 Bal'],
    timeMinutes: 5,
    difficulty: 'Çok Kolay'
  },
  {
    id: 'rec_2',
    title: 'Ispanaklı & Kaşarlı Fırın Omlet',
    desc: 'Dolaptaki bebek ıspanak ve köy yumurtalarıyla 10 dakikada doyurucu bir akşam yemeği.',
    ingredients: ['🥬 Ispanak', '🥚 Yumurta', '🧀 Kaşar'],
    timeMinutes: 12,
    difficulty: 'Kolay'
  },
  {
    id: 'rec_3',
    title: 'Fırında Çıtır Ekmek Dilimleri (Kruton)',
    desc: 'Bayatlamaya başlayan ekşi mayalı ekmeği zeytinyağı ve kekikle fırınlayıp çorbalara ekleyin.',
    ingredients: ['🥖 Ekmek', '🌿 Kekik & Sarımsak', '🫒 Zeytinyağı'],
    timeMinutes: 15,
    difficulty: 'Kolay'
  }
];
