'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ConfigForm from '@/components/ConfigForm';
import YamlModal from '@/components/YamlModal';
import CydDevicePreview from '@/components/CydDevicePreview';
import { useLocalStorageConfig } from '@/lib/useLocalStorageConfig';

export default function ConfigGeneratorClient() {
  const t = useTranslations('configGeneratorPage');
  const [config, setConfig] = useLocalStorageConfig();
  const [yamlModalOpen, setYamlModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-6 min-w-0 col-span-2">
          <ConfigForm config={config} onChange={setConfig} />
        </div>
        <div className="lg:sticky lg:top-8 w-full min-w-0 col-span-2 lg:col-span-1 flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-white">
          <CydDevicePreview config={config} />
          <button
            type="button"
            onClick={() => setYamlModalOpen(true)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
          >
            {t('generateYaml')}
          </button>
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
