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

  return `substitutions:
  # --- Device ---
  device_name: "${config.deviceName}"
  friendly_name: "${config.friendlyName}"

  # --- Prayer Times API ---
  prayer_api_url: "${buildApiUrl(config)}"
  prayer_city: "${city}"
  prayer_school: "${school}"
`;
}

function generatePrayerTimesBoilerplate(config: ConfigData): string {
  const { deviceName } = config;
  const p = getEffectivePins(config);
  const pt = config.prayerTimes;
  const useSpiTouch = isSpiTouch(p);
  const useI2cTouch = isI2cTouch(p);
  // CYD onboard RGB LED: GPIO 4 (R), 16 (G), 17 (B) — active low (inverted)
  const ledEnabled = !!pt?.prayerLedEnabled;
  const ledR = pt?.prayerLedR ?? "GPIO4";
  const ledG = pt?.prayerLedG ?? "GPIO16";
  const ledB = pt?.prayerLedB ?? "GPIO17";
  const ledOutputBlock = ledEnabled
    ? `
  - platform: ledc
    pin: ${ledR}
    id: prayer_led_r
    inverted: true
  - platform: ledc
    pin: ${ledG}
    id: prayer_led_g
    inverted: true
  - platform: ledc
    pin: ${ledB}
    id: prayer_led_b
    inverted: true`
    : "";

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
  on_connect:
    - logger.log: "WiFi connected, fetching prayer times..."
    - script.execute: fetch_prayer_times

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
${ledOutputBlock}
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

function generatePrayerTimesGlobals(config: ConfigData): string {
  const lines = PRAYERS.map(
    (p) => `  - id: prayer_${p.key}
    type: std::string
    restore_value: false
    initial_value: '"--:--"'`,
  );

  return `
# --- GLOBALS (prayer time storage + LED debounce) ---
globals:
${lines.join("\n")}
  - id: last_fetch_ok
    type: bool
    restore_value: false
    initial_value: "false"
  - id: last_prayer_triggered
    type: std::string
    restore_value: false
    initial_value: '""'
  - id: last_prayer_trigger_date
    type: int
    restore_value: false
    initial_value: "0"
`;
}

function generatePrayerTimesLvgl(): string {
  // Match HAMon display: swap_xy true → logical size 320 (W) x 240 (H). All layout fits within that.
  // HAMon uses: clock y:5, date y:55; we use same header style. Divider at 58, rows from 60.
  // 6 rows × 30px = 180px; 60 + 180 = 240 exactly (no vertical overflow).
  const SCREEN_W = 240;
  const ROW_START = 80;
  const ROW_HEIGHT = 40;

  const prayerWidgets = PRAYERS.map((p, i) => {
    const y = ROW_START + i * ROW_HEIGHT;
    const bgWidget =
      i % 2 === 1
        ? `
        - obj:
            x: 0
            y: ${y}
            width: ${SCREEN_W}
            height: ${ROW_HEIGHT}
            bg_color: 0x141414
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
            y: ${y + 6}
            clickable: false
        - label:
            id: name_${p.key}
            text: "${p.label}"
            text_font: prayer_name_font
            text_color: 0xDDDDDD
            x: 40
            y: ${y + 10}
            clickable: false
        - label:
            id: time_${p.key}
            text: "--:--"
            text_font: prayer_time_font
            text_color: 0xFFFFFF
            align: TOP_RIGHT
            x: -12
            y: ${y + 6}
            clickable: false`;
  }).join("\n");

  return `
# --- DISPLAY PAGE CONFIG (same as HAMon: 320x240 logical) ---
lvgl:
  displays:
    - my_display
  touchscreens:
    - my_touchscreen
  pages:
    - id: main_page
      bg_color: 0x000000
      widgets:
        # ====== HEADER (match HAMon: clock y:5, date y:55) ======
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
            text_color: 0xFFFFFF
            align: TOP_MID
            y: 55

        # ====== PRAYER TIME ROWS ======
${prayerWidgets}
`;
}

function generatePrayerTimesTimeConfig(config: ConfigData): string {
  const pt = config.prayerTimes;
  const ledEnabled = !!pt?.prayerLedEnabled;
  // Build lambda: compare current HH:MM to each prayer; debounce; optionally execute prayer_led_flash.
  const triggerLine = ledEnabled ? "id(prayer_led_flash).execute();" : "";
  const prayerChecks = PRAYERS.map(
    (p, i) => {
      const suffix = i < PRAYERS.length - 1 ? "} else " : "}";
      return `if (id(prayer_${p.key}) == current_str && id(prayer_${p.key}) != "--:--" && (id(last_prayer_triggered) != "${p.key}" || id(last_prayer_trigger_date) != today)) {
                id(last_prayer_triggered) = "${p.key}";
                id(last_prayer_trigger_date) = today;
                ${triggerLine}
              ${suffix}`;
    },
  ).join("");
  const lambdaBody = `auto now = id(esptime).now();
              if (!now.is_valid()) return;
              char buf[6];
              sprintf(buf, "%02d:%02d", now.hour, now.minute);
              std::string current_str(buf);
              int today = now.day_of_year;
              ${prayerChecks}`;

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
      # Every minute: check if current time matches a prayer (for LED alert)
      - seconds: 0
        minutes: '*'
        then:
          - lambda: |-
              ${lambdaBody}
      # Daily fetch at 12:01am (prayer times don't change until next day)
      - seconds: 0
        minutes: 1
        hours: 0
        then:
          - logger.log: "Daily 12:01am: fetching prayer times..."
          - script.execute: fetch_prayer_times
`;
}

function generatePrayerLedLightEntry(config: ConfigData): string {
  const pt = config.prayerTimes;
  if (!pt?.prayerLedEnabled) return "";
  return `
  - platform: rgb
    id: prayer_led
    red: prayer_led_r
    green: prayer_led_g
    blue: prayer_led_b`;
}

function generateFetchFeedbackActions(config: ConfigData): string {
  const pt = config.prayerTimes;
  if (!pt?.prayerLedEnabled) return "";
  return `
              - if:
                  condition:
                    lambda: "return id(last_fetch_ok);"
                  then:
                    - script.execute: prayer_led_flash_blue_5
                  else:
                    - script.execute: prayer_led_flash_red_5`;
}

function generatePrayerLedScript(config: ConfigData): string {
  const pt = config.prayerTimes;
  if (!pt?.prayerLedEnabled) return "";
  const greenFlash = `
  - id: prayer_led_flash
    mode: single
    then:
      - repeat:
          count: 10
          then:
            - light.turn_on:
                id: prayer_led
                brightness: 100%
                red: 0%
                green: 100%
                blue: 0%
            - delay: 250ms
            - light.turn_off:
                id: prayer_led
            - delay: 250ms`;
  const blueFlash = `
  - id: prayer_led_flash_blue_5
    mode: single
    then:
      - repeat:
          count: 5
          then:
            - light.turn_on:
                id: prayer_led
                brightness: 100%
                red: 0%
                green: 0%
                blue: 100%
            - delay: 250ms
            - light.turn_off:
                id: prayer_led
            - delay: 250ms`;
  const redFlash = `
  - id: prayer_led_flash_red_5
    mode: single
    then:
      - repeat:
          count: 5
          then:
            - light.turn_on:
                id: prayer_led
                brightness: 100%
                red: 100%
                green: 0%
                blue: 0%
            - delay: 250ms
            - light.turn_off:
                id: prayer_led
            - delay: 250ms`;
  return `${greenFlash}${blueFlash}${redFlash}`;
}

function generateFetchScript(config: ConfigData): string {
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
      - logger.log: "URL: \${prayer_api_url}"
      - http_request.get:
          url: \${prayer_api_url}
          capture_response: true
          on_response:
            then:
              - lambda: |-
                  id(last_fetch_ok) = false;
                  ESP_LOGI("prayer", "Response status=%d size=%zu", response->status_code, body.size());
                  if (response->status_code == 200) {
                    bool ok = json::parse_json(body, [](JsonObject root) -> bool {
${parseLines}
                      id(last_fetch_ok) = true;
                      ESP_LOGI("prayer", "Prayer times parsed: fajr=%s zuhr=%s maghrib=%s",
                          id(prayer_fajr).c_str(), id(prayer_zuhr).c_str(), id(prayer_maghrib).c_str());
                      return true;
                    });
                    if (!ok) {
                      ESP_LOGE("prayer", "JSON parse failed, body size=%zu", body.size());
                    }
                  } else {
                    ESP_LOGW("prayer", "HTTP error %d", response->status_code);
                  }
${updateLabels}
              - logger.log: "Prayer times display labels updated"
${generateFetchFeedbackActions(config)}
${generatePrayerLedScript(config)}
`;
}

export function generatePrayerTimesYaml(config: ConfigData): string {
  return (
    generateHeader() +
    generatePrayerTimesSubstitutions(config) +
    generatePrayerTimesBoilerplate(config) +
    generatePrayerTimesFonts() +
    generatePrayerTimesGlobals(config) +
    generatePrayerTimesTimeConfig(config) +
    generatePrayerTimesLvgl() +
    generateLightConfig() +
    generatePrayerLedLightEntry(config) +
    generateFetchScript(config)
  );
}
