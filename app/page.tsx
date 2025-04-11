import PercyIntakeForm from '@/components/forms/PercyIntakeForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-navy overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PercyIntakeForm />
      </div>
    </main>
  );
}