'use client';

import { ConfigData, SensorConfig } from '@/types/config';
import SensorConfigPanel from './SensorConfigPanel';

interface ConfigFormProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function ConfigForm({ config, onChange }: ConfigFormProps) {
  const updateDeviceSettings = (field: keyof ConfigData, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const updateSensor = (index: number, sensor: SensorConfig) => {
    const newSensors = [...config.sensors];
    newSensors[index] = sensor;
    onChange({ ...config, sensors: newSensors });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Device Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Name
            </label>
            <input
              type="text"
              value={config.deviceName}
              onChange={(e) => updateDeviceSettings('deviceName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hamon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Friendly Name
            </label>
            <input
              type="text"
              value={config.friendlyName}
              onChange={(e) => updateDeviceSettings('friendlyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="HAMon"
            />
          </div>
        </div>
      </div>

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
    </div>
  );
}
