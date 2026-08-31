import type { SensorConfig, ScreenConfig } from "@/types/config";

function getOnClickBlock(sensor: SensorConfig): string {
  if (sensor.type === "light" || sensor.type === "switch" || sensor.type === "input_boolean") {
    const toggleAction =
      sensor.type === "light"
        ? "light.toggle"
        : sensor.type === "input_boolean"
          ? "input_boolean.toggle"
          : "switch.toggle";
    return `
            on_click:
              - homeassistant.action:
                  action: ${toggleAction}
                  data:
                    entity_id: "${sensor.entity}"`;
  }
  if (sensor.type === "action") {
    return `
            on_click:
              - homeassistant.action:
                  action: \${${sensor.id}_action}
                  data:
                    entity_id: "\${${sensor.id}_entity}"`;
  }
  return "";
}

export function generateLvglWidget(
  sensor: SensorConfig | undefined,
  row: number,
  col: number,
  hideClock: boolean,
  buttonRadius: number = 0,
): string {
  if (!sensor) return "";
  if (sensor.enabled === false) return "";

  const xPos = col === 1 ? 2 : 121;
  const yPos = hideClock ? 6 + (row - 1) * 78 : 100 + (row - 1) * 70;
  const isClickable =
    sensor.type === "light" ||
    sensor.type === "switch" ||
    sensor.type === "input_boolean" ||
    sensor.type === "action";
  const onClickBlock = getOnClickBlock(sensor);
  const valueText =
    sensor.type === "action" ? `"\${${sensor.id}_action_text}"` : '"--"';

  const screenId = sensor.id.includes("_") ? sensor.id.split("_")[0] : "s1";
  const fontColorSub = `\${${screenId}_font_color}`;

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
            scrollbar_mode: "OFF"${isClickable ? onClickBlock : ""}
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
                  text_color: ${fontColorSub}
                  align: LEFT_MID
                  x: 32
                  y: -10
                  clickable: false
              - label:
                  id: val_${sensor.id}
                  text: ${valueText}
                  text_font: state_font
                  text_color: ${fontColorSub}
                  align: LEFT_MID
                  x: 32
                  y: 10
                  clickable: false`;
}

function getClockWidgets(hideClock: boolean, screenId: string = "s1"): string {
  if (hideClock) return "";
  return `
        - label:
            id: label_clock
            text: "--:--"
            text_font: clock_font
            text_color: \${${screenId}_font_color}
            align: TOP_MID
            y: 15
        - label:
            id: label_date
            text: "--- --/--"
            text_font: date_font
            text_color: \${${screenId}_font_color}
            align: TOP_MID
            y: 65
`;
}

function generateScreenWidgets(
  screenId: string,
  showClock: boolean,
  getSensor: (id: string) => SensorConfig | undefined,
  buttonRadius: number,
): string {
  const clockWidgets = getClockWidgets(!showClock, screenId);
  const rows = showClock ? 3 : 4;
  const widgets: string[] = [];
  let hasActualWidget = false;

  if (clockWidgets) {
    widgets.push(clockWidgets);
    hasActualWidget = true;
  }

  for (let r = 1; r <= rows; r++) {
    widgets.push(`        # ====== ROW ${r} ======`);
    const s1 = getSensor(`${screenId}_r${r}c1`);
    const s2 = getSensor(`${screenId}_r${r}c2`);
    if (s1) {
      const w1 = generateLvglWidget(s1, r, 1, !showClock, buttonRadius);
      if (w1) {
        widgets.push(w1);
        hasActualWidget = true;
      }
    }
    if (s2) {
      const w2 = generateLvglWidget(s2, r, 2, !showClock, buttonRadius);
      if (w2) {
        widgets.push(w2);
        hasActualWidget = true;
      }
    }
  }

  if (!hasActualWidget) {
    widgets.push(`        - label:
            id: ${screenId}_placeholder
            text: ""`);
  }

  return widgets.join("\n");
}

export function generateLvglConfig(
  sensors: SensorConfig[],
  getSensor: (id: string) => SensorConfig | undefined,
  hideClock: boolean,
  buttonRadius: number = 0,
  screens?: ScreenConfig[],
): string {
  const pages = screens?.length
    ? screens
    : [{ id: "s1", name: "Screen 1", sensors: [] }];
  const pageCount = pages.length;

  const pageBlocks = pages.map((screen, index) => {
    const bgImg = screen.backgroundImage?.trim()
      ? `\n      bg_image_src: ${screen.id}_bg_image`
      : "";
    const showClock = index === 0 && !hideClock;
    const swipe =
      pageCount < 2
        ? ""
        : `
      on_swipe_left:
        - lvgl.page.show:
            id: page_${pages[(index + 1) % pageCount].id}
            animation: MOVE_LEFT
      on_swipe_right:
        - lvgl.page.show:
            id: page_${pages[(index - 1 + pageCount) % pageCount].id}
            animation: MOVE_RIGHT`;

    return `    - id: page_${screen.id}
      bg_color: \${${screen.id}_bg_color}${bgImg}${swipe}
      widgets:
${generateScreenWidgets(screen.id, showClock, getSensor, buttonRadius)}`;
  });

  return `
# --- DISPLAY PAGE CONFIG ---
lvgl:
  displays:
    - my_display
  touchscreens:
    - my_touchscreen
  pages:
${pageBlocks.join("\n\n")}
`;
}
