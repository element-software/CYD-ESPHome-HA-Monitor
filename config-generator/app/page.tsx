import PageHeader from '@/components/PageHeader';
import ConfigGeneratorClient from '@/components/ConfigGeneratorClient';
import PageFooter from '@/components/PageFooter';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PageHeader />
        <ConfigGeneratorClient />
        <PageFooter />
      </div>
    </main>
  );
}
