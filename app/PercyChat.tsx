'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import PercyButton from './PercyButton';

interface PercyChatProps {
  onComplete: (data: { name: string; email: string; plan: string; intent: string }) => void;
}

interface Step {
  message: string;
  input?: boolean;
  field?: 'name' | 'email';
  options?: string[];
  action: (inputValue: string) => void;
}

import { usePercyContext } from '../contexts/PercyContext';

export default function PercyChat({ onComplete }: PercyChatProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { routeToAgent } = usePercyContext();

  const steps: Step[] = [
    {
      message: "What's your name?",
      input: true,
      field: 'name',
      action: (value: string) => {
        setName(value);
        setStep(1);
      }
    },
    {
      message: `Nice to meet you, ${name}! What's your email address?`,
      input: true,
      field: 'email',
      action: (value: string) => {
        setEmail(value);
        setStep(2);
      }
    },
    {
      message: "How can I help you today?",
      options: [
        "I have a book idea I need help with.",
        "I need business branding and marketing support.",
        "I'd like to automate my content.",
        "I need help creating my website."
      ],
      action: (value: string) => {
        let intent = '';
        switch (value) {
          case "I have a book idea I need help with.":
            intent = 'book-publishing';
            break;
          case "I need business branding and marketing support.":
            intent = 'branding';
            break;
          case "I'd like to automate my content.":
            intent = 'content-automation';
            break;
          case "I need help creating my website.":
            intent = 'web-creation';
            break;
        }
        onComplete({ name, email, plan: 'Initial Inquiry', intent });
        routeToAgent(intent);
      }
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 rounded-2xl max-w-xl w-full"
    >
      <div className="space-y-4">
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 p-4 rounded-lg"
            >
              <p className="text-white">{s.message}</p>
            </motion.div>
            
            {i === step && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col space-y-2"
              >
                {s.input ? (
                  <input
                    type={s.field === 'email' ? 'email' : 'text'}
                    value={s.field === 'name' ? name : email}
                    onChange={(e) => s.field === 'name' ? setName(e.target.value) : setEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder={s.field === 'name' ? 'Your name' : 'your@email.com'}
                  />
                ) : (
                  <div className="flex flex-col space-y-2">
                    {s.options?.map((option, idx) => (
                      <PercyButton 
                        key={idx}
                        onClick={() => s.action(option)}
                        label={option}
                        secondary={idx > 0}
                      />
                    ))}
                  </div>
                )}
                
                {s.input && (
                  <PercyButton 
                    onClick={() => s.action(s.field === 'name' ? name : email)}
                    label="Continue"
                    disabled={!name && s.field === 'name' || !email && s.field === 'email'}
                  />
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
