import { ConfigData, SensorConfig, BinarySensorConfig } from '@/types/config';
import { iconCodeToChar } from '@/lib/icons';

export function generateYaml(config: ConfigData): string {
  const { deviceName, friendlyName, sensors } = config;

  // Get unique icon glyphs (deduplicated); binary uses only iconOn/iconOff
  const allIconCodes = sensors.flatMap((s) =>
    s.type === 'binary'
      ? [s.iconOn, s.iconOff].filter(Boolean) as string[]
      : [s.icon]
  );
  const uniqueIcons = Array.from(new Set(allIconCodes.filter(Boolean))).join('');

  // Helper to get sensor by id
  const getSensor = (id: string): SensorConfig | undefined => 
    sensors.find(s => s.id === id);

  // Generate substitutions for each sensor position
  const generateSensorSubstitutions = (sensor: SensorConfig | undefined, position: string): string => {
    if (!sensor) return '';
    
    const lines: string[] = [];
    lines.push(`  # --- ${position} ---`);
    lines.push(`  ${sensor.id}_entity: "${sensor.entity}"`);
    lines.push(`  ${sensor.id}_type: "${sensor.type}"`);
    lines.push(`  ${sensor.id}_label: "${sensor.label}"`);
    
    if (sensor.type === 'sensor') {
      lines.push(`  ${sensor.id}_icon: "${sensor.icon}"`);
      lines.push(`  ${sensor.id}_icon_color: "${sensor.iconColor}"`);
      lines.push(`  ${sensor.id}_format: '${sensor.format || '%.0f'}'`);
      lines.push(`  ${sensor.id}_color_thresh_high: "${sensor.colorThreshHigh || '100'}"`);
      lines.push(`  ${sensor.id}_color_thresh_mid: "${sensor.colorThreshMid || '50'}"`);
      lines.push(`  ${sensor.id}_color_thresh_low: "${sensor.colorThreshLow || '0'}"`);
      lines.push(`  ${sensor.id}_color_high: "${sensor.colorHigh || '0xFF0000'}"`);
      lines.push(`  ${sensor.id}_color_mid: "${sensor.colorMid || '0xFFA500'}"`);
      lines.push(`  ${sensor.id}_color_low: "${sensor.colorLow || '0x32CD32'}"`);
    } else {
      const iconOffChar = iconCodeToChar(sensor.iconOff ?? '');
      const iconOnChar = iconCodeToChar(sensor.iconOn ?? '');
      lines.push(`  ${sensor.id}_icon: "${iconOffChar}"`);
      lines.push(`  ${sensor.id}_icon_color: "${sensor.colorOff || '0x32CD32'}"`);
      lines.push(`  ${sensor.id}_state_on: "${sensor.stateOn || 'On'}"`);
      lines.push(`  ${sensor.id}_state_off: "${sensor.stateOff || 'Off'}"`);
      lines.push(`  ${sensor.id}_icon_on: "${iconOnChar}"`);
      lines.push(`  ${sensor.id}_icon_off: "${iconOffChar}"`);
      lines.push(`  ${sensor.id}_color_on: "${sensor.colorOn || '0xFF5252'}"`);
      lines.push(`  ${sensor.id}_color_off: "${sensor.colorOff || '0x32CD32'}"`);
    }
    
    return lines.join('\n');
  };

  const substitutions = `substitutions:
  # --- Device ---
  device_name: "${deviceName}"
  friendly_name: "${friendlyName}"

  # --- Icon Glyphs ---
  # List each unique icon ONCE here. If you use the same icon multiple times below,
  # only include it once in this list to avoid "duplicate glyph" errors.
  icon_glyphs: "${uniqueIcons}"

${generateSensorSubstitutions(getSensor('r1c1'), 'Row 1, Column 1')}

${generateSensorSubstitutions(getSensor('r1c2'), 'Row 1, Column 2')}

${generateSensorSubstitutions(getSensor('r2c1'), 'Row 2, Column 1')}

${generateSensorSubstitutions(getSensor('r2c2'), 'Row 2, Column 2')}

${generateSensorSubstitutions(getSensor('r3c1'), 'Row 3, Column 1')}

${generateSensorSubstitutions(getSensor('r3c2'), 'Row 3, Column 2')}
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
    key: !secret api_key

# Replace with the OTA password provided by your ESPHome instance
ota:
  - platform: esphome
    password: !secret ota_password

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  ap:
    ssid: "\${friendly_name} Fallback"
    password: !secret ap_password

captive_portal:

output:
  - platform: ledc
    pin: GPIO21
    id: backlight_pwm

light:
  - platform: monochromatic
    output: backlight_pwm
    name: Display Backlight
    id: backlight
    restore_mode: ALWAYS_ON
    default_transition_length: 0.5s

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
    mirror_y: true

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

  // Generate LVGL display configuration
  const generateLvglWidget = (sensor: SensorConfig | undefined, row: number, col: number): string => {
    if (!sensor) return '';
    
    const xPos = col === 1 ? 2 : 121;
    const yPos = 100 + ((row - 1) * 70);
    
    return `
        - obj:
            x: ${xPos}
            y: ${yPos}
            width: 117
            height: 68
            bg_opa: TRANSP
            border_width: 0
            radius: 0
            widgets:
              - label:
                  id: icon_${sensor.id}
                  text: "\${${sensor.id}_icon}"
                  text_font: icon_font
                  text_color: \${${sensor.id}_icon_color}
                  align: LEFT_MID
                  x: 0
              - label:
                  text: "\${${sensor.id}_label}"
                  text_font: label_font
                  text_color: 0xAAAAAA
                  align: LEFT_MID
                  x: 32
                  y: -10
              - label:
                  id: val_${sensor.id}
                  text: "--"
                  text_font: state_font
                  text_color: 0xFFFFFF
                  align: LEFT_MID
                  x: 32
                  y: 10`;
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
            y: 5
        - label:
            id: label_date
            text: "--- --/--"
            text_font: date_font
            text_color: 0xAAAAAA
            align: TOP_MID
            y: 55

        # ====== ROW 1 ======${generateLvglWidget(getSensor('r1c1'), 1, 1)}
${generateLvglWidget(getSensor('r1c2'), 1, 2)}

        # ====== ROW 2 ======${generateLvglWidget(getSensor('r2c1'), 2, 1)}
${generateLvglWidget(getSensor('r2c2'), 2, 2)}

        # ====== ROW 3 ======${generateLvglWidget(getSensor('r3c1'), 3, 1)}
${generateLvglWidget(getSensor('r3c2'), 3, 2)}
`;

  // Generate binary sensor configurations
  const generateBinarySensor = (sensor: BinarySensorConfig): string => {
    return `
  - platform: homeassistant
    id: ha_${sensor.id}
    entity_id: \${${sensor.id}_entity}
    publish_initial_state: true
    on_state:
      then:
        - lvgl.label.update:
            id: icon_${sensor.id}
            text: !lambda |-
              if (id(ha_${sensor.id}).state) return "\${${sensor.id}_icon_on}";
              return "\${${sensor.id}_icon_off}";
            text_color: !lambda |-
              if (id(ha_${sensor.id}).state) return lv_color_hex(\${${sensor.id}_color_on});
              return lv_color_hex(\${${sensor.id}_color_off});
        - lvgl.label.update:
            id: val_${sensor.id}
            text: !lambda |-
              if (id(ha_${sensor.id}).state) return "\${${sensor.id}_state_on}";
              return "\${${sensor.id}_state_off}";
            text_color: !lambda |-
              if (id(ha_${sensor.id}).state) return lv_color_hex(\${${sensor.id}_color_on});
              return lv_color_hex(\${${sensor.id}_color_off});`;
  };

  const binarySensors = sensors.filter(s => s.type === 'binary');
  const binarySensorConfig = binarySensors.length > 0 
    ? `
# --- BINARY SENSOR CONFIG ---
binary_sensor:${binarySensors.map((s) => generateBinarySensor(s as BinarySensorConfig)).join('\n')}
`
    : '';

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

  const numericSensors = sensors.filter(s => s.type === 'sensor');
  const numericSensorConfig = numericSensors.length > 0
    ? `
# --- NUMERIC SENSOR CONFIG ---
sensor:${numericSensors.map(s => generateNumericSensor(s)).join('\n')}
`
    : '';

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

  return header + substitutions + boilerplate + lvglConfig + binarySensorConfig + numericSensorConfig;
}
