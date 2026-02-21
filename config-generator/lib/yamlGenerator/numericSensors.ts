import type { SensorConfig } from "@/types/config";

export function generateNumericSensor(sensor: SensorConfig): string {
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
              if (x > \${${sensor.id}_color_thresh_high}) return lv_color_hex(\${${sensor.id}_color_high});
              if (x > \${${sensor.id}_color_thresh_mid}) return lv_color_hex(\${${sensor.id}_color_mid});
              if (x > \${${sensor.id}_color_thresh_low}) return lv_color_hex(\${${sensor.id}_color_low});
              return lv_color_hex(\${${sensor.id}_color_low});`;
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
