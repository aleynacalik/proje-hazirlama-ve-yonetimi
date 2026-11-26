import {
  Activity,
  Bell,
  Cpu,
  Download,
  LineChart,
  Pause,
  Play,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import type { ProcessConfig, SeverityLevel } from '../types/process';

export type ActiveTab = 'monitor' | 'analytics' | 'architecture' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  config: ProcessConfig;
  unackedAlarmCount: number;
  overallStatus: SeverityLevel;
}

const NAV_ITEMS: { id: ActiveTab; code: string; label: string; sub: string; icon: typeof Activity }[] = [
  { id: 'monitor', code: '01', label: 'Canlı İzleme', sub: 'Reaktör & Grafikler', icon: Activity },
  { id: 'analytics', code: '02', label: 'Enerji & Model', sub: 'Matematik & Maliyet', icon: LineChart },
  { id: 'architecture', code: '03', label: 'Veri Akışı', sub: 'EEM & Süreç Şeması', icon: Cpu },
  { id: 'settings', code: '04', label: 'Parametreler', sub: 'Ekip Konfigürasyonu', icon: Sliders },
];

export function Sidebar({
  activeTab,
  onTabChange,
  config,
  unackedAlarmCount,
  overallStatus,
}: SidebarProps) {
  const statusBadge =
    overallStatus === 'critical'
      ? { dot: 'bg-[#D92D20]', text: 'text-[#FCA5A5]', label: 'KRİTİK DURUM' }
      : overallStatus === 'warning'
        ? { dot: 'bg-[#D97706]', text: 'text-[#FCD34D]', label: 'UYARI MODU' }
        : { dot: 'bg-[#34A87B]', text: 'text-[#A7E3CA]', label: 'PROSES NORMAL' };

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-[#2A2A27] bg-[#181816] text-[#F2F1EC] lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div>
        {/* Brand Plate */}
        <div className="border-b border-[#2A2A27] px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9E9B90]">
              PROSES KONTROL / MES
            </span>
            <span className="border border-[#3A3A35] px-1.5 py-0.5 font-mono text-[10px] text-[#C9C6BC]">
              v1.0
            </span>
          </div>
          <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
            ChemFlow<span className="font-mono font-normal text-[#9E9B90]">.mes</span>
          </h1>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#A6A398]">
            {config.chemistry.reactionName}
          </p>
        </div>

        {/* Unit Identification Strip */}
        <div className="grid grid-cols-2 border-b border-[#2A2A27] font-mono text-[11px]">
          <div className="border-r border-[#2A2A27] px-4 py-2.5">
            <span className="block text-[9px] uppercase tracking-widest text-[#7E7C73]">ÜNİTE</span>
            <span className="mt-0.5 block text-[#E6E4DC]">{config.chemistry.reactorId}</span>
          </div>
          <div className="px-4 py-2.5">
            <span className="block text-[9px] uppercase tracking-widest text-[#7E7C73]">PARTİ</span>
            <span className="mt-0.5 block text-[#E6E4DC]">{config.chemistry.batchCode}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`group flex shrink-0 items-center gap-3 rounded-[4px] border px-3 py-2.5 text-left transition lg:w-full ${
                  active
                    ? 'border-[#3D3C36] bg-[#262622] text-white'
                    : 'border-transparent text-[#A6A398] hover:border-[#2C2C28] hover:bg-[#20201D] hover:text-[#E6E4DC]'
                }`}
              >
                <span
                  className={`font-mono text-[10px] ${
                    active ? 'text-[#E6E4DC]' : 'text-[#6D6B62]'
                  }`}
                >
                  {item.code}
                </span>
                <Icon className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-none">{item.label}</div>
                  <div className="mt-1 hidden text-[10px] text-[#7E7C73] lg:block">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Plant Status Footer */}
      <div className="hidden border-t border-[#2A2A27] p-4 lg:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${statusBadge.dot}`} />
            <span className={`font-mono text-[10px] font-medium tracking-wider ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
          </div>
          {unackedAlarmCount > 0 && (
            <span className="flex items-center gap-1 rounded-[3px] bg-[#A81C28] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
              <Bell className="h-3 w-3" />
              {unackedAlarmCount}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#262623] pt-2.5 font-mono text-[10px] text-[#7E7C73]">
          <span>HMI STANDARDI</span>
          <span className="text-[#B5B2A7]">ISA-101</span>
        </div>
      </div>
    </aside>
  );
}

interface TopBarProps {
  activeTab: ActiveTab;
  isRunning: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onExportCsv: () => void;
  unackedAlarmCount: number;
  lastTimestamp: string;
  sampleCount: number;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  monitor: {
    title: 'Proses İzleme ve Operatör Konsolu',
    subtitle: 'Sıcaklık, pH, enerji yükü ve akıllı alarm akışının anlık takibi',
  },
  analytics: {
    title: 'Enerji Maliyeti ve İstatistiksel Model Analizi',
    subtitle: 'Salınım varyansı, regresyon ilişkisi, OEE ve duruş maliyeti hesabı',
  },
  architecture: {
    title: 'Mantıksal Veri Akışı ve Süreç Mimarisi',
    subtitle: 'Elektrik-elektronik alarm karar mantığı ve endüstriyel üretim akışı',
  },
  settings: {
    title: 'Disiplin Bazlı Proses Parametreleri',
    subtitle: 'Kimya, Endüstri, Matematik ve EEM verilerinin canlı yönetim ekranı',
  },
};

export function TopBar({
  activeTab,
  isRunning,
  onToggleRun,
  onReset,
  onExportCsv,
  unackedAlarmCount,
  lastTimestamp,
  sampleCount,
}: TopBarProps) {
  const meta = TAB_TITLES[activeTab];

  return (
    <header className="sticky top-0 z-20 border-b border-[#D6D3C9] bg-[#FAF9F5]/95 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-7">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-[#181816]">{meta.title}</h2>
          <p className="text-xs text-[#64625A]">{meta.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 border border-[#D6D3C9] bg-[#F2F1EC] px-2.5 py-1.5 font-mono text-[11px] text-[#4A4842] xl:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                isRunning ? 'bg-[#1E7A56]' : 'bg-[#9A9685]'
              }`}
            />
            <span>{isRunning ? 'AKIŞ AÇIK' : 'DURAKLATILDI'}</span>
            <span className="text-[#B5B2A7]">|</span>
            <span className="tabular-nums">{lastTimestamp}</span>
            <span className="text-[#B5B2A7]">|</span>
            <span className="tabular-nums">n={sampleCount}</span>
          </div>

          <button
            onClick={onToggleRun}
            className={`flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-xs font-medium transition ${
              isRunning
                ? 'border-[#181816] bg-[#181816] text-white hover:bg-[#2F2F2B]'
                : 'border-[#1E5641] bg-[#1E5641] text-white hover:bg-[#184534]'
            }`}
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isRunning ? 'Duraklat' : 'Devam Et'}</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-[4px] border border-[#CCC9BE] bg-white px-2.5 py-1.5 text-xs font-medium text-[#35342F] transition hover:border-[#9E9B90] hover:bg-[#F7F6F2]"
            title="Simülasyonu Sıfırla"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-[4px] border border-[#CCC9BE] bg-white px-3 py-1.5 text-xs font-medium text-[#1B4965] transition hover:border-[#1B4965] hover:bg-[#F4F8FA]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV Dışa Aktar</span>
          </button>

          {unackedAlarmCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-[4px] border border-[#E8AEB4] bg-[#FBE6E8] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#A81C28]">
              <Bell className="h-3.5 w-3.5" />
              <span>{unackedAlarmCount} Alarm</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
