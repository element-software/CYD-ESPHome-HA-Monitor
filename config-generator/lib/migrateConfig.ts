import type { ConfigData, ScreenConfig } from '@/types/config';
import {
  cloneSampleSensors,
  createEmptySensors,
  DEFAULT_SCREEN_BG,
  DEFAULT_SCREEN_FG,
  defaultConfig,
} from '@/lib/defaultConfig';

export function createScreen(index: number, sensors = cloneSampleSensors()): ScreenConfig {
  return {
    id: `s${index + 1}`,
    name: `Screen ${index + 1}`,
    backgroundColor: DEFAULT_SCREEN_BG,
    fontColor: DEFAULT_SCREEN_FG,
    sensors,
  };
}

export function reindexScreens(screens: ScreenConfig[]): ScreenConfig[] {
  return screens.map((screen, index) => ({
    ...screen,
    id: `s${index + 1}`,
  }));
}

function normalizeScreen(screen: ScreenConfig, index: number): ScreenConfig {
  return {
    ...screen,
    id: screen.id || `s${index + 1}`,
    name: screen.name || `Screen ${index + 1}`,
    backgroundColor: screen.backgroundColor || DEFAULT_SCREEN_BG,
    fontColor: screen.fontColor || DEFAULT_SCREEN_FG,
    sensors: screen.sensors?.length ? screen.sensors.map((s) => ({ ...s })) : createEmptySensors(),
  };
}

export function migrateConfig(config: ConfigData): ConfigData {
  const existing = Array.isArray(config.screens) ? config.screens.filter((s) => s && Array.isArray(s.sensors)) : [];

  if (existing.length >= 1) {
    const screens = existing.map((screen, index) => normalizeScreen(screen, index));
    return {
      ...config,
      screens,
      sensors: screens[0].sensors,
    };
  }

  const s1Sensors =
    config.sensors && config.sensors.length > 0
      ? config.sensors.map((s) => ({ ...s }))
      : defaultConfig.sensors.map((s) => ({ ...s }));

  const screens: ScreenConfig[] = [createScreen(0, s1Sensors)];

  return {
    ...config,
    screens,
    sensors: screens[0].sensors,
  };
}
