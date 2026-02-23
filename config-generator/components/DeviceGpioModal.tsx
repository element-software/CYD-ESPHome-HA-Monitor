'use client';

import { useEffect, useRef, useState } from 'react';
import type { ConfigData, DevicePins, DeviceVariant } from '@/types/config';
import {
  DEVICE_VARIANT_OPTIONS,
  getEffectivePins,
  getPresetPins,
} from '@/lib/devicePresets';

const GPIO_OPTIONS = [
  'GPIO0', 'GPIO2', 'GPIO4', 'GPIO5', 'GPIO12', 'GPIO13', 'GPIO14', 'GPIO15',
  'GPIO16', 'GPIO17', 'GPIO18', 'GPIO19', 'GPIO21', 'GPIO22', 'GPIO23',
  'GPIO25', 'GPIO26', 'GPIO27', 'GPIO32', 'GPIO33',
];

interface DeviceGpioModalProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  open: boolean;
  onClose: () => void;
}

function PinRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-gray-700 shrink-0 min-w-[120px]">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 max-w-[140px] px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">—</option>
        {GPIO_OPTIONS.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  );
}

export default function DeviceGpioModal({ config, onChange, open, onClose }: DeviceGpioModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const effective = getEffectivePins(config);
  const [variant, setVariant] = useState<DeviceVariant>(config.deviceVariant ?? 'spi_touch');
  const [pins, setPins] = useState<DevicePins>(() => ({ ...effective }));

  useEffect(() => {
    if (!open) return;
    setVariant(config.deviceVariant ?? 'spi_touch');
    setPins({ ...getEffectivePins(config) });
  }, [open, config.deviceVariant, config.devicePins, config.backlightPin]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      const onCloseEv = () => onClose();
      dialog.addEventListener('close', onCloseEv);
      return () => {
        dialog.removeEventListener('close', onCloseEv);
        dialog.close();
      };
    }
    dialog.close();
  }, [open, onClose]);

  const handleVariantChange = (v: DeviceVariant) => {
    setVariant(v);
    if (v !== 'custom') setPins({ ...getPresetPins(v) });
  };

  const updatePin = <K extends keyof DevicePins>(key: K, value: DevicePins[K]) => {
    setPins((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onChange({
      ...config,
      deviceVariant: variant,
      devicePins: pins,
      backlightPin: undefined,
    });
    onClose();
  };

  const isCustom = variant === 'custom';

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-xl border border-gray-200 w-[min(96vw,28rem)] max-h-[90vh] overflow-hidden bg-white p-0"
      onCancel={onClose}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Device GPIO config</h3>
        <p className="text-xs text-gray-500 mt-1">Choose a board variant or set pins manually.</p>
      </div>
      <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
          <select
            value={variant}
            onChange={(e) => handleVariantChange(e.target.value as DeviceVariant)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {DEVICE_VARIANT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {DEVICE_VARIANT_OPTIONS.find((o) => o.value === variant)?.description}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Display &amp; backlight</h4>
          <div className="grid gap-2 pl-2">
            <PinRow label="Backlight PWM" value={pins.backlightPin} onChange={(v) => updatePin('backlightPin', v)} disabled={!isCustom} />
            <PinRow label="TFT CLK" value={pins.tftClk} onChange={(v) => updatePin('tftClk', v)} disabled={!isCustom} />
            <PinRow label="TFT MOSI" value={pins.tftMosi} onChange={(v) => updatePin('tftMosi', v)} disabled={!isCustom} />
            <PinRow label="TFT MISO" value={pins.tftMiso} onChange={(v) => updatePin('tftMiso', v)} disabled={!isCustom} />
            <PinRow label="TFT CS" value={pins.tftCs} onChange={(v) => updatePin('tftCs', v)} disabled={!isCustom} />
            <PinRow label="TFT DC" value={pins.tftDc} onChange={(v) => updatePin('tftDc', v)} disabled={!isCustom} />
          </div>
        </div>

        {(variant === 'spi_touch' || variant === 'custom') && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Touch (SPI – XPT2046)</h4>
            <div className="grid gap-2 pl-2">
              <PinRow label="Touch CLK" value={pins.touchSpiClk ?? ''} onChange={(v) => updatePin('touchSpiClk', v)} disabled={variant !== 'custom'} />
              <PinRow label="Touch MOSI" value={pins.touchSpiMosi ?? ''} onChange={(v) => updatePin('touchSpiMosi', v)} disabled={variant !== 'custom'} />
              <PinRow label="Touch MISO" value={pins.touchSpiMiso ?? ''} onChange={(v) => updatePin('touchSpiMiso', v)} disabled={variant !== 'custom'} />
              <PinRow label="Touch CS" value={pins.touchSpiCs ?? ''} onChange={(v) => updatePin('touchSpiCs', v)} disabled={variant !== 'custom'} />
            </div>
          </div>
        )}

        {(variant === 'i2c_touch' || variant === 'custom') && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Touch (I2C – CST816)</h4>
            <div className="grid gap-2 pl-2">
              <PinRow label="I2C SDA" value={pins.i2cSda ?? ''} onChange={(v) => updatePin('i2cSda', v)} disabled={variant !== 'custom'} />
              <PinRow label="I2C SCL" value={pins.i2cScl ?? ''} onChange={(v) => updatePin('i2cScl', v)} disabled={variant !== 'custom'} />
              <PinRow label="Touch reset" value={pins.touchReset ?? ''} onChange={(v) => updatePin('touchReset', v)} disabled={variant !== 'custom'} />
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </dialog>
  );
}
