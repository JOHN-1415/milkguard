
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
  Radio
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
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
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-slate-300 font-mono">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            MilkGuard
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
            Quality Verification
          </p>
        </div>
      </div>

      {/* Hardware Node Badge */}
      <div className="mx-4 my-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>HARDWARE NODE</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Radio className="w-3 h-3 animate-pulse" /> MG-001
          </span>
        </div>
        <div className="text-[11px] text-slate-500 flex justify-between">
          <span>Firmware:</span>
          <span className="text-slate-300 font-mono">v0.1.0</span>
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
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Simulation Warning */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-400 mb-0.5">Simulated Telemetry</div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Hardware sensors pending. Telemetry emulates ESP32 multi-sensor payload.
        </p>
      </div>
    </aside>
  );
};
