"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, TrendingUp, BookOpen, Zap, Palette, 
  Users, DollarSign, ArrowRight, CheckCircle, X,
  Globe, Instagram, Video, Youtube, Twitter, Facebook
} from "lucide-react";
import CardShell from "../ui/CardShell";

interface BusinessWizardProps {
  preset?: { 
    email?: string; 
    urls?: string[]; 
    quickWins?: string[] 
  };
  onClose?: () => void;
}

interface BusinessData {
  goals: string[];
  industry?: string;
  teamSize?: string;
  revenueBand?: string;
  channels: string[];
}

const GOAL_OPTIONS = [
  {
    id: "dominate-seo",
    label: "Dominate SEO",
    description: "Crush your competition in search rankings",
    icon: <Target className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "create-content", 
    label: "Create Content",
    description: "Generate high-converting content at scale",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "publish-book",
    label: "Publish a Book", 
    description: "Become an authority with professional publishing",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-purple-500 to-violet-500"
  },
  {
    id: "automate-biz",
    label: "Automate My Biz",
    description: "Scale operations with intelligent automation", 
    icon: <Zap className="w-6 h-6" />,
    color: "from-orange-500 to-red-500"
  },
  {
    id: "upgrade-brand",
    label: "Upgrade My Brand",
    description: "Transform your brand identity and presence",
    icon: <Palette className="w-6 h-6" />,
    color: "from-pink-500 to-rose-500"
  }
];

const INDUSTRY_OPTIONS = [
  "E-commerce", "SaaS/Tech", "Consulting", "Real Estate", "Health & Fitness",
  "Education", "Marketing Agency", "Professional Services", "Retail", "Other"
];

const TEAM_SIZE_OPTIONS = [
  "Just me", "2-5 people", "6-20 people", "21-50 people", "50+ people"
];

const REVENUE_BAND_OPTIONS = [
  "Pre-revenue", "$1-10K/month", "$10-50K/month", "$50-100K/month", "$100K+/month"
];

