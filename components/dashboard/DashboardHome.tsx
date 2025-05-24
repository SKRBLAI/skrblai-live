"use client";
import { motion } from "framer-motion";
import { useAgentStats } from "@/hooks/useAgentStats";
import { useUser } from "@/hooks/useUser";
import { Agent, AgentStats } from "@/types/agent";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const pulseVariant = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function DashboardHome() {
  const { user } = useUser();
  const { topAgents } = useAgentStats();

  const steps = [
    {
      title: "Choose your agent",
      description: "Select from our curated list of AI agents specialized in different tasks",
      icon: "🤖",
      link: "/agents"
    },
    {
      title: "Start a workflow",
      description: "Begin your creative journey with your chosen agent",
      icon: "🚀",
      link: "/workflow"
    },
    {
      title: "Review & refine",
      description: "Collaborate with your agent to perfect your results",
      icon: "✨",
      link: "/dashboard"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          👋 Welcome back, {user?.name || "Creator"}
        </h1>
        <p className="text-gray-400 mt-2">Let's create something amazing today</p>
      </motion.div>

      {/* Upgrade & Invite CTAs */}
      <div className="w-full flex flex-col md:flex-row gap-3 md:gap-6 mb-10 items-center justify-center">
        <button
          onClick={() => {/* TODO: Integrate with Stripe upgrade flow */ alert('Upgrade flow (Stripe) coming soon!'); }}
          className="w-full md:w-auto max-w-xs px-6 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 text-lg"
          aria-label="Upgrade and unlock agents"
        >
          Upgrade Now
        </button>
        <button
          onClick={() => {/* TODO: Integrate referral/bonus flow */ alert('Invite a friend & get bonus (coming soon!)'); }}
          className="w-full md:w-auto max-w-xs px-6 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-sky-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 text-base"
          aria-label="Invite a friend and get bonus"
        >
          Invite a Friend (Get Bonus)
        </button>
      </div>

      {/* Next Steps Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {steps.map((step, index) => (
          <Link href={step.link} key={index}>
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-teal-500/20 hover:border-teal-500/40 transition-colors"
            >
              <span className="text-4xl mb-4 block">{step.icon}</span>
              <h3 className="text-xl font-semibold text-teal-400 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Top Agents Section */}
      {topAgents && topAgents.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Your Top Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAgents.slice(0, 3).map((agent: AgentStats, index: number) => (
              <motion.div
                key={agent.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 rounded-lg bg-white/5 border border-teal-500/20 hover:border-teal-500/40 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-2xl">
                    {agent.emoji || "🤖"}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-400">
                      {agent.usageCount || 0} sessions
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
