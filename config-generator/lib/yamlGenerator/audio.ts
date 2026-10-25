import type { AudioHardware, ConfigData } from "@/types/config";

export const AUDIO_DEFAULTS = {
  dout: "GPIO26",
  bclk: "GPIO17",
  lrclk: "GPIO16",
  rtttl: "GPIO26",
} as const;

const GPIO_PIN_RE = /^GPIO([0-9]|[12][0-9]|3[0-9])$/;

export function sanitizeGpioPin(pin: string | undefined, fallback: string): string {
  const trimmed = pin?.trim() ?? "";
  return GPIO_PIN_RE.test(trimmed) ? trimmed : fallback;
}

export function isAudioEnabled(config: ConfigData): boolean {
  return config.enableAudio === true;
}

export function getAudioHardware(config: ConfigData): AudioHardware {
  return config.audioHardware === "rtttl" ? "rtttl" : "i2s";
}

function generateBeepScriptAndButton(): string {
  return `script:
  - id: beep
    then:
      - rtttl.play:
          rtttl: 'beep:d=16,o=5,b=120:b'
button:
  - platform: template
    name: Beep
    id: button_beep
    on_press:
      - script.execute: beep
`;
}

/**
 * Extra `output:` list items to merge into the existing boilerplate output
 * section. ESPHome YAML cannot have two top-level `output:` keys, so the RTTTL
 * buzzer LEDC pin is appended next to backlight_pwm.
 */
export function getBuzzerOutputYaml(config: ConfigData): string {
  if (!isAudioEnabled(config) || getAudioHardware(config) !== "rtttl") {
    return "";
  }
  const pin = sanitizeGpioPin(config.audioRtttlPin, AUDIO_DEFAULTS.rtttl);
  return `  - platform: ledc
    pin: ${pin}
    id: buzzer_output
`;
}

export function generateAudioConfig(config: ConfigData): string {
  if (!isAudioEnabled(config)) return "";

  if (getAudioHardware(config) === "rtttl") {
    return `
# --- AUDIO / BEEP (RTTTL buzzer) ---
rtttl:
  id: cyd_rtttl
  output: buzzer_output
${generateBeepScriptAndButton()}`;
  }

  const dout = sanitizeGpioPin(config.audioDoutPin, AUDIO_DEFAULTS.dout);
  const bclk = sanitizeGpioPin(config.audioBclkPin, AUDIO_DEFAULTS.bclk);
  const lrclk = sanitizeGpioPin(config.audioLrclkPin, AUDIO_DEFAULTS.lrclk);

  return `
# --- AUDIO / BEEP (I2S speaker) ---
i2s_audio:
  - id: cyd_i2s
    i2s_lrclk_pin: ${lrclk}
    i2s_bclk_pin: ${bclk}
speaker:
  - platform: i2s_audio
    id: cyd_speaker
    i2s_audio_id: cyd_i2s
    dac_type: external
    i2s_dout_pin: ${dout}
    channel: mono
rtttl:
  id: cyd_rtttl
  speaker: cyd_speaker
${generateBeepScriptAndButton()}`;
}
