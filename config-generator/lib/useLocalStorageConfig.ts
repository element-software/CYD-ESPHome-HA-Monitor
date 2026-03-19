'use client';

import { useState, useEffect, useRef } from 'react';
import { ConfigData } from '@/types/config';
import { defaultConfig } from '@/lib/defaultConfig';

const STORAGE_KEY = 'hamon-config';
const SAVE_DEBOUNCE_MS = 300;

function isValidConfig(value: unknown): value is ConfigData {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.deviceName === 'string' &&
    typeof obj.deviceVariant === 'string' &&
    Array.isArray(obj.sensors)
  );
}

export function useLocalStorageConfig(): [ConfigData, (config: ConfigData) => void] {
  const [config, setConfigState] = useState<ConfigData>(defaultConfig);
  const [initialized, setInitialized] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidConfig(parsed)) {
          setConfigState(parsed);
        }
      }
    } catch {
      // Ignore errors and keep defaultConfig
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        // Ignore storage write errors
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [config, initialized]);

  return [config, setConfigState];
}
