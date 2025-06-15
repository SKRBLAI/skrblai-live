'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SessionAlert component - Displays auth-related alerts
 * This is separated to ensure useSearchParams() is properly wrapped in a Suspense boundary
 */
export default function SessionAlert() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get('reason');
  const from = searchParams?.get('from');
  
  const [showAlert, setShowAlert] = useState(!!reason);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('info');

  useEffect(() => {
    if (reason === 'session-expired') {
      setAlertMessage('Your session has expired. Please sign in again to continue.');
      setAlertType('error');
    } else if (reason === 'auth-error') {
      setAlertMessage('There was a problem with authentication. Please try again.');
      setAlertType('error');
    } else if (reason === 'access-denied') {
      setAlertMessage('You don\'t have permission to access that page.');
      setAlertType('warning');
    } else if (reason === 'signed-out') {
      setAlertMessage('You have been successfully signed out.');
      setAlertType('info');
    }
  }, [reason]);

  if (!showAlert || !alertMessage) {
    return null;
  }

  const bgColor = 
    alertType === 'error' ? 'bg-red-500/90' : 
    alertType === 'warning' ? 'bg-amber-500/90' : 
    'bg-blue-500/90';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-4 p-3 rounded-lg ${bgColor} text-white flex items-center justify-between shadow-lg`}
      >
        <span>
          {alertMessage}
          {from && <span className="text-sm opacity-80"> (Attempted to access: {from})</span>}
        </span>
        <button 
          onClick={() => setShowAlert(false)} 
          className="ml-4 text-white hover:text-gray-200 font-bold"
          aria-label="Close alert"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
