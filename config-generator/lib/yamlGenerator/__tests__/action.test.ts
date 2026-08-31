import { generateSensorSubstitutions, collectUniqueIconGlyphs } from "../substitutions";
import { generateLvglWidget } from "../lvgl";
import { generateBinarySensorConfig } from "../onOffSensors";
import { generateSwitchSensorConfig } from "../onOffSensors";
import type { ActionSensorConfig } from "@/types/config";

const baseAction: ActionSensorConfig = {
  id: "r2c2",
  entity: "script.good_night",
  label: "Good Night",
  type: "action",
  action: "script.turn_on",
  actionText: "Run",
  icon: "\\ue037",
  iconColor: "0x00BFFF",
};

describe("action substitutions", () => {
  it("generates correct type substitution for action", () => {
    const result = generateSensorSubstitutions(baseAction, "Row 2, Column 2");
    expect(result).toContain('r2c2_type: "action"');
  });

  it("generates action and action_text substitutions", () => {
    const result = generateSensorSubstitutions(baseAction, "Row 2, Column 2");
    expect(result).toContain('r2c2_action: "script.turn_on"');
    expect(result).toContain('r2c2_action_text: "Run"');
  });

  it("defaults action_text to Run when not specified", () => {
    const sensor: ActionSensorConfig = { ...baseAction, actionText: undefined };
    const result = generateSensorSubstitutions(sensor, "Row 2, Column 2");
    expect(result).toContain('r2c2_action_text: "Run"');
  });

  it("generates icon and icon_color substitutions", () => {
    const result = generateSensorSubstitutions(baseAction, "Row 2, Column 2");
    expect(result).toContain("r2c2_icon:");
    expect(result).toContain('r2c2_icon_color: "0x00BFFF"');
  });
});

describe("action glyph collection", () => {
  it("includes icon glyphs from action sensors", () => {
    const result = collectUniqueIconGlyphs([baseAction]);
    expect(result).toContain("\\ue037");
  });
});

describe("action LVGL generation", () => {
  it("generates on_click with homeassistant.action", () => {
    const result = generateLvglWidget(baseAction, 2, 2, false, 0);
    expect(result).toContain("on_click:");
    expect(result).toContain("press_lock: false");
    expect(result).toContain("homeassistant.action:");
    expect(result).toContain("action: ${r2c2_action}");
    expect(result).toContain('entity_id: "${r2c2_entity}"');
  });

  it("sets static action_text as value label", () => {
    const result = generateLvglWidget(baseAction, 2, 2, false, 0);
    expect(result).toContain('text: "${r2c2_action_text}"');
  });

  it("supports automation.trigger action kind", () => {
    const sensor: ActionSensorConfig = {
      ...baseAction,
      entity: "automation.morning_routine",
      action: "automation.trigger",
    };
    const subs = generateSensorSubstitutions(sensor, "Row 2, Column 2");
    expect(subs).toContain('r2c2_action: "automation.trigger"');
  });
});

describe("action has no HA state subscription", () => {
  it("does not generate binary_sensor entry for action slots", () => {
    const result = generateBinarySensorConfig([], [], []);
    expect(result).not.toContain("ha_r2c2");
  });

  it("does not generate switch entry for action slots", () => {
    const result = generateSwitchSensorConfig([]);
    expect(result).not.toContain("ha_r2c2");
  });
});
