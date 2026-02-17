'use client';

import { useState } from 'react';
import { ConfigData, SensorConfig } from '@/types/config';
import SensorConfigPanel from './SensorConfigPanel';

const ROWS = 3;

interface SensorListProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function SensorList({ config, onChange }: SensorListProps) {
  const [expandedRows, setExpandedRows] = useState<boolean[]>(
    () => Array(ROWS).fill(false)
  );

  const updateSensor = (index: number, sensor: SensorConfig) => {
    const newSensors = [...config.sensors];
    newSensors[index] = sensor;
    onChange({ ...config, sensors: newSensors });
  };

  const toggleRow = (rowIndex: number) => {
    setExpandedRows((prev) => {
      const next = [...prev];
      next[rowIndex] = !next[rowIndex];
      return next;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        Sensor Configuration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {config.sensors.map((sensor, index) => {
          const rowIndex = Math.floor(index / 2);
          return (
            <SensorConfigPanel
              key={sensor.id}
              sensor={sensor}
              index={index}
              isExpanded={expandedRows[rowIndex]}
              onToggle={() => toggleRow(rowIndex)}
              onChange={(updatedSensor) => updateSensor(index, updatedSensor)}
            />
          );
        })}
      </div>
    </div>
  );
}
