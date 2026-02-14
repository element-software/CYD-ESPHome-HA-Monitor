# 📱 HAMon - Home Assistant Monitor for CYD

A clean, compact clock and sensor dashboard for the **ESP32-2432S028** (the "Cheap Yellow Display" or CYD), built with **ESPHome** and **LVGL**.

Inspired by [drrcastro's CYD Smart Dashboard for Home Assistant](https://github.com/drrcastro/CYD-Smart-Dashboard-for-Home-Assistant)

Monitor 6 Home Assistant entities at a glance — binary sensors (doors, motion) and numeric sensors (energy, temperature) — with dynamic colour-coded status indicators.

| | | |
|:---:|:---:|:---:|
| ![20260213_235106](https://github.com/user-attachments/assets/99bfc8c4-c0c2-44e1-9d4a-47e458e7c839) | ![20260213_235117](https://github.com/user-attachments/assets/7fbf26a3-531f-4137-b899-66bd2b57e955)| ![20260213_235130](https://github.com/user-attachments/assets/c4d557f9-7293-4593-9806-2214761aeca7)|
| Front view | Rear view | Close-up |





## ✨ Features

- **Clock & Date Header:** Large time display with day and date, synced from Home Assistant.
- **6 Customisable Sensor Slots:** 2 numeric sensors + 4 binary sensors in a compact 3×2 grid layout.
- **Dynamic Colours:** Icons and values change colour based on state or configurable thresholds.
- **Easy Configuration:** All entities, icons, labels, colours, and state messages are defined in the `substitutions:` block — no need to touch any code.
- **Instant State:** Binary sensors display their current state immediately on boot using `publish_initial_state`.
- **Google Fonts:** Uses Roboto and Material Icons, downloaded automatically.

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
2. **Replace the entire contents** with the `hamon.yaml` file from this repository.
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
  r1c1_label: "Energy"                            # Display label
  r1c1_icon: "\uea0b"                             # Material Icon code
  r1c1_icon_color: "0xFFA500"                      # Default icon colour
  r1c1_format: "%.0fW"                             # Printf format string
  r1c1_color_thresh_high: "5000"                   # Red threshold
  r1c1_color_thresh_mid: "3000"                    # Orange threshold
  r1c1_color_thresh_low: "1000"                    # Amber threshold
```

## 🎨 How to Change Icons

This project uses **Google Material Icons**.

1. Go to [Google Material Symbols](https://fonts.google.com/icons).
2. Find an icon you like.
3. Click on it and look for the **Codepoint** (e.g., `EA0B`).
4. Convert to lowercase and prefix with `\u` in your YAML config (e.g., `\uea0b`).
5. The glyphs are automatically included from the substitutions — no need to manually edit the `glyphs:` string.

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
- [ ] **Swipe & Gestures:** Swipe between multiple dashboard pages with gesture navigation.
- [ ] **External LED Control:** Drive addressable LEDs (e.g., WS2812B) to reflect sensor states — flash red on door open, glow green when all clear, etc.


## 🤝 Contributing

Feel free to fork this project and submit pull requests! See the [Roadmap](#%EF%B8%8F-roadmap) above for planned features.

## 📄 License

This project is licensed under the **MIT License**. See the header of `hamon.yaml` for the full license text.

Copyright (c) 2026 element-software
