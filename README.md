# 📱 HAMon - Home Assistant Monitor for CYD

A clean, compact clock and sensor dashboard for the **ESP32-2432S028** (the "Cheap Yellow Display" or CYD), built with **ESPHome** and **LVGL**.
Try out the new [YAML generator](https://cheapyellowdisplay.co.uk/) - please note: it's not perfect and is a work in progress!

Monitor Home Assistant entities on one required screen, then add extra swipeable pages as needed — binary sensors (doors, motion), numeric sensors (energy, temperature), text sensors, lights, switches, and tap actions — with per-page colours, optional background images, and an optional clock on page 1. 

| | | |
|:---:|:---:|:---:|
| ![20260213_235106](https://github.com/user-attachments/assets/99bfc8c4-c0c2-44e1-9d4a-47e458e7c839) | ![20260213_235117](https://github.com/user-attachments/assets/7fbf26a3-531f-4137-b899-66bd2b57e955)| ![20260213_235130](https://github.com/user-attachments/assets/c4d557f9-7293-4593-9806-2214761aeca7)|
| Front view | Rear view | Close-up |





## ✨ Features

- **YAML Generator Visual Editor:** The [YAML generator](https://cheapyellowdisplay.co.uk/) makes it super easy to configure your CYD, without you having to modify YAML files!
- **Clock & Date Header:** Large time display with day and date, synced from Home Assistant.
- **Swipeable extra pages:** Screen 1 is required. Add up to five extra screens (six total), each pre-filled with sample entities. With the clock, Screen 1 has 6 slots and extra screens have 8; hide the clock for 8 on Screen 1 as well. Swipe left/right on the CYD when more than one screen is configured.
- **Per-page themes:** Background colour, font colour, named theme presets, and optional background images compiled into flash.
- **Enable/disable slots:** Leave unused blocks empty without generating unused Home Assistant subscriptions.
- **On-device web UI:** Optional ESPHome `web_server` v3 so you can open the device IP to view entities and set backlight brightness.
- **Display tweaks:** Swap X/Y (default on), invert colours, RGB/BGR, and mirror X/Y — stock CYD defaults stay as they were.
- **Dynamic Colours:** Icons and values change colour based on state or configurable thresholds.
- **Easy Configuration:** All entities, icons, labels, colours, and state messages are defined in the `substitutions:` block — no need to touch any code.
- **Instant State:** Binary sensors display their current state immediately on boot using `publish_initial_state`.
- **Google Fonts:** Uses Roboto and either Material Design Icons or Material Symbols, downloaded automatically.
- **Icon Picker:** The YAML generator includes a built-in icon picker — browse and select icons visually from either **Material Design Icons** or **Material Symbols** without needing to look up any hex codes.
- **Device GPIO Presets:** Choose from 2 built-in board presets (**SPI touch / XPT2046** and **I2C touch / CST816**), or configure every GPIO pin manually for custom hardware.

## 🛠️ Hardware

The board, display and touch are all one item - the CYD! This is listed out below for your benefit to identify the model numbers of these components.

| Component | Details |
|-----------|---------|
| **Board** | ESP32-2432S028 (CYD) |
| **Display** | [2.8" ILI9341 CYD Board (USB-C)](https://amzn.to/3ZEIfdV) |
| **Touch** | XPT2046 (resistive, onboard) |
| **Case** | [Aura Smart Display Case (USB-C variant)](https://makerworld.com/en/models/1382304-aura-smart-weather-forecast-display#profileId-1430951) |
| **Adapter** | [USB-C 90° Right Angle Adapter](https://amzn.to/409Eayt) |

> **Note:** Make sure you get the **USB-C** version of the CYD board. The 3D printed case linked above is specifically designed for the USB-C port variant. The 90° USB-C adapter allows a clean cable run out of the case.
> External links are affiliate links which help me keep projects like this going!

## 🚀 Installation

### 1. Prerequisites

- [Home Assistant](https://www.home-assistant.io/) installed and running.
- The [ESPHome Add-on](https://esphome.io/guides/getting_started_hassio.html) installed in Home Assistant.
- Your CYD board connected to your computer via USB-C.

### 2. Install the ESPHome Add-on (if not already installed)

1. In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**.
2. Search for **ESPHome**.
3. Click **Install**, then **Start**.
4. Enable **Show in sidebar** for easy access.

### 3. Create a New Device in ESPHome

1. Open **ESPHome** from the Home Assistant sidebar.
2. Click **+ New Device** (bottom right).
3. Click **Continue**, then give your device a name (e.g., `hamon`).
4. Select **ESP32** as the device type.
5. Click **Next** — ESPHome will generate a basic configuration with an API key and OTA password.
6. Click **Skip** (we'll install manually).

### 4. Add Your Secrets

Before flashing, make sure your `secrets.yaml` file (in the ESPHome config directory) contains:

```yaml
wifi_ssid: "your-wifi-network-name"
wifi_password: "your-wifi-password"
api_key: "the-api-key-generated-by-esphome"
ota_password: "the-ota-password-generated-by-esphome"
ap_password: "any-fallback-hotspot-password"
```

> **Tip:** The `api_key` and `ota_password` are shown when you first create the device. Copy them into `secrets.yaml` before proceeding.

### 5. Flash the Configuration

1. In ESPHome, click **Edit** on your new device.
2. **Replace the entire contents** with the `ha-monitor.yaml` file from this repository.
3. Update the `substitutions:` section with your own Home Assistant entity IDs (see [Configuration](#%EF%B8%8F-configuration) below).
4. Click **Save**.
5. Click **Install** → **Plug into this computer** (for first-time USB flash).
6. Select the correct USB/serial port and wait for the flash to complete.

### 6. Add the Device to Home Assistant
> **Important:** you must add the device to Home Assistant otherwise your HAMon device will not receive any state updates!

1. After flashing, the device will connect to your Wi-Fi and appear in Home Assistant.
2. Go to **Settings** → **Devices & Services**.
3. You should see a notification: **"New device discovered: HAMon"** — click **Configure**.
4. Enter the API encryption key (the same one from your `secrets.yaml`).
5. Click **Submit** — your sensors will now stream data to the display.

> **Future updates** can be done wirelessly (OTA) — just click **Install** → **Wirelessly** in ESPHome.

## 🌐 Web Configuration Generator

A web-based configuration generator is available in the `config-generator/` directory. This tool provides an interactive interface to customize your HAMon dashboard without manually editing YAML files.

### Features
- Visual sensor configuration
- Icon picker with support for **Material Design Icons** and **Material Symbols**
- Device GPIO preset selection (SPI touch / I2C touch / custom)
- Color customization
- Real-time YAML generation
- One-click copy to clipboard

### Usage

1. Navigate to the config-generator directory:
```bash
cd config-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

5. Configure your sensors and copy the generated YAML into your ESPHome device configuration.

## ⚙️ Configuration

All customisation is done in the `substitutions:` block at the top of the YAML file. No need to edit any code below it.

### Sensor Slot Layout

The dashboard has a 3×2 grid:

| | Column 1 | Column 2 |
|---|---|---|
| **Row 1** | `r1c1` — Numeric Sensor | `r1c2` — Binary Sensor |
| **Row 2** | `r2c1` — Numeric Sensor | `r2c2` — Binary Sensor |
| **Row 3** | `r3c1` — Binary Sensor | `r3c2` — Binary Sensor |

### Configuring a Binary Sensor Slot

```yaml
substitutions:
  r1c2_entity: "binary_sensor.front_door_sensor_contact"  # HA entity ID
  r1c2_type: "binary"                                      # Entity type
  r1c2_label: "Front Door"                                 # Display label
  r1c2_icon: "\ueffc"                                      # Material Icon code
  r1c2_icon_color: "0x888888"                               # Default icon colour
  r1c2_state_on: "Open"                                     # Text when ON
  r1c2_state_off: "Closed"                                  # Text when OFF
  r1c2_color_on: "0xFF5252"                                 # Colour when ON (red)
  r1c2_color_off: "0x32CD32"                                # Colour when OFF (green)
```

### Configuring a Numeric Sensor Slot

```yaml
substitutions:
  r1c1_entity: "sensor.whole_home_energy_usage"  # HA entity ID
  r1c1_type: "sensor"                             # Entity type
  r1c1_label: "Energy"                            # Display label
  r1c1_icon: "\uea0b"                             # Material Icon code
  r1c1_icon_color: "0xFFA500"                      # Default icon colour
  r1c1_format: "%.0fW"                             # Printf format string
  r1c1_color_thresh_high: "5000"                   # Red threshold
  r1c1_color_thresh_mid: "3000"                    # Orange threshold
  r1c1_color_thresh_low: "1000"                    # Amber threshold
```

### Troubleshooting

**Display rotated or only 4 sensors visible with blank space**

Some CYD board variants need a different display orientation. In your ESPHome YAML, under `display:` → `transform:`, change `swap_xy` from `true` to `false`, then re-flash (USB or OTA):

```yaml
display:
  transform:
    swap_xy: false
```

If you use the [web config generator](https://cheapyellowdisplay.co.uk/), open **Display Settings** and turn off **Swap X/Y axes**, then copy the updated YAML.

## 🎨 How to Change Icons

This project supports two icon sets that you can choose between in the YAML generator:

- **Material Design Icons** — classic community icon set (default)
- **Material Symbols** — Google's icon set ([fonts.google.com/icons](https://fonts.google.com/icons))

### Using the Icon Picker (recommended)

The easiest way to pick an icon is through the [YAML generator](https://cheapyellowdisplay.co.uk/):

1. Select your preferred **Icon set** in the Device Settings panel.
2. Click the icon button next to any sensor slot — this opens the built-in **icon picker**.
3. Browse by category or type to search by name.
4. Click any icon to select it — the correct code is inserted automatically.

No need to look up hex codepoints manually!

### Manual icon codes

If you prefer to edit the YAML directly, icons are specified as Unicode escape sequences in the `substitutions:` block. The codepoint can be found on [fonts.google.com/icons](https://fonts.google.com/icons) — convert it to lowercase and prefix with `\u` (e.g., `\uea0b`).

> **Important:** Add each **unique** icon to the `icon_glyphs` substitution. If you use the same icon for multiple sensors (e.g., the same door icon for front door and back door), only include it once in `icon_glyphs` to avoid "duplicate glyph" errors.

**Example:**
```yaml
substitutions:
  # List each unique icon once (no duplicates!)
  icon_glyphs: "\ueffc\ue88a\ue1ff"  # door, home, thermometer
  
  r1c1_icon: "\ueffc"  # front door
  r1c2_icon: "\ueffc"  # back door (same icon - OK!)
  r2c1_icon: "\ue88a"  # garage
  r2c2_icon: "\ue1ff"  # temperature
```

### Common Icons Reference

| Icon | Code | Description |
|------|------|-------------|
| ⚡ | `\uea0b` | Bolt (energy/power) |
| 🚪 | `\ueffc` | Door front |
| 🌡️ | `\ue1ff` | Thermostat |
| 🏠 | `\ue88a` | Home |
| 👤 | `\ue7fd` | Person |
| 🔒 | `\ue897` | Lock open |
| 🚧 | `\ue559` | Fence/gate |

## 🎨 Colour Reference

Colours are specified as hex values without the `#`:

| Colour | Code | Usage |
|--------|------|-------|
| 🔴 Red | `0xFF5252` | Alert / open / hot |
| 🟢 Green | `0x32CD32` | OK / closed / normal |
| 🟠 Orange | `0xFFA500` | Warning / medium |
| 🔵 Blue | `0x00BFFF` | Cold / info |
| ⚪ Grey | `0x888888` | Inactive / default |

## 🔡 Custom Fonts & Glyphs

The dashboard uses Google's **Roboto** font for text and **Material Icons** for icons. If you need additional characters (e.g., `€`, `£`) or the state text uses characters not in the default set, add them to the `glyphs:` string under `state_font` in the YAML file.

## 🗺️ Roadmap

Planned features for future releases:

- [ ] **Choose Orientation:** Switch between landscape and portrait modes via a substitution toggle.
- [ ] **Tap to Open Page:** Tap any sensor icon to open a detailed LVGL page with history, graphs, or controls.
- [x] **Swipe & Gestures:** Swipe between multiple dashboard pages with gesture navigation.
- [ ] **External LED Control:** Drive addressable LEDs (e.g., WS2812B) to reflect sensor states — flash red on door open, glow green when all clear, etc.


## 🤝 Contributing

Feel free to fork this project and submit pull requests! See the [Roadmap](#%EF%B8%8F-roadmap) above for planned features.

Multi-page swipe, per-page themes, background images, and the on-device web server were contributed from work by [jchisholm59](https://github.com/jchisholm59). The hand-written [`ha-monitor.yaml`](ha-monitor.yaml) remains a simple 6-slot reference; use the [YAML generator](https://cheapyellowdisplay.co.uk/) for 3-page configs.

**Background images:** pick a file in the generator (or type a path such as `images/bg_home.png`). The same file must exist on your ESPHome host at compile time, typically `/config/esphome/images/`. Images are resized to 240×320 and compiled into flash — they are not fetched from Home Assistant at runtime.

## 📄 License

This project is licensed under the **MIT License**. See the header of `hamon.yaml` for the full license text.

Inspired by [drrcastro's CYD Smart Dashboard for Home Assistant](https://github.com/drrcastro/CYD-Smart-Dashboard-for-Home-Assistant)
