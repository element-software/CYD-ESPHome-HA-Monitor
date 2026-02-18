import {
  ConfigData,
  SensorConfig,
  BinarySensorConfig,
  LightSensorConfig,
} from "@/types/config";
import { iconCodeToHexEscape } from "@/lib/icons";

export function generateYaml(config: ConfigData): string {
  const { deviceName, friendlyName, sensors } = config;

  // Get unique icon glyphs (deduplicated); binary and light use iconOn/iconOff
  const allIconCodes = sensors.flatMap((s) => {
    if (s.type === "binary" || s.type === "light")
      return [s.iconOn, s.iconOff].filter(Boolean) as string[];
    return [s.icon];
  });
  const uniqueIcons = Array.from(
    new Set(
      allIconCodes.filter(Boolean).map(iconCodeToHexEscape).filter(Boolean),
    ),
  ).join("");

  // Helper to get sensor by id
  const getSensor = (id: string): SensorConfig | undefined =>
    sensors.find((s) => s.id === id);

  // Generate substitutions for each sensor position
  const generateSensorSubstitutions = (
    sensor: SensorConfig | undefined,
    position: string,
  ): string => {
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
    } else {
      // binary or light: same substitutions; only default color_on differs (amber for light, red for binary).
      // Emit color values as numeric (no quotes) so lambdas get lv_color_hex(0xRRGGBB) not lv_color_hex("0x...") and initial widget gets integer text_color.
      const iconOffEsc = iconCodeToHexEscape(sensor.iconOff ?? "");
      const iconOnEsc = iconCodeToHexEscape(sensor.iconOn ?? "");
      const defaultColorOn = sensor.type === "light" ? "0xFFA500" : "0xFF5252";
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
    }

    return lines.join("\n");
  };

  const substitutions = `substitutions:
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
`;

  const boilerplate = `
# ==============================================================================
esphome:
  name: \${device_name}
  friendly_name: \${friendly_name}

esp32:
  board: esp32dev
  framework:
    type: esp-idf

logger:

# Replace with the API encryption key provided by your ESPHome instance
api:
  encryption:
    key: !secret ${deviceName}_api_key

# Replace with the OTA password provided by your ESPHome instance
ota:
  - platform: esphome
    password: !secret ${deviceName}_ota_password

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  ap:
    ssid: "\${friendly_name} Fallback"
    password: !secret ${deviceName}_ap_password

captive_portal:

output:
  - platform: ledc
    pin: GPIO21
    id: backlight_pwm

spi:
  - id: tft
    clk_pin: GPIO14
    mosi_pin: GPIO13
    miso_pin: GPIO12
  - id: touch
    clk_pin: GPIO25
    mosi_pin: GPIO32
    miso_pin: GPIO39

display:
  - platform: ili9xxx
    id: my_display
    model: ILI9341
    spi_id: tft
    cs_pin: GPIO15
    dc_pin: GPIO2
    auto_clear_enabled: false
    invert_colors: false
    color_order: RGB
    dimensions:
      width: 240
      height: 320
    transform:
      swap_xy: true
      mirror_y: true
      mirror_x: true

touchscreen:
  platform: xpt2046
  id: my_touchscreen
  spi_id: touch
  cs_pin: GPIO33
  calibration:
    x_min: 220
    x_max: 3756
    y_min: 394
    y_max: 3749
  transform:
    swap_xy: false
    mirror_x: true
    mirror_y: false
  on_touch:
    - lambda: |-
        ESP_LOGI("touch", "Touch at LVGL (%d, %d)", touch.x, touch.y);

# --- FONTS ---
font:
  - file: "gfonts://Roboto"
    id: clock_font
    size: 48
    glyphs: '0123456789: '
  - file: "gfonts://Roboto"
    id: date_font
    size: 20
    glyphs: "0123456789/- abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  - file: "gfonts://Material Icons"
    id: icon_font
    size: 28
    glyphs: "\${icon_glyphs}"
  - file: "gfonts://Roboto"
    id: state_font
    size: 18
    glyphs: '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz .°%W-'
  - file: "gfonts://Roboto"
    id: label_font
    size: 11
    glyphs: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .°%-"

# --- TIME ---
time:
  - platform: homeassistant
    id: esptime
    on_time:
      - seconds: 0
        then:
          - lvgl.label.update:
              id: label_clock
              text: !lambda 'return id(esptime).now().strftime("%H:%M");'
          - lvgl.label.update:
              id: label_date
              text: !lambda |-
                static const char *const dias[] = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
                auto now = id(esptime).now();
                return str_sprintf("%s %02d/%02d", dias[now.day_of_week - 1], now.day_of_month, now.month);
`;

  // Generate LVGL display configuration. Uses button (like known working config) so light slots can use on_press for tap-to-toggle.
  const generateLvglWidget = (
    sensor: SensorConfig | undefined,
    row: number,
    col: number,
  ): string => {
    if (!sensor) return "";

    const xPos = col === 1 ? 2 : 121;
    const yPos = 100 + (row - 1) * 70;
    const isLight = sensor.type === "light";

    const onClickBlock = isLight
      ? `
            on_click:
              - homeassistant.action:
                  action: light.toggle
                  data:
                    entity_id: "${sensor.entity}"`
      : "";

    return `
        - button:
            x: ${xPos}
            y: ${yPos}
            id: button_${sensor.id}
            width: 117
            height: 68
            bg_opa: TRANSP
            border_width: 0
            shadow_width: 0
            radius: 0
            scrollbar_mode: "OFF"${isLight ? `\n            checkable: true` : ""}${isLight ? onClickBlock : ""}
            widgets:
              - label:
                  id: icon_${sensor.id}
                  text: "\${${sensor.id}_icon}"
                  text_font: icon_font
                  text_color: \${${sensor.id}_icon_color}
                  align: LEFT_MID
                  x: 0
                  clickable: false
              - label:
                  text: "\${${sensor.id}_label}"
                  text_font: label_font
                  text_color: 0xAAAAAA
                  align: LEFT_MID
                  x: 32
                  y: -10
                  clickable: false
              - label:
                  id: val_${sensor.id}
                  text: "--"
                  text_font: state_font
                  text_color: 0xFFFFFF
                  align: LEFT_MID
                  x: 32
                  y: 10
                  clickable: false`;
  };

  const lvglConfig = `
# --- DISPLAY PAGE CONFIG ---
lvgl:
  displays:
    - my_display
  touchscreens:
    - my_touchscreen
  pages:
    - id: main_page
      bg_color: 0x000000
      widgets:
        - label:
            id: label_clock
            text: "--:--"
            text_font: clock_font
            text_color: 0xFFFFFF
            align: TOP_MID
            y: 15
        - label:
            id: label_date
            text: "--- --/--"
            text_font: date_font
            text_color: 0xAAAAAA
            align: TOP_MID
            y: 65

        # ====== ROW 1 ======${generateLvglWidget(getSensor("r1c1"), 1, 1)}
${generateLvglWidget(getSensor("r1c2"), 1, 2)}

        # ====== ROW 2 ======${generateLvglWidget(getSensor("r2c1"), 2, 1)}
${generateLvglWidget(getSensor("r2c2"), 2, 2)}

        # ====== ROW 3 ======${generateLvglWidget(getSensor("r3c1"), 3, 1)}
${generateLvglWidget(getSensor("r3c2"), 3, 2)}
`;

  // Generates a homeassistant binary_sensor used for both HA binary_sensor and HA light entities.
  // For both entity types, HA sends state "on"/"off"; ESPHome parses this to boolean, so id(ha_xxx).state
  // is always a boolean (true = on, false = off). Same on_state lambdas work for both.
  const generateOnOffSensor = (
    sensor: BinarySensorConfig | LightSensorConfig,
  ): string => {
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
              if (id(ha_${sensor.id}).state) return lv_color_hex((uint32_t)\${${sensor.id}_color_on});
              return lv_color_hex((uint32_t)\${${sensor.id}_color_off});
        - lvgl.label.update:
            id: val_${sensor.id}
            text: !lambda |-
              if (id(ha_${sensor.id}).state) return "\${${sensor.id}_state_on}";
              return "\${${sensor.id}_state_off}";
        - lvgl.widget.update:
            id: val_${sensor.id}
            text_color: !lambda |-
              if (id(ha_${sensor.id}).state) return lv_color_hex((uint32_t)\${${sensor.id}_color_on});
              return lv_color_hex((uint32_t)\${${sensor.id}_color_off});`;
    return `
  - platform: homeassistant
    id: ha_${sensor.id}
    entity_id: \${${sensor.id}_entity}
    trigger_on_initial_state: true
    on_state:${onStateActions}`;
  };

  const binarySensors = sensors.filter(
    (s): s is BinarySensorConfig => s.type === "binary",
  );
  const lightSensors = sensors.filter(
    (s): s is LightSensorConfig => s.type === "light",
  );
  const allOnOffSensors = [...binarySensors, ...lightSensors];
  const binarySensorConfig =
    allOnOffSensors.length > 0
      ? `
# --- BINARY SENSOR & LIGHT ENTITY STATE ---
# Binary sensors and HA light entities (on/off state); icon color follows state (color_on / color_off).
binary_sensor:${allOnOffSensors.map((s) => generateOnOffSensor(s)).join("\n")}

`
      : "";

  // Light config: display backlight only (no LVGL light; icon uses label with on_state color update like binary).
  const lightConfig = `
# --- LIGHT CONFIG (display backlight) ---
light:
  - platform: monochromatic
    output: backlight_pwm
    name: Display Backlight
    id: backlight
    restore_mode: ALWAYS_ON
    default_transition_length: 0.5s
`;

  // Generate numeric sensor configurations
  const generateNumericSensor = (sensor: SensorConfig): string => {
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
  };

  const numericSensors = sensors.filter((s) => s.type === "sensor");
  const numericSensorConfig =
    numericSensors.length > 0
      ? `
# --- NUMERIC SENSOR CONFIG ---
sensor:${numericSensors.map((s) => generateNumericSensor(s)).join("\n")}
`
      : "";

  // Combine all parts
  const header = `# ==============================================================================
#  CYD 2.8" HAMon - Home Assistant Monitor
#  A customisable clock & sensor dashboard for the ESP32 Cheap Yellow Display
#
#  Generated by CYD HAMon Config Generator
#  https://github.com/element-software/CYD-ESPHome-HA-Monitor
#
#  License: MIT
# ==============================================================================
#
#  SUBSTITUTIONS - Customise your dashboard by editing the values below.
#  Passwords and keys should be stored in your secrets.yaml file.
#
# ==============================================================================
`;

  return (
    header +
    substitutions +
    boilerplate +
    lvglConfig +
    binarySensorConfig +
    lightConfig +
    numericSensorConfig
  );
}
