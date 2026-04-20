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

  # --- Display balance (tune if text is hard to read or screen too dim) ---
  default_backlight: "0.75"
  bg_image_opa: "40%"

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
  on_boot:
    then:
      - delay: 2s
      - lvgl.widget.redraw:
      - light.turn_on:
          id: backlight
          brightness: \${default_backlight}
          transition_length: 0.5s

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
    - lvgl.widget.redraw:
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
  return `
# --- FONTS (match preview: clock, AM/PM, Gregorian, date, countdown, next prayer) ---
font:
  - file: "gfonts://Roboto"
    id: clock_font
    size: 48
    glyphs: '0123456789: '
  - file: "gfonts://Roboto"
    id: ampm_font
    size: 20
    glyphs: "AMP "
  - file: "gfonts://Roboto"
    id: label_font
    size: 14
    glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
  - file: "gfonts://Roboto"
    id: date_font
    size: 16
    glyphs: "0123456789/ "
  - file: "gfonts://Roboto"
    id: countdown_font
    size: 30
    glyphs: '0123456789'
  - file: "gfonts://Roboto"
    id: countdown_label_font
    size: 11
    glyphs: "Nextpray "
  - file: "gfonts://Roboto"
    id: next_prayer_font
    size: 22
    glyphs: "0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz "
image:
  - file: "images/pt-bg-dark.png"
    id: pt_bg
    type: rgb565
    resize: 480x320
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
# --- GLOBALS (prayer times from API + next-prayer display + LED debounce) ---
globals:
${lines.join("\n")}
  - id: next_prayer_name
    type: std::string
    restore_value: false
    initial_value: '"--"'
  - id: next_prayer_time
    type: std::string
    restore_value: false
    initial_value: '"--:--"'
  - id: minutes_until_next
    type: int
    restore_value: false
    initial_value: "0"
  - id: total_minutes_interval
    type: int
    restore_value: false
    initial_value: "60"
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
  // Match preview: swap_xy true → logical 320 (W) x 240 (H). Layout: AM/PM top-right, clock, Gregorian, date, countdown arc, next prayer.
  return `
# --- DISPLAY PAGE CONFIG (matches preview: clock, Gregorian date, countdown ring, next prayer) ---
lvgl:
  displays:
    - my_display
  touchscreens:
    - my_touchscreen
  pages:
    - id: main_page
      bg_color: 0x0c0c0c
      bg_image_src: pt_bg
      bg_image_opa: \${bg_image_opa}
      widgets:
        # ----- Centered container: arc behind, then countdown text on top -----
        - obj:
            align: CENTER
            x: 0
            y: 30
            width: 150
            height: 150
            bg_opa: 0
            border_width: 0
            radius: 0
            scrollbar_mode: "OFF"
            clickable: false
            widgets:
              - arc:
                  id: arc_countdown
                  x: 0
                  y: 0
                  width: 75
                  height: 75
                  value: 30
                  min_value: 0
                  max_value: 60
                  start_angle: 0
                  end_angle: 360
                  rotation: 270
                  adjustable: false
                  clickable: false
                  main:
                    bg_opa: 0
                    arc_width: 5
                    arc_rounded: true
                  indicator:
                    arc_color: 0xC8A030
                    arc_width: 5
                    arc_rounded: true
                  knob:
                    width: 0
                    height: 0
              - label:
                  id: label_countdown_minutes
                  text: "30"
                  text_font: countdown_font
                  text_color: 0xFFFFFF
                  align: CENTER
                  x: 0
                  y: -8
                  clickable: false
              - label:
                  id: label_next_prayer_hint
                  text: "Next prayer"
                  text_font: countdown_label_font
                  text_color: 0xBFBFBF
                  align: CENTER
                  x: 0
                  y: 22
                  clickable: false
        # ----- AM/PM top-right -----
        - label:
            id: label_ampm
            text: "PM"
            text_font: ampm_font
            text_color: 0xB3B3B3
            align: TOP_RIGHT
            x: -16
            y: 8
            clickable: false
        # ----- Large clock (12-hour, centered) -----
        - label:
            id: label_clock
            text: "--:--"
            text_font: clock_font
            text_color: 0xFFFFFF
            align: TOP_MID
            y: 28
            clickable: false
        # ----- Gregorian label -----
        - label:
            id: label_gregorian
            text: "Gregorian"
            text_font: label_font
            text_color: 0x999999
            align: TOP_MID
            y: 78
            clickable: false
        # ----- Date dd/mm/yyyy -----
        - label:
            id: label_date
            text: "--/--/----"
            text_font: date_font
            text_color: 0xD9D9D9
            align: TOP_MID
            y: 94
            clickable: false
        # ----- Next prayer name + time at bottom -----
        - label:
            id: label_next_prayer
            text: "Asr 3:15 PM"
            text_font: next_prayer_font
            text_color: 0xFFFFFF
            align: BOTTOM_MID
            x: 0
            y: -20
            clickable: false
