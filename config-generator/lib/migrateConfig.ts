import type { ConfigData, ScreenConfig } from '@/types/config';
import { createEmptySensors, DEFAULT_SCREEN_BG, DEFAULT_SCREEN_FG, defaultConfig } from '@/lib/defaultConfig';

function defaultScreen(id: string, name: string, sensors = createEmptySensors()): ScreenConfig {
  return {
    id,
    name,
    backgroundColor: DEFAULT_SCREEN_BG,
    fontColor: DEFAULT_SCREEN_FG,
    sensors,
  };
}

export function migrateConfig(config: ConfigData): ConfigData {
  const existing = Array.isArray(config.screens) ? config.screens : [];
  if (existing.length === 3 && existing.every((s) => s && Array.isArray(s.sensors))) {
    const screens = existing.map((screen, index) => ({
      ...screen,
      id: screen.id || `s${index + 1}`,
      name: screen.name || `Screen ${index + 1}`,
      backgroundColor: screen.backgroundColor || DEFAULT_SCREEN_BG,
      fontColor: screen.fontColor || DEFAULT_SCREEN_FG,
      sensors: screen.sensors.length > 0 ? screen.sensors.map((s) => ({ ...s })) : createEmptySensors(),
    }));
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

  const screens: ScreenConfig[] = [
    {
      ...defaultScreen('s1', existing[0]?.name || 'Screen 1', s1Sensors),
      backgroundColor: existing[0]?.backgroundColor || DEFAULT_SCREEN_BG,
      fontColor: existing[0]?.fontColor || DEFAULT_SCREEN_FG,
      backgroundImage: existing[0]?.backgroundImage,
    },
    existing[1]
      ? {
          ...defaultScreen('s2', existing[1].name || 'Screen 2'),
          ...existing[1],
          id: existing[1].id || 's2',
          sensors: existing[1].sensors?.length ? existing[1].sensors : createEmptySensors(),
        }
      : defaultScreen('s2', 'Screen 2'),
    existing[2]
      ? {
          ...defaultScreen('s3', existing[2].name || 'Screen 3'),
          ...existing[2],
          id: existing[2].id || 's3',
          sensors: existing[2].sensors?.length ? existing[2].sensors : createEmptySensors(),
        }
      : defaultScreen('s3', 'Screen 3'),
  ];

  return {
    ...config,
    screens,
    sensors: screens[0].sensors,
  };
}
