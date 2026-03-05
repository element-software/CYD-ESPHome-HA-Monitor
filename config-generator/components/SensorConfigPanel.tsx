"use client";

import { useState, useEffect } from "react";
import { IconSet, NumericSensorConfig, SensorConfig, SensorConfigKey, ThresholdConfig } from "@/types/config";
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

/** Derive the effective thresholds, migrating legacy colorThresh* fields if needed. */
function getEffectiveThresholds(sensor: NumericSensorConfig): ThresholdConfig[] {
  if (sensor.thresholds && sensor.thresholds.length > 0) return sensor.thresholds;
  // Migrate from legacy fields
  const ts: ThresholdConfig[] = [];
  if (sensor.colorThreshHigh)
    ts.push({ value: sensor.colorThreshHigh, color: sensor.colorHigh ?? "0xFF0000" });
  if (sensor.colorThreshMid)
    ts.push({ value: sensor.colorThreshMid, color: sensor.colorMid ?? "0xFFA500" });
  if (sensor.colorThreshLow)
    ts.push({ value: sensor.colorThreshLow, color: sensor.colorLow ?? "0x32CD32" });
  if (ts.length > 0) return ts;
  return [
    { value: "5000", color: "0xFF0000" },
    { value: "3000", color: "0xFFA500" },
    { value: "1000", color: "0x32CD32" },
  ];
}

interface SensorConfigPanelProps {
  sensor: SensorConfig;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (sensor: SensorConfig) => void;
  iconSet?: IconSet;
}

