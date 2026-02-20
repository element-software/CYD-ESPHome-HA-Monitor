import { ConfigData } from "@/types/config";
import { yamlHeader, generateSubstitutions } from "./substitutions";
import { generateBoilerplate } from "./boilerplate";
import { generateLvglConfig } from "./lvgl";
import {
  generateBinarySensorConfig,
  generateSwitchSensorConfig,
  generateLightConfig,
  generateNumericSensorConfig,
} from "./sensors";

export function generateYaml(config: ConfigData): string {
  const { deviceName, sensors } = config;

  return (
    yamlHeader +
    generateSubstitutions(config) +
    generateBoilerplate(deviceName) +
    generateLvglConfig(sensors) +
    generateBinarySensorConfig(sensors) +
    generateSwitchSensorConfig(sensors) +
    generateLightConfig() +
    generateNumericSensorConfig(sensors)
  );
}
