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

/** A single threshold entry: if sensor value exceeds `value`, use `color` (and optionally `icon`). */
export interface ThresholdConfig {
  value: string;
  color: string;
  /** Optional icon codepoint override (e.g. \\uf578). Falls back to the sensor base icon. */
  icon?: string;
}

export interface NumericSensorConfig extends BaseSensorConfig {
  type: "sensor";
  icon: string;
  iconColor: string;
  format?: string;
  /** Dynamic ordered thresholds (highest value first). Replaces legacy colorThresh* fields. */
  thresholds?: ThresholdConfig[];
  /** @deprecated Use thresholds array. Kept for backward compatibility with saved configs. */
  colorThreshHigh?: string;
  /** @deprecated Use thresholds array. */
  colorThreshMid?: string;
  /** @deprecated Use thresholds array. */
  colorThreshLow?: string;
  /** @deprecated Use thresholds array. */
  colorHigh?: string;
  /** @deprecated Use thresholds array. */
  colorMid?: string;
  /** @deprecated Use thresholds array. */
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

/** Config preset: HA monitor (default) or standalone prayer times display. */
export type ConfigPreset = 'ha_monitor' | 'prayer_times';

/** School of jurisprudence for prayer time calculation. */
export type PrayerSchool = 'hanafi' | 'shafi';

/** Prayer times preset configuration (prayertimes.dev API). */
export interface PrayerTimesConfig {
  /** City name for the API (e.g. 'London'). */
  city: string;
  /** Optional latitude override (used instead of city when both lat+lng set). */
  lat?: string;
  /** Optional longitude override. */
  lng?: string;
  /** School of jurisprudence. */
  school: PrayerSchool;
  /** How often to re-fetch prayer times, in minutes. */
  refreshMinutes: number;
  /** If true, flash RGB LED when a prayer time is reached (CYD onboard: GPIO 4, 16, 17). */
  prayerLedEnabled?: boolean;
  /** @deprecated Use prayerLedR/G/B. Kept for migration. */
  prayerLedPin?: string;
  /** Red channel GPIO (CYD onboard: 4). */
  prayerLedR?: string;
  /** Green channel GPIO (CYD onboard: 16). */
  prayerLedG?: string;
  /** Blue channel GPIO (CYD onboard: 17). */
  prayerLedB?: string;
}

/** Board/variant: SPI touch (XPT2046), I2C touch (CST816), or custom pins. */
export type DeviceVariant = 'spi_touch' | 'i2c_touch' | 'custom';

/** All GPIO pin mappings for display, touch, and I2C (when used). */
export interface DevicePins {
  backlightPin: string;
  tftClk: string;
  tftMosi: string;
  tftMiso: string;
  tftCs: string;
  tftDc: string;
  /** SPI touch (XPT2046) pins; set when variant is spi_touch or custom with SPI touch. */
  touchSpiClk?: string;
  touchSpiMosi?: string;
  touchSpiMiso?: string;
  touchSpiCs?: string;
  /** I2C + CST816 pins; set when variant is i2c_touch or custom with I2C touch. */
  i2cSda?: string;
  i2cScl?: string;
  touchReset?: string;
}

export interface ConfigData {
  deviceName: string;
  friendlyName: string;
  hideClock?: boolean;
  /** Corner radius for sensor buttons (px). 0 = square corners. Max useful value is 34. */
  buttonRadius?: number;
  /** @deprecated Use devicePins.backlightPin. Kept for migration. */
  backlightPin?: string;
  /** Icon set: Material Design Icons (legacy) or Material Symbols (Google Fonts). */
  iconSet?: IconSet;
  /** Board variant; when set, devicePins should match preset or user customisation. */
  deviceVariant?: DeviceVariant;
  /** Full pin map; used for YAML and for custom variant. */
  devicePins?: DevicePins;
  sensors: SensorConfig[];
  /** Active preset; undefined or 'ha_monitor' = default HA monitor. */
  preset?: ConfigPreset;
  /** Prayer times settings; used when preset is 'prayer_times'. */
  prayerTimes?: PrayerTimesConfig;
}
