'use client';

import { ConfigData } from '@/types/config';
import DeviceSettingsCard from './DeviceSettingsCard';
import SensorList from './SensorList';

interface ConfigFormProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
}

export default function ConfigForm({ config, onChange }: ConfigFormProps) {
  return (
    <div className="space-y-6">
      <DeviceSettingsCard config={config} onChange={onChange} />
      <SensorList config={config} onChange={onChange} />
    </div>
  );
}
