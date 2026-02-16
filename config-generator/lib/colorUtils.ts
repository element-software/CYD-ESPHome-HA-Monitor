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
