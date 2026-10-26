import type { TestReading, MilkBatch, DeviceStatus, PresetConfig } from '../types';

export const INITIAL_PRESETS: PresetConfig[] = [
  {
    id: 'GOOD_MILK',
    label: 'Fresh / Good Milk',
    description: 'Fresh raw milk at nominal opacity (2450 NTU), DS18B20 temperature 24.2°C, and nominal ionic conductivity.',
    targetSpoilage: 'GOOD',
    targetAdulteration: 'NOT_DETECTED',
    expectedScore: 94,
    baseSensors: {
      temperature: 24.2,
      turbidity: 2450,
      turbidityVoltage: 3.85,
      conductivity: 4.75,
      ph: 6.62,
      mq3: 135,
      mq135: 275,
      mq137: 85,
      humidity: 58
    }
  },
  {
    id: 'SPOILING_MILK',
    label: 'Spoiling Milk (Early Onset)',
    description: 'Lactic acidification onset with slight optical changes (2900 NTU) and rising volatile gas emissions.',
    targetSpoilage: 'SPOILING',
    targetAdulteration: 'NOT_DETECTED',
    expectedScore: 72,
    baseSensors: {
      temperature: 28.6,
      turbidity: 2900,
      turbidityVoltage: 3.10,
      conductivity: 4.95,
      ph: 6.35,
      mq3: 195,
      mq135: 355,
      mq137: 145,
      humidity: 65
    }
  },
  {
    id: 'SPOILED_MILK',
    label: 'Spoiled Milk (Curdled & Sour)',
    description: 'Severe lactic curdling (>3500 NTU casein clumping), high temperature (30.1°C), low pH, and amine gas.',
    targetSpoilage: 'SPOILED',
    targetAdulteration: 'NOT_DETECTED',
    expectedScore: 36,
    baseSensors: {
      temperature: 30.1,
      turbidity: 3650,
      turbidityVoltage: 2.15,
      conductivity: 5.40,
      ph: 5.85,
      mq3: 340,
      mq135: 580,
      mq137: 285,
      humidity: 72
    }
  },
  {
    id: 'ADULTERATED_MILK',
    label: 'Adulterated Milk (Water & Solutes)',
    description: 'Water dilution flagged by low optical turbidity (1120 NTU) and added salt/urea flagged by high conductivity (6.95 mS/cm).',
    targetSpoilage: 'GOOD',
    targetAdulteration: 'DETECTED',
    expectedScore: 44,
    baseSensors: {
      temperature: 26.5,
      turbidity: 1120,
      turbidityVoltage: 4.30,
      conductivity: 6.95,
      ph: 7.15,
      mq3: 140,
      mq135: 290,
      mq137: 92,
      humidity: 60
    }
  }
];

export const INITIAL_BATCHES: MilkBatch[] = [
  {
    batchId: 'BATCH-001',
    source: 'FARMER-001',
    farmerName: 'Green Valley Dairy (Rajesh Patel)',
    volumeLiters: 120,
    collectionTime: '06:30 AM',
    createdDate: '2026-09-10T06:30:00Z',
    testCount: 4,
    averageQualityScore: 92,
    latestResult: {
      spoilage: 'GOOD',
      adulteration: 'NOT_DETECTED',
      qualityScore: 92,
      timestamp: '2026-09-10T20:42:00Z'
    },
    status: 'APPROVED',
    notes: 'Morning milking batch. Chilled to 4°C with DS18B20 validation.'
  },
  {
    batchId: 'BATCH-002',
    source: 'FARMER-004',
    farmerName: 'Sunrise Cooperative (Anand Rao)',
    volumeLiters: 250,
    collectionTime: '07:15 AM',
    createdDate: '2026-09-10T07:15:00Z',
    testCount: 3,
    averageQualityScore: 71,
    latestResult: {
      spoilage: 'SPOILING',
      adulteration: 'NOT_DETECTED',
      qualityScore: 70,
      timestamp: '2026-09-10T18:15:00Z'
    },
    status: 'ACTIVE',
    notes: 'Transport tanker temperature elevated during transit (28.6°C).'
  },
  {
    batchId: 'BATCH-003',
    source: 'FARMER-009',
    farmerName: 'Highland Farm (Sunita Devi)',
    volumeLiters: 80,
    collectionTime: '08:00 AM',
    createdDate: '2026-09-10T08:00:00Z',
    testCount: 2,
    averageQualityScore: 44,
    latestResult: {
      spoilage: 'GOOD',
      adulteration: 'DETECTED',
      qualityScore: 44,
      timestamp: '2026-09-10T16:30:00Z'
    },
    status: 'REJECTED',
    notes: 'Flagged for low turbidity (1120 NTU) and high ionic conductivity (6.95 mS/cm).'
  },
  {
    batchId: 'BATCH-004',
    source: 'FARMER-012',
    farmerName: 'Riverdale Organic (Devendra Kumar)',
    volumeLiters: 310,
    collectionTime: '06:00 AM',
    createdDate: '2026-09-09T06:00:00Z',
    testCount: 5,
    averageQualityScore: 95,
    latestResult: {
      spoilage: 'GOOD',
      adulteration: 'NOT_DETECTED',
      qualityScore: 96,
      timestamp: '2026-09-09T19:20:00Z'
    },
    status: 'APPROVED',
    notes: 'Bulk tank A-1. Premium Grade A certified raw milk.'
  }
];

