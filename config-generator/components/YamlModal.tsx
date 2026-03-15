'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ConfigData } from '@/types/config';
import { generateYaml } from '@/lib/yamlGenerator';
import CopyButton from './CopyButton';
import YamlPreview from './YamlPreview';

interface YamlModalProps {
  config: ConfigData;
  open: boolean;
  onClose: () => void;
}

export default function YamlModal({ config, open, onClose }: YamlModalProps) {
  const t = useTranslations('yamlModal');
  const tCommon = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const yaml = generateYaml(config);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 m-auto w-[90vw] max-w-3xl h-[90vh] max-h-[90vh] rounded-lg shadow-xl border-0 bg-white p-0 overflow-hidden backdrop:bg-black/50"
    >
      <div className="flex flex-col h-full max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('title')}
          </h2>
          <div className="flex items-center gap-2">
            <CopyButton
              text={yaml}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              aria-label={tCommon('close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex-1 min-h-0">
          <YamlPreview yaml={yaml} />
        </div>
      </div>
    </dialog>
  );
}
