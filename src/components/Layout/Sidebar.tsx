import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  Layers, 
  Cpu, 
  BarChart3, 
  Settings,
  ShieldAlert,
  Radio,
  Usb
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { hardwareConnectionType, isHardwareConnected, openHardwareModal } = useSimulation();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/live', label: 'Live Analysis', icon: Activity },
    { to: '/history', label: 'Test History', icon: History },
    { to: '/batches', label: 'Batch Management', icon: Layers },
    { to: '/device', label: 'Device Status', icon: Cpu },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-screen text-slate-700 dark:text-slate-300 font-mono transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            MilkGuard
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
            Quality Verification
          </p>
        </div>
      </div>

      {/* Hardware Node Badge / Trigger */}
      <div 
        onClick={openHardwareModal}
        className="mx-4 my-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:border-emerald-500/50 transition-colors"
        title="Click to configure hardware connection"
      >
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
          <span className="font-semibold">HARDWARE NODE</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            {isHardwareConnected ? (
              <Usb className="w-3 h-3 text-emerald-500 animate-pulse" />
            ) : (
              <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
            )}
            ESP32
          </span>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex justify-between">
          <span>Mode:</span>
          <span className={`font-bold font-mono ${isHardwareConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {hardwareConnectionType}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Hardware Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-700 dark:text-slate-400 mb-0.5">
          {isHardwareConnected ? 'Physical ESP32 Online' : 'Modular Hardware Driver'}
        </div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Sensors: DS18B20, Turbidity, Conductivity, I2C LCD Display.
        </p>
      </div>
    </aside>
  );
};
