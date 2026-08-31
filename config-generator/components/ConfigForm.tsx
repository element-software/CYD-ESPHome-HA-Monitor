'use client';

import { ConfigData, ScreenConfig } from '@/types/config';
import { previewImageCache } from '@/lib/previewImageCache';
import { cloneSampleSensors, DEFAULT_SCREEN_BG, DEFAULT_SCREEN_FG, MAX_SCREENS } from '@/lib/defaultConfig';
import { createScreen, reindexScreens } from '@/lib/migrateConfig';
import DeviceSettingsCard from './DeviceSettingsCard';
import SensorList from './SensorList';
import { useTranslations } from 'next-intl';

interface ConfigFormProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  activeScreenIndex: number;
  onActiveScreenChange: (index: number) => void;
}

const THEMES = {
  default: { bg: DEFAULT_SCREEN_BG, fg: DEFAULT_SCREEN_FG },
  frigate: { bg: '#0a0a0c', fg: '#f4f4f7' },
  ha: { bg: '#1c1c21', fg: '#f4f4f7' },
  light: { bg: '#f8fafc', fg: '#0f172a' },
} as const;

function themeValue(screen?: ScreenConfig): string {
  const bg = screen?.backgroundColor;
  const fg = screen?.fontColor;
  if (bg === THEMES.frigate.bg && fg === THEMES.frigate.fg) return 'frigate';
  if (bg === THEMES.ha.bg && fg === THEMES.ha.fg) return 'ha';
  if (bg === THEMES.light.bg && fg === THEMES.light.fg) return 'light';
  if (bg === THEMES.default.bg && fg === THEMES.default.fg) return 'default';
  return 'custom';
}

export default function ConfigForm({
  config,
  onChange,
  activeScreenIndex,
  onActiveScreenChange,
}: ConfigFormProps) {
  const t = useTranslations('screenSettings');

  const updateScreen = (patch: Partial<ScreenConfig>) => {
    const newScreens = [...(config.screens || [])];
    if (!newScreens[activeScreenIndex]) return;
    newScreens[activeScreenIndex] = {
      ...newScreens[activeScreenIndex],
      ...patch,
    };
    onChange({
      ...config,
      screens: newScreens,
      sensors: activeScreenIndex === 0 ? newScreens[0].sensors : config.sensors,
    });
  };

  const screens = config.screens?.length ? config.screens : [];
  const activeScreen = screens[activeScreenIndex];
  const canAddScreen = screens.length < MAX_SCREENS;
  const canRemoveScreen = activeScreenIndex > 0 && screens.length > 1;

  const addScreen = () => {
    if (!canAddScreen) return;
    const next = [...screens, createScreen(screens.length, cloneSampleSensors())];
    onChange({ ...config, screens: next });
    onActiveScreenChange(next.length - 1);
  };

  const removeScreen = () => {
    if (!canRemoveScreen) return;
    const next = reindexScreens(screens.filter((_, i) => i !== activeScreenIndex));
    onChange({
      ...config,
      screens: next,
      sensors: next[0]?.sensors ?? config.sensors,
    });
    onActiveScreenChange(Math.max(0, activeScreenIndex - 1));
  };

  return (
    <div className="space-y-6">
      <DeviceSettingsCard config={config} onChange={onChange} />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex items-stretch border-b border-gray-200 bg-gray-50/50">
          <div className="flex min-w-0 flex-1 overflow-x-auto">
            {screens.map((screen, idx) => {
              const isActive = idx === activeScreenIndex;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => onActiveScreenChange(idx)}
                  className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all -mb-px outline-none shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {screen.name || `Screen ${idx + 1}`}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 shrink-0 px-2 border-l border-gray-200">
            <button
              type="button"
              onClick={addScreen}
              disabled={!canAddScreen}
              title={canAddScreen ? t('addScreen') : t('addScreenLimit', { max: MAX_SCREENS })}
              aria-label={t('addScreen')}
              className="px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + {t('addScreen')}
            </button>
            {canRemoveScreen && (
              <button
                type="button"
                onClick={removeScreen}
                title={t('removeScreen')}
                aria-label={t('removeScreen')}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                {t('removeScreen')}
              </button>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('name')}
              </label>
              <input
                type="text"
                value={activeScreen?.name || ''}
                onChange={(e) => updateScreen({ name: e.target.value })}
                className="w-full h-11 box-border px-3.5 text-sm leading-5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('theme')}
              </label>
              <select
                onChange={(e) => {
                  const theme = e.target.value as keyof typeof THEMES;
                  const colors = THEMES[theme];
                  if (!colors) return;
                  updateScreen({ backgroundColor: colors.bg, fontColor: colors.fg });
                }}
                value={themeValue(activeScreen)}
                className="h-11 w-full box-border px-3 text-sm leading-5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option value="default">{t('themes.default')}</option>
                <option value="frigate">{t('themes.frigate')}</option>
                <option value="ha">{t('themes.ha')}</option>
                <option value="light">{t('themes.light')}</option>
                <option value="custom" disabled>{t('themes.custom')}</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('backgroundColor')}
              </label>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="color"
                  value={activeScreen?.backgroundColor || DEFAULT_SCREEN_BG}
                  onChange={(e) => updateScreen({ backgroundColor: e.target.value })}
                  className="w-10 h-11 p-0 border border-gray-300 rounded-md cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={activeScreen?.backgroundColor || DEFAULT_SCREEN_BG}
                  onChange={(e) => updateScreen({ backgroundColor: e.target.value })}
                  className="min-w-0 flex-1 box-border px-2 h-11 text-sm leading-5 uppercase text-center font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('fontColor')}
              </label>
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="color"
                  value={activeScreen?.fontColor || DEFAULT_SCREEN_FG}
                  onChange={(e) => updateScreen({ fontColor: e.target.value })}
                  className="w-10 h-11 p-0 border border-gray-300 rounded-md cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={activeScreen?.fontColor || DEFAULT_SCREEN_FG}
                  onChange={(e) => updateScreen({ fontColor: e.target.value })}
                  className="min-w-0 flex-1 box-border px-2 h-11 text-sm leading-5 uppercase text-center font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="min-w-0 sm:col-span-2 xl:col-span-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('backgroundImage')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. images/bg_home.png"
                  value={activeScreen?.backgroundImage || ''}
                  onChange={(e) => updateScreen({ backgroundImage: e.target.value })}
                  className="min-w-0 flex-1 px-3 h-11 box-border text-sm leading-5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label className="inline-flex items-center justify-center px-4 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors text-sm border border-gray-300 cursor-pointer shrink-0">
                  {t('chooseImage')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const esphomePath = `images/${file.name}`;
                      const blobUrl = URL.createObjectURL(file);
                      previewImageCache.set(esphomePath, blobUrl);
                      updateScreen({ backgroundImage: esphomePath });
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-1.5 text-xs text-gray-500 leading-normal">
                {t('backgroundImageHelp')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <SensorList config={config} onChange={onChange} activeScreenIndex={activeScreenIndex} />
    </div>
  );
}
