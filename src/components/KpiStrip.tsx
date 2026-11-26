import type {
  ProcessConfig,
  ProcessSummaryStats,
  SensorReading,
  SeverityLevel,
} from '../types/process';

interface KpiStripProps {
  latest: SensorReading;
  stats: ProcessSummaryStats;
  config: ProcessConfig;
  unackedAlarmCount: number;
}

function clampPct(v: number): number {
  return Math.min(98, Math.max(2, v));
}

function LinearScaleGauge({
  value,
  critLow,
  min,
  opt,
  max,
  critHigh,
  status,
}: {
  value: number;
  critLow: number;
  min: number;
  opt: number;
  max: number;
  critHigh: number;
  status: SeverityLevel;
}) {
  const pad = (critHigh - critLow) * 0.14;
  const scaleMin = critLow - pad;
  const scaleMax = critHigh + pad;
  const span = Math.max(0.001, scaleMax - scaleMin);

  const pos = (x: number) => clampPct(((x - scaleMin) / span) * 100);

  const idealLeft = pos(min);
  const idealWidth = Math.max(4, pos(max) - idealLeft);
  const optPos = pos(opt);
  const valPos = pos(value);

  const markerColor =
    status === 'critical'
      ? 'bg-[#C82333]'
      : status === 'warning'
        ? 'bg-[#B45309]'
        : 'bg-[#181816]';

  return (
    <div className="mt-3">
      <div className="relative h-2.5 w-full rounded-[2px] border border-[#D6D3C9] bg-[#ECEAE2]">
        {/* Ideal green operating band */}
        <div
          className="absolute top-0 bottom-0 bg-[#C7DFD3]"
          style={{ left: `${idealLeft}%`, width: `${idealWidth}%` }}
        />
        {/* Optimal center tick */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-[#1E5641]"
          style={{ left: `${optPos}%` }}
        />
        {/* Live value indicator needle */}
        <div
          className={`absolute -top-0.5 -bottom-0.5 w-1.5 -translate-x-1/2 rounded-[1px] transition-all duration-300 ${markerColor}`}
          style={{ left: `${valPos}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9.5px] text-[#78756C] tabular-nums">
        <span>{critLow}</span>
        <span className="text-[#1E5641]">
          [{min}–{max}]
        </span>
        <span>{critHigh}</span>
      </div>
    </div>
  );
}

function statusMeta(level: SeverityLevel): {
  cardBorder: string;
  tag: string;
  label: string;
} {
  if (level === 'critical') {
    return {
      cardBorder: 'border-[#C82333] bg-[#FFF8F8]',
      tag: 'border-[#E8AEB4] bg-[#FBE6E8] text-[#A81C28]',
      label: 'KRİTİK',
    };
  }
  if (level === 'warning') {
    return {
      cardBorder: 'border-[#D99B38] bg-[#FFFDF7]',
      tag: 'border-[#E7C68E] bg-[#FDF1DC] text-[#9A5204]',
      label: 'UYARI',
    };
  }
  return {
    cardBorder: 'border-[#D6D3C9] bg-[#FAF9F5]',
    tag: 'border-[#C7DFD3] bg-[#E6EFEA] text-[#1E5641]',
    label: 'NORMAL',
  };
}

export function KpiStrip({ latest, stats, config, unackedAlarmCount }: KpiStripProps) {
  const tempS = statusMeta(latest.tempStatus);
  const phS = statusMeta(latest.phStatus);
  const overallS = statusMeta(latest.overallStatus);

  const tempDiff = latest.temperature - config.chemistry.tempOptimal;
  const phDiff = latest.ph - config.chemistry.phOptimal;

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {/* 1. Temperature with Linear Scale Gauge */}
      <div className={`rounded-[6px] border p-3.5 transition-colors ${tempS.cardBorder}`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#64625A]">
            TT-101 SICAKLIK
          </span>
          <span className={`rounded-[3px] border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${tempS.tag}`}>
            {tempS.label}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tracking-tight text-[#181816] tabular-nums">
            {latest.temperature.toFixed(1)}
          </span>
          <span className="font-mono text-xs text-[#64625A]">°C</span>
          <span className="ml-auto font-mono text-[11px] text-[#64625A] tabular-nums">
            Δ{tempDiff >= 0 ? `+${tempDiff.toFixed(1)}` : tempDiff.toFixed(1)}
          </span>
        </div>
        <LinearScaleGauge
          value={latest.temperature}
          critLow={config.chemistry.tempCriticalLow}
          min={config.chemistry.tempMin}
          opt={config.chemistry.tempOptimal}
          max={config.chemistry.tempMax}
          critHigh={config.chemistry.tempCriticalHigh}
          status={latest.tempStatus}
        />
      </div>

      {/* 2. pH with Linear Scale Gauge */}
      <div className={`rounded-[6px] border p-3.5 transition-colors ${phS.cardBorder}`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#64625A]">
            AT-102 pH DEĞERİ
          </span>
          <span className={`rounded-[3px] border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${phS.tag}`}>
            {phS.label}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tracking-tight text-[#181816] tabular-nums">
            {latest.ph.toFixed(2)}
          </span>
          <span className="font-mono text-xs text-[#64625A]">pH</span>
          <span className="ml-auto font-mono text-[11px] text-[#64625A] tabular-nums">
            Δ{phDiff >= 0 ? `+${phDiff.toFixed(2)}` : phDiff.toFixed(2)}
          </span>
        </div>
        <LinearScaleGauge
          value={latest.ph}
          critLow={config.chemistry.phCriticalLow}
          min={config.chemistry.phMin}
          opt={config.chemistry.phOptimal}
          max={config.chemistry.phMax}
          critHigh={config.chemistry.phCriticalHigh}
          status={latest.phStatus}
        />
      </div>

      {/* 3. Energy & Cost */}
      <div className="flex flex-col justify-between rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#64625A]">
            ENERJİ TÜKETİMİ
          </span>
          <span
            className={`rounded-[3px] border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${
              stats.estimatedSavingsPct >= 0
                ? 'border-[#B6CEDB] bg-[#E5EEF3] text-[#1B4965]'
                : 'border-[#E8AEB4] bg-[#FBE6E8] text-[#A81C28]'
            }`}
          >
            {stats.estimatedSavingsPct >= 0
              ? `-%${stats.estimatedSavingsPct.toFixed(1)}`
              : `+%${Math.abs(stats.estimatedSavingsPct).toFixed(1)}`}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tracking-tight text-[#181816] tabular-nums">
            {latest.energyKw.toFixed(1)}
          </span>
          <span className="font-mono text-xs text-[#64625A]">kW</span>
          <span className="ml-auto font-mono text-xs font-medium text-[#1B4965] tabular-nums">
            {latest.energyCostPerHour.toFixed(0)} ₺/sa
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#E5E2D9] pt-2 font-mono text-[10.5px] text-[#64625A] tabular-nums">
          <span>Taban: {config.industrial.baseEnergyKw} kW</span>
          <span>Ort: {stats.avgEnergyKw.toFixed(1)} kW</span>
        </div>
      </div>

      {/* 4. Yield & OEE */}
      <div className="flex flex-col justify-between rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#64625A]">
            VERİM &amp; OEE
          </span>
          <span className="rounded-[3px] border border-[#D6D3C9] bg-[#F2F1EC] px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-[#35342F] tabular-nums">
            OEE %{latest.oeePct.toFixed(0)}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tracking-tight text-[#181816] tabular-nums">
            %{latest.yieldPct.toFixed(1)}
          </span>
          <span className="ml-auto font-mono text-[11px] text-[#1E5641] tabular-nums">
            Hedef %{config.chemistry.baseYieldPct}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#E5E2D9] pt-2 font-mono text-[10.5px] text-[#64625A] tabular-nums">
          <span>Bant İçi: %{stats.inSpecRatioPct}</span>
          <span>σT={stats.stdTemp.toFixed(2)}</span>
        </div>
      </div>

      {/* 5. Statistical Anomaly & Alarm State */}
      <div className={`flex flex-col justify-between rounded-[6px] border p-3.5 transition-colors ${overallS.cardBorder}`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#64625A]">
            ANOMALİ İNDEKSİ
          </span>
          <span className={`rounded-[3px] border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${overallS.tag}`}>
            {overallS.label}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tracking-tight text-[#181816] tabular-nums">
            {latest.anomalyScore.toFixed(2)}
          </span>
          <span className="font-mono text-xs text-[#64625A]">Z</span>
          <span className="ml-auto font-mono text-[11px] font-medium text-[#4A4842] tabular-nums">
            {unackedAlarmCount} Onaysız
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#E5E2D9] pt-2 font-mono text-[10.5px] text-[#64625A] tabular-nums">
          <span>Eşik: ≥{config.mathModel.anomalyZThreshold}</span>
          <span>Kilit: {config.electrical.autoInterlockEnabled ? 'AÇIK' : 'KAPALI'}</span>
        </div>
      </div>
    </section>
  );
}
