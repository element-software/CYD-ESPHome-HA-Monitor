'use client';

import { ConfigData, IconSet } from '@/types/config';
import { defaultConfig } from '@/lib/defaultConfig';
import BacklightPinSelect from './BacklightPinSelect';

interface DeviceSettingsCardProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

/** Default sensors for row 4 when Hide Clock is enabled (r4c1, r4c2). */
const ROW4_DEFAULT_SENSORS = defaultConfig.sensors.slice(6, 8);

const ICON_SET_OPTIONS: { value: IconSet; label: string; description: string }[] = [
  { value: 'material_design_icons', label: 'Material Design Icons', description: 'Classic icon set (current)' },
  { value: 'material_symbols', label: 'Material Symbols', description: 'Google Fonts icons (fonts.google.com/icons)' },
];

export default function DeviceSettingsCard({ config, onChange }: DeviceSettingsCardProps) {
  const update = (field: keyof ConfigData, value: string | boolean | IconSet) => {
    if (field === 'hideClock' && value === true && config.sensors.length < 8) {
      const extra = 8 - config.sensors.length;
      const newSensors = [...config.sensors, ...ROW4_DEFAULT_SENSORS.slice(0, extra)];
      onChange({ ...config, hideClock: true, sensors: newSensors });
      return;
    }
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
        <div className="flex items-center gap-3 pt-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.hideClock ?? false}
              onChange={(e) => update('hideClock', e.target.checked)}
              className="sr-only peer"
              aria-label="Hide Clock"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
          <div>
            <span className="text-sm font-medium text-gray-700">Hide Clock</span>
            <p className="text-xs text-gray-500">Adds an extra row for a 4x2 sensor grid</p>
          </div>
        </div>
        <BacklightPinSelect
          value={config.backlightPin ?? 'GPIO21'}
          onChange={(pin) => update('backlightPin', pin)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon set
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Icons shown in the preview and used in generated YAML.
          </p>
          <div className="flex flex-col gap-2">
            {ICON_SET_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50"
              >
                <input
                  type="radio"
                  name="iconSet"
                  value={opt.value}
                  checked={(config.iconSet ?? 'material_design_icons') === opt.value}
                  onChange={() => update('iconSet', opt.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                  <p className="text-xs text-gray-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
