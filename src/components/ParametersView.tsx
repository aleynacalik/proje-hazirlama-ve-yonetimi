import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { CHEMISTRY_PRESETS, DEFAULT_PROCESS_CONFIG, isValidAlarmConfig } from '../config/processConfig';
import type { ProcessConfig } from '../types/process';
import { exportConfigToJson } from '../utils/exportData';

interface ParametersViewProps {
  config: ProcessConfig;
  onChange: (next: ProcessConfig) => void;
}

export function ParametersView({ config: appliedConfig, onChange }: ParametersViewProps) {
  const [config, setDraft] = useState(appliedConfig);
  const valid = isValidAlarmConfig(config);
  const updateChemistry = <K extends keyof ProcessConfig['chemistry']>(
    key: K,
    value: ProcessConfig['chemistry'][K]
  ) => {
    setDraft({ ...config, chemistry: { ...config.chemistry, [key]: value } });
  };

  const updateIndustrial = <K extends keyof ProcessConfig['industrial']>(
    key: K,
    value: ProcessConfig['industrial'][K]
  ) => {
    setDraft({ ...config, industrial: { ...config.industrial, [key]: value } });
  };

  const updateMath = <K extends keyof ProcessConfig['mathModel']>(
    key: K,
    value: ProcessConfig['mathModel'][K]
  ) => {
    setDraft({ ...config, mathModel: { ...config.mathModel, [key]: value } });
  };

  const updateElectrical = <K extends keyof ProcessConfig['electrical']>(
    key: K,
    value: ProcessConfig['electrical'][K]
  ) => {
    setDraft({ ...config, electrical: { ...config.electrical, [key]: value } });
  };

  const inputClass =
    'mt-1 w-full rounded-[4px] border border-[#CCC9BE] bg-white px-2.5 py-1.5 font-mono text-xs text-[#181816] focus:border-[#181816] focus:outline-none';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
            PROSES AYARLARI
          </span>
          <h3 className="text-sm font-semibold text-[#181816]">
            Disiplinlere Göre Proses Parametreleri
          </h3>
          <p className="text-xs text-[#64625A]">
            Kimya profilleri demo varsayımıdır. Değişiklikler Uygula düğmesiyle devreye girer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onChange(config)}
            disabled={!valid || config === appliedConfig}
            className="rounded border border-[#181816] px-3 py-1.5 text-xs disabled:opacity-50">
            Uygula
          </button>
          <button
            onClick={() => exportConfigToJson(appliedConfig)}
            className="flex items-center gap-1.5 rounded-[4px] border border-[#181816] bg-[#181816] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#31312C]"
          >
            <Download className="h-3.5 w-3.5" />
            JSON Dışa Aktar
          </button>
          <button
            onClick={() => setDraft(DEFAULT_PROCESS_CONFIG)}
            className="flex items-center gap-1.5 rounded-[4px] border border-[#CCC9BE] bg-white px-3 py-1.5 text-xs font-medium text-[#35342F] hover:border-[#181816]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Varsayılana Dön
          </button>
        </div>
      </div>

      {!valid && (
        <p role="alert" className="text-sm text-[#A81C28]">
          Eşikler sayısal ve sıralı olmalı, optimum hedef bantta ve pH 0–14 aralığında kalmalı.
          Histerezis sıfır veya pozitif ve bant genişliğinin yarısından küçük olmalı.
          Ardışık ölçüm sayısı en az 1, örnekleme en az 500 ms ve anomali eşiği pozitif olmalı.
        </p>
      )}

      {/* Chemical Presets */}
      <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64625A]">
          HAZIR KİMYASAL PROSES ŞABLONLARI
        </span>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {CHEMISTRY_PRESETS.map((preset) => {
            const active = config.chemistry.presetId === preset.presetId;
            return (
              <button
                key={preset.presetId}
                onClick={() => setDraft({ ...config, chemistry: preset })}
                className={`rounded-[4px] border p-3 text-left transition ${
                  active
                    ? 'border-[#181816] bg-white shadow-sm'
                    : 'border-[#DFDDD4] bg-[#F2F1EC]/70 hover:border-[#9E9B90] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#78756C]">{preset.reactorId}</span>
                  {active && (
                    <span className="rounded-[2px] bg-[#181816] px-1.5 py-0.5 font-mono text-[9px] text-white">
                      AKTİF
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-semibold text-[#181816]">{preset.reactionName}</p>
                <p className="mt-1 font-mono text-[11px] text-[#1E5641]">
                  T: {preset.tempMin}–{preset.tempMax}°C | pH: {preset.phMin}–{preset.phMax}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Discipline Cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* 01 Chemistry */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1E5641]">
              01 / KİMYA
            </span>
            <h4 className="text-sm font-semibold text-[#181816]">Reaksiyon &amp; İdeal Bantlar</h4>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-[11px] text-[#64625A]">Reaksiyon / Proses Adı</label>
              <input
                type="text"
                value={config.chemistry.reactionName}
                onChange={(e) => updateChemistry('reactionName', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal Sıcaklık Min (°C)</label>
              <input
                type="number"
                step="0.5"
                value={Number.isNaN(config.chemistry.tempMin) ? "" : config.chemistry.tempMin}
                onChange={(e) => updateChemistry('tempMin', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal Sıcaklık Max (°C)</label>
              <input
                type="number"
                step="0.5"
                value={Number.isNaN(config.chemistry.tempMax) ? "" : config.chemistry.tempMax}
                onChange={(e) => updateChemistry('tempMax', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Optimum Sıcaklık (°C)</label>
              <input
                type="number"
                step="0.5"
                value={Number.isNaN(config.chemistry.tempOptimal) ? "" : config.chemistry.tempOptimal}
                onChange={(e) => updateChemistry('tempOptimal', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Kritik Üst Sıcaklık (°C)</label>
              <input
                type="number"
                step="0.5"
                value={Number.isNaN(config.chemistry.tempCriticalHigh) ? "" : config.chemistry.tempCriticalHigh}
                onChange={(e) => updateChemistry('tempCriticalHigh', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="tempCriticalLow" className="text-[11px] text-[#64625A]">Kritik Alt Sıcaklık (°C)</label>
              <input id="tempCriticalLow" type="number" step="0.5"
                value={Number.isNaN(config.chemistry.tempCriticalLow) ? '' : config.chemistry.tempCriticalLow}
                onChange={(e) => updateChemistry('tempCriticalLow', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal pH Min</label>
              <input
                type="number"
                step="0.1"
                value={Number.isNaN(config.chemistry.phMin) ? "" : config.chemistry.phMin}
                onChange={(e) => updateChemistry('phMin', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal pH Max</label>
              <input
                type="number"
                step="0.1"
                value={Number.isNaN(config.chemistry.phMax) ? "" : config.chemistry.phMax}
                onChange={(e) => updateChemistry('phMax', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Optimum pH</label>
              <input
                type="number"
                step="0.1"
                value={Number.isNaN(config.chemistry.phOptimal) ? "" : config.chemistry.phOptimal}
                onChange={(e) => updateChemistry('phOptimal', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phCriticalHigh" className="text-[11px] text-[#64625A]">Kritik Üst pH</label>
              <input id="phCriticalHigh" type="number" step="0.1"
                value={Number.isNaN(config.chemistry.phCriticalHigh) ? '' : config.chemistry.phCriticalHigh}
                onChange={(e) => updateChemistry('phCriticalHigh', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phCriticalLow" className="text-[11px] text-[#64625A]">Kritik Alt pH</label>
              <input id="phCriticalLow" type="number" step="0.1"
                value={Number.isNaN(config.chemistry.phCriticalLow) ? '' : config.chemistry.phCriticalLow}
                onChange={(e) => updateChemistry('phCriticalLow', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Teorik Maks. Verim (%)</label>
              <input
                type="number"
                step="0.5"
                value={config.chemistry.baseYieldPct}
                onChange={(e) => updateChemistry('baseYieldPct', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 02 Industrial */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1B4965]">
              02 / ENDÜSTRİ MÜHENDİSLİĞİ
            </span>
            <h4 className="text-sm font-semibold text-[#181816]">Maliyet &amp; Verimlilik Girdileri</h4>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] text-[#64625A]">Elektrik Birim Maliyeti (₺/kWh)</label>
              <input
                type="number"
                step="0.05"
                value={config.industrial.energyUnitPriceTry}
                onChange={(e) => updateIndustrial('energyUnitPriceTry', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Duruş Maliyeti (₺/saat)</label>
              <input
                type="number"
                step="100"
                value={config.industrial.downtimeCostPerHourTry}
                onChange={(e) => updateIndustrial('downtimeCostPerHourTry', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Taban Proses Enerjisi (kW)</label>
              <input
                type="number"
                step="1"
                value={config.industrial.baseEnergyKw}
                onChange={(e) => updateIndustrial('baseEnergyKw', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Hedef OEE (%)</label>
              <input
                type="number"
                step="1"
                value={config.industrial.targetOeePct}
                onChange={(e) => updateIndustrial('targetOeePct', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-[#64625A]">Nominal Parti Çıktısı (kg)</label>
              <input
                type="number"
                step="50"
                value={config.industrial.nominalBatchOutputKg}
                onChange={(e) => updateIndustrial('nominalBatchOutputKg', Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 03 Math */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6E3B1E]">
              03 / MATEMATİK
            </span>
            <h4 className="text-sm font-semibold text-[#181816]">İstatistiksel Model Katsayıları</h4>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] text-[#64625A]">Sıcaklık Sapma Katsayısı (kW/°C)</label>
              <input
                type="number"
                step="0.05"
                value={config.mathModel.tempEnergyCoeff}
                onChange={(e) => updateMath('tempEnergyCoeff', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Sıcaklık Salınım Cezası (kW/°C²)</label>
              <input
                type="number"
                step="0.05"
                value={config.mathModel.tempOscillationPenalty}
                onChange={(e) => updateMath('tempOscillationPenalty', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">pH Sapma Katsayısı (kW/pH)</label>
              <input
                type="number"
                step="0.1"
                value={config.mathModel.phEnergyCoeff}
                onChange={(e) => updateMath('phEnergyCoeff', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Anomali Uyarı Eşiği (Z-Skoru)</label>
              <input
                type="number"
                step="0.1"
                value={Number.isNaN(config.mathModel.anomalyZThreshold) ? "" : config.mathModel.anomalyZThreshold}
                onChange={(e) => updateMath('anomalyZThreshold', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 04 EEM */}
        <div className="rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
          <div className="border-b border-[#E5E2D9] pb-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#9A5204]">
              04 / ELEKTRİK-ELEKTRONİK
            </span>
            <h4 className="text-sm font-semibold text-[#181816]">Alarm &amp; Örnekleme Ayarları</h4>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] text-[#64625A]">Ardışık İhlal Eşiği (Debounce)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={Number.isNaN(config.electrical.consecutiveBreachLimit) ? "" : config.electrical.consecutiveBreachLimit}
                onChange={(e) => updateElectrical('consecutiveBreachLimit', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Örnekleme Periyodu (ms)</label>
              <input
                type="number"
                min={500}
                max={5000}
                step={100}
                value={Number.isNaN(config.electrical.samplingIntervalMs) ? "" : config.electrical.samplingIntervalMs}
                onChange={(e) => updateElectrical('samplingIntervalMs', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Sıcaklık Histerezisi (°C)</label>
              <input
                type="number"
                step="0.1"
                value={Number.isNaN(config.electrical.hysteresisTemp) ? "" : config.electrical.hysteresisTemp}
                onChange={(e) => updateElectrical('hysteresisTemp', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hysteresisPh" className="text-[11px] text-[#64625A]">pH Histerezisi</label>
              <input id="hysteresisPh" type="number" step="0.01"
                value={Number.isNaN(config.electrical.hysteresisPh) ? '' : config.electrical.hysteresisPh}
                onChange={(e) => updateElectrical('hysteresisPh', e.currentTarget.valueAsNumber)}
                className={inputClass}
              />
            </div>
            <div className="flex items-center justify-between rounded-[4px] border border-[#CCC9BE] bg-white px-3 py-2">
              <span className="text-xs text-[#2E2D29]">Simüle Koruma Göstergesi</span>
              <input
                type="checkbox"
                checked={config.electrical.autoInterlockEnabled}
                onChange={(e) => updateElectrical('autoInterlockEnabled', e.target.checked)}
                className="h-4 w-4 accent-[#181816]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
