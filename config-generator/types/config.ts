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
  // For binary sensors
  stateOn?: string;
  stateOff?: string;
  colorOn?: string;
  colorOff?: string;
}

export interface ConfigData {
  deviceName: string;
  friendlyName: string;
  sensors: SensorConfig[];
}
