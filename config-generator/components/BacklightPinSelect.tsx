'use client';

const BACKLIGHT_GPIO_PINS = [
  'GPIO0','GPIO2','GPIO4','GPIO5','GPIO12','GPIO13','GPIO14','GPIO15',
  'GPIO16','GPIO17','GPIO18','GPIO19','GPIO21','GPIO22','GPIO23',
  'GPIO25','GPIO26','GPIO27','GPIO32','GPIO33',
];

function getPinLabel(pin: string): string {
  if (pin === 'GPIO21') return `${pin} (default)`;
  if (pin === 'GPIO27') return `${pin} (alternate CYD)`;
  return pin;
}

interface BacklightPinSelectProps {
  value: string;
  onChange: (pin: string) => void;
}

export default function BacklightPinSelect({ value, onChange }: BacklightPinSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Backlight PWM GPIO Pin
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {BACKLIGHT_GPIO_PINS.map((pin) => (
          <option key={pin} value={pin}>{getPinLabel(pin)}</option>
        ))}
      </select>
      <p className="text-xs text-gray-500 mt-1">GPIO21 for standard CYD; GPIO27 for some board variants</p>
    </div>
  );
}
