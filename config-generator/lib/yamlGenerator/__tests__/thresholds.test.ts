import { generateSensorSubstitutions, collectUniqueIconGlyphs } from "../substitutions";
import { generateNumericSensor } from "../numericSensors";
import type { NumericSensorConfig } from "@/types/config";

const baseSensor: NumericSensorConfig = {
  id: "r1c1",
  entity: "sensor.battery",
  label: "Battery",
  type: "sensor",
  icon: "\\uf578",
  iconColor: "0x32CD32",
  format: "%.0f%%",
};

describe("threshold substitutions", () => {
  it("generates dynamic threshold substitutions from thresholds array", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00" },
        { value: "50", color: "0xFFA500" },
        { value: "20", color: "0xFF0000" },
      ],
    };
    const result = generateSensorSubstitutions(sensor, "Row 1, Column 1");
    expect(result).toContain("r1c1_thresh_0: \"80\"");
    expect(result).toContain("r1c1_thresh_0_color: \"0x00FF00\"");
    expect(result).toContain("r1c1_thresh_1: \"50\"");
    expect(result).toContain("r1c1_thresh_1_color: \"0xFFA500\"");
    expect(result).toContain("r1c1_thresh_2: \"20\"");
    expect(result).toContain("r1c1_thresh_2_color: \"0xFF0000\"");
    // Should NOT have old-style keys
    expect(result).not.toContain("color_thresh_high");
    expect(result).not.toContain("color_thresh_mid");
  });

  it("generates threshold icon substitutions when any threshold has an icon", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00", icon: "\\uf578" },
        { value: "50", color: "0xFFA500", icon: "\\uf575" },
        { value: "20", color: "0xFF0000", icon: "\\uf572" },
      ],
    };
    const result = generateSensorSubstitutions(sensor, "Row 1, Column 1");
    expect(result).toContain("r1c1_thresh_0_icon:");
    expect(result).toContain("r1c1_thresh_1_icon:");
    expect(result).toContain("r1c1_thresh_2_icon:");
  });

  it("omits threshold icon substitutions when no threshold has an icon", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00" },
        { value: "50", color: "0xFFA500" },
      ],
    };
    const result = generateSensorSubstitutions(sensor, "Row 1, Column 1");
    expect(result).not.toContain("_thresh_0_icon");
  });

  it("uses base icon as fallback for thresholds without explicit icon when others have icons", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00", icon: "\\uf578" },
        { value: "20", color: "0xFF0000" }, // no icon
      ],
    };
    const result = generateSensorSubstitutions(sensor, "Row 1, Column 1");
    // Both thresholds get icon substitutions; the one without icon falls back to sensor.icon
    expect(result).toContain("r1c1_thresh_0_icon:");
    expect(result).toContain("r1c1_thresh_1_icon:");
  });

  it("falls back to legacy color_thresh_* format when no thresholds array", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      colorThreshHigh: "80",
      colorThreshMid: "50",
      colorThreshLow: "20",
      colorHigh: "0xFF0000",
      colorMid: "0xFFA500",
      colorLow: "0x32CD32",
    };
    const result = generateSensorSubstitutions(sensor, "Row 1, Column 1");
    expect(result).toContain("r1c1_color_thresh_high: \"80\"");
    expect(result).toContain("r1c1_color_thresh_mid: \"50\"");
    expect(result).toContain("r1c1_color_thresh_low: \"20\"");
    expect(result).not.toContain("_thresh_0:");
  });
});

describe("numeric sensor YAML generation", () => {
  it("generates dynamic threshold color lambda from thresholds array", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00" },
        { value: "50", color: "0xFFA500" },
        { value: "20", color: "0xFF0000" },
      ],
    };
    const result = generateNumericSensor(sensor);
    expect(result).toContain("if (x > ${r1c1_thresh_0}) return lv_color_hex(${r1c1_thresh_0_color});");
    expect(result).toContain("if (x > ${r1c1_thresh_1}) return lv_color_hex(${r1c1_thresh_1_color});");
    expect(result).toContain("if (x > ${r1c1_thresh_2}) return lv_color_hex(${r1c1_thresh_2_color});");
    expect(result).toContain("return lv_color_hex(${r1c1_thresh_2_color});");
    // No icon text lambda when no icons
    expect(result).not.toContain("std::string");
  });

  it("generates icon text lambda when thresholds have icons", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00", icon: "\\uf578" },
        { value: "50", color: "0xFFA500", icon: "\\uf575" },
        { value: "20", color: "0xFF0000", icon: "\\uf572" },
      ],
    };
    const result = generateNumericSensor(sensor);
    expect(result).toContain("std::string");
    expect(result).toContain("if (x > ${r1c1_thresh_0}) return std::string(\"${r1c1_thresh_0_icon}\");");
    expect(result).toContain("if (x > ${r1c1_thresh_1}) return std::string(\"${r1c1_thresh_1_icon}\");");
    expect(result).toContain("return std::string(\"${r1c1_icon}\");");
  });

  it("does not generate icon lambda when no threshold has icon", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [
        { value: "80", color: "0x00FF00" },
        { value: "50", color: "0xFFA500" },
      ],
    };
    const result = generateNumericSensor(sensor);
    // Icon text lambda uses std::string; color lambda does not
    expect(result).not.toContain("std::string");
  });

  it("generates legacy color lambda when no thresholds array", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      colorThreshHigh: "80",
      colorThreshMid: "50",
      colorThreshLow: "20",
      colorHigh: "0xFF0000",
      colorMid: "0xFFA500",
      colorLow: "0x32CD32",
    };
    const result = generateNumericSensor(sensor);
    expect(result).toContain("${r1c1_color_thresh_high}");
    expect(result).toContain("${r1c1_color_thresh_mid}");
    expect(result).toContain("${r1c1_color_thresh_low}");
  });
});

describe("collectUniqueIconGlyphs", () => {
  it("includes base icon for numeric sensors", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      thresholds: [{ value: "80", color: "0x00FF00" }],
    };
    const result = collectUniqueIconGlyphs([sensor]);
    // sensor.icon = '\\uf578' → hex escape → should appear in glyphs
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes threshold icons in glyph list", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      icon: "\\uf578",
      thresholds: [
        { value: "80", color: "0x00FF00", icon: "\\uf575" },
        { value: "20", color: "0xFF0000", icon: "\\uf572" },
      ],
    };
    const result = collectUniqueIconGlyphs([sensor]);
    // iconCodeToHexEscape returns literal \uXXXX strings (not unicode chars)
    expect(result).toContain("\\uf578");
    expect(result).toContain("\\uf575");
    expect(result).toContain("\\uf572");
  });

  it("deduplicates icons when threshold icon matches base icon", () => {
    const sensor: NumericSensorConfig = {
      ...baseSensor,
      icon: "\\uf578",
      thresholds: [
        { value: "80", color: "0x00FF00", icon: "\\uf578" }, // same as base
        { value: "20", color: "0xFF0000", icon: "\\uf572" },
      ],
    };
    const result = collectUniqueIconGlyphs([sensor]);
    // \\uf578 should appear only once (literal \uf578 string)
    const occurrences = (result.match(/\\uf578/g) || []).length;
    expect(occurrences).toBe(1);
  });
});
