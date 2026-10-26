import { generateYaml } from "../index";
import { PRAYERTIMES_API_KEY_SECRET } from "../prayerTimes";
import { prayerTimesDefaultConfig } from "@/lib/defaultConfig";

describe("prayer times YAML secrets", () => {
  const yaml = generateYaml(prayerTimesDefaultConfig);

  it("references the prayertimes.dev API key only via !secret", () => {
    expect(yaml).toContain(`prayer_api_key: !secret ${PRAYERTIMES_API_KEY_SECRET}`);
    expect(yaml).toContain("Authorization: Bearer ${prayer_api_key}");
  });

  it("does not embed a literal API key in the URL, headers, or logs", () => {
    expect(yaml).not.toMatch(/api[_-]?key=/i);
    expect(yaml).not.toMatch(/Authorization:\s*Bearer\s+(?!\$\{prayer_api_key\})\S+/);
    expect(yaml).not.toMatch(/logger\.log:.*prayer_api_key/);
    expect(yaml).not.toContain("your-prayertimes-dev-api-key");
  });

  it("does not put the API key in a query string that would leak in logs", () => {
    expect(yaml).toMatch(/prayer_api_url: "https:\/\/prayertimes\.dev\/api\/prayer-times\?/);
    const urlLine = yaml.split("\n").find((line) => line.includes("prayer_api_url:"));
    expect(urlLine).toBeDefined();
    expect(urlLine).not.toMatch(/key/i);
  });
});
