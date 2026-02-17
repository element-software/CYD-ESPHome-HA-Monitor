"use client";

import { useState, useEffect } from "react";
import { SensorConfig, SensorConfigKey } from "@/types/config";
import IconPicker from "@/components/IconPicker";
import { cydColorToCss, cssToCydColor } from "@/lib/colorUtils";

const ACCURACY_OPTIONS: { value: 0 | 1 | 2; label: string; format: string }[] =
  [
    { value: 0, label: "Whole number", format: "%.0f" },
    { value: 1, label: "1 decimal place", format: "%.1f" },
    { value: 2, label: "2 decimal places", format: "%.2f" },
  ];

const UNIT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "None" },
  { value: "W", label: "W" },
  { value: "kW", label: "kW" },
  { value: "kWh", label: "kWh" },
  { value: "°C", label: "°C" },
  { value: "°F", label: "°F" },
  { value: "%", label: "%" },
  { value: "A", label: "A" },
  { value: "V", label: "V" },
  { value: "bar", label: "bar" },
  { value: "hPa", label: "hPa" },
  { value: "Pa", label: "Pa" },
  { value: "ppm", label: "ppm" },
  { value: "μg/m³", label: "μg/m³" },
  { value: "m³", label: "m³" },
  { value: "L", label: "L" },
  { value: "lux", label: "lux" },
  { value: "lx", label: "lx" },
  { value: "dB", label: "dB" },
  { value: "m/s", label: "m/s" },
  { value: "km/h", label: "km/h" },
  { value: "Hz", label: "Hz" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "mg", label: "mg" },
  { value: "l/min", label: "l/min" },
  { value: "ml/min", label: "ml/min" },
  { value: "custom", label: "Custom" },
];

const CUSTOM_UNIT = "custom";

function buildFormatFromPresets(accuracy: 0 | 1 | 2, unit: string): string {
  if (unit === "" || unit === CUSTOM_UNIT)
    return ACCURACY_OPTIONS.find((a) => a.value === accuracy)?.format ?? "%.0f";
  const fmt =
    ACCURACY_OPTIONS.find((a) => a.value === accuracy)?.format ?? "%.0f";
  const suffix = unit === "%" ? "%%" : unit;
  return fmt + suffix;
}

function parseFormatToPresets(
  format: string | undefined,
): { accuracy: 0 | 1 | 2; unit: string } | null {
  if (!format?.trim()) return { accuracy: 0, unit: "" };
  const m = format.match(/^%(\.\d)f(.*)$/);
  if (!m) return null;
  const decimals = m[1];
  const suffix = m[2];
  const accuracy: 0 | 1 | 2 =
    decimals === ".0" ? 0 : decimals === ".1" ? 1 : decimals === ".2" ? 2 : 0;
  if (suffix === "") return { accuracy, unit: "" };
  if (suffix === "%%") return { accuracy, unit: "%" };
  const unitOption = UNIT_OPTIONS.find(
    (u) =>
      u.value !== "" &&
      u.value !== CUSTOM_UNIT &&
      suffix === (u.value === "%" ? "%%" : u.value),
  );
  return unitOption ? { accuracy, unit: unitOption.value } : null;
}

interface SensorConfigPanelProps {
  sensor: SensorConfig;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (sensor: SensorConfig) => void;
}

