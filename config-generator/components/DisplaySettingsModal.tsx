'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ConfigData, IconSet } from '@/types/config';
import { defaultConfig } from '@/lib/defaultConfig';

/** Default sensors for row 4 when Hide Clock is enabled (r4c1, r4c2). */
const ROW4_DEFAULT_SENSORS = defaultConfig.sensors.slice(6, 8);

const ICON_SET_VALUES: IconSet[] = ['material_design_icons', 'material_symbols'];

interface DisplaySettingsModalProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  open: boolean;
  onClose: () => void;
}

export default function DisplaySettingsModal({ config, onChange, open, onClose }: DisplaySettingsModalProps) {
  const t = useTranslations('displayModal');
  const tCommon = useTranslations('common');
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
    if (field === 'hideClock' && value === true) {
      const extra = Math.max(0, 8 - config.sensors.length);
      const newSensors = extra
        ? [...config.sensors, ...ROW4_DEFAULT_SENSORS.slice(0, extra)]
        : config.sensors;
      const screens = config.screens ? [...config.screens] : undefined;
      if (screens?.[0] && screens[0].sensors.length < 8) {
        const screenExtra = 8 - screens[0].sensors.length;
        screens[0] = {
          ...screens[0],
          sensors: [...screens[0].sensors, ...ROW4_DEFAULT_SENSORS.slice(0, screenExtra)],
        };
      }
      onChange({
        ...config,
        hideClock: true,
        sensors: screens?.[0]?.sensors ?? newSensors,
        screens,
      });
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
          <h3 className="text-lg font-semibold text-gray-800">{t('title')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          aria-label={tCommon('close')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[70vh] space-y-5">
        {/* Swap X/Y */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('swapXy.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('swapXy.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.displaySwapXy ?? true}
              onChange={(e) => update('displaySwapXy', e.target.checked)}
              className="sr-only peer"
              aria-label={t('swapXy.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        {/* Hide Clock */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('hideClock.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('hideClock.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.hideClock ?? false}
              onChange={(e) => update('hideClock', e.target.checked)}
              className="sr-only peer"
              aria-label={t('hideClock.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('invertColors.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('invertColors.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.displayInvertColors ?? false}
              onChange={(e) => update('displayInvertColors', e.target.checked)}
              className="sr-only peer"
              aria-label={t('invertColors.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('colorOrder.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('colorOrder.description')}</p>
          </div>
          <select
            value={config.displayColorOrder ?? 'RGB'}
            onChange={(e) => update('displayColorOrder', e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="RGB">RGB</option>
            <option value="BGR">BGR</option>
          </select>
        </div>

        <hr className="border-gray-100" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('mirrorX.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('mirrorX.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.displayMirrorX ?? true}
              onChange={(e) => update('displayMirrorX', e.target.checked)}
              className="sr-only peer"
              aria-label={t('mirrorX.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('mirrorY.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('mirrorY.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.displayMirrorY ?? true}
              onChange={(e) => update('displayMirrorY', e.target.checked)}
              className="sr-only peer"
              aria-label={t('mirrorY.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">{t('webServer.label')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('webServer.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.enableWebServer !== false}
              onChange={(e) => update('enableWebServer', e.target.checked)}
              className="sr-only peer"
              aria-label={t('webServer.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        <hr className="border-gray-100" />

        {/* Button Corner Radius */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('buttonRadius.label')}</label>
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
            aria-label={t('buttonRadius.label')}
          />
          <p className="text-xs text-gray-500">{t('buttonRadius.help')}</p>
        </div>

        <hr className="border-gray-100" />

        {/* Icon Set */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{t('iconSet.label')}</p>
          <p className="text-xs text-gray-500">{t('iconSet.description')}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ICON_SET_VALUES.map((val) => {
              const labelKey = val === 'material_symbols' ? 'materialSymbols' : 'materialDesign';
              return (
                <label
                  key={val}
                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50"
                >
                  <input
                    type="radio"
                    name="displaySettingsIconSet"
                    value={val}
                    checked={(config.iconSet ?? 'material_design_icons') === val}
                    onChange={() => update('iconSet', val)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-800">{t(`iconSet.${labelKey}.label`)}</span>
                    <p className="text-xs text-gray-500">{t(`iconSet.${labelKey}.description`)}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          {tCommon('done')}
        </button>
      </div>
    </dialog>
  );
}
