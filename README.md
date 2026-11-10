# 🥗 TazeKal — Akıllı Gıda & Son Kullanma Tarihi Takip Uygulaması

**TazeKal**, kullanıcıların mutfaklarındaki ve kilerlerindeki son tüketim tarihi yaklaşan ürünleri kolayca takip etmelerini, israfı önlemelerini ve tasarruf etmelerini sağlayan modern ve minimalist bir mobil uygulamadır.

---

## 🎨 Tasarım Özellikleri

- **Renk Paleti:**
  - **Pastel Yeşil (`#9ED4B1`, `#EBF7F0`):** Tazelik, ferahlık ve güven hissi.
  - **Koyu Orman Yeşili (`#183A2B`, `#255A43`):** Doğallık, net okunabilirlik ve modern kontrast.
  - **Kırık Beyaz (`#F6F8F5`):** Gözü yormayan sıcak, temiz ve minimalist zemin.
  - **Durum Rozetleri:**
    - 🚨 **Kritik / Bugün (Kırmızı/Mercan):** 0-1 gün kalanlar için acil uyarı.
    - ⚠️ **Yaklaşan (Kehribar/Sarı):** 2-3 gün kalanlar için dikkat.
    - 🌿 **Güvenli (Pastel Yeşil):** 4+ gün kalan taze ürünler.
- **Tipografi:** Plus Jakarta Sans ile yüksek okunabilirlik ve modern iOS/Android hissi.
- **Kart Mimarisi:** Yuvarlak köşeli (`border-radius: 24px`), yumuşak gölgeli, dokunsal kartlar.
- **Mobil Ekran Önceliği:** Hem doğrudan mobil cihazlarda tam ekran, hem de masaüstünde modern bir telefon çerçevesi (iPhone simülasyonu) ile mükemmel görüntüleme.

---

## 📱 Ana Sayfa Bölümleri

1. **Logo & Bildirim Simgesi:** TazeKal amblemi ve acil ürünler için anlık uyarı rozeti.
2. **Kişiselleştirilmiş Karşılama:** Kullanıcıyı motive eden ve mutfak durumunu özetleyen mesaj.
3. **Acil Tüketim Özeti Kartı:** Son 48 saatte tüketilmesi gereken ürün sayısını ve tahmini kurtarılacak değeri gösteren özel vurgu alanı.
4. **Kategori Filtreleri (Chips):** Tümü, Acil (≤ 2 Gün), Süt & Kahvaltılık, Meyve & Sebze, Et & Balık, Fırın.
5. **Öncelikli Ürün Kartları:**
   - Ürün fotoğrafı / ikonu (🥛, 🍓, 🥬 vb.)
   - Ürün adı ve saklama konumu (❄️ Buzdolabı, 🧊 Dondurucu, 🧺 Kiler)
   - Son kullanma tarihi ve kalan gün rozeti
   - Hızlı "✓ Tükettim" butonu (kutlama konfetisi ve tasarruf puanı kazandırır)
   - Hızlı "✕ Sil" butonu
6. **Aylık İsraf Önleme İstatistikleri:**
   - Kurtarılan ürün adedi
   - Kurtarılan tahmini bütçe (₺)
   - Engellenen CO₂ salımı (kg)
   - Başarı ilerleme çubuğu (%88)
7. **Alt Navigasyon Menüsü:**
   - 🏠 **Ana Sayfa**
   - 🧺 **Kilerim:** Arama çubuğu ve saklama alanına göre filtreleme
   - ➕ **Hızlı Ekle:** Özel yükseltilmiş (FAB) buton
   - 💡 **Tarifler:** Evdeki acil ürünlerle yapılabilecek akıllı tarifler
   - 📊 **İstatistik:** Kurtarılan gıdalar geçmişi ve analiz

---

## ➕ Ürün Ekleme Ekranı & 📷 Barkod Tarama

- **📷 Barkod ile Otomatik Doldurma:**
  - Cihaz kamerası üzerinden **EAN-13** ve **EAN-8** formatındaki gıda barkodlarını anlık tarama.
  - Modern tarayıcılarda donanım hızlandırmalı `BarcodeDetector` API, diğer cihazlarda `Html5Qrcode` fallback desteği.
  - Taranan barkodu **Open Food Facts API** üzerinden sorgulayarak ürün adı, marka ve kategori bilgilerini otomatik doldurma.
  - Kamera kapatma: Tarama tamamlandığında veya modal kapatıldığında kamera donanımı anında kapatılır.
  - Kamera izni verilmediğinde veya kamerası olmayan cihazlarda **manuel barkod numarası yazma ve sorgulama** desteği.
  - Ürün veritabanında bulunamadığında kullanıcıyı bilgilendirerek manuel girişe imkan tanıma.
  - **Son Kullanma Tarihi Güvenliği:** Barkoddan SKT tahmini yapılmaz; tarih, miktar ve saklama konumu kullanıcı tarafından güvenle belirlenir.
- **Fotoğraf / İkon Seçimi:** 12 farklı popüler gıda ikonu.
- **Ürün Adı:** Hızlı öneri etiketleriyle tek tıkla tamamlama (+ Süt, + Yumurta, + Çilek...).
- **Kategori:** Süt & Kahvaltı, Meyve & Sebze, Et & Balık, Fırın, İçecek, Kuru Gıda.
- **Saklama Yeri:** Buzdolabı, Dondurucu veya Kiler seçimi.
- **Son Kullanma Tarihi (SKT):** Hızlı butonlar (+1 Gün, +3 Gün, +1 Hafta, +2 Hafta) veya takvim.
- **Miktar / Adet:** Artırıp azaltılabilir sayaç ve birim seçici (Adet, Paket, Gram, Kg, Litre).
- **Kayıt:** Form kaydedildiğinde ürün doğrudan Kilerim ve Ana Sayfa listesine eklenir.

---

## 🚀 Tarayıcıda Çalıştırma ve Önizleme

Projeyi yerel olarak açmak için iki kolay yol vardır:

### Yöntem 1: Yerel Sunucu ile (Tavsiye Edilen)
Terminalde proje dizinindeyken:
```bash
ruby server.rb
```
Ardından tarayıcınızdan açın:
👉 **[http://localhost:3000](http://localhost:3000)**

### Yöntem 2: Doğrudan Tarayıcıda Açma
Finder üzerinden veya terminalden `index.html` dosyasını tarayıcınıza sürükleyip bırakabilirsiniz:
```bash
open index.html
```

---

## 🛠️ Gelecek Geliştirme Yol Haritası (Sonraki Aşamalar)
1. **Veritabanı Entegrasyonu:** Supabase veya Firebase Firestore ile çoklu cihaz eşitlemesi.
2. **Kullanıcı Girişi:** Apple ID & Google Sign-In.
3. **Fiş Tarama (AI OCR):** Market fişini taratarak tüm ürünleri otomatik kilere aktarma.
4. **Push Bildirimleri:** SKT'ye 1 gün ve 3 gün kala telefon bildirimleri gönderme.
