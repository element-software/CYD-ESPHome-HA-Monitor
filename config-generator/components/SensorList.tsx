'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ConfigData, SensorConfig } from '@/types/config';
import SensorConfigPanel from './SensorConfigPanel';

interface SensorListProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  activeScreenIndex: number;
}

export default function SensorList({ config, onChange, activeScreenIndex }: SensorListProps) {
  const t = useTranslations('sensorList');

  const showClock = activeScreenIndex === 0 && !config.hideClock;
  const rows = showClock ? 3 : 4;

  const currentScreen = config.screens?.[activeScreenIndex] || { sensors: config.sensors };
  const visibleSensors = currentScreen.sensors.slice(0, rows * 2);

  const [expandedRows, setExpandedRows] = useState<boolean[]>(
    () => Array(4).fill(false)
  );

  const updateSensor = (index: number, sensor: SensorConfig) => {
    const newScreens = [...(config.screens || [])];
    if (newScreens[activeScreenIndex]) {
      const newSensors = [...newScreens[activeScreenIndex].sensors];
      newSensors[index] = sensor;
      newScreens[activeScreenIndex] = {
        ...newScreens[activeScreenIndex],
        sensors: newSensors,
      };

      onChange({
        ...config,
        screens: newScreens,
        sensors: activeScreenIndex === 0 ? newSensors : config.sensors,
      });
      return;
    }

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
        {t('title')} ({config.screens?.[activeScreenIndex]?.name || `Screen ${activeScreenIndex + 1}`})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleSensors.map((sensor, index) => {
          const rowIndex = Math.floor(index / 2);
          return (
            <SensorConfigPanel
              key={`${activeScreenIndex}_${sensor.id}`}
              sensor={sensor}
              index={index}
              isExpanded={expandedRows[rowIndex]}
              onToggle={() => toggleRow(rowIndex)}
              onChange={(updatedSensor) => updateSensor(index, updatedSensor)}
              iconSet={config.iconSet}
            />
          );
        })}
      </div>
    </div>
  );
}
