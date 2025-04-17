'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * SessionAlert component - Displays an alert when the session has expired
 * This is separated to ensure useSearchParams() is properly wrapped in a Suspense boundary
 */
export default function SessionAlert() {
  const searchParams = useSearchParams();
  const isExpired = searchParams?.get('reason') === 'session-expired';
  const [showAlert, setShowAlert] = useState(isExpired);

  if (!showAlert) {
    return null;
  }

  return (
    <div className="mb-4 p-3 rounded-lg bg-red-500/90 text-white flex items-center justify-between">
      <span>Your session expired. Please log in again to continue.</span>
      <button 
        onClick={() => setShowAlert(false)} 
        className="ml-4 text-white hover:text-red-200 font-bold"
        aria-label="Close alert"
      >
        &times;
      </button>
    </div>
  );
}