`;
}

function generatePrayerTimesTimeConfig(config: ConfigData): string {
  const pt = config.prayerTimes;
  const ledEnabled = !!pt?.prayerLedEnabled;
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

  // Parse each prayer time "HH:MM" to minutes since midnight; find next prayer; set globals.
  const parsePrayerMinutes = PRAYERS.map(
    (p, i) =>
      `int p${i}; { int h, m; if (sscanf(id(prayer_${p.key}).c_str(), "%d:%d", &h, &m) == 2) p${i} = h * 60 + m; else p${i} = -1; }`,
  ).join("\n              ");
  const findNext = `
              auto now = id(esptime).now();
              if (!now.is_valid()) return;
              int cur = now.hour * 60 + now.minute;
              int idx = -1;
              int mins_until = 0;
              int total = 60;
              for (int i = 0; i < 6; i++) {
                int pm = (i==0)?p0:(i==1)?p1:(i==2)?p2:(i==3)?p3:(i==4)?p4:p5;
                if (pm >= 0 && pm > cur) {
                  idx = i;
                  mins_until = pm - cur;
                  int prev_min = (i==0)?p5:(i==1)?p0:(i==2)?p1:(i==3)?p2:(i==4)?p3:p4;
                  total = (pm - prev_min + 24*60) % (24*60);
                  if (total == 0) total = 60;
                  break;
                }
              }
              if (idx < 0 && p0 >= 0) {
                idx = 0;
                mins_until = (24*60 - cur) + p0;
                total = (p0 - p5 + 24*60) % (24*60);
                if (total == 0) total = 60;
              }
              static const char* names[] = {"Fajr", "Sunrise", "Zuhr", "Asr", "Maghrib", "Isha"};
              if (idx >= 0) {
                id(next_prayer_name) = names[idx];
                int next_min = (idx==0)?p0:(idx==1)?p1:(idx==2)?p2:(idx==3)?p3:(idx==4)?p4:p5;
                int nh = next_min / 60, nm = next_min % 60;
                int h12 = nh % 12; if (h12 == 0) h12 = 12;
                char tbuf[32];
                sprintf(tbuf, "%d:%02d %s", h12, nm, nh >= 12 ? "PM" : "AM");
                id(next_prayer_time) = std::string(tbuf);
                id(minutes_until_next) = mins_until;
                id(total_minutes_interval) = total;
              }`;
  const computeNextPrayerLambda = `${parsePrayerMinutes}
              ${findNext}`;

  return `
# --- TIME (SNTP – no Home Assistant needed) ---
time:
  - platform: sntp
    id: esptime
    timezone: Europe/London
    on_time:
      # Every second: update clock (12h), AM/PM, date (dd/mm/yyyy)
      - seconds: 0
        then:
          - lvgl.label.update:
              id: label_clock
              text: !lambda |-
                auto n = id(esptime).now();
                int h = n.hour % 12; if (h == 0) h = 12;
                return str_sprintf("%d:%02d", h, n.minute);
          - lvgl.label.update:
              id: label_ampm
              text: !lambda 'return std::string(id(esptime).now().hour >= 12 ? "PM" : "AM");'
          - lvgl.label.update:
              id: label_date
              text: !lambda 'return id(esptime).now().strftime("%d/%m/%Y");'
          - lambda: |-
              ${computeNextPrayerLambda}
          - lvgl.label.update:
              id: label_next_prayer
              text: !lambda 'return id(next_prayer_name) + " " + id(next_prayer_time);'
          - lvgl.label.update:
              id: label_countdown_minutes
              text: !lambda 'return str_sprintf("%d", id(minutes_until_next));'
          - lvgl.arc.update:
              id: arc_countdown
              value: !lambda 'return id(minutes_until_next);'
              max_value: !lambda 'return id(total_minutes_interval);'
      # Every minute: check if current time matches a prayer (for LED alert)
      - seconds: 0
        minutes: '*'
        then:
          - lambda: |-
              ${lambdaBody}
      # Daily fetch at 12:01am
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
              - logger.log: "Prayer times updated; next clock tick will refresh countdown/next prayer"
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
