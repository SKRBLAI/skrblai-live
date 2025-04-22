import React from 'react';
import Link from 'next/link';

const services = [
  {
    title: 'Book Publishing',
    description: 'From idea to published book, we guide you through every step.',
    href: '/services/book-publishing',
  },
  {
    title: 'Branding & Marketing',
    description: 'Build your brand and reach your audience with AI-powered marketing.',
    href: '/services/branding',
  },
  {
    title: 'Content Automation',
    description: 'Automate your content creation and distribution for maximum efficiency.',
    href: '/services/content-automation',
  },
  {
    title: 'Website Creation',
    description: 'Launch a modern, responsive website tailored to your needs.',
    href: '/services/website-creation',
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#0D1117] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Link key={service.title} href={service.href} className="group block rounded-xl bg-gradient-to-br from-electric-blue/80 to-teal-400/80 p-6 shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-teal-200 transition-colors duration-200">{service.title}</h2>
              <p className="text-gray-200 mb-2">{service.description}</p>
              <span className="inline-block text-sm text-electric-blue group-hover:text-white font-semibold mt-2">Learn More →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