export default function SensorConfigPanel({
  sensor,
  index,
  isExpanded,
  onToggle,
  onChange,
  iconSet,
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

  const thresholds = sensor.type === "sensor" ? getEffectiveThresholds(sensor) : [];

  const updateThreshold = (i: number, field: keyof ThresholdConfig, value: string) => {
    if (sensor.type !== "sensor") return;
    const next = [...thresholds];
    // Only coerce to undefined for the optional `icon` field; keep value/color as strings
    // to avoid generating "undefined" in the YAML output.
    const newVal = field === "icon" ? (value || undefined) : value;
    next[i] = { ...next[i], [field]: newVal } as ThresholdConfig;
    onChange({ ...sensor, thresholds: next } as SensorConfig);
  };

  const addThreshold = () => {
    if (sensor.type !== "sensor") return;
    const last = thresholds[thresholds.length - 1];
    const lastVal = parseFloat(last?.value ?? "0");
    // Derive a sensible step: use existing spacing between the last two thresholds,
    // fall back to 20% of the last value, or 1 at minimum.
    let step = 500;
    if (thresholds.length >= 2) {
      const prevVal = parseFloat(thresholds[thresholds.length - 2]?.value ?? "0");
      step = Math.abs(prevVal - lastVal);
    } else if (Number.isFinite(lastVal) && lastVal > 0) {
      step = Math.max(1, Math.round(lastVal * 0.2));
    }
    const newVal = Number.isFinite(lastVal) ? String(Math.max(0, lastVal - step)) : "0";
    const next = [...thresholds, { value: newVal, color: "0x32CD32" }];
    onChange({ ...sensor, thresholds: next } as SensorConfig);
  };

  const removeThreshold = (i: number) => {
    if (sensor.type !== "sensor") return;
    const next = thresholds.filter((_, idx) => idx !== i);
    onChange({ ...sensor, thresholds: next } as SensorConfig);
  };

  const changeType = (newType: string) => {
    if (newType === sensor.type) return;
    const base = { id: sensor.id, entity: sensor.entity, label: sensor.label };
    switch (newType) {
      case "sensor":
        onChange({
          ...base,
          type: "sensor",
          icon: "\\uea0b",
          iconColor: "0xFFA500",
          format: "%.0f",
          thresholds: [
            { value: "5000", color: "0xFF0000" },
            { value: "3000", color: "0xFFA500" },
            { value: "1000", color: "0x32CD32" },
          ],
        });
        break;
      case "binary":
        onChange({
          ...base,
          type: "binary",
          stateOn: "Open",
          stateOff: "Closed",
          iconOn: "\\ue838",
          iconOff: "\\ue838",
          colorOn: "0xFF0000",
          colorOff: "0x32CD32",
        });
        break;
      case "light":
        onChange({
          ...base,
          type: "light",
          stateOn: "On",
          stateOff: "Off",
          iconOn: "\\ue0f0",
          iconOff: "\\ue0f0",
          colorOn: "0x000000",
          colorOff: "0xFFFFFF",
        });
        break;
      case "switch":
        onChange({
          ...base,
          type: "switch",
          stateOn: "On",
          stateOff: "Off",
          iconOn: "\\ue8ac",
          iconOff: "\\ue8ac",
          colorOn: "0x4CAF50",
          colorOff: "0xFFFFFF",
        });
        break;
    }
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
                : sensor.type === "binary"
                  ? "bg-green-100 text-green-800"
                  : sensor.type === "switch"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
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
                onChange={(e) => changeType(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="sensor">Sensor (Numeric)</option>
                <option value="binary">Binary Sensor</option>
                <option value="light">Light</option>
                <option value="switch">Switch</option>
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
                      iconSet={iconSet}
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
              {(sensor.type === "light" || sensor.type === "switch") && null}
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Thresholds &amp; colours
                  </p>
                  <p className="text-xs text-gray-400">Highest value first</p>
                </div>
                <button
                  type="button"
                  onClick={addThreshold}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  title="Add threshold"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {thresholds.map((threshold, i) => (
                  <div key={i} className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Threshold {i + 1}
                        {i === 0 ? " (highest)" : i === thresholds.length - 1 ? " (lowest)" : ""}
                      </span>
                      {thresholds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeThreshold(i)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
                          title="Remove threshold"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={threshold.value}
                        onChange={(e) => updateThreshold(i, "value", e.target.value)}
                        className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="1000"
                      />
                      <input
                        type="color"
                        value={cydColorToCss(threshold.color || "0x32CD32")}
                        onChange={(e) =>
                          updateThreshold(i, "color", cssToCydColor(e.target.value))
                        }
                        className="w-8 h-8 shrink-0 rounded border border-gray-300 cursor-pointer"
                        title="Threshold colour"
                      />
                      <IconPicker
                        value={threshold.icon ?? sensor.icon}
                        onChange={(code) =>
                          updateThreshold(i, "icon", code === sensor.icon ? "" : code)
                        }
                        iconColor={threshold.color || sensor.iconColor}
                        buttonClassName="w-8 h-8 shrink-0 p-0.5"
                        iconSet={iconSet}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : sensor.type === "binary" || sensor.type === "light" || sensor.type === "switch" ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">ON</span>
                  <div className="flex items-end gap-1">
                    <input
                      type="text"
                      value={sensor.stateOn ?? ""}
                      onChange={(e) => updateField("stateOn", e.target.value)}
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder={sensor.type === "binary" ? "Open" : "On"}
                    />
                    <IconPicker
                      value={sensor.iconOn ?? sensor.iconOff ?? ""}
                      onChange={(code) => updateField("iconOn", code)}
                      iconColor={sensor.colorOn ?? (sensor.type === "light" ? "0xFFE082" : sensor.type === "switch" ? "0x4CAF50" : "0xFF5252")}
                      buttonClassName="w-9 h-9 shrink-0 p-0.5"
                      iconSet={iconSet}
                    />
                  </div>
                </div>
                <div className="rounded border border-gray-300 p-2 flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">OFF</span>
                  <div className="flex items-end gap-1">
                    <input
                      type="text"
                      value={sensor.stateOff ?? ""}
                      onChange={(e) => updateField("stateOff", e.target.value)}
                      className="flex-1 min-w-0 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder={sensor.type === "binary" ? "Closed" : "Off"}
                    />
                    <IconPicker
                      value={sensor.iconOff ?? sensor.iconOn ?? ""}
                      onChange={(code) => updateField("iconOff", code)}
                      iconColor={sensor.colorOff ?? "0x32CD32"}
                      buttonClassName="w-9 h-9 shrink-0 p-0.5"
                      iconSet={iconSet}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
