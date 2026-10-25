import type { ConfigData, ScreenConfig, SensorConfig } from '@/types/config';
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

function remapTargetScreen(
  target: string | undefined,
  idMap: Map<string, string>,
): string | undefined {
  if (!target) return undefined;
  return idMap.get(target);
}

function remapSensorTargets(
  sensors: SensorConfig[],
  idMap: Map<string, string>,
): SensorConfig[] {
  return sensors.map((sensor) => ({
    ...sensor,
    targetScreen: remapTargetScreen(sensor.targetScreen, idMap),
  }));
}

export function reindexScreens(screens: ScreenConfig[]): ScreenConfig[] {
  const idMap = new Map(screens.map((s, i) => [s.id, `s${i + 1}`]));
  return screens.map((screen, index) => ({
    ...screen,
    id: `s${index + 1}`,
    sensors: remapSensorTargets(screen.sensors, idMap),
  }));
}

/** Reindex screen ids and remap sensor/clock navigation targets. Deleted targets are cleared. */
export function remapNavigationTargets(config: ConfigData): ConfigData {
  const screens = config.screens ?? [];
  const idMap = new Map(screens.map((s, i) => [s.id, `s${i + 1}`]));
  const reindexed = reindexScreens(screens);
  const clockTarget = remapTargetScreen(config.clockTargetScreen, idMap);
  const firstId = reindexed[0]?.id;
  return {
    ...config,
    screens: reindexed,
    sensors: reindexed[0]?.sensors ?? config.sensors,
    clockTargetScreen:
      reindexed.length < 2 || !clockTarget || clockTarget === firstId ? undefined : clockTarget,
  };
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
    return remapNavigationTargets({
      ...config,
      screens,
      sensors: screens[0].sensors,
    });
  }

  const s1Sensors =
    config.sensors && config.sensors.length > 0
      ? config.sensors.map((s) => ({ ...s }))
      : defaultConfig.sensors.map((s) => ({ ...s }));

  const screens: ScreenConfig[] = [createScreen(0, s1Sensors)];

  return remapNavigationTargets({
    ...config,
    screens,
    sensors: screens[0].sensors,
  });
}
