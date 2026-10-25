import {
  configExportBasename,
  jsonExportFilename,
  sanitizeExportBasename,
  yamlExportFilename,
} from '../exportFilename';

describe('sanitizeExportBasename', () => {
  it('lowercases and slugifies ESPHome-safe names', () => {
    expect(sanitizeExportBasename('GLight')).toBe('glight');
    expect(sanitizeExportBasename('Kitchen Display')).toBe('kitchen-display');
    expect(sanitizeExportBasename('  My_CYD.1  ')).toBe('my-cyd-1');
  });

  it('falls back when empty or punctuation-only', () => {
    expect(sanitizeExportBasename('')).toBe('hamon');
    expect(sanitizeExportBasename('   ')).toBe('hamon');
    expect(sanitizeExportBasename('!!!')).toBe('hamon');
  });
});

describe('config export filenames', () => {
  it('prefers deviceName over friendlyName', () => {
    const config = { deviceName: 'glight', friendlyName: 'Garage Light' };
    expect(configExportBasename(config)).toBe('glight');
    expect(jsonExportFilename(config)).toBe('glight-config.json');
    expect(yamlExportFilename(config)).toBe('glight.yaml');
  });

  it('uses friendlyName when deviceName is missing', () => {
    expect(jsonExportFilename({ friendlyName: 'Hall Clock' })).toBe('hall-clock-config.json');
    expect(yamlExportFilename({ friendlyName: 'Hall Clock' })).toBe('hall-clock.yaml');
  });

  it('falls back to hamon when both names are empty', () => {
    expect(jsonExportFilename({ deviceName: '', friendlyName: '' })).toBe('hamon-config.json');
    expect(yamlExportFilename({})).toBe('hamon.yaml');
  });

  it('uses friendlyName when deviceName slugs to empty', () => {
    expect(yamlExportFilename({ deviceName: '!!!', friendlyName: 'Hall Clock' })).toBe(
      'hall-clock.yaml',
    );
  });
});
