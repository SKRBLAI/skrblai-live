'use client';

import { motion } from 'framer-motion';

const downloads = [
  {
    title: 'Brand Kit',
    description: 'Download our official branding assets.',
    url: '/downloads/brand-kit.zip',
  },
  {
    title: 'Social Media Template Pack',
    description: 'Templates for your social media campaigns.',
    url: '/downloads/social-media-templates.zip',
  },
  {
    title: 'Proposal PDF Examples',
    description: 'Examples of professional proposals.',
    url: '/downloads/proposals.zip',
  },
  {
    title: 'Marketing Strategy Guide',
    description: 'A guide to developing successful campaigns.',
    url: '/downloads/marketing-guide.pdf',
  },
];

export default function DownloadCenter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-2xl font-bold mb-6">Download Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {downloads.map((item: { title: string; description: string; url: string }, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-soft-gray/80 mb-4">{item.description}</p>
                <a
                  href={item.url}
                  download
                  className="btn-primary inline-block"
                >
                  Download
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
