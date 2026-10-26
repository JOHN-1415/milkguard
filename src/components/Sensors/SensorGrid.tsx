import React from 'react';
import type { SensorValues } from '../../types';
import { SensorCard } from './SensorCard';
import { formatTemp, formatConductivity, formatSensorValue, formatTurbidity } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Activity, 
  Wind, 
  Flame, 
  Sparkles,
  Eye,
  Cpu
} from 'lucide-react';

interface SensorGridProps {
  sensors: SensorValues;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ sensors }) => {
  const { settings } = useTheme();

  const turbidityVal = sensors.turbidity ?? 2400;
  const turbidityStatus = turbidityVal < 1400 ? 'critical' : turbidityVal > 3200 ? 'warning' : 'nominal';
  const phStatus = sensors.ph < 6.2 || sensors.ph > 6.9 ? 'critical' : sensors.ph < 6.45 ? 'warning' : 'nominal';
  const condStatus = sensors.conductivity > 6.2 || sensors.conductivity < 3.5 ? 'critical' : 'nominal';
  const tempStatus = sensors.temperature > 28 ? 'warning' : 'nominal';
  const mq137Status = sensors.mq137 > 200 ? 'critical' : sensors.mq137 > 120 ? 'warning' : 'nominal';
  const mq135Status = sensors.mq135 > 450 ? 'critical' : sensors.mq135 > 320 ? 'warning' : 'nominal';
  const mq3Status = sensors.mq3 > 300 ? 'critical' : sensors.mq3 > 180 ? 'warning' : 'nominal';

  return (
    <div className="space-y-4 font-mono">
      {/* Primary Hardware Core Sensors (From Diagram: DS18B20, Turbidity, Conductivity) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
            <span>ESP32 Hardware Core Sensors (Architecture Diagram)</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
            Dedicated GPIO Channels
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SensorCard
            label="Turbidity (Optical)"
            value={formatTurbidity(turbidityVal)}
            unit=""
            icon={Eye}
            normalRange="1500 – 3000 NTU"
            status={turbidityStatus}
            subtext="GPIO 34 (ADC1)"
          />

          <SensorCard
            label="Conductivity (TDS/EC)"
            value={formatConductivity(sensors.conductivity, settings.condUnit)}
            unit=""
            icon={Gauge}
            normalRange="4.00 – 5.50"
            status={condStatus}
            subtext="GPIO 35 (ADC1)"
          />

          <SensorCard
            label="DS18B20 Temperature"
            value={formatTemp(sensors.temperature, settings.tempUnit)}
            unit=""
            icon={Thermometer}
            normalRange="4.0 – 25.0 °C"
            status={tempStatus}
            subtext="GPIO 4 (1-Wire)"
          />

          <SensorCard
            label="pH (Acidity Probe)"
            value={formatSensorValue(sensors.ph, 2)}
            unit="pH"
            icon={Activity}
            normalRange="6.50 – 6.70"
            status={phStatus}
            subtext="Modular Electrode"
          />
        </div>
      </div>

      {/* Auxiliary Headspace Volatile Gas Array */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-teal-500" />
            <span>Chamber Volatile Gas Array (Headspace Analysis)</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Microbial Spoilage Markers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SensorCard
            label="MQ-3 (Ethanol/VOC)"
            value={formatSensorValue(sensors.mq3, 0)}
            unit="ADC"
            icon={Flame}
            normalRange="100 – 180"
            status={mq3Status}
            subtext="Fermentation"
          />

          <SensorCard
            label="MQ-135 (Air/Sulfides)"
            value={formatSensorValue(sensors.mq135, 0)}
            unit="ppm"
            icon={Wind}
            normalRange="200 – 320"
            status={mq135Status}
            subtext="Putrefaction"
          />

          <SensorCard
            label="MQ-137 (Ammonia/Amines)"
            value={formatSensorValue(sensors.mq137, 0)}
            unit="ppm"
            icon={Sparkles}
            normalRange="50 – 120"
            status={mq137Status}
            subtext="Protein breakdown"
          />

          <SensorCard
            label="Chamber Humidity"
            value={formatSensorValue(sensors.humidity, 0)}
            unit="% RH"
            icon={Droplets}
            normalRange="45 – 70%"
            status="nominal"
            subtext="Headspace seal"
          />
        </div>
      </div>
    </div>
  );
};
