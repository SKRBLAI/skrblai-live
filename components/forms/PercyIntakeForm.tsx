'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { saveLeadToFirebase } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { percySyncAgent } from '@/ai-agents/percySyncAgent';

interface FormData {
  name: string;
  email: string;
  plan: string;
  businessGoal?: string;
  freeTrial?: boolean;
}

interface Step {
  message: string | ((name: string) => string);
  field: keyof FormData;
  options?: string[];
}

const PercyIntakeForm = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    plan: ''
  });

  const steps: Step[] = [
    {
      message: "Welcome! I'm Percy, your AI assistant. What's your name?",
      field: 'name',
    },
    {
      message: (name) => `Nice to meet you, ${name}! What's your email address?`,
      field: 'email',
    },
    {
      message: "Would you like to try our 7-Day Free Trial or subscribe to a plan?",
      options: ['7-Day Free Trial', 'Subscribe Now'],
      field: 'plan'
    },
    {
      message: (name) => `Great choice, ${name}! What's your primary business goal with SKRBL AI?`,
      options: ['Grow Social Media', 'Publish a Book', 'Launch a Website', 'Design Brand', 'Improve Marketing'],
      field: 'businessGoal'
    }
  ];

  const handleContinue = () => {
    if (step < steps.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleBusinessGoalSelection = (goal: string) => {
    // Map UI-friendly goal names to intent keys
    const goalToIntentMap: Record<string, string> = {
      'Grow Social Media': 'grow_social_media',
      'Publish a Book': 'publish_book',
      'Launch a Website': 'launch_website',
      'Design Brand': 'design_brand',
      'Improve Marketing': 'improve_marketing'
    };

    setFormData(prev => ({
      ...prev,
      businessGoal: goalToIntentMap[goal] || goal
    }));
    
    // If they chose free trial earlier, handle that flow
    if (formData.plan.includes('Free Trial')) {
      handleSubmit(goalToIntentMap[goal] || goal, true);
    } else {
      handleSubmit(goalToIntentMap[goal] || goal, false);
    }
  };

  const handlePlanSelection = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      plan,
      freeTrial: plan.includes('Free Trial')
    }));
    handleContinue();
  };

  const handleSubmit = async (intent?: string, isFreeTrial = false) => {
    setIsLoading(true);
    try {
      // Add default values for company, serviceInterest, and message to match Lead type
      const leadData = {
        ...formData,
        company: '',
        serviceInterest: formData.plan,
        message: `Onboarded via Percy chat interface`,
        freeTrial: isFreeTrial,
        businessGoal: intent || formData.businessGoal
      };
      
      await saveLeadToFirebase(leadData);
      const route = await percySyncAgent.handleOnboarding(leadData);
      toast.success('Welcome to SKRBL AI!');
      router.push(route);
    } catch (error) {
      toast.error('Error saving your information');
    } finally {
      setIsLoading(false);
    }
  };

  // Percy avatar animation variants
  const avatarVariants = {
    idle: {
      y: [0, -10, 0],
      transition: {
        y: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }
      }
    },
    blink: {
      opacity: [1, 0.85, 1],
      transition: {
        opacity: {
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
          repeatDelay: 3
        }
      }
    }
  };

  // Animated particles background
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        color: `rgba(255, 255, 255, ${Math.random() * 0.3})`,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
    };
    
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated background */}
      <canvas id="particle-canvas" className="absolute inset-0 bg-gradient-to-br from-purple-500 to-teal-600" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Percy avatar */}
        <motion.div 
          className="absolute top-20 md:top-32"
          variants={avatarVariants}
          animate="idle"
        >
          <motion.div
            variants={avatarVariants}
            animate="blink"
            className="relative w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full p-2 backdrop-blur-sm border border-white/20 shadow-lg shadow-purple-500/20"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-electric-blue to-teal-400 flex items-center justify-center">
              <span className="text-4xl md:text-5xl">🤖</span>
              {/* Replace with actual Percy image when available */}
              {/* <Image src="/images/percy-avatar.png" alt="Percy AI" width={150} height={150} /> */}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-8 rounded-2xl max-w-xl w-full backdrop-blur-md border border-white/20 shadow-xl shadow-purple-500/10"
        >
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} className="mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 p-4 rounded-lg mb-4"
            >
              <p className="text-white">
                {typeof s.message === 'function' ? s.message(formData.name) : s.message}
              </p>
            </motion.div>

            {isTyping && i === step - 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg w-24"
              >
                <span className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-0"></span>
                <span className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-electric-blue rounded-full animate-bounce delay-300"></span>
              </motion.div>
            )}
            
            {i === step && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {!s.options ? (
                  <div className="space-y-3">
                    <input
                      type={s.field === 'email' ? 'email' : 'text'}
                      value={formData[s.field]}
                      onChange={(e) => setFormData({...formData, [s.field]: e.target.value})}
                      className="bg-white/5 border border-white/10 rounded-lg p-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-transparent transition-all duration-300"
                      placeholder={s.field === 'email' ? 'your@email.com' : 'Your name'}
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleContinue}
                      disabled={!formData[s.field]}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${!formData[s.field] ? 'bg-white/10 text-white/50' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'}`}
                    >
                      Continue
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    {s.options.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (s.field === 'plan') {
                            handlePlanSelection(option);
                          } else if (s.field === 'businessGoal') {
                            handleBusinessGoalSelection(option);
                          }
                        }}
                        disabled={isLoading}
                        className={`glass-button px-6 py-3 rounded-lg font-medium transition-all duration-300 ${(typeof option === 'string' && option.includes('Free')) || s.field === 'businessGoal' ? 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : option}
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>
      </div>
    </div>
  );
};

export default PercyIntakeForm;