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

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = date.getDate();
  const m = date.getMonth() + 1;
  return `${days[date.getDay()]} ${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}`;
}

export default function CydClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center pt-[3cqmin] pb-[2.5cqmin]"
      style={{ paddingLeft: '2cqmin', paddingRight: '2cqmin' }}
    >
      <div
        className="font-bold tracking-tight"
        style={{ color: TEXT_COLOR, fontSize: FONT.clock }}
      >
        {formatTime(now)}
      </div>
      <div
        className="font-normal -mt-3"
        style={{ color: TEXT_COLOR, fontSize: FONT.date, opacity: 0.95 }}
      >
        {formatDate(now)}
      </div>
    </div>
  );
}
