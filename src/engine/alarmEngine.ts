import type { AlarmEvent, BreachTracker, ProcessConfig, SensorReading } from '../types/process';

export function createInitialBreachTracker(): BreachTracker {
  return {
    tempWarning: 0,
    tempCritical: 0,
    phWarning: 0,
    phCritical: 0,
    anomalyWarning: 0,
  };
}

/**
 * Elektrik-Elektronik Alarm Mantığı Motoru:
 * - Ardışık ihlal sayacı (Debounce) ile tekil sensör gürültülerinde yalancı alarmı önler.
 * - Histerezis bandı ile sınır etrafındaki titreşimlerde alarm tekrarını dengeler.
 * - Normal / Uyarı / Kritik seviyelerinde operatöre aksiyon önerisi üretir.
 */
export function evaluateAlarms(
  reading: SensorReading,
  tracker: BreachTracker,
  config: ProcessConfig
): { nextTracker: BreachTracker; newAlarms: AlarmEvent[] } {
  const nextTracker: BreachTracker = { ...tracker };
  const newAlarms: AlarmEvent[] = [];
  const { chemistry, electrical, mathModel } = config;
  const limit = Math.max(1, electrical.consecutiveBreachLimit);

  // 1. Sıcaklık Alarm Mantığı
  if (reading.tempStatus === 'critical') {
    nextTracker.tempCritical += 1;
    nextTracker.tempWarning = 0;
    if (nextTracker.tempCritical === 1 || nextTracker.tempCritical % limit === 0) {
      const isHigh = reading.temperature >= chemistry.tempCriticalHigh;
      newAlarms.push({
        id: `TEMP-CRIT-${reading.id}-${reading.timestamp}`,
        timestamp: reading.timestamp,
        timeLabel: reading.timeLabel,
        parameter: 'Sıcaklık',
        severity: 'critical',
        value: `${reading.temperature.toFixed(1)} °C`,
        threshold: isHigh
          ? `≥ ${chemistry.tempCriticalHigh} °C`
          : `≤ ${chemistry.tempCriticalLow} °C`,
        message: isHigh
          ? 'Kritik yüksek sıcaklık eşiği aşıldı!'
          : 'Kritik düşük sıcaklık eşiğine inildi!',
        recommendedAction: isHigh
          ? electrical.autoInterlockEnabled
            ? 'Otomatik koruma kilidi devrede: Isıtıcıyı kes, soğutma vanasını %100 aç.'
            : 'Acil manuel müdahale: Isıtıcıyı kapat ve soğutma ceketini devreye al.'
          : 'Isıtma hattı arızasını kontrol et, acil ön ısıtma başlat.',
        acknowledged: false,
        consecutiveCount: nextTracker.tempCritical,
      });
    }
  } else if (reading.tempStatus === 'warning') {
    nextTracker.tempCritical = 0;
    nextTracker.tempWarning += 1;
    if (nextTracker.tempWarning === limit) {
      const isHigh = reading.temperature > chemistry.tempMax;
      newAlarms.push({
        id: `TEMP-WARN-${reading.id}-${reading.timestamp}`,
        timestamp: reading.timestamp,
        timeLabel: reading.timeLabel,
        parameter: 'Sıcaklık',
        severity: 'warning',
        value: `${reading.temperature.toFixed(1)} °C`,
        threshold: `${chemistry.tempMin}–${chemistry.tempMax} °C`,
        message: isHigh
          ? `Sıcaklık üst ideal bandı ${limit} ardışık ölçümde aştı.`
          : `Sıcaklık alt ideal bandın ${limit} ardışık ölçümde altında.`,
        recommendedAction: isHigh
          ? 'Soğutma akışını %20 artırın ve ısıtıcı PID set değerini kontrol edin.'
          : 'Isıtıcı gücünü kademeli artırarak ideal sıcaklık bandına dönün.',
        acknowledged: false,
        consecutiveCount: nextTracker.tempWarning,
      });
    }
  } else {
    // Histerezis kontrollü sıfırlama
    const insideSafeTemp =
      reading.temperature >= chemistry.tempMin + electrical.hysteresisTemp &&
      reading.temperature <= chemistry.tempMax - electrical.hysteresisTemp;
    if (insideSafeTemp) {
      nextTracker.tempWarning = 0;
      nextTracker.tempCritical = 0;
    }
  }

  // 2. pH Alarm Mantığı
  if (reading.phStatus === 'critical') {
    nextTracker.phCritical += 1;
    nextTracker.phWarning = 0;
    if (nextTracker.phCritical === 1 || nextTracker.phCritical % limit === 0) {
      const isHigh = reading.ph >= chemistry.phCriticalHigh;
      newAlarms.push({
        id: `PH-CRIT-${reading.id}-${reading.timestamp}`,
        timestamp: reading.timestamp,
        timeLabel: reading.timeLabel,
        parameter: 'pH',
        severity: 'critical',
        value: `pH ${reading.ph.toFixed(2)}`,
        threshold: isHigh
          ? `≥ ${chemistry.phCriticalHigh}`
          : `≤ ${chemistry.phCriticalLow}`,
        message: isHigh
          ? 'Kritik yüksek bazik pH seviyesi!'
          : 'Kritik düşük asidik pH seviyesi!',
        recommendedAction: isHigh
          ? 'Asit tampon dozajını acil artırın ve numune kalite kontrolü alın.'
          : 'Baz nötralizasyon pompasını devreye alın, besleme vanasını kısın.',
        acknowledged: false,
        consecutiveCount: nextTracker.phCritical,
      });
    }
  } else if (reading.phStatus === 'warning') {
    nextTracker.phCritical = 0;
    nextTracker.phWarning += 1;
    if (nextTracker.phWarning === limit) {
      const isHigh = reading.ph > chemistry.phMax;
      newAlarms.push({
        id: `PH-WARN-${reading.id}-${reading.timestamp}`,
        timestamp: reading.timestamp,
        timeLabel: reading.timeLabel,
        parameter: 'pH',
        severity: 'warning',
        value: `pH ${reading.ph.toFixed(2)}`,
        threshold: `${chemistry.phMin}–${chemistry.phMax}`,
        message: isHigh
          ? `pH üst hedef bandı ${limit} ardışık ölçümde aştı.`
          : `pH alt hedef bandın ${limit} ardışık ölçümde altında.`,
        recommendedAction: isHigh
          ? 'Asit dozaj vanasını %10 açarak hedef pH bandına çekin.'
          : 'Baz dozaj vanasını %10 açarak hedef pH bandına çekin.',
        acknowledged: false,
        consecutiveCount: nextTracker.phWarning,
      });
    }
  } else {
    const insideSafePh =
      reading.ph >= chemistry.phMin + electrical.hysteresisPh &&
      reading.ph <= chemistry.phMax - electrical.hysteresisPh;
    if (insideSafePh) {
      nextTracker.phWarning = 0;
      nextTracker.phCritical = 0;
    }
  }

  // 3. İstatistiksel Anomali / Enerji Salınım Uyarısı (Matematik + EEM kesişimi)
  if (reading.anomalyScore >= mathModel.anomalyZThreshold) {
    nextTracker.anomalyWarning += 1;
    if (nextTracker.anomalyWarning === limit) {
      newAlarms.push({
        id: `ANOM-${reading.id}-${reading.timestamp}`,
        timestamp: reading.timestamp,
        timeLabel: reading.timeLabel,
        parameter: 'Enerji / Anomali',
        severity: reading.anomalyScore >= mathModel.anomalyZThreshold * 1.45 ? 'critical' : 'warning',
        value: `Skor ${reading.anomalyScore.toFixed(2)} (${reading.energyKw} kW)`,
        threshold: `Eşik ≥ ${mathModel.anomalyZThreshold}`,
        message: 'Proses salınımı nedeniyle anormal enerji tüketimi tespit edildi.',
        recommendedAction: 'Sıcaklık/pH PID kontrol kazançlarını daraltarak salınımı sönümleyin.',
        acknowledged: false,
        consecutiveCount: nextTracker.anomalyWarning,
      });
    }
  } else {
    nextTracker.anomalyWarning = 0;
  }

  return { nextTracker, newAlarms };
}
