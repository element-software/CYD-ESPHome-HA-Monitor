'use client';

import { ConfigData } from '@/types/config';
import DeviceSettingsCard from './DeviceSettingsCard';
import SensorList from './SensorList';
import PrayerTimesSettingsCard from './PrayerTimesSettingsCard';

interface ConfigFormProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function ConfigForm({ config, onChange }: ConfigFormProps) {
  const isPrayerTimes = config.preset === 'prayer_times';

  return (
    <div className="space-y-6">
      <DeviceSettingsCard config={config} onChange={onChange} />
      {isPrayerTimes
        ? <PrayerTimesSettingsCard config={config} onChange={onChange} />
        : <SensorList config={config} onChange={onChange} />
      }
    </div>
  );
}
