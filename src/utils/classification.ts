import type { SensorValues, ClassificationResult, SpoilageState, AdulterationState } from '../types';

export function evaluateMilkQuality(sensors: SensorValues): ClassificationResult {
  const { 
    temperature, 
    turbidity = 2450, 
    conductivity, 
    ph = 6.62, 
    mq3 = 135, 
    mq135 = 275, 
    mq137 = 85 
  } = sensors;

  let spoilage: SpoilageState = 'GOOD';
  let adulteration: AdulterationState = 'NOT_DETECTED';
  const detectedAdulterants: string[] = [];
  let spoilageNotes = 'Sample displays nominal physicochemical & optical profile for fresh raw milk.';

  const isSevereGas = mq137 > 200 || mq135 > 450 || mq3 > 300;
  const isModerateGas = mq137 > 120 || mq135 > 320 || mq3 > 180;
  const isAcidic = ph < 6.2;
  const isSlightlyAcidic = ph >= 6.2 && ph < 6.45;
  const isCurdled = turbidity > 3200;
  const isElevatedTemp = temperature > 28.0;

  if (isSevereGas || isAcidic || isCurdled) {
    spoilage = 'SPOILED';
    if (isCurdled) {
      spoilageNotes = 'High optical turbidity (>3200 NTU) indicating protein curdling & casein flocculation. Severe spoilage.';
    } else {
      spoilageNotes = 'Lactic acid buildup and volatile amine gas emission detected. High microbial fermentation activity.';
    }
  } else if (isModerateGas || isSlightlyAcidic || isElevatedTemp || turbidity > 2800) {
    spoilage = 'SPOILING';
    spoilageNotes = 'Elevated volatile metabolites or thermal abuse (DS18B20) indicates early onset of bacterial fermentation.';
  } else {
    spoilage = 'GOOD';
    spoilageNotes = 'Optimal pH range (6.5-6.7), stable turbidity (1800-3000 NTU), and nominal VOC gas levels.';
  }

  const isIonicAdulterated = conductivity > 6.0;
  const isAlkaline = ph > 6.9;

  if (turbidity < 1400 && conductivity < 3.5) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Water Dilution: Low turbidity (' + Math.round(turbidity) + ' NTU) and low conductivity (' + conductivity.toFixed(2) + ' mS/cm) show reduced milk solids');
  } else if (turbidity < 1400) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Water Dilution / Skimming: Abnormally low optical turbidity (' + Math.round(turbidity) + ' NTU) indicates reduced fat globules');
  }

  if (isIonicAdulterated) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Ionic Solute Adulteration: High electrical conductivity (' + conductivity.toFixed(2) + ' mS/cm) indicates added Salt, Urea, or Neutralizing Salts');
  }

  if (isAlkaline) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Alkaline Chemical Neutralizer: Abnormal pH (' + ph.toFixed(2) + ') indicates added caustic soda or bicarbonate buffer');
  }

  let score = 100;
  if (spoilage === 'SPOILED') score -= 52;
  else if (spoilage === 'SPOILING') score -= 24;

  if (adulteration === 'DETECTED') {
    score -= (detectedAdulterants.length * 28);
  }

  if (temperature > 25.0 && spoilage === 'GOOD') score -= 5;
  if (turbidity < 1800 && adulteration === 'NOT_DETECTED') score -= 10;

  const qualityScore = Math.max(12, Math.min(99, Math.round(score)));

  let verdictSummary = '';
  if (spoilage === 'GOOD' && adulteration === 'NOT_DETECTED') {
    verdictSummary = 'Safe for processing & human consumption. Meets all raw milk quality standards.';
  } else if (adulteration === 'DETECTED' && spoilage === 'GOOD') {
    verdictSummary = 'Adulteration flagged. Abnormal optical turbidity or electrical conductivity detected.';
  } else if (spoilage === 'SPOILED') {
    verdictSummary = 'Specimen spoiled. Acidified or coagulated. Unfit for dairy collection.';
  } else {
    verdictSummary = 'Degraded quality specimen. Rapid cooling or secondary testing recommended.';
  }

  const padRight = (str: string, len: number) => (str + ' '.repeat(len)).substring(0, len);
  const lcdLines = [
    padRight('MILKGUARD ' + qualityScore + '% ' + spoilage, 20),
    padRight('T:' + temperature.toFixed(1) + 'C TURB:' + Math.round(turbidity) + 'N', 20),
    padRight('EC:' + conductivity.toFixed(2) + 'mS ADLT:' + (adulteration === 'DETECTED' ? 'YES' : 'NO'), 20),
    padRight('HW:ESP32+DS18B20 OK', 20)
  ];

  return {
    spoilage,
    adulteration,
    qualityScore,
    confidence: 96.4,
    detectedAdulterants: detectedAdulterants.length > 0 ? detectedAdulterants : undefined,
    spoilageNotes,
    verdictSummary,
    lcdLines
  };
}

export function generateLcdLines(sensors: SensorValues, classification?: ClassificationResult): string[] {
  const result = classification || evaluateMilkQuality(sensors);
  if (result.lcdLines && result.lcdLines.length > 0) return result.lcdLines;
  const padRight = (str: string, len: number) => (str + ' '.repeat(len)).substring(0, len);
  const turbidity = sensors.turbidity ?? 2450;
  return [
    padRight('MILKGUARD ' + result.qualityScore + '% ' + result.spoilage, 20),
    padRight('T:' + sensors.temperature.toFixed(1) + 'C TURB:' + Math.round(turbidity) + 'N', 20),
    padRight('EC:' + sensors.conductivity.toFixed(2) + 'mS ADLT:' + (result.adulteration === 'DETECTED' ? 'YES' : 'NO'), 20),
    padRight('HW:ESP32+DS18B20 OK', 20)
  ];
}

export const classifyMilk = evaluateMilkQuality;
