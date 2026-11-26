import type { AlarmEvent, BreachTracker, ChannelAlarmState, ProcessConfig, SensorReading } from '../types/process';

export function createInitialBreachTracker(): BreachTracker {
  return {
    temperature: { count: 0 },
    ph: { count: 0 },
    anomaly: { count: 0 },
  };
}

type Violation = 'low-warning' | 'high-warning' | 'low-critical' | 'high-critical';

export function evaluateAlarms(
  reading: SensorReading,
  tracker: BreachTracker,
  config: ProcessConfig
) {
  const newAlarms: AlarmEvent[] = [];
  const clearedIds: string[] = [];
  const { chemistry, electrical, mathModel } = config;

  function openAlarm(
    parameter: AlarmEvent['parameter'],
    severity: AlarmEvent['severity'],
    value: string,
    threshold: string,
    message: string,
    consecutiveCount: number
  ) {
    const id = [parameter, severity, reading.id, reading.timestamp].join('-');
    newAlarms.push({
      id, timestamp: reading.timestamp, timeLabel: reading.timeLabel,
      parameter, severity, value, threshold, message,
      recommendedAction: severity === 'data-error'
        ? 'Ölçüm kaynağını ve birimini kontrol edin.'
        : 'Ölçümü ve ilgili demo senaryosunu kontrol edin.',
      acknowledged: false,
      consecutiveCount,
    });
    return id;
  }

  function evaluateChannel(
    previous: ChannelAlarmState,
    parameter: 'Sıcaklık' | 'pH',
    value: number,
    unit: string,
    valid: boolean,
    limits: { lowCritical: number; min: number; max: number; highCritical: number },
    hysteresis: number
  ): ChannelAlarmState {
    if (!valid) {
      return {
        active: previous.active,
        count: 0,
        faultId: previous.faultId ?? openAlarm(
          parameter, 'data-error', String(value), 'Geçerli ölçüm',
          'Geçersiz ölçüm alındı. Sapma sayacı sıfırlandı.', 1
        ),
      };
    }

    if (previous.faultId) clearedIds.push(previous.faultId);
    const { lowCritical, min, max, highCritical } = limits;
    let violation: Violation | undefined;
    if (value <= lowCritical) violation = 'low-critical';
    else if (value >= highCritical) violation = 'high-critical';
    else if (value < min) violation = 'low-warning';
    else if (value > max) violation = 'high-warning';

    let active = previous.active;
    if (value >= min + hysteresis && value <= max - hysteresis && active) {
      clearedIds.push(active.id);
      active = undefined;
    }

    if (!violation) return { count: 0, active };
    const count = violation === previous.pending
      ? Math.min(previous.count + 1, electrical.consecutiveBreachLimit)
      : 1;
    const severity = violation.endsWith('critical') ? 'critical' : 'warning';
    const isHigh = violation.startsWith('high');
    const threshold = severity === 'critical'
      ? isHigh ? `≥ ${highCritical}` : `≤ ${lowCritical}`
      : isHigh ? `> ${max}` : `< ${min}`;
    const canOpen = !active || (severity === 'critical' && active.violation !== violation);
    const requiredCount = severity === 'critical'
      ? 1
      : electrical.consecutiveBreachLimit;

    if (canOpen && count >= requiredCount) {
      if (active) clearedIds.push(active.id);
      active = {
        violation,
        id: openAlarm(
          parameter, severity, `${value.toFixed(2)}${unit}`, `${threshold}${unit}`,
          `${parameter} ${isHigh ? 'üst' : 'alt'} eşiği aşıldı.`, count
        ),
      };
    }

    return { pending: violation, count, active };
  }

  function evaluateAnomaly(previous: ChannelAlarmState): ChannelAlarmState {
    const score = reading.anomalyScore;
    const threshold = mathModel.anomalyZThreshold;
    if (!Number.isFinite(score)) {
      return {
        active: previous.active,
        count: 0,
        faultId: previous.faultId ?? openAlarm(
          'Enerji / Anomali', 'data-error', String(score), 'Sonlu skor',
          'Geçersiz anomali skoru alındı.', 1
        ),
      };
    }
    if (previous.faultId) clearedIds.push(previous.faultId);
    if (score < threshold) {
      if (previous.active) clearedIds.push(previous.active.id);
      return { count: 0 };
    }
    const count = Math.min(previous.count + 1, electrical.consecutiveBreachLimit);
    if (previous.active || count < electrical.consecutiveBreachLimit) {
      return { count, active: previous.active };
    }
    const severity = score >= threshold * 1.45 ? 'critical' : 'warning';
    const id = openAlarm(
      'Enerji / Anomali', severity, `Skor ${score.toFixed(2)} (${reading.energyKw} kW)`,
      `≥ ${threshold}`, 'Proses salınımı nedeniyle anormal enerji tüketimi tespit edildi.', count
    );
    return { count, active: { id, violation: severity === 'critical' ? 'high-critical' : 'high-warning' } };
  }

  const nextTracker: BreachTracker = {
    temperature: evaluateChannel(
      tracker.temperature, 'Sıcaklık', reading.temperature, ' °C', Number.isFinite(reading.temperature),
      { lowCritical: chemistry.tempCriticalLow, min: chemistry.tempMin, max: chemistry.tempMax, highCritical: chemistry.tempCriticalHigh },
      electrical.hysteresisTemp
    ),
    ph: evaluateChannel(
      tracker.ph, 'pH', reading.ph, '', Number.isFinite(reading.ph) && reading.ph >= 0 && reading.ph <= 14,
      { lowCritical: chemistry.phCriticalLow, min: chemistry.phMin, max: chemistry.phMax, highCritical: chemistry.phCriticalHigh },
      electrical.hysteresisPh
    ),
    anomaly: evaluateAnomaly(tracker.anomaly),
  };
  return { nextTracker, newAlarms, clearedIds };
}
