import type { IconSet } from '@/types/config';

/**
 * CSS class for the icon font in the UI (material-icons vs material-symbols).
 */
export function getIconFontClass(iconSet: IconSet | undefined): string {
  return iconSet === 'material_symbols' ? 'material-symbols' : 'material-icons';
}

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
 * Convert stored icon code to YAML-style hex escape (e.g. \ueffc).
 * Use this when writing icon codes into generated YAML so the output is \uXXXX.
 */
export function iconCodeToHexEscape(code: string): string {
  const hex = iconCodeToHex(code);
  if (!hex) return code || '';
  return '\\u' + hex;
}

/**
 * Map icon codepoint (hex) to Material Icons ligature name for reliable rendering.
 * Uses Google's Material Icons names so the font's ligature feature displays the correct glyph.
 */
const ICON_HEX_TO_NAME: Record<string, string> = {
  // Energy & Power
  ea0b: 'bolt',
  e3e7: 'flash_on',
  e63c: 'power',
  ec1c: 'electric_bolt',
  ec1b: 'electric_meter',
  e56d: 'ev_station',
  e1a3: 'battery_charging_full',
  e1a4: 'battery_full',
  e19c: 'battery_alert',
  f7d3: 'solar_power',
  e8ac: 'power_settings_new',
  // Doors & Windows
  effc: 'door_back',
  effd: 'door_front',
  f1f6: 'fence',
  f011: 'garage',
  e286: 'blinds',
  f0d6: 'sensor_door',
  f0d8: 'sensor_window',
  f17b: 'window',
  e7f5: 'meeting_room',
  // Climate & Weather
  e1ff: 'device_thermostat',
  efd8: 'air',
  eb3b: 'ac_unit',
  e430: 'wb_sunny',
  e42d: 'wb_cloudy',
  f070: 'thermostat',
  e818: 'cloud',
  e2cd: 'grain',
  e810: 'thunderstorm',
  e169: 'snowing',
  // Lights
  e0f0: 'lightbulb',
  e90f: 'lightbulb_outline',
  e3a9: 'brightness_4',
  e3a7: 'brightness_high',
  e3a8: 'brightness_low',
  e3ab: 'brightness_medium',
  f00d: 'light_mode',
  f00e: 'dark_mode',
  ea61: 'fluorescent',
  ea62: 'tungsten',
  // Water & Humidity
  e798: 'water_drop',
  eb3e: 'opacity',
  e3f8: 'leak_add',
  f084: 'shower',
  eb46: 'hot_tub',
  // Security & Safety
  e897: 'lock',
  e898: 'lock_open',
  e32a: 'security',
  e855: 'alarm',
  e003: 'add_alert',
  e7f4: 'notifications',
  e3b0: 'camera_alt',
  ef56: 'shield',
  e8d0: 'visibility',
  e8d1: 'visibility_off',
  f050: 'emergency',
  e3f7: 'motion_photos_on',
  // People & Presence
  e7fd: 'person',
  e7ef: 'group',
  e536: 'directions_walk',
  e559: 'directions_car',
  f0d4: 'sensor_occupied',
  e53a: 'hotel',
  e91d: 'pets',
  e56a: 'child_friendly',
  ec10: 'sensor_occupied',
  // Appliances
  eb47: 'kitchen',
  f07e: 'local_laundry_service',
  f204: 'microwave',
  efef: 'coffee',
  f1b5: 'oven_gen',
  e3f4: 'image',
  ea43: 'fireplace',
  e307: 'cast',
  // Media & Sound
  e639: 'live_tv',
  e050: 'speaker',
  e405: 'music_note',
  e04d: 'volume_up',
  e04e: 'volume_off',
  e63a: 'radio',
  // Connectivity
  e63e: 'wifi',
  e1a8: 'bluetooth',
  e328: 'router',
  e1bc: 'signal_cellular_alt',
  e1e0: 'network_check',
  // Rooms & Home
  e88a: 'home',
  efe2: 'bedroom_parent',
  ea44: 'living',
  f1b1: 'bathroom',
  f1b0: 'dining',
  e587: 'weekend',
  ef4c: 'chair',
  e53b: 'child_care',
  // Nature & Outdoor
  ea35: 'eco',
  ea48: 'grass',
  ea63: 'park',
  e54e: 'pool',
  e52f: 'spa',
  ef55: 'local_fire_department',
  // Controls & Status
  e5ca: 'check',
  e5cd: 'close',
  e8b8: 'settings',
  e425: 'speed',
  e8b5: 'schedule',
  e88e: 'info',
  e002: 'error',
  e001: 'warning',
  e86c: 'check_circle',
  // Misc
  e0b0: 'call',
  e0be: 'email',
  ef4e: 'handyman',
  e8b6: 'science',
  e56c: 'explore',
  e322: 'gps_fixed',
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
  // Energy & Power
  { name: 'Bolt', code: '\\uea0b', ligature: 'bolt', category: 'Energy' },
  { name: 'Flash', code: '\\ue3e7', ligature: 'flash_on', category: 'Energy' },
  { name: 'Power', code: '\\ue63c', ligature: 'power', category: 'Energy' },
  { name: 'Electric Bolt', code: '\\uec1c', ligature: 'electric_bolt', category: 'Energy' },
  { name: 'Electric Meter', code: '\\uec1b', ligature: 'electric_meter', category: 'Energy' },
  { name: 'EV Station', code: '\\ue56d', ligature: 'ev_station', category: 'Energy' },
  { name: 'Battery', code: '\\ue1a3', ligature: 'battery_charging_full', category: 'Energy' },
  { name: 'Battery Full', code: '\\ue1a4', ligature: 'battery_full', category: 'Energy' },
  { name: 'Battery Alert', code: '\\ue19c', ligature: 'battery_alert', category: 'Energy' },
  { name: 'Solar Power', code: '\\uf7d3', ligature: 'solar_power', category: 'Energy' },
  { name: 'Power Switch', code: '\\ue8ac', ligature: 'power_settings_new', category: 'Energy' },
  // Doors & Windows
  { name: 'Door Back', code: '\\ueffc', ligature: 'door_back', category: 'Doors' },
  { name: 'Door Front', code: '\\ueffd', ligature: 'door_front', category: 'Doors' },
  { name: 'Gate/Fence', code: '\\uf1f6', ligature: 'fence', category: 'Doors' },
  { name: 'Garage', code: '\\uf011', ligature: 'garage', category: 'Doors' },
  { name: 'Blinds', code: '\\ue286', ligature: 'blinds', category: 'Doors' },
  { name: 'Door Sensor', code: '\\uf0d6', ligature: 'sensor_door', category: 'Doors' },
  { name: 'Window Sensor', code: '\\uf0d8', ligature: 'sensor_window', category: 'Doors' },
  { name: 'Window', code: '\\uf17b', ligature: 'window', category: 'Doors' },
  { name: 'Meeting Room', code: '\\ue7f5', ligature: 'meeting_room', category: 'Doors' },
  // Climate & Weather
  { name: 'Thermostat', code: '\\ue1ff', ligature: 'device_thermostat', category: 'Climate' },
  { name: 'Air/Fan', code: '\\uefd8', ligature: 'air', category: 'Climate' },
  { name: 'AC Unit', code: '\\ueb3b', ligature: 'ac_unit', category: 'Climate' },
  { name: 'Sunny', code: '\\ue430', ligature: 'wb_sunny', category: 'Climate' },
  { name: 'Cloudy', code: '\\ue42d', ligature: 'wb_cloudy', category: 'Climate' },
  { name: 'Thermostat Auto', code: '\\uf070', ligature: 'thermostat', category: 'Climate' },
  { name: 'Cloud', code: '\\ue818', ligature: 'cloud', category: 'Climate' },
  { name: 'Rain', code: '\\ue2cd', ligature: 'grain', category: 'Climate' },
  { name: 'Storm', code: '\\ue810', ligature: 'thunderstorm', category: 'Climate' },
  { name: 'Snow', code: '\\ue169', ligature: 'snowing', category: 'Climate' },
  // Lights
  { name: 'Lightbulb', code: '\\ue0f0', ligature: 'lightbulb', category: 'Lights' },
  { name: 'Lightbulb Outline', code: '\\ue90f', ligature: 'lightbulb_outline', category: 'Lights' },
  { name: 'Brightness', code: '\\ue3a9', ligature: 'brightness_4', category: 'Lights' },
  { name: 'Brightness High', code: '\\ue3a7', ligature: 'brightness_high', category: 'Lights' },
  { name: 'Brightness Low', code: '\\ue3a8', ligature: 'brightness_low', category: 'Lights' },
  { name: 'Light Mode', code: '\\uf00d', ligature: 'light_mode', category: 'Lights' },
  { name: 'Dark Mode', code: '\\uf00e', ligature: 'dark_mode', category: 'Lights' },
  { name: 'Fluorescent', code: '\\uea61', ligature: 'fluorescent', category: 'Lights' },
  { name: 'Tungsten', code: '\\uea62', ligature: 'tungsten', category: 'Lights' },
  // Water & Humidity
  { name: 'Water Drop', code: '\\ue798', ligature: 'water_drop', category: 'Water' },
  { name: 'Humidity', code: '\\ueb3e', ligature: 'opacity', category: 'Water' },
  { name: 'Leak', code: '\\ue3f8', ligature: 'leak_add', category: 'Water' },
  { name: 'Shower', code: '\\uf084', ligature: 'shower', category: 'Water' },
  { name: 'Hot Tub', code: '\\ueb46', ligature: 'hot_tub', category: 'Water' },
  // Security & Safety
  { name: 'Lock', code: '\\ue897', ligature: 'lock', category: 'Security' },
  { name: 'Lock Open', code: '\\ue898', ligature: 'lock_open', category: 'Security' },
  { name: 'Security', code: '\\ue32a', ligature: 'security', category: 'Security' },
  { name: 'Alarm', code: '\\ue855', ligature: 'alarm', category: 'Security' },
  { name: 'Alert', code: '\\ue003', ligature: 'add_alert', category: 'Security' },
  { name: 'Notification', code: '\\ue7f4', ligature: 'notifications', category: 'Security' },
  { name: 'Camera', code: '\\ue3b0', ligature: 'camera_alt', category: 'Security' },
  { name: 'Shield', code: '\\uef56', ligature: 'shield', category: 'Security' },
  { name: 'Visible', code: '\\ue8d0', ligature: 'visibility', category: 'Security' },
  { name: 'Hidden', code: '\\ue8d1', ligature: 'visibility_off', category: 'Security' },
  { name: 'Emergency', code: '\\uf050', ligature: 'emergency', category: 'Security' },
  { name: 'Motion', code: '\\ue3f7', ligature: 'motion_photos_on', category: 'Security' },
  { name: 'Motion Occupied', code: '\\uec10', ligature: 'sensor_occupied', category: 'Security' },
  // People & Presence
  { name: 'Person', code: '\\ue7fd', ligature: 'person', category: 'People' },
  { name: 'Group', code: '\\ue7ef', ligature: 'group', category: 'People' },
  { name: 'Walking', code: '\\ue536', ligature: 'directions_walk', category: 'People' },
  { name: 'Car', code: '\\ue559', ligature: 'directions_car', category: 'People' },
  { name: 'Occupied', code: '\\uf0d4', ligature: 'sensor_occupied', category: 'People' },
  { name: 'Bed', code: '\\ue53a', ligature: 'hotel', category: 'People' },
  { name: 'Pets', code: '\\ue91d', ligature: 'pets', category: 'People' },
  { name: 'Child', code: '\\ue56a', ligature: 'child_friendly', category: 'People' },
  // Appliances & Media
  { name: 'Kitchen', code: '\\ueb47', ligature: 'kitchen', category: 'Appliances' },
  { name: 'Laundry', code: '\\uf07e', ligature: 'local_laundry_service', category: 'Appliances' },
  { name: 'Microwave', code: '\\uf204', ligature: 'microwave', category: 'Appliances' },
  { name: 'Coffee', code: '\\uefef', ligature: 'coffee', category: 'Appliances' },
  { name: 'Fireplace', code: '\\uea43', ligature: 'fireplace', category: 'Appliances' },
  { name: 'Chromecast', code: '\\ue307', ligature: 'cast', category: 'Appliances' },
  { name: 'TV', code: '\\ue639', ligature: 'live_tv', category: 'Appliances' },
  { name: 'Speaker', code: '\\ue050', ligature: 'speaker', category: 'Appliances' },
  { name: 'Music', code: '\\ue405', ligature: 'music_note', category: 'Appliances' },
  { name: 'Volume', code: '\\ue04d', ligature: 'volume_up', category: 'Appliances' },
  { name: 'Muted', code: '\\ue04e', ligature: 'volume_off', category: 'Appliances' },
  { name: 'Radio', code: '\\ue63a', ligature: 'radio', category: 'Appliances' },
  // Connectivity
  { name: 'WiFi', code: '\\ue63e', ligature: 'wifi', category: 'Network' },
  { name: 'Bluetooth', code: '\\ue1a8', ligature: 'bluetooth', category: 'Network' },
  { name: 'Router', code: '\\ue328', ligature: 'router', category: 'Network' },
  { name: 'Signal', code: '\\ue1bc', ligature: 'signal_cellular_alt', category: 'Network' },
  { name: 'Network', code: '\\ue1e0', ligature: 'network_check', category: 'Network' },
  // Rooms & Home
  { name: 'Home', code: '\\ue88a', ligature: 'home', category: 'Rooms' },
  { name: 'Bedroom', code: '\\uefe2', ligature: 'bedroom_parent', category: 'Rooms' },
  { name: 'Living Room', code: '\\uea44', ligature: 'living', category: 'Rooms' },
  { name: 'Bathroom', code: '\\uf1b1', ligature: 'bathroom', category: 'Rooms' },
  { name: 'Dining', code: '\\uf1b0', ligature: 'dining', category: 'Rooms' },
  { name: 'Sofa', code: '\\ue587', ligature: 'weekend', category: 'Rooms' },
  { name: 'Chair', code: '\\uef4c', ligature: 'chair', category: 'Rooms' },
  { name: 'Nursery', code: '\\ue53b', ligature: 'child_care', category: 'Rooms' },
  // Nature & Outdoor
  { name: 'Eco', code: '\\uea35', ligature: 'eco', category: 'Outdoor' },
  { name: 'Grass', code: '\\uea48', ligature: 'grass', category: 'Outdoor' },
  { name: 'Park', code: '\\uea63', ligature: 'park', category: 'Outdoor' },
  { name: 'Pool', code: '\\ue54e', ligature: 'pool', category: 'Outdoor' },
  { name: 'Spa', code: '\\ue52f', ligature: 'spa', category: 'Outdoor' },
  { name: 'Fire', code: '\\uef55', ligature: 'local_fire_department', category: 'Outdoor' },
  // Status & Controls
  { name: 'Check', code: '\\ue5ca', ligature: 'check', category: 'Status' },
  { name: 'Close', code: '\\ue5cd', ligature: 'close', category: 'Status' },
  { name: 'Settings', code: '\\ue8b8', ligature: 'settings', category: 'Status' },
  { name: 'Speed', code: '\\ue425', ligature: 'speed', category: 'Status' },
  { name: 'Schedule', code: '\\ue8b5', ligature: 'schedule', category: 'Status' },
  { name: 'Info', code: '\\ue88e', ligature: 'info', category: 'Status' },
  { name: 'Error', code: '\\ue002', ligature: 'error', category: 'Status' },
  { name: 'Warning', code: '\\ue001', ligature: 'warning', category: 'Status' },
  { name: 'Success', code: '\\ue86c', ligature: 'check_circle', category: 'Status' },
  // Misc
  { name: 'Phone', code: '\\ue0b0', ligature: 'call', category: 'Misc' },
  { name: 'Email', code: '\\ue0be', ligature: 'email', category: 'Misc' },
  { name: 'Tools', code: '\\uef4e', ligature: 'handyman', category: 'Misc' },
  { name: 'Science', code: '\\ue8b6', ligature: 'science', category: 'Misc' },
  { name: 'Compass', code: '\\ue56c', ligature: 'explore', category: 'Misc' },
  { name: 'GPS', code: '\\ue322', ligature: 'gps_fixed', category: 'Misc' },
];
