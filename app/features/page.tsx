import React from 'react';
import type { JSX } from 'react';
import PageLayout from 'components/layout/PageLayout';
import FeatureDisplay from '@/components/features/FeatureDisplay'; // Import the new client component
import { Metadata } from 'next';

const features = [
  {
    title: 'Branding',
    description: 'Create stunning brand identities with AI-powered logo design, color palette generation, and brand voice development.',
    icon: '🎨',
    href: '/branding',
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Publishing',
    description: 'Transform your manuscript into a published book with our AI-powered publishing pipeline.',
    icon: '📚',
    href: '/book-publishing',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    title: 'Marketing',
    description: 'Generate engaging social content, compelling proposals, and deep analytics insights.',
    icon: '📈',
    href: '/services',
    color: 'from-sky-500 to-cyan-500'
  },
  {
    title: 'Web & Funnels',
    description: 'Build high-converting landing pages and sales funnels powered by AI.',
    icon: '🌐',
    href: '/services',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    title: 'Custom AI Agents',
    description: 'Design and deploy your own AI agents tailored to your specific needs.',
    icon: '🤖',
    href: '/services',
    color: 'from-amber-500 to-orange-500'
  }
];

export const metadata: Metadata = {
  title: 'Features - SKRBL AI',
  description: 'Explore the powerful AI agents and automation features of SKRBL AI',
};

export default function FeaturesPage(): JSX.Element {
  return (
    <PageLayout>
      <FeatureDisplay features={features} />
    </PageLayout>
  );
} 
