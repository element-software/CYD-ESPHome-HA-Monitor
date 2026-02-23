'use client';

import { useState } from 'react';
import { ConfigData, IconSet, SensorConfig, NumericSensorConfig } from '@/types/config';
import { cydColorToCss } from '@/lib/colorUtils';
import { getIconFontClass, iconCodeToLigature } from '@/lib/icons';
import CydClock from './CydClock';

/** Device-matching colors (dark blue/black bg, cyan labels, white values) */
const DEVICE = {
  bg: '#0f1419',
  label: '#FFFFFF',
  value: '#ffffff',
} as const;

/** ESPHome font sizes: icon 28, state 18, label 11. Scale in cqmin. */
const ESPHOME = { clock: 48, icon: 28, state: 18, label: 11 } as const;
const CLOCK_CQMIN = 16;
const FONT = {
  icon: `${((CLOCK_CQMIN * ESPHOME.icon) / ESPHOME.clock).toFixed(2)}cqmin`,
  state: `${((CLOCK_CQMIN * ESPHOME.state) / ESPHOME.clock).toFixed(2)}cqmin`,
  label: `${((CLOCK_CQMIN * ESPHOME.label) / ESPHOME.clock).toFixed(2)}cqmin`,
};

interface CydScreenGridProps {
  config: ConfigData;
}

/** Sample values per unit type for preview (format suffix hint). */
const SAMPLE_BY_SUFFIX: Record<string, number> = {
  'W': 8355,
  'kW': 2.5,
  'kWh': 12.4,
  '°C': 27.0,
  '°F': 78.0,
  '%': 65.5,
  '%%': 65.5,
  'A': 3.2,
  'V': 230,
  'bar': 1.0,
  'hPa': 1013,
  'Pa': 101325,
  'ppm': 420,
  'μg/m³': 12.5,
  'm³': 1.2,
  'L': 12.5,
  'lux': 350,
  'lx': 350,
  'dB': 42,
  'm/s': 2.5,
  'km/h': 5.2,
  'Hz': 50,
  'kg': 1.2,
  'g': 250,
  'mg': 500,
  'l/min': 8.5,
  'ml/min': 120,
};
const SAMPLE_DEFAULT = 12.34;

/** Get the numeric sample value used for preview from format (e.g. %.0fW → 8355). */
function getSampleValueFromFormat(format: string | undefined): number {
  if (!format?.trim()) return SAMPLE_DEFAULT;
  const m = format.match(/^%(\.\d)f(.*)$/);
  if (!m) return SAMPLE_DEFAULT;
  const suffix = m[2];
  return suffix in SAMPLE_BY_SUFFIX
    ? SAMPLE_BY_SUFFIX[suffix as keyof typeof SAMPLE_BY_SUFFIX]
    : SAMPLE_DEFAULT;
}

/** Format a sample value from a printf-style format (e.g. %.0fW, %.1f°C). */
function formatSampleFromFormat(format: string | undefined): string {
  if (!format?.trim()) return '—';
  const m = format.match(/^%(\.\d)f(.*)$/);
  if (!m) return format;
  const decimals = Math.min(3, parseInt(m[1].slice(1), 10) || 0);
  const sample = getSampleValueFromFormat(format);
  const numStr = decimals === 0 ? Math.round(sample).toString() : sample.toFixed(decimals);
  const suffix = m[2];
  const suffixDisplay = suffix === '%%' ? '%' : suffix;
  return numStr + suffixDisplay;
}

/** Return threshold-based color for a numeric sensor value (high > mid > low). */
function getThresholdColorForValue(sensor: NumericSensorConfig, value: number): string {
  const high = parseFloat(sensor.colorThreshHigh ?? '');
  const mid = parseFloat(sensor.colorThreshMid ?? '');
  const low = parseFloat(sensor.colorThreshLow ?? '');
  const fallback = sensor.iconColor ?? '0x32CD32';
  if (Number.isFinite(high) && value > high) return sensor.colorHigh ?? fallback;
  if (Number.isFinite(mid) && value > mid) return sensor.colorMid ?? fallback;
  if (Number.isFinite(low) && value > low) return sensor.colorLow ?? fallback;
  return sensor.colorLow ?? fallback;
}

