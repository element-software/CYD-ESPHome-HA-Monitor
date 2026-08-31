'use client';

import { useState, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import ConfigForm from '@/components/ConfigForm';
import YamlModal from '@/components/YamlModal';
import ImportConfigModal from '@/components/ImportConfigModal';
import CydDevicePreview from '@/components/CydDevicePreview';
import { ConfigData } from '@/types/config';
import { useLocalStorageConfig } from '@/lib/useLocalStorageConfig';
import { isValidConfig } from '@/lib/configValidation';

/** mipi_spi display driver added in this release (replaces ili9xxx for new configs). */
const ESPHOME_MIPI_RELEASE_NOTES = 'https://esphome.io/changelog/2025.5.0/';

const esphomeNoticeRich = {
  strong: (c: ReactNode) => <strong>{c}</strong>,
  code: (c: ReactNode) => (
    <code className="bg-gray-100 dark:bg-slate-950 px-1 rounded text-[0.9em] text-gray-900 dark:text-slate-100">{c}</code>
  ),
  link: (c: ReactNode) => (
    <a
      href={ESPHOME_MIPI_RELEASE_NOTES}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 font-medium underline underline-offset-2"
    >
      {c}
    </a>
  ),
};

export default function ConfigGeneratorClient() {
  const t = useTranslations('configGeneratorPage');
  const tImport = useTranslations('importConfigModal');
  const [config, setConfig] = useLocalStorageConfig();
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const screenCount = config.screens?.length ?? 1;
  const safeScreenIndex = Math.min(activeScreenIndex, Math.max(0, screenCount - 1));
  const [yamlModalOpen, setYamlModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<ConfigData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hamon-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected after a cancel
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed: unknown = JSON.parse(ev.target?.result as string);
        if (!isValidConfig(parsed)) {
          setImportError(tImport('invalidFile'));
          return;
        }
        setPendingConfig(parsed);
        setImportModalOpen(true);
      } catch {
        setImportError(tImport('errorReading'));
      }
    };
    reader.onerror = () => setImportError(tImport('errorReading'));
    reader.readAsText(file);
  }

  function handleImportConfirm(imported: ConfigData) {
    setConfig(imported);
    setImportModalOpen(false);
    setPendingConfig(null);
  }

  function handleImportClose() {
    setImportModalOpen(false);
    setPendingConfig(null);
  }

  return (
    <>
      <div
        className="mb-6 rounded-lg border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-gray-800 leading-relaxed dark:border-blue-700 dark:bg-blue-950 dark:text-slate-100"
        role="note"
      >
        {t.rich('esphomeNotice', esphomeNoticeRich)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-6 min-w-0 col-span-2">
          <ConfigForm config={config} onChange={setConfig} activeScreenIndex={safeScreenIndex} onActiveScreenChange={setActiveScreenIndex} />
        </div>
        <div className="lg:sticky lg:top-8 w-full min-w-0 col-span-2 lg:col-span-1 flex flex-col gap-4 p-4 border border-gray-200 rounded-lg bg-white">
          <CydDevicePreview config={config} activeScreenIndex={safeScreenIndex} />
          <button
            type="button"
            onClick={() => setYamlModalOpen(true)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
          >
            {t('generateYaml')}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors text-sm"
            >
              {t('exportJson')}
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors text-sm"
            >
              {t('importJson')}
            </button>
          </div>
          {importError && (
            <p className="text-sm text-red-600">{importError}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <YamlModal
        config={config}
        open={yamlModalOpen}
        onClose={() => setYamlModalOpen(false)}
      />
      <ImportConfigModal
        pendingConfig={pendingConfig}
        open={importModalOpen}
        onConfirm={handleImportConfirm}
        onClose={handleImportClose}
      />
    </>
  );
}
