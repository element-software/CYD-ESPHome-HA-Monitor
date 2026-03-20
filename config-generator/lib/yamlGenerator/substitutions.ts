import type { ConfigData, SensorConfig } from "@/types/config";
import { iconCodeToHexEscape } from "@/lib/icons";
import { sortThresholdsDesc } from "@/lib/yamlGenerator/numericSensors";
import { cydReadableColor } from "@/lib/colorUtils";

export function collectUniqueIconGlyphs(sensors: SensorConfig[]): string {
  const allIconCodes = sensors.flatMap((s) => {
    if (s.type === "binary" || s.type === "light" || s.type === "switch" || s.type === "input_boolean")
      return [s.iconOn, s.iconOff].filter(Boolean) as string[];
    const icons: string[] = [s.icon];
    s.thresholds?.forEach((t) => {
      if (t.icon) icons.push(t.icon);
    });
    return icons;
  });
  return Array.from(
    new Set(
      allIconCodes.filter(Boolean).map(iconCodeToHexEscape).filter(Boolean),
    ),
  ).join("");
}

export function generateSensorSubstitutions(
  sensor: SensorConfig | undefined,
  position: string,
): string {
  if (!sensor) return "";

  const lines: string[] = [];
  lines.push(`  # --- ${position} ---`);
  lines.push(`  ${sensor.id}_entity: "${sensor.entity}"`);
  lines.push(`  ${sensor.id}_type: "${sensor.type}"`);
  lines.push(`  ${sensor.id}_label: "${sensor.label}"`);

  if (sensor.type === "sensor") {
    lines.push(`  ${sensor.id}_icon: "${iconCodeToHexEscape(sensor.icon)}"`);
    lines.push(`  ${sensor.id}_icon_color: "${sensor.iconColor}"`);
    lines.push(`  ${sensor.id}_format: '${sensor.format || "%.0f"}'`);

    if (sensor.thresholds && sensor.thresholds.length > 0) {
      // Sort descending so indices match the lambda order in numericSensors.ts
      const sorted = sortThresholdsDesc(sensor.thresholds);
      const hasIcons = sorted.some((t) => t.icon);
      sorted.forEach((t, i) => {
        lines.push(`  ${sensor.id}_thresh_${i}: "${t.value}"`);
        lines.push(`  ${sensor.id}_thresh_${i}_color: "${t.color}"`);
        if (hasIcons) {
          const iconHex = iconCodeToHexEscape(t.icon ?? sensor.icon);
          lines.push(`  ${sensor.id}_thresh_${i}_icon: "${iconHex}"`);
        }
      });
    } else {
      lines.push(
        `  ${sensor.id}_color_thresh_high: "${sensor.colorThreshHigh || "100"}"`,
      );
      lines.push(
        `  ${sensor.id}_color_thresh_mid: "${sensor.colorThreshMid || "50"}"`,
      );
      lines.push(
        `  ${sensor.id}_color_thresh_low: "${sensor.colorThreshLow || "0"}"`,
      );
      lines.push(
        `  ${sensor.id}_color_high: "${sensor.colorHigh || "0xFF0000"}"`,
      );
      lines.push(
        `  ${sensor.id}_color_mid: "${sensor.colorMid || "0xFFA500"}"`,
      );
      lines.push(
        `  ${sensor.id}_color_low: "${sensor.colorLow || "0x32CD32"}"`,
      );
    }
  } else {
    const iconOffEsc = iconCodeToHexEscape(sensor.iconOff ?? "");
    const iconOnEsc = iconCodeToHexEscape(sensor.iconOn ?? "");
    const defaultColorOn =
      sensor.type === "light"
        ? "0xFFA500"
        : sensor.type === "switch" || sensor.type === "input_boolean"
          ? "0x4CAF50"
          : "0xFF5252";
    const colorOff = sensor.colorOff || "0x32CD32";
    lines.push(`  ${sensor.id}_icon: "${iconOffEsc}"`);
    lines.push(`  ${sensor.id}_icon_color: "${colorOff}"`);
    lines.push(`  ${sensor.id}_state_on: "${sensor.stateOn || "On"}"`);
    lines.push(`  ${sensor.id}_state_off: "${sensor.stateOff || "Off"}"`);
    lines.push(`  ${sensor.id}_icon_on: "${iconOnEsc}"`);
    lines.push(`  ${sensor.id}_icon_off: "${iconOffEsc}"`);
    lines.push(
      `  ${sensor.id}_color_on: "${sensor.colorOn || defaultColorOn}"`,
    );
    lines.push(`  ${sensor.id}_color_off: "${colorOff}"`);
    const colorOnFinal = sensor.colorOn || defaultColorOn;
    lines.push(`  ${sensor.id}_color_on_text: "${cydReadableColor(colorOnFinal)}"`);
  }

  return lines.join("\n");
}

export function generateSubstitutions(
  config: ConfigData,
  sensors: SensorConfig[],
  getSensor: (id: string) => SensorConfig | undefined,
): string {
  const { deviceName, friendlyName, hideClock } = config;
  const uniqueIcons = collectUniqueIconGlyphs(sensors);

  return `substitutions:
  # --- Device ---
  device_name: "${deviceName}"
  friendly_name: "${friendlyName}"

  # --- Icon Glyphs ---
  # List each unique icon ONCE here. If you use the same icon multiple times below,
  # only include it once in this list to avoid "duplicate glyph" errors.
  icon_glyphs: "${uniqueIcons}"

${generateSensorSubstitutions(getSensor("r1c1"), "Row 1, Column 1")}

${generateSensorSubstitutions(getSensor("r1c2"), "Row 1, Column 2")}

${generateSensorSubstitutions(getSensor("r2c1"), "Row 2, Column 1")}

${generateSensorSubstitutions(getSensor("r2c2"), "Row 2, Column 2")}

${generateSensorSubstitutions(getSensor("r3c1"), "Row 3, Column 1")}

${generateSensorSubstitutions(getSensor("r3c2"), "Row 3, Column 2")}
${hideClock ? `
${generateSensorSubstitutions(getSensor("r4c1"), "Row 4, Column 1")}

${generateSensorSubstitutions(getSensor("r4c2"), "Row 4, Column 2")}
` : ""}`;
}
