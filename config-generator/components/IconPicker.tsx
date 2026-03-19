'use client';

import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { findIconByCode, getCodeForIconSet, getIconFontClass, getIconsForSet, iconCodeToLigature } from '@/lib/icons';
import { cydColorToCss } from '@/lib/colorUtils';
import type { IconSet } from '@/types/config';

interface IconPickerProps {
  value: string;
  onChange: (code: string) => void;
  iconColor?: string;
  label?: string;
  /** Optional class for the trigger button (e.g. w-11 h-11 for square). */
  buttonClassName?: string;
  /** Icon set for display (Material Design Icons vs Material Symbols). */
  iconSet?: IconSet;
}

export default function IconPicker({
  value,
  onChange,
  label,
  iconColor = '0x888888',
  buttonClassName,
  iconSet,
}: IconPickerProps) {
  const t = useTranslations('iconPicker');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedIcon = findIconByCode(value);
  const iconCssColor = cydColorToCss(iconColor);

  const open = () => {
    setSearch('');
    setIsOpen(true);
  };

  const close = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const iconsForSet = getIconsForSet(iconSet);
  const handleSelect = (icon: (typeof iconsForSet)[number]) => {
    onChange(getCodeForIconSet(icon, iconSet));
    close();
  };

  // Only mount and show dialog when isOpen is true (stops expand-panel from opening it)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    dialog.showModal();
    const onClose = () => setIsOpen(false);
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [isOpen]);

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label ?? t('label')}
        </label>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            open();
          }}
          className={`flex items-center justify-center gap-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-700 font-medium ${buttonClassName ?? 'w-full px-4 py-2.5'}`}
        >
          {selectedIcon ? (
              <span
                className={`${getIconFontClass(iconSet)} text-2xl`}
                style={{ color: iconCssColor }}
              >
                {iconCodeToLigature(value, iconSet)}
              </span>
          ) : (
            <span className={`${getIconFontClass(iconSet)} text-2xl`} style={{ color: iconCssColor }}>
              edit
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <dialog
          ref={dialogRef}
          className="fixed inset-0 flex items-center justify-center p-4 w-full h-full max-w-none max-h-none rounded-none border-0 bg-black/40 backdrop:bg-black/40"
          onClick={(e) => {
            if (e.target === dialogRef.current) close();
          }}
        >
          <div
            className="w-full h-full rounded-xl shadow-xl border-0 overflow-hidden bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">{t('title')}</h3>
              <input
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              {(() => {
                const query = search.toLowerCase();
                const filtered = iconsForSet.filter(
                  (i) => i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query)
                );
                const categories = Array.from(new Set(filtered.map((i) => i.category)));
                if (filtered.length === 0) {
                  return <p className="text-sm text-gray-400 text-center py-8">{t('noResults', { search })}</p>;
                }
                return categories.map((cat) => (
                  <div key={cat} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat}</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
                      {filtered.filter((i) => i.category === cat).map((icon) => {
                        const isSelected = findIconByCode(value)?.ligature === icon.ligature;
                        return (
                          <button
                            key={icon.ligature}
                            type="button"
                            onClick={() => handleSelect(icon)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                            title={icon.name}
                          >
                            <span className={`${getIconFontClass(iconSet)} text-2xl mb-0.5`}>{icon.ligature}</span>
                            <span className="text-[10px] font-medium truncate w-full text-center leading-tight">
                              {icon.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  close();
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