export const INITIAL_TESTS: TestReading[] = [
  {
    testId: 'T001',
    deviceId: 'MG-001',
    batchId: 'BATCH-001',
    timestamp: '2026-09-10T20:42:00Z',
    sensors: {
      temperature: 24.2,
      turbidity: 2450,
      turbidityVoltage: 3.85,
      conductivity: 4.75,
      ph: 6.55,
      mq3: 142,
      mq135: 287,
      mq137: 91,
      humidity: 62
    },
    result: {
      spoilage: 'GOOD',
      adulteration: 'NOT_DETECTED',
      qualityScore: 92,
      confidence: 96.2,
      spoilageNotes: 'Optimal pH range (6.55), nominal turbidity (2450 NTU), and negligible volatile emissions.',
      verdictSummary: 'Safe for processing. Meets raw milk quality verification parameters.',
      lcdLines: [
        'MILKGUARD 92% GOOD  ',
        'T:24.2C TURB:2450N  ',
        'EC:4.75mS ADLT:NO   ',
        'HW:ESP32+DS18B20 OK '
      ]
    },
    operatorNote: 'Routine acceptance testing at receiving dock station 1.'
  },
  {
    testId: 'T002',
    deviceId: 'MG-001',
    batchId: 'BATCH-002',
    timestamp: '2026-09-10T18:15:00Z',
    sensors: {
      temperature: 28.6,
      turbidity: 2900,
      turbidityVoltage: 3.10,
      conductivity: 4.95,
      ph: 6.32,
      mq3: 210,
      mq135: 368,
      mq137: 152,
      humidity: 66
    },
    result: {
      spoilage: 'SPOILING',
      adulteration: 'NOT_DETECTED',
      qualityScore: 70,
      confidence: 92.5,
      spoilageNotes: 'Early stage lactic fermentation. Temperature elevated (28.6°C) and turbidity shifting.',
      verdictSummary: 'Sample beginning to spoil. Immediate pasteurization or rejection recommended.',
      lcdLines: [
        'MILKGUARD 70% SPOIL ',
        'T:28.6C TURB:2900N  ',
        'EC:4.95mS ADLT:NO   ',
        'HW:ESP32+DS18B20 OK '
      ]
    },
    operatorNote: 'Tanker arrived delayed by 2 hours.'
  },
  {
    testId: 'T003',
    deviceId: 'MG-001',
    batchId: 'BATCH-003',
    timestamp: '2026-09-10T16:30:00Z',
    sensors: {
      temperature: 26.5,
      turbidity: 1120,
      turbidityVoltage: 4.30,
      conductivity: 6.95,
      ph: 7.18,
      mq3: 138,
      mq135: 285,
      mq137: 88,
      humidity: 59
    },
    result: {
      spoilage: 'GOOD',
      adulteration: 'DETECTED',
      qualityScore: 44,
      confidence: 97.4,
      detectedAdulterants: [
        'Water Dilution: Low optical turbidity (1120 NTU) shows diluted milk solids',
        'Ionic Solute Adulteration: High conductivity (6.95 mS/cm) indicates added Salt or Urea',
        'Alkaline Neutralizer: Abnormal pH (7.18)'
      ],
      spoilageNotes: 'Low bacterial gas, but synthetic chemical buffering and dilution detected.',
      verdictSummary: 'Adulteration flagged. Rejected by quality control standards.',
      lcdLines: [
        'MILKGUARD 44% GOOD  ',
        'T:26.5C TURB:1120N  ',
        'EC:6.95mS ADLT:YES  ',
        'FLAG:WATER+IONIC ADL'
      ]
    },
    operatorNote: 'Supplier sample flagged and isolated for laboratory HPLC verification.'
  }
];

