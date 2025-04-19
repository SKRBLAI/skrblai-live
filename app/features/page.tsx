/** Features Page Enhancements – Interactivity + Visual Polish – April 2025 */

'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import StatCounter from '@/components/features/StatCounter';
import FeatureModal from '@/components/features/FeatureModal';
import '@/styles/components/Features.css';

interface Feature {
  id: string;
  title: string;
  description: string;
  stat: string;
  statDescription: string;
  icon: string;
}

const features: Feature[] = [
  {
    id: 'publishing',
    title: 'AI Publishing',
    description: 'Automate your content publishing workflow across all major platforms with intelligent scheduling and optimization.',
    stat: '10+',
    statDescription: 'hours saved per week',
    icon: '📱'
  },
  {
    id: 'branding',
    title: 'Branding Automation',
    description: 'Generate consistent brand assets and marketing materials in seconds, maintaining your unique brand identity.',
    stat: '5x',
    statDescription: 'faster brand asset creation',
    icon: '✨'
  },
  {
    id: 'ads',
    title: 'Ad Creative Generation',
    description: 'Create high-converting ad creatives with AI-powered design and copy suggestions based on performance data.',
    stat: '23%',
    statDescription: 'increase in click-through rate',
    icon: '🎯'
  },
  {
    id: 'time-savings',
    title: 'Accelerated Workflow',
    description: 'Dramatically reduce time-to-market for your digital assets, content, and campaigns with our AI automation.',
    stat: '92%',
    statDescription: 'time savings using SKRBL AI',
    icon: '⏱️'
  },
  {
    id: 'launches',
    title: 'Business Automation',
    description: 'Join the growing number of businesses that have streamlined their digital operations through SKRBL AI.',
    stat: '80+',
    statDescription: 'businesses automated launches',
    icon: '🚀'
  },
  {
    id: 'speed',
    title: 'Market Velocity',
    description: 'Gain a competitive edge by bringing your ideas to market faster than your competitors.',
    stat: '10x',
    statDescription: 'faster time to market',
    icon: '⚡'
  },
  {
    id: 'satisfaction',
    title: 'Client Satisfaction',
    description: 'Our beta users report outstanding satisfaction with the results and efficiency of SKRBL AI tools.',
    stat: '96%',
    statDescription: 'satisfaction rating (beta feedback)',
    icon: '🏆'
  }
];

export default function FeaturesPage() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    // Initialize particles (simplified for performance)
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    const particles: Array<{ x: number; y: number; size: number; speed: number }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < (window.innerWidth < 768 ? 30 : 50); i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2
      });
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';

      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particle.y += particle.speed;
        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="max-w-7xl mx-auto px-4" ref={containerRef}>
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_4px_rgba(138,43,226,0.7)]"
          >
            Supercharge Your Content Creation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Powerful features to help you create, publish, and scale your content
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 mb-4">{feature.description}</p>
              <div className="stat-card">
                <StatCounter
                  end={parseInt(feature.stat)}
                  suffix={feature.stat.includes('+') ? '+' : feature.stat.includes('x') ? 'x' : '%'}
                />
                <div className="text-sm text-gray-500 mt-2">{feature.statDescription}</div>
              </div>

              <div 
                className={`absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10 transition-opacity duration-300 ${hoveredFeature === feature.id ? 'opacity-100' : 'opacity-0'}`}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="/?intent=launch_website#percy"
            className="inline-block px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Get Started with SKRBL AI
          </a>
        </motion.div>
      </div>

      <motion.button
        className="fab"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsModalOpen(true)}
        aria-label="Ask Percy for feature details"
      >
        Ask Percy
        <span className="fab-tooltip">Need help deciding?</span>
      </motion.button>

      <FeatureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}
