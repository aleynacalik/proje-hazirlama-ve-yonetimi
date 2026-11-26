import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProcessConfig, SensorReading } from '../types/process';

interface TelemetryChartsProps {
  readings: SensorReading[];
  config: ProcessConfig;
}

const TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  borderColor: '#BDB9AC',
  borderRadius: '4px',
  fontSize: '11.5px',
  fontFamily: '"IBM Plex Mono", monospace',
  color: '#181816',
  boxShadow: '0 4px 12px rgba(24, 24, 22, 0.08)',
};

export function TelemetryCharts({ readings, config }: TelemetryChartsProps) {
  const { chemistry } = config;

  const tempDomainMin = Math.floor(chemistry.tempCriticalLow - 5);
  const tempDomainMax = Math.ceil(chemistry.tempCriticalHigh + 6);
  const phDomainMin = Math.max(0, Number((chemistry.phCriticalLow - 0.8).toFixed(1)));
  const phDomainMax = Math.min(14, Number((chemistry.phCriticalHigh + 0.8).toFixed(1)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Temperature Time Series */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-[#E5E2D9] pb-2.5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
                KANAL 01 • TT-101
              </span>
              <h3 className="text-sm font-semibold text-[#181816]">Sıcaklık Zaman Serisi (°C)</h3>
              <p className="text-[11px] text-[#64625A]">
                Gölgeli bant: İdeal aralık ({chemistry.tempMin}–{chemistry.tempMax}°C) • Kırmızı: Kritik sınır
              </p>
            </div>
            <span className="rounded-[3px] border border-[#D6D3C9] bg-white px-2 py-0.5 font-mono text-[11px] text-[#181816]">
              SP: {chemistry.tempOptimal}°C
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="#E4E1D8" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  minTickGap={28}
                />
                <YAxis
                  domain={[tempDomainMin, tempDomainMax]}
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  unit="°"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number) => [`${value.toFixed(2)} °C`, 'Sıcaklık']}
                />
                <ReferenceArea
                  y1={chemistry.tempMin}
                  y2={chemistry.tempMax}
                  fill="#1E5641"
                  fillOpacity={0.11}
                />
                <ReferenceLine
                  y={chemistry.tempOptimal}
                  stroke="#1E5641"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                />
                <ReferenceLine
                  y={chemistry.tempCriticalHigh}
                  stroke="#C82333"
                  strokeDasharray="3 3"
                  label={{
                    value: `MAX ${chemistry.tempCriticalHigh}°C`,
                    position: 'insideTopRight',
                    fill: '#A81C28',
                    fontSize: 9.5,
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <ReferenceLine
                  y={chemistry.tempCriticalLow}
                  stroke="#C82333"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#1B4965"
                  strokeWidth={2}
                  fill="#1B4965"
                  fillOpacity={0.08}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* pH Time Series */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-[#E5E2D9] pb-2.5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
                KANAL 02 • AT-102
              </span>
              <h3 className="text-sm font-semibold text-[#181816]">pH Kontrol Eğrisi</h3>
              <p className="text-[11px] text-[#64625A]">
                Gölgeli bant: İdeal pH ({chemistry.phMin}–{chemistry.phMax}) • Kırmızı: Kritik sınır
              </p>
            </div>
            <span className="rounded-[3px] border border-[#D6D3C9] bg-white px-2 py-0.5 font-mono text-[11px] text-[#181816]">
              SP: pH {chemistry.phOptimal}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="#E4E1D8" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  minTickGap={28}
                />
                <YAxis
                  domain={[phDomainMin, phDomainMax]}
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number) => [`pH ${value.toFixed(2)}`, 'pH Değeri']}
                />
                <ReferenceArea
                  y1={chemistry.phMin}
                  y2={chemistry.phMax}
                  fill="#1E5641"
                  fillOpacity={0.11}
                />
                <ReferenceLine
                  y={chemistry.phOptimal}
                  stroke="#1E5641"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                />
                <ReferenceLine
                  y={chemistry.phCriticalHigh}
                  stroke="#C82333"
                  strokeDasharray="3 3"
                  label={{
                    value: `MAX ${chemistry.phCriticalHigh}`,
                    position: 'insideTopRight',
                    fill: '#A81C28',
                    fontSize: 9.5,
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <ReferenceLine
                  y={chemistry.phCriticalLow}
                  stroke="#C82333"
                  strokeDasharray="3 3"
                />
                <Area
                  type="monotone"
                  dataKey="ph"
                  stroke="#6E3B1E"
                  strokeWidth={2}
                  fill="#6E3B1E"
                  fillOpacity={0.07}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Energy vs Yield Correlation */}
      <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-[#E5E2D9] pb-2.5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
              KANAL 03 • ENERJİ &amp; VERİM KORELASYONU
            </span>
            <h3 className="text-sm font-semibold text-[#181816]">
              Anlık Güç Tüketimi (kW) ve Teorik Reaksiyon Verimi (%)
            </h3>
            <p className="text-[11px] text-[#64625A]">
              Matematiksel salınım modeli çıktısı ile optimize edilmemiş referans enerji çizgisi karşılaştırması
            </p>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={readings} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 3" stroke="#E4E1D8" />
              <XAxis
                dataKey="timeLabel"
                stroke="#9E9B90"
                tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                minTickGap={28}
              />
              <YAxis
                yAxisId="left"
                stroke="#1B4965"
                tick={{ fill: '#1B4965', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                unit=" kW"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[40, 100]}
                stroke="#1E5641"
                tick={{ fill: '#1E5641', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                unit="%"
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                wrapperStyle={{
                  fontSize: '11px',
                  fontFamily: '"IBM Plex Sans", sans-serif',
                  paddingTop: '6px',
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="baselineEnergyKw"
                name="Klasik Kontrol Referansı (kW)"
                stroke="#8C897E"
                strokeDasharray="5 4"
                dot={false}
                strokeWidth={1.4}
                isAnimationActive={false}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="energyKw"
                name="Anlık Enerji (kW)"
                stroke="#1B4965"
                fill="#1B4965"
                fillOpacity={0.09}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="yieldPct"
                name="Reaksiyon Verimi (%)"
                stroke="#1E5641"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
