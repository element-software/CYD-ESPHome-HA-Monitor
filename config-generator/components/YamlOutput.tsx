'use client';

import { ConfigData } from '@/types/config';
import { generateYaml } from '@/lib/yamlGenerator';
import CopyButton from './CopyButton';
import YamlPreview from './YamlPreview';

interface YamlOutputProps {
  config: ConfigData;
}

export default function YamlOutput({ config }: YamlOutputProps) {
  const yaml = generateYaml(config);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 h-fit max-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Generated YAML
        </h2>
        <CopyButton
          text={yaml}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
        />
      </div>
      <YamlPreview yaml={yaml} />
    </div>
  );
}
