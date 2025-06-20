import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import Image from "next/image";
import { getAgentImagePath } from '@/utils/agentUtils';

interface Workflow {
  id: string;
  title: string;
  description: string;
  agents: { name: string; avatar: string; }[];
}

interface WorkflowLaunchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORKFLOWS: Workflow[] = [
  {
    id: "social-growth",
    title: "Social Media Growth Machine",
    description: "Rapidly scale your social channels with coordinated AI agents for content, branding, and automation.",
    agents: [
      { name: "SocialBot", avatar: getAgentImagePath("social") },
      { name: "BrandingAgent", avatar: getAgentImagePath("branding") },
      { name: "ContentAgent", avatar: getAgentImagePath("contentcreation") }
    ]
  },
  {
    id: "content-factory",
    title: "Automated Content Factory",
    description: "Produce, schedule, and publish high-quality content with zero manual effort.",
    agents: [
      { name: "ContentAgent", avatar: getAgentImagePath("contentcreation") },
      { name: "VideoContentAgent", avatar: getAgentImagePath("videocontent") },
      { name: "SocialBot", avatar: getAgentImagePath("social") }
    ]
  },
  {
    id: "brand-launch",
    title: "AI Brand Launch Strategy",
    description: "Launch your brand with a unified AI-powered strategy across all platforms.",
    agents: [
      { name: "BrandingAgent", avatar: getAgentImagePath("branding") },
      { name: "AnalyticsAgent", avatar: getAgentImagePath("analytics") },
      { name: "SitegenAgent", avatar: getAgentImagePath("sitegen") }
    ]
  }
];

const WorkflowLaunchpadModal: React.FC<WorkflowLaunchpadModalProps> = ({ isOpen, onClose }) => {
  const handleLaunch = (workflowId: string) => {
    window.location.href = `/PercyChat?workflow=${workflowId}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative"
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white text-2xl hover:text-electric-blue focus:outline-none"
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
              Launch Smart Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WORKFLOWS.map((wf, idx) => (
                <motion.div
                  key={wf.id}
                  className="glass-card p-6 rounded-xl border border-electric-blue/20 shadow-lg flex flex-col items-center hover:shadow-electric-blue/30 hover:border-electric-blue/40 transition-all cursor-pointer"
                  whileHover={{ scale: 1.04, boxShadow: "0 0 24px #00fff7" }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  onClick={() => handleLaunch(wf.id)}
                >
                  <h3 className="text-xl font-semibold mb-2 text-electric-blue text-center">{wf.title}</h3>
                  <p className="text-gray-200 text-sm mb-4 text-center">{wf.description}</p>
                  <div className="flex gap-2 mb-2 justify-center">
                    {wf.agents.map(agent => (
                      <div key={agent.name} className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue to-teal-400 flex items-center justify-center overflow-hidden border-2 border-electric-blue/40">
                          <Image 
                            src={agent.avatar} 
                            alt={agent.name} 
                            width={40} 
                            height={40} 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '';
                              target.alt = '🤖';
                              target.style.background = '#222';
                              target.style.display = 'flex';
                              target.style.alignItems = 'center';
                              target.style.justifyContent = 'center';
                              target.style.fontSize = '1.5rem';
                            }}
                          />
                        </div>
                        <span className="text-xs text-white mt-1">{agent.name}</span>
                      </div>
                    ))}
                  </div>
                  <span className="mt-2 inline-block text-teal-300 text-xs font-semibold">Start Workflow →</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkflowLaunchpadModal;
