'use client';

import { useRef, useEffect, useState } from 'react';
import { commonIcons, findIconByCode, iconCodeToLigature } from '@/lib/icons';
import { cydColorToCss } from '@/lib/colorUtils';

interface IconPickerProps {
  value: string;
  onChange: (code: string) => void;
  iconColor?: string;
  label?: string;
  /** Optional class for the trigger button (e.g. w-11 h-11 for square). */
  buttonClassName?: string;
}

export default function IconPicker({
  value,
  onChange,
  label = 'Icon',
  iconColor = '0x888888',
  buttonClassName,
}: IconPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedIcon = findIconByCode(value);
  const iconCssColor = cydColorToCss(iconColor);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const handleSelect = (code: string) => {
    onChange(code);
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
          {label}
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
                className="material-icons text-2xl"
                style={{ color: iconCssColor }}
              >
                {iconCodeToLigature(value)}
              </span>
          ) : (
            <span className="material-icons text-2xl" style={{ color: iconCssColor }}>
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
            className="w-[min(90vw,28rem)] max-h-[85vh] rounded-xl shadow-xl border-0 overflow-hidden bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">Choose icon</h3>
              <p className="text-sm text-gray-500 mt-0.5">Click an icon to select it</p>
            </div>
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {commonIcons.map((icon) => {
                  const isSelected = findIconByCode(value)?.code === icon.code;
                  return (
                    <button
                      key={icon.code}
                      type="button"
                      onClick={() => handleSelect(icon.code)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                      title={icon.name}
                    >
                      <span className="material-icons text-3xl mb-1">{icon.ligature}</span>
                      <span className="text-xs font-medium truncate w-full text-center">
                        {icon.name}
                      </span>
                    </button>
                  );
                })}
              </div>
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
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
