import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ConfigGeneratorClient from '@/components/ConfigGeneratorClient';

export const metadata: Metadata = {
  title: 'Config Generator | CYD',
  description: 'Generate ESPHome YAML for CYD Home Assistant Monitor',
};

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
