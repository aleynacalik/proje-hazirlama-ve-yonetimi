import type { ProcessConfig, SensorReading } from '../types/process';

export function exportReadingsToCsv(readings: SensorReading[], batchCode: string): void {
  const headers = [
    'ID',
    'Zaman',
    'Sicaklik_C',
    'pH',
    'Sicaklik_Salinim_C',
    'pH_Salinim',
    'Enerji_kW',
    'Saatlik_Maliyet_TL',
    'Verim_Yuzde',
    'OEE_Yuzde',
    'Anomali_Skoru',
    'Durum',
    'Senaryo',
  ];

  const rows = readings.map((r) => [
    r.id,
    r.timeLabel,
    r.temperature,
    r.ph,
    r.tempDelta,
    r.phDelta,
    r.energyKw,
    r.energyCostPerHour,
    r.yieldPct,
    r.oeePct,
    r.anomalyScore,
    r.overallStatus,
    r.scenario,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mini-mes-${batchCode.toLowerCase()}-telemetri.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportConfigToJson(config: ProcessConfig): void {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `process-config-${config.chemistry.presetId}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
