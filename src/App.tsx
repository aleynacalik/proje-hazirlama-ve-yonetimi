import { useEffect, useMemo, useRef, useState } from 'react';
import { AlarmPanel } from './components/AlarmPanel';
import { AnalyticsView } from './components/AnalyticsView';
import { ArchitectureFlowView } from './components/ArchitectureFlowView';
import { KpiStrip } from './components/KpiStrip';
import { ParametersView } from './components/ParametersView';
import { ReactorVesselCard } from './components/ReactorVesselCard';
import { ScenarioControlBar } from './components/ScenarioControlBar';
import { TelemetryCharts } from './components/TelemetryCharts';
import { Sidebar, TopBar, type ActiveTab } from './components/TopBar';
import { DEFAULT_PROCESS_CONFIG } from './config/processConfig';
import { createInitialBreachTracker, evaluateAlarms } from './engine/alarmEngine';
import {
  computeSummaryStats,
  generateInitialHistory,
  generateNextReading,
} from './engine/processModel';
import type {
  AlarmEvent,
  BreachTracker,
  ManualOverrides,
  ProcessConfig,
  ScenarioId,
  SensorReading,
} from './types/process';
import { exportReadingsToCsv } from './utils/exportData';

const STORAGE_KEY = 'chemflow_mini_mes_config_v1';
const VISIBLE_WINDOW = 45;
const MAX_HISTORY = 300;

function loadSavedConfig(): ProcessConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROCESS_CONFIG;
    return JSON.parse(raw) as ProcessConfig;
  } catch {
    return DEFAULT_PROCESS_CONFIG;
  }
}

export default function App() {
  const [config, setConfig] = useState<ProcessConfig>(() => loadSavedConfig());
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');
  const [scenario, setScenario] = useState<ScenarioId>('normal');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [overrides, setOverrides] = useState<ManualOverrides>({
    enabled: false,
    tempOffset: 0,
    phOffset: 0,
  });

  const [readings, setReadings] = useState<SensorReading[]>(() =>
    generateInitialHistory(24, loadSavedConfig(), 'normal')
  );
  const [alarms, setAlarms] = useState<AlarmEvent[]>([]);
  const [tracker, setTracker] = useState<BreachTracker>(() => createInitialBreachTracker());

  const stepRef = useRef<number>(25);
  const trackerRef = useRef<BreachTracker>(tracker);
  trackerRef.current = tracker;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage quota issues
    }
  }, [config]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setReadings((prev) => {
        const last = prev.length > 0 ? prev[prev.length - 1] : null;
        const nextStep = stepRef.current++;
        const nextReading = generateNextReading(nextStep, last, config, scenario, overrides);

        const { nextTracker, newAlarms } = evaluateAlarms(
          nextReading,
          trackerRef.current,
          config
        );
        trackerRef.current = nextTracker;
        setTracker(nextTracker);

        if (newAlarms.length > 0) {
          setAlarms((prevAlarms) => [...newAlarms, ...prevAlarms].slice(0, 60));
        }

        return [...prev, nextReading].slice(-MAX_HISTORY);
      });
    }, config.electrical.samplingIntervalMs);

    return () => window.clearInterval(timer);
  }, [isRunning, config, scenario, overrides]);

  const visibleReadings = useMemo(() => readings.slice(-VISIBLE_WINDOW), [readings]);
  const latest = visibleReadings[visibleReadings.length - 1];
  const stats = useMemo(
    () => computeSummaryStats(visibleReadings, config),
    [visibleReadings, config]
  );
  const unackedAlarmCount = useMemo(
    () => alarms.filter((a) => !a.acknowledged).length,
    [alarms]
  );

  const handleReset = () => {
    const fresh = generateInitialHistory(24, config, scenario);
    const freshTracker = createInitialBreachTracker();
    stepRef.current = 25;
    trackerRef.current = freshTracker;
    setReadings(fresh);
    setAlarms([]);
    setTracker(freshTracker);
  };

  const handleConfigChange = (next: ProcessConfig) => {
    setConfig(next);
    if (next.chemistry.presetId !== config.chemistry.presetId) {
      const fresh = generateInitialHistory(24, next, scenario);
      const freshTracker = createInitialBreachTracker();
      stepRef.current = 25;
      trackerRef.current = freshTracker;
      setReadings(fresh);
      setAlarms([]);
      setTracker(freshTracker);
    }
  };

  const handleAcknowledge = (id: string) => {
    setAlarms((prev) =>
      prev.map((alarm) => (alarm.id === id ? { ...alarm, acknowledged: true } : alarm))
    );
  };

  const handleAcknowledgeAll = () => {
    setAlarms((prev) => prev.map((alarm) => ({ ...alarm, acknowledged: true })));
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F1EC] text-[#181816] lg:flex-row">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        config={config}
        unackedAlarmCount={unackedAlarmCount}
        overallStatus={latest.overallStatus}
      />

      <div className="lab-surface flex min-w-0 flex-1 flex-col">
        <TopBar
          activeTab={activeTab}
          isRunning={isRunning}
          onToggleRun={() => setIsRunning((r) => !r)}
          onReset={handleReset}
          onExportCsv={() => exportReadingsToCsv(readings, config.chemistry.batchCode)}
          unackedAlarmCount={unackedAlarmCount}
          lastTimestamp={latest.timeLabel}
          sampleCount={readings.length}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-4 px-5 py-5 sm:px-7">
          <KpiStrip
            latest={latest}
            stats={stats}
            config={config}
            unackedAlarmCount={unackedAlarmCount}
          />

          {activeTab === 'monitor' && (
            <>
              <ScenarioControlBar
                scenario={scenario}
                onScenarioChange={setScenario}
                overrides={overrides}
                onOverridesChange={setOverrides}
              />
              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-12">
                <div className="2xl:col-span-8">
                  <TelemetryCharts readings={visibleReadings} config={config} />
                </div>
                <div className="space-y-4 2xl:col-span-4">
                  <ReactorVesselCard latest={latest} config={config} isRunning={isRunning} />
                  <AlarmPanel
                    alarms={alarms}
                    tracker={tracker}
                    config={config}
                    onAcknowledge={handleAcknowledge}
                    onAcknowledgeAll={handleAcknowledgeAll}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <ScenarioControlBar
                scenario={scenario}
                onScenarioChange={setScenario}
                overrides={overrides}
                onOverridesChange={setOverrides}
              />
              <AnalyticsView readings={visibleReadings} stats={stats} config={config} />
            </>
          )}

          {activeTab === 'architecture' && (
            <>
              <ScenarioControlBar
                scenario={scenario}
                onScenarioChange={setScenario}
                overrides={overrides}
                onOverridesChange={setOverrides}
              />
              <ArchitectureFlowView latest={latest} tracker={tracker} config={config} />
            </>
          )}

          {activeTab === 'settings' && (
            <ParametersView config={config} onChange={handleConfigChange} />
          )}

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D6D3C9] pt-4 font-mono text-[10.5px] text-[#78756C]">
            <span>
              KİMYASAL PROSES (SICAKLIK/pH) OPTİMİZASYONU VE AKILLI İZLEME SİSTEMİ — MİNİ MES
            </span>
            <span>
              PERİYOT: {config.electrical.samplingIntervalMs}ms • KAYIT: {readings.length}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
