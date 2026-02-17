/**
 * Convert CYD hex color (0xRRGGBB or 0xFFA500) to CSS hex (#RRGGBB).
 */
export function cydColorToCss(hex: string): string {
  const cleaned = hex.replace(/^0x/i, '').trim();
  if (cleaned.length === 6) {
    return `#${cleaned}`;
  }
  return '#888888';
}

/**
 * Convert CSS hex (#RRGGBB) to CYD format (0xRRGGBB).
 */
export function cssToCydColor(cssHex: string): string {
  const cleaned = cssHex.replace(/^#/, '').trim();
  if (cleaned.length === 6 && /^[0-9a-fA-F]+$/.test(cleaned)) {
    return `0x${cleaned.toUpperCase()}`;
  }
  return '0x888888';
}
