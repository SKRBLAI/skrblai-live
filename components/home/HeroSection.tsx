'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PercyAvatar from '@/components/home/PercyAvatar';

const metrics = [
  { value: '92%', label: 'Time Savings' },
  { value: '10x', label: 'Faster Launch' },
  { value: '80+', label: 'Businesses' },
  { value: '96%', label: 'Satisfaction' }
];

const demoPrompts = [
  'Create a responsive landing page for my coaching business',
  'Design a modern logo for my tech startup',
  'Write engaging social media content for my product launch',
  'Draft a marketing plan for my new book release'
];

export default function HeroSection() {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const [demoResponse, setDemoResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  // Switch metrics every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetricIndex((prev) => (prev + 1) % metrics.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle animated background with advanced particle effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particleCount = Math.min(Math.max(window.innerWidth / 10, 50), 150);
    const particles: any[] = [];
    const mousePosition = { x: null as number | null, y: null as number | null };
    
    // Create particles with enhanced visual effects
    for (let i = 0; i < particleCount; i++) {
      const colors = [
        'rgba(100, 255, 218, 0.7)', // Teal
        'rgba(165, 120, 255, 0.6)', // Purple
        'rgba(0, 160, 255, 0.5)',   // Electric blue
        'rgba(255, 100, 255, 0.4)',  // Pink
      ];
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        sizeOriginal: Math.random() * 3 + 0.5,
      });
    }
    
    // Track mouse movement for interactive effects
    window.addEventListener('mousemove', (e) => {
      mousePosition.x = e.x;
      mousePosition.y = e.y;
    });
    
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Calculate distance to mouse if available
        let distanceToMouse = 1000;
        if (mousePosition.x !== null && mousePosition.y !== null) {
          const dx = mousePosition.x - particle.x;
          const dy = mousePosition.y - particle.y;
          distanceToMouse = Math.sqrt(dx * dx + dy * dy);
          
          // Particles react to mouse proximity
          if (distanceToMouse < 100) {
            // Move particles away from mouse
            const angle = Math.atan2(dy, dx);
            const repulsionForce = (100 - distanceToMouse) * 0.01;
            particle.x -= Math.cos(angle) * repulsionForce;
            particle.y -= Math.sin(angle) * repulsionForce;
            
            // Make particles glow brighter near mouse
            particle.size = particle.sizeOriginal * (1 + (100 - distanceToMouse) * 0.01);
          } else {
            particle.size = particle.sizeOriginal;
          }
        }
        
        // Draw particles with glowing effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow effect 
        if (distanceToMouse < 100) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = particle.color.replace(/[^,]+(?=\))/, '0.1');
          ctx.fill();
        }
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap particles around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', () => {});
    };
  }, []);
  
  const handleDemoPromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
    setIsTyping(true);
    setDemoStep(1);
    
    // Simulate typing response
    let response = '';
    const fullResponse = getResponseForPrompt(prompt);
    let index = 0;
    
    const typingInterval = setInterval(() => {
      if (index < fullResponse.length) {
        response += fullResponse.charAt(index);
        setDemoResponse(response);
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setDemoStep(2);
      }
    }, 20); // Adjust typing speed here
  };
  
  const getResponseForPrompt = (prompt: string): string => {
    if (prompt.includes('landing page')) {
      return "I'll create a stunning responsive landing page for your coaching business with modern design elements, lead capture forms, and testimonial sections. Based on conversion data from 50+ coaching sites, this approach typically increases lead generation by 65%.";
    } else if (prompt.includes('logo')) {
      return "I'll design a modern, versatile logo for your tech startup that communicates innovation and reliability. We'll create variations for different platforms and contexts, ensuring brand consistency across all touchpoints.";
    } else if (prompt.includes('social media')) {
      return "I'll craft an engaging social media content calendar for your product launch with platform-specific messaging, hashtag strategies, and visual templates. This approach typically increases initial launch engagement by 3x compared to standard approaches.";
    } else {
      return "I'll develop a comprehensive marketing plan for your book launch, including pre-launch buildup, release day tactics, and long-term sales strategy. Our data shows this approach typically results in 140% more first-month sales compared to standard launches.";
    }
  };
  
  const handleGetStarted = () => {
    router.push('/signup');
  };
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced animated background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 bg-gradient-to-br from-[#0c1225] to-[#07101f] z-0" 
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left column: Hero content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block">AI-Powered</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-teal-400">
                  Content & Marketing
                </span>
              </h1>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMetricIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 mb-8"
                >
                  <div className="inline-flex items-center bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-2xl md:text-3xl font-bold text-electric-blue mr-2">
                      {metrics[currentMetricIndex].value}
                    </span>
                    <span className="text-gray-300">
                      {metrics[currentMetricIndex].label}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <p className="text-lg md:text-xl text-gray-300 mt-6 mb-8 max-w-lg mx-auto lg:mx-0">
                SKRBL AI automates your marketing, branding, and content creation with intelligent agents that understand your business goals.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold text-lg hover:shadow-glow transition duration-300"
                >
                  Get 7-Day Free Trial
                </motion.button>
                
                <Link href="/features" passHref>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-lg backdrop-blur-sm hover:bg-white/20 transition duration-300"
                  >
                    See Features
                  </motion.a>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Right column: Interactive demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6 rounded-2xl border border-white/20 backdrop-blur-md shadow-xl shadow-purple-500/10"
          >
            <div className="flex items-center mb-6">
              <PercyAvatar size="sm" />
              <h2 className="text-xl font-semibold text-white ml-3">Try SKRBL AI</h2>
            </div>
            
            {demoStep === 0 && (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Select a task to see how SKRBL AI can help:</p>
                <div className="grid grid-cols-1 gap-3">
                  {demoPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDemoPromptSelect(prompt)}
                      className="text-left p-4 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-all"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            
            {demoStep >= 1 && (
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-lg mb-4">
                  <p className="text-white">{selectedPrompt}</p>
                </div>
                
                {isTyping && (
                  <div className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg w-24">
                    <span className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-300"></span>
                  </div>
                )}
                
                {demoResponse && (
                  <div className="bg-electric-blue/10 border border-electric-blue/30 p-4 rounded-lg">
                    <p className="text-white">{demoResponse}</p>
                  </div>
                )}
                
                {demoStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGetStarted}
                      className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold"
                    >
                      Start Your Free Trial
                    </motion.button>
                    
                    <button
                      onClick={() => {
                        setDemoStep(0);
                        setSelectedPrompt('');
                        setDemoResponse('');
                      }}
                      className="w-full mt-3 text-center text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Try Another Example
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Social Proof Section: Testimonials & Trusted Logos */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Testimonials Carousel */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">What Our Users Say</h3>
          <TestimonialCarousel />
        </div>
        {/* Trusted Brand Logos */}
        <div>
          <h4 className="text-lg font-semibold text-gray-300 text-center mb-4">Trusted by teams at</h4>
          <TrustedLogosGrid />
        </div>
      </section>
    </div>
  );
}

// --- Testimonial Carousel ---
const testimonials = [
  {
    quote: "SKRBL AI revolutionized our content workflow. We save hours every week and our engagement has doubled!",
    name: "Sarah Johnson",
    title: "Marketing Director, TechVision"
  },
  {
    quote: "The branding tools are next-level. We got a full brand kit in minutes, and our clients love it.",
    name: "Alex Kim",
    title: "Founder, BrightPath Agency"
  },
  {
    quote: "I launched my book with SKRBL AI's help and hit #1 in my category. The automation is incredible.",
    name: "Priya Patel",
    title: "Author & Coach"
  },
  {
    quote: "Our startup's website and social presence were up in days, not weeks. Highly recommended!",
    name: "James Lee",
    title: "Co-founder, FinTechFlow"
  }
];

function TestimonialCarousel() {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const t = testimonials[index];
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="bg-white/5 rounded-xl p-8 shadow-lg mx-auto max-w-2xl text-center"
    >
      <p className="text-xl text-white font-medium mb-4">“{t.quote}”</p>
      <div className="flex flex-col items-center gap-1">
        <span className="text-electric-blue font-semibold">{t.name}</span>
        <span className="text-gray-400 text-sm">{t.title}</span>
      </div>
    </motion.div>
  );
}

// --- Trusted Logos Grid ---
const logos = [
  { src: "/images/logos/google.svg", alt: "Google" },
  { src: "/images/logos/shopify.svg", alt: "Shopify" },
  { src: "/images/logos/stripe.svg", alt: "Stripe" },
  { src: "/images/logos/airbnb.svg", alt: "Airbnb" },
  { src: "/images/logos/notion.svg", alt: "Notion" },
  { src: "/images/logos/zoom.svg", alt: "Zoom" },
  { src: "/images/logos/slack.svg", alt: "Slack" },
  { src: "/images/logos/atlassian.svg", alt: "Atlassian" }
];

function TrustedLogosGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-center opacity-80">
      {logos.map((logo) => (
        <div key={logo.alt} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
          <img src={logo.src} alt={logo.alt} className="h-10 md:h-12 w-auto max-w-[120px] object-contain" />
        </div>
      ))}
    </div>
  );
}

