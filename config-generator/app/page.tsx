import PageHeader from '@/components/PageHeader';
import ConfigGeneratorClient from '@/components/ConfigGeneratorClient';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        <ConfigGeneratorClient />
      </div>
    </main>
  );
}