const CHANNEL_OPTIONS = [
  { id: "website", label: "Website", icon: <Globe className="w-5 h-5" /> },
  { id: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5" /> },
  { id: "tiktok", label: "TikTok", icon: <Video className="w-5 h-5" /> },
  { id: "youtube", label: "YouTube", icon: <Youtube className="w-5 h-5" /> },
  { id: "twitter", label: "X/Twitter", icon: <Twitter className="w-5 h-5" /> },
  { id: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5" /> }
];

const RECOMMENDED_AGENTS = [
  {
    id: "percy",
    name: "Percy",
    description: "Your AI business concierge and strategist",
    specialty: "Business Strategy & Automation"
  },
  {
    id: "brand-alexander", 
    name: "BrandAlexander",
    description: "Elite brand transformation specialist",
    specialty: "Brand Identity & Positioning"
  },
  {
    id: "content-carltig",
    name: "Content Carltig", 
    description: "High-converting content creation machine",
    specialty: "Content Marketing & SEO"
  },
  {
    id: "social-nino",
    name: "Social Nino",
    description: "Social media growth and engagement expert", 
    specialty: "Social Media Marketing"
  }
];

export default function BusinessWizard({ preset, onClose }: BusinessWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [businessData, setBusinessData] = useState<BusinessData>({
    goals: [],
    channels: []
  });
  const [loading, setLoading] = useState(false);

  const handleGoalToggle = (goalId: string) => {
    setBusinessData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId) 
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleChannelToggle = (channelId: string) => {
    setBusinessData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId) 
        : [...prev.channels, channelId]
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async (action: "signup" | "dashboard" | "demo") => {
    setLoading(true);
    
    // Submit data to backend
    try {
      const payload = {
        email: preset?.email,
        urls: preset?.urls,
        goals: businessData.goals,
        industry: businessData.industry,
        teamSize: businessData.teamSize,
        revenueBand: businessData.revenueBand,
        channels: businessData.channels,
        source: "home_business_wizard"
      };

      await fetch("/api/onboarding/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Failed to submit onboarding data:", error);
      // Don't block UX if backend fails
    }

    // Route based on action
    switch (action) {
      case "signup":
        router.push("/auth/signup?next=/dashboard");
        break;
      case "dashboard": 
        router.push("/dashboard?tab=plan");
        break;
      case "demo":
        router.push("/features#demo");
        break;
    }
    
    onClose?.();
    setLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return businessData.goals.length > 0;
      case 2: return businessData.industry;
      case 3: return businessData.channels.length > 0;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="relative z-10 h-full flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl pointer-events-auto"
        >
          <CardShell className="relative">
            {/* Percy's Intelligence Strip */}
            <div className="absolute -top-3 left-6 right-6 flex justify-center">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs px-3 py-1 rounded-full border border-purple-400/30">
                ✨ Percy's Intelligence
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Business Setup Wizard</h2>
                <p className="text-white/60 text-sm">Step {step + 1} of 5</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors relative z-10 pointer-events-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((step + 1) / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Wins Identified!</h3>
                    <div className="space-y-3 mb-6">
                      {preset?.quickWins?.map((win, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <p className="text-emerald-200 text-sm">{win}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/80 mb-6">Let's build your personalized automation strategy in just a few steps.</p>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">What are your primary goals?</h3>
                    <p className="text-white/60 mb-6">Select all that apply to dominate your market</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {GOAL_OPTIONS.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => handleGoalToggle(goal.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left relative z-10 pointer-events-auto ${
                            businessData.goals.includes(goal.id)
                              ? "border-cyan-400/60 bg-cyan-500/10" 
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${goal.color}`}>
                              {goal.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{goal.label}</h4>
                              <p className="text-white/60 text-sm">{goal.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-6">Tell us about your business</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">Industry</label>
                        <select 
                          value={businessData.industry || ""}
                          onChange={(e) => setBusinessData(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white relative z-10 pointer-events-auto"
                        >
                          <option value="">Select your industry</option>
                          {INDUSTRY_OPTIONS.map(industry => (
                            <option key={industry} value={industry} className="bg-gray-900">{industry}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm mb-2">Team Size</label>
                        <select
                          value={businessData.teamSize || ""}
                          onChange={(e) => setBusinessData(prev => ({ ...prev, teamSize: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white relative z-10 pointer-events-auto"
                        >
                          <option value="">Select team size</option>
                          {TEAM_SIZE_OPTIONS.map(size => (
                            <option key={size} value={size} className="bg-gray-900">{size}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white/80 text-sm mb-2">Monthly Revenue</label>
                        <select
                          value={businessData.revenueBand || ""}
                          onChange={(e) => setBusinessData(prev => ({ ...prev, revenueBand: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white relative z-10 pointer-events-auto"
                        >
                          <option value="">Select revenue range</option>
                          {REVENUE_BAND_OPTIONS.map(band => (
                            <option key={band} value={band} className="bg-gray-900">{band}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">Where do you want to dominate?</h3>
                    <p className="text-white/60 mb-6">Select your priority channels for growth</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {CHANNEL_OPTIONS.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => handleChannelToggle(channel.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-center relative z-10 pointer-events-auto ${
                            businessData.channels.includes(channel.id)
                              ? "border-cyan-400/60 bg-cyan-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {channel.icon}
                            <span className="text-white text-sm font-medium">{channel.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">Your Recommended Agent Squad</h3>
                    <p className="text-white/60 mb-6">Based on your goals, here's your perfect automation team</p>
                    
                    <div className="space-y-3 mb-8">
                      {RECOMMENDED_AGENTS.map((agent, i) => (
                        <div key={agent.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{agent.name}</h4>
                              <p className="text-white/60 text-sm mb-1">{agent.description}</p>
                              <p className="text-cyan-400 text-xs">{agent.specialty}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleFinish("signup")}
                        disabled={loading}
                        className="btn-solid-grad px-4 py-3 text-center relative z-10 pointer-events-auto disabled:opacity-60"
                      >
                        Create Free Account
                      </button>
                      <button 
                        onClick={() => handleFinish("dashboard")}
                        disabled={loading}
                        className="px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors relative z-10 pointer-events-auto disabled:opacity-60"
                      >
                        View Your Plan
                      </button>
                      <button 
                        onClick={() => handleFinish("demo")}
                        disabled={loading}
                        className="px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors relative z-10 pointer-events-auto disabled:opacity-60"
                      >
                        Talk to Percy
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            {step < 4 && (
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="text-white/60 hover:text-white transition-colors disabled:opacity-30 relative z-10 pointer-events-auto"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="btn-solid-grad px-6 py-2 flex items-center gap-2 relative z-10 pointer-events-auto disabled:opacity-60"
                >
                  {step === 0 ? "Let's Start" : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardShell>
        </motion.div>
      </div>
    </div>
  );
}
