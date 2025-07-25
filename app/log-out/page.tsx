'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/context/AuthContext';
import toast from 'react-hot-toast';

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('[LOGOUT] Initiating sign-out process');
        await signOut();
        toast.success('You have been signed out successfully');
        router.push('/sign-in');
      } catch (error) {
        console.error('[LOGOUT] Error during sign-out:', error);
        toast.error('There was a problem signing out. Please try again.');
        router.push('/sign-in');
      }
    };
    
    performLogout();
  }, [router, signOut]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900" aria-busy="true">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Signing Out</h1>
        <p className="text-gray-400">Please wait while we log you out...</p>
      </div>
    </div>
  );
}
