import type { SensorConfig } from "@/types/config";

export function generateLvglWidget(
  sensor: SensorConfig | undefined,
  row: number,
  col: number,
  hideClock: boolean,
  buttonRadius: number = 0,
): string {
  if (!sensor) return "";

  const xPos = col === 1 ? 2 : 121;
  const yPos = hideClock ? 6 + (row - 1) * 78 : 100 + (row - 1) * 70;
  const isToggleable = sensor.type === "light" || sensor.type === "switch";
  const toggleAction =
    sensor.type === "light" ? "light.toggle" : "switch.toggle";

  const onClickBlock = isToggleable
    ? `
            on_click:
              - homeassistant.action:
                  action: ${toggleAction}
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
            radius: ${buttonRadius}
            scrollbar_mode: "OFF"${isToggleable ? onClickBlock : ""}
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
                  id: lbl_${sensor.id}
                  text: "\${${sensor.id}_label}"
                  text_font: label_font
                  text_color: 0xFFFFFF
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
}

function getClockWidgets(hideClock: boolean): string {
  if (hideClock) return "";
  return `
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
`;
}

export function generateLvglConfig(
  sensors: SensorConfig[],
  getSensor: (id: string) => SensorConfig | undefined,
  hideClock: boolean,
  buttonRadius: number = 0,
): string {
  const clockWidgets = getClockWidgets(hideClock);
  const row4Widgets = hideClock
    ? `

        # ====== ROW 4 ======${generateLvglWidget(getSensor("r4c1"), 4, 1, hideClock, buttonRadius)}
${generateLvglWidget(getSensor("r4c2"), 4, 2, hideClock, buttonRadius)}`
    : "";

  return `
# --- DISPLAY PAGE CONFIG ---
lvgl:
  displays:
    - my_display
  touchscreens:
    - my_touchscreen
  pages:
    - id: main_page
      bg_color: 0x000000
      widgets:${clockWidgets}
        # ====== ROW 1 ======${generateLvglWidget(getSensor("r1c1"), 1, 1, hideClock, buttonRadius)}
${generateLvglWidget(getSensor("r1c2"), 1, 2, hideClock, buttonRadius)}

        # ====== ROW 2 ======${generateLvglWidget(getSensor("r2c1"), 2, 1, hideClock, buttonRadius)}
${generateLvglWidget(getSensor("r2c2"), 2, 2, hideClock, buttonRadius)}

        # ====== ROW 3 ======${generateLvglWidget(getSensor("r3c1"), 3, 1, hideClock, buttonRadius)}
${generateLvglWidget(getSensor("r3c2"), 3, 2, hideClock, buttonRadius)}${row4Widgets}
`;
}
