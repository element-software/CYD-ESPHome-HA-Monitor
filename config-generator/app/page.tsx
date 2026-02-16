'use client';

import { useState } from 'react';
import ConfigForm from '@/components/ConfigForm';
import YamlOutput from '@/components/YamlOutput';
import { ConfigData } from '@/types/config';

const defaultConfig: ConfigData = {
  deviceName: 'hamon',
  friendlyName: 'HAMon',
  sensors: [
    {
      id: 'r1c1',
      type: 'sensor',
      entity: 'sensor.whole_home_energy_usage',
      label: 'Energy',
      icon: '\\uea0b',
      iconColor: '0xFFA500',
      format: '%.0fW',
      colorThreshHigh: '5000',
      colorThreshMid: '3000',
      colorThreshLow: '1000',
    },
    {
      id: 'r1c2',
      type: 'binary',
      entity: 'binary_sensor.front_door_sensor_contact',
      label: 'Front Door',
      icon: '\\ueffc',
      iconColor: '0x888888',
      stateOn: 'Open',
      stateOff: 'Closed',
      colorOn: '0xFF5252',
      colorOff: '0x32CD32',
    },
    {
      id: 'r2c1',
      type: 'sensor',
      entity: 'sensor.office_presence_one_temperature',
      label: 'Office',
      icon: '\\ue1ff',
      iconColor: '0x00BFFF',
      format: '%.1f°C',
      colorThreshHigh: '30',
      colorThreshMid: '25',
      colorThreshLow: '15',
    },
    {
      id: 'r2c2',
      type: 'binary',
      entity: 'binary_sensor.gate_door_contact',
      label: 'Gate',
      icon: '\\ue559',
      iconColor: '0x888888',
      stateOn: 'Open',
      stateOff: 'Closed',
      colorOn: '0xFF5252',
      colorOff: '0x32CD32',
    },
    {
      id: 'r3c1',
      type: 'binary',
      entity: 'binary_sensor.garden_pano_person_occupancy',
      label: 'Garden',
      icon: '\\ue7fd',
      iconColor: '0x888888',
      stateOn: 'Detected',
      stateOff: 'Clear',
      colorOn: '0xFF5252',
      colorOff: '0x32CD32',
    },
    {
      id: 'r3c2',
      type: 'binary',
      entity: 'binary_sensor.loft_access_door_contact',
      label: 'Loft',
      icon: '\\ue88a',
      iconColor: '0x888888',
      stateOn: 'Open',
      stateOff: 'Closed',
      colorOn: '0xFF5252',
      colorOff: '0x32CD32',
    },
  ],
};

export default function Home() {
  const [config, setConfig] = useState<ConfigData>(defaultConfig);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CYD HAMon Config Generator
          </h1>
          <p className="text-gray-600">
            Configure your Cheap Yellow Display Home Assistant Monitor
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <ConfigForm config={config} onChange={setConfig} />
          <YamlOutput config={config} />
        </div>
      </div>
    </main>
  );
}
