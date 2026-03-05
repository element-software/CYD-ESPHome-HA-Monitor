'use client';

import { ConfigData } from '@/types/config';

/** Matches the LVGL layout in prayerTimes.ts */
const PRAYERS = [
  { key: 'fajr', label: 'Fajr', time: '04:48', color: '#7B68EE', icon: 'dark_mode' },
  { key: 'sunrise', label: 'Sunrise', time: '06:42', color: '#FFA500', icon: 'sunny' },
  { key: 'zuhr', label: 'Zuhr', time: '12:21', color: '#FFD700', icon: 'light_mode' },
  { key: 'asr', label: 'Asr', time: '15:56', color: '#FFD700', icon: 'sunny' },
  { key: 'maghrib', label: 'Maghrib', time: '17:54', color: '#FF6347', icon: 'bedtime' },
  { key: 'isha', label: 'Isha', time: '19:45', color: '#7B68EE', icon: 'dark_mode' },
] as const;

interface CydPrayerTimesPreviewProps {
  config: ConfigData;
}

export default function CydPrayerTimesPreview({ config }: CydPrayerTimesPreviewProps) {
  const city = config.prayerTimes?.city ?? 'London';

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ backgroundColor: '#0f1419', containerType: 'size' }}
    >
      {/* Header: clock + date */}
      <div className="flex flex-col items-center pt-[2cqmin]">
        <span
          className="font-bold text-white"
          style={{ fontSize: '14cqmin', lineHeight: 1.1 }}
        >
          12:21
        </span>
        <span
          className="text-gray-400"
          style={{ fontSize: '6cqmin', lineHeight: 1.3 }}
        >
          Thu 05/03 &middot; {city}
        </span>
      </div>

      {/* Divider */}
      <div
        className="mx-[3cqmin] my-[1.5cqmin]"
        style={{ height: '1px', backgroundColor: '#334455' }}
      />

      {/* Prayer rows */}
      <div className="flex flex-col flex-1 min-h-0 px-[3cqmin]">
        {PRAYERS.map((p, i) => (
          <div
            key={p.key}
            className="flex items-center gap-[2cqmin] px-[2cqmin]"
            style={{
              flex: 1,
              minHeight: 0,
              backgroundColor: i % 2 === 1 ? '#1a2332' : 'transparent',
              borderRadius: '2px',
            }}
          >
            {/* Icon */}
            <span
              className="material-symbols shrink-0"
              style={{
                color: p.color,
                fontSize: '8cqmin',
                width: '8cqmin',
                textAlign: 'center',
              }}
            >
              {p.icon}
            </span>
            {/* Name */}
            <span
              className="flex-1 truncate"
              style={{
                color: '#DDDDDD',
                fontSize: '6.5cqmin',
                fontWeight: 500,
              }}
            >
              {p.label}
            </span>
            {/* Time */}
            <span
              className="font-bold tabular-nums"
              style={{
                color: '#FFFFFF',
                fontSize: '8cqmin',
              }}
            >
              {p.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
