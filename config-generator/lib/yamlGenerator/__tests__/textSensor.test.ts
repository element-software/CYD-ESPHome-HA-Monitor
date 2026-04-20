import { collectUniqueIconGlyphs, generateSensorSubstitutions } from "../substitutions";
import { generateTextValueSensor, generateTextValueSensorConfig } from "../numericSensors";
import type { TextSensorConfig } from "@/types/config";

const baseTextSensor: TextSensorConfig = {
  id: "r1c1",
  entity: "sensor.weather_condition_text",
  label: "Weather",
  type: "text",
  icon: "\\ue430",
  iconColor: "0x00BFFF",
};

describe("text sensor substitutions", () => {
  it("generates text sensor type, icon, and icon color substitutions", () => {
    const result = generateSensorSubstitutions(baseTextSensor, "Row 1, Column 1");
    expect(result).toContain('r1c1_type: "text"');
    expect(result).toContain('r1c1_icon: "\\ue430"');
    expect(result).toContain('r1c1_icon_color: "0x00BFFF"');
  });

  it("does not generate numeric or on/off substitutions for text sensors", () => {
    const result = generateSensorSubstitutions(baseTextSensor, "Row 1, Column 1");
    expect(result).not.toContain("_format:");
    expect(result).not.toContain("_state_on:");
    expect(result).not.toContain("_state_off:");
  });
});

describe("text sensor icon glyph collection", () => {
  it("includes text sensor icon in icon glyph list", () => {
    const result = collectUniqueIconGlyphs([baseTextSensor]);
    expect(result).toContain("\\ue430");
  });
});

describe("text sensor YAML generation", () => {
  it("generates a Home Assistant text_sensor block for text sensors", () => {
    const result = generateTextValueSensor(baseTextSensor);
    expect(result).toContain("platform: homeassistant");
    expect(result).toContain("id: ha_r1c1");
    expect(result).toContain("text: !lambda |-");
    expect(result).toContain("return x.c_str();");
  });

  it("generates text_sensor section when at least one text sensor exists", () => {
    const result = generateTextValueSensorConfig([baseTextSensor]);
    expect(result).toContain("text_sensor:");
    expect(result).toContain("id: ha_r1c1");
  });
});
