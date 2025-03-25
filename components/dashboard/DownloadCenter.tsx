'use client';

import { motion } from 'framer-motion';

const downloadItems = [
  {
    id: 1,
    title: 'Brand Kit',
    description: 'Complete branding package including logos, colors, and fonts',
    url: 'https://example.com/brand-kit.zip'
  },
  {
    id: 2,
    title: 'Social Media Template Pack',
    description: 'Ready-to-use templates for Instagram, LinkedIn, and Twitter',
    url: 'https://example.com/social-templates.zip'
  },
  {
    id: 3,
    title: 'Proposal PDF Examples',
    description: 'Sample proposals for different project types',
    url: 'https://example.com/proposal-examples.pdf'
  },
  {
    id: 4,
    title: 'Marketing Strategy Guide',
    description: 'Comprehensive guide to developing your marketing strategy',
    url: 'https://example.com/marketing-guide.pdf'
  }
];

export default function DownloadCenter() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Download Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {downloadItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20"
          >
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-soft-gray/80 mb-4">{item.description}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Download
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 