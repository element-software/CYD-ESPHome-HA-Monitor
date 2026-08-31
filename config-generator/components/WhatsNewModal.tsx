'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

export const WHATS_NEW_STORAGE_KEY = 'cyd_whats_new_v1';
const CONTRIBUTOR_GITHUB = 'https://github.com/jchisholm59';

const FEATURE_KEYS = ['screens', 'themes', 'slots', 'display', 'darkMode'] as const;

export default function WhatsNewModal() {
  const t = useTranslations('whatsNewModal');
  const tCommon = useTranslations('common');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(WHATS_NEW_STORAGE_KEY) !== 'seen') {
        setOpen(true);
      }
    } catch {
      // Ignore storage access errors (private mode, disabled cookies).
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(WHATS_NEW_STORAGE_KEY, 'seen');
    } catch {
      // Ignore storage write errors.
    }
    setOpen(false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => dismiss();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="whats-new-title"
      className="m-auto w-[min(96vw,28rem)] max-h-[90vh] overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50 dark:border-zinc-600"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-700">
        <h2 id="whats-new-title" className="text-lg font-semibold text-gray-800 dark:text-slate-100">
          {t('title')}
        </h2>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-200"
          aria-label={tCommon('close')}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{t('intro')}</p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-slate-200">
          {FEATURE_KEYS.map((key) => (
            <li key={key}>{t(`features.${key}`)}</li>
          ))}
        </ul>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">
          {t.rich('thanks', {
            link: (c: ReactNode) => (
              <a
                href={CONTRIBUTOR_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                title={tCommon('opensInNewTab')}
              >
                {c}
              </a>
            ),
          })}
        </p>
      </div>

      <div className="flex justify-end border-t border-gray-200 p-4 dark:border-zinc-700">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          {t('dismiss')}
        </button>
      </div>
    </dialog>
  );
}
