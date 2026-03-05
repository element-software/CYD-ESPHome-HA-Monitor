import type { ConfigData } from "@/types/config";
import { generateHeader } from "./header";
import { generateLightConfig } from "./light";
import { getEffectivePins, isI2cTouch, isSpiTouch } from "@/lib/devicePresets";

/** The 6 prayer time keys returned by prayertimes.dev */
const PRAYERS = [
  { key: "fajr", label: "Fajr", icon: "\\ue51c" },      // dark_mode
  { key: "sunrise", label: "Sunrise", icon: "\\ue81a" },  // sunny
  { key: "zuhr", label: "Zuhr", icon: "\\ue518" },       // light_mode
  { key: "asr", label: "Asr", icon: "\\ue81a" },         // sunny
  { key: "maghrib", label: "Maghrib", icon: "\\uef44" },  // bedtime (twilight)
  { key: "isha", label: "Isha", icon: "\\ue51c" },       // dark_mode
] as const;

function buildApiUrl(config: ConfigData): string {
  const pt = config.prayerTimes;
  if (!pt) return "https://prayertimes.dev/api/prayer-times?city=London";

  const params: string[] = [];
  if (pt.lat && pt.lng) {
    params.push(`lat=${pt.lat}`, `lng=${pt.lng}`);
  } else {
    params.push(`city=${encodeURIComponent(pt.city)}`);
  }
  params.push(`school=${pt.school}`);
  return `https://prayertimes.dev/api/prayer-times?${params.join("&")}`;
}

function generatePrayerTimesSubstitutions(config: ConfigData): string {
  const pt = config.prayerTimes;
  const city = pt?.city ?? "London";
  const school = pt?.school ?? "hanafi";
  const refreshMin = pt?.refreshMinutes ?? 60;

  return `substitutions:
  # --- Device ---
  device_name: "${config.deviceName}"
  friendly_name: "${config.friendlyName}"

  # --- Prayer Times API ---
  prayer_api_url: "${buildApiUrl(config)}"
  prayer_city: "${city}"
  prayer_school: "${school}"
  prayer_refresh_seconds: "${refreshMin * 60}"
`;
}

