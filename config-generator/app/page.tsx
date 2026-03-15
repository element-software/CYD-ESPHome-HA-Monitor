import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/metadata';
import HomePageContent from '@/components/HomePageContent';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cheap Yellow Display (CYD) – Config & Info',
  description:
    'Information about the ESP32 CYD (Cheap Yellow Display) and the Config Generator to build ESPHome YAML for the Home Assistant monitor',
  imagePath: '/og/home.png',
  imageAlt: 'Cheap Yellow Display (CYD) – Config & Info',
});

export default function Home() {
  return <HomePageContent />;
}
