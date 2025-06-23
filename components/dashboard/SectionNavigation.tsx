'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SectionNavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const sections = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'my-agents', label: 'My Agents', icon: '🤖' },
  { id: 'activity', label: 'Activity', icon: '📈' },
  { id: 'discover', label: 'Discover', icon: '🔍' },
];

export default function SectionNavigation({ activeSection, onNavigate }: SectionNavigationProps) {
  return (
    <nav className="bg-white/5 backdrop-blur-lg rounded-xl p-2 border border-white/10">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeSection === section.id
                ? 'bg-electric-blue text-white'
                : 'hover:bg-white/10 text-gray-300'
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span className="font-medium">{section.label}</span>
            {activeSection === section.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 bg-electric-blue rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