export default function SensorConfigPanel({
  sensor,
  index,
  isExpanded,
  onToggle,
  onChange,
}: SensorConfigPanelProps) {
  const [formatUnitForceCustom, setFormatUnitForceCustom] = useState(false);

  useEffect(() => {
    if (sensor.type === "sensor" && parseFormatToPresets(sensor.format) !== null) {
      setFormatUnitForceCustom(false);
    }
  }, [sensor.type, sensor.type === "sensor" ? sensor.format : undefined]);

  const updateField = (field: SensorConfigKey, value: string) => {
    onChange({ ...sensor, [field]: value } as SensorConfig);
  };

  const getSensorLabel = () => {
    const row = Math.floor(index / 2) + 1;
    const col = (index % 2) + 1;
    return `Row ${row}, Column ${col}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900">{getSensorLabel()}</span>
          <span className="text-sm text-gray-600">
            {sensor.label || "Unnamed"}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              sensor.type === "sensor"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {sensor.type}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Type
              </label>
              <select
                value={sensor.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="sensor">Sensor (Numeric)</option>
                <option value="binary">Binary Sensor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Label
              </label>
              <input
                type="text"
                value={sensor.label}
                onChange={(e) => updateField("label", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Energy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Entity ID
            </label>
            <input
              type="text"
              value={sensor.entity}
              onChange={(e) => updateField("entity", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="sensor.example"
            />
          </div>

          <div>
            <div className="flex gap-2 flex-wrap justify-start items-center">
              {sensor.type === "sensor" && (
                <>
                  <div className="shrink-0">
                    <IconPicker
                      value={sensor.icon}
                      onChange={(code) => updateField("icon", code)}
                      iconColor={sensor.iconColor}
                      buttonClassName="w-9 h-9 shrink-0 p-0.5"
                    />
                  </div>
                  <div className="shrink-0">
                    <label className="block text-xs text-gray-600 mb-0.5">
                      Color
                    </label>
                    <input
                      type="color"
                      value={cydColorToCss(sensor.iconColor)}
                      onChange={(e) =>
                        updateField("iconColor", cssToCydColor(e.target.value))
                      }
                      className="h-9 w-9 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5 focus:ring-2 focus:ring-blue-500 block"
                      title="Pick icon color"
                    />
                  </div>
                </>
              )}
              {sensor.type === "sensor" &&
                (() => {
                  const parsed = parseFormatToPresets(sensor.format);
                  const accuracy = parsed?.accuracy ?? 0;
                  const unitFromFormat =
                    parsed?.unit ?? (sensor.format ? CUSTOM_UNIT : "");
                  const isCustom = formatUnitForceCustom || parsed === null;
                  const unit = formatUnitForceCustom
                    ? CUSTOM_UNIT
                    : unitFromFormat;
                  return (
                    <div className="flex-1 min-w-0 flex gap-2 items-start justify-start flex-wrap">
                      <div className="min-w-[100px]">
                        <label className="block text-xs text-gray-600 mb-0.5">
                          Accuracy
                        </label>
                        <select
                          value={accuracy}
                          onChange={(e) => {
                            const a = Number(e.target.value) as 0 | 1 | 2;
                            const accFmt =
                              ACCURACY_OPTIONS.find((o) => o.value === a)
                                ?.format ?? "%.0f";
                            if (isCustom && sensor.format) {
                              const next = sensor.format.replace(
                                /^%\.\d+f/,
                                accFmt,
                              );
                              updateField("format", next);
                              return;
                            }
                            updateField(
                              "format",
                              buildFormatFromPresets(
                                a,
                                unit === CUSTOM_UNIT ? "" : unit,
                              ),
                            );
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {ACCURACY_OPTIONS.map((a) => (
                            <option key={a.value} value={a.value}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="min-w-[90px] flex-1">
                        <label className="block text-xs text-gray-600 mb-0.5">
                          Unit
                        </label>
                        <select
                          value={unit}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === CUSTOM_UNIT) {
                              setFormatUnitForceCustom(true);
                              if (!sensor.format) updateField("format", "%.0f");
                              return;
                            }
                            setFormatUnitForceCustom(false);
                            updateField(
                              "format",
                              buildFormatFromPresets(accuracy, v),
                            );
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {UNIT_OPTIONS.map((u) => (
                            <option key={u.value || "none"} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {isCustom && (
                        <div className="min-w-[100px] flex-1">
                          <label className="block text-xs text-gray-600 mb-0.5">
                            Custom
                          </label>
                          <input
                            type="text"
                            value={sensor.format || ""}
                            onChange={(e) =>
                              updateField("format", e.target.value)
                            }
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="%.1f°C"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          </div>

          {sensor.type === "sensor" ? (
            <>
              <p className="text-xs text-gray-600 font-medium">
                Thresholds & colours
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    High
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={sensor.colorThreshHigh ?? ""}
                      onChange={(e) =>
                        updateField("colorThreshHigh", e.target.value)
                      }
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="5000"
                    />
                    <input
                      type="color"
                      value={cydColorToCss(sensor.colorHigh || "0xFF0000")}
                      onChange={(e) =>
                        updateField("colorHigh", cssToCydColor(e.target.value))
                      }
                      className="w-8 h-8 shrink-0 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">Mid</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={sensor.colorThreshMid ?? ""}
                      onChange={(e) =>
                        updateField("colorThreshMid", e.target.value)
                      }
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="3000"
                    />
                    <input
                      type="color"
                      value={cydColorToCss(sensor.colorMid || "0xFFA500")}
                      onChange={(e) =>
                        updateField("colorMid", cssToCydColor(e.target.value))
                      }
                      className="w-8 h-8 shrink-0 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">Low</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={sensor.colorThreshLow ?? ""}
                      onChange={(e) =>
                        updateField("colorThreshLow", e.target.value)
                      }
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="1000"
                    />
                    <input
                      type="color"
                      value={cydColorToCss(sensor.colorLow || "0x32CD32")}
                      onChange={(e) =>
                        updateField("colorLow", cssToCydColor(e.target.value))
                      }
                      className="w-8 h-8 shrink-0 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">ON</span>
                  <div className="flex items-end gap-1">
                    <input
                      type="text"
                      value={sensor.stateOn || ""}
                      onChange={(e) => updateField("stateOn", e.target.value)}
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Open"
                    />
                    <IconPicker
                      value={sensor.iconOn ?? sensor.iconOff ?? ''}
                      onChange={(code) => updateField("iconOn", code)}
                      iconColor={sensor.colorOn || '0xFF5252'}
                      buttonClassName="w-9 h-9 shrink-0 p-0.5"
                    />
                  </div>
                </div>
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">OFF</span>
                  <div className="flex items-end gap-1">
                    <input
                      type="text"
                      value={sensor.stateOff || ""}
                      onChange={(e) => updateField("stateOff", e.target.value)}
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Closed"
                    />
                    <IconPicker
                      value={sensor.iconOff ?? sensor.iconOn ?? ''}
                      onChange={(code) => updateField("iconOff", code)}
                      iconColor={sensor.colorOff || '0x32CD32'}
                      buttonClassName="w-9 h-9 shrink-0 p-0.5"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
