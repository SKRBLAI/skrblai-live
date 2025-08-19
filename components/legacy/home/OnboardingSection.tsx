"use client";
import { motion } from "framer-motion";
import UpgradeBanner from '../../ui/UpgradeBanner';

const steps = [
  {
    icon: "🎯",
    title: "Tell us your goal",
    desc: "Pick what you want to accomplish—content, branding, publishing, more."
  },
  {
    icon: "🤖",
    title: "Get matched with AI tools",
    desc: "Percy recommends the best AI agents for your needs."
  },
  {
    icon: "⚡",
    title: "See instant results",
    desc: "Upload, type, or describe your task. Percy handles the rest!"
  }
];

export default function OnboardingSection() {
  return (
    <section className="w-full max-w-3xl mx-auto my-16 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
        How SKRBL AI Works
      </h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: i * 0.18, duration: 0.7, type: "spring" }}
            className="flex flex-col items-center p-6 rounded-2xl shadow-glow bg-gradient-to-b from-white/10 to-white/5 border border-teal-400/30 w-full md:w-1/3"
          >
            <span className="text-5xl mb-4">{step.icon}</span>
            <h3 className="text-xl font-semibold mb-2 text-white text-center">{step.title}</h3>
            <p className="text-gray-300 text-center text-base">{step.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-12">
        <UpgradeBanner 
          headline="Unlock All AI Agents & Features"
          description="Upgrade now to access unlimited agents, advanced workflows, and priority support. Experience the full cosmic power of SKRBL AI!"
          ctaText="Explore Premium"
          ctaHref="/pricing"
        />
      </div>
    </section>
  );
}
