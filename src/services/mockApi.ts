import type { 
  TestReading, 
  MilkBatch, 
  DeviceStatus, 
  AnalyticsSummary, 
  SensorValues 
} from '../types';
import { 
  INITIAL_TESTS, 
  INITIAL_BATCHES, 
  INITIAL_DEVICE_STATUS 
} from '../data/initialMockData';
import { evaluateMilkQuality } from '../utils/classification';

const STORAGE_KEYS = {
  TESTS: 'milkguard_tests_v1',
  BATCHES: 'milkguard_batches_v1',
  DEVICE: 'milkguard_device_v1'
};

class MockDatabase {
  private tests: TestReading[] = [];
  private batches: MilkBatch[] = [];
  private deviceStatus: DeviceStatus = INITIAL_DEVICE_STATUS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedTests = localStorage.getItem(STORAGE_KEYS.TESTS);
      this.tests = storedTests ? JSON.parse(storedTests) : [...INITIAL_TESTS];

      const storedBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
      this.batches = storedBatches ? JSON.parse(storedBatches) : [...INITIAL_BATCHES];

      const storedDevice = localStorage.getItem(STORAGE_KEYS.DEVICE);
      this.deviceStatus = storedDevice ? JSON.parse(storedDevice) : { ...INITIAL_DEVICE_STATUS };
    } catch {
      this.tests = [...INITIAL_TESTS];
      this.batches = [...INITIAL_BATCHES];
      this.deviceStatus = { ...INITIAL_DEVICE_STATUS };
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(this.tests));
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(this.batches));
      localStorage.setItem(STORAGE_KEYS.DEVICE, JSON.stringify(this.deviceStatus));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  async getLatestReading(): Promise<TestReading> {
    await this.delay(100);
    return this.tests[0] || INITIAL_TESTS[0];
  }

  async getTestHistory(params?: {
    search?: string;
    spoilage?: string;
    adulteration?: string;
    statusFilter?: string;
    batchId?: string;
    sortBy?: string;
  }): Promise<TestReading[]> {
    await this.delay(120);
    let list = [...this.tests];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(t => 
        t.testId.toLowerCase().includes(q) ||
        t.batchId.toLowerCase().includes(q) ||
        t.deviceId.toLowerCase().includes(q) ||
        (t.operatorNote && t.operatorNote.toLowerCase().includes(q))
      );
    }

    if (params?.statusFilter && params.statusFilter !== 'ALL') {
      const filter = params.statusFilter.toUpperCase();
      if (filter === 'GOOD') {
        list = list.filter(t => t.result.spoilage === 'GOOD' && t.result.adulteration === 'NOT_DETECTED');
      } else if (filter === 'SPOILING') {
        list = list.filter(t => t.result.spoilage === 'SPOILING');
      } else if (filter === 'SPOILED') {
        list = list.filter(t => t.result.spoilage === 'SPOILED');
      } else if (filter === 'ADULTERATED') {
        list = list.filter(t => t.result.adulteration === 'DETECTED');
      }
    }

    if (params?.batchId) {
      list = list.filter(t => t.batchId === params.batchId);
    }

    if (params?.sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else if (params?.sortBy === 'score_high') {
      list.sort((a, b) => b.result.qualityScore - a.result.qualityScore);
    } else if (params?.sortBy === 'score_low') {
      list.sort((a, b) => a.result.qualityScore - b.result.qualityScore);
    } else {
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return list;
  }

  async getTestById(id: string): Promise<TestReading | null> {
    await this.delay(80);
    const found = this.tests.find(t => t.testId === id);
    if (found) {
      if (!found.timeSeriesSamples || found.timeSeriesSamples.length === 0) {
        found.timeSeriesSamples = this.generateTimeSeriesForReading(found.sensors);
      }
      return found;
    }
    return null;
  }

  async getBatches(): Promise<MilkBatch[]> {
    await this.delay(100);
    return [...this.batches];
  }

  async getBatchById(id: string): Promise<MilkBatch | null> {
    await this.delay(80);
    return this.batches.find(b => b.batchId === id) || null;
  }

  async createBatch(newBatch: Omit<MilkBatch, 'createdDate' | 'testCount' | 'averageQualityScore' | 'latestResult'>): Promise<MilkBatch> {
    await this.delay(150);
    const batch: MilkBatch = {
      ...newBatch,
      createdDate: new Date().toISOString(),
      testCount: 0,
      averageQualityScore: 0,
      latestResult: {
        spoilage: 'GOOD',
        adulteration: 'NOT_DETECTED',
        qualityScore: 100,
        timestamp: new Date().toISOString()
      }
    };
    this.batches.unshift(batch);
    this.saveToStorage();
    return batch;
  }

  async getDeviceStatus(): Promise<DeviceStatus> {
    await this.delay(80);
    return { ...this.deviceStatus };
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    await this.delay(120);
    const tests = this.tests;
    const total = tests.length;

    let good = 0;
    let spoiling = 0;
    let spoiled = 0;
    let adulterated = 0;
    let totalScore = 0;

    tests.forEach(t => {
      totalScore += t.result.qualityScore;
      if (t.result.spoilage === 'GOOD') good++;
      if (t.result.spoilage === 'SPOILING') spoiling++;
      if (t.result.spoilage === 'SPOILED') spoiled++;
      if (t.result.adulteration === 'DETECTED') adulterated++;
    });

    const averageQualityScore = total > 0 ? Math.round(totalScore / total) : 0;
    const passCount = tests.filter(t => t.result.spoilage === 'GOOD' && t.result.adulteration === 'NOT_DETECTED').length;
    const passRate = total > 0 ? Math.round((passCount / total) * 100) : 100;

    const trendMap = new Map<string, { sum: number; count: number }>();
    tests.forEach(t => {
      const dateKey = t.timestamp.substring(0, 10);
      const cur = trendMap.get(dateKey) || { sum: 0, count: 0 };
      cur.sum += t.result.qualityScore;
      cur.count += 1;
      trendMap.set(dateKey, cur);
    });

    const qualityTrend = Array.from(trendMap.entries()).map(([date, data]) => ({
      date: date.substring(5),
      avgScore: Math.round(data.sum / data.count),
      testCount: data.count
    })).slice(-7);

    if (qualityTrend.length === 0) {
      qualityTrend.push({ date: '09-10', avgScore: 92, testCount: 1 });
    }

    const spoilageDistribution = [
      { name: 'GOOD', value: good, color: '#10b981' },
      { name: 'SPOILING', value: spoiling, color: '#f59e0b' },
      { name: 'SPOILED', value: spoiled, color: '#ef4444' }
    ];

    const adulterationDistribution = [
      { name: 'NOT DETECTED', value: total - adulterated, color: '#06b6d4' },
      { name: 'DETECTED', value: adulterated, color: '#f43f5e' }
    ];

    const sensorCorrelation = tests.slice(0, 15).map(t => ({
      name: t.testId,
      ph: t.sensors.ph,
      conductivity: t.sensors.conductivity,
      mq137: t.sensors.mq137,
      score: t.result.qualityScore
    }));

    return {
      totalTests: total,
      goodSamples: good,
      spoilingSamples: spoiling,
      spoiledSamples: spoiled,
      adulteratedSamples: adulterated,
      averageQualityScore,
      passRate,
      qualityTrend,
      spoilageDistribution,
      adulterationDistribution,
      sensorCorrelation
    };
  }

  async runAnalysis(
    sensors: SensorValues, 
    batchId: string = 'BATCH-001', 
    note?: string
  ): Promise<TestReading> {
    await this.delay(200);
    const classification = evaluateMilkQuality(sensors);
    const nextIdNumber = this.tests.length + 1;
    const testId = `T${nextIdNumber.toString().padStart(3, '0')}`;

    const newReading: TestReading = {
      testId,
      deviceId: this.deviceStatus.deviceId,
      batchId,
      timestamp: new Date().toISOString(),
      sensors: { ...sensors },
      result: classification,
      operatorNote: note || 'Simulated verification run on MilkGuard test station.',
      timeSeriesSamples: this.generateTimeSeriesForReading(sensors)
    };

    this.tests.unshift(newReading);

    const batchIndex = this.batches.findIndex(b => b.batchId === batchId);
    if (batchIndex !== -1) {
      const b = this.batches[batchIndex];
      const batchTests = this.tests.filter(t => t.batchId === batchId);
      const avg = Math.round(batchTests.reduce((acc, cur) => acc + cur.result.qualityScore, 0) / batchTests.length);
      b.testCount = batchTests.length;
      b.averageQualityScore = avg;
      b.latestResult = {
        spoilage: classification.spoilage,
        adulteration: classification.adulteration,
        qualityScore: classification.qualityScore,
        timestamp: newReading.timestamp
      };
      if (classification.adulteration === 'DETECTED' || classification.spoilage === 'SPOILED') {
        if (b.status === 'APPROVED') b.status = 'ACTIVE';
      }
    }

    this.deviceStatus.lastReadingTime = newReading.timestamp;
    this.saveToStorage();
    return newReading;
  }

  async resetToDefaults(): Promise<void> {
    this.tests = [...INITIAL_TESTS];
    this.batches = [...INITIAL_BATCHES];
    this.deviceStatus = { ...INITIAL_DEVICE_STATUS };
    this.saveToStorage();
  }

  private generateTimeSeriesForReading(finalSensors: SensorValues) {
    const points = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const factor = Math.min(1, Math.sin((progress * Math.PI) / 2));
      points.push({
        timeOffsetSec: i,
        mq3: Math.round(50 + (finalSensors.mq3 - 50) * factor + (Math.random() * 6 - 3)),
        mq135: Math.round(100 + (finalSensors.mq135 - 100) * factor + (Math.random() * 8 - 4)),
        mq137: Math.round(30 + (finalSensors.mq137 - 30) * factor + (Math.random() * 4 - 2)),
        ph: Number((7.0 - (7.0 - finalSensors.ph) * factor + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        conductivity: Number((1.5 + (finalSensors.conductivity - 1.5) * factor + (Math.random() * 0.06 - 0.03)).toFixed(2)),
        temperature: Number((22.0 + (finalSensors.temperature - 22.0) * factor).toFixed(1))
      });
    }
    return points;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockDatabase = new MockDatabase();
