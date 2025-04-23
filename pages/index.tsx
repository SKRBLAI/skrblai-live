import PageLayout from '@/components/layout/PageLayout'
import PercyChat from '@/components/PercyChat'
import Link from 'next/link'

export default function Home() {
  return (
    <PageLayout title="SKRBL AI – Your All-in-One AI Automation Platform">
      {/* Animated background (particles or floating icons) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none animate-pulse-slow opacity-40">
          {/* Example: animated floating icons or SVGs */}
          <div className="absolute left-1/4 top-10 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-50 animate-bounce" />
          <div className="absolute right-1/4 bottom-10 w-40 h-40 bg-electric-blue rounded-full blur-2xl opacity-40 animate-pulse" />
        </div>
      </div>
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
        <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">AI That Works While You Sleep 🧠⚡</h1>
        <p className="text-lg text-gray-300">Welcome to SKRBL — automate your content, branding, and publishing workflows with powerful AI agents.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/ask-percy" className="bg-teal-500 text-white px-6 py-3 rounded-xl hover:bg-teal-600 shadow-lg transition">Ask Percy</Link>
          <Link href="/services" className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 shadow-lg transition">Explore Services</Link>
          <Link href="/agents" className="border border-white text-white px-6 py-3 rounded-xl hover:bg-white hover:text-black shadow-lg transition">Meet the Agents</Link>
        </div>
      </section>
      <PercyChat />
    </PageLayout>
  );
}
