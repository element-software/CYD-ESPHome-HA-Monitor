import type {
  BinarySensorConfig,
  InputBooleanSensorConfig,
  LightSensorConfig,
  SwitchSensorConfig,
} from "@/types/config";

export function generateOnOffSensor(
  sensor: BinarySensorConfig | LightSensorConfig | SwitchSensorConfig | InputBooleanSensorConfig,
): string {
  const isToggleable = sensor.type === "light" || sensor.type === "switch" || sensor.type === "input_boolean";
  const iconColorOnExpr = isToggleable
    ? `lv_color_hex((uint32_t)\${${sensor.id}_color_on_text})`
    : `lv_color_hex((uint32_t)\${${sensor.id}_color_on})`;
  const iconColorOffExpr = `lv_color_hex((uint32_t)\${${sensor.id}_color_off})`;

  const buttonBgUpdate = isToggleable
    ? `
        - if:
            condition:
              lambda: return id(ha_${sensor.id}).state;
            then:
              - lvgl.widget.update:
                  id: button_${sensor.id}
                  bg_color: \${${sensor.id}_color_on}
                  bg_opa: COVER
            else:
              - lvgl.widget.update:
                  id: button_${sensor.id}
                  bg_opa: TRANSP`
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
              return ${iconColorOffExpr};${buttonBgUpdate}`;

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
  inputBooleanSensors: InputBooleanSensorConfig[],
): string {
  const all = [...binarySensors, ...lightSensors, ...inputBooleanSensors];
  if (all.length === 0) return "";
  return `
# --- BINARY SENSOR, LIGHT & INPUT BOOLEAN ENTITY STATE ---
# Binary sensors, HA light entities, and input_boolean helpers (on/off state); icon color follows state (color_on / color_off).
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
