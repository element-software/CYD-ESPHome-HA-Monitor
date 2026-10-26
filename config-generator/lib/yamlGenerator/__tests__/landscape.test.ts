import { generateYaml } from "../index";
import { generateBoilerplate } from "../boilerplate";
import { getLayout } from "../lvgl";
import { defaultConfig } from "@/lib/defaultConfig";
import { I2C_TOUCH_PINS } from "@/lib/devicePresets";
import type { ConfigData } from "@/types/config";

function landscapeConfig(partial: Partial<ConfigData> = {}): ConfigData {
  return {
    ...defaultConfig,
    orientation: "landscape",
    ...partial,
  };
}

function displaySwapXy(yaml: string): boolean | undefined {
  const displayBlock = yaml.match(/display:[\s\S]*?(?=\n(?:touchscreen|# --- FONTS ---))/);
  if (!displayBlock) return undefined;
  const match = displayBlock[0].match(/swap_xy:\s*(true|false)/);
  return match ? match[1] === "true" : undefined;
}

function touchSwapXy(yaml: string): boolean | undefined {
  const touchBlock = yaml.match(/touchscreen:[\s\S]*?(?=\n(?:# --- FONTS ---))/);
  if (!touchBlock) return undefined;
  const match = touchBlock[0].match(/swap_xy:\s*(true|false)/);
  return match ? match[1] === "true" : undefined;
}

function displayMirrorX(yaml: string): boolean | undefined {
  const displayBlock = yaml.match(/display:[\s\S]*?(?=\n(?:touchscreen|# --- FONTS ---))/);
  if (!displayBlock) return undefined;
  const match = displayBlock[0].match(/mirror_x:\s*(true|false)/);
  return match ? match[1] === "true" : undefined;
}

function touchMirrorX(yaml: string): boolean | undefined {
  const touchBlock = yaml.match(/touchscreen:[\s\S]*?(?=\n(?:# --- FONTS ---))/);
  if (!touchBlock) return undefined;
  const match = touchBlock[0].match(/mirror_x:\s*(true|false)/);
  return match ? match[1] === "true" : undefined;
}

describe("landscape YAML", () => {
  it("uses 320x240 dimensions and inverts display swap_xy", () => {
    const yaml = generateYaml(landscapeConfig());
    expect(yaml).toContain("width: 320");
    expect(yaml).toContain("height: 240");
    expect(displaySwapXy(yaml)).toBe(false);
    expect(yaml).toContain("size: 32");
    expect(yaml).toContain("size: 16");
  });

  it("keeps portrait 240x320 and swap_xy true when orientation is omitted", () => {
    const { orientation: _omitted, ...rest } = defaultConfig;
    const yaml = generateYaml(rest as ConfigData);
    expect(yaml).toContain("width: 240");
    expect(yaml).toContain("height: 320");
    expect(displaySwapXy(yaml)).toBe(true);
    expect(yaml).toContain("x: 2");
    expect(yaml).toContain("x: 121");
    expect(yaml).toContain("y: 100");
    expect(yaml).not.toContain("x: 108");
    expect(yaml).not.toContain("x: 214");
  });

  it("inverts landscape swap_xy relative to the user panel setting", () => {
    expect(displaySwapXy(generateBoilerplate(landscapeConfig({ displaySwapXy: true })))).toBe(
      false,
    );
    expect(displaySwapXy(generateBoilerplate(landscapeConfig({ displaySwapXy: false })))).toBe(
      true,
    );
  });

  it("resizes background images to 320x240 in landscape", () => {
    const yaml = generateYaml(
      landscapeConfig({
        screens: [
          {
            id: "s1",
            name: "Screen 1",
            backgroundImage: "images/bg.png",
            sensors: defaultConfig.sensors,
          },
        ],
      }),
    );
    expect(yaml).toContain("resize: 320x240");
    expect(yaml).not.toContain("resize: 240x320");
  });

  it("places landscape+clock widgets on a 3x2 grid", () => {
    const yaml = generateYaml(landscapeConfig());
    expect(yaml).toContain("x: 2");
    expect(yaml).toContain("x: 108");
    expect(yaml).toContain("x: 214");
    expect(yaml).toContain("y: 54");
    expect(yaml).toContain("y: 146");
    expect(yaml).toContain("width: 104");
    expect(yaml).toContain("height: 86");
    expect(yaml).not.toContain("x: 121");
    expect(yaml).not.toContain("y: 100");
  });

  it("sets SPI touch swap_xy true in landscape", () => {
    expect(touchSwapXy(generateBoilerplate(landscapeConfig()))).toBe(true);
    expect(touchSwapXy(generateBoilerplate(defaultConfig))).toBe(false);
  });

  it("turns off display and SPI touch mirror_x in landscape", () => {
    const yaml = generateBoilerplate(landscapeConfig());
    expect(displayMirrorX(yaml)).toBe(false);
    expect(touchMirrorX(yaml)).toBe(false);
  });

  it("keeps portrait display and SPI touch mirror_x true", () => {
    const yaml = generateBoilerplate(defaultConfig);
    expect(displayMirrorX(yaml)).toBe(true);
    expect(touchMirrorX(yaml)).toBe(true);
  });

  it("inverts landscape display mirror_x relative to the user panel setting", () => {
    expect(displayMirrorX(generateBoilerplate(landscapeConfig({ displayMirrorX: true })))).toBe(
      false,
    );
    expect(displayMirrorX(generateBoilerplate(landscapeConfig({ displayMirrorX: false })))).toBe(
      true,
    );
  });

  it("uses 4×2 packing when the clock is hidden", () => {
    const yaml = generateYaml(landscapeConfig({ hideClock: true }));
    expect(yaml).toContain("x: 81");
    expect(yaml).toContain("x: 160");
    expect(yaml).toContain("x: 239");
    expect(yaml).toContain("y: 6");
    expect(yaml).toContain("y: 123");
    expect(yaml).toContain("width: 77");
    expect(yaml).toContain("height: 110");
    expect(yaml).toContain("long_mode: DOT");
    expect(yaml).toContain("align: TOP_MID");
    expect(yaml).not.toContain("id: clock_font");
  });

  it("leaves I2C CST816 bound to the display with swap_xy false", () => {
    const yaml = generateBoilerplate(
      landscapeConfig({
        deviceVariant: "i2c_touch",
        devicePins: { ...I2C_TOUCH_PINS },
      }),
    );
    expect(yaml).toContain("platform: cst816");
    expect(yaml).toContain("display: my_display");
    expect(touchSwapXy(yaml)).toBe(false);
    expect(touchMirrorX(yaml)).toBe(false);
  });
});

describe("getLayout slot mapping", () => {
  it("maps landscape clock-on slots in reading order", () => {
    const ids = getLayout("landscape", false).widgets.map((w) => w.slotId);
    expect(ids).toEqual(["r1c1", "r1c2", "r2c1", "r2c2", "r3c1", "r3c2"]);
  });

  it("maps landscape clock-hidden slots in reading order", () => {
    const ids = getLayout("landscape", true).widgets.map((w) => w.slotId);
    expect(ids).toEqual(["r1c1", "r1c2", "r2c1", "r2c2", "r3c1", "r3c2", "r4c1", "r4c2"]);
  });

  it("keeps portrait 2-column slot order", () => {
    expect(getLayout("portrait", false).widgets.map((w) => w.slotId)).toEqual([
      "r1c1",
      "r1c2",
      "r2c1",
      "r2c2",
      "r3c1",
      "r3c2",
    ]);
  });
});
