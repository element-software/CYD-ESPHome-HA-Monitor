import { generateSensorSubstitutions, collectUniqueIconGlyphs } from "../substitutions";
import { generateBinarySensorConfig, generateOnOffSensor } from "../onOffSensors";
import { generateLvglWidget } from "../lvgl";
import type { InputBooleanSensorConfig, BinarySensorConfig, LightSensorConfig } from "@/types/config";

const baseInputBoolean: InputBooleanSensorConfig = {
  id: "r1c1",
  entity: "input_boolean.boost_hot_tub",
  label: "Hot Tub",
  type: "input_boolean",
  iconOn: "\\ue8ac",
  iconOff: "\\ue8ac",
  colorOn: "0x4CAF50",
  colorOff: "0x888888",
  stateOn: "On",
  stateOff: "Off",
};

describe("input_boolean substitutions", () => {
  it("generates correct type substitution for input_boolean", () => {
    const result = generateSensorSubstitutions(baseInputBoolean, "Row 1, Column 1");
    expect(result).toContain('r1c1_type: "input_boolean"');
  });

  it("generates color_on and color_off substitutions", () => {
    const result = generateSensorSubstitutions(baseInputBoolean, "Row 1, Column 1");
    expect(result).toContain('r1c1_color_on: "0x4CAF50"');
    expect(result).toContain('r1c1_color_off: "0x888888"');
  });

  it("generates state_on and state_off substitutions", () => {
    const result = generateSensorSubstitutions(baseInputBoolean, "Row 1, Column 1");
    expect(result).toContain('r1c1_state_on: "On"');
    expect(result).toContain('r1c1_state_off: "Off"');
  });

  it("uses default green color_on when none specified", () => {
    const sensor: InputBooleanSensorConfig = { ...baseInputBoolean, colorOn: undefined };
    const result = generateSensorSubstitutions(sensor, "Row 1, Column 1");
    expect(result).toContain('r1c1_color_on: "0x4CAF50"');
  });

  it("generates color_on_text for readable text overlay", () => {
    const result = generateSensorSubstitutions(baseInputBoolean, "Row 1, Column 1");
    expect(result).toContain("r1c1_color_on_text:");
  });
});

describe("input_boolean glyph collection", () => {
  it("includes iconOn and iconOff glyphs from input_boolean sensors", () => {
    const sensor: InputBooleanSensorConfig = {
      ...baseInputBoolean,
      iconOn: "\\ue8ac",
      iconOff: "\\ue8ab",
    };
    const result = collectUniqueIconGlyphs([sensor]);
    expect(result).toContain("\\ue8ac");
    expect(result).toContain("\\ue8ab");
  });

  it("deduplicates when iconOn and iconOff are the same", () => {
    const sensor: InputBooleanSensorConfig = {
      ...baseInputBoolean,
      iconOn: "\\ue8ac",
      iconOff: "\\ue8ac",
    };
    const result = collectUniqueIconGlyphs([sensor]);
    const occurrences = (result.match(/\\ue8ac/g) || []).length;
    expect(occurrences).toBe(1);
  });
});

describe("input_boolean ESPHome binary_sensor generation", () => {
  it("generates a binary_sensor platform entry for input_boolean", () => {
    const result = generateBinarySensorConfig([], [], [baseInputBoolean]);
    expect(result).toContain("binary_sensor:");
    expect(result).toContain("platform: homeassistant");
    expect(result).toContain("id: ha_r1c1");
    expect(result).toContain("${r1c1_entity}");
  });

  it("includes trigger_on_initial_state for input_boolean", () => {
    const result = generateOnOffSensor(baseInputBoolean);
    expect(result).toContain("trigger_on_initial_state: true");
  });

  it("includes input_boolean sensors alongside binary and light sensors", () => {
    const binary: BinarySensorConfig = {
      id: "r1c2",
      entity: "binary_sensor.door",
      label: "Door",
      type: "binary",
      iconOn: "\\ue838",
      iconOff: "\\ue838",
      colorOn: "0xFF0000",
      colorOff: "0x32CD32",
    };
    const light: LightSensorConfig = {
      id: "r2c1",
      entity: "light.kitchen",
      label: "Kitchen",
      type: "light",
      iconOn: "\\ue0f0",
      iconOff: "\\ue0f0",
      colorOn: "0xFFE082",
      colorOff: "0x888888",
    };
    const result = generateBinarySensorConfig([binary], [light], [baseInputBoolean]);
    expect(result).toContain("id: ha_r1c2");
    expect(result).toContain("id: ha_r2c1");
    expect(result).toContain("id: ha_r1c1");
    // All should appear in a single binary_sensor: section
    const sectionCount = (result.match(/^binary_sensor:/gm) || []).length;
    expect(sectionCount).toBe(1);
  });

  it("generates toggleable button background update for input_boolean", () => {
    const result = generateOnOffSensor(baseInputBoolean);
    expect(result).toContain("lvgl.widget.update:");
    expect(result).toContain("bg_color");
    expect(result).toContain("bg_opa: COVER");
  });
});

describe("input_boolean LVGL widget generation", () => {
  it("generates input_boolean.toggle action for input_boolean type", () => {
    const result = generateLvglWidget(baseInputBoolean, 1, 1, false);
    expect(result).toContain("input_boolean.toggle");
    expect(result).toContain("on_click:");
  });

  it("does not generate switch.toggle for input_boolean type", () => {
    const result = generateLvglWidget(baseInputBoolean, 1, 1, false);
    expect(result).not.toContain("switch.toggle");
  });
});
