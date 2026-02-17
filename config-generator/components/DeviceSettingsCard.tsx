'use client';

import { ConfigData } from '@/types/config';

interface DeviceSettingsCardProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function DeviceSettingsCard({ config, onChange }: DeviceSettingsCardProps) {
  const update = (field: keyof ConfigData, value: string) => {
    onChange({ ...config, [field]: value });
  };

  return (
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
            onChange={(e) => update('deviceName', e.target.value)}
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
            onChange={(e) => update('friendlyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="HAMon"
          />
        </div>
      </div>
    </div>
  );
}
