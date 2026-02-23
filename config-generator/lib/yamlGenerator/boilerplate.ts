import type { ConfigData } from "@/types/config";
import { getEffectivePins, isI2cTouch, isSpiTouch } from "@/lib/devicePresets";

export function generateBoilerplate(config: ConfigData): string {
  const { deviceName, friendlyName, hideClock } = config;
  const p = getEffectivePins(config);
  const useSpiTouch = isSpiTouch(p);
  const useI2cTouch = isI2cTouch(p);

  const spiTouchBlock =
    useSpiTouch
      ? `
  - id: touch
    clk_pin: ${p.touchSpiClk}
    mosi_pin: ${p.touchSpiMosi}
    miso_pin: ${p.touchSpiMiso}`
      : "";

  const i2cBlock =
    useI2cTouch
      ? `
i2c:
  sda: ${p.i2cSda}
  scl: ${p.i2cScl}
  scan: true
`
      : "";

  const touchscreenBlock = useSpiTouch
    ? `
touchscreen:
  platform: xpt2046
  id: my_touchscreen
  spi_id: touch
  cs_pin: ${p.touchSpiCs}
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
`
    : useI2cTouch
      ? `
touchscreen:
  platform: cst816
  id: my_touchscreen
  display: my_display
  reset_pin: ${p.touchReset}
  update_interval: 50ms
  transform:
    swap_xy: false
    mirror_x: false
    mirror_y: false
`
      : "";

  return `
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
    pin: ${p.backlightPin}
    id: backlight_pwm
${i2cBlock}
spi:
  - id: tft
    clk_pin: ${p.tftClk}
    mosi_pin: ${p.tftMosi}
    miso_pin: ${p.tftMiso}
${spiTouchBlock}

display:
  - platform: ili9xxx
    id: my_display
    model: ILI9341
    spi_id: tft
    cs_pin: ${p.tftCs}
    dc_pin: ${p.tftDc}
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
${touchscreenBlock}

# --- FONTS ---
font:${hideClock ? "" : `
  - file: "gfonts://Roboto"
    id: clock_font
    size: 48
    glyphs: '0123456789: '
  - file: "gfonts://Roboto"
    id: date_font
    size: 20
    glyphs: "0123456789/- abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"`}
  - file: "gfonts://${config.iconSet === 'material_symbols' ? 'Material Symbols' : 'Material Icons'}"
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

${hideClock ? "" : `# --- TIME ---
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
`}`;
}
