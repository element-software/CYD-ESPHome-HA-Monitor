/** Base fields shared by all sensor configs */
export interface BaseSensorConfig {
  id: string;
  entity: string;
  label: string;
  /** When false the slot is omitted from generated YAML and preview. Default true. */
  enabled?: boolean;
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

export interface InputBooleanSensorConfig extends BaseSensorConfig {
  type: "input_boolean";
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

export interface TextSensorConfig extends BaseSensorConfig {
  type: "text";
  icon: string;
  iconColor: string;
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

export type ActionKind =
  | "script.turn_on"
  | "automation.trigger"
  | "scene.turn_on"
  | "input_button.press";

/** Tap-to-run button; calls a Home Assistant action on click. */
export interface ActionSensorConfig extends BaseSensorConfig {
  type: "action";
  action: ActionKind;
  actionText?: string;
  icon: string;
  iconColor: string;
}

/** Discriminated union of all sensor config types */
export type SensorConfig =
  | NumericSensorConfig
  | TextSensorConfig
  | BinarySensorConfig
  | LightSensorConfig
  | SwitchSensorConfig
  | InputBooleanSensorConfig
  | ActionSensorConfig;

/** Keys that can be updated on any sensor (union of keys from all config types) */
export type SensorConfigKey =
  | keyof NumericSensorConfig
  | keyof TextSensorConfig
  | keyof BinarySensorConfig
  | keyof LightSensorConfig
  | keyof SwitchSensorConfig
  | keyof InputBooleanSensorConfig
  | keyof ActionSensorConfig;

/** Icon font used in the UI and in generated ESPHome YAML. */
export type IconSet = 'material_design_icons' | 'material_symbols';

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

export interface ScreenConfig {
  id: string;
  name: string;
  backgroundColor?: string;
  backgroundImage?: string;
  fontColor?: string;
  sensors: SensorConfig[];
}

export interface ConfigData {
  deviceName: string;
  friendlyName: string;
  hideClock?: boolean;
  /** Display transform swap_xy. Default true matches most CYD boards. Set false for alternate rotation variants. */
  displaySwapXy?: boolean;
  /** Invert display colours. Default false. */
  displayInvertColors?: boolean;
  /** Display colour order. Default RGB. */
  displayColorOrder?: 'RGB' | 'BGR';
  /** Display transform mirror_x. Default true matches stock CYD YAML. */
  displayMirrorX?: boolean;
  /** Display transform mirror_y. Default true matches stock CYD YAML. */
  displayMirrorY?: boolean;
  /** Emit ESPHome web_server v3. Default true. */
  enableWebServer?: boolean;
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
  /** Screen 1 sensors. Kept in sync with screens[0].sensors for older saved configs. */
  sensors: SensorConfig[];
  screens?: ScreenConfig[];
}
