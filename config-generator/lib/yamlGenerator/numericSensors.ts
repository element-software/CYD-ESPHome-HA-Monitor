import type { NumericSensorConfig, SensorConfig, ThresholdConfig } from "@/types/config";

/**
 * Sort a copy of thresholds by numeric value descending (highest first).
 * This guarantees correct `if (x > ...)` chain order even if the user stored
 * thresholds out of order (e.g. via hand-editing the config JSON).
 */
export function sortThresholdsDesc(thresholds: ThresholdConfig[]): ThresholdConfig[] {
  return [...thresholds].sort((a, b) => {
    const av = parseFloat(a.value);
    const bv = parseFloat(b.value);
    return (Number.isFinite(bv) ? bv : -Infinity) - (Number.isFinite(av) ? av : -Infinity);
  });
}

function generateColorLambda(sensor: NumericSensorConfig): string {
  if (sensor.thresholds && sensor.thresholds.length > 0) {
    // Always sort descending so the if-chain is correct regardless of config order.
    const sorted = sortThresholdsDesc(sensor.thresholds);
    // All thresholds except the last become `if (x > thresh_N)` guards.
    // The last threshold color is always the fallback (covers values ≤ all thresholds).
    const lines = sorted.slice(0, -1).map(
      (_, i) =>
        `              if (x > \${${sensor.id}_thresh_${i}}) return lv_color_hex(\${${sensor.id}_thresh_${i}_color});`,
    );
    const lastIdx = sorted.length - 1;
    lines.push(
      `              return lv_color_hex(\${${sensor.id}_thresh_${lastIdx}_color});`,
    );
    return lines.join("\n");
  }
  // Legacy fixed thresholds
  return [
    `              if (x > \${${sensor.id}_color_thresh_high}) return lv_color_hex(\${${sensor.id}_color_high});`,
    `              if (x > \${${sensor.id}_color_thresh_mid}) return lv_color_hex(\${${sensor.id}_color_mid});`,
    `              if (x > \${${sensor.id}_color_thresh_low}) return lv_color_hex(\${${sensor.id}_color_low});`,
    `              return lv_color_hex(\${${sensor.id}_color_low});`,
  ].join("\n");
}

function generateIconLambda(sensor: NumericSensorConfig): string {
  if (!sensor.thresholds || sensor.thresholds.length === 0) return "";
  if (!sensor.thresholds.some((t) => t.icon)) return "";

  // Sort descending so the if-chain matches the substitution variable order.
  const sorted = sortThresholdsDesc(sensor.thresholds);
  // All thresholds except the last become `if (x > thresh_N)` guards.
  const lines = sorted.slice(0, -1).map(
    (_, i) =>
      `              if (x > \${${sensor.id}_thresh_${i}}) return std::string("\${${sensor.id}_thresh_${i}_icon}");`,
  );
  const lastIdx = sorted.length - 1;
  lines.push(
    `              return std::string("\${${sensor.id}_thresh_${lastIdx}_icon}");`,
  );
  return `
        - lvgl.label.update:
            id: icon_${sensor.id}
            text: !lambda |-
${lines.join("\n")}`;
}

export function generateNumericSensor(sensor: SensorConfig): string {
  if (sensor.type !== "sensor") return "";
  const colorLambda = generateColorLambda(sensor);
  const iconLambda = generateIconLambda(sensor);
  return `
  - platform: homeassistant
    id: ha_${sensor.id}
    entity_id: \${${sensor.id}_entity}
    on_value:
      then:
        - lvgl.label.update:
            id: val_${sensor.id}
            text: !lambda |-
              return str_sprintf("\${${sensor.id}_format}", x);
        - lvgl.widget.update:
            id: icon_${sensor.id}
            text_color: !lambda |-
${colorLambda}${iconLambda}`;
}

export function generateTextValueSensor(sensor: SensorConfig): string {
  if (sensor.type !== "text") return "";
  return `
  - platform: homeassistant
    id: ha_${sensor.id}
    entity_id: \${${sensor.id}_entity}
    on_value:
      then:
        - lvgl.label.update:
            id: val_${sensor.id}
            text: !lambda |-
              return x.c_str();`;
}

export function generateNumericSensorConfig(
  sensors: SensorConfig[],
): string {
  const numeric = sensors.filter((s) => s.type === "sensor");
  if (numeric.length === 0) return "";
  return `
# --- NUMERIC SENSOR CONFIG ---
sensor:${numeric.map((s) => generateNumericSensor(s)).join("\n")}
`;
}

export function generateTextValueSensorConfig(
  sensors: SensorConfig[],
): string {
  const textSensors = sensors.filter((s) => s.type === "text");
  if (textSensors.length === 0) return "";
  return `
# --- TEXT SENSOR CONFIG ---
text_sensor:${textSensors.map((s) => generateTextValueSensor(s)).join("\n")}
`;
}
