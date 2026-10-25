import { generateYaml } from "../index";
import { generateLvglWidget } from "../lvgl";
import { collectUniqueIconGlyphs, generateSensorSubstitutions } from "../substitutions";
import {
  generateNumericSensorConfig,
  generateTextValueSensorConfig,
} from "../numericSensors";
import { generateBinarySensorConfig, generateSwitchSensorConfig } from "../onOffSensors";
import { migrateConfig, reindexScreens, remapNavigationTargets } from "@/lib/migrateConfig";
import { createEmptySensors, defaultConfig } from "@/lib/defaultConfig";
import type {
  ConfigData,
  LabelSensorConfig,
  LightSensorConfig,
  NumericSensorConfig,
  ScreenConfig,
  SensorConfig,
} from "@/types/config";

const numeric: NumericSensorConfig = {
  id: "r1c1",
  type: "sensor",
  entity: "sensor.grid_power",
  label: "Grid",
  icon: "\\uea0b",
  iconColor: "0xFFA500",
  format: "%.0fW",
};

const light: LightSensorConfig = {
  id: "r1c2",
  type: "light",
  entity: "light.kitchen",
  label: "Kitchen",
  stateOn: "On",
  stateOff: "Off",
  iconOn: "\\ue0f0",
  iconOff: "\\ue0f0",
  colorOn: "0xFFE082",
  colorOff: "0x888888",
};

const label: LabelSensorConfig = {
  id: "r2c1",
  type: "label",
  entity: "",
  label: "Back",
  icon: "\\ue5c4",
  iconColor: "0x00BFFF",
  valueText: "Home",
  targetScreen: "s2",
};

function twoScreenConfig(overrides: Partial<ConfigData> = {}): ConfigData {
  const s1 = createEmptySensors();
  const s2 = createEmptySensors();
  return migrateConfig({
    ...defaultConfig,
    screens: [
      { id: "s1", name: "Screen 1", sensors: s1 },
      { id: "s2", name: "Screen 2", sensors: s2 },
    ],
    sensors: s1,
    ...overrides,
  });
}

describe("targetScreen LVGL on_click", () => {
  it("emits lvgl.page.show with page_s2 for a numeric sensor", () => {
    const sensor: NumericSensorConfig = { ...numeric, targetScreen: "s2" };
    const result = generateLvglWidget(sensor, 2, 100, 117, 68, 0, ["s1", "s2"]);
    expect(result).toContain("on_click:");
    expect(result).toContain("lvgl.page.show:");
    expect(result).toContain("id: page_s2");
    expect(result).not.toContain("homeassistant.action:");
  });

  it("navigates only for a light with targetScreen and does not emit light.toggle", () => {
    const sensor: LightSensorConfig = { ...light, targetScreen: "s2" };
    const result = generateLvglWidget(sensor, 121, 100, 117, 68, 0, ["s1", "s2"]);
    expect(result).toContain("lvgl.page.show:");
    expect(result).toContain("id: page_s2");
    expect(result).not.toContain("light.toggle");
    expect(result).not.toContain("homeassistant.action:");
  });

  it("omits on_click when a numeric targetScreen does not match a generated page", () => {
    const sensor: NumericSensorConfig = { ...numeric, targetScreen: "s3" };
    const result = generateLvglWidget(sensor, 2, 100, 117, 68, 0, ["s1", "s2"]);
    expect(result).not.toContain("on_click:");
    expect(result).not.toContain("lvgl.page.show:");
  });

  it("keeps light.toggle when a light's targetScreen is stale", () => {
    const sensor: LightSensorConfig = { ...light, targetScreen: "s9" };
    const result = generateLvglWidget(sensor, 121, 100, 117, 68, 0, ["s1", "s2"]);
    expect(result).toContain("light.toggle");
    expect(result).not.toContain("lvgl.page.show:");
  });
});

