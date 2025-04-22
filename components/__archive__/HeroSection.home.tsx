'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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

// --- Testimonial Carousel Data ---
const testimonials = [
  {
    quote: "SKRBL AI revolutionized our content workflow. We save hours every week and our engagement has doubled!",
    name: "Sarah Johnson",
    title: "Marketing Director, TechStart Inc"
  },
  {
    quote: "From idea to launch in days instead of months. The AI-powered automation is simply game-changing.",
    name: "Michael Chen",
    title: "Founder, GrowthLabs"
  },
  {
    quote: "As a solo entrepreneur, SKRBL AI feels like having a full creative team at my fingertips.",
    name: "Jessica Williams",
    title: "Independent Author & Creator"
  }
];

// --- Trusted Logos Grid Data ---
const logos = [
  { src: "/logos/google.png", alt: "Google" },
  { src: "/logos/shopify.png", alt: "Shopify" },
  { src: "/logos/stripe.png", alt: "Stripe" },
  { src: "/logos/airbnb.png", alt: "Airbnb" },
  { src: "/logos/notion.png", alt: "Notion" },
  { src: "/logos/zoom.png", alt: "Zoom" },
  { src: "/logos/slack.png", alt: "Slack" },
  { src: "/logos/atlassian.png", alt: "Atlassian" }
];

export default function HeroSection() {
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const [demoResponse, setDemoResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  // Switch metrics every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetricIndex((prev) => (prev + 1) % metrics.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Rotate testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
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
    <section className="w-full overflow-hidden bg-gradient-to-b from-midnight via-black to-black">
      {/* Enhanced animated background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 bg-gradient-to-br from-[#0c1225] to-[#07101f] z-0" 
      />
      
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left column: Hero content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-electric-blue to-purple-400">
                  AI-Powered <br />Content Creation
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  Automate your digital content workflow with AI that understands your brand voice and audience.
                </p>
                
                {/* Animated metric ticker */}
                <div className="flex items-center justify-center lg:justify-start space-x-4 mb-10">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentMetricIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center"
                    >
                      <span className="text-3xl font-bold text-electric-blue mr-2">
                        {metrics[currentMetricIndex].value}
                      </span>
                      <span className="text-gray-400">
                        {metrics[currentMetricIndex].label}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={handleGetStarted}
                    className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-black font-semibold rounded-lg transform transition duration-300 hover:scale-105 hover:shadow-glow-blue"
                  >
                    Get Started Free
                  </button>
                  <Link href="/features" className="group flex items-center text-gray-300 hover:text-white transition duration-300">
                    <span>Explore Features</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            {/* Right column: Percy demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-gradient-to-br from-black to-[#0a1222] p-6 rounded-2xl shadow-glow relative border border-gray-800">
                <div className="flex items-center mb-4">
                  <PercyAvatar className="w-12 h-12" />
                  <div className="ml-3">
                    <h3 className="text-white font-semibold">Percy AI</h3>
                    <p className="text-gray-400 text-sm">Content Assistant</p>
                  </div>
                </div>
                
                {/* Interactive demo UI */}
                <div>
                  {demoStep === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 mb-4"
                    >
                      <p className="text-gray-300 mb-2">What can I help you with today?</p>
                      {demoPrompts.map((prompt, index) => (
                        <div 
                          key={index}
                          onClick={() => handleDemoPromptSelect(prompt)}
                          className="bg-[#121f30] hover:bg-[#182638] px-4 py-3 rounded-lg cursor-pointer text-gray-300 transition duration-200"
                        >
                          {prompt}
                        </div>
                      ))}
                    </motion.div>
                  )}
                  
                  {demoStep >= 1 && (
                    <div>
                      <div className="bg-[#121f30] px-4 py-3 rounded-lg text-gray-300 mb-4">
                        {selectedPrompt}
                      </div>
                      
                      <div className="bg-gradient-to-r from-[#182a47] to-[#192840] px-4 py-3 rounded-lg text-white min-h-[150px] flex items-start">
                        <PercyAvatar className="w-8 h-8 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          {demoResponse}
                          {isTyping && (
                            <span className="ml-1 inline-block w-2 h-4 bg-electric-blue animate-pulse rounded-sm"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        
          {/* Testimonials and Logos */}
          <div className="mt-20">
            {/* Testimonials Carousel */}
            <div className="mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">What Our Users Say</h3>
              <div className="relative h-48">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 rounded-xl p-8 shadow-lg mx-auto max-w-2xl text-center"
                  >
                    <p className="text-xl text-white font-medium mb-4">"{testimonials[currentTestimonial].quote}"</p>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-electric-blue font-semibold">{testimonials[currentTestimonial].name}</span>
                      <span className="text-gray-400 text-sm">{testimonials[currentTestimonial].title}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Trusted Brand Logos */}
            <div>
              <h4 className="text-lg font-semibold text-gray-300 text-center mb-6">Trusted by teams at</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center opacity-80">
                {logos.map((logo) => (
                  <div key={logo.alt} className="flex items-center justify-center">
                    <Image 
                      src={logo.src} 
                      alt={logo.alt} 
                      width={100} 
                      height={50} 
                      className="grayscale hover:grayscale-0 transition duration-300"
                      loading="lazy" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
