import { getClockTexts } from '../CydClock';

describe('getClockTexts', () => {
  it('returns a stable placeholder when no date is provided so SSR and hydration match', () => {
    expect(getClockTexts(null)).toEqual({ time: '--:--', date: '-- --/--' });
  });

  it('formats local time as HH:mm and date as weekday DD/MM', () => {
    const now = new Date(2026, 7, 31, 9, 5, 9);
    expect(getClockTexts(now)).toEqual({ time: '09:05', date: 'Mon 31/08' });
  });
});
