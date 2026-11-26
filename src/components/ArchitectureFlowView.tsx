import { ArrowRight } from 'lucide-react';
import type { BreachTracker, ProcessConfig, SensorReading } from '../types/process';

interface ArchitectureFlowViewProps {
  latest: SensorReading;
  tracker: BreachTracker;
  config: ProcessConfig;
}

export function ArchitectureFlowView({ latest, tracker, config }: ArchitectureFlowViewProps) {
  const channels = [tracker.temperature, tracker.ph, tracker.anomaly];
  const hasFault = channels.some((channel) => channel.faultId);
  const isCritical = channels.some((channel) => channel.active?.violation.endsWith('critical'));
  const isWarning = channels.some((channel) => channel.active);

  const pipelineStages = [
    {
      step: '01',
      owner: 'Kimya / Saha',
      title: 'Sanal Sensör Katmanı',
      metric: `${latest.temperature.toFixed(1)}°C | pH ${latest.ph.toFixed(2)}`,
      detail: 'PT100 sıcaklık ve pH elektrot okumaları sentetik veri akışıyla üretilir.',
      highlight: 'border-[#D6D3C9] bg-white text-[#181816]',
    },
    {
      step: '02',
      owner: 'Elektrik-Elektronik',
      title: 'Ölçüm Doğrulama',
      metric: `Δt = ${(config.electrical.samplingIntervalMs / 1000).toFixed(1)} sn`,
      detail: 'Sonlu sıcaklık ve 0–14 aralığında sonlu pH değeri kontrol edilir.',
      highlight: 'border-[#D6D3C9] bg-white text-[#1B4965]',
    },
    {
      step: '03',
      owner: 'Matematik',
      title: 'İstatistiksel Analiz',
      metric: `Z=${latest.anomalyScore.toFixed(2)} | ${latest.energyKw} kW`,
      detail: 'Salınım varyansı, enerji yükü ve teorik verim düşüşü gerçek zamanlı hesaplanır.',
      highlight: 'border-[#D6D3C9] bg-white text-[#181816]',
    },
    {
      step: '04',
      owner: 'Elektrik-Elektronik',
      title: 'Alarm Mantığı',
      metric: hasFault ? 'VERİ HATASI' : isCritical ? 'KRİTİK ALARM' : isWarning ? 'UYARI AKTİF' : 'NORMAL',
      detail: 'Aynı yönde ardışık ölçümler uyarı açar. Histerezis kapanış bandını belirler.',
      highlight: isCritical
        ? 'border-[#C82333] bg-[#FBE6E8] text-[#A81C28]'
        : isWarning
          ? 'border-[#D99B38] bg-[#FDF1DC] text-[#9A5204]'
          : 'border-[#B8D4C7] bg-[#E6EFEA] text-[#1E5641]',
    },
    {
      step: '05',
      owner: 'Bilgisayar / Endüstri',
      title: 'Mini MES Konsolu',
      metric: `OEE %${latest.oeePct.toFixed(0)} | ${latest.energyCostPerHour.toFixed(0)} ₺/sa`,
      detail: 'Operatör arayüzü, canlı grafikler, maliyet takibi ve CSV raporlama.',
      highlight: 'border-[#D6D3C9] bg-white text-[#1E5641]',
    },
  ];

  const { chemistry, electrical } = config;

  return (
    <div className="space-y-4">
      {/* Logical Data Flow Schematic */}
      <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#E5E2D9] pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
              SİSTEM MİMARİSİ
            </span>
            <h3 className="text-sm font-semibold text-[#181816]">
              Mantıksal Veri Akış Şeması (EEM &amp; Yazılım Katmanları)
            </h3>
            <p className="text-[11px] text-[#64625A]">
              Fiziksel donanım/lehimleme olmadan uçtan uca veri boru hattı — değerler anlık güncellenir
            </p>
          </div>
          <span className="rounded-[3px] border border-[#D6D3C9] bg-white px-2.5 py-1 font-mono text-[11px] text-[#35342F]">
            Sayaç: T={tracker.temperature.count} / pH=
            {tracker.ph.count}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.step} className="relative flex flex-col">
              <div className="flex h-full flex-col justify-between rounded-[4px] border border-[#D6D3C9] bg-white p-3.5">
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-semibold text-[#78756C]">ADIM {stage.step}</span>
                    <span className="text-[#64625A]">{stage.owner}</span>
                  </div>
                  <h4 className="mt-2 text-xs font-semibold text-[#181816]">{stage.title}</h4>
                  <div
                    className={`mt-2.5 rounded-[3px] border px-2 py-1.5 font-mono text-[11px] font-semibold tabular-nums ${stage.highlight}`}
                  >
                    {stage.metric}
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-[#64625A]">{stage.detail}</p>
              </div>

              {idx < pipelineStages.length - 1 && (
                <div className="hidden items-center justify-center lg:absolute lg:-right-3 lg:top-1/2 lg:z-10 lg:flex lg:-translate-y-1/2">
                  <div className="rounded-full border border-[#BDB9AC] bg-[#FAF9F5] p-1 text-[#181816]">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Process Flow + Alarm Decision Matrix */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-5">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
              ENDÜSTRİ MÜHENDİSLİĞİ
            </span>
            <h3 className="text-sm font-semibold text-[#181816]">Üretim Süreç Akışı</h3>
            <p className="text-[11px] text-[#64625A]">
              Hammadde girişinden kalite kontrole kadar maliyet ve verimlilik istasyonları
            </p>
          </div>

          <div className="mt-3.5 space-y-2">
            {[
              {
                code: 'OP-10',
                title: 'Hammadde & Reaktif Besleme',
                desc: `Nominal parti: ${config.industrial.nominalBatchOutputKg} kg • Ön ısıtma ve pH tampon hazırlığı`,
                status: 'HAZIR',
              },
              {
                code: 'OP-20',
                title: `Ana Kimyasal Reaktör (${chemistry.reactorId})`,
                desc: `Anlık: ${latest.temperature.toFixed(1)}°C | pH ${latest.ph.toFixed(2)} • Hedef: ${chemistry.tempMin}–${chemistry.tempMax}°C`,
                status:
                  latest.overallStatus === 'normal'
                    ? 'İDEAL'
                    : latest.overallStatus === 'warning'
                      ? 'UYARI'
                      : 'KRİTİK',
              },
              {
                code: 'OP-30',
                title: 'Enerji & Isı Değiştirici Yönetimi',
                desc: `Güç: ${latest.energyKw} kW (${latest.energyCostPerHour.toFixed(0)} ₺/sa) • Taban: ${config.industrial.baseEnergyKw} kW`,
                status: latest.energyKw <= config.industrial.baseEnergyKw * 1.1 ? 'VERİMLİ' : 'YÜKSEK',
              },
              {
                code: 'OP-40',
                title: 'Kalite Kontrol & Parti Çıkışı',
                desc: `Reaksiyon verimi: %${latest.yieldPct.toFixed(1)} • Anlık OEE: %${latest.oeePct.toFixed(1)}`,
                status: latest.yieldPct >= 90 ? 'ONAYLI' : 'SAPMA',
              },
            ].map((node) => (
              <div
                key={node.code}
                className="flex items-start justify-between gap-3 rounded-[4px] border border-[#DFDDD4] bg-white p-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="rounded-[2px] bg-[#181816] px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
                    {node.code}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[#181816]">{node.title}</p>
                    <p className="mt-0.5 text-[11px] text-[#64625A]">{node.desc}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-[3px] border border-[#D6D3C9] bg-[#F2F1EC] px-2 py-0.5 font-mono text-[10px] font-medium text-[#35342F]">
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EEM Alarm Decision Matrix */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-5">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
              ELEKTRİK-ELEKTRONİK KURAL TABLOSU
            </span>
            <h3 className="text-sm font-semibold text-[#181816]">Alarm Karar Matrisi</h3>
            <p className="text-[11px] text-[#64625A]">
              Başvuru formundaki Yöntem ve Ekler bölümüne doğrudan eklenebilir karar tablosu
            </p>
          </div>

          <div className="mt-3.5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#D6D3C9] font-mono text-[10px] uppercase text-[#64625A]">
                  <th className="py-2 pr-3">Seviye</th>
                  <th className="py-2 pr-3">Sıcaklık</th>
                  <th className="py-2 pr-3">pH</th>
                  <th className="py-2">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9] text-[11px]">
                <tr>
                  <td className="py-3 pr-3 font-mono font-semibold text-[#1E5641]">NORMAL</td>
                  <td className="py-3 pr-3 font-mono text-[#181816]">
                    {chemistry.tempMin}–{chemistry.tempMax}°C
                  </td>
                  <td className="py-3 pr-3 font-mono text-[#181816]">
                    {chemistry.phMin}–{chemistry.phMax}
                  </td>
                  <td className="py-3 text-[#4A4842]">Sürekli kayıt ve enerji KPI izleme</td>
                </tr>
                <tr>
                  <td className="py-3 pr-3 font-mono font-semibold text-[#9A5204]">UYARI</td>
                  <td className="py-3 pr-3 font-mono text-[#181816]">
                    ({chemistry.tempCriticalLow}–{chemistry.tempMin}) / ({chemistry.tempMax}–
                    {chemistry.tempCriticalHigh})°C
                  </td>
                  <td className="py-3 pr-3 font-mono text-[#181816]">
                    ({chemistry.phCriticalLow}–{chemistry.phMin}) / ({chemistry.phMax}–
                    {chemistry.phCriticalHigh})
                  </td>
                  <td className="py-3 text-[#4A4842]">
                    Ardışık {electrical.consecutiveBreachLimit} ihlalde uyarı kaydı + müdahale önerisi
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-3 font-mono font-semibold text-[#A81C28]">KRİTİK</td>
                  <td className="py-3 pr-3 font-mono text-[#181816]">
                    ≤{chemistry.tempCriticalLow} veya ≥{chemistry.tempCriticalHigh}°C
                  </td>
                  <td className="py-3 pr-3 font-mono text-[#181816]">
                    ≤{chemistry.phCriticalLow} veya ≥{chemistry.phCriticalHigh}
                  </td>
                  <td className="py-3 text-[#4A4842]">
                    İlk geçerli ihlalde kritik alarm kaydı
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
