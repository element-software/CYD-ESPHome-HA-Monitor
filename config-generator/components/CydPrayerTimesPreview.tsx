'use client';

import { useState, useEffect } from 'react';
import type { ConfigData } from '@/types/config';

/** ESPHome font sizes for the prayer times display. Scale in cqmin. */
const ESPHOME_CLOCK = 48;
const CLOCK_CQMIN = 16;
/** 1 cqmin ≈ 3 ESPHome device pixels (240px-wide display). */
const scale = (px: number) =>
  `${((CLOCK_CQMIN * px) / ESPHOME_CLOCK).toFixed(2)}cqmin`;

const FONT = {
  clock: scale(48),
  ampm: scale(20),
  label: scale(14),
  date: scale(16),
  countdown: scale(30),
  countdownSub: scale(11),
  prayer: scale(22),
} as const;

/** Static preview data — matches the screen produced by the generated YAML. */
const PREVIEW = {
  nextPrayer: 'Asr',
  nextPrayerTime: '3:15 PM',
  minutesRemaining: 30,
  totalMinutes: 60,
} as const;

function formatTime(date: Date): { time: string; ampm: string } {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return { time: `${hour}:${m}`, ampm };
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Circular countdown ring — gold arc, minutes inside, "Next prayer" below. */
function CountdownRing({
  minutes,
  total,
}: {
  minutes: number;
  total: number;
}) {
  const r = 30;
  const cx = 38;
  const cy = 38;
  const viewSize = 76;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(1, Math.max(0, minutes / total));
  const dashoffset = circumference * (1 - progress);

  return (
    <div
      style={{
        width: '28cqmin',
        height: '28cqmin',
      }}
    >
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        width="100%"
        height="100%"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="rgba(0,0,0,0.55)"
          stroke="#3a3a2a"
          strokeWidth="5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#C8A030"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy - 3}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontWeight="bold"
          fontSize="22"
          fontFamily="sans-serif"
        >
          {minutes}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize="8"
          fontFamily="sans-serif"
        >
          Next
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize="8"
          fontFamily="sans-serif"
        >
          prayer
        </text>
      </svg>
    </div>
  );
}

/** Inner screen content: clock, date, countdown ring, next prayer. Matches the generated YAML layout. */
function PrayerTimesScreenContent() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { time, ampm } = formatTime(now);
  const dateStr = formatDate(now);
  const { nextPrayer, nextPrayerTime, minutesRemaining, totalMinutes } = PREVIEW;

  return (
    <div
      className="flex flex-col items-center justify-between h-full w-full overflow-hidden"
      style={{ backgroundColor: '#0c0c0c' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(30,60,30,0.35) 0%, rgba(0,0,0,0) 70%)',
        }}
        aria-hidden
      />

      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{ paddingTop: '4cqmin' }}
      >
        <div
          className="self-end font-normal text-white"
          style={{ fontSize: FONT.ampm, opacity: 0.7, paddingRight: '5cqmin' }}
        >
          {ampm}
        </div>
        <div
          className="font-bold text-white leading-none"
          style={{ fontSize: FONT.clock }}
        >
          {time}
        </div>
        <div
          className="font-normal text-white mt-[1cqmin]"
          style={{ fontSize: FONT.label, opacity: 0.6 }}
        >
          Gregorian
        </div>
        <div
          className="font-normal text-white"
          style={{ fontSize: FONT.date, opacity: 0.85 }}
        >
          {dateStr}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <CountdownRing minutes={minutesRemaining} total={totalMinutes} />
      </div>

      <div
        className="relative z-10 flex items-center justify-center w-full font-bold text-white"
        style={{ fontSize: FONT.prayer, paddingBottom: '5cqmin' }}
      >
        {nextPrayer}&nbsp;{nextPrayerTime}
      </div>
    </div>
  );
}

export interface CydPrayerTimesPreviewProps {
  /** When true, wrap the screen in the CYD device frame (e.g. for /prayertimes page). */
  showDeviceFrame?: boolean;
  /** Optional config when used in config generator; preview shows the same screen the generated YAML produces. */
  config?: ConfigData;
}

/**
 * Single prayer times preview component. Renders the screen that matches the
 * generated prayertimes YAML (clock, Gregorian date, countdown ring, next prayer).
 * Optionally wraps it in the CYD device frame for standalone use (e.g. /prayertimes page).
 */
export default function CydPrayerTimesPreview({
  showDeviceFrame = false,
  config: _config,
}: CydPrayerTimesPreviewProps) {
  const [imageError, setImageError] = useState(false);

  const screen = (
    <div
      style={{
        containerType: 'size',
        backgroundColor: '#0c0c0c',
        ...(showDeviceFrame
          ? {
              position: 'absolute' as const,
              zIndex: 1,
              borderRadius: '2px',
              overflow: 'hidden',
              top: '22%',
              right: '24%',
              bottom: '27%',
              left: '24%',
            }
          : { width: '100%', height: '100%' }),
      }}
      className={showDeviceFrame ? 'rounded-sm' : 'h-full w-full'}
      aria-label={showDeviceFrame ? 'Prayer times display preview' : undefined}
    >
      <PrayerTimesScreenContent />
    </div>
  );

  if (!showDeviceFrame) {
    return screen;
  }

  return (
    <div className="relative w-full min-w-0 max-w-xs mx-auto">
      <div className="relative aspect-3/4 w-full overflow-hidden">
        {screen}
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/cyd-device.png"
            alt="CYD device frame"
            className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none -rotate-90"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 z-[2] rounded-lg border-4 border-amber-400/60 bg-amber-50/50 pointer-events-none -rotate-90" />
        )}
      </div>
    </div>
  );
}
