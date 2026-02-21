export function generateLightConfig(): string {
  return `
# --- LIGHT CONFIG (display backlight) ---
light:
  - platform: monochromatic
    output: backlight_pwm
    name: Display Backlight
    id: backlight
    restore_mode: ALWAYS_ON
    default_transition_length: 0.5s
`;
}
