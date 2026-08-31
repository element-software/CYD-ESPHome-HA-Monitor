'use client';

import { useState, useEffect } from 'react';

/** ESPHome font sizes: clock 48, date 20. Scale in cqmin to match device preview. */
const ESPHOME = { clock: 48, date: 20 } as const;
const CLOCK_CQMIN = 16;
const FONT = {
  clock: `${CLOCK_CQMIN}cqmin`,
  date: `${((CLOCK_CQMIN * ESPHOME.date) / ESPHOME.clock).toFixed(2)}cqmin`,
};
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

export default function CydClock({ fontColor = TEXT_COLOR }: { fontColor?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const { time, date } = getClockTexts(now);

  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center pt-[3cqmin] pb-[2.5cqmin]"
      style={{ paddingLeft: '2cqmin', paddingRight: '2cqmin' }}
    >
      <div
        className="font-bold tracking-tight"
        style={{ color: fontColor, fontSize: FONT.clock }}
      >
        {time}
      </div>
      <div
        className="font-normal -mt-3"
        style={{ color: fontColor, fontSize: FONT.date, opacity: 0.95 }}
      >
        {date}
      </div>
    </div>
  );
}
