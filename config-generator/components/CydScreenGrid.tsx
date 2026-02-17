'use client';

import { useState, useEffect } from 'react';
import { ConfigData, SensorConfig } from '@/types/config';
import { cydColorToCss } from '@/lib/colorUtils';
import { iconCodeToLigature } from '@/lib/icons';

/** Device-matching colors (dark blue/black bg, cyan labels, white values) */
const DEVICE = {
  bg: '#0f1419',
  label: '#7fdbda',
  value: '#ffffff',
} as const;

/** ESPHome font sizes: clock 48, date 20, icon 28, state 18, label 11. Scale in cqmin. */
const ESPHOME = { clock: 48, date: 20, icon: 28, state: 18, label: 11 } as const;
const CLOCK_CQMIN = 16
const FONT = {
  clock: `${CLOCK_CQMIN}cqmin`,
  date: `${(CLOCK_CQMIN * ESPHOME.date / ESPHOME.clock).toFixed(2)}cqmin`,
  icon: `${(CLOCK_CQMIN * ESPHOME.icon / ESPHOME.clock).toFixed(2)}cqmin`,
  state: `${(CLOCK_CQMIN * ESPHOME.state / ESPHOME.clock).toFixed(2)}cqmin`,
  label: `${(CLOCK_CQMIN * ESPHOME.label / ESPHOME.clock).toFixed(2)}cqmin`,
};

interface CydScreenGridProps {
  config: ConfigData;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = date.getDate();
  const m = date.getMonth() + 1;
  return `${days[date.getDay()]} ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}`;
}

function SensorCell({ sensor }: { sensor: SensorConfig }) {
  const iconCode =
    sensor.type === 'sensor'
      ? sensor.icon
      : (sensor.iconOff ?? sensor.iconOn ?? '');
  const iconColorRaw =
    sensor.type === 'sensor'
      ? sensor.iconColor
      : (sensor.colorOff ?? sensor.colorOn ?? '0x888888');
  const iconColor = cydColorToCss(iconColorRaw);

  const displayValue =
    sensor.type === 'binary'
      ? (sensor.stateOff ?? 'Closed')
      : sensor.format?.includes('°C')
        ? '27.0°C'
        : sensor.format?.includes('W')
          ? '8355W'
          : '—';

  return (
    <div
      className="flex items-center gap-[1.2cqmin] min-h-0 p-[1.8cqmin]"
    >
      {/* Material Icon (icon_font size 28) */}
      <span
        className="material-icons shrink-0 inline-flex items-center justify-center opacity-90"
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
        {/* Label (label_font size 11) */}
        <span
          className="truncate font-normal"
          style={{ color: DEVICE.label, fontSize: FONT.label }}
        >
          {sensor.label || '—'}
        </span>
        {/* State/value (state_font size 18) */}
        <span
          className="truncate font-bold"
          style={{ color: DEVICE.value, fontSize: FONT.state }}
        >
          {displayValue}
        </span>
      </div>
    </div>
  );
}

export default function CydScreenGrid({ config }: CydScreenGridProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ backgroundColor: DEVICE.bg }}
    >
      {/* Time (clock_font 48) and date (date_font 20) */}
      <div
        className="shrink-0 flex flex-col items-center justify-center pt-[3cqmin] pb-[2.5cqmin]"
        style={{ paddingLeft: '2cqmin', paddingRight: '2cqmin' }}
      >
        <div
          className="font-bold tracking-tight"
          style={{ color: DEVICE.value, fontSize: FONT.clock }}
        >
          {formatTime(now)}
        </div>
        <div
          className="font-normal -mt-3"
          style={{ color: DEVICE.value, fontSize: FONT.date, opacity: 0.95 }}
        >
          {formatDate(now)}
        </div>
      </div>

      {/* 3×2 status grid */}
      <div
        className="grid grid-cols-2 grid-rows-3 flex-1 min-h-0 w-full gap-[1.2cqmin]"
        style={{ padding: '2cqmin', paddingTop: '1cqmin' }}
      >
        {config.sensors.slice(0, 6).map((sensor) => (
          <SensorCell key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  );
}
