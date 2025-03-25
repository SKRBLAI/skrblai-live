'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Proposal {
  id: string;
  projectName: string;
  notes: string;
  budget: string;
  createdAt: string;
  pdfUrl: string;
}

export default function ProposalGenerator() {
  const [formData, setFormData] = useState({
    projectName: '',
    notes: '',
    budget: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/get-proposals');
      const data = await response.json();
      setProposals(data.proposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Proposal generated successfully!');
        setFormData({
          projectName: '',
          notes: '',
          budget: ''
        });
        fetchProposals();
      } else {
        throw new Error(result.error || 'Failed to generate proposal');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Proposal Generator</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">Project Name</label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Estimated Budget</label>
          <input
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex justify-center items-center"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate Proposal'
          )}
        </button>
      </form>

      <h3 className="text-xl font-bold mb-4">Past Proposals</h3>
      <div className="space-y-2">
        {proposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-deep-navy/80 p-4 rounded-xl border border-electric-blue/20 flex justify-between items-center"
          >
            <div>
              <h4 className="font-semibold">{proposal.projectName}</h4>
              <p className="text-sm text-soft-gray/80">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={proposal.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Download
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
