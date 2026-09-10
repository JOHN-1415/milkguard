import type { TestReading, MilkBatch, DeviceStatus, PresetConfig } from '../types';

export const INITIAL_PRESETS: PresetConfig[] = [
  {
    id: 'GOOD_MILK',
    label: 'Fresh / Good Milk',
    description: 'Freshly harvested raw cow milk at nominal pH and zero spoilage volatiles.',
    targetSpoilage: 'GOOD',
    targetAdulteration: 'NOT_DETECTED',
    expectedScore: 94,
    baseSensors: {
      mq3: 135,
      mq135: 275,
      mq137: 85,
      temperature: 24.2,
      humidity: 58,
      ph: 6.62,
      conductivity: 4.75
    }
  },
  {
    id: 'SPOILING_MILK',
    label: 'Spoiling Milk (Early Onset)',
    description: 'Milk beginning lactic fermentation. Moderate elevation in gas emission and slight acidification.',
    targetSpoilage: 'SPOILING',
    targetAdulteration: 'NOT_DETECTED',
    expectedScore: 72,
    baseSensors: {
      mq3: 195,
      mq135: 355,
      mq137: 145,
      temperature: 28.6,
      humidity: 65,
      ph: 6.35,
      conductivity: 4.95
    }
  },
  {
    id: 'SPOILED_MILK',
    label: 'Spoiled Milk (High Lactic Fermentation)',
    description: 'Heavily fermented sample with strong volatile amines, ammonia, and high acidity (low pH).',
    targetSpoilage: 'SPOILED',
    targetAdulteration: 'NOT_DETECTED',
    expectedScore: 38,
    baseSensors: {
      mq3: 340,
      mq135: 580,
      mq137: 285,
      temperature: 30.1,
      humidity: 72,
      ph: 5.85,
      conductivity: 5.40
    }
  },
  {
    id: 'ADULTERATED_MILK',
    label: 'Adulterated Milk (Water & Chemical Solutes)',
    description: 'Sample adulterated with ionic stabilizers / water dilution and pH neutralizer.',
    targetSpoilage: 'GOOD',
    targetAdulteration: 'DETECTED',
    expectedScore: 45,
    baseSensors: {
      mq3: 140,
      mq135: 290,
      mq137: 92,
      temperature: 26.5,
      humidity: 60,
      ph: 7.15,
      conductivity: 6.95
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
    notes: 'Morning milking batch. Chilled to 4°C immediately after collection.'
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
    notes: 'Transport tanker temperature elevated during transit (28°C).'
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
      qualityScore: 45,
      timestamp: '2026-09-10T16:30:00Z'
    },
    status: 'REJECTED',
    notes: 'Flagged for high ionic conductivity (6.95 mS/cm) and alkaline pH (7.15).'
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
      mq3: 142,
      mq135: 287,
      mq137: 91,
      temperature: 28.4,
      humidity: 62,
      ph: 6.55,
      conductivity: 4.82
    },
    result: {
      spoilage: 'GOOD',
      adulteration: 'NOT_DETECTED',
      qualityScore: 92,
      confidence: 96.2,
      spoilageNotes: 'Optimal pH range (6.55) with negligible volatile amine emissions.',
      verdictSummary: 'Safe for processing. Meets raw milk quality verification parameters.'
    },
    operatorNote: 'Routine acceptance testing at receiving dock station 1.'
  },
  {
    testId: 'T002',
    deviceId: 'MG-001',
    batchId: 'BATCH-002',
    timestamp: '2026-09-10T18:15:00Z',
    sensors: {
      mq3: 210,
      mq135: 368,
      mq137: 152,
      temperature: 29.2,
      humidity: 66,
      ph: 6.32,
      conductivity: 5.05
    },
    result: {
      spoilage: 'SPOILING',
      adulteration: 'NOT_DETECTED',
      qualityScore: 70,
      confidence: 92.5,
      spoilageNotes: 'Early stage lactic fermentation detected. pH shifted to 6.32 with elevated MQ-137.',
      verdictSummary: 'Sample beginning to spoil. Immediate pasteurization or rejection recommended.'
    },
    operatorNote: 'Tanker arrived delayed by 2 hours.'
  },
  {
    testId: 'T003',
    deviceId: 'MG-001',
    batchId: 'BATCH-003',
    timestamp: '2026-09-10T16:30:00Z',
    sensors: {
      mq3: 138,
      mq135: 285,
      mq137: 88,
      temperature: 26.8,
      humidity: 59,
      ph: 7.18,
      conductivity: 7.12
    },
    result: {
      spoilage: 'GOOD',
      adulteration: 'DETECTED',
      qualityScore: 44,
      confidence: 97.4,
      detectedAdulterants: [
        'Ionic Solute Adulteration (High Conductivity 7.12 mS/cm)',
        'Alkaline Neutralizer (Abnormal pH 7.18)'
      ],
      spoilageNotes: 'Low bacterial gas, but synthetic chemical buffering suspected.',
      verdictSummary: 'Adulteration flagged. Rejected by quality control standards.'
    },
    operatorNote: 'Supplier sample flagged and isolated for laboratory HPLC verification.'
  },
  {
    testId: 'T004',
    deviceId: 'MG-001',
    batchId: 'BATCH-001',
    timestamp: '2026-09-10T14:10:00Z',
    sensors: {
      mq3: 130,
      mq135: 270,
      mq137: 82,
      temperature: 24.1,
      humidity: 55,
      ph: 6.64,
      conductivity: 4.68
    },
    result: {
      spoilage: 'GOOD',
      adulteration: 'NOT_DETECTED',
      qualityScore: 95,
      confidence: 98.1,
      spoilageNotes: 'Exceptional biochemical stability.',
      verdictSummary: 'High quality raw milk.'
    }
  },
  {
    testId: 'T005',
    deviceId: 'MG-001',
    batchId: 'BATCH-004',
    timestamp: '2026-09-09T19:20:00Z',
    sensors: {
      mq3: 125,
      mq135: 260,
      mq137: 78,
      temperature: 23.5,
      humidity: 54,
      ph: 6.66,
      conductivity: 4.62
    },
    result: {
      spoilage: 'GOOD',
      adulteration: 'NOT_DETECTED',
      qualityScore: 96,
      confidence: 98.9,
      spoilageNotes: 'Baseline purity verified.',
      verdictSummary: 'Approved Grade A bulk supply.'
    }
  },
  {
    testId: 'T006',
    deviceId: 'MG-001',
    batchId: 'BATCH-002',
    timestamp: '2026-09-09T15:45:00Z',
    sensors: {
      mq3: 355,
      mq135: 610,
      mq137: 298,
      temperature: 31.4,
      humidity: 75,
      ph: 5.75,
      conductivity: 5.58
    },
    result: {
      spoilage: 'SPOILED',
      adulteration: 'NOT_DETECTED',
      qualityScore: 35,
      confidence: 96.8,
      spoilageNotes: 'Severe souring and microbial proteolysis with intense amine gas.',
      verdictSummary: 'Spoiled sample. Disposal ordered.'
    }
  }
];

