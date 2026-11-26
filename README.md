# ChemFlow Mini MES — Kimyasal Proses Optimizasyonu ve Akıllı İzleme Sistemi

**Proje Hazırlama ve Yönetimi Dersi** kapsamında geliştirilen disiplinler arası **Kimyasal Üretim Tesisinde Proses (Sıcaklık/pH) Optimizasyonu ve Akıllı İzleme Sistemi (Mini MES)** web paneli ve simülasyon prototipidir.

## Disiplinlere Göre Modül Mimarisi

| Disiplin | Projede Karşılık Gelen Modül | Dosya |
| :--- | :--- | :--- |
| **Kimya** | Reaksiyon seçimi, ideal/kritik Sıcaklık & pH bantları, teorik verim | `src/config/processConfig.ts` |
| **Endüstri Mühendisliği** | Enerji birim maliyeti, duruş maliyeti, OEE ve süreç akışı | `src/engine/processModel.ts`, `src/components/AnalyticsView.tsx` |
| **Matematik** | Sıcaklık/pH salınımlarının enerji ve verime etkisi, Z-anomali skoru | `src/engine/processModel.ts` |
| **Elektrik-Elektronik** | Mantıksal veri akış şeması, ardışık ihlal (debounce) ve histerezis alarm mantığı | `src/engine/alarmEngine.ts`, `src/components/ArchitectureFlowView.tsx` |
| **Bilgisayar Mühendisliği** | Canlı SCADA/MES web paneli, grafikler, senaryo simülatörü, CSV/JSON dışa aktarım | `src/components/*`, `src/App.tsx` |

## Özellikler

- **Canlı İzleme Paneli:** Sıcaklık (°C) ve pH zaman serisi grafikleri (ideal bant ve kritik eşik çizgileriyle), Enerji (kW) & Verim (%) korelasyon grafiği.
- **Akıllı Alarm Merkezi:** Normal / Uyarı / Kritik seviyeleri, yalancı alarmı önleyen ardışık ihlal sayacı, operatör aksiyon önerileri ve onaylama (acknowledge).
- **Senaryo & Sapma Simülatörü:** *Normal Üretim*, *Optimize Kontrol (PID)*, *Sıcaklık Salınımı*, *pH Kayması* ve *Kritik Arıza* senaryoları + canlı test için manuel Sıcaklık/pH ofset kaydırıcıları.
- **Enerji & İstatistik Sekmesi:** Sapma vs. Enerji regresyon dağılımı, istatistiksel anomali skoru (Z-indeksi), canlı matematiksel denklem ve maliyet/OEE özeti.
- **Veri Akışı & Alarm Sekmesi:** Elektrik-Elektronik mantıksal veri akış şeması, Endüstri süreç akışı ve Alarm Karar Matrisi.
- **Ekip Parametreleri Sekmesi:** Grup üyelerinin getirdiği değerleri kod değiştirmeden canlı güncelleme, JSON dışa aktarım ve CSV telemetri indirme.

## Kurulum ve Çalıştırma

```bash
npm install
npm run dev
```

Üretim derlemesi almak için:

```bash
npm run build
npm run preview
```

## Ekip Veri Toplama Şablonu

Diğer disiplinlerdeki grup arkadaşlarının teslim edeceği parametrelerin özet listesi için [docs/ekip-veri-sablonu.md](docs/ekip-veri-sablonu.md) dosyasına bakın.
