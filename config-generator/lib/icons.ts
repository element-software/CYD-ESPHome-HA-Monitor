/**
 * Convert stored icon code (e.g. '\\uea0b') to the Unicode character for Material Icons font.
 */
export function iconCodeToChar(code: string): string {
  if (!code) return '';
  const hex = code.replace(/^\\u/i, '').trim();
  if (!hex) return code;
  const codepoint = parseInt(hex, 16);
  if (Number.isNaN(codepoint)) return code;
  return String.fromCodePoint(codepoint);
}

export const commonIcons = [
  { name: '⚡ Flash/Power', code: '\\uea0b' },
  { name: '🚪 Door', code: '\\ueffc' },
  { name: '🌡️ Thermostat', code: '\\ue1ff' },
  { name: '🚧 Fence/Gate', code: '\\ue559' },
  { name: '🚶 Person Walking', code: '\\ue7fd' },
  { name: '🏠 Home', code: '\\ue88a' },
  { name: '💡 Lightbulb', code: '\\ue335' },
  { name: '🌙 Brightness', code: '\\ue3a9' },
  { name: '💨 Air/Fan', code: '\\ue40a' },
  { name: '💧 Water Drop', code: '\\ue798' },
  { name: '🔒 Lock', code: '\\ue897' },
  { name: '🔓 Lock Open', code: '\\ue898' },
  { name: '🔔 Notifications', code: '\\ue7f4' },
  { name: '⚠️ Warning', code: '\\ue002' },
  { name: '✓ Check', code: '\\ue5ca' },
  { name: '💧 Humidity', code: '\\ueb3e' },
  { name: '🔋 Battery', code: '\\ue1a3' },
  { name: '☀️ Solar', code: '\\ue430' },
  { name: '⚡ Energy', code: '\\ue63c' },
];
