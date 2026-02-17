/**
 * Normalize stored icon code to hex string (e.g. '\\uea0b' or character -> 'ea0b').
 */
function iconCodeToHex(code: string): string {
  if (!code) return '';
  const hex = code.replace(/^\\u/i, '').trim();
  if (hex && /^[0-9a-f]+$/i.test(hex)) return hex.toLowerCase();
  if (code.length === 1) return code.codePointAt(0)!.toString(16).toLowerCase();
  return '';
}

/**
 * Convert stored icon code to the Unicode character for Material Icons font (codepoint).
 */
export function iconCodeToChar(code: string): string {
  const hex = iconCodeToHex(code);
  if (!hex) return code || '';
  const codepoint = parseInt(hex, 16);
  if (Number.isNaN(codepoint)) return code;
  return String.fromCodePoint(codepoint);
}

/**
 * Map icon codepoint (hex) to Material Icons ligature name for reliable rendering.
 * Uses Google's Material Icons names so the font's ligature feature displays the correct glyph.
 */
const ICON_HEX_TO_NAME: Record<string, string> = {
  ea0b: 'bolt',
  e3e7: 'flash_on',
  effc: 'door_back',
  effd: 'door_front',
  e1ff: 'device_thermostat',
  e559: 'directions_car',
  f1f6: 'fence',
  e7fd: 'person',
  e88a: 'home',
  e0f0: 'lightbulb',
  e3a9: 'brightness_4',
  efd8: 'air',
  e798: 'water_drop',
  e897: 'lock',
  e898: 'lock_open',
  e7f4: 'notifications',
  e003: 'add_alert',
  e5ca: 'check',
  eb3e: 'water_drop',
  e1a3: 'battery_charging_full',
  e430: 'wb_sunny',
  e63c: 'power',
};

/**
 * Get Material Icons ligature name for a stored icon code (for use in class="material-icons").
 * Falls back to the Unicode character if no name mapping exists.
 */
export function iconCodeToLigature(code: string): string {
  const hex = iconCodeToHex(code);
  if (hex && ICON_HEX_TO_NAME[hex]) return ICON_HEX_TO_NAME[hex];
  return iconCodeToChar(code);
}

/** Find commonIcons entry that matches the given code (by hex so different formats match). */
export function findIconByCode(code: string): (typeof commonIcons)[number] | undefined {
  const hex = iconCodeToHex(code);
  if (!hex) return undefined;
  return commonIcons.find((icon) => iconCodeToHex(icon.code) === hex);
}

export const commonIcons = [
  { name: 'Flash/Power', code: '\\uea0b', ligature: 'bolt' },
  { name: 'Door', code: '\\ueffc', ligature: 'door_back' },
  { name: 'Thermostat', code: '\\ue1ff', ligature: 'device_thermostat' },
  { name: 'Fence/Gate', code: '\\ue559', ligature: 'directions_car' },
  { name: 'Person Walking', code: '\\ue7fd', ligature: 'person' },
  { name: 'Home', code: '\\ue88a', ligature: 'home' },
  { name: 'Lightbulb', code: '\\ue0f0', ligature: 'lightbulb' },
  { name: 'Brightness', code: '\\ue3a9', ligature: 'brightness_4' },
  { name: 'Air/Fan', code: '\\uefd8', ligature: 'air' },
  { name: 'Water Drop', code: '\\ue798', ligature: 'water_drop' },
  { name: 'Lock', code: '\\ue897', ligature: 'lock' },
  { name: 'Lock Open', code: '\\ue898', ligature: 'lock_open' },
  { name: 'Notifications', code: '\\ue7f4', ligature: 'notifications' },
  { name: 'Warning', code: '\\ue003', ligature: 'add_alert' },
  { name: 'Check', code: '\\ue5ca', ligature: 'check' },
  { name: 'Humidity', code: '\\ueb3e', ligature: 'water_drop' },
  { name: 'Battery', code: '\\ue1a3', ligature: 'battery_charging_full' },
  { name: 'Solar', code: '\\ue430', ligature: 'wb_sunny' },
  { name: 'Energy', code: '\\ue63c', ligature: 'power' },
];
