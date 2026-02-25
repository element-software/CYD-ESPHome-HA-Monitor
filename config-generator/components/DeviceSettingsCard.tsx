'use client';

import { useState } from 'react';
import { ConfigData } from '@/types/config';
import { getEffectivePins } from '@/lib/devicePresets';
import DeviceGpioModal from './DeviceGpioModal';
import DisplaySettingsModal from './DisplaySettingsModal';

interface DeviceSettingsCardProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function DeviceSettingsCard({ config, onChange }: DeviceSettingsCardProps) {
  const [gpioModalOpen, setGpioModalOpen] = useState(false);
  const [displayModalOpen, setDisplayModalOpen] = useState(false);

  const pins = getEffectivePins(config);
  const variantLabel = config.deviceVariant === 'i2c_touch'
    ? 'I2C touch'
    : config.deviceVariant === 'custom'
      ? 'Custom'
      : 'SPI touch';

  const iconSetLabel = (config.iconSet ?? 'material_design_icons') === 'material_symbols'
    ? 'Material Symbols'
    : 'Material Design Icons';

  const displaySummary = [
    config.hideClock ? 'No clock' : 'With clock',
    `Radius ${config.buttonRadius ?? 0}`,
    iconSetLabel,
  ].join(' · ');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Device Settings</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <input
              type="text"
              value={config.deviceName}
              onChange={(e) => onChange({ ...config, deviceName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hamon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Friendly Name</label>
            <input
              type="text"
              value={config.friendlyName}
              onChange={(e) => onChange({ ...config, friendlyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="HAMon"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGpioModalOpen(true)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between gap-2 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700">GPIO Config</p>
              <p className="text-xs text-gray-500 truncate">{variantLabel} · {pins.backlightPin} backlight</p>
            </div>
            <ChevronRight />
          </button>

          <button
            type="button"
            onClick={() => setDisplayModalOpen(true)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between gap-2 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700">Display Settings</p>
              <p className="text-xs text-gray-500 truncate">{displaySummary}</p>
            </div>
            <ChevronRight />
          </button>
        </div>
      </div>

      <DeviceGpioModal
        config={config}
        onChange={onChange}
        open={gpioModalOpen}
        onClose={() => setGpioModalOpen(false)}
      />
      <DisplaySettingsModal
        config={config}
        onChange={onChange}
        open={displayModalOpen}
        onClose={() => setDisplayModalOpen(false)}
      />
    </div>
  );
}
