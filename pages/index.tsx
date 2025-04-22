import PageLayout from '@/components/layout/PageLayout'
import Link from 'next/link'

const Home = () => (
  <PageLayout title="Welcome to SKRBL AI">
    <section className="max-w-4xl mx-auto px-4 py-16 text-center glass-card rounded-xl shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
      <h1 className="text-5xl font-bold mb-6 text-white drop-shadow">Welcome to SKRBL AI</h1>
      <p className="text-lg text-gray-300 mb-8">
        Your all-in-one AI platform for publishing, branding, content automation, and more. Let Percy help you get started.
      </p>
      <div className="flex justify-center flex-wrap gap-4">
        <Link href="/ask-percy" className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition">
          Ask Percy
        </Link>
        <Link href="/services" className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition">
          Explore Services
        </Link>
        <Link href="/about" className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition">
          Learn About Us
        </Link>
      </div>
    </section>
  </PageLayout>
)

export default Home
