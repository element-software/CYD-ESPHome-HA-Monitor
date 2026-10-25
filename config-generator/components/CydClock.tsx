'use client';

import { useState, useEffect } from 'react';

/** ESPHome font sizes. Landscape uses compact 32/16; portrait 48/20. Scale in cqmin. */
const PORTRAIT = { clock: 48, date: 20 } as const;
const LANDSCAPE = { clock: 32, date: 16 } as const;
const CLOCK_CQMIN = 16;

function clockFonts(compact: boolean) {
  const sizes = compact ? LANDSCAPE : PORTRAIT;
  return {
    clock: `${((CLOCK_CQMIN * sizes.clock) / PORTRAIT.clock).toFixed(2)}cqmin`,
    date: `${((CLOCK_CQMIN * sizes.date) / PORTRAIT.clock).toFixed(2)}cqmin`,
  };
}
const TEXT_COLOR = '#ffffff';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const PLACEHOLDER = { time: '--:--', date: '-- --/--' } as const;

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function formatTime(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatDate(date: Date) {
  return `${DAYS[date.getDay()]} ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

/** Null date yields a stable placeholder so static HTML and the first client render match. */
export function getClockTexts(now: Date | null): { time: string; date: string } {
  if (!now) return { ...PLACEHOLDER };
  return { time: formatTime(now), date: formatDate(now) };
}

export default function CydClock({
  fontColor = TEXT_COLOR,
  compact = false,
  onClick,
}: {
  fontColor?: string;
  compact?: boolean;
  onClick?: () => void;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const { time, date } = getClockTexts(now);
  const font = clockFonts(compact);

  return (
    <div
      className={[
        'shrink-0 flex flex-col items-center justify-center',
        compact ? 'pt-[1cqmin] pb-[0.5cqmin]' : 'pt-[3cqmin] pb-[2.5cqmin]',
        onClick ? 'cursor-pointer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ paddingLeft: '2cqmin', paddingRight: '2cqmin' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div
        className="font-bold tracking-tight"
        style={{ color: fontColor, fontSize: font.clock }}
      >
        {time}
      </div>
      <div
        className={`font-normal ${compact ? '-mt-1' : '-mt-3'}`}
        style={{ color: fontColor, fontSize: font.date, opacity: 0.95 }}
      >
        {date}
      </div>
    </div>
  );
}
