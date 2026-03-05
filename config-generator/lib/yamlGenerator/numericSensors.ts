import type { NumericSensorConfig, SensorConfig } from "@/types/config";

function generateColorLambda(sensor: NumericSensorConfig): string {
  if (sensor.thresholds && sensor.thresholds.length > 0) {
    // All thresholds except the last become `if (x > thresh_N)` guards.
    // The last threshold color is always the fallback (covers values ≤ all thresholds).
    const lines = sensor.thresholds.slice(0, -1).map(
      (_, i) =>
        `              if (x > \${${sensor.id}_thresh_${i}}) return lv_color_hex(\${${sensor.id}_thresh_${i}_color});`,
    );
    const lastIdx = sensor.thresholds.length - 1;
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

  const lines = sensor.thresholds.map(
    (_, i) =>
      `              if (x > \${${sensor.id}_thresh_${i}}) return std::string("\${${sensor.id}_thresh_${i}_icon}");`,
  );
  lines.push(`              return std::string("\${${sensor.id}_icon}");`);
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
        - lvgl.label.update:
            id: icon_${sensor.id}
            text_color: !lambda |-
${colorLambda}${iconLambda}`;
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
