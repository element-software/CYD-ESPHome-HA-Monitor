import { generateBoilerplate } from "../boilerplate";
import { defaultConfig } from "@/lib/defaultConfig";
import type { ConfigData } from "@/types/config";

function getDisplaySwapXy(yaml: string): boolean | undefined {
  const displayBlock = yaml.match(/display:[\s\S]*?(?=\n(?:touchscreen|# --- FONTS ---))/);
  if (!displayBlock) return undefined;
  const match = displayBlock[0].match(/swap_xy:\s*(true|false)/);
  if (!match) return undefined;
  return match[1] === "true";
}

describe("generateBoilerplate display swap_xy", () => {
  it("emits swap_xy: true when displaySwapXy is true", () => {
    const config: ConfigData = { ...defaultConfig, displaySwapXy: true };
    expect(getDisplaySwapXy(generateBoilerplate(config))).toBe(true);
  });

  it("emits swap_xy: true when displaySwapXy is omitted", () => {
    const { displaySwapXy: _, ...config } = defaultConfig;
    expect(getDisplaySwapXy(generateBoilerplate(config as ConfigData))).toBe(true);
  });

  it("emits swap_xy: false when displaySwapXy is false", () => {
    const config: ConfigData = { ...defaultConfig, displaySwapXy: false };
    expect(getDisplaySwapXy(generateBoilerplate(config))).toBe(false);
  });
});
