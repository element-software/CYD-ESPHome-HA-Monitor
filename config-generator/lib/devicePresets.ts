import type { ConfigData, DevicePins, DeviceVariant } from '@/types/config';

/** SPI touch (XPT2046) – standard CYD, backlight GPIO21 */
export const SPI_TOUCH_PINS: DevicePins = {
  backlightPin: 'GPIO21',
  tftClk: 'GPIO14',
  tftMosi: 'GPIO13',
  tftMiso: 'GPIO12',
  tftCs: 'GPIO15',
  tftDc: 'GPIO2',
  touchSpiClk: 'GPIO25',
  touchSpiMosi: 'GPIO32',
  touchSpiMiso: 'GPIO39',
  touchSpiCs: 'GPIO33',
};

/** I2C touch (CST816) – CYD with I2C touch, backlight GPIO27 */
export const I2C_TOUCH_PINS: DevicePins = {
  backlightPin: 'GPIO27',
  tftClk: 'GPIO14',
  tftMosi: 'GPIO13',
  tftMiso: 'GPIO12',
  tftCs: 'GPIO15',
  tftDc: 'GPIO2',
  i2cSda: 'GPIO33',
  i2cScl: 'GPIO32',
  touchReset: 'GPIO25',
};

export const DEVICE_VARIANT_OPTIONS: { value: DeviceVariant; label: string; description: string }[] = [
  { value: 'spi_touch', label: 'SPI touch (XPT2046)', description: 'Standard CYD, backlight GPIO21' },
  { value: 'i2c_touch', label: 'I2C touch (CST816)', description: 'CYD with I2C touch, backlight GPIO27' },
  { value: 'custom', label: 'Custom', description: 'Set every pin manually (prefilled from current variant)' },
];

export function getPresetPins(variant: DeviceVariant): DevicePins {
  if (variant === 'i2c_touch') return { ...I2C_TOUCH_PINS };
  return { ...SPI_TOUCH_PINS };
}

/** Effective pins for YAML: from devicePins if set, else from preset for variant, else SPI default. Backfills legacy backlightPin. */
export function getEffectivePins(config: ConfigData): DevicePins {
  if (config.devicePins) return { ...config.devicePins };
  const variant = config.deviceVariant ?? 'spi_touch';
  const pins = getPresetPins(variant);
  if (config.backlightPin) pins.backlightPin = config.backlightPin;
  return pins;
}

export function isSpiTouch(pins: DevicePins): boolean {
  return pins.touchSpiCs != null && pins.touchSpiCs !== '';
}

export function isI2cTouch(pins: DevicePins): boolean {
  return (
    pins.i2cSda != null && pins.i2cSda !== '' &&
    pins.i2cScl != null && pins.i2cScl !== '' &&
    pins.touchReset != null && pins.touchReset !== ''
  );
}
