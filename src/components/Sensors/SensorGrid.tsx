import React from 'react';
import type { SensorValues } from '../../types';
import { SensorCard } from './SensorCard';
import { formatTemp, formatConductivity, formatSensorValue } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Activity, 
  Wind, 
  Flame, 
  Sparkles 
} from 'lucide-react';

interface SensorGridProps {
  sensors: SensorValues;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ sensors }) => {
  const { settings } = useTheme();

  const phStatus = sensors.ph < 6.2 || sensors.ph > 6.9 ? 'critical' : sensors.ph < 6.45 ? 'warning' : 'nominal';
  const condStatus = sensors.conductivity > 6.2 || sensors.conductivity < 3.5 ? 'critical' : 'nominal';
  const tempStatus = sensors.temperature > 28 ? 'warning' : 'nominal';
  const mq137Status = sensors.mq137 > 200 ? 'critical' : sensors.mq137 > 120 ? 'warning' : 'nominal';
  const mq135Status = sensors.mq135 > 450 ? 'critical' : sensors.mq135 > 320 ? 'warning' : 'nominal';
  const mq3Status = sensors.mq3 > 300 ? 'critical' : sensors.mq3 > 180 ? 'warning' : 'nominal';

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <SensorCard
          label="pH (Acidity)"
          value={formatSensorValue(sensors.ph, 2)}
          unit="pH"
          icon={Activity}
          normalRange="6.50 – 6.70"
          status={phStatus}
          subtext="Electrode"
        />

        <SensorCard
          label="Conductivity (TDS)"
          value={formatConductivity(sensors.conductivity, settings.condUnit)}
          unit=""
          icon={Gauge}
          normalRange="4.00 – 5.50"
          status={condStatus}
          subtext="Ionic probe"
        />

        <SensorCard
          label="Temperature"
          value={formatTemp(sensors.temperature, settings.tempUnit)}
          unit=""
          icon={Thermometer}
          normalRange="4.0 – 25.0 °C"
          status={tempStatus}
          subtext="1-Wire probe"
        />

        <SensorCard
          label="Chamber Humidity"
          value={formatSensorValue(sensors.humidity, 0)}
          unit="% RH"
          icon={Droplets}
          normalRange="45 – 70%"
          status="nominal"
          subtext="Headspace"
        />
      </div>

      <div className="mt-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-2 flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5" />
          <span>Volatile Gas Sensing Array (MQ Series)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SensorCard
            label="MQ-3 (Ethanol / VOC)"
            value={formatSensorValue(sensors.mq3, 0)}
            unit="ADC"
            icon={Flame}
            normalRange="100 – 180"
            status={mq3Status}
            subtext="Ethanol byproduct"
          />

          <SensorCard
            label="MQ-135 (Air Quality / NH3)"
            value={formatSensorValue(sensors.mq135, 0)}
            unit="ppm"
            icon={Wind}
            normalRange="200 – 320"
            status={mq135Status}
            subtext="Sulfides & Air"
          />

          <SensorCard
            label="MQ-137 (Ammonia / Amines)"
            value={formatSensorValue(sensors.mq137, 0)}
            unit="ppm"
            icon={Sparkles}
            normalRange="50 – 120"
            status={mq137Status}
            subtext="Protein breakdown"
          />
        </div>
      </div>
    </div>
  );
};
