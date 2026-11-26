import { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { AlarmEvent, BreachTracker, ProcessConfig } from '../types/process';

interface AlarmPanelProps {
  alarms: AlarmEvent[];
  tracker: BreachTracker;
  config: ProcessConfig;
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export function AlarmPanel({
  alarms,
  tracker,
  config,
  onAcknowledge,
  onAcknowledgeAll,
}: AlarmPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unacked' | 'critical'>('all');

  const filtered = alarms.filter((a) => {
    if (filter === 'unacked') return !a.acknowledged;
    if (filter === 'critical') return a.severity === 'critical';
    return true;
  });

  const unackedCount = alarms.filter((a) => !a.acknowledged).length;
  const limit = config.electrical.consecutiveBreachLimit;

  return (
    <aside className="flex flex-col rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#E5E2D9] pb-2.5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
            EEM ALARM KAYIT DEFTERİ
          </span>
          <h3 className="text-sm font-semibold text-[#181816]">Olay &amp; Uyarı Günlüğü</h3>
        </div>
        {unackedCount > 0 && (
          <button
            onClick={onAcknowledgeAll}
            className="flex items-center gap-1 rounded-[4px] border border-[#181816] bg-[#181816] px-2.5 py-1 text-[11px] font-medium text-white hover:bg-[#31312C]"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tümünü Onayla
          </button>
        )}
      </div>

      {/* Live Debounce Counters */}
      <div className="mt-3 grid grid-cols-3 divide-x divide-[#DFDDD4] rounded-[4px] border border-[#DFDDD4] bg-[#F2F1EC] py-2 text-center font-mono">
        <div>
          <span className="block text-[9px] uppercase text-[#78756C]">ISI SAYAÇ</span>
          <span className="mt-0.5 block text-xs font-semibold text-[#181816] tabular-nums">
            {Math.max(tracker.tempWarning, tracker.tempCritical)}/{limit}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase text-[#78756C]">pH SAYAÇ</span>
          <span className="mt-0.5 block text-xs font-semibold text-[#181816] tabular-nums">
            {Math.max(tracker.phWarning, tracker.phCritical)}/{limit}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase text-[#78756C]">ANOMALİ</span>
          <span className="mt-0.5 block text-xs font-semibold text-[#181816] tabular-nums">
            {tracker.anomalyWarning}/{limit}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-3 flex gap-1 border-b border-[#E5E2D9] pb-2.5">
        {(
          [
            { id: 'all', label: `Tümü (${alarms.length})` },
            { id: 'unacked', label: `Onaysız (${unackedCount})` },
            { id: 'critical', label: 'Kritik' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-[3px] px-2.5 py-1 font-mono text-[10.5px] font-medium transition ${
              filter === tab.id
                ? 'bg-[#181816] text-white'
                : 'text-[#64625A] hover:bg-[#ECEAE2] hover:text-[#181816]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alarm Feed */}
      <div className="mt-3 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '360px' }}>
        {filtered.length === 0 ? (
          <div className="rounded-[4px] border border-dashed border-[#CCC9BE] bg-white py-10 text-center">
            <p className="font-mono text-xs font-medium text-[#4A4842]">AKTİF ALARM YOK</p>
            <p className="mx-auto mt-1 max-w-[230px] text-[11px] text-[#78756C]">
              Üstten bir arıza senaryosu seçerek veya sapma enjekte ederek alarm kurallarını test edebilirsiniz.
            </p>
          </div>
        ) : (
          filtered.map((alarm) => {
            const isCritical = alarm.severity === 'critical';
            return (
              <div
                key={alarm.id}
                className={`rounded-[4px] border border-l-[3px] bg-white p-2.5 transition ${
                  alarm.acknowledged
                    ? 'border-[#DFDDD4] border-l-[#9E9B90] opacity-60'
                    : isCritical
                      ? 'border-[#E8AEB4] border-l-[#C82333]'
                      : 'border-[#E7C68E] border-l-[#B45309]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-[2px] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${
                        isCritical
                          ? 'bg-[#FBE6E8] text-[#A81C28]'
                          : 'bg-[#FDF1DC] text-[#9A5204]'
                      }`}
                    >
                      {isCritical ? 'KRİTİK' : 'UYARI'}
                    </span>
                    <span className="text-xs font-semibold text-[#181816]">{alarm.parameter}</span>
                    <span className="font-mono text-[11px] text-[#4A4842]">{alarm.value}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#78756C] tabular-nums">
                    {alarm.timeLabel}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-[#2E2D29]">{alarm.message}</p>
                <p className="mt-1 text-[11px] text-[#64625A]">
                  <strong className="font-medium text-[#35342F]">Müdahale:</strong>{' '}
                  {alarm.recommendedAction}
                </p>

                <div className="mt-2 flex items-center justify-between border-t border-[#EFECE4] pt-1.5 font-mono text-[10px] text-[#78756C]">
                  <span>
                    Eşik: {alarm.threshold} • n={alarm.consecutiveCount}
                  </span>
                  {!alarm.acknowledged ? (
                    <button
                      onClick={() => onAcknowledge(alarm.id)}
                      className="flex items-center gap-1 rounded-[3px] border border-[#CCC9BE] bg-[#FAF9F5] px-2 py-0.5 font-sans text-[10.5px] font-medium text-[#181816] hover:border-[#181816]"
                    >
                      <Check className="h-3 w-3" />
                      Onayla
                    </button>
                  ) : (
                    <span className="text-[#1E5641]">ONAYLANDI</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
