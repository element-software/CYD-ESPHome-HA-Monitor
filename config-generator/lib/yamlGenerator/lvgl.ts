import {
  getDisplayOrientation,
  type SensorConfig,
  type ScreenConfig,
  type DisplayOrientation,
} from "@/types/config";

export interface WidgetRect {
  /** Slot id without screen prefix, e.g. `r1c1`. */
  slotId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  widgets: WidgetRect[];
  /** Clock label y (TOP_MID). Present when the clock is shown. */
  clockY?: number;
  /** Date label y (TOP_MID). Present when the clock is shown. */
  dateY?: number;
}

/**
 * Pixel layout for LVGL widgets.
 *
 * Slot ids stay `r1c1`…`r4c2`. Landscape remaps those ids onto a wider grid
 * in reading order (left→right, top→bottom):
 *
 * Clock on (3 cols × 2 rows, first 6 slots):
 *   (0,0)=r1c1  (1,0)=r1c2  (2,0)=r2c1
 *   (0,1)=r2c2  (1,1)=r3c1  (2,1)=r3c2
 *
 * Clock hidden (4 cols × 2 rows, all 8 slots):
 *   (0,0)=r1c1  (1,0)=r1c2  (2,0)=r2c1  (3,0)=r2c2
 *   (0,1)=r3c1  (1,1)=r3c2  (2,1)=r4c1  (3,1)=r4c2
 *
 * Portrait is the original 2-col grid (3 rows with clock, 4 without).
 */
export function getLayout(
  orientation: DisplayOrientation | undefined,
  hideClock: boolean,
): Layout {
  if (getDisplayOrientation({ orientation }) === "landscape") {
    return hideClock ? landscapeClockHidden() : landscapeClockOn();
  }
  return portraitLayout(hideClock);
}

function portraitLayout(hideClock: boolean): Layout {
  // Portrait: 2 columns × 3 rows with clock, 4 rows without.
  // x: 2 | 121; y: 100+(row-1)*70 with clock, 6+(row-1)*78 without; 117×68.
  const rows = hideClock ? 4 : 3;
  const widgets: WidgetRect[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= 2; col++) {
      widgets.push({
        slotId: `r${row}c${col}`,
        x: col === 1 ? 2 : 121,
        y: hideClock ? 6 + (row - 1) * 78 : 100 + (row - 1) * 70,
        width: 117,
        height: 68,
      });
    }
  }
  return hideClock
    ? { widgets }
    : { widgets, clockY: 15, dateY: 65 };
}

function landscapeClockOn(): Layout {
  // Compact top strip ~48px (header y=4..50); rows y=54, 146; cols x=2, 108, 214; 104×86.
  const slotIds = ["r1c1", "r1c2", "r2c1", "r2c2", "r3c1", "r3c2"];
  const xs = [2, 108, 214];
  const ys = [54, 146];
  const widgets: WidgetRect[] = [];
  let i = 0;
  for (const y of ys) {
    for (const x of xs) {
      widgets.push({ slotId: slotIds[i++], x, y, width: 104, height: 86 });
    }
  }
  return { widgets, clockY: 4, dateY: 30 };
}

function landscapeClockHidden(): Layout {
  // Rows y=6, 123; cols x=2, 81, 160, 239; 77×110.
  const slotIds = ["r1c1", "r1c2", "r2c1", "r2c2", "r3c1", "r3c2", "r4c1", "r4c2"];
  const xs = [2, 81, 160, 239];
  const ys = [6, 123];
  const widgets: WidgetRect[] = [];
  let i = 0;
  for (const y of ys) {
    for (const x of xs) {
      widgets.push({ slotId: slotIds[i++], x, y, width: 77, height: 110 });
    }
  }
  return { widgets };
}

function isScreenId(id: string): boolean {
  return /^s\d+$/.test(id);
}

