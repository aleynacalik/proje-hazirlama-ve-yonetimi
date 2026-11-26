import type {
  ManualOverrides,
  ProcessConfig,
  ProcessSummaryStats,
  ScenarioId,
  SensorReading,
  SeverityLevel,
} from '../types/process';

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function round(val: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export function formatTimeLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Kimya limitlerine göre anlık parametre durumunu (Normal / Uyarı / Kritik) sınıflandırır.
 */
export function classifyTemperature(temp: number, config: ProcessConfig): SeverityLevel {
  const { tempMin, tempMax, tempCriticalLow, tempCriticalHigh } = config.chemistry;
  if (temp <= tempCriticalLow || temp >= tempCriticalHigh) return 'critical';
  if (temp < tempMin || temp > tempMax) return 'warning';
  return 'normal';
}

export function classifyPh(ph: number, config: ProcessConfig): SeverityLevel {
  const { phMin, phMax, phCriticalLow, phCriticalHigh } = config.chemistry;
  if (ph <= phCriticalLow || ph >= phCriticalHigh) return 'critical';
  if (ph < phMin || ph > phMax) return 'warning';
  return 'normal';
}

export function combineSeverity(a: SeverityLevel, b: SeverityLevel): SeverityLevel {
  if (a === 'critical' || b === 'critical') return 'critical';
  if (a === 'warning' || b === 'warning') return 'warning';
  return 'normal';
}

/**
 * Matematik & Endüstri Modeli:
 * Sıcaklık ve pH salınımlarının enerji tüketimine (kW), verime (%) ve OEE'ye etkisini hesaplar.
 * Matematikçi arkadaşınızın oluşturacağı regresyon / istatistiksel katsayılar
 * doğrudan `config.mathModel` üzerinden bu fonksiyona yansır.
 */
export function evaluateProcessReading(
  id: number,
  timestamp: number,
  temperature: number,
  ph: number,
  prevReading: SensorReading | null,
  config: ProcessConfig,
  scenario: ScenarioId
): SensorReading {
  const { chemistry, industrial, mathModel } = config;

  const tempDev = Math.abs(temperature - chemistry.tempOptimal);
  const phDev = Math.abs(ph - chemistry.phOptimal);

  const tempDelta = prevReading ? Math.abs(temperature - prevReading.temperature) : 0;
  const phDelta = prevReading ? Math.abs(ph - prevReading.ph) : 0;

  // İstatistiksel Enerji Tüketim Modeli:
  // E = E_base + b1*|T - T_opt| + b2*(dT)^2 + b3*|pH - pH_opt| + b4*(dpH)^2
  const energyKw =
    industrial.baseEnergyKw +
    mathModel.tempEnergyCoeff * tempDev +
    mathModel.tempOscillationPenalty * tempDelta * tempDelta +
    mathModel.phEnergyCoeff * phDev +
    mathModel.phOscillationPenalty * phDelta * phDelta;

  // Karşılaştırma referansı (optimize edilmemiş klasik proses tahmini %14 daha dalgalı)
  const baselineEnergyKw = industrial.baseEnergyKw * 1.16;

  // Teorik Reaksiyon Verimi (Kuadratik yanıt yüzeyi yaklaşımı)
  const yieldPenalty =
    mathModel.tempYieldDecay * tempDev * tempDev +
    mathModel.phYieldDecay * phDev * phDev;
  const yieldPct = clamp(chemistry.baseYieldPct - yieldPenalty, 42, 99.5);

  const tempStatus = classifyTemperature(temperature, config);
  const phStatus = classifyPh(ph, config);
  const overallStatus = combineSeverity(tempStatus, phStatus);

  // Kompozit istatistiksel anomali skoru (Z-skoru benzeri normalize sapma indeksi)
  const tempHalfBand = Math.max(1, (chemistry.tempMax - chemistry.tempMin) / 2);
  const phHalfBand = Math.max(0.2, (chemistry.phMax - chemistry.phMin) / 2);
  const normalizedTempZ = tempDev / (tempHalfBand * 0.55) + tempDelta * 0.35;
  const normalizedPhZ = phDev / (phHalfBand * 0.55) + phDelta * 1.4;
  const anomalyScore = Math.sqrt(
    (normalizedTempZ * normalizedTempZ + normalizedPhZ * normalizedPhZ) / 2
  );

  // Endüstri Mühendisliği OEE tahmini (Kullanılabilirlik x Performans x Kalite)
  const availability =
    overallStatus === 'critical' ? 0.62 : overallStatus === 'warning' ? 0.9 : 0.97;
  const performance = clamp(1 - Math.max(0, energyKw - industrial.baseEnergyKw) / 140, 0.65, 1.0);
  const quality = yieldPct / 100;
  const oeePct = clamp(availability * performance * quality * 100, 35, 98);

  const energyCostPerHour = energyKw * industrial.energyUnitPriceTry;

  return {
    id,
    timestamp,
    timeLabel: formatTimeLabel(timestamp),
    temperature: round(temperature, 2),
    ph: round(ph, 2),
    tempDelta: round(tempDelta, 2),
    phDelta: round(phDelta, 3),
    energyKw: round(energyKw, 2),
    baselineEnergyKw: round(baselineEnergyKw, 2),
    energyCostPerHour: round(energyCostPerHour, 2),
    yieldPct: round(yieldPct, 2),
    oeePct: round(oeePct, 1),
    anomalyScore: round(anomalyScore, 2),
    tempStatus,
    phStatus,
    overallStatus,
    scenario,
  };
}

/**
 * Sentetik sensör veri akışı üreteci (fiziksel sensör yerine gerçekçi proses simülasyonu).
 */
export function generateNextReading(
  step: number,
  prevReading: SensorReading | null,
  config: ProcessConfig,
  scenario: ScenarioId,
  overrides: ManualOverrides,
  timestamp = Date.now()
): SensorReading {
  const { chemistry } = config;
  const tempSpan = (chemistry.tempMax - chemistry.tempMin) / 2;
  const phSpan = (chemistry.phMax - chemistry.phMin) / 2;

  const noise = () => (Math.random() - 0.5) * 2;
  let targetTemp = chemistry.tempOptimal;
  let targetPh = chemistry.phOptimal;

  switch (scenario) {
    case 'optimized':
      targetTemp = chemistry.tempOptimal + Math.sin(step * 0.25) * tempSpan * 0.22 + noise() * 0.25;
      targetPh = chemistry.phOptimal + Math.cos(step * 0.2) * phSpan * 0.18 + noise() * 0.04;
      break;

    case 'normal':
      targetTemp = chemistry.tempOptimal + Math.sin(step * 0.35) * tempSpan * 0.58 + noise() * 0.7;
      targetPh = chemistry.phOptimal + Math.cos(step * 0.28) * phSpan * 0.5 + noise() * 0.09;
      break;

    case 'temp_oscillation':
      targetTemp =
        chemistry.tempOptimal +
        Math.sin(step * 0.85) * tempSpan * 1.48 +
        noise() * 1.25;
      targetPh = chemistry.phOptimal + Math.cos(step * 0.3) * phSpan * 0.55 + noise() * 0.12;
      break;

    case 'ph_drift':
      targetTemp = chemistry.tempOptimal + Math.sin(step * 0.32) * tempSpan * 0.65 + noise() * 0.65;
      targetPh =
        chemistry.phOptimal +
        phSpan * 1.15 +
        Math.sin(step * 0.45) * phSpan * 0.55 +
        noise() * 0.14;
      break;

    case 'critical_runaway':
      targetTemp =
        chemistry.tempCriticalHigh +
        1.4 +
        Math.sin(step * 0.7) * 2.1 +
        noise() * 1.1;
      targetPh =
        chemistry.phCriticalLow -
        0.25 +
        Math.cos(step * 0.55) * 0.35 +
        noise() * 0.12;
      break;
  }

  // Manuel test kaydırıcıları aktifse doğrudan ofset uygula
  if (overrides.enabled) {
    targetTemp += overrides.tempOffset;
    targetPh += overrides.phOffset;
  }

  // Birinci dereceden termal/kimyasal atalet yumuşatması
  const alpha = scenario === 'temp_oscillation' ? 0.72 : 0.55;
  const smoothedTemp = prevReading
    ? prevReading.temperature * (1 - alpha) + targetTemp * alpha
    : targetTemp;
  const smoothedPh = prevReading
    ? prevReading.ph * (1 - alpha) + targetPh * alpha
    : targetPh;

  const finalTemp = clamp(smoothedTemp, 5, 130);
  const finalPh = clamp(smoothedPh, 0.5, 13.5);

  return evaluateProcessReading(step, timestamp, finalTemp, finalPh, prevReading, config, scenario);
}

/**
 * Başlangıçta grafiğin dolu ve anlamlı görünmesi için geçmiş pencere üretir.
 */
export function generateInitialHistory(
  count: number,
  config: ProcessConfig,
  scenario: ScenarioId
): SensorReading[] {
  const now = Date.now();
  const interval = config.electrical.samplingIntervalMs;
  const readings: SensorReading[] = [];
  const noOverrides: ManualOverrides = { enabled: false, tempOffset: 0, phOffset: 0 };

  for (let i = 0; i < count; i++) {
    const ts = now - (count - 1 - i) * interval;
    const prev = readings.length > 0 ? readings[readings.length - 1] : null;
    readings.push(generateNextReading(i + 1, prev, config, scenario, noOverrides, ts));
  }
  return readings;
}

/**
 * Tüm pencere için istatistiksel ve endüstriyel özet metrikleri hesaplar.
 */
export function computeSummaryStats(
  readings: SensorReading[],
  config: ProcessConfig
): ProcessSummaryStats {
  if (readings.length === 0) {
    return {
      avgTemp: config.chemistry.tempOptimal,
      stdTemp: 0,
      avgPh: config.chemistry.phOptimal,
      stdPh: 0,
      avgEnergyKw: config.industrial.baseEnergyKw,
      avgYieldPct: config.chemistry.baseYieldPct,
      avgOeePct: config.industrial.targetOeePct,
      totalEnergyKwh: 0,
      totalEnergyCostTry: 0,
      estimatedSavingsPct: 0,
      downtimeSeconds: 0,
      downtimeCostTry: 0,
      inSpecRatioPct: 100,
    };
  }

  const n = readings.length;
  const avgTemp = readings.reduce((s, r) => s + r.temperature, 0) / n;
  const avgPh = readings.reduce((s, r) => s + r.ph, 0) / n;
  const avgEnergyKw = readings.reduce((s, r) => s + r.energyKw, 0) / n;
  const avgBaselineKw = readings.reduce((s, r) => s + r.baselineEnergyKw, 0) / n;
  const avgYieldPct = readings.reduce((s, r) => s + r.yieldPct, 0) / n;
  const avgOeePct = readings.reduce((s, r) => s + r.oeePct, 0) / n;

  const varTemp = readings.reduce((s, r) => s + Math.pow(r.temperature - avgTemp, 2), 0) / n;
  const varPh = readings.reduce((s, r) => s + Math.pow(r.ph - avgPh, 2), 0) / n;

  // Her örneği 1 dakikalık simüle üretim dilimi olarak ölçekleyerek okunaklı maliyet üret
  const simulatedHoursPerSample = 1 / 60;
  const totalEnergyKwh = readings.reduce((s, r) => s + r.energyKw * simulatedHoursPerSample, 0);
  const totalEnergyCostTry = totalEnergyKwh * config.industrial.energyUnitPriceTry;

  const criticalCount = readings.filter((r) => r.overallStatus === 'critical').length;
  const inSpecCount = readings.filter((r) => r.overallStatus === 'normal').length;

  const downtimeSeconds = criticalCount * 60; // Kritik örnek başına 1 dk simüle duruş
  const downtimeCostTry = (downtimeSeconds / 3600) * config.industrial.downtimeCostPerHourTry;
  const estimatedSavingsPct = ((avgBaselineKw - avgEnergyKw) / avgBaselineKw) * 100;

  return {
    avgTemp: round(avgTemp, 2),
    stdTemp: round(Math.sqrt(varTemp), 2),
    avgPh: round(avgPh, 2),
    stdPh: round(Math.sqrt(varPh), 3),
    avgEnergyKw: round(avgEnergyKw, 2),
    avgYieldPct: round(avgYieldPct, 1),
    avgOeePct: round(avgOeePct, 1),
    totalEnergyKwh: round(totalEnergyKwh, 2),
    totalEnergyCostTry: round(totalEnergyCostTry, 2),
    estimatedSavingsPct: round(estimatedSavingsPct, 1),
    downtimeSeconds,
    downtimeCostTry: round(downtimeCostTry, 0),
    inSpecRatioPct: round((inSpecCount / n) * 100, 1),
  };
}
