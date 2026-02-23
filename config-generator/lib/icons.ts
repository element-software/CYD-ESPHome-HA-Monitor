import type { IconSet } from '@/types/config';
import {
  COMMON_ICONS,
  HEX_TO_NAME_MDI,
  HEX_TO_NAME_SYMBOLS,
  type GeneratedIcon,
} from './icons.generated';

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
 * Convert stored icon code to the Unicode character for the icon font (codepoint).
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
 * Get ligature name for a stored icon code for the given icon set.
 * Used so the font's ligature feature displays the correct glyph.
 */
export function iconCodeToLigature(
  code: string,
  iconSet?: IconSet
): string {
  const hex = iconCodeToHex(code);
  if (!hex) return code || '';
  const map = iconSet === 'material_symbols' ? HEX_TO_NAME_SYMBOLS : HEX_TO_NAME_MDI;
  if (map[hex]) return map[hex];
  const otherMap = iconSet === 'material_symbols' ? HEX_TO_NAME_MDI : HEX_TO_NAME_SYMBOLS;
  if (otherMap[hex]) return otherMap[hex];
  return iconCodeToChar(code);
}

/** Find COMMON_ICONS entry that matches the given code (by hex; matches either codeMdi or codeSymbols). */
export function findIconByCode(code: string): GeneratedIcon | undefined {
  const hex = iconCodeToHex(code);
  if (!hex) return undefined;
  return COMMON_ICONS.find(
    (icon) =>
      iconCodeToHex(icon.codeMdi) === hex || iconCodeToHex(icon.codeSymbols) === hex
  );
}

/** Get the stored codepoint string for an icon in the given set (for config/YAML). */
export function getCodeForIconSet(icon: GeneratedIcon, iconSet: IconSet | undefined): string {
  const useSymbols = iconSet === 'material_symbols';
  const code = useSymbols ? icon.codeSymbols : icon.codeMdi;
  const fallback = useSymbols ? icon.codeMdi : icon.codeSymbols;
  return code || fallback || '';
}

/**
 * Font class to use when rendering a specific icon. Uses the set that actually
 * has the glyph so icons that exist in only one set still render correctly.
 */
export function getIconFontClassForIcon(
  icon: GeneratedIcon,
  iconSet: IconSet | undefined
): string {
  const hasMdi = !!icon.codeMdi && iconCodeToHex(icon.codeMdi) !== '';
  const hasSym = !!icon.codeSymbols && iconCodeToHex(icon.codeSymbols) !== '';
  if (hasMdi && hasSym) return getIconFontClass(iconSet);
  if (hasSym) return 'material-symbols';
  return 'material-icons';
}

/** All icons from both Material Design Icons and Material Symbols (generated). */
export const commonIcons: GeneratedIcon[] = COMMON_ICONS;
