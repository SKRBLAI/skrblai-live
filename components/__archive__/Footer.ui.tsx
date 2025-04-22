'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = {
  Products: [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/book-publishing', label: 'Book Publishing' },
    { href: '/branding', label: 'Branding' },
    { href: '/content-automation', label: 'Content Automation' }
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' }
  ],
  Resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/docs', label: 'Documentation' },
    { href: '/support', label: 'Support' }
  ],
  Contact: [
    { href: '/contact', label: 'Contact Us' },
    { href: 'mailto:contact@skrblai.io', label: 'contact@skrblai.io' }
  ]
};

export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-white font-semibold mb-4"
              >
                {category}
              </motion.h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center text-gray-400 text-sm"
          >
            © {new Date().getFullYear()} Percy AI. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
