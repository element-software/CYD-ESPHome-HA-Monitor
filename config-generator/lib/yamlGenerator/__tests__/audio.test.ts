import { generateYaml } from "../index";
import { generateAudioConfig } from "../audio";
import { generateOnOffSensor } from "../onOffSensors";
import { defaultConfig } from "@/lib/defaultConfig";
import type { BinarySensorConfig, ConfigData } from "@/types/config";

const binarySensor: BinarySensorConfig = {
  id: "r1c2",
  entity: "binary_sensor.front_door_sensor_contact",
  label: "Front Door",
  type: "binary",
  stateOn: "Open",
  stateOff: "Closed",
  iconOn: "\\ueffc",
  iconOff: "\\ueffc",
  colorOn: "0xFF0000",
  colorOff: "0x32CD32",
};

function configWithAudio(partial: Partial<ConfigData> = {}): ConfigData {
  return {
    ...defaultConfig,
    ...partial,
  };
}

describe("audio YAML generation", () => {
  it("does not emit i2s_audio, rtttl, or the beep script for the default config", () => {
    const yaml = generateYaml(defaultConfig);
    expect(yaml).not.toContain("i2s_audio:");
    expect(yaml).not.toContain("rtttl:");
    expect(yaml).not.toContain("id: beep");
    expect(yaml).not.toContain("id: button_beep");
    expect(yaml).not.toContain("id: cyd_speaker");
    expect(yaml).not.toContain("id: buzzer_output");
    expect(generateAudioConfig(defaultConfig)).toBe("");
  });

  it("emits I2S audio, speaker, rtttl speaker, beep script, Beep button, and default pins when enableAudio is true", () => {
    const yaml = generateYaml(configWithAudio({ enableAudio: true }));
    expect(yaml).toContain("i2s_audio:");
    expect(yaml).toContain("id: cyd_i2s");
    expect(yaml).toContain("i2s_lrclk_pin: GPIO16");
    expect(yaml).toContain("i2s_bclk_pin: GPIO17");
    expect(yaml).toContain("speaker:");
    expect(yaml).toContain("id: cyd_speaker");
    expect(yaml).toContain("i2s_dout_pin: GPIO26");
    expect(yaml).toContain("dac_type: external");
    expect(yaml).toContain("i2s_audio_id: cyd_i2s");
    expect(yaml).toContain("rtttl:");
    expect(yaml).toContain("speaker: cyd_speaker");
    expect(yaml).toContain("id: beep");
    expect(yaml).toContain("rtttl.play:");
    expect(yaml).toContain("name: Beep");
    expect(yaml).toContain("id: button_beep");
    expect(yaml).not.toContain("id: buzzer_output");
    expect(yaml).not.toContain("output: buzzer_output");
  });

  it("emits LEDC buzzer output and rtttl output (not speaker) for RTTTL hardware", () => {
    const yaml = generateYaml(
      configWithAudio({ enableAudio: true, audioHardware: "rtttl" }),
    );
    expect(yaml).toContain("platform: ledc");
    expect(yaml).toContain("id: buzzer_output");
    expect(yaml).toContain("pin: GPIO26");
    expect(yaml).toContain("rtttl:");
    expect(yaml).toContain("output: buzzer_output");
    expect(yaml).toContain("id: beep");
    expect(yaml).toContain("name: Beep");
    expect(yaml).not.toContain("i2s_audio:");
    expect(yaml).not.toContain("speaker:");
    expect(yaml).not.toContain("id: cyd_speaker");

    const outputBlock = yaml.match(/^output:\n(?:  .*\n)+/m);
    expect(outputBlock?.[0]).toContain("id: backlight_pwm");
    expect(outputBlock?.[0]).toContain("id: buzzer_output");
  });

  it("uses configured I2S and RTTTL pins", () => {
    const i2s = generateYaml(
      configWithAudio({
        enableAudio: true,
        audioDoutPin: "GPIO22",
        audioBclkPin: "GPIO23",
        audioLrclkPin: "GPIO18",
      }),
    );
    expect(i2s).toContain("i2s_dout_pin: GPIO22");
    expect(i2s).toContain("i2s_bclk_pin: GPIO23");
    expect(i2s).toContain("i2s_lrclk_pin: GPIO18");

    const rtttl = generateYaml(
      configWithAudio({
        enableAudio: true,
        audioHardware: "rtttl",
        audioRtttlPin: "GPIO4",
      }),
    );
    expect(rtttl).toContain("pin: GPIO4");
    expect(rtttl).toContain("id: buzzer_output");
  });

  it("falls back to default pins when a stored pin is not a GPIO token", () => {
    const yaml = generateYaml(
      configWithAudio({
        enableAudio: true,
        audioDoutPin: "GPIO26\nlight:",
        audioBclkPin: "not-a-pin",
        audioLrclkPin: "GPIO99",
      }),
    );
    expect(yaml).toContain("i2s_dout_pin: GPIO26");
    expect(yaml).toContain("i2s_bclk_pin: GPIO17");
    expect(yaml).toContain("i2s_lrclk_pin: GPIO16");
    expect(yaml).not.toContain("not-a-pin");
    expect(yaml).not.toContain("GPIO99");
    expect(yaml).not.toContain("GPIO26\nlight:");
  });
});

describe("beepOnAlert", () => {
  it("emits script.execute: beep in on_state when beepOnAlert is set and audio is enabled", () => {
    const onState = generateOnOffSensor({ ...binarySensor, beepOnAlert: true }, true);
    expect(onState).toContain("on_state:");
    expect(onState).toContain("script.execute: beep");
    expect(onState).toContain("bool rising = initialized && !prev && now;");
    expect(onState).not.toContain("lambda: return id(ha_r1c2).state;");

    const yaml = generateYaml(
      configWithAudio({
        enableAudio: true,
        sensors: [{ ...binarySensor, beepOnAlert: true }],
        screens: [
          {
            id: "s1",
            name: "Screen 1",
            sensors: [{ ...binarySensor, beepOnAlert: true }],
          },
        ],
      }),
    );
    expect(yaml).toContain("script.execute: beep");
    expect(yaml).toContain("bool rising = initialized && !prev && now;");
  });

  it("does not emit script.execute: beep in on_state without the beepOnAlert flag", () => {
    const onState = generateOnOffSensor(binarySensor, true);
    expect(onState).toContain("on_state:");
    expect(onState).not.toContain("script.execute: beep");
  });

  it("does not emit script.execute: beep in on_state when audio is disabled even if beepOnAlert is true", () => {
    const onState = generateOnOffSensor({ ...binarySensor, beepOnAlert: true }, false);
    expect(onState).not.toContain("script.execute: beep");
  });
});
