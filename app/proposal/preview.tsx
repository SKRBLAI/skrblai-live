"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import FloatingParticles from "../../components/ui/FloatingParticles";
import { checkUserRole } from "../../lib/auth/checkUserRole";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ProposalData {
  projectName: string;
  targetAudience: string;
  budget: string;
  notes: string;
}

export default function ProposalPreviewPage() {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [userRole, setUserRole] = useState<'free' | 'premium'>('free');
  const [showUpsell, setShowUpsell] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const proposalRef = useRef<HTMLDivElement>(null);

  // PDF export logic
  const handleDownloadPDF = async () => {
    if (!proposalRef.current) return;
    const element = proposalRef.current;
    const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    pdf.save(`${proposal?.projectName || "proposal"}.pdf`);
  };

  // Share link logic (MVP: use localStorage, production: Supabase)
  const handleShareLink = () => {
    if (!proposal) return;
    // Generate a simple unique id (timestamp-based)
    let id = localStorage.getItem("publicProposalId");
    if (!id) {
      id = `${Date.now()}_${Math.floor(Math.random()*10000)}`;
      localStorage.setItem("publicProposalId", id);
    }
    localStorage.setItem(`publicProposal_${id}`, JSON.stringify(proposal));
    const link = `${window.location.origin}/proposal/public/${id}`;
    setShareLink(link);
    // Copy to clipboard if already generated
    if (shareLink) {
      navigator.clipboard.writeText(link);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('smartProposalData');
      if (data) setProposal(JSON.parse(data));
    }
    checkUserRole().then(setUserRole);
  }, []);

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card p-10 rounded-2xl text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4 text-electric-blue">No Proposal Found</h1>
          <p className="text-gray-300 mb-6">Please start a new proposal from the dashboard or Percy.</p>
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
          ref={proposalRef}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="glass-card p-8 rounded-2xl shadow-xl border border-white/20 mt-8"
        >
          <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
            Proposal Preview
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
          <div className="mt-10 flex flex-col items-center gap-4">
            {userRole === 'premium' ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: "0 0 16px #ffd700" }}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold text-lg shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all mb-2"
                  onClick={handleDownloadPDF}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Download PDF
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: "0 0 16px #ffd700" }}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-electric-blue text-white font-bold text-lg shadow-glow border-2 border-electric-blue/60 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 transition-all"
                  onClick={handleShareLink}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {shareLink ? 'Copy Share Link' : 'Generate Share Link'}
                </motion.button>
                {shareLink && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-2 px-4 py-2 bg-deep-navy/60 rounded-lg border border-electric-blue/30 text-white text-sm text-center select-all"
                  >
                    {shareLink}
                  </motion.div>
                )}
              </>
            ) : (
              <div className="w-full text-center">
                <div className="mb-3 text-yellow-300 font-semibold">Preview Only</div>
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: "0 0 16px #ffd700" }}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold text-lg shadow-glow border-2 border-yellow-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all"
                  onClick={() => setShowUpsell(true)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Upgrade to Download/Share
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Upsell Modal for Free Users */}
      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white/10 backdrop-blur p-8 rounded-2xl max-w-md w-full border border-white/20 shadow-xl text-center"
          >
            <h2 className="text-2xl font-bold mb-4 text-electric-blue">Unlock Proposal Export</h2>
            <p className="text-gray-200 mb-6">Upgrade to SKRBL Premium to export and share proposals as beautiful PDFs and public links.</p>
            <button
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold text-lg shadow-glow border-2 border-yellow-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all mb-2"
              onClick={() => window.location.href = '/pricing'}
            >
              See Plans
            </button>
            <button
              className="mt-2 px-6 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10"
              onClick={() => setShowUpsell(false)}
            >
              Not Now
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}