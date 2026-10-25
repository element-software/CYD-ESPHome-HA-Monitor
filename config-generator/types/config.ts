/** Base fields shared by all sensor configs */
export interface BaseSensorConfig {
  id: string;
  entity: string;
  label: string;
  /** When false the slot is omitted from generated YAML and preview. Default true. */
  enabled?: boolean;
  /** ScreenConfig.id to open on tap (e.g. "s2"). Generated LVGL page id is page_${targetScreen}. */
  targetScreen?: string;
}

export interface LightSensorConfig extends BaseSensorConfig {
  type: "light";
  stateOn?: string;
  stateOff?: string;
  iconOn?: string;
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
  /** Play the beep script when this entity turns ON. Requires enableAudio. */
  beepOnAlert?: boolean;
}

export interface SwitchSensorConfig extends BaseSensorConfig {
  type: "switch";
  stateOn?: string;
  stateOff?: string;
  iconOn?: string;
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
  /** Play the beep script when this entity turns ON. Requires enableAudio. */
  beepOnAlert?: boolean;
}

export interface InputBooleanSensorConfig extends BaseSensorConfig {
  type: "input_boolean";
  stateOn?: string;
  stateOff?: string;
  iconOn?: string;
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
  /** Play the beep script when this entity turns ON. Requires enableAudio. */
  beepOnAlert?: boolean;
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
  /** Play the beep script when this entity turns ON. Requires enableAudio. */
  beepOnAlert?: boolean;
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

/** Static text tile; no Home Assistant subscription. Click navigates via targetScreen. */
export interface LabelSensorConfig extends Omit<BaseSensorConfig, "entity"> {
  type: "label";
  entity?: string;
  icon?: string;
  iconColor?: string;
  valueText?: string;
}

/** Discriminated union of all sensor config types */
export type SensorConfig =
  | NumericSensorConfig
  | TextSensorConfig
  | BinarySensorConfig
  | LightSensorConfig
  | SwitchSensorConfig
  | InputBooleanSensorConfig
  | ActionSensorConfig
  | LabelSensorConfig;

/** Keys that can be updated on any sensor (union of keys from all config types) */
export type SensorConfigKey =
  | keyof NumericSensorConfig
  | keyof TextSensorConfig
  | keyof BinarySensorConfig
  | keyof LightSensorConfig
  | keyof SwitchSensorConfig
  | keyof InputBooleanSensorConfig
  | keyof ActionSensorConfig
  | keyof LabelSensorConfig;

/** Icon font used in the UI and in generated ESPHome YAML. */
export type IconSet = 'material_design_icons' | 'material_symbols';

/** Dashboard orientation. Independent of displaySwapXy (a panel-variant knob). */
export type DisplayOrientation = 'portrait' | 'landscape';

/** Omitted / unknown values are portrait so old localStorage configs keep working. */
export function getDisplayOrientation(
  config: { orientation?: DisplayOrientation } | undefined,
): DisplayOrientation {
  return config?.orientation === 'landscape' ? 'landscape' : 'portrait';
}

/** Board/variant: SPI touch (XPT2046), I2C touch (CST816), or custom pins. */
export type DeviceVariant = 'spi_touch' | 'i2c_touch' | 'custom';

/** Optional audio hardware: I2S DAC on the CYD connector, or an RTTTL piezo buzzer. */
export type AudioHardware = 'i2s' | 'rtttl';

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
  /**
   * Dashboard orientation. Default `'portrait'` for old saved configs.
   * Landscape rewrites LVGL layout math (320×240) — it is not `display.rotation`
   * and must not be overloaded onto displaySwapXy (that stays a panel-variant knob).
   */
  orientation?: DisplayOrientation;
  /** ScreenConfig.id to open when the clock is tapped (e.g. "s2"). */
  clockTargetScreen?: string;
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
  /**
   * Opt-in speaker/buzzer support. Default false / omitted so existing flashes stay unchanged.
   */
  enableAudio?: boolean;
  /** Audio hardware when enableAudio is true. Default 'i2s'. */
  audioHardware?: AudioHardware;
  /** I2S data-out pin. Default GPIO26 (CYD audio connector). */
  audioDoutPin?: string;
  /** I2S bit clock. Default GPIO17 (unused RGB LED pin). I2S only. */
  audioBclkPin?: string;
  /** I2S LRCLK / word select. Default GPIO16 (unused RGB LED pin). I2S only. */
  audioLrclkPin?: string;
  /** Piezo / LEDC pin for RTTTL buzzer mode. Default GPIO26. */
  audioRtttlPin?: string;
  /** Screen 1 sensors. Kept in sync with screens[0].sensors for older saved configs. */
  sensors: SensorConfig[];
  screens?: ScreenConfig[];
}
