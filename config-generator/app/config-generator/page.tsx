import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ConfigGeneratorClient from '@/components/ConfigGeneratorClient';
import { buildPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Config Generator | CYD',
  description: 'Generate ESPHome YAML for CYD Home Assistant Monitor',
  imagePath: '/og/config-generator.png',
  imageAlt: 'Config Generator | CYD',
});

export default function ConfigGeneratorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        <ConfigGeneratorClient />
      </div>
    </main>
  );
}
