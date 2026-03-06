#!/usr/bin/env node
/**
 * Generates static Open Graph images (1200×630) for the site and writes them
 * to public/og/. Run: npm run generate:og
 *
 * Uses sharp to render SVG templates to PNG. Requires: npm install sharp
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "og");

const WIDTH = 1200;
const HEIGHT = 630;

/** Pages that need an OG image; imagePath in metadata must match key (e.g. home → /og/home.png). */
const PAGES = [
  {
    key: "home",
    title: "Cheap Yellow Display (CYD)",
    subtitle: "Config & Info — ESP32 CYD, ESPHome, Home Assistant",
  },
  {
    key: "config-generator",
    title: "Config Generator",
    subtitle: "Generate ESPHome YAML for CYD Home Assistant Monitor",
  },
  {
    key: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "CYD HAMon Config Generator",
  },
  {
    key: "about-cyd",
    title: "About the CYD",
    subtitle: "Cheap Yellow Display — Full Guide",
  },
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSvg(title, subtitle) {
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1c1917"/>
      <stop offset="100%" style="stop-color:#292524"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="4" fill="#f59e0b"/>
  <text x="600" y="300" text-anchor="middle" fill="#fef3c7" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700">${safeTitle}</text>
  <text x="600" y="360" text-anchor="middle" fill="#d6d3d1" font-family="system-ui, -apple-system, sans-serif" font-size="36">${safeSubtitle}</text>
  <text x="600" y="580" text-anchor="middle" fill="#78716c" font-family="system-ui, -apple-system, sans-serif" font-size="28">cheapyellowdisplay.co.uk</text>
</svg>`.trim();
}

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Missing dependency: run  npm install sharp");
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const page of PAGES) {
    const svg = buildSvg(page.title, page.subtitle);
    const outPath = path.join(OUT_DIR, `${page.key}.png`);
    const buffer = Buffer.from(svg);
    await sharp(buffer)
      .resize(WIDTH, HEIGHT)
      .png()
      .toFile(outPath);
    console.log(`Wrote ${outPath}`);
  }

  console.log(`Done. ${PAGES.length} OG images in public/og/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
