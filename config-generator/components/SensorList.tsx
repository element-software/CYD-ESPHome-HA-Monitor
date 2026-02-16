'use client';

import { ConfigData, SensorConfig } from '@/types/config';
import SensorConfigPanel from './SensorConfigPanel';

interface SensorListProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function SensorList({ config, onChange }: SensorListProps) {
  const updateSensor = (index: number, sensor: SensorConfig) => {
    const newSensors = [...config.sensors];
    newSensors[index] = sensor;
    onChange({ ...config, sensors: newSensors });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Sensor Configuration
      </h2>
      <div className="space-y-4">
        {config.sensors.map((sensor, index) => (
          <SensorConfigPanel
            key={sensor.id}
            sensor={sensor}
            index={index}
            onChange={(updatedSensor) => updateSensor(index, updatedSensor)}
          />
        ))}
      </div>
    </div>
  );
}
