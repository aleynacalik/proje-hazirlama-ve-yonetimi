# Ekip İçi Veri & Parametre Teslim Şablonu

Bu dosya, 5 disiplin arasındaki veri sözleşmesini tutar. Her ekip üyesi kendi bölümünü netleştirdiğinde değerleri buraya yazar ve bu değerler doğrudan Mini MES web panelinin **Ekip Parametreleri** sekmesine (`src/config/processConfig.ts`) aktarılır.

---

## 1. Kimya Ekibi Çıktısı
- **Seçilen Kimyasal Reaksiyon:** *Aspergillus niger* ile glukozdan sitrik asit üretimi (`C6H12O6 + 1.5 O2 → C6H8O7 + 2 H2O`)
- **İdeal Sıcaklık Aralığı:** Min `28 °C` | Optimum `30 °C` | Max `32 °C` (demo)
- **Kritik Sıcaklık Sınırları:** Alt Kritik `25 °C` | Üst Kritik `37 °C` (demo)
- **İdeal pH Aralığı:** Min `2,0` | Optimum `2,5` | Max `3,0` (üretim evresi; demo)
- **Kritik pH Sınırları:** Alt Kritik `1,5` | Üst Kritik `4,0` (demo)
- **Teorik Maksimum Verim (%):** `%100` teorik dönüşüm (~`1,067 g sitrik asit / g glukoz`); Panel baz verimi: `%80` (demo hedefi)
- **Sapma Durumunda Kimyasal Etki (Yan ürün / verim kaybı):** Düşük sıcaklık reaksiyon hızını, yüksek sıcaklık enzim faaliyetini olumsuz etkileyebilir. Üretim evresinde düşük pH oksalik/glukonik asit gibi yan ürünleri baskılayabilir; etkiler suşa bağlıdır.
- **Akademik Kaynaklar:**
  1. *Citric acid bioproduction and downstream processing: Status, opportunities, and challenges* (2021), Bioresource Technology. https://doi.org/10.1016/j.biortech.2020.124426
  2. *An overview of key industrial product citric acid production by Aspergillus niger and its application* (2025), Journal of Industrial Microbiology & Biotechnology. https://doi.org/10.1093/jimb/kuaf007
  3. *Systems metabolic engineering for citric acid production by Aspergillus niger in the post-genomic era* (2019), Microbial Cell Factories. https://doi.org/10.1186/s12934-019-1064-6
- Ayrıntı: [Kimya proses notu](kimya-proses-notu.md) | [Kimya ekip şablonu](kimya-ekip-sablonu.md)

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
