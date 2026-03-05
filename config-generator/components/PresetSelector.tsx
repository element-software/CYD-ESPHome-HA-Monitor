'use client';

import { ConfigPreset } from '@/types/config';

interface PresetOption {
  value: ConfigPreset;
  label: string;
  description: string;
  icon: string;
}

const PRESETS: PresetOption[] = [
  {
    value: 'ha_monitor',
    label: 'HA Monitor',
    description: 'Home Assistant sensor dashboard with customisable grid layout.',
    icon: '📊',
  },
  {
    value: 'prayer_times',
    label: 'Prayer Times',
    description: 'Islamic prayer times display powered by prayertimes.dev — no HA required.',
    icon: '🕌',
  },
];

interface PresetSelectorProps {
  preset: ConfigPreset;
  onChange: (preset: ConfigPreset) => void;
}

export default function PresetSelector({ preset, onChange }: PresetSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-1 text-gray-800">Choose a Preset</h2>
      <p className="text-sm text-gray-500 mb-4">
        Select the display mode for your CYD device.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors
              ${preset === opt.value
                ? 'border-blue-500 bg-blue-50/60'
                : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <input
              type="radio"
              name="preset"
              value={opt.value}
              checked={preset === opt.value}
              onChange={() => onChange(opt.value)}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-base font-medium text-gray-800">
                {opt.icon} {opt.label}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
