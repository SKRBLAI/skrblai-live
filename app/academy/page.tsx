"use client";
import { useState } from "react";
import { motion } from "framer-motion";

import PercyAvatar from "../../components/home/PercyAvatar";
import PercyProvider from 'components/assistant/PercyProvider';
import PageLayout from '../../components/layout/PageLayout';

// Enhanced Academy Missions
const MISSIONS = [
  {
    id: "first-agent",
    title: "Complete Your First Agent Run",
    description: "Trigger any agent to automate a real task. See SKRBL AI in action!",
    reward: "Agent Novice Badge",
  },
  {
    id: "mini-workflow",
    title: "Build a Mini-Workflow",
    description: "Chain two or more agents together using a Launchpad workflow.",
    reward: "Workflow Builder Badge",
  },
  {
    id: "upgrade-premium",
    title: "Upgrade to Premium",
    description: "Unlock all advanced agents, analytics, and priority support.",
    reward: "Premium Access Badge",
  },
  {
    id: "graduate",
    title: "Graduate Percy Academy!",
    description: "Complete all missions to earn your elite status and unlock future rewards.",
    reward: "Academy Graduate Badge",
  },
];

type MissionState = Record<string, boolean>;

export const dynamic = 'force-dynamic';

export default function PercyAcademyPage() {
  // Mission completion state (local only for now)
  const [missionState, setMissionState] = useState<MissionState>({
    first_agent: false,
    mini_workflow: false,
    upgrade_premium: false,
    graduate: false,
  });

  // Derived: graduated if all but graduate are true
  const graduated =
    missionState.first_agent &&
    missionState.mini_workflow &&
    missionState.upgrade_premium;

  // Handle mission complete
  const handleComplete = (id: string) => {
    setMissionState((prev) => ({ ...prev, [id]: true }));
  };

  // Animate mission cards
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  // Use custom prop for delay
  const getCustomDelay = (i: number) => ({
    transition: { delay: 0.2 + i * 0.18, duration: 0.6 }
  });

  // Animate badge
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0.7 },
    animate: { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] },
    transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
  };

  return (
    <PageLayout>
      <div className="min-h-screen relative">{/* Removed redundant background styling */}
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto w-full min-h-screen">
        {/* Percy Sidebar Mentor */}
        <aside className="w-full md:w-64 flex flex-col items-center justify-start pt-16 md:pt-32 mb-8 md:mb-0">
          <PercyAvatar size="lg" />
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Percy Academy</h2>
            <p className="text-teal-200 text-lg font-semibold">Your AI Mentor</p>
          </div>
        </aside>
        {/* Main Academy Content */}
        <main className="flex-1 px-4 md:px-12 py-12 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow"
          >
            Welcome to SKRBL Academy!<br />Let's level up together.
          </motion.h1>
          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {MISSIONS.map((mission, i) => {
              const completed =
                (mission.id === "graduate" && graduated) ||
                missionState[mission.id.replace(/-/g, "_")];
              return (
                <motion.div
                  key={mission.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  {...getCustomDelay(i)}
                  className={`glass-card p-7 rounded-2xl border-2 shadow-xl flex flex-col items-center relative transition-all duration-300 ${completed ? "border-teal-400/80 bg-teal-400/10" : "border-white/20"} group hover:shadow-glow hover:scale-105`}
                >
                  {/* Badge */}
                  <motion.div
                    className={`mb-4 w-16 h-16 rounded-full flex items-center justify-center border-4 ${completed ? "border-teal-400 bg-teal-400/20" : "border-white/20 bg-white/10"} shadow-lg`}
                    variants={badgeVariants}
                    animate={completed ? "animate" : "initial"}
                  >
                    {completed ? (
                      <span className="text-3xl">🏅</span>
                    ) : (
                      <span className="text-3xl">🎯</span>
                    )}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2 text-center">{mission.title}</h3>
                  <p className="text-gray-300 text-center mb-4">{mission.description}</p>
                  <div className="mb-2 text-teal-200 font-semibold">Reward: {mission.reward}</div>
                  {/* Complete Button or Badge */}
                  {mission.id !== "graduate" && !completed && (
                    <button
                      onClick={() => handleComplete(mission.id.replace(/-/g, "_"))}
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold shadow-glow hover:scale-105 transition-all"
                    >
                      Mark as Complete
                    </button>
                  )}
                  {completed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="mt-2 text-teal-300 font-bold"
                    >
                      {mission.id === "graduate" ? "🎓 Graduated!" : "Completed!"}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* Graduation Animation */}
          {graduated && !missionState.graduate && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-extrabold text-2xl shadow-glow border-2 border-yellow-400/60 animate-pulse"
              onClick={() => handleComplete("graduate")}
            >
              🎓 Claim Your Graduation Reward!
            </motion.button>
          )}
          {missionState.graduate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="mt-10 flex flex-col items-center"
            >
              <span className="text-5xl mb-4 animate-bounce">🎉</span>
              <div className="text-3xl font-bold text-yellow-300 mb-2">You Graduated!</div>
              <div className="text-lg text-white mb-4">Elite status unlocked. Watch for future rewards and features!</div>
              <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold shadow-glow border-2 border-teal-400/60">Academy Discount Code: <span className="underline">ELITE25</span></div>
            </motion.div>
          )}
        </main>
      </div>
      </div>
    </PageLayout>
  );
} 