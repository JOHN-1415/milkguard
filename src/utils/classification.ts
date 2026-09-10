import type { SensorValues, ClassificationResult, SpoilageState, AdulterationState } from '../types';

export function evaluateMilkQuality(sensors: SensorValues): ClassificationResult {
  const { mq3, mq135, mq137, temperature, ph, conductivity } = sensors;

  let spoilage: SpoilageState = 'GOOD';
  let adulteration: AdulterationState = 'NOT_DETECTED';
  const detectedAdulterants: string[] = [];
  let spoilageNotes = 'Sample displays nominal biochemical profile for fresh raw milk.';

  const isSevereGas = mq137 > 200 || mq135 > 450 || mq3 > 300;
  const isModerateGas = mq137 > 120 || mq135 > 320 || mq3 > 180;
  const isAcidic = ph < 6.2;
  const isSlightlyAcidic = ph >= 6.2 && ph < 6.45;

  if (isSevereGas || isAcidic) {
    spoilage = 'SPOILED';
    spoilageNotes = 'Lactic acid buildup and high volatile amine/ammonia gas emission detected. High microbial activity.';
  } else if (isModerateGas || isSlightlyAcidic) {
    spoilage = 'SPOILING';
    spoilageNotes = 'Elevated volatile metabolites or slight pH reduction indicates onset of bacterial fermentation.';
  } else {
    spoilage = 'GOOD';
    spoilageNotes = 'Optimal pH range (6.5-6.7) with negligible spoilage VOC gas emissions.';
  }

  const isConductivityHigh = conductivity > 6.2;
  const isConductivityLow = conductivity < 3.5;
  const isAlkaline = ph > 6.9;

  if (isConductivityHigh) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Ionic Solute Adulteration (e.g. Added Salt / Urea / Neutralizing Salts)');
  }
  if (isConductivityLow) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Water Dilution (Reduced Total Dissolved Solids / Specific Conductivity)');
  }
  if (isAlkaline) {
    adulteration = 'DETECTED';
    detectedAdulterants.push('Alkaline Chemical Neutralizer (pH Buffering Agent / Detergent)');
  }

  let score = 100;
  if (spoilage === 'SPOILED') {
    score -= 55;
  } else if (spoilage === 'SPOILING') {
    score -= 25;
  }

  if (adulteration === 'DETECTED') {
    score -= (detectedAdulterants.length * 28);
  }

  const phIdeal = 6.6;
  const phDiff = Math.abs(ph - phIdeal);
  if (phDiff > 0.15) {
    score -= Math.min(20, Math.round((phDiff - 0.15) * 25));
  }

  if (temperature > 25 && spoilage === 'GOOD') {
    score -= 4;
  }

  if (mq137 > 90 && spoilage === 'GOOD') {
    score -= 3;
  }

  const qualityScore = Math.max(12, Math.min(99, Math.round(score)));

  let verdictSummary = '';
  if (spoilage === 'GOOD' && adulteration === 'NOT_DETECTED') {
    verdictSummary = 'Safe for processing / human consumption. Meets raw milk quality standards.';
  } else if (adulteration === 'DETECTED' && spoilage === 'GOOD') {
    verdictSummary = 'Adulteration flagged. Sample contains abnormal ionic or chemical signatures.';
  } else if (spoilage === 'SPOILED') {
    verdictSummary = 'Sample spoiled. Unsuitable for processing or distribution.';
  } else {
    verdictSummary = 'Degraded quality sample. Fast cooling or secondary verification advised.';
  }

  return {
    spoilage,
    adulteration,
    qualityScore,
    confidence: 94.8,
    detectedAdulterants: detectedAdulterants.length > 0 ? detectedAdulterants : undefined,
    spoilageNotes,
    verdictSummary
  };
}