export const INITIAL_DEVICE_STATUS: DeviceStatus = {
  deviceId: 'MG-001',
  deviceType: 'ESP32 HARDWARE NODE',
  connectionStatus: 'Connected',
  connectionType: 'Simulation Bus',
  activePlugin: 'SIMULATION',
  ipAddress: '192.168.4.1',
  wifiSsid: 'MilkGuard-ESP32',
  wifiRssi: -58,
  batteryLevel: 84,
  firmwareVersion: 'v1.0.0-PROD',
  lastReadingTime: '2026-09-10T20:42:00Z',
  uptimeSeconds: 14820,
  sensors: [
    {
      id: 'temperature',
      name: 'DS18B20 (Digital Temperature Probe)',
      pinout: 'GPIO 4 (1-Wire Data)',
      hardwareType: 'Primary ESP32 Pin',
      status: 'Available',
      lastCalibrated: '2026-09-08T10:00:00Z',
      signalQuality: 100,
      description: 'Dallas 1-Wire stainless steel waterproof thermal probe for precise milk temperature tracking.',
      typicalRange: '2.0 - 30.0 °C'
    },
    {
      id: 'turbidity',
      name: 'Turbidity Sensor (Optical Transmittance)',
      pinout: 'GPIO 34 (ADC1_CH6)',
      hardwareType: 'Primary ESP32 Pin',
      status: 'Available',
      lastCalibrated: '2026-09-09T08:30:00Z',
      signalQuality: 98,
      description: 'Optical infrared sensor measuring Nephelometric Turbidity Units (NTU) to detect water dilution and casein curdling.',
      typicalRange: '1800 - 3200 NTU'
    },
    {
      id: 'conductivity',
      name: 'Conductivity / TDS Probe',
      pinout: 'GPIO 35 (ADC1_CH7)',
      hardwareType: 'Primary ESP32 Pin',
      status: 'Available',
      lastCalibrated: '2026-09-09T08:45:00Z',
      signalQuality: 97,
      description: 'Biphasic electrical conductivity sensor measuring total dissolved solids and ionic content (added salts/urea).',
      typicalRange: '4.00 - 5.50 mS/cm'
    },
    {
      id: 'ph',
      name: 'pH Electrode (Glass Probe + Preamp)',
      pinout: 'Modular / I2C Bus',
      hardwareType: 'Modular Plugin',
      status: 'Available',
      lastCalibrated: '2026-09-09T08:30:00Z',
      signalQuality: 96,
      description: 'Potentiometric glass electrode with signal conditioning board calibrated to buffers pH 4.01 & 7.00.',
      typicalRange: '6.50 - 6.70 pH'
    },
    {
      id: 'mq3',
      name: 'MQ-3 (Alcohol / VOC Gas)',
      pinout: 'Modular ADC Channel',
      hardwareType: 'Modular Plugin',
      status: 'Available',
      lastCalibrated: '2026-09-08T10:00:00Z',
      signalQuality: 95,
      description: 'Metal oxide semiconductor gas sensor for volatile organic compounds and ethanol byproduct.',
      typicalRange: '100 - 180 ADC'
    },
    {
      id: 'mq137',
      name: 'MQ-137 (Ammonia / Spoilage Amines)',
      pinout: 'Modular ADC Channel',
      hardwareType: 'Modular Plugin',
      status: 'Available',
      lastCalibrated: '2026-09-08T10:00:00Z',
      signalQuality: 96,
      description: 'Tailored for volatile amines and ammonia emitted during protein breakdown.',
      typicalRange: '50 - 120 ppm'
    }
  ]
};
