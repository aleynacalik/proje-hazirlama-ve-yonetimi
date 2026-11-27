# Ekip İçi Veri & Parametre Teslim Şablonu

Bu dosya, 5 disiplin arasındaki veri sözleşmesini tutar. Her ekip üyesi kendi bölümünü netleştirdiğinde değerleri buraya yazar ve bu değerler doğrudan Mini MES web panelinin **Ekip Parametreleri** sekmesine (`src/config/processConfig.ts`) aktarılır.

---

## 1. Kimya Ekibi Çıktısı
- **Seçilen Kimyasal Reaksiyon:** *(Örn: Biyodizel transesterifikasyonu / Esterleşme / Nötralizasyon)*
- **İdeal Sıcaklık Aralığı:** Min `___ °C` | Optimum `___ °C` | Max `___ °C`
- **Kritik Sıcaklık Sınırları:** Alt Kritik `___ °C` | Üst Kritik `___ °C`
- **İdeal pH Aralığı:** Min `___` | Optimum `___` | Max `___`
- **Kritik pH Sınırları:** Alt Kritik `___` | Üst Kritik `___`
- **Teorik Maksimum Verim (%):** `___ %`
- **Sapma Durumunda Kimyasal Etki (Yan ürün / verim kaybı):** `___`
- **Akademik Kaynaklar (APA):**
  1. ...

## 2. Endüstri Mühendisliği Çıktısı
- **Elektrik Birim Maliyeti:** `4,81 TL/kWh` (sanayi, tek zamanlı, vergi ve fonlar hariç)
- **Planlanmamış Duruş Maliyeti:** `6500 TL/saat` (demo varsayımı)
- **Taban Proses Enerji Tüketimi:** `42 kW` (demo varsayımı)
- **Nominal Parti Çıktısı:** `1200 kg` (demo varsayımı)
- **Hedef OEE (%):** `85 %` (proje hedefi)
- **Süreç Akış Adımları:** Hammadde ve reaktif besleme → Reaktör → Enerji ve ısı yönetimi → Kalite kontrol ve parti çıkışı
- Ayrıntı: [Endüstri maliyet ve OEE notu](endustri-maliyet-oee.md)

## 3. Matematik Ekibi Çıktısı
- **Enerji Tüketimi İstatistiksel Modeli:**
  `E(T, pH) = E_base + b1*|T - T_opt| + b2*(ΔT)^2 + b3*|pH - pH_opt| + b4*(ΔpH)^2`
  - `b1` (Sıcaklık sapma katsayısı): `___`
  - `b2` (Sıcaklık salınım cezası): `___`
  - `b3` (pH sapma katsayısı): `___`
  - `b4` (pH salınım cezası): `___`
- **Anomali Eşik Değeri (Z-Skoru / Eşik Algoritması):** `___`
- **Verim Düşüş Katsayıları (`α_T`, `α_pH`):** `___`

## 4. Elektrik-Elektronik Mühendisliği Çıktısı
- **Mantıksal Veri Akışı:** Sensör/Simülatör → Veri Toplama/Filtre → Optimizasyon Motoru → Alarm Mantığı → Mini MES
- **Yalancı Alarm Engelleme (Ardışık İhlal Sayısı):** `___` ölçüm
- **Histerezis Bandı:** Sıcaklık `±___ °C`, pH `±___`
- **Örnekleme Periyodu:** `___ sn`
- **Otomatik Koruma Kilidi (Interlock) Kuralı:** Kritik eşikte hangi aksiyon devreye girer?