describe("label type", () => {
  it("emits type, label, optional icon/color/value_text substitutions", () => {
    const result = generateSensorSubstitutions(label, "Row 2, Column 1");
    expect(result).not.toContain("r2c1_entity:");
    expect(result).toContain('r2c1_type: "label"');
    expect(result).toContain('r2c1_label: "Back"');
    expect(result).toContain("r2c1_icon:");
    expect(result).toContain('r2c1_icon_color: "0x00BFFF"');
    expect(result).toContain('r2c1_value_text: "Home"');
    expect(result).not.toContain("_format:");
    expect(result).not.toContain("_state_on:");
    expect(result).not.toContain("_action:");
  });

  it("uses value_text as the widget value line", () => {
    const result = generateLvglWidget(label, 2, 170, 117, 68, 0, ["s1", "s2"]);
    expect(result).toContain('text: "${r2c1_value_text}"');
    expect(result).toContain("lvgl.page.show:");
    expect(result).toContain("id: page_s2");
  });

  it("includes label.icon in unique glyphs", () => {
    expect(collectUniqueIconGlyphs([label])).toContain("\\ue5c4");
  });

  it("omits HA entity subscriptions from numeric, text, and on/off generators", () => {
    const sensors: SensorConfig[] = [label];
    expect(generateNumericSensorConfig(sensors)).toBe("");
    expect(generateTextValueSensorConfig(sensors)).toBe("");
    expect(generateBinarySensorConfig([], [], [])).toBe("");
    expect(generateSwitchSensorConfig([])).toBe("");
  });

  it("omits HA subscriptions in generated YAML", () => {
    const s1 = createEmptySensors();
    s1[0] = { ...label, id: "r1c1", targetScreen: "s2" };
    const yaml = generateYaml(
      twoScreenConfig({
        screens: [
          { id: "s1", name: "Screen 1", sensors: s1 },
          { id: "s2", name: "Screen 2", sensors: createEmptySensors() },
        ],
        sensors: s1,
      }),
    );
    expect(yaml).toContain('s1_r1c1_type: "label"');
    expect(yaml).toContain('s1_r1c1_value_text: "Home"');
    expect(yaml).toContain('text: "${s1_r1c1_value_text}"');
    expect(yaml).not.toContain("id: ha_s1_r1c1");
    expect(yaml).not.toMatch(/^sensor:/m);
    expect(yaml).not.toMatch(/^text_sensor:/m);
    expect(yaml).not.toMatch(/^binary_sensor:/m);
  });
});

describe("clock tap navigation", () => {
  it("wraps clock+date in button_clock with page.show when clockTargetScreen is set", () => {
    const yaml = generateYaml(twoScreenConfig({ clockTargetScreen: "s2" }));
    expect(yaml).toContain("id: button_clock");
    expect(yaml).toContain("id: label_clock");
    expect(yaml).toContain("id: label_date");
    expect(yaml).toMatch(/id: button_clock[\s\S]*lvgl\.page\.show:[\s\S]*id: page_s2/);
    expect(yaml).toContain("clickable: false");
  });

  it("keeps bare clock labels and omits button_clock when clockTargetScreen is unset", () => {
    const yaml = generateYaml(twoScreenConfig());
    expect(yaml).not.toContain("id: button_clock");
    expect(yaml).toContain("id: label_clock");
    expect(yaml).toContain("id: label_date");
  });

  it("omits button_clock when clockTargetScreen does not match a page", () => {
    const yaml = generateYaml(twoScreenConfig({ clockTargetScreen: "s9" }));
    expect(yaml).not.toContain("id: button_clock");
    expect(yaml).toContain("id: label_clock");
  });

  it("omits button_clock when the clock target is screen 1", () => {
    const yaml = generateYaml(twoScreenConfig({ clockTargetScreen: "s1" }));
    expect(yaml).not.toContain("id: button_clock");
    expect(yaml).toContain("id: label_clock");
  });
});

describe("reindexScreens navigation remap", () => {
  it("remaps s3 targets to s2 when screens are compacted", () => {
    const screens: ScreenConfig[] = [
      {
        id: "s1",
        name: "Screen 1",
        sensors: [{ ...numeric, targetScreen: "s3" }],
      },
      {
        id: "s3",
        name: "Screen 3",
        sensors: [{ ...label, targetScreen: "s1" }],
      },
    ];
    const result = reindexScreens(screens);
    expect(result.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(result[0].sensors[0].targetScreen).toBe("s2");
    expect(result[1].sensors[0].targetScreen).toBe("s1");
  });

  it("clears targetScreen when the target screen was deleted", () => {
    const screens: ScreenConfig[] = [
      {
        id: "s1",
        name: "Screen 1",
        sensors: [{ ...numeric, targetScreen: "s2" }],
      },
    ];
    const result = reindexScreens(screens);
    expect(result[0].id).toBe("s1");
    expect(result[0].sensors[0].targetScreen).toBeUndefined();
  });

  it("remaps clockTargetScreen s3 to s2 and clears deleted clock targets", () => {
    const remapped = remapNavigationTargets({
      ...defaultConfig,
      clockTargetScreen: "s3",
      screens: [
        { id: "s1", name: "Screen 1", sensors: createEmptySensors() },
        { id: "s3", name: "Screen 3", sensors: createEmptySensors() },
      ],
    });
    expect(remapped.screens?.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(remapped.clockTargetScreen).toBe("s2");

    const cleared = remapNavigationTargets({
      ...defaultConfig,
      clockTargetScreen: "s3",
      screens: [
        { id: "s1", name: "Screen 1", sensors: createEmptySensors() },
        { id: "s2", name: "Screen 2", sensors: createEmptySensors() },
      ],
    });
    expect(cleared.clockTargetScreen).toBeUndefined();
  });

  it("migrateConfig remaps clockTargetScreen when screens are compacted", () => {
    const migrated = migrateConfig({
      ...defaultConfig,
      clockTargetScreen: "s3",
      screens: [
        { id: "s1", name: "Screen 1", sensors: createEmptySensors() },
        { id: "s3", name: "Screen 3", sensors: createEmptySensors() },
      ],
    });
    expect(migrated.screens?.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(migrated.clockTargetScreen).toBe("s2");
  });
});
