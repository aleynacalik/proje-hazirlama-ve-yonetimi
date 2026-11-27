import type { ChemistryConfig, ProcessConfig } from '../types/process';

export const CHEMISTRY_PRESETS: ChemistryConfig[] = [
  {
    presetId: 'esterification',
    reactionName: 'Esterleşme Prosesi (Etil Asetat / Biyodizel Ön Prosesi)',
    reactorId: 'R-101 CSTR',
    batchCode: 'B-2026-041',
    tempMin: 60.0,
    tempOptimal: 65.0,
    tempMax: 70.0,
    tempCriticalLow: 55.0,
    tempCriticalHigh: 75.0,
    phMin: 4.5,
    phOptimal: 5.0,
    phMax: 5.5,
    phCriticalLow: 3.8,
    phCriticalHigh: 6.2,
    baseYieldPct: 96.5,
    literatureNote:
      'Örnek proses parametreleri. Kimya ekibi seçilen reaksiyonu ve literatür verilerini netleştirdiğinde Parametreler sekmesinden güncellenebilir.',
  },
  {
    presetId: 'neutralization',
    reactionName: 'Endüstriyel Atık Su Nötralizasyon Prosesi',
    reactorId: 'R-204 NTR',
    batchCode: 'B-2026-108',
    tempMin: 20.0,
    tempOptimal: 25.0,
    tempMax: 32.0,
    tempCriticalLow: 15.0,
    tempCriticalHigh: 38.0,
    phMin: 6.5,
    phOptimal: 7.2,
    phMax: 8.0,
    phCriticalLow: 5.5,
    phCriticalHigh: 9.0,
    baseYieldPct: 98.2,
    literatureNote:
      'Ders demosu için varsayılan nötralizasyon profili. Eşikleri kimya ekibi doğrulayacaktır.',
  },
  {
    presetId: 'fermentation',
    reactionName: 'Sitrik Asit Biyokimyasal Fermantasyon Prosesi',
    reactorId: 'BR-302 FERM',
    batchCode: 'B-2026-215',
    tempMin: 28.0,
    tempOptimal: 30.0,
    tempMax: 32.0,
    tempCriticalLow: 25.5,
    tempCriticalHigh: 34.5,
    phMin: 2.5,
    phOptimal: 3.2,
    phMax: 4.0,
    phCriticalLow: 1.8,
    phCriticalHigh: 4.8,
    baseYieldPct: 94.0,
    literatureNote:
      'Ders demosu için varsayılan fermantasyon profili. Eşikleri kimya ekibi doğrulayacaktır.',
  },
];

export const DEFAULT_PROCESS_CONFIG: ProcessConfig = {
  chemistry: CHEMISTRY_PRESETS[0],
  industrial: {
    energyUnitPriceTry: 4.81,
    downtimeCostPerHourTry: 6500,
    nominalBatchOutputKg: 1200,
    targetOeePct: 85,
    baseEnergyKw: 42.0,
  },
  mathModel: {
    tempEnergyCoeff: 1.45,
    tempOscillationPenalty: 1.85,
    phEnergyCoeff: 4.2,
    phOscillationPenalty: 6.5,
    tempYieldDecay: 0.22,
    phYieldDecay: 4.8,
    anomalyZThreshold: 2.2,
  },
  electrical: {
    consecutiveBreachLimit: 3,
    hysteresisTemp: 0.6,
    hysteresisPh: 0.1,
    samplingIntervalMs: 1200,
    autoInterlockEnabled: true,
  },
};

export const SCENARIO_META: Record<
  string,
  { label: string; shortLabel: string; description: string; badgeClass: string }
> = {
  normal: {
    label: 'Normal Üretim',
    shortLabel: 'Normal',
    description: 'Sıcaklık ve pH hedef aralık içinde doğal küçük salınımlarla seyreder.',
    badgeClass: 'bg-[#E6EFEA] text-[#1E5641] border-[#B8D4C7]',
  },
  optimized: {
    label: 'Optimize Kontrol (PID)',
    shortLabel: 'Optimize',
    description: 'Dar salınım bandı ile minimum enerji tüketimi ve yüksek reaksiyon verimi.',
    badgeClass: 'bg-[#E5EEF3] text-[#1B4965] border-[#B6CEDB]',
  },
  temp_oscillation: {
    label: 'Sıcaklık Salınımı',
    shortLabel: 'Isı Salınımı',
    description: 'Isıtma/soğutma döngüsü dengesiz; enerji tüketiminde artış ve uyarı alarmları.',
    badgeClass: 'bg-[#FDF1DC] text-[#9A5204] border-[#E7C68E]',
  },
  ph_drift: {
    label: 'pH Kayması',
    shortLabel: 'pH Kayması',
    description: 'Asit/baz dozaj dengesizliği nedeniyle pH bandından sapma ve verim kaybı.',
    badgeClass: 'bg-[#F3ECE6] text-[#6E3B1E] border-[#D9C2B0]',
  },
  critical_runaway: {
    label: 'Kritik Anomali / Arıza',
    shortLabel: 'Kritik Arıza',
    description: 'Egzotermik taşma ve pH çökmesi; kritik alarmlar, koruma kilidi ve duruş riski.',
    badgeClass: 'bg-[#FBE6E8] text-[#A81C28] border-[#E8AEB4]',
  },
};

export function isValidAlarmConfig(config: ProcessConfig): boolean {
  const { chemistry: c, electrical: e, mathModel: m } = config;
  return [
    c.tempCriticalLow, c.tempMin, c.tempOptimal, c.tempMax, c.tempCriticalHigh,
    c.phCriticalLow, c.phMin, c.phOptimal, c.phMax, c.phCriticalHigh,
    e.hysteresisTemp, e.hysteresisPh, m.anomalyZThreshold,
  ].every(Number.isFinite)
    && c.tempCriticalLow < c.tempMin && c.tempMin <= c.tempOptimal
    && c.tempOptimal <= c.tempMax && c.tempMin < c.tempMax && c.tempMax < c.tempCriticalHigh
    && 0 <= c.phCriticalLow && c.phCriticalLow < c.phMin && c.phMin <= c.phOptimal
    && c.phOptimal <= c.phMax && c.phMin < c.phMax && c.phMax < c.phCriticalHigh && c.phCriticalHigh <= 14
    && e.hysteresisTemp >= 0 && e.hysteresisTemp * 2 < c.tempMax - c.tempMin
    && e.hysteresisPh >= 0 && e.hysteresisPh * 2 < c.phMax - c.phMin
    && Number.isInteger(e.consecutiveBreachLimit) && e.consecutiveBreachLimit >= 1
    && Number.isInteger(e.samplingIntervalMs) && e.samplingIntervalMs >= 500
    && e.samplingIntervalMs <= 2147483647
    && m.anomalyZThreshold > 0;
}
