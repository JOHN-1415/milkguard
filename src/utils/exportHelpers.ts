import type { TestReading } from '../types';
import { formatTimestamp } from './formatters';

export function exportTestsToCSV(tests: TestReading[], filename = 'milkguard_test_history.csv') {
  const headers = [
    'Test ID',
    'Device ID',
    'Batch ID',
    'Date',
    'Time',
    'Quality Score (%)',
    'Spoilage Classification',
    'Adulteration Classification',
    'MQ-3 (VOC)',
    'MQ-135 (Air/NH3)',
    'MQ-137 (Ammonia)',
    'Temperature (°C)',
    'Humidity (%)',
    'pH',
    'Conductivity (mS/cm)',
    'Detected Adulterants',
    'Verdict'
  ];

  const rows = tests.map(t => {
    const { date, time } = formatTimestamp(t.timestamp);
    const adulterants = t.result.detectedAdulterants ? t.result.detectedAdulterants.join('; ') : 'None';
    return [
      t.testId,
      t.deviceId,
      t.batchId,
      date,
      time,
      t.result.qualityScore,
      t.result.spoilage,
      t.result.adulteration,
      t.sensors.mq3,
      t.sensors.mq135,
      t.sensors.mq137,
      t.sensors.temperature,
      t.sensors.humidity,
      t.sensors.ph,
      t.sensors.conductivity,
      `"${adulterants}"`,
      `"${t.result.verdictSummary || ''}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSingleTestJSON(test: TestReading) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(test, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `milkguard_test_${test.testId}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
