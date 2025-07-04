// Enhanced testimonial component with rotation and better social proof
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "Percy helped me identify the exact AI agents I needed. Increased my content output by 400%!",
    author: "Sarah Chen",
    role: "Marketing Director",
    company: "TechStart Inc",
    location: "San Francisco, CA",
    avatar: "SC",
    result: "400% increase",
    verified: true,
    industry: "Marketing Agency"
  },
  {
    quote: "I was overwhelmed by AI options. Percy made it simple and I found the perfect solution in 5 minutes.",
    author: "Mike Rodriguez", 
    role: "Small Business Owner",
    company: "Rodriguez Consulting",
    location: "Austin, TX",
    avatar: "MR",
    result: "5 minutes",
    verified: true,
    industry: "Business Consulting"
  },
  {
    quote: "Percy's recommendations were spot-on. We automated 80% of our content workflow.",
    author: "Emma Thompson",
    role: "Agency Founder",
    company: "Creative Solutions",
    location: "Miami, FL",
    avatar: "ET",
    result: "80% automated",
    verified: true,
    industry: "Creative Agency"
  },
  {
    quote: "From confused to confident in one conversation. Percy saved me weeks of research.",
    author: "David Kim",
    role: "E-commerce Owner", 
    company: "Innovative Retail",
    location: "Seattle, WA",
    avatar: "DK",
    result: "Weeks saved",
    verified: true,
    industry: "E-commerce"
  },
  {
    quote: "Percy understood my business better than most human consultants. Incredible AI guidance.",
    author: "Lisa Park",
    role: "Startup Founder",
    company: "NextGen Apps",
    location: "Boston, MA",
    avatar: "LP",
    result: "Expert guidance",
    verified: true,
    industry: "SaaS Startup"
  },
  {
    quote: "Generated $47K in additional revenue in my first quarter using Percy's agent recommendations.",
    author: "Marcus Johnson",
    role: "Digital Marketer",
    company: "Growth Partners LLC",
    location: "Denver, CO",
    avatar: "MJ",
    result: "$47K revenue",
    verified: true,
    industry: "Digital Marketing"
  },
  {
    quote: "Went from manual content creation to full automation. Now I focus on strategy, not execution.",
    author: "Jennifer Walsh",
    role: "Content Strategist",
    company: "Content Pro Agency",
    location: "Nashville, TN",
    avatar: "JW",
    result: "Full automation",
    verified: true,
    industry: "Content Marketing"
  }
];

export default function PercyTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState(testimonials.slice(0, 3));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % testimonials.length;
        setVisibleTestimonials([
          testimonials[nextIndex],
          testimonials[(nextIndex + 1) % testimonials.length],
          testimonials[(nextIndex + 2) % testimonials.length]
        ]);
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h4 className="text-lg font-bold text-white mb-2">
          ⭐ Trusted by 10,000+ Business Leaders
        </h4>
        <p className="text-gray-400 text-sm">
          See why entrepreneurs choose Percy for AI guidance
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {visibleTestimonials.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.author}-${currentIndex + index}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-slate-800/50 p-6 rounded-xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 relative overflow-hidden"
            >
              {/* Industry Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 text-xs font-medium rounded-full">
                  {testimonial.industry}
                </span>
              </div>

              {/* Result Badge */}
              <div className="absolute top-3 right-3 flex items-center space-x-1">
                {testimonial.verified && (
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full flex items-center space-x-1">
                    <span>✓</span>
                    <span>VERIFIED</span>
                  </span>
                )}
                <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full">
                  {testimonial.result}
                </span>
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm mb-4 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              {/* Author Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <span aria-label="Testimonial quote" className="text-3xl text-cyan-300 drop-shadow-glow">“</span>
                </div>
                <div>
                  <p className="text-cyan-400 font-medium text-sm">{testimonial.author}</p>
                  <p className="text-gray-400 text-xs">{testimonial.role}</p>
                  <p className="text-gray-500 text-xs">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Social Proof Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="flex justify-center items-center space-x-8 text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>1M+ AI Recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>98% Satisfaction Rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✓</span>
            <span>24/7 AI Guidance</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 