export const INITIAL_DEVICE_STATUS: DeviceStatus = {
  deviceId: 'MG-001',
  deviceType: 'SIMULATION DEVICE',
  connectionStatus: 'Connected',
  connectionType: 'Wi-Fi',
  ipAddress: '192.168.4.101',
  wifiSsid: 'MilkGuard-IoT-Lab',
  wifiRssi: -58,
  batteryLevel: 84,
  firmwareVersion: 'v0.1.0',
  lastReadingTime: '2026-09-10T20:42:00Z',
  uptimeSeconds: 14820,
  sensors: [
    {
      id: 'mq3',
      name: 'MQ-3 (Alcohol / VOC)',
      status: 'Available',
      lastCalibrated: '2026-09-08T10:00:00Z',
      signalQuality: 98,
      description: 'Metal oxide semiconductor gas sensor for volatile organic compounds and ethanol byproduct.',
      typicalRange: '100 - 450 ADC (Raw)'
    },
    {
      id: 'mq135',
      name: 'MQ-135 (Air Quality / Sulfides)',
      status: 'Available',
      lastCalibrated: '2026-09-08T10:00:00Z',
      signalQuality: 96,
      description: 'Chemiresistor gas sensor for ammonia, sulfide vapors, and general degradation air quality.',
      typicalRange: '200 - 700 ppm'
    },
    {
      id: 'mq137',
      name: 'MQ-137 (Ammonia / Spoilage Amines)',
      status: 'Available',
      lastCalibrated: '2026-09-08T10:00:00Z',
      signalQuality: 95,
      description: 'High sensitivity metal oxide gas sensor tailored for amine and ammonia vapors emitted during protein breakdown.',
      typicalRange: '50 - 350 ppm'
    },
    {
      id: 'ph',
      name: 'pH Electrode (Glass Probe + Preamp)',
      status: 'Available',
      lastCalibrated: '2026-09-09T08:30:00Z',
      signalQuality: 99,
      description: 'Potentiometric glass electrode with signal conditioning board calibrated to buffers pH 4.01 & 7.00.',
      typicalRange: '6.00 - 7.50 pH'
    },
    {
      id: 'conductivity',
      name: 'Conductivity / TDS Probe',
      status: 'Available',
      lastCalibrated: '2026-09-09T08:45:00Z',
      signalQuality: 97,
      description: 'AC excitation toroidal / biphasic conductivity sensor for total dissolved solids and ionic content.',
      typicalRange: '3.5 - 7.5 mS/cm'
    },
    {
      id: 'temperature',
      name: 'Temperature & Humidity (DS18B20/DHT22)',
      status: 'Available',
      lastCalibrated: '2026-09-01T00:00:00Z',
      signalQuality: 100,
      description: 'Digital 1-Wire thermal probe in stainless steel thermowell for liquid milk temperature.',
      typicalRange: '0.0 - 50.0 °C'
    }
  ]
};
