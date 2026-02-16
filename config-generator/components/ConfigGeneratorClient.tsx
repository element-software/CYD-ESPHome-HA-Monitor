'use client';

import { useState } from 'react';
import ConfigForm from '@/components/ConfigForm';
import YamlModal from '@/components/YamlModal';
import CydDevicePreview from '@/components/CydDevicePreview';
import { ConfigData } from '@/types/config';
import { defaultConfig } from '@/lib/defaultConfig';

export default function ConfigGeneratorClient() {
  const [config, setConfig] = useState<ConfigData>(defaultConfig);
  const [yamlModalOpen, setYamlModalOpen] = useState(false);

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-6 min-w-0 col-span-2">
          <ConfigForm config={config} onChange={setConfig} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setYamlModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
            >
              Generate YAML
            </button>
          </div>
        </div>
        <div className="lg:sticky lg:top-8 w-full min-w-0 col-span-1">
          <CydDevicePreview config={config} />
        </div>
      </div>
      <YamlModal
        config={config}
        open={yamlModalOpen}
        onClose={() => setYamlModalOpen(false)}
      />
    </>
  );
}
