'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { AudioHardware, ConfigData } from '@/types/config';
import { collectUsedPinValues, getEffectivePins } from '@/lib/devicePresets';
import { AUDIO_DEFAULTS } from '@/lib/yamlGenerator/audio';

const GPIO_OPTIONS = [
  'GPIO0', 'GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15',
  'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23',
  'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33',
];

interface AudioSettingsModalProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  open: boolean;
  onClose: () => void;
}

function PinSelect({
  label,
  value,
  onChange,
  collides,
  collisionText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  collides: boolean;
  collisionText: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-gray-700 dark:text-gray-300 shrink-0 min-w-[120px]">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 max-w-[140px] px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 ${
            collides ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40' : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {GPIO_OPTIONS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      {collides && (
        <p className="text-xs text-amber-700 dark:text-amber-400 pl-[120px]">{collisionText}</p>
      )}
    </div>
  );
}

export default function AudioSettingsModal({ config, onChange, open, onClose }: AudioSettingsModalProps) {
  const t = useTranslations('audioModal');
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

  const usedPins = new Set(collectUsedPinValues(getEffectivePins(config)));
  const hardware: AudioHardware = config.audioHardware === 'rtttl' ? 'rtttl' : 'i2s';
  const doutPin = config.audioDoutPin || AUDIO_DEFAULTS.dout;
  const bclkPin = config.audioBclkPin || AUDIO_DEFAULTS.bclk;
  const lrclkPin = config.audioLrclkPin || AUDIO_DEFAULTS.lrclk;
  const rtttlPin = config.audioRtttlPin || AUDIO_DEFAULTS.rtttl;
  const i2sPinsCollide = hardware === 'i2s' && (doutPin === bclkPin || doutPin === lrclkPin || bclkPin === lrclkPin);

  const update = (patch: Partial<ConfigData>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-[min(96vw,28rem)] max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-900 p-0"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t('title')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          aria-label={tCommon('close')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[70vh] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('enable.label')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('enable.description')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={config.enableAudio === true}
              onChange={(e) => update({ enableAudio: e.target.checked })}
              className="sr-only peer"
              aria-label={t('enable.label')}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {config.enableAudio === true && (
          <>
            <hr className="border-gray-100 dark:border-gray-700" />

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{t('hardware.label')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('hardware.description')}</p>
              <div className="grid grid-cols-1 gap-2">
                {(['i2s', 'rtttl'] as AudioHardware[]).map((val) => (
                  <label
                    key={val}
                    className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50 dark:has-[:checked]:bg-blue-950/30"
                  >
                    <input
                      type="radio"
                      name="audioHardware"
                      value={val}
                      checked={hardware === val}
                      onChange={() => update({ audioHardware: val })}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {t(`hardware.${val}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div className="space-y-3">
              {hardware === 'i2s' ? (
                <>
                  <PinSelect
                    label={t('pins.dout')}
                    value={doutPin}
                    onChange={(v) => update({ audioDoutPin: v })}
                    collides={usedPins.has(doutPin) || doutPin === bclkPin || doutPin === lrclkPin}
                    collisionText={usedPins.has(doutPin) ? t('pinCollision') : t('pinReuse')}
                  />
                  <PinSelect
                    label={t('pins.bclk')}
                    value={bclkPin}
                    onChange={(v) => update({ audioBclkPin: v })}
                    collides={usedPins.has(bclkPin) || bclkPin === doutPin || bclkPin === lrclkPin}
                    collisionText={usedPins.has(bclkPin) ? t('pinCollision') : t('pinReuse')}
                  />
                  <PinSelect
                    label={t('pins.lrclk')}
                    value={lrclkPin}
                    onChange={(v) => update({ audioLrclkPin: v })}
                    collides={usedPins.has(lrclkPin) || lrclkPin === doutPin || lrclkPin === bclkPin}
                    collisionText={usedPins.has(lrclkPin) ? t('pinCollision') : t('pinReuse')}
                  />
                  {i2sPinsCollide && (
                    <p className="text-xs text-amber-700 dark:text-amber-400">{t('pinReuse')}</p>
                  )}
                </>
              ) : (
                <PinSelect
                  label={t('pins.rtttl')}
                  value={rtttlPin}
                  onChange={(v) => update({ audioRtttlPin: v })}
                  collides={usedPins.has(rtttlPin)}
                  collisionText={t('pinCollision')}
                />
              )}
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
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
