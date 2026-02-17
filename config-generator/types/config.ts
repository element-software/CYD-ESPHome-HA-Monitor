export interface SensorConfig {
  id: string;
  type: 'sensor' | 'binary';
  entity: string;
  label: string;
  icon: string;
  iconColor: string;
  // For numeric sensors
  format?: string;
  colorThreshHigh?: string;
  colorThreshMid?: string;
  colorThreshLow?: string;
  /** Colors for each threshold band (value above high = colorHigh, etc.) */
  colorHigh?: string;
  colorMid?: string;
  colorLow?: string;
  // For binary sensors
  stateOn?: string;
  stateOff?: string;
  /** Icon codepoint when state is ON (e.g. \\ue559). */
  iconOn?: string;
  /** Icon codepoint when state is OFF (e.g. \\ue558). */
  iconOff?: string;
  colorOn?: string;
  colorOff?: string;
  /** When true, display OFF icon/text/colors when entity is ON, and ON when entity is OFF. */
  invertState?: boolean;
}

export interface ConfigData {
  deviceName: string;
  friendlyName: string;
  sensors: SensorConfig[];
}
