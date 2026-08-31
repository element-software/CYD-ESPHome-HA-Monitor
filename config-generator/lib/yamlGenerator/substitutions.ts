import type { ConfigData, SensorConfig } from "@/types/config";
import { iconCodeToHexEscape } from "@/lib/icons";
import { sortThresholdsDesc } from "@/lib/yamlGenerator/numericSensors";
import { cydReadableColor, cssToCydColor } from "@/lib/colorUtils";
import { DEFAULT_SCREEN_BG, DEFAULT_SCREEN_FG } from "@/lib/defaultConfig";

export function collectUniqueIconGlyphs(sensors: SensorConfig[]): string {
  const allIconCodes = sensors.flatMap((s) => {
    if (s.type === "binary" || s.type === "light" || s.type === "switch" || s.type === "input_boolean")
      return [s.iconOn, s.iconOff].filter(Boolean) as string[];
    if (s.type === "text" || s.type === "action") return [s.icon];
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
  if (sensor.enabled === false) return "";

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
  } else if (sensor.type === "text") {
    lines.push(`  ${sensor.id}_icon: "${iconCodeToHexEscape(sensor.icon)}"`);
    lines.push(`  ${sensor.id}_icon_color: "${sensor.iconColor}"`);
  } else if (sensor.type === "action") {
    lines.push(`  ${sensor.id}_icon: "${iconCodeToHexEscape(sensor.icon)}"`);
    lines.push(`  ${sensor.id}_icon_color: "${sensor.iconColor}"`);
    lines.push(`  ${sensor.id}_action: "${sensor.action}"`);
    lines.push(`  ${sensor.id}_action_text: "${sensor.actionText || "Run"}"`);
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

export function getAllPrefixedSensors(config: ConfigData): SensorConfig[] {
  const screens = config.screens?.length
    ? config.screens
    : [
        {
          id: "s1",
          name: "Screen 1",
          backgroundColor: DEFAULT_SCREEN_BG,
          fontColor: DEFAULT_SCREEN_FG,
          sensors: config.sensors,
        },
      ];

  const allSensors: SensorConfig[] = [];
  screens.forEach((screen, screenIdx) => {
    const hideClock = config.hideClock ?? false;
    const showClock = screenIdx === 0 && !hideClock;
    const count = showClock ? 6 : 8;

    screen.sensors.slice(0, count).forEach((sensor) => {
      allSensors.push({
        ...sensor,
        id: `${screen.id}_${sensor.id}`,
      });
    });
  });

  return allSensors;
}

export function generateSubstitutions(
  config: ConfigData,
  _sensors?: SensorConfig[],
  _getSensor?: (id: string) => SensorConfig | undefined,
): string {
  const { deviceName, friendlyName } = config;
  const allPrefixedSensors = getAllPrefixedSensors(config);
  const uniqueIcons = collectUniqueIconGlyphs(allPrefixedSensors);

  const screens = config.screens?.length
    ? config.screens
    : [
        {
          id: "s1",
          name: "Screen 1",
          backgroundColor: DEFAULT_SCREEN_BG,
          fontColor: DEFAULT_SCREEN_FG,
          sensors: config.sensors,
        },
      ];

  const lines: string[] = [];
  lines.push(`substitutions:`);
  lines.push(`  # --- Device ---`);
  lines.push(`  device_name: "${deviceName}"`);
  lines.push(`  friendly_name: "${friendlyName}"`);
  lines.push(``);
  lines.push(`  # --- Icon Glyphs ---`);
  lines.push(`  # List each unique icon ONCE here. If you use the same icon multiple times below,`);
  lines.push(`  # only include it once in this list to avoid "duplicate glyph" errors.`);
  lines.push(`  icon_glyphs: "${uniqueIcons}"`);
  lines.push(``);

  screens.forEach((s) => {
    lines.push(`  # --- Color theme for ${s.name} ---`);
    lines.push(`  ${s.id}_bg_color: "${cssToCydColor(s.backgroundColor || DEFAULT_SCREEN_BG)}"`);
    lines.push(`  ${s.id}_font_color: "${cssToCydColor(s.fontColor || DEFAULT_SCREEN_FG)}"`);
    lines.push(``);
  });

  screens.forEach((s, sIdx) => {
    lines.push(`  # ==============================================================================`);
    lines.push(`  # Substitutions for ${s.name}`);
    lines.push(`  # ==============================================================================`);
    const hideClock = config.hideClock ?? false;
    const showClock = sIdx === 0 && !hideClock;
    const count = showClock ? 6 : 8;

    s.sensors.slice(0, count).forEach((sensor) => {
      const prefixed: SensorConfig = {
        ...sensor,
        id: `${s.id}_${sensor.id}`,
      };
      const block = generateSensorSubstitutions(prefixed, `${s.name}, ${sensor.id.toUpperCase()}`);
      if (block) {
        lines.push(block);
        lines.push(``);
      }
    });
  });

  return lines.join("\n").trim() + "\n";
}
