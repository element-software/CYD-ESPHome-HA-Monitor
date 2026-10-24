import { generateYaml } from "../index";
import { generateBoilerplate } from "../boilerplate";
import { getLayout } from "../lvgl";
import { defaultConfig } from "@/lib/defaultConfig";
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
    const yaml = generateYaml(defaultConfig);
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
