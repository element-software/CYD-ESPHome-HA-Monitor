const DEFAULT_CSS = '#888888';
const DEFAULT_CYD = '0x888888';

/**
 * Convert CYD hex color (0xRRGGBB or 0xFFA500) to CSS hex (#RRGGBB).
 * Handles undefined/null/empty so switching entity types does not throw.
 */
export function cydColorToCss(hex: string | undefined | null): string {
  if (hex == null || typeof hex !== 'string') return DEFAULT_CSS;
  const cleaned = hex.replace(/^0x/i, '').trim();
  if (cleaned.length === 6) return `#${cleaned}`;
  return DEFAULT_CSS;
}

/**
 * Convert CSS hex (#RRGGBB) to CYD format (0xRRGGBB).
 * Handles undefined/null/empty safely.
 */
export function cssToCydColor(cssHex: string | undefined | null): string {
  if (cssHex == null || typeof cssHex !== 'string') return DEFAULT_CYD;
  const cleaned = cssHex.replace(/^#/, '').trim();
  if (cleaned.length === 6 && /^[0-9a-fA-F]+$/.test(cleaned)) {
    return `0x${cleaned.toUpperCase()}`;
  }
  return DEFAULT_CYD;
}
