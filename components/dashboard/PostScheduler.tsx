'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function PostScheduler() {
  const [formData, setFormData] = useState({
    platform: '',
    postDate: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/schedule-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Post scheduled successfully!');
        setFormData({
          platform: '',
          postDate: '',
          description: ''
        });
      } else {
        throw new Error(result.error || 'Failed to schedule post');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-6">Schedule a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Platform</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({...formData, platform: e.target.value})}
            className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30"
            required
          >
            <option value="">Select platform</option>
            <option value="Instagram">Instagram</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Twitter">Twitter</option>
            <option value="Facebook">Facebook</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Post Date</label>
          <input
            type="date"
            value={formData.postDate}
            onChange={(e) => setFormData({...formData, postDate: e.target.value})}
            className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Post Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 rounded bg-deep-navy/80 border border-electric-blue/30"
            rows={4}
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
              Scheduling...
            </div>
          ) : (
            'Schedule Post'
          )}
        </button>
      </form>
    </motion.div>
  );
} 