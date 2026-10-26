import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cpu, 
  Usb, 
  Wifi, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Download, 
  RefreshCw,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { hardwareManager } from '../../services/hardwarePlugins';
import { ESP32_FIRMWARE_SOURCE } from '../../hardware/esp32FirmwareCode';
import type { HardwareConnectionType } from '../../types';

interface HardwarePluginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwarePluginModal: React.FC<HardwarePluginModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<HardwareConnectionType>(hardwareManager.getConnectionType());
  const [isConnected, setIsConnected] = useState(hardwareManager.isConnectedToHardware());
  const [baudRate, setBaudRate] = useState(115200);
  const [wifiIp, setWifiIp] = useState('192.168.4.1');
  const [backendUrl, setBackendUrl] = useState('http://localhost:5000/api');
  const [rawLogs, setRawLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isWebSerialSupported = typeof navigator !== 'undefined' && 'serial' in navigator;

  useEffect(() => {
    if (!isOpen) return;

    setActiveTab(hardwareManager.getConnectionType());
    setIsConnected(hardwareManager.isConnectedToHardware());

    const unsubscribe = hardwareManager.subscribe((packet) => {
      setRawLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ${packet.rawLine || JSON.stringify(packet.sensors)}`,
        ...prev.slice(0, 49)
      ]);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectSerial = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const ok = await hardwareManager.connectSerial(baudRate);
      if (ok) {
        setIsConnected(true);
        setActiveTab('WEB_SERIAL');
        setStatusMessage('Successfully connected to ESP32 over USB Serial.');
      } else {
        setStatusMessage('Connection cancelled or device not selected.');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err?.message || 'Failed to connect via USB Serial'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectWiFi = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const ok = await hardwareManager.connectWiFi(wifiIp);
      if (ok) {
        setIsConnected(true);
        setActiveTab('WIFI_DIRECT');
        setStatusMessage(`Connected to MilkGuard-ESP32 SoftAP at ${wifiIp}.`);
      } else {
        setStatusMessage(`Could not reach ESP32 at ${wifiIp}. Ensure phone/PC is connected to MilkGuard-ESP32 Wi-Fi.`);
      }
    } catch (err: any) {
      setStatusMessage(`Wi-Fi error: ${err?.message || 'Connection failed'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await hardwareManager.disconnect();
    setIsConnected(false);
    setActiveTab('SIMULATION');
    setStatusMessage('Switched back to Virtual Hardware Simulation.');
  };

  const handleDownloadFirmware = () => {
    const blob = new Blob([ESP32_FIRMWARE_SOURCE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'milkguard_esp32_firmware.ino';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Hardware Connection Manager
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ESP32 READY
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plug-and-play drivers for ESP32 sensors (DS18B20, Turbidity, Conductivity, LCD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/60 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-200 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'SIMULATION'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Simulation</span>
          </button>

          <button
            onClick={() => setActiveTab('WEB_SERIAL')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'WEB_SERIAL'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Usb className="w-4 h-4" />
            <span>USB Serial</span>
          </button>

          <button
            onClick={() => setActiveTab('WIFI_DIRECT')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'WIFI_DIRECT'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Wi-Fi SoftAP</span>
          </button>

          <button
            onClick={() => setActiveTab('REST_BACKEND')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'REST_BACKEND'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Lab REST API</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Active Tab Panel */}
          {activeTab === 'SIMULATION' && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    High-Fidelity ESP32 Physics Simulator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Emulates physical sensor ADC voltages and physics responses for DS18B20, optical Turbidity, TDS/EC, and volatile headspace gases.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  READY
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                Use the <strong>Live Analysis</strong> page presets to trigger specific milk fault conditions (Water dilution, Bacterial spoilage, Detergent/Urea adulteration). When physical hardware is connected via USB or Wi-Fi, the simulator seamlessly passes control to live physical hardware telemetry.
              </div>
            </div>
          )}

          {activeTab === 'WEB_SERIAL' && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <Usb className="w-4 h-4 text-emerald-500" />
                    Direct USB Web Serial (Chrome / Edge / Opera)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Connect your ESP32 board directly to your computer or Android phone via USB-C or Micro-USB cable without any drivers.
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  isConnected && activeTab === 'WEB_SERIAL'
                    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-slate-500 bg-slate-500/10 border-slate-500/20'
                }`}>
                  {isConnected && activeTab === 'WEB_SERIAL' ? 'CONNECTED' : 'STANDBY'}
                </span>
              </div>

              {!isWebSerialSupported ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Web Serial API is not supported in this browser. Please open in Google Chrome or Microsoft Edge.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span>Baud Rate:</span>
                      <select
                        value={baudRate}
                        onChange={(e) => setBaudRate(Number(e.target.value))}
                        disabled={isConnected}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value={115200}>115200 (Default ESP32)</option>
                        <option value={57600}>57600</option>
                        <option value={9600}>9600</option>
                      </select>
                    </div>

                    {!isConnected ? (
                      <button
                        onClick={handleConnectSerial}
                        disabled={isConnecting}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
                        <span>Select ESP32 Port & Connect</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleDisconnect}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Disconnect USB</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    * Make sure you select the <strong>Silicon Labs CP210x</strong> or <strong>CH340</strong> USB to UART port in the browser popup.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'WIFI_DIRECT' && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    Wi-Fi Direct SoftAP (Standalone ESP32 Hotspot)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Connect your phone or laptop to the ESP32 Wi-Fi Hotspot: <strong>SSID: MilkGuard-ESP32</strong> (Pass: <code>milkguard123</code>).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span>ESP32 IP:</span>
                    <input
                      type="text"
                      value={wifiIp}
                      onChange={(e) => setWifiIp(e.target.value)}
                      disabled={isConnected}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 w-36"
                    />
                  </div>

                  {!isConnected ? (
                    <button
                      onClick={handleConnectWiFi}
                      disabled={isConnecting}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                      <span>Connect Wi-Fi Stream</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Disconnect Wi-Fi</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  The PWA will fetch high-frequency telemetry at <code>http://{wifiIp}/telemetry</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'REST_BACKEND' && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <Server className="w-4 h-4 text-emerald-500" />
                    Centralized Lab REST API & MongoDB Service
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    When you deploy your Node.js/Express + MongoDB backend, configure the API gateway endpoint here.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span>API Base URL:</span>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={() => {
                      hardwareManager.connectBackend(backendUrl);
                      setStatusMessage(`Target backend set to ${backendUrl}. Ready for future database sync.`);
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs cursor-pointer"
                  >
                    Save Endpoint
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hardware Schematic Quick Reference Card */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-900 dark:text-slate-200 font-bold">
              <span>HARDWARE SCHEMATIC PINOUT (MATCHING ARCHITECTURE)</span>
              <button
                onClick={handleDownloadFirmware}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ESP32 Firmware (.ino)</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">DS18B20 Temp Probe:</span> <span className="text-emerald-600 dark:text-emerald-400">GPIO 4</span> (1-Wire + 4.7kΩ)
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Turbidity Sensor:</span> <span className="text-emerald-600 dark:text-emerald-400">GPIO 34</span> (Analog ADC1)
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Conductivity Probe:</span> <span className="text-emerald-600 dark:text-emerald-400">GPIO 35</span> (Analog ADC1)
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">LCD 20x4 Display:</span> <span className="text-emerald-600 dark:text-emerald-400">GPIO 21 (SDA), GPIO 22 (SCL)</span>
              </div>
            </div>
          </div>

          {/* Live Packet Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-bold">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                <span>RAW HARDWARE PACKET STREAM</span>
              </div>
              <button
                onClick={() => setRawLogs([])}
                className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear Terminal
              </button>
            </div>
            <div className="bg-black p-3 rounded-lg border border-slate-800 text-emerald-400 font-mono text-[11px] h-32 overflow-y-auto space-y-1">
              {rawLogs.length === 0 ? (
                <div className="text-slate-600 italic">Waiting for hardware packets... (Connect USB Serial or Wi-Fi to view raw stream)</div>
              ) : (
                rawLogs.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>Plugin: <strong>{activeTab}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};
