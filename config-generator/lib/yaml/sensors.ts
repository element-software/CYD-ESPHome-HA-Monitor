import {
  SensorConfig,
  BinarySensorConfig,
  LightSensorConfig,
  SwitchSensorConfig,
} from "@/types/config";

function generateOnOffSensor(
  sensor: BinarySensorConfig | LightSensorConfig | SwitchSensorConfig,
): string {
  const isToggleable = sensor.type === "light" || sensor.type === "switch";
  const iconColorOnExpr = isToggleable
    ? "lv_color_hex(0x000000)"
    : `lv_color_hex((uint32_t)\${${sensor.id}_color_on})`;
  const iconColorOffExpr = isToggleable
    ? "lv_color_hex(0xFFFFFF)"
    : `lv_color_hex((uint32_t)\${${sensor.id}_color_off})`;

  const buttonCheckedUpdate = isToggleable
    ? `
        - lvgl.widget.update:
            id: button_${sensor.id}
            state:
              checked: !lambda return id(ha_${sensor.id}).state;`
    : "";

  const onStateActions = `
      then:
        - lvgl.label.update:
            id: icon_${sensor.id}
            text: !lambda |-
              if (id(ha_${sensor.id}).state) return "\${${sensor.id}_icon_on}";
              return "\${${sensor.id}_icon_off}";
        - lvgl.widget.update:
            id: icon_${sensor.id}
            text_color: !lambda |-
              if (id(ha_${sensor.id}).state) return ${iconColorOnExpr};
              return ${iconColorOffExpr};
        - lvgl.label.update:
            id: val_${sensor.id}
            text: !lambda |-
              if (id(ha_${sensor.id}).state) return "\${${sensor.id}_state_on}";
              return "\${${sensor.id}_state_off}";
        - lvgl.widget.update:
            id: val_${sensor.id}
            text_color: !lambda |-
              if (id(ha_${sensor.id}).state) return ${iconColorOnExpr};
              return ${iconColorOffExpr};${isToggleable ? `
        - lvgl.widget.update:
            id: lbl_${sensor.id}
            text_color: !lambda |-
              if (id(ha_${sensor.id}).state) return ${iconColorOnExpr};
              return ${iconColorOffExpr};` : ""}${buttonCheckedUpdate}`;
  const triggerInitial = sensor.type === "switch" ? "" : `
    trigger_on_initial_state: true`;
  return `
  - platform: homeassistant
    id: ha_${sensor.id}
    entity_id: \${${sensor.id}_entity}${triggerInitial}
    on_state:${onStateActions}`;
}

function generateNumericSensor(sensor: SensorConfig): string {
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

export function generateBinarySensorConfig(sensors: SensorConfig[]): string {
  const binarySensors = sensors.filter(
    (s): s is BinarySensorConfig => s.type === "binary",
  );
  const lightSensors = sensors.filter(
    (s): s is LightSensorConfig => s.type === "light",
  );
  const allBinaryOnOff = [...binarySensors, ...lightSensors];

  if (allBinaryOnOff.length === 0) return "";

  return `
# --- BINARY SENSOR & LIGHT ENTITY STATE ---
# Binary sensors and HA light entities (on/off state); icon color follows state (color_on / color_off).
binary_sensor:${allBinaryOnOff.map((s) => generateOnOffSensor(s)).join("\n")}

`;
}

export function generateSwitchSensorConfig(sensors: SensorConfig[]): string {
  const switchSensors = sensors.filter(
    (s): s is SwitchSensorConfig => s.type === "switch",
  );

  if (switchSensors.length === 0) return "";

  return `
# --- SWITCH ENTITY STATE ---
# HA switch entities (on/off state with tap-to-toggle).
switch:${switchSensors.map((s) => generateOnOffSensor(s)).join("\n")}

`;
}

export function generateLightConfig(): string {
  return `
# --- LIGHT CONFIG (display backlight) ---
light:
  - platform: monochromatic
    output: backlight_pwm
    name: Display Backlight
    id: backlight
    restore_mode: ALWAYS_ON
    default_transition_length: 0.5s
`;
}

export function generateNumericSensorConfig(sensors: SensorConfig[]): string {
  const numericSensors = sensors.filter((s) => s.type === "sensor");

  if (numericSensors.length === 0) return "";

  return `
# --- NUMERIC SENSOR CONFIG ---
sensor:${numericSensors.map((s) => generateNumericSensor(s)).join("\n")}
`;
}
