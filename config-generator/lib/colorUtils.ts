const DEFAULT_CSS = '#888888';
const DEFAULT_CYD = '0x888888';

/**
 * Returns '#000000' or '#FFFFFF' — whichever has better contrast against the
 * given CSS hex background colour, using WCAG relative luminance.
 */
export function readableColor(cssHex: string | undefined | null): '#000000' | '#FFFFFF' {
  if (!cssHex || cssHex.length < 7) return '#000000';
  const r = parseInt(cssHex.slice(1, 3), 16) / 255;
  const g = parseInt(cssHex.slice(3, 5), 16) / 255;
  const b = parseInt(cssHex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return L > 0.179 ? '#000000' : '#FFFFFF';
}

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
 * Returns the CYD hex colour (0x000000 or 0xFFFFFF) that gives the best contrast
 * against the given CYD background colour. Used at YAML generation time so the
 * device doesn't need to compute luminance at runtime.
 */
export function cydReadableColor(cydHex: string | undefined | null): '0x000000' | '0xFFFFFF' {
  const css = cydColorToCss(cydHex);
  return readableColor(css) === '#000000' ? '0x000000' : '0xFFFFFF';
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
