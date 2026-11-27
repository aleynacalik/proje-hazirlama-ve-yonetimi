# ChemFlow Mini MES – Kimya katkısı

## 1. Seçilen proses ve kapsam

Glukozun *Aspergillus niger* ile aerobik, sıvı ortam fermantasyonu yoluyla sitrik aside dönüştürülmesi modellenir. Panel, inokulum gelişimini değil sitrik asidin üretim evresini temsil eder. Besiyeri, suş, havalandırma ve iz elementler gerçek verimi etkiler; bu çalışma bir eğitim simülasyonudur, gerçek tesis işletme veya emniyet talimatı değildir.

İdeal net stokiyometri (susuz sitrik asit için):

`C6H12O6 + 1.5 O2 → C6H8O7 + 2 H2O`

Bu denklem hücre büyümesi, yan ürün ve bakım metabolizmasını içermez. Oksijen gereksinimi ve karbon kayıpları gerçek proseste farklı olabilir.

## 2. Panel parametreleri

| Parametre | Değer | Dayanak |
|---|---:|---|
| Sıcaklık hedefi | 30 °C | [1], [2] |
| İdeal sıcaklık alt/üst | 28 / 32 °C | 30 °C çevresinde demo kontrol bandı; deneysel sınır değildir |
| Kritik sıcaklık alt/üst | 25 / 37 °C | Demo alarm eşiği; fiziksel güvenlik sınırı değildir |
| pH hedefi | 2,5 | [1], [3]; üretim evresine yönelik model seçimi |
| İdeal pH alt/üst | 2,0 / 3,0 | Demo kontrol bandı; [1] ile uyumlu düşük pH yaklaşımı |
| Kritik pH alt/üst | 1,5 / 4,0 | Demo alarm eşiği; doğrulanmış proses güvenlik sınırı değildir |
| Teorik ürün verimi | 1,067 g/g glukoz (yaklaşık) | [3], stokiyometri |
| Baz verim (`baseYieldPct`) | %80 | Teorik maksimuma göre demo hedefi; deneysel veri değildir |

pH başlangıç değeri ile üretim evresindeki pH aynı değildir. Bazı çalışmalarda başlangıç pH'ı yaklaşık 5 iken üretim boyunca pH 2'nin altına düşebilmektedir. Panelde 2,5 sabit hedefi yalnızca üretim evresi için kabul edilmiştir. Kaynaklar 28–32 °C veya kritik aralıkların tamamını deneysel optimum veya güvenlik sınırı olarak doğrulamaz.

## 3. Kimyasal etkiler ve ekip arayüzü

- Düşük sıcaklık metabolik reaksiyon hızını azaltabilir; yüksek sıcaklık enzim faaliyetini ve üretim verimini olumsuz etkileyebilir [1, 2].
- Üretim evresinde düşük pH, oksalik ve glukonik asit gibi yan ürünlerin oluşumunu baskılayabilir [1]. Aşırı düşük pH'ın etkisi suşa ve koşullara bağlıdır; demo alt alarmı bu nedenle bir varsayımdır.
- Sıcaklık/pH değişiminin verim ve enerjiye etkisi Matematik ekibinin katsayılarıyla modellenmelidir. Bu katkı katsayıları, enerji tüketimi veya alarm gecikmelerini değiştirmez.
- EEM ekibi, ardışık ölçüm sayısını ve alarm mantığını belirler. Kimya tarafı yalnızca sayısal eşikleri sağlar.
- Endüstri ekibinin elektrik fiyatı, duruş maliyeti, OEE ve parti çıktısı ayarları korunur.

## 4. Süreç akışı (kavramsal)

Glukozlu besiyeri hazırlama → inokulum gelişimi → aerobik fermantasyon ve sitrik asit birikimi (panelin temsil ettiği evre) → biyokütle ayırma → ürün saflaştırma → ürün. Sıcaklık ve pH ölçümleri üretim evresinde modele girer; enerji ve alarm hesapları diğer ekiplerin modüllerine bağlıdır.

## 5. Örnek verim hesabı

1 mol glukozdan ideal olarak 1 mol sitrik asit oluşur. Molar kütleler yaklaşık 180,16 ve 192,12 g/mol olduğundan `Y_teorik = 192,12 / 180,16 ≈ 1,0664 g/g` (literatürde yuvarlatılmış 1,067 g/g [3]).

`Verim (%) = 100 × m_sitrik_asit / (1,067 × m_glukoz)`

Örnek: 1000 kg glukoz için teorik ürün 1067 kg, %80 hedefte yaklaşık 853,6 kg susuz sitrik asittir. Bu yalnızca stokiyometrik örnektir; Endüstri modülünün 1200 kg parti varsayımıyla aynı fiziksel parti olduğu iddia edilmez. %80 reaksiyon verimi, %85 OEE gibi işletme performansı göstergelerinden farklıdır.

## 6. Kaynaklar

1. *Citric acid bioproduction and downstream processing: Status, opportunities, and challenges* (2021), Bioresource Technology. https://doi.org/10.1016/j.biortech.2020.124426 — fermantasyon koşulları ve düşük pH etkisi.
2. *An overview of key industrial product citric acid production by Aspergillus niger and its application* (2025), Journal of Industrial Microbiology & Biotechnology. https://doi.org/10.1093/jimb/kuaf007 — sıcaklık, pH ve üretim evreleri.
3. *Systems metabolic engineering for citric acid production by Aspergillus niger in the post-genomic era* (2019), Microbial Cell Factories. https://doi.org/10.1186/s12934-019-1064-6 — teorik verim ve düşük pH'da üretim. Tam metin: https://pmc.ncbi.nlm.nih.gov/articles/PMC6362574/

## 7. Entegrasyon

`scripts/apply-chemistry.cjs` mevcut `src/config/processConfig.ts` dosyasındaki `fermentation` preset'ini TypeScript sözdizimi ağacı üzerinden bulur, yalnızca kimya alanlarını değiştirir ve README'ye bu nota bağlantı ekler. Mevcut varsayılan proses seçimini ve diğer ekiplerin alanlarını korur. Eksik alan veya belirsiz eşleşme varsa yazmadan hata verir. `npm ci` (kilit dosyası varsa) sonrasında `node scripts/apply-chemistry.cjs` çalıştırılmalıdır. `docs/kimya-ekip-sablonu.md` mevcut ekip şablonuna aktarılacak metindir; gerçek şablonun güncel yolu ve içeriği doğrulanamadığı için otomatik üzerine yazılmaz. Panelde fermantasyon seçilmeli ve Uygula düğmesine basılmalıdır. Tarayıcıdaki eski ayarların üzerine yazmadan önce diğer ekip değerlerini not alın.
