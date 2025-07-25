"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import FloatingParticles from "../../../components/ui/FloatingParticles";

interface ProposalData {
  projectName: string;
  targetAudience: string;
  budget: string;
  notes: string;
}

export default function PublicProposalPage() {
  const router = useRouter();
  const { id } = router.query;
  const [proposal, setProposal] = useState<ProposalData | null>(null);

  useEffect(() => {
    if (!id) return;
    // For MVP: fetch public proposal data from localStorage (production: Supabase)
    const data = localStorage.getItem(`publicProposal_${id}`);
    if (data) setProposal(JSON.parse(data));
  }, [id]);

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card p-10 rounded-2xl text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4 text-electric-blue">Proposal Not Found</h1>
          <p className="text-gray-300 mb-6">This proposal link is invalid or has expired.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] py-16 px-2 sm:px-4 relative">
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-60">
        <FloatingParticles />
      </div>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass-card p-8 rounded-2xl shadow-xl border border-white/20 mt-8"
        >
          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
            Public Proposal
          </h1>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Project Name</h2>
              <p className="text-teal-200 text-xl font-bold mb-2">{proposal.projectName}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Target Audience</h2>
              <p className="text-gray-200 mb-2">{proposal.targetAudience}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Budget</h2>
              <p className="text-gray-200 mb-2">{proposal.budget}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Key Notes</h2>
              <p className="text-gray-300 whitespace-pre-line">{proposal.notes}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