function SensorCell({
  sensor,
  isOn,
  onToggle,
  iconSet,
}: {
  sensor: SensorConfig;
  isOn: boolean;
  onToggle?: () => void;
  iconSet?: IconSet;
}) {
  const canToggle = sensor.type === 'binary' || sensor.type === 'light' || sensor.type === 'switch';
  const isToggleableOn = (sensor.type === 'light' || sensor.type === 'switch') && isOn;

  const iconCode =
    sensor.type === 'sensor'
      ? sensor.icon
      : isOn
        ? (sensor.iconOn ?? sensor.iconOff ?? '')
        : (sensor.iconOff ?? sensor.iconOn ?? '');

  const iconColorRaw =
    sensor.type === 'sensor'
      ? getThresholdColorForValue(sensor, getSampleValueFromFormat(sensor.format))
      : isOn
        ? (sensor.colorOn ?? '0xFF0000')
        : (sensor.colorOff ?? '0x888888');
  const iconColor = isToggleableOn ? '#000000' : cydColorToCss(iconColorRaw);

  const displayValue =
    sensor.type === 'sensor'
      ? formatSampleFromFormat(sensor.format)
      : isOn
        ? (sensor.stateOn ?? 'On')
        : (sensor.type === 'binary' ? (sensor.stateOff ?? 'Closed') : (sensor.stateOff ?? 'Off'));

  const labelColor =
    sensor.type === 'light' || sensor.type === 'switch'
      ? isToggleableOn
        ? '#000000'
        : DEVICE.label
      : DEVICE.label;
  const valueColor =
    sensor.type === 'sensor'
      ? DEVICE.value
      : isToggleableOn
        ? '#000000'
        : sensor.type === 'binary'
          ? iconColor
          : DEVICE.value;

  return (
    <div
      className={`flex items-center gap-[1.2cqmin] min-h-0 p-[1.8cqmin] rounded-sm${canToggle ? ' cursor-pointer' : ''}`}
      style={{ backgroundColor: isToggleableOn ? '#FFA500' : 'transparent' }}
      onClick={canToggle ? onToggle : undefined}
    >
      <span
        className={`${getIconFontClass(iconSet)} shrink-0 inline-flex items-center justify-center opacity-90`}
        style={{
          color: iconColor,
          fontSize: FONT.icon,
          width: FONT.icon,
          height: FONT.icon,
        }}
        title={sensor.label || iconCode}
      >
        {iconCodeToLigature(iconCode)}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span
          className="truncate font-normal"
          style={{ color: labelColor, fontSize: FONT.label }}
        >
          {sensor.label || '—'}
        </span>
        <span
          className="truncate font-bold"
          style={{ color: valueColor, fontSize: FONT.state }}
        >
          {displayValue}
        </span>
      </div>
    </div>
  );
}

export default function CydScreenGrid({ config }: CydScreenGridProps) {
  const [toggledOn, setToggledOn] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) =>
    setToggledOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rows = config.hideClock ? 4 : 3;
  const visibleSensors = config.sensors.slice(0, rows * 2);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ backgroundColor: DEVICE.bg }}
    >
      {!config.hideClock && <CydClock />}

      <div
        className={`grid grid-cols-2 ${config.hideClock ? 'grid-rows-4' : 'grid-rows-3'} flex-1 min-h-0 w-full gap-[1.2cqmin]`}
        style={{ padding: '2cqmin', paddingTop: config.hideClock ? '2cqmin' : '1cqmin' }}
      >
        {visibleSensors.map((sensor) => (
          <SensorCell
            key={sensor.id}
            sensor={sensor}
            isOn={toggledOn.has(sensor.id)}
            onToggle={() => toggle(sensor.id)}
            iconSet={config.iconSet}
          />
        ))}
      </div>
    </div>
  );
}
