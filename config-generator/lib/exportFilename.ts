const DEFAULT_BASENAME = 'hamon';

export function sanitizeExportBasename(name: string, fallback = DEFAULT_BASENAME): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function configExportBasename(config: {
  deviceName?: string;
  friendlyName?: string;
}): string {
  const fromDevice = sanitizeExportBasename(config.deviceName || '', '');
  if (fromDevice) return fromDevice;
  return sanitizeExportBasename(config.friendlyName || '');
}

export function jsonExportFilename(config: {
  deviceName?: string;
  friendlyName?: string;
}): string {
  return `${configExportBasename(config)}-config.json`;
}

export function yamlExportFilename(config: {
  deviceName?: string;
  friendlyName?: string;
}): string {
  return `${configExportBasename(config)}.yaml`;
}
