import type { ConfigData } from "@/types/config";

export function generateBoilerplate(config: ConfigData): string {
  const { deviceName, friendlyName, hideClock } = config;

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
font:${hideClock ? "" : `
  - file: "gfonts://Roboto"
    id: clock_font
    size: 48
    glyphs: '0123456789: '
  - file: "gfonts://Roboto"
    id: date_font
    size: 20
    glyphs: "0123456789/- abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"`}
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
