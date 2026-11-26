import { SCENARIO_META } from '../config/processConfig';
import type { ManualOverrides, ScenarioId } from '../types/process';

interface ScenarioControlBarProps {
  scenario: ScenarioId;
  onScenarioChange: (scenario: ScenarioId) => void;
  overrides: ManualOverrides;
  onOverridesChange: (next: ManualOverrides) => void;
}

const SCENARIO_ORDER: ScenarioId[] = [
  'normal',
  'optimized',
  'temp_oscillation',
  'ph_drift',
  'critical_runaway',
];

export function ScenarioControlBar({
  scenario,
  onScenarioChange,
  overrides,
  onOverridesChange,
}: ScenarioControlBarProps) {
  const activeMeta = SCENARIO_META[scenario];

  return (
    <section className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-3.5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Scenario Switcher */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64625A]">
              TEST SENARYOSU
            </span>
            <span className={`rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-medium ${activeMeta.badgeClass}`}>
              {activeMeta.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SCENARIO_ORDER.map((id) => {
              const meta = SCENARIO_META[id];
              const isSelected = scenario === id;
              return (
                <button
                  key={id}
                  onClick={() => onScenarioChange(id)}
                  className={`rounded-[4px] border px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'border-[#181816] bg-[#181816] text-white'
                      : 'border-[#D6D3C9] bg-white text-[#4A4842] hover:border-[#9E9B90] hover:text-[#181816]'
                  }`}
                >
                  {meta.shortLabel}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#64625A]">{activeMeta.description}</p>
        </div>

        {/* Manual Deviation Calibration */}
        <div className="rounded-[4px] border border-[#DFDDD4] bg-[#F2F1EC] p-3 xl:min-w-[370px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#35342F]">
              MANUEL SAPMA ENJEKSİYONU
            </span>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4A4842]">
              <span className="font-mono text-[10px]">{overrides.enabled ? 'AÇIK' : 'KAPALI'}</span>
              <input
                type="checkbox"
                checked={overrides.enabled}
                onChange={(e) =>
                  onOverridesChange({
                    ...overrides,
                    enabled: e.target.checked,
                    tempOffset: e.target.checked ? overrides.tempOffset : 0,
                    phOffset: e.target.checked ? overrides.phOffset : 0,
                  })
                }
                className="h-3.5 w-3.5 accent-[#181816]"
              />
            </label>
          </div>

          <div className={`mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2 ${!overrides.enabled ? 'opacity-45' : ''}`}>
            <div>
              <div className="flex justify-between font-mono text-[10.5px] text-[#4A4842] tabular-nums">
                <span>Sıcaklık</span>
                <span className="font-semibold text-[#181816]">
                  {overrides.tempOffset >= 0 ? `+${overrides.tempOffset}` : overrides.tempOffset} °C
                </span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={0.5}
                disabled={!overrides.enabled}
                value={overrides.tempOffset}
                onChange={(e) =>
                  onOverridesChange({ ...overrides, tempOffset: Number(e.target.value) })
                }
                className="lab-slider mt-1.5 w-full"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono text-[10.5px] text-[#4A4842] tabular-nums">
                <span>pH Ofseti</span>
                <span className="font-semibold text-[#181816]">
                  {overrides.phOffset >= 0 ? `+${overrides.phOffset.toFixed(1)}` : overrides.phOffset.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={-2.5}
                max={2.5}
                step={0.1}
                disabled={!overrides.enabled}
                value={overrides.phOffset}
                onChange={(e) =>
                  onOverridesChange({ ...overrides, phOffset: Number(e.target.value) })
                }
                className="lab-slider mt-1.5 w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