function generatePrayerTimesBoilerplate(config: ConfigData): string {
  const { deviceName } = config;
  const p = getEffectivePins(config);
  const useSpiTouch = isSpiTouch(p);
  const useI2cTouch = isI2cTouch(p);

  const spiTouchBlock = useSpiTouch
    ? `
  - id: touch
    clk_pin: ${p.touchSpiClk}
    mosi_pin: ${p.touchSpiMosi}
    miso_pin: ${p.touchSpiMiso}`
    : "";

  const i2cBlock = useI2cTouch
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
  on_boot:
    priority: -100
    then:
      - delay: 5s
      - script.execute: fetch_prayer_times

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

# --- WiFi (no Home Assistant needed) ---
wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
  ap:
    ssid: "\${friendly_name} Fallback"
    password: !secret ${deviceName}_ap_password

captive_portal:

# --- HTTP client for API requests ---
http_request:
  id: http_client
  useragent: "ESPHome/CYD-PrayerTimes"
  timeout: 15s

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
${touchscreenBlock}`;
}

function generatePrayerTimesFonts(): string {
  // Icon glyphs: dark_mode (\ue51c), sunny (\ue81a), light_mode (\ue518), bedtime (\uef44)
  return `
# --- FONTS ---
font:
  - file: "gfonts://Roboto"
    id: clock_font
    size: 38
    glyphs: '0123456789: '
  - file: "gfonts://Roboto"
    id: date_font
    size: 16
    glyphs: "0123456789/- abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,."
  - file: "gfonts://Material Symbols"
    id: icon_font
    size: 24
    glyphs: "\\ue51c\\ue81a\\ue518\\uef44"
  - file: "gfonts://Roboto"
    id: prayer_name_font
    size: 18
    glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
  - file: "gfonts://Roboto"
    id: prayer_time_font
    size: 22
    glyphs: '0123456789:-'
  - file: "gfonts://Roboto"
    id: label_font
    size: 12
    glyphs: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .°%-|,()/"
`;
}

function generatePrayerTimesGlobals(): string {
  const lines = PRAYERS.map(
    (p) => `  - id: prayer_${p.key}
    type: std::string
    restore_value: false
    initial_value: '"--:--"'`,
  );

  return `
# --- GLOBALS (prayer time storage) ---
globals:
${lines.join("\n")}
  - id: last_fetch_ok
    type: bool
    restore_value: false
    initial_value: "false"
`;
}

function generatePrayerTimesLvgl(): string {
  // CYD landscape: 320 x 240. Layout:
  // Top: clock (y=8) + date/city (y=42)
  // Divider line at y=58
  // Prayer rows: 6 rows starting at y=62, each 30px tall
  // Each row: icon (x=8), prayer name (x=38), time (right-aligned x=305)
  const ROW_START = 62;
  const ROW_HEIGHT = 30;

  const prayerWidgets = PRAYERS.map((p, i) => {
    const y = ROW_START + i * ROW_HEIGHT;
    // Alternate row backgrounds for readability
    const bgWidget =
      i % 2 === 1
        ? `
        - obj:
            x: 0
            y: ${y}
            width: 320
            height: ${ROW_HEIGHT}
            bg_color: 0x1a2332
            bg_opa: COVER
            border_width: 0
            radius: 0
            scrollbar_mode: "OFF"
            clickable: false`
        : "";

    return `${bgWidget}
        - label:
            id: icon_${p.key}
            text: "${p.icon}"
            text_font: icon_font
            text_color: ${p.key === "fajr" || p.key === "isha" ? "0x7B68EE" : p.key === "sunrise" ? "0xFFA500" : p.key === "maghrib" ? "0xFF6347" : "0xFFD700"}
            x: 10
            y: ${y + 4}
            clickable: false
        - label:
            id: name_${p.key}
            text: "${p.label}"
            text_font: prayer_name_font
            text_color: 0xDDDDDD
            x: 40
            y: ${y + 6}
            clickable: false
        - label:
            id: time_${p.key}
            text: "--:--"
            text_font: prayer_time_font
            text_color: 0xFFFFFF
            align: TOP_RIGHT
            x: -12
            y: ${y + 4}
            clickable: false`;
  }).join("\n");

  return `
# --- DISPLAY PAGE CONFIG ---
lvgl:
  displays:
    - my_display
  touchscreens:
    - my_touchscreen
  pages:
    - id: main_page
      bg_color: 0x0f1419
      widgets:
        # ====== HEADER ======
        - label:
            id: label_clock
            text: "--:--"
            text_font: clock_font
            text_color: 0xFFFFFF
            align: TOP_MID
            y: 4
        - label:
            id: label_date
            text: "--- --/--"
            text_font: date_font
            text_color: 0xAAAAAA
            align: TOP_MID
            y: 40

        # ====== DIVIDER ======
        - obj:
            x: 8
            y: 58
            width: 304
            height: 1
            bg_color: 0x334455
            bg_opa: COVER
            border_width: 0
            radius: 0
            scrollbar_mode: "OFF"
            clickable: false

        # ====== PRAYER TIME ROWS ======
${prayerWidgets}
`;
}

function generatePrayerTimesTimeConfig(): string {
  return `
# --- TIME (SNTP – no Home Assistant needed) ---
time:
  - platform: sntp
    id: esptime
    timezone: Europe/London
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
      # Re-fetch prayer times at midnight
      - seconds: 0
        minutes: 1
        hours: 0
        then:
          - script.execute: fetch_prayer_times
`;
}

function generateFetchScript(): string {
  // Build lambda that parses JSON and updates each prayer time label
  const parseLines = PRAYERS.map(
    (p) =>
      `                      auto ${p.key} = root["prayer_times"]["${p.key}"].as<std::string>();
                      id(prayer_${p.key}) = ${p.key};`,
  ).join("\n");

  const updateLabels = PRAYERS.map(
    (p) => `              - lvgl.label.update:
                  id: time_${p.key}
                  text: !lambda 'return id(prayer_${p.key});'`,
  ).join("\n");

  return `
# --- FETCH PRAYER TIMES SCRIPT ---
script:
  - id: fetch_prayer_times
    mode: single
    then:
      - logger.log: "Fetching prayer times from API..."
      - http_request.get:
          url: \${prayer_api_url}
          capture_response: true
          on_response:
            then:
              - lambda: |-
                  if (response->status_code == 200) {
                    json::parse_json(body, [](JsonObject root) -> bool {
${parseLines}
                      id(last_fetch_ok) = true;
                      ESP_LOGI("prayer", "Prayer times updated successfully");
                      return true;
                    });
                  } else {
                    ESP_LOGW("prayer", "HTTP error: %d", response->status_code);
                  }
${updateLabels}

# --- PERIODIC REFRESH ---
interval:
  - interval: \${prayer_refresh_seconds}s
    then:
      - script.execute: fetch_prayer_times
`;
}

export function generatePrayerTimesYaml(config: ConfigData): string {
  return (
    generateHeader() +
    generatePrayerTimesSubstitutions(config) +
    generatePrayerTimesBoilerplate(config) +
    generatePrayerTimesFonts() +
    generatePrayerTimesGlobals() +
    generatePrayerTimesTimeConfig() +
    generatePrayerTimesLvgl() +
    generateLightConfig() +
    generateFetchScript()
  );
}
