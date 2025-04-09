'use client';

import { motion } from 'framer-motion';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface Value {
  icon: string;
  title: string;
  description: string;
}

const timeline: TimelineEvent[] = [
  {
    year: '2023',
    title: 'The Beginning',
    description: 'SKRBL AI was founded with a vision to revolutionize content creation through AI.'
  },
  {
    year: '2024',
    title: 'Rapid Growth',
    description: 'Expanded our AI capabilities and launched our suite of automation tools.'
  },
  {
    year: '2025',
    title: 'Going Global',
    description: 'Helping creators and businesses worldwide scale their content creation.'
  }
];

const values: Value[] = [
  {
    icon: '🤖',
    title: 'Automation-First',
    description: 'We believe in working smarter, not harder. Our tools automate the mundane so you can focus on creativity.'
  },
  {
    icon: '🎨',
    title: 'Design-Forward',
    description: 'Beautiful design is at the heart of everything we do. We create tools that are both powerful and delightful to use.'
  },
  {
    icon: '📈',
    title: 'Results-Driven',
    description: 'We measure success by the real impact our tools have on your content creation and business growth.'
  }
];

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent"
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Building the future of AI-powered content creation
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="mb-20">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-electric-blue/20" />
            {timeline.map((event, index) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                className={`relative flex items-center justify-${index % 2 === 0 ? 'end' : 'start'} mb-12`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                  <div className="glass-card p-6">
                    <div className="text-electric-blue font-bold mb-2">{event.year}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400">{event.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-electric-blue shadow-lg shadow-electric-blue/50" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <span className="text-4xl mb-4 block">{value.icon}</span>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Percy Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto relative"
        >
          <div className="text-6xl text-electric-blue opacity-20 absolute top-4 left-4">“</div>
          <blockquote className="text-xl md:text-2xl text-gray-300 mb-6 relative z-10">
            Our mission is to empower creators with AI tools that amplify their creativity and productivity. We're not just building software; we're crafting the future of content creation.
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-electric-blue/20 flex items-center justify-center mr-4">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-white">Percy</div>
              <div className="text-sm text-gray-400">AI Assistant at SKRBL AI</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
