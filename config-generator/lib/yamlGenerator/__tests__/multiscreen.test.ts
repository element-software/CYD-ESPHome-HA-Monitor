import { generateYaml } from "../index";
import { generateBoilerplate } from "../boilerplate";
import { migrateConfig } from "@/lib/migrateConfig";
import { defaultConfig, createEmptySensors } from "@/lib/defaultConfig";
import type { ConfigData, SensorConfig } from "@/types/config";

const sampleSensor: SensorConfig = {
  id: "r1c1",
  type: "sensor",
  entity: "sensor.rain",
  label: "Rain",
  icon: "\\uef55",
  iconColor: "0x00BFFF",
  format: "%.0fmm",
};

function configWithScreens(partial: Partial<ConfigData> = {}): ConfigData {
  return migrateConfig({
    ...defaultConfig,
    ...partial,
  });
}

describe("migrateConfig", () => {
  it("wraps a legacy 8-slot config into three screens without losing screen 1 entities", () => {
    const legacy: ConfigData = {
      deviceName: "hamon",
      friendlyName: "HAMon",
      deviceVariant: "spi_touch",
      sensors: defaultConfig.sensors,
    };
    const migrated = migrateConfig(legacy);
    expect(migrated.screens).toHaveLength(3);
    expect(migrated.screens?.[0].sensors.map((s) => s.entity)).toEqual(
      defaultConfig.sensors.map((s) => s.entity),
    );
    expect(migrated.sensors.map((s) => s.entity)).toEqual(
      defaultConfig.sensors.map((s) => s.entity),
    );
    expect(migrated.screens?.[1].sensors.every((s) => s.enabled === false)).toBe(true);
    expect(migrated.screens?.[2].sensors.every((s) => s.enabled === false)).toBe(true);
  });
});

describe("generateYaml multi-page", () => {
  it("emits three swipeable LVGL pages with prefixed substitutions", () => {
    const yaml = generateYaml(configWithScreens());
    expect(yaml).toContain("id: page_s1");
    expect(yaml).toContain("id: page_s2");
    expect(yaml).toContain("id: page_s3");
    expect(yaml).toContain("on_swipe_left:");
    expect(yaml).toContain("on_swipe_right:");
    expect(yaml).toContain("animation: MOVE_LEFT");
    expect(yaml).toContain("s1_r1c1_entity:");
    expect(yaml).toContain("s1_bg_color:");
    expect(yaml).toContain("s1_font_color:");
    expect(yaml).not.toContain("id: main_page");
  });

  it("skips disabled slots in substitutions and widgets", () => {
    const config = configWithScreens();
    config.screens![1].sensors = createEmptySensors();
    config.screens![1].sensors[0] = { ...sampleSensor, enabled: true };
    const yaml = generateYaml(config);
    expect(yaml).toContain("s2_r1c1_entity: \"sensor.rain\"");
    expect(yaml).not.toContain("s2_r1c2_entity:");
  });

  it("emits image blocks at 240x320 when a background path is set", () => {
    const config = configWithScreens();
    config.screens![0].backgroundImage = "images/bg_home.png";
    const yaml = generateYaml(config);
    expect(yaml).toContain("file: \"images/bg_home.png\"");
    expect(yaml).toContain("id: s1_bg_image");
    expect(yaml).toContain("resize: 240x320");
    expect(yaml).toContain("bg_image_src: s1_bg_image");
  });

  it("does not emit an image block when no screens have a background", () => {
    const yaml = generateYaml(configWithScreens());
    expect(yaml).not.toContain("IMAGE ASSETS");
    expect(yaml).not.toContain("bg_image_src:");
  });
});

describe("generateBoilerplate display defaults", () => {
  it("keeps stock CYD defaults and emits web_server by default", () => {
    const yaml = generateBoilerplate(defaultConfig);
    expect(yaml).toMatch(/swap_xy:\s*true/);
    expect(yaml).toMatch(/mirror_x:\s*true/);
    expect(yaml).toMatch(/mirror_y:\s*true/);
    expect(yaml).toMatch(/invert_colors:\s*false/);
    expect(yaml).toMatch(/color_order:\s*RGB/);
    expect(yaml).toContain("web_server:");
    expect(yaml).toContain("version: 3");
  });

  it("honours invert, BGR, mirrors off, and web_server off", () => {
    const yaml = generateBoilerplate({
      ...defaultConfig,
      displayInvertColors: true,
      displayColorOrder: "BGR",
      displayMirrorX: false,
      displayMirrorY: false,
      enableWebServer: false,
    });
    expect(yaml).toMatch(/invert_colors:\s*true/);
    expect(yaml).toMatch(/color_order:\s*BGR/);
    expect(yaml).toMatch(/mirror_x:\s*false/);
    expect(yaml).toMatch(/mirror_y:\s*false/);
    expect(yaml).not.toContain("web_server:");
  });
});
