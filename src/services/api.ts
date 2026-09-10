import type { 
  TestReading, 
  MilkBatch, 
  DeviceStatus, 
  AnalyticsSummary, 
  SensorValues 
} from '../types';
import { mockDatabase } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const isLiveBackendAvailable = (): boolean => {
  return !!API_BASE_URL && API_BASE_URL.trim().length > 0;
};

export const api = {
  async getLatestReading(): Promise<TestReading> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/readings/latest`);
      if (!res.ok) throw new Error('Failed to fetch latest reading');
      return res.json();
    }
    return mockDatabase.getLatestReading();
  },

  async getTestHistory(params?: {
    search?: string;
    spoilage?: string;
    adulteration?: string;
    statusFilter?: string;
    batchId?: string;
    sortBy?: string;
  }): Promise<TestReading[]> {
    if (isLiveBackendAvailable()) {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const res = await fetch(`${API_BASE_URL}/readings?${query}`);
      if (!res.ok) throw new Error('Failed to fetch test history');
      return res.json();
    }
    return mockDatabase.getTestHistory(params);
  },

  async getTestById(id: string): Promise<TestReading | null> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/readings/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch test ${id}`);
      }
      return res.json();
    }
    return mockDatabase.getTestById(id);
  },

  async runAnalysis(sensors: SensorValues, batchId?: string, note?: string): Promise<TestReading> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensors, batchId, note })
      });
      if (!res.ok) throw new Error('Failed to submit analysis');
      return res.json();
    }
    return mockDatabase.runAnalysis(sensors, batchId, note);
  },

  async getBatches(): Promise<MilkBatch[]> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/batches`);
      if (!res.ok) throw new Error('Failed to fetch batches');
      return res.json();
    }
    return mockDatabase.getBatches();
  },

  async getBatchById(id: string): Promise<MilkBatch | null> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/batches/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`Failed to fetch batch ${id}`);
      }
      return res.json();
    }
    return mockDatabase.getBatchById(id);
  },

  async createBatch(newBatch: Omit<MilkBatch, 'createdDate' | 'testCount' | 'averageQualityScore' | 'latestResult'>): Promise<MilkBatch> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch)
      });
      if (!res.ok) throw new Error('Failed to create batch');
      return res.json();
    }
    return mockDatabase.createBatch(newBatch);
  },

  async getDeviceStatus(deviceId?: string): Promise<DeviceStatus> {
    if (isLiveBackendAvailable()) {
      const endpoint = deviceId ? `${API_BASE_URL}/devices/${deviceId}` : `${API_BASE_URL}/devices/current`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch device status');
      return res.json();
    }
    return mockDatabase.getDeviceStatus();
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    if (isLiveBackendAvailable()) {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    }
    return mockDatabase.getAnalytics();
  },

  async resetSimulationData(): Promise<void> {
    return mockDatabase.resetToDefaults();
  }
};
