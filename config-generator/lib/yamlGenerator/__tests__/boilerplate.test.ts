import { generateBoilerplate } from "../boilerplate";
import { defaultConfig } from "@/lib/defaultConfig";

describe("display boilerplate", () => {
  it("sets an explicit TFT SPI data rate for ILI9341 compatibility", () => {
    const result = generateBoilerplate(defaultConfig);
    expect(result).toContain("data_rate: 40MHz");
  });
});
