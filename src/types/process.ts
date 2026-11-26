export type SeverityLevel = 'normal' | 'warning' | 'critical';

export type ScenarioId =
  | 'normal'
  | 'temp_oscillation'
  | 'ph_drift'
  | 'critical_runaway'
  | 'optimized';

export interface ChemistryConfig {
  presetId: string;
  reactionName: string;
  reactorId: string;
  batchCode: string;
  tempMin: number;
  tempOptimal: number;
  tempMax: number;
  tempCriticalLow: number;
  tempCriticalHigh: number;
  phMin: number;
  phOptimal: number;
  phMax: number;
  phCriticalLow: number;
  phCriticalHigh: number;
  baseYieldPct: number;
  literatureNote: string;
}

export interface IndustrialConfig {
  energyUnitPriceTry: number; // TL / kWh
  downtimeCostPerHourTry: number; // TL / saat
  nominalBatchOutputKg: number; // kg / parti
  targetOeePct: number; // %
  baseEnergyKw: number; // kW (ideal çalışma taban gücü)
}

export interface MathModelConfig {
  tempEnergyCoeff: number; // kW / °C sapma
  tempOscillationPenalty: number; // kW / (°C salınım)^2
  phEnergyCoeff: number; // kW / pH sapma
  phOscillationPenalty: number; // kW / (pH salınım)^2
  tempYieldDecay: number; // % verim kaybı / (°C sapma)^2
  phYieldDecay: number; // % verim kaybı / (pH sapma)^2
  anomalyZThreshold: number; // İstatistiksel eşik skoru
}

export interface ElectricalConfig {
  consecutiveBreachLimit: number; // Yalancı alarmı önlemek için ardışık ihlal sayısı
  hysteresisTemp: number; // °C histerezis bandı
  hysteresisPh: number; // pH histerezis bandı
  samplingIntervalMs: number; // Örnekleme periyodu (ms)
  autoInterlockEnabled: boolean; // Kritik durumda otomatik koruma kilidi
}

export interface ProcessConfig {
  chemistry: ChemistryConfig;
  industrial: IndustrialConfig;
  mathModel: MathModelConfig;
  electrical: ElectricalConfig;
}

export interface SensorReading {
  id: number;
  timestamp: number;
  timeLabel: string;
  temperature: number;
  ph: number;
  tempDelta: number;
  phDelta: number;
  energyKw: number;
  baselineEnergyKw: number;
  energyCostPerHour: number;
  yieldPct: number;
  oeePct: number;
  anomalyScore: number;
  tempStatus: SeverityLevel;
  phStatus: SeverityLevel;
  overallStatus: SeverityLevel;
  scenario: ScenarioId;
}

export interface AlarmEvent {
  id: string;
  timestamp: number;
  timeLabel: string;
  parameter: 'Sıcaklık' | 'pH' | 'Enerji / Anomali';
  severity: 'warning' | 'critical';
  value: string;
  threshold: string;
  message: string;
  recommendedAction: string;
  acknowledged: boolean;
  consecutiveCount: number;
}

export interface BreachTracker {
  tempWarning: number;
  tempCritical: number;
  phWarning: number;
  phCritical: number;
  anomalyWarning: number;
}

export interface ManualOverrides {
  enabled: boolean;
  tempOffset: number;
  phOffset: number;
}

export interface ProcessSummaryStats {
  avgTemp: number;
  stdTemp: number;
  avgPh: number;
  stdPh: number;
  avgEnergyKw: number;
  avgYieldPct: number;
  avgOeePct: number;
  totalEnergyKwh: number;
  totalEnergyCostTry: number;
  estimatedSavingsPct: number;
  downtimeSeconds: number;
  downtimeCostTry: number;
  inSpecRatioPct: number;
}
