import type {
  BinarySensorConfig,
  LightSensorConfig,
  SwitchSensorConfig,
} from "@/types/config";

export function generateOnOffSensor(
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

  const triggerInitial =
    sensor.type === "switch"
      ? ""
      : `
    trigger_on_initial_state: true`;

  return `
  - platform: homeassistant
    id: ha_${sensor.id}
    entity_id: \${${sensor.id}_entity}${triggerInitial}
    on_state:${onStateActions}`;
}

export function generateBinarySensorConfig(
  binarySensors: BinarySensorConfig[],
  lightSensors: LightSensorConfig[],
): string {
  const all = [...binarySensors, ...lightSensors];
  if (all.length === 0) return "";
  return `
# --- BINARY SENSOR & LIGHT ENTITY STATE ---
# Binary sensors and HA light entities (on/off state); icon color follows state (color_on / color_off).
binary_sensor:${all.map((s) => generateOnOffSensor(s)).join("\n")}

`;
}

export function generateSwitchSensorConfig(
  switchSensors: SwitchSensorConfig[],
): string {
  if (switchSensors.length === 0) return "";
  return `
# --- SWITCH ENTITY STATE ---
# HA switch entities (on/off state with tap-to-toggle).
switch:${switchSensors.map((s) => generateOnOffSensor(s)).join("\n")}

`;
}
