/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

const nextConfig = {
  output: 'export',
  // GitHub Pages project site is served at /CYD-ESPHome-HA-Monitor
  basePath: process.env.PAGES_BASE_PATH || '',
  assetPrefix: process.env.PAGES_BASE_PATH || '',
};

module.exports = withNextIntl(nextConfig);
