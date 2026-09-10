
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  Layers, 
  Cpu, 
  BarChart3 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/live', label: 'Live', icon: Activity },
    { to: '/history', label: 'History', icon: History },
    { to: '/batches', label: 'Batches', icon: Layers },
    { to: '/device', label: 'Device', icon: Cpu },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex justify-around items-center font-mono">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.exact}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all ${
              isActive
                ? 'text-emerald-400 bg-emerald-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <item.icon className="w-4 h-4 mb-0.5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
