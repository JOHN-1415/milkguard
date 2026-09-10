import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { SensorValues, PresetType, PresetConfig } from '../types';
import { INITIAL_PRESETS } from '../data/initialMockData';

interface SimulationContextType {
  currentPreset: PresetType;
  selectedPresetConfig: PresetConfig;
  liveSensors: SensorValues;
  isStreaming: boolean;
  isAnalyzing: boolean;
  analysisStep: number;
  analysisStatusText: string;
  setPreset: (preset: PresetType) => void;
  setCustomSensors: (sensors: Partial<SensorValues>) => void;
  toggleStreaming: () => void;
  startAnalysisCycle: (onComplete: (sensors: SensorValues) => void) => void;
  cancelAnalysis: () => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPreset, setCurrentPreset] = useState<PresetType>('GOOD_MILK');
  const selectedPresetConfig = INITIAL_PRESETS.find(p => p.id === currentPreset) || INITIAL_PRESETS[0];

  const [liveSensors, setLiveSensors] = useState<SensorValues>({ ...selectedPresetConfig.baseSensors });
  const [isStreaming, setIsStreaming] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisStatusText, setAnalysisStatusText] = useState('');

  const targetSensorsRef = useRef<SensorValues>({ ...selectedPresetConfig.baseSensors });
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    const config = INITIAL_PRESETS.find(p => p.id === currentPreset) || INITIAL_PRESETS[0];
    targetSensorsRef.current = { ...config.baseSensors };
  }, [currentPreset]);

  useEffect(() => {
    if (!isStreaming) return;

    intervalRef.current = setInterval(() => {
      setLiveSensors(prev => {
        const target = targetSensorsRef.current;
        const jitter = (range: number) => (Math.random() * range * 2 - range);
        const lerp = (cur: number, tgt: number, factor: number) => cur + (tgt - cur) * factor;

        return {
          mq3: Math.max(10, Math.round(lerp(prev.mq3, target.mq3, 0.15) + jitter(3))),
          mq135: Math.max(20, Math.round(lerp(prev.mq135, target.mq135, 0.15) + jitter(4))),
          mq137: Math.max(10, Math.round(lerp(prev.mq137, target.mq137, 0.15) + jitter(2.5))),
          temperature: Number((lerp(prev.temperature, target.temperature, 0.1) + jitter(0.08)).toFixed(1)),
          humidity: Math.max(20, Math.min(99, Math.round(lerp(prev.humidity, target.humidity, 0.1) + jitter(0.5)))),
          ph: Number((lerp(prev.ph, target.ph, 0.1) + jitter(0.015)).toFixed(2)),
          conductivity: Number((lerp(prev.conductivity, target.conductivity, 0.1) + jitter(0.025)).toFixed(2))
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming]);

  const setPreset = useCallback((preset: PresetType) => {
    setCurrentPreset(preset);
    const config = INITIAL_PRESETS.find(p => p.id === preset);
    if (config) {
      targetSensorsRef.current = { ...config.baseSensors };
    }
  }, []);

  const setCustomSensors = useCallback((partial: Partial<SensorValues>) => {
    setCurrentPreset('CUSTOM');
    targetSensorsRef.current = { ...targetSensorsRef.current, ...partial };
    setLiveSensors(prev => ({ ...prev, ...partial }));
  }, []);

  const toggleStreaming = useCallback(() => {
    setIsStreaming(prev => !prev);
  }, []);

  const cancelAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisStep(0);
    setAnalysisStatusText('');
  }, []);

  const startAnalysisCycle = useCallback((onComplete: (finalSensors: SensorValues) => void) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisStatusText('Calibrating headspace chamber & zero-referencing gas sensors...');

    const timer1 = setTimeout(() => {
      setAnalysisStep(2);
      setAnalysisStatusText('Sampling liquid milk specimen & stabilizing thermal probes...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setAnalysisStep(3);
      setAnalysisStatusText('Acquiring electro-chemical telemetry (MQ-3, MQ-135, MQ-137, pH, TDS)...');
    }, 2400);

    const timer3 = setTimeout(() => {
      setAnalysisStep(4);
      setAnalysisStatusText('Running classification matrix & calculating milk quality score...');
    }, 3600);

    const timer4 = setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStep(0);
      setAnalysisStatusText('Analysis Complete.');
      onComplete({ ...liveSensors });
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isAnalyzing, liveSensors]);

  return (
    <SimulationContext.Provider
      value={{
        currentPreset,
        selectedPresetConfig,
        liveSensors,
        isStreaming,
        isAnalyzing,
        analysisStep,
        analysisStatusText,
        setPreset,
        setCustomSensors,
        toggleStreaming,
        startAnalysisCycle,
        cancelAnalysis
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
};
