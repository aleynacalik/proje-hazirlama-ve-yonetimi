import type { ProcessConfig, SensorReading } from '../types/process';

interface ReactorVesselCardProps {
  latest: SensorReading;
  config: ProcessConfig;
  isRunning: boolean;
}

export function ReactorVesselCard({ latest, config, isRunning }: ReactorVesselCardProps) {
  const { chemistry, electrical } = config;
  const isCritical = latest.overallStatus === 'critical';
  const isWarning = latest.overallStatus === 'warning';

  // Jacket thermal color follows ISA-101 restraint: calm steel normally, ochre/red only on deviation
  const jacketFill =
    latest.tempStatus === 'critical'
      ? '#FBE6E8'
      : latest.tempStatus === 'warning'
        ? '#FDF1DC'
        : '#E8EEF0';
  const jacketStroke =
    latest.tempStatus === 'critical'
      ? '#C82333'
      : latest.tempStatus === 'warning'
        ? '#B45309'
        : '#7C939E';

  const liquidFill =
    latest.phStatus === 'critical'
      ? '#F6D4D8'
      : latest.phStatus === 'warning'
        ? '#F4E6D2'
        : '#DCEAE4';
  const liquidStroke =
    latest.phStatus === 'critical'
      ? '#A81C28'
      : latest.phStatus === 'warning'
        ? '#9A5204'
        : '#3E7B64';

  const interlockTriggered = isCritical && electrical.autoInterlockEnabled;

  return (
    <div className="flex flex-col justify-between rounded-[6px] border border-[#D6D3C9] bg-[#FAF9F5] p-4">
      <div className="flex items-start justify-between gap-2 border-b border-[#E5E2D9] pb-2.5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78756C]">
            P&amp;ID REAKTÖR ŞEMASI
          </span>
          <h3 className="mt-0.5 text-sm font-semibold text-[#181816]">
            {chemistry.reactorId} — Sürekli Karıştırmalı Tank
          </h3>
        </div>
        <span
          className={`rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-semibold ${
            interlockTriggered
              ? 'border-[#C82333] bg-[#C82333] text-white'
              : isWarning
                ? 'border-[#E7C68E] bg-[#FDF1DC] text-[#9A5204]'
                : 'border-[#B8D4C7] bg-[#E6EFEA] text-[#1E5641]'
          }`}
        >
          {interlockTriggered ? 'KORUMA SİMÜLASYONU' : isCritical ? 'KRİTİK ÖLÇÜM' : isWarning ? 'DENGELEME' : 'STABİL'}
        </span>
      </div>

      {/* Crisp P&ID Engineering SVG */}
      <div className="my-2 flex items-center justify-center">
        <svg
          viewBox="0 0 360 220"
          className="h-52 w-full max-w-[360px]"
          role="img"
          aria-label="Kimyasal Reaktör P&ID Şeması"
        >
          {/* Feed Pipe (Top Left) */}
          <path
            d="M 24 38 L 122 38 L 122 66"
            fill="none"
            stroke="#5C5A52"
            strokeWidth="2"
          />
          <polygon points="118,62 126,62 122,70" fill="#5C5A52" />
          <text x="18" y="30" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="#5C5A52">
            BESLEME
          </text>

          {/* Dosing Valve (Top Right) */}
          <path
            d="M 334 38 L 238 38 L 238 66"
            fill="none"
            stroke="#5C5A52"
            strokeWidth="2"
          />
          {/* Valve symbol */}
          <polygon points="274,32 274,44 286,38" fill="#FAF9F5" stroke="#181816" strokeWidth="1.5" />
          <polygon points="298,32 298,44 286,38" fill="#FAF9F5" stroke="#181816" strokeWidth="1.5" />
          <text x="262" y="25" fontSize="8.5" fontFamily="IBM Plex Mono, monospace" fill="#5C5A52">
            DOZAJ V-02
          </text>

          {/* Motor & Agitator Shaft */}
          <rect
            x="166"
            y="14"
            width="28"
            height="18"
            rx="2"
            fill="#181816"
          />
          <text
            x="180"
            y="26"
            textAnchor="middle"
            fontSize="9"
            fontFamily="IBM Plex Mono, monospace"
            fill="#F2F1EC"
          >
            M1
          </text>
          <line x1="180" y1="32" x2="180" y2="156" stroke="#181816" strokeWidth="2.2" />

          {/* Thermal Cooling/Heating Jacket (Outer Shell) */}
          <path
            d="M 104 92 L 104 166 Q 104 192 180 192 Q 256 192 256 166 L 256 92"
            fill={jacketFill}
            stroke={jacketStroke}
            strokeWidth="2"
          />

          {/* Inner Reactor Tank Body */}
          <path
            d="M 114 68 L 246 68 L 246 162 Q 246 182 180 182 Q 114 182 114 162 Z"
            fill="#FFFFFF"
            stroke="#181816"
            strokeWidth="2"
          />

          {/* Liquid Volume inside Tank */}
          <path
            d="M 116 106 L 244 106 L 244 161 Q 244 180 180 180 Q 116 180 116 161 Z"
            fill={liquidFill}
            stroke={liquidStroke}
            strokeWidth="1"
          />

          {/* Agitator Blades */}
          <g className={`agitator-blade ${!isRunning ? 'agitator-paused' : ''}`}>
            <rect x="148" y="150" width="64" height="7" rx="1.5" fill="#181816" />
          </g>

          {/* Discharge Pipe (Bottom) */}
          <line x1="180" y1="192" x2="180" y2="212" stroke="#5C5A52" strokeWidth="2" />
          <line x1="180" y1="212" x2="296" y2="212" stroke="#5C5A52" strokeWidth="2" />
          <polygon points="292,208 292,216 300,212" fill="#5C5A52" />
          <text x="304" y="215" fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="#5C5A52">
            ÜRÜN
          </text>

          {/* Temperature Probe TT-101 (Left) */}
          <line x1="88" y1="130" x2="132" y2="130" stroke="#181816" strokeWidth="1.5" />
          <circle cx="132" cy="130" r="3" fill={jacketStroke} />
          <rect
            x="10"
            y="112"
            width="80"
            height="36"
            rx="3"
            fill="#FFFFFF"
            stroke={latest.tempStatus === 'critical' ? '#C82333' : '#BDB9AC'}
            strokeWidth="1.5"
          />
          <text x="16" y="125" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="#78756C">
            TT-101 ISI
          </text>
          <text
            x="16"
            y="141"
            fontSize="12"
            fontWeight="600"
            fontFamily="IBM Plex Mono, monospace"
            fill={latest.tempStatus === 'critical' ? '#A81C28' : '#181816'}
          >
            {latest.temperature.toFixed(1)}°C
          </text>

          {/* pH Probe AT-102 (Right) */}
          <line x1="228" y1="130" x2="270" y2="130" stroke="#181816" strokeWidth="1.5" />
          <circle cx="228" cy="130" r="3" fill={liquidStroke} />
          <rect
            x="270"
            y="112"
            width="80"
            height="36"
            rx="3"
            fill="#FFFFFF"
            stroke={latest.phStatus === 'critical' ? '#C82333' : '#BDB9AC'}
            strokeWidth="1.5"
          />
          <text x="276" y="125" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="#78756C">
            AT-102 pH
          </text>
          <text
            x="276"
            y="141"
            fontSize="12"
            fontWeight="600"
            fontFamily="IBM Plex Mono, monospace"
            fill={latest.phStatus === 'critical' ? '#A81C28' : '#181816'}
          >
            pH {latest.ph.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="grid grid-cols-3 divide-x divide-[#E5E2D9] border-t border-[#E5E2D9] pt-2.5 text-center font-mono text-[11px]">
        <div>
          <span className="block text-[9px] uppercase text-[#78756C]">CEKET YÜKÜ</span>
          <span className="mt-0.5 block font-semibold text-[#181816] tabular-nums">
            {latest.energyKw.toFixed(1)} kW
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase text-[#78756C]">VERİM</span>
          <span className="mt-0.5 block font-semibold text-[#1E5641] tabular-nums">
            %{latest.yieldPct.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase text-[#78756C]">KARIŞTIRICI</span>
          <span className="mt-0.5 block font-semibold text-[#181816]">
            {isRunning ? '180 RPM' : 'DURDU'}
          </span>
        </div>
      </div>
    </div>
  );
}
