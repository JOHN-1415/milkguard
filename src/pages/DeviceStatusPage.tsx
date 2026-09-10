import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DeviceStatus } from '../types';
import { LoadingState } from '../components/Common/LoadingState';
import { 
  Cpu, 
  Wifi, 
  BatteryCharging, 
  Activity, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Radio
} from 'lucide-react';

export const DeviceStatusPage: React.FC = () => {
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [selfTestMessage, setSelfTestMessage] = useState('');

  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const loadDeviceStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getDeviceStatus();
      setDevice(data);
    } catch (err) {
      console.error('Failed to load device status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSelfTest = () => {
    setIsSelfTesting(true);
    setSelfTestMessage('Verifying ADC reference voltage and I2C probe bus...');

    setTimeout(() => {
      setSelfTestMessage('Checking MQ-3, MQ-135, MQ-137 heater filaments...');
    }, 1200);

    setTimeout(() => {
      setSelfTestMessage('Probing pH glass electrode impedance...');
    }, 2400);

    setTimeout(() => {
      setIsSelfTesting(false);
      setSelfTestMessage('Self-Test Complete: All 6 sensing elements Operational.');
    }, 3600);
  };

  if (loading || !device) {
    return <LoadingState message="Querying hardware diagnostics..." />;
  }

  return (
    <div className="space-y-6 font-mono">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong className="font-bold uppercase tracking-wider block">
            SIMULATION DEVICE – Hardware Sensor Node MG-001
          </strong>
          <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-300/80">
            This screen displays the diagnostic specifications for the planned ESP32 microcontroller acquisition board.
            Telemetry is simulated to validate the device management UI.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {device.deviceId}
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  {device.connectionStatus}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                  {device.deviceType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ESP32 Dual-Core Microcontroller with Multi-Sensor ADC Interface
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSelfTest}
              disabled={isSelfTesting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSelfTesting ? 'animate-spin' : ''}`} />
              <span>{isSelfTesting ? 'Testing Hardware...' : 'Run Diagnostics Self-Test'}</span>
            </button>
          </div>
        </div>

        {selfTestMessage && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>{selfTestMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Connection
            </span>
            <div className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {device.connectionType} ({device.wifiRssi} dBm)
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{device.wifiSsid}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <BatteryCharging className="w-3 h-3 text-emerald-500" /> Battery
            </span>
            <div className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {device.batteryLevel}%
            </div>
            <div className="text-[10px] text-emerald-500 mt-0.5">Li-Ion 3.7V Nominal</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Uptime
            </span>
            <div className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {Math.floor(device.uptimeSeconds / 3600)}h {Math.floor((device.uptimeSeconds % 3600) / 60)}m
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Continuous Monitoring</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-500" /> Firmware
            </span>
            <div className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
              {device.firmwareVersion}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">OTA Capable</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Integrated Sensor Array Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {device.sensors.map(s => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {s.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Range: {s.typicalRange}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  {s.status}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {s.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Signal Quality: {s.signalQuality}%</span>
                <span>Calibrated: 09-08</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
