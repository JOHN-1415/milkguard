export type SpoilageState = 'GOOD' | 'SPOILING' | 'SPOILED';
export type AdulterationState = 'NOT_DETECTED' | 'DETECTED';

export interface SensorValues {
  mq3: number;         // VOCs/Ethanol (raw ADC / ppm)
  mq135: number;       // Air Quality/Ammonia/CO2 (ppm)
  mq137: number;       // Ammonia & spoilage amines (ppm)
  temperature: number; // °C
  humidity: number;    // % RH
  ph: number;          // pH (6.5 - 6.7 is normal raw milk)
  conductivity: number;// mS/cm (4.0 - 5.5 is normal raw milk)
}

export interface ClassificationResult {
  spoilage: SpoilageState;
  adulteration: AdulterationState;
  qualityScore: number; // 0 - 100
  confidence?: number;
  detectedAdulterants?: string[];
  spoilageNotes?: string;
  verdictSummary?: string;
}

export interface TimeSeriesPoint {
  timeOffsetSec: number;
  mq3: number;
  mq135: number;
  mq137: number;
  ph: number;
  conductivity: number;
  temperature: number;
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
  id: 'mq3' | 'mq135' | 'mq137' | 'ph' | 'conductivity' | 'temperature';
  name: string;
  status: 'Available' | 'Degraded' | 'Calibrating' | 'Offline';
  lastCalibrated: string;
  signalQuality: number; // 0 - 100%
  description: string;
  typicalRange: string;
}

export interface DeviceStatus {
  deviceId: string;
  deviceType: 'SIMULATION DEVICE' | 'ESP32 HARDWARE NODE';
  connectionStatus: 'Connected' | 'Disconnected' | 'Simulated' | 'Connecting';
  connectionType: 'Wi-Fi' | 'BLE' | 'Cellular' | 'Simulation Bus';
  ipAddress?: string;
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
  sensorCorrelation: { name: string; ph: number; conductivity: number; mq137: number; score: number }[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  tempUnit: 'C' | 'F';
  condUnit: 'mS/cm' | 'uS/cm';
  notificationsEnabled: boolean;
  simulationAutoStream: boolean;
  simulationJitterSpeed: 'slow' | 'normal' | 'fast';
  displayDetailedGas: boolean;
  deviceId: string;
}
