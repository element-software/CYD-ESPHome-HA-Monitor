'use client';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ConfigData, SensorConfig } from '@/types/config';

interface ImportConfigModalProps {
  pendingConfig: ConfigData | null;
  open: boolean;
  onConfirm: (config: ConfigData) => void;
  onClose: () => void;
}

function sensorTypeLabel(sensor: SensorConfig): string {
  return sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1);
}

export default function ImportConfigModal({
  pendingConfig,
  open,
  onConfirm,
  onClose,
}: ImportConfigModalProps) {
  const t = useTranslations('importConfigModal');
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

  if (!pendingConfig) return null;

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[90vw] max-w-lg rounded-lg shadow-xl border-0 bg-white p-0 overflow-hidden backdrop:bg-black/50"
    >
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-800">{t('title')}</h2>
        <p className="text-sm text-gray-600">{t('description')}</p>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm space-y-2">
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 w-36 shrink-0">{t('deviceName')}:</span>
            <span className="text-gray-900 truncate">{pendingConfig.deviceName}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 w-36 shrink-0">{t('friendlyName')}:</span>
            <span className="text-gray-900 truncate">{pendingConfig.friendlyName}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium text-gray-700 w-36 shrink-0">{t('sensors')}:</span>
            <span className="text-gray-900">{pendingConfig.sensors.length}</span>
          </div>
          <ul className="mt-1 space-y-1 pl-4 list-disc text-gray-700">
            {pendingConfig.sensors.map((sensor) => (
              <li key={sensor.id} className="text-xs">
                <span className="font-medium">{sensor.label}</span>
                {' — '}
                <span className="text-gray-500">{sensorTypeLabel(sensor)}</span>
                {' · '}
                <span className="text-gray-400 font-mono">{sensor.entity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {tCommon('cancel')}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(pendingConfig)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
