import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { ProcessConfig, ProcessSummaryStats, SensorReading } from '../types/process';

interface AnalyticsViewProps {
  readings: SensorReading[];
  stats: ProcessSummaryStats;
  config: ProcessConfig;
}

const TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  borderColor: '#BDB9AC',
  borderRadius: '4px',
  fontSize: '11.5px',
  fontFamily: '"IBM Plex Mono", monospace',
  color: '#181816',
};

export function AnalyticsView({ readings, stats, config }: AnalyticsViewProps) {
  const scatterData = readings.map((r) => ({
    tempDeviation: Number(Math.abs(r.temperature - config.chemistry.tempOptimal).toFixed(2)),
    energyKw: r.energyKw,
    yieldPct: r.yieldPct,
    ph: r.ph,
  }));

  const { mathModel, industrial } = config;

  return (
    <div className="space-y-4">
      {/* Industrial Summary Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#78756C]">
            SİMÜLE ENERJİ MALİYETİ
          </span>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#181816] tabular-nums">
            {stats.totalEnergyCostTry.toFixed(1)} ₺
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#64625A]">
            {stats.totalEnergyKwh.toFixed(2)} kWh × {industrial.energyUnitPriceTry} ₺/kWh
          </p>
        </div>

        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#78756C]">
            DURUŞ SÜRESİ &amp; KAYBI
          </span>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#181816] tabular-nums">
            {Math.round(stats.downtimeSeconds / 60)} dk
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#A81C28]">
            Tahmini Maliyet: {stats.downtimeCostTry} ₺
          </p>
        </div>

        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#78756C]">
            ORTALAMA OEE / UYUM
          </span>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E5641] tabular-nums">
            %{stats.avgOeePct.toFixed(1)}
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#64625A]">
            Bant İçi: %{stats.inSpecRatioPct} (Hedef %{industrial.targetOeePct})
          </p>
        </div>

        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#78756C]">
            SALINIM (STANDART SAPMA)
          </span>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#181816] tabular-nums">
            ±{stats.stdTemp.toFixed(2)} °C
          </p>
          <p className="mt-1 font-mono text-[11px] text-[#64625A]">
            pH Sapması: ±{stats.stdPh.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
              MATEMATİKSEL MODEL DOĞRULAMA
            </span>
            <h3 className="text-sm font-semibold text-[#181816]">
              Sıcaklık Sapması (|ΔT|) vs. Enerji Tüketimi (kW)
            </h3>
            <p className="text-[11px] text-[#64625A]">
              Optimum noktadan uzaklaştıkça enerji tüketiminin istatistiksel artışı
            </p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 16, left: -10, bottom: 8 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="#E4E1D8" />
                <XAxis
                  type="number"
                  dataKey="tempDeviation"
                  name="Sıcaklık Sapması"
                  unit="°C"
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                />
                <YAxis
                  type="number"
                  dataKey="energyKw"
                  name="Enerji"
                  unit=" kW"
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                />
                <ZAxis type="number" dataKey="yieldPct" range={[40, 110]} name="Verim" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={TOOLTIP_STYLE} />
                <Scatter name="Proses Ölçümleri" data={scatterData} fill="#1B4965" fillOpacity={0.78} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
              EŞİK ALGORİTMASI
            </span>
            <h3 className="text-sm font-semibold text-[#181816]">
              İstatistiksel Anomali Skoru (Kompozit Z-İndeksi)
            </h3>
            <p className="text-[11px] text-[#64625A]">
              Eşik ({mathModel.anomalyZThreshold}) aşıldığında erken uyarı mekanizması devreye girer
            </p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="#E4E1D8" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  minTickGap={28}
                />
                <YAxis
                  stroke="#9E9B90"
                  tick={{ fill: '#64625A', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <ReferenceLine
                  y={mathModel.anomalyZThreshold}
                  stroke="#B45309"
                  strokeDasharray="4 4"
                  label={{
                    value: `EŞİK ${mathModel.anomalyZThreshold}`,
                    position: 'insideTopRight',
                    fill: '#9A5204',
                    fontSize: 9.5,
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="anomalyScore"
                  name="Anomali Skoru"
                  stroke="#C82333"
                  fill="#C82333"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Equations */}
      <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
          AKTİF MATEMATİKSEL FORMÜLLER
        </span>
        <h3 className="mt-0.5 text-sm font-semibold text-[#181816]">
          İstatistiksel Enerji ve Verim Denklemleri
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="rounded-[4px] border border-[#DFDDD4] bg-white p-3.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1B4965]">
              01 / Enerji Tüketim Modeli (kW)
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-[#181816]">
              E(T, pH) = {industrial.baseEnergyKw} + {mathModel.tempEnergyCoeff}·|T − T_opt| +{' '}
              {mathModel.tempOscillationPenalty}·(ΔT)² + {mathModel.phEnergyCoeff}·|pH − pH_opt| +{' '}
              {mathModel.phOscillationPenalty}·(ΔpH)²
            </p>
            <p className="mt-2 text-[11px] text-[#64625A]">
              Bağımsız değişkenler: sıcaklık sapması, ardışık sıcaklık salınımı (ΔT), pH sapması ve pH salınımı (ΔpH).
            </p>
          </div>
          <div className="rounded-[4px] border border-[#DFDDD4] bg-white p-3.5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#1E5641]">
              02 / Teorik Reaksiyon Verimi (%)
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-[#181816]">
              Y(T, pH) = {config.chemistry.baseYieldPct} − {mathModel.tempYieldDecay}·(T − T_opt)² −{' '}
              {mathModel.phYieldDecay}·(pH − pH_opt)²
            </p>
            <p className="mt-2 text-[11px] text-[#64625A]">
              Matematik ekibinin kesinleştirdiği katsayılar &quot;Parametreler&quot; sekmesinden anında girilebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
