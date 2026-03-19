import { ConfigData } from '@/types/config';

export function isValidConfig(value: unknown): value is ConfigData {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.deviceName === 'string' &&
    typeof obj.deviceVariant === 'string' &&
    Array.isArray(obj.sensors)
  );
}
