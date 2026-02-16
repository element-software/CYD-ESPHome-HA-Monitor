'use client';

import { useState } from 'react';
import { SensorConfig } from '@/types/config';
import { commonIcons, iconCodeToChar } from '@/lib/icons';

interface SensorConfigPanelProps {
  sensor: SensorConfig;
  index: number;
  onChange: (sensor: SensorConfig) => void;
}

export default function SensorConfigPanel({
  sensor,
  index,
  onChange,
}: SensorConfigPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateField = (field: keyof SensorConfig, value: string) => {
    onChange({ ...sensor, [field]: value });
  };

  const getSensorLabel = () => {
    const row = Math.floor(index / 2) + 1;
    const col = (index % 2) + 1;
    return `Row ${row}, Column ${col}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{getSensorLabel()}</span>
          <span className="text-sm text-gray-600">
            {sensor.label || 'Unnamed'}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            sensor.type === 'sensor' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {sensor.type}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={sensor.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="sensor">Sensor (Numeric)</option>
                <option value="binary">Binary Sensor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={sensor.label}
                onChange={(e) => updateField('label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Energy"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entity ID
            </label>
            <input
              type="text"
              value={sensor.entity}
              onChange={(e) => updateField('entity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="sensor.example"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={sensor.icon}
                onChange={(e) => updateField('icon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: '"Material Icons", system-ui, sans-serif' }}
              >
                {commonIcons.map((icon) => (
                  <option key={icon.code} value={icon.code}>
                    {iconCodeToChar(icon.code)} {icon.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon Color
              </label>
              <input
                type="text"
                value={sensor.iconColor}
                onChange={(e) => updateField('iconColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0xFFA500"
              />
            </div>
          </div>

          {sensor.type === 'sensor' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format String
                </label>
                <input
                  type="text"
                  value={sensor.format || ''}
                  onChange={(e) => updateField('format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="%.1f°C"
                />
                <p className="text-xs text-gray-500 mt-1">
                  e.g., %.0fW for whole watts, %.1f°C for temperature
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    High Threshold
                  </label>
                  <input
                    type="text"
                    value={sensor.colorThreshHigh || ''}
                    onChange={(e) => updateField('colorThreshHigh', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mid Threshold
                  </label>
                  <input
                    type="text"
                    value={sensor.colorThreshMid || ''}
                    onChange={(e) => updateField('colorThreshMid', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="3000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Threshold
                  </label>
                  <input
                    type="text"
                    value={sensor.colorThreshLow || ''}
                    onChange={(e) => updateField('colorThreshLow', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State ON Text
                  </label>
                  <input
                    type="text"
                    value={sensor.stateOn || ''}
                    onChange={(e) => updateField('stateOn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Open"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State OFF Text
                  </label>
                  <input
                    type="text"
                    value={sensor.stateOff || ''}
                    onChange={(e) => updateField('stateOff', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Closed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color ON
                  </label>
                  <input
                    type="text"
                    value={sensor.colorOn || ''}
                    onChange={(e) => updateField('colorOn', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0xFF5252"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color OFF
                  </label>
                  <input
                    type="text"
                    value={sensor.colorOff || ''}
                    onChange={(e) => updateField('colorOff', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0x32CD32"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
