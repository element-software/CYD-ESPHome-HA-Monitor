'use client';

import { useRef, useEffect } from 'react';
import type { ConfigData, IconSet } from '@/types/config';
import { defaultConfig } from '@/lib/defaultConfig';

/** Default sensors for row 4 when Hide Clock is enabled (r4c1, r4c2). */
const ROW4_DEFAULT_SENSORS = defaultConfig.sensors.slice(6, 8);

const ICON_SET_OPTIONS: { value: IconSet; label: string; description: string }[] = [
  { value: 'material_design_icons', label: 'Material Design Icons', description: 'Classic icon set (community)' },
  { value: 'material_symbols', label: 'Material Symbols', description: 'Google Fonts icons (fonts.google.com/icons)' },
];

interface DisplaySettingsModalProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  open: boolean;
  onClose: () => void;
}

export default function DisplaySettingsModal({ config, onChange, open, onClose }: DisplaySettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const update = (field: keyof ConfigData, value: string | boolean | IconSet | number) => {
    if (field === 'hideClock' && value === true && config.sensors.length < 8) {
      const extra = 8 - config.sensors.length;
      const newSensors = [...config.sensors, ...ROW4_DEFAULT_SENSORS.slice(0, extra)];
      onChange({ ...config, hideClock: true, sensors: newSensors });
      return;
    }
    onChange({ ...config, [field]: value });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-xl border border-gray-200 w-[min(96vw,28rem)] max-h-[90vh] overflow-hidden bg-white p-0"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Display Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">Visual and layout options for the device display.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[70vh] space-y-5">
        {/* Hide Clock */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Hide Clock</p>
            <p className="text-xs text-gray-500 mt-0.5">Adds an extra row for a 4×2 sensor grid.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.hideClock ?? false}
              onChange={(e) => update('hideClock', e.target.checked)}
              className="sr-only peer"
              aria-label="Hide Clock"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        {/* Button Corner Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Button Corner Radius</label>
            <span className="text-sm font-mono text-gray-500">{config.buttonRadius ?? 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={34}
            step={1}
            value={config.buttonRadius ?? 0}
            onChange={(e) => update('buttonRadius', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600"
            aria-label="Button corner radius"
          />
          <p className="text-xs text-gray-500">0 = square corners, 34 = fully rounded.</p>
        </div>

        <hr className="border-gray-100" />

        {/* Icon Set */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Icon Set</p>
          <p className="text-xs text-gray-500">Icons used in the preview and generated YAML.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ICON_SET_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50"
              >
                <input
                  type="radio"
                  name="displaySettingsIconSet"
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

      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Done
        </button>
      </div>
    </dialog>
  );
}
