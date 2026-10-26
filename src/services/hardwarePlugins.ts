import type { SensorValues, HardwareConnectionType, HardwarePluginInfo } from '../types';

export interface HardwarePacket {
  sensors?: Partial<SensorValues>;
  lcdLines?: string[];
  rawLine?: string;
}

export type HardwareDataCallback = (packet: HardwarePacket) => void;

class HardwarePluginManager {
  private activePluginType: HardwareConnectionType = 'SIMULATION';
  private serialPort: any = null;
  private serialReader: any = null;
  private wifiInterval: any = null;
  private listeners: Set<HardwareDataCallback> = new Set();
  
  public pluginStates: Record<HardwareConnectionType, HardwarePluginInfo> = {
    SIMULATION: {
      id: 'SIMULATION',
      name: 'Built-in Telemetry Simulator',
      description: 'Generates realistic multi-sensor telemetry with biochemical physics models and specimen presets.',
      connected: true,
      packetCount: 0,
      deviceModel: 'ESP32 Virtual Node (MG-001)'
    },
    WEB_SERIAL: {
      id: 'WEB_SERIAL',
      name: 'USB Web Serial Driver',
      description: 'Connect directly to ESP32 via USB (CP2102 / CH340 / CH9102) at 115200 baud using the Web Serial API.',
      connected: false,
      baudRate: 115200,
      packetCount: 0,
      deviceModel: 'ESP32 Physical Hardware via USB'
    },
    WIFI_DIRECT: {
      id: 'WIFI_DIRECT',
      name: 'Wi-Fi / LAN Direct Node',
      description: 'Connect directly to ESP32 WebServer (e.g. 192.168.4.1 SoftAP or LAN DHCP IP) over local Wi-Fi.',
      connected: false,
      portOrUrl: 'http://192.168.4.1/telemetry',
      packetCount: 0,
      deviceModel: 'ESP32 Wi-Fi Node (MG-001)'
    },
    REST_BACKEND: {
      id: 'REST_BACKEND',
      name: 'Cloud REST API Driver',
      description: 'Interconnect via Node.js Express & MongoDB centralized backend repository.',
      connected: false,
      portOrUrl: 'http://localhost:5000/api',
      packetCount: 0,
      deviceModel: 'MilkGuard Cloud Gateway'
    }
  };

  public getConnectionType(): HardwareConnectionType {
    return this.activePluginType;
  }

  public isConnectedToHardware(): boolean {
    return this.activePluginType !== 'SIMULATION' && (this.pluginStates[this.activePluginType]?.connected ?? false);
  }

