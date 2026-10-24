import type { SensorConfig, ScreenConfig } from "@/types/config";

function getOnClickBlock(sensor: SensorConfig, validScreenIds: string[]): string {
  const target = sensor.targetScreen?.trim();
  if (target) {
    if (validScreenIds.includes(target)) {
      return `
            on_click:
              - lvgl.page.show:
                  id: page_${target}`;
    }
    return "";
  }
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
  validScreenIds: string[] = [],
): string {
  if (!sensor) return "";
  if (sensor.enabled === false) return "";

  const xPos = col === 1 ? 2 : 121;
  const yPos = hideClock ? 6 + (row - 1) * 78 : 100 + (row - 1) * 70;
  const onClickBlock = getOnClickBlock(sensor, validScreenIds);
  const isClickable =
    Boolean(sensor.targetScreen?.trim()) ||
    sensor.type === "light" ||
    sensor.type === "switch" ||
    sensor.type === "input_boolean" ||
    sensor.type === "action";
  const valueText =
    sensor.type === "action"
      ? `"\${${sensor.id}_action_text}"`
      : sensor.type === "label"
        ? `"\${${sensor.id}_value_text}"`
        : '"--"';

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
            press_lock: false
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

function getClockWidgets(
  hideClock: boolean,
  screenId: string = "s1",
  clockTargetScreen?: string,
  validScreenIds: string[] = [],
): string {
  if (hideClock) return "";
  const target = clockTargetScreen?.trim();
  const navTarget = target && validScreenIds.includes(target) ? target : undefined;
  if (!navTarget) {
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
  return `
        - button:
            id: button_clock
            align: TOP_MID
            y: 0
            width: 240
            height: 96
            bg_opa: TRANSP
            border_width: 0
            shadow_width: 0
            pad_all: 0
            press_lock: false
            on_click:
              - lvgl.page.show:
                  id: page_${navTarget}
            widgets:
              - label:
                  id: label_clock
                  clickable: false
                  text: "--:--"
                  text_font: clock_font
                  text_color: \${${screenId}_font_color}
                  align: TOP_MID
                  y: 15
              - label:
                  id: label_date
                  clickable: false
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
  validScreenIds: string[],
  clockTargetScreen?: string,
): string {
  const clockWidgets = getClockWidgets(!showClock, screenId, clockTargetScreen, validScreenIds);
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
      const w1 = generateLvglWidget(s1, r, 1, !showClock, buttonRadius, validScreenIds);
      if (w1) {
        widgets.push(w1);
        hasActualWidget = true;
      }
    }
    if (s2) {
      const w2 = generateLvglWidget(s2, r, 2, !showClock, buttonRadius, validScreenIds);
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
  clockTargetScreen?: string,
): string {
  const pages = screens?.length
    ? screens
    : [{ id: "s1", name: "Screen 1", sensors: [] }];
  const pageCount = pages.length;
  const validScreenIds = pages.map((page) => page.id);

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
        - lambda: lv_indev_wait_release(lv_indev_get_act());
        - lvgl.page.show:
            id: page_${pages[(index + 1) % pageCount].id}
            animation: MOVE_LEFT
      on_swipe_right:
        - lambda: lv_indev_wait_release(lv_indev_get_act());
        - lvgl.page.show:
            id: page_${pages[(index - 1 + pageCount) % pageCount].id}
            animation: MOVE_RIGHT`;

    return `    - id: page_${screen.id}
      bg_color: \${${screen.id}_bg_color}${bgImg}${swipe}
      widgets:
${generateScreenWidgets(screen.id, showClock, getSensor, buttonRadius, validScreenIds, clockTargetScreen)}`;
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
