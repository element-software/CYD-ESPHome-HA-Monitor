import type {
  ConfigData,
  SensorConfig,
  BinarySensorConfig,
  InputBooleanSensorConfig,
  LightSensorConfig,
  SwitchSensorConfig,
} from "@/types/config";
import { generateHeader } from "./header";
import { generateSubstitutions, getAllPrefixedSensors } from "./substitutions";
import { generateBoilerplate } from "./boilerplate";
import { generateLvglConfig } from "./lvgl";
import {
  generateBinarySensorConfig,
  generateSwitchSensorConfig,
} from "./onOffSensors";
import { generateNumericSensorConfig, generateTextValueSensorConfig } from "./numericSensors";
import { generateLightConfig } from "./light";
import { migrateConfig } from "@/lib/migrateConfig";

function generateImageConfig(config: ConfigData): string {
  const screens = config.screens || [];
  const screensWithImages = screens.filter(
    (s) => s.backgroundImage && s.backgroundImage.trim() !== "",
  );

  if (screensWithImages.length === 0) return "";

  const lines: string[] = [];
  lines.push(`# --- IMAGE ASSETS (Compiled in Flash) ---`);
  lines.push(`image:`);
  screensWithImages.forEach((s) => {
    lines.push(`  - platform: file`);
    lines.push(`    file: "${s.backgroundImage!.trim()}"`);
    lines.push(`    id: ${s.id}_bg_image`);
    lines.push(`    resize: 240x320`);
    lines.push(`    type: RGB565`);
  });
  lines.push(``);

  return lines.join("\n");
}

export function generateYaml(config: ConfigData): string {
  const migrated = migrateConfig(config);
  const { hideClock } = migrated;
  const allSensors = getAllPrefixedSensors(migrated);
  const activeSensors = allSensors.filter((s) => s.enabled !== false);
  const getSensor = (id: string): SensorConfig | undefined =>
    allSensors.find((s) => s.id === id);

  const binarySensors = activeSensors.filter(
    (s): s is BinarySensorConfig => s.type === "binary",
  );
  const lightSensors = activeSensors.filter(
    (s): s is LightSensorConfig => s.type === "light",
  );
  const switchSensors = activeSensors.filter(
    (s): s is SwitchSensorConfig => s.type === "switch",
  );
  const inputBooleanSensors = activeSensors.filter(
    (s): s is InputBooleanSensorConfig => s.type === "input_boolean",
  );

  return (
    generateHeader() +
    generateSubstitutions(migrated, allSensors, getSensor) +
    generateImageConfig(migrated) +
    generateBoilerplate(migrated) +
    generateLvglConfig(
      allSensors,
      getSensor,
      hideClock ?? false,
      migrated.buttonRadius ?? 0,
      migrated.screens,
    ) +
    generateBinarySensorConfig(binarySensors, lightSensors, inputBooleanSensors) +
    generateSwitchSensorConfig(switchSensors) +
    generateLightConfig() +
    generateTextValueSensorConfig(activeSensors) +
    generateNumericSensorConfig(activeSensors)
  );
}