  public subscribe(callback: HardwareDataCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(packet: HardwarePacket) {
    this.pluginStates[this.activePluginType].packetCount++;
    this.pluginStates[this.activePluginType].lastPacketTime = new Date().toISOString();
    this.listeners.forEach(cb => cb(packet));
  }

  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public async connectSerial(baudRate = 115200): Promise<boolean> {
    if (!this.isWebSerialSupported()) {
      return false;
    }

    try {
      this.serialPort = await (navigator as any).serial.requestPort();
      await this.serialPort.open({ baudRate });

      this.activePluginType = 'WEB_SERIAL';
      this.pluginStates.WEB_SERIAL.connected = true;
      this.pluginStates.WEB_SERIAL.baudRate = baudRate;
      this.pluginStates.SIMULATION.connected = false;

      this.startSerialReader();
      return true;
    } catch (err) {
      console.error('Serial connection error:', err);
      return false;
    }
  }

  private async startSerialReader() {
    const textDecoder = new TextDecoderStream();
    this.serialPort.readable.pipeTo(textDecoder.writable).catch(() => {});
    const reader = textDecoder.readable.getReader();
    this.serialReader = reader;

    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            this.parseIncomingSerialLine(trimmed);
          }
        }
      }
    } catch (err) {
      console.warn('Serial reader exited:', err);
    } finally {
      reader.releaseLock();
    }
  }

  private parseIncomingSerialLine(line: string) {
    try {
      if (line.startsWith('{') && line.endsWith('}')) {
        const parsed = JSON.parse(line);
        const sensors: Partial<SensorValues> = {};

        if (parsed.temp !== undefined) sensors.temperature = Number(parsed.temp);
        if (parsed.turb !== undefined) sensors.turbidity = Number(parsed.turb);
        if (parsed.turbV !== undefined) sensors.turbidityVoltage = Number(parsed.turbV);
        if (parsed.ec !== undefined) sensors.conductivity = Number(parsed.ec);
        if (parsed.ph !== undefined) sensors.ph = Number(parsed.ph);
        if (parsed.mq3 !== undefined) sensors.mq3 = Number(parsed.mq3);
        if (parsed.mq135 !== undefined) sensors.mq135 = Number(parsed.mq135);
        if (parsed.mq137 !== undefined) sensors.mq137 = Number(parsed.mq137);
        if (parsed.humidity !== undefined) sensors.humidity = Number(parsed.humidity);

        this.notify({
          sensors,
          lcdLines: parsed.lcd,
          rawLine: line
        });
      } else {
        this.notify({ rawLine: line });
      }
    } catch {
      this.notify({ rawLine: line });
    }
  }

  public async connectWiFi(ipOrUrl = '192.168.4.1'): Promise<boolean> {
    this.stopWifiPolling();
    const url = ipOrUrl.startsWith('http') ? ipOrUrl : `http://${ipOrUrl}/telemetry`;

    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        this.activePluginType = 'WIFI_DIRECT';
        this.pluginStates.WIFI_DIRECT.portOrUrl = url;
        this.pluginStates.WIFI_DIRECT.connected = true;
        this.pluginStates.SIMULATION.connected = false;

        this.notify({
          sensors: {
            temperature: data.temperature,
            turbidity: data.turbidity,
            turbidityVoltage: data.turbidityVoltage,
            conductivity: data.conductivity,
            ph: data.ph,
            mq3: data.mq3 || 135,
            mq135: data.mq135 || 275,
            mq137: data.mq137 || 85,
            humidity: data.humidity || 55
          },
          lcdLines: data.lcd,
          rawLine: JSON.stringify(data)
        });

        this.wifiInterval = setInterval(async () => {
          try {
            const pollRes = await fetch(url, { signal: AbortSignal.timeout(1800) });
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              this.notify({
                sensors: {
                  temperature: pollData.temperature,
                  turbidity: pollData.turbidity,
                  turbidityVoltage: pollData.turbidityVoltage,
                  conductivity: pollData.conductivity,
                  ph: pollData.ph,
                  mq3: pollData.mq3 || 135,
                  mq135: pollData.mq135 || 275,
                  mq137: pollData.mq137 || 85,
                  humidity: pollData.humidity || 55
                },
                lcdLines: pollData.lcd,
                rawLine: JSON.stringify(pollData)
              });
            }
          } catch {
            // Drop packet silently
          }
        }, 1000);

        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public connectBackend(url: string) {
    this.pluginStates.REST_BACKEND.portOrUrl = url;
  }

  public stopWifiPolling() {
    if (this.wifiInterval) {
      clearInterval(this.wifiInterval);
      this.wifiInterval = null;
    }
    this.pluginStates.WIFI_DIRECT.connected = false;
  }

  public async disconnect(): Promise<void> {
    this.stopWifiPolling();
    try {
      if (this.serialReader) {
        await this.serialReader.cancel();
        this.serialReader = null;
      }
      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }
    } catch (e) {
      console.warn('Error closing serial:', e);
    } finally {
      this.pluginStates.WEB_SERIAL.connected = false;
      this.activePluginType = 'SIMULATION';
      this.pluginStates.SIMULATION.connected = true;
    }
  }
}

export const hardwareManager = new HardwarePluginManager();
