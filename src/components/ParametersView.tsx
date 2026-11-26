import { Download, RotateCcw } from 'lucide-react';
import { CHEMISTRY_PRESETS, DEFAULT_PROCESS_CONFIG } from '../config/processConfig';
import type { ProcessConfig } from '../types/process';
import { exportConfigToJson } from '../utils/exportData';

interface ParametersViewProps {
  config: ProcessConfig;
  onChange: (next: ProcessConfig) => void;
}

export function ParametersView({ config, onChange }: ParametersViewProps) {
  const updateChemistry = <K extends keyof ProcessConfig['chemistry']>(
    key: K,
    value: ProcessConfig['chemistry'][K]
  ) => {
    onChange({ ...config, chemistry: { ...config.chemistry, [key]: value } });
  };

  const updateIndustrial = <K extends keyof ProcessConfig['industrial']>(
    key: K,
    value: ProcessConfig['industrial'][K]
  ) => {
    onChange({ ...config, industrial: { ...config.industrial, [key]: value } });
  };

  const updateMath = <K extends keyof ProcessConfig['mathModel']>(
    key: K,
    value: ProcessConfig['mathModel'][K]
  ) => {
    onChange({ ...config, mathModel: { ...config.mathModel, [key]: value } });
  };

  const updateElectrical = <K extends keyof ProcessConfig['electrical']>(
    key: K,
    value: ProcessConfig['electrical'][K]
  ) => {
    onChange({ ...config, electrical: { ...config.electrical, [key]: value } });
  };

  const inputClass =
    'mt-1 w-full rounded-[4px] border border-[#CCC9BE] bg-white px-2.5 py-1.5 font-mono text-xs text-[#181816] focus:border-[#181816] focus:outline-none';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
            CANLI KONFİGÜRASYON
          </span>
          <h3 className="text-sm font-semibold text-[#181816]">
            Disiplinlere Göre Proses Parametreleri
          </h3>
          <p className="text-xs text-[#64625A]">
            Grup arkadaşlarınız kendi verilerini paylaştığında buradan girip tüm sistemi anında güncelleyebilirsiniz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportConfigToJson(config)}
            className="flex items-center gap-1.5 rounded-[4px] border border-[#181816] bg-[#181816] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#31312C]"
          >
            <Download className="h-3.5 w-3.5" />
            JSON Dışa Aktar
          </button>
          <button
            onClick={() => onChange(DEFAULT_PROCESS_CONFIG)}
            className="flex items-center gap-1.5 rounded-[4px] border border-[#CCC9BE] bg-white px-3 py-1.5 text-xs font-medium text-[#35342F] hover:border-[#181816]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Varsayılana Dön
          </button>
        </div>
      </div>

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
                onClick={() => onChange({ ...config, chemistry: preset })}
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
                value={config.chemistry.tempMin}
                onChange={(e) => updateChemistry('tempMin', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal Sıcaklık Max (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.chemistry.tempMax}
                onChange={(e) => updateChemistry('tempMax', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Optimum Sıcaklık (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.chemistry.tempOptimal}
                onChange={(e) => updateChemistry('tempOptimal', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Kritik Üst Sıcaklık (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.chemistry.tempCriticalHigh}
                onChange={(e) => updateChemistry('tempCriticalHigh', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal pH Min</label>
              <input
                type="number"
                step="0.1"
                value={config.chemistry.phMin}
                onChange={(e) => updateChemistry('phMin', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">İdeal pH Max</label>
              <input
                type="number"
                step="0.1"
                value={config.chemistry.phMax}
                onChange={(e) => updateChemistry('phMax', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Optimum pH</label>
              <input
                type="number"
                step="0.1"
                value={config.chemistry.phOptimal}
                onChange={(e) => updateChemistry('phOptimal', Number(e.target.value))}
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
                value={config.mathModel.anomalyZThreshold}
                onChange={(e) => updateMath('anomalyZThreshold', Number(e.target.value))}
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
                value={config.electrical.consecutiveBreachLimit}
                onChange={(e) => updateElectrical('consecutiveBreachLimit', Number(e.target.value))}
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
                value={config.electrical.samplingIntervalMs}
                onChange={(e) => updateElectrical('samplingIntervalMs', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] text-[#64625A]">Sıcaklık Histerezisi (°C)</label>
              <input
                type="number"
                step="0.1"
                value={config.electrical.hysteresisTemp}
                onChange={(e) => updateElectrical('hysteresisTemp', Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="flex items-center justify-between rounded-[4px] border border-[#CCC9BE] bg-white px-3 py-2">
              <span className="text-xs text-[#2E2D29]">Otomatik Koruma Kilidi</span>
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
