import type {
  ConfigData,
  SensorConfig,
  BinarySensorConfig,
  InputBooleanSensorConfig,
  LightSensorConfig,
  SwitchSensorConfig,
} from "@/types/config";
import { generateHeader } from "./header";
import { generateSubstitutions } from "./substitutions";
import { generateBoilerplate } from "./boilerplate";
import { generateLvglConfig } from "./lvgl";
import {
  generateBinarySensorConfig,
  generateSwitchSensorConfig,
} from "./onOffSensors";
import { generateNumericSensorConfig, generateTextValueSensorConfig } from "./numericSensors";
import { generateLightConfig } from "./light";

export function generateYaml(config: ConfigData): string {
  const { hideClock } = config;
  const sensorCount = hideClock ? 8 : 6;
  const sensors = config.sensors.slice(0, sensorCount);
  const getSensor = (id: string): SensorConfig | undefined =>
    sensors.find((s) => s.id === id);

  const binarySensors = sensors.filter(
    (s): s is BinarySensorConfig => s.type === "binary",
  );
  const lightSensors = sensors.filter(
    (s): s is LightSensorConfig => s.type === "light",
  );
  const switchSensors = sensors.filter(
    (s): s is SwitchSensorConfig => s.type === "switch",
  );
  const inputBooleanSensors = sensors.filter(
    (s): s is InputBooleanSensorConfig => s.type === "input_boolean",
  );

  return (
    generateHeader() +
    generateSubstitutions(config, sensors, getSensor) +
    generateBoilerplate(config) +
    generateLvglConfig(sensors, getSensor, hideClock ?? false, config.buttonRadius ?? 0) +
    generateBinarySensorConfig(binarySensors, lightSensors, inputBooleanSensors) +
    generateSwitchSensorConfig(switchSensors) +
    generateLightConfig() +
    generateTextValueSensorConfig(sensors) +
    generateNumericSensorConfig(sensors)
  );
}
