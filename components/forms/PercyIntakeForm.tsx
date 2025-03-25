'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { submitIntakeForm } from '@/ai-agents/percyAgent';
import { saveLeadToFirebase } from '@/utils/firebase';
import { sendWelcomeEmail } from '@/utils/email';
import { toast } from 'react-hot-toast';

type FormData = {
  businessName: string;
  industry: string;
  goals: string[];
  budget: string;
  timeline: string;
  userId: string;
  name: string;
  email: string;
  company: string;
  serviceInterest: string;
  message: string;
};

const industries = [
  'E-commerce',
  'SaaS',
  'Healthcare',
  'Education',
  'Finance',
  'Real Estate',
  'Hospitality',
  'Travel',
  'Food & Beverage',
  'Professional Services',
  'Entertainment',
  'Manufacturing',
  'Retail',
  'Other'
];

const goalOptions = [
  'Increase website traffic',
  'Generate more leads',
  'Improve brand awareness',
  'Boost sales',
  'Launch a new product/service',
  'Redesign website',
  'Develop content strategy',
  'Optimize conversion rate',
  'Expand to new markets',
  'Social media growth',
  'Other'
];

const budgetOptions = [
  'Under $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000+'
];

const timelineOptions = [
  'ASAP (1-2 weeks)',
  'Short term (1-2 months)',
  'Medium term (3-6 months)',
  'Long term (6+ months)',
  'Ongoing'
];

export default function PercyIntakeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    industry: '',
    goals: [],
    budget: '',
    timeline: '',
    userId: 'temp-user-id', // This would normally come from authentication
    name: '',
    email: '',
    company: '',
    serviceInterest: '',
    message: ''
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (goal: string) => {
    setFormData(prev => {
      const updatedGoals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save lead to Firebase
      const saveResult = await saveLeadToFirebase(formData);
      
      if (saveResult.success) {
        // Send welcome email
        const emailResult = await sendWelcomeEmail(formData.email, formData.name);
        
        if (emailResult.success) {
          toast.success('Thank you! We\'ll be in touch soon.');
          setFormData({
            businessName: '',
            industry: '',
            goals: [],
            budget: '',
            timeline: '',
            userId: 'temp-user-id',
            name: '',
            email: '',
            company: '',
            serviceInterest: '',
            message: ''
          });
        } else {
          throw new Error('Failed to send welcome email');
        }
      } else {
        throw new Error('Failed to save lead');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <svg 
          className="w-20 h-20 text-teal mx-auto mb-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h3 className="text-2xl font-bold mb-4">Thank You!</h3>
        <p className="mb-8 max-w-lg mx-auto">
          Your information has been submitted successfully. Our AI is analyzing your needs and a team member will be in touch shortly.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`relative flex flex-col items-center ${step < currentStep ? 'text-teal' : step === currentStep ? 'text-electric-blue' : 'text-gray-400'}`}
            >
              <div 
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${
                  step < currentStep 
                    ? 'border-teal bg-teal/20 text-teal' 
                    : step === currentStep 
                      ? 'border-electric-blue bg-electric-blue/20 text-electric-blue' 
                      : 'border-gray-400 bg-deep-navy text-gray-400'
                }`}
              >
                {step < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <div className="text-sm mt-2">{
                step === 1 ? 'Business Info' :
                step === 2 ? 'Goals' :
                step === 3 ? 'Budget & Timeline' :
                'Confirm'
              }</div>
              {step < 4 && (
                <div 
                  className={`absolute top-5 left-full w-full h-0.5 ${
                    step < currentStep ? 'bg-teal' : 'bg-gray-400'
                  }`} 
                  style={{ width: "calc(100% - 2.5rem)", left: "2.5rem" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-deep-navy/50 backdrop-blur-sm border border-electric-blue/30 rounded-xl p-6">
        {currentStep === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-xl font-bold mb-6 text-electric-blue">Tell us about your business</h3>
            
            <div className="mb-6">
              <label htmlFor="businessName" className="block text-soft-gray mb-2">Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleTextChange}
                className="w-full bg-deep-navy/80 border border-electric-blue/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="industry" className="block text-soft-gray mb-2">Industry</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleTextChange}
                className="w-full bg-deep-navy/80 border border-electric-blue/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                required
              >
                <option value="">Select an industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!formData.businessName || !formData.industry}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
        
        {currentStep === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-xl font-bold mb-6 text-electric-blue">What are your goals?</h3>
            
            <div className="mb-6">
              <label className="block text-soft-gray mb-2">Select all that apply</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <div key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`goal-${goal}`}
                      checked={formData.goals.includes(goal)}
                      onChange={() => handleGoalChange(goal)}
                      className="w-4 h-4 text-electric-blue border-electric-blue/30 rounded focus:ring-electric-blue/50"
                    />
                    <label htmlFor={`goal-${goal}`} className="ml-2 text-soft-gray">{goal}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={formData.goals.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
        
        {currentStep === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-xl font-bold mb-6 text-electric-blue">Budget & Timeline</h3>
            
            <div className="mb-6">
              <label htmlFor="budget" className="block text-soft-gray mb-2">Approximate Budget</label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleTextChange}
                className="w-full bg-deep-navy/80 border border-electric-blue/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                required
              >
                <option value="">Select a budget range</option>
                {budgetOptions.map((budget) => (
                  <option key={budget} value={budget}>{budget}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="timeline" className="block text-soft-gray mb-2">Desired Timeline</label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleTextChange}
                className="w-full bg-deep-navy/80 border border-electric-blue/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                required
              >
                <option value="">Select a timeline</option>
                {timelineOptions.map((timeline) => (
                  <option key={timeline} value={timeline}>{timeline}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!formData.budget || !formData.timeline}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
        
        {currentStep === 4 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-xl font-bold mb-6 text-electric-blue">Confirm Your Information</h3>
            
            <div className="bg-deep-navy/80 border border-electric-blue/30 rounded-lg p-4 mb-6">
              <div className="mb-4">
                <h4 className="text-electric-blue font-semibold">Business Information</h4>
                <p><span className="text-gray-400">Business Name:</span> {formData.businessName}</p>
                <p><span className="text-gray-400">Industry:</span> {formData.industry}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-electric-blue font-semibold">Goals</h4>
                <ul className="list-disc list-inside">
                  {formData.goals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-electric-blue font-semibold">Budget & Timeline</h4>
                <p><span className="text-gray-400">Budget:</span> {formData.budget}</p>
                <p><span className="text-gray-400">Timeline:</span> {formData.timeline}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
} 