function getOnClickBlock(sensor: SensorConfig, validScreenIds: string[]): string {
  const target = sensor.targetScreen?.trim();
  if (target && isScreenId(target) && validScreenIds.includes(target)) {
    return `
            on_click:
                - lvgl.page.show:
                    id: page_${target}`;
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
  x: number,
  y: number,
  width: number,
  height: number,
  buttonRadius: number = 0,
  validScreenIds: string[] = [],
): string {
  if (!sensor) return "";
  if (sensor.enabled === false) return "";

  const onClickBlock = getOnClickBlock(sensor, validScreenIds);
  const isClickable = Boolean(onClickBlock);
  const valueText =
    sensor.type === "action"
      ? `"\${${sensor.id}_action_text}"`
      : sensor.type === "label"
        ? `"\${${sensor.id}_value_text}"`
        : '"--"';

  const screenId = sensor.id.includes("_") ? sensor.id.split("_")[0] : "s1";
  const fontColorSub = `\${${screenId}_font_color}`;
  const stacked = width < 90;
  const childWidgets = stacked
    ? `
                - label:
                    id: icon_${sensor.id}
                    text: "\${${sensor.id}_icon}"
                    text_font: icon_font
                    text_color: \${${sensor.id}_icon_color}
                    align: TOP_MID
                    y: 8
                    clickable: false
                - label:
                    id: lbl_${sensor.id}
                    text: "\${${sensor.id}_label}"
                    text_font: label_font
                    text_color: ${fontColorSub}
                    align: TOP_MID
                    y: 40
                    width: ${width - 8}
                    text_align: CENTER
                    long_mode: DOT
                    clickable: false
                - label:
                    id: val_${sensor.id}
                    text: ${valueText}
                    text_font: state_font
                    text_color: ${fontColorSub}
                    align: TOP_MID
                    y: 58
                    width: ${width - 8}
                    text_align: CENTER
                    long_mode: DOT
                    clickable: false`
    : `
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

  return `
        - button:
            x: ${x}
            y: ${y}
            id: button_${sensor.id}
            width: ${width}
            height: ${height}
            bg_opa: TRANSP
            border_width: 0
            shadow_width: 0
            radius: ${buttonRadius}
            press_lock: false
            scrollbar_mode: "OFF"${isClickable ? onClickBlock : ""}
            widgets:${childWidgets}`;
}

function getClockWidgets(
  hideClock: boolean,
  screenId: string = "s1",
  orientation: DisplayOrientation = "portrait",
  clockTargetScreen?: string,
  validScreenIds: string[] = [],
): string {
  if (hideClock) return "";
  const layout = getLayout(orientation, hideClock);
  const clockY = layout.clockY ?? 15;
  const dateY = layout.dateY ?? 65;
  const isLandscape = getDisplayOrientation({ orientation }) === "landscape";
  const target = clockTargetScreen?.trim();
  const navTarget =
    target && isScreenId(target) && validScreenIds.includes(target) && target !== screenId
      ? target
      : undefined;
  if (!navTarget) {
    return `
        - label:
            id: label_clock
            text: "--:--"
            text_font: clock_font
            text_color: \${${screenId}_font_color}
            align: TOP_MID
            y: ${clockY}
        - label:
            id: label_date
            text: "--- --/--"
            text_font: date_font
            text_color: \${${screenId}_font_color}
            align: TOP_MID
            y: ${dateY}
`;
  }
  return `
        - button:
            id: button_clock
            align: TOP_MID
            y: 0
            width: ${isLandscape ? 320 : 240}
            height: ${isLandscape ? 50 : 96}
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
                    y: ${clockY}
                - label:
                    id: label_date
                    clickable: false
                    text: "--- --/--"
                    text_font: date_font
                    text_color: \${${screenId}_font_color}
                    align: TOP_MID
                    y: ${dateY}
`;
}

function generateScreenWidgets(
  screenId: string,
  showClock: boolean,
  getSensor: (id: string) => SensorConfig | undefined,
  buttonRadius: number,
  orientation: DisplayOrientation,
  validScreenIds: string[],
  clockTargetScreen?: string,
): string {
  const hideClock = !showClock;
  const layout = getLayout(orientation, hideClock);
  const clockWidgets = getClockWidgets(
    hideClock,
    screenId,
    orientation,
    clockTargetScreen,
    validScreenIds,
  );
  const widgets: string[] = [];
  let hasActualWidget = false;

  if (clockWidgets) {
    widgets.push(clockWidgets);
    hasActualWidget = true;
  }

  let lastY: number | undefined;
  let visualRow = 0;
  for (const rect of layout.widgets) {
    if (rect.y !== lastY) {
      visualRow += 1;
      widgets.push(`        # ====== ROW ${visualRow} ======`);
      lastY = rect.y;
    }
    const sensor = getSensor(`${screenId}_${rect.slotId}`);
    if (sensor) {
      const w = generateLvglWidget(
        sensor,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        buttonRadius,
        validScreenIds,
      );
      if (w) {
        widgets.push(w);
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
  orientation: DisplayOrientation = "portrait",
  clockTargetScreen?: string,
): string {
  const pages = screens?.length
    ? screens
    : [{ id: "s1", name: "Screen 1", sensors: [] }];
  const pageCount = pages.length;
  const resolvedOrientation = getDisplayOrientation({ orientation });
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
${generateScreenWidgets(screen.id, showClock, getSensor, buttonRadius, resolvedOrientation, validScreenIds, clockTargetScreen)}`;
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
