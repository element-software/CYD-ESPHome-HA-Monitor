/** Base fields shared by all sensor configs */
export interface BaseSensorConfig {
  id: string;
  entity: string;
  label: string;
}

export interface LightSensorConfig extends BaseSensorConfig {
  type: "light";
  stateOn?: string;
  stateOff?: string;
  iconOn?: string;
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
}

export interface SwitchSensorConfig extends BaseSensorConfig {
  type: "switch";
  stateOn?: string;
  stateOff?: string;
  iconOn?: string;
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
}

export interface NumericSensorConfig extends BaseSensorConfig {
  type: "sensor";
  icon: string;
  iconColor: string;
  format?: string;
  colorThreshHigh?: string;
  colorThreshMid?: string;
  colorThreshLow?: string;
  /** Colors for each threshold band (value above high = colorHigh, etc.) */
  colorHigh?: string;
  colorMid?: string;
  colorLow?: string;
}

/** No icon/iconColor; uses iconOn/iconOff and colorOn/colorOff per state. */
export interface BinarySensorConfig extends BaseSensorConfig {
  type: "binary";
  stateOn?: string;
  stateOff?: string;
  /** Icon codepoint when state is ON (e.g. \\ue559). */
  iconOn?: string;
  /** Icon codepoint when state is OFF (e.g. \\ue558). */
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
}

/** Discriminated union of all sensor config types */
export type SensorConfig = NumericSensorConfig | BinarySensorConfig | LightSensorConfig | SwitchSensorConfig;

/** Keys that can be updated on any sensor (union of keys from all config types) */
export type SensorConfigKey =
  | keyof NumericSensorConfig
  | keyof BinarySensorConfig
  | keyof LightSensorConfig
  | keyof SwitchSensorConfig;

/** Icon font used in the UI and in generated ESPHome YAML. */
export type IconSet = 'material_design_icons' | 'material_symbols';

export interface ConfigData {
  deviceName: string;
  friendlyName: string;
  hideClock?: boolean;
  backlightPin?: string;
  /** Icon set: Material Design Icons (legacy) or Material Symbols (Google Fonts). */
  iconSet?: IconSet;
  sensors: SensorConfig[];
}
