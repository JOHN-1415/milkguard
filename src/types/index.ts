export type SpoilageState = 'GOOD' | 'SPOILING' | 'SPOILED';
export type AdulterationState = 'NOT_DETECTED' | 'DETECTED';

export interface SensorValues {
  temperature: number;      // DS18B20 1-Wire Digital Probe (°C)
  turbidity: number;        // Turbidity / Optical Transmittance (NTU, 0 - 4000)
  turbidityVoltage?: number;// Turbidity Probe Analog Output (Volts, 0.0 - 4.5V)
  conductivity: number;     // Conductivity / TDS Probe (mS/cm, 4.0 - 5.5 normal)
  ph: number;               // Modular pH Glass Electrode (6.5 - 6.7 normal)
  mq3: number;              // Modular MQ-3 Gas Sensor (Ethanol / VOCs, ADC/ppm)
  mq135: number;            // Modular MQ-135 Gas Sensor (Air Quality / Sulfides, ppm)
  mq137: number;            // Modular MQ-137 Gas Sensor (Ammonia / Amines, ppm)
  humidity: number;         // Ambient / Chamber Humidity (% RH)
}

export interface ClassificationResult {
  spoilage: SpoilageState;
  adulteration: AdulterationState;
  qualityScore: number;     // 0 - 100
  confidence?: number;
  detectedAdulterants?: string[];
  spoilageNotes?: string;
  verdictSummary?: string;
  lcdLines?: string[];      // 4-line character display buffer mirroring physical ESP32 LCD
}

export interface TimeSeriesPoint {
  timeOffsetSec: number;
  temperature: number;
  turbidity: number;
  conductivity: number;
  ph: number;
  mq3: number;
  mq135: number;
  mq137: number;
}

export interface TestReading {
  testId: string;
  deviceId: string;
  batchId: string;
  timestamp: string; // ISO 8601 string
  sensors: SensorValues;
  result: ClassificationResult;
  operatorNote?: string;
  timeSeriesSamples?: TimeSeriesPoint[];
  dataSource?: 'SIMULATION' | 'WEB_SERIAL' | 'WIFI_DIRECT' | 'REST_BACKEND';
}

export interface MilkBatch {
  batchId: string;
  source: string; // Farmer / Supplier ID e.g. FARMER-001
  farmerName?: string;
  volumeLiters: number;
  collectionTime: string;
  createdDate: string;
  testCount: number;
  averageQualityScore: number;
  latestResult: {
    spoilage: SpoilageState;
    adulteration: AdulterationState;
    qualityScore: number;
    timestamp: string;
  };
  status: 'ACTIVE' | 'ARCHIVED' | 'REJECTED' | 'APPROVED';
  notes?: string;
}

export interface SensorHealth {
  id: 'temperature' | 'turbidity' | 'conductivity' | 'ph' | 'mq3' | 'mq135' | 'mq137';
  name: string;
  pinout: string;
  hardwareType: 'Primary ESP32 Pin' | 'I2C Bus' | 'Modular Plugin';
  status: 'Available' | 'Degraded' | 'Calibrating' | 'Offline';
  lastCalibrated: string;
  signalQuality: number; // 0 - 100%
  description: string;
  typicalRange: string;
}

export type HardwareConnectionType = 'SIMULATION' | 'WEB_SERIAL' | 'WIFI_DIRECT' | 'REST_BACKEND';

export interface HardwarePluginInfo {
  id: HardwareConnectionType;
  name: string;
  description: string;
  connected: boolean;
  portOrUrl?: string;
  baudRate?: number;
  lastPacketTime?: string;
  packetCount: number;
  deviceModel: string;
}

export interface DeviceStatus {
  deviceId: string;
  deviceType: 'SIMULATION DEVICE' | 'ESP32 HARDWARE NODE';
  connectionStatus: 'Connected' | 'Disconnected' | 'Simulated' | 'Connecting';
  connectionType: 'Wi-Fi' | 'USB Serial' | 'BLE' | 'Simulation Bus';
  activePlugin: HardwareConnectionType;
  ipAddress?: string;
  serialPort?: string;
  baudRate?: number;
  wifiSsid?: string;
  wifiRssi?: number; // dBm
  batteryLevel: number; // 0 - 100%
  firmwareVersion: string;
  lastReadingTime: string;
  uptimeSeconds: number;
  sensors: SensorHealth[];
}

export type PresetType = 'GOOD_MILK' | 'SPOILING_MILK' | 'SPOILED_MILK' | 'ADULTERATED_MILK' | 'CUSTOM';

export interface PresetConfig {
  id: PresetType;
  label: string;
  description: string;
  targetSpoilage: SpoilageState;
  targetAdulteration: AdulterationState;
  expectedScore: number;
  baseSensors: SensorValues;
}

export interface AnalyticsSummary {
  totalTests: number;
  goodSamples: number;
  spoilingSamples: number;
  spoiledSamples: number;
  adulteratedSamples: number;
  averageQualityScore: number;
  passRate: number;
  qualityTrend: { date: string; avgScore: number; testCount: number }[];
  spoilageDistribution: { name: string; value: number; color: string }[];
  adulterationDistribution: { name: string; value: number; color: string }[];
  sensorCorrelation: { name: string; ph: number; conductivity: number; turbidity: number; score: number }[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  tempUnit: 'C' | 'F';
  condUnit: 'mS/cm' | 'uS/cm';
  turbidityUnit: 'NTU' | 'V';
  notificationsEnabled: boolean;
  simulationAutoStream: boolean;
  simulationJitterSpeed: 'slow' | 'normal' | 'fast';
  displayDetailedGas: boolean;
  displayHardwareLcd: boolean;
  deviceId: string;
  hardwarePlugin: HardwareConnectionType;
  wifiHost: string;
  serialBaud: number;
}
