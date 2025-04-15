'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { saveLeadToFirebase } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { percySyncAgent } from '@/ai-agents/percySyncAgent';
import { auth } from '@/utils/firebase';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useSearchParams } from 'next/navigation';
import type { Lead } from '@/types/lead';

type FormData = Pick<Lead, 'name' | 'email' | 'selectedPlan' | 'intent'>;

interface IntentContent {
  title: string;
  description: string;
  icon: string;
}

interface Step {
  message: string | ((name: string) => string);
  field: keyof FormData;
  options?: string[];
}

const PercyIntakeForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlIntent = searchParams?.get('intent') || null;

  // Set initial intent from URL if present
  useEffect(() => {
    if (urlIntent) {
      setFormData(prev => ({ ...prev, intent: urlIntent }));
      setShowIntentContent(true);
    }
  }, [urlIntent]);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showIntentContent, setShowIntentContent] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    selectedPlan: '',
    intent: urlIntent || ''
  });

  // Get custom message based on intent
  const getIntentMessage = (intent: string | null): string => {
    if (!intent) return "Welcome! Let's get started with SKRBL AI.";
    
    switch (intent) {
      case 'publish_book':
        return "Ready to publish your book? Let's make your publishing journey smooth and successful!";
      case 'design_brand':
        return "Let's build your brand with SKRBL AI's creative suite!";
      case 'launch_website':
        return "Ready to launch your website? We'll help you create a stunning online presence!";
      case 'grow_social_media':
        return "Let's boost your social media presence with AI-powered strategies!";
      case 'improve_marketing':
        return "Ready to supercharge your marketing? Let's create impactful campaigns together!";
      default:
        return "Welcome to SKRBL AI! How can we help you today?";
    }
  };

  // Intent content mapping - memoized to prevent recreation on each render
  const intentContent = useMemo<Record<string, IntentContent>>(() => ({
    'grow_social_media': {
      title: 'Social Media Growth',
      description: 'Elevate your social presence with AI-powered content generation, audience analysis, and engagement strategies tailored to your brand voice.',
      icon: '🚀'
    },
    'publish_book': {
      title: 'Book Publishing',
      description: 'Transform your manuscript into a professional publication with our comprehensive editing, formatting, and publishing services.',
      icon: '📖'
    },
    'launch_website': {
      title: 'Website Launch',
      description: 'Build a stunning, conversion-optimized website with our AI-powered tools that handle design, content, and technical implementation.',
      icon: '🌐'
    },
    'design_brand': {
      title: 'Brand Design',
      description: 'Create a cohesive brand identity with our AI-generated logos, color palettes, typography selections, and brand guidelines.',
      icon: '🎨'
    },
    'improve_marketing': {
      title: 'Marketing Optimization',
      description: 'Analyze performance metrics and implement data-driven strategies to maximize ROI across all your marketing channels.',
      icon: '📊'
    }
  }), []);

  // Check for intent in URL
  useEffect(() => {
    if (searchParams) {
      const urlIntent = searchParams.get('intent');
      if (urlIntent && Object.keys(intentContent).includes(urlIntent)) {
        setFormData(prev => ({
          ...prev,
          intent: urlIntent
        }));
        setShowIntentContent(true);
        // Skip to name/email for users coming from service page with intent already set
        setStep(1); 
      }
    }
  }, [searchParams, intentContent]);

  const steps: Step[] = [
    {
      message: "Hi, I'm Percy, your AI assistant. What brings you to SKRBL AI today?",
      options: ['Grow Social Media', 'Publish a Book', 'Launch a Website', 'Design Brand', 'Improve Marketing'],
      field: 'intent'
    },
    {
      message: "Great choice! What's your name?",
      field: 'name',
    },
    {
      message: (name) => `Nice to meet you, ${name}! What's your email address?`,
      field: 'email',
    },
    {
      message: (name) => `Would you like to try a 7-Day Free Trial? (Limited features) Or subscribe to unlock all capabilities?`,
      options: ['7-Day Free Trial', 'Subscribe Now'],
      field: 'selectedPlan'
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

  const handleIntentSelection = (goal: string) => {
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
      intent: goalToIntentMap[goal] || goal
    }));
    handleSubmit(goalToIntentMap[goal] || goal);
  };

  const handlePlanSelection = (selectedPlan: string) => {
    // Update form data with selected plan
    setFormData(prev => ({
      ...prev,
      selectedPlan,
      freeTrial: selectedPlan.includes('Free Trial')
    }));
    
    // If user chose to subscribe, redirect to pricing page
    if (selectedPlan === 'Subscribe Now') {
      setStatus('loading');
      setTimeout(() => {
        router.push('/pricing#subscribe');
      }, 1000);
      return;
    }
    
    // For free trial, continue with the form
    handleSubmit();
  };

  const handleSubmit = async (intent?: string) => {
    setStatus('loading');
    setErrorMsg('');
    try {
      // Check if we have all required data
      if (!formData.name || !formData.email || !formData.intent) {
        setStatus('error');
        setErrorMsg("Please provide your name, email, and select your goal to continue.");
        return;
      }

      // Prepare lead data for submission (matches Lead interface)
      const leadData = {
        name: formData.name,
        email: formData.email,
        selectedPlan: formData.selectedPlan,
        intent: intent || formData.intent,
        freeTrial: formData.selectedPlan?.includes('Free Trial'),
        businessGoal: intent || formData.intent
      };
      
      console.log('Submitting lead data:', leadData);
      // Save lead to Firebase
      const saveResult = await saveLeadToFirebase(leadData);
      if (!saveResult.success) {
        throw new Error('Failed to save lead data to Firebase');
      }
      
      // Check if user already exists in Firebase Auth
      try {
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        // Create Firebase Auth user if they don't exist
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, tempPassword);
        console.log('Created new user account:', userCredential.user.uid);
        
        // Send password reset email so they can set their own password
        await sendPasswordResetEmail(auth, formData.email);
        console.log('Password reset email sent');
      } catch (authError: any) {
        // If error is 'email-already-in-use', this is fine - user already exists
        if (authError.code !== 'auth/email-already-in-use') {
          console.error('Error creating user account:', authError);
        } else {
          console.log('User already exists, continuing with intake flow');
        }
      }
      // Route to appropriate dashboard via Percy agent
      const agentResponse = await percySyncAgent.handleOnboarding(leadData);
      if (!agentResponse.success) {
        setStatus('error');
        setErrorMsg(agentResponse.message || "Something went wrong. Please try again or pick a different goal.");
        return;
      }
      
      // Show success message from agent
      setStatus('success');
      
      // Set timeout to redirect to dashboard
      setTimeout(() => {
        if (agentResponse.redirectPath) {
          router.push(agentResponse.redirectPath);
        } else {
          router.push('/dashboard');
        }
      }, 1500); // Allow time to see success message
      
      return;
      
      // This code is now handled by the agentResponse.redirectPath above
    } catch (error) {
      setStatus('error');
      setErrorMsg("Something went wrong. Please try again.");
      console.error('Error in form submission:', error);
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
    const particleCount = 70; // Increased particle count

    for (let i = 0; i <particleCount; i++) {
      // Create more neon-colored particles
      const colors = [
        'rgba(100, 255, 218, 0.6)', // Teal
        'rgba(165, 120, 255, 0.5)', // Purple
        'rgba(0, 160, 255, 0.4)', // Electric blue
        'rgba(255, 100, 255, 0.3)', // Pink
      ];
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 0.4 - 0.2,
        speedY: Math.random() * 0.4 - 0.2
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
      <canvas id="particle-canvas" className="absolute inset-0 bg-gradient-to-br from-[#0c1225] to-[#07101f] opacity-95" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Percy avatar */}
        <motion.div 
          className="absolute top-20 md:top-32"
          variants={avatarVariants}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            variants={avatarVariants}
            animate="blink"
            className="relative w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full p-2 backdrop-blur-sm border border-white/20 shadow-lg shadow-purple-500/20"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#0c1225] to-[#0a192f] flex items-center justify-center relative">
              {/* Human/AI hybrid silhouette */}
              <svg
                className="w-3/4 h-3/4 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C9.38 2 7.25 4.13 7.25 6.75C7.25 9.32 9.26 11.4 11.81 11.49C11.87 11.48 11.93 11.48 12 11.48C12.06 11.48 12.12 11.48 12.18 11.49C14.73 11.4 16.74 9.32 16.74 6.75C16.75 4.13 14.62 2 12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M17.08 14.1499C14.29 12.2899 9.74 12.2899 6.93 14.1499C5.66 15.0099 4.96 16.1499 4.96 17.3799C4.96 18.6099 5.66 19.7399 6.92 20.5899C8.32 21.5299 10.16 21.9999 12 21.9999C13.84 21.9999 15.68 21.5299 17.08 20.5899C18.34 19.7299 19.04 18.5999 19.04 17.3599C19.03 16.1299 18.34 14.9999 17.08 14.1499Z"
                  fill="currentColor"
                />
                {/* Glowing eyes */}
                <circle cx="9" cy="7" r="1.25" fill="#64FFDA" className="animate-pulse">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="15" cy="7" r="1.25" fill="#64FFDA" className="animate-pulse">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Digital elements */}
                <path
                  d="M2 12H4M6 4L7.5 5.5M18 4L16.5 5.5M22 12H20M12 2V4"
                  stroke="#64FFDA"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Glowing aura effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/30 to-teal-400/30 animate-pulse rounded-full blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10 animate-pulse delay-75 rounded-full blur-md"></div>
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
              {showIntentContent && i === 2 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{intentContent[formData.intent]?.icon || '🚀'}</span>
                    <h3 className="text-xl font-semibold text-white">{intentContent[formData.intent]?.title || 'Our Service'}</h3>
                  </div>
                  <p className="text-white">{intentContent[formData.intent]?.description || 'Let us help you achieve your goals!'}</p>
                  <div className="pt-2">
                    <p className="text-white font-medium">Would you like to try our 7-Day Free Trial or subscribe to a plan?</p>
                  </div>
                </div>
              ) : (
                <p className="text-white">
                  {typeof s.message === 'function' ? s.message(formData.name) : s.message}
                </p>
              )}
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
                    {/* If intent is from URL and we're at step 2, show name and email inputs together */}
                    {showIntentContent && i === 2 ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-transparent transition-all duration-300"
                          placeholder="Your name"
                        />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="bg-white/5 border border-white/10 rounded-lg p-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-transparent transition-all duration-300"
                          placeholder="your@email.com"
                        />
                      </div>
                    ) : (
                      <input
                        type={s.field === 'email' ? 'email' : 'text'}
                        // Type-safe dynamic field binding for all string fields in FormData
                        value={typeof formData[s.field] === 'string' ? formData[s.field] ?? '' : ''}
                        onChange={(e) => {
                          // Only update if the field is a string (prevents accidental boolean overwrite)
                          if (typeof formData[s.field] === 'string') {
                            setFormData({
                              ...formData,
                              [s.field]: e.target.value
                            });
                          }
                        }}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 text-white w-full focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-transparent transition-all duration-300"
                        placeholder={s.field === 'email' ? 'your@email.com' : 'Your name'}
                      />
                    )}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleContinue}
                      disabled={(!s.field || !formData[s.field] || status === 'loading' || status === 'success') && 
                              !(showIntentContent && i === 2 && formData.name && formData.email)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${(!s.field || !formData[s.field] || status === 'loading' || status === 'success') && 
                          !(showIntentContent && i === 2 && formData.name && formData.email) ? 'bg-white/10 text-white/50' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'}`}
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
                          if (s.field === 'selectedPlan') {
                            handlePlanSelection(option);
                          } else if (s.field === 'intent' && step === 0) {
                            // Just update intent and continue to next step
                            const goalToIntentMap: Record<string, string> = {
                              'Grow Social Media': 'grow_social_media',
                              'Publish a Book': 'publish_book',
                              'Launch a Website': 'launch_website',
                              'Design Brand': 'design_brand',
                              'Improve Marketing': 'improve_marketing'
                            };
                            setFormData(prev => ({
                              ...prev,
                              intent: goalToIntentMap[option] || option
                            }));
                            handleContinue();
                          } else if (s.field === 'intent') { 
                            // Final step, submit the form
                            handleIntentSelection(option);
                          }
                        }}
                        disabled={status === 'loading' || status === 'success'}
                        className={`glass-button px-6 py-3 rounded-lg font-medium transition-all duration-300 ${((typeof option === 'string' && option.includes('Free')) || s.field === 'intent') ? 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {status === 'loading' ? (
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