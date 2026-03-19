import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/metadata';
import AboutCydContent from '@/components/AboutCydContent';

export const metadata: Metadata = buildPageMetadata({
  title: 'About the CYD (Cheap Yellow Display) — Full Guide',
  description:
    'Complete guide to the CYD (Cheap Yellow Display): variations, hardware, pinout, diagrams, ESPHome, and Home Assistant integration with reference links.',
  imagePath: '/og/about-cyd.png',
  imageAlt: 'About the CYD (Cheap Yellow Display) — Full Guide',
});

export default function AboutCydPage() {
  return <AboutCydContent />;
}
