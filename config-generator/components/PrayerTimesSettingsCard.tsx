'use client';

import { ConfigData, PrayerSchool } from '@/types/config';
import { PRAYER_TIMES_CITIES } from '@/lib/defaultConfig';

interface PrayerTimesSettingsCardProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

const SCHOOL_OPTIONS: { value: PrayerSchool; label: string; description: string }[] = [
  { value: 'hanafi', label: 'Hanafi', description: 'Later Asr time' },
  { value: 'shafi', label: "Shafi'i / Maliki / Hanbali", description: 'Earlier Asr time' },
];

export default function PrayerTimesSettingsCard({ config, onChange }: PrayerTimesSettingsCardProps) {
  const pt = config.prayerTimes ?? { city: 'London', school: 'hanafi' as PrayerSchool, refreshMinutes: 60 };

  const update = (partial: Partial<typeof pt>) => {
    onChange({ ...config, prayerTimes: { ...pt, ...partial } });
  };

  const useLatLng = !!(pt.lat && pt.lng);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-1 text-gray-800">
        Prayer Times Settings
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Configure the <a href="https://prayertimes.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">prayertimes.dev</a> API for your location.
      </p>

      <div className="space-y-4">
        {/* City selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select
            value={pt.city}
            onChange={(e) => update({ city: e.target.value, lat: undefined, lng: undefined })}
            disabled={useLatLng}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            {PRAYER_TIMES_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {useLatLng && (
            <p className="text-xs text-amber-600 mt-1">City is ignored when latitude/longitude are set.</p>
          )}
        </div>

        {/* Lat/Lng override */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Coordinates <span className="text-gray-400 font-normal">(optional — overrides city)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={pt.lat ?? ''}
              onChange={(e) => update({ lat: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Latitude (e.g. 51.5074)"
            />
            <input
              type="text"
              value={pt.lng ?? ''}
              onChange={(e) => update({ lng: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Longitude (e.g. -0.1278)"
            />
          </div>
          {useLatLng && (
            <button
              type="button"
              onClick={() => update({ lat: undefined, lng: undefined })}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Clear coordinates (use city instead)
            </button>
          )}
        </div>

        {/* School */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">School of Jurisprudence</label>
          <div className="grid grid-cols-2 gap-2">
            {SCHOOL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50"
              >
                <input
                  type="radio"
                  name="prayerSchool"
                  value={opt.value}
                  checked={pt.school === opt.value}
                  onChange={() => update({ school: opt.value })}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                  <p className="text-xs text-gray-500">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
